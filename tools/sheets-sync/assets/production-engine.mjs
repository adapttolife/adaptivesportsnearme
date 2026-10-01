var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/lane-utils.js
var UA = "ASNM-Bot/1.0 (+https://adaptivesportsnearme.com/methodology)";
async function pendingOrgIds(db, lane, ids) {
  if (!ids.length) return /* @__PURE__ */ new Set();
  const marks = ids.map(() => "?").join(",");
  const { results } = await db.prepare(
    `SELECT DISTINCT organization_id FROM review_queue
     WHERE lane = ? AND status = 'pending' AND organization_id IN (${marks})`
  ).bind(lane, ...ids).all();
  return new Set(results.map((r) => r.organization_id));
}
__name(pendingOrgIds, "pendingOrgIds");
function proposeStmt(db, orgId, lane, change, evidence, confidence, now) {
  return db.prepare(
    `INSERT INTO review_queue (organization_id, lane, proposed_change, evidence, confidence, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`
  ).bind(orgId, lane, JSON.stringify(change), JSON.stringify(evidence), confidence, now);
}
__name(proposeStmt, "proposeStmt");
async function checkUrl(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: AbortSignal.timeout(1e4),
        headers: { "User-Agent": UA }
      });
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
__name(checkUrl, "checkUrl");
async function fetchText(url, cap = 3e5) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(1e4),
      headers: { "User-Agent": UA }
    });
    if (!res.ok) return null;
    return { text: (await res.text()).slice(0, cap), finalUrl: res.url };
  } catch (err) {
    if (/too many subrequests/i.test(String(err?.message || err))) return { fatal: true };
    return null;
  }
}
__name(fetchText, "fetchText");

// src/lanes/geocode.js
var GEOCODE_BATCH = 200;
function normalizeZip(zip) {
  if (zip == null) return null;
  const trimmed = String(zip).trim();
  const match = trimmed.match(/^(\d{5})/);
  return match ? match[1] : null;
}
__name(normalizeZip, "normalizeZip");
function buildChange(org, coords) {
  const [lat, lng] = coords;
  return {
    lat: { from: org.lat, to: lat },
    lng: { from: org.lng, to: lng },
    geo_precision: { from: org.geo_precision, to: "zip" }
  };
}
__name(buildChange, "buildChange");
async function geocodeLane({ db, env, cursor }) {
  let zcta;
  try {
    const res = await env.ASSETS.fetch("https://assets.local/assets/data/zcta.json");
    if (!res.ok) return { cursor: "", processed: 0, flagged: 0, detail: "zcta.json unavailable" };
    zcta = await res.json();
  } catch {
    return { cursor: "", processed: 0, flagged: 0, detail: "zcta.json unavailable" };
  }
  const { results: orgs } = await db.prepare(
    `SELECT id, zip, lat, lng, geo_precision FROM organizations
     WHERE status = 'active' AND zip IS NOT NULL
       AND (geo_precision IS NULL OR geo_precision = 'state')
       AND id > ?
     ORDER BY id LIMIT ?`
  ).bind(cursor || "", GEOCODE_BATCH).all();
  if (!orgs.length) return { cursor: "", processed: 0, flagged: 0, detail: "cycle complete, cursor reset" };
  const pending = await pendingOrgIds(db, "geocode", orgs.map((o) => o.id));
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const stmts = [];
  let flagged = 0, unknown = 0;
  for (const org of orgs) {
    if (pending.has(org.id)) continue;
    const z = normalizeZip(org.zip);
    const coords = z ? zcta[z] : null;
    if (!coords) {
      unknown++;
      continue;
    }
    flagged++;
    stmts.push(proposeStmt(
      db,
      org.id,
      "geocode",
      buildChange(org, coords),
      { zip: z, source: "Census ZCTA gazetteer (vendored)", method: "zcta-centroid v1" },
      0.9,
      now
    ));
  }
  if (stmts.length) await db.batch(stmts);
  return {
    cursor: orgs[orgs.length - 1].id,
    processed: orgs.length,
    flagged,
    detail: unknown ? `${unknown} unknown zips` : void 0
  };
}
__name(geocodeLane, "geocodeLane");

// src/geo.js
var EARTH_MI = 3958.8;
var DEFAULT_RADIUS_MI = 100;
var MAX_RADIUS_MI = 500;
var CITY_CENTROIDS = {
  albuquerque: [35.0844, -106.6504],
  anaheim: [33.8366, -117.9143],
  anchorage: [61.2181, -149.9003],
  arlington: [32.7357, -97.1081],
  atlanta: [33.749, -84.388],
  aurora: [39.7294, -104.8319],
  austin: [30.2672, -97.7431],
  bakersfield: [35.3733, -119.0187],
  baltimore: [39.2904, -76.6122],
  birmingham: [33.5207, -86.8025],
  boise: [43.615, -116.2023],
  boston: [42.3601, -71.0589],
  boulder: [40.015, -105.2705],
  buffalo: [42.8864, -78.8784],
  charlotte: [35.2271, -80.8431],
  chicago: [41.8781, -87.6298],
  cincinnati: [39.1031, -84.512],
  cleveland: [41.4993, -81.6944],
  "colorado springs": [38.8339, -104.8214],
  columbus: [39.9612, -82.9988],
  dallas: [32.7767, -96.797],
  denver: [39.7392, -104.9903],
  "des moines": [41.5868, -93.625],
  detroit: [42.3314, -83.0458],
  durham: [35.994, -78.8986],
  "el paso": [31.7619, -106.485],
  "fort collins": [40.5853, -105.0844],
  "fort worth": [32.7555, -97.3308],
  fresno: [36.7378, -119.7871],
  honolulu: [21.3069, -157.8583],
  houston: [29.7604, -95.3698],
  indianapolis: [39.7684, -86.1581],
  jacksonville: [30.3322, -81.6557],
  "kansas city": [39.0997, -94.5783],
  "las vegas": [36.1699, -115.1398],
  lexington: [38.0406, -84.5037],
  "little rock": [34.7465, -92.2896],
  "long beach": [33.7701, -118.1937],
  "los angeles": [34.0522, -118.2437],
  louisville: [38.2527, -85.7585],
  madison: [43.0731, -89.4012],
  memphis: [35.1495, -90.049],
  mesa: [33.4152, -111.8315],
  miami: [25.7617, -80.1918],
  milwaukee: [43.0389, -87.9065],
  minneapolis: [44.9778, -93.265],
  nashville: [36.1627, -86.7816],
  "new orleans": [29.9511, -90.0715],
  "new york": [40.7128, -74.006],
  oakland: [37.8044, -122.2712],
  "oklahoma city": [35.4676, -97.5164],
  omaha: [41.2565, -95.9345],
  orlando: [28.5383, -81.3792],
  philadelphia: [39.9526, -75.1652],
  phoenix: [33.4484, -112.074],
  pittsburgh: [40.4406, -79.9959],
  portland: [45.5152, -122.6784],
  raleigh: [35.7796, -78.6382],
  richmond: [37.5407, -77.436],
  riverside: [33.9806, -117.3755],
  sacramento: [38.5816, -121.4944],
  "salt lake city": [40.7608, -111.891],
  "san antonio": [29.4241, -98.4936],
  "san diego": [32.7157, -117.1611],
  "san francisco": [37.7749, -122.4194],
  "san jose": [37.3382, -121.8863],
  seattle: [47.6062, -122.3321],
  "st louis": [38.627, -90.1994],
  "st paul": [44.9537, -93.09],
  tampa: [27.9506, -82.4572],
  tucson: [32.2226, -110.9747],
  tulsa: [36.154, -95.9928],
  washington: [38.9072, -77.0369],
  wichita: [37.6872, -97.3301]
};
function normalizeCity(raw) {
  if (raw == null) return "";
  return String(raw).trim().toLowerCase().replace(/,.*$/, "").replace(/\./g, "").replace(/\s+/g, " ").trim();
}
__name(normalizeCity, "normalizeCity");
function cityCentroid(raw) {
  const key = normalizeCity(raw);
  return key ? CITY_CENTROIDS[key] || null : null;
}
__name(cityCentroid, "cityCentroid");
function milesBetween(lat1, lng1, lat2, lng2) {
  const toR = /* @__PURE__ */ __name((d) => d * Math.PI / 180, "toR");
  const dLat = toR(lat2 - lat1);
  const dLng = toR(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_MI * Math.asin(Math.min(1, Math.sqrt(a)));
}
__name(milesBetween, "milesBetween");
function parseRadius(params, fallback = DEFAULT_RADIUS_MI) {
  const n = parseInt(params.get("radius") || "", 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(MAX_RADIUS_MI, Math.max(1, n));
}
__name(parseRadius, "parseRadius");
function parseLatLng(params) {
  const lat = parseFloat(params.get("lat") || "");
  const lng = parseFloat(params.get("lng") || "");
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return [lat, lng];
}
__name(parseLatLng, "parseLatLng");
function resolveOrigin(params, zcta) {
  const radius = parseRadius(params);
  const pair = parseLatLng(params);
  if (pair) return { lat: pair[0], lng: pair[1], radius, source: "latlng" };
  const zip = normalizeZip(params.get("zip"));
  if (zip) {
    const coords = zcta && zcta[zip];
    if (!coords) return { missing: "zip", zip, radius };
    return { lat: coords[0], lng: coords[1], radius, zip, source: "zip" };
  }
  const cityRaw = (params.get("city") || "").trim();
  if (cityRaw) {
    const coords = cityCentroid(cityRaw);
    if (!coords) return { missing: "city", city: cityRaw, radius };
    return { lat: coords[0], lng: coords[1], radius, city: cityRaw, source: "city" };
  }
  return null;
}
__name(resolveOrigin, "resolveOrigin");
var zctaCache = null;
async function loadZcta(assets) {
  if (zctaCache) return zctaCache;
  if (!assets) return null;
  try {
    const res = await assets.fetch("https://assets.local/assets/data/zcta.json");
    if (!res.ok) return null;
    zctaCache = await res.json();
    return zctaCache;
  } catch {
    return null;
  }
}
__name(loadZcta, "loadZcta");
function applyNearby(rows, origin) {
  const out = [];
  for (const r of rows) {
    if (r.lat == null || r.lng == null) continue;
    const dist = milesBetween(origin.lat, origin.lng, r.lat, r.lng);
    if (dist <= origin.radius) out.push({ row: r, dist });
  }
  out.sort((a, b) => a.dist - b.dist || String(a.row.name || "").localeCompare(String(b.row.name || "")));
  return out;
}
__name(applyNearby, "applyNearby");

// src/data.js
function freshness(lastOkAt, now = Date.now()) {
  if (!lastOkAt) return null;
  const days = (now - Date.parse(lastOkAt)) / 864e5;
  if (!isFinite(days) || days < 0) return 100;
  return Math.max(5, Math.round(100 * Math.pow(0.5, days / 45)));
}
__name(freshness, "freshness");
var LIST_COLS = `id, name, org_type, sport, sport_key, website_url, city,
  state, state_name, zip, lat, lng, geo_precision, description, cost_note,
  equipment_provided, ages, data_quality_rating, verification_status, last_ok_at`;
function rowToProgram(r, dist) {
  return {
    id: r.id,
    name: r.name,
    type: r.org_type,
    sport: r.sport_key,
    // icon/photo key (may be null -> generic styling)
    sportLabel: r.sport,
    website: r.website_url,
    city: r.city,
    state: r.state,
    stateName: r.state_name,
    zip: r.zip,
    lat: r.lat,
    lng: r.lng,
    geoPrecision: r.geo_precision,
    desc: r.description,
    cost: r.cost_note,
    equipment: r.equipment_provided === 1 ? "Provided" : r.equipment_provided === 0 ? "Bring your own" : null,
    ages: r.ages,
    quality: r.data_quality_rating,
    verification: r.verification_status,
    freshness: freshness(r.last_ok_at),
    lastChecked: r.last_ok_at,
    dist: dist == null ? null : Math.round(dist * 10) / 10
  };
}
__name(rowToProgram, "rowToProgram");
function nearPayload(origin) {
  if (!origin || origin.missing) return null;
  return {
    lat: origin.lat,
    lng: origin.lng,
    radius: origin.radius,
    zip: origin.zip || null,
    city: origin.city || null,
    source: origin.source
  };
}
__name(nearPayload, "nearPayload");
async function listPrograms(db, params, opts = {}) {
  const where = ["is_public = 1", "status = 'active'"];
  const binds = [];
  const sport = (params.get("sport") || "").trim();
  if (sport) {
    where.push(`(sport_key = ? OR sport = ?
      OR EXISTS (SELECT 1 FROM json_each(COALESCE(sports_json, '[]')) je WHERE je.value = ?))`);
    binds.push(sport, sport, sport);
  }
  const state = (params.get("state") || "").trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(state)) {
    where.push("state = ?");
    binds.push(state);
  }
  const q = (params.get("q") || "").trim().slice(0, 120);
  if (q) {
    where.push("(name LIKE ? ESCAPE '\\' OR sport LIKE ? ESCAPE '\\' OR state_name LIKE ? ESCAPE '\\' OR city LIKE ? ESCAPE '\\')");
    const like = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
    binds.push(like, like, like, like);
  }
  const zcta = opts.zcta !== void 0 ? opts.zcta : await loadZcta(opts.assets);
  const origin = resolveOrigin(params, zcta);
  if (origin && origin.missing === "zip") {
    const limit2 = Math.min(Math.max(parseInt(params.get("limit") || "60", 10) || 60, 1), 200);
    const offset2 = Math.max(parseInt(params.get("offset") || "0", 10) || 0, 0);
    return { total: 0, limit: limit2, offset: offset2, items: [], near: null };
  }
  if (origin && origin.missing === "city") {
    where.push("LOWER(city) = LOWER(?)");
    binds.push(origin.city);
  }
  const limit = Math.min(Math.max(parseInt(params.get("limit") || "60", 10) || 60, 1), 200);
  const offset = Math.max(parseInt(params.get("offset") || "0", 10) || 0, 0);
  const cond = where.join(" AND ");
  if (origin && !origin.missing) {
    const rows2 = await db.prepare(
      `SELECT ${LIST_COLS} FROM organizations WHERE ${cond} AND lat IS NOT NULL AND lng IS NOT NULL`
    ).bind(...binds).all();
    const ranked = applyNearby(rows2.results, origin);
    const total = ranked.length;
    const items = ranked.slice(offset, offset + limit).map(({ row, dist }) => rowToProgram(row, dist));
    return { total, limit, offset, items, near: nearPayload(origin) };
  }
  const [count, rows] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS n FROM organizations WHERE ${cond}`).bind(...binds).first(),
    db.prepare(
      `SELECT ${LIST_COLS} FROM organizations WHERE ${cond}
       ORDER BY (sport_key IS NULL), (state IS NULL), name LIMIT ? OFFSET ?`
    ).bind(...binds, limit, offset).all()
  ]);
  return { total: count?.n ?? 0, limit, offset, items: rows.results.map((r) => rowToProgram(r)), near: null };
}
__name(listPrograms, "listPrograms");
async function getOrg(db, id) {
  const row = await db.prepare(
    `SELECT ${LIST_COLS}, email, phone, primary_data_source, created_at, updated_at
     FROM organizations WHERE id = ? AND is_public = 1`
  ).bind(id).first();
  if (!row) return null;
  const sources = await db.prepare(
    `SELECT s.source_name AS name, s.source_organization AS organization, s.source_url AS url
     FROM organization_data_sources ods JOIN data_sources s ON s.source_id = ods.source_id
     WHERE ods.organization_id = ?`
  ).bind(id).all();
  return {
    ...rowToProgram(row),
    email: row.email,
    phone: row.phone,
    primarySource: row.primary_data_source,
    sources: sources.results,
    updatedAt: row.updated_at
  };
}
__name(getOrg, "getOrg");
async function stats(db) {
  const [total, bySport, byState, sources, lastRun] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS n FROM organizations WHERE is_public = 1 AND status = 'active'`).first(),
    db.prepare(`SELECT sport AS label, sport_key AS key, COUNT(*) AS n FROM organizations
                WHERE is_public = 1 AND status = 'active' GROUP BY sport ORDER BY n DESC`).all(),
    db.prepare(`SELECT state, state_name AS name, COUNT(*) AS n FROM organizations
                WHERE is_public = 1 AND status = 'active' AND state IS NOT NULL
                GROUP BY state ORDER BY n DESC`).all(),
    db.prepare(`SELECT COUNT(*) AS n FROM data_sources WHERE status = 'active'`).first(),
    db.prepare(`SELECT lane, finished_at FROM pipeline_runs ORDER BY run_id DESC LIMIT 1`).first()
  ]);
  return {
    programs: total?.n ?? 0,
    sources: sources?.n ?? 0,
    bySport: bySport.results,
    byState: byState.results,
    lastPipelineRun: lastRun || null
  };
}
__name(stats, "stats");
async function listSameSportNearby(db, org, limit = 6) {
  const n = Math.min(Math.max(limit || 6, 1), 6);
  const sportKey = org.sport;
  const sportLabel = org.sportLabel;
  if (!org.id || !sportKey && !sportLabel) return [];
  const where = ["is_public = 1", "status = 'active'", "id != ?"];
  const binds = [org.id];
  if (sportKey) {
    where.push("(sport_key = ? OR sport = ?)");
    binds.push(sportKey, sportLabel || sportKey);
  } else {
    where.push("sport = ?");
    binds.push(sportLabel);
  }
  const rows = await db.prepare(
    `SELECT ${LIST_COLS} FROM organizations WHERE ${where.join(" AND ")} LIMIT 80`
  ).bind(...binds).all();
  let items = (rows.results || []).map((r) => rowToProgram(r));
  if (org.lat != null && org.lng != null) {
    items = items.map((p) => {
      const dist = p.lat != null && p.lng != null ? Math.round(milesBetween(org.lat, org.lng, p.lat, p.lng) * 10) / 10 : null;
      return { ...p, dist };
    }).sort((a, b) => (a.dist ?? 1e9) - (b.dist ?? 1e9));
  }
  return items.slice(0, n);
}
__name(listSameSportNearby, "listSameSportNearby");
var GRANT_COLS = `id, name, source, type, audience, amount_min_cents, amount_max_cents,
  amount_display, deadline_display, deadline_next, description,
  eligibility_criteria, how_to_apply, application_url, source_url,
  email, phone, sports_json, is_open, is_renewable`;
var PHOTO_KEYS = /* @__PURE__ */ new Set([
  "baseball",
  "basketball",
  "cycling",
  "football",
  "goalball",
  "pickleball",
  "rugby",
  "skiing",
  "sledhockey",
  "tennis",
  "waterskiing"
]);
function sportsLabel(keys) {
  if (!keys || !keys.length) return null;
  const names = {
    baseball: "Baseball",
    basketball: "Basketball",
    cycling: "Cycling",
    football: "Football",
    goalball: "Goalball",
    pickleball: "Pickleball",
    rugby: "Rugby",
    skiing: "Skiing",
    sledhockey: "Sled Hockey",
    tennis: "Tennis",
    waterskiing: "Water Ski"
  };
  return keys.map((k) => names[k] || k).join(", ");
}
__name(sportsLabel, "sportsLabel");
function rowToGrant(r) {
  let sports = [];
  try {
    sports = r.sports_json ? JSON.parse(r.sports_json) : [];
  } catch {
    sports = [];
  }
  if (!Array.isArray(sports)) sports = [];
  const sport = sports.find((k) => PHOTO_KEYS.has(k)) || sports[0] || null;
  return {
    id: r.id,
    name: r.name,
    source: r.source,
    type: r.type,
    audience: r.audience === "program" ? "program" : "athlete",
    amountDisplay: r.amount_display,
    amountMinCents: r.amount_min_cents,
    amountMaxCents: r.amount_max_cents,
    deadlineDisplay: r.deadline_display,
    deadlineNext: r.deadline_next,
    desc: r.description,
    eligibility: r.eligibility_criteria,
    howToApply: r.how_to_apply,
    applicationUrl: r.application_url,
    sourceUrl: r.source_url,
    email: r.email,
    phone: r.phone,
    sports,
    sport,
    sportsLabel: sportsLabel(sports),
    isOpen: r.is_open === 1,
    isRenewable: r.is_renewable === 1
  };
}
__name(rowToGrant, "rowToGrant");
async function listGrants(db, params) {
  const where = ["is_public = 1", "status = 'active'"];
  const binds = [];
  const audience = params && typeof params.get === "function" ? (params.get("audience") || "").trim() : "";
  if (audience === "athlete" || audience === "program") {
    where.push("audience = ?");
    binds.push(audience);
  }
  const rows = await db.prepare(
    `SELECT ${GRANT_COLS} FROM grants
     WHERE ${where.join(" AND ")}
     ORDER BY CASE WHEN name LIKE 'Hustle & Heart%' THEN 0 ELSE 1 END,
              CASE WHEN audience = 'athlete' THEN 0 ELSE 1 END, name`
  ).bind(...binds).all();
  const items = (rows.results || []).map(rowToGrant);
  return { total: items.length, items };
}
__name(listGrants, "listGrants");
async function getGrant(db, id) {
  const row = await db.prepare(
    `SELECT ${GRANT_COLS} FROM grants WHERE id = ? AND is_public = 1`
  ).bind(id).first();
  return row ? rowToGrant(row) : null;
}
__name(getGrant, "getGrant");
async function listOtherGrants(db, grant, limit = 6) {
  const n = Math.min(Math.max(limit || 6, 1), 6);
  if (!grant || !grant.id) return [];
  const rows = await db.prepare(
    `SELECT ${GRANT_COLS} FROM grants
     WHERE is_public = 1 AND status = 'active' AND id != ?
     ORDER BY CASE WHEN audience = ? THEN 0 ELSE 1 END,
              CASE WHEN name LIKE 'Hustle & Heart%' THEN 0 ELSE 1 END, name
     LIMIT ?`
  ).bind(grant.id, grant.audience || "athlete", n).all();
  return (rows.results || []).map(rowToGrant);
}
__name(listOtherGrants, "listOtherGrants");

// src/email.js
var HOUSE_FROM = "Adaptive Sports Near Me <hello@adapttolife.org>";
var HOUSE_REPLY = "hello@adapttolife.org";
async function cfSend(env, { from, to, replyTo, subject, text: text2, html }) {
  if (!env.SEND_EMAIL) throw new Error("SEND_EMAIL binding not configured");
  const msg = { from, to, subject };
  if (text2) msg.text = text2;
  if (html) msg.html = html;
  if (replyTo) msg.replyTo = replyTo;
  return await env.SEND_EMAIL.send(msg) || {};
}
__name(cfSend, "cfSend");
var esc = /* @__PURE__ */ __name((s2) => String(s2 ?? "").replace(
  /[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
), "esc");
function shell(bodyHtml) {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1c1a15;max-width:560px">` + bodyHtml + `<p style="margin-top:28px;color:#6b6b70;font-size:14px">Adaptive Sports Near Me<br>an Adapt To Life project &middot; 501(c)(3) nonprofit &middot; EIN 41-3213344</p></div>`;
}
__name(shell, "shell");
async function sendSignupWelcome(env, email) {
  const subject = "You're on the list";
  const text2 = "You're in.\n\nAdaptive Sports Near Me is a free national directory of adaptive sports programs: one place to find a program near you, an event to show up to, and grants that help pay for it. No account, no fee, and nobody here will ever ask you for money.\n\nWe are not open yet. We are testing every listing so that when the doors open, what you find is real. You signed up, so you hear the day that happens - before anyone else.\n\nIf you run a program, or know one we should list, just reply to this email. A person reads it.\n\nTalk soon,\nAlec and Karen\n\nAdaptive Sports Near Me\nan Adapt To Life project - 501(c)(3) nonprofit - EIN 41-3213344";
  const html = shell(
    `<p style="margin:0 0 16px"><strong>You're in.</strong></p><p style="margin:0 0 16px">Adaptive Sports Near Me is a free national directory of adaptive sports programs: one place to find a program near you, an event to show up to, and grants that help pay for it. No account, no fee, and nobody here will ever ask you for money.</p><p style="margin:0 0 16px">We are not open yet. We are testing every listing so that when the doors open, what you find is real. You signed up, so you hear the day that happens, before anyone else.</p><p style="margin:0 0 16px">If you run a program, or know one we should list, just reply to this email. A person reads it.</p><p style="margin:0">Talk soon,<br>Alec and Karen</p>`
  );
  return cfSend(env, { from: HOUSE_FROM, to: esc(email) && email, replyTo: HOUSE_REPLY, subject, text: text2, html });
}
__name(sendSignupWelcome, "sendSignupWelcome");

// src/visuals.js
var SPORT_SCENES = {
  basketball: "/scenes/basketball-gym.jpg",
  cycling: "/scenes/cycling-road.jpg",
  skiing: "/scenes/skiing-mountain.jpg",
  baseball: "/scenes/baseball-diamond.jpg",
  boccia: "/scenes/boccia-court.jpg",
  climbing: "/scenes/climbing-gym.jpg",
  football: "/scenes/football-field.jpg",
  goalball: "/scenes/goalball-gym.jpg",
  golf: "/scenes/golf-fairway.jpg",
  rowing: "/scenes/rowing-lake.jpg",
  rugby: "/scenes/rugby-pitch.jpg",
  pickleball: "/scenes/pickleball-court.jpg",
  sledhockey: "/scenes/sledhockey-rink.jpg",
  swimming: "/scenes/swimming-pool.jpg",
  tennis: "/scenes/tennis-court.jpg",
  volleyball: "/scenes/volleyball-court.jpg",
  waterskiing: "/scenes/waterskiing-lake.jpg"
};
var GRANT_TRACK_SCENE = "/scenes/grant-track.jpg";
var PROGRAM_GRANT_SCENE = "/scenes/program-grant-gym.jpg";
var EVENT_SCENE = "/scenes/event-field.jpg";
var GENERIC_STAMP = "/emblems/adaptive.svg";
var EMBLEM_KEYS = /* @__PURE__ */ new Set([
  "athlete-grant",
  "program-grant",
  "event",
  "basketball",
  "tennis",
  "pickleball",
  "rugby",
  "football",
  "baseball",
  "cycling",
  "sledhockey",
  "skiing",
  "waterskiing",
  "goalball",
  "rowing",
  "swimming",
  "golf",
  "boccia",
  "volleyball",
  "climbing"
]);
function emblemPath(key) {
  return key && EMBLEM_KEYS.has(key) ? `/emblems/${key}.png` : null;
}
__name(emblemPath, "emblemPath");
function scenePath(sport) {
  return sport && SPORT_SCENES[sport] || null;
}
__name(scenePath, "scenePath");
function listingVisual(item, role = "program") {
  if (item && item.photo) return { kind: "photo", src: item.photo };
  if (role === "grant") {
    if (item && item.audience === "program") {
      return { kind: "scene", src: PROGRAM_GRANT_SCENE };
    }
    return { kind: "scene", src: GRANT_TRACK_SCENE };
  }
  if (role === "event") {
    const scene2 = scenePath(item && item.sport);
    if (scene2) return { kind: "scene", src: scene2 };
    return { kind: "scene", src: EVENT_SCENE };
  }
  const scene = scenePath(item && item.sport);
  if (scene) return { kind: "scene", src: scene };
  return { kind: "stamp", src: emblemPath(item && item.sport) || GENERIC_STAMP };
}
__name(listingVisual, "listingVisual");
function stampAttr(item, role = "program") {
  let key;
  if (role === "grant") key = item && item.audience === "program" ? "program-grant" : "athlete-grant";
  else if (role === "event") key = "event";
  else key = item && item.sport;
  return ` data-stamp="${emblemPath(key) || GENERIC_STAMP}"`;
}
__name(stampAttr, "stampAttr");
function isCoverVisual(v) {
  return !!(v && (v.kind === "photo" || v.kind === "scene") && v.src);
}
__name(isCoverVisual, "isCoverVisual");

// src/site-chrome.js
var NAV_VERSION = "20260825a";
var CHROME_CSS = `
:root{--sand2:#E8E7E3;--orange-soft:#FBEBDC;--shadow-sm:0 1px 2px rgba(17,17,19,.04),0 1px 3px rgba(17,17,19,.06);}
/* Column layout so the footer sits at the bottom of a short page instead of
   leaving a band of body background under it. */
body{min-height:100vh;display:flex;flex-direction:column;}
body>main{flex:1 0 auto;width:100%;}
/* The app resets buttons; without it the hamburger renders with the browser's
   border and grey fill, which is why bare chrome read as a different site. */
button{font:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer;}
.skip{position:absolute;left:-999px;top:8px;background:var(--ink);color:#fff;padding:10px 16px;border-radius:var(--r);}
.skip:focus{left:12px;}
/* App-matching header. Rendered server-side for zero-flash + no-JS styling;
   site-nav.js mirrors this CSS and owns the drawer. */
.hdr{position:sticky;top:0;z-index:60;background:rgba(255,255,255,.92);backdrop-filter:saturate(150%) blur(10px);border-bottom:1px solid var(--line);}
.hdr.scrolled{box-shadow:var(--shadow-sm);}
.hdr a{color:inherit;text-decoration:none;}
.hdr-in{max-width:1280px;margin:0 auto;padding:0 var(--space-page);height:var(--space-header);display:flex;align-items:center;justify-content:space-between;gap:18px;}
.brand{flex:0 0 auto;transition:opacity .15s;}
.brand:hover{opacity:.7;}
.brand b{font-family:'DM Sans',sans-serif;font-weight:700;font-size:16px;letter-spacing:-.015em;color:var(--ink);white-space:nowrap;}
.menu-btn{flex:0 0 auto;width:40px;height:40px;display:grid;place-items:center;border-radius:var(--r-full);color:var(--ink);transition:background .15s;}
.menu-btn:hover{background:var(--mist);}
.menu-btn svg{width:22px;height:22px;}
.search{flex:0 1 520px;max-width:520px;height:54px;display:flex;align-items:center;background:var(--paper);border:1px solid var(--line);border-radius:var(--r-full);box-shadow:0 3px 12px rgba(17,17,19,.10),0 1px 2px rgba(17,17,19,.05);transition:box-shadow .2s,border-color .2s;}
.search:hover{box-shadow:0 6px 16px rgba(17,17,19,.13),0 1px 3px rgba(17,17,19,.06);}
.search:focus-within{box-shadow:0 8px 22px rgba(17,17,19,.15),0 1px 3px rgba(17,17,19,.06);border-color:var(--sand2);}
.search .loc{display:flex;align-items:center;gap:8px;padding:0 14px 0 20px;height:100%;border-radius:var(--r-full) 0 0 var(--r-full);white-space:nowrap;color:var(--ink);font-size:15px;font-weight:600;cursor:default;}
.search .loc:hover{background:transparent;}
.search .loc svg{width:16px;height:16px;color:var(--orange);}
.search .sep{width:1px;height:26px;background:var(--line);flex:0 0 auto;}
.search input{flex:1 1 auto;min-width:40px;height:100%;border:none;background:transparent;outline:none;padding:0 22px 0 16px;font-size:15px;font-weight:500;color:var(--ink);}
.search input::placeholder{color:var(--muted);font-weight:500;}
.hdr-actions{flex:0 0 auto;display:flex;align-items:center;gap:10px;}
.hdr-add{flex:0 0 auto;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;color:var(--orange-ink);border:1px solid var(--orange-soft);background:var(--orange-soft);transition:border-color .15s,background .15s,color .15s;}
.hdr-add:hover{background:var(--orange);color:#fff;border-color:var(--orange);}
.hdr-add svg{width:19px;height:19px;}
@media (max-width:720px){.hdr-add{width:36px;height:36px;}.hdr-add svg{width:17px;height:17px;}.hdr .brand{display:none;}.search{flex:1 1 100%;max-width:none;min-width:0;}.search .loc span{display:none;}.search input{min-width:0;}}
.foot{border-top:1px solid var(--line);margin-top:var(--space-page);padding:var(--space-nearby) 0 56px;background:var(--paper);}
.foot a{text-decoration:none;}
.foot-in{max-width:1280px;margin:0 auto;padding:0 var(--space-page);display:flex;justify-content:space-between;gap:36px 48px;flex-wrap:wrap;}
.foot .brand b{font-size:15px;}
.foot .tagline{font-size:14px;color:var(--muted);margin:10px 0 0;max-width:380px;line-height:1.5;}
.foot .tagline a{color:var(--ink2);text-decoration:underline;text-underline-offset:2px;}
.foot-cols{display:flex;gap:36px 48px;flex-wrap:wrap;}
.foot-col h2{font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);font-weight:400;margin:0 0 12px;}
.foot-col a{display:block;font-size:14px;color:var(--ink2);padding:6px 0;transition:color .15s;}
.foot-col a:hover{color:var(--orange);}
/* Same mobile behaviour as the app's footer: three columns stay three columns
   instead of wrapping two-plus-one. */
@media(max-width:720px){.foot-cols{width:100%;justify-content:space-between;gap:32px 16px;}}
`;
function headerHtml() {
  return `<header class="hdr">
  <div class="hdr-in">
    <button class="menu-btn" id="menuBtn" aria-label="Menu" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
    <a class="brand" href="/" aria-label="Adaptive Sports Near Me home"><b>Adaptive Sports Near Me</b></a>
    <form class="search" role="search" action="/" method="get">
      <span class="loc" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg><span>United States</span></span>
      <span class="sep"></span>
      <input id="q" name="q" type="text" placeholder="Search a sport, zip, or program" aria-label="Search programs">
    </form>
    <div class="hdr-actions">
      <a class="hdr-add" href="/?add=program" aria-label="Submit a program" title="Submit a program"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></a>
    </div>
  </div>
</header>`;
}
__name(headerHtml, "headerHtml");
function footerHtml() {
  return `<footer class="foot">
  <div class="foot-in">
    <div class="foot-brand">
      <a class="brand" href="/"><b>Adaptive Sports Near Me</b></a>
      <p class="tagline">An open directory of adaptive sports programs across the country. No logins, no walls, because it is a free service of <a href="https://adapttolife.org" target="_blank" rel="noopener">Adapt To Life</a>, a recognized 501(c)(3) nonprofit.</p>
    </div>
    <div class="foot-cols">
      <div class="foot-col"><h2>Explore</h2><a href="/">Discover</a><a href="/maps">Map view</a><a href="/?db=programs">Browse all</a><a href="/events">Events</a><a href="/?db=grants">Funding</a><a href="/blog">Blog</a></div>
      <div class="foot-col"><h2>Programs</h2><a href="/?add=program">Add a program</a><a href="/?add=program">Update a listing</a></div>
      <div class="foot-col"><h2>About</h2><a href="/?about=project">The project</a><a href="/?about=verify">How we verify</a><a href="/?about=a11y">Accessibility</a><a href="/?profile=1">Your profile</a><a href="https://adapttolife.org" target="_blank" rel="noopener">Adapt To Life</a><a href="https://sign.adapttolife.org/waiver?source=asnm">Sign waiver</a></div>
    </div>
  </div>
</footer>`;
}
__name(footerHtml, "footerHtml");
function navScriptHtml() {
  return `<!-- bump NAV_VERSION in src/site-chrome.js on any site-nav.js change (cache-bust) -->
<script src="/site-nav.js?v=${NAV_VERSION}" defer><\/script>`;
}
__name(navScriptHtml, "navScriptHtml");

// src/program-page.js
var SITE = "https://adaptivesportsnearme.com";
var TYPE_LABEL = {
  member: "Community program",
  team: "Competitive team",
  chapter: "Chapter",
  adaptive_club: "Adaptive club",
  inclusive_club: "Inclusive club",
  affiliate: "Affiliate",
  event_partner: "Event partner"
};
function esc2(s2) {
  return s2 == null ? "" : String(s2).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
__name(esc2, "esc");
function locLine(org) {
  const statewide = org.geoPrecision === "state" || org.geoPrecision === "state-level";
  if (statewide) {
    const st = org.stateName || org.state;
    return st ? `${st} \xB7 statewide` : "United States \xB7 statewide";
  }
  if (org.city && org.state) return `${org.city}, ${org.state}`;
  if (org.city && org.stateName) return `${org.city}, ${org.stateName}`;
  if (org.city) return org.city;
  if (org.stateName) return org.stateName;
  if (org.state) return org.state;
  return "United States";
}
__name(locLine, "locLine");
function typeLabel(org) {
  if (!org || !org.type) return null;
  return TYPE_LABEL[org.type] || null;
}
__name(typeLabel, "typeLabel");
function photoPath(sport, item) {
  const v = listingVisual(item || { sport }, "program");
  return isCoverVisual(v) ? v.src : null;
}
__name(photoPath, "photoPath");
function hostFromUrl(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}
__name(hostFromUrl, "hostFromUrl");
function sourceWithUrl(org) {
  const list = org.sources && org.sources.length ? org.sources : org.primarySource ? [{ name: org.primarySource, url: org.primarySourceUrl || null }] : [];
  return list.find((s2) => s2 && s2.url) || null;
}
__name(sourceWithUrl, "sourceWithUrl");
function primaryCta(org) {
  if (org.website) return { href: org.website, label: "Visit website" };
  const phone = org.phone && String(org.phone).trim();
  if (phone) return { href: `tel:${phone.replace(/[^\d+]/g, "")}`, label: "Call" };
  if (org.email) return { href: `mailto:${org.email}`, label: "Email" };
  const src = sourceWithUrl(org);
  if (src) return { href: src.url, label: "View source" };
  return null;
}
__name(primaryCta, "primaryCta");
function denseRows(org) {
  const type = typeLabel(org);
  const pairs = [
    ["Cost", org.cost],
    ["Ages", org.ages],
    ["Equipment", org.equipment],
    ["Phone", org.phone],
    ["Email", org.email],
    ["Type", type]
  ].filter(([, v]) => v);
  if (!pairs.length) return "";
  return `<div class="rows">${pairs.map(([k, v]) => {
    let val = esc2(v);
    if (k === "Phone") {
      const tel = String(v).replace(/[^\d+]/g, "");
      val = `<a href="tel:${esc2(tel)}">${esc2(v)}</a>`;
    } else if (k === "Email") {
      val = `<a href="mailto:${esc2(v)}">${esc2(v)}</a>`;
    }
    return `<div class="row"><span class="k">${k}</span><span class="v">${val}</span></div>`;
  }).join("")}</div>`;
}
__name(denseRows, "denseRows");
function descBlock(desc) {
  if (!desc) return "";
  if (String(desc).length <= 340) return `<p class="desc">${esc2(desc)}</p>`;
  return `<input class="desc-x" type="checkbox" id="descmore" aria-label="Show the full description"><p class="desc desc-long">${esc2(desc)}</p><label class="desc-btn" for="descmore"><span class="dm-more">More</span><span class="dm-less">Less</span></label>`;
}
__name(descBlock, "descBlock");
function nearbyCard(p) {
  const loc = locLine(p);
  const line = p.dist != null ? `${p.dist} mi away` : "";
  const v = listingVisual(p, "program");
  const media = isCoverVisual(v) ? `<div class="pcard-media has-photo"><img class="pcard-img" src="${esc2(v.src)}" alt=""${stampAttr(p, "program")}></div>` : `<div class="pcard-media has-stamp">${v.src ? `<img class="pcard-stamp" src="${esc2(v.src)}" alt="">` : ""}</div>`;
  return `<a class="pcard" href="/programs/${esc2(p.id)}">${media}<div class="pcard-body"><div class="pcard-sport">${esc2(p.sportLabel || "Multi-Sport")}</div><div class="pcard-name">${esc2(p.name)}</div><div class="pcard-loc">${esc2(loc)}</div>${line ? `<div class="pcard-line">${esc2(line)}</div>` : ""}</div></a>`;
}
__name(nearbyCard, "nearbyCard");
function nearbyStrip(items, sportLabel) {
  if (!items || !items.length) return "";
  const list = items.slice(0, 6);
  return `<div class="nearby"><h2>Nearby ${esc2((sportLabel || "adaptive sport").toLowerCase())}</h2><div class="frow-scroll">${list.map(nearbyCard).join("")}</div></div>`;
}
__name(nearbyStrip, "nearbyStrip");
var CSS = `
:root{
  color-scheme:light;--ink:#1A1A1A;--ink2:#3A3A37;--paper:#FFFFFF;--mist:#F7F7F5;--sand:#F0EFEC;--line:#E7E6E2;--muted:#6E6D6A;--faint:#736F6A;--orange:#C5430C;--orange-ink:#A8370A;--r:12px;--r-lg:16px;--r-full:999px;
  /* Rhythm. Do not tighten these to "fix AI look"; Alec locked 24/32/40/48/64 on 2026-08-21. */
  --space-page: 24px;  /* gutter */
  --space-header: 64px;
  --tap: 44px;
  --space-title-gap: 8px;
  --space-after-photo: 32px;
  --space-section: 40px;
  --space-nearby: 48px;
  --space-row: 16px;
  --gut: var(--space-page);
}
*{box-sizing:border-box;}
@media (prefers-reduced-motion: reduce){*{transition:none!important;animation:none!important;}}
html,body{margin:0;padding:0;background:var(--mist);color:var(--ink);}
body{font-family:'DM Sans',system-ui,sans-serif;font-size:16px;line-height:1.45;-webkit-font-smoothing:antialiased;}
img,svg{display:block;max-width:100%;}
a{color:var(--orange-ink);}
.wrap{max-width:880px;margin:0 auto;padding:var(--space-page) var(--space-page) var(--space-header);}
.bar{min-height:var(--space-header);display:flex;align-items:center;}
.back{display:inline-flex;align-items:center;min-height:var(--tap);font-size:16px;font-weight:600;color:var(--ink);text-decoration:none;}
.back:hover{color:var(--orange-ink);}
.dhero{position:relative;width:100%;height:clamp(180px,24vw,260px);border-radius:var(--r-lg);overflow:hidden;margin:0 0 var(--space-after-photo);}
.dhero.has-dphoto{background:#23211f;height:clamp(240px,48vw,520px);}
.dhero.has-dphoto .dhero-img{object-fit:cover;object-position:50% 58%;}
@media(min-width:900px){
  main.wrap>.dhero.has-dphoto{width:100vw;max-width:100vw;margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);border-radius:0;height:min(48vw,560px);}
}
.dhero.has-stamp{background:#F6F4F0;display:flex;align-items:center;justify-content:center;}
.dhero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 30%;}
.dhero-stamp{width:min(42%,180px);height:auto;object-fit:contain;position:relative;z-index:1;}
.dhero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(0,0,0,.55));pointer-events:none;}
.dhero.has-stamp::after{background:linear-gradient(180deg,transparent 58%,rgba(26,26,26,.10));}
.dhero.has-stamp .dov{color:var(--ink);}
.dov{position:absolute;left:16px;bottom:16px;z-index:1;color:#fff;}
.dov-sport{display:block;font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;}
.dov-loc{display:block;font-size:14px;font-weight:500;margin-top:2px;}
h1{font-size:clamp(22px,2.8vw,30px);font-weight:700;letter-spacing:-.02em;line-height:1.15;margin:0 0 var(--space-title-gap);}
.loc{font-size:16px;color:var(--ink2);margin:0;}
.desc{font-size:16px;line-height:1.55;color:var(--ink2);margin:16px 0 0;max-width:68ch;}
/* Scraped descriptions run long and tail off into source notes. Show a readable
   opening and let the reader ask for the rest. No JS: the toggle is a label,
   and the full text stays in the document for search engines and copy-paste. */
.desc-x{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;}
.desc-long{display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden;}
.desc-x:checked ~ .desc-long{display:block;-webkit-line-clamp:none;}
.desc-btn{display:inline-flex;align-items:center;min-height:var(--tap);font-size:15px;font-weight:600;color:var(--orange-ink);cursor:pointer;text-decoration:underline;text-underline-offset:3px;}
.desc-btn .dm-less,.desc-x:checked ~ .desc-btn .dm-more{display:none;}
.desc-x:checked ~ .desc-btn .dm-less{display:inline;}
.desc-x:focus-visible ~ .desc-btn{outline:2px solid var(--orange);outline-offset:3px;border-radius:4px;}
@media(max-width:720px){.desc-long{-webkit-line-clamp:8;}}
.titleb{margin:0 0 var(--space-section);}
.cta{display:inline-flex;align-items:center;justify-content:center;min-width:220px;height:var(--tap);padding:0 22px;background:var(--orange);color:#fff;border-radius:var(--r);font-size:16px;font-weight:700;text-decoration:none;}
.cta:hover{background:var(--orange-ink);}
.host{font-size:14px;color:var(--muted);margin-left:12px;}
.act{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 var(--space-section);}
.rows{margin:0;border-top:1px solid var(--line);}
.row{display:flex;gap:var(--space-row);padding:var(--space-row) 0;border-bottom:1px solid var(--line);font-size:16px;}
.row .k{color:var(--muted);width:92px;flex:0 0 auto;}
.row .v{color:var(--ink);font-weight:500;min-width:0;}
.empty{color:var(--muted);margin:0;}
.nearby{margin-top:var(--space-nearby);}
.act + .nearby,.titleb + .nearby{margin-top:8px;}
.nearby h2{font-size:22px;font-weight:700;letter-spacing:-.02em;margin:0 0 var(--space-row);}
.frow-scroll{display:flex;gap:var(--space-row);overflow-x:auto;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;padding-bottom:6px;padding-right:var(--space-page);margin-right:calc(-1 * var(--space-page));scrollbar-width:none;}
.frow-scroll::-webkit-scrollbar{display:none;}
.frow-scroll>.pcard{flex:0 0 78vw;width:78vw;scroll-snap-align:start;}
.pcard{display:block;color:inherit;text-decoration:none;}
.pcard-media{position:relative;aspect-ratio:4/3;border-radius:10px;overflow:hidden;background:#F6F4F0;}
.pcard-media.has-stamp{display:flex;align-items:center;justify-content:center;}
.pcard-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.pcard-stamp{width:46%;height:auto;object-fit:contain;position:relative;z-index:1;}
.pcard-body{padding:8px 1px 0;}
.pcard-sport{font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--faint);}
/* Two-line box either way, so the rail keeps its baselines. */
.pcard-name{font-size:16px;font-weight:600;line-height:1.25;margin:2px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.5em;}
.pcard-loc,.pcard-line{font-size:14px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
@media(max-width:720px){
  .frow-scroll{gap:12px;}
}
@media(min-width:721px){
  .frow-scroll>.pcard{flex:0 0 calc((100% - 48px)/4.2);width:calc((100% - 48px)/4.2);}
}
@media(max-width:600px){
  .cta{width:100%;min-width:0;}
}
/* The app header owns the top of the page now, so the Directory bar no longer
   needs the gutter above it. */
main.wrap{padding-top:0;}
${CHROME_CSS}
`;
function page({ title, description, canonical, image, body }) {
  const ogImage = image ? `<meta property="og:image" content="${esc2(image)}">` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc2(title)}</title>
<meta name="description" content="${esc2(description)}">
<link rel="canonical" href="${esc2(canonical)}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta property="og:title" content="${esc2(title)}">
<meta property="og:description" content="${esc2(description)}">
<meta property="og:url" content="${esc2(canonical)}">
${ogImage}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/tokens.css">
<style>${CSS}</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${headerHtml()}
<main id="main" class="wrap">
${body}
</main>
${footerHtml()}
${navScriptHtml()}
</body>
</html>`;
}
__name(page, "page");
function listingInnerHtml(org, { nearby = [] } = {}) {
  const name = org.name || "Adaptive sports program";
  const sport = org.sportLabel || "Multi-Sport";
  const loc = locLine(org);
  const v = listingVisual(org, "program");
  const overlay = `<div class="dov"><span class="dov-sport">${esc2(sport)}</span><span class="dov-loc">${esc2(loc)}</span></div>`;
  const hero = isCoverVisual(v) ? `<div class="dhero has-dphoto"><img class="dhero-img" src="${esc2(v.src)}" alt=""${stampAttr(org, "program")}>${overlay}</div>` : `<div class="dhero has-stamp">${v.src ? `<img class="dhero-stamp" src="${esc2(v.src)}" alt="">` : ""}${overlay}</div>`;
  const cta = primaryCta(org);
  const action = cta ? `<div class="act"><a class="cta" href="${esc2(cta.href)}" rel="noopener">${esc2(cta.label)}</a>${org.website ? `<span class="host">${esc2(hostFromUrl(org.website))}</span>` : ""}</div>` : "";
  const desc = descBlock(org.desc);
  return `${hero}
<div class="titleb">
<h1>${esc2(name)}</h1>
<p class="loc">${esc2(loc)}</p>
${desc}
</div>
${action}
${denseRows(org)}
${nearbyStrip(nearby, sport)}`;
}
__name(listingInnerHtml, "listingInnerHtml");
function programPageTemplate(org, { site = SITE, nearby = [] } = {}) {
  const name = org.name || "Adaptive sports program";
  const sport = org.sportLabel || "Multi-Sport";
  const loc = locLine(org);
  const canonical = `${site}/programs/${org.id}`;
  const photo = photoPath(org.sport, org);
  const body = `<header class="bar"><a class="back" href="/">\u2190 Directory</a></header>
${listingInnerHtml(org, { nearby })}`;
  return page({
    title: `${name} \xB7 Adaptive Sports Near Me`,
    description: `${sport} in ${loc}.`,
    canonical,
    image: photo ? `${site}${photo}` : void 0,
    body
  });
}
__name(programPageTemplate, "programPageTemplate");
function programNotFoundTemplate({ site = SITE } = {}) {
  const body = `<header class="bar"><a class="back" href="/">\u2190 Directory</a></header>
<h1>Program not found</h1>
<p class="empty">That listing is not in the directory.</p>`;
  return page({
    title: "Program not found \xB7 Adaptive Sports Near Me",
    description: "That listing is not in the directory.",
    canonical: `${site}/programs`,
    body
  });
}
__name(programNotFoundTemplate, "programNotFoundTemplate");
var PROGRAM_ID_RE = /^\/programs\/([0-9a-f-]{36})\/?$/i;

// src/grant-page.js
var SITE2 = "https://adaptivesportsnearme.com";
var TYPE_LABEL2 = {
  equipment: "Equipment",
  training: "Training",
  program: "Program",
  general: "Grant",
  quality_of_life: "Quality of life"
};
function esc3(s2) {
  return s2 == null ? "" : String(s2).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
__name(esc3, "esc");
function grantTypeLabel(grant) {
  if (!grant || !grant.type) return null;
  return TYPE_LABEL2[grant.type] || null;
}
__name(grantTypeLabel, "grantTypeLabel");
function grantAudienceLabel(grant) {
  if (!grant) return null;
  if (grant.audience === "program") return "Program grant";
  if (grant.audience === "athlete") return "Athlete grant";
  return null;
}
__name(grantAudienceLabel, "grantAudienceLabel");
function audienceBadge(grant) {
  const label = grantAudienceLabel(grant);
  if (!label) return "";
  const cls = grant.audience === "program" ? "rsvp" : "eq";
  return `<div class="cardtags"><span class="cbadge ${cls}">${esc3(label)}</span></div>`;
}
__name(audienceBadge, "audienceBadge");
function grantLocLine(grant) {
  const parts = [grant.source, grant.amountDisplay, grant.deadlineDisplay].filter(Boolean);
  if (parts.length) return parts.join(" \xB7 ");
  return "United States \xB7 national";
}
__name(grantLocLine, "grantLocLine");
function grantOverlayLoc(grant) {
  return grant.source || "United States \xB7 national";
}
__name(grantOverlayLoc, "grantOverlayLoc");
function hostFromUrl2(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}
__name(hostFromUrl2, "hostFromUrl");
function primaryCta2(grant) {
  if (grant.applicationUrl) return { href: grant.applicationUrl, label: "Apply" };
  const phone = grant.phone && String(grant.phone).trim();
  if (phone) return { href: `tel:${phone.replace(/[^\d+]/g, "")}`, label: "Call" };
  if (grant.email) return { href: `mailto:${grant.email}`, label: "Email" };
  if (grant.sourceUrl) return { href: grant.sourceUrl, label: "View source" };
  return null;
}
__name(primaryCta2, "primaryCta");
function denseRows2(grant) {
  const type = grantTypeLabel(grant);
  const pairs = [
    ["Amount", grant.amountDisplay],
    ["Deadline", grant.deadlineDisplay],
    ["Eligibility", grant.eligibility],
    ["Sports", grant.sportsLabel],
    ["Who", grantAudienceLabel(grant)],
    ["Phone", grant.phone],
    ["Email", grant.email],
    ["Type", type],
    ["Org", grant.source],
    ["How to apply", grant.howToApply]
  ].filter(([, v]) => v);
  if (!pairs.length) return "";
  return `<div class="rows">${pairs.map(([k, v]) => {
    let val = esc3(v);
    if (k === "Phone") {
      const tel = String(v).replace(/[^\d+]/g, "");
      val = `<a href="tel:${esc3(tel)}">${esc3(v)}</a>`;
    } else if (k === "Email") {
      val = `<a href="mailto:${esc3(v)}">${esc3(v)}</a>`;
    }
    return `<div class="row"><span class="k">${k}</span><span class="v">${val}</span></div>`;
  }).join("")}</div>`;
}
__name(denseRows2, "denseRows");
function otherCard(g) {
  const loc = g.source || "United States \xB7 national";
  const line = g.amountDisplay || g.deadlineDisplay || "";
  const v = listingVisual(g, "grant");
  const media = isCoverVisual(v) ? `<div class="pcard-media has-photo"><img class="pcard-img" src="${esc3(v.src)}" alt=""${stampAttr(g, "grant")}></div>` : `<div class="pcard-media has-stamp">${v.src ? `<img class="pcard-stamp" src="${esc3(v.src)}" alt="">` : ""}</div>`;
  const kind = grantAudienceLabel(g) || grantTypeLabel(g) || "Grant";
  return `<a class="pcard" href="/grants/${esc3(g.id)}">${media}<div class="pcard-body"><div class="pcard-sport">${esc3(kind)}</div><div class="pcard-name">${esc3(g.name)}</div><div class="pcard-loc">${esc3(loc)}</div>${line ? `<div class="pcard-line">${esc3(line)}</div>` : ""}</div></a>`;
}
__name(otherCard, "otherCard");
function otherStrip(items) {
  if (!items || !items.length) return "";
  const list = items.slice(0, 6);
  return `<div class="nearby"><h2>Other grants</h2><div class="frow-scroll">${list.map(otherCard).join("")}</div></div>`;
}
__name(otherStrip, "otherStrip");
var CSS2 = `
:root{
  color-scheme:light;--ink:#1A1A1A;--ink2:#3A3A37;--paper:#FFFFFF;--mist:#F7F7F5;--sand:#F0EFEC;--line:#E7E6E2;--muted:#6E6D6A;--faint:#736F6A;--orange:#C5430C;--orange-ink:#A8370A;--r:12px;--r-lg:16px;--r-full:999px;
  /* Rhythm. Do not tighten these to "fix AI look"; Alec locked 24/32/40/48/64 on 2026-08-21. */
  --space-page: 24px;  /* gutter */
  --space-header: 64px;
  --tap: 44px;
  --space-title-gap: 8px;
  --space-after-photo: 32px;
  --space-section: 40px;
  --space-nearby: 48px;
  --space-row: 16px;
  --gut: var(--space-page);
}
*{box-sizing:border-box;}
@media (prefers-reduced-motion: reduce){*{transition:none!important;animation:none!important;}}
html,body{margin:0;padding:0;background:var(--mist);color:var(--ink);}
body{font-family:'DM Sans',system-ui,sans-serif;font-size:16px;line-height:1.45;-webkit-font-smoothing:antialiased;}
img,svg{display:block;max-width:100%;}
a{color:var(--orange-ink);}
.wrap{max-width:880px;margin:0 auto;padding:var(--space-page) var(--space-page) var(--space-header);}
.bar{min-height:var(--space-header);display:flex;align-items:center;}
.back{display:inline-flex;align-items:center;min-height:var(--tap);font-size:16px;font-weight:600;color:var(--ink);text-decoration:none;}
.back:hover{color:var(--orange-ink);}
.dhero{position:relative;width:100%;height:clamp(180px,24vw,260px);border-radius:var(--r-lg);overflow:hidden;margin:0 0 var(--space-after-photo);}
.dhero.has-dphoto{background:#23211f;height:clamp(240px,48vw,520px);}
.dhero.has-dphoto .dhero-img{object-fit:cover;object-position:50% 58%;}
@media(min-width:900px){
  main.wrap>.dhero.has-dphoto{width:100vw;max-width:100vw;margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);border-radius:0;height:min(48vw,560px);}
}
.dhero.has-stamp{background:#F6F4F0;display:flex;align-items:center;justify-content:center;}
.dhero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 30%;}
.dhero-stamp{width:min(42%,180px);height:auto;object-fit:contain;position:relative;z-index:1;}
.dhero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(0,0,0,.55));pointer-events:none;}
.dhero.has-stamp::after{background:linear-gradient(180deg,transparent 58%,rgba(26,26,26,.10));}
.dhero.has-stamp .dov{color:var(--ink);}
.dov{position:absolute;left:16px;bottom:16px;z-index:1;color:#fff;}
.dov-sport{display:block;font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;}
.dov-loc{display:block;font-size:14px;font-weight:500;margin-top:2px;}
.cardtags{position:absolute;top:12px;left:12px;z-index:2;display:flex;flex-direction:column;align-items:flex-start;gap:6px;}
.cbadge{display:inline-flex;align-items:center;height:24px;padding:0 11px;border-radius:var(--r-full);font-size:12px;font-weight:700;letter-spacing:.01em;}
.cbadge.eq{background:rgba(255,255,255,.94);color:var(--ink);box-shadow:inset 0 0 0 1px rgba(17,17,19,.05);}
.cbadge.rsvp{background:var(--ink);color:#fff;}
h1{font-size:clamp(22px,2.8vw,30px);font-weight:700;letter-spacing:-.02em;line-height:1.15;margin:0 0 var(--space-title-gap);}
.loc{font-size:16px;color:var(--ink2);margin:0;}
.desc{font-size:16px;line-height:1.55;color:var(--ink2);margin:16px 0 0;max-width:68ch;}
.titleb{margin:0 0 var(--space-section);}
.cta{display:inline-flex;align-items:center;justify-content:center;min-width:220px;height:var(--tap);padding:0 22px;background:var(--orange);color:#fff;border-radius:var(--r);font-size:16px;font-weight:700;text-decoration:none;}
.cta:hover{background:var(--orange-ink);}
.host{font-size:14px;color:var(--muted);margin-left:12px;}
.act{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 var(--space-section);}
.rows{margin:0;border-top:1px solid var(--line);}
.row{display:flex;gap:var(--space-row);padding:var(--space-row) 0;border-bottom:1px solid var(--line);font-size:16px;}
.row .k{color:var(--muted);width:92px;flex:0 0 auto;}
.row .v{color:var(--ink);font-weight:500;min-width:0;}
.empty{color:var(--muted);margin:0;}
.nearby{margin-top:var(--space-nearby);}
.act + .nearby,.titleb + .nearby{margin-top:8px;}
.nearby h2{font-size:22px;font-weight:700;letter-spacing:-.02em;margin:0 0 var(--space-row);}
.frow-scroll{display:flex;gap:var(--space-row);overflow-x:auto;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;padding-bottom:6px;padding-right:var(--space-page);margin-right:calc(-1 * var(--space-page));scrollbar-width:none;}
.frow-scroll::-webkit-scrollbar{display:none;}
.frow-scroll>.pcard{flex:0 0 78vw;width:78vw;scroll-snap-align:start;}
.pcard{display:block;color:inherit;text-decoration:none;}
.pcard-media{position:relative;aspect-ratio:4/3;border-radius:10px;overflow:hidden;background:#F6F4F0;}
.pcard-media.has-stamp{display:flex;align-items:center;justify-content:center;}
.pcard-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.pcard-stamp{width:46%;height:auto;object-fit:contain;position:relative;z-index:1;}
.pcard-body{padding:8px 1px 0;}
.pcard-sport{font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--faint);}
/* Two-line box either way, so the rail keeps its baselines. */
.pcard-name{font-size:16px;font-weight:600;line-height:1.25;margin:2px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.5em;}
.pcard-loc,.pcard-line{font-size:14px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
@media(max-width:720px){
  .frow-scroll{gap:12px;}
}
@media(min-width:721px){
  .frow-scroll>.pcard{flex:0 0 calc((100% - 48px)/4.2);width:calc((100% - 48px)/4.2);}
}
@media(max-width:600px){
  .cta{width:100%;min-width:0;}
}
/* The app header owns the top of the page now, so the Grants bar no longer
   needs the gutter above it. */
main.wrap{padding-top:0;}
${CHROME_CSS}
`;
function page2({ title, description, canonical, image, body }) {
  const ogImage = image ? `<meta property="og:image" content="${esc3(image)}">` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc3(title)}</title>
<meta name="description" content="${esc3(description)}">
<link rel="canonical" href="${esc3(canonical)}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta property="og:title" content="${esc3(title)}">
<meta property="og:description" content="${esc3(description)}">
<meta property="og:url" content="${esc3(canonical)}">
${ogImage}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/tokens.css">
<style>${CSS2}</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${headerHtml()}
<main id="main" class="wrap">
${body}
</main>
${footerHtml()}
${navScriptHtml()}
</body>
</html>`;
}
__name(page2, "page");
function listingInnerHtml2(grant, { nearby = [] } = {}) {
  const name = grant.name || "Adaptive sports grant";
  const kind = grantTypeLabel(grant) || "Grant";
  const loc = grantLocLine(grant);
  const overlayLoc = grantOverlayLoc(grant);
  const v = listingVisual(grant, "grant");
  const overlay = `<div class="dov"><span class="dov-sport">${esc3(kind)}</span><span class="dov-loc">${esc3(overlayLoc)}</span></div>`;
  const badge = audienceBadge(grant);
  const hero = isCoverVisual(v) ? `<div class="dhero has-dphoto">${badge}<img class="dhero-img" src="${esc3(v.src)}" alt=""${stampAttr(grant, "grant")}>${overlay}</div>` : `<div class="dhero has-stamp">${badge}${v.src ? `<img class="dhero-stamp" src="${esc3(v.src)}" alt="">` : ""}${overlay}</div>`;
  const cta = primaryCta2(grant);
  const action = cta ? `<div class="act"><a class="cta" href="${esc3(cta.href)}" rel="noopener">${esc3(cta.label)}</a>${grant.applicationUrl ? `<span class="host">${esc3(hostFromUrl2(grant.applicationUrl))}</span>` : ""}</div>` : "";
  const desc = grant.desc ? `<p class="desc">${esc3(grant.desc)}</p>` : "";
  return `${hero}
<div class="titleb">
<h1>${esc3(name)}</h1>
<p class="loc">${esc3(loc)}</p>
${desc}
</div>
${action}
${denseRows2(grant)}
${otherStrip(nearby)}`;
}
__name(listingInnerHtml2, "listingInnerHtml");
function grantPageTemplate(grant, { site = SITE2, nearby = [] } = {}) {
  const name = grant.name || "Adaptive sports grant";
  const loc = grantLocLine(grant);
  const canonical = `${site}/grants/${grant.id}`;
  const photo = isCoverVisual(listingVisual(grant, "grant")) ? listingVisual(grant, "grant").src : null;
  const body = `<header class="bar"><a class="back" href="/?db=grants">\u2190 Grants</a></header>
${listingInnerHtml2(grant, { nearby })}`;
  return page2({
    title: `${name} \xB7 Adaptive Sports Near Me`,
    description: loc,
    canonical,
    image: photo ? `${site}${photo}` : void 0,
    body
  });
}
__name(grantPageTemplate, "grantPageTemplate");
function grantNotFoundTemplate({ site = SITE2 } = {}) {
  const body = `<header class="bar"><a class="back" href="/?db=grants">\u2190 Grants</a></header>
<h1>Grant not found</h1>
<p class="empty">That listing is not in the directory.</p>`;
  return page2({
    title: "Grant not found \xB7 Adaptive Sports Near Me",
    description: "That listing is not in the directory.",
    canonical: `${site}/?db=grants`,
    body
  });
}
__name(grantNotFoundTemplate, "grantNotFoundTemplate");
var GRANT_ID_RE = /^\/grants\/([0-9a-f-]{36})\/?$/i;

// src/events.js
var EVENT_COLS = `id, title, description, org_id, sport_key, venue, city, state,
  url, starts_at, ends_at, all_day, status, source, created_at, updated_at`;
async function listEvents(db, params) {
  const cutoff = new Date(Date.now() - 24 * 3600 * 1e3).toISOString();
  const where = ["is_public = 1", "status = 'scheduled'", "starts_at >= ?"];
  const binds = [cutoff];
  const sport = (params.get("sport") || "").trim();
  if (sport) {
    where.push("sport_key = ?");
    binds.push(sport);
  }
  const state = (params.get("state") || "").trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(state)) {
    where.push("state = ?");
    binds.push(state);
  }
  const limit = Math.min(Math.max(parseInt(params.get("limit") || "100", 10) || 100, 1), 100);
  const { results } = await db.prepare(
    `SELECT ${EVENT_COLS} FROM events WHERE ${where.join(" AND ")} ORDER BY starts_at ASC LIMIT ?`
  ).bind(...binds, limit).all();
  return { total: results.length, limit, items: results };
}
__name(listEvents, "listEvents");
function xmlEscape(s2) {
  return s2 == null ? "" : String(s2).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
__name(xmlEscape, "xmlEscape");
function icsEscape(s2) {
  return s2 == null ? "" : String(s2).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}
__name(icsEscape, "icsEscape");
function pad2(n) {
  return String(n).padStart(2, "0");
}
__name(pad2, "pad2");
function icsDateTime(iso) {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`;
}
__name(icsDateTime, "icsDateTime");
function icsDate(iso) {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}`;
}
__name(icsDate, "icsDate");
function icsDatePlusOne(iso) {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + 1);
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}`;
}
__name(icsDatePlusOne, "icsDatePlusOne");
function eventsToRss(events, siteUrl) {
  const site = String(siteUrl || "").replace(/\/$/, "");
  const items = events.map((e) => {
    const link = e.url || `${site}/events`;
    return `  <item>
    <title>${xmlEscape(e.title)}</title>
    <link>${xmlEscape(link)}</link>
    <guid isPermaLink="false">${xmlEscape(e.id)}</guid>
    <pubDate>${new Date(e.created_at).toUTCString()}</pubDate>
    <description>${xmlEscape(e.description || "")}</description>
  </item>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Adaptive Sports Near Me \xB7 Events</title>
  <link>${xmlEscape(site)}/events</link>
  <description>Upcoming adaptive sports events, meets and clinics.</description>
` + (items ? `${items}
` : "") + `</channel>
</rss>
`;
}
__name(eventsToRss, "eventsToRss");
function icsEventLines(e) {
  const lines = ["BEGIN:VEVENT", `UID:${e.id}@adaptivesportsnearme.com`, `DTSTAMP:${icsDateTime(e.created_at)}`];
  if (e.all_day) {
    lines.push(`DTSTART;VALUE=DATE:${icsDate(e.starts_at)}`);
    lines.push(`DTEND;VALUE=DATE:${icsDatePlusOne(e.ends_at || e.starts_at)}`);
  } else {
    lines.push(`DTSTART:${icsDateTime(e.starts_at)}`);
    if (e.ends_at) lines.push(`DTEND:${icsDateTime(e.ends_at)}`);
  }
  lines.push(`SUMMARY:${icsEscape(e.title)}`);
  if (e.description) lines.push(`DESCRIPTION:${icsEscape(e.description)}`);
  const location = [e.venue, e.city, e.state].filter(Boolean).join(", ");
  if (location) lines.push(`LOCATION:${icsEscape(location)}`);
  if (e.url) lines.push(`URL:${icsEscape(e.url)}`);
  lines.push("END:VEVENT");
  return lines;
}
__name(icsEventLines, "icsEventLines");
function eventsToIcs(events) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Adaptive Sports Near Me//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Adaptive Sports Near Me"
  ];
  for (const e of events) lines.push(...icsEventLines(e));
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
__name(eventsToIcs, "eventsToIcs");

// src/lanes/validate.js
var VALIDATE_BATCH = 15;
async function validateLane({ db }) {
  const { results: orgs } = await db.prepare(
    `SELECT id, name, website_url FROM organizations
     WHERE website_url IS NOT NULL AND status = 'active'
     ORDER BY (last_checked_at IS NOT NULL), last_checked_at ASC, id LIMIT ?`
  ).bind(VALIDATE_BATCH).all();
  if (!orgs.length) return { cursor: "", processed: 0, flagged: 0, detail: "no candidates" };
  const pending = await pendingOrgIds(db, "validate", orgs.map((o) => o.id));
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const stmts = [];
  let flagged = 0, processed = 0, lastId = "", fatal = false;
  for (const org of orgs) {
    const check = await checkUrl(org.website_url);
    if (check.fatal) {
      fatal = true;
      break;
    }
    processed++;
    lastId = org.id;
    stmts.push(db.prepare(
      `INSERT INTO link_checks (organization_id, url, ok, http_status, detail, lane, checked_at)
       VALUES (?, ?, ?, ?, ?, 'validate', ?)`
    ).bind(org.id, org.website_url, check.ok ? 1 : 0, check.status, check.detail, now));
    stmts.push(db.prepare(`UPDATE organizations SET last_checked_at = ? WHERE id = ?`).bind(now, org.id));
    if (check.ok) {
      stmts.push(db.prepare(`UPDATE organizations SET last_ok_at = ? WHERE id = ?`).bind(now, org.id));
    } else if (!pending.has(org.id)) {
      flagged++;
      stmts.push(proposeStmt(
        db,
        org.id,
        "validate",
        { status: { from: "active", to: "inactive" } },
        { url: org.website_url, http_status: check.status, detail: check.detail, checked_at: now },
        0.9,
        now
      ));
    }
  }
  if (stmts.length) await db.batch(stmts);
  return { cursor: lastId, processed, flagged, detail: fatal ? "stopped early: subrequest limit" : null };
}
__name(validateLane, "validateLane");

// src/extract.js
var STATE_ABBR = "AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC|PR|GU|VI|AS|MP";
var ADDR_RE = new RegExp(`([A-Z][A-Za-z .'-]{2,30}),\\s*(${STATE_ABBR})[\\s,]+(\\d{5})(?:-\\d{4})?`);
var ASSET_EXT_RE = /\.(png|jpe?g|gif|svg|webp|ico|css|js|woff2?|ttf|eot|pdf|mp4|mp3)$/i;
var EMAIL_JUNK_RE = /(example\.|sentry|wixpress|@2x)/i;
var CONTACT_LINK_RE = /contact|about|get.?involved|connect/i;
function stripTags(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
}
__name(stripTags, "stripTags");
function decodeHrefValue(raw) {
  let s2 = raw.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16))).replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec))).replace(/&amp;/gi, "&");
  try {
    s2 = decodeURIComponent(s2);
  } catch {
  }
  return s2.trim();
}
__name(decodeHrefValue, "decodeHrefValue");
function isJunkEmail(email) {
  return ASSET_EXT_RE.test(email) || EMAIL_JUNK_RE.test(email);
}
__name(isJunkEmail, "isJunkEmail");
function normalizeTel(raw) {
  const decoded = decodeHrefValue(raw.split("?")[0]);
  return decoded.replace(/[^\d+xX]/g, "");
}
__name(normalizeTel, "normalizeTel");
function flattenNode(node, out) {
  if (Array.isArray(node)) {
    for (const item of node) flattenNode(item, out);
    return;
  }
  if (node && typeof node === "object") {
    if (Array.isArray(node["@graph"])) {
      for (const item of node["@graph"]) flattenNode(item, out);
      return;
    }
    out.push(node);
  }
}
__name(flattenNode, "flattenNode");
function extractJsonLd(html) {
  const out = [];
  const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = scriptRe.exec(html)) !== null) {
    const attrs = m[1];
    if (!/type\s*=\s*["']?application\/ld\+json["']?/i.test(attrs)) continue;
    const content = m[2].trim();
    if (!content) continue;
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      continue;
    }
    flattenNode(parsed, out);
  }
  return out;
}
__name(extractJsonLd, "extractJsonLd");
function extractEmails(html) {
  const found = [];
  const mailtoRe = /href\s*=\s*(["'])mailto:([^"']*)\1/gi;
  let m;
  while ((m = mailtoRe.exec(html)) !== null) {
    const addr = decodeHrefValue(m[2].split("?")[0]);
    if (addr) found.push(addr);
  }
  const text2 = stripTags(html);
  const textMatches = text2.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  found.push(...textMatches);
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const raw of found) {
    const email = raw.toLowerCase();
    if (seen.has(email) || isJunkEmail(email)) continue;
    seen.add(email);
    out.push(email);
  }
  return out;
}
__name(extractEmails, "extractEmails");
function extractPhones(html) {
  const found = [];
  const telRe = /href\s*=\s*(["'])tel:([^"']*)\1/gi;
  let m;
  while ((m = telRe.exec(html)) !== null) {
    const norm = normalizeTel(m[2]);
    if (norm) found.push(norm);
  }
  const text2 = stripTags(html);
  const textMatches = (text2.match(/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g) || []).map((p) => p.trim());
  found.push(...textMatches);
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const p of found) {
    if (seen.has(p)) continue;
    seen.add(p);
    out.push(p);
  }
  return out;
}
__name(extractPhones, "extractPhones");
function extractAddress(html) {
  const jsonld = extractJsonLd(html);
  for (const obj of jsonld) {
    const candidates = [obj, obj && obj.address].filter((c) => c && typeof c === "object");
    for (const c of candidates) {
      if (c.addressLocality || c.addressRegion || c.postalCode) {
        return {
          city: c.addressLocality ?? null,
          state: c.addressRegion ?? null,
          zip: c.postalCode ?? null
        };
      }
    }
  }
  const text2 = stripTags(html);
  const m = text2.match(ADDR_RE);
  if (m) {
    return { city: m[1].trim(), state: m[2], zip: m[3] };
  }
  return null;
}
__name(extractAddress, "extractAddress");
function extractContactLinks(html, baseUrl) {
  let base;
  try {
    base = new URL(baseUrl);
  } catch {
    return [];
  }
  const anchorRe = /<a\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  let m;
  while ((m = anchorRe.exec(html)) !== null) {
    if (out.length >= 3) break;
    const href = m[2].trim();
    if (!href) continue;
    if (/^(mailto:|tel:|#|javascript:)/i.test(href)) continue;
    const text2 = stripTags(m[3]).trim();
    if (!CONTACT_LINK_RE.test(href) && !CONTACT_LINK_RE.test(text2)) continue;
    let abs;
    try {
      abs = new URL(href, base);
    } catch {
      continue;
    }
    if (abs.hostname !== base.hostname) continue;
    if (abs.protocol !== "http:" && abs.protocol !== "https:") continue;
    const key = abs.href;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(abs.href);
  }
  return out;
}
__name(extractContactLinks, "extractContactLinks");

// src/lanes/enrich.js
var BATCH = 15;
var CONFIDENCE = { jsonld: 0.8, links: 0.7, regex: 0.6 };
var TIER_RANK = { jsonld: 3, links: 2, regex: 1 };
function decodeEntities(raw) {
  return raw.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16))).replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec))).replace(/&amp;/gi, "&");
}
__name(decodeEntities, "decodeEntities");
function decodeHref(raw) {
  let s2 = decodeEntities(raw.split("?")[0]);
  try {
    s2 = decodeURIComponent(s2);
  } catch {
  }
  return s2.trim();
}
__name(decodeHref, "decodeHref");
function hrefEmailSet(html) {
  const out = /* @__PURE__ */ new Set();
  const re = /href\s*=\s*(["'])mailto:([^"']*)\1/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const email = decodeHref(m[2]).toLowerCase();
    if (email) out.add(email);
  }
  return out;
}
__name(hrefEmailSet, "hrefEmailSet");
function hrefPhoneSet(html) {
  const out = /* @__PURE__ */ new Set();
  const re = /href\s*=\s*(["'])tel:([^"']*)\1/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const phone = decodeHref(m[2]).replace(/[^\d+xX]/g, "");
    if (phone) out.add(phone);
  }
  return out;
}
__name(hrefPhoneSet, "hrefPhoneSet");
function jsonldEmail(nodes) {
  for (const n of nodes) {
    if (n && typeof n.email === "string" && n.email.includes("@")) return n.email.trim().toLowerCase();
  }
  return null;
}
__name(jsonldEmail, "jsonldEmail");
function jsonldPhone(nodes) {
  for (const n of nodes) {
    if (n && typeof n.telephone === "string" && n.telephone.trim()) return n.telephone.trim();
  }
  return null;
}
__name(jsonldPhone, "jsonldPhone");
function hasJsonLdAddress(nodes) {
  for (const obj of nodes) {
    const candidates = [obj, obj && obj.address].filter((c) => c && typeof c === "object");
    if (candidates.some((c) => c.addressLocality || c.addressRegion || c.postalCode)) return true;
  }
  return false;
}
__name(hasJsonLdAddress, "hasJsonLdAddress");
function extractTiered(html, baseUrl) {
  const jsonld = extractJsonLd(html);
  const emails = extractEmails(html);
  const phones = extractPhones(html);
  const address = extractAddress(html);
  const jEmail = jsonldEmail(jsonld);
  const email = jEmail ? { value: jEmail, source: "jsonld" } : emails.length ? { value: emails[0], source: hrefEmailSet(html).has(emails[0]) ? "links" : "regex" } : null;
  const jPhone = jsonldPhone(jsonld);
  const phone = jPhone ? { value: jPhone, source: "jsonld" } : phones.length ? { value: phones[0], source: hrefPhoneSet(html).has(phones[0]) ? "links" : "regex" } : null;
  const address_ = address ? { value: address, source: hasJsonLdAddress(jsonld) ? "jsonld" : "regex" } : null;
  return { email, phone, address: address_, contactLinks: extractContactLinks(html, baseUrl) };
}
__name(extractTiered, "extractTiered");
async function enrichLane({ db, cursor }) {
  const { results: orgs } = await db.prepare(
    `SELECT id, name, website_url, email, phone, city, state, zip FROM organizations
     WHERE website_url IS NOT NULL AND status = 'active'
       AND (email IS NULL OR phone IS NULL OR state IS NULL OR city IS NULL)
       AND id > ?
     ORDER BY id LIMIT ?`
  ).bind(cursor, BATCH).all();
  if (!orgs.length) return { cursor: "", processed: 0, flagged: 0, detail: "cycle complete, cursor reset" };
  const pending = await pendingOrgIds(db, "enrich", orgs.map((o) => o.id));
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const stmts = [];
  let flagged = 0;
  for (const org of orgs) {
    if (pending.has(org.id)) continue;
    const home = await fetchText(org.website_url);
    if (home?.fatal) break;
    if (!home) continue;
    let picked = extractTiered(home.text, org.website_url);
    let contactPageUrl = null;
    if (!org.email && !picked.email && picked.contactLinks.length) {
      const contactUrl = picked.contactLinks[0];
      const contact = await fetchText(contactUrl);
      if (contact?.fatal) break;
      if (contact) {
        contactPageUrl = contactUrl;
        const fromContact = extractTiered(contact.text, contactUrl);
        picked = {
          email: picked.email ?? fromContact.email,
          phone: picked.phone ?? fromContact.phone,
          address: picked.address ?? fromContact.address,
          contactLinks: picked.contactLinks
        };
      }
    }
    const change = {};
    const sources = [];
    if (!org.email && picked.email) {
      change.email = { from: null, to: picked.email.value };
      sources.push(picked.email.source);
    }
    if (!org.phone && picked.phone) {
      change.phone = { from: null, to: picked.phone.value };
      sources.push(picked.phone.source);
    }
    if ((!org.city || !org.state || !org.zip) && picked.address) {
      const { city, state, zip } = picked.address.value;
      if (!org.city && city) {
        change.city = { from: null, to: city };
        sources.push(picked.address.source);
      }
      if (!org.state && state) {
        change.state = { from: null, to: state };
        sources.push(picked.address.source);
      }
      if (!org.zip && zip) {
        change.zip = { from: null, to: zip };
        sources.push(picked.address.source);
      }
    }
    if (!Object.keys(change).length) continue;
    const weakest = sources.reduce((a, b) => TIER_RANK[b] < TIER_RANK[a] ? b : a);
    flagged++;
    stmts.push(proposeStmt(
      db,
      org.id,
      "enrich",
      change,
      { url: org.website_url, scanned_at: now, method: weakest, contact_page: contactPageUrl },
      CONFIDENCE[weakest],
      now
    ));
  }
  if (stmts.length) await db.batch(stmts);
  return { cursor: orgs[orgs.length - 1].id, processed: orgs.length, flagged };
}
__name(enrichLane, "enrichLane");

// data/gazetteer.js
var GAZETTEER = [
  {
    sport_key: "basketball",
    name: "Wheelchair Basketball",
    icon_key: "basketball",
    terms: ["wheelchair basketball", "beep basketball", "basketball"]
  },
  {
    sport_key: "sledhockey",
    name: "Sled Hockey",
    icon_key: "sledhockey",
    terms: ["sled hockey", "sledge hockey", "para ice hockey"]
  },
  {
    sport_key: "skiing",
    name: "Adaptive Skiing",
    icon_key: "skiing",
    terms: ["adaptive skiing", "sit ski", "sit-ski", "monoski", "mono-ski", "adaptive ski"]
  },
  {
    sport_key: "rowing",
    name: "Adaptive Rowing",
    icon_key: null,
    terms: ["adaptive rowing", "para rowing", "rowing"]
  },
  {
    sport_key: "trackfield",
    name: "Track & Field",
    icon_key: null,
    terms: ["track and field", "track & field", "para athletics"]
  },
  {
    sport_key: "sailing",
    name: "Adaptive Sailing",
    icon_key: null,
    terms: ["adaptive sailing", "para sailing", "sailing"]
  },
  {
    sport_key: "tennis",
    name: "Wheelchair Tennis",
    icon_key: "tennis",
    terms: ["wheelchair tennis", "tennis"]
  },
  {
    sport_key: "running",
    name: "Running",
    icon_key: null,
    terms: ["running club", "running program", "running"]
  },
  {
    sport_key: "archery",
    name: "Archery",
    icon_key: null,
    terms: ["archery"]
  },
  {
    sport_key: "swimming",
    name: "Adaptive Swimming",
    icon_key: null,
    terms: ["adaptive swimming", "para swimming", "swimming"]
  },
  {
    sport_key: "cycling",
    name: "Adaptive Cycling",
    icon_key: "cycling",
    terms: ["adaptive cycling", "para cycling", "paracycling", "cycling"]
  },
  {
    sport_key: "equestrian",
    name: "Equestrian",
    icon_key: null,
    terms: ["equestrian", "therapeutic riding", "adaptive riding"]
  },
  {
    sport_key: "curling",
    name: "Wheelchair Curling",
    icon_key: null,
    terms: ["wheelchair curling", "curling"]
  },
  {
    sport_key: "golf",
    name: "Adaptive Golf",
    icon_key: null,
    terms: ["adaptive golf", "para golf", "golf"]
  },
  {
    sport_key: "surfing",
    name: "Adaptive Surfing",
    icon_key: null,
    terms: ["adaptive surfing", "surfing"]
  },
  {
    sport_key: "rugby",
    name: "Wheelchair Rugby",
    icon_key: "rugby",
    terms: ["wheelchair rugby", "quad rugby", "murderball", "rugby"]
  },
  {
    sport_key: "shooting",
    name: "Shooting Sports",
    icon_key: null,
    terms: ["shooting sports", "para shooting", "target shooting"]
  },
  {
    sport_key: "volleyball",
    name: "Sitting Volleyball",
    icon_key: null,
    terms: ["sitting volleyball", "sit volleyball", "volleyball"]
  },
  {
    sport_key: "martialarts",
    name: "Martial Arts",
    icon_key: null,
    terms: ["martial arts", "adaptive judo", "para judo", "judo", "taekwondo"]
  },
  {
    sport_key: "boccia",
    name: "Boccia",
    icon_key: null,
    terms: ["boccia"]
  },
  {
    sport_key: "blindsports",
    name: "Blind Sports",
    icon_key: null,
    terms: ["blind sports", "sports for the blind", "visually impaired sports"]
  },
  {
    sport_key: "fencing",
    name: "Wheelchair Fencing",
    icon_key: null,
    terms: ["wheelchair fencing", "fencing"]
  },
  {
    sport_key: "baseball",
    name: "Adaptive Baseball",
    icon_key: "baseball",
    terms: ["adaptive baseball", "baseball"]
  },
  {
    sport_key: "lacrosse",
    name: "Wheelchair Lacrosse",
    icon_key: null,
    terms: ["wheelchair lacrosse", "lacrosse"]
  },
  {
    sport_key: "waterskiing",
    name: "Adaptive Water Skiing",
    icon_key: "waterskiing",
    terms: ["adaptive water skiing", "water skiing", "waterskiing"]
  },
  {
    sport_key: "climbing",
    name: "Adaptive Climbing",
    icon_key: null,
    terms: ["adaptive climbing", "rock climbing", "climbing"]
  },
  {
    sport_key: "pickleball",
    name: "Adaptive Pickleball",
    icon_key: "pickleball",
    terms: ["adaptive pickleball", "pickleball"]
  },
  {
    sport_key: "football",
    name: "Adaptive Football",
    icon_key: "football",
    terms: ["adaptive football", "wheelchair football", "powerchair football", "beep football"]
  },
  {
    sport_key: "goalball",
    name: "Goalball",
    icon_key: "goalball",
    terms: ["goalball"]
  },
  {
    sport_key: "softball",
    name: "Wheelchair Softball",
    icon_key: null,
    terms: ["wheelchair softball", "softball"]
  },
  {
    sport_key: "soccer",
    name: "Power Soccer",
    icon_key: null,
    terms: ["power soccer", "power wheelchair soccer", "powerchair soccer"]
  },
  {
    sport_key: "dance",
    name: "Wheelchair Dance",
    icon_key: null,
    terms: ["wheelchair dance", "adaptive dance", "dance sport"]
  },
  {
    sport_key: "powerlifting",
    name: "Para Powerlifting",
    icon_key: null,
    terms: ["para powerlifting", "powerlifting"]
  },
  {
    sport_key: "triathlon",
    name: "Para Triathlon",
    icon_key: null,
    terms: ["para triathlon", "triathlon"]
  },
  {
    sport_key: "wheelchairracing",
    name: "Wheelchair Racing",
    icon_key: null,
    terms: ["wheelchair racing", "racing wheelchair"]
  },
  {
    sport_key: "handcycling",
    name: "Handcycling",
    icon_key: null,
    terms: ["handcycling", "handcycle"]
  },
  {
    sport_key: "nordicskiing",
    name: "Para Nordic Skiing",
    icon_key: null,
    terms: ["para nordic", "nordic skiing", "cross-country skiing", "cross country skiing"]
  },
  {
    sport_key: "equestrianvaulting",
    name: "Para Equestrian Vaulting",
    icon_key: null,
    terms: ["equestrian vaulting", "para equestrian vaulting"]
  },
  {
    sport_key: "beepbaseball",
    name: "Beep Baseball",
    icon_key: null,
    terms: ["beep baseball"]
  },
  {
    sport_key: "amputeesports",
    name: "Amputee Sports",
    icon_key: null,
    terms: ["amputee sports", "amputee soccer", "amputee softball", "standing amputee", "sitting amputee"]
  },
  {
    sport_key: "handball",
    name: "Wheelchair Handball",
    icon_key: null,
    terms: ["wheelchair handball", "handball"]
  }
];

// src/lanes/classify.js
var CLASSIFY_BATCH = 15;
function escapeRegex(term) {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
__name(escapeRegex, "escapeRegex");
function findHits(text2, gazetteer) {
  if (!text2) return [];
  const hits = [];
  for (const entry of gazetteer) {
    for (const term of entry.terms) {
      const pattern = "\\b" + escapeRegex(term).replace(/\s+/g, "\\s+") + "\\b";
      const match = text2.match(new RegExp(pattern, "i"));
      if (match) hits.push({ sport_key: entry.sport_key, term, index: match.index });
    }
  }
  hits.sort((a, b) => a.index - b.index);
  return hits;
}
__name(findHits, "findHits");
function classifyOrg(org, gazetteer) {
  const nameHits = findHits(org.name || "", gazetteer).map(({ sport_key, term }) => ({ sport_key, term, field: "name" }));
  const descHits = findHits(org.description || "", gazetteer).map(({ sport_key, term }) => ({ sport_key, term, field: "description" }));
  const hits = [...nameHits, ...descHits];
  if (!hits.length) return null;
  const sports = [];
  for (const hit of hits) {
    if (!sports.includes(hit.sport_key)) sports.push(hit.sport_key);
  }
  return { sports, hits, confidence: nameHits.length ? 0.85 : 0.7 };
}
__name(classifyOrg, "classifyOrg");
var GAZETTEER_BY_KEY = new Map(GAZETTEER.map((entry) => [entry.sport_key, entry]));
function stripTags2(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
}
__name(stripTags2, "stripTags");
function classifyPage(html, gazetteer) {
  const hits = findHits(stripTags2(html), gazetteer).map(({ sport_key, term }) => ({ sport_key, term, field: "page" }));
  if (!hits.length) return null;
  const sports = [];
  for (const hit of hits) {
    if (!sports.includes(hit.sport_key)) sports.push(hit.sport_key);
  }
  return { sports, hits, confidence: 0.7 };
}
__name(classifyPage, "classifyPage");
async function classifyLane({ db, cursor }) {
  const { results: orgs } = await db.prepare(
    `SELECT id, name, description, website_url, sport, sport_key, sports_json FROM organizations
     WHERE status = 'active' AND (sport IS NULL OR sport = 'Multi-Sport') AND id > ?
     ORDER BY id LIMIT ?`
  ).bind(cursor, CLASSIFY_BATCH).all();
  if (!orgs.length) return { cursor: "", processed: 0, flagged: 0, detail: "cycle complete, cursor reset" };
  const pending = await pendingOrgIds(db, "classify", orgs.map((o) => o.id));
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const stmts = [];
  let flagged = 0, noSignal = 0, fatal = false;
  for (const org of orgs) {
    if (pending.has(org.id)) continue;
    let result = classifyOrg(org, GAZETTEER);
    if (!result && org.website_url) {
      const page3 = await fetchText(org.website_url);
      if (page3?.fatal) {
        fatal = true;
        break;
      }
      if (page3) result = classifyPage(page3.text, GAZETTEER);
    }
    if (!result) {
      noSignal++;
      continue;
    }
    const entry = GAZETTEER_BY_KEY.get(result.sports[0]);
    if (!entry) continue;
    flagged++;
    stmts.push(proposeStmt(db, org.id, "classify", {
      sport: { from: org.sport, to: entry.name },
      sport_key: { from: org.sport_key, to: entry.icon_key },
      sports_json: { from: org.sports_json ? JSON.parse(org.sports_json) : null, to: result.sports }
    }, {
      hits: result.hits,
      url: result.hits.some((h) => h.field === "page") ? org.website_url : void 0,
      method: "gazetteer v2"
    }, result.confidence, now));
  }
  if (stmts.length) await db.batch(stmts);
  return {
    cursor: orgs[orgs.length - 1].id,
    processed: orgs.length,
    flagged,
    detail: fatal ? "stopped early: subrequest limit" : noSignal ? `${noSignal} without classifiable signal` : null
  };
}
__name(classifyLane, "classifyLane");

// src/lanes/resolve.js
var RESOLVE_CAP = 20;
var SHARED_PLATFORM_SUFFIXES = ["facebook.com", "instagram.com", "sites.google.com"];
var LEGAL_SUFFIXES = /* @__PURE__ */ new Set(["inc", "incorporated", "llc", "corp", "corporation", "co", "ltd", "nfp"]);
function normalizeDomain(url) {
  if (!url || typeof url !== "string") return null;
  let parsed;
  try {
    parsed = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(url) ? url : `https://${url}`);
  } catch {
    return null;
  }
  let host = parsed.hostname.toLowerCase();
  host = host.replace(/^www\./, "");
  host = host.replace(/\.+$/, "");
  if (!host || !host.includes(".")) return null;
  if (SHARED_PLATFORM_SUFFIXES.some((s2) => host === s2 || host.endsWith(`.${s2}`))) return null;
  return host;
}
__name(normalizeDomain, "normalizeDomain");
function normalizeName(name) {
  if (!name || typeof name !== "string") return null;
  let s2 = name.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!s2) return null;
  let tokens = s2.split(" ");
  if (tokens[0] === "the") tokens = tokens.slice(1);
  while (tokens.length && LEGAL_SUFFIXES.has(tokens[tokens.length - 1])) {
    tokens = tokens.slice(0, -1);
  }
  const result = tokens.join(" ");
  return result || null;
}
__name(normalizeName, "normalizeName");
function tokenSet(s2) {
  return new Set(
    String(s2 || "").toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter(Boolean)
  );
}
__name(tokenSet, "tokenSet");
function tokenSetRatio(a, b) {
  const setA = tokenSet(a);
  const setB = tokenSet(b);
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;
  let common = 0;
  for (const t of setA) if (setB.has(t)) common++;
  return 2 * common / (setA.size + setB.size);
}
__name(tokenSetRatio, "tokenSetRatio");
function pickCanonical(a, b) {
  if (!a) return b;
  if (!b) return a;
  const aVerified = a.verification_status === "verified";
  const bVerified = b.verification_status === "verified";
  if (aVerified !== bVerified) return aVerified ? a : b;
  const aHasWebsite = !!a.website_url;
  const bHasWebsite = !!b.website_url;
  if (aHasWebsite !== bHasWebsite) return aHasWebsite ? a : b;
  if (a.created_at !== b.created_at) return a.created_at < b.created_at ? a : b;
  return a.id <= b.id ? a : b;
}
__name(pickCanonical, "pickCanonical");
function unionFind(n) {
  const parent = Array.from({ length: n }, (_, i) => i);
  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }
  __name(find, "find");
  function union(x, y) {
    const rx = find(x);
    const ry = find(y);
    if (rx !== ry) parent[rx] = ry;
  }
  __name(union, "union");
  return { find, union };
}
__name(unionFind, "unionFind");
function resolveGroup(members, tier, scoreFn, claimed, results) {
  const remaining = members.filter((o) => !claimed.has(o.id));
  if (remaining.length < 2) return;
  const canonical = remaining.reduce((best, o) => pickCanonical(best, o));
  claimed.add(canonical.id);
  for (const o of remaining) {
    if (o.id === canonical.id) continue;
    results.push({ dupId: o.id, canonicalId: canonical.id, tier, score: scoreFn(o, canonical) });
    claimed.add(o.id);
  }
}
__name(resolveGroup, "resolveGroup");
function findDuplicates(orgs) {
  const claimed = /* @__PURE__ */ new Set();
  const results = [];
  const byDomain = /* @__PURE__ */ new Map();
  for (const o of orgs) {
    const d = normalizeDomain(o.website_url);
    if (!d) continue;
    if (!byDomain.has(d)) byDomain.set(d, []);
    byDomain.get(d).push(o);
  }
  for (const group of byDomain.values()) resolveGroup(group, "domain", () => 1, claimed, results);
  const byNameState = /* @__PURE__ */ new Map();
  for (const o of orgs) {
    if (claimed.has(o.id)) continue;
    const n = normalizeName(o.name);
    if (!n || !o.state) continue;
    const key = `${n}|${o.state.toLowerCase()}`;
    if (!byNameState.has(key)) byNameState.set(key, []);
    byNameState.get(key).push(o);
  }
  for (const group of byNameState.values()) resolveGroup(group, "name-state", () => 1, claimed, results);
  const byCityState = /* @__PURE__ */ new Map();
  for (const o of orgs) {
    if (claimed.has(o.id) || !o.city || !o.state) continue;
    const key = `${o.city.trim().toLowerCase()}|${o.state.trim().toLowerCase()}`;
    if (!byCityState.has(key)) byCityState.set(key, []);
    byCityState.get(key).push(o);
  }
  for (const bucket of byCityState.values()) {
    if (bucket.length < 2) continue;
    const uf = unionFind(bucket.length);
    for (let i = 0; i < bucket.length; i++) {
      for (let j = i + 1; j < bucket.length; j++) {
        if (tokenSetRatio(bucket[i].name, bucket[j].name) >= 0.9) uf.union(i, j);
      }
    }
    const groups = /* @__PURE__ */ new Map();
    for (let i = 0; i < bucket.length; i++) {
      const r = uf.find(i);
      if (!groups.has(r)) groups.set(r, []);
      groups.get(r).push(bucket[i]);
    }
    for (const members of groups.values()) {
      resolveGroup(members, "fuzzy", (o, canonical) => tokenSetRatio(o.name, canonical.name), claimed, results);
    }
  }
  return results;
}
__name(findDuplicates, "findDuplicates");
var CONFIDENCE_BY_TIER = { domain: 0.95, "name-state": 0.9, fuzzy: 0.75 };
async function resolveLane({ db, cursor }) {
  const { results: orgs } = await db.prepare(
    `SELECT id, name, state, city, website_url, verification_status, created_at
     FROM organizations WHERE status='active'`
  ).all();
  if (!orgs.length) return { cursor: "", processed: 0, flagged: 0, detail: "no candidates" };
  const { results: proposedRows } = await db.prepare(
    `SELECT DISTINCT organization_id FROM review_queue WHERE lane='resolve'`
  ).all();
  const alreadyProposed = new Set(proposedRows.map((r) => r.organization_id));
  const candidates = findDuplicates(orgs).filter((d) => !alreadyProposed.has(d.dupId));
  const toPropose = candidates.slice(0, RESOLVE_CAP);
  const remaining = candidates.length - toPropose.length;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const stmts = toPropose.map(
    (d) => proposeStmt(
      db,
      d.dupId,
      "resolve",
      { status: { from: "active", to: "duplicate" } },
      { duplicate_of: d.canonicalId, tier: d.tier, score: d.score, method: "deterministic-dedup v1" },
      CONFIDENCE_BY_TIER[d.tier],
      now
    )
  );
  if (stmts.length) await db.batch(stmts);
  return {
    cursor: "",
    processed: orgs.length,
    flagged: toPropose.length,
    detail: remaining > 0 ? `${remaining} more candidates queued for later runs` : null
  };
}
__name(resolveLane, "resolveLane");

// src/google.js
var TOKEN_TTL = 3600;
var SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
async function getGoogleAccessToken(env, scope = SHEETS_SCOPE) {
  if (!env.GOOGLE_SA_JSON) throw new Error("GOOGLE_SA_JSON not configured");
  const sa = JSON.parse(env.GOOGLE_SA_JSON);
  const now = Math.floor(Date.now() / 1e3);
  const enc = /* @__PURE__ */ __name((o) => b64url(new TextEncoder().encode(JSON.stringify(o))), "enc");
  const head = enc({ alg: "RS256", typ: "JWT" });
  const claim = enc({ iss: sa.client_email, scope, aud: sa.token_uri, iat: now, exp: now + TOKEN_TTL });
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${head}.${claim}`));
  const jwt = `${head}.${claim}.${b64url(new Uint8Array(sig))}`;
  const res = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt })
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("no access_token: " + JSON.stringify(data));
  return data.access_token;
}
__name(getGoogleAccessToken, "getGoogleAccessToken");
function b64url(bytes) {
  let s2 = "";
  for (let i = 0; i < bytes.length; i++) s2 += String.fromCharCode(bytes[i]);
  return btoa(s2).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(b64url, "b64url");
function pemToDer(pem) {
  const b64 = pem.replace(/-----BEGIN [^-]+-----/, "").replace(/-----END [^-]+-----/, "").replace(/\s+/g, "");
  const bin = atob(b64);
  const der = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) der[i] = bin.charCodeAt(i);
  return der.buffer;
}
__name(pemToDer, "pemToDer");

// src/sheet.js
var API = "https://sheets.googleapis.com/v4/spreadsheets";
function colLetter(n) {
  let s2 = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s2 = String.fromCharCode(65 + r) + s2;
    n = Math.floor((n - 1) / 26);
  }
  return s2;
}
__name(colLetter, "colLetter");
async function call(token, method, path, body) {
  const res = await fetch(`${API}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body === void 0 ? void 0 : JSON.stringify(body)
  });
  if (!res.ok) {
    const text2 = await res.text().catch(() => "");
    throw new Error(`sheets ${method} ${path.split("?")[0].slice(0, 80)} -> ${res.status} ${text2.slice(0, 300)}`);
  }
  return res.json();
}
__name(call, "call");
async function getTabs(token, sheetId) {
  const meta = await call(token, "GET", `${sheetId}?fields=sheets.properties(sheetId,title,gridProperties)`);
  const out = /* @__PURE__ */ new Map();
  for (const s2 of meta.sheets || []) out.set(s2.properties.title, s2.properties);
  return out;
}
__name(getTabs, "getTabs");
async function ensureTabs(token, sheetId, specs) {
  const have = await getTabs(token, sheetId);
  const requests = [];
  const created = [];
  for (const spec of specs) {
    if (have.has(spec.title)) continue;
    created.push(spec.title);
    requests.push({
      addSheet: {
        properties: {
          title: spec.title,
          gridProperties: { frozenRowCount: 1, rowCount: Math.max(spec.minRows || 200, 2), columnCount: spec.columns.length }
        }
      }
    });
  }
  if (!requests.length) return { tabs: have, created };
  await call(token, "POST", `${sheetId}:batchUpdate`, { requests });
  return { tabs: await getTabs(token, sheetId), created };
}
__name(ensureTabs, "ensureTabs");
async function dropDefaultTab(token, sheetId, tabs) {
  const def = tabs.get("Sheet1");
  if (!def || tabs.size < 2) return;
  await call(token, "POST", `${sheetId}:batchUpdate`, { requests: [{ deleteSheet: { sheetId: def.sheetId } }] });
  tabs.delete("Sheet1");
}
__name(dropDefaultTab, "dropDefaultTab");
async function writeTables(token, sheetId, tabs, tables) {
  const data = [];
  const clears = [];
  for (const t of tables) {
    const cols = Math.max(...t.rows.map((r) => r.length), 1);
    const last = colLetter(cols);
    data.push({ range: `'${t.title}'!A1:${last}${t.rows.length}`, majorDimension: "ROWS", values: t.rows });
    const grid = tabs.get(t.title)?.gridProperties;
    if (grid && grid.rowCount > t.rows.length) {
      clears.push(`'${t.title}'!A${t.rows.length + 1}:${colLetter(Math.max(cols, grid.columnCount || cols))}${grid.rowCount}`);
    }
  }
  const upd = await call(token, "POST", `${sheetId}/values:batchUpdate`, {
    valueInputOption: "RAW",
    includeValuesInResponse: false,
    data
  });
  if (clears.length) await call(token, "POST", `${sheetId}/values:batchClear`, { ranges: clears });
  return { updatedCells: upd.totalUpdatedCells || 0, tabs: tables.length };
}
__name(writeTables, "writeTables");
async function readRange(token, sheetId, range, width) {
  const r = await call(token, "GET", `${sheetId}/values/${encodeURIComponent(range)}?majorDimension=ROWS`);
  return (r.values || []).map((row) => {
    const out = [];
    for (let i = 0; i < width; i++) out.push(row[i] === void 0 || row[i] === null ? "" : String(row[i]));
    return out;
  });
}
__name(readRange, "readRange");
async function writeCells(token, sheetId, stamps) {
  if (!stamps.length) return 0;
  const r = await call(token, "POST", `${sheetId}/values:batchUpdate`, {
    valueInputOption: "RAW",
    includeValuesInResponse: false,
    data: stamps.map((s2) => ({ range: s2.range, majorDimension: "ROWS", values: s2.values }))
  });
  return r.totalUpdatedCells || 0;
}
__name(writeCells, "writeCells");
async function applyIntakeValidation(token, sheetId, tabs, intakeTitle, sportsTitle, stateCodes, columns) {
  const tab = tabs.get(intakeTitle);
  const sports = tabs.get(sportsTitle);
  if (!tab || !sports) return;
  const col = /* @__PURE__ */ __name((name) => columns.indexOf(name), "col");
  const requests = [
    {
      setDataValidation: {
        range: { sheetId: tab.sheetId, startRowIndex: 1, startColumnIndex: col("State"), endColumnIndex: col("State") + 1 },
        rule: {
          condition: { type: "ONE_OF_LIST", values: stateCodes.map((c) => ({ userEnteredValue: c })) },
          strict: false,
          showCustomUi: true,
          inputMessage: "Two-letter USPS code (full state names are accepted too)."
        }
      }
    },
    {
      setDataValidation: {
        range: { sheetId: tab.sheetId, startRowIndex: 1, startColumnIndex: col("Sport"), endColumnIndex: col("Sport") + 1 },
        rule: {
          condition: { type: "ONE_OF_RANGE", values: [{ userEnteredValue: `='${sportsTitle}'!$B$2:$B$500` }] },
          strict: false,
          showCustomUi: true,
          inputMessage: "Pick from the Sports tab, or leave blank for multi-sport."
        }
      }
    },
    {
      repeatCell: {
        range: { sheetId: tab.sheetId, startRowIndex: 0, endRowIndex: 1 },
        cell: { userEnteredFormat: { textFormat: { bold: true } } },
        fields: "userEnteredFormat.textFormat.bold"
      }
    },
    // Machine-owned columns get a grey background so nobody types there.
    {
      repeatCell: {
        range: { sheetId: tab.sheetId, startRowIndex: 0, startColumnIndex: col("Status"), endColumnIndex: columns.length },
        cell: { userEnteredFormat: { backgroundColor: { red: 0.93, green: 0.93, blue: 0.93 } } },
        fields: "userEnteredFormat.backgroundColor"
      }
    }
  ];
  await call(token, "POST", `${sheetId}:batchUpdate`, { requests });
}
__name(applyIntakeValidation, "applyIntakeValidation");

// src/lanes/sheet-intake.js
var INTAKE_TITLE = "Intake";
var INTAKE_COLUMNS = [
  "Name",
  "Website",
  "City",
  "State",
  "Sport",
  "Type",
  "Email",
  "Phone",
  "Notes",
  "Source",
  "Status",
  "Org ID",
  "Result",
  "Processed"
];
var STATUS_COL = INTAKE_COLUMNS.indexOf("Status");
var MAX_ROWS_PER_PASS = 250;
var STATES = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  PR: "Puerto Rico",
  GU: "Guam",
  VI: "U.S. Virgin Islands"
};
var STATE_CODES = Object.keys(STATES);
var STATE_BY_NAME = new Map(Object.entries(STATES).map(([code, name]) => [name.toLowerCase(), code]));
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function parseState(raw) {
  const t = (raw || "").trim();
  if (!t) return null;
  const up = t.toUpperCase();
  if (STATES[up]) return up;
  return STATE_BY_NAME.get(t.toLowerCase().replace(/\s+/g, " ")) || null;
}
__name(parseState, "parseState");
function normalizeWebsite(raw) {
  const t = (raw || "").trim();
  if (!t) return { url: null, domain: null, valid: true };
  const url = /^[a-z][a-z0-9+.-]*:\/\//i.test(t) ? t : `https://${t}`;
  let valid = false;
  try {
    const h = new URL(url).hostname;
    valid = /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(h) && !/\s/.test(t);
  } catch {
    valid = false;
  }
  return { url: valid ? url : null, domain: valid ? normalizeDomain(url) : null, valid };
}
__name(normalizeWebsite, "normalizeWebsite");
function rowToRecord(cells) {
  const g = /* @__PURE__ */ __name((name) => (cells[INTAKE_COLUMNS.indexOf(name)] || "").trim(), "g");
  return {
    name: g("Name"),
    website: g("Website"),
    city: g("City"),
    state: g("State"),
    sport: g("Sport"),
    type: g("Type"),
    email: g("Email"),
    phone: g("Phone"),
    notes: g("Notes"),
    source: g("Source"),
    status: g("Status")
  };
}
__name(rowToRecord, "rowToRecord");
function admit(rec, index) {
  if (!rec.name) return { outcome: "rejected", reason: "name is required", result: "Add the organization's name." };
  const state = parseState(rec.state);
  if (!state) {
    return rec.state ? { outcome: "rejected", reason: "state not recognised", result: `"${rec.state}" is not a US state or territory; use the two-letter code.` } : { outcome: "rejected", reason: "state is required", result: "Add the two-letter state code." };
  }
  const { url, domain, valid } = normalizeWebsite(rec.website);
  if (rec.website && !valid) {
    return { outcome: "rejected", reason: "website not recognised", result: `"${rec.website}" does not look like a website address.` };
  }
  if (rec.email && !EMAIL_RE.test(rec.email)) {
    return { outcome: "rejected", reason: "email not recognised", result: `"${rec.email}" does not look like an email address.` };
  }
  let sport = null;
  if (rec.sport) {
    sport = index.sportsByName.get(rec.sport.toLowerCase()) || null;
    if (!sport) return { outcome: "rejected", reason: "sport not in Sports tab", result: `"${rec.sport}" is not on the Sports tab; pick one from the list or leave blank.` };
  }
  const nameKey = normalizeName(rec.name);
  if (!nameKey) return { outcome: "rejected", reason: "name is required", result: "The name has no letters or numbers in it." };
  const existing = domain && index.byDomain.get(domain) || index.byNameState.get(`${nameKey}|${state}`) || null;
  if (existing) {
    const matchedBy = domain && index.byDomain.get(domain) === existing ? "website" : "name and state";
    const enrich = {};
    if (url && !existing.website_url) enrich.website_url = { from: null, to: url };
    if (rec.email && !existing.email) enrich.email = { from: null, to: rec.email.toLowerCase() };
    if (rec.phone && !existing.phone) enrich.phone = { from: null, to: rec.phone };
    if (rec.city && !existing.city) enrich.city = { from: null, to: rec.city };
    return {
      outcome: "duplicate",
      existing,
      matchedBy,
      enrich,
      result: `Already listed as "${existing.name}" (matched by ${matchedBy})` + (Object.keys(enrich).length ? `; proposed ${Object.keys(enrich).join(", ")} for review.` : ".")
    };
  }
  return {
    outcome: "admitted",
    state,
    url,
    domain,
    nameKey,
    sport,
    result: url ? "Added to the directory; public on the site." : "Added, but hidden on the site until it has a website (name-only listings are not shown)."
  };
}
__name(admit, "admit");
async function intakeKey(nameKey, domain, state) {
  const data = new TextEncoder().encode(`${nameKey}|${domain || ""}|${state}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).slice(0, 8).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(intakeKey, "intakeKey");
function sourceIdFor(sourceName) {
  const slug = sourceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  return `team:${slug || "intake"}`;
}
__name(sourceIdFor, "sourceIdFor");
async function sheetIntakeLane({ db, env }) {
  const sheetId = env.ASNM_MASTER_SHEET_ID;
  if (!sheetId) throw new Error("ASNM_MASTER_SHEET_ID not configured");
  const token = await getGoogleAccessToken(env, SHEETS_SCOPE);
  const width = INTAKE_COLUMNS.length;
  let rows;
  try {
    rows = await readRange(token, sheetId, `'${INTAKE_TITLE}'!A2:${colLetter(width)}`, width);
  } catch (err) {
    if (/400|Unable to parse range/.test(String(err))) return { cursor: "", processed: 0, flagged: 0, detail: "no Intake tab yet" };
    throw err;
  }
  const candidates = [];
  rows.forEach((cells, i) => {
    const rec = rowToRecord(cells);
    if (rec.status) return;
    if (!rec.name && !rec.website) return;
    candidates.push({ rowNumber: i + 2, rec });
  });
  if (!candidates.length) return { cursor: "", processed: 0, flagged: 0, detail: "no new rows" };
  const batch = candidates.slice(0, MAX_ROWS_PER_PASS);
  const [orgRows, sportRows] = await Promise.all([
    db.prepare(`SELECT id, name, website_url, state, email, phone, city, intake_row FROM organizations`).all().then((r) => r.results),
    db.prepare(`SELECT sport_key, name FROM sports`).all().then((r) => r.results)
  ]);
  const index = { byDomain: /* @__PURE__ */ new Map(), byNameState: /* @__PURE__ */ new Map(), byIntakeKey: /* @__PURE__ */ new Map(), sportsByName: /* @__PURE__ */ new Map() };
  for (const o of orgRows) {
    const d = normalizeDomain(o.website_url);
    if (d && !index.byDomain.has(d)) index.byDomain.set(d, o);
    const nk = normalizeName(o.name);
    if (nk && o.state && !index.byNameState.has(`${nk}|${o.state}`)) index.byNameState.set(`${nk}|${o.state}`, o);
    if (o.intake_row) index.byIntakeKey.set(o.intake_row, o);
  }
  for (const sp of sportRows) index.sportsByName.set(sp.name.toLowerCase(), sp);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const stmts = [];
  const stamps = [];
  const sourcesSeen = /* @__PURE__ */ new Set();
  let admitted = 0, duplicates = 0, rejected = 0, proposals = 0;
  const pendingByOrg = new Set(
    (await db.prepare(`SELECT DISTINCT organization_id FROM review_queue WHERE lane = 'enrich' AND status = 'pending'`).all()).results.map((r) => r.organization_id)
  );
  for (const { rowNumber, rec } of batch) {
    const decision = admit(rec, index);
    let status, orgId = "", result = decision.result;
    if (decision.outcome === "admitted") {
      const key = await intakeKey(decision.nameKey, decision.domain, decision.state);
      const prior = index.byIntakeKey.get(key);
      if (prior) {
        status = "admitted";
        orgId = prior.id;
        result = "Added to the directory (stamp recovered).";
      } else {
        orgId = crypto.randomUUID();
        const sourceName = rec.source || "ASNM Master Intake";
        const sourceId = sourceIdFor(sourceName);
        const notes = [rec.notes && `intake: ${rec.notes}`, `intake row ${rowNumber} \xB7 source: ${sourceName} \xB7 ${now}`].filter(Boolean).join("\n");
        stmts.push(
          db.prepare(
            `INSERT INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, email, phone, city, state, state_name,
               country, primary_data_source, verification_status, status, is_public, internal_notes, intake_row, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'United States', ?, 'pending', 'active', ?, ?, ?, ?, ?)`
          ).bind(
            orgId,
            rec.name,
            rec.type || null,
            decision.sport ? decision.sport.name : "Multi-Sport",
            decision.sport ? decision.sport.sport_key : null,
            JSON.stringify(decision.sport ? [decision.sport.sport_key] : []),
            decision.url,
            rec.email ? rec.email.toLowerCase() : null,
            rec.phone || null,
            rec.city || null,
            decision.state,
            STATES[decision.state],
            sourceName,
            decision.url ? 1 : 0,
            notes,
            key,
            now,
            now
          )
        );
        if (!sourcesSeen.has(sourceId)) {
          sourcesSeen.add(sourceId);
          stmts.push(
            db.prepare(
              `INSERT INTO data_sources (source_id, source_name, source_type, coverage_scope, status)
               VALUES (?, ?, 'team research', 'ASNM Master Intake tab', 'active')
               ON CONFLICT(source_id) DO NOTHING`
            ).bind(sourceId, sourceName)
          );
        }
        stmts.push(
          db.prepare(
            `INSERT INTO organization_data_sources (organization_id, source_id, source_record_url, retrieved_at, verified)
             VALUES (?, ?, ?, ?, 0)`
          ).bind(orgId, sourceId, decision.url, now)
        );
        const fake = { id: orgId, name: rec.name, website_url: decision.url, state: decision.state, email: rec.email || null, phone: rec.phone || null, city: rec.city || null };
        if (decision.domain) index.byDomain.set(decision.domain, fake);
        index.byNameState.set(`${decision.nameKey}|${decision.state}`, fake);
        index.byIntakeKey.set(key, fake);
        status = "admitted";
        admitted++;
      }
    } else if (decision.outcome === "duplicate") {
      status = `duplicate:${decision.existing.id}`;
      orgId = decision.existing.id;
      duplicates++;
      const fields = Object.keys(decision.enrich);
      if (fields.length && !pendingByOrg.has(decision.existing.id)) {
        stmts.push(proposeStmt(
          db,
          decision.existing.id,
          "enrich",
          decision.enrich,
          { source: "ASNM Master Intake", sheet_row: rowNumber, source_name: rec.source || null, matched_by: decision.matchedBy },
          0.85,
          now
        ));
        pendingByOrg.add(decision.existing.id);
        proposals++;
      } else if (fields.length) {
        result = `Already listed as "${decision.existing.name}" (matched by ${decision.matchedBy}); a proposal for it is already pending review.`;
      }
    } else {
      status = `rejected:${decision.reason}`;
      rejected++;
    }
    stamps.push({
      range: `'${INTAKE_TITLE}'!${colLetter(STATUS_COL + 1)}${rowNumber}:${colLetter(width)}${rowNumber}`,
      values: [[status, orgId, result, now]]
    });
  }
  if (stmts.length) await db.batch(stmts);
  await writeCells(token, sheetId, stamps);
  return {
    cursor: now,
    processed: batch.length,
    flagged: rejected,
    detail: JSON.stringify({ admitted, duplicates, rejected, proposals, remaining: candidates.length - batch.length })
  };
}
__name(sheetIntakeLane, "sheetIntakeLane");

// src/lanes/sheet-export.js
var TABS = {
  readme: "README",
  organizations: "Organizations",
  intake: INTAKE_TITLE,
  sports: "Sports",
  sources: "Sources",
  queue: "Queue",
  changes: "Recent Changes",
  submissions: "Submissions"
};
var ORG_COLUMNS = [
  "ID",
  "Name",
  "Type",
  "Sport",
  "Other sports",
  "Website",
  "City",
  "State",
  "Zip",
  "Email",
  "Phone",
  "Description",
  "Cost",
  "Ages",
  "Equipment",
  "Verification",
  "Sources",
  "Quality",
  "Last checked",
  "Public",
  "Updated"
];
var SPORT_COLUMNS = ["Key", "Name", "Super type", "Category", "Paralympic", "Team"];
var SOURCE_COLUMNS = ["Source", "Type", "URL", "Claimed rows", "Orgs linked", "Drive file", "Ingested", "Notes"];
var QUEUE_COLUMNS = ["Item", "Lane", "Org", "Proposed change", "Evidence", "Confidence", "Age (days)"];
var CHANGE_COLUMNS = ["When", "Org", "Field", "From", "To", "By", "Evidence"];
var SUBMISSION_COLUMNS = ["Received", "Kind", "Program", "Org", "Sport", "City", "State", "Email", "Notes", "Status"];
var QUEUE_CAP = 2e3;
var CHANGES_CAP = 1e3;
var SUBMISSIONS_CAP = 2e3;
var TAB_SPECS = [
  { title: TABS.readme, columns: ["ASNM Master"], minRows: 40 },
  { title: TABS.intake, columns: INTAKE_COLUMNS, minRows: 2e3 },
  { title: TABS.organizations, columns: ORG_COLUMNS, minRows: 4e3 },
  { title: TABS.sports, columns: SPORT_COLUMNS, minRows: 100 },
  { title: TABS.sources, columns: SOURCE_COLUMNS, minRows: 200 },
  { title: TABS.queue, columns: QUEUE_COLUMNS, minRows: QUEUE_CAP + 1 },
  { title: TABS.changes, columns: CHANGE_COLUMNS, minRows: CHANGES_CAP + 1 },
  { title: TABS.submissions, columns: SUBMISSION_COLUMNS, minRows: SUBMISSIONS_CAP + 1 }
];
var s = /* @__PURE__ */ __name((v) => v === null || v === void 0 ? "" : String(v), "s");
function orgToRow(o, sportsByKey) {
  let others = [];
  try {
    const keys = JSON.parse(o.sports_json || "[]");
    others = (Array.isArray(keys) ? keys : []).filter((k) => k && k !== o.sport_key).map((k) => sportsByKey.get(k)?.name || k);
  } catch {
  }
  return [
    s(o.id),
    s(o.name),
    s(o.org_type),
    s(o.sport),
    others.join("; "),
    s(o.website_url),
    s(o.city),
    s(o.state),
    s(o.zip),
    s(o.email),
    s(o.phone),
    s(o.description),
    s(o.cost_note),
    s(o.ages),
    o.equipment_provided === 1 ? "Yes" : o.equipment_provided === 0 ? "No" : "",
    s(o.verification_status),
    s(o.sources),
    s(o.data_quality_rating),
    s(o.last_checked_at).slice(0, 10),
    o.is_public ? "Yes" : "No",
    s(o.updated_at).slice(0, 16).replace("T", " ")
  ];
}
__name(orgToRow, "orgToRow");
function sportToRow(sp) {
  return [s(sp.sport_key), s(sp.name), s(sp.super_type), s(sp.category), sp.is_paralympic ? "Yes" : "No", sp.is_team ? "Yes" : "No"];
}
__name(sportToRow, "sportToRow");
function sourceToRow(src) {
  const url = s(src.source_url);
  const isDrive = /docs\.google\.com|drive\.google\.com/.test(url);
  return [
    s(src.source_name),
    s(src.source_type),
    url,
    s(src.record_count),
    s(src.orgs_linked),
    isDrive ? url : "",
    s(src.status),
    s(src.coverage_scope)
  ];
}
__name(sourceToRow, "sourceToRow");
function describeChange(changeJson) {
  const change = safeParse(changeJson);
  if (!change || typeof change !== "object") return s(changeJson).slice(0, 500);
  return Object.entries(change).map(([field, d]) => {
    if (d && typeof d === "object" && ("to" in d || "from" in d)) return `${field}: ${short(d.from)} \u2192 ${short(d.to)}`;
    return `${field}: ${short(d)}`;
  }).join("; ").slice(0, 1e3);
}
__name(describeChange, "describeChange");
function queueToRow(q, nowMs) {
  const age = q.created_at ? Math.max(0, Math.round((nowMs - Date.parse(q.created_at)) / 864e5)) : "";
  return [
    s(q.item_id),
    s(q.lane),
    s(q.org_name || q.organization_id),
    describeChange(q.proposed_change),
    s(q.evidence).slice(0, 500),
    q.confidence === null || q.confidence === void 0 ? "" : String(q.confidence),
    s(age)
  ];
}
__name(queueToRow, "queueToRow");
function changeToRows(q) {
  const change = safeParse(q.proposed_change);
  const when = s(q.resolved_at || q.created_at).slice(0, 16).replace("T", " ");
  const org = s(q.org_name || q.organization_id);
  const by = s(q.resolved_by);
  const ev = s(q.evidence).slice(0, 300);
  if (!change || typeof change !== "object") return [[when, org, "", "", s(q.proposed_change).slice(0, 300), by, ev]];
  return Object.entries(change).map(([field, d]) => {
    const isPair = d && typeof d === "object" && ("to" in d || "from" in d);
    return [when, org, field, isPair ? short(d.from) : "", isPair ? short(d.to) : short(d), by, ev];
  });
}
__name(changeToRows, "changeToRows");
function submissionToRow(sub) {
  const p = safeParse(sub.payload) || {};
  return [
    s(sub.created_at).slice(0, 16).replace("T", " "),
    s(sub.kind),
    s(p.program),
    s(p.org),
    s(p.sport),
    s(p.city),
    s(p.state),
    s(sub.contact_email),
    s(p.notes).slice(0, 1e3),
    s(sub.status)
  ];
}
__name(submissionToRow, "submissionToRow");
function readmeRows(exportedAt, counts) {
  return [
    [`ASNM Master \u2014 exported from the live directory (Cloudflare D1) at ${exportedAt}`],
    [`Organizations: ${counts.organizations} \xB7 Sports: ${counts.sports} \xB7 Sources: ${counts.sources} \xB7 Queue pending: ${counts.queue} \xB7 Submissions: ${counts.submissions}`],
    [""],
    ["This sheet is a window onto the directory, regenerated automatically. The website never reads it."],
    [""],
    ["HOW TO ADD AN ORGANIZATION"],
    ["1. Open the Intake tab and type one row: Name and State are required; Website, City, Sport, Type, Email, Phone, Notes, Source are optional."],
    ["2. Within about 20 minutes the grey columns fill in: Status = admitted, duplicate:<id>, or rejected:<reason>."],
    ["3. An admitted row appears on the Organizations tab at the next export and on the website (behind the launch gate until launch)."],
    ["4. A stamped row is never re-read. To correct something, add a new row; edits to existing listings go through the review queue."],
    [""],
    ["TABS"],
    ["Intake \u2014 the only tab people type in. Everything else is machine-written and overwritten each pass."],
    ["Organizations \u2014 the directory as the site sees it. Sources \u2014 where the data came from. Sports \u2014 the taxonomy the Sport column must match."],
    ["Queue \u2014 pending machine proposals awaiting a human. Recent Changes \u2014 approved changes, newest first. Submissions \u2014 the public add-a-program form."],
    [""],
    ["Contract: docs/ASNM-MASTER.md in adapttolife/adaptivesportsnearme (Spec 174)."]
  ];
}
__name(readmeRows, "readmeRows");
function short(v) {
  if (v === null || v === void 0) return "";
  const t = typeof v === "string" ? v : JSON.stringify(v);
  return t.length > 200 ? t.slice(0, 197) + "\u2026" : t;
}
__name(short, "short");
function safeParse(t) {
  if (t === null || t === void 0) return null;
  if (typeof t === "object") return t;
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}
__name(safeParse, "safeParse");
async function sheetExportLane({ db, env }) {
  const sheetId = env.ASNM_MASTER_SHEET_ID;
  if (!sheetId) throw new Error("ASNM_MASTER_SHEET_ID not configured");
  let rowsRead = 0;
  const trackRows = (r) => { rowsRead += Number(r.meta?.rows_read || 0); return r.results; };
  const [orgs, sports, sources, queue, changes, subs] = await Promise.all([
    db.prepare(
      `SELECT o.*, (SELECT group_concat(s.source_name, '; ') FROM organization_data_sources ods
                    JOIN data_sources s ON s.source_id = ods.source_id WHERE ods.organization_id = o.id) AS sources
       FROM organizations o ORDER BY o.name COLLATE NOCASE`
    ).all().then(trackRows),
    db.prepare(`SELECT * FROM sports ORDER BY name COLLATE NOCASE`).all().then(trackRows),
    db.prepare(
      `SELECT d.*, COALESCE(c.orgs_linked, 0) AS orgs_linked
       FROM data_sources d
       LEFT JOIN (SELECT source_id, count(*) AS orgs_linked
                  FROM organization_data_sources GROUP BY source_id) c
         ON c.source_id = d.source_id
       ORDER BY d.source_name COLLATE NOCASE`
    ).all().then(trackRows),
    db.prepare(
      `SELECT r.item_id, r.lane, r.organization_id, r.proposed_change, r.evidence, r.confidence, r.created_at, o.name AS org_name
       FROM review_queue r LEFT JOIN organizations o ON o.id = r.organization_id
       WHERE r.status = 'pending' ORDER BY r.created_at ASC LIMIT ${QUEUE_CAP}`
    ).all().then(trackRows),
    db.prepare(
      `SELECT r.proposed_change, r.evidence, r.resolved_at, r.resolved_by, r.created_at, r.organization_id, o.name AS org_name
       FROM review_queue r LEFT JOIN organizations o ON o.id = r.organization_id
       WHERE r.status = 'approved' ORDER BY r.resolved_at DESC LIMIT ${CHANGES_CAP}`
    ).all().then(trackRows),
    db.prepare(`SELECT * FROM submissions ORDER BY created_at DESC LIMIT ${SUBMISSIONS_CAP}`).all().then(trackRows)
  ]);
  const sportsByKey = new Map(sports.map((sp) => [sp.sport_key, sp]));
  const nowMs = Date.now();
  const exportedAt = new Date(nowMs).toISOString().slice(0, 16).replace("T", " ") + " UTC";
  const counts = { organizations: orgs.length, sports: sports.length, sources: sources.length, queue: queue.length, submissions: subs.length };
  const tables = [
    { title: TABS.readme, rows: readmeRows(exportedAt, counts) },
    { title: TABS.organizations, rows: [ORG_COLUMNS, ...orgs.map((o) => orgToRow(o, sportsByKey))] },
    { title: TABS.sports, rows: [SPORT_COLUMNS, ...sports.map(sportToRow)] },
    { title: TABS.sources, rows: [SOURCE_COLUMNS, ...sources.map(sourceToRow)] },
    { title: TABS.queue, rows: [QUEUE_COLUMNS, ...queue.map((q) => queueToRow(q, nowMs))] },
    { title: TABS.changes, rows: [CHANGE_COLUMNS, ...changes.flatMap(changeToRows)] },
    { title: TABS.submissions, rows: [SUBMISSION_COLUMNS, ...subs.map(submissionToRow)] }
  ];
  const token = await getGoogleAccessToken(env, SHEETS_SCOPE);
  const { tabs, created } = await ensureTabs(token, sheetId, TAB_SPECS);
  if (created.includes(TABS.intake)) {
    await writeCells(token, sheetId, [{ range: `'${TABS.intake}'!A1:${colLetter(INTAKE_COLUMNS.length)}1`, values: [INTAKE_COLUMNS] }]);
    await applyIntakeValidation(token, sheetId, tabs, TABS.intake, TABS.sports, STATE_CODES, INTAKE_COLUMNS);
  }
  if (created.length) await dropDefaultTab(token, sheetId, tabs);
  const wrote = await writeTables(token, sheetId, tabs, tables);
  return {
    cursor: exportedAt,
    processed: orgs.length,
    flagged: 0,
    detail: JSON.stringify({ ...counts, rows_read: rowsRead, cells: wrote.updatedCells, created })
  };
}
__name(sheetExportLane, "sheetExportLane");

// src/pipeline.js
var LANES = {
  validate: validateLane,
  enrich: enrichLane,
  classify: classifyLane,
  resolve: resolveLane,
  geocode: geocodeLane,
  "sheet-export": sheetExportLane,
  "sheet-intake": sheetIntakeLane
};
var DISPATCH_ROTATION = ["enrich", "classify", "geocode", "resolve"];
async function runLane(env, lane) {
  if (lane === "dispatch") return runDispatch(env);
  if (lane === "sheets") return runSheets(env);
  const impl = LANES[lane];
  if (!impl) throw new Error(`unknown lane: ${lane}`);
  const db = env.DB;
  const started = (/* @__PURE__ */ new Date()).toISOString();
  const cursor = (await db.prepare(`SELECT cursor FROM lane_cursors WHERE lane = ?`).bind(lane).first())?.cursor || "";
  const result = await impl({ db, env, cursor });
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.batch([
    db.prepare(
      `INSERT INTO lane_cursors (lane, cursor, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(lane) DO UPDATE SET cursor = excluded.cursor, updated_at = excluded.updated_at`
    ).bind(lane, result.cursor, now),
    db.prepare(
      `INSERT INTO pipeline_runs (lane, started_at, finished_at, items_processed, items_flagged, detail)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(lane, started, now, result.processed, result.flagged, result.detail || null)
  ]);
  return { lane, ...result, started, finished: now };
}
__name(runLane, "runLane");
async function runDispatch(env) {
  const db = env.DB;
  const last = (await db.prepare(`SELECT cursor FROM lane_cursors WHERE lane = 'dispatch'`).first())?.cursor || "";
  const next = DISPATCH_ROTATION[(DISPATCH_ROTATION.indexOf(last) + 1) % DISPATCH_ROTATION.length];
  const result = await runLane(env, next);
  await db.prepare(
    `INSERT INTO lane_cursors (lane, cursor, updated_at) VALUES ('dispatch', ?, ?)
     ON CONFLICT(lane) DO UPDATE SET cursor = excluded.cursor, updated_at = excluded.updated_at`
  ).bind(next, (/* @__PURE__ */ new Date()).toISOString()).run();
  return result;
}
__name(runDispatch, "runDispatch");
async function runSheets(env) {
  let intake;
  try {
    intake = await runLane(env, "sheet-intake");
  } catch (err) {
    console.error("sheet-intake failed:", err);
    intake = { processed: 0, flagged: 0, error: String(err && err.message || err) };
  }
  const exp = await runLane(env, "sheet-export");
  const errors = [intake.error].filter(Boolean);
  if (errors.length) throw new Error("Sync partially failed: " + errors.join("; "));
  return {
    lane: "sheets",
    processed: (intake.processed || 0) + exp.processed,
    flagged: (intake.flagged || 0) + exp.flagged,
    cursor: exp.cursor,
    detail: JSON.stringify({ intake: intake.detail || intake.error, export: exp.detail }),
    started: exp.started,
    finished: exp.finished
  };
}
__name(runSheets, "runSheets");

// src/http.js
function json(obj, status = 200, cache = "no-store") {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": cache }
  });
}
__name(json, "json");
function text(body, status = 200, contentType = "text/plain; charset=utf-8", cache = "no-store") {
  return new Response(body, {
    status,
    headers: { "Content-Type": contentType, "Cache-Control": cache }
  });
}
__name(text, "text");

// src/description-contract.js
var MEMO_PATTERNS = [
  [/\bdo not (invent|write|add|store|smash|guess|make up|fabricate)\b/i, "operator instruction"],
  [/\bdo not\b/i, "operator instruction"],
  [/\bnone invented\b|\(invented names?\)/i, "negative-space note"],
  [/\bsame legal org\b/i, "internal merge note"],
  [/\bfolded\b/i, "internal merge note"],
  [/\bHOLD\b/, "internal triage marker"],
  [/\b(is|are|was|were)\s+past\b/i, "internal recency triage"],
  [/\bstays? on (this|the) parent\b/i, "internal record-shape note"],
  [/\bstays? on (this|the)\b[^.]*\b(row|parent)\b/i, "internal record-shape note"],
  [/\b(this|the) row\b/i, "internal record-shape note"],
  [/\bthis\s+[\w-]+\s+row\b/i, "internal record-shape note"],
  [/\b(this|the) parent\b/i, "internal record-shape note"],
  [/\bwritten onto\b|\benriches this\b/i, "internal record-shape note"],
  [/\bnot written as\b/i, "internal record-shape note"],
  [/\bnot marked (gone|inactive|dead|active)\b/i, "internal state-decision note"],
  [/\bdoes not print\b/i, "extraction outcome"],
  [/\b(listing|row|org) kept\b|\bkept as stale\b/i, "internal triage note"],
  [/^no\b[^.]*\bstored\b/i, "extraction outcome"],
  [/\bpages? opened\b/i, "extraction outcome"],
  [/^[\w\s&/'-]{0,40}\bpages?\.$/i, "source-reference stub"],
  [/\bDNS-dead\b|\bDNS\b/i, "raw DNS diagnostic"],
  [/^no\b[^.]*\b(printed|official pages?)\b/i, "extraction outcome"],
  [/\bprinted on the official\b/i, "extraction outcome"],
  [/\bfolds? into\b|\bfold into\b/i, "internal merge note"],
  [/\bas a (sports )?parent\b/i, "internal record-shape note"],
  [/\bsplit as new parents?\b/i, "internal record-shape note"],
  [/\bnot invented\b/i, "negative-space note"],
  [/\bwithout a printed\b|\breprints?\b/i, "extraction commentary"],
  [/\bare\s+\w+\s+hours\b|\bprinted\s+\w*\s*hours\b/i, "internal field-meaning note"],
  [/\bno official[^.]*\bprinted\b/i, "extraction outcome"],
  [/^(office card|sports desk|volunteer \/ [^:]*inbox)\s*:/i, "internal label"],
  [/(?<![\/\w-])(?=[a-f0-9]*\d)[0-9a-f]{8}(?![\/\w-])/, "bare record id"],
  [/\bthis pass\b/i, "pipeline-run jargon"],
  [/\bnot stored\b/i, "storage decision"],
  [/\bnot printed\b/i, "extraction outcome"],
  [/\bis still (that|the)\b/i, "verification voice"],
  [/\bis still [A-Z][\w'&.-]*,\s*not\b/, "verification voice"],
  [/^\s*official\b/i, 'verification voice (leading "Official")'],
  [/[.;)]\s+not\s+(a\s+|an\s+|the\s+)?[A-Z0-9]/i, 'dedupe note ("Not X")'],
  [/\bnot\s+(a|an)\s+\w+\s+(parent|child|row|affiliate)\b/i, "dedupe note"],
  [/\bstays a\s+\w+\s+row\b/i, "internal record-shape note"],
  [/\bare not HQ\b|\bas HQ\b/i, "internal HQ disambiguation"],
  [/\bhours are\s+\w+\s+hours\b/i, "internal field-meaning note"],
  [/\bnot a (second|third|fourth|fifth)\b/i, "dedupe note"],
  [/\bchild of\b/i, "parent/child relationship"],
  [/\blives on the\b[^.]*\bchild\b/i, "internal record-shape note"],
  [/\b(child|parent)\s+row\b/i, "internal record-shape note"],
  [/\b\w+\s+child\b(?!ren)/i, "internal record-shape note"],
  [/\bdistinct from\b/i, "disambiguation aside"],
  [/\(invented name\)/i, "negative-space note"],
  [/\bNXDOMAIN\b/i, "raw DNS diagnostic"],
  [/\bHTTP \d{3}\b/, "raw HTTP status"],
  [/\b\d{3}s\b(?=[^.]*\b(redirect|Cloudflare|chrome)\b)/i, "raw status jargon"],
  [/(?<!\/)\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i, "raw record UUID"],
  [/\(\s*[0-9a-f]{8}\s*\)/i, "raw record id fragment"],
  [/\bremaining[^.]{0,40}\bclock\b/i, "pipeline scheduling jargon"],
  [/\bleftover\b/i, "pipeline triage jargon"],
  [/\bchrome\b/i, "scraper jargon"],
  [/\bfirst-party URL\b/i, "scraper jargon"],
  [/\bextracted\b/i, "pipeline verb"]
];
var ABBREV = /* @__PURE__ */ new Set([
  "st",
  "ste",
  "dr",
  "rd",
  "blvd",
  "ave",
  "ct",
  "ln",
  "pkwy",
  "hwy",
  "mt",
  "jr",
  "sr",
  "no",
  "inc",
  "co",
  "corp",
  "dept",
  "univ",
  "approx",
  "vs",
  "etc",
  "apt",
  "fl",
  "rm",
  "pl",
  "ter",
  "p.o",
  "u.s",
  "a.m",
  "p.m",
  "est",
  "cst",
  "mst",
  "pst"
]);
function splitSentences(text2) {
  const s2 = (typeof text2 === "string" ? text2 : "").trim();
  if (!s2) return [];
  const out = [];
  let buf = "";
  const tokens = s2.split(/(\s+)/);
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    buf += tok;
    if (!/[.!?]["')]?$/.test(tok)) continue;
    const bare = tok.replace(/["')\]]+$/, "").replace(/[.!?]+$/, "").toLowerCase();
    if (/^[a-z]$/i.test(bare)) continue;
    if (ABBREV.has(bare)) continue;
    const next = tokens[i + 2];
    if (next && !/^["'(]?[A-Z0-9]/.test(next)) continue;
    out.push(buf.trim());
    buf = "";
  }
  if (buf.trim()) out.push(buf.trim());
  return out.filter(Boolean);
}
__name(splitSentences, "splitSentences");
var MEMO_PREDICATES = [
  [
    (sentence) => /^Not\s+[A-Z0-9]/.test(sentence) && sentence.trim().split(/\s+/).length <= 14,
    'dedupe note (sentence opens "Not X")'
  ]
];
function sentenceMemoReasons(sentence) {
  const reasons = [];
  for (const [re, why] of MEMO_PATTERNS) if (re.test(sentence)) reasons.push(why);
  for (const [fn, why] of MEMO_PREDICATES) if (fn(sentence)) reasons.push(why);
  return reasons;
}
__name(sentenceMemoReasons, "sentenceMemoReasons");
function checkPublicDescription(text2) {
  const sentences = splitSentences(text2);
  if (!sentences.length) return { ok: true, reasons: [] };
  const reasons = /* @__PURE__ */ new Set();
  for (const s2 of sentences) for (const r of sentenceMemoReasons(s2)) reasons.add(r);
  return { ok: reasons.size === 0, reasons: [...reasons] };
}
__name(checkPublicDescription, "checkPublicDescription");
var NAVIGATION_LABEL = /^(volunteer|donate|home|about( us)?|contact( us)?|events?( calendar)?|programs?|news|resources|staff|board|menu|search|log ?in|sign ?in|leadership|sponsors?|partners?|gallery|blog|faq|shop|store|careers?|jobs|press|media|privacy( policy)?|terms|sitemap|calendar|schedule|register|membership|newsletter|subscribe|give|support us|get involved|our team|our story|mission|history|donate now|learn more|read more|click here)\.?$/i;
function looksLikeNavigationLabel(name) {
  return NAVIGATION_LABEL.test(String(name ?? "").trim());
}
__name(looksLikeNavigationLabel, "looksLikeNavigationLabel");

// src/admin.js
var APPLY_WHITELIST = /* @__PURE__ */ new Set([
  "email",
  "phone",
  "city",
  "state",
  "state_name",
  "zip",
  "website_url",
  "status",
  "description",
  "cost_note",
  "ages",
  "equipment_provided",
  "sport",
  "sport_key",
  "sports_json",
  "lat",
  "lng",
  "geo_precision",
  "internal_notes"
]);
var NEW_ORG_WHITELIST = /* @__PURE__ */ new Set([
  "name",
  "org_type",
  "sport",
  "sport_key",
  "sports_json",
  "website_url",
  "email",
  "phone",
  "city",
  "state",
  "state_name",
  "zip",
  "description",
  "cost_note",
  "ages",
  "lat",
  "lng",
  "geo_precision",
  "internal_notes"
]);
var EVENT_WHITELIST = /* @__PURE__ */ new Set([
  "title",
  "description",
  "org_id",
  "sport_key",
  "venue",
  "city",
  "state",
  "url",
  "starts_at",
  "ends_at",
  "all_day",
  "status",
  "is_public"
]);
function bindValue(v) {
  return v && typeof v === "object" ? JSON.stringify(v) : v;
}
__name(bindValue, "bindValue");
function rejectMemoDescription(fields) {
  const d = fields && fields.description;
  if (typeof d !== "string" || !d.trim()) return null;
  const check = checkPublicDescription(d);
  if (check.ok) return null;
  return json({
    ok: false,
    error: "description_is_operator_note",
    detail: "description is public copy shown to an athlete. This text reads as a pipeline memo. Put it in internal_notes instead.",
    reasons: check.reasons
  }, 422);
}
__name(rejectMemoDescription, "rejectMemoDescription");
function str(v, max = 2e3) {
  return (typeof v === "string" ? v : "").trim().slice(0, max);
}
__name(str, "str");
var QUEUE_ITEM_SELECT = `SELECT r.item_id, r.organization_id, o.name AS org_name, r.lane,
          r.proposed_change, r.evidence, r.confidence, r.status, r.created_at
   FROM review_queue r LEFT JOIN organizations o ON o.id = r.organization_id`;
function mapQueueRow(r) {
  return { ...r, proposed_change: parse(r.proposed_change), evidence: parse(r.evidence) };
}
__name(mapQueueRow, "mapQueueRow");
function adminAuthed(request, env) {
  if (!env.ADMIN_KEY) return false;
  const h = request.headers.get("Authorization") || "";
  return h === `Bearer ${env.ADMIN_KEY}`;
}
__name(adminAuthed, "adminAuthed");
async function handleAdmin(request, env, url) {
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
    const item = await db.prepare(`SELECT * FROM review_queue WHERE item_id = ? AND status = 'pending'`).bind(Number(decide[1])).first();
    if (!item) return json({ ok: false, error: "No such pending item" }, 404);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const change = parse(item.proposed_change) || {};
    if (action === "approve" && !item.organization_id && (item.lane === "discover" || item.lane === "submission")) {
      const fields = {};
      for (const [field, d] of Object.entries(change)) {
        if (!NEW_ORG_WHITELIST.has(field)) continue;
        fields[field] = d && typeof d === "object" && "to" in d ? d.to : d;
      }
      if (!fields.name) {
        return json({ ok: false, error: "New-org approval requires a 'name' field in proposed_change" }, 422);
      }
      const newOrgMemo = rejectMemoDescription(fields);
      if (newOrgMemo) return newOrgMemo;
      if (looksLikeNavigationLabel(fields.name)) {
        return json({
          ok: false,
          error: "name_is_navigation_label",
          detail: '"' + fields.name + '" is a website navigation label, not an organisation. A directory scrape walks the nav bar as readily as the member list. Reject this proposal rather than approving it.'
        }, 422);
      }
      const evidence = parse(item.evidence) || {};
      const id = crypto.randomUUID();
      const cols = ["id", "status", "is_public", "verification_status", "created_at", "updated_at", "primary_data_source"];
      const vals = [id, "active", 1, "unverified", now, now, evidence.source || item.lane];
      for (const [field, value] of Object.entries(fields)) {
        cols.push(field);
        vals.push(bindValue(value));
      }
      const stmts2 = [
        db.prepare(`INSERT INTO organizations (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`).bind(...vals),
        db.prepare(
          `UPDATE review_queue SET status = ?, resolved_at = ?, resolved_by = ? WHERE item_id = ?`
        ).bind("approved", now, body.by || "admin", item.item_id)
      ];
      await db.batch(stmts2);
      return json({ ok: true, item_id: item.item_id, action, organization_id: id });
    }
    const stmts = [db.prepare(
      `UPDATE review_queue SET status = ?, resolved_at = ?, resolved_by = ? WHERE item_id = ?`
    ).bind(action === "approve" ? "approved" : "rejected", now, body.by || "admin", item.item_id)];
    if (action === "approve" && item.organization_id) {
      const applyFields = {};
      for (const [field, d] of Object.entries(change)) {
        if (!APPLY_WHITELIST.has(field)) continue;
        applyFields[field] = d && typeof d === "object" && "to" in d ? d.to : d;
      }
      const applyMemo = rejectMemoDescription(applyFields);
      if (applyMemo) return applyMemo;
      const sets = [], binds = [];
      for (const [field, value] of Object.entries(applyFields)) {
        sets.push(`${field} = ?`);
        binds.push(bindValue(value));
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
  const run = path.match(/^\/run\/(validate|enrich|classify|resolve|geocode|dispatch|sheet-export|sheet-intake|sheets)$/);
  if (run && request.method === "POST") {
    const result = await runLane(env, run[1]);
    return json({ ok: true, ...result });
  }
  if (path === "/runs" && request.method === "GET") {
    const { results } = await db.prepare(
      `SELECT * FROM pipeline_runs ORDER BY run_id DESC LIMIT 30`
    ).all();
    return json({ ok: true, runs: results });
  }
  if (path === "/digest-stats" && request.method === "GET") {
    const now = /* @__PURE__ */ new Date();
    const since24h = new Date(now.getTime() - 24 * 3600 * 1e3).toISOString();
    const since7d = new Date(now.getTime() - 7 * 24 * 3600 * 1e3).toISOString();
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
      ).bind(since24h).first()
    ]);
    return json({
      ok: true,
      pending_by_lane: pendingByLane.results,
      resolved_7d: resolved7d.results,
      runs_24h: runs24h.results,
      integrity: {
        orgs_updated_24h: orgsUpdated24h?.n ?? 0,
        approvals_24h: approvals24h?.n ?? 0
      }
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
      ).first()
    ]);
    return json({
      ok: true,
      low_confidence: lowConfidence.results.map(mapQueueRow),
      unclassified_sample: unclassifiedSample.results,
      unclassified_total: unclassifiedTotal?.n ?? 0
    });
  }
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
    const now = (/* @__PURE__ */ new Date()).toISOString();
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
    binds.push((/* @__PURE__ */ new Date()).toISOString(), eventMatch[1]);
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
__name(handleAdmin, "handleAdmin");
function parse(s2) {
  try {
    return JSON.parse(s2);
  } catch {
    return null;
  }
}
__name(parse, "parse");

// src/profile.js
var COOKIE_NAME = "asnm_p";
var COOKIE_MAX_AGE = 31536e3;
async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}
__name(hmacKey, "hmacKey");
function toBase64Url(buf) {
  let bin = "";
  for (const b of new Uint8Array(buf)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(toBase64Url, "toBase64Url");
async function signProfileId(id, secret) {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(id));
  return toBase64Url(sig);
}
__name(signProfileId, "signProfileId");
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
__name(timingSafeEqual, "timingSafeEqual");
async function verifyProfileCookie(cookieValue, secret) {
  if (!cookieValue || typeof cookieValue !== "string") return null;
  const dot = cookieValue.indexOf(".");
  if (dot < 1 || dot === cookieValue.length - 1) return null;
  const id = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  if (!/^[A-Za-z0-9_-]+$/.test(sig)) return null;
  const expected = await signProfileId(id, secret);
  return timingSafeEqual(sig, expected) ? id : null;
}
__name(verifyProfileCookie, "verifyProfileCookie");
function serializeProfileCookie(id, sig, maxAge = COOKIE_MAX_AGE) {
  return `${COOKIE_NAME}=${id}.${sig}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}
__name(serializeProfileCookie, "serializeProfileCookie");
function clearProfileCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
__name(clearProfileCookie, "clearProfileCookie");
function parseCookieHeader(header, name) {
  for (const part of String(header || "").split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return null;
}
__name(parseCookieHeader, "parseCookieHeader");
async function readProfileCookie(request, secret) {
  const raw = parseCookieHeader(request.headers.get("Cookie"), COOKIE_NAME);
  if (!raw) return null;
  return verifyProfileCookie(raw, secret);
}
__name(readProfileCookie, "readProfileCookie");
var STATE_CODES2 = /* @__PURE__ */ new Set([
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC"
]);
function validState(s2) {
  const v = (typeof s2 === "string" ? s2 : "").trim().toUpperCase();
  return STATE_CODES2.has(v) ? v : "";
}
__name(validState, "validState");
function parseSports(input, validKeys) {
  const raw = Array.isArray(input) ? input : String(input == null ? "" : input).split(",");
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const item of raw) {
    const key = String(item == null ? "" : item).trim().toLowerCase();
    if (!key || !/^[a-z]+$/.test(key)) continue;
    if (validKeys && !validKeys.has(key)) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}
__name(parseSports, "parseSports");
async function getValidSportKeys(db) {
  const { results } = await db.prepare(`SELECT sport_key FROM sports`).all();
  return new Set(results.map((r) => r.sport_key));
}
__name(getValidSportKeys, "getValidSportKeys");
async function getProfileByEmail(db, email) {
  return db.prepare(`SELECT * FROM profiles WHERE email = ? COLLATE NOCASE`).bind(email).first();
}
__name(getProfileByEmail, "getProfileByEmail");
async function getProfileById(db, id) {
  return db.prepare(`SELECT * FROM profiles WHERE id = ?`).bind(id).first();
}
__name(getProfileById, "getProfileById");
async function createProfile(db, { email, name, state, sports, newsletter }) {
  const id = crypto.randomUUID();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.prepare(
    `INSERT INTO profiles (id, email, name, state, sports_json, newsletter, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, email, name || "", state || "", JSON.stringify(sports || []), newsletter ? 1 : 0, now, now).run();
  return id;
}
__name(createProfile, "createProfile");
async function updateProfile(db, id, { email, name, state, sports, newsletter }) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.prepare(
    `UPDATE profiles SET email = ?, name = ?, state = ?, sports_json = ?, newsletter = ?, updated_at = ? WHERE id = ?`
  ).bind(email, name || "", state || "", JSON.stringify(sports || []), newsletter ? 1 : 0, now, id).run();
}
__name(updateProfile, "updateProfile");
async function orgExists(db, orgId) {
  const row = await db.prepare(`SELECT id FROM organizations WHERE id = ?`).bind(orgId).first();
  return !!row;
}
__name(orgExists, "orgExists");
async function setFavorite(db, profileId, orgId, on) {
  if (on) {
    await db.prepare(
      `INSERT OR IGNORE INTO profile_favorites (profile_id, org_id, created_at) VALUES (?, ?, ?)`
    ).bind(profileId, orgId, (/* @__PURE__ */ new Date()).toISOString()).run();
  } else {
    await db.prepare(
      `DELETE FROM profile_favorites WHERE profile_id = ? AND org_id = ?`
    ).bind(profileId, orgId).run();
  }
}
__name(setFavorite, "setFavorite");
function parseSportsJson(s2) {
  try {
    return JSON.parse(s2) || [];
  } catch {
    return [];
  }
}
__name(parseSportsJson, "parseSportsJson");
async function getProfileWithFavorites(db, id) {
  const profile = await getProfileById(db, id);
  if (!profile) return null;
  const { results } = await db.prepare(
    `SELECT o.id, o.name, o.sport_key AS sport, o.city, o.state
     FROM profile_favorites f JOIN organizations o ON o.id = f.org_id
     WHERE f.profile_id = ? ORDER BY o.name`
  ).bind(id).all();
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    state: profile.state,
    sports: parseSportsJson(profile.sports_json),
    newsletter: !!profile.newsletter,
    favorites: results
  };
}
__name(getProfileWithFavorites, "getProfileWithFavorites");

// src/blog.js
var SITE3 = "https://adaptivesportsnearme.com";
var HOT_TTL = 300;
var STALE_TTL = 86400;
function cacheKey(bucket, id) {
  return new Request(`https://asnm-blog-cache.internal/${bucket}/${encodeURIComponent(id)}`);
}
__name(cacheKey, "cacheKey");
async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return "(no body)";
  }
}
__name(safeText, "safeText");
async function cachedFetch(env, url, id) {
  const cache = caches.default;
  const hotKey = cacheKey("hot", id);
  const staleKey = cacheKey("stale", id);
  const hot = await cache.match(hotKey);
  if (hot) return { ok: true, data: await hot.json(), stale: false };
  if (!env.BEEHIIV_API_KEY || !env.BEEHIIV_PUBLICATION_ID) {
    console.error("beehiiv not configured (missing API key or publication id)");
    return tryStale(cache, staleKey);
  }
  let res;
  try {
    res = await fetch(url, { headers: { Authorization: `Bearer ${env.BEEHIIV_API_KEY}` } });
  } catch (err) {
    console.error("beehiiv request failed:", err);
    return tryStale(cache, staleKey);
  }
  if (!res.ok) {
    console.error("beehiiv error", res.status, await safeText(res));
    return tryStale(cache, staleKey);
  }
  let data;
  try {
    data = await res.json();
  } catch (err) {
    console.error("beehiiv response parse failed:", err);
    return tryStale(cache, staleKey);
  }
  const body = JSON.stringify(data);
  await cache.put(hotKey, new Response(body, { headers: { "Content-Type": "application/json", "Cache-Control": `max-age=${HOT_TTL}` } }));
  await cache.put(staleKey, new Response(body, { headers: { "Content-Type": "application/json", "Cache-Control": `max-age=${STALE_TTL}` } }));
  return { ok: true, data, stale: false };
}
__name(cachedFetch, "cachedFetch");
async function tryStale(cache, staleKey) {
  const stale = await cache.match(staleKey);
  if (stale) return { ok: true, data: await stale.json(), stale: true };
  return { ok: false, data: null, stale: false };
}
__name(tryStale, "tryStale");
async function listPosts(env) {
  if (!env.BEEHIIV_PUBLICATION_ID) {
    console.error("beehiiv not configured (missing or empty publication id)");
    return { ok: false, posts: [], stale: false };
  }
  const url = `https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUBLICATION_ID}/posts?status=confirmed&order_by=publish_date&direction=desc&limit=20`;
  const result = await cachedFetch(env, url, "list:1");
  if (!result.ok) return { ok: false, posts: [], stale: false };
  return { ok: true, posts: normalizePosts(result.data), stale: result.stale };
}
__name(listPosts, "listPosts");
async function getPostBySlug(env, slug) {
  const list = await listPosts(env);
  if (!list.ok) return { ok: false, notFound: false, stale: false };
  const match = findPostBySlug(list.posts, slug);
  if (!match) return { ok: false, notFound: true, stale: false };
  const url = `https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUBLICATION_ID}/posts/${encodeURIComponent(match.id)}?expand=free_web_content`;
  const result = await cachedFetch(env, url, `post:${match.id}`);
  if (!result.ok) return { ok: false, notFound: false, stale: false };
  return { ok: true, post: normalizePostDetail(result.data, match), stale: result.stale };
}
__name(getPostBySlug, "getPostBySlug");
function normalizePosts(data, now = Date.now()) {
  const raw = Array.isArray(data && data.data) ? data.data : [];
  const nowSecs = now / 1e3;
  const out = [];
  for (const p of raw) {
    if (!p || typeof p !== "object") continue;
    const id = p.id != null ? String(p.id) : "";
    const slug = typeof p.slug === "string" ? p.slug.trim() : "";
    if (!id || !slug) continue;
    const publishDate = typeof p.publish_date === "number" ? p.publish_date : null;
    if (publishDate != null && publishDate > nowSecs) continue;
    out.push({
      id,
      slug,
      title: typeof p.title === "string" ? p.title : "",
      subtitle: typeof p.subtitle === "string" ? p.subtitle : "",
      publishDate,
      thumbnailUrl: typeof p.thumbnail_url === "string" ? p.thumbnail_url : "",
      webUrl: typeof p.web_url === "string" ? p.web_url : ""
    });
  }
  return out;
}
__name(normalizePosts, "normalizePosts");
function findPostBySlug(posts, slug) {
  return posts.find((p) => p.slug === slug) || null;
}
__name(findPostBySlug, "findPostBySlug");
function normalizePostDetail(data, fallback) {
  const p = data && typeof data.data === "object" && data.data ? data.data : {};
  const bodyHtmlRaw = p.content && typeof p.content === "object" && p.content.free && typeof p.content.free === "object" && typeof p.content.free.web === "string" ? p.content.free.web : "";
  return {
    id: fallback.id,
    slug: fallback.slug,
    title: typeof p.title === "string" ? p.title : fallback.title,
    subtitle: typeof p.subtitle === "string" ? p.subtitle : fallback.subtitle,
    publishDate: typeof p.publish_date === "number" ? p.publish_date : fallback.publishDate,
    thumbnailUrl: typeof p.thumbnail_url === "string" ? p.thumbnail_url : fallback.thumbnailUrl,
    webUrl: typeof p.web_url === "string" ? p.web_url : fallback.webUrl,
    bodyHtml: sanitizeHtml(bodyHtmlRaw)
  };
}
__name(normalizePostDetail, "normalizePostDetail");
function sanitizeHtml(html) {
  if (typeof html !== "string") return "";
  return html.replace(/<(script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "").replace(/<\/?(script|style|iframe|object|embed)\b[^>]*>/gi, "").replace(/\son[a-z]+\s*=\s*"(?:[^"\\]|\\.)*"/gi, "").replace(/\son[a-z]+\s*=\s*'(?:[^'\\]|\\.)*'/gi, "").replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "").replace(/(\shref\s*=\s*)"\s*javascript:[^"]*"/gi, '$1"#"').replace(/(\shref\s*=\s*)'\s*javascript:[^']*'/gi, "$1'#'");
}
__name(sanitizeHtml, "sanitizeHtml");
function esc4(s2) {
  return s2 == null ? "" : String(s2).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
__name(esc4, "esc");
function formatPostDate(unixSeconds) {
  if (typeof unixSeconds !== "number" || !Number.isFinite(unixSeconds)) return "";
  const d = new Date(unixSeconds * 1e3);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
__name(formatPostDate, "formatPostDate");
function jsonLdScript(obj) {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}
__name(jsonLdScript, "jsonLdScript");
var BLOG_CSS = `
:root{
  color-scheme: light;
  --ink:#1A1A1A; --ink2:#3A3A37;
  --paper:#FFFFFF; --mist:#F7F7F5; --sand:#F0EFEC;
  --line:#E7E6E2; --muted:#6E6D6A; --faint:#736F6A;
  --orange:#C5430C; --orange-ink:#A8370A; --orange-soft:#FBEBDC; --sand2:#E8E7E3;
  /* --faint darkened to meet WCAG AA (matches index.html) */
  /* Rhythm. Do not tighten these to "fix AI look"; Alec locked 24/32/40/48/64 on 2026-08-21. */
  --space-page: 24px;  /* gutter */
  --space-header: 64px;
  --tap: 44px;
  --space-title-gap: 8px;
  --space-after-photo: 32px;
  --space-section: 40px;
  --space-nearby: 48px;
  --space-row: 16px;
  --hdr: var(--space-header);
  --shadow-sm:0 1px 2px rgba(17,17,19,.04),0 1px 3px rgba(17,17,19,.06);
  --r:12px; --r-lg:16px; --r-full:999px; --max:920px; --gut: var(--space-page);
}
*{box-sizing:border-box;}
@media (prefers-reduced-motion: reduce){*{transition:none!important;animation:none!important;}}
html,body{margin:0;padding:0;background:var(--mist);color:var(--ink);}
body{font-family:'DM Sans',system-ui,sans-serif;font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;}
img{display:block;max-width:100%;}
a{color:inherit;text-decoration:none;}
.wrap{max-width:var(--max);margin:0 auto;padding:0 var(--space-page);}
${CHROME_CSS}
/* One reading column, left-aligned with the app. Body copy ran the full 872px
   measure, about 110 characters a line; 70ch is what the listing pages use. */
.blog-main{padding:var(--space-nearby) var(--space-page) var(--space-header);max-width:1280px;}
.blog-main>*{max-width:70ch;}
.blog-main>.blog-grid{max-width:none;}
.eyebrow{font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--faint);margin:0 0 var(--space-title-gap);}
.blog-h1{font-family:'DM Sans',sans-serif;font-size:34px;font-weight:700;letter-spacing:-.02em;line-height:1.15;margin:0 0 20px;}
.blog-empty{color:var(--muted);font-size:15px;}
.blog-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:28px;}
.blog-card{display:block;background:var(--paper);border:1px solid var(--line);border-radius:var(--r-lg);overflow:hidden;transition:box-shadow .15s,border-color .15s;}
.blog-card:hover{border-color:var(--ink);box-shadow:0 6px 20px rgba(17,17,19,.08);}
.blog-card-media{aspect-ratio:16/9;background:var(--sand);overflow:hidden;}
.blog-card-media img{width:100%;height:100%;object-fit:cover;}
.blog-card-body{padding:16px 18px 20px;}
.blog-card-date{font-size:12px;color:var(--faint);margin:0 0 6px;font-weight:600;}
.blog-card-title{font-family:'DM Sans',sans-serif;font-size:17px;font-weight:700;line-height:1.3;margin:0 0 6px;color:var(--ink);}
.blog-card-sub{font-size:14px;color:var(--muted);margin:0;line-height:1.45;}
.blog-back{display:inline-block;font-size:14px;font-weight:600;color:var(--muted);margin-bottom:var(--space-page);}
.blog-back:hover{color:var(--ink);}
.blog-sub{font-size:17px;color:var(--muted);margin:0 0 20px;line-height:1.5;}
.blog-hero{border-radius:var(--r-lg);overflow:hidden;margin:0 0 28px;background:var(--sand);}
.blog-hero img{width:100%;height:auto;}
.blog-body{font-size:16px;line-height:1.7;color:var(--ink2);}
.blog-body img{border-radius:var(--r);margin:16px 0;}
.blog-body a{color:var(--orange-ink);text-decoration:underline;}
.blog-body h2,.blog-body h3{font-family:'DM Sans',sans-serif;color:var(--ink);letter-spacing:-.01em;}
@media(max-width:720px){.blog-h1{font-size:26px;}.blog-grid{grid-template-columns:1fr;}}
`;
function pageShell({ title, description, canonical, ogImage, bodyHtml, jsonLd }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<title>${esc4(title)}</title>
<meta name="description" content="${esc4(description)}">
<link rel="canonical" href="${esc4(canonical)}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Adaptive Sports Near Me">
<meta property="og:title" content="${esc4(title)}">
<meta property="og:description" content="${esc4(description)}">
<meta property="og:image" content="${esc4(ogImage)}">
<meta property="og:url" content="${esc4(canonical)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc4(title)}">
<meta name="twitter:description" content="${esc4(description)}">
<meta name="twitter:image" content="${esc4(ogImage)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/tokens.css">${jsonLd ? `
<script type="application/ld+json">${jsonLdScript(jsonLd)}<\/script>` : ""}
<style>${BLOG_CSS}</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${headerHtml()}
<main id="main" class="wrap blog-main">
${bodyHtml}
</main>
${footerHtml()}
${navScriptHtml()}
</body>
</html>
`;
}
__name(pageShell, "pageShell");
function postCardHtml(p, site) {
  const date = formatPostDate(p.publishDate);
  return `<a class="blog-card" href="${esc4(site)}/blog/${esc4(p.slug)}">${p.thumbnailUrl ? `<div class="blog-card-media"><img src="${esc4(p.thumbnailUrl)}" alt="" loading="lazy"></div>` : ""}<div class="blog-card-body">${date ? `<p class="blog-card-date">${esc4(date)}</p>` : ""}<h2 class="blog-card-title">${esc4(p.title)}</h2>${p.subtitle ? `<p class="blog-card-sub">${esc4(p.subtitle)}</p>` : ""}</div></a>`;
}
__name(postCardHtml, "postCardHtml");
function blogIndexTemplate(posts, { site = SITE3 } = {}) {
  const body = `<p class="eyebrow">Stories</p>
<h1 class="blog-h1">From Adaptive Sports Near Me</h1>
${posts.length ? `<div class="blog-grid">${posts.map((p) => postCardHtml(p, site)).join("")}</div>` : `<p class="blog-empty">Stories are on the way. Check back soon.</p>`}`;
  return pageShell({
    title: "Blog \xB7 Adaptive Sports Near Me",
    description: "Stories, updates and guides from the adaptive sports community.",
    canonical: `${site}/blog`,
    ogImage: `${site}/og-image.jpg`,
    bodyHtml: body
  });
}
__name(blogIndexTemplate, "blogIndexTemplate");
function blogPostTemplate(post, { site = SITE3 } = {}) {
  const date = formatPostDate(post.publishDate);
  const canonical = `${site}/blog/${post.slug}`;
  const ogImage = post.thumbnailUrl || `${site}/og-image.jpg`;
  const description = post.subtitle || "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: description || void 0,
    image: post.thumbnailUrl ? [post.thumbnailUrl] : void 0,
    datePublished: post.publishDate ? new Date(post.publishDate * 1e3).toISOString() : void 0,
    url: canonical,
    author: { "@type": "Organization", name: "Adaptive Sports Near Me" }
  };
  const body = `<a class="blog-back" href="/blog">&larr; All stories</a>
<article>
  ${date ? `<p class="blog-card-date">${esc4(date)}</p>` : ""}
  <h1 class="blog-h1">${esc4(post.title)}</h1>
  ${post.subtitle ? `<p class="blog-sub">${esc4(post.subtitle)}</p>` : ""}
  ${post.thumbnailUrl ? `<div class="blog-hero"><img src="${esc4(post.thumbnailUrl)}" alt=""></div>` : ""}
  <div class="blog-body">${post.bodyHtml || ""}</div>
</article>`;
  return pageShell({
    title: `${post.title} \xB7 Adaptive Sports Near Me`,
    description,
    canonical,
    ogImage,
    bodyHtml: body,
    jsonLd
  });
}
__name(blogPostTemplate, "blogPostTemplate");
function blogFallbackTemplate({ site = SITE3 } = {}) {
  const body = `<p class="eyebrow">Stories</p>
<h1 class="blog-h1">Stories are on the way</h1>
<p class="blog-empty">We're getting the blog set up. Check back soon, or head back to <a href="/">the directory</a>.</p>`;
  return pageShell({
    title: "Blog \xB7 Adaptive Sports Near Me",
    description: "Stories, updates and guides from the adaptive sports community.",
    canonical: `${site}/blog`,
    ogImage: `${site}/og-image.jpg`,
    bodyHtml: body
  });
}
__name(blogFallbackTemplate, "blogFallbackTemplate");
function blogNotFoundTemplate({ site = SITE3 } = {}) {
  const body = `<p class="eyebrow">Stories</p>
<h1 class="blog-h1">Story not found</h1>
<p class="blog-empty">That story may have moved or been unpublished. <a href="/blog">See all stories</a>.</p>`;
  return pageShell({
    title: "Story not found \xB7 Adaptive Sports Near Me",
    description: "That story may have moved or been unpublished.",
    canonical: `${site}/blog`,
    ogImage: `${site}/og-image.jpg`,
    bodyHtml: body
  });
}
__name(blogNotFoundTemplate, "blogNotFoundTemplate");

// src/index.js
var API_CACHE = "public, max-age=300, stale-while-revalidate=600";
var FEED_CACHE = "public, max-age=300";
var BLOG_PAGE_CACHE = "public, max-age=300";
var BLOG_FALLBACK_CACHE = "public, max-age=60";
var CRON_LANES = {
  "0 */2 * * *": "validate",
  "*/20 * * * *": "dispatch",
  // rotates enrich -> classify -> geocode -> resolve (pipeline.js)
  "10,30,50 * * * *": "sheets"
  // Spec 174: Intake tab -> D1, then D1 -> ASNM Master sheet
};
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/subscribe") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      return handleSubscribe(request, env);
    }
    if (url.pathname === "/api/submit-program") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      return handleSubmitProgram(request, env);
    }
    if (url.pathname === "/api/profile") {
      if (request.method === "POST") return handleProfileUpsert(request, env);
      if (request.method === "GET") return handleProfileGet(request, env);
      return json({ ok: false, error: "Method not allowed" }, 405);
    }
    if (url.pathname === "/api/profile/favorites") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      return handleProfileFavorite(request, env);
    }
    if (url.pathname === "/api/profile/signout") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      return handleProfileSignout();
    }
    if (url.pathname === "/api/config") {
      return json({
        ok: true,
        env: env.ENV_NAME || "production",
        prelaunch: env.PRELAUNCH !== "false",
        dataApi: !!env.DB
      });
    }
    if (env.DB && request.method === "GET") {
      try {
        if (url.pathname === "/api/programs") {
          return json({ ok: true, ...await listPrograms(env.DB, url.searchParams, { assets: env.ASSETS }) }, 200, API_CACHE);
        }
        const org = url.pathname.match(/^\/api\/orgs\/([0-9a-f-]{36})$/);
        if (org) {
          const record = await getOrg(env.DB, org[1]);
          return record ? json({ ok: true, org: record }, 200, API_CACHE) : json({ ok: false, error: "Not found" }, 404);
        }
        if (url.pathname === "/api/stats") {
          return json({ ok: true, ...await stats(env.DB) }, 200, API_CACHE);
        }
        if (url.pathname === "/api/grants") {
          return json({ ok: true, ...await listGrants(env.DB, url.searchParams) }, 200, API_CACHE);
        }
        const grantApi = url.pathname.match(/^\/api\/grants\/([0-9a-f-]{36})$/);
        if (grantApi) {
          const record = await getGrant(env.DB, grantApi[1]);
          return record ? json({ ok: true, grant: record }, 200, API_CACHE) : json({ ok: false, error: "Not found" }, 404);
        }
        if (url.pathname === "/api/events") {
          return json({ ok: true, ...await listEvents(env.DB, url.searchParams) }, 200, API_CACHE);
        }
        if (url.pathname === "/events.xml") {
          const { items } = await listEvents(env.DB, url.searchParams);
          return text(eventsToRss(items, url.origin), 200, "application/rss+xml; charset=utf-8", FEED_CACHE);
        }
        if (url.pathname === "/events.ics") {
          const { items } = await listEvents(env.DB, url.searchParams);
          return text(eventsToIcs(items), 200, "text/calendar; charset=utf-8", FEED_CACHE);
        }
      } catch (err) {
        console.error("data api error:", err);
        return json({ ok: false, error: "Data temporarily unavailable" }, 500);
      }
    }
    if (url.pathname.startsWith("/api/admin/") && env.DB) {
      return handleAdmin(request, env, url);
    }
    if (url.pathname === "/blog" || url.pathname === "/blog/") {
      return handleBlogIndex(url, env);
    }
    const blogSlug = url.pathname.match(/^\/blog\/([^/]+)$/);
    if (blogSlug) {
      return handleBlogPost(url, env, decodeURIComponent(blogSlug[1]));
    }
    const programPath = url.pathname.match(PROGRAM_ID_RE);
    if (programPath && env.DB) {
      try {
        const record = await getOrg(env.DB, programPath[1]);
        if (!record) return text(programNotFoundTemplate({ site: url.origin }), 404, "text/html; charset=utf-8");
        const nearby = await listSameSportNearby(env.DB, record, 6);
        return text(programPageTemplate(record, { site: url.origin, nearby }), 200, "text/html; charset=utf-8", API_CACHE);
      } catch (err) {
        console.error("program page error:", err);
        return text(programNotFoundTemplate({ site: url.origin }), 500, "text/html; charset=utf-8");
      }
    }
    const grantPath = url.pathname.match(GRANT_ID_RE);
    if (grantPath && env.DB) {
      try {
        const record = await getGrant(env.DB, grantPath[1]);
        if (!record) return text(grantNotFoundTemplate({ site: url.origin }), 404, "text/html; charset=utf-8");
        const nearby = await listOtherGrants(env.DB, record, 6);
        return text(grantPageTemplate(record, { site: url.origin, nearby }), 200, "text/html; charset=utf-8", API_CACHE);
      } catch (err) {
        console.error("grant page error:", err);
        return text(grantNotFoundTemplate({ site: url.origin }), 500, "text/html; charset=utf-8");
      }
    }
    if (url.pathname === "/maps" || url.pathname === "/maps/") {
      return env.ASSETS.fetch(new Request(new URL("/", url), request));
    }
    if (/^\/(profile|events)\/?$/.test(url.pathname)) {
      return env.ASSETS.fetch(new Request(new URL("/", url), request));
    }
    return env.ASSETS.fetch(request);
  },
  async scheduled(controller, env, ctx) {
    if (!env.DB) return;
    const lane = CRON_LANES[controller.cron];
    if (!lane) {
      console.error(`no lane mapped for cron "${controller.cron}" \u2014 update CRON_LANES + wrangler.jsonc together`);
      return;
    }
    ctx.waitUntil(
      runLane(env, lane).then(
        (r) => console.log(`lane ${lane}: processed=${r.processed} flagged=${r.flagged}`),
        (err) => console.error(`lane ${lane} failed:`, err)
      )
    );
  }
};
async function handleSubscribe(request, env) {
  const data = await readBody(request);
  if (data === null) return json({ ok: false, error: "Could not read your submission." }, 400);
  if (str2(data.company)) return json({ ok: true });
  const cfTok = str2(data.cf_token);
  if (cfTok && !await verifyTurnstile(env, cfTok, request.headers.get("CF-Connecting-IP"))) {
    return json({ ok: false, error: "Verification failed. Please reload the page and try again." }, 403);
  }
  const email = str2(data.em);
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: "Please enter a valid email." }, 422);
  }
  const source = str2(data.source).slice(0, 80) || "asnm-prelaunch";
  const result = await subscribeToBeehiiv(env, email, source);
  if (!result.ok) return json({ ok: false, error: result.error }, result.status);
  try {
    await sendSignupWelcome(env, email);
  } catch (err) {
    console.error("signup welcome failed:", err);
  }
  return json({ ok: true });
}
__name(handleSubscribe, "handleSubscribe");
async function subscribeToBeehiiv(env, email, campaign) {
  if (!env.BEEHIIV_API_KEY || !env.BEEHIIV_PUBLICATION_ID) {
    console.error("beehiiv not configured (missing API key or publication id)");
    return { ok: false, status: 503, error: "Sign-up is temporarily unavailable. Please try again soon." };
  }
  let res;
  try {
    res = await fetch(
      `https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${env.BEEHIIV_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: "asnm-prelaunch",
          utm_medium: "website",
          utm_campaign: campaign,
          referring_site: "adaptivesportsnearme.com"
        })
      }
    );
  } catch (err) {
    console.error("beehiiv request failed:", err);
    return { ok: false, status: 502, error: "Could not sign you up right now. Please try again soon." };
  }
  if (!res.ok) {
    console.error("beehiiv error", res.status, await safeText2(res));
    return { ok: false, status: 502, error: "Could not sign you up right now. Please try again soon." };
  }
  return { ok: true };
}
__name(subscribeToBeehiiv, "subscribeToBeehiiv");
async function handleSubmitProgram(request, env) {
  const data = await readBody(request);
  if (data === null) return json({ ok: false, error: "Could not read your submission." }, 400);
  if (str2(data.company)) return json({ ok: true });
  if (!await verifyTurnstile(env, str2(data.cf_token), request.headers.get("CF-Connecting-IP"))) {
    return json({ ok: false, error: "Verification failed. Please reload the page and try again." }, 403);
  }
  const program = str2(data.pn);
  const org = str2(data.org);
  const sport = str2(data.sport);
  const city = str2(data.city);
  const stateRegion = str2(data.state);
  const email = str2(data.em);
  const notes = str2(data.notes);
  if (!program) return json({ ok: false, error: "Please add the program name." }, 422);
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: "That email does not look right." }, 422);
  }
  if (!env.DB) {
    console.error("submit-program: no DB binding");
    return json({ ok: false, error: "Submissions are temporarily unavailable. Please try again soon." }, 503);
  }
  try {
    await env.DB.prepare(
      `INSERT INTO submissions (kind, payload, contact_email, status, created_at)
       VALUES ('new_program', ?, ?, 'new', ?)`
    ).bind(
      JSON.stringify({ program, org, sport, city, state: stateRegion, notes, via: "adaptivesportsnearme.com form" }),
      email || null,
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
  } catch (err) {
    console.error("submission insert failed:", err);
    return json({ ok: false, error: "Could not save right now. Please try again soon." }, 502);
  }
  return json({ ok: true });
}
__name(handleSubmitProgram, "handleSubmitProgram");
var PROFILE_CACHE = "private, no-store";
async function handleProfileUpsert(request, env) {
  if (!env.DB) return json({ ok: false, error: "Profiles are temporarily unavailable. Please try again soon." }, 503);
  if (!env.PROFILE_SIGNING_KEY) {
    console.error("PROFILE_SIGNING_KEY not configured");
    return json({ ok: false, error: "Profiles are warming up. Please try again soon." }, 503);
  }
  const data = await readBody(request);
  if (data === null) return json({ ok: false, error: "Could not read your submission." }, 400);
  if (str2(data.company)) return json({ ok: true });
  if (!await verifyTurnstile(env, str2(data.cf_token), request.headers.get("CF-Connecting-IP"))) {
    return json({ ok: false, error: "Verification failed. Please reload the page and try again." }, 403);
  }
  const email = str2(data.em);
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: "Please enter a valid email." }, 422);
  }
  const name = str2(data.name).slice(0, 200);
  const stateCode = validState(data.state);
  const newsletter = data.newsletter === true || data.newsletter === "true" || data.newsletter === "on" || data.newsletter === "1";
  let validKeys;
  try {
    validKeys = await getValidSportKeys(env.DB);
  } catch (err) {
    console.error("sports lookup failed:", err);
    return json({ ok: false, error: "Profiles are temporarily unavailable. Please try again soon." }, 503);
  }
  const sports = parseSports(data.sports, validKeys);
  const existingId = await readProfileCookie(request, env.PROFILE_SIGNING_KEY);
  let id, isNew = false;
  try {
    if (existingId) {
      const existing = await getProfileById(env.DB, existingId);
      if (!existing) return json({ ok: false, error: "Your profile could not be found. Please start again." }, 404);
      await updateProfile(env.DB, existingId, { email, name, state: stateCode, sports, newsletter });
      id = existingId;
    } else {
      const dupe = await getProfileByEmail(env.DB, email);
      if (dupe) {
        return json({ ok: false, error: "That email already has a profile on another device. Recovery by email link is coming soon." }, 409);
      }
      id = await createProfile(env.DB, { email, name, state: stateCode, sports, newsletter });
      isNew = true;
    }
  } catch (err) {
    console.error("profile save failed:", err);
    return json({ ok: false, error: "That email already has a profile on another device. Recovery by email link is coming soon." }, 409);
  }
  if (newsletter) {
    const result = await subscribeToBeehiiv(env, email, "asnm-profile");
    if (!result.ok) console.error("profile newsletter opt-in failed:", result.error);
  }
  const sig = await signProfileId(id, env.PROFILE_SIGNING_KEY);
  return new Response(JSON.stringify({ ok: true, id, isNew }), {
    status: isNew ? 201 : 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Set-Cookie": serializeProfileCookie(id, sig) }
  });
}
__name(handleProfileUpsert, "handleProfileUpsert");
async function handleProfileGet(request, env) {
  if (!env.DB) return json({ ok: false }, 503, PROFILE_CACHE);
  if (!env.PROFILE_SIGNING_KEY) {
    console.error("PROFILE_SIGNING_KEY not configured");
    return json({ ok: false }, 503, PROFILE_CACHE);
  }
  const id = await readProfileCookie(request, env.PROFILE_SIGNING_KEY);
  if (!id) return json({ ok: false }, 401, PROFILE_CACHE);
  try {
    const profile = await getProfileWithFavorites(env.DB, id);
    if (!profile) return json({ ok: false }, 401, PROFILE_CACHE);
    return json({ ok: true, profile }, 200, PROFILE_CACHE);
  } catch (err) {
    console.error("profile fetch failed:", err);
    return json({ ok: false, error: "Profile temporarily unavailable" }, 500, PROFILE_CACHE);
  }
}
__name(handleProfileGet, "handleProfileGet");
async function handleProfileFavorite(request, env) {
  if (!env.DB) return json({ ok: false, error: "Profiles are temporarily unavailable. Please try again soon." }, 503);
  if (!env.PROFILE_SIGNING_KEY) {
    console.error("PROFILE_SIGNING_KEY not configured");
    return json({ ok: false, error: "Profiles are warming up. Please try again soon." }, 503);
  }
  const id = await readProfileCookie(request, env.PROFILE_SIGNING_KEY);
  if (!id) return json({ ok: false, error: "Create a free profile to save programs." }, 401);
  const data = await readBody(request);
  if (data === null) return json({ ok: false, error: "Could not read your submission." }, 400);
  const orgId = str2(data.org_id);
  if (!orgId) return json({ ok: false, error: "Missing program." }, 422);
  const on = data.on === true || data.on === "true" || data.on === "1";
  try {
    if (!await orgExists(env.DB, orgId)) return json({ ok: false, error: "That program was not found." }, 404);
    await setFavorite(env.DB, id, orgId, on);
    return json({ ok: true, org_id: orgId, on });
  } catch (err) {
    console.error("favorite toggle failed:", err);
    return json({ ok: false, error: "Could not save right now. Please try again soon." }, 500);
  }
}
__name(handleProfileFavorite, "handleProfileFavorite");
function handleProfileSignout() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Set-Cookie": clearProfileCookie() }
  });
}
__name(handleProfileSignout, "handleProfileSignout");
async function handleBlogIndex(url, env) {
  const site = url.origin;
  try {
    const result = await listPosts(env);
    if (!result.ok) return text(blogFallbackTemplate({ site }), 200, "text/html; charset=utf-8", BLOG_FALLBACK_CACHE);
    return text(blogIndexTemplate(result.posts, { site }), 200, "text/html; charset=utf-8", BLOG_PAGE_CACHE);
  } catch (err) {
    console.error("blog index failed:", err);
    return text(blogFallbackTemplate({ site }), 200, "text/html; charset=utf-8", BLOG_FALLBACK_CACHE);
  }
}
__name(handleBlogIndex, "handleBlogIndex");
async function handleBlogPost(url, env, slug) {
  const site = url.origin;
  try {
    const result = await getPostBySlug(env, slug);
    if (result.notFound) return text(blogNotFoundTemplate({ site }), 404, "text/html; charset=utf-8", BLOG_FALLBACK_CACHE);
    if (!result.ok) return text(blogFallbackTemplate({ site }), 200, "text/html; charset=utf-8", BLOG_FALLBACK_CACHE);
    return text(blogPostTemplate(result.post, { site }), 200, "text/html; charset=utf-8", BLOG_PAGE_CACHE);
  } catch (err) {
    console.error("blog post failed:", err);
    return text(blogFallbackTemplate({ site }), 200, "text/html; charset=utf-8", BLOG_FALLBACK_CACHE);
  }
}
__name(handleBlogPost, "handleBlogPost");
async function readBody(request) {
  try {
    const ct = request.headers.get("content-type") || "";
    return ct.includes("application/json") ? await request.json() : Object.fromEntries(await request.formData());
  } catch {
    return null;
  }
}
__name(readBody, "readBody");
async function verifyTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip || void 0 })
    });
    const out = await res.json();
    return !!out.success;
  } catch (err) {
    console.error("turnstile verify failed:", err);
    return false;
  }
}
__name(verifyTurnstile, "verifyTurnstile");
function str2(v) {
  return (typeof v === "string" ? v : "").trim().slice(0, 5e3);
}
__name(str2, "str");
async function safeText2(res) {
  try {
    return await res.text();
  } catch {
    return "(no body)";
  }
}
__name(safeText2, "safeText");
// Sheets-only account cutover: retain the deployed intake/export implementation.
// No website routes, assets, public admin API, or other pipeline lanes.
import { runSheets as runStagingSheets } from "./staging-engine.mjs";
const SYNC_CRON = "10,30,50 * * * *";
export default {
  fetch() { return new Response("Not found", {status:404}); },
  async scheduled(controller, env, ctx) {
    // Control-plane schedule updates do not prove that stale events stopped.
    if (controller.cron !== SYNC_CRON) {
      console.log(JSON.stringify({event:"sync_skipped",reason:"unexpected_cron",cron:controller.cron}));
      return;
    }
    const stagingEnv = {...env, DB:env.STAGING_DB, ASNM_MASTER_SHEET_ID:env.STAGING_MASTER_SHEET_ID, ATL_CRM_SHEET_ID:env.STAGING_CRM_SHEET_ID};
    ctx.waitUntil(Promise.allSettled([
      Promise.resolve().then(() => runSheets(env)),
      Promise.resolve().then(() => runStagingSheets(stagingEnv))
    ]).then(results => {
      const outcomes=results.map((r,i) => ({environment:i===0?"production":"staging",status:r.status,...(r.status==="fulfilled"?{result:r.value}:{error:String(r.reason)})}));
      console.log(JSON.stringify({event:"sync_completed",cron:controller.cron,outcomes}));
      const failed=outcomes.filter(o=>o.status==="rejected");
      if(failed.length) throw new Error(failed.map(o=>o.environment+": "+o.error).join("; "));
    }));
  }
};

export {runSheets};
