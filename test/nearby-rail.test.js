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
  const chunk = index.slice(fnAt, fnAt + 900);
  assert.ok(chunk.includes("frow-scroll"));
  assert.ok(chunk.includes("cardItem"));
  assert.ok(!chunk.includes("cardGrid("));
  assert.ok(chunk.includes("<h2>Nearby "));
  assert.ok(!chunk.includes("See all"));
  assert.ok(!chunk.includes("frow-sub"));
});

test("in-app sheet nearby cards are 78vw on mobile, 4-up-ish rail on desktop", () => {
  assert.ok(styles.includes(".sheet .nearby .frow-scroll>.pcard{flex:0 0 78vw;width:78vw;max-width:none;}"));
  assert.ok(styles.includes(".sheet .nearby .frow-scroll>.pcard{flex:0 0 calc((100% - 48px)/4.2);width:calc((100% - 48px)/4.2);}"));
  assert.ok(!styles.includes(".sheet .nearby .grid"));
});

test("in-app sheet has no verification/trust line", () => {
  assert.ok(!index.includes("Unverified"));
  assert.ok(!index.includes("Last checked"));
  assert.ok(!index.includes("function listedLine"));
  assert.ok(!index.includes("function formatChecked"));
  assert.ok(!styles.includes(".sheet .listed"));
  assert.ok(!index.includes('class="listed"'));
});

test("in-app sheet Directory is a 64px header control with Airbnb rhythm", () => {
  assert.ok(index.includes('<header class="bar"><a class="back" href="/" data-home>← Directory</a></header>'));
  assert.ok(styles.includes(".sheet .bar{min-height:var(--space-header)"));
  assert.ok(styles.includes("min-height:var(--tap)"));
  assert.ok(styles.includes(".sheet .dhero{margin:0 0 var(--space-after-photo);}"));
  assert.ok(styles.includes(".sheet h1") && styles.includes("margin:0 0 var(--space-title-gap)"));
  assert.ok(styles.includes(".sheet .row{display:flex;gap:var(--space-row);padding:var(--space-row) 0;"));
  assert.ok(styles.includes(".sheet .nearby{margin-top:var(--space-nearby);}"));
  assert.ok(styles.includes(".sheet .nearby h2{font-family:'DM Sans',sans-serif;font-weight:700;font-size:22px;"));
  assert.ok(index.includes('class="titleb"'));
});

