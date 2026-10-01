import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
function source(name){
  const start=html.indexOf('function '+name+'(');
  assert.ok(start>=0);
  return html.slice(start,html.indexOf('\n}',start)+2);
}
for(const live of [false,true])test(`Closest programs preserves distance order across sports (live=${live})`,()=>{
  const pool=[
    {id:'tennis',sport:'tennis',dist:94.9},
    {id:'cycling',sport:'cycling',dist:90.9},
    {id:'unknown',sport:'tennis',dist:null},
    {id:'farther',sport:'basketball',dist:125.2},
    {id:'equal',sport:'cycling',dist:94.9},
    ...Array.from({length:10},(_,i)=>({id:'distant-'+i,sport:'tennis',dist:200+i})),
  ].map(p=>({levels:[],freshness:0,...p}));
  let closest;
  const context=vm.createContext({DATA_LIVE:live,filtered:()=>pool,
    frow:(title,_subtitle,programs)=>{if(title==='Closest programs') closest=programs;return title;},
    ctaBand:()=>''});
  vm.runInContext(source('diversify')+'\n'+source('feedRows')+'\nfeedRows();',context);
  assert.equal(closest[0].id,'cycling');
  assert.equal(closest[1].dist,94.9);
  assert.equal(closest.length,live?12:pool.length);
  for(let i=1;i<closest.length;i++) assert.ok((closest[i-1].dist??Infinity)<=(closest[i].dist??Infinity));
  if(!live)assert.equal(closest.at(-1).id,'unknown');
  assert.equal(pool[0].id,'tennis');
});
