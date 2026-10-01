import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../public/segmented-controls.js', import.meta.url), 'utf8');
function group(attr, values) {
  const g = {
    children: [], isConnected: true, getClientRects: () => [{}], setAttribute() { },
    querySelector() { return this.children.find(child => child.className === 'seg-indicator'); }, prepend(el) { this.children.unshift(el); }
  };
  g.buttons = values.map((value, index) => ({
    tagName: 'BUTTON', active: index === 0, offsetLeft: 4 + index * 80, offsetTop: 4, offsetWidth: 78, offsetHeight: 30,
    attributes: { [attr]: value, ...(attr === 'data-gate-tab' ? { role: 'tab' } : {}) },
    hasAttribute(key) { return key in this.attributes; }, getAttribute(key) { return this.attributes[key]; }, setAttribute(key, value) { this.attributes[key] = value; },
    classList: { contains: () => g.buttons[index].active }
  }));
  g.children.push(...g.buttons);
  g.select = index => g.buttons.forEach((b, i) => { b.active = i === index; });
  return g;
}
function setup(groups, reduced = false) {
  const frames = [], animations = []; let mutation, resize;
  const document = {
    body: {}, querySelectorAll: selector => selector === '.seg-indicator' ? groups.map(g => g.querySelector()).filter(Boolean) : groups,
    createElement: () => ({ style: {}, setAttribute() { }, getAnimations() { return []; }, animate(keyframes, options) { animations.push({ keyframes, options }); } })
  };
  vm.runInNewContext(source, {
    document, window: { matchMedia: () => ({ matches: reduced, addEventListener() { } }), addEventListener() { } },
    requestAnimationFrame: fn => frames.push(fn),
    MutationObserver: class { constructor(fn) { mutation = fn; } observe() { } },
    ResizeObserver: class { constructor(fn) { resize = fn; } observe() { } unobserve() { } },
  });
  return { animations, flush() { mutation(); while (frames.length) frames.shift()(); }, resize() { resize(); while (frames.length) frames.shift()(); } };
}
for (const [attr, values] of [['data-layout', ['grid', 'map', 'list']], ['data-dbview', ['gallery', 'table']], ['data-grant-aud', ['all', 'athlete', 'program']], ['data-gate-tab', ['notify', 'program']]]) {
  test(`${attr} has one background which moves to the selected option`, () => {
    const g = group(attr, values), x = setup([g]);
    assert.equal(x.animations.length, 0);
    g.select(1); x.flush();
    assert.equal(g.children.filter(el => el.className === 'seg-indicator').length, 1);
    assert.equal(x.animations.length, 1);
    assert.equal(x.animations[0].keyframes[0].transform, 'translate(4px, 4px)');
    assert.equal(x.animations[0].keyframes[1].transform, 'translate(84px, 4px)');
    const aria = attr === 'data-gate-tab' ? 'aria-selected' : 'aria-pressed';
    assert.equal(g.buttons[0].attributes[aria], 'false'); assert.equal(g.buttons[1].attributes[aria], 'true');
    x.flush(); assert.equal(x.animations.length, 1);
  });
}
test('rerendered controls animate from the previous selection', () => {
  const groups = [group('data-dbview', ['gallery', 'table'])], x = setup(groups);
  groups[0].isConnected = false; groups[0] = group('data-dbview', ['gallery', 'table']); groups[0].select(1); x.flush();
  assert.equal(x.animations.length, 1); assert.equal(groups[0].querySelector().style.transform, 'translate(84px, 4px)');
});
test('reduced motion updates immediately and resizing follows button dimensions', () => {
  const g = group('data-layout', ['grid', 'map', 'list']), x = setup([g], true);
  g.select(2); x.flush(); assert.equal(x.animations.length, 0);
  assert.equal(g.querySelector().style.transform, 'translate(164px, 4px)');
  g.buttons[2].offsetWidth = 95; g.buttons[2].offsetLeft = 180; x.resize();
  assert.equal(g.querySelector().style.width, '95px'); assert.equal(g.querySelector().style.transform, 'translate(180px, 4px)');
});
