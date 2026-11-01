// Build ONE file that replaces a D1 database's tables with a dump's, for a single import.
// D1 runs an imported file all or nothing (checked 2026-10-18: a failing statement rolls back
// everything before it), so the target is either fully replaced or left exactly as it was.
// The dump's statements are reordered: every table is created before any row goes in, because
// D1 checks a foreign key's table exists when a row is inserted, and a dump lists tables in the
// order they were created, which is not always parent first.
// Foreign keys are honoured in order, not by deferral (a large D1 import checks as it goes): tables
// the target holds are dropped children first, and rows go in parents first.
//   node d1-replace-file.mjs <dump.sql> <out.sql> <tables to drop> [extra.sql|-] [target-schema.sql]
import { readFileSync, writeFileSync } from "node:fs";
import { statements } from "./sql-statements.mjs";
const [dumpPath, outPath, dropList = "", extraArg, targetSchemaPath] =
  process.argv.slice(2);
const extraPath = extraArg && extraArg !== "-" ? extraArg : null;
const dump = statements(readFileSync(dumpPath, "utf8"));
const lead = (s) =>
  s
    .replace(/^(\s*--[^\n]*\n)+/, "")
    .replace(/^\s*\/\*[\s\S]*?\*\/\s*/, "")
    .trim();
const kind0 = (s) =>
  /^PRAGMA\b/i.test(s)
    ? "skip"
    : /^CREATE\s+TABLE\b/i.test(s)
      ? "table"
      : /^INSERT\b/i.test(s)
        ? "row"
        : /^CREATE\s+(UNIQUE\s+)?INDEX\b|^CREATE\s+(TRIGGER|VIEW)\b/i.test(s)
          ? "after"
          : /^DELETE FROM sqlite_sequence|^INSERT INTO sqlite_sequence/i.test(s)
            ? "row"
            : "other";
const kind = (s) => kind0(lead(s));
const groups = { table: [], row: [], after: [], other: [] };
for (const s of dump) {
  const k = kind(s);
  if (k !== "skip") groups[k].push(s);
}
if (!groups.table.length) {
  console.error(
    "The dump has no tables: refusing to write a file that would only drop.",
  );
  process.exit(3);
}
// Which tables each table points at (REFERENCES), from a dump's CREATE TABLE statements.
const refsOf = (stmts) => {
  const m = new Map();
  for (const st of stmts) {
    const t =
      /^CREATE\s+TABLE\s+(?:IF NOT EXISTS\s+)?"?([A-Za-z_][\w]*)"?/i.exec(
        lead(st),
      );
    if (t)
      m.set(
        t[1],
        new Set(
          [...lead(st).matchAll(/REFERENCES\s+"?([A-Za-z_][\w]*)"?/gi)]
            .map((x) => x[1])
            .filter((r) => r !== t[1]),
        ),
      );
  }
  return m;
};
// Parents first: a table comes after every table it points at.
function parentsFirst(names, refs) {
  const out = [],
    seen = new Set(),
    visiting = new Set();
  const visit = (n) => {
    if (seen.has(n) || visiting.has(n)) return;
    visiting.add(n);
    for (const r of refs.get(n) || []) if (names.includes(r)) visit(r);
    visiting.delete(n);
    seen.add(n);
    out.push(n);
  };
  for (const n of names) visit(n);
  return out;
}
const dropNames = dropList
  .split(/\s+/)
  .filter(Boolean)
  .map((t) => t.replace(/"/g, ""));
const targetRefs = targetSchemaPath
  ? refsOf(statements(readFileSync(targetSchemaPath, "utf8")))
  : new Map();
const drops = parentsFirst(dropNames, targetRefs)
  .reverse()
  .map((t) => `DROP TABLE IF EXISTS "${t}";`); // children first
const sourceRefs = refsOf(groups.table);
const tableOf = (st) =>
  (/^INSERT\s+INTO\s+"?([A-Za-z_][\w]*)"?/i.exec(lead(st)) || [])[1] || "";
const insertOrder = parentsFirst([...sourceRefs.keys()], sourceRefs);
const rank = new Map(insertOrder.map((t, i) => [t, i]));
groups.row.sort(
  (a, b) => (rank.get(tableOf(a)) ?? 1e9) - (rank.get(tableOf(b)) ?? 1e9),
); // stable: keeps each table's own order
const extra = extraPath
  ? statements(readFileSync(extraPath, "utf8"))
      .filter((s) => kind(s) !== "skip")
      .map((s) =>
        s
          .replace(
            /^CREATE\s+TABLE\s+(?!IF NOT EXISTS)/i,
            "CREATE TABLE IF NOT EXISTS ",
          )
          .replace(
            /^CREATE\s+(UNIQUE\s+)?INDEX\s+(?!IF NOT EXISTS)/i,
            (m, u) => `CREATE ${u || ""}INDEX IF NOT EXISTS `,
          ),
      )
  : [];
const body = [
  "PRAGMA defer_foreign_keys = true;",
  ...drops,
  ...groups.table,
  ...groups.other,
  ...groups.row,
  ...groups.after,
  ...extra,
];
writeFileSync(outPath, body.join("\n") + "\n");
console.log(
  `${groups.table.length} tables, ${groups.row.length} rows, ${groups.after.length} indexes, ${drops.length} dropped first, ${extra.length} extra`,
);
