// City centers for listings (src/geo.js). A listing's city is public text, so
// the center of that city can place it on a map and in "near you" without the
// listing's own coordinates (those stay behind publicity_consent). The table is
// public/data/places.json, "ST|city" -> [lat, lng], names lowercased with
// periods dropped, "saint" -> "st" and "fort" -> "ft" (scripts/build-places.py).
// A few real rows of it are enough here.
import test from "node:test";
import assert from "node:assert/strict";
import { cityCenter, loadPlaces, _resetPlacesCache } from "../src/geo.js";

const PLACES = {
  "TN|franklin": [35.914, -86.852],
  "NC|raleigh": [35.832, -78.641],
  "NC|durham": [35.978, -78.899],
  "NC|winston-salem": [36.103, -80.261],
  "AR|ft smith": [35.349, -94.371],
  "MN|st paul": [44.949, -93.104],
  "MO|st louis": [38.636, -90.244],
  "CO|denver": [39.762, -104.881],
};

test("a city in the table is found under its own state, never another's", () => {
  assert.deepEqual(cityCenter("Denver", "CO", PLACES), PLACES["CO|denver"]);
  assert.deepEqual(
    cityCenter("St. Louis", "MO", PLACES),
    PLACES["MO|st louis"],
    "periods are dropped",
  );
  assert.equal(
    cityCenter("Denver", "TX", PLACES),
    null,
    "a same-named city in another state is not borrowed",
  );
});

test("longer city text still finds the place it names", () => {
  // Each place named in the text, in turn.
  assert.deepEqual(
    cityCenter("Franklin / Middle Tennessee", "TN", PLACES),
    PLACES["TN|franklin"],
  );
  // A hyphenated pair: the whole name first, then each side.
  assert.deepEqual(
    cityCenter("Raleigh-Durham", "NC", PLACES),
    PLACES["NC|raleigh"],
  );
  assert.deepEqual(
    cityCenter("Raleigh-Durham", "NC", { "NC|durham": PLACES["NC|durham"] }),
    PLACES["NC|durham"],
  );
  assert.deepEqual(
    cityCenter("Winston-Salem", "NC", PLACES),
    PLACES["NC|winston-salem"],
    "a hyphenated city is itself first",
  );
  // A dash label: the words after it ("Fort" is "ft" in the table).
  assert.deepEqual(
    cityCenter("Community Connections - Fort Smith", "AR", PLACES),
    PLACES["AR|ft smith"],
  );
  // "Saint" is "st" in the table.
  assert.deepEqual(
    cityCenter("Saint Paul", "MN", PLACES),
    PLACES["MN|st paul"],
  );
  // Region words around a city are not part of its name.
  assert.deepEqual(
    cityCenter("Greater Denver Area", "CO", PLACES),
    PLACES["CO|denver"],
  );
});

test("statewide, empty and unknown places get no center; the state code may be lowercase", () => {
  for (const city of [
    "Statewide",
    "statewide",
    "",
    null,
    undefined,
    "Atlantis",
    "Various locations",
  ]) {
    assert.equal(cityCenter(city, "CO", PLACES), null, String(city));
  }
  assert.equal(cityCenter("Denver", null, PLACES), null);
  assert.equal(cityCenter("Denver", "", PLACES), null);
  assert.equal(cityCenter("Denver", "CO", null), null);
  assert.deepEqual(cityCenter("Franklin", "tn", PLACES), PLACES["TN|franklin"]);
  // Each answer is its own array: a caller cannot edit the shared table through it.
  const center = cityCenter("Denver", "CO", PLACES);
  center[0] = 0;
  assert.deepEqual(PLACES["CO|denver"], [39.762, -104.881]);
});

test("loadPlaces reads /data/places.json through ASSETS once; a failure is not remembered", async () => {
  _resetPlacesCache();
  try {
    const seen = [];
    let answer = () => {
      throw new Error("offline");
    };
    const assets = {
      fetch: async (url) => {
        seen.push(String(url));
        return answer();
      },
    };
    assert.equal(
      await loadPlaces(assets),
      null,
      "a fetch that throws is a miss",
    );
    answer = () => new Response("missing", { status: 404 });
    assert.equal(await loadPlaces(assets), null, "a 404 is a miss");
    assert.equal(
      await loadPlaces(undefined),
      null,
      "no ASSETS binding, no table",
    );
    answer = () => Response.json(PLACES);
    assert.deepEqual(await loadPlaces(assets), PLACES);
    assert.deepEqual(await loadPlaces(assets), PLACES);
    assert.deepEqual(
      seen,
      Array(3).fill("https://assets.local/data/places.json"),
      "two misses, then one load reused",
    );
  } finally {
    _resetPlacesCache();
  }
});

// The shipped table, not a sample: New England lives in towns, which the Census places
// file leaves out, so towns fill the gaps (scripts/build-places.py, second file).
test("the shipped city table knows New England ski towns", async () => {
  const { readFileSync } = await import("node:fs");
  const table = JSON.parse(
    readFileSync(
      new URL("../public/data/places.json", import.meta.url),
      "utf8",
    ),
  );
  for (const [city, st] of [
    ["Killington", "VT"],
    ["Newbury", "NH"],
    ["Lincoln", "NH"],
    ["Windham", "NY"],
    ["Dover", "VT"],
    ["Glastonbury", "CT"],
    ["Colchester", "VT"],
    ["Newry", "ME"],
  ]) {
    assert.ok(cityCenter(city, st, table), `${city}, ${st}`);
  }
  assert.deepEqual(
    table["CO|denver"],
    [39.762, -104.881],
    "a place keeps its own center",
  );
});
