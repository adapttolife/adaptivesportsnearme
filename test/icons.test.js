import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import { navScriptHtml } from '../src/site-chrome.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const vendor = read('public/assets/vendor/lucide-1.49.0.min.js');

// Small DOM harness using the actual vendored Lucide renderer, not mocked SVGs.
class Element {
  constructor(tag, attrs = {}) { this.tagName = tag; this.nodeType = 1; this.attrs = attrs; this.children = []; }
  get attributes() { return Object.entries(this.attrs).map(([name, value]) => ({ name, value })); }
  getAttribute(name) { return this.attrs[name] ?? null; }
  setAttribute(name, value) { this.attrs[name] = value; }
  appendChild(child) { this.children.push(child); child.parent = this; }
  matches() { return this.tagName === 'i' && 'data-lucide' in this.attrs; }
  querySelectorAll() { return this.children.flatMap(child => [...(child.matches() ? [child] : []), ...child.querySelectorAll()]); }
  replaceWith(replacement) {
    if (!this.parent) return;
    this.parent.children[this.parent.children.indexOf(this)] = replacement;
    replacement.parent = this.parent;
    this.parent = null;
  }
}
function setup(initial = []) {
  const body = new Element('body');
  initial.forEach(el => body.appendChild(el));
  let notify;
  const context = vm.createContext({
    console, document: {
      body, querySelectorAll: () => body.querySelectorAll(),
      createElementNS: (_, tag) => new Element(tag),
    }, MutationObserver: class {
      constructor(callback) { notify = callback; }
      observe() { }
    }
  });
  vm.runInContext(vendor, context);
  vm.runInContext(read('public/icons.js'), context);
  return { body, notify, context };
}

test('all UI placeholders name available Lucide icons and contain no generated SVG', () => {
  const { context } = setup();
  // Server-rendered chrome (the blog) and its drawer use <i data-lucide> placeholders.
  for (const file of ['public/site-nav.js', 'src/site-chrome.js', 'src/map-tray.js']) {
    const source = read(file);
    assert.doesNotMatch(source, /<svg\s/);
    const names = [...source.matchAll(/data-lucide="([^"]+)"/g)];
    assert.ok(names.length, file);
    for (const [, name] of names) {
      const key = name.replace(/(^|-)(\w)/g, (_, separator, letter) => letter.toUpperCase());
      assert.ok(context.lucide.icons[key], `${file}: ${name}`);
    }
  }
  const page = navScriptHtml();
  const library = page.indexOf('/assets/vendor/lucide-1.49.0.min.js');
  assert.ok(library >= 0 && library < page.indexOf('/icons.js'));
  assert.equal(JSON.parse(read('package.json')).scripts['icons:sync'], undefined);
});

// The app (public/app) draws its icons itself from window.lucide.icons, and
// icon() returns "" for a name the library does not have, so a typo silently
// drops the icon. Every name it passes, directly or as a component option.
const ICON_NAME_PATTERNS = [
  /\bicon\(\s*"([a-z0-9-]+)"/g,                                   // icon("search", 20)
  /\bicon\([^()"]*\?\s*"([a-z0-9-]+)"\s*:\s*"([a-z0-9-]+)"/g,       // icon(ok ? "badge-check" : "info")
  /\b(?:ic|icon):\s*"([a-z0-9-]+)"/g,                               // card({ ic: "plus" }), btn(..., { icon: "search" })
  /\bitem\("[^"]*",\s*[^,]+,\s*"([a-z0-9-]+)",/g,                    // drawer item(id, href, "map-pin", label)
  /\["(?:is-[a-z]+)?",\s*"([a-z0-9-]+)",/g,                          // /about rows: ["is-v", "badge-check", ...]
  /\brow\(`[^`]*`,\s*"([a-z0-9-]+)",/g,                              // listing links: row(`/update/${id}`, "pencil", ...)
  /\blink\(`[^`]*`,[^;]*?,\s*"([a-z0-9-]+)"\)/g,                     // sport counts: link(text, href, "map")
];
function appIconNames(source) {
  const names = new Set();
  for (const re of ICON_NAME_PATTERNS) for (const m of source.matchAll(re)) for (const n of m.slice(1)) if (n) names.add(n);
  return names;
}
const pascal = (name) => String(name).split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');

test('every icon the app names exists in the vendored Lucide library, which loads before the app', () => {
  const { context } = setup();
  const files = ['public/app/app.js', ...readdirSync(new URL('../public/app/views/', import.meta.url)).filter((f) => f.endsWith('.js')).map((f) => `public/app/views/${f}`)];
  const names = new Set(files.flatMap((file) => [...appIconNames(read(file))]));
  assert.ok(names.size >= 25, `found only ${names.size} icon names; the patterns no longer match the app`);
  for (const name of names) assert.ok(context.lucide.icons[pascal(name)], `public/app names a missing Lucide icon: ${name}`);
  assert.deepEqual([...appIconNames('icon("not-a-real-icon", 20)')], ['not-a-real-icon']);
  assert.equal(context.lucide.icons[pascal('not-a-real-icon')], undefined);
  const shell = read('public/index.html');
  const library = shell.indexOf('<script src="/assets/vendor/lucide-1.49.0.min.js"></script>');
  assert.ok(library > 0 && library < shell.indexOf('<script type="module" src="/app/app.js"></script>'));
});

test('runtime renders initial icons with dimensions, weight, color and classes intact', () => {
  const placeholder = new Element('i', { 'data-lucide': 'heart', width: '16', height: '16', 'stroke-width': '2.6', class: 'favorite' });
  const { body } = setup([placeholder]);
  const svg = body.children[0];
  assert.equal(svg.tagName, 'svg');
  for (const [key, value] of Object.entries({ width: '16', height: '16', 'stroke-width': '2.6', stroke: 'currentColor', fill: 'none', 'aria-hidden': 'true', focusable: 'false' })) assert.equal(svg.getAttribute(key), value);
  assert.match(svg.getAttribute('class'), /favorite/);
  assert.ok(svg.children.length);
});

test('new content renders without replacing existing SVGs or triggering a render loop', () => {
  const { body, notify } = setup([new Element('i', { 'data-lucide': 'menu' })]);
  const initial = body.children[0];
  const drawer = new Element('div');
  drawer.appendChild(new Element('i', { 'data-lucide': 'calendar-days' }));
  body.appendChild(drawer);
  notify([{ type: 'childList', addedNodes: [drawer] }]);
  const rendered = drawer.children[0];
  assert.equal(rendered.tagName, 'svg');
  notify([{ type: 'childList', addedNodes: [rendered] }]);
  assert.equal(drawer.children[0], rendered);
  assert.equal(body.children[0], initial);
  const standalone = new Element('i', { 'data-lucide': 'x', width: '14', height: '14', 'stroke-width': '2.4' });
  body.appendChild(standalone);
  notify([{ type: 'childList', addedNodes: [standalone] }]);
  assert.equal(body.children.at(-1).tagName, 'svg');
  assert.equal(body.children.at(-1).getAttribute('width'), '14');
});
