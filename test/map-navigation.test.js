import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
function source(name) { const start = html.indexOf('function ' + name + '('); return html.slice(start, html.indexOf('\n}', start) + 2); }
test('Map view toggles open and closed without losing the selected sport', () => {
  const state = { section: 'discover', sport: 'basketball', programId: 'old', grantId: 'old' };
  const views = [];
  const context = vm.createContext({ state, render: () => views.push(state.section) });
  vm.runInContext(source('toggleMapView') + '\ntoggleMapView();toggleMapView();', context);
  assert.deepEqual(views, ['mapx', 'discover']); assert.equal(state.sport, 'basketball');
  assert.equal(state.programId, null); assert.equal(state.grantId, null);
});
test('sport selection preserves the map highlight and removes the old sport highlight', () => {
  const button = sport => ({ on: false, getAttribute: () => sport, classList: { toggle(_key, on) { this.owner.on = on; } } });
  const basketball = button('basketball'), cycling = button('cycling'), map = button(null);
  for (const b of [basketball, cycling, map]) b.classList.owner = b;
  const state = { section: 'mapx', sport: 'basketball' };
  const context = vm.createContext({
    state, document: {
      querySelectorAll: selector => {
        if (selector === '.catbar .cat[data-sport]') return [basketball, cycling];
        if (selector === '.catbar [data-mapx]') return [map];
        if (selector === '.catbar .cat') return [basketball, cycling, map];
        return [];
      }
    }
  });
  vm.runInContext(source('syncControls') + '\nsyncControls();', context);
  assert.equal(map.on, true); assert.equal(basketball.on, true);
  state.sport = 'cycling'; vm.runInContext('syncControls()', context);
  assert.equal(map.on, true); assert.equal(cycling.on, true); assert.equal(basketball.on, false);
  state.section = 'discover'; vm.runInContext('syncControls()', context); assert.equal(map.on, false);
});
test('remote development connects only to staging D1 and keeps production config unchanged', () => {
  const load = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
  const dev = load('wrangler.dev.json'), preview = load('wrangler.preview.json'), prod = load('wrangler.json');
  assert.deepEqual(dev, { ...preview, d1_databases: preview.d1_databases.map(db => ({ ...db, remote: true })) });
  for (const db of dev.d1_databases) {
    assert.equal(db.database_name, 'asnm-db-staging');
    assert.ok(!prod.d1_databases.some(p => p.database_id === db.database_id));
  }
  const { scripts } = load('package.json');
  assert.match(scripts['dev:staging'], /dev --config wrangler.dev.json/);
  assert.doesNotMatch(scripts['dev:staging'], /--local\b|--remote\b/);
  assert.match(scripts['dev:local'], /--local/);
  assert.match(scripts['deploy:staging'], /versions upload.*--preview-alias staging/);
});
