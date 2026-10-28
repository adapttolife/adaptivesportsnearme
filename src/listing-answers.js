// What an organization tells us when it confirms its listing (docs/specs/programs-that-come-back.md):
// the sports it runs with their seasons, and the events it holds every year.
// The browser sends both as JSON text; nothing here trusts it. Unknown sports,
// unknown seasons, odd months and non-web links are dropped, and the lists are capped.

import "../public/listing-art.js";
import { parseSportSeasons, seriesSlug } from "../public/app/yearly.js";
import { WHO_ORDER } from "../public/app/who.js";

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

// ---- The one-minute check-up (docs/specs/community-kept-directory.md) -------------------
const STATE_CODES = new Set("AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(" "));
const STATUS = new Set(["right", "change"]);
export const STOP_REASONS = ["closed_for_now", "closed_for_good", "merged", "moved"];
export const FIX_REASONS = ["website", "closed_for_now", "closed_for_good", "place", "sport", "duplicate", "other"];

/** JSON text from the check-up -> { verdict, facts, stopped } with only known, cleaned answers; null when unreadable. */
export function parseCheckup(raw) {
  if (!raw || String(raw).length > 4000) return null;
  let v;
  try { v = JSON.parse(String(raw)); } catch { return null; }
  if (!v || typeof v !== "object" || !["all_right", "changed", "stopped"].includes(v.verdict)) return null;
  const out = { verdict: v.verdict, facts: {} };
  const f = v.facts && typeof v.facts === "object" ? v.facts : {};
  const st = (x) => (x && STATUS.has(x.status) ? x.status : null);
  if (st(f.website)) {
    const value = f.website.status === "change" ? webUrl(f.website.value) : "";
    if (f.website.status === "right" || value) out.facts.website = f.website.status === "right" ? { status: "right" } : { status: "change", value };
  }
  if (st(f.place)) {
    const city = oneLine(f.place.city, 120), state = String(f.place.state || "").toUpperCase();
    if (f.place.status === "right") out.facts.place = { status: "right" };
    else if (STATE_CODES.has(state)) out.facts.place = { status: "change", city, state };
  }
  for (const k of ["sports", "yearly"]) if (st(f[k])) out.facts[k] = { status: f[k].status };
  if (st(f.who)) {
    const value = Array.isArray(f.who.value) ? WHO_ORDER.filter((c) => f.who.value.includes(c)) : [];
    out.facts.who = f.who.status === "right" ? { status: "right" } : { status: "change", value };
  }
  if (st(f.cost)) {
    const value = ["free", "fee", "varies"].includes(f.cost.value) ? f.cost.value : null;
    if (f.cost.status === "right") out.facts.cost = { status: "right" };
    else if (value) out.facts.cost = { status: "change", value, note: oneLine(f.cost.note, 200) };
  }
  if (out.verdict === "stopped") {
    const reason = v.stopped && STOP_REASONS.includes(v.stopped.reason) ? v.stopped.reason : null;
    if (!reason) return null;
    out.stopped = { reason };
  }
  return out;
}

/** A "Something's wrong?" reason code, or "". */
export function parseFixReason(raw) {
  const r = String(raw || "").trim();
  return FIX_REASONS.includes(r) ? r : "";
}
