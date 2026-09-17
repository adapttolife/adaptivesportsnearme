import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import gate from '../src/signup-gate.js';
import app from '../src/index.js';
test('production-bound version and workers.dev hosts cannot mutate production',async()=>{
 const env={ENV_NAME:'production'};
 const request=new Request('https://version-app.example.workers.dev/api/subscribe',{method:'POST'});
 assert.equal((await app.fetch(request,env,{})).status,403);
});
const load=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
test('preview has no production routes, crons or production D1 binding',()=>{
 const app=load('wrangler.json'),preview=load('wrangler.preview.json'),gateConfig=load('wrangler.gate.json');
 const prodIds=new Set([...app.d1_databases,...gateConfig.d1_databases].map(b=>b.database_id));
 assert.equal(app.preview_urls,false);assert.deepEqual(preview.routes,[]);assert.deepEqual(preview.triggers.crons,[]);
 for(const binding of preview.d1_databases)assert.ok(!prodIds.has(binding.database_id));
 assert.equal(app.name,'adaptivesportsnearme');assert.equal(gateConfig.name,'asnm-gate');
 assert.equal(gateConfig.main,'src/signup-gate.js');assert.equal(preview.main,'src/index.js');
 assert.equal(preview.vars.MAIL_TRANSPORT,'gmail');assert.equal(gateConfig.vars.MAIL_TRANSPORT,'gmail');
 assert.deepEqual(app.triggers.crons,['0 */2 * * *','0 * * * *']);
});
test('public gate refuses missing rate-limit infrastructure and obeys denial before side effects',async()=>{
 const request=()=>new Request('https://local.test/api/subscribe',{method:'POST',body:'em=person%40example.test',headers:{'Content-Type':'application/x-www-form-urlencoded'}});
 assert.equal((await gate.fetch(request(),{REQUIRE_FORM_LIMITER:'true'},{})).status,503);
 assert.equal((await gate.fetch(request(),{FORM_LIMITER:{limit:async()=>({success:false})}},{})).status,429);
 assert.equal((await gate.fetch(new Request('https://local.test/api/admin'),{},{})).status,404);
});
