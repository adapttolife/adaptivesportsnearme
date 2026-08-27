import { test } from "node:test";
import assert from "node:assert/strict";
import { lintCard, inventedName, guessedCafParent, isNeverTouch, originHome, sqlQuote } from "./lib.mjs";

test("invented statewide names", () => {
  assert.equal(inventedName("Adaptive Sports Wisconsin"), true);
  assert.equal(inventedName("Wisconsin Adaptive Sports Association"), false);
});

test("guessed CAF parents", () => {
  assert.equal(guessedCafParent("CAF Wisconsin"), true);
  assert.equal(guessedCafParent("Challenged Athletes Foundation Midwest"), true);
  assert.equal(guessedCafParent("Madison Adaptive Cycling"), false);
});

test("never-touch Special Olympics California", () => {
  assert.equal(isNeverTouch("6851b8b5-7de0-4a84-b749-cbfef41e133e"), true);
  assert.equal(isNeverTouch("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"), false);
});

test("lint refuses invented add and never-touch fill", () => {
  const errors = lintCard({
    pile: { name: "test" },
    fills: [{ id: "6851b8b5-7de0-4a84-b749-cbfef41e133e", source_url: "https://example.com" }],
    adds: [{ name: "Adaptive Sports Wisconsin", source_url: "https://example.com" }],
  });
  assert.ok(errors.some((e) => /never-touch/.test(e)));
  assert.ok(errors.some((e) => /invented name/.test(e)));
});

test("lint accepts a real fill", () => {
  const errors = lintCard({
    pile: { name: "ok" },
    fills: [{ id: "11111111-2222-3333-4444-555555555555", source_url: "https://example.org/page" }],
  });
  assert.deepEqual(errors, []);
});

test("origin home", () => {
  assert.equal(originHome("https://foo.org/old/page"), "https://foo.org/");
});

test("sql quote", () => {
  assert.equal(sqlQuote("O'Brien"), "'O''Brien'");
  assert.equal(sqlQuote(null), "NULL");
});
