// db/maintenance/duplicates_finish.sql deletes, folds and renames rows in production (docs/data-fixes/duplicates-finish.md),
// so its safety rules are pinned here, and the file itself runs on a small database seeded with real rows from it.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { statements as split } from "../scripts/lib/sql-statements.mjs";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const finish = read("db/maintenance/duplicates_finish.sql");
const report = read("db/maintenance/duplicates_report.sql");
// Statements without comments or the trailing ";", split the way D1 reads them (quotes and comments respected).
const statements = (sql) => split(sql).map((s) => s.replace(/^(\s*--[^\n]*\n)+/, "").replace(/;$/, "").trim()).filter((s) => s && !/^--/.test(s));
const csvRows = (p) => read(p).trim().split("\n").slice(1).map((line) => line.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((c) => c.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"')));
const s = statements(finish);
const PH = "a461f29b-0b89-4e17-b879-6a80e0abd101";
const ID = "'([0-9a-f-]{36})'";
const MAP = "finish_fold_map";

test("a row is deleted only through a guard, and no program is ever deleted", () => {
  const menu = new RegExp(`^DELETE FROM organizations WHERE id = ${ID} AND website_url = '[^']*' AND NOT EXISTS \\(SELECT 1 FROM programs WHERE organization_id = '\\1'\\)$`);
  const place = new RegExp(`^DELETE FROM organizations WHERE id = ${ID} AND EXISTS \\(SELECT 1 FROM programs WHERE id = '\\1' AND organization_id = ${ID}\\)$`);
  const orgDeletes = s.filter((x) => x.startsWith("DELETE FROM organizations"));
  for (const x of orgDeletes) assert.ok(menu.test(x) || place.test(x) || x === `DELETE FROM organizations WHERE id IN (SELECT remove_id FROM ${MAP})`, x.slice(0, 120));
  assert.equal(orgDeletes.filter((x) => x.includes(MAP)).length, 1, "folded rows go in one statement, through the guarded map");
  assert.equal(s.filter((x) => /^DELETE FROM programs\b/.test(x)).length, 0);
  // Link checks and review items are deleted only for a menu page that is still that page.
  for (const x of s.filter((x) => /^DELETE FROM (link_checks|review_queue)\b/.test(x))) {
    assert.match(x, new RegExp(`WHERE organization_id = ${ID} AND EXISTS \\(SELECT 1 FROM organizations WHERE id = '\\1' AND website_url = '[^']*'\\)$`), x.slice(0, 120));
  }
  for (const x of s.filter((x) => /^DELETE FROM organization_data_sources\b/.test(x))) {
    const ok = /AND EXISTS \(SELECT 1 FROM organizations WHERE id = '[0-9a-f-]{36}' AND website_url = '[^']*'\)$/.test(x) // a menu page
      || x.includes(MAP) // a source the kept row already has, while folding
      || new RegExp(`^DELETE FROM organization_data_sources WHERE organization_id = ${ID} AND source_id IN \\(SELECT source_id FROM organization_data_sources WHERE organization_id = ${ID}\\)$`).test(x); // the same, for a place
    assert.ok(ok, x.slice(0, 120));
  }
});

test("schema changes are only the helper table: made, guarded, dropped last", () => {
  assert.deepEqual(s.filter((x) => /^(CREATE|DROP|ALTER)\b/.test(x)), [`CREATE TABLE ${MAP} (keep_id TEXT NOT NULL, remove_id TEXT PRIMARY KEY)`, `DROP TABLE ${MAP}`]);
  const insert = s.findIndex((x) => x.startsWith(`INSERT INTO ${MAP}`));
  assert.equal(s[insert + 1], `DELETE FROM ${MAP} WHERE keep_id NOT IN (SELECT id FROM organizations)`, "a pair whose kept row is gone is skipped");
  const pairs = [...s[insert].matchAll(/\('([0-9a-f-]{36})', '([0-9a-f-]{36})'\)/g)].map((m) => [m[1], m[2]]);
  const keep = new Set(pairs.map(([k]) => k)), remove = pairs.map(([, r]) => r);
  assert.equal(new Set(remove).size, remove.length, "a row folds into two kept rows");
  for (const r of remove) assert.ok(!keep.has(r), `kept row ${r} is also folded away`);
});

test("every program it makes names its parent and goes in only if the parent is there", () => {
  const inserts = s.filter((x) => x.startsWith("INSERT OR IGNORE INTO programs"));
  assert.ok(inserts.length > 200, `${inserts.length} programs`);
  const ids = new Set();
  for (const x of inserts) {
    const m = x.match(new RegExp(`SELECT ${ID}, ${ID}, '(?:[^']|'')+', .* FROM organizations WHERE id = ${ID} AND EXISTS \\(SELECT 1 FROM organizations WHERE id = ${ID}\\)$`, "s"));
    assert.ok(m, x.slice(0, 160));
    assert.equal(m[2], m[4], "the program's parent is the row the guard checks");
    assert.ok(!ids.has(m[1]), `program ${m[1]} made twice`);
    ids.add(m[1]);
  }
  // A place row becomes a program with its own id, so its link checks follow it; it goes only once that program is in.
  const removed = s.map((x) => x.match(new RegExp(`^DELETE FROM organizations WHERE id = ${ID} AND EXISTS \\(SELECT 1 FROM programs WHERE id = '\\1'`))).filter(Boolean).map((m) => m[1]);
  for (const r of removed) assert.ok(ids.has(r), `${r} is deleted but never becomes a program`);
});

test("every update checks the row first", () => {
  for (const x of s.filter((x) => /^UPDATE\b/.test(x))) {
    const ok = /AND EXISTS \(SELECT 1 FROM organizations WHERE id = '[0-9a-f-]{36}'\)$/.test(x) // moves onto a kept row, and attachments
      || new RegExp(`WHERE \\w+ IN \\(SELECT remove_id FROM ${MAP}\\)$`).test(x) // moves while folding
      || new RegExp(`^UPDATE organizations SET .* WHERE (COALESCE\\(\\w+, ''\\) = ''|sport_key IS NULL) AND id IN \\(SELECT m\\.keep_id FROM ${MAP} m `, "s").test(x) // blanks filled while folding
      || new RegExp(`^UPDATE organizations SET (\\w+) = .* WHERE id = ${ID} AND \\1 (IS|=) .*$`, "s").test(x) // names, web addresses, descriptions
      || new RegExp(`^UPDATE programs SET name = '(?:[^']|'')+' WHERE id = ${ID} AND name = '(?:[^']|'')+'$`).test(x); // programs that shared a name
    assert.ok(ok, x.slice(0, 160));
  }
  for (const x of s.filter((x) => /^UPDATE programs SET organization_id = '[^']+' WHERE id = /.test(x))) assert.match(x, new RegExp(`AND organization_id = '${PH}' AND EXISTS`), "only a waiting program is attached");
});

test("the list names every row the file deletes, folds, makes, attaches or renames", () => {
  const listed = new Set(csvRows("docs/data-fixes/duplicates-finish.csv").map((r) => r[2]));
  const touched = [
    ...s.flatMap((x) => [...x.matchAll(new RegExp(`^DELETE FROM organizations WHERE id = ${ID}`, "g"))].map((m) => m[1])),
    ...[...s.find((x) => x.startsWith(`INSERT INTO ${MAP}`)).matchAll(/\('[0-9a-f-]{36}', '([0-9a-f-]{36})'\)/g)].map((m) => m[1]),
    ...s.map((x) => x.match(new RegExp(`^INSERT OR IGNORE INTO programs .*? SELECT ${ID}`, "s"))).filter(Boolean).map((m) => m[1]),
    ...s.map((x) => x.match(new RegExp(`^UPDATE programs SET (?:name|organization_id) = '(?:[^']|'')+' WHERE id = ${ID}`))).filter(Boolean).map((m) => m[1]),
  ];
  assert.ok(touched.length > 400, `${touched.length} rows`);
  for (const id of touched) assert.ok(listed.has(id), `${id} is changed but not in duplicates-finish.csv`);
});

test("the report only reads", () => {
  const r = statements(report);
  assert.equal(r.length, 1);
  assert.match(r[0], /^SELECT\b/);
  assert.doesNotMatch(r[0], /\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b/);
});

test("on real rows: Achilles becomes one organization with its chapters, a menu page goes, and a second run changes nothing", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(read("db/schema.sql"));
  db.exec("PRAGMA foreign_keys = ON");
  db.prepare("INSERT INTO data_sources (source_id, source_name) VALUES ('club-finder', 'US Paralympics Club Finder')").run();
  const org = db.prepare("INSERT INTO organizations (id, name, city, state, website_url, lat, lng, geo_precision, primary_data_source, is_public, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'state', ?, 1, 'active', '2026-06-10T05:06:05Z', '2026-06-10T05:06:05Z')");
  const link = db.prepare("INSERT INTO organization_data_sources (organization_id, source_id) VALUES (?, 'club-finder')");
  const rows = [
    ["bf59cd3d-c859-45a7-8e14-2ebb835f8df4", "Achilles International", null, "NY", "http://www.achillesinternational.org/", 42.95, -75.53, "CAF Directory"],
    ["c445482e-e416-4f08-ba5e-5b05b4cfd0cc", "Achilles International", "Washington", "DC", null, 38.91, -77.02, "US Paralympics Club Finder"],
    ["25dd9849-efb9-4581-bb32-21420ad6e414", "Achilles International", null, "AZ", null, 34.27, -111.66, "US Paralympics Club Finder"],
    ["0148561d-fa94-4380-934a-523b4930b3a5", "Achilles International", null, "TN", null, 35.86, -86.35, "US Paralympics Club Finder"],
    ["a75e16dc-92f2-4727-9e9a-a431d1235ec1", "Achilles Chicago", null, null, null, null, null, "Achilles International"],
    ["e3be9cdd-7a60-41b1-a0f2-49af1b8c744a", "Our Board", null, null, "/about/#staff", null, null, "CAF Directory"],
  ];
  for (const r of rows) { org.run(...r); link.run(r[0]); }
  db.prepare("INSERT INTO link_checks (organization_id, url, ok, checked_at) VALUES ('e3be9cdd-7a60-41b1-a0f2-49af1b8c744a', '/about/#staff', 0, '2026-10-01')").run();
  db.prepare("INSERT INTO link_checks (organization_id, url, ok, checked_at) VALUES ('c445482e-e416-4f08-ba5e-5b05b4cfd0cc', 'https://www.achillesinternational.org/', 1, '2026-10-01')").run();

  db.exec(finish);
  assert.deepEqual(db.prepare("SELECT id FROM organizations").all().map((r) => r.id), ["bf59cd3d-c859-45a7-8e14-2ebb835f8df4"], "one Achilles International, the menu page gone");
  const programs = Object.fromEntries(db.prepare("SELECT id, name, city, state, website_url, sport_key FROM programs WHERE organization_id = 'bf59cd3d-c859-45a7-8e14-2ebb835f8df4'").all().map((p) => [p.name, p]));
  assert.deepEqual(Object.keys(programs).sort(), ["Achilles Greater Phoenix", "Achilles Long Island", "Achilles NYC", "Achilles Tucson", "Achilles Washington D.C.", "Achilles Westchester"]);
  assert.equal(programs["Achilles NYC"].website_url, "https://www.achillesinternational.org/nyc");
  assert.equal(programs["Achilles NYC"].city, "New York");
  assert.equal(programs["Achilles Washington D.C."].id, "c445482e-e416-4f08-ba5e-5b05b4cfd0cc", "a place keeps its old id as a program");
  assert.deepEqual([programs["Achilles Tucson"].city, programs["Achilles Tucson"].state, programs["Achilles Tucson"].sport_key], ["Tucson", "AZ", "running"]);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM organization_data_sources").get().n, 1, "five links to one source become one");
  assert.deepEqual(db.prepare("SELECT organization_id FROM link_checks").all().map((r) => r.organization_id), ["c445482e-e416-4f08-ba5e-5b05b4cfd0cc"], "the menu page's check goes, the chapter's follows its program");
  assert.deepEqual(db.prepare(report.replace(/^--.*$/gm, "")).all(), [], "the report comes back empty");

  const dump = () => ["organizations", "programs", "organization_data_sources", "link_checks"].map((t) => db.prepare(`SELECT * FROM ${t} ORDER BY 1, 2`).all());
  const before = JSON.stringify(dump());
  db.exec(finish);
  assert.equal(JSON.stringify(dump()), before, "a second run changes nothing");
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name = 'finish_fold_map'").get().n, 0);
});
