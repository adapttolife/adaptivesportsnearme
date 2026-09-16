// Maintenance pipeline — cron lanes over D1 (Spec 72 lane registry).
// Core invariant unchanged from the original Postgres design: lanes PROPOSE changes
// into review_queue and record evidence (link_checks, pipeline_runs); they never
// rewrite org content. Direct organization writes are exactly two evidence columns,
// both in validate: last_ok_at (freshness input) and last_checked_at (stale-first input).
//
// Cron topology (two schedules, no more — CRON_LANES in index.js):
//   0 */2 * * *   -> validate (stale-first, 15 orgs/run)
//   0 * * * *     -> dispatch (rotates enrich -> classify -> geocode -> resolve so every
//                    lane stays inside the Workers subrequest budget on its own turn;
//                    enrich/classify fetch pages; geocode/resolve use local data)

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

// Also applies to admin-triggered runs. The conditional upsert claims a slot
// atomically, so overlapping cron/manual requests cannot multiply batch writes.
export async function claimLane(db, lane, now = new Date()) {
  const hours = lane === "dispatch" ? 1 : lane === "validate" ? 2 : 4;
  const cutoff = new Date(now.getTime() - hours * 3600000).toISOString();
  return db.prepare(
    `INSERT INTO lane_cursors (lane, cursor, updated_at) VALUES (?, '', ?)
     ON CONFLICT(lane) DO UPDATE SET updated_at = excluded.updated_at
     WHERE lane_cursors.updated_at <= ?
     RETURNING cursor`
  ).bind(lane, now.toISOString(), cutoff).first();
}

export async function runLane(env, lane) {
  if (lane === "dispatch") return runDispatch(env);
  const impl = LANES[lane];
  if (!impl) throw new Error(`unknown lane: ${lane}`);

  const db = env.DB;
  const started = new Date().toISOString();
  const claim = await claimLane(db, lane);
  if (!claim) return { lane, processed: 0, flagged: 0, skipped: true, detail: "maintenance cooldown" };
  const cursor = claim.cursor;

  let batchRowsWritten = 0;
  const measuredDb = {
    prepare: (sql) => db.prepare(sql),
    async batch(statements) {
      const results = await db.batch(statements);
      batchRowsWritten += results.reduce((sum, r) => sum + (r.meta?.rows_written || 0), 0);
      return results;
    },
  };
  const result = await impl({ db: measuredDb, env, cursor });

  const now = new Date().toISOString();
  await measuredDb.batch([
    db.prepare(
      `INSERT INTO lane_cursors (lane, cursor, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(lane) DO UPDATE SET cursor = excluded.cursor, updated_at = excluded.updated_at`
    ).bind(lane, result.cursor, started),
    db.prepare(
      `INSERT INTO pipeline_runs (lane, started_at, finished_at, items_processed, items_flagged, detail)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(lane, started, now, result.processed, result.flagged, result.detail || null),
  ]);
  // D1 metadata includes index writes. Claims/dispatch bookkeeping are separate;
  // this measures the data batches without writing a separate usage counter.
  console.log(JSON.stringify({ event: "pipeline_writes", lane, batch_rows_written: batchRowsWritten }));
  return { lane, ...result, started, finished: now, batchRowsWritten };
}

// The hourly schedule runs one rotation slot per firing. Rotation state lives in
// lane_cursors under 'dispatch' (the lane that ran last); each lane keeps its own cursor.
async function runDispatch(env) {
  const db = env.DB;
  const started = new Date();
  const claim = await claimLane(db, "dispatch", started);
  if (!claim) return { lane: "dispatch", processed: 0, flagged: 0, skipped: true, detail: "maintenance cooldown" };
  const last = claim.cursor;
  const next = DISPATCH_ROTATION[(DISPATCH_ROTATION.indexOf(last) + 1) % DISPATCH_ROTATION.length];
  const result = await runLane(env, next);
  await db.prepare(
    `INSERT INTO lane_cursors (lane, cursor, updated_at) VALUES ('dispatch', ?, ?)
     ON CONFLICT(lane) DO UPDATE SET cursor = excluded.cursor, updated_at = excluded.updated_at`
  ).bind(next, started.toISOString()).run();
  return result;
}
