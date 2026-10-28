// The one-minute check-up on the Worker (docs/specs/community-kept-directory.md): what an
// organization's answers do when a person applies them, and what a visitor's report does.
import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import worker from "../src/index.js";
import { getOrg, listingsSnapshot } from "../src/data.js";
import { listAdminQueue, acceptAdminQueueItem, adminOrganizationActivity } from "../src/admin-access.js";
import { parseCheckup, parseFixReason } from "../src/listing-answers.js";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
function d1(sqlite) {
  return {
    prepare(sql) {
      const stmt = sqlite.prepare(sql); let values = [];
      return {
        bind(...v) { values = v; return this; },
        async first() { return stmt.get(...values) || null; },
        async all() { return { results: stmt.all(...values) }; },
        async run() { return { meta: { changes: Number(stmt.run(...values).changes) } }; },
      };
    },
    async batch(statements) {
      sqlite.exec("BEGIN");
      try { const r = []; for (const s of statements) r.push(await s.run()); sqlite.exec("COMMIT"); return r; } catch (e) { sqlite.exec("ROLLBACK"); throw e; }
    },
  };
}
const ORG = "9fd14fc2-5d5d-472d-a0ca-a0a1de7651f6";
let SID = 0;
function site(t) {
  const directory = new DatabaseSync(":memory:");
  directory.exec(read("db/schema.sql"));
  directory.exec(read("data/sports-seed.sql"));
  const intake = new DatabaseSync(":memory:");
  intake.exec(read("db/intake-schema.sql"));
  directory.prepare(`INSERT INTO organizations (id,name,sport,sport_key,website_url,city,state,is_public,status,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,1,'active','2025-03-02T00:00:00Z','2026')`).run(ORG, "Mountain Adaptive", "Skiing", "skiing", "https://example.org", "Lincoln", "NH");
  const env = { ENV_NAME: "production", DB: d1(directory), INTAKE: d1(intake), TURNSTILE_SECRET_KEY: "test-secret", SEND_EMAIL: { async send() { return { id: "ok" }; } } };
  const network = globalThis.fetch, log = console.error;
  globalThis.fetch = async (url) => String(url).startsWith("https://challenges.cloudflare.com/") ? Response.json({ success: true }) : new Response("down", { status: 500 });
  console.error = () => {};
  t.after(() => { globalThis.fetch = network; console.error = log; directory.close(); intake.close(); });
  const post = (body) => worker.fetch(new Request("https://adaptivesportsnearme.com/api/submit-program", {
    method: "POST", headers: { "Content-Type": "application/json", "CF-Connecting-IP": "203.0.113.9" },
    body: JSON.stringify({ cf_token: "ok", pn: "Mountain Adaptive", lid: ORG, sid: `7c2e8b1a-1d4f-4b7e-8a00-${String(++SID).padStart(12, "0")}`, ...body }),
  }), env, { waitUntil() {} });
  const org = () => ({ ...directory.prepare("SELECT website_url, city, state, ages, cost_note, is_public FROM organizations WHERE id = ?").get(ORG) });
  return { directory, db: env.DB, post, org };
}
const run = { rel: "run", em: "manager@example.test" };
const applyFirst = async (x) => acceptAdminQueueItem(x.db, (await listAdminQueue(x.db))[0].id, "team@adaptivesportsnearme.com");

test("answers are cleaned: unknown verdicts, statuses, states, reasons and who codes are dropped", () => {
  assert.equal(parseCheckup('{"verdict":"maybe"}'), null);
  assert.equal(parseCheckup("nope"), null);
  assert.equal(parseCheckup('{"verdict":"stopped"}'), null);   // a reason is required
  assert.deepEqual(parseCheckup('{"verdict":"changed","facts":{"website":{"status":"change","value":"javascript:x"},"place":{"status":"change","city":"X","state":"ZZ"},"who":{"status":"change","value":["kids","bogus"]},"cost":{"status":"maybe"}}}'),
    { verdict: "changed", facts: { who: { status: "change", value: ["kids"] } } });
  assert.equal(parseFixReason("website"), "website");
  assert.equal(parseFixReason("rm -rf"), "");
});

test("'Yes, it's all still right' needs no note; applying it confirms the listing without changing it", async (t) => {
  const x = site(t);
  const before = x.org();
  assert.equal((await x.post({ ...run, checkup: JSON.stringify({ verdict: "all_right" }) })).status, 200);
  assert.equal((await getOrg(x.db, ORG)).history.updatedByOrganization, null);   // nothing public until a person applies it
  await applyFirst(x);
  assert.deepEqual(x.org(), before);
  assert.equal((await getOrg(x.db, ORG)).history.updatedByOrganization, new Date().toISOString().slice(0, 7));
  const [applied] = await adminOrganizationActivity(x.db, ORG);
  assert.match(applied.summary, /everything is still right/);
});

test("'Something changed' writes the website, place, who it's for and cost, and nothing it wasn't told", async (t) => {
  const x = site(t);
  await x.post({ ...run, checkup: JSON.stringify({ verdict: "changed", facts: {
    website: { status: "change", value: "mountainadaptive.org/programs" }, place: { status: "change", city: "North Woodstock", state: "NH" },
    who: { status: "change", value: ["kids", "adults", "physical"] }, cost: { status: "change", value: "fee", note: "$20 a session" }, sports: { status: "right" } } }),
    sports: JSON.stringify({ skiing: ["winter"] }) });
  await applyFirst(x);
  assert.deepEqual(x.org(), { website_url: "https://mountainadaptive.org/programs", city: "North Woodstock", state: "NH",
    ages: "Kids and teens; Adults; Physical disabilities", cost_note: "There's a fee. $20 a session", is_public: 1 });
  // Who it's for now finds it under the Kids and teens filter.
  const card = (await listingsSnapshot(x.db)).items.find((o) => o.id === ORG);
  assert.ok(card.who.includes("kids") && card.who.includes("physical"), JSON.stringify(card.who));
  const [applied] = await adminOrganizationActivity(x.db, ORG);
  assert.match(applied.summary, /website: https:\/\/mountainadaptive\.org\/programs.*place: North Woodstock, NH.*sports: Skiing \(winter\)/);
});

test("'We don't run this anymore' hides the listing after a person applies it; it's never deleted", async (t) => {
  const x = site(t);
  await x.post({ ...run, checkup: JSON.stringify({ verdict: "stopped", stopped: { reason: "closed_for_good" } }) });
  assert.equal(x.org().is_public, 1);
  await applyFirst(x);
  assert.equal(x.org().is_public, 0);
  assert.equal(x.directory.prepare("SELECT count(*) n FROM organizations WHERE id = ?").get(ORG).n, 1);
  assert.match((await adminOrganizationActivity(x.db, ORG))[0].summary, /closed for good.*hidden/);
});

test("a visitor's 'Something's wrong?' needs only a reason; Done closes it and changes nothing", async (t) => {
  const x = site(t);
  assert.equal((await x.post({ rel: "attend", reason: "other" })).status, 422);   // "Something else" needs words
  assert.equal((await x.post({ rel: "attend", reason: "website" })).status, 200);
  const [report] = await listAdminQueue(x.db);
  assert.equal(report.payload.reason, "website");
  const before = x.org();
  assert.deepEqual(await applyFirst(x), { kind: "listing_update", record_id: ORG });
  assert.deepEqual(x.org(), before);
  const [done, received] = await adminOrganizationActivity(x.db, ORG);
  assert.equal(received.summary, "Fix suggested by someone who goes there: Website moved or broken");
  assert.equal(done.summary, "Report handled: Website moved or broken");
  assert.equal((await listAdminQueue(x.db)).length, 0);
});
