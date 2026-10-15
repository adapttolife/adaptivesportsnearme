import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const pageModules = [
  "public/app/app.js",
  "public/app/views/events.js",
  "public/app/views/forms.js",
  "public/app/views/grants.js",
  "public/app/views/help.js",
  "public/app/views/near.js",
  "public/app/views/sports.js",
  "public/app/views/states.js",
  "public/app/views/vob.js",
  "src/grant-page.js",
  "src/program-page.js",
  "src/resource-page.js",
];

test("only the site-wide chrome renders a header landmark", () => {
  for (const path of pageModules) {
    assert.doesNotMatch(read(path), /<header\b/i, path);
  }
  assert.match(read("public/index.html"), /<header id="top"><\/header>/i);
  assert.match(read("src/site-chrome.js"), /<header class="hdr">/i);
});
