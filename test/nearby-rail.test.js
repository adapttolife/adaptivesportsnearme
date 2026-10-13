import { cssIncludes } from './helpers/css.js';
// Nearby/related strip is an Airbnb-style horizontal rail on both templates.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const styles = readFileSync(join(root, "public/styles.css"), "utf8");
const index = readFileSync(join(root, "public/index.html"), "utf8");

test("in-app sheet relatedRow is one frow-scroll rail, not cardGrid", () => {
  const fnAt = index.indexOf("function relatedRow(");
  assert.ok(fnAt > 0);
  const chunk = index.slice(fnAt, index.indexOf("function saveButton(", fnAt));
  assert.ok(chunk.includes("frow-scroll"));
  assert.ok(chunk.includes("cardItem"));
  assert.ok(!chunk.includes("cardGrid("));
  // "Nearby" only within 100 miles; farther is "More" (NEARBY_MILES in program-page.js).
  assert.ok(chunk.includes('"Nearby "') && chunk.includes('"More "') && chunk.includes("<h2>"));
  assert.ok(!chunk.includes("See all"));
  assert.ok(!chunk.includes("frow-sub"));
});

test("in-app sheet nearby cards are 78vw on mobile, 4-up-ish rail on desktop", () => {
  assert.ok(cssIncludes(styles, ".sheet .nearby .frow-scroll>.pcard{flex:0 0 78vw;width:78vw;max-width:none;}"));
  assert.ok(cssIncludes(styles, ".sheet .nearby .frow-scroll>.pcard{flex:0 0 calc((100% - 48px)/4.2);width:calc((100% - 48px)/4.2);}"));
  assert.ok(!cssIncludes(styles, ".sheet .nearby .grid"));
});

// The sheet's trust line is plain words from public/listing-art.js; the old
// "listed" line and its helpers, and the cold "Unverified" badge, stay gone.
test("in-app sheet trust line comes from listing-art.js, never an Unverified badge", () => {
  assert.ok(!index.includes("Unverified"));
  assert.ok(!index.includes("Last checked"));
  assert.ok(!index.includes("function listedLine"));
  assert.ok(!index.includes("function formatChecked"));
  assert.ok(!cssIncludes(styles, ".sheet .listed"));
  assert.ok(!index.includes('class="listed"'));
});

test("in-app sheet Directory is a 64px header control with Airbnb rhythm", () => {
  assert.ok(index.includes('<header class="bar"><a class="back" href="/" data-home>← Directory</a></header>'));
  assert.ok(cssIncludes(styles, ".sheet .bar{min-height:var(--space-header)"));
  assert.ok(cssIncludes(styles, "min-height:var(--tap)"));
  assert.ok(cssIncludes(styles, ".sheet .dhero{margin:0 0 var(--space-after-photo);}"));
  assert.ok(cssIncludes(styles, ".sheet h1") && cssIncludes(styles, "margin:0 0 var(--space-title-gap)"));
  assert.ok(cssIncludes(styles, ".sheet .row{display:flex;gap:var(--space-row);padding:var(--space-row) 0;"));
  assert.ok(cssIncludes(styles, ".sheet .nearby{margin-top:var(--space-nearby);}"));
  assert.ok(cssIncludes(styles, ".sheet .nearby h2{font-family:'DM Sans',sans-serif;font-weight:700;font-size:22px;"));
  assert.ok(index.includes('class="titleb"'));
});

