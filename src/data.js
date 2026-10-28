// Read-side data API over D1. Freshness decay (half-life 45 days, floor 5,
// null if never checked) is computed here rather than in SQL — D1 lacks pow().
// listPrograms filters: sport, state, q (text), plus nearby via zip / city / lat-lng.

import { loadZcta, resolveOrigin, applyNearby, milesBetween, cityCenter } from "./geo.js";
import { cachedCount } from "./read-cache.js";
import "../public/listing-art.js";
import { listingSport } from "../public/app/listing-sport.js";
import { isListable } from "../public/app/listable.js";
import { whoTags, whoText } from "../public/app/who.js";
import { publicText } from "./public-text.js";
import { parseSportSeasons, cleanSeasons } from "../public/app/yearly.js";
import { newerOrOlder } from "./schema-probe.js";

const ListingArt = globalThis.ListingArt;

export function freshness(lastOkAt, now = Date.now()) {
  if (!lastOkAt) return null;
  const days = (now - Date.parse(lastOkAt)) / 86400000;
  if (!isFinite(days) || days < 0) return 100;
  return Math.max(5, Math.round(100 * Math.pow(0.5, days / 45)));
}

const LIST_COLS = `id, name, org_type, sport, sport_key, website_url, city,
  state, state_name, zip, country, publicity_consent, address_publicity_consent, lat, lng, geo_precision, description, cost_note,
  equipment_provided, ages, data_quality_rating, verification_status, verification_method,
  last_ok_at, created_at`;

// A listing is public only when a person could act on it: a website to visit,
// a city and state to find, or a way to reach someone. Alec ruled on 2026-09-01
// that name-only rows stay hidden; production lost that state in the account
// move (1,069 of 2,465 live rows were name-only on 2026-10-13), so the rule
// lives here in code, where no data copy can drop it. The row stays in D1 for
// enrichment and reappears the moment it gains any of these.
// Email and phone count only when the program said yes to showing them
// (publicity_consent); a contact nobody can see is nothing to act on.
export const ACTIONABLE = `((website_url IS NOT NULL AND website_url <> '')
  OR (city IS NOT NULL AND city <> '' AND state IS NOT NULL AND state <> '')
  OR (publicity_consent = 1 AND email IS NOT NULL AND email <> '')
  OR (publicity_consent = 1 AND phone IS NOT NULL AND phone <> ''))`;
const PUBLIC = `is_public = 1 AND status = 'active' AND ${ACTIONABLE}`;
// The same rule, for a table under an alias in a join ("p" for programs).
const actionableOn = (t) => ACTIONABLE.replace(/\b(website_url|city|state|publicity_consent|email|phone)\b/g, `${t}.$1`);

// An organization's sports come from its programs that ride on its card (program_sports,
// see ORG_SPORTS); a program's from its own sport and seasons_json.
const isSport = (k) => ListingArt.SPORTS.includes(k);
function rowSeasons(r) {
  if (r.program_sports) {
    let list = [];
    try { list = JSON.parse(r.program_sports); } catch { list = []; }
    if (!Array.isArray(list) || !list.length) return null;
    // A sport added on the organization's card joins the sports it was already listed under;
    // it never replaces them (an organization that runs skiing and adds pickleball runs both).
    const map = {};
    const own = [r.sport_key];
    try { const listed = JSON.parse(r.org_sports_json || "[]"); if (Array.isArray(listed)) own.push(...listed); } catch { /* labels or nothing */ }
    // A sport with a program card of its own (its own place) is found there, not on this card.
    let elsewhere = [];
    try { elsewhere = JSON.parse(r.own_program_sports || "[]"); } catch { elsewhere = []; }
    for (const k of own) if (typeof k === "string" && isSport(k) && k !== "multi" && !(k in map) && !elsewhere.includes(k)) map[k] = [];
    for (const x of list) if (x && x.key) map[x.key] = x.seasons;
    return parseSportSeasons(map, isSport);
  }
  if (r.seasons_json != null && r.sport_key && isSport(r.sport_key) && r.sport_key !== "multi") {
    let seasons = [];
    try { seasons = cleanSeasons(JSON.parse(r.seasons_json)); } catch { seasons = []; }
    return [{ key: r.sport_key, seasons }];
  }
  return null;
}
// The sports an organization ticked, as JSON, read with the organization in one query.
const ORG_SPORTS = `(SELECT json_group_array(json_object('key', ps.sport_key, 'seasons',
    json(CASE WHEN json_valid(ps.seasons_json) THEN ps.seasons_json ELSE '[]' END)))
  FROM programs ps WHERE ps.organization_id = organizations.id AND ps.kind = 'program' AND ps.listing = 'with_org'
    AND ps.is_public = 1 AND ps.status = 'active' AND ps.sport_key IS NOT NULL) AS program_sports, sports_json AS org_sports_json,
  (SELECT json_group_array(po.sport_key) FROM programs po WHERE po.organization_id = organizations.id AND po.kind = 'program'
    AND po.listing = 'own' AND po.is_public = 1 AND po.status = 'active' AND po.sport_key IS NOT NULL) AS own_program_sports`;
// The newer program columns (migration 0015).
const PROGRAM_NEWER = "p.seasons_json, p.kind, p.listing, p.slug, p.usual_month, p.first_year";

function rowToProgram(r, dist) {
  const publicityConsent = r.publicity_consent === 1;
  const addressPublicityConsent = r.address_publicity_consent === 1;
  const preciseLocationConsent = addressPublicityConsent;
  return {
    id: r.id,
    name: r.name,
    type: r.org_type,
    sport: r.sport_key,            // icon/photo key (may be null -> generic styling)
    // Every sport it runs, with seasons (docs/specs/programs-that-come-back.md); null until it tells us.
    seasons: rowSeasons(r),
    sportLabel: r.sport,
    website: r.website_url,
    city: r.city,
    state: r.state,
    stateName: r.state_name,
    zip: preciseLocationConsent ? r.zip : null,
    country: addressPublicityConsent ? r.country : null,
    address: addressPublicityConsent ? r.address : null,
    lat: preciseLocationConsent ? r.lat : null,
    lng: preciseLocationConsent ? r.lng : null,
    geoPrecision: preciseLocationConsent ? r.geo_precision : null,
    publicityConsent,
    addressPublicityConsent,
    // Contact details in notes show only with the organization's yes (src/public-text.js).
    desc: publicText(r.description, publicityConsent),
    cost: publicText(r.cost_note, publicityConsent),
    equipment: r.equipment_provided === 1 ? "Provided" : r.equipment_provided === 0 ? "Bring your own" : null,
    ages: r.ages,
    quality: r.data_quality_rating,
    verification: r.verification_status,
    // Two separate signals (Alec, 2026-10-14). confirmed: the organization itself gave
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
// Programs are listed as places of their own: a person looks for a sport at a place
// (Alec, 2026-10-17), and an organization can run it in several. A program shows when it,
// and the organization that runs it, are public; the placeholder "Organization not yet
// assigned" is never named. A database without the programs table lists none.
const PROGRAM_LIST_COLS = `p.id, p.name, NULL AS org_type, p.sport, p.sport_key, p.website_url, p.city,
  p.state, p.state_name, p.zip, p.publicity_consent, p.address_publicity_consent, p.lat, p.lng, p.geo_precision, p.description, p.cost_note,
  p.equipment_provided, p.ages, NULL AS data_quality_rating, p.verification_status, p.verification_method,
  p.last_ok_at, p.created_at, o.id AS organization_id, o.name AS organization_name, o.org_type AS organization_type`;
export async function programsSnapshot(db, { places = null } = {}) {
  let rows;
  // A program with its own place is a card of its own. A sport the organization runs at its
  // own place rides on the organization's card (listing 'with_org'), and a yearly event lives
  // on the events page (kind 'event'); neither is a card here.
  const read = (cols, only) => db.prepare(`SELECT ${cols} FROM programs p JOIN organizations o ON o.id = p.organization_id
      WHERE ${PROGRAM_PUBLIC} AND ${actionableOn("p")}${only}
      ORDER BY (p.sport_key IS NULL), (p.state IS NULL), p.name`).all();
  try {
    rows = await newerOrOlder(db, "programs_come_back",
      () => read(`${PROGRAM_LIST_COLS}, ${PROGRAM_NEWER}`, " AND p.kind = 'program' AND p.listing = 'own'"),
      () => read(PROGRAM_LIST_COLS, ""));
  } catch (_) {
    return { total: 0, items: [] };
  }
  const items = rows.results.map((row) => {
    const p = rowToProgram(row);
    p.kind = "program";
    p.organizationId = row.organization_id;
    p.organization = row.organization_type === "placeholder" ? null : { id: row.organization_id, name: row.organization_name };
    if (places) p.cityCenter = cityCenter(row.city, row.state, places);
    return p;
  });
  return { total: items.length, items };
}

export async function directorySnapshot(db, { places = null } = {}) {
  const read = (cols) => db.prepare(`SELECT ${cols} FROM organizations
    WHERE ${PUBLIC}
    ORDER BY (sport_key IS NULL), (state IS NULL), name`).all();
  const rows = await newerOrOlder(db, "programs_come_back", () => read(`${LIST_COLS}, ${ORG_SPORTS}`), () => read(LIST_COLS));
  const items = rows.results.map(row => {
    const p = rowToProgram(row);
    if (places) p.cityCenter = cityCenter(row.city, row.state, places);
    return p;
  });
  return { total: items.length, items };
}

// The slim directory the site's lists and maps load first (/api/listings): what a
// card, a row, a map dot and a sport page need, nothing a listing's own page adds.
// That page loads the rest from /api/orgs/:id. Rows that are not programs
// (public/app/listable.js) never ship. Dates are days ("2026-10-08").
export async function listingsSnapshot(db, { places = null } = {}) {
  const [{ items: orgs }, { items: programs }] = await Promise.all([directorySnapshot(db, { places }), programsSnapshot(db, { places })]);
  // An organization whose programs are listed is shown through them (progs: how many),
  // so the same place is never listed twice; its own page still works.
  const listedPrograms = new Map();
  for (const p of programs) if (isListable(p)) listedPrograms.set(p.organizationId, (listedPrograms.get(p.organizationId) || 0) + 1);
  const items = [...orgs, ...programs];
  const day = (s) => (s ? String(s).slice(0, 10) : null);
  const out = [];
  for (const p of items) {
    if (!isListable(p)) continue;
    const { key, trio, more } = listingSport(p);
    const o = { id: p.id, name: p.name, key };
    if (trio) o.trio = trio;
    if (more) o.more = more;
    // The organization's own sports and seasons, so every one of them finds it by sport.
    if (p.seasons) o.seasons = p.seasons;
    // Who it says it serves, as codes (public/app/who.js); only when it says.
    // Who it serves: what its description says, and what the organization told us (ages, from the check-up).
    const who = whoTags(`${whoText(p.desc) || ""} ${p.ages || ""}`, key);
    if (who.length) o.who = who;
    if (p.city) o.city = p.city;
    if (p.state) o.state = p.state;
    if (p.cityCenter) o.center = p.cityCenter;
    if (p.addressPublicityConsent && Number.isFinite(p.lat) && Number.isFinite(p.lng)) {
      o.point = [p.lat, p.lng];
    }
    if (p.lastChecked) o.checked = day(p.lastChecked);
    else if (p.listedAt) o.listed = day(p.listedAt);
    if (p.confirmed) o.verified = 1;
    if (p.teamChecked) o.team = 1;
    if (p.kind === "program") {
      o.prog = 1;
      if (p.organization) o.org = p.organization.name;
    } else if (listedPrograms.get(p.id)) {
      o.progs = listedPrograms.get(p.id);
    }
    out.push(o);
  }
  return { total: out.length, items: out };
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
  const read = (cols) => db.prepare(
    `SELECT ${cols}, address, address_publicity_consent, email, phone, primary_data_source, verification_method, created_at, updated_at
     FROM organizations WHERE id = ? AND ${PUBLIC}`
  ).bind(id).first();
  const row = await newerOrOlder(db, "programs_come_back", () => read(`${LIST_COLS}, ${ORG_SPORTS}`), () => read(LIST_COLS));
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
    history: await publicHistory(db, row),
  };
}

// What a visitor may see of an organization's history: when it joined the directory and
// when the organization itself last confirmed or updated its listing. Only what can be
// trusted counts: a confirmation a person on our team applied, or an edit by the signed-in
// organization; a form anyone can send ("I'm with this organization") doesn't, until applied.
// Its yearly events' past years come with the events (/api/event-series?org=). The team's
// own notes never leave.
async function publicHistory(db, row) {
  const month = (s) => (s && /^\d{4}-\d{2}/.test(s) ? String(s).slice(0, 7) : null);
  const updated = await newerOrOlder(db, "programs_come_back", () => db.prepare(
    `SELECT MAX(created_at) AS at FROM organization_activity WHERE organization_id = ? AND kind IN ('applied', 'self_edit')`
  ).bind(row.id).first(), async () => null);
  return { listedSince: month(row.created_at), updatedByOrganization: month(updated?.at) };
}

const PROGRAM_COLS = `p.id, p.organization_id, p.name, NULL AS org_type, p.sport, p.sport_key,
  p.website_url, p.city, p.state, p.state_name, p.zip, p.country, p.publicity_consent, p.lat, p.lng,
  p.geo_precision, p.address, p.address_publicity_consent, p.description, p.cost_note, p.equipment_provided, p.ages,
  NULL AS data_quality_rating, p.verification_status, p.verification_method, p.last_ok_at, p.created_at`;
const PROGRAM_PUBLIC = "p.is_public = 1 AND p.status = 'active' AND o.is_public = 1 AND o.status = 'active'";
function programParent(row) {
  if (row.organization_type === "placeholder") return null;   // "Organization not yet assigned" is never shown
  return { id: row.organization_id, name: row.organization_name, city: row.organization_city,
    state: row.organization_state, stateName: row.organization_state_name, website: row.organization_website_url };
}
export async function listActualPrograms(db, params = new URLSearchParams()) {
  const where = [PROGRAM_PUBLIC], binds = [];
  const state = (params.get("state") || "").trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(state)) { where.push("p.state = ?"); binds.push(state); }
  const city = (params.get("city") || "").trim().slice(0, 120);
  if (city) { where.push("LOWER(p.city) = LOWER(?)"); binds.push(city); }
  const organizationId = (params.get("organization_id") || "").trim();
  if (organizationId) { where.push("p.organization_id = ?"); binds.push(organizationId); }
  const q = (params.get("q") || "").trim().slice(0, 120);
  if (q) { const like = `%${q.replace(/[\\%_]/g, "\\$&")}%`; where.push("(p.name LIKE ? ESCAPE '\\' OR o.name LIKE ? ESCAPE '\\' OR p.sport LIKE ? ESCAPE '\\')"); binds.push(like, like, like); }
  const limit = Math.min(Math.max(Number.parseInt(params.get("limit") || "60", 10) || 60, 1), 200);
  const offset = Math.max(Number.parseInt(params.get("offset") || "0", 10) || 0, 0);
  const read = (cols, only) => {
    const condition = where.join(" AND ") + only;
    return Promise.all([
      db.prepare(`SELECT COUNT(*) AS n FROM programs p JOIN organizations o ON o.id = p.organization_id WHERE ${condition}`).bind(...binds).first(),
      db.prepare(`SELECT ${cols}, o.name AS organization_name, o.org_type AS organization_type, o.city AS organization_city, o.state AS organization_state, o.state_name AS organization_state_name, o.website_url AS organization_website_url FROM programs p JOIN organizations o ON o.id = p.organization_id WHERE ${condition} ORDER BY p.name COLLATE NOCASE LIMIT ? OFFSET ?`).bind(...binds, limit, offset).all(),
    ]);
  };
  // Yearly events have their own list (/api/event-series); these are the programs.
  const [count, rows] = await newerOrOlder(db, "programs_come_back",
    // A sport that rides on its organization's card isn't a row of its own in the program list;
    // the organization's own page (organization_id) still lists all its programs.
    () => read(`${PROGRAM_COLS}, ${PROGRAM_NEWER}`, organizationId ? " AND p.kind = 'program'" : " AND p.kind = 'program' AND p.listing = 'own'"),
    () => read(PROGRAM_COLS, ""));
  return { total: count?.n ?? 0, limit, offset, items: (rows.results || []).map((row) => ({ ...rowToProgram(row), ...programExtras(row), organization: programParent(row) })) };
}
// When the program comes back, for its page and the editors.
function programExtras(row) {
  if (!("kind" in row)) return {};
  return { kind: row.kind, listing: row.listing, slug: row.slug || null, usualMonth: row.usual_month ?? null, firstYear: row.first_year ?? null };
}
export async function getProgram(db, id) {
  const read = (cols) => db.prepare(`SELECT ${cols}, p.email, p.phone, p.updated_at, o.name AS organization_name, o.org_type AS organization_type, o.city AS organization_city, o.state AS organization_state, o.state_name AS organization_state_name, o.website_url AS organization_website_url FROM programs p JOIN organizations o ON o.id = p.organization_id WHERE p.id = ? AND ${PROGRAM_PUBLIC}`).bind(id).first();
  const row = await newerOrOlder(db, "programs_come_back", () => read(`${PROGRAM_COLS}, ${PROGRAM_NEWER}`), () => read(PROGRAM_COLS));
  if (!row) return null;
  return { ...rowToProgram(row), ...programExtras(row), ...(row.publicity_consent === 1 ? { email: row.email, phone: row.phone } : {}), organization: programParent(row), updatedAt: row.updated_at };
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
