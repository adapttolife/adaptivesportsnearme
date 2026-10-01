import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
function source(name) {
  const start = html.indexOf('function ' + name + '(');
  assert.ok(start >= 0);
  return html.slice(start, html.indexOf('\n}', start) + 2);
}
function setup() {
  const title = { textContent: '' }, subtitle = { textContent: '' }, results = { innerHTML: '' };
  const state = { section: 'discover', sport: 'all', q: '', see: null, layout: 'grid' };
  const context = vm.createContext({
    state, SPORTS: [{ key: 'basketball', label: 'Basketball' }, { key: 'cycling', label: 'Cycling' }],
    esc: s => s, locLabel: () => '', DATA_LIVE: false, PROGRAMS: [],
    isFeedMode: () => state.sport === 'all' && !state.q,
    catBar: () => '<nav>Categories</nav>', feedRows: () => '<div class="feed">Feed</div>',
    filtered: () => [], seeList: () => [], toolbar: () => '', filtersPanel: () => '', cardGrid: () => '<p>Results</p>',
    afterRender: () => { }, document: {
      getElementById: id => id === 'results' ? results : null,
      querySelector: selector => selector === '.hero h1' ? title : selector === '.hero .lede' ? subtitle : null
    },
  });
  vm.runInContext(['heroTitle', 'heroSubtitle', 'heroSection', 'discover', 'renderResults'].map(source).join('\n'), context);
  return { context, state, title, subtitle, results };
}
test('hero stays above categories and results on every sport and on All sports', () => {
  const { context, state } = setup();
  for (const [sport, label] of [['all', 'sports'], ['basketball', 'Basketball'], ['cycling', 'Cycling'], ['all', 'sports']]) {
    state.sport = sport;
    const rendered = vm.runInContext('discover()', context);
    assert.equal((rendered.match(/class="hero"/g) || []).length, 1);
    assert.ok(rendered.includes('<h1>Your place in adaptive ' + label + '.</h1>'));
    assert.ok(rendered.includes('<p class="lede">Adaptive ' + label + ' programs, events, equipment and funding across the country. Search by where you are and what you want to play.</p>'));
    assert.ok(rendered.indexOf('class="hero"') < rendered.indexOf('<nav>'));
  }
  state.q = 'youth';
  assert.match(vm.runInContext('discover()', context), /class="hero"/);
});
test('in-place category updates refresh both hero lines including All sports with active filters', () => {
  const { context, state, title, subtitle } = setup();
  state.q = 'youth';
  for (const [sport, label] of [['basketball', 'Basketball'], ['cycling', 'Cycling'], ['all', 'sports']]) {
    state.sport = sport; vm.runInContext('renderResults()', context);
    assert.equal(title.textContent, 'Your place in adaptive ' + label + '.');
    assert.equal(subtitle.textContent, 'Adaptive ' + label + ' programs, events, equipment and funding across the country. Search by where you are and what you want to play.');
  }
});
test('direct sport routes and history restoration render matching hero copy', () => {
  const { context, state } = setup();
  context.URLSearchParams = URLSearchParams;
  vm.runInContext(readFileSync(new URL('../public/directory-routes.js', import.meta.url), 'utf8'), context);
  for (const [path, label] of [['/sports/basketball', 'Basketball'], ['/sports/cycling', 'Cycling'], ['/sports/basketball', 'Basketball'], ['/', 'sports']]) {
    Object.assign(state, context.DirectoryRoutes.read(new URL(path, 'https://example.test'), ['basketball', 'cycling']));
    const rendered = vm.runInContext('discover()', context);
    assert.ok(rendered.includes('<h1>Your place in adaptive ' + label + '.</h1>'));
    assert.ok(rendered.includes('<p class="lede">Adaptive ' + label + ' programs,'));
  }
});
test('unknown sport falls back to generic copy and updates tolerate absent hero nodes', () => {
  const { context, state } = setup(); state.sport = 'unknown';
  assert.equal(vm.runInContext('heroTitle()', context), 'Your place in adaptive sports.');
  assert.match(vm.runInContext('heroSubtitle()', context), /^Adaptive sports programs,/);
  context.document.querySelector = () => null;
  assert.doesNotThrow(() => vm.runInContext('renderResults()', context));
});
test('returning to unfiltered All sports rebuilds the feed instead of retaining results', () => {
  const { context, state } = setup(); let renders = 0;
  Object.assign(context, { syncDirectoryUrl() { }, linkDirectoryControls() { }, render(keepScroll) { assert.equal(keepScroll, true); renders++; } });
  vm.runInContext(source('filterChanged'), context);
  state.sport = 'all'; vm.runInContext('filterChanged()', context);
  assert.equal(renders, 1);
});
test('scroll target remains below the hero for both results and the All sports feed', () => {
  for (const hasResults of [true, false]) {
    let scroll;
    const body = { getBoundingClientRect: () => ({ top: 400 }) };
    const context = vm.createContext({
      document: {
        getElementById: () => hasResults ? body : null,
        querySelector: s => s === '.feed' ? body : { offsetHeight: s === '.hdr' ? 64 : 80 }
      },
      window: { scrollY: 0, scrollTo: options => { scroll = options; } }
    });
    vm.runInContext(source('scrollToResults') + '\nscrollToResults();', context);
    assert.equal(scroll.top, 244); assert.equal(scroll.behavior, 'smooth');
  }
});
