// Maintenance pipeline — cron lanes over D1. Core invariant carried over from
// the original Postgres design: lanes PROPOSE changes into review_queue and
// record evidence (link_checks, pipeline_runs); they never rewrite org content.
// The one direct write is organizations.last_ok_at (liveness evidence, feeds
// the freshness score).
//
// Subrequest budget (Workers free tier: 50/invocation): validate worst case is
// 15 orgs x 2 fetches + 3 D1 calls (batch select, pending select, final batch)
// = 33; enrich is 20 fetches + 3 = 23. The pending-item check is ONE batched
// query per run, not one per org. If the platform still throws the subrequest
// limit, checkUrl reports it as fatal and the lane stops recording — a dead
// site is never inferred from our own budget exhaustion.

const VALIDATE_BATCH = 15;
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

// One query: which of these orgs already have a pending item in this lane?
async function pendingOrgIds(db, lane, ids) {
  if (!ids.length) return new Set();
  const marks = ids.map(() => "?").join(",");
  const { results } = await db.prepare(
    `SELECT DISTINCT organization_id FROM review_queue
     WHERE lane = ? AND status = 'pending' AND organization_id IN (${marks})`
  ).bind(lane, ...ids).all();
  return new Set(results.map((r) => r.organization_id));
}

function proposeStmt(db, orgId, lane, change, evidence, confidence, now) {
  return db.prepare(
    `INSERT INTO review_queue (organization_id, lane, proposed_change, evidence, confidence, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`
  ).bind(orgId, lane, JSON.stringify(change), JSON.stringify(evidence), confidence, now);
}

// ---- validate: link liveness for orgs with websites -------------------------
async function validateLane(db, cursor) {
  const { results: orgs } = await db.prepare(
    `SELECT id, name, website_url FROM organizations
     WHERE website_url IS NOT NULL AND status = 'active' AND id > ?
     ORDER BY id LIMIT ?`
  ).bind(cursor, VALIDATE_BATCH).all();
  if (!orgs.length) return { cursor: "", processed: 0, flagged: 0, detail: "cycle complete, cursor reset" };

  const pending = await pendingOrgIds(db, "validate", orgs.map((o) => o.id));
  const now = new Date().toISOString();
  const stmts = [];
  let flagged = 0, processed = 0, lastId = cursor, fatal = false;
  for (const org of orgs) {
    const check = await checkUrl(org.website_url);
    if (check.fatal) { fatal = true; break; } // budget/platform limit: record nothing false
    processed++; lastId = org.id;
    stmts.push(db.prepare(
      `INSERT INTO link_checks (organization_id, url, ok, http_status, detail, lane, checked_at)
       VALUES (?, ?, ?, ?, ?, 'validate', ?)`
    ).bind(org.id, org.website_url, check.ok ? 1 : 0, check.status, check.detail, now));
    if (check.ok) {
      stmts.push(db.prepare(`UPDATE organizations SET last_ok_at = ? WHERE id = ?`).bind(now, org.id));
    } else if (!pending.has(org.id)) {
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
      const msg = String(err?.message || err);
      if (/too many subrequests/i.test(msg)) return { fatal: true };
      if (method === "GET") return { ok: false, status: null, detail: msg.slice(0, 200) };
    }
  }
  return { ok: false, status: null, detail: "unreachable" };
}

// ---- enrich: scrape org homepages for missing contact/location ---------------
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g;
const STATE_ABBR = "AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC|PR|GU|VI|AS|MP";
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

  const pending = await pendingOrgIds(db, "enrich", orgs.map((o) => o.id));
  const now = new Date().toISOString();
  const stmts = [];
  let flagged = 0;
  for (const org of orgs) {
    if (pending.has(org.id)) continue; // don't re-scrape while a proposal awaits review

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

    flagged++;
    stmts.push(proposeStmt(db, org.id, "enrich", change,
      { url: org.website_url, scanned_at: now, method: "homepage regex scan" }, 0.6, now));
  }
  if (stmts.length) await db.batch(stmts);
  return { cursor: orgs[orgs.length - 1].id, processed: orgs.length, flagged };
}
