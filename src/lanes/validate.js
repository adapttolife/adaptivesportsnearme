// validate: link liveness, stale-first. Picks the least-recently-checked orgs each run
// (never-checked first), so re-check pressure follows staleness instead of id order and
// a dead site is not re-hammered every cycle. Stamps last_checked_at on every org it
// probes (success or failure) and last_ok_at on success — the pipeline's two documented
// direct writes. Failures propose status active->inactive into review_queue.

import { pendingOrgIds, proposeStmt, checkUrl } from "../lane-utils.js";

const VALIDATE_BATCH = 15;

export async function validateLane({ db }) {
  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString();
  const { results: orgs } = await db.prepare(
    `SELECT id, name, website_url FROM organizations
     WHERE website_url IS NOT NULL AND status = 'active'
       AND (last_checked_at IS NULL OR last_checked_at <= ?)
     ORDER BY (last_checked_at IS NOT NULL), last_checked_at ASC, id LIMIT ?`
  ).bind(cutoff, VALIDATE_BATCH).all();
  if (!orgs.length) return { cursor: "", processed: 0, flagged: 0, detail: "no candidates" };

  const pending = await pendingOrgIds(db, "validate", orgs.map((o) => o.id));
  const now = new Date().toISOString();
  const stmts = [];
  let flagged = 0, processed = 0, lastId = "", fatal = false;
  for (const org of orgs) {
    const check = await checkUrl(org.website_url);
    if (check.fatal) { fatal = true; break; } // budget/platform limit: record nothing false
    processed++; lastId = org.id;
    stmts.push(db.prepare(
      `INSERT INTO link_checks (organization_id, url, ok, http_status, detail, lane, checked_at)
       VALUES (?, ?, ?, ?, ?, 'validate', ?)`
    ).bind(org.id, org.website_url, check.ok ? 1 : 0, check.status, check.detail, now));
    if (check.ok) {
      stmts.push(db.prepare(`UPDATE organizations SET last_checked_at = ?, last_ok_at = ? WHERE id = ?`).bind(now, now, org.id));
    } else {
      stmts.push(db.prepare(`UPDATE organizations SET last_checked_at = ? WHERE id = ?`).bind(now, org.id));
    }
    if (!check.ok && !pending.has(org.id)) {
      flagged++;
      stmts.push(proposeStmt(db, org.id, "validate",
        { status: { from: "active", to: "inactive" } },
        { url: org.website_url, http_status: check.status, detail: check.detail, checked_at: now },
        0.9, now));
    }
  }
  if (stmts.length) await db.batch(stmts);
  return { cursor: lastId, processed, flagged, detail: fatal ? "stopped early: subrequest limit" : null };
}
