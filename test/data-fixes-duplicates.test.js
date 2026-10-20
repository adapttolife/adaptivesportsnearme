// The production duplicate scripts (docs/data-fixes/duplicates-and-tables.md) delete and move rows, so their
// safety rules are pinned here: an edit that drops a guard or folds a kept row away fails before anyone runs it.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const one = read("db/maintenance/duplicates_1_merge_now.sql");
const two = read("db/maintenance/duplicates_2_places_become_programs.sql");
const counts = read("db/maintenance/duplicates_check_counts.sql");
const csvRows = (p) => read(p).trim().split("\n").slice(1).map((line) => line.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((c) => c.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"')));
import { statements as split } from "../scripts/lib/sql-statements.mjs";
// Statements without comments or the trailing ";", split the way D1 reads them (quotes and comments respected).
const statements = (sql) => split(sql).map((s) => s.replace(/^(\s*--[^\n]*\n)+/, "").replace(/;$/, "").trim()).filter((s) => s && !/^--/.test(s));

test("list 1: every duplicate folds into one kept row, and no kept row is ever folded away", () => {
  const pairs = [...one.matchAll(/\('([0-9a-f-]{36})', '([0-9a-f-]{36})'\)/g)].map((m) => [m[1], m[2]]);
  const keep = new Set(pairs.map(([k]) => k)), remove = pairs.map(([, r]) => r);
  assert.equal(pairs.length, 75);
  assert.equal(keep.size, 71);
  assert.equal(new Set(remove).size, remove.length, "a row folds into two kept rows");
  for (const r of remove) assert.ok(!keep.has(r), `kept row ${r} is also folded away`);
  const rows = csvRows("docs/data-fixes/duplicates-1-merge-now.csv");
  assert.deepEqual(new Set(rows.filter((r) => r[1] === "keep").map((r) => r[2])), keep, "the list's kept rows match the script");
  assert.deepEqual(new Set(rows.filter((r) => r[1] === "fold in").map((r) => r[2])), new Set(remove), "the list's folded rows match the script");
});

test("list 1: a pair whose kept row is gone is skipped, and the helper table goes", () => {
  const s = statements(one);
  const insert = s.findIndex((x) => x.startsWith("INSERT INTO merge_map_20261018"));
  assert.equal(s[insert + 1], "DELETE FROM merge_map_20261018 WHERE keep_id NOT IN (SELECT id FROM organizations)", "the guard runs right after the pairs go in");
  assert.equal(s.at(-1), "DROP TABLE merge_map_20261018");
  assert.equal(s.at(-2), "DELETE FROM organizations WHERE id IN (SELECT remove_id FROM merge_map_20261018)", "rows are deleted last, only through the guarded map");
  for (const x of s) assert.doesNotMatch(x, /^(DROP|ALTER)\b(?! TABLE merge_map_20261018$)/, `unexpected schema change: ${x.slice(0, 60)}`);
});

test("list 2: an organization row goes only once its program copy is in, and nothing moves onto a missing row", () => {
  assert.match(two, /RUN ONLY ONCE the live site lists programs/);
  const s = statements(two);
  const deletes = s.filter((x) => x.startsWith("DELETE FROM organizations"));
  const inserts = s.filter((x) => /^INSERT\b/.test(x));
  assert.ok(deletes.length >= 52 && inserts.length === 80, `${deletes.length} deletes, ${inserts.length} inserts`);
  for (const d of deletes) assert.match(d, /^DELETE FROM organizations WHERE id = '[^']+' AND EXISTS \(SELECT 1 FROM (programs|organizations) WHERE id = /, d.slice(0, 90));
  for (const i of inserts) assert.match(i, /^INSERT OR IGNORE INTO programs .* AND EXISTS \(SELECT 1 FROM organizations WHERE id = '[^']+'\)$/s, i.slice(0, 90));
  for (const u of s.filter((x) => /^UPDATE (organization_data_sources|programs|events|link_checks|review_queue) /.test(x))) {
    assert.match(u, /AND EXISTS \(SELECT 1 FROM organizations WHERE id = '[^']+'\)$/, u.slice(0, 90));
  }
  const listed = csvRows("docs/data-fixes/duplicates-2-places-become-programs.csv").filter((r) => r[1] === "program");
  assert.equal(listed.length, inserts.length, "the list names every program the script makes");
});

test("the count check only reads", () => {
  for (const x of statements(counts)) assert.match(x, /^SELECT\b/, x.slice(0, 60));
});

// The staging import (step 2) ran on 2026-10-18; its file was removed afterwards because it
// carried private contact columns. test/no-contact-in-data-files.test.js keeps it that way.

test("list 3's mechanical part guards every delete, insert and move", () => {
  const s = statements(read("db/maintenance/duplicates_3_mechanical.sql"));
  assert.match(read("db/maintenance/duplicates_3_mechanical.sql"), /only once the live site lists programs/);
  for (const d of s.filter((x) => x.startsWith("DELETE FROM organizations "))) assert.match(d, /AND EXISTS \(SELECT 1 FROM (programs|organizations) WHERE id = /, d.slice(0, 90));
  for (const i of s.filter((x) => /^INSERT\b/.test(x))) assert.match(i, /^INSERT OR IGNORE INTO programs .* AND EXISTS \(SELECT 1 FROM organizations WHERE id = '[^']+'\)$/s);
  for (const u of s.filter((x) => /^UPDATE\b/.test(x) && !x.startsWith("UPDATE organizations SET description"))) {
    assert.match(u, /AND EXISTS \(SELECT 1 FROM organizations WHERE id = '[^']+'\)$/, u.slice(0, 90));
  }
});

test("the staging rebuild's replace file drops children first, loads parents first, and survives comments and quotes", async () => {
  const { spawnSync } = await import("node:child_process");
  const { mkdtempSync, writeFileSync } = await import("node:fs");
  const { DatabaseSync } = await import("node:sqlite");
  const dir = mkdtempSync(join(tmpdir(), "d1-replace-"));
  // A dump in the order D1 can produce: the child table first, a comment with an apostrophe, a ; inside a value.
  writeFileSync(`${dir}/dump.sql`, [
    "PRAGMA defer_foreign_keys=TRUE;",
    "CREATE TABLE child (id TEXT PRIMARY KEY, parent_id TEXT REFERENCES parent(id)); -- the child's row",
    "INSERT INTO \"child\" VALUES('c1','p1');",
    "CREATE TABLE parent (id TEXT PRIMARY KEY, note TEXT -- it's the parent",
    ");",
    "INSERT INTO \"parent\" VALUES('p1','semi;colon and ''quotes''');",
    "CREATE INDEX child_parent ON child (parent_id);",
  ].join("\n"));
  writeFileSync(`${dir}/target.sql`, "CREATE TABLE parent (id TEXT PRIMARY KEY);\nCREATE TABLE child (id TEXT PRIMARY KEY, parent_id TEXT REFERENCES parent(id));\n");
  const run = spawnSync(process.execPath, ["scripts/lib/d1-replace-file.mjs", `${dir}/dump.sql`, `${dir}/out.sql`, "parent child", "-", `${dir}/target.sql`], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const out = (await import("node:fs")).readFileSync(`${dir}/out.sql`, "utf8");
  assert.ok(out.indexOf('DROP TABLE IF EXISTS "child"') < out.indexOf('DROP TABLE IF EXISTS "parent"'), "children are dropped first");
  assert.ok(out.indexOf('INSERT INTO "parent"') < out.indexOf('INSERT INTO "child"'), "parents' rows go in first");
  // The target as it is now, then the file, every statement checked on its own with foreign keys on.
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON; CREATE TABLE parent (id TEXT PRIMARY KEY); CREATE TABLE child (id TEXT PRIMARY KEY, parent_id TEXT REFERENCES parent(id)); INSERT INTO parent VALUES ('old'); INSERT INTO child VALUES ('x', 'old');");
  for (const st of statements(out.replace("PRAGMA defer_foreign_keys = true;", ""))) db.exec(st);
  assert.equal(db.prepare("SELECT note FROM parent").get().note, "semi;colon and 'quotes'");
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM child").get().n, 1);
  writeFileSync(`${dir}/empty.sql`, "PRAGMA defer_foreign_keys=TRUE;\n");
  const refuse = spawnSync(process.execPath, ["scripts/lib/d1-replace-file.mjs", `${dir}/empty.sql`, `${dir}/x.sql`, "parent"], { encoding: "utf8" });
  assert.equal(refuse.status, 3, "a dump with no tables never becomes a file that only drops");
});

test("the staging rebuild refuses to touch production", async (t) => {
  const { spawnSync } = await import("node:child_process");
  for (const target of ["asnm-db"]) {
    const r = spawnSync("bash", ["scripts/rebuild-staging-from-production.sh", "--fire"], { encoding: "utf8", env: { ...process.env, TARGET_DB: target, WRANGLER: "false" } });
    if (r.error || /Bash\/Service\/CreateInstance\/E_ACCESS/.test(`${r.stdout || ""}${r.stderr || ""}`.replaceAll(String.fromCharCode(0), ""))) {
      t.skip("Bash is unavailable in this Windows workspace");
      return;
    }
    assert.equal(r.status, 2);
    assert.match(r.stderr, /Refusing: the target would be asnm-db/);
  }
});
