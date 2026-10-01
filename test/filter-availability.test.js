import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
function source(name){const start=html.indexOf('function '+name+'(');return html.slice(start,html.indexOf('\n}',start)+2);}
function setup(programs){
  const state={sport:'all',q:'',near:null,dist:'any',cost:'any',level:'any',sort:'rec',see:null,filtersOpen:true};
  const context=vm.createContext({state,PROGRAMS:programs.map(p=>({name:'Program',sportLabel:'Sport',levels:[],...p})),DATA_LIVE:true,visitorLocation:null,programDistance:p=>p.dist,isZipQuery:()=>false});
  vm.runInContext(['filtered','filtersPanel'].map(source).join('\n'),context);
  return {state,context,panel:()=>vm.runInContext('filtersPanel()',context)};
}
test('no usable cost or distance options means neither heading nor controls',()=>{
  for(const records of [[],[{cost:null,dist:null}],[{cost:'Paid',free:false,dist:50}]]){
    const {panel}=setup(records);const out=panel();
    assert.doesNotMatch(out,/Cost|Distance|data-cost|data-dist/);
  }
});
test('cost and distance are independently available, including measured live distances',()=>{
  const cost=setup([{free:true}]).panel();assert.match(cost,/Cost/);assert.doesNotMatch(cost,/Distance/);
  const distance=setup([{dist:8}]).panel();assert.doesNotMatch(distance,/Cost/);assert.match(distance,/Distance/);
  assert.doesNotMatch(distance,/data-dist="s"/);assert.match(distance,/data-dist="m"/);assert.match(distance,/data-dist="l"/);
});
test('switching sport or search recalculates options without rebuilding the whole view',()=>{
  const {state,panel}=setup([{sport:'basketball',free:true,dist:3},{sport:'cycling',free:false,dist:null}]);
  state.sport='basketball';assert.match(panel(),/Cost/);assert.match(panel(),/Distance/);
  state.sport='cycling';assert.doesNotMatch(panel(),/Cost|Distance/);
  state.sport='all';state.q='no matches';assert.doesNotMatch(panel(),/Cost|Distance/);
});
test('active filters remain clearable when no matches are left',()=>{
  const {state,panel}=setup([]);state.cost='free';state.dist='s';
  assert.match(panel(),/data-cost="any"/);assert.match(panel(),/data-dist="any"/);
});
test('availability ignores active cost/distance restrictions and does not mutate state',()=>{
  const {state,context,panel}=setup([{free:false,dist:8},{free:true,dist:20},{free:true,dist:null}]);
  state.dist='m';state.cost='free';
  assert.equal(vm.runInContext('filtered().length',context),0);
  assert.match(panel(),/data-dist="l"/);assert.match(panel(),/data-cost="free"/);
  assert.equal(state.dist,'m');assert.equal(state.cost,'free');
});
