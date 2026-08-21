// Nearby search (zip / city / lat-lng) — pure geo helpers + listPrograms with a fake D1.
import test from "node:test";
import assert from "node:assert/strict";
import {
  milesBetween, normalizeCity, cityCentroid, resolveOrigin, applyNearby,
  parseRadius, DEFAULT_RADIUS_MI,
} from "../src/geo.js";
import { listPrograms, freshness } from "../src/data.js";

const DENVER_ZIP = "80202";
const DENVER = [39.7515, -104.9977];
const CO_CENTROID = [39.059, -105.311]; // ~50 mi from downtown Denver
const CA_CENTROID = [36.7783, -119.4179]; // California — far from Denver
const ZCTA = { [DENVER_ZIP]: DENVER, "55414": [44.9784, -93.2224] };

function params(obj) {
  return new URLSearchParams(obj);
}

function org(over) {
  return {
    id: over.id || "00000000-0000-0000-0000-000000000001",
    name: over.name || "Test Program",
    org_type: "member",
    sport: over.sport || "Wheelchair Basketball",
    sport_key: over.sport_key || "basketball",
    website_url: "https://example.org",
    city: over.city ?? null,
    state: over.state ?? "CO",
    state_name: over.state_name ?? "Colorado",
    zip: over.zip ?? null,
    lat: over.lat ?? null,
    lng: over.lng ?? null,
    geo_precision: over.geo_precision ?? "state",
    description: null,
    cost_note: null,
    equipment_provided: null,
    ages: null,
    data_quality_rating: null,
    verification_status: "unverified",
    last_ok_at: null,
    is_public: 1,
    status: "active",
  };
}

function fakeDb(rows) {
  return {
    prepare(sql) {
      const isCount = /COUNT\(\*\)/.test(sql);
      return {
        bind() {
          return {
            async first() { return isCount ? { n: rows.length } : null; },
            async all() { return { results: rows }; },
          };
        },
      };
    },
  };
}

test("milesBetween: Denver zip to CO centroid is about 50 miles", () => {
  const mi = milesBetween(DENVER[0], DENVER[1], CO_CENTROID[0], CO_CENTROID[1]);
  assert.ok(mi > 40 && mi < 70, `expected ~50 mi, got ${mi}`);
});

test("milesBetween: Denver to CA centroid is hundreds of miles", () => {
  const mi = milesBetween(DENVER[0], DENVER[1], CA_CENTROID[0], CA_CENTROID[1]);
  assert.ok(mi > 700, `expected >>100 mi, got ${mi}`);
});

test("normalizeCity: strips state suffix and punctuation", () => {
  assert.equal(normalizeCity("Denver, CO"), "denver");
  assert.equal(normalizeCity("St. Louis"), "st louis");
  assert.equal(normalizeCity("  NEW YORK  "), "new york");
});

test("cityCentroid: Denver is in the table", () => {
  const c = cityCentroid("Denver");
  assert.ok(c);
  assert.ok(Math.abs(c[0] - 39.7392) < 0.02);
  assert.ok(Math.abs(c[1] - -104.9903) < 0.02);
});

test("resolveOrigin: zip uses ZCTA; unknown zip is missing", () => {
  const hit = resolveOrigin(params({ zip: "80202" }), ZCTA);
  assert.equal(hit.source, "zip");
  assert.equal(hit.zip, "80202");
  assert.equal(hit.lat, DENVER[0]);
  assert.equal(hit.radius, DEFAULT_RADIUS_MI);

  const miss = resolveOrigin(params({ zip: "00000" }), ZCTA);
  assert.equal(miss.missing, "zip");
});

test("resolveOrigin: city=Denver uses the city table", () => {
  const hit = resolveOrigin(params({ city: "Denver" }), ZCTA);
  assert.equal(hit.source, "city");
  assert.equal(hit.city, "Denver");
  assert.ok(hit.lat);
});

test("resolveOrigin: lat/lng wins over zip", () => {
  const hit = resolveOrigin(params({ zip: "80202", lat: "40", lng: "-105" }), ZCTA);
  assert.equal(hit.source, "latlng");
  assert.equal(hit.lat, 40);
});

test("parseRadius: clamps 1..500, defaults 100", () => {
  assert.equal(parseRadius(params({})), 100);
  assert.equal(parseRadius(params({ radius: "25" })), 25);
  assert.equal(parseRadius(params({ radius: "9999" })), 500);
  assert.equal(parseRadius(params({ radius: "0" })), 1);
});

test("applyNearby: keeps CO, drops CA at 100 mi from Denver", () => {
  const rows = [
    org({ id: "co", name: "CO Program", lat: CO_CENTROID[0], lng: CO_CENTROID[1] }),
    org({ id: "ca", name: "CA Program", state: "CA", lat: CA_CENTROID[0], lng: CA_CENTROID[1] }),
    org({ id: "none", name: "No geo", lat: null, lng: null }),
  ];
  const ranked = applyNearby(rows, { lat: DENVER[0], lng: DENVER[1], radius: 100 });
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].row.id, "co");
});

test("listPrograms: zip=80202 returns the nearby subset, not the whole set", async () => {
  const rows = [
    org({ id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1", name: "Near Denver", lat: CO_CENTROID[0], lng: CO_CENTROID[1] }),
    org({ id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2", name: "Far California", state: "CA", lat: CA_CENTROID[0], lng: CA_CENTROID[1] }),
    org({ id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3", name: "Also far", state: "NY", lat: 40.7, lng: -74.0 }),
  ];
  const out = await listPrograms(fakeDb(rows), params({ zip: "80202" }), { zcta: ZCTA });
  assert.ok(out.total < rows.length, `expected a subset, got total=${out.total}`);
  assert.equal(out.total, 1);
  assert.equal(out.items[0].name, "Near Denver");
  assert.ok(out.items[0].dist != null);
  assert.equal(out.near.zip, "80202");
});

test("listPrograms: city=Denver returns a nearby subset", async () => {
  const rows = [
    org({ id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1", name: "Front Range", lat: CO_CENTROID[0], lng: CO_CENTROID[1] }),
    org({ id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2", name: "West Coast", state: "CA", lat: CA_CENTROID[0], lng: CA_CENTROID[1] }),
  ];
  const out = await listPrograms(fakeDb(rows), params({ city: "Denver" }), { zcta: ZCTA });
  assert.equal(out.total, 1);
  assert.equal(out.items[0].name, "Front Range");
  assert.equal(out.near.source, "city");
});

test("listPrograms: unknown zip returns empty, not the full directory", async () => {
  const rows = [org({ lat: CO_CENTROID[0], lng: CO_CENTROID[1] })];
  const out = await listPrograms(fakeDb(rows), params({ zip: "00000" }), { zcta: ZCTA });
  assert.equal(out.total, 0);
  assert.deepEqual(out.items, []);
});

test("listPrograms: no location params still returns everyone (paged)", async () => {
  const rows = [
    org({ id: "a", name: "A", lat: 1, lng: 2 }),
    org({ id: "b", name: "B", lat: 3, lng: 4 }),
  ];
  const out = await listPrograms(fakeDb(rows), params({}), { zcta: ZCTA });
  assert.equal(out.total, 2);
  assert.equal(out.items.length, 2);
  assert.equal(out.near, null);
});

test("freshness still exported (nearby change did not drop it)", () => {
  assert.equal(freshness(null), null);
});
