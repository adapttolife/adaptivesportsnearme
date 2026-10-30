import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { safeNewsletterSubscribe } from "../src/newsletter.js";

function createDatabase() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(
    readFileSync(new URL("../db/intake-schema.sql", import.meta.url), "utf8"),
  );
  const db = {
    prepare(sql) {
      const statement = sqlite.prepare(sql);
      let values = [];
      return {
        bind(...next) {
          values = next;
          return this;
        },
        async first() {
          return statement.get(...values) || null;
        },
        async run() {
          return {
            meta: { changes: Number(statement.run(...values).changes) },
          };
        },
      };
    },
    async batch(statements) {
      sqlite.exec("BEGIN");
      try {
        const results = [];
        for (const statement of statements) results.push(await statement.run());
        sqlite.exec("COMMIT");
        return results;
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
  };
  return { db, sqlite };
}

function setup({ conflict = false } = {}) {
  const { db, sqlite } = createDatabase();
  const requests = [];
  const env = {
    INTAKE: db,
    RESEND_API_KEY: "re_test",
    RESEND_SEGMENT_ID: "segment-test",
  };
  const fetch = async (url, init = {}) => {
    requests.push({ url: String(url), init });
    if (String(url) === "https://api.resend.com/contacts") {
      return conflict
        ? new Response("", { status: 409 })
        : Response.json({ object: "contact", id: "contact-test" });
    }
    return Response.json({ id: "segment-test" });
  };
  return { db, sqlite, env, requests, fetch };
}

async function run(options, fn) {
  const context = setup(options);
  const original = globalThis.fetch;
  globalThis.fetch = context.fetch;
  try {
    await fn(context);
  } finally {
    globalThis.fetch = original;
    context.sqlite.close();
  }
}

test("creates a Resend contact in the configured segment and captures the signup", async () =>
  run({}, async (context) => {
    const result = await safeNewsletterSubscribe(
      context.env,
      " Person@Example.test ",
      "footer",
      { name: "Taylor" },
    );
    assert.equal(result.ok, true);
    assert.equal(result.existing, undefined);
    const request = context.requests[0];
    assert.equal(request.url, "https://api.resend.com/contacts");
    assert.equal(request.init.headers.Authorization, "Bearer re_test");
    assert.deepEqual(JSON.parse(request.init.body), {
      email: "person@example.test",
      first_name: "Taylor",
      unsubscribed: false,
      segments: [{ id: "segment-test" }],
    });
    const claim = context.sqlite
      .prepare(
        "SELECT publication_id, subscription_id, state FROM newsletter_delivery_claims",
      )
      .get();
    assert.deepEqual(
      { ...claim },
      {
        publication_id: "segment-test",
        subscription_id: "contact-test",
        state: "resend-subscribed",
      },
    );
    const intake = context.sqlite
      .prepare("SELECT email, source FROM intake")
      .get();
    assert.deepEqual(
      { ...intake },
      { email: "person@example.test", source: "footer" },
    );
  }));

test("adds an existing Resend contact to the configured segment without re-subscribing it", async () =>
  run({ conflict: true }, async (context) => {
    const result = await safeNewsletterSubscribe(
      context.env,
      "person@example.test",
      "footer",
    );
    assert.equal(result.ok, true);
    assert.equal(result.existing, true);
    assert.equal(
      context.requests[1].url,
      "https://api.resend.com/contacts/person%40example.test/segments/segment-test",
    );
    assert.equal(context.requests[1].init.method, "POST");
  }));

test("a repeat successful signup is reported as existing without another provider request", async () =>
  run({}, async (context) => {
    await safeNewsletterSubscribe(context.env, "person@example.test", "footer");
    const repeat = await safeNewsletterSubscribe(
      context.env,
      "person@example.test",
      "footer",
    );
    assert.equal(repeat.ok, true);
    assert.equal(repeat.existing, true);
    assert.equal(context.requests.length, 1);
  }));

test("requires the Resend credentials and segment", async () => {
  const result = await safeNewsletterSubscribe(
    { INTAKE: {} },
    "person@example.test",
    "footer",
  );
  assert.equal(result.status, 503);
});
