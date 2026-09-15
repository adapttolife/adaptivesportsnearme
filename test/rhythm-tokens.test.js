// Rhythm lock: listing HTML and shared tokens. Fail if someone tightens
// 24/64 or brings back "Unverified" / "Last checked" as UI copy.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { programPageTemplate } from "../src/program-page.js";
import { blogIndexTemplate } from "../src/blog.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tokens = readFileSync(join(root, "public/styles.css"), "utf8");
const index = readFileSync(join(root, "public/index.html"), "utf8");
const programPage = readFileSync(join(root, "src/program-page.js"), "utf8");
const blog = readFileSync(join(root, "src/blog.js"), "utf8");

const RENO = {
  id: "fc478a1c-b3a0-4828-84bf-3dd45f6dec82",
  name: "3rd Shot Pickleball Reno Adaptive",
  sport: "pickleball",
  sportLabel: "Adaptive Pickleball",
  city: "Reno",
  state: "NV",
  website: "https://3rdshotpickleball.com/home-reno",
  verification: "unverified",
  lastChecked: "2026-08-21T19:55:06Z",
};

function declared(css, name) {
  const m = css.match(new RegExp(String.raw`--${name}:\s*([^;]+);`));
  return m ? m[1].trim() : null;
}

test("styles.css locks --space-page at 24px and --space-header at 64px", () => {
  assert.equal(declared(tokens, "space-page"), "24px");
  assert.equal(declared(tokens, "space-header"), "64px");
  assert.equal(declared(tokens, "tap"), "44px");
  assert.ok(tokens.includes('Alec locked 24/32/40/48/64 on 2026-08-21'));
});

test("homepage and program-page :root keep the same 24px / 64px lock", () => {
  assert.equal(declared(tokens, "space-page"), "24px");
  assert.equal(declared(tokens, "space-header"), "64px");
  assert.equal(declared(tokens, "space-page"), "24px");
  assert.equal(declared(tokens, "space-header"), "64px");
  assert.match(tokens, /\.hdr-in\{height:var\(--space-header\)/);
  assert.match(tokens, /\.sheet \.bar\{min-height:var\(--space-header\)/);
  assert.match(tokens, /\.bar\{min-height:var\(--space-header\)/);
  assert.match(tokens, /\.wrap\{[^}]*padding:0 var\(--space-page\)/);
  assert.ok(!index.includes("clamp(24px"));
  assert.ok(!blog.includes("clamp(20px"));
});

test("listing HTML fails if it contains Unverified or Last checked", () => {
  const html = programPageTemplate(RENO);
  assert.ok(!html.includes("Unverified"));
  assert.ok(!html.includes("Last checked"));
  assert.ok(!index.includes("Unverified"));
  assert.ok(!index.includes("Last checked"));
  assert.ok(!programPage.includes("Unverified"));
  assert.ok(!programPage.includes("Last checked"));
});

test("Unverified / Last checked stay out of site-wide UI copy", () => {
  const files = [
    "public/index.html",
    "public/site-nav.js",
    "src/program-page.js",
    "src/grant-page.js",
    "src/blog.js",
    "src/index.js",
    "src/events.js",
    "src/profile.js",
  ];
  for (const rel of files) {
    const text = readFileSync(join(root, rel), "utf8");
    assert.ok(!text.includes("Unverified"), `${rel} contains Unverified`);
    assert.ok(!text.includes("Last checked"), `${rel} contains Last checked`);
  }
  const blogHtml = blogIndexTemplate([], { site: "https://example.test" });
  assert.ok(!blogHtml.includes("Unverified"));
  assert.ok(!blogHtml.includes("Last checked"));
});
