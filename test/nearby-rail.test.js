// Nearby/related strip is an Airbnb-style horizontal rail on both templates.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
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
  assert.ok(index.includes(".sheet .nearby .frow-scroll>.pcard{flex:0 0 78vw;width:78vw;max-width:none;}"));
  assert.ok(index.includes(".sheet .nearby .frow-scroll>.pcard{flex:0 0 calc((100% - 48px)/4.2);width:calc((100% - 48px)/4.2);}"));
  assert.ok(!index.includes(".sheet .nearby .grid"));
});
