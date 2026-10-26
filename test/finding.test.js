// Phase 2, finding (docs/specs/community-kept-directory.md): the ages chips, a chosen suggestion
// that runs the search, the sport row's order with "More sports", multi-sport organizations under an
// empty sport, "More pickleball in Ohio" holding only pickleball, the events page's "Running this
// season near you", yearly events with no dates left off the list, and no year we can't stand behind.
// The real app (public/app/app.js) runs here on a do-nothing page, the harness of test/check-up.test.js,
// plus document listeners kept so a click can be played through the app's own handler.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ROOT = new URL("../", import.meta.url);
const file = (p) => new URL(p, ROOT);

/* ---------- a page that accepts anything and draws nothing ---------- */
function any() {
  const f = function () {};
  return new Proxy(f, {
    get(t, k) {
      if (k === Symbol.toPrimitive) return () => "";
      if (k === "then") return undefined;
      if (k === Symbol.iterator) return function* () {};
      if (k === "length") return 0;
      return any();
    },
    apply: () => any(), construct: () => any(), set: () => true,
  });
}
const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; };
const doc = any();
const g = globalThis;
const LISTEN = {};
const BY_ID = new Map();
g.window = g;
g.addEventListener = () => {};
g.document = new Proxy({}, {
  get(t, k) {
    if (k === "createElement") return () => new Proxy({ firstChild: null }, { get: (o, j) => (j in o ? o[j] : any()), set: () => true });
    if (k === "querySelectorAll") return () => [];
    if (k === "addEventListener") return (type, fn) => { (LISTEN[type] = LISTEN[type] || []).push(fn); };
    if (k === "getElementById") return (id) => BY_ID.get(id) || null;
    return doc[k];
  },
});
g.location = { pathname: "/__test", search: "", hash: "", href: "https://adaptivesportsnearme.com/__test", origin: "https://adaptivesportsnearme.com" };
const PUSHED = [];
g.history = new Proxy({}, { get: (t, k) => (k === "pushState" || k === "replaceState" ? (s, x, url) => { PUSHED.push(url); } : any()) });
g.localStorage = mem();
g.sessionStorage = mem();
g.matchMedia = () => ({ matches: true, addEventListener() {} });
g.requestAnimationFrame = () => 0;
g.scrollTo = () => {};
g.scrollY = 0;
g.CSS = { escape: (s) => s };
g.FormData = class { constructor(f) { this.f = f; } get() { return null; } *[Symbol.iterator]() {} };

const reply = (body, status = 200) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const LISTINGS = {
  items: [
    // Overland Park, KS area
    { id: id(1), name: "Overland Pickle", key: "pickleball", city: "Overland Park", state: "KS", center: [38.98, -94.67], checked: "2026-10-12", who: ["kids"], seasons: [{ key: "pickleball", seasons: ["spring", "summer", "fall", "winter"] }] },
    { id: id(2), name: "KC Tennis Buddies", key: "tennis", city: "Overland Park", state: "KS", center: [38.98, -94.67], checked: "2026-10-12", who: ["adults"], seasons: [{ key: "tennis", seasons: ["summer"] }] },
    { id: id(3), name: "Prairie Tennis", key: "tennis", city: "Olathe", state: "KS", center: [38.88, -94.82], listed: "2026-10-03" },
    { id: id(4), name: "Lenexa Tennis", key: "tennis", city: "Lenexa", state: "KS", center: [38.95, -94.73] },
    { id: id(5), name: "Fall Runners", key: "running", city: "Overland Park", state: "KS", center: [38.98, -94.67], seasons: [{ key: "running", seasons: ["spring", "fall"] }] },
    { id: id(6), name: "Vets Coffee", key: "veteran-meetup", city: "Overland Park", state: "KS", center: [38.98, -94.67], who: ["veterans"], seasons: [{ key: "veteran-meetup", seasons: ["year-round"] }] },
    { id: id(7), name: "Summer Vets Paddle", key: "veteran-meetup", city: "Olathe", state: "KS", center: [38.88, -94.82], who: ["veterans"], seasons: [{ key: "veteran-meetup", seasons: ["summer"] }] },
    // New Hampshire: multi-sport organizations that haven't said which sports they run, and ones that have
    { id: id(10), name: "Granite Adaptive", key: "multi", city: "Wolfeboro", state: "NH", center: [43.58, -71.2] },
    { id: id(11), name: "Valley Adaptive", key: "multi", state: "NH" },
    { id: id(12), name: "Seacoast Paddlers", key: "multi", trio: ["rowing", "sailing"], city: "Portsmouth", state: "NH", center: [43.07, -70.76] },
    { id: id(13), name: "Told Us Sports", key: "multi", city: "Concord", state: "NH", center: [43.2, -71.54], seasons: [{ key: "cycling", seasons: ["summer"] }] },
    { id: id(14), name: "NH Archery", key: "archery", city: "Concord", state: "NH", center: [43.2, -71.54] },
    { id: id(15), name: "Vermont Multi", key: "multi", city: "Burlington", state: "VT", center: [44.48, -73.21] },
    // Ohio pickleball, and Ohio tennis that doesn't play pickleball
    { id: id(20), name: "Toledo Pickleball", key: "pickleball", city: "Toledo", state: "OH", center: [41.66, -83.58] },
    { id: id(21), name: "Pepper Pike Pickleball", key: "pickleball", city: "Pepper Pike", state: "OH", center: [41.48, -81.46] },
    { id: id(22), name: "Buddy Up Tennis", key: "tennis", city: "Columbus", state: "OH", center: [39.96, -83.0] },
    { id: id(23), name: "Thrive Racquets", key: "multi", trio: ["tennis", "pickleball"], city: "Cleveland", state: "OH", center: [41.5, -81.69] },
  ],
};
let ROUTE = () => null;
g.fetch = (u) => {
  const hit = ROUTE(String(u));
  if (hit) return hit;
  if (u === "/api/listings") return reply(LISTINGS);
  if (u.startsWith("/api/organizations/") && !u.endsWith("/programs")) {
    const x = LISTINGS.items.find((p) => u.endsWith(p.id));
    return x ? reply({ organization: { id: x.id, name: x.name, website: "https://example.org/" } }) : reply({}, 404);
  }
  if (u === "/data/states.json") return reply(JSON.parse(readFileSync(file("public/data/states.json"), "utf8")));
  if (u === "/data/sports.json") return reply(JSON.parse(readFileSync(file("public/data/sports.json"), "utf8")));
  if (u === "/data/places.json") return reply(JSON.parse(readFileSync(file("public/data/places.json"), "utf8")));
  if (u === "/assets/data/zcta.json") return reply(JSON.parse(readFileSync(file("public/assets/data/zcta.json"), "utf8")));
  if (u === "/api/org-auth/session") return reply({ ok: false }, 401);
  return reply({ items: [] });
};

await import(file("public/listing-art.js"));
await import(file("public/app/core.js"));
const A = await import(file("public/app/app.js"));
const near = await import(file("public/app/views/near.js"));
const state = await import(file("public/app/views/state.js"));
const sport = await import(file("public/app/views/sport.js"));
const events = await import(file("public/app/views/events.js"));
const series = await import(file("public/app/views/event-series.js"));
const programPage = await import(file("public/app/views/program.js"));
const D = await A.loadData();

const text = (html) => String(html).replace(/<[^>]+>/g, " ").replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const between = (s, a, b) => { const i = s.indexOf(a); if (i < 0) return ""; const j = s.indexOf(b, i + a.length); return s.slice(i, j < 0 ? undefined : j + b.length); };
const DASH = /[–—]/;
const chipLabels = (html) => [...html.matchAll(/<a class="chip[^"]*"[^>]*>(?:<span class="ic[^>]*>.*?<\/span>|<svg.*?<\/svg>)?<span>([^<]+)<\/span>/g)].map((m) => m[1]);
const FALL = new Date(2026, 9, 26, 12);   // Oct 26, 2026, noon

/* ---------- 1. Who it's for: the ages are always askable ---------- */
test("who chips offer Kids and teens and Adults, even where no listing here says them", () => {
  const html = A.whoChips({ pool: [{ who: ["veterans"] }, { who: [] }], hrefFor: (c) => "/x?w=" + c });
  assert.deepEqual(chipLabels(html), ["Anyone", "Veterans", "Kids and teens", "Adults"]);
  // The old rule stays: a code every listing in the view has filters nothing, so it isn't offered.
  const all = A.whoChips({ pool: [{ who: ["kids"] }, { who: ["kids", "physical"] }], hrefFor: (c) => "/x?w=" + c });
  assert.deepEqual(chipLabels(all), ["Anyone", "Adults", "Physical disabilities"]);
  assert.equal(A.whoChips({ pool: [], hrefFor: (c) => c }), "", "no listings, no row");
});

test("near, state and sport pages put the ages in their Filters", async () => {
  const n = await near.render({ path: "/near/Overland%20Park%2C%20KS", params: { place: "Overland Park, KS" }, query: {}, data: D });
  const fx = between(n.html, '<div class="fx', '<div class="fx-panel');
  assert.match(fx, /data-filters/);
  assert.match(n.html, /Kids and teens/);
  assert.match(n.html, /Adults/);
  assert.doesNotMatch(n.html, /nr-stamp|Cities with programs/, "no state outline box or map legend without a map");
  const on = await near.render({ path: "/near/Overland%20Park%2C%20KS", params: { place: "Overland Park, KS" }, query: { w: "kids", mi: "50" }, data: D });
  assert.match(on.html, /class="fx-n num" aria-hidden="true">2</, "Filters says how many are on");
  const st = await state.render({ path: "/states/KS", params: { st: "KS" }, query: {}, data: D });
  assert.match(st.html, /Kids and teens/);
  const sp = await sport.render({ path: "/sports/tennis", params: { key: "tennis" }, query: {}, data: D });
  assert.match(sp.html, /Kids and teens/);
});

/* ---------- 3. a chosen suggestion is the search ---------- */
test("choosing an autocomplete suggestion runs the search", async () => {
  const form = { _sheet: undefined, matches: (s) => s === "[data-where]", getAttribute: (n) => (n === "data-sport" ? "pickleball" : null), querySelector: () => null };
  const input = { id: "home-where", value: "Overl", form, attrs: { "data-suggest": "home-where-list" }, getAttribute(n) { return this.attrs[n] || null; }, setAttribute(n, v) { this.attrs[n] = v; }, removeAttribute(n) { delete this.attrs[n]; }, focus() { this.focused = true; } };
  BY_ID.set("home-where", input);
  const list = { hidden: false, innerHTML: "<button>…</button>" };
  const sg = { getAttribute: (n) => ({ "data-sg": "Overland Park, KS", "data-for": "home-where" }[n] || null), parentElement: list };
  let prevented = false;
  const e = { target: { closest: (sel) => (sel === "[data-sg]" ? sg : null) }, preventDefault() { prevented = true; } };
  PUSHED.length = 0;
  for (const fn of LISTEN.click || []) await fn(e);
  for (let i = 0; i < 50 && !PUSHED.length; i++) await new Promise((r) => setTimeout(r, 10));
  assert.equal(input.value, "Overland Park, KS");
  assert.equal(list.hidden, true);
  assert.ok(prevented);
  assert.deepEqual(PUSHED.slice(0, 1), ["/near/Overland%20Park%2C%20KS?s=pickleball"], "the pick goes straight to results, with the form's sport");
  // Keyboard: an option is a <button>, so Enter on it is this same click; the app doesn't swallow it.
  const kd = { key: "Enter", target: { matches: () => false, closest: (s) => (s === ".suggest" ? {} : null), getAttribute: () => "home-where" }, preventDefault() { this.stopped = true; } };
  for (const fn of LISTEN.keydown || []) fn(kd);
  assert.ok(!kd.stopped);
});

/* ---------- 4. the sport row ---------- */
test("the sport row: the chosen sport first, then most listings here, then More sports", () => {
  const counts = { tennis: 3, pickleball: 1, running: 1, "veteran-meetup": 2 };
  const keys = Object.keys(counts);
  assert.deepEqual(A.sportRow({ keys, counts }).map((g) => g.key), ["tennis", "veteran-meetup", "pickleball", "running"]);
  assert.deepEqual(A.sportRow({ keys, counts, active: "running" }).map((g) => g.key)[0], "running");
  const html = A.sportBar({ keys, counts, active: "pickleball", hrefFor: (k) => "/near/x" + (k ? "?s=" + k : ""), sheet: true });
  const labels = [...html.matchAll(/<span class="sb-label">([^<]+)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(labels, ["Pickleball", "All", "Tennis", "Veteran meetups", "Running", "More sports"]);
  assert.match(html, /class="sbar is-wrap"/, "it wraps, never a sideways scroll");
  // Past the phone's six, a sport is in "More sports" on phones only.
  const many = Object.fromEntries(["tennis", "pickleball", "running", "basketball", "soccer", "swimming", "golf", "archery"].map((k, i) => [k, 10 - i]));
  const bar = A.sportBar({ keys: Object.keys(many), counts: many, hrefFor: (k) => "/x/" + k, sheet: true });
  assert.match(between(bar, "/x/golf", "</li>"), /./);
  assert.match(bar, /<li class="sb-item is-more"><a class="sb-link" href="\/x\/golf"/);
  assert.doesNotMatch(bar, /<li class="sb-item is-more"><a class="sb-link" href="\/x\/swimming"/);
});

test("near results: pickleball with a listing close by is in the first row of sports", async () => {
  const n = await near.render({ path: "/near/Overland%20Park%2C%20KS", params: { place: "Overland Park, KS" }, query: {}, data: D });
  const bar = between(n.html, '<nav class="sbar', "</nav>");
  const items = [...bar.matchAll(/<li class="sb-item([^"]*)"><a class="sb-link" href="[^"]*"[^>]*>.*?<span class="sb-label">([^<]+)</g)].map((m) => [m[2], m[1].trim()]);
  const pick = items.find(([l]) => l === "Pickleball");
  assert.ok(pick && !pick[1].includes("is-more"), "visible on a phone without a swipe");
  assert.match(bar, /More sports<\/span><\/button><\/li><\/ul>/, "More sports is last");
});

/* ---------- 5. an empty sport offers multi-sport organizations that may run it ---------- */
test("No skiing in New Hampshire: multi-sport organizations there that may offer it, and nobody else", async () => {
  assert.deepEqual(A.mayOffer("skiing", { state: "NH" }).map((p) => p.name), ["Granite Adaptive", "Valley Adaptive"]);
  const out = await state.render({ path: "/states/NH", params: { st: "NH" }, query: { s: "skiing" }, data: D });
  assert.match(out.html, /No skiing listed in New Hampshire yet\./);
  const may = between(out.html, '<section class="sec may"', "</section>");
  assert.match(text(may), /Multi-sport organizations nearby that may offer skiing/);
  assert.match(text(may), /Their websites list what they run; check before you go\./);
  assert.match(may, /href="\/organizations\/00000000-0000-4000-8000-000000000010"/);
  assert.match(may, /Valley Adaptive/);
  for (const not of ["Seacoast Paddlers", "Told Us Sports", "NH Archery", "Vermont Multi"]) assert.ok(!may.includes(not), not + " is not a maybe");
  assert.match(out.html, /Tell us about one/);
  assert.ok(!DASH.test(text(out.html)));
  const sp = await sport.render({ path: "/sports/skiing", params: { key: "skiing" }, query: { st: "NH" }, data: D });
  assert.match(sp.html, /Multi-sport organizations nearby that may offer skiing/);
  assert.equal(A.mayOffer("skiing", { state: "NH", limit: 1 }).length, 1, "at most the limit (6 by default)");
});

/* ---------- 6. More pickleball in Ohio ---------- */
test("a listing's More pickleball in Ohio holds only listings that offer pickleball", async () => {
  const out = await programPage.render({ params: { id: id(20) }, query: {}, data: D, now: FALL });
  const more = between(out.html, '<section class="pg-sec pg-more"', "</section>");
  assert.match(text(more), /More pickleball/);
  assert.match(more, /Pepper Pike Pickleball/);
  assert.match(more, /Thrive Racquets/, "a multi-sport club that names pickleball offers it");
  assert.doesNotMatch(more, /Buddy Up Tennis/);
});

/* ---------- 7. events: nothing dated, so what runs this season near you ---------- */
test("events with no dates: Running this season near you, from the place the site remembers", async () => {
  ROUTE = (u) => (u === "/api/event-series" ? reply({ ok: true, items: [] }) : null);
  localStorage.setItem("asnm.place", JSON.stringify("Overland Park, KS"));
  const past = { id: "e9", title: "Done Day", sportKey: "rowing", city: "Olathe", state: "KS", start: "2026-10-10", end: "2026-10-10" };
  const out = await events.render({ data: { ...D, events: [past] }, now: FALL });
  assert.doesNotMatch(out.html, /Done Day/, "a past date never shows as upcoming");
  const run = between(out.html, '<section class="sec run"', "</section>");
  assert.match(text(run), /Running this season near you/);
  const names = [...run.matchAll(/<h3 class="pr-name">([^<]+)</g)].map((m) => m[1]);
  assert.deepEqual(names.sort(), ["Fall Runners", "Overland Pickle", "Vets Coffee"], "fall or all year; not summer-only");
  assert.ok(!DASH.test(text(out.html)));
  // The veterans Events tab: the same, for veteran listings.
  const vets = await sport.render({ path: "/sports/veteran-meetup", params: { key: "veteran-meetup" }, query: { t: "events" }, data: { ...D, events: [past] }, now: FALL });
  const vr = between(vets.html, '<section class="sec run"', "</section>");
  assert.deepEqual([...vr.matchAll(/<h3 class="pr-name">([^<]+)</g)].map((m) => m[1]), ["Vets Coffee"]);
  // No remembered place: ask for one, with the existing place picker, and stay on the events page.
  localStorage.removeItem("asnm.place");
  const ask = await events.render({ data: { ...D, events: [] }, now: FALL });
  assert.match(between(ask.html, '<section class="sec run"', "</section>"), /data-where data-to="\/events"/);
  assert.equal(A.upcomingEvents([past, { ...past, id: "e10", title: "Today", start: "2026-10-26", end: "2026-10-26" }], FALL).map((e) => e.title).join(), "Today");
  ROUTE = () => null;
});

/* ---------- 8. yearly events with no dates at all ---------- */
const BLANK = { id: "s9", slug: "midwest-sled-hockey-classic", name: "Midwest Sled Hockey Classic", sport_key: "sledhockey", editions: [] };
test("a yearly event with no dates and no usual month is left off the events list", async () => {
  const usual = { id: "s8", slug: "ski-day", name: "Winter Ski Day", sport_key: "skiing", usual_month: 2, editions: [] };
  const html = events.yearlySection([BLANK, usual], FALL);
  assert.match(html, /ski-day/);
  assert.doesNotMatch(html, /midwest-sled-hockey-classic/);
  assert.equal(events.yearlySection([BLANK], FALL), "");
});

test("its own page says the next dates aren't announced, never a year, and asks for them", () => {
  const out = series.seriesHtml(BLANK, D, FALL);
  assert.match(text(out.html), /The next dates aren't announced yet\./);
  assert.doesNotMatch(text(out.html), /\b20\d\d dates\b/);
  assert.match(text(out.html), /Know the dates\? Tell us/);
  assert.doesNotMatch(text(out.html), /next year's/);
});

/* ---------- 11. one freshness word ---------- */
test("cards and rows say Checked, one word, and a listing never checked says when it was listed", () => {
  assert.match(A.freshText({ lastChecked: "2026-10-12" }), /^Checked\sOct\s12$/);
  assert.match(A.freshText({ listedAt: "2026-10-03" }), /^Listed\sOct\s3$/);
  assert.match(A.trust({ verified: false, lastChecked: "2026-10-12" }, "sticky"), /Checked/);
  assert.doesNotMatch(A.trust({ verified: false, lastChecked: "2026-10-12" }, "sticky"), /Website checked|Listed/);
});

/* ---------- 10. state tiles ---------- */
test("state tiles are at least 44 by 44 on phones, A to Z in the page", () => {
  const css = readFileSync(file("public/app/app.css"), "utf8");
  const phone = between(css, "/* State tiles: at least 44 by 44", "\n}\n");
  assert.match(phone, /minmax\(44px, 1fr\)/);
  assert.match(phone, /min-height: 44px/);
  const tiles = [...A.tileMap({ list: "none" }).matchAll(/aria-label="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(tiles, tiles.slice().sort((a, b) => a.localeCompare(b)));
});
