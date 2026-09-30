import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import gate from '../src/signup-gate.js';
import app from '../src/index.js';
import staging from '../src/staging.js';
const load=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
test('staging versions target the same Worker with isolated databases and no cron handler',()=>{
 const app=load('wrangler.json'),preview=load('wrangler.preview.json'),gateConfig=load('wrangler.gate.json');
 for(const target of [app.env.staging,preview]) {
  assert.equal(target.name,app.name);
  assert.deepEqual(target.routes,[]);assert.deepEqual(target.triggers.crons,[]);
  assert.deepEqual(target.d1_databases, ['DB','INTAKE'].map(binding=>({
   binding,database_name:'asnm-db-staging',database_id:'d3f67da7-60a3-44b6-9215-28665492d3f9',
  })));
  for(const database of target.d1_databases) {
   assert.ok(!app.d1_databases.some(production=>production.database_id===database.database_id));
  }
  assert.deepEqual(target.send_email,app.send_email);
  assert.deepEqual(target.ratelimits,app.ratelimits);
  assert.deepEqual(target.vars,{...app.vars,ENV_NAME:'staging',PRELAUNCH:'false'});
  assert.equal(target.main,'src/staging.js');
 }
 assert.deepEqual(Object.keys(staging),['fetch']);
 assert.equal(app.name,'adaptivesportsnearme');assert.equal(gateConfig.name,'asnm-gate');
 assert.equal(gateConfig.main,'src/signup-gate.js');
 assert.equal(preview.vars.MAIL_TRANSPORT,'gmail');assert.equal(gateConfig.vars.MAIL_TRANSPORT,'gmail');
 assert.deepEqual(app.triggers.crons,['0 */2 * * *','0 * * * *']);
});

test('staging forwards requests and live bindings without disabling features',async t=>{
 const original=app.fetch;
 t.after(()=>{app.fetch=original;});
 const env={ENV_NAME:'staging',DB:{},INTAKE:{}};
 const ctx={waitUntil(){}};
 for(const [method,path] of [['GET','/'],['POST','/api/subscribe'],['POST','/api/submit-program'],['POST','/api/profile/favorites'],['POST','/api/admin/queue/example']]) {
  const request=new Request('https://staging-adaptivesportsnearme.adapt-to-life.workers.dev'+path,{method});
  const expected=new Response('<input><iframe></iframe><a href="https://example.com">Link</a>',{status:201});
  app.fetch=async(req,bindings,context)=>{assert.equal(req,request);assert.equal(bindings,env);assert.equal(context,ctx);return expected;};
  assert.equal(await staging.fetch(request,env,ctx),expected);
 }
});

test('staging subscription route reaches application validation and rate limiting',async()=>{
 const req=()=>new Request('https://staging-adaptivesportsnearme.adapt-to-life.workers.dev/api/subscribe',{method:'POST',body:'em=test%40example.test'});
 for(const ENV_NAME of ['staging','preview']) {
  const response=await staging.fetch(req(),{ENV_NAME,FORM_LIMITER:{limit:async()=>({success:false})}},{});
  assert.equal(response.status,429);
 }
});
test('public gate refuses missing rate-limit infrastructure and obeys denial before side effects',async()=>{
 const request=()=>new Request('https://local.test/api/subscribe',{method:'POST',body:'em=person%40example.test',headers:{'Content-Type':'application/x-www-form-urlencoded'}});
 assert.equal((await gate.fetch(request(),{REQUIRE_FORM_LIMITER:'true'},{})).status,503);
 assert.equal((await gate.fetch(request(),{FORM_LIMITER:{limit:async()=>({success:false})}},{})).status,429);
 assert.equal((await gate.fetch(new Request('https://local.test/api/admin'),{},{})).status,404);
});

test('staging alias accepts staging-configured requests but blocks production-configured mutations',async()=>{
 const request=()=>new Request('https://staging-adaptivesportsnearme.adapt-to-life.workers.dev/api/subscribe',{method:'POST',body:'em=person%40example.test'});
 for(const config of [load('wrangler.json').env.staging,load('wrangler.preview.json')]) {
  let checked=false;
  const response=await staging.fetch(request(),{...config.vars,FORM_LIMITER:{limit:async()=>{checked=true;return {success:false};}}},{});
  assert.equal(response.status,429);
  assert.equal(checked,true);
 }
 const response=await app.fetch(request(),load('wrangler.json').vars,{});
 assert.equal(response.status,403);
});
