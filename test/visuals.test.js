import test from "node:test";
import assert from "node:assert/strict";
import { listingVisual } from "../src/visuals.js";
import { grantPageTemplate } from "../src/grant-page.js";
import { programPageTemplate } from "../src/program-page.js";

test("listingVisual: real photo wins", () => {
  const v = listingVisual({ photo: "/photos/team.jpg", sport: "basketball" }, "program");
  assert.deepEqual(v, { kind: "photo", src: "/photos/team.jpg" });
});

test("listingVisual: basketball/cycling/skiing use scenes", () => {
  assert.deepEqual(listingVisual({ sport: "basketball" }, "program"), { kind: "scene", src: "/scenes/basketball-gym.jpg" });
  assert.deepEqual(listingVisual({ sport: "cycling" }, "program"), { kind: "scene", src: "/scenes/cycling-road.jpg" });
  assert.deepEqual(listingVisual({ sport: "skiing" }, "program"), { kind: "scene", src: "/scenes/skiing-mountain.jpg" });
});

test("listingVisual: extra scenes resolve; no-sport stays a stamp card", () => {
  assert.deepEqual(listingVisual({ sport: "pickleball" }, "program"), { kind: "scene", src: "/scenes/pickleball-court.jpg" });
  assert.deepEqual(listingVisual({ sport: "tennis" }, "program"), { kind: "scene", src: "/scenes/tennis-court.jpg" });
  assert.deepEqual(listingVisual({ sport: "rowing" }, "program"), { kind: "scene", src: "/scenes/rowing-lake.jpg" });
  // A listing with no sport must still get a picture: the house-mark stamp, never src:null.
  assert.deepEqual(listingVisual({ sport: null }, "program"), { kind: "stamp", src: "/emblems/adaptive.svg" });
  assert.deepEqual(listingVisual({ sport: "soccer" }, "program"), { kind: "stamp", src: "/emblems/adaptive.svg" });
  for (const item of [{}, { sport: null }, { sport: "surfing" }, { sport: "curling" }, { sport: "beepbaseball" }]) {
    assert.ok(listingVisual(item, "program").src, "every program listing resolves to a visual");
  }
});

test("listingVisual: athlete grants use grant-track; program grants use program-grant-gym", () => {
  assert.deepEqual(listingVisual({ audience: "athlete" }, "grant"), { kind: "scene", src: "/scenes/grant-track.jpg" });
  assert.deepEqual(listingVisual({ audience: "program" }, "grant"), { kind: "scene", src: "/scenes/program-grant-gym.jpg" });
});

test("listingVisual: events use event-field unless a sport scene exists", () => {
  assert.deepEqual(listingVisual({ sport: null }, "event"), { kind: "scene", src: "/scenes/event-field.jpg" });
  assert.deepEqual(listingVisual({ sport: "basketball" }, "event"), { kind: "scene", src: "/scenes/basketball-gym.jpg" });
});

test("program page keeps a real photo and does not fall back to a scene", () => {
  const html = programPageTemplate({
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    name: "Denver Rolling Nuggets",
    sport: "basketball",
    sportLabel: "Wheelchair Basketball",
    city: "Denver",
    state: "CO",
    photo: "/photos/nuggets.jpg",
  });
  assert.ok(html.includes("/photos/nuggets.jpg"));
  assert.ok(!html.includes("/scenes/basketball-gym.jpg"));
});

test("grant page keeps Athlete / Program tags on the grant-track hero", () => {
  const athlete = grantPageTemplate({
    id: "b0298125-6d6a-4114-b0a2-5275750c09ae",
    name: "Hustle & Heart Fund (Adapt To Life)",
    audience: "athlete",
    source: "Adapt To Life",
  });
  assert.ok(athlete.includes("/scenes/grant-track.jpg"));
  assert.ok(athlete.includes("Athlete grant"));
  const program = grantPageTemplate({
    id: "c7168314-73f4-5559-8387-d04651e400a9",
    name: "VA Adaptive Sports Grant Program",
    audience: "program",
    source: "U.S. Department of Veterans Affairs",
  });
  assert.ok(program.includes("/scenes/program-grant-gym.jpg"));
  assert.ok(program.includes("Program grant"));
  assert.ok(!program.includes("Athlete grant"));
});
