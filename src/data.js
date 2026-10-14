// Read-side data API over D1. Freshness decay (half-life 45 days, floor 5,
// null if never checked) is computed here rather than in SQL — D1 lacks pow().
// listPrograms filters: sport, state, q (text), plus nearby via zip / city / lat-lng.

import { loadZcta, resolveOrigin, applyNearby, milesBetween, cityCenter } from "./geo.js";
import { cachedCount } from "./read-cache.js";
import "../public/listing-art.js";

const ListingArt = globalThis.ListingArt;

export function freshness(lastOkAt, now = Date.now()) {
  if (!lastOkAt) return null;
  const days = (now - Date.parse(lastOkAt)) / 86400000;
  if (!isFinite(days) || days < 0) return 100;
  return Math.max(5, Math.round(100 * Math.pow(0.5, days / 45)));
}

const LIST_COLS = `id, name, org_type, sport, sport_key, website_url, city,
  state, state_name, zip, publicity_consent, lat, lng, geo_precision, description, cost_note,
  equipment_provided, ages, data_quality_rating, verification_status, verification_method,
  last_ok_at, created_at`;

// A listing is public only when a person could act on it: a website to visit,
// a city and state to find, or a way to reach someone. Alec ruled on 2026-09-01
// that name-only rows stay hidden; production lost that state in the account
// move (1,069 of 2,465 live rows were name-only on 2026-10-13), so the rule
// lives here in code, where no data copy can drop it. The row stays in D1 for
// enrichment and reappears the moment it gains any of these.
export const ACTIONABLE = `((website_url IS NOT NULL AND website_url <> '')
  OR (city IS NOT NULL AND city <> '' AND state IS NOT NULL AND state <> '')
  OR (email IS NOT NULL AND email <> '')
  OR (phone IS NOT NULL AND phone <> ''))`;
const PUBLIC = `is_public = 1 AND status = 'active' AND ${ACTIONABLE}`;

function rowToProgram(r, dist) {
  const publicityConsent = r.publicity_consent === 1;
  return {
    id: r.id,
    name: r.name,
    type: r.org_type,
    sport: r.sport_key,            // icon/photo key (may be null -> generic styling)
    sportLabel: r.sport,
    website: r.website_url,
    city: r.city,
    state: r.state,
    stateName: r.state_name,
    zip: publicityConsent ? r.zip : null,
    lat: publicityConsent ? r.lat : null,
    lng: publicityConsent ? r.lng : null,
    geoPrecision: publicityConsent ? r.geo_precision : null,
    publicityConsent,
    desc: r.description,
    cost: r.cost_note,
    equipment: r.equipment_provided === 1 ? "Provided" : r.equipment_provided === 0 ? "Bring your own" : null,
    ages: r.ages,
    quality: r.data_quality_rating,
    verification: r.verification_status,
    // Two separate signals (Alec, 2026-10-14). confirmed: the program itself gave
    // permission, which is the Verified check on the site (publicity_consent, the
    // same flag that lets its contact details show). teamChecked: a person on our
    // team checked the listing (verification_status 'verified', checkedMonth when).
    // Neither is a score, and only confirmed earns the word Verified.
    confirmed: publicityConsent,
    teamChecked: r.verification_status === "verified",
    checkedMonth: verifiedMonth(r),
    listedAt: r.created_at || null,
    freshness: freshness(r.last_ok_at),
    lastChecked: r.last_ok_at,
    dist: publicityConsent && dist != null ? Math.round(dist * 10) / 10 : null,
  };
}

function nearPayload(origin) {
  if (!origin || origin.missing) return null;
  return {
    lat: origin.lat,
    lng: origin.lng,
    radius: origin.radius,
    zip: origin.zip || null,
    city: origin.city || null,
    source: origin.source,
  };
}

// The homepage already needs the whole directory for local filters and maps.
// Read it once rather than repeating COUNT + OFFSET scans for every 200 rows.
// places (optional): the city table from loadPlaces(), so each item carries the
// center of its listed city for maps and "near you".
export async function directorySnapshot(db, { places = null } = {}) {
  const rows = await db.prepare(`SELECT ${LIST_COLS} FROM organizations
    WHERE ${PUBLIC}
    ORDER BY (sport_key IS NULL), (state IS NULL), name`).all();
  const items = rows.results.map(row => {
    const p = rowToProgram(row);
    if (places) p.cityCenter = cityCenter(row.city, row.state, places);
    return p;
  });
  return { total: items.length, items };
}

export async function listPrograms(db, params, opts = {}) {
  const where = [PUBLIC];
  const binds = [];
  const sport = (params.get("sport") || "").trim();
  if (sport) {
    // Match the primary key/label OR membership in the multi-sport array (Spec 72:
    // classification fills sports_json with taxonomy sport_keys).
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

  const zcta = opts.zcta !== undefined ? opts.zcta : await loadZcta(opts.assets);
  const origin = resolveOrigin(params, zcta);

  // Unknown zip (or unreadable ZCTA table): a nearby query must not fall through
  // to the unfiltered directory — that was the original bug (zip ignored → 1544).
  if (origin && origin.missing === "zip") {
    const limit = Math.min(Math.max(parseInt(params.get("limit") || "60", 10) || 60, 1), 200);
    const offset = Math.max(parseInt(params.get("offset") || "0", 10) || 0, 0);
    return { total: 0, limit, offset, items: [], near: null };
  }

  // Known city without a centroid: text-match the city column (a subset).
  if (origin && origin.missing === "city") {
    where.push("LOWER(city) = LOWER(?)");
    binds.push(origin.city);
  }

  const limit = Math.min(Math.max(parseInt(params.get("limit") || "60", 10) || 60, 1), 200);
  const offset = Math.max(parseInt(params.get("offset") || "0", 10) || 0, 0);
  const cond = where.join(" AND ");

/*
  if (origin && !origin.missing) {
    const rows = await db.prepare(
      `SELECT ${LIST_COLS} FROM organizations WHERE ${cond} AND publicity_consent = 1 AND lat IS NOT NULL AND lng IS NOT NULL`
    ).bind(...binds).all();
    const ranked = applyNearby(rows.results, origin);
    const total = ranked.length;
    const items = ranked.slice(offset, offset + limit).map(({ row, dist }) => rowToProgram(row, dist));
    return { total, limit, offset, items, near: nearPayload(origin) };
  }
*/

  const [count, rows] = await Promise.all([
    cachedCount(db, cond, binds),
    db.prepare(
      `SELECT ${LIST_COLS} FROM organizations WHERE ${cond}
       ORDER BY (sport_key IS NULL), (state IS NULL), name LIMIT ? OFFSET ?`
    ).bind(...binds, limit, offset).all(),
  ]);
  return { total: count?.n ?? 0, limit, offset, items: rows.results.map((r) => rowToProgram(r)), near: nearPayload(origin) };
}

export async function getOrg(db, id) {
  const row = await db.prepare(
    `SELECT ${LIST_COLS}, email, phone, primary_data_source, verification_method, created_at, updated_at
     FROM organizations WHERE id = ? AND ${PUBLIC}`
  ).bind(id).first();
  if (!row) return null;
  const sources = await db.prepare(
    `SELECT s.source_name AS name, s.source_organization AS organization, s.source_url AS url
     FROM organization_data_sources ods JOIN data_sources s ON s.source_id = ods.source_id
     WHERE ods.organization_id = ?`
  ).bind(id).all();
  return {
    ...rowToProgram(row),
    // Contact details show only when the program gave permission (publicity_consent, Faisal 2026-10-14).
    ...(row.publicity_consent === 1 ? { email: row.email, phone: row.phone } : {}),
    // This is a public API: our own research files (CSV names, Drive links, a
    // teammate's name) leave as "Adaptive Sports Near Me research", unlinked.
    primarySource: ListingArt.sourceLabel(row.primary_data_source),
    sources: publicSources(sources.results),
    listedAt: row.created_at,
    verifiedMonth: verifiedMonth(row),
    updatedAt: row.updated_at,
  };
}

// Sources as a visitor may see them, once each.
export function publicSources(rows) {
  const seen = new Set();
  const out = [];
  for (const s of rows || []) {
    const p = ListingArt.publicSource(s);
    if (!p) continue;
    const key = p.name + "\n" + (p.url || "");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name: p.name, organization: ListingArt.isInternalSource(s) ? null : (s.organization || null), url: p.url });
  }
  return out;
}

// verification_method is a JSON note on rows a person verified
// ({"status":"verified","verification_month":"2026-09",...}); the month is the
// only part a visitor needs. Anything else (plain words, broken JSON) gives null.
export function verifiedMonth(row) {
  if (!row || row.verification_status !== "verified" || !row.verification_method) return null;
  try {
    const m = JSON.parse(row.verification_method);
    const ym = m && typeof m.verification_month === "string" ? m.verification_month : "";
    return /^\d{4}-\d{2}$/.test(ym) ? ym : null;
  } catch {
    return null;
  }
}

export async function stats(db) {
  const [total, bySport, byState, sources, lastRun] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS n FROM organizations WHERE ${PUBLIC}`).first(),
    db.prepare(`SELECT sport AS label, sport_key AS key, COUNT(*) AS n FROM organizations
                WHERE ${PUBLIC} GROUP BY sport ORDER BY n DESC`).all(),
    db.prepare(`SELECT state, state_name AS name, COUNT(*) AS n FROM organizations
                WHERE ${PUBLIC} AND state IS NOT NULL
                GROUP BY state ORDER BY n DESC`).all(),
    db.prepare(`SELECT COUNT(*) AS n FROM data_sources WHERE status = 'active'`).first(),
    db.prepare(`SELECT lane, finished_at FROM pipeline_runs ORDER BY run_id DESC LIMIT 1`).first(),
  ]);
  return {
    programs: total?.n ?? 0,
    sources: sources?.n ?? 0,
    bySport: bySport.results,
    byState: byState.results,
    lastPipelineRun: lastRun || null,
  };
}

// Same-sport neighbors for the program sheet (4–6 cards). Distance when the
// listing has coordinates; otherwise directory order. Never invents a city.
export async function listSameSportNearby(db, org, limit = 6) {
  const n = Math.min(Math.max(limit || 6, 1), 6);
  const sportKey = org.sport;
  const sportLabel = org.sportLabel;
  if (!org.id || (!sportKey && !sportLabel)) return [];
  const where = [PUBLIC, "id != ?"];
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
      const dist = (p.lat != null && p.lng != null)
        ? Math.round(milesBetween(org.lat, org.lng, p.lat, p.lng) * 10) / 10
        : null;
      return { ...p, dist };
    }).sort((a, b) => (a.dist ?? 1e9) - (b.dist ?? 1e9));
  }
  return items.slice(0, n);
}


// ---- Grants (athlete-facing public directory) --------------------------------
const GRANT_COLS = `id, name, source, type, audience, amount_min_cents, amount_max_cents,
  amount_display, deadline_display, deadline_next, description,
  eligibility_criteria, how_to_apply, application_url, source_url,
  email, phone, sports_json, is_open, is_renewable`;

const PHOTO_KEYS = new Set([
  "baseball", "basketball", "cycling", "football", "goalball",
  "pickleball", "rugby", "skiing", "sledhockey", "tennis", "waterskiing",
]);

function sportsLabel(keys) {
  if (!keys || !keys.length) return null;
  const names = {
    baseball: "Baseball", basketball: "Basketball", cycling: "Cycling",
    football: "Football", goalball: "Goalball", pickleball: "Pickleball",
    rugby: "Rugby", skiing: "Skiing", sledhockey: "Sled Hockey",
    tennis: "Tennis", waterskiing: "Water Ski",
  };
  return keys.map((k) => names[k] || k).join(", ");
}

function rowToGrant(r) {
  let sports = [];
  try { sports = r.sports_json ? JSON.parse(r.sports_json) : []; } catch { sports = []; }
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
    isRenewable: r.is_renewable === 1,
  };
}

export async function listGrants(db, params) {
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

export async function getGrant(db, id) {
  const row = await db.prepare(
    `SELECT ${GRANT_COLS} FROM grants WHERE id = ? AND is_public = 1`
  ).bind(id).first();
  return row ? rowToGrant(row) : null;
}

export async function listOtherGrants(db, grant, limit = 6) {
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
