// How a listing's sports read (public/app/listing-sport.js), shared by cards, rows, the
// listing page and the server-built title, so search results say what the page says.
import test from "node:test";
import assert from "node:assert/strict";
import "../public/listing-art.js";
import { listingSport, sportsWords, sportsLabel } from "../public/app/listing-sport.js";
import { SPORT_NAMES } from "../src/sport-names.js";

const nameOf = (k) => SPORT_NAMES[k] || k;

test("one sport reads as itself; two join with and; three take the serial comma", () => {
  assert.equal(sportsWords(["Skiing"]), "Skiing");
  assert.equal(sportsWords(["Basketball", "Swimming"]), "Basketball and swimming");
  assert.equal(sportsWords(["Basketball", "Swimming", "Softball"]), "Basketball, swimming, and softball");
});

test("a sport with 'and' in its name stays readable", () => {
  assert.equal(sportsWords(["Basketball", "Track and field", "Swimming"]), "Basketball, track and field, and swimming");
  assert.equal(sportsWords(["Baseball", "Track and field"]), "Baseball and track and field");
});

test("sports past the three shown are counted, never dropped silently", () => {
  assert.equal(sportsWords(["Baseball", "Basketball", "Track and field"], 4), "Baseball, basketball, track and field, and 4 more");
  assert.equal(sportsWords(["Golf", "Tennis"], 1), "Golf, tennis, and 1 more");
});

test("a multi-sport row that names its sports gets the trio and the count of the rest", () => {
  const row = { name: "All Abilities Sports", desc: "Sports and activities: Baseball; basketball; track and field; soccer; swimming; tennis; golf. Athletes served: Children and adults with disabilities." };
  const { key, trio, more } = listingSport(row);
  assert.equal(key, "multi");
  assert.deepEqual(trio, ["baseball", "basketball", "trackfield"]);
  assert.equal(more, 4, "soccer, swimming, tennis and golf are counted");
  assert.equal(sportsLabel(row, nameOf), "Baseball, basketball, track and field, and 4 more");
});

test("one sport, or a multi-sport row that names none, keeps its own label", () => {
  assert.equal(sportsLabel({ sport: "tennis", name: "Tennis club" }, nameOf), null);
  assert.equal(sportsLabel({ name: "Adaptive Sports Center", desc: null }, nameOf), null);
  assert.equal(listingSport({ name: "Adaptive Sports Center" }).more, 0);
});
