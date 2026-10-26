// Events lane — the calendar layer over the directory. One read path
// (listEvents) plus two pure feed generators shared by the JSON API and the
// subscription routes (/events.xml, /events.ics) so the format logic is
// testable without touching D1.

import { newerOrOlder } from "./schema-probe.js";

const EVENT_COLS = `id, title, description, org_id, sport_key, venue, city, state,
  url, starts_at, ends_at, all_day, status, source, created_at, updated_at`;
// With migration 0015 (docs/specs/programs-that-come-back.md): the yearly event a
// date belongs to (a program with kind 'event'), and that year's results link.
const YEARLY_EVENT_COLS = `e.id, e.title, e.description, e.org_id, e.sport_key, e.venue, e.city, e.state,
  e.url, e.starts_at, e.ends_at, e.all_day, e.status, e.source, e.created_at, e.updated_at,
  e.program_id, e.recap_url, p.slug AS series_slug, p.name AS series_name, p.first_year AS series_first_year`;
// A yearly event is public when it and its organization are.
const YEARLY_PUBLIC = `p.kind = 'event' AND p.is_public = 1 AND p.status = 'active' AND o.is_public = 1 AND o.status = 'active'`;

export async function listEvents(db, params) {
  const cutoff = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
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

  const results = await newerOrOlder(db, "programs_come_back",
    async () => {
      const { results: rows } = await db.prepare(
        `SELECT ${YEARLY_EVENT_COLS} FROM events e
         LEFT JOIN programs p ON p.id = e.program_id
         LEFT JOIN organizations o ON o.id = p.organization_id
         WHERE ${where.map((w) => "e." + w).join(" AND ")} ORDER BY e.starts_at ASC LIMIT ?`
      ).bind(...binds, limit).all();
      // The series is named only when the yearly event is public (checked here, not in the join, to keep the join simple).
      const visible = new Set();
      const ids = [...new Set(rows.map((r) => r.program_id).filter(Boolean))];
      if (ids.length) {
        const { results: ok } = await db.prepare(
          `SELECT p.id FROM programs p JOIN organizations o ON o.id = p.organization_id WHERE ${YEARLY_PUBLIC} AND p.id IN (${ids.map(() => "?").join(",")})`
        ).bind(...ids).all();
        for (const r of ok) visible.add(r.id);
      }
      return rows.map((row) => withSeries(row, visible));
    },
    async () => (await db.prepare(
      `SELECT ${EVENT_COLS} FROM events WHERE ${where.join(" AND ")} ORDER BY starts_at ASC LIMIT ?`
    ).bind(...binds, limit).all()).results);
  return { total: results.length, limit, items: results };
}

// An event row with its yearly event folded into `series` ({ slug, name, first_year } or null).
function withSeries(row, visible) {
  const { series_slug, series_name, series_first_year, ...event } = row;
  const shown = event.program_id && visible.has(event.program_id);
  event.series = shown ? { slug: series_slug || event.program_id, name: series_name, first_year: series_first_year ?? null } : null;
  if (!shown) event.program_id = null;   // a hidden yearly event isn't named
  return event;
}

// ---- Yearly events --------------------------------------------------------------
// A yearly event is a program with kind 'event'; each year is an events row with
// program_id. Its page stays true between years (docs/specs/programs-that-come-back.md).
const SERIES_COLS = `p.id, p.slug, p.name, p.organization_id AS org_id, o.name AS host_name, p.sport_key, p.description,
  p.city, p.state, p.website_url AS url, p.usual_month, p.first_year, p.created_at, p.updated_at,
  o.org_type AS organization_type`;
export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

function seriesFromRow(row, editions) {
  const { organization_type, ...s } = row;
  s.slug = s.slug || s.id;
  s.description = s.description || "";
  s.venue = null;
  // "Organization not yet assigned" is never named or linked.
  const placeholder = organization_type === "placeholder";
  s.organization = placeholder ? null : { id: s.org_id, name: s.host_name };
  if (placeholder) { s.host_name = null; s.org_id = null; }
  s.editions = editions.map(({ program_id, ...e }) => e);
  return s;
}

async function editionsFor(db, ids) {
  const out = new Map(ids.map((id) => [id, []]));
  if (!ids.length) return out;
  // Every public year, past and upcoming: a past year is the event's history, not stale data.
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const { results } = await db.prepare(
      `SELECT id, program_id, title, starts_at, ends_at, all_day, venue, city, state, url, recap_url, status
       FROM events WHERE is_public = 1 AND program_id IN (${chunk.map(() => "?").join(",")}) ORDER BY starts_at ASC`
    ).bind(...chunk).all();
    for (const e of results) out.get(e.program_id)?.push(e);
  }
  return out;
}

/** Every public yearly event with its years. params: org=<organization id>. */
export async function listSeries(db, params = new URLSearchParams()) {
  return newerOrOlder(db, "programs_come_back", async () => {
    const where = [YEARLY_PUBLIC], binds = [];
    const org = (params.get("org") || "").trim();
    if (org) { where.push("p.organization_id = ?"); binds.push(org); }
    const { results } = await db.prepare(
      `SELECT ${SERIES_COLS} FROM programs p JOIN organizations o ON o.id = p.organization_id
       WHERE ${where.join(" AND ")} ORDER BY p.name COLLATE NOCASE LIMIT 500`
    ).bind(...binds).all();
    const editions = await editionsFor(db, results.map((r) => r.id));
    const items = results.map((r) => seriesFromRow(r, editions.get(r.id) || []));
    return { total: items.length, items };
  }, async () => ({ total: 0, items: [] }));
}

/** One public yearly event by its slug (or its program id); null when there isn't one. */
export async function getSeries(db, slugOrId) {
  const key = String(slugOrId || "").toLowerCase();
  if (!SLUG_RE.test(key)) return null;
  return newerOrOlder(db, "programs_come_back", async () => {
    const row = await db.prepare(
      `SELECT ${SERIES_COLS} FROM programs p JOIN organizations o ON o.id = p.organization_id
       WHERE (p.slug = ? OR p.id = ?) AND ${YEARLY_PUBLIC}`
    ).bind(key, key).first();
    if (!row) return null;
    const editions = await editionsFor(db, [row.id]);
    return seriesFromRow(row, editions.get(row.id) || []);
  }, async () => null);
}

// ---- XML/text escaping -------------------------------------------------------
function xmlEscape(s) {
  return s == null ? "" : String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

// RFC 5545 text escaping: backslash first, then the chars it introduces.
function icsEscape(s) {
  return s == null ? "" : String(s)
    .replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function pad2(n) { return String(n).padStart(2, "0"); }
// UTC basic format, e.g. 20260712T093000Z — the RFC 5545 DATE-TIME form.
function icsDateTime(iso) {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}` +
    `T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`;
}
// UTC basic DATE form (no time), for all-day VALUE=DATE fields.
function icsDate(iso) {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}`;
}
// All-day DTEND is exclusive per RFC 5545 — bump one day past the given date
// so a single-day all-day event still renders with a real (non-zero) span.
function icsDatePlusOne(iso) {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + 1);
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}`;
}

// ---- RSS 2.0 ------------------------------------------------------------------
export function eventsToRss(events, siteUrl) {
  const site = String(siteUrl || "").replace(/\/$/, "");
  const items = events.map((e) => {
    const link = e.url || `${site}/events`;
    return "  <item>\n" +
      `    <title>${xmlEscape(e.title)}</title>\n` +
      `    <link>${xmlEscape(link)}</link>\n` +
      `    <guid isPermaLink="false">${xmlEscape(e.id)}</guid>\n` +
      `    <pubDate>${new Date(e.created_at).toUTCString()}</pubDate>\n` +
      `    <description>${xmlEscape(e.description || "")}</description>\n` +
      "  </item>";
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0">\n<channel>\n` +
    `  <title>Adaptive Sports Near Me · Events</title>\n` +
    `  <link>${xmlEscape(site)}/events</link>\n` +
    `  <description>Upcoming adaptive sports events, meets and clinics.</description>\n` +
    (items ? `${items}\n` : "") +
    `</channel>\n</rss>\n`;
}

// ---- iCalendar (RFC 5545) -------------------------------------------------------
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

export function eventsToIcs(events) {
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Adaptive Sports Near Me//Events//EN",
    "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:Adaptive Sports Near Me",
  ];
  for (const e of events) lines.push(...icsEventLines(e));
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
