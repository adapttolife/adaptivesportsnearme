import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const start = html.indexOf('function updateHeaderSearch()');
const update = html.slice(start, html.indexOf('function scrollToResults()', start));

function setup() {
  let hidden, focused;
  const hero = {bounds:{height:54,bottom:400},getBoundingClientRect(){return this.bounds;}};
  const header = {
    classList:{toggle(name,value){assert.equal(name,'hide-search');hidden=value;}},
    querySelector:()=>({contains:element=>['q','locBtn'].includes(element?.id)}),
  };
  const document = {
    activeElement:{id:''},
    querySelector:selector=>selector === '.hdr' ? header : hero,
    getElementById:id=>({focus:options=>{focused={id,options};}}),
  };
  const context=vm.createContext({document});
  vm.runInContext(update,context);
  return {hero,document,run(){vm.runInContext('updateHeaderSearch()',context);return hidden;},focus:()=>focused};
}

test('header waits for the last pixel of the hero search and hides again when scrolling back',()=>{
  const s=setup();
  for(const [bottom,hidden] of [[400,true],[100,true],[0.5,true],[0,false],[-54,false],[1,true]]) {
    s.hero.bounds.bottom=bottom;
    assert.equal(s.run(),hidden,`hero bottom ${bottom}`);
  }
});

test('mobile hidden hero and pages without hero retain header search',()=>{
  const s=setup();
  s.hero.bounds={height:0,bottom:0}; assert.equal(s.run(),false);
  s.document.querySelector=selector=>selector === '.hdr' ? {classList:{toggle:(_,v)=>assert.equal(v,false)}} : null;
  s.run();
});

test('header focus does not allow duplicate search bars and transfers without scrolling',()=>{
  for(const [id,target] of [['q','qHero'],['locBtn','hlocBtn']]) {
    const s=setup(); s.document.activeElement={id};
    assert.equal(s.run(),true);
    assert.equal(s.focus().id,target); assert.equal(s.focus().options.preventScroll,true);
  }
});

test('typing in hero retains focus and selection after rendering without forcing header visible',()=>{
  const marker='if (e.target.id !== "qHero") return;';
  const pos=html.indexOf(marker);
  const begin=html.lastIndexOf('document.addEventListener("input"',pos);
  const end=html.indexOf('document.addEventListener("keydown"',pos);
  let handler,focused=false,selection,updates=0;
  const old={id:'qHero',value:'cycling',selectionStart:3,selectionEnd:5};
  const replacement={id:'qHero',focus:()=>{focused=true;},setSelectionRange:(...args)=>{selection=args;}};
  const document={activeElement:old,addEventListener:(_,fn)=>{handler=fn;},getElementById:id=>id==='qHero'?replacement:{value:''}};
  const state={};
  const context=vm.createContext({document,state,noteZipFromQuery:()=>false,
    searchRender:()=>{document.activeElement={};},updateHeaderSearch:()=>{updates++;}});
  vm.runInContext(html.slice(begin,end),context);
  handler({target:old});
  assert.equal(state.q,'cycling'); assert.equal(focused,true);
  assert.deepEqual(selection,[3,5]); assert.equal(updates,1);
});
