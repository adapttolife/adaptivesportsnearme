// What an organization offers, and when it comes back (docs/specs/programs-that-come-back.md).
// One place writes it, whoever is asking: an organization confirming its listing
// (applied by a person in the review queue), a signed-in organization in /manage,
// or the admin dashboard. So the rules are the same everywhere:
//
// - A sport the organization runs at its own place is a program with
//   listing = 'with_org': it rides on the organization's card, found under its sport.
// - A sport that already has its own program keeps it; only its seasons change.
// - "These are all our sports" hides the organization's with_org programs it no longer
//   names. Never deletes, never touches a program with its own place.
// - An event held every year is a program with kind = 'event', its own address
//   (slug) and its years as dated events rows.
// - Every change leaves one line in organization_activity, the team-only history.

import { newerOrOlder } from "./schema-probe.js";
import { SPORT_NAMES } from "./sport-names.js";
import { cleanSeasons, seriesSlug, seasonsText, MONTHS } from "../public/app/yearly.js";

const now = () => new Date().toISOString();
const oneLine = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const STATE_NAMES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};
export const sportName = (k) => SPORT_NAMES[k] || k;

/** One line in the team-only history. Quietly does nothing before migration 0015. */
export async function logActivity(db, organizationId, kind, summary, { actor = "system", ref = null, at = now() } = {}) {
  if (!organizationId || !summary) return;
  await newerOrOlder(db, "programs_come_back", () => db.prepare(
    `INSERT INTO organization_activity (id, organization_id, kind, summary, actor, ref, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(crypto.randomUUID(), organizationId, kind, oneLine(summary, 500), actor ? oneLine(actor, 320) : null, ref ? String(ref).slice(0, 120) : null, at).run(), async () => {});
}

/** The team-only history, newest first. */
export async function organizationActivity(db, organizationId, limit = 200) {
  return newerOrOlder(db, "programs_come_back", async () => (await db.prepare(
    `SELECT id, kind, summary, actor, ref, created_at FROM organization_activity WHERE organization_id = ? ORDER BY created_at DESC, rowid DESC LIMIT ?`
  ).bind(organizationId, limit).all()).results || [], async () => []);
}

/** "Skiing (winter), Tennis (year-round)" for the history line. */
export function sportsSummary(list) {
  return (list || []).map(({ key, seasons }) => {
    const s = seasonsText(seasons);
    return s ? `${sportName(key)} (${s.toLowerCase()})` : sportName(key);
  }).join(", ");
}

/** Every sport an organization runs: its with_org and own programs that are public. */
async function refreshOrganizationSports(db, organization, timestamp) {
  const { results } = await db.prepare(
    `SELECT DISTINCT sport_key FROM programs WHERE organization_id = ? AND kind = 'program' AND is_public = 1 AND status = 'active'
       AND sport_key IS NOT NULL AND sport_key <> '' AND sport_key <> 'multi' ORDER BY (listing = 'own'), rowid`
  ).bind(organization.id).all();
  const keys = (results || []).map((r) => r.sport_key);
  if (!keys.length) {
    // None left: search stops finding it under sports it no longer runs; its own sport words stay.
    await db.prepare(`UPDATE organizations SET sports_json = NULL, updated_at = ? WHERE id = ?`).bind(timestamp, organization.id).run();
    return;
  }
  const one = keys.length === 1 ? keys[0] : null;
  await db.prepare(`UPDATE organizations SET sports_json = ?, sport = ?, sport_key = ?, updated_at = ? WHERE id = ?`)
    .bind(JSON.stringify(keys), one ? sportName(one) : "Multi-sport", one || "multi", timestamp, organization.id).run();
}

/** The organization's sports with their seasons, from its programs (for the editors to prefill). */
export async function organizationSports(db, organizationId) {
  return newerOrOlder(db, "programs_come_back", async () => {
    const { results } = await db.prepare(
      `SELECT id, name, sport_key, seasons_json, listing FROM programs
       WHERE organization_id = ? AND kind = 'program' AND is_public = 1 AND status = 'active' AND sport_key IS NOT NULL AND sport_key <> 'multi'
       ORDER BY (listing = 'own'), rowid`
    ).bind(organizationId).all();
    const out = [];
    for (const r of results || []) {
      let seasons = [];
      try { seasons = cleanSeasons(JSON.parse(r.seasons_json || "[]")); } catch { seasons = []; }
      const have = out.find((x) => x.key === r.sport_key);
      if (have) { if (!have.seasons.length) have.seasons = seasons; continue; }
      out.push({ key: r.sport_key, seasons, program_id: r.id, own: r.listing === "own", name: r.name });
    }
    return out;
  }, async () => []);
}

/** Write every sport the organization runs, with its seasons.
    list: [{ key, seasons }] (already cleaned). complete: the list is every sport they run,
    so with_org programs it leaves out are hidden. Returns a summary of what changed. */
export async function applySports(db, organization, list, { complete = true, checked = false, timestamp = now() } = {}) {
  const changed = { added: [], updated: [], hidden: [] };
  const named = new Set((list || []).map((x) => x.key));
  for (const { key, seasons } of list || []) {
    const json = JSON.stringify(cleanSeasons(seasons));
    const existing = await db.prepare(
      `SELECT id, seasons_json, is_public, listing FROM programs WHERE organization_id = ? AND kind = 'program' AND sport_key = ?
       ORDER BY (listing = 'with_org') DESC, is_public DESC, rowid LIMIT 1`
    ).bind(organization.id, key).first();
    if (existing) {
      if (existing.seasons_json !== json || (existing.listing === "with_org" && existing.is_public !== 1)) {
        await db.prepare(`UPDATE programs SET seasons_json = ?, is_public = CASE WHEN listing = 'with_org' THEN 1 ELSE is_public END, updated_at = ? WHERE id = ?`)
          .bind(json, timestamp, existing.id).run();
        changed.updated.push(key);
      }
      continue;
    }
    const state = STATE_NAMES[organization.state] ? organization.state : null;
    await db.prepare(`INSERT INTO programs (id, organization_id, name, sport, sport_key, city, state, state_name, seasons_json, kind, listing,
        verification_status, status, is_public, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'program', 'with_org', ?, 'active', 1, ?, ?)`)
      .bind(crypto.randomUUID(), organization.id, sportName(key), sportName(key), key, organization.city || null, state, state ? STATE_NAMES[state] : null,
        json, checked ? "verified" : "unverified", timestamp, timestamp).run();
    changed.added.push(key);
  }
  if (complete) {
    const { results } = await db.prepare(
      `SELECT id, sport_key FROM programs WHERE organization_id = ? AND kind = 'program' AND listing = 'with_org' AND is_public = 1`
    ).bind(organization.id).all();
    for (const r of results || []) {
      if (named.has(r.sport_key)) continue;
      await db.prepare(`UPDATE programs SET is_public = 0, updated_at = ? WHERE id = ?`).bind(timestamp, r.id).run();
      changed.hidden.push(r.sport_key);
    }
  }
  if (changed.added.length || changed.updated.length || changed.hidden.length) await refreshOrganizationSports(db, organization, timestamp);
  return changed;
}

async function freeSlug(db, base, state) {
  const taken = async (s) => !!(await db.prepare(`SELECT 1 AS x FROM programs WHERE slug = ?`).bind(s).first());
  if (!(await taken(base))) return base;
  const withState = state ? `${base}-${String(state).toLowerCase()}` : "";
  if (withState && !(await taken(withState))) return withState;
  for (let n = 2; n < 100; n++) if (!(await taken(`${base}-${n}`))) return `${base}-${n}`;
  return "";
}

/** The organization's yearly event of this name, or a new one. Returns its program id (or null).
    fields: { name, usual_month, url, sport_key, city, state, first_year } */
export async function yearlyEvent(db, organization, fields, { checked = false, timestamp = now() } = {}) {
  const name = oneLine(fields.name, 120)
    .replace(/\b(19|20)\d{2}\b/g, "").replace(/\b\d+(st|nd|rd|th)\s+annual\b/ig, "").replace(/\s+/g, " ").trim();
  const base = seriesSlug(name);
  if (!name || !base) return null;
  // The same event: its exact address, the address with a state or a number after it
  // ("ski-fest-nh", "ski-fest-2"), or the same name. Never a longer name ("ski-fest-junior").
  const { results: candidates } = await db.prepare(
    `SELECT id, slug, name FROM programs WHERE organization_id = ? AND kind = 'event' AND (slug = ? OR slug LIKE ? OR name = ? COLLATE NOCASE)`
  ).bind(organization.id, base, `${base}-%`, name).all();
  const same = new RegExp(`^${base.replace(/[-]/g, "\\-")}(?:-(?:[a-z]{2}|\\d+))?$`);
  const mine = (candidates || []).find((c) => (c.slug && same.test(c.slug)) || String(c.name).toLowerCase() === name.toLowerCase()) || null;
  const month = Number(fields.usual_month);
  const usualMonth = Number.isInteger(month) && month >= 1 && month <= 12 ? month : null;
  const firstYear = Number.isInteger(Number(fields.first_year)) && fields.first_year ? Number(fields.first_year) : null;
  if (mine) {
    // Fill what it lacks; never overwrite what someone already set, and never re-show one the team hid.
    await db.prepare(`UPDATE programs SET usual_month = COALESCE(usual_month, ?), website_url = COALESCE(website_url, ?), first_year = COALESCE(?, first_year), updated_at = ? WHERE id = ?`)
      .bind(usualMonth, fields.url || null, firstYear, timestamp, mine.id).run();
    return mine.id;
  }
  const slug = await freeSlug(db, base, organization.state);
  if (!slug) return null;
  const id = crypto.randomUUID();
  const state = STATE_NAMES[fields.state || organization.state] ? (fields.state || organization.state) : null;
  await db.prepare(`INSERT INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, kind, listing, usual_month, first_year, slug,
      verification_status, status, is_public, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'event', 'own', ?, ?, ?, ?, 'active', 1, ?, ?)`)
    .bind(id, organization.id, name, fields.sport_key ? sportName(fields.sport_key) : null, fields.sport_key || null, fields.url || null,
      fields.city || organization.city || null, state, state ? STATE_NAMES[state] : null, usualMonth, firstYear, slug, checked ? "verified" : "unverified", timestamp, timestamp).run();
  return id;
}

/** "Winter Ski Festival (usually February)" for the history line. */
export function yearlySummary(list) {
  return (list || []).map((e) => `${e.name}${e.month ? ` (usually ${MONTHS[e.month - 1]})` : ""}`).join(", ");
}

/** What a person applies from the review queue when an organization confirmed its listing. */
export async function applyConfirmation(db, organization, payload, { actor = "system", ref = null, timestamp = now() } = {}) {
  const sports = [];
  if (payload.sports && typeof payload.sports === "object" && !Array.isArray(payload.sports)) {
    for (const [key, seasons] of Object.entries(payload.sports)) {
      if (Object.prototype.hasOwnProperty.call(SPORT_NAMES, key) && key !== "multi" && !sports.some((x) => x.key === key)) sports.push({ key, seasons: cleanSeasons(seasons) });
    }
  }
  const changed = sports.length ? await applySports(db, organization, sports, { complete: true, checked: true, timestamp }) : null;
  const yearly = Array.isArray(payload.yearly) ? payload.yearly.slice(0, 3) : [];
  const started = [];
  const single = sports.length === 1 ? sports[0].key : null;
  for (const e of yearly) {
    const url = e && /^https?:\/\//i.test(String(e.url || "")) ? String(e.url).slice(0, 500) : null;
    const id = await yearlyEvent(db, organization, { name: e && e.name, usual_month: e && e.month, url, sport_key: single }, { checked: true, timestamp });
    if (id) started.push(e);
  }
  const parts = [];
  if (sports.length) parts.push(`sports: ${sportsSummary(sports)}`);
  if (changed && changed.hidden.length) parts.push(`no longer listed: ${changed.hidden.map(sportName).join(", ")}`);
  if (started.length) parts.push(`yearly events: ${yearlySummary(started)}`);
  await logActivity(db, organization.id, "applied", `Applied the organization's confirmation${parts.length ? `. ${parts.join("; ")}` : ""}`, { actor, ref, at: timestamp });
  return { sports: changed, yearly: started.length };
}

/** The month (1 to 12) an event starts in, on the calendar where it happens. A date written
    "2026-10-31" is that day; an instant ("2026-11-01T00:30:00Z", a 7:30 pm Central start) is read
    in US Central time, the site's home zone, so it isn't pushed into the next month. */
export function startMonth(iso) {
  const text = String(iso || "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return Number(text.slice(5, 7));
  const d = new Date(text);
  if (Number.isNaN(d.getTime())) return null;
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", month: "numeric" }).format(d));
}
