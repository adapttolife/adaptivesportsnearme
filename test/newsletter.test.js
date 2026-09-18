import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { safeNewsletterSubscribe, PUBLICATION } from '../src/newsletter.js';
import worker from '../src/index.js';
function database() {
 const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync(new URL('../db/intake-schema.sql',import.meta.url),'utf8'));
 const db={prepare(sql){let values=[];const stmt=sqlite.prepare(sql);return {bind(...v){values=v;return this;},async first(){return stmt.get(...values)||null;},async all(){return {results:stmt.all(...values)};},async run(){return {meta:{changes:Number(stmt.run(...values).changes)}};}};},async batch(statements){sqlite.exec('BEGIN');try{const r=[];for(const s of statements)r.push(await s.run());sqlite.exec('COMMIT');return r;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
 return {db,sqlite};
}
function setup(options={}) {
 const {db,sqlite}=database();let created=false;const requests=[],mail=[];
 const env={INTAKE:db,BEEHIIV_API_KEY:'test-key',BEEHIIV_PUBLICATION_ID:PUBLICATION,SEND_EMAIL:{async send(m){mail.push(m);if(options.mailFailure)throw Error('ambiguous send');return {id:'provider-'+mail.length};}}};
 const network=async(url,init={})=>{
  requests.push({url,init});
  if(options.lookupFailure && init.method!=='POST')return new Response('denied',{status:403});
  if(init.method==='POST'){created=true;if(options.createFailure)throw Error('lost create response');return Response.json({data:{id:'sub-new',status:options.status||'active'}});}
  if(url.includes(PUBLICATION)){
   if(options.existing)return Response.json({data:{id:'sub-old',status:options.existing}});
   if(created)return Response.json({data:{id:options.wrongId?'different':'sub-new',status:options.status||'active'}});
  }else if(options.legacy)return Response.json({data:{id:'sub-legacy',status:options.legacy,utm_source:'asnm-prelaunch'}});
  return new Response('',{status:404});
 };
 return {db,sqlite,env,network,requests,mail,state:()=>sqlite.prepare('SELECT * FROM newsletter_delivery_claims').all(),posts:()=>requests.filter(r=>r.init.method==='POST')};
}
async function run(options,fn){const x=setup(options),old=globalThis.fetch;globalThis.fetch=x.network;try{await fn(x);}finally{globalThis.fetch=old;x.sqlite.close();}}

test('new signup captures fields durably, suppresses beehiiv welcome and sends one custom welcome + notification',async()=>run({},async x=>{
 const r=await safeNewsletterSubscribe(x.env,' Person@Example.test ','campaign',{name:'Zoë',beta:true});assert.equal(r.ok,true);await r.welcomeJob;
 const body=JSON.parse(x.posts()[0].init.body);assert.equal(body.reactivate_existing,false);assert.equal(body.send_welcome_email,false);
 assert.deepEqual(body.custom_fields,[{name:'First Name',value:'Zoë'},{name:'Beta Tester',value:'true'}]);assert.deepEqual(body.automation_ids,[]);
 const rows=x.sqlite.prepare('SELECT * FROM intake').all();assert.equal(rows.length,1);assert.equal(rows[0].email,'person@example.test');assert.deepEqual(JSON.parse(rows[0].payload),{name:'Zoë',beta:true});
 assert.equal(x.mail.filter(m=>m.to==='person@example.test').length,1);assert.equal(x.mail.filter(m=>m.to==='hello@adapttolife.org').length,1);
 assert.equal(x.state()[0].state,'sent');assert.equal(x.sqlite.prepare('SELECT count(*) AS n FROM newsletter_send_receipts').get().n,1);
 const again=await safeNewsletterSubscribe(x.env,'person@example.test','repeat',{beta:false});assert.equal(again.existing,true);assert.equal(x.posts().length,1);assert.equal(x.mail.length,2);
}));
for(const existing of ['unsubscribed','inactive','invalid'])test(`existing ${existing} consent is preserved`,async()=>run({existing},async x=>{
 const r=await safeNewsletterSubscribe(x.env,'person@example.test','x');assert.equal(r.status,409);assert.equal(x.posts().length,0);assert.equal(x.mail.length,0);assert.equal(x.state().length,0);
}));
test('existing active user is never re-welcomed',async()=>run({existing:'active'},async x=>{assert.equal((await safeNewsletterSubscribe(x.env,'person@example.test','x')).existing,true);assert.equal(x.posts().length,0);assert.equal(x.mail.length,0);}));
test('suppressed legacy ASNM signup cannot be silently reactivated in the new publication',async()=>run({legacy:'unsubscribed'},async x=>{assert.equal((await safeNewsletterSubscribe(x.env,'person@example.test','x')).status,409);assert.equal(x.posts().length,0);}));
test('active legacy migration has no duplicate welcome',async()=>run({legacy:'active'},async x=>{const r=await safeNewsletterSubscribe(x.env,'person@example.test','x');await r.welcomeJob;assert.equal(x.state()[0].state,'legacy-no-welcome');assert.equal(x.mail.filter(m=>m.to==='person@example.test').length,0);}));
test('concurrent signup claims create one subscription and one intake record',async()=>run({},async x=>{
 // Serialize SQLite transactions like D1; interleave request lookups/claims.
 let chain=Promise.resolve();const batch=x.db.batch;x.db.batch=ss=>{const job=chain.then(()=>batch(ss));chain=job.catch(()=>{});return job;};
 const results=await Promise.all([safeNewsletterSubscribe(x.env,'person@example.test','x'),safeNewsletterSubscribe(x.env,'PERSON@example.test','x')]);
 await Promise.all(results.map(r=>r.welcomeJob));assert.equal(x.posts().length,1);assert.equal(x.sqlite.prepare('SELECT count(*) AS n FROM intake').get().n,1);assert.equal(x.mail.filter(m=>m.to==='person@example.test').length,1);
}));
test('lookup failure fails closed without creating or mailing',async()=>run({lookupFailure:true},async x=>{assert.equal((await safeNewsletterSubscribe(x.env,'person@example.test','x')).ok,false);assert.equal(x.posts().length,0);assert.equal(x.state().length,0);}));
test('lost create response preserves capture and an ambiguous claim; no blind retry',async()=>run({createFailure:true},async x=>{assert.equal((await safeNewsletterSubscribe(x.env,'person@example.test','x')).ok,false);assert.equal(x.state()[0].state,'needs-review');assert.equal(x.sqlite.prepare('SELECT count(*) AS n FROM intake').get().n,1);}));
test('ambiguous welcome keeps needs-review and is not replayed on repeat signup',async()=>run({mailFailure:true},async x=>{const r=await safeNewsletterSubscribe(x.env,'person@example.test','x');await r.welcomeJob;assert.equal(x.state()[0].state,'needs-review');const count=x.mail.length;await safeNewsletterSubscribe(x.env,'person@example.test','x');assert.equal(x.mail.length,count);}));
for(const options of [{status:'pending'},{wrongId:true}])test(`welcome requires active matching subscriber ${JSON.stringify(options)}`,async()=>run(options,async x=>{const r=await safeNewsletterSubscribe(x.env,'person@example.test','x');await r.welcomeJob;assert.equal(x.state()[0].state,'not-active-no-welcome');assert.equal(x.mail.filter(m=>m.to==='person@example.test').length,0);}));
test('unconfigured Gmail keeps capture and visible waiting-for-mail state',async()=>run({},async x=>{x.env.MAIL_TRANSPORT='gmail';const r=await safeNewsletterSubscribe(x.env,'person@example.test','x');await r.welcomeJob;assert.equal(x.state()[0].state,'waiting-for-mail');assert.equal(x.mail.length,0);}));
test('accepted welcome with lost receipt persistence stays reviewable and is not resent',async()=>run({},async x=>{
 const prepare=x.db.prepare;x.db.prepare=sql=>{const statement=prepare(sql);if(sql.startsWith('INSERT INTO newsletter_send_receipts'))statement.run=async()=>{throw Error('persistence interrupted');};return statement;};
 const result=await safeNewsletterSubscribe(x.env,'person@example.test','x');await result.welcomeJob;
 assert.equal(x.state()[0].state,'needs-review');assert.equal(x.sqlite.prepare('SELECT count(*) AS n FROM newsletter_send_receipts').get().n,0);
 await safeNewsletterSubscribe(x.env,'person@example.test','repeat');assert.equal(x.mail.filter(m=>m.to==='person@example.test').length,1);
}));
test('full newsletter flow uses Gmail for welcome and house notification, not Cloudflare',async()=>run({},async x=>{
 Object.assign(x.env,{MAIL_TRANSPORT:'gmail',GMAIL_FROM:'hello@adapttolife.org',GMAIL_CLIENT_ID:'fixture',GMAIL_CLIENT_SECRET:'fixture',GMAIL_REFRESH_TOKEN:'fixture'});
 let sends=0;globalThis.fetch=async(url,init)=>{if(url.includes('oauth2.googleapis.com'))return Response.json({access_token:'fixture',token_type:'Bearer'});if(url.includes('gmail.googleapis.com')){sends++;return Response.json({id:'gmail-fixture-'+sends});}return x.network(url,init);};
 const result=await safeNewsletterSubscribe(x.env,'person@example.test','x');await result.welcomeJob;
 assert.equal(sends,2);assert.equal(x.mail.length,0);assert.equal(x.state()[0].state,'sent');assert.equal(x.sqlite.prepare('SELECT provider FROM newsletter_send_receipts').get().provider,'gmail');
}));
test('wrong publication fails before touching network or database',async()=>run({},async x=>{x.env.BEEHIIV_PUBLICATION_ID='wrong';assert.equal((await safeNewsletterSubscribe(x.env,'person@example.test','x')).status,503);assert.equal(x.requests.length,0);assert.equal(x.state().length,0);}));
test('actual Worker route keeps background delivery alive through waitUntil',async()=>run({},async x=>{const jobs=[];const response=await worker.fetch(new Request('https://test.example/api/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({em:'person@example.test',nm:'Zoë',beta:'on'})}),x.env,{waitUntil(p){jobs.push(p);}});assert.equal(response.status,200);assert.equal(jobs.length,1);await Promise.all(jobs);assert.equal(x.state()[0].state,'sent');}));
