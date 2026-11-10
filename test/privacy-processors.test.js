// Privacy text names the services that actually hold people's information.
// Beehiiv was dropped on 2026-11-07 (Alec): newsletter signups go to Resend
// (Faisal's 10/30 switch), signups are recorded in our contact records
// (Google Sheets via the shared intake), and the blog is the site's own.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const HELP = readFileSync(new URL("../public/app/views/help.js", import.meta.url), "utf8");

test("privacy names Resend and no longer names beehiiv", () => {
  assert.match(HELP, /Resend \(our email updates\)/);
  assert.doesNotMatch(HELP, /beehiiv/i);
});

test("privacy names where signups are recorded", () => {
  assert.match(HELP, /Google \(email, fonts and our contact records\)/);
});

test("nothing the site ships still names beehiiv", () => {
  for (const file of ["public/app/app.js", "public/app/views/letter-confirmed.js", "public/index.html"]) {
    const text = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    // Comments may record history; visible copy may not. Strip comments first.
    const visible = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/<!--[\s\S]*?-->/g, "");
    assert.doesNotMatch(visible, /beehiiv/i, file);
  }
});

test("a processor change re-dates the privacy page, and only the privacy page", async () => {
  // The page promises to update the date at the top when it changes. This pins
  // the date to the processor list: change one without the other and this fails.
  assert.match(HELP, /export const PRIVACY_UPDATED = "November 7, 2026"/);
  assert.match(HELP, /Resend \(our email updates\)/);
  assert.match(HELP, /export const TERMS_UPDATED = "October 20, 2026"/);
  assert.match(HELP, /meta: PAGES\.privacy,\s*updated: PRIVACY_UPDATED/);
  assert.match(HELP, /meta: PAGES\.terms,\s*updated: TERMS_UPDATED/);
});
