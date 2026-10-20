// Sport guides: one honest, plain-words entry for every sport key, with a national body
// link that is a real https address. The views that show them are checked at the seam.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { GUIDES, guideFor } from "../public/app/sport-guides.js";
import { SPORT_NAMES } from "../src/sport-names.js";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8").replace(/\r\n/g, "\n");
const FIELDS = ["what", "who", "gear", "start"];

test("every sport key has a guide and every guide is a sport key", () => {
  assert.deepEqual(Object.keys(GUIDES).sort(), Object.keys(SPORT_NAMES).sort());
  assert.equal(guideFor("basketball"), GUIDES.basketball);
  assert.equal(guideFor("not-a-sport"), null);
  assert.equal(guideFor(""), null);
});

test("each guide is complete, short, and written like a person", () => {
  for (const [key, g] of Object.entries(GUIDES)) {
    for (const f of FIELDS) {
      const v = g[f];
      assert.equal(typeof v, "string", `${key}.${f} is a string`);
      assert.ok(v.trim().length >= 5, `${key}.${f} says something`);
      assert.match(v, /\.$/, `${key}.${f} ends with a full stop`);
      assert.doesNotMatch(v, /[–—]|--| - /, `${key}.${f} has no dashes (nonprofit voice)`);
      assert.doesNotMatch(v, /\s{2,}/, `${key}.${f} has no double spaces`);
      assert.doesNotMatch(v, /\b(Everything is supplied|is supplied|supplies the rest|provide the rest|lend all of it)\b/i, `${key}.${f} makes no promise for every program`);
      assert.doesNotMatch(v, /\.\.\./, `${key}.${f} uses no three-dot ellipsis`);
    }
    assert.ok(g.what.length <= 420, `${key}.what fits in a paragraph (${g.what.length})`);
    assert.ok(g.body && typeof g.body.name === "string" && g.body.name.length > 2, `${key} names its national body`);
    assert.match(g.body.url, /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}\/[^\s"<>]*$/i, `${key} body url is a clean https address`);
  }
});

test("the sport page shows the guide on the programs tab and the organization page links back to it", () => {
  const sport = read("public/app/views/sport.js");
  assert.match(sport, /import \{ guideFor \} from "\.\.\/sport-guides\.js"/);
  assert.match(sport, /class="sp-guide"/);
  assert.match(sport, /t === "programs" \? guideBlock\(key, low\) : ""/);
  assert.match(sport, /What you need<\/dt><dd>\$\{A\.esc\(g\.gear\)\}<\/dd><dd class="sp-guide-note">Every program is different\. Check what yours provides and what it costs\.<\/dd>/, "What you need says every program is different");
  assert.match(sport, /ranked\.length >= 6 \? `<div class="sp-map">/, "the tile map needs six states before it draws");
  const program = read("public/app/views/program.js");
  assert.match(program, /import \{ guideFor \} from "\.\.\/sport-guides\.js"/);
  assert.match(program, /class="pg-sec pg-sport"/);
  assert.match(program, /This is about the sport in general\. Every organization runs things its own way/, "the organization page says the guide is general");
  assert.match(program, /\$\{wherePlay\(p\)\}\n\$\{sportIntro\(p\)\}/, "the sport intro sits after Where you'll play");
  const css = read("public/app/views/sport.css");
  assert.match(css, /\.v-sport \.sp-guide-more summary \{[^}]*min-height: 48px/, "the summary is a 48px target");
  assert.match(css, /prefers-reduced-motion: reduce/);
});
