import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

import { featureAvailable } from "../src/feature-access.js";
import worker from "../src/index.js";
import { serializeOrgCookie } from "../src/organization-access.js";
import { signProfileId } from "../src/profile.js";

function database() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
  return {
    sqlite,
    db: {
      prepare(sql) {
        const statement = sqlite.prepare(sql);
        let values = [];
        return {
          bind(...args) {
            values = args;
            return this;
          },
          async first() {
            return statement.get(...values) || null;
          },
        };
      },
    },
  };
}

test("organization dashboard is available to everyone by default", async () => {
  const { sqlite, db } = database();
  try {
    let calls = 0;
    assert.equal(
      await featureAvailable(
        db,
        "organization-dashboard",
        "manager@example.test",
        async () => {
          calls += 1;
          return new Response(null, { status: 500 });
        },
        "resend-key",
      ),
      true,
    );
    assert.equal(calls, 0);
  } finally {
    sqlite.close();
  }
});

test("restricted features require an opted-in beta tester group", async () => {
  const { sqlite, db } = database();
  try {
    sqlite
      .prepare("UPDATE feature_toggles SET audience_json = ? WHERE id = ?")
      .run(JSON.stringify(["coaches"]), "organization-dashboard");

    assert.equal(
      await featureAvailable(
        db,
        "organization-dashboard",
        "manager@example.test",
        async () =>
          new Response(
            JSON.stringify({ data: [{ id: "coaches", subscription: "opt_in" }] }),
            { status: 200 },
          ),
        "resend-key",
      ),
      true,
    );
    assert.equal(
      await featureAvailable(
        db,
        "organization-dashboard",
        "manager@example.test",
        async () =>
          new Response(
            JSON.stringify({ data: [{ id: "coaches", subscription: "opt_out" }] }),
            { status: 200 },
          ),
        "resend-key",
      ),
      false,
    );
  } finally {
    sqlite.close();
  }
});

test("restricted organization dashboard pages show the feature testing notice", async () => {
  const secret = "organization-feature-test-secret";
  const sessionId = "f8af6412-3a6a-4ce8-aa12-194cd15c8e4a";
  const signature = await signProfileId(sessionId, secret);
  const db = {
    prepare(sql) {
      return {
        bind() {
          return {
            async first() {
              if (sql.includes("organization_sessions")) {
                return { email: "manager@example.test" };
              }
              if (sql.includes("feature_toggles")) {
                return { audience_json: JSON.stringify(["coaches"]) };
              }
              return null;
            },
          };
        },
      };
    },
  };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ data: [] }), { status: 200 });

  try {
    const response = await worker.fetch(
      new Request("https://adaptivesportsnearme.com/manage/organizations", {
        headers: { Cookie: serializeOrgCookie(sessionId, signature) },
      }),
      {
        DB: db,
        ENV_NAME: "staging",
        ORG_AUTH_SIGNING_KEY: secret,
        RESEND_API_KEY: "resend-key",
      },
      {},
    );

    assert.equal(response.status, 403);
    const html = await response.text();
    assert.match(html, /This feature is still in testing/);
    assert.match(html, /Switch email/);
    assert.match(html, /\/api\/org-auth\/signout/);
    assert.match(html, /\/api\/beta-auth\/signout/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
