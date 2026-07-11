// geocode lane tests (Spec 72 T05) — pure functions only, no D1 mocking.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeZip, buildChange } from "../src/lanes/geocode.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ZCTA_PATH = path.join(__dirname, "..", "public", "assets", "data", "zcta.json");

test("normalizeZip: plain 5-digit zip passes through", () => {
  assert.equal(normalizeZip("55414"), "55414");
});

test("normalizeZip: ZIP+4 truncates to first 5 digits", () => {
  assert.equal(normalizeZip("55414-2109"), "55414");
});

test("normalizeZip: trims surrounding whitespace", () => {
  assert.equal(normalizeZip("  55414  "), "55414");
});

test("normalizeZip: garbage (non-digit) -> null", () => {
  assert.equal(normalizeZip("ABCDE"), null);
  assert.equal(normalizeZip("N/A"), null);
});

test("normalizeZip: short (< 5 digits) -> null", () => {
  assert.equal(normalizeZip("1234"), null);
  assert.equal(normalizeZip("55"), null);
});

test("normalizeZip: null/undefined -> null", () => {
  assert.equal(normalizeZip(null), null);
  assert.equal(normalizeZip(undefined), null);
});

test("buildChange: shapes lat/lng/geo_precision from org + coords", () => {
  const org = { id: "org-1", lat: null, lng: null, geo_precision: "state" };
  const change = buildChange(org, [44.9784, -93.2224]);
  assert.deepEqual(change, {
    lat: { from: null, to: 44.9784 },
    lng: { from: null, to: -93.2224 },
    geo_precision: { from: "state", to: "zip" },
  });
});

test("buildChange: preserves prior (wrong) coords in 'from'", () => {
  const org = { id: "org-2", lat: 39.0, lng: -98.0, geo_precision: "state" };
  const change = buildChange(org, [18.1806, -66.75]);
  assert.equal(change.lat.from, 39.0);
  assert.equal(change.lng.from, -98.0);
  assert.equal(change.geo_precision.from, "state");
  assert.equal(change.geo_precision.to, "zip");
});

test("zcta.json: exists, parses, has >30000 keys", () => {
  assert.ok(fs.existsSync(ZCTA_PATH), `expected ${ZCTA_PATH} to exist — run scripts/build-zcta.py`);
  const raw = fs.readFileSync(ZCTA_PATH, "utf8");
  const table = JSON.parse(raw);
  const keys = Object.keys(table);
  assert.ok(keys.length > 30000, `expected >30000 ZCTA entries, got ${keys.length}`);
});

test("zcta.json: spot-check a known zip resolves to plausible coords", () => {
  const table = JSON.parse(fs.readFileSync(ZCTA_PATH, "utf8"));
  const coords = table["55414"]; // Minneapolis, MN
  assert.ok(coords, "expected zip 55414 to be present");
  const [lat, lng] = coords;
  // Continental US + territories (AK/HI/PR/GU/VI/AS) bounding box.
  assert.ok(lat >= -15 && lat <= 72, `lat ${lat} out of plausible US/territory range`);
  assert.ok(lng >= -180 && lng <= -65, `lng ${lng} out of plausible US/territory range`);
});
