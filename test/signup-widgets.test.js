// Every newsletter form carries a Turnstile widget, and every widget gets rendered.
//
// Pinned because it broke for real: on 2026-10-02 /api/subscribe started requiring
// a token, and the drawer's newsletter form (built by JavaScript, so a static HTML
// grep never saw it) had no widget. Alec's signup from the menu failed with
// "Verification failed". These checks read the source the browser runs.
//
// public/site-nav.js is the drawer on the server-rendered pages (the blog), so
// its checks stay. The old single-page app's forms in public/index.html left with
// it; the new app's forms are checked in app-shell.test.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SITEKEY = '0x4AAAAAADr2WPepRgjp8g-R';
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const NAV = read('public/site-nav.js');

function newsletterForms(src) {
  const forms = [];
  for (let i = src.indexOf('<form class="cta-sub"'); i !== -1; i = src.indexOf('<form class="cta-sub"', i + 1)) {
    const end = src.indexOf('</form>', i);
    assert.ok(end > i, 'every newsletter form template closes');
    forms.push(src.slice(i, end));
  }
  return forms;
}

test('public/site-nav.js: every newsletter form carries the ASNM Turnstile widget', () => {
  const forms = newsletterForms(NAV);
  assert.ok(forms.length > 0, 'public/site-nav.js builds at least one newsletter form');
  for (const form of forms) {
    assert.match(form, /cf-turnstile/, 'a newsletter form without a widget is refused by /api/subscribe');
    assert.ok(form.includes(SITEKEY), 'the widget uses the ASNM site key');
  }
});

test('chrome pages load Turnstile on first drawer open and render it explicitly', () => {
  assert.match(NAV, /api\.js\?render=explicit&onload=__drawerTs/);
  assert.match(NAV, /d\.classList\.add\("open"\);\s*renderDrawerTurnstile\(\);/);
  assert.match(NAV, /waitForToken\(form, 8000\)/);
});

// 2026-10-03: Alec's phone signup worked but felt "glitchy". Each check below is one
// cause found in a real iPhone WebKit run of the live menu.
const CSS = read('public/styles.css');

test('the newsletter email field is 16px, so iPhone browsers do not zoom the page on tap', () => {
  const rule = CSS.match(/\n\.cta-sub input \{([^}]*)\}/);
  assert.ok(rule, 'the shared .cta-sub input rule exists');
  const px = Number((rule[1].match(/font-size:\s*(\d+(?:\.\d+)?)px/) || [])[1]);
  assert.ok(px >= 16, `font-size ${px}px makes iOS zoom into the field`);
});

test('newsletter Turnstile runs on submit, so opening the menu never moves the layout', () => {
  assert.match(NAV, /execution: "execute"/);
  for (const form of newsletterForms(NAV)) {
    assert.doesNotMatch(form, /mt-\d+ cf-turnstile/, 'a margin on a hidden widget is dead space');
  }
});

test('every submit resets the widget first, because a Turnstile token works only once', () => {
  assert.match(NAV, /turnstile\.reset\(el\);[\s\S]{0,80}turnstile\.execute\(el\);/);
});

test('a person shown the check box gets time to tap it and is told to', () => {
  assert.match(NAV, /el\.offsetHeight > 0/);
  assert.match(NAV, /asked \? 120000 : ms/);
  assert.match(NAV, /Tap the box to finish signing up\./);
});

test('a pasted "mailto:" prefix is removed before the email is checked', () => {
  assert.match(NAV, /\.trim\(\)\.replace\(\/\^mailto:\/i, ""\);\s*if \(form\.em\) form\.em\.value = em;/);
});
