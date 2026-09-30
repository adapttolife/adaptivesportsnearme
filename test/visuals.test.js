import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { listingVisual, SPORT_PHOTOS } from "../src/visuals.js";
import { grantPageTemplate } from "../src/grant-page.js";
import { programPageTemplate } from "../src/program-page.js";

test("listingVisual: real photo wins", () => {
  const v = listingVisual({ photo: "/photos/team.jpg", sport: "basketball" }, "program");
  assert.deepEqual(v, { kind: "photo", src: "/photos/team.jpg" });
});

test("listingVisual: the launch sports show their action photo, not the scene", () => {
  assert.deepEqual(listingVisual({ sport: "basketball" }, "program"), { kind: "photo", src: "/assets/sport-photos/basketball.jpg" });
  assert.deepEqual(listingVisual({ sport: "cycling" }, "program"), { kind: "photo", src: "/assets/sport-photos/cycling.jpg" });
  assert.deepEqual(listingVisual({ sport: "skiing" }, "program"), { kind: "photo", src: "/assets/sport-photos/skiing.jpg" });
  // Every sport with a photo on disk resolves to it — no silhouette scene on a launch sport.
  for (const sport of ["basketball", "tennis", "pickleball", "rugby", "football", "baseball", "cycling", "sledhockey", "skiing", "waterskiing", "goalball"]) {
    assert.deepEqual(listingVisual({ sport }, "program"), { kind: "photo", src: `/assets/sport-photos/${sport}.jpg` }, sport);
  }
});

test("listingVisual: a sport with no photo keeps its scene; no-sport stays a stamp card", () => {
  assert.deepEqual(listingVisual({ sport: "rowing" }, "program"), { kind: "scene", src: "/scenes/rowing-lake.jpg" });
  assert.deepEqual(listingVisual({ sport: "swimming" }, "program"), { kind: "scene", src: "/scenes/swimming-pool.jpg" });
  assert.deepEqual(listingVisual({ sport: "climbing" }, "program"), { kind: "scene", src: "/scenes/climbing-gym.jpg" });
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

test("listingVisual: events use event-field unless the sport has art of its own", () => {
  assert.deepEqual(listingVisual({ sport: null }, "event"), { kind: "scene", src: "/scenes/event-field.jpg" });
  assert.deepEqual(listingVisual({ sport: "basketball" }, "event"), { kind: "photo", src: "/assets/sport-photos/basketball.jpg" });
  assert.deepEqual(listingVisual({ sport: "rowing" }, "event"), { kind: "scene", src: "/scenes/rowing-lake.jpg" });
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

// The set and the disk have to agree: a key with no file gives the card a broken
// image that falls back to the stamp, which is the look we just took out.
test("every sport photo the resolver promises exists on disk, and none is orphaned", () => {
  const onDisk = new Set(
    readdirSync(new URL("../public/assets/sport-photos/", import.meta.url))
      .filter((f) => f.endsWith(".jpg"))
      .map((f) => f.replace(/\.jpg$/, ""))
  );
  for (const sport of SPORT_PHOTOS) assert.ok(onDisk.has(sport), `missing photo file for ${sport}`);
  for (const file of onDisk) assert.ok(SPORT_PHOTOS.has(file), `photo ${file}.jpg is never used`);
});
