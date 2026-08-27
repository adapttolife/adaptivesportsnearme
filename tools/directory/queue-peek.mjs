#!/usr/bin/env node
/**
 * Read-only picture of the tester review pile.
 *   node queue-peek.mjs
 * Writes queue-snapshot.json next to this script (gitignored)
 */
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { WORKER_DIR, ROOT } from "./lib.mjs";

function d1(sql) {
  const raw = execFileSync("wrangler", [
    "d1", "execute", "asnm-db-staging", "--env", "staging", "--remote",
    "--command", sql, "--json",
  ], { cwd: WORKER_DIR, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const parsed = JSON.parse(raw);
  return parsed?.[0]?.results || parsed?.result?.[0]?.results || parsed?.results || [];
}

function parse(j) {
  if (!j) return {};
  if (typeof j === "object") return j;
  try { return JSON.parse(j); } catch { return {}; }
}

const counts = d1("SELECT lane, COUNT(*) AS n FROM review_queue WHERE status='pending' GROUP BY lane ORDER BY n DESC");
const rows = d1("SELECT item_id, organization_id, lane, proposed_change, evidence, confidence, created_at FROM review_queue WHERE status='pending'");

const validate = { timeout: 0, http404: 0, other: 0 };
const resolve = { domain: 0, name: 0, fuzzy: 0, other: 0 };
const enrichConf = { high: 0, mid: 0, low: 0 };

for (const r of rows) {
  const ev = parse(r.evidence);
  const ch = parse(r.proposed_change);
  if (r.lane === "validate") {
    const detail = String(ev.detail || ev.error || "");
    const status = ev.http_status;
    if (/timeout|aborted|abort/i.test(detail)) validate.timeout++;
    else if (status === 404 || status === 410) validate.http404++;
    else validate.other++;
  }
  if (r.lane === "resolve") {
    const tier = ev.tier || ev.method || "";
    if (tier === "domain" || /domain/.test(tier)) resolve.domain++;
    else if (tier === "name" || /name/.test(tier)) resolve.name++;
    else if (tier === "fuzzy" || /fuzzy|token/.test(tier)) resolve.fuzzy++;
    else resolve.other++;
  }
  if (r.lane === "enrich") {
    if (r.confidence >= 0.8) enrichConf.high++;
    else if (r.confidence >= 0.7) enrichConf.mid++;
    else enrichConf.low++;
  }
}

const snapshot = {
  when: new Date().toISOString(),
  pending: rows.length,
  by_lane: Object.fromEntries(counts.map((c) => [c.lane, c.n])),
  validate,
  resolve,
  enrich_confidence: enrichConf,
  note: "Read-only. Live stays locked. Timeouts are not dead sites.",
};
writeFileSync(`${ROOT}/queue-snapshot.json`, JSON.stringify(snapshot, null, 2) + "\n");

console.log(`review pile: ${rows.length} waiting`);
for (const c of counts) console.log(`  ${c.lane}: ${c.n}`);
console.log("validate split:", validate);
console.log("twins split:", resolve);
console.log("contact fills by confidence:", enrichConf);
console.log("wrote queue-snapshot.json (local, not committed)");
console.log("timeouts are not dead. live stays locked.");
