import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { safeNewsletterSubscribe } from "../src/newsletter.js";
import { verifyUnsubscribe } from "../src/unsubscribe.js";

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
        async all() {
          return { results: statement.all(...values) };
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

const TOPIC = "11111111-2222-4333-8444-555555555555";

function setup({ conflict = false, env: extraEnv = {}, emailStatus = 200 } = {}) {
  const { db, sqlite } = createDatabase();
  const requests = [];
  const env = {
    ENV_NAME: "production",
    INTAKE: db,
    RESEND_API_KEY: "re_test",
    RESEND_SEGMENT_ID: "segment-test",
    ...extraEnv,
  };
  const fetch = async (url, init = {}) => {
    requests.push({ url: String(url), init });
    if (String(url) === "https://api.resend.com/contacts") {
      return conflict
        ? new Response("", { status: 409 })
        : Response.json({ object: "contact", id: "contact-test" });
    }
    if (String(url) === "https://api.resend.com/emails")
      return emailStatus === 200
        ? Response.json({ id: `email-${requests.length}` })
        : Response.json({ name: "refused" }, { status: emailStatus });
    return Response.json({ id: "segment-test" });
  };
  return { db, sqlite, env, requests, fetch };
}

// The Resend transport, the ASNM Topic and the link secret, as production runs.
const RESEND_MAIL = {
  MAIL_TRANSPORT: "resend",
  MAIL_FROM_DOMAINS: "mail.adaptivesportsnearme.com",
  RESEND_TOPIC_ID: TOPIC,
  NEWSLETTER_LINK_SECRET: "link-secret-for-tests",
};

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

test("a repeat signup is reported as existing, makes no new contact, and re-opens ASNM mail", async () =>
  run({ env: RESEND_MAIL }, async (context) => {
    const first = await safeNewsletterSubscribe(context.env, "person@example.test", "footer");
    await first.welcomeJob;
    const before = context.requests.length;
    const repeat = await safeNewsletterSubscribe(context.env, "person@example.test", "footer");
    assert.equal(repeat.ok, true);
    assert.equal(repeat.existing, true);
    const after = context.requests.slice(before);
    assert.deepEqual(
      after.map((r) => [r.init.method, r.url]),
      [
        ["PATCH", "https://api.resend.com/contacts/person%40example.test"],
        ["PATCH", "https://api.resend.com/contacts/person%40example.test/topics"],
      ],
    );
    assert.equal(repeat.welcomeJob, undefined, "one welcome per signup");
  }));

test("requires the Resend credentials and segment", async () => {
  const result = await safeNewsletterSubscribe(
    { INTAKE: {} },
    "person@example.test",
    "footer",
  );
  assert.equal(result.status, 503);
});

test("a new signup joins the ASNM Topic and is actually sent the welcome", async () =>
  run({ env: RESEND_MAIL }, async (context) => {
    const result = await safeNewsletterSubscribe(
      context.env,
      "person@example.test",
      "footer",
      { name: "Taylor", origin: "https://adaptivesportsnearme.com" },
    );
    assert.equal(result.ok, true);
    assert.deepEqual(JSON.parse(context.requests[0].init.body).topics, [
      { id: TOPIC, subscription: "opt_in" },
    ]);
    await result.welcomeJob;
    const sends = context.requests.filter(
      (r) => r.url === "https://api.resend.com/emails",
    );
    const welcome = sends
      .map((r) => ({ ...r, body: JSON.parse(r.init.body) }))
      .find((r) => r.body.to[0] === "person@example.test");
    assert.ok(welcome, "the welcome goes to the subscriber");
    assert.equal(welcome.body.subject, "You're on the list");
    assert.equal(
      welcome.body.from,
      "Adaptive Sports Near Me <hello@mail.adaptivesportsnearme.com>",
    );
    assert.deepEqual(welcome.body.reply_to, ["hello@adaptivesportsnearme.com"]);
    assert.match(welcome.init.headers["Idempotency-Key"], /^welcome:[0-9a-f]{64}$/);
    assert.deepEqual(welcome.body.tags, [
      { name: "brand", value: "asnm" },
      { name: "kind", value: "welcome" },
      { name: "env", value: "production" },
    ]);
    // One click headers, and a signed link that names this subscriber.
    const header = welcome.body.headers["List-Unsubscribe"];
    assert.equal(welcome.body.headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
    const link = new URL(header.slice(1, -1));
    assert.equal(link.origin + link.pathname, "https://adaptivesportsnearme.com/unsubscribe");
    assert.equal(
      await verifyUnsubscribe(context.env, link.searchParams.get("e"), link.searchParams.get("t")),
      "person@example.test",
    );
    // The unsubscribe link sits near the top, and the footer says why and who.
    const text = welcome.body.text;
    assert.ok(text.indexOf(link.toString()) < text.indexOf("Adaptive Sports Near Me helps"));
    assert.match(text, /because you signed up for news at adaptivesportsnearme\.com/);
    assert.match(text, /Adapt To Life NFP, 1509 N Milwaukee Ave, Libertyville, IL 60048/);
    assert.match(welcome.body.html, /Unsubscribe in one click/);
    // The house notice still goes to hello@ under its own key.
    assert.ok(
      sends.some((r) => /^intake:newsletter:/.test(r.init.headers["Idempotency-Key"])),
    );
  }));

test("a welcome Resend refuses is written to send_failures, and the signup still stands", async () =>
  run({ env: RESEND_MAIL, emailStatus: 422 }, async (context) => {
    const result = await safeNewsletterSubscribe(context.env, "person@example.test", "footer");
    assert.equal(result.ok, true);
    await result.welcomeJob;
    const routes = context.sqlite
      .prepare("SELECT route, to_addr FROM send_failures ORDER BY route")
      .all()
      .map((r) => ({ ...r }));
    assert.deepEqual(routes, [
      { route: "asnm-intake-notice", to_addr: "hello@adapttolife.org" },
      { route: "asnm-welcome", to_addr: "person@example.test" },
    ]);
  }));

test("an existing contact who joins ASNM gets the Topic, the welcome, and the team wide flag cleared", async () =>
  run({ conflict: true, env: RESEND_MAIL }, async (context) => {
    const result = await safeNewsletterSubscribe(context.env, "person@example.test", "footer");
    assert.equal(result.ok, true);
    const flag = context.requests.find(
      (r) => r.init.method === "PATCH" && r.url === "https://api.resend.com/contacts/person%40example.test",
    );
    assert.deepEqual(JSON.parse(flag.init.body), { unsubscribed: false });
    const topic = context.requests.find((r) => r.url.endsWith("/topics"));
    assert.equal(topic.init.method, "PATCH");
    assert.deepEqual(JSON.parse(topic.init.body), [{ id: TOPIC, subscription: "opt_in" }]);
    await result.welcomeJob;
    const welcome = context.requests
      .filter((r) => r.url === "https://api.resend.com/emails")
      .map((r) => JSON.parse(r.init.body))
      .find((b) => b.to[0] === "person@example.test");
    assert.equal(welcome?.subject, "You're on the list");
    // Nothing ever sets the flag on.
    assert.ok(!context.requests.some((r) => /"unsubscribed":true/.test(r.init.body || "")));
  }));

test("staging never writes the real list or mails an address outside MAIL_ALLOW", async () =>
  run(
    { env: { ...RESEND_MAIL, ENV_NAME: "staging", MAIL_ALLOW: "@adapttolife.org" } },
    async (context) => {
      const result = await safeNewsletterSubscribe(context.env, "person@example.test", "footer");
      assert.equal(result.ok, true);
      assert.equal(result.dropped, true);
      assert.equal(context.requests.length, 0);
      const team = await safeNewsletterSubscribe(context.env, "tester@adapttolife.org", "footer");
      await team.welcomeJob;
      assert.ok(context.requests.some((r) => r.url === "https://api.resend.com/emails"));
    },
  ));
