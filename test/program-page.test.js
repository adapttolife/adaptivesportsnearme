import test from "node:test";
import assert from "node:assert/strict";
import {
  programPageTemplate, programNotFoundTemplate, PROGRAM_ID_RE,
  locLine, photoPath,
} from "../src/program-page.js";

const ORG = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  name: "Denver Rolling Nuggets",
  sport: "basketball",
  sportLabel: "Wheelchair Basketball",
  city: "Denver",
  state: "CO",
  website: "https://www.example.org/nuggets",
  primarySource: "US Paralympics Club Finder",
  sources: [{ name: "US Paralympics Club Finder", organization: "U.S. Olympic & Paralympic Committee", url: "https://www.teamusa.org" }],
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

test("photoPath: only the existing sport-photos set", () => {
  assert.equal(photoPath("cycling"), "/assets/sport-photos/cycling.jpg");
  assert.equal(photoPath("basketball"), "/assets/sport-photos/basketball.jpg");
  assert.equal(photoPath(null), null);
  assert.equal(photoPath("rowing"), null);
});

test("programPageTemplate: photo hero, name, city+state, website button, source — not four labeled cards", () => {
  const html = programPageTemplate(ORG, { site: "https://asnm-staging.alec-af3.workers.dev" });
  assert.ok(html.includes("Denver Rolling Nuggets"));
  assert.ok(html.includes("Wheelchair Basketball"));
  assert.ok(html.includes("Denver, CO"));
  assert.ok(html.includes("https://www.example.org/nuggets"));
  assert.ok(html.includes("US Paralympics Club Finder"));
  assert.ok(html.includes("<h1>Denver Rolling Nuggets</h1>"));
  assert.ok(html.includes("/assets/sport-photos/basketball.jpg"));
  assert.ok(html.includes("has-dphoto"));
  assert.ok(html.includes("dhero-img"));
  assert.ok(html.includes("Visit website"));
  assert.ok(html.includes("← Directory"));
  assert.ok(!html.includes("We are not live yet"));
  // The four lonely labeled cards (Sport / City / state / Website / Source)
  assert.ok(!html.includes(">Sport</p>"));
  assert.ok(!html.includes("City / state"));
  assert.ok(!html.includes("class=\"card\""));
  // Sport is the photo pill / description — not a second labeled "Sport" card
  assert.ok(html.includes('class="eyebrow">Wheelchair Basketball</span>'));
});

test("programPageTemplate: no photo key uses the sand fallback, still has name + loc", () => {
  const html = programPageTemplate({ ...ORG, sport: null, sportLabel: "Multi-Sport" });
  assert.ok(!html.includes("sport-photos/"));
  assert.ok(html.includes("g-sand"));
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
  assert.ok(html.includes("/assets/sport-photos/cycling.jpg"));
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
