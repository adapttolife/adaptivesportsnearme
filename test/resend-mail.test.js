// The Resend move (Nov 2026): the send contract in src/mail-transport.js, the
// per-address sign-in limit, the beta invitation, /unsubscribe and
// /api/resend-events. docs/EMAIL.md in adapt-to-life is the spec.
import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { createHmac } from "node:crypto";
import worker from "../src/index.js";
import { sendMail, mailAllowed, buildMime, MailError, keyHash } from "../src/mail-transport.js";
import { unsubscribeUrl, verifyUnsubscribe } from "../src/unsubscribe.js";
import { verifySvix } from "../src/resend-events.js";
import { createAdminSession, serializeAdminCookie } from "../src/admin-access.js";
import { LINKS_PER_WINDOW } from "../src/signin-limit.js";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const TOPIC = "11111111-2222-4333-8444-555555555555";
const SEGMENT = "abae0ac1-1ed2-4d3b-9fb7-41f272a92f4a";
const WEBHOOK_SECRET = "whsec_" + Buffer.from("webhook-secret-bytes-for-tests").toString("base64");

const BASE = {
  ENV_NAME: "production",
  MAIL_TRANSPORT: "resend",
  RESEND_API_KEY: "re_test",
  MAIL_FROM_DOMAINS: "mail.adaptivesportsnearme.com",
};
const MESSAGE = {
  from: "Adaptive Sports Near Me <hello@mail.adaptivesportsnearme.com>",
  to: "person@example.test",
  replyTo: "hello@adaptivesportsnearme.com",
  subject: "Hello",
  text: "Hello",
  idempotencyKey: "test:1",
  tags: { brand: "asnm", kind: "test" },
};

async function withFetch(t, handler) {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    return handler(String(url), init, calls);
  };
  t.after(() => (globalThis.fetch = original));
  return calls;
}
const quiet = (t, ...names) => {
  for (const name of names) {
    const original = console[name];
    console[name] = () => {};
    t.after(() => (console[name] = original));
  }
};

// ---- the transport ---------------------------------------------------------

test("resend: posts to /emails with the key, the env tag and bytes as base64", async (t) => {
  const calls = await withFetch(t, () => Response.json({ id: "re-1" }));
  const result = await sendMail(BASE, {
    ...MESSAGE,
    headers: { "List-Unsubscribe": "<https://example.test/u>", "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    attachments: [{ filename: "a.pdf", type: "application/pdf", content: new TextEncoder().encode("%PDF") }],
  });
  assert.deepEqual(result, { id: "re-1", messageId: "re-1", provider: "resend", accepted: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.resend.com/emails");
  assert.equal(calls[0].init.headers["Idempotency-Key"], "test:1");
  assert.equal(calls[0].init.headers.Authorization, "Bearer re_test");
  const body = JSON.parse(calls[0].init.body);
  assert.deepEqual(body.tags, [
    { name: "brand", value: "asnm" },
    { name: "kind", value: "test" },
    { name: "env", value: "production" },
  ]);
  assert.deepEqual(body.reply_to, ["hello@adaptivesportsnearme.com"]);
  assert.deepEqual(body.attachments, [
    { filename: "a.pdf", content: Buffer.from("%PDF").toString("base64"), content_type: "application/pdf" },
  ]);
  assert.equal(body.headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
});

for (const [label, change, pattern] of [
  ["no idempotency key", { idempotencyKey: undefined }, /idempotencyKey/],
  ["an empty idempotency key", { idempotencyKey: "" }, /idempotencyKey/],
  ["a 257 character idempotency key", { idempotencyKey: "k".repeat(257) }, /idempotencyKey/],
  ["no kind tag", { tags: { brand: "asnm" } }, /brand and kind/],
  ["no brand tag", { tags: { kind: "x" } }, /brand and kind/],
  ["a tag with a space", { tags: { brand: "asnm", kind: "two words" } }, /Invalid mail tag/],
  ["a From off the mail domain", { from: "hello@adaptivesportsnearme.com" }, /mail domain/],
  ["a header with a line break", { subject: "Hi\r\nBcc: x@example.test" }, /Unsafe mail header/],
  ["an unsupported header", { headers: { "Content-Type": "text/html" } }, /Unsupported custom mail header/],
  ["a header value with a line break", { headers: { "X-Ref": "a\nb" } }, /Unsafe mail header/],
  ["a string attachment", { attachments: [{ filename: "a.pdf", content: "JVBERg==" }] }, /must contain bytes/],
])
  test(`resend: refuses ${label} before the network`, async (t) => {
    const calls = await withFetch(t, () => Response.json({ id: "never" }));
    await assert.rejects(sendMail(BASE, { ...MESSAGE, ...change }), pattern);
    assert.equal(calls.length, 0);
  });

test("resend: outside production, an address off MAIL_ALLOW drops the whole send", async (t) => {
  const calls = await withFetch(t, () => Response.json({ id: "re-1" }));
  quiet(t, "log");
  const env = { ...BASE, ENV_NAME: "staging", MAIL_ALLOW: "@adapttolife.org, team@example.test" };
  assert.deepEqual(await sendMail(env, { ...MESSAGE, to: "stranger@example.test" }), {
    dropped: true,
    reason: "not-allowed",
    provider: "resend",
    accepted: false,
  });
  // One outsider in cc drops it too.
  assert.equal(
    (await sendMail(env, { ...MESSAGE, to: "team@example.test", cc: "stranger@example.test" })).dropped,
    true,
  );
  assert.equal(calls.length, 0);
  assert.equal((await sendMail(env, { ...MESSAGE, to: "Pat <pat@adapttolife.org>" })).id, "re-1");
  assert.equal(calls.length, 1);
});

test("mailAllowed: full addresses and @domains, nothing when unset, everything in production", () => {
  const env = { ENV_NAME: "staging", MAIL_ALLOW: "hello@adapttolife.org,@faisaln.com" };
  assert.equal(mailAllowed(env, "hello@adapttolife.org"), true);
  assert.equal(mailAllowed(env, "HELLO@adapttolife.org"), true);
  assert.equal(mailAllowed(env, "other@adapttolife.org"), false);
  assert.equal(mailAllowed(env, "f@faisaln.com"), true);
  assert.equal(mailAllowed(env, "f@notfaisaln.com"), false);
  assert.equal(mailAllowed({ ENV_NAME: "staging" }, "hello@adapttolife.org"), false);
  assert.equal(mailAllowed({ ENV_NAME: "production" }, "anyone@example.test"), true);
});

test("resend: 429, 5xx, timeouts and a key still in flight are retryable; a reused key with a new body is not", async (t) => {
  for (const [status, name, retryable] of [
    [429, "rate_limit_exceeded", true],
    [500, "internal_server_error", true],
    [503, "x", true],
    [409, "concurrent_idempotent_requests", true],
    [409, "invalid_idempotent_request", false],
    [400, "invalid_idempotency_key", false],
    [422, "validation_error", false],
  ]) {
    await withFetch(t, () => Response.json({ name }, { status }));
    await assert.rejects(sendMail(BASE, MESSAGE), (error) => {
      assert.equal(error.retryable, retryable, `status ${status} ${name}`);
      assert.equal(error.status, status);
      return true;
    });
  }
  await withFetch(t, () => {
    throw new DOMException("timed out", "TimeoutError");
  });
  await assert.rejects(sendMail(BASE, MESSAGE), (error) => error.retryable === true);
});

test("resend: never falls back to another provider", async (t) => {
  let legacy = 0;
  await withFetch(t, () => new Response("", { status: 503 }));
  await assert.rejects(
    sendMail({ ...BASE, SEND_EMAIL: { send: () => legacy++ } }, MESSAGE),
    /Resend refused/,
  );
  assert.equal(legacy, 0);
});

test("legacy transports never see the key or tags, and Gmail allows the unsubscribe headers", async () => {
  const seen = [];
  await sendMail({ SEND_EMAIL: { send: (m) => seen.push(m) } }, MESSAGE);
  assert.equal("idempotencyKey" in seen[0], false);
  assert.equal("tags" in seen[0], false);
  const mime = buildMime(
    {
      ...MESSAGE,
      from: "hello@adaptivesportsnearme.com",
      headers: { "List-Unsubscribe": "<https://example.test/u>", "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    },
    "hello@adaptivesportsnearme.com",
  );
  assert.match(mime, /List-Unsubscribe-Post: List-Unsubscribe=One-Click/);
});

test("every sender in src passes an idempotency key and tags", () => {
  for (const file of ["src/email.js", "src/intake.js"]) {
    const source = read(file);
    assert.doesNotMatch(source, /sendMail\(env, \{\s*from: (HOUSE_FROM|INTAKE_FROM)/, file);
  }
  assert.match(read("src/intake.js"), /idempotencyKey: `intake:\$\{row\.id\}`/);
});

test("wrangler: every Worker sends through Resend from the mail. subdomain, and staging has an allow list", () => {
  const configs = {
    production: JSON.parse(read("wrangler.json")).vars,
    previews: JSON.parse(read("wrangler.json")).previews.vars,
    staging: JSON.parse(read("wrangler.json")).env.staging.vars,
    preview: JSON.parse(read("wrangler.preview.json")).vars,
    dev: JSON.parse(read("wrangler.dev.json")).vars,
    gate: JSON.parse(read("wrangler.gate.json")).vars,
  };
  for (const [name, vars] of Object.entries(configs)) {
    assert.equal(vars.MAIL_TRANSPORT, "resend", name);
    assert.equal(vars.MAIL_FROM_DOMAINS, "mail.adaptivesportsnearme.com", name);
    assert.equal(vars.MAIL_FROM, "Adaptive Sports Near Me <hello@mail.adaptivesportsnearme.com>", name);
    assert.equal(vars.RESEND_TOPIC_ID, "9310c098-509b-49f6-b019-426e6ab5fd11", name);
    if (vars.ENV_NAME === "production") assert.equal(vars.MAIL_ALLOW, undefined, name);
    else
      assert.deepEqual(
        vars.MAIL_ALLOW.split(","),
        ["hello@adapttolife.org", "@adaptivesportsnearme.com", "@adapttolife.org", "@faisaln.com"],
        name,
      );
  }
});

// ---- the Worker --------------------------------------------------------------

function app(t, extraEnv = {}) {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(read("db/schema.sql"));
  sqlite.exec(read("db/intake-schema.sql"));
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
          return { meta: { changes: Number(statement.run(...values).changes) } };
        },
      };
    },
    async batch(statements) {
      sqlite.exec("BEGIN");
      try {
        const results = [];
        for (const s of statements) results.push(await s.run());
        sqlite.exec("COMMIT");
        return results;
      } catch (e) {
        sqlite.exec("ROLLBACK");
        throw e;
      }
    },
  };
  t.after(() => sqlite.close());
  const env = {
    ...BASE,
    ENV_NAME: "staging",
    MAIL_ALLOW: "@example.test,hello@adapttolife.org,@adaptivesportsnearme.com",
    PRELAUNCH: "false",
    DB,
    INTAKE: DB,
    PROFILE_SIGNING_KEY: "profile-key",
    ADMIN_AUTH_SIGNING_KEY: "admin-key",
    NEWSLETTER_LINK_SECRET: "link-secret",
    RESEND_WEBHOOK_SECRET: WEBHOOK_SECRET,
    RESEND_TOPIC_ID: TOPIC,
    RESEND_SEGMENT_ID: SEGMENT,
    ...extraEnv,
  };
  const jobs = [];
  const ctx = { waitUntil: (job) => jobs.push(job) };
  const call = (path, init = {}) =>
    worker.fetch(new Request("https://staging-adaptivesportsnearme.adapt-to-life.workers.dev" + path, init), env, ctx);
  const post = (path, body, headers = {}) =>
    call(path, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
  return { sqlite, env, jobs, call, post };
}

test("sign-in links: each request is its own email, and an address gets at most a few per window", async (t) => {
  const x = app(t);
  const calls = await withFetch(t, () => Response.json({ id: "re-x" }));
  for (let i = 0; i < LINKS_PER_WINDOW; i++)
    assert.equal((await x.post("/api/profile-auth/request-link", { email: "person@example.test" })).status, 200);
  const limited = await x.post("/api/profile-auth/request-link", { email: "Person@Example.test" });
  assert.equal(limited.status, 429);
  assert.match((await limited.json()).error, /sent a few sign-in links/);
  const keys = calls.map((c) => c.init.headers["Idempotency-Key"]);
  assert.equal(keys.length, LINKS_PER_WINDOW);
  assert.equal(new Set(keys).size, LINKS_PER_WINDOW);
  for (const key of keys) assert.match(key, /^signin-profile:[0-9a-f]{32}$/);
  // Another address is not held up by the first one's limit.
  assert.equal((await x.post("/api/profile-auth/request-link", { email: "other@example.test" })).status, 200);
});

async function adminCookie(x) {
  const session = await createAdminSession(x.env.DB, "staff@adaptivesportsnearme.com", x.env.ADMIN_AUTH_SIGNING_KEY);
  return serializeAdminCookie(session.id, session.signature).split(";")[0];
}

test("beta invite: a failed invitation leaves the saved tester saved, says so, and is ledgered", async (t) => {
  const x = app(t);
  quiet(t, "error");
  const calls = await withFetch(t, () => Response.json({ name: "validation_error" }, { status: 422 }));
  const cookie = await adminCookie(x);
  const response = await x.post(
    "/api/admin-data/beta-testers",
    { email: "tester@example.test", name: "Tess", sendInvitation: true },
    { Cookie: cookie },
  );
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.item.email, "tester@example.test");
  assert.equal(body.invitation, "failed");
  assert.match(body.warning, /saved/);
  assert.match(calls[0].init.headers["Idempotency-Key"], /^invite:[0-9a-f]{32}$/);
  assert.equal(x.sqlite.prepare("SELECT route FROM send_failures").get().route, "asnm-beta-invite");
});

test("beta invite: the same tester always gets the same key, so a second Add is deduped by Resend", async (t) => {
  const x = app(t);
  const calls = await withFetch(t, () => Response.json({ id: "re-invite" }));
  const cookie = await adminCookie(x);
  for (let i = 0; i < 2; i++) {
    const body = await (
      await x.post("/api/admin-data/beta-testers", { email: "tester@example.test", name: "Tess", sendInvitation: true }, { Cookie: cookie })
    ).json();
    assert.equal(body.invitation, "sent");
  }
  assert.equal(calls[0].init.headers["Idempotency-Key"], calls[1].init.headers["Idempotency-Key"]);
});

// ---- /unsubscribe --------------------------------------------------------------

test("unsubscribe links are signed with NEWSLETTER_LINK_SECRET and refuse tampering", async () => {
  const env = { NEWSLETTER_LINK_SECRET: "link-secret", RESEND_API_KEY: "re_other" };
  const link = new URL(await unsubscribeUrl(env, "https://adaptivesportsnearme.com", "Person@Example.test"));
  const e = link.searchParams.get("e");
  const tok = link.searchParams.get("t");
  assert.equal(await verifyUnsubscribe(env, e, tok), "person@example.test");
  assert.equal(await verifyUnsubscribe(env, e, tok, "atl"), null);
  const other = new URL(await unsubscribeUrl(env, "https://adaptivesportsnearme.com", "other@example.test"));
  assert.equal(await verifyUnsubscribe(env, other.searchParams.get("e"), tok), null);
  assert.equal(await verifyUnsubscribe({ NEWSLETTER_LINK_SECRET: "rotated" }, e, tok), null);
  // Never the Resend key: without the link secret there are no links.
  await assert.rejects(unsubscribeUrl({ RESEND_API_KEY: "re_x" }, "https://a.test", "p@example.test"));
  assert.equal(await verifyUnsubscribe({ RESEND_API_KEY: "re_x" }, e, tok), null);
});

test("GET /unsubscribe only shows a button; POST opts out of the ASNM Topic only", async (t) => {
  const x = app(t);
  x.sqlite.exec(`INSERT INTO profiles (id,email,name,state,sports_json,newsletter,created_at,updated_at)
    VALUES ('p-1','person@example.test','','','[]',1,'2026-01-01','2026-01-01')`);
  const calls = await withFetch(t, () => Response.json({ object: "contact_topics" }));
  const link = new URL(await unsubscribeUrl(x.env, "https://staging-adaptivesportsnearme.adapt-to-life.workers.dev", "person@example.test"));
  const path = link.pathname + link.search;

  const page = await x.call(path);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /<button type="submit">Unsubscribe<\/button>/);
  assert.equal(calls.length, 0, "opening the link changes nothing");

  // What Gmail's one click unsubscribe sends.
  const done = await x.call(path, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "List-Unsubscribe=One-Click",
  });
  assert.equal(done.status, 200);
  assert.match(await done.text(), /You're unsubscribed/);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.resend.com/contacts/person%40example.test/topics");
  assert.equal(calls[0].init.method, "PATCH");
  assert.deepEqual(JSON.parse(calls[0].init.body), [{ id: TOPIC, subscription: "opt_out" }]);
  // Never the team wide flag, never the contact itself.
  assert.ok(!calls.some((c) => /unsubscribed/.test(c.init.body || "") || c.init.method === "DELETE"));
  assert.equal(x.sqlite.prepare("SELECT newsletter FROM profiles").get().newsletter, 0);
});

test("unsubscribe without a real Topic id fails loudly and touches nothing else", async (t) => {
  const x = app(t, { RESEND_TOPIC_ID: "not-a-topic" });
  quiet(t, "error");
  const calls = await withFetch(t, () => Response.json({}));
  const link = new URL(await unsubscribeUrl(x.env, "https://a.test", "person@example.test"));
  const done = await x.call(link.pathname + link.search, { method: "POST" });
  assert.equal(done.status, 503);
  assert.equal(calls.length, 0);
  assert.equal(x.sqlite.prepare("SELECT route FROM send_failures").get().route, "asnm-unsubscribe");
});

test("the signed token carries the brand: a link for another brand does not work here", async (t) => {
  const x = app(t);
  const calls = await withFetch(t, () => Response.json({}));
  const link = new URL(await unsubscribeUrl(x.env, "https://a.test", "person@example.test"));
  assert.equal(link.searchParams.get("b"), "asnm");
  link.searchParams.set("b", "atl");
  assert.equal((await x.call(link.pathname + link.search, { method: "POST" })).status, 400);
  link.searchParams.delete("b");
  assert.equal((await x.call(link.pathname + link.search, { method: "POST" })).status, 400);
  assert.equal(calls.length, 0);
});

test("a bad unsubscribe link changes nothing", async (t) => {
  const x = app(t);
  const calls = await withFetch(t, () => Response.json({}));
  const link = new URL(await unsubscribeUrl(x.env, "https://a.test", "person@example.test"));
  link.searchParams.set("t", link.searchParams.get("t").slice(0, -2) + "AA");
  const response = await x.call(link.pathname + link.search, { method: "POST" });
  assert.equal(response.status, 400);
  assert.equal(calls.length, 0);
});

test("staging never unsubscribes an address outside the team", async (t) => {
  const x = app(t, { MAIL_ALLOW: "hello@adapttolife.org" });
  const calls = await withFetch(t, () => Response.json({}));
  quiet(t, "log");
  const link = new URL(await unsubscribeUrl(x.env, "https://a.test", "person@example.test"));
  const response = await x.call(link.pathname + link.search, { method: "POST" });
  assert.match(await response.text(), /test site/);
  assert.equal(calls.length, 0);
});

test("/unsubscribe works while the site is in maintenance mode", async (t) => {
  const x = app(t);
  x.sqlite.exec("UPDATE site_settings SET value='1' WHERE key='maintenance_mode'");
  await withFetch(t, () => Response.json({}));
  const link = new URL(await unsubscribeUrl(x.env, "https://a.test", "person@example.test"));
  assert.match(await (await x.call(link.pathname + link.search)).text(), /Stop the Adaptive Sports Near Me emails/);
});

// ---- /api/resend-events ------------------------------------------------------------

function signed(body, { id = "msg_1", timestamp = Math.floor(Date.now() / 1000), secret = WEBHOOK_SECRET } = {}) {
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signature = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest("base64");
  return {
    "svix-id": id,
    "svix-timestamp": String(timestamp),
    "svix-signature": `v1,${Buffer.from("old-key-signature").toString("base64")} v1,${signature}`,
    "Content-Type": "application/json",
  };
}
const bounce = (tags = { brand: "asnm", kind: "welcome", env: "staging" }) =>
  JSON.stringify({
    type: "email.bounced",
    created_at: "2026-11-24T00:00:00.000Z",
    data: {
      email_id: "re-123",
      to: ["person@example.test"],
      bounce: { type: "Permanent", subType: "General", message: "No such mailbox" },
      tags,
    },
  });

test("svix: a good signature passes; a wrong secret, a changed body or a stale timestamp do not", async () => {
  const body = bounce();
  const headers = new Headers(signed(body));
  assert.equal(await verifySvix(WEBHOOK_SECRET, headers, body), true);
  assert.equal(await verifySvix("whsec_" + Buffer.from("other").toString("base64"), headers, body), false);
  assert.equal(await verifySvix(WEBHOOK_SECRET, headers, body + " "), false);
  const stale = new Headers(signed(body, { timestamp: Math.floor(Date.now() / 1000) - 301 }));
  assert.equal(await verifySvix(WEBHOOK_SECRET, stale, body), false);
  const future = new Headers(signed(body, { timestamp: Math.floor(Date.now() / 1000) + 301 }));
  assert.equal(await verifySvix(WEBHOOK_SECRET, future, body), false);
});

test("resend events: a bounce is stored once and written to send_failures once, however often it is replayed", async (t) => {
  const x = app(t);
  const body = bounce();
  const first = await x.call("/api/resend-events", { method: "POST", headers: signed(body), body });
  assert.equal(first.status, 200);
  assert.deepEqual(await first.json(), { ok: true });
  const replay = await x.call("/api/resend-events", { method: "POST", headers: signed(body), body });
  assert.deepEqual(await replay.json(), { ok: true, duplicate: true });
  const event = x.sqlite.prepare("SELECT svix_id, type, email_id, kind, env FROM resend_events").all();
  assert.deepEqual(event.map((r) => ({ ...r })), [
    { svix_id: "msg_1", type: "email.bounced", email_id: "re-123", kind: "welcome", env: "staging" },
  ]);
  const failures = x.sqlite.prepare("SELECT id, route, to_addr, error FROM send_failures").all();
  assert.equal(failures.length, 1);
  assert.equal(failures[0].id, "resend:msg_1");
  assert.equal(failures[0].route, "resend-bounced");
  assert.equal(failures[0].to_addr, "person@example.test");
  assert.match(failures[0].error, /welcome re-123: Permanent General No such mailbox/);
});

test("resend events: a bad signature is refused and nothing is stored", async (t) => {
  const x = app(t);
  const body = bounce();
  const headers = signed(body, { secret: "whsec_" + Buffer.from("not-ours").toString("base64") });
  const response = await x.call("/api/resend-events", { method: "POST", headers, body });
  assert.equal(response.status, 401);
  assert.equal(x.sqlite.prepare("SELECT count(*) AS n FROM resend_events").get().n, 0);
});

test("resend events: another brand's or another environment's events are dropped unstored", async (t) => {
  const x = app(t);
  for (const tags of [
    { brand: "atl", kind: "receipt-apply", env: "staging" },
    { brand: "asnm", kind: "welcome", env: "production" },
    {},
  ]) {
    const body = bounce(tags);
    const response = await x.call("/api/resend-events", { method: "POST", headers: signed(body, { id: `msg_${Math.random()}` }), body });
    assert.deepEqual(await response.json(), { ok: true, ignored: true });
  }
  assert.equal(x.sqlite.prepare("SELECT count(*) AS n FROM resend_events").get().n, 0);
  assert.equal(x.sqlite.prepare("SELECT count(*) AS n FROM send_failures").get().n, 0);
});

test("resend events: a delivery is recorded but is not a failure", async (t) => {
  const x = app(t);
  const body = JSON.stringify({ type: "email.delivered", data: { email_id: "re-9", to: ["p@example.test"], tags: { brand: "asnm", kind: "welcome", env: "staging" } } });
  await x.call("/api/resend-events", { method: "POST", headers: signed(body, { id: "msg_d" }), body });
  assert.equal(x.sqlite.prepare("SELECT count(*) AS n FROM resend_events").get().n, 1);
  assert.equal(x.sqlite.prepare("SELECT count(*) AS n FROM send_failures").get().n, 0);
});

test("resend events: without the signing secret the hook answers 503 so Resend retries", async (t) => {
  const x = app(t, { RESEND_WEBHOOK_SECRET: undefined });
  const body = bounce();
  assert.equal((await x.call("/api/resend-events", { method: "POST", headers: signed(body), body })).status, 503);
});

test("resend events: a Broadcast event (no custom tags) is matched to ASNM by its From domain, in production only", async (t) => {
  const broadcast = (from, id) =>
    JSON.stringify({
      type: "email.complained",
      data: { broadcast_id: "bc-1", email_id: id, from, to: ["p@example.test"], tags: {} },
    });
  const prod = app(t, { ENV_NAME: "production" });
  const ours = broadcast("Adaptive Sports Near Me <hello@mail.adaptivesportsnearme.com>", "re-b1");
  // Production config only takes writes on the real hostname.
  const post = (x, body, id) =>
    worker.fetch(
      new Request("https://adaptivesportsnearme.com/api/resend-events", { method: "POST", headers: signed(body, { id }), body }),
      x.env,
      { waitUntil() {} },
    );
  assert.deepEqual(await (await post(prod, ours, "msg_b1")).json(), { ok: true });
  const theirs = broadcast("Adapt To Life <hello@mail.adapttolife.org>", "re-b2");
  assert.deepEqual(await (await post(prod, theirs, "msg_b2")).json(), { ok: true, ignored: true });
  assert.deepEqual(
    prod.sqlite.prepare("SELECT route, error FROM send_failures").all().map((r) => ({ ...r })),
    [{ route: "resend-complained", error: "broadcast re-b1: recipient marked it as spam" }],
  );
  const staging = app(t);
  const body = broadcast("Adaptive Sports Near Me <hello@mail.adaptivesportsnearme.com>", "re-b3");
  const response = await staging.call("/api/resend-events", { method: "POST", headers: signed(body, { id: "msg_b3" }), body });
  assert.deepEqual(await response.json(), { ok: true, ignored: true });
});

// ---- the ATL review changes (adapt-to-life #437), same file in both repos ----

test("missing mail config throws a retryable MailError before anything is sent", async (t) => {
  const calls = await withFetch(t, () => Response.json({ id: "never" }));
  await assert.rejects(sendMail({ ...BASE, RESEND_API_KEY: undefined }, MESSAGE), (error) => {
    assert.ok(error instanceof MailError);
    assert.equal(error.retryable, true);
    return true;
  });
  assert.equal(calls.length, 0);
});

test("an accepted send without an id is retryable, never recorded as sent", async (t) => {
  await withFetch(t, () => Response.json({}));
  await assert.rejects(sendMail(BASE, MESSAGE), (error) => error.retryable === true);
});

test("every refusal before the network is a non-retryable MailError", async (t) => {
  await withFetch(t, () => Response.json({ id: "never" }));
  await assert.rejects(sendMail(BASE, { ...MESSAGE, to: "not an address" }), (error) => {
    assert.ok(error instanceof MailError);
    assert.equal(error.retryable, false);
    return true;
  });
});

test("Resend's free-text error never reaches our error message", async (t) => {
  await withFetch(t, () =>
    Response.json({ name: "Rejected person@example.test", message: "person@example.test" }, { status: 422 }),
  );
  await assert.rejects(sendMail(BASE, MESSAGE), (error) => {
    assert.doesNotMatch(error.message, /example\.test/);
    return true;
  });
});

test("keyHash is stable and ignores case and spaces", async () => {
  assert.equal(await keyHash(" Person@Example.test "), await keyHash("person@example.test"));
  assert.match(await keyHash("x"), /^[0-9a-f]{64}$/);
});

test("ASNM's mail-transport.js is the adapt-to-life file byte for byte (adapt-to-life #437)", async () => {
  const { createHash } = await import("node:crypto");
  assert.equal(
    createHash("sha256").update(read("src/mail-transport.js")).digest("hex"),
    "3a3be19121ae25a3c669cb5236e0439401d2cb58c28a78732d6b0f4aaaa504f2",
    "Change src/mail-transport.js in both repos together, then update this hash",
  );
});
