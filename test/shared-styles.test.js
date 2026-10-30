import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

// Blog pages are app views and use the shared app shell.
test("the app shell loads its own stylesheet once and none of the old site's", () => {
  const shell = read("public/index.html");
  assert.equal(
    (shell.match(/<link rel="stylesheet" href="\/app\/app\.css">/g) || [])
      .length,
    1,
  );
  assert.ok(
    !shell.includes("/styles.css"),
    "the old shared stylesheet would restyle the app",
  );
  assert.ok(!shell.includes("/tokens.css"));
  assert.ok(!shell.includes("<style"));
});
