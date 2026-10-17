// The menu (phone drawer and desktop rail, drawerList() in public/app/app.js) and the
// footer share one shape (Alec, 2026-10-17: "too messy, and dark mode should be last").
// Five doors first, each with a line saying what is behind it; then Browse, Help build
// this and About this directory; the dark mode switch last. Nothing in it changes from
// page to page, so it reads the same every time (WCAG 3.2.3).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compactCss } from "./helpers/css.js";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const app = read("public/app/app.js");
const css = compactCss(read("public/app/app.css"));
const menu = app.slice(app.indexOf("export function drawerList("), app.indexOf("function activeItem("));
const footer = app.slice(app.indexOf("export function footer()"), app.indexOf("export function notFound()"));

function inOrder(text, marks, what) {
  let at = -1;
  for (const mark of marks) {
    const i = text.indexOf(mark);
    assert.ok(i >= 0, `${what}: ${mark} is missing`);
    assert.ok(i > at, `${what}: ${mark} comes after the one before it`);
    at = i;
  }
}

test("the menu leads with five doors, then Browse, Help build this, About, and dark mode last", () => {
  inOrder(menu, [
    '"Programs near you"', '"Sports", "Find programs by sport"',
    '"Grants", "Money for gear, travel and programs"', '"Events", "Clinics, tryouts and game days"',
    '"Guides", "Getting started, and life beyond sports"',
    'sec("Browse"', '"States"', '"Organizations"',
    'sec("Help build this"', '"Add a program"', '"Add an event"', '"Claim your organization"',
    'sec("About this directory"', '"How we check listings"', '"Get the letter"',
    "data-theme-toggle",
  ], "menu");
  assert.equal(menu.lastIndexOf("sec("), menu.indexOf('sec("About this directory"'), "no group after About this directory");
});

test("the menu reads the same on every page: no recent or popular lists in it", () => {
  assert.doesNotMatch(menu, /recall\("recent"\)|topGroups|Recently viewed|avatar\(/);
});

test("sports is how people find programs: no separate Programs door in the menu or either footer", () => {
  assert.ok(!menu.includes('"/programs"'), "the menu has no Programs item");
  assert.ok(!footer.includes('"/programs"'), "the app footer has no Programs link");
  assert.ok(!read("src/site-chrome.js").includes('href="/programs"'), "the blog footer has no Programs link");
});

test("the footer has the same four groups in the same order", () => {
  inOrder(footer, ['"ft-h">Find<', '"Programs near you"', '"Sports"', '"Grants"', '"Events"', '"Guides"',
    '"ft-h">Browse<', '"States"', '"Organizations"',
    '"ft-h">Help build this<', '"ft-h">About this directory<', '"How we check listings"', '"Get the letter"', '"Accessibility"'], "footer");
});

test("Guides is what /resources is called wherever a person reads it", () => {
  const help = read("public/app/views/help.js");
  assert.match(help, /<h1 tabindex="-1">Guides<\/h1>/);
  assert.match(read("src/pages.js"), /\/\^\\\/resources\\\/\?\$\/, \(\) => \(\{ title: "Guides"/);
  assert.match(read("src/site-chrome.js"), /<a href="\/resources">Guides<\/a>/);
  for (const [file, text] of [["app.js", app], ["views/help.js", help], ["site-chrome.js", read("src/site-chrome.js")]]) {
    assert.doesNotMatch(text, />Resources<|"Resources"|Resources ·/, `${file} still shows the word Resources`);
  }
});

test("the open menu covers the header and the UserWay button", () => {
  const z = (sel) => Number((css.match(new RegExp(sel.replace(/[.#]/g, "\\$&") + "\\{[^}]*z-index:(\\d+)")) || [])[1]);
  assert.ok(z(".dr-scrim") > z("#top"), "the scrim sits above the sticky header");
  assert.ok(z(".dr-scrim") < z(".drawer"), "the drawer sits above its scrim");
  assert.ok(css.includes("body.dr-open .uwy{display:none !important;}"), "UserWay steps aside while the menu is open");
  assert.match(app, /document\.body\.classList\.add\("ov-open", "dr-open"\)/);
  assert.match(app, /document\.body\.classList\.remove\("dr-open"\)/);
});

test("dark mode is a switch with its state in aria-pressed, not words", () => {
  assert.match(menu, /<button type="button" class="dl-theme" data-theme-toggle aria-pressed="\$\{dark\}"><span>Dark mode<\/span><span class="dl-switch" aria-hidden="true"><\/span><\/button>/);
  assert.doesNotMatch(app, /dl-theme-state/);
  assert.ok(css.includes(".dl-theme[aria-pressed='true'] .dl-switch::after{translate:18px 0;"), "the knob moves when on");
});
