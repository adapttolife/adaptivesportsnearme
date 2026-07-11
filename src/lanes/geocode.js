// geocode: zip -> ZCTA centroid proposals (Spec 72 T05).
// Contract: for orgs with a zip whose geo_precision is 'state' or NULL, look up the
// vendored Census table (public/assets/data/zcta.json via env.ASSETS — one subrequest
// per run, no external API ever) and propose
//   { lat: {from,to}, lng: {from,to}, geo_precision: {from, to: 'zip'} }
// confidence 0.9. Unknown zips are skipped and counted in detail.

import { pendingOrgIds, proposeStmt } from "../lane-utils.js";

const GEOCODE_BATCH = 200;

// Pure. First 5 digits of the zip, tolerant of ZIP+4 ("55414-2109" -> "55414") and
// surrounding whitespace. Anything that doesn't start with 5 consecutive digits after
// trimming is not a usable zip -> null (unknown, never guessed).
export function normalizeZip(zip) {
  if (zip == null) return null;
  const trimmed = String(zip).trim();
  const match = trimmed.match(/^(\d{5})/);
  return match ? match[1] : null;
}

// Pure. Builds the review_queue proposed_change shape for a geocode hit — kept
// separate from the D1 loop so it's testable without mocking a database.
export function buildChange(org, coords) {
  const [lat, lng] = coords;
  return {
    lat: { from: org.lat, to: lat },
    lng: { from: org.lng, to: lng },
    geo_precision: { from: org.geo_precision, to: "zip" },
  };
}

export async function geocodeLane({ db, env, cursor }) {
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
  const now = new Date().toISOString();
  const stmts = [];
  let flagged = 0, unknown = 0;
  for (const org of orgs) {
    if (pending.has(org.id)) continue; // don't re-propose while a proposal awaits review

    const z = normalizeZip(org.zip);
    const coords = z ? zcta[z] : null;
    if (!coords) { unknown++; continue; }

    flagged++;
    stmts.push(proposeStmt(db, org.id, "geocode", buildChange(org, coords),
      { zip: z, source: "Census ZCTA gazetteer (vendored)", method: "zcta-centroid v1" }, 0.9, now));
  }
  if (stmts.length) await db.batch(stmts);
  return {
    cursor: orgs[orgs.length - 1].id,
    processed: orgs.length,
    flagged,
    detail: unknown ? `${unknown} unknown zips` : undefined,
  };
}
