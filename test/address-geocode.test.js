import test from "node:test";
import assert from "node:assert/strict";
import { geocodeAddress } from "../src/address-geocode.js";

test("geocodeAddress resolves the Census match coordinates", async () => {
  let requested;
  const point = await geocodeAddress(
    "200 Innovation Drive, Troy, NY 12180",
    async (url) => {
      requested = new URL(url);
      return Response.json({
        result: {
          addressMatches: [{ coordinates: { y: 42.7284, x: -73.6918 } }],
        },
      });
    },
  );
  assert.equal(requested.hostname, "geocoding.geo.census.gov");
  assert.equal(
    requested.searchParams.get("address"),
    "200 Innovation Drive, Troy, NY 12180",
  );
  assert.deepEqual(point, {
    lat: 42.7284,
    lng: -73.6918,
    geo_precision: "address",
  });
});

test("geocodeAddress returns null when the address has no match", async () => {
  const point = await geocodeAddress("Not an address", async () =>
    Response.json({ result: { addressMatches: [] } }),
  );
  assert.equal(point, null);
});
