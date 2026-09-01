#!/usr/bin/env node
/**
 * Read-only look at the keep-it-alive cron jobs on tester.
 * Never writes.
 *
 *   node clock-status.mjs
 */
import { execFileSync } from "node:child_process";
import { WORKER_DIR } from "./lib.mjs";

function d1(sql) {
  const raw = execFileSync("wrangler", [
    "d1", "execute", "asnm-db-staging", "--env", "staging", "--remote",
    "--command", sql, "--json",
  ], { cwd: WORKER_DIR, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const parsed = JSON.parse(raw);
  return parsed?.[0]?.results || parsed?.result?.[0]?.results || parsed?.results || [];
}

function n(rows) {
  return Number(rows[0]?.n ?? rows[0]?.COUNT ?? 0);
}

const pending = n(d1("SELECT COUNT(*) AS n FROM review_queue WHERE status='pending'"));
let liveN = null;
try {
  const raw = execFileSync("wrangler", [
    "d1", "execute", "asnm-db", "--remote",
    "--command", "SELECT COUNT(*) AS n FROM organizations WHERE is_public = 1 AND status = 'active'",
    "--json",
  ], { cwd: WORKER_DIR, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const parsed = JSON.parse(raw);
  const rows = parsed?.[0]?.results || [];
  liveN = n(rows);
} catch {}
const publicN = n(d1("SELECT COUNT(*) AS n FROM organizations WHERE is_public=1 AND status='active'"));
let runs = [];
try {
  runs = d1("SELECT lane, finished_at, items_processed, items_flagged FROM pipeline_runs ORDER BY finished_at DESC LIMIT 6");
} catch {
  runs = [];
}

if (liveN != null) console.log(`live public programs: ${liveN}  (locked)`);
console.log(`tester public programs: ${publicN}`);
console.log(`review pile waiting: ${pending}`);
if (runs.length) {
  console.log("last clock runs:");
  for (const r of runs) {
    console.log(`  ${r.lane || "?"}  processed ${r.items_processed ?? "?"}  flagged ${r.items_flagged ?? "?"}  ${r.finished_at || ""}`);
  }
}
console.log("live stays locked.");
