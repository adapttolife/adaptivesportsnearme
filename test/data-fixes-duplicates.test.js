// The production duplicate scripts (docs/data-fixes/duplicates-and-tables.md) delete and move rows, so their
// safety rules are pinned here: an edit that drops a guard or folds a kept row away fails before anyone runs it.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const one = read("db/maintenance/duplicates_1_merge_now.sql");
const two = read("db/maintenance/duplicates_2_places_become_programs.sql");
const counts = read("db/maintenance/duplicates_check_counts.sql");
const csvRows = (p) => read(p).trim().split("\n").slice(1).map((line) => line.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((c) => c.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"')));
const statements = (sql) => sql.replace(/--.*$/gm, "").split(";").map((s) => s.trim()).filter(Boolean);

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
  assert.match(two, /RUN ONLY AFTER the directory lists programs/);
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
