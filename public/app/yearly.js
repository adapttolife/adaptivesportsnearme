/* Seasons and yearly events: the words the site uses for "when".
   Shared by the Worker and the browser (like listing-sport.js), so the server,
   the pages and the tests all say it the same way. Pure functions, no DOM.

   Two ideas (docs/specs/programs-that-come-back.md):
   - An organization says which sports it runs and in which seasons. A ski
     program in July is "Winter", not out of date.
   - A yearly event (an event series) is one page that never goes stale. Each
     year is an edition (an events row with series_id). Between editions the
     page says when it usually happens and that the next dates aren't out yet. */

export const SEASONS = ["spring", "summer", "fall", "winter"];
const SEASON_NAME = { spring: "Spring", summer: "Summer", fall: "Fall", winter: "Winter" };
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** ["winter"] -> "Winter"; ["summer","fall"] -> "Summer and fall"; all four -> "Year-round"; [] -> "". */
export function seasonsText(list) {
  const set = new Set((Array.isArray(list) ? list : []).map((s) => String(s).toLowerCase()));
  if (set.has("year-round") || SEASONS.every((s) => set.has(s))) return "Year-round";
  const names = SEASONS.filter((s) => set.has(s)).map((s, i) => i ? s : SEASON_NAME[s]);
  if (names.length <= 1) return names[0] || "";
  return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
}

/** Only known season words, in calendar order, no repeats; "year-round" becomes all four. */
export function cleanSeasons(list) {
  const set = new Set((Array.isArray(list) ? list : []).map((s) => String(s).trim().toLowerCase()));
  if (set.has("year-round")) return SEASONS.slice();
  return SEASONS.filter((s) => set.has(s));
}

/** The organization's own sports and seasons.
    Stored as organizations.sport_seasons_json: {"skiing":["winter"],"sailing":["summer"]}.
    validKey(key) says whether a sport key is known. Returns [{ key, seasons }] in the stored order,
    or null when the organization hasn't told us (the column is empty or unreadable). */
export function parseSportSeasons(raw, validKey = () => true) {
  if (!raw) return null;
  let value = raw;
  if (typeof raw === "string") { try { value = JSON.parse(raw); } catch { return null; } }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const out = [];
  for (const [key, seasons] of Object.entries(value)) {
    const k = String(key).trim().toLowerCase();
    if (!k || k === "multi" || !validKey(k) || out.some((x) => x.key === k)) continue;
    out.push({ key: k, seasons: cleanSeasons(seasons) });
    if (out.length >= 40) break;
  }
  return out.length ? out : null;
}

/** [{ key, seasons }] -> the JSON string we store (null when empty). */
export function sportSeasonsJson(list) {
  const obj = {};
  for (const { key, seasons } of list || []) if (key && key !== "multi") obj[key] = cleanSeasons(seasons);
  return Object.keys(obj).length ? JSON.stringify(obj) : null;
}

/** 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 11 -> "11th", 22 -> "22nd". */
export function ordinal(n) {
  const v = Math.trunc(Number(n));
  if (!Number.isFinite(v) || v < 1) return "";
  const t = v % 100;
  if (t >= 11 && t <= 13) return v + "th";
  return v + ({ 1: "st", 2: "nd", 3: "rd" }[v % 10] || "th");
}

/** The calendar day an event starts on, as {y, m (0-11), d}.
    A date written "2026-10-23" is that day everywhere, never shifted by time zone. An instant
    with a time ("2026-11-01T00:30:00Z", how a 7:30 pm start is stored) is read in US Central
    time, the site's home zone, so an evening event keeps its own day on the server and in
    every browser. */
const CENTRAL = typeof Intl !== "undefined" ? new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", year: "numeric", month: "numeric", day: "numeric" }) : null;
export function dayParts(iso) {
  const text = String(iso || "");
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (!m) return null;
  if (CENTRAL && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}.*(?:Z|[+-]\d{2}:?\d{2})$/i.test(text)) {
    const d = new Date(text);
    if (!Number.isNaN(d.getTime())) {
      const p = Object.fromEntries(CENTRAL.formatToParts(d).map((x) => [x.type, x.value]));
      return { y: +p.year, m: +p.month - 1, d: +p.day };
    }
  }
  return { y: +m[1], m: +m[2] - 1, d: +m[3] };
}

/** "late October" from a start date: days 1 to 10 early, 11 to 20 mid, 21 on late. */
export function partOfMonth(iso) {
  const p = dayParts(iso);
  if (!p) return "";
  return `${p.d <= 10 ? "early" : p.d <= 20 ? "mid" : "late"} ${MONTHS[p.m]}`;
}

/** "Oct 23 to 25, 2026", "Oct 30 to Nov 1, 2026", "Dec 30, 2026 to Jan 2, 2027", "Oct 23, 2026". */
export function dateRange(startIso, endIso) {
  const a = dayParts(startIso);
  if (!a) return "";
  const b = dayParts(endIso);
  if (!b || (b.y === a.y && b.m === a.m && b.d === a.d) || (b.y * 400 + b.m * 32 + b.d) < (a.y * 400 + a.m * 32 + a.d)) {
    return `${MON[a.m]} ${a.d}, ${a.y}`;
  }
  if (a.y !== b.y) return `${MON[a.m]} ${a.d}, ${a.y} to ${MON[b.m]} ${b.d}, ${b.y}`;
  if (a.m !== b.m) return `${MON[a.m]} ${a.d} to ${MON[b.m]} ${b.d}, ${a.y}`;
  return `${MON[a.m]} ${a.d} to ${b.d}, ${a.y}`;
}

/** A readable web address for a yearly event: "3rd Annual Monster Smash 2026" -> "monster-smash". */
export function seriesSlug(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/\b(19|20)\d{2}\b/g, " ")
    .replace(/\b\d+(st|nd|rd|th)\b/g, " ")
    .replace(/\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\b/g, " ")
    .replace(/\bannual\b/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** Where a yearly event stands today.
    series:   { first_year, usual_month (1-12 or null), url }
    editions: events rows of this series ({ starts_at, ends_at, url, recap_url, status, ... }), any order
    now:      Date (defaults to today)
    Returns {
      next      the soonest edition that hasn't ended (null when the next dates aren't out),
      past      editions that have ended, newest first,
      usual     "late October" (from the newest edition, else the series' usual month),
      usualMonth 1-12 or null,
      since     the first year (series.first_year, else the oldest edition's year),
      nth       the next edition's number ("4th annual") when we can count it, else null,
      lastNth   the newest past edition's number, else null,
      nextYear  the year the next edition should fall in (for "The 2027 dates aren't out yet"),
    } */
export function seriesState(series, editions, now = new Date()) {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const live = (editions || []).filter((e) => e && dayParts(e.starts_at) && e.status !== "cancelled");
  const key = (iso) => { const p = dayParts(iso); return p ? `${p.y}-${String(p.m + 1).padStart(2, "0")}-${String(p.d).padStart(2, "0")}` : ""; };
  const endDay = (e) => key(e.ends_at) || key(e.starts_at);
  const startDay = (e) => key(e.starts_at);
  const upcoming = live.filter((e) => endDay(e) >= today).sort((a, b) => startDay(a).localeCompare(startDay(b)));
  const past = live.filter((e) => endDay(e) < today).sort((a, b) => startDay(b).localeCompare(startDay(a)));
  const next = upcoming[0] || null;
  const newest = next || past[0] || null;
  const firstYear = Number(series && series.first_year) || null;
  const oldest = [...live].sort((a, b) => startDay(a).localeCompare(startDay(b)))[0];
  const since = firstYear || (oldest ? dayParts(oldest.starts_at).y : null);
  const storedMonth = Number(series && series.usual_month);
  const usualMonth = newest ? dayParts(newest.starts_at).m + 1 : (storedMonth >= 1 && storedMonth <= 12 ? storedMonth : null);
  const usual = newest ? partOfMonth(newest.starts_at) : usualMonth ? MONTHS[usualMonth - 1] : "";
  // Count by year only when we know the first year; "4th annual" is a promise about every year since.
  const nthOf = (e) => (firstYear && e ? dayParts(e.starts_at).y - firstYear + 1 : null);
  const nth = next ? nthOf(next) : null;
  const lastNth = past[0] ? nthOf(past[0]) : null;
  let nextYear = null;
  if (!next) {
    const thisYear = now.getFullYear();
    if (past[0] && dayParts(past[0].starts_at).y >= thisYear) nextYear = thisYear + 1;
    else if (usualMonth) nextYear = usualMonth - 1 >= now.getMonth() ? thisYear : thisYear + 1;
    else nextYear = thisYear + (past[0] ? 1 : 0);
  }
  return { next, past, usual, usualMonth, since, nth: nth && nth > 0 ? nth : null, lastNth: lastNth && lastNth > 0 ? lastNth : null, nextYear };
}
