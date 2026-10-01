import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { directorySnapshot, listPrograms } from '../src/data.js';
import { cachedDirectoryResponse, cachedCount } from '../src/read-cache.js';
import worker from '../src/index.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
function database() {
  const sql = new DatabaseSync(':memory:');
  sql.exec(read('db/schema.sql'));
  sql.exec(read('db/migrations/0006_read_indexes.sql'));
  const queries = [];
  const db = { prepare(query) {
    queries.push(query);
    const statement = sql.prepare(query); let args = [];
    return { bind(...values) { args = values; return this; },
      async first() { return statement.get(...args); },
      async all() { return {results: statement.all(...args)}; } };
  } };
  return {sql, db, queries};
}

test('homepage snapshot reads the directory once without losing fields or private filtering', async () => {
  const {sql,db,queries} = database();
  try {
    const insert = sql.prepare("INSERT INTO organizations (id,name,is_public,status,created_at,updated_at,lat,lng,sport_key) VALUES (?,?,?,?, '2026','2026',40,-74,'cycling')");
    for (let i=0;i<450;i++) insert.run(String(i), `Program ${i}`,1,'active');
    insert.run('hidden','Hidden',0,'active'); insert.run('inactive','Inactive',1,'inactive');
    const result = await directorySnapshot(db);
    assert.equal(result.total,450); assert.equal(queries.length,1);
    assert.equal(result.items[0].lat,40); assert.equal(result.items[0].sport,'cycling');
    assert.ok(result.items.every(p => !['hidden','inactive'].includes(p.id)));
    const pages = await Promise.all([0,200,400].map(offset => listPrograms(db,new URLSearchParams({limit:'200',offset:String(offset)}),{zcta:null})));
    assert.equal(pages.flatMap(p=>p.items).length,450);
    assert.equal(queries.filter(q=>q.includes('COUNT(*)')).length,1);
  } finally { sql.close(); }
});

test('migration is repeatable and public order / review order use indexes without sorting', () => {
  const {sql} = database();
  try {
    sql.exec(read('db/migrations/0006_read_indexes.sql'));
    for(const query of [
      "SELECT id,name FROM organizations WHERE is_public = 1 AND status = 'active' ORDER BY (sport_key IS NULL), (state IS NULL), name LIMIT 200",
      "SELECT r.item_id,o.name FROM review_queue r LEFT JOIN organizations o ON o.id=r.organization_id WHERE r.status='pending' ORDER BY r.created_at ASC LIMIT 50",
      "SELECT * FROM organizations ORDER BY name COLLATE NOCASE LIMIT 50",
      "SELECT source_id,count(*) FROM organization_data_sources GROUP BY source_id",
    ]) {
      const plan = sql.prepare('EXPLAIN QUERY PLAN '+query).all().map(r=>r.detail).join('\n');
      assert.doesNotMatch(plan,/USE TEMP B-TREE/,query);
      assert.match(plan,/INDEX/,query);
    }
  } finally {sql.close();}
});

test('Worker serves the complete snapshot contract used by homepage hydration',async()=>{
  const {sql,db,queries}=database();
  try {
    const response=await worker.fetch(new Request('https://example.test/api/directory'),{DB:db},{});
    assert.equal(response.status,200);
    assert.deepEqual(await response.json(),{ok:true,total:0,items:[]});
    assert.equal(queries.length,1);
    const html=read('public/index.html');
    assert.match(html,/fetch\("\/api\/directory"\)/);
    assert.doesNotMatch(html,/fetch\("\/api\/programs\?limit=200/);
  } finally {sql.close();}
});

function cache() {
  const entries = new Map();
  return { async match(key) { return entries.get(key.url)?.clone(); }, async put(key,res) { entries.set(key.url,res.clone()); } };
}
const req = path => new Request('https://example.test'+path);

test('public edge cache avoids repeat reads and separates environment and query parameters',async () => {
  const store = cache(), env={DB:{},ENV_NAME:'staging'}; let reads=0;
  const load=async()=>new Response(JSON.stringify({reads:++reads}));
  const get=(path,e=env)=>cachedDirectoryResponse(req(path),e,load,store);
  await get('/api/programs?limit=200&offset=0');
  const hit=await get('/api/programs?offset=0&limit=200&utm_source=ignored');
  assert.equal(reads,1); assert.equal(hit.headers.get('Cache-Control'),'public, max-age=300');
  await get('/api/programs?offset=200&limit=200'); assert.equal(reads,2);
  await get('/api/programs?offset=0&limit=200',{DB:{},ENV_NAME:'production'}); assert.equal(reads,3);
  await get('/api/programs?lat=40&lng=-74'); await get('/api/programs?lat=39&lng=-104'); assert.equal(reads,5);
});

test('concurrent snapshot misses share one database load; failed loads are retried',async () => {
  const env={DB:{}},store=cache(); let reads=0;
  const load=async()=>{reads++; await new Promise(r=>setTimeout(r,5)); return new Response('directory');};
  const results=await Promise.all(Array.from({length:10},()=>cachedDirectoryResponse(req('/api/directory'),env,load,store)));
  assert.equal(reads,1);
  for(const response of results) assert.equal(await response.text(),'directory');
  const other={DB:{}};
  await assert.rejects(cachedDirectoryResponse(req('/api/stats'),other,async()=>{throw Error('D1 unavailable');},store));
  assert.equal(await (await cachedDirectoryResponse(req('/api/stats'),other,load,store)).text(),'directory');
});

test('private routes, writes, errors and cache failures remain uncached',async()=>{
  const env={DB:{}},store=cache(); let calls=0;
  const load=async()=>{calls++;return new Response('ok');};
  for(const path of ['/api/profile','/api/admin/queue','/api/location','/api/subscribe']) {
    await cachedDirectoryResponse(req(path),env,load,store); await cachedDirectoryResponse(req(path),env,load,store);
  }
  assert.equal(calls,8);
  for(let i=0;i<2;i++) await cachedDirectoryResponse(new Request('https://example.test/api/directory',{method:'POST'}),env,load,store);
  assert.equal(calls,10);
  for(let i=0;i<2;i++) await cachedDirectoryResponse(req('/api/directory'),env,async()=>{calls++;return new Response('failed',{status:503});},store);
  assert.equal(calls,12);
  for(const headers of [{'Set-Cookie':'session=secret'},{'Cache-Control':'private, no-store'}]) {
    for(let i=0;i<2;i++) await cachedDirectoryResponse(req('/api/directory'),env,async()=>{calls++;return new Response('private',{headers});},store);
  }
  assert.equal(calls,16);
  const broken={match(){throw Error('cache down');},put(){throw Error('cache down');}};
  assert.equal(await (await cachedDirectoryResponse(req('/api/directory'),env,load,broken)).text(),'ok');
});

test('count cache expires, isolates databases and never retains failures',async()=>{
  const original=Date.now; let clock=0,calls=0;
  Date.now=()=>clock;
  try {
    const db={prepare(){calls++;return {bind(){return this;},async first(){return {n:calls};}};}};
    await cachedCount(db,'is_public = 1',[]); await cachedCount(db,'is_public = 1',[]); assert.equal(calls,1);
    clock=300001; await cachedCount(db,'is_public = 1',[]); assert.equal(calls,2);
    await cachedCount({...db},'is_public = 1',[]); assert.equal(calls,3);
    let attempts=0;
    const failing={prepare(){if(!attempts++)throw Error('offline');return db.prepare();}};
    await assert.rejects(cachedCount(failing,'is_public = 1',[]));
    await cachedCount(failing,'is_public = 1',[]); assert.equal(attempts,2);
  } finally {Date.now=original;}
});
