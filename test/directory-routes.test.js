import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import worker from '../src/index.js';

const script = readFileSync(new URL('../public/directory-routes.js', import.meta.url), 'utf8');
const context = vm.createContext({ URLSearchParams });
vm.runInContext(script, context);
const routes = context.DirectoryRoutes;
const read = path => routes.read(new URL(path, 'https://example.test'), ['basketball', 'cycling', 'tennis']);

for (const path of ['/sports/basketball', '/sports/cycling?q=youth&cost=free&zip=80202',
  '/maps?sport=tennis&city=Denver', '/directory/programs', '/directory/equipment',
  '/grants?audience=program', '/events', '/profile',
  '/programs/nuggets-youth', '/programs/12345678-1234-1234-1234-123456789abc', '/grants/12345678-1234-1234-1234-123456789abc']) {
  test(`shareable route round-trips: ${path}`, () => assert.equal(routes.write(read(path)), path));
}
test('legacy query links remain supported and trailing slashes resolve', () => {
  assert.equal(routes.write(read('/?sport=cycling')), '/sports/cycling');
  assert.equal(routes.write(read('/?db=grants')), '/grants');
  assert.equal(routes.write(read('/?profile=1')), '/profile');
  assert.equal(routes.write(read('/sports/tennis/')), '/sports/tennis');
  assert.equal(read('/sports/unknown').sport, 'all');
});

test('sample program direct visits and refreshes serve the shell, even with a DB binding', async () => {
  for (const DB of [undefined, { prepare() { throw Error('Sample slug must not query D1'); } }]) {
    const env = { DB, ASSETS: { fetch: async request => new Response(new URL(request.url).pathname === '/' ? 'shell' : 'missing', { status: new URL(request.url).pathname === '/' ? 200 : 404 }) } };
    for (const path of ['/programs/nuggets-youth', '/programs/nuggets-youth/']) {
      const response = await worker.fetch(new Request('http://127.0.0.1:8787' + path), env, {});
      assert.equal(response.status, 200); assert.equal(await response.text(), 'shell');
      const state = read(path); assert.equal(state.section, 'program'); assert.equal(state.programId, 'nuggets-youth');
    }
  }
});

test('direct sample program selection survives live directory hydration', () => {
  const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
  // Execute the actual bundled sample records and detail renderer.
  const match = html.match(/const PROGRAMS\s*=\s*(\[[\s\S]*?\n\]);/);
  assert.ok(match);
  const program = html.slice(html.indexOf('function program(){'), html.indexOf('\n}', html.indexOf('function program(){')) + 2);
  const sandbox = vm.createContext({ state: read('/programs/nuggets-youth'), listingSheet: p => p.name, saveButton: () => '', relatedRow: () => '' });
  vm.runInContext('const PROGRAMS=' + match[1] + ';const FALLBACK_PROGRAMS=PROGRAMS.slice();' + program, sandbox);
  assert.equal(vm.runInContext('program()', sandbox), 'Denver Rolling Nuggets (Youth)');
  assert.equal(vm.runInContext('PROGRAMS.length=0;program()', sandbox), 'Denver Rolling Nuggets (Youth)');
  vm.runInContext("state.programId='missing'", sandbox);
  assert.match(vm.runInContext('program()', sandbox), /Program not found/);
});
test('Back to home clears selection and filters', () => {
  const state = read('/sports/cycling?q=youth&zip=80202');
  Object.assign(state, read('/programs/123'));
  assert.equal(state.programId, '123');
  Object.assign(state, read('/'));
  assert.equal(state.section, 'discover'); assert.equal(state.programId, null);
  assert.equal(state.sport, 'all'); assert.equal(state.q, ''); assert.equal(state.nearZip, '');
});
test('direct sport and directory requests load the app shell; unknown paths retain 404', async () => {
  const requested = [];
  const env = { ASSETS: { fetch: async request => { const path = new URL(request.url).pathname; requested.push(path); return new Response(path === '/' ? 'shell' : 'missing', { status: path === '/' ? 200 : 404 }); } } };
  for (const path of ['/sports/cycling', '/sports/tennis/', '/directory/programs', '/directory/grants', '/grants', '/maps', '/events', '/profile']) {
    const response = await worker.fetch(new Request('https://example.test' + path), env, {});
    assert.equal(response.status, 200); assert.equal(await response.text(), 'shell');
  }
  const response = await worker.fetch(new Request('https://example.test/sports/made-up'), env, {});
  assert.equal(response.status, 404);
  assert.equal(requested.at(-1), '/sports/made-up');
});
test('homepage inline scripts remain valid JavaScript', () => {
  const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
  for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    if (!match[0].includes('application/ld+json')) new vm.Script(match[1]);
  }
});

test('navigation adds history once, hydration adds none, and Back restores the sport', () => {
  const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
  const calls = []; const listeners = {};
  const location = new URL('https://example.test/');
  const state = read('/');
  const sandbox = vm.createContext({
    state, DirectoryRoutes: routes, SPORTS: [{ key: 'cycling' }], URL,
    location, routeReady: true, restoringRoute: false,
    history: Object.fromEntries(['pushState', 'replaceState'].map(method => [method, (_state, _title, path) => {
      calls.push({ method, path }); location.href = new URL(path, location).href;
    }])),
    window: { addEventListener: (name, fn) => { listeners[name] = fn; } },
    resolveNear: async () => { },
  });
  const sync = html.slice(html.indexOf('function syncDirectoryUrl('), html.indexOf('function linkDirectoryControls('));
  vm.runInContext(sync + '\nfunction render(){syncDirectoryUrl();}', sandbox);
  const pop = html.slice(html.indexOf("window.addEventListener('popstate'"), html.indexOf("document.addEventListener('click',e=>{", html.indexOf("window.addEventListener('popstate'")));
  vm.runInContext(pop, sandbox);
  state.sport = 'cycling'; vm.runInContext('render();render();', sandbox);
  assert.deepEqual(calls, [{ method: 'pushState', path: '/sports/cycling' }]);
  state.section = 'program'; state.programId = '123'; vm.runInContext('render()', sandbox);
  assert.equal(location.pathname, '/programs/123');
  location.href = 'https://example.test/sports/cycling'; listeners.popstate();
  assert.equal(state.section, 'discover'); assert.equal(state.sport, 'cycling');
  assert.equal(calls.length, 2);
});
