#!/usr/bin/env node
// Repair the public free-text fields on a D1 database.
//
// `description`, `cost_note` and `ages` are all rendered to an athlete, and all
// three were carrying the pipeline's own verification voice. This moves the
// memo half into internal_notes and keeps the facts, in the reader's language.
//
// Emits reviewable SQL by default and writes nothing. Pass --apply to execute.
// The repair is idempotent: repaired text no longer matches the memo patterns,
// so a second run is a no-op.
//
//   node scripts/repair-public-text.mjs --env staging
//   node scripts/repair-public-text.mjs --env staging --apply
//
// Background: docs/FIELD-CONTRACTS.md, db/migrations/0004_description_contract.sql

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { repairPublicText, checkPublicDescription } from "../src/description-contract.js";

const args = process.argv.slice(2);
const envIdx = args.indexOf("--env");
const env = envIdx >= 0 ? args[envIdx + 1] : "staging";
const apply = args.includes("--apply");

const FIELDS = ["description", "cost_note", "ages"];
const DB = { sandbox: "asnm-db-sandbox", staging: "asnm-db-staging", prod: "asnm-db" }[env];
if (!DB) {
  console.error(`unknown --env ${env} (expected sandbox|staging|prod)`);
  process.exit(2);
}

function d1(sql) {
  const out = execFileSync(
    "cfrun",
    ["wrangler", "d1", "execute", DB, "--remote", "--command", sql, "--json"],
    { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 }
  );
  return JSON.parse(out.slice(out.indexOf("[")));
}

const q = (v) => (v === null ? "NULL" : "'" + String(v).replace(/'/g, "''") + "'");

console.log(`# reading ${DB} (${env})`);
const rows =
  d1(`SELECT id, name, ${FIELDS.join(", ")} FROM organizations`)[0]?.results ?? [];
console.log(`# ${rows.length} organisations`);

const updates = [];
const report = Object.fromEntries(FIELDS.map((f) => [f, { clean: 0, kept: 0, emptied: 0 }]));
let movedChars = 0;

for (const row of rows) {
  const sets = [];
  const notes = [];
  for (const f of FIELDS) {
    const value = row[f];
    if (typeof value !== "string" || !value.trim()) continue;
    if (checkPublicDescription(value).ok) {
      report[f].clean++;
      continue;
    }
    const fixed = repairPublicText(value);
    if (!fixed.internalNotes && fixed.value === value.trim()) continue;
    sets.push(`${f} = ${q(fixed.value)}`);
    if (fixed.internalNotes) {
      notes.push(`[${f}] ${fixed.internalNotes}`);
      movedChars += fixed.internalNotes.length;
    }
    if (fixed.value) report[f].kept++;
    else report[f].emptied++;
  }
  if (!sets.length) continue;
  if (notes.length) {
    sets.push(
      `internal_notes = TRIM(COALESCE(internal_notes || ' ', '') || ${q(notes.join(" "))})`
    );
  }
  sets.push(`notes_split_at = ${q(new Date().toISOString())}`);
  updates.push(`UPDATE organizations SET ${sets.join(", ")} WHERE id = ${q(row.id)};`);
}

for (const f of FIELDS) {
  const r = report[f];
  console.log(`# ${f.padEnd(12)} already clean ${r.clean}, repaired ${r.kept}, emptied ${r.emptied}`);
}
console.log(`# characters moved to internal_notes: ${movedChars}`);
console.log(`# statements: ${updates.length}`);

if (!updates.length) {
  console.log("# nothing to do - already repaired");
  process.exit(0);
}

const file = `/tmp/repair-public-text-${env}.sql`;
fs.writeFileSync(file, updates.join("\n") + "\n");
console.log(`# SQL written to ${file}`);

if (!apply) {
  console.log("# dry run - re-run with --apply to execute");
  process.exit(0);
}

console.log(`# applying to ${DB} ...`);
execFileSync("cfrun", ["wrangler", "d1", "execute", DB, "--remote", "--file", file], {
  stdio: "inherit",
});
console.log("# done");
