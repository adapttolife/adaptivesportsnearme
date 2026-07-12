// Events lane — the calendar layer over the directory. One read path
// (listEvents) plus two pure feed generators shared by the JSON API and the
// subscription routes (/events.xml, /events.ics) so the format logic is
// testable without touching D1.

const EVENT_COLS = `id, title, description, org_id, sport_key, venue, city, state,
  url, starts_at, ends_at, all_day, status, source, created_at, updated_at`;

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

  const { results } = await db.prepare(
    `SELECT ${EVENT_COLS} FROM events WHERE ${where.join(" AND ")} ORDER BY starts_at ASC LIMIT ?`
  ).bind(...binds, limit).all();
  return { total: results.length, limit, items: results };
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
