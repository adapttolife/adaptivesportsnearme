// Seasons and yearly events in the browser (docs/specs/programs-that-come-back.md):
// an organization's own sports and seasons, the yearly event page in both of its states,
// the events page's Yearly events, the run-mode checklist on Confirm your listing, and
// the card of a year that belongs to a yearly event. The app (public/app/app.js) runs here
// on a do-nothing page: enough DOM for it to load, so the real views draw real HTML.
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
g.window = g;
g.addEventListener = () => {};
g.document = new Proxy({}, {
  get(t, k) {
    if (k === "createElement") return () => new Proxy({ firstChild: null }, { get: (o, j) => (j in o ? o[j] : any()), set: () => true });
    if (k === "querySelectorAll") return () => [];
    return doc[k];
  },
});
g.location = { pathname: "/__test", search: "", hash: "", href: "https://adaptivesportsnearme.com/__test", origin: "https://adaptivesportsnearme.com" };
g.history = any();
g.localStorage = mem();
g.sessionStorage = mem();
g.matchMedia = () => ({ matches: true, addEventListener() {} });
g.requestAnimationFrame = () => 0;
g.scrollTo = () => {};
g.scrollY = 0;
g.CSS = { escape: (s) => s };

const reply = (body, status = 200) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });
const ORG = "0b9c2a7e-1d2f-4e3a-9b8c-7d6e5f4a3b2c";
const LISTINGS = {
  items: [
    { id: ORG, name: "Cincy Adaptive Sports", key: "multi", trio: ["skiing", "tennis", "sailing"], more: 1, city: "Cincinnati", state: "OH",
      seasons: [{ key: "skiing", seasons: ["winter"] }, { key: "tennis", seasons: ["spring", "summer", "fall", "winter"] }, { key: "sailing", seasons: ["summer"] }, { key: "pickleball", seasons: [] }] },
    { id: "11111111-2222-4333-8444-555555555555", name: "River City Tennis", key: "tennis", city: "Louisville", state: "KY" },
  ],
};
let ROUTE = () => null;
g.fetch = (u) => {
  const hit = ROUTE(String(u));
  if (hit) return hit;
  if (u === "/api/listings") return reply(LISTINGS);
  if (u === "/api/events") return reply({ items: [{ id: "e1", title: "Spooky Spokes 2027", sport_key: "pickleball", city: "Cincinnati", state: "OH", url: null, starts_at: "2027-10-22", ends_at: "2027-10-24", all_day: 1, program_id: "5b0a3c2e-7d1f-4c55-9a51-3f0b6c2a8e01", recap_url: null, series: { slug: "spooky-spokes", name: "Spooky Spokes", first_year: 2024 } }] });
  if (u === "/data/states.json") return reply(JSON.parse(readFileSync(file("public/data/states.json"), "utf8")));
  if (u === "/data/sports.json") return reply(JSON.parse(readFileSync(file("public/data/sports.json"), "utf8")));
  return reply({ items: [] });
};

await import(file("public/listing-art.js"));
await import(file("public/app/core.js"));
const A = await import(file("public/app/app.js"));
const { listingSport } = await import(file("public/app/listing-sport.js"));
const SC = await import(file("public/app/sport-checklist.js"));
const forms = await import(file("public/app/views/forms.js"));
const series = await import(file("public/app/views/event-series.js"));
const programPage = await import(file("public/app/views/program.js"));
const programDetail = await import(file("public/app/views/program-detail.js"));
const manage = await import(file("public/app/views/manage.js"));
const admin = await import(file("public/app/views/admin.js"));
const events = await import(file("public/app/views/events.js"));
const D = await A.loadData();

/* ---------- Spooky Spokes, as the API sends it ---------- */
const SITE = "https://thepicklelodge.com/blogs/programming-at-the-pickle-lodge/tournaments";
const edition = (y, from, to, city, recap) => ({ id: `ed-${y}`, title: `Spooky Spokes ${y}`, starts_at: `${y}-10-${from}`, ends_at: `${y}-10-${to}`, all_day: 1, venue: null, city, state: "OH", url: null, recap_url: recap, status: "published" });
const SPOOKY = () => ({
  id: "series-1", slug: "spooky-spokes", name: "Spooky Spokes", org_id: null, host_name: "The Pickle Lodge", organization: null, sport_key: "pickleball",
  description: "Spooky Spokes is the wheelchair division of Monster Smash, The Pickle Lodge's Halloween pickleball tournament in the Cincinnati area.",
  venue: null, city: "Cincinnati", state: "OH", url: SITE, usual_month: 10, first_year: 2024,
  editions: [
    edition(2024, 25, 27, "West Chester", "https://pickleballtournaments.com/tournaments/monster-smash-2024/events"),
    edition(2025, 24, 26, "West Chester", "https://pickleballtournaments.com/tournaments/monster-smash-2025/events"),
    edition(2026, 23, 25, "Cincinnati", "https://pickleballtournaments.com/tournaments/monster-smash-2026-a-frighteningly-fun-tournament/events"),
  ],
});
const NOV_2026 = new Date(2026, 10, 10);
const DASH = /[–—]/;
const text = (html) => html.replace(/<[^>]+>/g, (tag) => (/^<\/?(span|b|a|svg|path|small)\b/.test(tag) ? "" : " ")).replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();

test("an organization's own sports pick its picture: one is that sport, two or more draw together", () => {
  assert.deepEqual(listingSport({ sportLabel: "Adaptive Tennis", seasons: [{ key: "tennis", seasons: ["summer"] }] }), { key: "tennis", trio: null, more: 0 });
  // One added sport doesn't turn a listing whose own sport we don't know into that sport.
  assert.deepEqual(listingSport({ sportLabel: "Multi-Sport", seasons: [{ key: "skiing", seasons: ["winter"] }] }), { key: "multi", trio: null, more: 0 });
  assert.deepEqual(listingSport({ seasons: [{ key: "pickleball" }] }), { key: "multi", trio: null, more: 0 });
  // Group scenes go last in the trio, the rest are counted.
  const many = listingSport({ sportLabel: "Tennis", seasons: [{ key: "soccer" }, { key: "skiing" }, { key: "tennis" }, { key: "sailing" }, { key: "golf" }] });
  assert.deepEqual(many, { key: "multi", trio: ["tennis", "skiing", "sailing"], more: 2 });   // its own sport leads
  // A sport added on the card joins the ones its description already names (Maine Adaptive, 2026-10-26).
  const maine = listingSport({ sportLabel: "Multi-Sport", desc: "Sports and activities: Alpine skiing; sailing. Athletes served: Adults.", seasons: [{ key: "pickleball", seasons: ["summer"] }] });
  assert.deepEqual(maine, { key: "multi", trio: ["skiing", "sailing", "pickleball"], more: 0 });
  // Keys we don't know, and Multi-sport itself, are not sports.
  assert.deepEqual(listingSport({ sportLabel: "Adaptive Tennis", seasons: [{ key: "quidditch" }, { key: "multi" }] }), listingSport({ sportLabel: "Adaptive Tennis" }));
  // Without seasons, nothing changes.
  assert.equal(listingSport({ sportLabel: "Adaptive Tennis" }).key, "tennis");
});

test("search by sport finds an organization under every sport it told us, past the three drawn", () => {
  const org = D.byId.get(ORG);
  assert.deepEqual(org.seasons.map((s) => s.key), ["skiing", "tennis", "sailing", "pickleball"]);
  assert.ok(A.sportsOf(org).includes("pickleball"));
  assert.ok(A.offers(org, "pickleball") && A.offers(org, "sailing"));
  assert.ok(!A.offers(org, "golf"));
  assert.ok(D.countByKey.pickleball >= 1, "the sport counts include it");
  // A listing that hasn't told us is as before.
  const plain = D.byId.get("11111111-2222-4333-8444-555555555555");
  assert.equal(plain.seasons, null);
  assert.deepEqual(A.sportsOf(plain), ["tennis"]);
});

test("a year of a yearly event links to the event's page and says which year it is", () => {
  const card = A.eventCard({ title: "Spooky Spokes 2026", sportKey: "pickleball", city: "Cincinnati", state: "OH", start: "2026-10-23", series: { slug: "spooky-spokes", name: "Spooky Spokes", firstYear: 2024 } });
  assert.match(card, /<h3 class="ec-name"><a href="\/events\/spooky-spokes">Spooky Spokes 2026<\/a><\/h3>/);
  assert.match(card, /<p class="ec-nth">3rd annual<\/p>/);
  // No first year: a link, but never a guessed number.
  const unnumbered = A.eventCard({ title: "Ski Day", start: "2026-02-01", series: { slug: "ski-day", firstYear: null } });
  assert.match(unnumbered, /href="\/events\/ski-day"/);
  assert.doesNotMatch(unnumbered, /annual/);
  // A one-time event is as before.
  const once = A.eventCard({ title: "Clinic", start: "2026-11-01" });
  assert.doesNotMatch(once, /\/events\/|annual/);
});

test("the sports checklist posts one object, and Year-round means all four seasons", () => {
  const box = (data, checked) => ({ dataset: data, checked });
  const list = SC.collect([
    box({ sport: "skiing" }, true), box({ of: "skiing", season: "winter" }, true), box({ of: "skiing", season: "spring" }, false),
    box({ sport: "tennis" }, true), box({ of: "tennis", season: "year-round" }, true),
    box({ sport: "sailing" }, false), box({ of: "sailing", season: "summer" }, true),   // unticked sport: its seasons don't count
    box({ sport: "pickleball" }, true),
  ]);
  assert.deepEqual(list, [{ key: "skiing", seasons: ["winter"] }, { key: "tennis", seasons: ["spring", "summer", "fall", "winter"] }, { key: "pickleball", seasons: [] }]);
  assert.equal(SC.sportsValue(list), '{"skiing":["winter"],"tennis":["spring","summer","fall","winter"],"pickleball":[]}');
  assert.equal(SC.sportsValue([]), "");
  // Yearly events: up to three, named ones only, a bare domain gets https.
  const yearly = SC.collectYearly([{ name: " Spooky  Spokes ", month: "10", url: "thepicklelodge.com/tournaments" }, { name: "", month: "2" }, { name: "Ski Day", month: "", url: "" }, { name: "C" }, { name: "D" }]);
  assert.deepEqual(yearly, [{ name: "Spooky Spokes", month: 10, url: "https://thepicklelodge.com/tournaments" }, { name: "Ski Day", month: null, url: null }, { name: "C", month: null, url: null }]);
  assert.equal(JSON.parse(SC.yearlyValue(yearly)).length, 3);
  // Prefill: its own word first, else its listed sports, else its one sport.
  assert.deepEqual(SC.chosenFrom({ sport_seasons_json: '{"sailing":["summer"]}', sport_key: "tennis" }), [{ key: "sailing", seasons: ["summer"] }]);
  assert.deepEqual(SC.chosenFrom({ sports_json: '["golf","tennis"]', sport_key: "golf" }), [{ key: "golf", seasons: [] }, { key: "tennis", seasons: [] }]);
  assert.deepEqual(SC.chosenFrom({ sport_key: "several" }), []);
});

test("the checklist is real checkboxes with labels, grouped, each sport's seasons in its own fieldset", () => {
  const html = SC.checklistHtml({ keys: ["skiing", "tennis", "amputeesports", "multi"], nameOf: A.sportName, chosen: [{ key: "skiing", seasons: ["winter"] }] });
  assert.match(html, /role="group" aria-labelledby="sck\d+-winter"><p class="sck-gh" id="sck\d+-winter">Winter<\/p>/);
  assert.match(html, />Court and racket</);
  assert.match(html, />Other</);
  assert.doesNotMatch(html, /data-sport="multi"/);
  assert.match(html, /<label class="sck-sport is-on"><input type="checkbox" data-sport="skiing" checked><span>Skiing<\/span><\/label>/);
  assert.match(html, /<fieldset class="sck-row" data-row="skiing"><legend>Skiing<\/legend>/);
  assert.match(html, /<fieldset class="sck-row" data-row="tennis" hidden>/);
  assert.match(html, /data-of="skiing" data-season="winter" checked><span>Winter/);
  assert.match(html, /data-season="year-round"><span>Year-round/);
  assert.doesNotMatch(html, /\sname="/, "nothing posts on its own");
});

test("Confirm your listing, run mode: sports and yearly events, two posted fields, the note optional", async () => {
  const out = await forms.render({ path: `/update/${ORG}`, params: { id: ORG }, query: { rel: "run" }, data: D });
  const h = out.html;
  assert.match(h, /<input type="radio" name="rel" value="run" checked>/, "?rel=run preselects the answer");
  assert.match(h, /<fieldset class="fm-set fm-sports"><legend>Your sports<\/legend>/);
  assert.match(h, /<fieldset class="fm-set fm-yearly"><legend>Yearly events<\/legend>/);
  assert.match(h, /<div class="fm-run" data-run>/);
  assert.match(h, /<input type="hidden" name="sports" value=""><input type="hidden" name="yearly" value="">/);
  assert.match(h, /data-sport="pickleball" checked/, "every sport it told us is ticked");
  assert.match(h, /data-of="tennis" data-season="year-round" checked/);
  assert.match(h, /Anything else to fix\? \(optional\)<\/label>/);
  assert.doesNotMatch(between(h, "fm-notes", "</textarea>"), /required/);
  assert.ok(h.indexOf("fm-yearly") < h.indexOf("fm-notes"), "the note comes after the sports and events");
  assert.match(h, /data-yearly-add/);
  // Without rel=run the fix form is as before, the run sets there but hidden.
  const fix = (await forms.render({ path: `/update/${ORG}`, params: { id: ORG }, query: {}, data: D })).html;
  assert.match(fix, /<div class="fm-run" data-run hidden>/);
  assert.match(between(fix, "fm-notes", "</textarea>"), /required/);
  assert.match(fix, /What should we fix\?/);
  assert.ok(!DASH.test(text(h)), "no dashes");
});

function between(s, a, b) { const i = s.indexOf(a); return s.slice(i, s.indexOf(b, i)); }

test("the yearly event page, between years: since when, usually when, and that the dates aren't out", async () => {
  ROUTE = (u) => (u === "/api/event-series/spooky-spokes" ? reply({ ok: true, series: SPOOKY() }) : null);
  const out = await series.render({ params: { slug: "spooky-spokes" }, data: D, now: NOV_2026 });
  const t = text(out.html);
  assert.match(out.html, /<h1 tabindex="-1">Spooky Spokes<\/h1>/);
  assert.match(t, /Pickleball · Cincinnati, OH · Hosted by The Pickle Lodge/);
  assert.match(t, /Every year since 2024\. Usually late October\. The 2027 dates aren't announced yet\./);
  assert.match(out.html, new RegExp(`href="${SITE}"[^>]*target="_blank"[^>]*><span>Visit their website`));
  // Past years, newest first, each with the host's results page and never anyone's name.
  const past = between(out.html, '<ol class="es-years">', "</ol>");
  assert.deepEqual([...past.matchAll(/<b class="es-y num">(\d{4})<\/b>/g)].map((m) => m[1]), ["2026", "2025", "2024"]);
  assert.match(past, /Oct 23 to 25, 2026/);
  assert.match(past, /West Chester, OH/);
  assert.equal((past.match(/Results and photos/g) || []).length, 3);
  assert.match(out.html, /<a href="\/add\/event">Tell us<\/a>/);
  assert.match(out.html, /class="letter"/);
  assert.equal(out.railActive, "events");
  assert.match(out.title, /^Spooky Spokes, Cincinnati, OH · /);
  assert.match(out.description, /hosted by The Pickle Lodge in Cincinnati, OH, usually in late October\./);
  for (const s of [t, out.title, out.description]) assert.ok(!DASH.test(s), s);
});

test("the yearly event page, dates set: which year it is, the dates and Register", async () => {
  const s = SPOOKY();
  s.editions.push({ ...edition(2027, 22, 24, "Cincinnati", null), url: "https://pickleballtournaments.com/tournaments/monster-smash-2027" });
  ROUTE = (u) => (u === "/api/event-series/spooky-spokes" ? reply({ ok: true, series: s }) : null);
  const out = await series.render({ params: { slug: "spooky-spokes" }, data: D, now: NOV_2026 });
  const t = text(out.html);
  assert.match(t, /4th annual · Oct 22 to 24, 2027/);
  assert.match(out.html, /href="https:\/\/pickleballtournaments\.com\/tournaments\/monster-smash-2027"[^>]*><span>Register/);
  assert.doesNotMatch(t, /aren't announced/);
  // The week of the event it's still next: "3rd annual", not past yet.
  ROUTE = (u) => (u === "/api/event-series/spooky-spokes" ? reply({ ok: true, series: SPOOKY() }) : null);
  const during = await series.render({ params: { slug: "spooky-spokes" }, data: D, now: new Date(2026, 9, 24) });
  assert.match(text(during.html), /3rd annual · Oct 23 to 25, 2026/);
  // A host in the directory is linked.
  const hosted = { ...SPOOKY(), organization: { id: ORG, name: "Cincy Adaptive Sports" } };
  ROUTE = (u) => (u === "/api/event-series/spooky-spokes" ? reply({ ok: true, series: hosted }) : null);
  const linked = await series.render({ params: { slug: "spooky-spokes" }, data: D, now: NOV_2026 });
  assert.match(linked.html, new RegExp(`Hosted by <a href="/organizations/${ORG}">Cincy Adaptive Sports</a>`));
});

test("a yearly event we don't have is a not-found page", async () => {
  ROUTE = (u) => (u.startsWith("/api/event-series/") ? reply({ ok: false }, 404) : null);
  const out = await series.render({ params: { slug: "no-such-event" }, data: D, now: NOV_2026 });
  assert.match(out.html, /We couldn't find that event/);
  assert.match(out.html, /href="\/events"/);
});

test("the events page lists yearly events by when they come round next, and is calm without dated ones", async () => {
  const ski = { id: "s2", slug: "ski-day", name: "Winter Ski Day", host_name: "Snow Club", sport_key: "skiing", city: "Boyne", state: "MI", url: "https://example.org/ski", usual_month: 2, first_year: null, editions: [] };
  const spring = { id: "s3", slug: "spring-sail", name: "Spring Sail", host_name: "Lake Club", sport_key: "sailing", city: "Chicago", state: "IL", url: null, usual_month: 5, first_year: 2020, editions: [] };
  ROUTE = (u) => (u === "/api/event-series" ? reply({ ok: true, items: [spring, SPOOKY(), ski] }) : null);
  const out = await events.render({ data: { ...D, events: [] }, now: NOV_2026 });
  const yearly = between(out.html, '<section class="ev-yearly"', "</section>");
  assert.deepEqual([...yearly.matchAll(/<a href="\/events\/([a-z-]+)">/g)].map((m) => m[1]), ["ski-day", "spring-sail", "spooky-spokes"]);
  assert.match(text(yearly), /Spooky Spokes Pickleball · Cincinnati, OH Usually late October Dates not announced yet/);
  assert.match(text(yearly), /Usually in February/);
  assert.doesNotMatch(out.html, /No events posted yet/, "the big empty state isn't the page when yearly events are there");
  assert.match(out.html, /No dated events right now/);
  assert.ok(!DASH.test(text(out.html)));
  // No yearly events (or a server without them yet): the page is as it was.
  ROUTE = (u) => (u === "/api/event-series" ? reply({ ok: true, items: [] }) : null);
  const none = await events.render({ data: { ...D, events: [] }, now: NOV_2026 });
  assert.match(none.html, /No events posted yet/);
  assert.doesNotMatch(none.html, /ev-yearly/);
  ROUTE = (u) => (u === "/api/event-series" ? Promise.reject(new Error("offline")) : null);
  const down = await events.render({ data: { ...D, events: [] }, now: NOV_2026 });
  assert.match(down.html, /No events posted yet/);
  ROUTE = () => null;
});

/* ---------- round 2: programs that come back (docs/specs/programs-that-come-back.md) ---------- */
const LODGE = "5b0a3c2e-7d1f-4c55-9a51-3f0b6c2a8e00";

test("a dated year carries its program, and its card links to the yearly page", () => {
  const e = D.events.find((x) => x.id === "e1");
  assert.equal(e.programId, "5b0a3c2e-7d1f-4c55-9a51-3f0b6c2a8e01");
  assert.equal(e.series.slug, "spooky-spokes");
  assert.match(A.eventCard(e), /href="\/events\/spooky-spokes"[\s\S]*4th annual/);
});

test("the yearly event page links its host from the API, loaded directory or not", async () => {
  const hosted = { ...SPOOKY(), organization: { id: LODGE, name: "The Pickle Lodge" } };
  ROUTE = (u) => (u === "/api/event-series/spooky-spokes" ? reply({ ok: true, series: hosted }) : null);
  const out = await series.render({ params: { slug: "spooky-spokes" }, data: D, now: NOV_2026 });
  assert.match(out.html, new RegExp(`Hosted by <a href="/organizations/${LODGE}">The Pickle Lodge</a>`));
  ROUTE = () => null;
});

test("a sport with its own program stays ticked and fixed, and still goes in the answer", () => {
  const html = SC.checklistHtml({ keys: ["skiing", "tennis"], nameOf: A.sportName, chosen: [{ key: "tennis", seasons: ["summer"] }], locked: ["skiing"] });
  assert.match(html, /<label class="sck-sport is-on is-locked"><input type="checkbox" data-sport="skiing" checked disabled aria-describedby="(sck\d+-lock-skiing)"><svg class="sck-lock-ic"[^]*?<\/svg><span>Skiing<small class="sck-lock" id="\1">Has its own program\. Manage it under Programs\.<\/small>/);
  assert.match(html, /<fieldset class="sck-row" data-row="skiing">/, "its seasons still change here");
  // A disabled box that's ticked is still part of the complete list.
  const list = SC.collect([{ dataset: { sport: "skiing" }, checked: true, disabled: true }, { dataset: { sport: "tennis" }, checked: true }, { dataset: { of: "tennis", season: "summer" }, checked: true }]);
  assert.equal(SC.sportsValue(list), '{"skiing":[],"tennis":["summer"]}');
  // One program's seasons: the chips on their own, posted as an array.
  const solo = SC.seasonsFieldHtml({ seasons: ["winter"] });
  assert.match(solo, /<fieldset class="sck-row sck-solo" data-seasons><legend>When it runs<\/legend>/);
  assert.match(solo, /data-of="_" data-season="winter" checked/);
  assert.deepEqual(SC.collectSeasons([{ dataset: { season: "year-round" }, checked: true }]), ["spring", "summer", "fall", "winter"]);
  assert.deepEqual(SC.collectSeasons([{ dataset: { season: "fall" }, checked: true }, { dataset: { season: "spring" }, checked: true }, { dataset: { season: "winter" }, checked: false }]), ["spring", "fall"]);
});

async function withPath(path, run) {
  const before = g.location.pathname;
  g.location.pathname = path;
  try { return await run(); } finally { g.location.pathname = before; }
}

test("the organization's editor: the complete checklist, own programs locked, and the warning", async () => {
  ROUTE = (u) => {
    if (u === "/api/org-auth/session") return reply({ ok: true, organizations: [{ id: ORG, name: "Cincy Adaptive Sports" }] });
    if (u === `/api/organizations/${ORG}/manage`) return reply({ ok: true, organization: { id: ORG, name: "Cincy Adaptive Sports", is_public: 1, sport_seasons_json: '{"skiing":["winter"],"sailing":["summer"]}', own_program_sports: ["skiing"] } });
    return null;
  };
  const out = await withPath(`/manage/organizations/${ORG}/edit`, () => manage.render({ data: D }));
  assert.match(out.html, /Tick every sport you run\. A sport you untick comes off your listing\./);
  assert.match(out.html, /data-sport="skiing" checked disabled/);
  assert.match(out.html, /data-sport="sailing" checked>/);
  assert.doesNotMatch(out.html, /name="sport"/, "no single Primary sport any more");
  ROUTE = () => null;
});

test("manage: a program has its seasons, the list says them, a yearly event links to its page", async () => {
  ROUTE = (u) => {
    if (u === "/api/org-auth/session") return reply({ ok: true, organizations: [{ id: ORG, name: "Cincy Adaptive Sports" }] });
    if (u === `/api/organizations/${ORG}/manage`) return reply({ ok: true, organization: { id: ORG, name: "Cincy Adaptive Sports" } });
    if (u === `/api/organizations/${ORG}/manage/programs`) return reply({ ok: true, items: [
      { id: "p1", name: "Adaptive skiing", city: "Lebanon", seasons_json: '["winter"]', kind: "program", is_public: 1 },
      { id: "p2", name: "Tennis", city: null, seasons_json: '["spring","summer","fall","winter"]', kind: "program", is_public: 1 },
      { id: "p3", name: "Spooky Spokes", seasons_json: null, kind: "event", is_public: 1 },
    ] });
    if (u === `/api/organizations/${ORG}/manage/events`) return reply({ ok: true, items: [{ id: "ev1", title: "Spooky Spokes 2026", starts_at: "2026-10-23T00:00:00Z", program_id: "p3", first_year: 2024, series_slug: "spooky-spokes", recap_url: "https://example.org/results", is_public: 1 }] });
    return null;
  };
  const list = await withPath(`/manage/organizations/${ORG}/programs`, () => manage.render({ data: D }));
  assert.match(list.html, /<b>Adaptive skiing<\/b><small>Lebanon · Winter<\/small>/);
  assert.match(list.html, /<b>Tennis<\/b><small>Year-round<\/small>/);
  assert.doesNotMatch(list.html, /Spooky Spokes/, "a yearly event is managed under Events");
  const edit = await withPath("/manage/programs/p1", () => manage.render({ data: D }));
  assert.match(edit.html, /data-seasons><legend>When it runs<\/legend>[\s\S]*data-season="winter" checked/);
  const ev = await withPath("/manage/events/ev1", () => manage.render({ data: D }));
  assert.match(ev.html, /name="yearly" type="checkbox" role="switch" value="1" checked/);
  assert.match(ev.html, /<a class="tlink" href="\/events\/spooky-spokes">See its yearly page/);
  assert.match(ev.html, /name="first_year"[^>]*value="2024"/);
  assert.match(ev.html, /name="recap_url" type="url" value="https:\/\/example\.org\/results"/);
  ROUTE = () => null;
});

test("the organization page: programs with their seasons, yearly events, and its history", async () => {
  ROUTE = (u) => {
    if (u === `/api/organizations/${ORG}`) return reply({ organization: { id: ORG, name: "Cincy Adaptive Sports", desc: "Adaptive sports in Cincinnati.", history: { listedSince: "2025-03", updatedByOrganization: "2026-10" } } });
    if (u === `/api/organizations/${ORG}/programs`) return reply({ items: [
      { id: "p1", name: "Adaptive skiing", sport: "skiing", sportLabel: "Skiing", seasons: [{ key: "skiing", seasons: ["winter"] }], kind: "program", listing: "with_org" },
      { id: "p2", name: "Wheelchair tennis", sport: "tennis", sportLabel: "Tennis", seasons: [{ key: "tennis", seasons: ["spring", "summer", "fall", "winter"] }], kind: "program", listing: "own" },
      { id: "p4", name: "Sailing", sport: "sailing", sportLabel: "Sailing", seasons: [{ key: "sailing", seasons: [] }] },
    ] });
    if (u === `/api/event-series?org=${ORG}`) return reply({ ok: true, items: [{ ...SPOOKY(), organization: { id: ORG, name: "Cincy Adaptive Sports" } }] });
    if (u === "/api/org-auth/session") return reply({ ok: false }, 401);
    return null;
  };
  const out = await programPage.render({ params: { id: ORG }, data: D, now: NOV_2026 });
  const t = text(out.html);
  assert.match(t, /Programs Adaptive skiing Skiing · Winter Wheelchair tennis Tennis · Year-round Sailing Sailing/);
  assert.match(t, /Yearly events Spooky Spokes Usually late October\. Dates not announced yet/);
  const hist = between(out.html, '<section class="pg-sec pg-hist"', "</section>");
  assert.match(text(hist), /History On Adaptive Sports Near Me since March 2025 Last updated by the organization, October 2026 Spooky Spokes: every October since 2024\. Past years: 2024, 2025, 2026\./);
  assert.match(hist, /<a href="\/events\/spooky-spokes">Spooky Spokes<\/a>/);
  assert.ok(!DASH.test(t));
  assert.equal(programPage.monthYear("2025-03"), "March 2025");
  assert.equal(programPage.monthYear(null), "");
  ROUTE = () => null;
});

test("a program page says when it runs; a yearly event's program goes to its yearly page", async () => {
  assert.equal(programDetail.runsText({ seasons: [{ key: "skiing", seasons: ["winter"] }] }), "Runs in winter");
  assert.equal(programDetail.runsText({ seasons: [{ key: "sailing", seasons: ["summer", "fall"] }] }), "Runs in summer and fall");
  assert.equal(programDetail.runsText({ seasons: [{ key: "tennis", seasons: ["spring", "summer", "fall", "winter"] }] }), "Runs year-round");
  assert.equal(programDetail.runsText({ seasons: [{ key: "golf", seasons: [] }] }), "");
  assert.equal(programDetail.runsText({}), "");
  ROUTE = (u) => (u === "/api/programs/p1" ? reply({ program: { id: "p1", name: "Adaptive skiing", sport: "skiing", sportLabel: "Skiing", city: "Lebanon", state: "OH", seasons: [{ key: "skiing", seasons: ["winter"] }], kind: "program" } }) : null);
  const page = await programDetail.render({ params: { id: "p1" } });
  assert.match(page.html, /<dt>When<\/dt><dd>Runs in winter<\/dd>/);
  const navs = [];
  const prev = g.history;
  g.history = { replaceState: (s, t, to) => navs.push(to), pushState: () => {}, back: () => {} };
  ROUTE = (u) => (u === "/api/programs/p3" ? reply({ program: { id: "p3", name: "Spooky Spokes", kind: "event", slug: "spooky-spokes" } }) : null);
  const moved = await programDetail.render({ params: { id: "p3" } });
  assert.equal(moved.html, "");
  assert.deepEqual(navs, ["/events/spooky-spokes"]);
  g.history = prev;
  ROUTE = () => null;
});

test("admin: an organization's activity reads as a timeline, team only", () => {
  const html = admin.activityItems([
    { id: "a4", kind: "note", summary: "Emailed Oct 26 about winter dates", actor: "team@adaptivesportsnearme.com", created_at: "2026-10-26T15:02:00Z" },
    { id: "a3", kind: "applied", summary: "Sports: Skiing (winter), Tennis (year-round)", actor: "reviewer@adaptivesportsnearme.com", created_at: "2026-10-20T10:00:00Z" },
    { id: "a2", kind: "confirmation", summary: "Confirmed its listing and sent 2 sports", actor: null, created_at: "2026-10-19T09:00:00Z" },
    { id: "a1", kind: "self_edit", summary: "Changed its website", actor: "info@example.org", created_at: "2026-09-02T09:00:00Z" },
  ]);
  assert.deepEqual([...html.matchAll(/<b>([^<]+)<\/b>/g)].map((m) => m[1]), ["Note", "Applied", "Confirmation received", "Edited by the organization"]);
  assert.match(html, /<time datetime="2026-10-26T15:02:00Z">Oct 26, 2026<\/time>/);
  assert.match(html, /Emailed Oct 26 about winter dates/);
  assert.match(admin.activityItems([]), /Nothing yet/);
  const src = readFileSync(file("public/app/views/admin.js"), "utf8");
  assert.doesNotMatch(src, /event_series/, "yearly events are programs now");
  assert.match(src, /"program_id"/);
  assert.match(src, /\["with_org", "On the organization's card"\]/);
  // The activity never reaches a public page.
  for (const f of ["program.js", "program-detail.js", "event-series.js", "events.js"]) assert.doesNotMatch(readFileSync(file(`public/app/views/${f}`), "utf8"), /\/activity/);
});

test("the yearly event page on its own days: happening now, no Register (Alec, 2026-10-25)", async () => {
  ROUTE = (u) => (u === "/api/event-series/spooky-spokes" ? reply({ ok: true, series: SPOOKY() }) : null);
  const out = await series.render({ params: { slug: "spooky-spokes" }, data: D, now: new Date(2026, 9, 25, 19, 51) });
  const t = text(out.html);
  assert.match(t, /Happening now/);
  assert.match(t, /3rd annual · Oct 23 to 25, 2026/);
  assert.doesNotMatch(out.html, /Register/);
  assert.doesNotMatch(String(out.sticky || ""), /Register/);
  assert.match(String(out.sticky || ""), /Event website/);
  const past = between(out.html, '<ol class="es-years">', "</ol>");
  assert.deepEqual([...past.matchAll(/<b class="es-y num">(\d{4})<\/b>/g)].map((m) => m[1]), ["2025", "2024"]);
});

test("distances are measured between two real points, never from 0,0 (2026-10-26: 'About 6620 mi' on listing pages)", () => {
  const wichita = { placed: true, cityFirst: "Wichita", city: "Wichita", state: "KS", lat: 37.69, lng: -97.34 };
  // A listing page whose organization keeps its address private has no exact point.
  const page = { placed: true, cityFirst: "Overland Park", city: "Overland Park", state: "KS", lat: null, lng: null };
  const where = A.whereFromProgram(page);
  assert.equal(where.coords, null);
  assert.equal(A.relation(wichita, where).miles, null);
  assert.equal(A.relation(wichita, { city: "Overland Park", state: "KS", coords: [null, null] }).miles, null);
  // With the city's center the distance is real: Overland Park to Wichita is about 165 miles.
  const miles = A.relation(wichita, A.whereFromProgram({ ...page, lat: 38.98, lng: -94.67 })).miles;
  assert.ok(miles > 150 && miles < 180, String(miles));
});
