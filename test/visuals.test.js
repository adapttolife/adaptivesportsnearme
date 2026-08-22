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
  assert.deepEqual(listingVisual({ sport: "basketball" }, "program"), { kind: "scene", src: "/scenes/basketball-gym.png" });
  assert.deepEqual(listingVisual({ sport: "cycling" }, "program"), { kind: "scene", src: "/scenes/cycling-road.png" });
  assert.deepEqual(listingVisual({ sport: "skiing" }, "program"), { kind: "scene", src: "/scenes/skiing-mountain.png" });
});

test("listingVisual: other sports use the black stamp", () => {
  assert.deepEqual(listingVisual({ sport: "pickleball" }, "program"), { kind: "stamp", src: "/emblems/pickleball.png" });
  assert.deepEqual(listingVisual({ sport: "rowing" }, "program"), { kind: "stamp", src: "/emblems/rowing.png" });
  assert.deepEqual(listingVisual({ sport: null }, "program"), { kind: "stamp", src: null });
});

test("listingVisual: athlete and program grants use grant-track", () => {
  assert.deepEqual(listingVisual({ audience: "athlete" }, "grant"), { kind: "scene", src: "/scenes/grant-track.png" });
  assert.deepEqual(listingVisual({ audience: "program" }, "grant"), { kind: "scene", src: "/scenes/grant-track.png" });
});

test("listingVisual: events use event stamp unless a sport scene exists", () => {
  assert.deepEqual(listingVisual({ sport: null }, "event"), { kind: "stamp", src: "/emblems/event.png" });
  assert.deepEqual(listingVisual({ sport: "basketball" }, "event"), { kind: "scene", src: "/scenes/basketball-gym.png" });
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
  assert.ok(!html.includes("/scenes/basketball-gym.png"));
});

test("grant page keeps Athlete / Program tags on the grant-track hero", () => {
  const athlete = grantPageTemplate({
    id: "b0298125-6d6a-4114-b0a2-5275750c09ae",
    name: "Hustle & Heart Fund (Adapt To Life)",
    audience: "athlete",
    source: "Adapt To Life",
  });
  assert.ok(athlete.includes("/scenes/grant-track.png"));
  assert.ok(athlete.includes("Athlete grant"));
  const program = grantPageTemplate({
    id: "c7168314-73f4-5559-8387-d04651e400a9",
    name: "VA Adaptive Sports Grant Program",
    audience: "program",
    source: "U.S. Department of Veterans Affairs",
  });
  assert.ok(program.includes("/scenes/grant-track.png"));
  assert.ok(program.includes("Program grant"));
  assert.ok(!program.includes("Athlete grant"));
});
