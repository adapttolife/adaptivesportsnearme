import { compactCss } from "./helpers/css.js";
// Rhythm lock: listing HTML and shared tokens. Fail if someone tightens
// 24/64 or brings back the cold "Unverified" badge. "Last checked" came back on
// purpose as a dated row (opening-day bar 5; Alec 2026-10-13: say whether a
// listing is verified), inside About this listing, below the facts.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { programPageTemplate } from "../src/program-page.js";

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
  assert.ok(tokens.includes("Alec locked 24/32/40/48/64 on 2026-08-21"));
});

test("homepage and program-page :root keep the same 24px / 64px lock", () => {
  assert.equal(declared(tokens, "space-page"), "24px");
  assert.equal(declared(tokens, "space-header"), "64px");
  assert.equal(declared(tokens, "space-page"), "24px");
  assert.equal(declared(tokens, "space-header"), "64px");
  assert.match(compactCss(tokens), /\.hdr-in\{height:var\(--space-header\)/);
  assert.match(
    compactCss(tokens),
    /\.sheet \.bar\{min-height:var\(--space-header\)/,
  );
  assert.match(compactCss(tokens), /\.bar\{min-height:var\(--space-header\)/);
  assert.match(
    compactCss(tokens),
    /\.wrap\{[^}]*padding:0 var\(--space-page\)/,
  );
  assert.ok(!index.includes("clamp(24px"));
  assert.ok(!blog.includes("clamp(20px"));
});

test("listing HTML never says Unverified; its date row sits in About this listing, after the facts", () => {
  const html = programPageTemplate(RENO);
  assert.ok(!html.includes("Unverified"));
  assert.ok(!index.includes("Unverified"));
  assert.ok(!programPage.includes("Unverified"));
  const about = html.indexOf('class="about-listing"');
  const checked = html.indexOf(">Last checked</span>");
  assert.ok(
    about > html.indexOf('class="cta"'),
    "About this listing follows the primary action",
  );
  assert.ok(checked > about, "the date row lives inside About this listing");
});

test("The word Unverified stays out of site-wide UI copy", () => {
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
  }
});
