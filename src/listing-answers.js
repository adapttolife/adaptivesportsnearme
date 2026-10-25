// What an organization tells us when it confirms its listing (docs/specs/programs-that-come-back.md):
// the sports it runs with their seasons, and the events it holds every year.
// The browser sends both as JSON text; nothing here trusts it. Unknown sports,
// unknown seasons, odd months and non-web links are dropped, and the lists are capped.

import "../public/listing-art.js";
import { parseSportSeasons, seriesSlug } from "../public/app/yearly.js";

const ListingArt = globalThis.ListingArt;
const NOT_SPORTS = new Set(["multi", "grant", "event"]);
export const isSportKey = (k) => ListingArt.SPORTS.includes(k) && !NOT_SPORTS.has(k);

const oneLine = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

/** JSON text {"skiing":["winter"]} -> [{ key, seasons }] of known sports, or [] */
export function parseSportsAnswer(raw) {
  if (!raw || String(raw).length > 4000) return [];
  return parseSportSeasons(String(raw), isSportKey) || [];
}

/** A web address we'd link to, or "" */
export function webUrl(v) {
  const s = oneLine(v, 500);
  if (!s) return "";
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".")) return "";
    return u.toString();
  } catch { return ""; }
}

/** JSON text [{ name, month, url }] -> up to 3 cleaned yearly events (each needs a name). */
export function parseYearlyAnswer(raw) {
  if (!raw || String(raw).length > 4000) return [];
  let list;
  try { list = JSON.parse(String(raw)); } catch { return []; }
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const name = oneLine(item.name, 120);
    if (!name || !seriesSlug(name)) continue;
    const m = Number(item.month);
    out.push({ name, month: Number.isInteger(m) && m >= 1 && m <= 12 ? m : null, url: webUrl(item.url) });
    if (out.length >= 3) break;
  }
  return out;
}
