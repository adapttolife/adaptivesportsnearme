import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
function extract(name) {
  const start = html.indexOf(`function ${name}(`);
  assert.ok(start >= 0);
  const indent = html.slice(html.lastIndexOf('\n', start) + 1, start);
  const end = html.indexOf(`\n${indent}}`, start);
  return html.slice(start, end + indent.length + 2);
}
function setup(hostname, live = false) {
  const calls = [];
  const context = vm.createContext({
    DATA_LIVE: live, location: {hostname}, state: {section:'mapx',layout:'map'},
    mapToken: 0, destroyMaps:()=>{}, filtered:()=>[], seeList:()=>[],
    initLiveMap:(...args)=>calls.push(args), NAVICON:{map:''},
    isCoverVisual:()=>false, listingVisual:()=>null, thumbHtml:()=>'', locLine:()=>'', mtLine:()=>'',
  });
  vm.runInContext(['canShowLiveMap','afterRender','mapLayout'].map(extract).join('\n'), context);
  return {context,calls};
}
test('local preview initializes explorer and inline maps without live database data',()=>{
  for(const host of ['127.0.0.1','localhost','[::1]']) {
    const {context,calls}=setup(host);
    vm.runInContext('afterRender()',context);
    assert.equal(calls.length,1);
    assert.equal(calls[0][1].explorer,true);
    assert.match(vm.runInContext('mapLayout([{id:"sample",name:"Sample",sportLabel:"Cycling"}])',context),/id="livemap"/);
    context.state.section='discover'; context.filtered=()=>[{id:'sample'}];
    vm.runInContext('afterRender()',context);
    assert.equal(calls.length,2);
  }
});
test('hosted map behavior still requires live data',()=>{
  for(const live of [false,true]) {
    const {context,calls}=setup('adaptivesportsnearme.com',live);
    vm.runInContext('afterRender()',context);
    assert.equal(calls.length,live?1:0);
  }
});
