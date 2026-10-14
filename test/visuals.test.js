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

// Alec, 2026-10-13: launch on symbols and icons, never wait on images. Program
// listings wear their sport's image from Alec's flat set (2026-10-14); the stock
// action photos and the silhouette scenes stay off listings.
test("listingVisual: program sports wear their flat image, not a stock photo or scene", () => {
  assert.deepEqual(listingVisual({ sport: "basketball" }, "program"), { kind: "symbol", src: "/emblems/sports/basketball.svg", key: "basketball", tone: "court" });
  assert.deepEqual(listingVisual({ sport: "rowing" }, "program"), { kind: "symbol", src: "/emblems/sports/rowing.svg", key: "rowing", tone: "water" });
  for (const sport of ["basketball", "tennis", "pickleball", "rugby", "football", "baseball", "sledhockey", "waterskiing", "goalball", "swimming", "climbing", "curling", "sailing"]) {
    const v = listingVisual({ sport }, "program");
    assert.equal(v.kind, "symbol", sport);
    assert.equal(v.src, `/emblems/sports/${sport}.svg`, sport);
  }
  // Not drawn yet: the older symbol stays until Alec's image lands.
  for (const sport of ["soccer", "skiing", "cycling"]) assert.equal(listingVisual({ sport }, "program").src, `/emblems/athlete-${sport}.svg`, sport);
});

test("listingVisual: a listing with no sport we can name wears the multi-sport image", () => {
  for (const item of [{}, { sport: null }, { sport: "frisbee" }, { sportLabel: "Multi-Sport" }]) {
    assert.deepEqual(listingVisual(item, "program"), { kind: "symbol", src: "/emblems/sports/multi.svg", key: null, tone: "house" });
  }
  assert.equal(listingVisual({ sport: "beepbaseball" }, "program").src, "/emblems/sports/beepbaseball.svg");
  assert.equal(listingVisual({ sport: "softball" }, "program").src, "/emblems/sports/softball.svg");
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
