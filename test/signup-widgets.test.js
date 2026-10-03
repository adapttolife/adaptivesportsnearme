// Every newsletter form carries a Turnstile widget, and every widget gets rendered.
//
// Pinned because it broke for real: on 2026-10-02 /api/subscribe started requiring
// a token, and the drawer's newsletter form (built by JavaScript, so a static HTML
// grep never saw it) had no widget. Alec's signup from the menu failed with
// "Verification failed". These checks read the source the browser runs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SITEKEY = '0x4AAAAAADr2WPepRgjp8g-R';
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const INDEX = read('public/index.html');
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

for (const [name, src] of [['public/index.html', INDEX], ['public/site-nav.js', NAV]]) {
  test(`${name}: every newsletter form carries the ASNM Turnstile widget`, () => {
    const forms = newsletterForms(src);
    assert.ok(forms.length > 0, `${name} builds at least one newsletter form`);
    for (const form of forms) {
      assert.match(form, /cf-turnstile/, 'a newsletter form without a widget is refused by /api/subscribe');
      assert.ok(form.includes(SITEKEY), 'the widget uses the ASNM site key');
    }
  });
}

test('the homepage renders widgets in the drawer, not only in the main view', () => {
  assert.match(INDEX, /querySelectorAll\("#view \.cf-turnstile, #drawer \.cf-turnstile"\)/);
  assert.match(INDEX, /function openDrawer\(\) \{\s*renderDrawer\(\);\s*renderTurnstiles\(\);/);
});

test('a fast homepage submit waits for the token instead of failing', () => {
  assert.match(INDEX, /const tok = await turnstileToken\(form\);/);
});

test('chrome pages load Turnstile on first drawer open and render it explicitly', () => {
  assert.match(NAV, /api\.js\?render=explicit&onload=__drawerTs/);
  assert.match(NAV, /d\.classList\.add\("open"\);\s*renderDrawerTurnstile\(\);/);
  assert.match(NAV, /waitForToken\(form, 8000\)/);
});
