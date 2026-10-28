// Home page sport tiles (public/app/views/home.js): a sport with exactly one
// listing says "1 program"; any other count says "N programs". That is the
// wording the sport page already uses (public/app/views/sport.js). The view
// itself needs a browser, so the wording is checked at the seam, in the
// source of sports().
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

const home = read("public/app/views/home.js");
const start = home.indexOf("function sports(");
const sportsFn = home.slice(start, home.indexOf("\nfunction ", start + 1));

test("home page sport tiles use the singular for exactly one program", () => {
  assert.match(sportsFn, /count === 1 \? "1 program" : count \+ " programs"/);
  assert.doesNotMatch(sportsFn, /\$\{count\} programs/);
});

test("the home tile wording matches the sport page wording", () => {
  const sport = read("public/app/views/sport.js");
  assert.match(sport, /=== 1 \? "1 program" : [\w.]+ \+ " programs"/);
  for (const literal of ['"1 program"', '" programs"']) {
    assert.ok(sportsFn.includes(literal), `home.js uses ${literal}`);
    assert.ok(sport.includes(literal), `sport.js uses ${literal}`);
  }
});
