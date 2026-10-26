// Programs that come back, on the Worker (docs/specs/programs-that-come-back.md):
// yearly events read from programs, the site before the migration runs, what an
// organization sends when it confirms its listing, Apply in the review queue,
// the organization's own editor, and the team-only history.
import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import worker from "../src/index.js";
import { listEvents, listSeries, getSeries } from "../src/events.js";
import { directorySnapshot, getOrg, getProgram, listingsSnapshot, listPrograms, listActualPrograms, programsSnapshot } from "../src/data.js";
import { listAdminQueue, getAdminQueueItem, acceptAdminQueueItem, createAdminItem, saveAdminItem, adminOrganizationActivity, addAdminNote } from "../src/admin-access.js";
import {
  updateClaimedOrganization, organizationForClaimEmail, createManagedEvent, updateManagedEvent, managedOrganizationEvents,
  createManagedProgram, managedOrganizationPrograms,
} from "../src/organization-access.js";
import { parseSportsAnswer, parseYearlyAnswer, webUrl } from "../src/listing-answers.js";
import { applySports } from "../src/offerings.js";

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

// schema.sql is the live shape after migration 0015; plus the sports table, and Spooky Spokes.
function database({ seed = true } = {}) {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(read("db/schema.sql"));
  sqlite.exec(read("data/sports-seed.sql"));
  if (seed) sqlite.exec(read("db/maintenance/yearly_spooky_spokes.sql"));
  return { sqlite, db: d1(sqlite) };
}

// The database as it is today, before migration 0015 runs.
function beforeMigration() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(read("db/schema.sql"));
  sqlite.exec(read("data/sports-seed.sql"));
  sqlite.exec(`DROP INDEX events_program_idx; ALTER TABLE events DROP COLUMN program_id; ALTER TABLE events DROP COLUMN recap_url;
    DROP TABLE organization_activity; DROP INDEX programs_slug_idx; DROP INDEX programs_kind_idx;
    ALTER TABLE programs DROP COLUMN kind; ALTER TABLE programs DROP COLUMN seasons_json; ALTER TABLE programs DROP COLUMN usual_month;
    ALTER TABLE programs DROP COLUMN first_year; ALTER TABLE programs DROP COLUMN slug; ALTER TABLE programs DROP COLUMN listing;`);
  return { sqlite, db: d1(sqlite) };
}

const ORG = "9fd14fc2-5d5d-472d-a0ca-a0a1de7651f6";
const OTHER = "1d2c3b4a-5d5d-472d-a0ca-a0a1de7651f7";
const LODGE = "5b0a3c2e-7d1f-4c55-9a51-3f0b6c2a8e00";
const SPOKES = "5b0a3c2e-7d1f-4c55-9a51-3f0b6c2a8e01";
const EMAIL = "manager@example.test";
function addOrg(sqlite, id = ORG, extra = {}) {
  const row = { id, name: "Mountain Adaptive", sport: "Skiing", sport_key: "skiing", website_url: "https://example.org", city: "Lincoln", state: "NH",
    is_public: 1, status: "active", claim_email: EMAIL, created_at: "2025-03-02T00:00:00Z", updated_at: "2026", ...extra };
  const cols = Object.keys(row);
  sqlite.prepare(`INSERT INTO organizations (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`).run(...Object.values(row));
}
function addProgram(sqlite, extra = {}) {
  const row = { id: crypto.randomUUID(), organization_id: ORG, name: "Adaptive Tennis", sport: "Tennis", sport_key: "tennis", city: "Concord", state: "NH",
    website_url: "https://example.org/tennis", is_public: 1, status: "active", created_at: "2026", updated_at: "2026", ...extra };
  const cols = Object.keys(row);
  sqlite.prepare(`INSERT INTO programs (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`).run(...Object.values(row));
  return row.id;
}

test("a yearly event is a program: its page has every year, oldest first, and its host", async () => {
  const { sqlite, db } = database();
  try {
    const one = await getSeries(db, "spooky-spokes");
    assert.equal(one.name, "Spooky Spokes");
    assert.equal(one.host_name, "The Pickle Lodge");
    assert.deepEqual(one.organization, { id: LODGE, name: "The Pickle Lodge" });
    assert.equal(one.first_year, 2024);
    assert.equal(one.usual_month, 10);
    assert.equal(one.url, "https://thepicklelodge.com/blogs/programming-at-the-pickle-lodge/tournaments");
    assert.deepEqual(one.editions.map((e) => e.starts_at), ["2024-10-25", "2025-10-24", "2026-10-23"]);
    assert.ok(one.editions.every((e) => e.recap_url && !("program_id" in e)));
    assert.equal((await getSeries(db, SPOKES)).slug, "spooky-spokes");   // by id too
    assert.equal(await getSeries(db, "nope"), null);
    assert.equal(await getSeries(db, "../etc"), null);
    assert.deepEqual((await listSeries(db)).items.map((s) => s.slug), ["spooky-spokes"]);
    assert.equal((await listSeries(db, new URLSearchParams({ org: LODGE }))).total, 1);
    assert.equal((await listSeries(db, new URLSearchParams({ org: ORG }))).total, 0);
  } finally { sqlite.close(); }
});

test("a yearly event isn't a directory card or one of the organization's programs; its /programs page moves to its own address", async () => {
  const { sqlite, db } = database();
  try {
    assert.equal((await programsSnapshot(db)).items.length, 0);
    assert.equal((await listActualPrograms(db, new URLSearchParams({ organization_id: LODGE }))).total, 0);
    assert.equal((await getProgram(db, SPOKES)).kind, "event");
    const page = await worker.fetch(new Request(`https://adaptivesportsnearme.com/programs/${SPOKES}`), { DB: db, ENV_NAME: "production", ASSETS: assets() }, { waitUntil() {} });
    assert.ok([301, 302, 308].includes(page.status), String(page.status));
    assert.match(page.headers.get("Location"), /\/events\/spooky-spokes$/);
  } finally { sqlite.close(); }
});

test("the dated feed names a year's yearly event only while that event and its host are public", async () => {
  const { sqlite, db } = database();
  try {
    sqlite.prepare(`INSERT INTO events (id,title,starts_at,status,is_public,source,created_at,updated_at,program_id) VALUES ('e-next','Spooky Spokes 2099','2099-10-23','scheduled',1,'admin','2026','2026','${SPOKES}')`).run();
    assert.deepEqual((await listEvents(db, new URLSearchParams())).items.map((e) => [e.id, e.series?.slug, e.series?.first_year]), [["e-next", "spooky-spokes", 2024]]);
    sqlite.exec(`UPDATE organizations SET is_public = 0 WHERE id = '${LODGE}'`);
    assert.equal(await getSeries(db, "spooky-spokes"), null);
    const hidden = (await listEvents(db, new URLSearchParams())).items[0];
    assert.equal(hidden.series, null);
    assert.equal(hidden.program_id, null);
  } finally { sqlite.close(); }
});

test("before migration 0015 runs, the site reads and saves exactly as it does today", async () => {
  const { sqlite, db } = beforeMigration();
  try {
    addOrg(sqlite);
    addProgram(sqlite);
    sqlite.prepare("INSERT INTO events (id,title,starts_at,status,is_public,source,created_at,updated_at) VALUES ('e1','Ski Day','2099-01-10','scheduled',1,'admin','2026','2026')").run();
    assert.equal((await directorySnapshot(db)).items[0].seasons, null);
    const org = await getOrg(db, ORG);
    assert.equal(org.name, "Mountain Adaptive");
    assert.deepEqual(org.history, { listedSince: "2025-03", updatedByOrganization: null });
    assert.equal((await programsSnapshot(db)).items.length, 1);
    assert.equal((await listActualPrograms(db, new URLSearchParams({ organization_id: ORG }))).total, 1);
    assert.deepEqual((await listEvents(db, new URLSearchParams())).items.map((e) => e.id), ["e1"]);
    assert.deepEqual(await listSeries(db), { total: 0, items: [] });
    assert.equal(await getSeries(db, "spooky-spokes"), null);
    // The organization's editor still saves; sports wait for the migration.
    const saved = await updateClaimedOrganization(db, ORG, EMAIL, { name: "Mountain Adaptive Sports", sport_seasons_json: '{"skiing":["winter"],"sailing":["summer"]}' });
    assert.equal(saved.name, "Mountain Adaptive Sports");
    assert.equal(saved.sport_seasons_json, null);
    // A managed program and event still save; seasons and "every year" wait for the migration.
    assert.equal((await createManagedProgram(db, ORG, EMAIL, { name: "Ski Team", sport_key: "skiing", seasons_json: '["winter"]' })).name, "Ski Team");
    assert.equal((await createManagedEvent(db, ORG, EMAIL, { title: "Ski Day", starts_at: "2099-01-11T15:00:00Z", yearly: "1", is_public: "1" })).title, "Ski Day");
    // Admin edits work on the columns there are; the activity log is simply empty.
    const program = (await managedOrganizationPrograms(db, ORG, EMAIL)).find((p) => p.name === "Adaptive Tennis");
    assert.equal((await saveAdminItem(db, "programs", program.id, { name: "Tennis Club", seasons_json: '["summer"]' }, "team@adaptivesportsnearme.com")).name, "Tennis Club");
    assert.deepEqual(await adminOrganizationActivity(db, ORG), []);
    const res = await worker.fetch(new Request("https://adaptivesportsnearme.com/api/event-series"), { DB: db, ENV_NAME: "production" }, { waitUntil() {} });
    assert.deepEqual(await res.json(), { ok: true, total: 0, items: [] });
  } finally { sqlite.close(); }
});

test("the sports an organization ticks become programs on its card: one card, found under every sport, with seasons", async () => {
  const { sqlite, db } = database({ seed: false });
  try {
    addOrg(sqlite);
    const own = addProgram(sqlite, { seasons_json: '["summer"]' });   // tennis, with a place of its own
    const changed = await applySports(db, { id: ORG, city: "Lincoln", state: "NH" }, [
      { key: "skiing", seasons: ["winter"] }, { key: "sailing", seasons: ["summer"] }, { key: "tennis", seasons: ["spring", "summer"] },
    ]);
    assert.deepEqual(changed, { added: ["skiing", "sailing"], updated: ["tennis"], hidden: [] });
    // The own program keeps its card and place; only its seasons changed.
    const tennis = sqlite.prepare("SELECT listing, seasons_json, city FROM programs WHERE id = ?").get(own);
    assert.deepEqual({ ...tennis }, { listing: "own", seasons_json: '["spring","summer"]', city: "Concord" });
    // The new ones ride on the organization's card.
    const cards = (await listingsSnapshot(db)).items;
    assert.deepEqual(cards.map((x) => x.name).sort(), ["Adaptive Tennis", "Mountain Adaptive"]);
    const orgCard = cards.find((x) => x.id === ORG);
    assert.deepEqual(orgCard.seasons, [{ key: "skiing", seasons: ["winter"] }, { key: "sailing", seasons: ["summer"] }]);
    assert.equal(orgCard.key, "multi");
    assert.deepEqual(orgCard.trio, ["skiing", "sailing"]);
    // Its page and search by sport.
    assert.deepEqual((await getOrg(db, ORG)).seasons.map((x) => x.key), ["skiing", "sailing"]);
    const orgRow = sqlite.prepare("SELECT sport, sport_key, sports_json FROM organizations WHERE id = ?").get(ORG);
    assert.deepEqual({ ...orgRow }, { sport: "Multi-sport", sport_key: "multi", sports_json: '["skiing","sailing","tennis"]' });
    for (const sport of ["skiing", "sailing", "tennis"]) assert.ok((await listPrograms(db, new URLSearchParams({ sport }))).items.some((p) => p.id === ORG), sport);
    // "This is every sport we run": a with_org sport left out is hidden, never deleted; the own program stays.
    const again = await applySports(db, { id: ORG, city: "Lincoln", state: "NH" }, [{ key: "skiing", seasons: ["winter"] }]);
    assert.deepEqual(again.hidden, ["sailing"]);
    assert.equal(sqlite.prepare("SELECT count(*) n FROM programs WHERE organization_id = ?").get(ORG).n, 3);
    assert.equal(sqlite.prepare("SELECT is_public FROM programs WHERE id = ?").get(own).is_public, 1);
    assert.deepEqual((await getOrg(db, ORG)).seasons, [{ key: "skiing", seasons: ["winter"] }]);
    // Ticking it again brings the same row back.
    await applySports(db, { id: ORG }, [{ key: "skiing", seasons: ["winter"] }, { key: "sailing", seasons: [] }]);
    assert.equal(sqlite.prepare("SELECT count(*) n FROM programs WHERE organization_id = ? AND sport_key = 'sailing'").get(ORG).n, 1);
    // The program list on its page shows each with its seasons.
    const listed = (await listActualPrograms(db, new URLSearchParams({ organization_id: ORG }))).items;
    assert.deepEqual(listed.find((p) => p.name === "Skiing").seasons, [{ key: "skiing", seasons: ["winter"] }]);
    assert.equal(listed.find((p) => p.name === "Skiing").listing, "with_org");
  } finally { sqlite.close(); }
});

test("confirm-your-listing answers are cleaned: known sports and seasons, three yearly events, web links only", () => {
  assert.deepEqual(parseSportsAnswer('{"skiing":["winter","monsoon"],"multi":["fall"],"grant":[],"notasport":["fall"]}'), [{ key: "skiing", seasons: ["winter"] }]);
  assert.deepEqual(parseSportsAnswer("nope"), []);
  assert.deepEqual(parseSportsAnswer("x".repeat(5000)), []);
  const yearly = parseYearlyAnswer(JSON.stringify([
    { name: "  Ski Day\n", month: 2, url: "example.org/ski" },
    { name: "", month: 3 },
    { name: "Regatta", month: 13, url: "javascript:alert(1)" },
    { name: "Paddle Day", month: "7" }, { name: "Golf Day", month: 8 },
  ]));
  assert.deepEqual(yearly, [
    { name: "Ski Day", month: 2, url: "https://example.org/ski" },
    { name: "Regatta", month: null, url: "" },
    { name: "Paddle Day", month: 7, url: "" },
  ]);
  assert.equal(webUrl("ftp://example.org"), "");
  assert.equal(webUrl("localhost"), "");
});

// --- the form, through the Worker ---------------------------------------------------
function site(t) {
  const directory = new DatabaseSync(":memory:");
  directory.exec(read("db/schema.sql"));
  directory.exec(read("data/sports-seed.sql"));
  const intake = new DatabaseSync(":memory:");
  intake.exec(read("db/intake-schema.sql"));
  addOrg(directory);
  const env = {
    ENV_NAME: "production", DB: d1(directory), INTAKE: d1(intake), TURNSTILE_SECRET_KEY: "test-secret",
    SEND_EMAIL: { async send() { return { id: "ok" }; } },
  };
  const network = globalThis.fetch, log = console.error;
  globalThis.fetch = async (url) => String(url).startsWith("https://challenges.cloudflare.com/") ? Response.json({ success: true }) : new Response("down", { status: 500 });
  console.error = () => {};
  t.after(() => { globalThis.fetch = network; console.error = log; directory.close(); intake.close(); });
  const post = (body) => worker.fetch(new Request("https://adaptivesportsnearme.com/api/submit-program", {
    method: "POST", headers: { "Content-Type": "application/json", "CF-Connecting-IP": "203.0.113.9" }, body: JSON.stringify({ cf_token: "ok", ...body }),
  }), env, { waitUntil() {} });
  return { directory, db: env.DB, post };
}
const confirm = { pn: "Mountain Adaptive", lid: ORG, rel: "run", em: EMAIL, sid: "4c2e8b1a-1d4f-4b7e-8a00-abcdefabcdef" };

test("an organization confirming its listing sends its sports, seasons and yearly events; it lands in the queue and the history, nothing else changes", async (t) => {
  const x = site(t);
  const res = await x.post({ ...confirm, notes: "",
    sports: JSON.stringify({ skiing: ["winter"], sailing: ["summer"], fake: ["winter"] }),
    yearly: JSON.stringify([{ name: "Winter Ski Festival", month: 2, url: "https://example.org/festival" }]) });
  assert.equal(res.status, 200);
  const sub = JSON.parse(x.directory.prepare("SELECT payload FROM submissions").get().payload);
  assert.deepEqual(sub.sports, { skiing: ["winter"], sailing: ["summer"] });
  assert.deepEqual(sub.yearly, [{ name: "Winter Ski Festival", month: 2, url: "https://example.org/festival" }]);
  assert.equal(x.directory.prepare("SELECT count(*) n FROM programs").get().n, 0);   // a person applies it
  const [line] = await adminOrganizationActivity(x.db, ORG);
  assert.equal(line.kind, "confirmation");
  assert.equal(line.summary, "Confirmation received from the organization. sports: Skiing (winter), Sailing (summer); yearly events: Winter Ski Festival (usually February)");
  // Anyone can send this form, so its page doesn't say "updated by the organization" until a person applies it.
  assert.equal((await getOrg(x.db, ORG)).history.updatedByOrganization, null);
});

test("a note is still required when there's nothing else; only the organization itself can send sports; a fix is logged too", async (t) => {
  const x = site(t);
  assert.equal((await x.post({ ...confirm, notes: "" })).status, 422);
  const other = await x.post({ ...confirm, rel: "attend", notes: "Wrong city", em: "", sid: "5c2e8b1a-1d4f-4b7e-8a00-abcdefabcdef", sports: '{"skiing":["winter"]}' });
  assert.equal(other.status, 200);
  assert.equal(JSON.parse(x.directory.prepare("SELECT payload FROM submissions").get().payload).sports, undefined);
  const [line] = await adminOrganizationActivity(x.db, ORG);
  assert.deepEqual([line.kind, line.summary], ["fix", "Fix suggested by someone who goes there: Wrong city"]);
  assert.equal((await getOrg(x.db, ORG)).history.updatedByOrganization, null);   // a visitor's fix isn't the organization's
});

test("Apply writes the organization's programs and seasons, starts its yearly event pages, and records who applied it", async (t) => {
  const x = site(t);
  addOrg(x.directory, OTHER, { name: "Other Club", claim_email: null, state: "VT" });
  // Another host already has a yearly event called Winter Ski Festival.
  x.directory.exec(`INSERT INTO programs (id,organization_id,name,kind,slug,created_at,updated_at) VALUES ('p-other','${OTHER}','Winter Ski Festival','event','winter-ski-festival','2026','2026')`);
  await x.post({ ...confirm, notes: "Please add our sailing.",
    sports: JSON.stringify({ skiing: ["winter"], sailing: ["summer"] }),
    yearly: JSON.stringify([{ name: "Winter Ski Festival", month: 2, url: "https://example.org/festival" }, { name: "Regatta Day", month: 7 }]) });
  await x.post({ ...confirm, rel: "attend", notes: "Wrong phone", em: "", sid: "6c2e8b1a-1d4f-4b7e-8a00-abcdefabcdef" });   // stays email-only

  const queue = await listAdminQueue(x.db);
  assert.deepEqual(queue.map((q) => [q.kind, q.title]), [["listing_update", "Mountain Adaptive"]]);
  const item = await getAdminQueueItem(x.db, queue[0].id);
  assert.deepEqual(item.organization, { id: ORG, name: "Mountain Adaptive", city: "Lincoln", state: "NH" });

  assert.deepEqual(await acceptAdminQueueItem(x.db, queue[0].id, "team@adaptivesportsnearme.com"), { kind: "listing_update", record_id: ORG });
  const programs = x.directory.prepare("SELECT name, sport_key, kind, listing, seasons_json, slug, usual_month, website_url, is_public FROM programs WHERE organization_id = ? ORDER BY kind, name").all(ORG);
  assert.deepEqual(programs.map((p) => ({ ...p })), [
    { name: "Regatta Day", sport_key: null, kind: "event", listing: "own", seasons_json: null, slug: "regatta-day", usual_month: 7, website_url: null, is_public: 1 },
    { name: "Winter Ski Festival", sport_key: null, kind: "event", listing: "own", seasons_json: null, slug: "winter-ski-festival-nh", usual_month: 2, website_url: "https://example.org/festival", is_public: 1 },
    { name: "Sailing", sport_key: "sailing", kind: "program", listing: "with_org", seasons_json: '["summer"]', slug: null, usual_month: null, website_url: null, is_public: 1 },
    { name: "Skiing", sport_key: "skiing", kind: "program", listing: "with_org", seasons_json: '["winter"]', slug: null, usual_month: null, website_url: null, is_public: 1 },
  ]);
  assert.equal(x.directory.prepare("SELECT publicity_consent FROM organizations WHERE id = ?").get(ORG).publicity_consent, 0);   // Apply isn't Verified
  // Between years its yearly event page already says when it usually happens.
  const festival = await getSeries(x.db, "winter-ski-festival-nh");
  assert.equal(festival.usual_month, 2);
  assert.deepEqual(festival.editions, []);
  // The history shows the confirmation, then who applied what.
  const history = await adminOrganizationActivity(x.db, ORG);
  assert.deepEqual(history.map((a) => a.kind), ["applied", "fix", "confirmation"]);   // newest first
  const [applied, , received] = history;
  assert.equal(received.kind, "confirmation");
  assert.equal(applied.kind, "applied");
  assert.equal(applied.actor, "team@adaptivesportsnearme.com");
  assert.equal((await getOrg(x.db, ORG)).history.updatedByOrganization, new Date().toISOString().slice(0, 7));
  assert.match(applied.summary, /^Applied the organization's confirmation\. sports: Skiing \(winter\), Sailing \(summer\); yearly events: Winter Ski Festival \(usually February\), Regatta Day \(usually July\)$/);
  // It is handled once.
  assert.equal(await acceptAdminQueueItem(x.db, queue[0].id), null);
  assert.equal((await listAdminQueue(x.db)).length, 0);
});

test("the team adds notes to an organization's history; the admin dashboard edits a program's seasons and yearly fields and logs it", async () => {
  const { sqlite, db } = database();
  try {
    await assert.rejects(addAdminNote(db, LODGE, "   ", "team@adaptivesportsnearme.com"), /note-required/);
    const items = await addAdminNote(db, LODGE, "Emailed Oct 26\nasked about 2027 dates", "team@adaptivesportsnearme.com");
    assert.deepEqual(items.map((i) => [i.kind, i.summary, i.actor]), [["note", "Emailed Oct 26 asked about 2027 dates", "team@adaptivesportsnearme.com"]]);
    assert.equal(await addAdminNote(db, ORG, "x", "a@b.c"), null);   // no such organization
    const saved = await saveAdminItem(db, "programs", SPOKES, { first_year: "2023", seasons_json: '["fall","bogus"]' }, "reviewer@adaptivesportsnearme.com");
    assert.equal(saved.first_year, 2023);
    assert.equal(saved.seasons_json, '["fall"]');
    const [edit] = await adminOrganizationActivity(db, LODGE);
    assert.deepEqual([edit.kind, edit.summary, edit.actor], ["admin_edit", 'Edited program "Spooky Spokes": seasons json, first year', "reviewer@adaptivesportsnearme.com"]);
    await assert.rejects(saveAdminItem(db, "programs", SPOKES, { usual_month: "13" }), /month-invalid/);
    await assert.rejects(saveAdminItem(db, "programs", SPOKES, { slug: "Not A Slug" }), /slug-invalid/);
    await assert.rejects(saveAdminItem(db, "programs", SPOKES, { kind: "party" }), /kind-invalid/);
    await assert.rejects(createAdminItem(db, "programs", { organization_id: LODGE, name: "Fall Paddle", kind: "event", slug: "spooky-spokes" }), /UNIQUE/);
    const event = await createAdminItem(db, "events", { title: "Spooky Spokes 2027", starts_at: "2027-10-22", program_id: SPOKES, recap_url: "https://example.org/photos" });
    assert.equal(event.program_id, SPOKES);
    await assert.rejects(createAdminItem(db, "events", { title: "X", starts_at: "2026-09-12", recap_url: "javascript:x" }), /url-invalid/);
  } finally { sqlite.close(); }
});

test("an organization's own editor: every sport with its seasons becomes its programs, own programs stay, and the history says so", async () => {
  const { sqlite, db } = database({ seed: false });
  try {
    addOrg(sqlite);
    addProgram(sqlite);   // tennis with its own page
    const before = await organizationForClaimEmail(db, ORG, EMAIL);
    assert.equal(before.sport_seasons_json, '{"tennis":[]}');
    assert.deepEqual(before.own_program_sports, ["tennis"]);
    const saved = await updateClaimedOrganization(db, ORG, EMAIL, { sport_seasons_json: '{"skiing":["winter"],"tennis":["spring","summer","fall","winter"]}' });
    assert.equal(saved.sport_seasons_json, '{"skiing":["winter"],"tennis":["spring","summer","fall","winter"]}');
    assert.equal(saved.sport_key, "multi");
    assert.equal(saved.sports_json, '["skiing","tennis"]');
    await assert.rejects(updateClaimedOrganization(db, ORG, EMAIL, { sport_seasons_json: '{"notasport":[]}' }), /sports-invalid/);
    // A name change and the sports in one save: both land, and the sport columns follow the programs.
    const both = await updateClaimedOrganization(db, ORG, EMAIL, { name: "Mountain Adaptive Sports", sport_seasons_json: '{"skiing":["winter"],"tennis":[]}' });
    assert.equal(both.name, "Mountain Adaptive Sports");
    assert.equal(both.sport_key, "multi");
    const history = (await adminOrganizationActivity(db, ORG)).map((a) => [a.kind, a.summary]);
    assert.deepEqual(history.slice(0, 2), [
      ["self_edit", "The organization edited its listing: name"],
      ["self_edit", "The organization updated its sports: Skiing (winter), Tennis"],
    ]);
    assert.equal(await organizationForClaimEmail(db, ORG, "someone@else.test"), null);
  } finally { sqlite.close(); }
});

test("a program's seasons save from the program form", async () => {
  const { sqlite, db } = database({ seed: false });
  try {
    addOrg(sqlite);
    const made = await createManagedProgram(db, ORG, EMAIL, { name: "Ski Team", sport_key: "skiing", seasons_json: '["winter","nope"]', is_public: "1" });
    assert.equal(made.seasons_json, '["winter"]');
    await assert.rejects(createManagedProgram(db, ORG, EMAIL, { name: "Bad", seasons_json: "{" }), /sports-invalid/);
    assert.equal((await managedOrganizationPrograms(db, ORG, EMAIL)).length, 1);
  } finally { sqlite.close(); }
});

test("an event the organization holds every year starts its yearly page once, and next year's joins it", async () => {
  const { sqlite, db } = database({ seed: false });
  try {
    addOrg(sqlite);
    const first = await createManagedEvent(db, ORG, EMAIL, { title: "2026 Adaptive Ski Day", sport_key: "skiing", city: "Lincoln", state: "NH", starts_at: "2026-02-14T15:00:00Z", yearly: "1", first_year: "2019", recap_url: "example.org/photos", is_public: "1" });
    assert.ok(first.program_id);
    assert.equal(first.first_year, 2019);
    assert.equal(first.series_slug, "adaptive-ski-day");
    assert.equal(first.recap_url, "https://example.org/photos");
    const page = sqlite.prepare("SELECT name, kind, slug, usual_month, first_year, sport_key FROM programs").get();
    assert.deepEqual({ ...page }, { name: "Adaptive Ski Day", kind: "event", slug: "adaptive-ski-day", usual_month: 2, first_year: 2019, sport_key: "skiing" });
    const second = await createManagedEvent(db, ORG, EMAIL, { title: "Adaptive Ski Day 2027", starts_at: "2027-02-13T15:00:00Z", yearly: "1", is_public: "1" });
    assert.equal(second.program_id, first.program_id);
    assert.equal(sqlite.prepare("SELECT count(*) n FROM programs").get().n, 1);
    assert.deepEqual((await getSeries(db, "adaptive-ski-day")).editions.map((e) => e.starts_at.slice(0, 4)), ["2026", "2027"]);
    // Turning it off unlinks that year only; the page and the other year stay.
    assert.equal((await updateManagedEvent(db, ORG, second.id, EMAIL, { yearly: "0" })).program_id, null);
    assert.equal((await managedOrganizationEvents(db, ORG, EMAIL)).filter((e) => e.program_id).length, 1);
    // A bad year or link is refused before anything is written.
    const before = sqlite.prepare("SELECT count(*) n FROM events").get().n;
    await assert.rejects(createManagedEvent(db, ORG, EMAIL, { title: "X", starts_at: "2027-01-01T00:00:00Z", yearly: "1", first_year: "19" }), /year-invalid/);
    await assert.rejects(createManagedEvent(db, ORG, EMAIL, { title: "X", starts_at: "2027-01-01T00:00:00Z", recap_url: "javascript:x" }), /website-invalid/);
    assert.equal(sqlite.prepare("SELECT count(*) n FROM events").get().n, before);
    assert.match((await adminOrganizationActivity(db, ORG)).at(-1).summary, /marked "2026 Adaptive Ski Day" as held every year/);
  } finally { sqlite.close(); }
});

function assets() {
  return { fetch: async (req) => {
    const path = new URL(req.url || req).pathname;
    if (path === "/index.html" || path === "/") return new Response(read("public/index.html"), { headers: { "Content-Type": "text/html" } });
    try { return new Response(readFileSync(new URL(`../public${path}`, import.meta.url))); } catch { return new Response("", { status: 404 }); }
  } };
}

test("the yearly event page has its own title, a 404 when there isn't one, and a place in the sitemap", async () => {
  const { sqlite, db } = database();
  try {
    const env = { DB: db, ENV_NAME: "production", ASSETS: assets() };
    const page = await worker.fetch(new Request("https://adaptivesportsnearme.com/events/spooky-spokes"), env, { waitUntil() {} });
    assert.equal(page.status, 200);
    const html = await page.text();
    assert.match(html, /<title>Spooky Spokes, Cincinnati, OH/);
    assert.match(html, /hosted by The Pickle Lodge/);
    const missing = await worker.fetch(new Request("https://adaptivesportsnearme.com/events/not-a-thing"), env, { waitUntil() {} });
    assert.equal(missing.status, 404);
    const map = await worker.fetch(new Request("https://adaptivesportsnearme.com/sitemap.xml"), env, { waitUntil() {} });
    const xml = await map.text();
    assert.match(xml, /\/events\/spooky-spokes</);
    assert.match(xml, new RegExp(`/organizations/${LODGE}<`));
    assert.doesNotMatch(xml, new RegExp(`/programs/${SPOKES}<`));
  } finally { sqlite.close(); }
});

// --- found in review --------------------------------------------------------------
test("only a person applying it makes a program 'checked by our team'; an organization's own edit doesn't", async (t) => {
  const { sqlite, db } = database({ seed: false });
  try {
    addOrg(sqlite);
    await updateClaimedOrganization(db, ORG, EMAIL, { sport_seasons_json: '{"skiing":["winter"]}' });
    assert.equal(sqlite.prepare("SELECT verification_status FROM programs WHERE sport_key = 'skiing'").get().verification_status, "unverified");
    await createManagedEvent(db, ORG, EMAIL, { title: "Ski Day", starts_at: "2026-02-14", yearly: "1", is_public: "1" });
    assert.equal(sqlite.prepare("SELECT verification_status FROM programs WHERE kind = 'event'").get().verification_status, "unverified");
  } finally { sqlite.close(); }
  const x = site(t);
  await x.post({ ...confirm, notes: "", sports: '{"sailing":["summer"]}', yearly: '[{"name":"Regatta Day","month":7}]' });
  await acceptAdminQueueItem(x.db, (await listAdminQueue(x.db))[0].id, "team@adaptivesportsnearme.com");
  assert.deepEqual(x.directory.prepare("SELECT DISTINCT verification_status v FROM programs").all().map((r) => r.v), ["verified"]);
});

test("the editor starts from every sport the directory lists it under, so saving never drops one; unticking all clears search", async () => {
  const { sqlite, db } = database({ seed: false });
  try {
    addOrg(sqlite, ORG, { sports_json: '["skiing","cycling","sailing"]', sport_key: "multi" });
    addProgram(sqlite, { sport_key: "skiing", sport: "Skiing", name: "Ski School" });
    const before = await organizationForClaimEmail(db, ORG, EMAIL);
    assert.deepEqual(Object.keys(JSON.parse(before.sport_seasons_json)), ["skiing", "cycling", "sailing"]);
    // Saving what was prefilled keeps all three findable.
    await updateClaimedOrganization(db, ORG, EMAIL, { sport_seasons_json: before.sport_seasons_json });
    for (const sport of ["skiing", "cycling", "sailing"]) assert.ok((await listPrograms(db, new URLSearchParams({ sport }))).items.some((p) => p.id === ORG), sport);
    // Unticking everything it can untick leaves only its own program's sport.
    await updateClaimedOrganization(db, ORG, EMAIL, { sport_seasons_json: "" });
    assert.equal(sqlite.prepare("SELECT sports_json FROM organizations WHERE id = ?").get(ORG).sports_json, '["skiing"]');
    sqlite.exec("UPDATE programs SET is_public = 0 WHERE listing = 'own'");
    await updateClaimedOrganization(db, ORG, EMAIL, { sport_seasons_json: '{"cycling":[]}' });
    await updateClaimedOrganization(db, ORG, EMAIL, { sport_seasons_json: "" });
    assert.equal(sqlite.prepare("SELECT sports_json FROM organizations WHERE id = ?").get(ORG).sports_json, null);
    // Its own sport words stay (an organization with no sports at all would have no card to show).
    assert.equal(sqlite.prepare("SELECT sport_key FROM organizations WHERE id = ?").get(ORG).sport_key, "cycling");
  } finally { sqlite.close(); }
});

test("before the migration, the editor's sports still save on the listing", async () => {
  const { sqlite, db } = beforeMigration();
  try {
    addOrg(sqlite);
    const saved = await updateClaimedOrganization(db, ORG, EMAIL, { sport_seasons_json: '{"skiing":["winter"],"sailing":["summer"]}' });
    assert.equal(saved.sports_json, '["skiing","sailing"]');
    assert.equal(saved.sport_key, "multi");
  } finally { sqlite.close(); }
});

test("a yearly event matches only itself: 'Ski Fest' isn't 'Ski Fest Junior', and one the team hid stays hidden", async () => {
  const { sqlite, db } = database({ seed: false });
  try {
    addOrg(sqlite);
    sqlite.exec(`INSERT INTO programs (id,organization_id,name,kind,slug,is_public,created_at,updated_at) VALUES ('junior','${ORG}','Ski Fest Junior','event','ski-fest-junior',1,'2026','2026'), ('hidden','${ORG}','Regatta','event','regatta',0,'2026','2026')`);
    const fest = await createManagedEvent(db, ORG, EMAIL, { title: "Ski Fest", starts_at: "2027-02-01", yearly: "1", is_public: "1" });
    assert.notEqual(fest.program_id, "junior");
    assert.equal(fest.series_slug, "ski-fest");
    const regatta = await createManagedEvent(db, ORG, EMAIL, { title: "Regatta 2027", starts_at: "2027-07-01", yearly: "1", is_public: "1" });
    assert.equal(regatta.program_id, "hidden");
    assert.equal(sqlite.prepare("SELECT is_public FROM programs WHERE id = 'hidden'").get().is_public, 0);
    // An evening start keeps its own month: 7 pm Central on Oct 31 is Nov 1 in UTC.
    const halloween = await createManagedEvent(db, ORG, EMAIL, { title: "Halloween Roll", starts_at: "2026-11-01T00:00:00Z", yearly: "1", is_public: "1" });
    assert.equal(sqlite.prepare("SELECT usual_month FROM programs WHERE id = ?").get(halloween.program_id).usual_month, 10);
  } finally { sqlite.close(); }
});

test("Apply runs once even when it's pressed twice at the same moment", async (t) => {
  const x = site(t);
  await x.post({ ...confirm, notes: "", sports: '{"skiing":["winter"],"sailing":["summer"]}', yearly: '[{"name":"Regatta Day","month":7}]' });
  const id = (await listAdminQueue(x.db))[0].id;
  const results = await Promise.all([acceptAdminQueueItem(x.db, id, "a@adaptivesportsnearme.com"), acceptAdminQueueItem(x.db, id, "b@adaptivesportsnearme.com")]);
  assert.equal(results.filter(Boolean).length, 1);
  assert.equal(x.directory.prepare("SELECT count(*) n FROM programs WHERE organization_id = ?").get(ORG).n, 3);
  assert.equal((await adminOrganizationActivity(x.db, ORG)).filter((a) => a.kind === "applied").length, 1);
});

test("a sport that rides on its organization's card isn't its own row in the program list", async () => {
  const { sqlite, db } = database({ seed: false });
  try {
    addOrg(sqlite);
    addProgram(sqlite);
    await applySports(db, { id: ORG }, [{ key: "skiing", seasons: ["winter"] }, { key: "tennis", seasons: [] }]);
    assert.deepEqual((await listActualPrograms(db, new URLSearchParams())).items.map((p) => p.name), ["Adaptive Tennis"]);
    assert.deepEqual((await listActualPrograms(db, new URLSearchParams({ organization_id: ORG }))).items.map((p) => p.name).sort(), ["Adaptive Tennis", "Skiing"]);
  } finally { sqlite.close(); }
});

test("a sport added on an organization's card joins the sports it was already listed under", async () => {
  const { sqlite, db } = database({ seed: false });
  try {
    addOrg(sqlite, ORG, { sport_key: "skiing", sports_json: '["skiing","sailing","Adaptive kayaking"]' });
    sqlite.exec(`INSERT INTO programs (id,organization_id,name,sport,sport_key,seasons_json,kind,listing,is_public,status,created_at,updated_at)
      VALUES ('pk','${ORG}','Pickleball','Pickleball','pickleball','["summer","fall"]','program','with_org',1,'active','2026','2026')`);
    const seasons = (await getOrg(db, ORG)).seasons;
    assert.deepEqual(seasons, [{ key: "skiing", seasons: [] }, { key: "sailing", seasons: [] }, { key: "pickleball", seasons: ["summer", "fall"] }]);
    const card = (await listingsSnapshot(db)).items.find((x) => x.id === ORG);
    assert.equal(card.key, "multi");
    assert.deepEqual(card.trio.sort(), ["pickleball", "sailing", "skiing"]);
  } finally { sqlite.close(); }
});
