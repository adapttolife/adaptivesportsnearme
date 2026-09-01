#!/usr/bin/env node
// Repair the description/internal_notes split on a D1 database.
//
// Emits reviewable SQL by default and writes nothing. Pass --apply to execute
// it through wrangler. The repair is idempotent: running it twice is a no-op,
// because repaired copy no longer matches the memo patterns.
//
//   node scripts/repair-descriptions.mjs --env staging            # dry run + report
//   node scripts/repair-descriptions.mjs --env staging --apply    # write
//
// Background: db/migrations/0004_description_contract.sql

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { splitPublicDescription, checkPublicDescription } from "../src/description-contract.js";

const args = process.argv.slice(2);
const envIdx = args.indexOf("--env");
const env = envIdx >= 0 ? args[envIdx + 1] : "staging";
const apply = args.includes("--apply");

const DB = { sandbox: "asnm-db-sandbox", staging: "asnm-db-staging", prod: "asnm-db" }[env];
if (!DB) {
  console.error(`unknown --env ${env} (expected sandbox|staging|prod)`);
  process.exit(2);
}

function d1(sql, { json = true } = {}) {
  const out = execFileSync(
    "cfrun",
    ["wrangler", "d1", "execute", DB, "--remote", "--command", sql, ...(json ? ["--json"] : [])],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  );
  return json ? JSON.parse(out.slice(out.indexOf("["))) : out;
}

const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";

console.log(`# reading ${DB} (${env})`);
const res = d1(
  `SELECT id, name, description FROM organizations
   WHERE description IS NOT NULL AND TRIM(description) <> ''`
);
const rows = res[0]?.results ?? [];
console.log(`# ${rows.length} rows with a description`);

const updates = [];
const report = { clean: 0, repaired: 0, emptied: 0, movedChars: 0 };

for (const r of rows) {
  if (checkPublicDescription(r.description).ok) {
    report.clean++;
    continue;
  }
  const out = splitPublicDescription(r.description);
  if (!out.internalNotes) continue;
  report.movedChars += out.internalNotes.length;
  if (out.description) report.repaired++;
  else report.emptied++;
  updates.push(
    `UPDATE organizations SET description = ${out.description ? q(out.description) : "NULL"}, ` +
      `internal_notes = TRIM(COALESCE(internal_notes || ' ', '') || ${q(out.internalNotes)}), ` +
      `notes_split_at = ${q(new Date().toISOString())} WHERE id = ${q(r.id)};`
  );
}

console.log(
  `# already clean: ${report.clean}\n` +
  `# repaired (copy kept, memo moved): ${report.repaired}\n` +
  `# emptied (was all memo): ${report.emptied}\n` +
  `# characters moved to internal_notes: ${report.movedChars}\n` +
  `# statements: ${updates.length}`
);

if (!updates.length) {
  console.log("# nothing to do — already repaired");
  process.exit(0);
}

const file = `/tmp/repair-descriptions-${env}.sql`;
fs.writeFileSync(file, updates.join("\n") + "\n");
console.log(`# SQL written to ${file}`);

if (!apply) {
  console.log("# dry run — re-run with --apply to execute");
  process.exit(0);
}

console.log(`# applying to ${DB} …`);
execFileSync("cfrun", ["wrangler", "d1", "execute", DB, "--remote", "--file", file], {
  stdio: "inherit",
});
console.log("# done");
