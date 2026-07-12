// Admin surface — the human half of the review-queue invariant.
// Auth: Authorization: Bearer <ADMIN_KEY> (Worker secret). No key set -> admin disabled.

import { runLane } from "./pipeline.js";
import { json } from "./http.js";

// Only these organization fields may be changed by an approved review item.
const APPLY_WHITELIST = new Set([
  "email", "phone", "city", "state", "state_name", "zip", "website_url",
  "status", "description", "cost_note", "ages", "equipment_provided",
  "sport", "sport_key", "sports_json", "lat", "lng", "geo_precision",
]);

// Fields a NEW org may be created from (a subset of organizations columns —
// never id/status/verification/created_at/etc; those are constants below).
const NEW_ORG_WHITELIST = new Set([
  "name", "org_type", "sport", "sport_key", "sports_json", "website_url",
  "email", "phone", "city", "state", "state_name", "zip", "description",
  "cost_note", "ages", "lat", "lng", "geo_precision",
]);

// Fields an event may be created/updated with — mirrors db/migrations/0003_next_level.sql
// minus id/source/created_at/updated_at, which are set by this file, not the caller.
const EVENT_WHITELIST = new Set([
  "title", "description", "org_id", "sport_key", "venue", "city", "state",
  "url", "starts_at", "ends_at", "all_day", "status", "is_public",
]);

// D1 binds scalars only — stringify anything array/object shaped.
function bindValue(v) {
  return v && typeof v === "object" ? JSON.stringify(v) : v;
}

function str(v, max = 2000) {
  return (typeof v === "string" ? v : "").trim().slice(0, max);
}

const QUEUE_ITEM_SELECT =
  `SELECT r.item_id, r.organization_id, o.name AS org_name, r.lane,
          r.proposed_change, r.evidence, r.confidence, r.status, r.created_at
   FROM review_queue r LEFT JOIN organizations o ON o.id = r.organization_id`;

function mapQueueRow(r) {
  return { ...r, proposed_change: parse(r.proposed_change), evidence: parse(r.evidence) };
}

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
      `${QUEUE_ITEM_SELECT} WHERE r.status = ? ORDER BY r.created_at DESC LIMIT 200`
    ).bind(status).all();
    return json({ ok: true, items: results.map(mapQueueRow) });
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
    const change = parse(item.proposed_change) || {};

    // NEW-ORG APPLY: a discover/submission proposal with no organization_id creates
    // one instead of updating. Validate before touching the queue row so a bad
    // proposal fails loud (422) rather than silently resolving with no org created.
    if (action === "approve" && !item.organization_id
        && (item.lane === "discover" || item.lane === "submission")) {
      const fields = {};
      for (const [field, d] of Object.entries(change)) {
        if (!NEW_ORG_WHITELIST.has(field)) continue;
        fields[field] = d && typeof d === "object" && "to" in d ? d.to : d;
      }
      if (!fields.name) {
        return json({ ok: false, error: "New-org approval requires a 'name' field in proposed_change" }, 422);
      }
      const evidence = parse(item.evidence) || {};
      const id = crypto.randomUUID();
      const cols = ["id", "status", "is_public", "verification_status", "created_at", "updated_at", "primary_data_source"];
      const vals = [id, "active", 1, "unverified", now, now, evidence.source || item.lane];
      for (const [field, value] of Object.entries(fields)) {
        cols.push(field);
        vals.push(bindValue(value));
      }
      const stmts = [
        db.prepare(`INSERT INTO organizations (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`).bind(...vals),
        db.prepare(
          `UPDATE review_queue SET status = ?, resolved_at = ?, resolved_by = ? WHERE item_id = ?`
        ).bind("approved", now, body.by || "admin", item.item_id),
      ];
      await db.batch(stmts);
      return json({ ok: true, item_id: item.item_id, action, organization_id: id });
    }

    const stmts = [db.prepare(
      `UPDATE review_queue SET status = ?, resolved_at = ?, resolved_by = ? WHERE item_id = ?`
    ).bind(action === "approve" ? "approved" : "rejected", now, body.by || "admin", item.item_id)];

    if (action === "approve" && item.organization_id) {
      const sets = [], binds = [];
      for (const [field, d] of Object.entries(change)) {
        if (!APPLY_WHITELIST.has(field)) continue;
        sets.push(`${field} = ?`);
        binds.push(bindValue(d && typeof d === "object" && "to" in d ? d.to : d));
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

  const run = path.match(/^\/run\/(validate|enrich|classify|resolve|geocode|dispatch)$/);
  if (run && request.method === "POST") {
    const result = await runLane(env, run[1]);
    return json({ ok: true, ...result });
  }

  if (path === "/runs" && request.method === "GET") {
    const { results } = await db.prepare(
      `SELECT * FROM pipeline_runs ORDER BY run_id DESC LIMIT 30`).all();
    return json({ ok: true, runs: results });
  }

  if (path === "/digest-stats" && request.method === "GET") {
    const now = new Date();
    const since24h = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
    const since7d = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();

    const [pendingByLane, resolved7d, runs24h, orgsUpdated24h, approvals24h] = await Promise.all([
      db.prepare(
        `SELECT lane, COUNT(*) AS n, MIN(created_at) AS oldest_created_at
         FROM review_queue WHERE status = 'pending' GROUP BY lane`
      ).all(),
      db.prepare(
        `SELECT substr(resolved_at, 1, 10) AS day,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_n,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected_n
         FROM review_queue WHERE resolved_at > ? GROUP BY day ORDER BY day`
      ).bind(since7d).all(),
      db.prepare(
        `SELECT lane, COUNT(*) AS runs, SUM(items_processed) AS processed, SUM(items_flagged) AS flagged
         FROM pipeline_runs WHERE started_at > ? GROUP BY lane`
      ).bind(since24h).all(),
      db.prepare(`SELECT COUNT(*) AS n FROM organizations WHERE updated_at > ?`).bind(since24h).first(),
      db.prepare(
        `SELECT COUNT(*) AS n FROM review_queue
         WHERE status = 'approved' AND resolved_at > ? AND organization_id IS NOT NULL`
      ).bind(since24h).first(),
    ]);

    return json({
      ok: true,
      pending_by_lane: pendingByLane.results,
      resolved_7d: resolved7d.results,
      runs_24h: runs24h.results,
      integrity: {
        orgs_updated_24h: orgsUpdated24h?.n ?? 0,
        approvals_24h: approvals24h?.n ?? 0,
      },
    });
  }

  if (path === "/judgment" && request.method === "GET") {
    const [lowConfidence, unclassifiedSample, unclassifiedTotal] = await Promise.all([
      db.prepare(
        `${QUEUE_ITEM_SELECT} WHERE r.status = 'pending' AND r.confidence < 0.7
         ORDER BY r.created_at DESC LIMIT 100`
      ).all(),
      db.prepare(
        `SELECT id, name, description, website_url FROM organizations
         WHERE status = 'active' AND (sport IS NULL OR sport = 'Multi-Sport')
           AND id NOT IN (
             SELECT organization_id FROM review_queue
             WHERE lane = 'classify' AND status = 'pending' AND organization_id IS NOT NULL
           )
         ORDER BY id LIMIT 20`
      ).all(),
      db.prepare(
        `SELECT COUNT(*) AS n FROM organizations
         WHERE status = 'active' AND (sport IS NULL OR sport = 'Multi-Sport')
           AND id NOT IN (
             SELECT organization_id FROM review_queue
             WHERE lane = 'classify' AND status = 'pending' AND organization_id IS NOT NULL
           )`
      ).first(),
    ]);

    return json({
      ok: true,
      low_confidence: lowConfidence.results.map(mapQueueRow),
      unclassified_sample: unclassifiedSample.results,
      unclassified_total: unclassifiedTotal?.n ?? 0,
    });
  }

  // ---- events (admin CRUD — full list incl. past/cancelled, unlike /api/events) ----
  if (path === "/events" && request.method === "GET") {
    const { results } = await db.prepare(`SELECT * FROM events ORDER BY starts_at DESC LIMIT 500`).all();
    return json({ ok: true, events: results });
  }

  if (path === "/events" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    const title = str(body.title, 200);
    if (!title) return json({ ok: false, error: "title is required" }, 422);
    const startsAt = str(body.starts_at);
    if (!startsAt || isNaN(Date.parse(startsAt))) {
      return json({ ok: false, error: "starts_at must be a valid ISO date" }, 422);
    }
    if (body.ends_at && isNaN(Date.parse(str(body.ends_at)))) {
      return json({ ok: false, error: "ends_at must be a valid ISO date" }, 422);
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const cols = ["id", "title", "starts_at", "created_at", "updated_at"];
    const vals = [id, title, startsAt, now, now];
    for (const [field, value] of Object.entries(body)) {
      if (!EVENT_WHITELIST.has(field) || field === "title" || field === "starts_at") continue;
      cols.push(field);
      vals.push(bindValue(value));
    }
    await db.prepare(`INSERT INTO events (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`).bind(...vals).run();
    return json({ ok: true, id });
  }

  const eventMatch = path.match(/^\/events\/([0-9a-f-]{36})$/);
  if (eventMatch && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    if ("starts_at" in body && isNaN(Date.parse(str(body.starts_at)))) {
      return json({ ok: false, error: "starts_at must be a valid ISO date" }, 422);
    }
    if ("ends_at" in body && body.ends_at && isNaN(Date.parse(str(body.ends_at)))) {
      return json({ ok: false, error: "ends_at must be a valid ISO date" }, 422);
    }
    const sets = [], binds = [];
    for (const [field, value] of Object.entries(body)) {
      if (!EVENT_WHITELIST.has(field)) continue;
      sets.push(`${field} = ?`);
      binds.push(bindValue(value));
    }
    if (!sets.length) return json({ ok: false, error: "No valid fields to update" }, 422);
    sets.push("updated_at = ?");
    binds.push(new Date().toISOString(), eventMatch[1]);
    const result = await db.prepare(`UPDATE events SET ${sets.join(", ")} WHERE id = ?`).bind(...binds).run();
    if (!result.meta || result.meta.changes === 0) return json({ ok: false, error: "No such event" }, 404);
    return json({ ok: true, id: eventMatch[1] });
  }

  if (eventMatch && request.method === "DELETE") {
    const result = await db.prepare(`DELETE FROM events WHERE id = ?`).bind(eventMatch[1]).run();
    if (!result.meta || result.meta.changes === 0) return json({ ok: false, error: "No such event" }, 404);
    return json({ ok: true });
  }

  return json({ ok: false, error: "Not found" }, 404);
}

function parse(s) {
  try { return JSON.parse(s); } catch { return null; }
}
