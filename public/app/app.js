/* Adaptive Sports Near Me, the site: router, data, place logic, shared components,
   overlays and forms. Views import only this module: `import * as A from "../app.js"`.
   Honesty rules kept here, because every view goes through these functions:
   - Places are city and state only. relation() is the only source of distance
     text, and only when both the visitor's place and the program's city are
     known. Programs with no city are never pinned and never get a distance.
   - Trust is never a score. Verified (a check) means the program itself confirmed
     its listing with us; lists show the check only then and never say
     "unverified". The listing page says when we last checked it.
   - Forms validate in place, then post to the site's API with a Turnstile token. */

import { parseDesc as parseDescText } from "./listing-sport.js";
import { ICONS } from "./icons.js";

const L = window.ListingArt, P = window.Proto;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ======================================================================
   Basics
   ====================================================================== */

export function esc(s) {
  return s == null ? "" : String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const STATE_NAMES = P.STATE_NAMES;
/** Two-letter codes, A to Z by full name. */
export const STATE_CODES = Object.keys(STATE_NAMES).sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b]));
/** "FL" -> "Florida". */
export const stateName = (st) => STATE_NAMES[st] || st || "";

/** Lucide icon as an inline SVG string (decorative). Icons come from ./icons.js, the
    few the site uses (scripts/build-app-icons.mjs), not the whole library. */
const ICON_CACHE = {}, ICON_MISSING = new Set();
export function icon(name, size = 20) {
  const k = name + "@" + size;
  if (ICON_CACHE[k]) return ICON_CACHE[k];
  const pas = String(name).split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
  const node = ICONS[pas];
  if (!node) {
    if (!ICON_MISSING.has(name)) { ICON_MISSING.add(name); console.error("ASNM: icon not in public/app/icons.js (run scripts/build-app-icons.mjs):", name); }
    return "";
  }
  const kids = node.map(([tag, attrs]) => "<" + tag + Object.entries(attrs).map(([a, v]) => ` ${a}="${esc(v)}"`).join("") + "/>").join("");
  return (ICON_CACHE[k] = `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${kids}</svg>`);
}

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} },
};
/** remember("place", "Tampa, FL") / remember("recent", "tennis") */
export function remember(kind, value) {
  if (kind === "place") { if (value) store.set("asnm.place", String(value)); }
  else if (kind === "recent") {
    if (!value || !NAMES[value]) return;
    const r = (store.get("asnm.recent", []) || []).filter((k) => k !== value);
    r.unshift(value); store.set("asnm.recent", r.slice(0, 3));
  }
}
/** recall("place") -> label or null; recall("recent") -> up to 3 sport keys. */
export function recall(kind) {
  if (kind === "place") { const v = store.get("asnm.place", null); return typeof v === "string" && v ? v : null; }
  if (kind === "recent") { const v = store.get("asnm.recent", []); return Array.isArray(v) ? v.filter((k) => NAMES[k]).slice(0, 3) : []; }
  return null;
}

/* ---------- dates ---------- */
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const NOW = new Date();
function parseDay(iso) {
  const t = Date.parse(iso || "");
  return Number.isFinite(t) ? new Date(t) : null;
}
/** "Oct 8" this year, "Oct 8, 2025" otherwise (UTC, like the server). */
export function shortDate(iso) {
  const d = parseDay(iso); if (!d) return null;
  const y = d.getUTCFullYear();
  // No-break spaces keep "Oct 8" (and "Oct 8, 2025") together on one line.
  return MON[d.getUTCMonth()] + "\u00a0" + d.getUTCDate() + (y === NOW.getFullYear() ? "" : ",\u00a0" + y);
}
/** "October 8, 2026" */
export function longDate(iso) {
  const d = parseDay(iso); if (!d) return null;
  return MONTH[d.getUTCMonth()] + " " + d.getUTCDate() + ", " + d.getUTCFullYear();
}

/** One rule for programs and grants: a spaced en or em dash becomes ": ". */
export function displayName(s) {
  // An unspaced dash inside a name ("Team Boca\u2013SABR") reads as a hyphen.
  return String(s || "").replace(/\s[\u2013\u2014]\s/g, ": ").replace(/(\S)[\u2013\u2014](\S)/g, "$1-$2").trim();
}

/* ======================================================================
   Sports: names, notes, families, tones, optical sizes (section 3)
   ====================================================================== */

// [bbox w, bbox h, sqrt(w*h), ink density, x offset] per file, measured (r3 image lab).
const OPTICAL = {"amputeesports":[0.881,0.844,0.862,0.241,0.02],"archery":[0.783,0.881,0.831,0.275,-0.06],"art-therapy":[0.88,0.805,0.841,0.344,-0.009],"baseball":[0.717,0.881,0.795,0.32,-0.036],"basketball":[0.785,0.881,0.832,0.34,-0.026],"beepbaseball":[0.775,0.881,0.826,0.246,-0.076],"blindsports":[0.88,0.334,0.542,0.306,0.033],"boccia":[0.881,0.677,0.772,0.317,-0.096],"climbing":[0.637,0.881,0.749,0.305,0.006],"curling":[0.881,0.594,0.723,0.304,-0.092],"cycling":[0.88,0.413,0.603,0.339,-0.018],"dance":[0.818,0.881,0.849,0.241,0.008],"equestrian":[0.88,0.719,0.795,0.347,-0.029],"equestrianvaulting":[0.88,0.719,0.795,0.347,-0.029],"equine-therapy":[0.88,0.719,0.795,0.347,-0.029],"event":[0.881,0.758,0.817,0.413,0.034],"fencing":[0.881,0.561,0.703,0.254,-0.153],"football":[0.869,0.879,0.874,0.432,0.012],"goalball":[0.88,0.334,0.542,0.306,0.033],"golf":[0.732,0.88,0.803,0.3,-0.063],"grant":[0.74,0.88,0.807,0.261,-0.062],"handball":[0.826,0.881,0.853,0.317,-0.075],"handcycling":[0.88,0.413,0.603,0.339,-0.018],"lacrosse":[0.822,0.88,0.851,0.318,0.097],"martialarts":[0.881,0.875,0.878,0.348,-0.079],"multi":[0.881,0.729,0.801,0.214,-0.0],"nordicskiing":[0.88,0.689,0.779,0.23,0.014],"pickleball":[0.881,0.77,0.823,0.322,-0.077],"powerlifting":[0.881,0.621,0.74,0.338,0.005],"rowing":[0.88,0.639,0.75,0.304,0.018],"rugby":[0.88,0.682,0.774,0.379,-0.043],"running":[0.843,0.88,0.861,0.258,0.039],"sailing":[0.875,0.88,0.877,0.287,0.06],"shooting":[0.88,0.744,0.809,0.3,-0.118],"skiing":[0.88,0.672,0.769,0.249,0.004],"sledhockey":[0.881,0.555,0.699,0.298,-0.009],"soccer":[0.879,0.672,0.768,0.324,-0.102],"softball":[0.88,0.768,0.822,0.28,0.004],"surfing":[0.881,0.729,0.801,0.214,-0.0],"swimming":[0.879,0.437,0.619,0.352,0.038],"tennis":[0.88,0.859,0.87,0.259,-0.096],"trackfield":[0.881,0.539,0.689,0.279,-0.088],"triathlon":[0.879,0.549,0.695,0.302,0.015],"veteran-meetup":[0.881,0.541,0.69,0.448,0.008],"volleyball":[0.881,0.708,0.79,0.299,0.058],"waterskiing":[0.88,0.561,0.702,0.253,-0.076],"wheelchairracing":[0.881,0.539,0.689,0.279,-0.088]};
const FLOOR_PROP = new Set(["soccer", "sledhockey", "golf", "boccia", "curling", "goalball", "blindsports"]);
const GROUP_SCENE = new Set(["event", "veteran-meetup", "art-therapy", "grant", "multi", "soccer", "football", "lacrosse", "handball", "softball", "volleyball", "triathlon", "nordicskiing"]);
// Laura Lian's Adapt To Life palette (brand identity, July 29, 2026): four colours,
// each paired with black. Alec's athletes are black on every colour, white on black.
const CORAL = "#FF5C39", ORANGE = "#F96C03", TEAL = "#00C7B1", YELLOW = "#F6B700", INK = "#1A1A1A";
const TONES = {
  court: [CORAL, INK], racquet: [YELLOW, INK], field: [ORANGE, INK],
  snow: [TEAL, INK], water: [TEAL, INK], trail: [YELLOW, INK],
  calm: [INK, "#FFFFFF"], house: [CORAL, INK], grant: [YELLOW, INK], event: [TEAL, INK],
};
// Look switch: sharp is the standard; ?look=today and ?look=hues stay for comparison.
export const LOOK = new URLSearchParams(location.search).get("look") || "sharp"; // Alec, 2026-10-14: "I love the sharper version the best... This is the way"
document.documentElement.dataset.look = LOOK;
document.documentElement.dataset.band = new URLSearchParams(location.search).get("band") || "right";   // Alec, 2026-10-14: right-aligned
if (LOOK === "hues") Object.assign(TONES, {
  field: ["#2DBE6C", INK], snow: ["#3D7BFF", INK], trail: [ORANGE, INK],
  calm: ["#8B5CF6", INK], house: ["#FF4FA0", INK], event: ["#3D7BFF", INK],
});
const INVERTS = new Set(); // colour plates never invert; black plates carry white athletes via TONES
// Every sport stands alone with its own image and tile (Alec, 2026-10-14: one dedicated file per sport).
const PIC = {};
// Grids of sports group siblings under one tile; surfing reads under sailing there (3.5).
const GRID_HEAD = {};

const EXTRA_SPORTS = {
  equestrianvaulting: ["Equestrian vaulting", "Gymnastics and dance on horseback."],
  "equine-therapy": ["Equine therapy", "Therapeutic riding and time with horses."],
  blindsports: ["Blind sports", "Sports for blind and low-vision athletes."],
  wheelchairracing: ["Wheelchair racing", "Track and road racing in racing chairs."],
  handcycling: ["Handcycling", "Hand-powered cycling, road and trail."],
  surfing: ["Surfing", "Adaptive surfing and surf days."],
};
// sports.json leaves some notes empty or internal; these fill the gaps (Clubhouse copy).
const NOTE_FILL = {
  multi: "Programs that offer several sports in one place.", sledhockey: "Ice hockey played on a sled.",
  golf: "Adaptive golf lessons and leagues.", archery: "Adaptive archery ranges and clubs.",
  sailing: "Adaptive sailing on lakes and coasts.", trackfield: "Racing, throwing and jumping.",
  climbing: "Adaptive climbing walls and crags.", martialarts: "Martial arts and self-defense.",
  running: "Running groups and road races.", pickleball: "Adaptive and wheelchair pickleball.",
  amputeesports: "Sports for amputee athletes.", boccia: "A precision ball sport.",
  "veteran-meetup": "Coffee calls, outdoor days, support groups and game nights for veterans.", "art-therapy": "Making art together.",
  softball: "Adaptive softball.", lacrosse: "Adaptive lacrosse.", handball: "Wheelchair handball.",
  powerlifting: "Para powerlifting.", dance: "Wheelchair dance.",
};
const NAMES = {}, NOTES = {};
let SPORT_ORDER = [];

export function sportName(key) { return NAMES[key] || "Multi-sport"; }
export function sportNote(key) { return NOTES[key] || ""; }
export function picGroup(key) { return PIC[key] || key || "multi"; }
export function familyOf(key) {
  if (key === "grant" || key === "event") return key;
  return (key && key !== "multi" && L.FAMILY[key]) || "house";
}
export function toneOf(key) { const [t, d] = TONES[familyOf(key)]; return { t, d }; }
const toneStyle = (key) => { const { t, d } = toneOf(key); return `--t:${t};--d:${d}`; };
const canInvert = (key) => INVERTS.has(familyOf(key));
const gridHead = (k) => GRID_HEAD[k] || k;

/* ======================================================================
   Data (5.1)
   ====================================================================== */

let D = null, DATA_P = null;

/** Normalized city key, matching places.json keys (keeps hyphens and apostrophes). */
function normCity(s) {
  return String(s || "").toLowerCase().replace(/\./g, "").replace(/\bsaint\b/g, "st").replace(/\bfort\b/g, "ft")
    .replace(/\s+and more$/, "").replace(/\s+/g, " ").trim();
}
const REGIONISH = /\b(county|parish|countywide|statewide|regional|region|area|valley|coast|triangle|lowcountry|central|western|eastern|northern|southern|upper|lower|west|east|north|south|middle|greater)\b|tennessee|kentucky|maryland/i;

/** A city a person would read: the first place in the raw text, no county notes, no ellipsis. */
export function cityShort(c) {
  if (c == null) return null;
  let s = String(c).trim();
  if (!s || /^statewide$/i.test(s)) return null;
  if (/\s[-\u2013\u2014]\s/.test(s)) s = s.split(/\s[-\u2013\u2014]\s/).pop().trim();   // "Group *^ - Fort Smith" reads Fort Smith
  s = s.replace(/[%^]+/g, " ").replace(/\s+/g, " ").trim();
  s = s.replace(/\s*\*.*$/, "").replace(/,?\s+[A-Z]{2}$/, "").trim();
  if (!s) return null;
  const slash = s.split(/\s*\/\s*/);
  const many = /[,;]/.test(s) || (slash.length > 1 && !REGIONISH.test(slash[1]));
  s = s.split(/\s*[\/;(,]\s*/)[0].replace(/[\u2013\u2014-]\s*$/, "").trim();
  if (!s) return null;
  return many ? s + " and more" : s;
}
const UNPLACED = /statewide|multiple|various|throughout|^.*\bcounty$|\bregion\b/i;
export function isPlaced(p) {
  const cf = p.cityFirst !== undefined ? p.cityFirst : cityShort(p.city);
  return !!(p.geo === "city" && p.lat != null && p.geoPrecision !== "state" && cf && !UNPLACED.test(cf.replace(/ and more$/, "")));
}
/** "Tampa, FL" · "Escambia County, FL" · "Florida, no single city listed" · "Place not listed yet" */
export function placeText(p) {
  if (!p) return "Place not listed yet";
  const cf = p.cityFirst !== undefined ? p.cityFirst : cityShort(p.city);
  const placed = p.placed !== undefined ? p.placed : isPlaced(p);
  if (p.state && placed) return `${cf}, ${p.state}`;
  if (p.state && cf && !/statewide|multiple|various|throughout|see website/i.test(cf)) return `${cf}, ${p.state}`;
  if (p.state) return `${stateName(p.state)}, no single city listed`;
  return "Place not listed yet";
}

/** { sports, served } from "Sports and activities: ...; Athletes served: ..." (a listing's own page). */
export function parseDesc(p) { return parseDescText(p && p.desc); }

const goodUrl = (u) => /^https?:\/\/\S+$/i.test(String(u || "").trim()) ? String(u).trim() : null;

function normalize(raw) {
  const p = { ...raw };
  p.rawName = raw.name;
  p.name = displayName(raw.name);
  // The sport (and the trio for a multi-sport listing) comes worked out from the
  // server (public/app/listing-sport.js), so the lists need no descriptions.
  p.key = raw.key && NAMES[raw.key] && raw.key !== "grant" && raw.key !== "event" ? raw.key : "multi";
  if (Array.isArray(raw.trio) && raw.trio.length >= 2) p.trio = raw.trio;
  p.family = familyOf(p.key);
  p.tone = toneOf(p.key);
  // Verified (the check) means the program itself confirmed its listing with us
  // (publicity_consent). A person on our team checking it (teamChecked, with the
  // month) is said on the listing page, never as a badge (Alec, 2026-10-14).
  p.verified = !!p.confirmed;
  p.teamChecked = !!p.teamChecked;
  p.website = goodUrl(raw.website);
  p.cityFirst = cityShort(p.city);
  p.placed = isPlaced(p);
  p.cityKey = p.cityFirst ? normCity(p.cityFirst) : null;
  return p;
}

/* The live API rows, in the shape the views read. */
// /api/listings is the slim directory: enough for cards, rows, maps and sport pages.
// A listing's own lat/lng stay private until the program says yes (publicity_consent),
// so maps and distances use the center of its listed city (center, from the server).
function fromApi(r) {
  const c = Array.isArray(r.center) ? r.center : null;
  return {
    id: r.id, name: r.name, key: r.key, trio: r.trio || null, city: r.city || null, state: r.state || null,
    lastChecked: r.checked || null, listedAt: r.listed || null, confirmed: !!r.verified, teamChecked: !!r.team,
    lat: c ? c[0] : null, lng: c ? c[1] : null, geo: c ? "city" : (r.state ? "state" : null),
  };
}
/* A listing's own page adds what the lists leave out: website, description, cost, ages,
   equipment, the month our team checked it. Loaded once per listing. */
const DETAIL = new Map();
export function loadDetail(id) {
  if (!DETAIL.has(id)) {
    const p = fetch("/api/orgs/" + encodeURIComponent(id)).then(async (r) => {
      if (r.status === 404) return null;
      if (!r.ok) throw new Error("/api/orgs " + r.status);
      return (await r.json()).org || null;
    });
    DETAIL.set(id, p);
    p.catch(() => DETAIL.delete(id));   // a failed load is asked again next time
  }
  return DETAIL.get(id).then((o) => {
    const item = D && D.byId.get(id);
    if (o && item && !item.detail) {
      Object.assign(item, {
        website: goodUrl(o.website), desc: o.desc || null, cost: o.cost || null, ages: o.ages || null, equipment: o.equipment || null,
        checkedMonth: o.checkedMonth || null, type: o.type || null, detail: true,
      });
    }
    return item || null;
  }, (e) => { const err = new Error(String(e && e.message || e)); err.loadFailed = true; throw err; });
}
function grantFromApi(g) {
  return { ...g, amount: g.amountDisplay || null, deadline: g.deadlineDisplay || null, url: g.applicationUrl || g.sourceUrl || null, open: g.isOpen ? 1 : 0 };
}
function eventFromApi(e) {
  return { id: e.id, title: e.title, desc: e.description, sportKey: e.sport_key || null, venue: e.venue, city: e.city, state: e.state, url: e.url, start: e.starts_at, end: e.ends_at, allDay: e.all_day === 1 };
}

/** Loads programs, grants, events, state shapes and sports once. */
export function loadData() {
  if (DATA_P) return DATA_P;
  DATA_P = (async () => {
    const get = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error(u + " " + r.status); return r.json(); });
    // Grants and events are extra: if either is down, the directory still works.
    const soft = (u) => get(u).catch((e) => { console.error(e); return { items: [] }; });
    const [prog, gr, ev, st, sp] = await Promise.all([get("/api/listings"), soft("/api/grants"), soft("/api/events"), get("/data/states.json"), get("/data/sports.json")]);
    prog.items = (prog.items || []).map(fromApi);
    const live = {};
    for (const s of sp.sports) {
      NAMES[s.key] = s.name;
      NOTES[s.key] = String(s.note || "").replace(/\s*The biggest group on the site\.?/i, "").replace(/\s*Could share the [a-z]+ image\.?/i, "").trim();
      live[s.key] = s.live || 0;
    }
    for (const [k, [n, note]] of Object.entries(EXTRA_SPORTS)) { NAMES[k] = n; NOTES[k] = note; }
    for (const k of L.SPORTS) if (!NAMES[k]) NAMES[k] = k;
    NAMES.multi = "Multi-sport"; NAMES.equestrian = "Horseback riding";
    for (const [k, note] of Object.entries(NOTE_FILL)) if (!NOTES[k]) NOTES[k] = note;
    NAMES.grant = "Grants"; NAMES.event = "Events";

    // Rows that are not programs (a scraped site menu, donation pages) never reach
    // the browser: /api/listings leaves them out (public/app/listable.js).
    const items = prog.items.map(normalize);
    const count = {};
    for (const p of items) count[p.key] = (count[p.key] || 0) + 1;
    // Global popularity: sports.json order (its live counts), the six extras slotted in by their own counts.
    const jsonOrder = sp.sports.map((s) => s.key);
    for (const k of L.SPORTS) live[k] = count[k] || 0;   // order every sport by what is listed now (Karen's veteran data included)
    SPORT_ORDER = L.SPORTS.slice().sort((a, b) => (live[b] || 0) - (live[a] || 0) ||
      ((jsonOrder.indexOf(a) + 1 || 99) - (jsonOrder.indexOf(b) + 1 || 99)) || a.localeCompare(b));
    const sports = SPORT_ORDER.map((k) => ({ key: k, name: NAMES[k], note: NOTES[k], count: count[k] || 0, family: familyOf(k), pic: picGroup(k) }));
    const byId = new Map(items.map((p) => [p.id, p]));
    const byState = {};
    for (const p of items) if (p.state) (byState[p.state] = byState[p.state] || []).push(p);
    const grants = (gr.items || []).map(grantFromApi).map((g) => ({ ...g, rawName: g.name, name: displayName(g.name) }));
    D = {
      items, byId, grants, grantById: new Map(grants.map((g) => [g.id, g])), byState,
      sports, sportByKey: Object.fromEntries(sports.map((s) => [s.key, s])),
      shapes: st.shapes, centers: st.centers, fits: st.fits || {}, events: (ev.items || []).map(eventFromApi), countByKey: count,
    };
    return D;
  })();
  // A failed load is not kept: the next page (or "Try again") asks again.
  DATA_P.catch(() => { DATA_P = null; });
  return DATA_P;
}

/** Picture groups in popularity order: [{ key, also: [sibling keys] }]. Limit to `keys` when given. */
export function pictureGroups(keys) {
  const have = keys ? new Set(keys) : null;
  const out = [], byHead = new Map();
  for (const k of SPORT_ORDER) {
    if (have && !have.has(k)) continue;
    const h = gridHead(k);
    if (!byHead.has(h)) { const g = { key: null, also: [], head: h }; byHead.set(h, g); out.push(g); }
    const g = byHead.get(h);
    if (k === h) g.key = k; else g.also.push(k);
  }
  for (const g of out) { if (!g.key) g.key = g.also.shift(); delete g.head; }
  // Multi-sport is the catch-all, not a sport: it goes last in every grid of sports.
  const mi = out.findIndex((g) => g.key === "multi");
  if (mi >= 0 && mi < out.length - 1) out.push(out.splice(mi, 1)[0]);
  return out;
}
function topGroups(n) {
  const gc = {};
  for (const k of SPORT_ORDER) { const h = gridHead(k); gc[h] = (gc[h] || 0) + (D.countByKey[k] || 0); }
  const top = pictureGroups().filter((g) => gc[gridHead(g.key)] > 0).sort((a, b) => gc[gridHead(b.key)] - gc[gridHead(a.key)]).slice(0, n);
  const mi = top.findIndex((g) => g.key === "multi");
  if (mi >= 0) top.push(top.splice(mi, 1)[0]);
  return top;
}

/* ======================================================================
   Geography (5.2, 5.3)
   ====================================================================== */

let GEO_P = null, G = null;
/** Lazy: the city gazetteer and ZIP centers. */
export function loadGeo() {
  if (GEO_P) return GEO_P;
  GEO_P = (async () => {
    const [places, zcta] = await Promise.all([fetch("/data/places.json").then((r) => r.json()), fetch("/assets/data/zcta.json").then((r) => r.json())]);
    const list = Object.entries(places).map(([k, c]) => { const i = k.indexOf("|"); return { st: k.slice(0, i), city: k.slice(i + 1), c }; });
    G = { places, zcta, list };
    return { places, zcta };
  })();
  return GEO_P;
}

const R = 3958.8, rad = (d) => d * Math.PI / 180;
function haversine(a, b) {
  const dLat = rad(b[0] - a[0]), dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const ALIAS = { "st pete": "st petersburg", philly: "philadelphia", nyc: "new york" };
const NAME_TO_ST = Object.fromEntries(Object.entries(STATE_NAMES).map(([k, v]) => [v.toLowerCase(), k]));
function stateFrom(s) {
  const t = String(s || "").trim().replace(/\s+/g, " ");
  if (/^[A-Za-z]{2}$/.test(t) && STATE_NAMES[t.toUpperCase()]) return t.toUpperCase();
  return NAME_TO_ST[t.toLowerCase()] || null;
}
const STATE_ALT = Object.values(STATE_NAMES).sort((a, b) => b.length - a.length).map((n) => n.replace(/ /g, "\\s+")).join("|");
const TRAIL_RE = new RegExp("^(.+?)[,\\s]+([A-Za-z]{2}|" + STATE_ALT + ")$", "i");
const titleCase = (s) => String(s).toLowerCase().replace(/(^|[\s\-'])([a-z])/g, (m, a, b) => a + b.toUpperCase());
/** Display a places.json key: "st petersburg" -> "St. Petersburg". */
function displayCity(key) {
  return titleCase(key).replace(/\bSt\b(?!\.)/g, "St.").replace(/\bFt\b(?!\.)/g, "Ft.");
}
function zipState(zip) { const w = P.parsePlace(zip, []); return w ? w.state : null; }
function lookupCity(st, key) {
  if (G.places[st + "|" + key]) return { key, c: G.places[st + "|" + key] };
  const alt = key.replace(/-/g, " ");
  if (alt !== key && G.places[st + "|" + alt]) return { key: alt, c: G.places[st + "|" + alt] };
  return null;
}
const NONE = (s) => ({ kind: "none", label: s, short: s, city: null, state: null, coords: null, zip: null });

/** "Tampa FL" / "tampa, florida" / "33602" / "Illinois" -> Where. Never guesses a location. */
export async function resolvePlace(q) {
  let s = String(q == null ? "" : q).trim().replace(/\s+/g, " ").replace(/,?\s*USA$/i, "").trim();
  if (!s) return NONE("");
  await loadData();
  const zm = /^(\d{5})(-\d{4})?$/.exec(s);
  if (zm) {
    await loadGeo();
    const zip = zm[1], c = G.zcta[zip], st = zipState(zip);
    if (!c || !st) return NONE(s);
    let best = null, bd = Infinity;
    for (const e of G.list) if (e.st === st) { const d = haversine(c, e.c); if (d < bd) { bd = d; best = e; } }
    if (!best) return NONE(s);
    const city = displayCity(best.city);
    return { kind: "zip", label: `${zip}, ${city}, ${st}`, short: city, city, state: st, coords: c, zip };
  }
  const whole = stateFrom(s);
  if (whole) return { kind: "state", label: stateName(whole), short: stateName(whole), city: null, state: whole, coords: null, zip: null };
  let cityRaw = s, st = null;
  const m = TRAIL_RE.exec(s);
  if (m && stateFrom(m[2])) { cityRaw = m[1].replace(/,\s*$/, "").trim(); st = stateFrom(m[2]); }
  await loadGeo();
  let key = normCity(cityRaw), aliased = false;
  if (ALIAS[key]) { key = ALIAS[key]; aliased = true; }
  let hit = null;
  if (st) hit = lookupCity(st, key);
  else {
    const big = P.parsePlace(aliased ? key : cityRaw, []);
    if (big && big.state) { hit = lookupCity(big.state, key); if (hit) st = big.state; }
    if (!hit) {
      // No state typed and not a big city: only a city that has a listing counts,
      // so "Atlantis" alone is not quietly read as Atlantis, FL. Never guess.
      placedCities();
      const cands = Object.keys(STATE_NAMES).map((code) => [code, lookupCity(code, key)])
        .filter(([code, h]) => h && PLACED_SET.has(code + "|" + h.key));
      cands.sort((a, b) => ((D.byState[b[0]] || []).length - (D.byState[a[0]] || []).length));
      if (cands.length) { st = cands[0][0]; hit = cands[0][1]; }
    }
  }
  if (!hit) return NONE(s);
  const city = aliased ? displayCity(hit.key) : titleCase(cityRaw.replace(/,\s*$/, ""));
  return { kind: "city", label: `${city}, ${st}`, short: city, city, state: st, coords: hit.c, zip: null };
}

/** Real gazetteer cities with exactly this name, for a place typed without a state.
    Never picked silently: shown as "Did you mean" links. [{ label, href }] */
export async function didYouMean(q, sport = "") {
  const s = String(q || "").trim().replace(/\s+/g, " ").replace(/,?\s*USA$/i, "").trim();
  if (!s || /^\d/.test(s)) return [];
  await loadData(); await loadGeo();
  let cityRaw = s;
  const m = TRAIL_RE.exec(s);
  if (m && stateFrom(m[2])) cityRaw = m[1].replace(/,\s*$/, "").trim();
  let key = normCity(cityRaw);
  if (ALIAS[key]) key = ALIAS[key];
  const hits = Object.keys(STATE_NAMES).map((code) => [code, lookupCity(code, key)]).filter(([, h]) => h);
  hits.sort((a, b) => ((D.byState[b[0]] || []).length - (D.byState[a[0]] || []).length) || a[0].localeCompare(b[0]));
  return hits.slice(0, 6).map(([code, h]) => {
    const label = `${displayCity(h.key)}, ${code}`;
    return { label, href: "/near/" + encodeURIComponent(label) + (sport ? "?s=" + encodeURIComponent(sport) : "") };
  });
}
export function didYouMeanHtml(opts) {
  return `<p class="dym-h">Did you mean one of these?</p><ul class="dym-list">${opts.map((o) => `<li><a class="dym-item" href="${esc(o.href)}" data-close-after>${icon("map-pin", 18)}<span>${esc(o.label)}</span></a></li>`).join("")}</ul>`;
}

let PLACED_SET = null, PLACED_CITIES = null;
function placedCities() {
  if (PLACED_CITIES && PLACED_SET) return PLACED_CITIES;
  const by = new Map();
  for (const p of D.items) if (p.placed && p.state && p.cityKey) {
    const k = p.state + "|" + p.cityKey;
    if (!by.has(k)) by.set(k, { st: p.state, key: p.cityKey, name: p.cityFirst.replace(/ and more$/, ""), lat: 0, lng: 0, n: 0 });
    const g = by.get(k); g.lat += p.lat; g.lng += p.lng; g.n++;
  }
  PLACED_SET = new Set(by.keys());
  // Snap targets are real gazetteer cities only ("Tampa area" is not a city name).
  PLACED_CITIES = G ? [...by.values()].filter((g) => G.places[g.st + "|" + g.key]).map((g) => ({ ...g, name: displayCity(g.key), c: G.places[g.st + "|" + g.key] })) : null;
  return PLACED_CITIES;
}

/** Type-ahead: [{ label, href }] for cities (listed ones first) and states. */
export async function suggestPlaces(text, limit = 6) {
  const t = normCity(text);
  if (t.length < 2) return [];
  await loadData(); await loadGeo(); placedCities();
  const t2 = t.replace(/-/g, " ");
  const hits = G.list.filter((e) => e.city.startsWith(t) || (t2 !== t && e.city.startsWith(t2)));
  const listed = [], other = [];
  for (const e of hits) (PLACED_SET.has(e.st + "|" + e.city) ? listed : other).push(e);
  const byName = (a, b) => a.city.localeCompare(b.city) || a.st.localeCompare(b.st);
  listed.sort(byName); other.sort(byName);
  const lower = String(text).trim().toLowerCase();
  const states = Object.entries(STATE_NAMES).filter(([code, n]) => n.toLowerCase().startsWith(lower) || (lower.length === 2 && code.toLowerCase() === lower))
    .map(([code, n]) => ({ label: n, href: "/states/" + code }));
  const city = (e) => { const label = `${displayCity(e.city)}, ${e.st}`; return { label, href: "/near/" + encodeURIComponent(label) }; };
  return [...listed.map(city), ...states, ...other.map(city)].slice(0, limit);
}

/** Browser position snapped to a city (never raw GPS). */
export function locateMe() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error("no-geolocation")); return; }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await loadData(); await loadGeo();
        const me = [pos.coords.latitude, pos.coords.longitude];
        let best = null, bd = Infinity;
        for (const c of placedCities()) { const d = haversine(me, c.c); if (d < bd) { bd = d; best = c; } }
        let city, st, coords;
        if (best && bd <= 30) { city = best.name; st = best.st; coords = best.c; }
        else {
          let e0 = null, ed = Infinity;
          for (const e of G.list) { const d = haversine(me, e.c); if (d < ed) { ed = d; e0 = e; } }
          if (!e0) throw new Error("no-city");
          city = displayCity(e0.city); st = e0.st; coords = e0.c;
        }
        resolve({ kind: "city", label: `${city}, ${st}`, short: city, city, state: st, coords, zip: null });
      } catch (e) { reject(e); }
    }, (err) => reject(err), { timeout: 10000, maximumAge: 600000 });
  });
}

/** A Where centered on a listing's own city (for "more near this listing"). */
export function whereFromProgram(p) {
  const city = p.placed ? p.cityFirst.replace(/ and more$/, "") : null;
  return { kind: city ? "city" : "state", label: placeText(p), short: city || stateName(p.state), city, state: p.state || null, coords: p.placed ? [p.lat, p.lng] : null, zip: null };
}

/** The only source of distance. */
export function relation(p, where) {
  if (!p || !where) return { inCity: false, miles: null };
  const miles = where.coords && p.placed && p.lat != null ? haversine(where.coords, [p.lat, p.lng]) : null;
  const inCity = !!(where.city && p.state === where.state && p.placed && (p.cityKey === normCity(where.city) || (miles != null && miles < 1)));
  return { inCity, miles };
}
/** "about 12 mi" (cap: "About 12 mi"); null under 1 mile. */
export function aboutMi(miles, { cap = false } = {}) {
  if (miles == null || !Number.isFinite(miles) || miles < 1) return null;
  const n = miles < 10 ? Math.round(miles) : Math.round(miles / 5) * 5;
  return (cap ? "About " : "about ") + n + " mi";
}
const byTrust = (a, b) => (b.verified - a.verified) || a.name.localeCompare(b.name);

/** In your city, then within about 25 miles, then elsewhere in your state, then statewide. */
export function ladder(where, pool) {
  const out = { inCity: [], near: [], elsewhere: [], statewide: [], dist: new Map() };
  if (!where) return out;
  for (const p of pool) {
    if (!p.state) continue;
    const r = relation(p, where);
    if (r.miles != null) out.dist.set(p.id, r.miles);
    if (r.inCity) out.inCity.push(p);
    else if (r.miles != null && r.miles < 25.5) out.near.push(p);
    else if (p.state === where.state && p.placed) out.elsewhere.push(p);
    else if (p.state === where.state) out.statewide.push(p);
  }
  const byMi = (a, b) => (out.dist.get(a.id) ?? 1e9) - (out.dist.get(b.id) ?? 1e9) || byTrust(a, b);
  out.inCity.sort(byTrust); out.near.sort(byMi);
  out.elsewhere.sort(where.coords ? byMi : (a, b) => a.name.localeCompare(b.name));
  out.statewide.sort(byTrust);
  return out;
}

/** Listings from the pool in OTHER states, nearest states first: [{ state, items }].
    A placed listing ranks by the distance to its city. A listing that serves a whole
    state with no city ranks by the distance to that state's center and never shows
    miles. For a state search the origin is the middle of that state's own placed
    listings (where its programs are), falling back to the state's center.
    (Both rules widen 5.3, which used placed listings only; Alec to confirm.) */
export function nearestOutside(where, pool, limit = 6) {
  if (!where || !where.state) return [];
  let origin = where.coords || null;
  if (!origin) {
    const own = (D.byState[where.state] || []).filter((p) => p.placed && p.lat != null);
    origin = own.length ? [own.reduce((t, p) => t + p.lat, 0) / own.length, own.reduce((t, p) => t + p.lng, 0) / own.length] : (D.centers[where.state] || null);
  }
  if (!origin) return [];
  const cand = [];
  for (const p of pool) {
    if (!p.state || p.state === where.state) continue;
    if (p.placed && p.lat != null) cand.push([p, haversine(origin, [p.lat, p.lng])]);
    else if (D.centers[p.state]) cand.push([p, haversine(origin, D.centers[p.state]) + 0.001]);
  }
  cand.sort((a, b) => a[1] - b[1] || (b[0].placed - a[0].placed) || a[0].name.localeCompare(b[0].name));
  const states = [];
  for (const [p] of cand) { if (!states.includes(p.state)) states.push(p.state); if (states.length === 3) break; }
  const picked = cand.filter(([p]) => states.includes(p.state)).slice(0, limit);
  return states.map((st) => ({ state: st, items: picked.filter(([p]) => p.state === st).map(([p]) => p) })).filter((g) => g.items.length);
}

/* ---------- state outline projection: recover each state's fit from placed programs ---------- */
const FIT = {};
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2));
function fitFor(st) {
  if (st in FIT) return FIT[st];
  const pts = D.items.filter((p) => p.state === st && p.px != null && p.lat != null);
  const lngs = new Set(pts.map((p) => p.lng));
  if (pts.length < 2 || lngs.size < 2) return (FIT[st] = null);
  const n = pts.length, mx = pts.reduce((s, p) => s + rad(p.lng), 0) / n, my = pts.reduce((s, p) => s + p.px, 0) / n;
  let num = 0, den = 0;
  for (const p of pts) { num += (rad(p.lng) - mx) * (p.px - my); den += (rad(p.lng) - mx) ** 2; }
  const k = num / den, bx = my - k * mx;
  const mmy = pts.reduce((s, p) => s + mercY(p.lat), 0) / n, mpy = pts.reduce((s, p) => s + p.py, 0) / n;
  const dy = mpy + k * mmy;
  return (FIT[st] = (lat, lng) => [Math.round((k * rad(lng) + bx) * 10) / 10, Math.round((dy - k * mercY(lat)) * 10) / 10]);
}
function toBox(st, d) {
  if (!d) return null;
  if (!Array.isArray(d)) return d.px != null ? [d.px, d.py] : (d.lat != null && d.placed ? (fitFor(st) ? fitFor(st)(d.lat, d.lng) : null) : null);
  if (d[1] < 0) { const f = fitFor(st); return f ? f(d[0], d[1]) : null; }   // [lat, lng]
  return d;                                                                   // [x, y] in the 100 box
}

/* ======================================================================
   Grants (4.9)
   ====================================================================== */
const MON_IX = Object.fromEntries(MONTH.flatMap((m, i) => [[m.toLowerCase(), i], [m.slice(0, 3).toLowerCase(), i]]).concat([["sept", 8]]));
/** "Apr 1 / Sep 1", "Mar / Jul / Aug", "March 1": dates that repeat every year.
    Returns the next one from today as text, or null when the deadline is not that shape. */
function nextYearly(dl) {
  const parts = dl.split(/\s*\/\s*/);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const y = today.getFullYear();
  const dates = [];
  for (const part of parts) {
    const m = /^([A-Za-z]+)\.?(?:\s+(\d{1,2}))?$/.exec(part.trim());
    if (!m || MON_IX[m[1].toLowerCase()] == null) return null;
    const mo = MON_IX[m[1].toLowerCase()], day = m[2] ? Number(m[2]) : null;
    dates.push({ mo, day });
  }
  if (!dates.length) return null;
  // A month with no day counts as open until that month ends.
  const end = (d, yr) => d.day ? new Date(yr, d.mo, d.day) : new Date(yr, d.mo + 1, 0);
  const label = (d, yr) => MONTH[d.mo] + (d.day ? "\u00a0" + d.day : "") + (yr !== y ? (d.day ? ", " : " ") + yr : "");
  const ahead = dates.filter((d) => end(d, y) >= today).sort((a, b) => end(a, y) - end(b, y));
  if (ahead.length) return label(ahead[0], y);
  const first = dates.slice().sort((a, b) => end(a, y + 1) - end(b, y + 1))[0];
  return label(first, y + 1);
}
export function grantInfo(g) {
  const amount = g.amount && !/^varies$/i.test(String(g.amount).trim()) ? g.amount : null;
  const dl = g.deadline ? String(g.deadline).trim() : null;
  let past = false;
  if (dl && /^[A-Z][a-z]+ \d{1,2}, 20\d\d$/.test(dl)) {
    const t = Date.parse(dl); const today = new Date(); today.setHours(0, 0, 0, 0);
    past = Number.isFinite(t) && t < today.getTime();
  }
  let deadlineText;
  const yearly = dl && !past ? nextYearly(dl) : null;
  if (past) deadlineText = "Last deadline was " + dl;
  else if (!dl) deadlineText = "Deadline: see their site";
  else if (/^(rolling|year-round)$/i.test(dl)) deadlineText = "Apply any time";
  else if (/^as funding (is )?available$/i.test(dl)) deadlineText = "Apply while funding lasts";
  else if (yearly) deadlineText = "Next deadline: " + yearly;
  else deadlineText = "Deadline: " + dl.replace(/\s*[\u2013\u2014]\s*/g, " to ");
  const closed = Number(g.open) === 0;
  return { amount, deadlineText, past, closed, audienceLabel: g.audience === "program" ? "For programs" : "For athletes", open: Number(g.open) === 1 && !past };
}

/* ======================================================================
   Components (section 4). Every one returns an HTML string.
   ====================================================================== */

/** The sport figure: Alec's own drawing (Drive, ASNM Flat Vector Logo / SVGs, synced to
    /emblems/sports/<key>.svg by scripts/sport-icons-sync.py), used as a mask so it takes
    the plate's figure colour. Vectors, so one file serves every size. Every key has its
    own file. OPTICAL is measured from those files (each drawing's share of its square). */
export function fig(key, { color, cls = "", big = false } = {}) {
  const k = key && OPTICAL[key] ? key : "multi";
  const o = OPTICAL[k];
  const dk = Math.min(1.04, Math.max(0.90, Math.pow(0.31 / o[3], 0.3)));
  return `<i class="fig${cls ? " " + cls : ""}" aria-hidden="true" style="--src:url(/emblems/sports/${k}.svg);--w:${o[0]};--h:${o[1]};--g:${o[2]};--diag:${Math.hypot(o[0], o[1]).toFixed(3)};--dk:${dk.toFixed(3)};--cx:${o[4]}${color ? ";color:" + color : ""}"></i>`;
}

if (typeof window !== "undefined") { window.ASNM_FIG = fig; window.ASNM_ICON_KEYS = Object.keys(OPTICAL); window.ASNM_PLATE = (...a) => plate(...a); }

/* Trio sizes per use: [first, others] for A (optical size) and Hm (height cap). */
const TRIO_SIZE = { card: { A: [.46, .36], Hm: [.64, .52], room: "84cqw" }, hero: { A: [.58, .46], Hm: [.72, .60], room: "80cqw" }, poster: { A: [.74, .56], Hm: [.86, .66], room: "94cqw" } };
/** Up to three figures in a bottom-aligned row, each in its family's deep colour (3.4).
    Each figure is sized optically (A over the measured size), then the whole row
    scales down together when the three are wider than the room, so a wide key
    like cycling is never squeezed on its own. */
export function trioFigs(keys, kind = "card") {
  const z = TRIO_SIZE[kind] || TRIO_SIZE.card;
  let sum = 0;
  const figs = keys.slice(0, 3).map((k0, i) => {
    const k = OPTICAL[k0] ? k0 : "multi";
    const o = OPTICAL[k];
    const dk = Math.min(1.04, Math.max(0.90, Math.pow(0.31 / o[3], 0.3)));
    const j = i ? 1 : 0;
    const kk = Math.min(z.A[j] * dk / o[2], z.Hm[j] / o[1]);
    sum += kk * o[0];
    return { k: k0, kk };
  });
  const html = figs.map((f, i) => fig(f.k, { color: INK, big: kind !== "card", cls: i ? "" : "is-first" }).replace('style="', `style="--k:${f.kk.toFixed(3)};`)).join("");
  // --kh: the tallest drawing's height per unit of --u, so CSS can cap the row's height (--Hx).
  const kh = Math.max(...figs.map((f) => f.kk * (OPTICAL[f.k] || OPTICAL.multi)[1]));
  return `<span class="trio" style="--sum:${sum.toFixed(3)};--room:${z.room};--kh:${kh.toFixed(3)}">${html}</span>`;
}

/** A tinted plate. plate(key | program, { kind, trio, inv, inner, cls, wide }). */
export function plate(key, opts = {}) {
  let trio = opts.trio;
  if (key && typeof key === "object") { trio = trio || key.trio; key = key.key; }
  const kind = opts.kind || "card";
  const hasTrio = Array.isArray(trio) && trio.length >= 2;
  const big = kind === "hero" || kind === "poster";
  const inv = !hasTrio && (opts.inv != null ? (opts.inv && canInvert(key)) : (big && canInvert(key)));
  let body;
  if (hasTrio && kind !== "row" && kind !== "tile") {
    body = trioFigs(trio, kind === "hero" ? "hero" : kind === "poster" ? "poster" : "card");
  } else if (hasTrio) {
    body = fig(trio[0], { color: INK });                 // too small for three figures (3.2 floor)
  } else body = fig(key, { big });
  const tone = hasTrio ? toneStyle("multi") : toneStyle(key);
  const cls = ["plate", "plate--" + kind, inv ? "is-inv" : "", hasTrio ? "is-trio" : "", kind === "hero" && FLOOR_PROP.has(key) ? "is-floor" : "", opts.wide ? "is-wide" : "", opts.cls || ""].filter(Boolean).join(" ");
  return `<div class="${cls}" style="${tone}"${opts.keepText ? "" : ' aria-hidden="true"'}>${body}${opts.inner || ""}</div>`;
}

/** Round avatar. size: 40 | 56 | 64 | 72 | 88 | "bar" (56 phone, 64 at 768+). */
export function avatar(key, size = 56) {
  const s = size === "bar" ? "bar" : Number(size) || 56;
  const o = OPTICAL[key] || OPTICAL.multi;
  // A circle's chord at mid-height leaves room for wide figures (cycling, goalball, rowing).
  const wide = o[0] / o[1] > 1.6 ? ";--Wm:.88;--Hm:.88" : "";
  return `<span class="av av--${s}" style="${toneStyle(key)}${wide}" aria-hidden="true">${fig(key)}</span>`;
}

/** When the listing was last looked at: "Website checked Oct 8", else "Listed Oct 14", else "". */
export function freshText(p) {
  const checked = shortDate(p.lastChecked);
  if (checked) return "Website checked\u00a0" + checked;
  const listed = shortDate(p.listedAt);
  return listed ? "Listed\u00a0" + listed : "";
}
/** The Verified check beside a name. Only for programs that confirmed their listing; nothing otherwise. */
export function vcheck(p) {
  return p && p.verified ? `<span class="vcheck">${icon("badge-check", 18)}<span class="sr"> Verified</span></span>` : "";
}
/** The date line for cards, rows ("short") and the phone sticky bar ("sticky"). No "unverified" words, ever. */
export function trust(p, mode = "short") {
  const v = !!p.verified, rest = freshText(p);
  if (mode === "sticky") {
    const short = rest.replace(/^Website checked/, "Checked");
    return `<span class="trust trust--stk${v ? " is-v" : ""}">${v ? `<span class="ts-a">${icon("badge-check", 18)}<b>Verified</b></span>` : ""}${rest ? `<span class="ts-b num"><span class="ts-long">${esc(rest)}</span><span class="ts-short" aria-hidden="true">${esc(short)}</span></span>` : ""}</span>`;
  }
  return rest ? `<span class="trust num">${esc(rest)}</span>` : "";
}

function pstamp(p) {
  if (!p.state || !D.shapes[p.state]) return "";
  return `<span class="pstamp" aria-hidden="true">${stateOutline(p.state, { size: 32, dots: p.placed ? [p] : [], fill: !p.placed })}</span>`;
}
function distText(p, ctx) {
  if (!ctx || !ctx.where) return null;
  if (!p.placed) return null;                       // no city, no distance (never miles from a state's center)
  const r = relation(p, ctx.where);
  if (r.inCity) return ctx.sameCity ? "Same city" : null;
  return aboutMi(r.miles, { cap: true });
}
/** Place text for a "nearest outside" group: a listing with no city reads only as its state. */
function outsidePlace(p) {
  if (p.placed || !p.state) return placeText(p);
  return /statewide/i.test(String(p.city || "")) ? `${stateName(p.state)}, statewide` : `${stateName(p.state)}, no single city listed`;
}
const placeFor = (p, ctx) => (ctx && ctx.outside) ? outsidePlace(p) : placeText(p);
const metaText = (p, ctx) => (ctx && ctx.single) ? placeFor(p, ctx) : `${sportName(p.key)} · ${placeFor(p, ctx)}`;

/** Card for lists that mix sports. ctx: { where, stamp, wide, sameCity } */
export function programCard(p, ctx = {}) {
  const d = distText(p, ctx), t = trust(p, "short");
  return `<a class="pcard${ctx.wide ? " is-wide" : ""}" href="/programs/${esc(p.id)}">${plate(p, { kind: "card", wide: ctx.wide })}<h3 class="pc-name" title="${esc(p.name)}">${esc(p.name)}${vcheck(p)}</h3><p class="meta">${esc(metaText(p, { single: false }))}</p>${d ? `<p class="dist">${esc(d)}</p>` : ""}${t ? `<p class="pc-trust">${t}</p>` : ""}</a>`;
}

/** Row: tile left, then name, meta, distance and trust. ctx: { where, single, sameCity, outside }
    A list of one sport (ctx.single) drops the tile: the page header already shows the sport,
    so the row is name, place (and distance when real), then trust and date. */
export function programRow(p, ctx = {}, hidden = false) {
  const d = distText(p, ctx), t = trust(p, "short");
  if (ctx.single) {
    return `<a class="prow prow--c" href="/programs/${esc(p.id)}"${hidden ? " hidden" : ""}><div class="pr-body"><h3 class="pr-name">${esc(p.name)}${vcheck(p)}</h3><p class="meta">${esc(placeFor(p, ctx))}${d ? `<span class="pr-dist"> · ${esc(d)}</span>` : ""}</p>${t ? `<p class="pr-line">${t}</p>` : ""}</div></a>`;
  }
  const line = [d ? `<span class="pr-dist">${esc(d)}</span>` : "", t].filter(Boolean).join(" · ");
  return `<a class="prow" href="/programs/${esc(p.id)}"${hidden ? " hidden" : ""}>${plate(p, { kind: "row" })}<div class="pr-body"><h3 class="pr-name">${esc(p.name)}${vcheck(p)}</h3><p class="meta">${esc(metaText(p, ctx))}</p>${line ? `<p class="pr-line">${line}</p>` : ""}</div></a>`;
}

let UID = 0;
const uid = (p = "u") => p + (++UID);
/** First `first` rows, then a "Show all N" button that reveals the rest in place. */
export function rowList(list, ctx = {}, { id, first = 12 } = {}) {
  if (!list || !list.length) return "";
  const lid = id || uid("rows");
  const rows = list.map((p, i) => programRow(p, ctx, i >= first)).join("");
  const more = list.length > first ? `<button type="button" class="btn btn--line rows-more" data-more="${esc(lid)}" data-count="${list.length}">Show all ${list.length}</button>` : "";
  return `<div class="rows" id="${esc(lid)}">${rows}</div>${more}`;
}

export function grantRow(g) {
  const gi = grantInfo(g);
  const line = [gi.amount ? `<b class="g-amt num">${esc(gi.amount)}</b>` : "", `<span>${esc(gi.deadlineText)}</span>`].filter(Boolean).join(" · ");
  return `<a class="grow" href="/grants/${esc(g.id)}"><h3 class="g-name">${esc(displayName(g.name))}</h3><p class="g-from">From ${esc(g.source || "the grant maker")}</p><p class="g-line">${line}</p><p class="tags"><span class="tag">${gi.audienceLabel}</span>${gi.closed ? `<span class="tag tag--muted">Closed for now</span>` : ""}</p></a>`;
}
export function grantCard(g) {
  const gi = grantInfo(g);
  return `<a class="gcard" href="/grants/${esc(g.id)}">${plate("grant", { kind: "card", keepText: true, inner: `<span class="vpill vpill--plain">${gi.audienceLabel}</span>` })}${gi.amount ? `<p class="gc-amt num">${esc(gi.amount)}</p>` : ""}<h3 class="gc-name">${esc(displayName(g.name))}</h3><p class="gc-dl">${esc(gi.deadlineText)}</p></a>`;
}

/** An event's day: "2026-11-01" is that calendar day where you are, not midnight UTC. */
export function eventDay(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : parseDay(s);
}
/** Event card: { id, title|name, key|sportKey, city, state, start (ISO), url } */
export function eventCard(e) {
  const d = eventDay(e.start || e.date);
  const key = e.key || e.sportKey || "multi";
  const when = d ? `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}${/T\d\d:\d\d/.test(e.start || "") ? " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : ""}` : "";
  const place = e.city && e.state ? `${e.city}, ${e.state}` : e.state ? stateName(e.state) : "";
  const url = goodUrl(e.url);
  return `<article class="ecard"><div class="ec-date num" aria-hidden="true"><span>${d ? MON[d.getMonth()] : ""}</span><b>${d ? d.getDate() : ""}</b></div><div class="ec-body"><h3 class="ec-name">${esc(e.title || e.name || "")}</h3><p class="meta">${esc(sportName(key))}${place ? " · " + esc(place) : ""}</p>${when ? `<p class="ec-when num">${esc(when)}</p>` : ""}${url ? `<a class="tlink" href="${esc(url)}" target="_blank" rel="noopener">Event website${icon("external-link", 16)}</a>` : ""}</div></article>`;
}

/** Section heading. seeAll: { label, href } */
export function sectionHead({ title, sub, id, seeAll, level = 2 } = {}) {
  const h = `h${level}`;
  const all = seeAll ? (typeof seeAll === "string" ? seeAll : `<a class="sh-all" href="${esc(seeAll.href)}">${esc(seeAll.label)}</a>`) : "";
  return `<div class="sh"><div class="sh-text"><${h}${id ? ` id="${esc(id)}"` : ""} class="sh-title">${esc(title)}</${h}>${sub ? `<p class="sh-sub">${esc(sub)}</p>` : ""}</div>${all}</div>`;
}

/** Mist panel. actions: [{ label, href, kind, attrs }] or HTML strings; the first is primary. */
export function emptyState({ title, body, actions = [], image } = {}) {
  const acts = actions.slice(0, 3).map((a, i) => typeof a === "string" ? a : btn(a.label, a.href, a.kind || (i ? "line" : "ink"), { attrs: a.attrs, external: a.external })).join("");
  return `<div class="empty">${image === "event" ? plate("event", { kind: "row" }) : ""}<div class="empty-text"><h2 class="empty-title">${esc(title)}</h2>${body ? `<p>${esc(body)}</p>` : ""}${acts ? `<div class="btns">${acts}</div>` : ""}</div></div>`;
}

/** The letter, inline only (id="letter"). */
export function letterBlock({ source = "page" } = {}) {
  const i = uid("em");
  return `<section class="letter" id="letter" aria-labelledby="${i}-h"><h2 id="${i}-h" tabindex="-1">Get the letter</h2><p>New programs, grants and events, when there is something worth sending. No spam, and you can unsubscribe any time.</p>
<form class="letter-form" data-letter data-send="/api/subscribe" data-source="asnm-letter-${esc(source)}" data-done="You're on the list. We'll write when there is something worth sending." novalidate><div class="field"><label for="${i}">Email</label><div class="letter-row"><input id="${i}" name="em" type="email" autocomplete="email" placeholder="name@example.com" required data-error="Enter an email address, like name@example.com."><button class="btn btn--ink" type="submit">Subscribe</button></div></div><input name="company" tabindex="-1" autocomplete="off" class="hpot" aria-hidden="true"><label class="check"><input type="checkbox" name="beta"><span>I want the first look at new features</span></label></form></section>`;
}

export function helpBand() {
  return `<section class="helpband" aria-labelledby="hb-h"><h2 id="hb-h">Help build this</h2><p>Know a program we missed, or run one listed here? Tell us.</p><div class="btns">${btn("Add a program", "/add/program", "line")}${btn("Add an event", "/add/event", "line")}${btn("Claim your program", "/help", "line")}</div></section>`;
}

/** State outline. dots: programs (px/py), [x, y] in the 100 box, or [lat, lng]. you: [lat, lng]. */
export function stateOutline(st, { dots = [], you = null, size = 120, fill = false, cls = "" } = {}) {
  const d = D && D.shapes[st];
  if (!d) return "";
  const dotR = Math.max(1.8, ((size <= 48 ? 3 : 2.2) * 100) / size);
  const ring = (6 * 100) / size;
  const pts = dots.map((x) => toBox(st, x)).filter(Boolean);
  const y = you ? toBox(st, you) : null;
  return `<svg class="so${cls ? " " + cls : ""}" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d="${d}" class="so-shape${fill ? " is-fill" : ""}"/>${pts.map(([cx, cy]) => `<circle class="so-dot" cx="${cx}" cy="${cy}" r="${dotR.toFixed(2)}"/>`).join("")}${y ? `<circle class="so-you" cx="${y[0]}" cy="${y[1]}" r="${ring.toFixed(2)}"/>` : ""}</svg>`;
}

const GRID = {ME:[10,0],WI:[5,1],VT:[9,1],NH:[10,1],WA:[0,2],ID:[1,2],MT:[2,2],ND:[3,2],MN:[4,2],IL:[5,2],MI:[6,2],NY:[8,2],MA:[9,2],OR:[0,3],NV:[1,3],WY:[2,3],SD:[3,3],IA:[4,3],IN:[5,3],OH:[6,3],PA:[7,3],NJ:[8,3],CT:[9,3],RI:[10,3],CA:[0,4],UT:[1,4],CO:[2,4],NE:[3,4],MO:[4,4],KY:[5,4],WV:[6,4],VA:[7,4],MD:[8,4],DE:[9,4],AZ:[1,5],NM:[2,5],KS:[3,5],AR:[4,5],TN:[5,5],NC:[6,5],SC:[7,5],DC:[8,5],OK:[3,6],LA:[4,6],MS:[5,6],AL:[6,6],GA:[7,6],HI:[0,7],AK:[1,7],TX:[3,7],FL:[8,7]};
const tier = (n) => !n ? 0 : n < 10 ? 1 : n < 30 ? 2 : n < 60 ? 3 : 4;

/** "Choose a state" list. mode: "open" | "toggle" (collapsed on phones). */
export function stateList({ hrefFor, mode = "open", title = "Choose a state" } = {}) {
  const href = hrefFor || ((st) => "/states/" + st);
  const id = uid("sl");
  const items = STATE_CODES.map((st) => `<li><a href="${esc(href(st))}">${esc(stateName(st))}</a></li>`).join("");
  const toggle = mode === "toggle" ? `<button type="button" class="btn btn--line slist-btn" aria-expanded="false" aria-controls="${id}" data-toggle-list>Show all states</button>` : "";
  return `<div class="slist${mode === "toggle" ? " is-toggle" : ""}"><h3 class="slist-title">${esc(title)}</h3>${toggle}<ul id="${id}" class="slist-ul">${items}</ul></div>`;
}

/** Tile map of states plus the "Choose a state" list. list: "open" | "toggle" | "none" */
export function tileMap({ counts, hrefFor, selected, list = "open" } = {}) {
  const c = counts || Object.fromEntries(Object.entries(D.byState).map(([k, v]) => [k, v.length]));
  const href = hrefFor || ((st) => "/states/" + st);
  const tiles = Object.entries(GRID).map(([st, [x, y]]) => {
    const n = c[st] || 0;
    return `<a class="tile t${tier(n)}" style="grid-column:${x + 1};grid-row:${y + 1}" href="${esc(href(st))}" aria-label="${esc(stateName(st))}"${selected === st ? ' aria-current="page"' : ""}><span class="tile-code">${st}</span><span class="tile-n num" aria-hidden="true">${n}</span></a>`;
  }).join("");
  return `<div class="tmap"><div class="tm-grid">${tiles}</div><p class="tm-legend"><span class="tm-key" aria-hidden="true"><i class="t1"></i><i class="t2"></i><i class="t3"></i><i class="t4"></i></span> Listing density.</p></div>${list === "none" ? "" : stateList({ hrefFor, mode: list })}`;
}

let BAR_HREF = null;
/** A label that never breaks at its hyphen ("Multi-sport" in a 72px tile). */
const nbh = (t) => String(t).replace(/-/g, "\u2011");
/** Horizontal sport scroller. keys: sports present in this pool. hrefFor(""): the "All" link. sheet: adds "All sports".
    Siblings that share a picture (3.5) sit right after their tile as a text item ("Also: Surfing"),
    so they never make the whole bar taller. */
export function sportBar({ keys, active = "", hrefFor, label = "Sports", sheet = false } = {}) {
  const groups = pictureGroups(keys ? [...keys] : undefined);
  if (sheet) BAR_HREF = { hrefFor, present: keys ? [...keys] : null, active };
  const all = `<li class="sb-item"><a class="sb-link" href="${esc(hrefFor(""))}" data-bar-link${!active ? ' aria-current="true"' : ""}><span class="av av--bar av--all" aria-hidden="true">${icon("layout-grid", 26)}</span><span class="sb-label">All</span></a></li>`;
  const items = groups.map((g) => {
    const cur = active === g.key;
    const also = g.also.length ? `<li class="sb-item sb-item--also"><span class="sb-also">Also: ${g.also.map((k) => `<a href="${esc(hrefFor(k))}" data-bar-link${active === k ? ' aria-current="true"' : ""}>${esc(sportName(k))}</a>`).join(", ")}</span></li>` : "";
    return `<li class="sb-item"><a class="sb-link" href="${esc(hrefFor(g.key))}" data-bar-link${cur ? ' aria-current="true"' : ""}>${avatar(g.key, "bar")}<span class="sb-label">${esc(nbh(sportName(g.key)))}</span></a></li>${also}`;
  }).join("");
  const more = sheet ? `<li class="sb-item"><button type="button" class="sb-link" data-open="sports" data-sheet-bar><span class="av av--bar av--all" aria-hidden="true">${icon("ellipsis", 26)}</span><span class="sb-label">All sports</span></button></li>` : "";
  return `<nav class="sbar" aria-label="${esc(label)}"><ul class="sb-list">${all}${items}${more}</ul></nav>`;
}

/** Buttons that jump to result groups. groups: [{ id, label, count }] */
export function jumpChips(groups) {
  const gs = (groups || []).filter((g) => g && (g.count == null || g.count > 0));
  if (!gs.length) return "";
  return `<div class="jumps">${gs.map((g) => `<button type="button" class="chip" data-jump="${esc(g.id)}">${esc(g.label)}${g.count != null ? ` · <span class="num">${g.count}</span>` : ""}</button>`).join("")}</div>`;
}

/** Phone bottom bar. action: HTML string or { label, href, kind, external } */
export function stickyBar({ left = "", action = "" } = {}) {
  const act = typeof action === "string" ? action : btn(action.label, action.href, action.kind || "ink", { external: action.external !== false && /^https?:/i.test(action.href || ""), attrs: action.attrs });
  return `<div class="stk"><div class="stk-left">${left}</div><div class="stk-act">${act}</div></div>`;
}

/** Link (or button when href is empty) in one of four styles. */
export function btn(label, href, kind = "ink", { external = false, attrs = "", icon: ic, cls = "" } = {}) {
  const k = ["ink", "orange", "line", "text"].includes(kind) ? kind : "ink";
  const lead = ic ? icon(ic, 20) : "";
  const tail = external ? icon("external-link", 18) + `<span class="sr"> (opens in a new tab)</span>` : "";
  const c = `btn btn--${k}${cls ? " " + cls : ""}`;
  if (!href) return `<button type="button" class="${c}" ${attrs}>${lead}<span>${esc(label)}</span>${tail}</button>`;
  return `<a class="${c}" href="${esc(href)}"${external ? ' target="_blank" rel="noopener"' : ""} ${attrs}>${lead}<span>${esc(label)}</span>${tail}</a>`;
}

/** Sport and state community header (4.10). The state banner carries the h1 on the Sand
    ground beside the outline, so the banner is the page's title, not an empty box.
    "Get the letter" is a line button: the page's one ink button belongs to its task (4.14). */
export function communityHeader({ kind = "sport", key, st, title, line, count, actions, tabs, dots = [], mapHref, sport } = {}) {
  const h1 = `<h1 tabindex="-1">${esc(title)}</h1>`;
  let banner;
  if (kind === "state") {
    const av = sport ? `<span class="ch-sav">${avatar(sport, 64)}</span>` : "";
    banner = `<div class="ch-banner ch-banner--state"><div class="ch-btext">${h1}</div><div class="ch-bart" aria-hidden="true">${av}${stateOutline(st, { dots, size: 140 })}</div></div>`;
  } else {
    const inv = canInvert(key);
    banner = `<div class="ch-banner ch-banner--sport${inv ? " is-inv" : ""}${FLOOR_PROP.has(key) ? " is-floor" : ""}" style="${toneStyle(key)}" aria-hidden="true">${fig(key, { big: true })}</div>`;
  }
  const av = kind === "sport" ? `<span class="ch-av">${avatar(key, 88)}</span>` : "";
  let cnt = "";
  if (count) cnt = typeof count === "string" ? `<p class="ch-count num">${count}</p>` : `<p class="ch-count num">${count.href ? `<a href="${esc(count.href)}">${esc(count.text)}</a>` : esc(count.text)}</p>`;
  let acts = actions;
  if (acts == null) {
    acts = [btn("Get the letter", "", "line", { attrs: 'data-jump="letter"', icon: "mail" }), btn("Share", "", "line", { attrs: "data-share", icon: "share" })];
    if (kind === "state") acts.push(btn("Map", mapHref || `/states/${st}?map=1`, "line", { icon: "map" }));
  }
  const actHtml = Array.isArray(acts) ? acts.join("") : acts;
  const tabHtml = tabs && tabs.length ? `<nav class="tabs" aria-label="${esc(title)} sections">${tabs.map((t) => `<a href="${esc(t.href)}" data-replace${t.current ? ' aria-current="page"' : ""}>${esc(t.label)}</a>`).join("")}</nav>` : "";
  return `<header class="ch ch--${kind}">${banner}<div class="ch-body">${av}${kind === "state" ? "" : h1}${line ? `<p class="ch-line">${esc(line)}</p>` : ""}${cnt}${actHtml ? `<div class="btns ch-acts">${actHtml}</div>` : ""}</div>${tabHtml}</header>`;
}

/** The desktop aside. */
export function aboutBox() {
  return `<div class="abox"><h2>About this directory</h2><p>Free to use, no account needed. This directory is new and still growing.</p><a class="tlink" href="/about">How we check listings</a></div><div class="abox"><h2>Help build this</h2><div class="btns btns--stack">${btn("Add a program", "/add/program", "line")}${btn("Claim your program", "/help", "line")}</div></div>`;
}

/** Inline place search (home, "place not found"): input with type-ahead, Search, Use my location. */
export function whereForm({ value = "", sport = "", id, after = "" } = {}) {
  const i = id || uid("wf");
  return `<form class="wf" data-where${sport ? ` data-sport="${esc(sport)}"` : ""} novalidate role="search"><label class="wf-label" for="${i}">City, state or ZIP</label><div class="wf-row"><input id="${i}" class="input" name="place" value="${esc(value)}" autocomplete="off" enterkeyhint="search" data-suggest="${i}-list" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${i}-list" aria-describedby="${i}-err"><button class="btn btn--orange" type="submit">${icon("search", 20)}<span>Search</span></button></div><p class="ferr" id="${i}-err" hidden></p><div class="dym" hidden></div><div class="suggest" id="${i}-list" role="listbox" aria-label="Places" hidden></div><div class="wf-after"><button type="button" class="btn btn--text wf-loc" data-locate>${icon("locate", 20)}<span>Use my location</span></button>${after}</div><p class="wf-status" role="status"></p></form>`;
}

/* ======================================================================
   Chrome (4.1, 4.2, 4.4, 4.16) and notFound
   ====================================================================== */

export function betaBar() {
  if (store.get("asnm.beta", 1) === 0) return "";
  return `<div class="beta"><p>This directory is new and still growing. <a href="/help">Help us build it</a></p><button type="button" class="iconbtn" data-dismiss-beta aria-label="Hide this message">${icon("x", 20)}</button></div>`;
}

export function header() {
  return `<div class="hd"><button type="button" class="iconbtn hd-menu" data-open="menu" aria-label="Menu">${icon("menu", 24)}</button><a class="hd-brand" href="/" aria-label="Adaptive Sports Near Me, home"><img src="/app/logo.svg" alt="" width="32" height="32"><span class="hd-word" aria-hidden="true"><span>Adaptive Sports</span> <span>Near Me</span></span></a><span class="hd-grow"></span><button type="button" class="iconbtn hd-search" data-open="search" aria-label="Search">${icon("search", 22)}</button><a class="hd-add" href="/help">${icon("plus", 20)}<span>Add</span></a></div>`;
}

const nearHref = () => { const p = recall("place"); return p ? "/near/" + encodeURIComponent(p) : null; };
export function drawerList(active = "") {
  let marked = false;
  const item = (id, href, ic, label) => {
    const cur = !marked && active && id === active; if (cur) marked = true;
    const iconHtml = typeof ic === "string" && ic.startsWith("<") ? ic : icon(ic, 20);
    return href
      ? `<li><a class="dl-item" href="${esc(href)}"${cur ? ' aria-current="page"' : ""}>${iconHtml}<span>${esc(label)}</span></a></li>`
      : `<li><button type="button" class="dl-item" data-open="search">${iconHtml}<span>${esc(label)}</span></button></li>`;
  };
  const sec = (title, inner) => `<div class="dl-sec"><h2 class="dl-h">${esc(title)}</h2><ul>${inner}</ul></div>`;
  const recent = D ? recall("recent") : [];
  // Find, Help build this and More come first, so a phone reaches Resources without
  // scrolling past every sport; the sports list stops at 8 and links to all of them.
  const sports = D ? topGroups(8) : [];
  return [
    sec("Find", item("near", nearHref(), "map-pin", "Programs near you") + item("sports", "/sports", "layout-grid", "Sports") + item("states", "/states", "map", "States") + item("grants", "/grants", "hand-coins", "Grants") + item("events", "/events", "calendar", "Events")),
    sec("Help build this", item("add-program", "/add/program", "plus", "Add a program") + item("add-event", "/add/event", "calendar-plus", "Add an event") + item("help", "/help", "badge-check", "Claim your program") + item("about", "/about", "shield-check", "How we check listings")),
    sec("More", item("letter", "/letter", "mail", "Get the letter") + item("resources", "/resources", "book-open", "Resources")),
    recent.length ? sec("Recently viewed", recent.map((k) => item("sport:" + k, "/sports/" + k, avatar(k, 40), sportName(k))).join("")) : "",
    sports.length ? sec("Sports", sports.map((g) => item("sport:" + g.key, "/sports/" + g.key, avatar(g.key, 40), sportName(g.key))).join("") + item("sports-all", "/sports", "ellipsis", "All sports")) : "",
  ].join("");
}

export function footer() {
  const near = nearHref();
  const li = (label, href) => `<li><a href="${esc(href)}">${esc(label)}</a></li>`;
  return `<div class="ft"><div class="ft-brand"><img src="/app/logo.svg" alt="" width="40" height="40"><div class="ft-brand-text"><p class="ft-name">Adaptive Sports Near Me</p><p>A free directory of adaptive sports programs, grants and events. We list programs; we don't run them.</p></div></div>
<div class="ft-cols"><div><h2 class="ft-h">Find</h2><ul>${near ? li("Programs near you", near) : `<li><button type="button" data-open="search">Programs near you</button></li>`}${li("Sports", "/sports")}${li("States", "/states")}${li("Grants", "/grants")}${li("Events", "/events")}</ul></div>
<div><h2 class="ft-h">Help build this</h2><ul>${li("Add a program", "/add/program")}${li("Add an event", "/add/event")}${li("Claim your program", "/help")}${li("How we check listings", "/about")}</ul></div>
<div><h2 class="ft-h">More</h2><ul>${li("Get the letter", "/letter")}${li("Resources", "/resources")}${li("Accessibility", "/about")}</ul></div></div>
<div class="ft-fine"><p class="ft-fine">Adaptive Sports Near Me is a project of <a href="https://adapttolife.org">Adapt To Life</a>. Check with each program before you go.</p><p class="ft-fine">© 2026 <a href="https://adapttolife.org">Adapt To Life</a></p></div></div>`;
}

/** Render output for any unknown route, id or key. */
export function notFound() {
  return {
    title: "Page not found · Adaptive Sports Near Me",
    description: "The link may be old, or the listing may have moved.",
    html: `<section class="nf"><h1 tabindex="-1">We couldn't find that page</h1><p>The link may be old, or the listing may have moved.</p><div class="btns">${btn("Find a program", "/", "ink")}${btn("Browse sports", "/sports", "line")}</div></section>`,
  };
}

/* ======================================================================
   Overlays: focus trap, generic dialog host, search sheet, sports sheet, drawer
   ====================================================================== */

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]):not(.hp):not(.hpot), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
let INERT_DEPTH = 0;
function setBackgroundInert(on) {
  INERT_DEPTH += on ? 1 : -1;
  if (INERT_DEPTH < 0) INERT_DEPTH = 0;
  const v = INERT_DEPTH > 0;
  for (const id of ["beta", "top", "shell", "foot", "sticky"]) { const el = document.getElementById(id); if (el) el.inert = v; }
  const sk = $(".skip"); if (sk) sk.inert = v;
  document.body.classList.toggle("is-modal", v);
}
/** Traps Tab inside el, makes the page behind inert, returns release() (restores focus to the opener). */
export function trapFocus(el) {
  const opener = document.activeElement;
  setBackgroundInert(true);
  const items = () => $$(FOCUSABLE, el).filter((x) => x.offsetParent !== null || x === document.activeElement);
  const onKey = (e) => {
    if (e.key !== "Tab") return;
    const f = items(); if (!f.length) { e.preventDefault(); return; }
    const first = f[0], last = f[f.length - 1], a = document.activeElement;
    if (e.shiftKey && (a === first || !el.contains(a))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (a === last || !el.contains(a))) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener("keydown", onKey, true);
  // Focus the dialog's heading (so a tap open paints no ring), unless a field asks for it.
  if (!el.contains(document.activeElement)) {
    let t = $("[data-autofocus]", el);
    if (!t) { t = $("h2", el); if (t && !t.hasAttribute("tabindex")) t.setAttribute("tabindex", "-1"); }
    t = t || items()[0];
    if (t) t.focus({ preventScroll: true });
  }
  let done = false;
  return function release({ restore = true } = {}) {
    if (done) return; done = true;
    document.removeEventListener("keydown", onKey, true);
    setBackgroundInert(false);
    if (restore && opener && opener.focus && document.contains(opener) && !opener.closest("[inert]")) opener.focus({ preventScroll: true });
  };
}

/** Polite live-region message. */
export function announce(text) {
  const el = $("#live"); if (!el) return;
  el.textContent = "";
  setTimeout(() => { el.textContent = text; }, 40);
}

let OV = null; // { name, el, release, onClose, pushed }
/* Phone Back closes a sheet. A sheet opened by a tap (search, sports, menu, the
   Verified story) gets its own history entry at the same address (pushSheet), so
   Back closes it instead of leaving the page. Closing it by hand steps that entry
   back off; following a link from inside it reuses the entry, so Back from the next
   page lands on this page in one press. Sheets that live in the address (?map=1,
   ?share=1, ?open=) keep their own handling. */
let SHEET_ENTRY = false, SKIP_POP = false;
/** Give the open sheet its own Back step (once per entry; a sheet opened from a sheet shares it). */
export function pushSheet() {
  if (!OV) return;
  OV.pushed = true;
  if (!SHEET_ENTRY) { history.pushState({ asnmSheet: OV.name }, "", location.href); SHEET_ENTRY = true; }
}
/** Generic dialog in #overlay. Escape and [data-close] close it. Returns the dialog element. */
export function showOverlay({ name = "dialog", html = "", cls = "", labelledby, label, onClose, scrim = true } = {}) {
  closeOverlay({ restore: false, mode: "swap" });
  const host = $("#overlay");
  host.innerHTML = `${scrim ? '<div class="ov-scrim" data-close></div>' : ""}<div class="ov ${esc(cls)}" role="dialog" aria-modal="true"${labelledby ? ` aria-labelledby="${esc(labelledby)}"` : ""}${label ? ` aria-label="${esc(label)}"` : ""}>${html}</div>`;
  const el = $(".ov", host);
  document.body.classList.add("ov-open");
  const release = trapFocus(el);
  OV = { name, el, release, onClose };
  return el;
}
/** Closes whichever overlay is open (search, sports sheet, drawer or a view's dialog).
    mode: "dismiss" (closed by hand: its Back step goes too), "nav" (a page change follows
    and reuses the step), "swap" (another sheet takes its place), "pop" (Back already left it). */
export function closeOverlay({ restore = true, mode = "dismiss" } = {}) {
  if (!OV) return;
  const o = OV; OV = null;
  if (o.pushed && SHEET_ENTRY && mode === "dismiss") { SHEET_ENTRY = false; SKIP_POP = true; history.back(); }
  if (o.name === "menu") {
    const d = $("#drawer"), s = $("#drawer-scrim");
    d.classList.remove("is-on"); s.classList.remove("is-on");
    const hide = () => { if (!d.classList.contains("is-on")) { d.hidden = true; d.inert = true; } };
    if (reduced()) hide(); else setTimeout(hide, 200);
  } else {
    $("#overlay").innerHTML = "";
  }
  document.body.classList.remove("ov-open");
  o.release({ restore });
  if (o.onClose) try { o.onClose(); } catch (e) { console.warn(e); }
}

export function openDrawer() {
  closeOverlay({ restore: false, mode: "swap" });
  const d = $("#drawer"), s = $("#drawer-scrim");
  $(".dr-list", d).innerHTML = drawerList(ACTIVE);
  d.hidden = false; d.inert = false;
  requestAnimationFrame(() => { d.classList.add("is-on"); s.classList.add("is-on"); });
  document.body.classList.add("ov-open");
  const release = trapFocus(d);
  OV = { name: "menu", el: d, release };
}

/** Search sheet. preset: { place, sport } */
export async function openSearch(preset = {}) {
  await loadData();
  const st = { sport: preset.sport && NAMES[preset.sport] ? preset.sport : "", all: false };
  // 11 sports and "Any sport" make 12 tiles: a full grid at 3, 4 or 6 columns, no tile alone.
  const top = topGroups(11).map((g) => g.key);
  const allGroups = pictureGroups();
  if (st.sport && !top.includes(st.sport)) st.all = true;
  const tile = (k, label, avHtml) => `<button type="button" class="ss-tile" data-pick="${esc(k)}" aria-pressed="${st.sport === k}">${avHtml}<span>${esc(nbh(label))}</span></button>`;
  const anyAv = `<span class="av av--72 av--all" aria-hidden="true">${icon("circle-dot", 30)}</span>`;
  const grid = () => {
    const keys = st.all ? allGroups.map((g) => g.key) : top;
    const sibs = st.all ? allGroups.flatMap((g) => g.also) : [];
    return tile("", "Any sport", anyAv) + keys.map((k) => tile(k, sportName(k), avatar(k, 72))).join("") +
      (sibs.length ? `<p class="ss-also">Also: ${sibs.map((k) => `<button type="button" class="ss-alsobtn" data-pick="${esc(k)}" aria-pressed="${st.sport === k}">${esc(sportName(k))}</button>`).join(" ")}</p>` : "");
  };
  const el = showOverlay({
    name: "search", cls: "ov--sheet ov--search", labelledby: "ss-h",
    html: `<form class="ss" data-sheet novalidate><div class="ss-top"><button type="button" class="iconbtn" data-close aria-label="Close">${icon("x", 24)}</button><h2 id="ss-h">Search</h2></div>
<div class="ss-body"><h3 class="ss-q">Where?</h3><label class="ss-label" for="ss-where">City, state or ZIP</label><input id="ss-where" class="input" name="place" value="${esc(preset.place || "")}" autocomplete="off" enterkeyhint="search" data-suggest="ss-list" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="ss-list" aria-describedby="ss-err" data-autofocus><p class="ferr" id="ss-err" hidden></p><div class="dym" hidden></div><div class="suggest" id="ss-list" role="listbox" aria-label="Places" hidden></div>
<button type="button" class="btn btn--text ss-loc" data-locate>${icon("locate", 20)}<span>Use my location</span></button><p class="wf-status" role="status"></p>
<h3 class="ss-q">Which sport? <span class="ss-opt">(optional)</span></h3><div class="ss-grid" role="group" aria-label="Sport">${grid()}</div>
<button type="button" class="btn btn--line ss-more" data-showall aria-expanded="${st.all}"${st.all ? " hidden" : ""}>Show all sports</button></div>
<div class="ss-foot"><button type="button" class="btn btn--text" data-clear>Clear</button><button type="submit" class="btn btn--ink">Show programs</button></div></form>`,
  });
  const form = $("form", el);
  form._sheet = st;
  form._regrid = () => { const g = $(".ss-grid", el); g.innerHTML = grid(); g.classList.toggle("is-all", st.all); };
  $(".ss-grid", el).classList.toggle("is-all", st.all);
  return el;
}

/** Sports sheet: every picture group, each a link. Opened from a results sport bar, the
    sports in this place come first and every link keeps the place (a sport with nothing
    here shows the honest empty state and the nearest list). */
export async function openSportsSheet(opts) {
  await loadData();
  const o = opts || {};
  const hrefFor = o.hrefFor || ((k) => "/sports/" + k);
  const replace = !!o.hrefFor;
  let groups = pictureGroups();
  if (o.present) {
    const have = new Set(o.present.map(gridHead));
    groups = [...groups.filter((g) => have.has(gridHead(g.key))), ...groups.filter((g) => !have.has(gridHead(g.key)))];
  }
  const items = groups.map((g) => `<li><a class="sh-tile" href="${esc(hrefFor(g.key))}"${replace ? " data-replace" : ""}${o.active === g.key ? ' aria-current="true"' : ""} data-close-after>${avatar(g.key, 72)}<span>${esc(nbh(sportName(g.key)))}</span></a>${g.also.length ? `<span class="sh-also">Also: ${g.also.map((k) => `<a href="${esc(hrefFor(k))}"${replace ? " data-replace" : ""} data-close-after>${esc(sportName(k))}</a>`).join(", ")}</span>` : ""}</li>`).join("");
  return showOverlay({
    name: "sports", cls: "ov--sheet ov--sports", labelledby: "sp-h",
    html: `<div class="ss-top"><button type="button" class="iconbtn" data-close aria-label="Close">${icon("x", 24)}</button><h2 id="sp-h" tabindex="-1">Sports</h2></div><div class="ss-body"><ul class="sh-grid">${items}</ul></div>`,
  });
}

/* ======================================================================
   Navigation and the render loop (1.4)
   ====================================================================== */

const ROUTES = [
  ["/", "home"], ["/near/:place", "near"], ["/sports", "sports"], ["/sports/:key", "sport"],
  ["/states", "states"], ["/states/:st", "state"], ["/programs/:id", "program"],
  ["/grants", "grants"], ["/grants/:id", "grant"], ["/events", "events"],
  ["/add/program", "forms"], ["/add/event", "forms"], ["/update/:id", "forms"],
  ["/help", "help"], ["/about", "help"], ["/resources/veteran-owned-businesses", "vob"], ["/resources", "help"], ["/letter", "help"],
];
const OVERLAY_KEYS = new Set(["map", "open"]);
const MODS = {}, CSS_DONE = {};
let REPLACING = false, PENDING = false, CUR = null, CLEANUP = null, SEQ = 0, ACTIVE = "", FIRST = true, MAP_MOD = null, MAP_OPEN = false;
const SEEN = new Set(JSON.parse(sessionStorage.getItem("asnm.seen") || "[]"));

/** This page's address (path and query): the key for scroll, "Show all" and focus memory. */
export const here = () => location.pathname + location.search;
function parseLoc() {
  const path = location.pathname.length > 1 ? location.pathname.replace(/\/+$/, "") : "/";
  return { path, query: Object.fromEntries(new URLSearchParams(location.search)) };
}
/** "/sports/tennis?st=FL" for an address the app draws itself, else null (full page load). */
function appHref(href) {
  if (!href || (href.startsWith("#") && !href.startsWith("#/"))) return null;   // in-page anchors stay with the browser
  let u;
  try { u = new URL(href.startsWith("#/") ? href.slice(1) : href, location.href); } catch (_) { return null; }
  if (u.origin !== location.origin) return null;
  const path = u.pathname.length > 1 ? u.pathname.replace(/\/+$/, "") : "/";
  return path === "/" || matchRoute(path) ? path + u.search : null;
}
function matchRoute(path) {
  const segs = path.split("/").filter(Boolean);
  for (const [pat, name] of ROUTES) {
    const ps = pat.split("/").filter(Boolean);
    if (ps.length !== segs.length) continue;
    const params = {}; let ok = true;
    for (let i = 0; i < ps.length; i++) {
      if (ps[i].startsWith(":")) { try { params[ps[i].slice(1)] = decodeURIComponent(segs[i]); } catch (_) { params[ps[i].slice(1)] = segs[i]; } }
      else if (ps[i] !== segs[i]) { ok = false; break; }
    }
    if (ok) return { name, params };
  }
  return null;
}
const qsKey = (q, skip) => Object.keys(q).filter((k) => !skip.has(k)).sort().map((k) => k + "=" + q[k]).join("&");

/** Navigate. replace: filter-only changes (no new history entry). */
export function nav(href, { replace = false } = {}) {
  const to = appHref(href);
  if (!to) { if (href) location.href = href; return; }
  // A link followed from a sheet takes over the sheet's Back step instead of adding one.
  if (SHEET_ENTRY) {
    SHEET_ENTRY = false;
    if (here() === to && !replace) { SKIP_POP = true; history.back(); if (OV) closeOverlay({ restore: false, mode: "nav" }); return; }
    PENDING = true;
    if (replace) REPLACING = true;
    history.replaceState(null, "", to); render();
    return;
  }
  PENDING = true;
  if (replace) { REPLACING = true; history.replaceState(history.state, "", to); render(); }
  else if (here() === to) { REPLACING = true; render({ force: true }); }
  else { history.pushState(null, "", to); render(); }
}
/** history.back() when this session has navigated in-app, else go to the fallback. */
export function backOr(fallbackHref = "/") {
  const n = Number(sessionStorage.getItem("asnm.navs") || 0);
  if (n > 0) history.back();
  else nav(fallbackHref, { replace: true });
}

function defaultActive(name, path, params) {
  if (name === "near") return "near";
  if (name === "sports") return "sports";
  if (name === "sport") return "sport:" + params.key;
  if (name === "states" || name === "state") return "states";
  if (name === "grants" || name === "grant") return "grants";
  if (name === "events") return "events";
  if (path === "/add/program") return "add-program";
  if (path === "/add/event") return "add-event";
  if (name === "help") return path.slice(1);
  return "";
}

function loadCss(name) {
  if (CSS_DONE[name]) return CSS_DONE[name];
  return (CSS_DONE[name] = new Promise((res) => {
    const l = document.createElement("link");
    l.rel = "stylesheet"; l.href = new URL("./views/" + name + ".css", import.meta.url).href;
    l.onload = l.onerror = () => res();
    document.head.appendChild(l);
  }));
}
async function loadView(name) {
  if (!MODS[name]) MODS[name] = import("./views/" + name + ".js");
  try {
    const [mod] = await Promise.all([MODS[name], loadCss(name)]);
    return mod;
  } catch (e) { delete MODS[name]; throw e; }
}
/* The page when the directory or a page's code could not load: say so, offer to try again. */
function loadError() {
  return {
    title: "We couldn't load this page · Adaptive Sports Near Me",
    html: `<section class="nf"><h1 tabindex="-1">We couldn't load this page</h1><p>Check your connection and try again.</p><div class="btns"><button type="button" class="btn btn--ink" data-retry>${icon("refresh-cw", 20)}<span>Try again</span></button>${btn("Go to the home page", "/", "line")}</div></section>`,
  };
}

function setMeta(title, description) {
  if (title) document.title = title;
  let m = $('meta[name="description"]');
  if (description && m) m.setAttribute("content", description);
  // The same canonical the Worker writes (src/pages.js): the site's address, no query.
  let path = location.pathname.replace(/\/+$/, "") || "/";
  if (/^\/states\/[a-z]{2}$/i.test(path)) path = path.slice(0, 8) + path.slice(8).toUpperCase();
  const url = "https://adaptivesportsnearme.com" + path;
  const c = $('link[rel="canonical"]'), og = $('meta[property="og:url"]');
  if (c) c.setAttribute("href", url);
  if (og) og.setAttribute("content", url);
}

let CHROME_SIG = "";
function refreshChrome(force) {
  const sig = [recall("place"), recall("recent").join(","), store.get("asnm.beta", 1)].join("|");
  if (!force && sig === CHROME_SIG) return;
  CHROME_SIG = sig;
  $("#beta").innerHTML = betaBar();
  $("#foot").innerHTML = footer();
}

async function handleOverlays(ctx) {
  const q = ctx.query;
  if (q.open === "search") openSearch({});
  else if (q.open === "sports") openSportsSheet();
  else if (q.open === "menu") openDrawer();
  const wantMap = q.map === "1" && (ctx.name === "near" || ctx.name === "state");
  if (wantMap) {
    try {
      MAP_MOD = MAP_MOD || await import("./views/map.js");
      await loadCss("map");
      let where = null;
      if (ctx.name === "near") where = await resolvePlace(ctx.params.place);
      const state = where && where.state ? where.state : (ctx.params.st || "").toUpperCase();
      MAP_OPEN = true;
      await MAP_MOD.openMap(ctx, { where, state, sport: q.s || "", verifiedOnly: q.v === "1" });
    } catch (e) { console.error(e); }
  } else if (MAP_OPEN && MAP_MOD) {
    MAP_OPEN = false;
    try { MAP_MOD.closeMap(); } catch (e) { console.error(e); }
  }
}

async function render({ force = false } = {}) {
  const hash = here();
  const { path, query } = parseLoc();
  const fromApp = PENDING; PENDING = false;
  const isBack = !fromApp && !FIRST && SEEN.has(hash);
  SEEN.add(hash);
  try { sessionStorage.setItem("asnm.seen", JSON.stringify([...SEEN].slice(-200))); } catch (_) {}

  // Overlay-only change (map=1 or open=...): keep the page, toggle the overlay.
  if (!force && CUR && CUR.path === path && qsKey(CUR.query, OVERLAY_KEYS) === qsKey(query, OVERLAY_KEYS)) {
    CUR = { ...CUR, hash, query, ctx: { ...CUR.ctx, query, isBack } };
    REPLACING = false;
    await handleOverlays(CUR.ctx);
    return;
  }

  const seq = ++SEQ;
  const m = matchRoute(path);
  const name = m ? m.name : null;
  let data = null, mod = null, failed = false;
  // The page's own code loads alongside the data, not after it.
  const viewP = name ? loadView(name).catch((e) => { console.error(e); return null; }) : Promise.resolve(null);
  try { data = await loadData(); } catch (e) { console.error(e); failed = true; }
  mod = await viewP;
  if (name && !mod) failed = true;
  if (seq !== SEQ) return;

  if (CUR) { try { sessionStorage.setItem("asnm.scroll." + CUR.hash, String(Math.round(scrollY))); } catch (_) {} }
  if (CLEANUP) { try { CLEANUP(); } catch (e) { console.error(e); } CLEANUP = null; }
  if (OV) closeOverlay({ restore: false, mode: "nav" });

  BAR_HREF = null; // only a bar rendered on this page may hand its links to the sports sheet
  const ctx = { name: name || "notFound", path, params: m ? m.params : {}, query, data, isBack, isFirst: FIRST };
  let out;
  if (failed) { out = loadError(); mod = null; }
  else {
    try { out = mod ? await mod.render(ctx) : notFound(); }
    catch (e) { console.error(e); out = e && e.loadFailed ? loadError() : notFound(); }
  }
  if (seq !== SEQ) return;
  out = out || notFound();

  const main = $("#main"), aside = $("#aside"), sticky = $("#sticky");
  // A filter change on the same page (sport bar, chips, tabs, verified) keeps the reader's place.
  const sameFilter = REPLACING && !!CUR && CUR.path === path && !isBack;
  const prevY = scrollY, ctrl = LAST_CTRL; LAST_CTRL = null;
  main.className = "v-" + ctx.name;
  aside.className = "v-" + ctx.name + "-aside";
  main.innerHTML = out.html || "";
  aside.innerHTML = out.aside || "";
  document.body.classList.toggle("has-aside", !!out.aside);
  sticky.innerHTML = out.sticky || "";
  document.body.classList.toggle("has-sticky", !!out.sticky);
  document.body.classList.toggle("is-home", ctx.name === "home");
  document.body.dataset.view = ctx.name;
  setMeta(out.title, out.description);
  ACTIVE = out.railActive ? (out.railActive.includes(":") || !NAMES[out.railActive] ? out.railActive : "sport:" + out.railActive) : defaultActive(ctx.name, path, ctx.params);
  $("#rail").innerHTML = `<div class="rail-in">${drawerList(ACTIVE)}</div>`;
  refreshChrome();

  CUR = { hash, path, query, name: ctx.name, ctx };
  if (mod && mod.mount) { try { const c = mod.mount(main, ctx); CLEANUP = typeof c === "function" ? c : null; } catch (e) { console.error(e); } }
  centerBars(main);
  setupSticky(main);

  history.scrollRestoration = "manual";
  const moreKey = "asnm.more." + hash, lastKey = "asnm.last." + hash;
  let focusEl = null;
  if (isBack) {
    // Lists the reader had opened with "Show all" open again, so the row they left is still there.
    let opened = [];
    try { opened = JSON.parse(sessionStorage.getItem(moreKey) || "[]"); } catch (_) {}
    for (const id of opened) expandList(id, { quiet: true });
    const y = Number(sessionStorage.getItem("asnm.scroll." + hash) || 0);
    requestAnimationFrame(() => requestAnimationFrame(() => scrollTo(0, y)));
    // Focus goes back to the link the reader followed from here, when it is still on the page.
    const last = sessionStorage.getItem(lastKey);
    if (last) focusEl = $$("a[href]", main).find((x) => x.getAttribute("href") === last && x.offsetParent !== null) || null;
  } else if (sameFilter) {
    focusEl = findCtrl(main, ctrl);
    // Results keep their sticky toolbar at the top; other pages keep the control row in view.
    const anchor = $(".nr-tools", main) || (focusEl && focusEl.closest(".sbar, .pchips, .tabs, .seg")) || $(".sbar, .pchips, .tabs, .seg", main);
    let top = 0;
    if (anchor) { const prev = anchor.previousElementSibling; top = Math.max(0, Math.round((prev ? prev.getBoundingClientRect().bottom : anchor.getBoundingClientRect().top) + scrollY) - (prev ? 0 : 8)); }
    scrollTo(0, Math.min(prevY, top));
  } else {
    try { sessionStorage.removeItem(moreKey); } catch (_) {}
    scrollTo(0, 0);
  }

  if (!FIRST) {
    if (focusEl) focusEl.focus({ preventScroll: true });
    else {
      const h1 = $("h1", main);
      if (h1) { if (!h1.hasAttribute("tabindex")) h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); }
    }
    if (!(sameFilter && ctx.name === "near")) announce(out.title || document.title);   // near announces its own count
  }
  // In-app navigation count (pushes add one, a detected Back takes one away).
  if (!FIRST) {
    let n = Number(sessionStorage.getItem("asnm.navs") || 0);
    if (isBack) n = Math.max(0, n - 1); else if (!REPLACING) n += 1;
    sessionStorage.setItem("asnm.navs", String(n));
  }
  REPLACING = false;
  if (FIRST) {
    const later = window.requestIdleCallback || ((f) => setTimeout(f, 1200));
    later(() => loadScript(USERWAY_SRC, { "data-account": "sFogOSJsXe" }), { timeout: 4000 });
  }
  FIRST = false;
  await handleOverlays(ctx);
}

/* The page's own place and sport, for the header search. */
async function pagePreset() {
  if (!CUR) return {};
  const q = CUR.query || {}, p = (CUR.ctx && CUR.ctx.params) || {};
  if (CUR.name === "near") { const w = await resolvePlace(p.place); return { place: w.kind === "none" ? (p.place || "") : w.label, sport: q.s || "" }; }
  if (CUR.name === "state") return { place: stateName(p.st), sport: q.s || "" };
  if (CUR.name === "sport") return { place: q.st ? stateName(q.st) : (recall("place") || ""), sport: p.key || "" };
  return {};
}

/* The control a filter tap came from, found again in the new page. */
let LAST_CTRL = null;
function ctrlOf(el) {
  const c = el && el.closest && el.closest("a[href], button");
  if (!c || !c.closest("#main")) return null;
  if (c.tagName === "A") return { href: c.getAttribute("href") };
  const attr = [...c.attributes].map((x) => x.name).find((n) => n.startsWith("data-") && !/^data-(open|close|jump|back|share)$/.test(n));
  return attr ? { attr } : (c.id ? { id: c.id } : null);
}
function findCtrl(main, c) {
  const vis = (x) => x && x.offsetParent !== null ? x : null;
  if (c && c.attr) return vis($(`[${c.attr}]`, main));
  if (c && c.id) return vis(document.getElementById(c.id));
  const cur = $$("a[href]", main).find((x) => x.getAttribute("href") === here() && x.offsetParent !== null);
  if (cur) return cur;
  if (c && c.href) return $$("a[href]", main).find((x) => x.getAttribute("href") === c.href && x.offsetParent !== null) || null;
  return null;
}

/* "Show all N": reveal the rest of a row list in place. */
function expandList(id, { quiet = false } = {}) {
  const list = document.getElementById(id);
  if (!list) return null;
  const hidden = $$(":scope > [hidden]", list);
  hidden.forEach((x) => { x.hidden = false; });
  const more = $(`[data-more="${CSS.escape(id)}"]`);
  const n = more ? more.getAttribute("data-count") : list.children.length;
  if (more) more.remove();
  if (!quiet) { if (hidden[0]) hidden[0].focus(); announce("Showing all " + n); }
  return hidden;
}

/* Phone sticky bar: the page pads by its real height, and it steps aside while its
   in-page twin (the same action in the page) is on screen, so one ink button shows at a time. */
let STK_RO = null, STK_IO = null;
function setupSticky(main) {
  if (STK_RO) { STK_RO.disconnect(); STK_RO = null; }
  if (STK_IO) { STK_IO.disconnect(); STK_IO = null; }
  document.body.classList.remove("stk-away");
  const host = $("#sticky"); host.inert = false;
  const bar = $(".stk", host);
  if (!bar) { document.body.style.removeProperty("--stk-h"); return; }
  const setH = () => document.body.style.setProperty("--stk-h", Math.ceil(bar.getBoundingClientRect().height) + "px");
  setH();
  if (window.ResizeObserver) { STK_RO = new ResizeObserver(setH); STK_RO.observe(bar); }
  const twin = $("[data-sticky-twin]", main);
  if (twin && window.IntersectionObserver) {
    STK_IO = new IntersectionObserver(([e]) => {
      const away = e.isIntersecting;
      document.body.classList.toggle("stk-away", away);
      host.inert = away;
    }, { rootMargin: "0px 0px -72px 0px" });
    STK_IO.observe(twin);
  }
}
function centerBars(root) {
  for (const bar of $$(".sbar", root)) {
    const cur = $('[aria-current="true"]', bar);
    if (!cur) continue;
    const item = cur.closest(".sb-item");
    bar.scrollLeft = Math.max(0, item.offsetLeft - (bar.clientWidth - item.offsetWidth) / 2);
  }
}

/* ======================================================================
   Global handlers (set once)
   ====================================================================== */

function jumpTo(id) {
  const t = document.getElementById(id);
  if (!t) return;
  let target = t;
  if (id === "letter") target = $("h2", t) || t;
  if (!target.matches(FOCUSABLE) && !target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  t.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  target.focus({ preventScroll: true });
}

async function doShare(el) {
  const url = el.getAttribute("data-share") && /^https?:|^\//.test(el.getAttribute("data-share")) ? new URL(el.getAttribute("data-share"), location.href).href : location.href.replace(/[?&]share=1/, "");
  const title = document.title;
  if (navigator.share) { try { await navigator.share({ title, url }); return; } catch (e) { if (e && e.name === "AbortError") return; } }
  try { await navigator.clipboard.writeText(url); }
  catch (_) {
    const ta = document.createElement("textarea"); ta.value = url; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (_) {} ta.remove();
  }
  announce("Link copied");
}

function showFieldError(input, msg) {
  const field = input.closest(".field") || input.parentElement;
  input.setAttribute("aria-invalid", "true");
  let id = input.getAttribute("data-err-id");
  if (!id) {
    const slot = (input.getAttribute("aria-describedby") || "").split(/\s+/).map((x) => x && document.getElementById(x)).find((x) => x && x.classList.contains("ferr"));
    if (slot) { id = slot.id; input.setAttribute("data-err-id", id); }
  }
  let p = id && document.getElementById(id);
  if (!p) {
    id = uid("err"); input.setAttribute("data-err-id", id);
    p = document.createElement("p"); p.className = "ferr"; p.id = id;
    (field.classList.contains("field") ? field : input).insertAdjacentElement(field.classList.contains("field") ? "beforeend" : "afterend", p);
    const db = (input.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
    if (!db.includes(id)) input.setAttribute("aria-describedby", [...db, id].join(" "));
  }
  p.hidden = false;
  p.innerHTML = icon("circle-alert", 18) + `<span>${esc(msg)}</span>`;
}
function clearFieldError(input) {
  input.removeAttribute("aria-invalid");
  const id = input.getAttribute("data-err-id"); const p = id && document.getElementById(id);
  if (p) { p.hidden = true; p.textContent = ""; }
}
function labelOf(input) {
  const l = input.id && $(`label[for="${CSS.escape(input.id)}"]`);
  return l ? l.textContent.replace(/\*/g, "").trim() : (input.name || "this field");
}
function validate(form) {
  let first = null;
  const fields = $$("input, select, textarea", form).filter((x) => !x.classList.contains("hp") && !x.classList.contains("hpot") && x.type !== "hidden" && x.type !== "submit");
  const seenRadio = new Set();
  for (const f of fields) {
    let msg = null;
    const v = (f.value || "").trim();
    if (f.type === "radio") {
      if (seenRadio.has(f.name)) continue; seenRadio.add(f.name);
      const group = $$(`input[type=radio][name="${CSS.escape(f.name)}"]`, form);
      if (group.some((r) => r.required) && !group.some((r) => r.checked)) msg = f.getAttribute("data-error") || "Choose one.";
      const target = group[0];
      if (msg) { showFieldError(target, msg); first = first || target; } else clearFieldError(target);
      continue;
    }
    if (f.type === "checkbox") continue;
    if (v && (f.type === "url" || /website|url/i.test(f.name)) && !/^[a-z][a-z0-9+.-]*:/i.test(v) && /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(v)) f.value = "https://" + v;
    const vv = (f.value || "").trim();
    if (f.required && !v) msg = f.getAttribute("data-error") || (f.type === "email" ? "Enter an email address, like name@example.com." : f.tagName === "SELECT" ? `Choose a ${labelOf(f).toLowerCase()}.` : `Fill in ${labelOf(f).toLowerCase()}.`);
    else if (v && f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = f.getAttribute("data-error") || "Enter an email address, like name@example.com.";
    else if (vv && (f.type === "url" || /website|url/i.test(f.name)) && !/^https?:\/\/\S+\.\S+/i.test(vv)) msg = "Enter a website that starts with https://";
    if (msg) { showFieldError(f, msg); first = first || f; } else clearFieldError(f);
  }
  if (first) first.focus();
  return !first;
}
/* ---------- sending forms ---------- */
function formDone(form) {
  const back = form.getAttribute("data-done-href");
  const label = form.getAttribute("data-done-label");
  const panel = document.createElement("div");
  panel.className = "done";
  panel.setAttribute("role", "status");
  panel.setAttribute("tabindex", "-1");
  panel.innerHTML = `<p class="done-title">${icon("check", 22)}<span>${esc(form.getAttribute("data-done") || "Thanks. We got it.")}</span></p>${back ? `<div class="btns">${btn(label || "Back to the directory", back, "line")}</div>` : ""}`;
  form.replaceWith(panel);
  panel.focus({ preventScroll: false });
}

const TS_KEY = "0x4AAAAAADr2WPepRgjp8g-R";
/* Third-party scripts wait their turn, so a slow phone spends its first bandwidth on
   the page itself: the accessibility widget loads once the first page has drawn, the
   spam check (Turnstile) when someone starts a form, or at the latest on send. */
const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const USERWAY_SRC = "https://cdn.userway.org/widget.js";
function loadScript(src, attrs = {}) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement("script");
  s.src = src; s.async = true;
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  document.head.appendChild(s);
}
const ensureTurnstile = () => loadScript(TURNSTILE_SRC);
function turnstileApi() {
  ensureTurnstile();
  return new Promise((res) => {
    const t0 = Date.now();
    (function wait() { if (window.turnstile) return res(window.turnstile); if (Date.now() - t0 > 8000) return res(null); setTimeout(wait, 100); })();
  });
}
/** The form's Turnstile token. It only shows a challenge when Cloudflare asks for one.
    "" when the check could not run; the server then decides (production refuses). */
async function turnstileToken(form) {
  const ts = await turnstileApi();
  if (!ts) return "";
  return new Promise((resolve) => {
    let box = $(".ts-box", form);
    if (!box) { box = document.createElement("div"); box.className = "ts-box"; form.appendChild(box); }
    let settled = false;
    const done = (t) => { if (!settled) { settled = true; resolve(t || ""); } };
    box._done = done;
    if (box._wid == null) {
      box._wid = ts.render(box, {
        sitekey: TS_KEY, appearance: "interaction-only", execution: "execute", size: "flexible",
        callback: (t) => box._done(t), "error-callback": () => { box._done(""); return true; }, "timeout-callback": () => box._done(""),
      });
    } else ts.reset(box._wid);
    ts.execute(box._wid);
    setTimeout(() => done(""), 30000);
  });
}
function formStatus(form) {
  let st = $(".fm-status", form);
  if (!st) {
    st = document.createElement("p"); st.className = "fm-status"; st.setAttribute("role", "status");
    const b = $("button[type=submit]", form);
    (b && b.closest(".fm-submit, .letter-row") || form).insertAdjacentElement("afterend", st);
  }
  return st;
}
async function sendForm(form) {
  const button = $("button[type=submit]", form);
  const status = formStatus(form);
  status.classList.remove("is-err");
  status.textContent = "Sending…";
  if (button) button.disabled = true;
  try {
    const body = {};
    for (const [k, v] of new FormData(form)) { const t = String(v).trim(); if (t) body[k] = t; }
    if (!form._sid) form._sid = crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(16).slice(2);
    body.sid = form._sid;
    body.source = form.getAttribute("data-source") || "asnm-site";
    body.cf_token = await turnstileToken(form);
    const r = await fetch(form.getAttribute("data-send"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const out = await r.json().catch(() => ({}));
    if (!r.ok || !out.ok) { const err = new Error(out.error || ""); err.fromServer = true; throw err; }
    formDone(form);
  } catch (err) {
    status.classList.add("is-err");
    const msg = err && err.fromServer && err.message ? err.message : "We couldn't send that. Check your connection and try again.";
    status.innerHTML = icon("circle-alert", 18) + `<span>${esc(msg)}</span>`;
    if (button) button.disabled = false;
  }
}

async function submitWhere(form, input, sport) {
  const say = (msg) => { if (msg) { showFieldError(input, msg); input.focus(); } else clearFieldError(input); };
  const list = document.getElementById(input.getAttribute("data-suggest"));
  if (list) { list.hidden = true; list.innerHTML = ""; input.setAttribute("aria-expanded", "false"); }
  const dym = $(".dym", form); if (dym) { dym.hidden = true; dym.innerHTML = ""; }
  const text = input.value.trim();
  if (!text && !sport) { say("Enter a city, state, or ZIP code."); return; }
  if (!text && sport) { closeOverlay({ restore: false, mode: "nav" }); nav("/sports/" + sport); return; }
  const w = await resolvePlace(text);
  if (w.kind === "none") {
    say(`We couldn't find "${text}". Try a city and state, like Springfield, IL, or a 5-digit ZIP code.`);
    const opts = await didYouMean(text, sport);
    if (dym && opts.length) { dym.innerHTML = didYouMeanHtml(opts); dym.hidden = false; }
    return;
  }
  say(null);
  closeOverlay({ restore: false, mode: "nav" });
  if (w.kind === "state") nav("/states/" + w.state + (sport ? "?s=" + encodeURIComponent(sport) : ""));
  else nav("/near/" + encodeURIComponent(w.label) + (sport ? "?s=" + encodeURIComponent(sport) : ""));
}

let SUG_T = null;
async function runSuggest(input) {
  const list = document.getElementById(input.getAttribute("data-suggest"));
  if (!list) return;
  const v = input.value;
  const res = v.trim().length >= 2 ? await suggestPlaces(v, 6) : [];
  if (input.value !== v) return;
  list.innerHTML = res.map((r) => `<button type="button" class="sg-item" role="option" aria-selected="false" tabindex="-1" data-sg="${esc(r.label)}" data-for="${esc(input.id)}">${icon(r.href.startsWith("/states") ? "map" : "map-pin", 18)}<span>${esc(r.label)}</span></button>`).join("");
  list.hidden = !res.length;
  input.setAttribute("aria-expanded", String(!!res.length));
  const dym = input.form && $(".dym", input.form); if (dym && res.length) { dym.hidden = true; dym.innerHTML = ""; }
}

function boot() {
  // Persistent drawer (hidden + inert when closed).
  const dr = document.createElement("div");
  dr.innerHTML = `<div id="drawer-scrim" class="dr-scrim" data-close></div><div id="drawer" class="drawer" role="dialog" aria-modal="true" aria-labelledby="dr-h" hidden><div class="dr-head"><h2 id="dr-h" class="sr" tabindex="-1">Menu</h2><a href="/" class="dr-logo" aria-label="Adaptive Sports Near Me, home"><img src="/app/logo.svg" alt="" width="32" height="32"></a><button type="button" class="iconbtn dr-close" data-close aria-label="Close">${icon("x", 24)}</button></div><nav class="dr-list" aria-label="Menu"></nav></div>`;
  while (dr.firstChild) document.body.appendChild(dr.firstChild);
  $("#drawer").inert = true;
  $("#top").innerHTML = header();
  refreshChrome(true);

  const nt = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (!nt || (nt.type !== "reload" && nt.type !== "back_forward")) sessionStorage.setItem("asnm.navs", "0");

  document.addEventListener("click", async (e) => {
    const t = e.target;
    const a = t.closest("a[href]");
    const closeAfter = t.closest("[data-close-after]");
    if (t.closest("[data-skip]")) { e.preventDefault(); $("#main").focus(); return; }
    if (t.closest("[data-dismiss-beta]")) { store.set("asnm.beta", 0); refreshChrome(true); return; }
    if (t.closest("[data-retry]")) { e.preventDefault(); render({ force: true }); return; }
    const op = t.closest("[data-open]");
    if (op) {
      e.preventDefault();
      const w = op.getAttribute("data-open");
      if (w === "search") await openSearch(op.hasAttribute("data-place") ? { place: op.getAttribute("data-place") || "", sport: op.getAttribute("data-sport") || "" } : await pagePreset());
      else if (w === "sports") await openSportsSheet(op.hasAttribute("data-sheet-bar") ? BAR_HREF : null);
      else if (w === "menu") openDrawer();
      pushSheet();
      return;
    }
    if (t.closest("[data-close]")) { e.preventDefault(); closeOverlay(); return; }
    const jp = t.closest("[data-jump]");
    if (jp) { e.preventDefault(); if (OV) closeOverlay({ restore: false }); jumpTo(jp.getAttribute("data-jump")); return; }
    const bk = t.closest("[data-back]");
    if (bk) { e.preventDefault(); backOr(bk.getAttribute("data-back") || "/"); return; }
    const sh = t.closest("[data-share]");
    if (sh) { e.preventDefault(); doShare(sh); return; }
    const more = t.closest("[data-more]");
    if (more) {
      const id = more.getAttribute("data-more");
      if (expandList(id)) {
        // Remember it for this page, so Back from a listing reopens the list.
        const k = "asnm.more." + here();
        try { const o = JSON.parse(sessionStorage.getItem(k) || "[]"); if (!o.includes(id)) o.push(id); sessionStorage.setItem(k, JSON.stringify(o)); } catch (_) {}
      }
      return;
    }
    const tl = t.closest("[data-toggle-list]");
    if (tl) {
      const box = tl.closest(".slist"); const open = !box.classList.contains("is-open");
      box.classList.toggle("is-open", open); tl.setAttribute("aria-expanded", String(open));
      tl.textContent = open ? "Hide the list of states" : "Show all states";
      return;
    }
    const sg = t.closest("[data-sg]");
    if (sg) {
      const input = document.getElementById(sg.getAttribute("data-for"));
      if (input) { input.value = sg.getAttribute("data-sg"); clearFieldError(input); const list = sg.parentElement; list.hidden = true; list.innerHTML = ""; input.setAttribute("aria-expanded", "false"); input.focus(); }
      return;
    }
    const loc = t.closest("[data-locate]");
    if (loc) {
      e.preventDefault();
      const form = loc.closest("form");
      const status = form && $(".wf-status", form);
      const sport = form ? (form._sheet ? form._sheet.sport : form.getAttribute("data-sport") || "") : "";
      if (status) { status.classList.remove("is-err"); status.textContent = "Finding your city…"; }
      loc.disabled = true;
      try {
        const w = await locateMe();
        if (status) status.textContent = "";
        closeOverlay({ restore: false, mode: "nav" });
        nav("/near/" + encodeURIComponent(w.label) + (sport ? "?s=" + encodeURIComponent(sport) : ""));
      } catch (_) {
        if (status) { status.classList.add("is-err"); status.innerHTML = icon("circle-alert", 18) + "<span>We couldn't get your location. Type your city instead.</span>"; }
      } finally { loc.disabled = false; }
      return;
    }
    const pick = t.closest("[data-pick]");
    if (pick) {
      const form = pick.closest("form"); const st = form && form._sheet;
      if (st) { st.sport = pick.getAttribute("data-pick"); $$("[data-pick]", form).forEach((b) => b.setAttribute("aria-pressed", String(b.getAttribute("data-pick") === st.sport))); }
      return;
    }
    if (t.closest("[data-showall]")) {
      const b = t.closest("[data-showall]"); const form = b.closest("form");
      form._sheet.all = true; form._regrid(); b.setAttribute("aria-expanded", "true"); b.hidden = true;
      const firstNew = $$(".ss-tile", form)[12]; if (firstNew) firstNew.focus();
      return;
    }
    if (t.closest("[data-clear]")) {
      const form = t.closest("form"); const st = form._sheet;
      const inp = $("input[name=place]", form); inp.value = ""; clearFieldError(inp);
      st.sport = ""; $$("[data-pick]", form).forEach((b) => b.setAttribute("aria-pressed", String(b.getAttribute("data-pick") === "")));
      const list = $(".suggest", form); list.hidden = true; list.innerHTML = "";
      inp.focus();
      return;
    }
    const bar = t.closest("[data-bar-link]");
    if (bar && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      const href = bar.getAttribute("href");
      const av = $(".av", bar);
      if (av && !reduced()) { av.classList.remove("is-tap"); void av.offsetWidth; av.classList.add("is-tap"); setTimeout(() => nav(href, { replace: true }), 150); }
      else nav(href, { replace: true });
      return;
    }
    if (a) {
      const href = a.getAttribute("href");
      const to = !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !a.target && !a.hasAttribute("download") ? appHref(href) : null;
      if (to) {
        e.preventDefault();
        if (a.hasAttribute("data-replace")) { if (closeAfter) closeOverlay({ restore: false, mode: "nav" }); nav(to, { replace: true }); return; }
        if (closeAfter || (OV && OV.name === "menu")) closeOverlay({ restore: false, mode: "nav" });
        if (a.closest("#main")) { try { sessionStorage.setItem("asnm.last." + here(), href); } catch (_) {} }
        // A map opened from a page is a pushed entry, so closing it can step Back (views/map.js).
        if (/[?&]map=1(&|$)/.test(to)) window.__asnmMapFrom = here();
        nav(to);
      }
    }
  });

  // Starting a form loads the spam check, so it is ready by the time someone presses send.
  const formStart = (e) => { if (e.target.closest && e.target.closest("form[data-send]")) ensureTurnstile(); };
  document.addEventListener("focusin", formStart);
  document.addEventListener("pointerdown", formStart, true);

  // Capture phase: note which control in the page was tapped before any view handler navigates.
  document.addEventListener("click", (e) => { LAST_CTRL = ctrlOf(e.target); }, true);

  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.matches && t.matches("[data-suggest]")) { clearTimeout(SUG_T); SUG_T = setTimeout(() => runSuggest(t), 120); }
    if (t.getAttribute && t.getAttribute("aria-invalid") === "true") clearFieldError(t);
  });

  document.addEventListener("submit", (e) => {
    const f = e.target;
    if (f.matches("form[data-sheet]")) { e.preventDefault(); submitWhere(f, $("input[name=place]", f), f._sheet.sport); return; }
    if (f.matches("form[data-where]")) { e.preventDefault(); submitWhere(f, $("input[name=place]", f), f.getAttribute("data-sport") || ""); return; }
    if (f.matches("form[data-send]")) {
      e.preventDefault();
      const hp = f.querySelector("input.hpot, input.hp, input[name=company]");
      if (hp && hp.value) { formDone(f); return; }
      if (validate(f)) sendForm(f);
    }
  });

  document.addEventListener("keydown", (e) => {
    const t = e.target;
    const input = t.matches && t.matches("[data-suggest]") ? t : (t.closest && t.closest(".suggest") ? document.getElementById(t.getAttribute("data-for")) : null);
    if (input) {
      const list = document.getElementById(input.getAttribute("data-suggest"));
      const opts = list && !list.hidden ? $$(".sg-item", list) : [];
      const i = opts.indexOf(t);
      if (e.key === "ArrowDown" && opts.length) { e.preventDefault(); opts[Math.min(opts.length - 1, i + 1)].focus(); return; }
      if (e.key === "ArrowUp" && opts.length && i >= 0) { e.preventDefault(); (i === 0 ? input : opts[i - 1]).focus(); return; }
      if (e.key === "Escape" && opts.length) { e.preventDefault(); list.hidden = true; list.innerHTML = ""; input.setAttribute("aria-expanded", "false"); input.focus(); return; }
    }
    if (e.key === "Escape" && OV) { e.preventDefault(); closeOverlay(); }
  });

  window.addEventListener("popstate", () => {
    if (SKIP_POP) { SKIP_POP = false; return; }          // our own step back after a sheet closed
    if (SHEET_ENTRY) {
      SHEET_ENTRY = false;
      if (OV && OV.pushed) { closeOverlay({ mode: "pop" }); return; }   // Back closes the sheet; the page stays
    }
    render();
  });
  // Links from the prototype used #/ addresses; they open the same page at its real address.
  if (location.hash.startsWith("#/")) history.replaceState(null, "", location.hash.slice(1));
  render();
}

boot();
