// Admin surface — the human half of the review-queue invariant.
// Auth: Authorization: Bearer <ADMIN_KEY> (Worker secret). No key set -> admin disabled.

import { runLane } from "./pipeline.js";
import { json } from "./http.js";

// Only these organization fields may be changed by an approved review item.
const APPLY_WHITELIST = new Set([
  "email", "phone", "city", "state", "state_name", "zip", "website_url",
  "status", "description", "cost_note", "ages", "equipment_provided",
  "sport", "sport_key", "lat", "lng", "geo_precision",
]);

export function adminAuthed(request, env) {
  if (!env.ADMIN_KEY) return false;
  const h = request.headers.get("Authorization") || "";
  return h === `Bearer ${env.ADMIN_KEY}`;
}

export async function handleAdmin(request, env, url) {
  if (!adminAuthed(request, env)) return json({ ok: false, error: "Unauthorized" }, 401);
  const db = env.DB;
  const path = url.pathname.replace(/^\/api\/admin/, "");

  if (path === "/queue" && request.method === "GET") {
    const status = url.searchParams.get("status") || "pending";
    const { results } = await db.prepare(
      `SELECT r.item_id, r.organization_id, o.name AS org_name, r.lane,
              r.proposed_change, r.evidence, r.confidence, r.status, r.created_at
       FROM review_queue r LEFT JOIN organizations o ON o.id = r.organization_id
       WHERE r.status = ? ORDER BY r.created_at DESC LIMIT 200`
    ).bind(status).all();
    return json({
      ok: true,
      items: results.map((r) => ({
        ...r,
        proposed_change: parse(r.proposed_change),
        evidence: parse(r.evidence),
      })),
    });
  }

  const decide = path.match(/^\/queue\/(\d+)$/);
  if (decide && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    const action = body.action;
    if (action !== "approve" && action !== "reject") {
      return json({ ok: false, error: "action must be approve|reject" }, 422);
    }
    const item = await db.prepare(`SELECT * FROM review_queue WHERE item_id = ? AND status = 'pending'`)
      .bind(Number(decide[1])).first();
    if (!item) return json({ ok: false, error: "No such pending item" }, 404);

    const now = new Date().toISOString();
    const stmts = [db.prepare(
      `UPDATE review_queue SET status = ?, resolved_at = ?, resolved_by = ? WHERE item_id = ?`
    ).bind(action === "approve" ? "approved" : "rejected", now, body.by || "admin", item.item_id)];

    if (action === "approve" && item.organization_id) {
      const change = parse(item.proposed_change) || {};
      const sets = [], binds = [];
      for (const [field, d] of Object.entries(change)) {
        if (!APPLY_WHITELIST.has(field)) continue;
        sets.push(`${field} = ?`);
        binds.push(d && typeof d === "object" && "to" in d ? d.to : d);
      }
      if (sets.length) {
        sets.push("updated_at = ?");
        binds.push(now, item.organization_id);
        stmts.push(db.prepare(`UPDATE organizations SET ${sets.join(", ")} WHERE id = ?`).bind(...binds));
      }
    }
    await db.batch(stmts);
    return json({ ok: true, item_id: item.item_id, action });
  }

  const run = path.match(/^\/run\/(validate|enrich)$/);
  if (run && request.method === "POST") {
    const result = await runLane(env, run[1]);
    return json({ ok: true, ...result });
  }

  if (path === "/runs" && request.method === "GET") {
    const { results } = await db.prepare(
      `SELECT * FROM pipeline_runs ORDER BY run_id DESC LIMIT 30`).all();
    return json({ ok: true, runs: results });
  }

  return json({ ok: false, error: "Not found" }, 404);
}

function parse(s) {
  try { return JSON.parse(s); } catch { return null; }
}
