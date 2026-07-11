// Contract smoke tests (T01) — the harness itself plus pure functions that predate
// Spec 72. Lane tests land with T02–T05.
import test from "node:test";
import assert from "node:assert/strict";
import { freshness } from "../src/data.js";

test("freshness: never checked -> null", () => {
  assert.equal(freshness(null), null);
});

test("freshness: checked now -> 100, decays with half-life 45d, floor 5", () => {
  const now = Date.parse("2026-07-11T00:00:00Z");
  assert.equal(freshness("2026-07-11T00:00:00Z", now), 100);
  assert.equal(freshness("2026-05-27T00:00:00Z", now), 50); // 45 days
  assert.equal(freshness("2020-01-01T00:00:00Z", now), 5);  // floor
});
