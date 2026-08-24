import test from "node:test";
import assert from "node:assert/strict";
import {
  programPageTemplate, programNotFoundTemplate, PROGRAM_ID_RE,
  locLine, photoPath, typeLabel, primaryCta,
} from "../src/program-page.js";

const ORG = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  name: "Denver Rolling Nuggets",
  sport: "basketball",
  sportLabel: "Wheelchair Basketball",
  type: "member",
  city: "Denver",
  state: "CO",
  website: "https://www.example.org/nuggets",
  primarySource: "US Paralympics Club Finder",
  sources: [{ name: "US Paralympics Club Finder", organization: "U.S. Olympic & Paralympic Committee", url: "https://www.teamusa.org" }],
};

const RENO = {
  id: "fc478a1c-b3a0-4828-84bf-3dd45f6dec82",
  name: "3rd Shot Pickleball Reno Adaptive",
  sport: "pickleball",
  sportLabel: "Adaptive Pickleball",
  type: "inclusive_club",
  city: "Reno",
  state: "NV",
  stateName: "Nevada",
  geoPrecision: "city",
  website: "https://3rdshotpickleball.com/home-reno",
  desc: "Indoor pickleball club at 6895 Sierra Center Pkwy, Reno. Listed by USA Pickleball for Sunday adaptive/wheelchair pickleball (11am–1pm, $5).",
  cost: "$5 adaptive session (USA Pickleball listing)",
  ages: "Adult",
  phone: "775-467-2025",
  email: "reno@3rdshotpickleball.com",
  verification: "unverified",
  lastChecked: "2026-08-21T19:55:06Z",
  primarySource: "Builder web search 2026-08-21",
  sources: [{ name: "Builder web search 2026-08-21", organization: "Adaptive Sports Near Me", url: "https://usapickleball.org/adaptive/" }],
};

const KANSAS = {
  id: "abf56b30-95cf-45b1-a8fd-6d56248b4199",
  name: "Adaptive Cycling Omnium",
  sport: "cycling",
  sportLabel: "Adaptive Cycling",
  type: "member",
  city: null,
  state: "KS",
  stateName: "Kansas",
  geoPrecision: "state",
  website: null,
  email: null,
  phone: null,
  desc: null,
  cost: null,
  ages: null,
  equipment: null,
  verification: "unverified",
  lastChecked: null,
  primarySource: "US Paralympics Club Finder",
  sources: [{ name: "US Paralympics Club Finder", url: "https://www.usopc.org/paralympic-sport-development" }],
};

test("PROGRAM_ID_RE matches a UUID program path", () => {
  const m = "/programs/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa".match(PROGRAM_ID_RE);
  assert.ok(m);
  assert.equal(m[1], "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
  assert.equal("/programs/not-a-uuid".match(PROGRAM_ID_RE), null);
  assert.equal("/maps".match(PROGRAM_ID_RE), null);
});

test("locLine: city + state, then city, then state name — never a repeated field", () => {
  assert.equal(locLine(ORG), "Denver, CO");
  assert.equal(locLine({ city: "Los Angeles", stateName: "California" }), "Los Angeles, California");
  assert.equal(locLine({ city: "Denver" }), "Denver");
  assert.equal(locLine({ stateName: "California", state: "CA" }), "California");
  assert.equal(locLine({ state: "CA" }), "CA");
  assert.equal(locLine({}), "United States");
});

test("locLine: geoPrecision=state is statewide, never a fake city", () => {
  assert.equal(locLine(KANSAS), "Kansas · statewide");
  assert.equal(locLine({ city: "Lawrence", state: "KS", stateName: "Kansas", geoPrecision: "state" }), "Kansas · statewide");
});

test("typeLabel: the org type reads as a human fact, null when missing", () => {
  assert.equal(typeLabel(ORG), "Community program");
  assert.equal(typeLabel({ type: "team" }), "Competitive team");
  assert.equal(typeLabel({}), null);
  assert.equal(typeLabel({ type: "inclusive_club" }), "Inclusive club");
});

test("photoPath: scene when we have one, else stamp (null cover)", () => {
  assert.equal(photoPath("cycling"), "/scenes/cycling-road.jpg");
  assert.equal(photoPath("basketball"), "/scenes/basketball-gym.jpg");
  assert.equal(photoPath("skiing"), "/scenes/skiing-mountain.jpg");
  assert.equal(photoPath("pickleball"), "/scenes/pickleball-court.jpg");
  assert.equal(photoPath("tennis"), "/scenes/tennis-court.jpg");
  assert.equal(photoPath(null), null);
  assert.equal(photoPath("rowing"), "/scenes/rowing-lake.jpg");
  assert.equal(photoPath(null, { photo: "/photos/mine.jpg" }), "/photos/mine.jpg");
});

test("primaryCta: website → tel → mailto → source. Never an empty-page stub", () => {
  assert.deepEqual(primaryCta(ORG), { href: ORG.website, label: "Visit website" });
  assert.deepEqual(primaryCta({ phone: "775-467-2025" }), { href: "tel:7754672025", label: "Call" });
  assert.deepEqual(primaryCta({ email: "hi@example.org" }), { href: "mailto:hi@example.org", label: "Email" });
  assert.deepEqual(primaryCta(KANSAS), {
    href: "https://www.usopc.org/paralympic-sport-development",
    label: "View source",
  });
  assert.equal(primaryCta({}), null);
});

test("programPageTemplate: photo hero, name, city+state, website button — not four labeled cards", () => {
  const html = programPageTemplate(ORG, { site: "https://asnm-staging.alec-af3.workers.dev" });
  assert.ok(html.includes("Denver Rolling Nuggets"));
  assert.ok(html.includes("Wheelchair Basketball"));
  assert.ok(html.includes("Denver, CO"));
  assert.ok(html.includes("https://www.example.org/nuggets"));
  assert.ok(html.includes("<h1>Denver Rolling Nuggets</h1>"));
  assert.ok(html.includes("/scenes/basketball-gym.jpg"));
  assert.ok(html.includes("has-dphoto"));
  assert.ok(html.includes("dhero-img"));
  assert.ok(html.includes("Visit website"));
  assert.ok(html.includes("← Directory"));
  assert.ok(html.includes('class="bar"'));
  assert.ok(!html.includes("We are not live yet"));
  assert.ok(!html.includes(">Sport</p>"));
  assert.ok(!html.includes("City / state"));
  assert.ok(!html.includes("class=\"card\""));
  assert.ok(html.includes("dov-sport") && html.includes("Wheelchair Basketball"));
  assert.ok(html.includes("clamp(180px,24vw,260px)"));
  assert.ok(!html.includes("Unverified"));
  assert.ok(!html.includes("Last checked"));
});

test("programPageTemplate: Reno pickleball reads like a listing", () => {
  const html = programPageTemplate(RENO);
  assert.ok(html.includes("3rd Shot Pickleball Reno Adaptive"));
  assert.ok(html.includes("Reno, NV"));
  assert.ok(html.includes("$5"));
  assert.ok(html.includes("Sunday"));
  assert.ok(html.includes("class=\"cta\""));
  assert.ok(html.includes("Visit website"));
  assert.ok(html.includes("3rdshotpickleball.com/home-reno"));
  const locAt = html.indexOf('class="loc"');
  const descAt = html.indexOf('class="desc"');
  const ctaAt = html.indexOf('class="cta"');
  assert.ok(locAt > 0 && descAt > locAt && ctaAt > descAt);
  assert.ok(html.includes(">Cost</span>") && html.includes("$5 adaptive session"));
  assert.ok(html.includes(">Ages</span>") && html.includes("Adult"));
  assert.ok(html.includes("775-467-2025"));
  assert.ok(html.includes("reno@3rdshotpickleball.com"));
  assert.ok(html.includes("Inclusive club"));
  assert.ok(!html.includes("Unverified"));
  assert.ok(!html.includes("Last checked"));
  assert.ok(!html.includes("Aug 21, 2026"));
  assert.ok(!html.includes('class="listed"'));
  assert.ok(!html.includes("No website on file."));
  assert.ok(!html.includes("Before you go"));
  assert.ok(!html.includes("Funding that fits"));
});

test("programPageTemplate: Airbnb listing rhythm, no verification chrome", () => {
  const html = programPageTemplate(RENO);
  assert.ok(html.includes("--space-page: 24px"));
  assert.ok(html.includes("--space-header: 64px"));
  assert.ok(html.includes("--tap: 44px"));
  assert.ok(html.includes("min-height:var(--space-header)"));
  assert.ok(html.includes("min-height:var(--tap)"));
  assert.ok(html.includes("padding:var(--space-page) var(--space-page) var(--space-header)"));
  assert.ok(html.includes("margin:0 0 var(--space-after-photo)"));
  assert.ok(html.includes("margin:0 0 var(--space-title-gap)"));
  assert.ok(html.includes("margin:0 0 var(--space-section)"));
  assert.ok(html.includes("margin-top:var(--space-nearby)"));
  assert.ok(html.includes("padding:var(--space-row) 0"));
  assert.ok(html.includes("font-size:22px"));
  assert.ok(html.includes('class="titleb"'));
  assert.ok(html.includes(".nearby h2{font-size:22px;font-weight:700"));
  assert.ok(html.includes('href="/tokens.css"'));
  assert.ok(!html.includes("Unverified"));
  assert.ok(!html.includes("Last checked"));
  assert.ok(!html.includes("Builder web search"));
});

test("programPageTemplate: Kansas Omnium still has an action + nearby strip", () => {
  const nearby = [
    { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", name: "Sunflower Adaptive Cycling", sport: "cycling", sportLabel: "Adaptive Cycling", city: "Wichita", state: "KS", type: "member", dist: 42 },
    { id: "cccccccc-cccc-cccc-cccc-cccccccccccc", name: "Prairie Handcycle", sport: "cycling", sportLabel: "Adaptive Cycling", city: "Lawrence", state: "KS", type: "member", dist: 51 },
    { id: "dddddddd-dddd-dddd-dddd-dddddddddddd", name: "KC Adaptive Bike", sport: "cycling", sportLabel: "Adaptive Cycling", city: "Kansas City", state: "MO", type: "member", dist: 88 },
    { id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee", name: "Ozark Adaptive Cycling", sport: "cycling", sportLabel: "Adaptive Cycling", state: "MO", type: "member", dist: 120 },
  ];
  const html = programPageTemplate(KANSAS, { nearby });
  assert.ok(html.includes("Adaptive Cycling Omnium"));
  assert.ok(html.includes("Kansas · statewide"));
  assert.ok(html.includes("Kansas · statewide")); assert.ok(!html.includes("Topeka, KS"));
  assert.ok(html.includes("View source"));
  assert.ok(html.includes("https://www.usopc.org/paralympic-sport-development"));
  assert.ok(html.includes('class="cta"'));
  assert.ok(!html.includes("No website on file."));
  assert.ok(!html.includes("Visit website"));
  assert.ok(html.includes('class="nearby"'));
  assert.ok(html.includes('class="frow-scroll"'));
  assert.ok(!html.includes('class="grid"'));
  assert.ok(html.includes("scroll-snap-type:x"));
  assert.ok(html.includes("78vw"));
  assert.ok(html.includes("Sunflower Adaptive Cycling"));
  assert.ok(html.includes("Prairie Handcycle"));
  assert.ok(html.includes("42 mi away"));
  assert.ok(html.includes("Wichita, KS"));
  assert.equal(html.split("Sunflower Adaptive Cycling").length - 1, 1);
  assert.equal((html.match(/class="nearby"/g) || []).length, 1);
  assert.equal((html.match(/<h2>/g) || []).length, 1);
  assert.ok(html.includes("Nearby adaptive cycling"));
  assert.ok(!html.includes("class=\"desc\""));
  assert.ok(!html.includes("Unverified"));
  assert.ok(!html.includes("Last checked"));
});

test("programPageTemplate: nearby is one horizontal rail, not a wrapping grid or second dump", () => {
  const nearby = [
    { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", name: "Sunflower Adaptive Cycling", sport: "cycling", sportLabel: "Adaptive Cycling", city: "Wichita", state: "KS", dist: 42 },
    { id: "cccccccc-cccc-cccc-cccc-cccccccccccc", name: "Prairie Handcycle", sport: "cycling", sportLabel: "Adaptive Cycling", city: "Lawrence", state: "KS", dist: 51 },
  ];
  const html = programPageTemplate(KANSAS, { nearby });
  const nearbyAt = html.indexOf('class="nearby"');
  const nearbyHtml = html.slice(nearbyAt);
  assert.ok(nearbyAt > 0);
  assert.ok(nearbyHtml.includes('class="frow-scroll"'));
  assert.ok(!nearbyHtml.includes('class="grid"'));
  assert.ok(!nearbyHtml.includes("grid-template-columns"));
  assert.ok(nearbyHtml.includes("pcard-sport") && nearbyHtml.includes("Adaptive Cycling"));
  assert.ok(nearbyHtml.includes("pcard-name") && nearbyHtml.includes("Sunflower Adaptive Cycling"));
  assert.ok(nearbyHtml.includes("pcard-loc") && nearbyHtml.includes("Wichita, KS"));
  assert.ok(nearbyHtml.includes("pcard-line") && nearbyHtml.includes("42 mi away"));
  assert.ok(!html.includes("See all"));
  assert.ok(!html.includes("frow-sub"));
  const empty = programPageTemplate(KANSAS, { nearby: [] });
  assert.ok(!empty.includes('class="nearby"'));
  assert.ok(!empty.includes('class="frow-scroll"'));
});

test("programPageTemplate: dense rows only when present; desc only when present", () => {
  const bare = programPageTemplate(ORG);
  assert.ok(!bare.includes('class="desc"'));
  assert.ok(bare.includes(">Type</span>") && bare.includes("Community program"));
  assert.ok(!bare.includes(">Cost</span>"));
  assert.ok(!bare.includes(">Phone</span>"));
  const full = programPageTemplate({ ...ORG, desc: "Two divisions, chairs provided.", email: "hi@example.org", phone: "(303) 555-0148", cost: "Free" });
  assert.ok(full.includes("Two divisions, chairs provided."));
  assert.ok(full.includes('href="mailto:hi@example.org"'));
  assert.ok(full.includes("555-0148"));
  assert.ok(full.includes(">Cost</span>") && full.includes("Free"));
});

test("programPageTemplate: no website falls back — never 'No website on file.'", () => {
  const html = programPageTemplate({ ...ORG, website: null, phone: "303-555-0100" });
  assert.ok(!html.includes("No website on file."));
  assert.ok(html.includes("Call"));
  assert.ok(html.includes("tel:3035550100"));
});

test("programPageTemplate: no photo key uses the stamp card, still has name + loc", () => {
  const html = programPageTemplate({ ...ORG, sport: null, sportLabel: "Multi-Sport" });
  assert.ok(!html.includes("sport-photos/"));
  assert.ok(!html.includes("g-sand"));
  assert.ok(html.includes("has-stamp"));
  assert.ok(html.includes("Denver Rolling Nuggets"));
  assert.ok(html.includes("Denver, CO"));
});

test("programPageTemplate: state-only listing shows the state name, not a blank city", () => {
  const html = programPageTemplate({
    ...ORG,
    name: "Bicycling Blind Los Angeles",
    sport: "cycling",
    sportLabel: "Adaptive Cycling",
    city: null,
    state: "CA",
    stateName: "California",
    website: "http://bicyclingblind.org",
  });
  assert.ok(html.includes("Bicycling Blind Los Angeles"));
  assert.ok(html.includes("/scenes/cycling-road.jpg"));
  assert.ok(html.includes("California"));
  assert.ok(!html.includes("null"));
  assert.ok(html.includes("Visit website"));
  assert.ok(html.includes("bicyclingblind.org"));
});

test("programPageTemplate: escapes untrusted name/sport", () => {
  const html = programPageTemplate({
    ...ORG,
    name: '<script>alert(1)</script>',
    sportLabel: 'Basketball & "Rugby"',
  });
  assert.ok(!html.includes("<script>alert(1)</script>"));
  assert.ok(html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
  assert.ok(html.includes("Basketball &amp; &quot;Rugby&quot;"));
});

test("programNotFoundTemplate: no launch modal, says not found", () => {
  const html = programNotFoundTemplate({ site: "https://example.test" });
  assert.ok(html.includes("Program not found"));
  assert.ok(!html.includes("We are not live yet"));
});
