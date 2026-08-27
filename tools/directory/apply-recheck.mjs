#!/usr/bin/env node
/**
 * Hide listings the last recheck still found as 404. Tester only.
 *   node apply-recheck.mjs
 *   node apply-recheck.mjs --apply
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { ROOT, WORKER_DIR, AUDIT_DIR, sqlQuote, isNeverTouch, LIVE_DB } from "./lib.mjs";

const apply = process.argv.includes("--apply");
const path = `${ROOT}/recheck-validate.json`;
const report = JSON.parse(readFileSync(path, "utf8"));
const hide = (report.buckets?.["404"] || []).filter((i) => !isNeverTouch(i.id));
const reject = [...(report.buckets?.["200"] || []), ...(report.buckets?.timeout || [])];
const now = new Date().toISOString();

const lines = [
  "-- ASNM STAGING ONLY — hide still-404 listings from last recheck",
  "-- DO NOT run against asnm-db / production",
  `-- Generated: ${now}`,
  "",
];
if (hide.length) {
  lines.push("UPDATE organizations SET status='inactive', is_public=0, updated_at=" + sqlQuote(now));
  lines.push("WHERE id IN (");
  lines.push("  " + hide.map((i) => sqlQuote(i.id)).join(",\n  "));
  lines.push(");");
  lines.push("");
  const ids = hide.map((i) => i.item_id).filter(Boolean).join(", ");
  if (ids) {
    lines.push(`UPDATE review_queue SET status='approved', resolved_at=${sqlQuote(now)}, resolved_by='asnm-apply-recheck'`);
    lines.push(`WHERE item_id IN (${ids}) AND status='pending';`);
    lines.push("");
  }
}
if (reject.length) {
  const ids = reject.map((i) => i.item_id).filter(Boolean).join(", ");
  if (ids) {
    lines.push("-- up or timeout: not dead");
    lines.push(`UPDATE review_queue SET status='rejected', resolved_at=${sqlQuote(now)}, resolved_by='asnm-apply-recheck'`);
    lines.push(`WHERE item_id IN (${ids}) AND status='pending';`);
    lines.push("");
  }
}
const sql = lines.join("\n");
mkdirSync(AUDIT_DIR, { recursive: true });
const sqlPath = `${AUDIT_DIR}/apply-recheck.sql`;
writeFileSync(sqlPath, sql);
console.log(`would hide ${hide.length} still-404 listings on tester`);
console.log(`would drop ${reject.length} up/timeout items from the pile`);
console.log(sqlPath);

if (sql.toUpperCase().includes("ASNM-DB") && !sql.includes("DO NOT run against asnm-db")) {
  console.error("apply-recheck: refusing SQL that names live asnm-db as a target");
  process.exit(1);
}
if (!apply) {
  console.log("dry-run. pass --apply to write tester. live stays locked.");
  process.exit(0);
}
// LIVE LOCK: this path writes asnm-db-staging only. Public live count must stay 1544.
if (LIVE_DB === "asnm-db-staging") {
  console.error("apply-recheck: live/staging names collided — refuse");
  process.exit(1);
}
execFileSync("wrangler", [
  "d1", "execute", "asnm-db-staging", "--env", "staging", "--remote",
  "--file", sqlPath,
], { cwd: WORKER_DIR, stdio: "inherit" });
console.log("tester updated. live stays locked.");
