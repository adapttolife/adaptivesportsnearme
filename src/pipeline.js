// Maintenance pipeline — cron lanes over D1 (Spec 72 lane registry).
// Core invariant unchanged from the original Postgres design: lanes PROPOSE changes
// into review_queue and record evidence (link_checks, pipeline_runs); they never
// rewrite org content. Direct organization writes are exactly two evidence columns,
// both in validate: last_ok_at (freshness input) and last_checked_at (stale-first input).
//
// Cron topology (two schedules, no more — CRON_LANES in index.js):
//   0 */2 * * *   -> validate (stale-first, 15 orgs/run)
//   */20 * * * *  -> dispatch (rotates enrich -> classify -> geocode -> resolve so every
//                    lane stays inside the Workers subrequest budget on its own turn;
//                    classify/geocode/resolve are pure-D1 and cheap, enrich fetches pages)

import { validateLane } from "./lanes/validate.js";
import { enrichLane } from "./lanes/enrich.js";
import { classifyLane } from "./lanes/classify.js";
import { resolveLane } from "./lanes/resolve.js";
import { geocodeLane } from "./lanes/geocode.js";

const LANES = {
  validate: validateLane,
  enrich: enrichLane,
  classify: classifyLane,
  resolve: resolveLane,
  geocode: geocodeLane,
};

const DISPATCH_ROTATION = ["enrich", "classify", "geocode", "resolve"];

export async function runLane(env, lane) {
  if (lane === "dispatch") return runDispatch(env);
  const impl = LANES[lane];
  if (!impl) throw new Error(`unknown lane: ${lane}`);

  const db = env.DB;
  const started = new Date().toISOString();
  const cursor = (await db.prepare(`SELECT cursor FROM lane_cursors WHERE lane = ?`)
    .bind(lane).first())?.cursor || "";

  const result = await impl({ db, env, cursor });

  const now = new Date().toISOString();
  await db.batch([
    db.prepare(
      `INSERT INTO lane_cursors (lane, cursor, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(lane) DO UPDATE SET cursor = excluded.cursor, updated_at = excluded.updated_at`
    ).bind(lane, result.cursor, now),
    db.prepare(
      `INSERT INTO pipeline_runs (lane, started_at, finished_at, items_processed, items_flagged, detail)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(lane, started, now, result.processed, result.flagged, result.detail || null),
  ]);
  return { lane, ...result, started, finished: now };
}

// The 20-minute schedule runs one rotation slot per firing. Rotation state lives in
// lane_cursors under 'dispatch' (the lane that ran last); each lane keeps its own cursor.
async function runDispatch(env) {
  const db = env.DB;
  const last = (await db.prepare(`SELECT cursor FROM lane_cursors WHERE lane = 'dispatch'`)
    .first())?.cursor || "";
  const next = DISPATCH_ROTATION[(DISPATCH_ROTATION.indexOf(last) + 1) % DISPATCH_ROTATION.length];
  const result = await runLane(env, next);
  await db.prepare(
    `INSERT INTO lane_cursors (lane, cursor, updated_at) VALUES ('dispatch', ?, ?)
     ON CONFLICT(lane) DO UPDATE SET cursor = excluded.cursor, updated_at = excluded.updated_at`
  ).bind(next, new Date().toISOString()).run();
  return result;
}
