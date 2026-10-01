import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import worker from '../src/index.js';
const source=readFileSync(new URL('../public/location.js',import.meta.url),'utf8');
function detector(){const context=vm.createContext({AbortSignal});vm.runInContext(source,context);return context.detectVisitorLocation;}
const ip={city:'Boston',region:'MA',lat:42.36,lng:-71.06};
test('Troy searches keep distant programs, sort by distance, and put unknown distances last',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const fn=name=>{const start=html.indexOf('function '+name+'(');return html.slice(start,html.indexOf('\n}',start)+2);};
  const state={sport:'all',q:'',near:null,nearZip:'',nearCity:'',dist:'any',cost:'any',level:'any',sort:'rec',see:'open'};
  const troy={lat:42.7284,lng:-73.6918};
  const sample={id:'sample',city:'Denver, CO',dist:5,status:'Open'};
  const denver={id:'denver',city:'Denver, CO',lat:39.7392,lng:-104.9903,status:'Open'};
  const local={id:'troy',city:'Troy, NY',...troy,status:'Open'};
  const context=vm.createContext({state,DATA_LIVE:false,visitorLocation:troy,PROGRAMS:[sample,denver,local],isZipQuery:()=>true});
  vm.runInContext(['milesBetween','programDistance','filtered','seeList','empty'].map(fn).join('\n'),context);
  for(const live of [false,true]){
    context.DATA_LIVE=live;
    assert.equal(vm.runInContext('filtered().map(p=>p.id).join()',context),'troy,denver,sample');
    assert.equal(vm.runInContext('seeList().map(p=>p.id).join()',context),'troy,denver,sample');
  }
  state.q='12180';state.nearZip='12180';state.near=null;
  assert.equal(vm.runInContext('filtered().length',context),3);
  assert.equal(vm.runInContext('filtered().every(p=>p.dist===null)',context),true);
  state.near={...troy,zip:'12180'};
  assert.equal(vm.runInContext('filtered().map(p=>p.id).join()',context),'troy,denver,sample');
  state.dist='s';
  assert.equal(vm.runInContext('filtered().map(p=>p.id).join()',context),'troy');
  state.dist='any';
  context.DATA_LIVE=false;context.PROGRAMS=[sample];state.nearZip='';state.near=null;state.q='';
  assert.equal(vm.runInContext('filtered().length',context),1);
  assert.equal(vm.runInContext('filtered()[0].dist',context),null);
});
test('ZIP resolution clears old coordinates and ignores stale responses',async()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const start=html.indexOf('async function resolveNear(');
  const code=html.slice(start,html.indexOf('\n}',start)+2);
  const pending=[];
  const state={nearZip:'12180',nearCity:'',near:{lat:39.7392,lng:-104.9903}};
  const context=vm.createContext({state,nearToken:0,URLSearchParams,fetch:()=>new Promise(resolve=>pending.push(resolve))});
  vm.runInContext(code,context);
  const first=context.resolveNear();assert.equal(state.near,null);
  state.nearZip='10001';const second=context.resolveNear();
  pending[0](Response.json({ok:true,near:{zip:'12180',lat:42.7,lng:-73.7}}));await first;
  assert.equal(state.near,null);
  pending[1](Response.json({ok:true,near:{zip:'10001',lat:40.75,lng:-74}}));await second;
  assert.equal(state.near.zip,'10001');
  state.nearZip='12180';const third=context.resolveNear();
  pending[2](Response.json({ok:false}));await third;assert.equal(state.near,null);
});
test('card distances follow location changes and never reuse sample distances',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const fn=name=>{const start=html.indexOf('function '+name+'(');return html.slice(start,html.indexOf('\n}',start)+2);};
  const state={near:null,nearZip:'',nearCity:''};
  const context=vm.createContext({state,visitorLocation:{lat:40.7128,lng:-74.006},
    program:{lat:39.7392,lng:-104.9903,dist:5},sample:{dist:5}});
  // cardLine is a single-line function; include only its own line.
  const card=html.split('\n').find(line=>line.startsWith('function cardLine('));
  vm.runInContext(fn('milesBetween')+'\n'+fn('programDistance')+'\n'+card,context);
  const distance=vm.runInContext('programDistance(program)',context);
  assert.ok(distance>1600&&distance<1650);
  assert.equal(vm.runInContext('cardLine(program)',context),distance+' mi away');
  assert.equal(vm.runInContext('cardLine(sample)',context),'');
  context.visitorLocation={lat:39.7392,lng:-104.9903};
  assert.equal(vm.runInContext('cardLine(program)',context),'0 mi away');
  state.near={lat:40.7128,lng:-74.006};
  assert.equal(vm.runInContext('programDistance(program)',context),distance);
  state.near=null;state.nearZip='10001';
  assert.equal(vm.runInContext('cardLine(program)',context),'');
  state.nearZip='';context.program.lat=NaN;
  assert.equal(vm.runInContext('cardLine(program)',context),'');
});
test('IP location is applied before requesting precise location',async()=>{
  const seen=[];
  const final=await detector()(value=>seen.push(value),{
    fetch:async(url,options)=>{assert.equal(url,'/api/location');assert.equal(options.cache,'no-store');return Response.json(ip);},
    geolocation:{getCurrentPosition(ok,_fail,options){assert.equal(seen[0].label,'Boston, MA');assert.equal(options.enableHighAccuracy,true);ok({coords:{latitude:42.4,longitude:-71.1}});}},
  });
  assert.equal(seen.length,2);assert.equal(final.source,'browser');assert.equal(final.lat,42.4);
});
test('denied browser access retains IP location',async()=>{
  const final=await detector()(()=>{},{fetch:async()=>Response.json(ip),geolocation:{getCurrentPosition(_ok,fail){fail({code:1});}}});
  assert.equal(final.label,'Boston, MA');assert.equal(final.source,'ip');
});
test('missing IP and denied or unsupported browser location fall back to Denver',async()=>{
  for(const geolocation of [null,{getCurrentPosition(_ok,fail){fail({code:3});}}]){
    const final=await detector()(()=>{},{fetch:async()=>{throw Error('offline');},geolocation});
    assert.equal(final.label,'Denver, CO');assert.equal(final.source,'fallback');assert.equal(final.lat,39.7392);
  }
});
test('browser location works without IP metadata and rejects invalid coordinates',async()=>{
  for(const lat of [40,NaN,91]){
    const final=await detector()(()=>{},{fetch:async()=>Response.json({city:null}),geolocation:{getCurrentPosition(ok){ok({coords:{latitude:lat,longitude:-75}});}}});
    assert.equal(final.source,lat===40?'browser':'fallback');
  }
});
test('IP endpoint returns only location fields and forbids caching',async()=>{
  const request=new Request('https://example.test/api/location');
  Object.defineProperty(request,'cf',{value:{city:'Boston',regionCode:'MA',latitude:'42.36',longitude:'-71.06',country:'US'}});
  const response=await worker.fetch(request,{},{});
  assert.equal(response.headers.get('Cache-Control'),'private, no-store');
  assert.deepEqual(await response.json(),ip);
  const local=await worker.fetch(new Request('https://example.test/api/location'),{},{});
  assert.deepEqual(await local.json(),{city:null,region:null,lat:null,lng:null});
});
test('detected coordinates sort all live programs while explicit locations win',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const fn=name=>{const start=html.indexOf('function '+name+'(');return html.slice(start,html.indexOf('\n}',start)+2);};
  const state={sport:'all',q:'',near:null,nearZip:'',nearCity:'',dist:'any',cost:'any',level:'any',sort:'rec'};
  const context=vm.createContext({state,DATA_LIVE:true,visitorLocation:{lat:42.36,lng:-71.06},
    PROGRAMS:[{id:'boston',lat:42.36,lng:-71.06},{id:'denver',lat:39.74,lng:-104.99}]});
  vm.runInContext(fn('milesBetween')+'\n'+fn('programDistance')+'\n'+fn('filtered'),context);
  assert.equal(vm.runInContext('filtered()[0].id',context),'boston');
  assert.equal(vm.runInContext('filtered().length',context),2);
  state.near={lat:39.74,lng:-104.99};
  assert.equal(vm.runInContext('filtered()[0].id',context),'denver');
  state.near=null;state.nearZip='80202';
  assert.equal(vm.runInContext('filtered().length',context),2);
});
