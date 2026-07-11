// classify lane tests (T02). Style follows test/pipeline-contracts.test.js.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { classifyOrg, classifyPage } from "../src/lanes/classify.js";
import { GAZETTEER } from "../data/gazetteer.js";

const org = (fields) => ({ name: "", description: "", website_url: null, ...fields });

test("classifyOrg: name hit on a known sport -> sledhockey, confidence 0.85", () => {
  const result = classifyOrg(org({ name: "Greater Chicago Sled Hockey Association" }), GAZETTEER);
  assert.ok(result);
  assert.deepEqual(result.sports, ["sledhockey"]);
  assert.equal(result.confidence, 0.85);
  assert.equal(result.hits[0].field, "name");
});

test("classifyOrg: word-boundary traps (para/parade, rowing/growing) -> null", () => {
  const result = classifyOrg(
    org({
      name: "Paradise Parade Foundation of Growing Hope",
      description: "community programs",
    }),
    GAZETTEER
  );
  assert.equal(result, null);
});

test("classifyOrg: description-only hit -> confidence 0.7", () => {
  const result = classifyOrg(
    org({
      name: "Lakeside Community Center",
      description: "We offer sled hockey clinics every winter for local youth.",
    }),
    GAZETTEER
  );
  assert.ok(result);
  assert.deepEqual(result.sports, ["sledhockey"]);
  assert.equal(result.confidence, 0.7);
  assert.equal(result.hits.every((h) => h.field === "description"), true);
});

test("classifyOrg: multi-sport name -> basketball and tennis, basketball primary", () => {
  const result = classifyOrg(
    org({ name: "Adaptive Basketball & Wheelchair Tennis Club" }),
    GAZETTEER
  );
  assert.ok(result);
  assert.ok(result.sports.includes("basketball"));
  assert.ok(result.sports.includes("tennis"));
  assert.equal(result.sports[0], "basketball");
  assert.equal(result.confidence, 0.85);
});

test("gazetteer hygiene: no entry has a bare ambiguous term", () => {
  const banned = new Set(["para", "adaptive", "sports", "track"]);
  for (const entry of GAZETTEER) {
    for (const term of entry.terms) {
      assert.ok(
        !banned.has(term.trim().toLowerCase()),
        `sport_key ${entry.sport_key} has bare ambiguous term "${term}"`
      );
    }
  }
});

test("gazetteer hygiene: every sport_key is seeded in data/sports-seed.sql", () => {
  const seedPath = fileURLToPath(new URL("../data/sports-seed.sql", import.meta.url));
  const seedText = readFileSync(seedPath, "utf8");
  for (const entry of GAZETTEER) {
    assert.ok(
      seedText.includes(`'${entry.sport_key}'`),
      `sport_key ${entry.sport_key} missing from data/sports-seed.sql`
    );
  }
});

test("classifyPage: gazetteer over page text, 0.7, multi-label; script/style stripped", () => {
  const html = `<html><head><style>.rowing{color:red}</style>
    <script>var x = "wheelchair basketball in js should not count via script strip? it is stripped";</script>
    </head><body><h1>Our Programs</h1>
    <p>We offer wheelchair basketball, sled hockey, and adaptive skiing for all ages.</p></body></html>`;
  const r = classifyPage(html, GAZETTEER);
  assert.ok(r, "expected page hits");
  assert.equal(r.confidence, 0.7);
  assert.ok(r.sports.includes("basketball"));
  assert.ok(r.sports.includes("sledhockey"));
  assert.ok(r.sports.includes("skiing"));
  assert.ok(!r.sports.includes("rowing"), "style content must be stripped");
});

test("classifyPage: no signal -> null", () => {
  assert.equal(classifyPage("<p>We help the community thrive.</p>", GAZETTEER), null);
});
