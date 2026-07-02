// Maintenance pipeline — cron lanes over D1. Core invariant carried over from
// the original Postgres design: lanes PROPOSE changes into review_queue and
// record evidence (link_checks, pipeline_runs); they never rewrite org content.
// The one direct write is organizations.last_ok_at (liveness evidence, feeds
// the freshness score). Batches are sized to stay well inside the Workers
// free-tier limit of 50 subrequests per invocation.

const VALIDATE_BATCH = 40;
const ENRICH_BATCH = 20;

export async function runLane(env, lane) {
  const db = env.DB;
  const started = new Date().toISOString();
  const cursor = (await db.prepare(`SELECT cursor FROM lane_cursors WHERE lane = ?`)
    .bind(lane).first())?.cursor || "";

  let result;
  if (lane === "validate") result = await validateLane(db, cursor);
  else if (lane === "enrich") result = await enrichLane(db, cursor);
  else throw new Error(`unknown lane: ${lane}`);

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

// ---- validate: link liveness for orgs with websites -------------------------
async function validateLane(db, cursor) {
  const { results: orgs } = await db.prepare(
    `SELECT id, name, website_url FROM organizations
     WHERE website_url IS NOT NULL AND status = 'active' AND id > ?
     ORDER BY id LIMIT ?`
  ).bind(cursor, VALIDATE_BATCH).all();
  if (!orgs.length) return { cursor: "", processed: 0, flagged: 0, detail: "cycle complete, cursor reset" };

  const now = new Date().toISOString();
  const stmts = [];
  let flagged = 0;
  for (const org of orgs) {
    const check = await checkUrl(org.website_url);
    stmts.push(db.prepare(
      `INSERT INTO link_checks (organization_id, url, ok, http_status, detail, lane, checked_at)
       VALUES (?, ?, ?, ?, ?, 'validate', ?)`
    ).bind(org.id, org.website_url, check.ok ? 1 : 0, check.status, check.detail, now));
    if (check.ok) {
      stmts.push(db.prepare(`UPDATE organizations SET last_ok_at = ? WHERE id = ?`).bind(now, org.id));
    } else {
      // Propose (don't apply) marking the site dead — but only once while pending.
      const pending = await db.prepare(
        `SELECT item_id FROM review_queue
         WHERE organization_id = ? AND lane = 'validate' AND status = 'pending'`
      ).bind(org.id).first();
      if (!pending) {
        flagged++;
        stmts.push(db.prepare(
          `INSERT INTO review_queue (organization_id, lane, proposed_change, evidence, confidence, status, created_at)
           VALUES (?, 'validate', ?, ?, 0.9, 'pending', ?)`
        ).bind(
          org.id,
          JSON.stringify({ status: { from: "active", to: "inactive" } }),
          JSON.stringify({ url: org.website_url, http_status: check.status, detail: check.detail, checked_at: now }),
          now
        ));
      }
    }
  }
  if (stmts.length) await db.batch(stmts);
  return { cursor: orgs[orgs.length - 1].id, processed: orgs.length, flagged };
}

async function checkUrl(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "ASNM-LinkCheck/1.0 (+https://adaptivesportsnearme.com)" },
      });
      // Some servers reject HEAD; retry those with GET before judging.
      if (method === "HEAD" && (res.status === 405 || res.status === 403 || res.status >= 500)) continue;
      return { ok: res.status < 400, status: res.status, detail: res.ok ? null : `HTTP ${res.status}` };
    } catch (err) {
      if (method === "GET") return { ok: false, status: null, detail: String(err?.message || err).slice(0, 200) };
    }
  }
  return { ok: false, status: null, detail: "unreachable" };
}

// ---- enrich: scrape org homepages for missing contact/location ---------------
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g;
const STATE_ABBR = "AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC";
const ADDR_RE = new RegExp(`([A-Z][A-Za-z .'-]{2,30}),\\s*(${STATE_ABBR})[\\s,]+(\\d{5})(?:-\\d{4})?`);

async function enrichLane(db, cursor) {
  const { results: orgs } = await db.prepare(
    `SELECT id, name, website_url, email, phone, city, state, zip FROM organizations
     WHERE website_url IS NOT NULL AND status = 'active'
       AND (email IS NULL OR phone IS NULL OR state IS NULL OR city IS NULL)
       AND id > ?
     ORDER BY id LIMIT ?`
  ).bind(cursor, ENRICH_BATCH).all();
  if (!orgs.length) return { cursor: "", processed: 0, flagged: 0, detail: "cycle complete, cursor reset" };

  const now = new Date().toISOString();
  const stmts = [];
  let flagged = 0;
  for (const org of orgs) {
    let html = "";
    try {
      const res = await fetch(org.website_url, {
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "ASNM-Enrich/1.0 (+https://adaptivesportsnearme.com)" },
      });
      if (!res.ok) continue;
      html = (await res.text()).slice(0, 300000);
    } catch {
      continue;
    }

    const change = {};
    if (!org.email) {
      const emails = [...new Set((html.match(EMAIL_RE) || [])
        .map((e) => e.toLowerCase())
        .filter((e) => !/\.(png|jpg|jpeg|gif|svg|webp|css|js)$/.test(e))
        .filter((e) => !/(example\.|sentry|wixpress|@2x)/.test(e)))];
      if (emails.length) change.email = { from: null, to: emails[0] };
    }
    if (!org.phone) {
      const phones = html.match(PHONE_RE) || [];
      if (phones.length) change.phone = { from: null, to: phones[0].trim() };
    }
    if (!org.state || !org.city) {
      const m = html.replace(/<[^>]+>/g, " ").match(ADDR_RE);
      if (m) {
        if (!org.city) change.city = { from: null, to: m[1].trim() };
        if (!org.state) change.state = { from: null, to: m[2] };
        if (!org.zip) change.zip = { from: null, to: m[3] };
      }
    }
    if (!Object.keys(change).length) continue;

    const pending = await db.prepare(
      `SELECT item_id FROM review_queue
       WHERE organization_id = ? AND lane = 'enrich' AND status = 'pending'`
    ).bind(org.id).first();
    if (pending) continue;

    flagged++;
    stmts.push(db.prepare(
      `INSERT INTO review_queue (organization_id, lane, proposed_change, evidence, confidence, status, created_at)
       VALUES (?, 'enrich', ?, ?, 0.6, 'pending', ?)`
    ).bind(org.id, JSON.stringify(change),
      JSON.stringify({ url: org.website_url, scanned_at: now, method: "homepage regex scan" }), now));
  }
  if (stmts.length) await db.batch(stmts);
  return { cursor: orgs[orgs.length - 1].id, processed: orgs.length, flagged };
}
