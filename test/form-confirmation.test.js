import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import worker from "../src/index.js";

function setup(t, options = {}) {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`CREATE TABLE sports(sport_key TEXT); INSERT INTO sports VALUES ('cycling');
    CREATE TABLE organizations(id TEXT PRIMARY KEY,name TEXT NOT NULL,org_type TEXT,is_public INTEGER,status TEXT,created_at TEXT,updated_at TEXT);
    CREATE TABLE programs(id TEXT PRIMARY KEY,organization_id TEXT NOT NULL,name TEXT NOT NULL,sport TEXT,sport_key TEXT,website_url TEXT,city TEXT,state TEXT,verification_status TEXT,status TEXT,is_public INTEGER,created_at TEXT,updated_at TEXT);
    CREATE TABLE profiles(id TEXT PRIMARY KEY,email TEXT UNIQUE,name TEXT,state TEXT,sports_json TEXT,newsletter INTEGER,created_at TEXT,updated_at TEXT);
    CREATE TABLE submissions(kind TEXT,payload TEXT,contact_email TEXT,status TEXT,created_at TEXT);`);
  sqlite.exec(
    readFileSync(new URL("../db/intake-schema.sql", import.meta.url), "utf8"),
  );
  const DB = {
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
        async all() {
          return { results: statement.all(...values) };
        },
        async run() {
          return statement.run(...values);
        },
      };
    },
    async batch(statements) {
      sqlite.exec("BEGIN");
      try {
        const r = [];
        for (const s of statements) r.push(await s.run());
        sqlite.exec("COMMIT");
        return r;
      } catch (e) {
        sqlite.exec("ROLLBACK");
        throw e;
      }
    },
  };
  const sent = [],
    calls = [],
    jobs = [];
  // The house notice (hello@) and the submitter receipt are separate mail; these
  // tests are about the receipt.
  const receipts = () => sent.filter((m) => m.to !== "hello@adapttolife.org");
  const env = {
    ENV_NAME: "staging",
    DB,
    INTAKE: DB,
    PROFILE_SIGNING_KEY: "test-only-key",
    SEND_EMAIL: {
      async send(message) {
        sent.push(message);
        if (options.mailFailure) throw Error("uncertain send");
        return { id: "accepted" };
      },
    },
  };
  const original = globalThis.fetch;
  globalThis.fetch = async (url) => {
    calls.push(url);
    if (url.startsWith("https://challenges.cloudflare.com/"))
      return Response.json({ success: false });
    throw Error("Unexpected network request");
  };
  t.after(() => {
    globalThis.fetch = original;
    sqlite.close();
  });
  const ctx = { waitUntil: (job) => jobs.push(job) };
  const post = (path, body, cookie) =>
    worker.fetch(
      new Request(
        "https://staging-adaptivesportsnearme.adapt-to-life.workers.dev" + path,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(cookie ? { Cookie: cookie } : {}),
          },
          body: JSON.stringify(body),
        },
      ),
      env,
      ctx,
    );
  return { env, sqlite, sent, receipts, calls, jobs, post };
}
test("new program saves and queues one escaped confirmation with the submitted name", async (t) => {
  const x = setup(t);
  const response = await x.post("/api/submit-program", {
    pn: "Youth <basketball>",
    em: "person@example.test",
  });
  assert.equal(response.status, 200);
  assert.equal(x.jobs.length, 2);
  await Promise.all(x.jobs);
  assert.equal(
    x.sqlite.prepare("SELECT count(*) AS n FROM submissions").get().n,
    1,
  );
  const [receipt] = x.receipts();
  assert.equal(x.receipts().length, 1);
  assert.equal(receipt.to, "person@example.test");
  assert.equal(receipt.replyTo, "hello@adaptivesportsnearme.com");
  assert.match(receipt.html, /Youth &lt;basketball&gt;/);
  assert.doesNotMatch(receipt.html, /<basketball>/);
  assert.match(receipt.text, /does not mean the program has been approved/);
});
for (const [label, body, status] of [
  ["missing email", { pn: "Program" }, 422],
  ["invalid email", { pn: "Program", em: "invalid" }, 422],
  ["missing program", { em: "person@example.test" }, 422],
  [
    "honeypot",
    { pn: "Program", em: "person@example.test", company: "bot" },
    200,
  ],
])
  test(`program ${label} sends no confirmation`, async (t) => {
    const x = setup(t);
    const response = await x.post("/api/submit-program", body);
    assert.equal(response.status, status);
    assert.equal(x.calls.length, 0);
    assert.equal(x.sent.length, 0);
    assert.equal(x.jobs.length, 0);
  });
test("failed capture does not send confirmation", async (t) => {
  const x = setup(t);
  x.sqlite.exec("DROP TABLE submissions");
  const original = console.error;
  console.error = () => {};
  t.after(() => {
    console.error = original;
  });
  assert.equal(
    (
      await x.post("/api/submit-program", {
        pn: "Program",
        em: "person@example.test",
      })
    ).status,
    502,
  );
  assert.equal(x.sent.length, 0);
  assert.equal(x.jobs.length, 0);
});
test("failed verification does not save or send", async (t) => {
  const x = setup(t);
  x.env.TURNSTILE_SECRET_KEY = "fixture";
  assert.equal(
    (
      await x.post("/api/submit-program", {
        pn: "Program",
        em: "person@example.test",
        cf_token: "bad",
      })
    ).status,
    403,
  );
  assert.equal(x.sent.length, 0);
  assert.equal(x.jobs.length, 0);
});
test("email failure preserves the saved submission and never retries the send", async (t) => {
  const x = setup(t, { mailFailure: true });
  assert.equal(
    (
      await x.post("/api/submit-program", {
        pn: "Program",
        em: "person@example.test",
      })
    ).status,
    200,
  );
  await Promise.all(x.jobs);
  assert.equal(x.receipts().length, 1);
  assert.equal(
    x.sqlite.prepare("SELECT count(*) AS n FROM submissions").get().n,
    1,
  );
});
test("slow confirmation does not block a saved program response", async (t) => {
  const x = setup(t);
  let finish;
  const pending = [];
  x.env.SEND_EMAIL.send = () =>
    new Promise((resolve) => {
      pending.push(resolve);
    });
  const response = await x.post("/api/submit-program", {
    pn: "Program",
    em: "person@example.test",
  });
  assert.equal(response.status, 200);
  assert.equal(x.jobs.length, 2);
  // Both sends were still pending when the response returned; release them.
  let settled = false;
  Promise.all(x.jobs).then(() => {
    settled = true;
  });
  while (!settled) {
    pending.splice(0).forEach((finish) => finish({ id: "accepted" }));
    await new Promise((r) => setImmediate(r));
  }
});
test("missing Gmail credentials log the delivery gap without falling back or losing the submission", async (t) => {
  const x = setup(t);
  x.env.MAIL_TRANSPORT = "gmail";
  const logs = [];
  const original = console.error;
  console.error = (...args) => logs.push(args);
  t.after(() => {
    console.error = original;
  });
  assert.equal(
    (
      await x.post("/api/submit-program", {
        pn: "Program",
        em: "person@example.test",
      })
    ).status,
    200,
  );
  await Promise.all(x.jobs);
  assert.equal(x.sent.length, 0);
  assert.deepEqual(logs, [
    [
      "Form confirmation unavailable",
      { kind: "program", reason: "mail-not-configured" },
    ],
  ]);
  assert.equal(
    x.sqlite.prepare("SELECT count(*) AS n FROM submissions").get().n,
    1,
  );
});
test("profile changes require a verified profile session", async (t) => {
  const x = setup(t);
  const body = { em: "person@example.test", name: "Person", sports: "cycling" };
  const response = await x.post("/api/profile", body);
  assert.equal(response.status, 401);
  assert.equal(x.sent.length, 0);
  assert.equal(x.calls.length, 0);
});
test("program confirmations use Gmail when selected", async (t) => {
  const x = setup(t);
  Object.assign(x.env, {
    MAIL_TRANSPORT: "gmail",
    // Falling back to Gmail is a config change: the transport and its sender.
    MAIL_FROM: "Adaptive Sports Near Me <hello@adaptivesportsnearme.com>",
    GMAIL_FROM: "hello@adaptivesportsnearme.com",
    GMAIL_CLIENT_ID: "fixture",
    GMAIL_CLIENT_SECRET: "fixture",
    GMAIL_REFRESH_TOKEN: "fixture",
  });
  const network = globalThis.fetch;
  let gmailSends = 0;
  globalThis.fetch = async (url, init) => {
    if (url.includes("oauth2.googleapis.com"))
      return Response.json({ access_token: "fixture", token_type: "Bearer" });
    if (url.includes("gmail.googleapis.com")) {
      gmailSends++;
      return Response.json({ id: "gmail-receipt" });
    }
    return network(url, init);
  };
  assert.equal(
    (
      await x.post("/api/submit-program", {
        pn: "Program",
        em: "person@example.test",
      })
    ).status,
    200,
  );
  // One Gmail send for the submitter receipt, one for the hello@ house notice.
  await Promise.all(x.jobs);
  assert.equal(gmailSends, 2);
  assert.equal(x.sent.length, 0);
});

// ---- Resend (Nov 2026): keys, tags, the staging allow list and the ledger ----
import {
  createProfileSession,
  serializeProfileCookie,
} from "../src/profile.js";

function resendMail(t, x, { allow = "@example.test,hello@adapttolife.org", status = 200 } = {}) {
  Object.assign(x.env, {
    MAIL_TRANSPORT: "resend",
    RESEND_API_KEY: "re_test",
    MAIL_FROM_DOMAINS: "mail.adaptivesportsnearme.com",
    MAIL_ALLOW: allow,
  });
  const emails = [];
  const network = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    if (url === "https://api.resend.com/emails") {
      emails.push({ key: init.headers["Idempotency-Key"], body: JSON.parse(init.body) });
      return status === 200
        ? Response.json({ id: `email-${emails.length}` })
        : Response.json({ name: "refused" }, { status });
    }
    return network(url, init);
  };
  return emails;
}
const tag = (body, name) => body.tags.find((t) => t.name === name)?.value;

test("a program confirmation and the house notice each carry a stable key and tags", async (t) => {
  const x = setup(t);
  const emails = resendMail(t, x);
  const response = await x.post("/api/submit-program", {
    pn: "Program",
    em: "person@example.test",
    sid: "attempt-0001",
  });
  assert.equal(response.status, 200);
  await Promise.all(x.jobs);
  const { id } = x.sqlite.prepare("SELECT id FROM intake").get();
  const receipt = emails.find((e) => e.body.to[0] === "person@example.test");
  const notice = emails.find((e) => e.body.to[0] === "hello@adapttolife.org");
  assert.equal(receipt.key, `confirm-program:${id}`);
  assert.equal(tag(receipt.body, "brand"), "asnm");
  assert.equal(tag(receipt.body, "kind"), "confirm-program");
  assert.equal(tag(receipt.body, "env"), "staging");
  assert.equal(receipt.body.from, "Adaptive Sports Near Me <hello@mail.adaptivesportsnearme.com>");
  assert.equal(notice.key, `intake:${id}`);
  assert.equal(notice.body.from, "Adapt To Life Intake <hello@mail.adaptivesportsnearme.com>");
  assert.deepEqual(notice.body.reply_to, ["person@example.test"]);
});

test("staging drops a confirmation to an address outside MAIL_ALLOW and records no failure", async (t) => {
  const x = setup(t);
  const emails = resendMail(t, x, { allow: "hello@adapttolife.org" });
  const log = console.log;
  console.log = () => {};
  t.after(() => (console.log = log));
  await x.post("/api/submit-program", { pn: "Program", em: "person@example.test" });
  await Promise.all(x.jobs);
  assert.deepEqual(emails.map((e) => e.body.to[0]), ["hello@adapttolife.org"]);
  assert.equal(x.sqlite.prepare("SELECT count(*) AS n FROM send_failures").get().n, 0);
});

test("a confirmation that fails is written to send_failures instead of only the log", async (t) => {
  const x = setup(t, { mailFailure: true });
  const error = console.error;
  console.error = () => {};
  t.after(() => (console.error = error));
  await x.post("/api/submit-program", { pn: "Program", em: "person@example.test" });
  await Promise.all(x.jobs);
  const rows = x.sqlite
    .prepare("SELECT route, to_addr FROM send_failures ORDER BY route")
    .all()
    .map((r) => ({ ...r }));
  assert.deepEqual(rows, [
    { route: "asnm-confirm-program", to_addr: "person@example.test" },
    { route: "asnm-intake-notice", to_addr: "hello@adapttolife.org" },
  ]);
});

test("a retryable Resend refusal puts the house notice back in the queue, not in review", async (t) => {
  const x = setup(t);
  resendMail(t, x, { status: 503 });
  const error = console.error;
  console.error = () => {};
  t.after(() => (console.error = error));
  await x.post("/api/submit-program", { pn: "Program", em: "person@example.test" });
  await Promise.all(x.jobs);
  assert.equal(
    x.sqlite.prepare("SELECT state FROM intake_delivery_claims").get().state,
    "pending",
  );
});

async function signedInProfile(x) {
  x.sqlite.exec(`CREATE TABLE IF NOT EXISTS profile_sessions(id TEXT PRIMARY KEY, profile_id TEXT, expires_at TEXT, revoked_at TEXT, created_at TEXT);
    INSERT INTO profiles VALUES ('p-1','person@example.test','Person','IL','["cycling"]',0,'2026-01-01','2026-01-01');`);
  const session = await createProfileSession(x.env.DB, "p-1", x.env.PROFILE_SIGNING_KEY);
  return serializeProfileCookie(session.id, session.signature).split(";")[0];
}

test("the profile notice goes out only when a save changed something", async (t) => {
  const x = setup(t);
  const emails = resendMail(t, x);
  const cookie = await signedInProfile(x);
  const same = { em: "person@example.test", name: "Person", state: "IL", sports: "cycling" };
  assert.equal((await x.post("/api/profile", same, cookie)).status, 200);
  await Promise.all(x.jobs);
  assert.equal(emails.length, 0, "an unchanged save mails nobody");
  assert.equal((await x.post("/api/profile", { ...same, name: "Pat" }, cookie)).status, 200);
  await Promise.all(x.jobs);
  assert.equal(emails.length, 1);
  assert.match(emails[0].key, /^confirm-profile-updated:p-1:[0-9a-f]{24}$/);
});

test("turning the profile newsletter switch off opts out of the ASNM Topic only", async (t) => {
  const x = setup(t);
  resendMail(t, x);
  x.env.RESEND_TOPIC_ID = "11111111-2222-4333-8444-555555555555";
  const cookie = await signedInProfile(x);
  x.sqlite.exec("UPDATE profiles SET newsletter=1");
  const requests = [];
  const network = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    if (String(url).startsWith("https://api.resend.com/contacts")) {
      requests.push({ url, init });
      return Response.json({ object: "contact_topics" });
    }
    return network(url, init);
  };
  await x.post(
    "/api/profile",
    { em: "person@example.test", name: "Person", state: "IL", sports: "cycling" },
    cookie,
  );
  await Promise.all(x.jobs);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://api.resend.com/contacts/person%40example.test/topics");
  assert.equal(requests[0].init.method, "PATCH");
  assert.deepEqual(JSON.parse(requests[0].init.body), [
    { id: "11111111-2222-4333-8444-555555555555", subscription: "opt_out" },
  ]);
});
