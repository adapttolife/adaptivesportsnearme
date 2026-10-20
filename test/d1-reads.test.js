import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { directorySnapshot, listPrograms, getOrg } from '../src/data.js';
import { cachedDirectoryResponse, cachedCount } from '../src/read-cache.js';
import worker from '../src/index.js';
import { _resetPlacesCache } from '../src/geo.js';

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
    const insert = sql.prepare("INSERT INTO organizations (id,name,is_public,status,created_at,updated_at,lat,lng,sport_key,website_url) VALUES (?,?,?,?, '2026','2026',40,-74,'cycling',?)");
    for (let i=0;i<450;i++) insert.run(String(i), `Program ${i}`,1,'active','https://example.org/'+i);
    insert.run('hidden','Hidden',0,'active','https://example.org/h'); insert.run('inactive','Inactive',1,'inactive','https://example.org/i');
    // Name only: nothing a person could act on, so it stays out (Alec, 2026-09-01).
    insert.run('nameonly','Name Only',1,'active',null);
    const result = await directorySnapshot(db);
    assert.equal(result.total,450); assert.equal(queries.length,1);
    assert.equal(result.items[0].lat,null); assert.equal(result.items[0].lng,null); assert.equal(result.items[0].sport,'cycling');
    assert.ok(result.items.every(p => !['hidden','inactive','nameonly'].includes(p.id)));
    // The real snapshot query still walks the public-order index, no sort.
    const plan = sql.prepare('EXPLAIN QUERY PLAN '+queries[0]).all().map(r=>r.detail).join('\n');
    assert.doesNotMatch(plan,/USE TEMP B-TREE/); assert.match(plan,/INDEX/);
    const pages = await Promise.all([0,200,400].map(offset => listPrograms(db,new URLSearchParams({limit:'200',offset:String(offset)}),{zcta:null})));
    assert.equal(pages.flatMap(p=>p.items).length,450);
    assert.equal(queries.filter(q=>q.includes('COUNT(*)')).length,1);
  } finally { sql.close(); }
});

test('public organization details expose contacts and precise locations only with publicity consent', async () => {
  const {sql,db} = database();
  try {
    sql.exec(`INSERT INTO organizations
      (id,name,is_public,status,created_at,updated_at,city,state,address,zip,lat,lng,email,phone)
      VALUES ('org','Program',1,'active','2026','2026','Denver','CO','100 Private Way','80202',39.75,-104.99,'private@example.test','555-0100')`);
    const org = await getOrg(db, 'org');
    assert.equal(org.city, 'Denver');
    assert.equal(org.state, 'CO');
    for (const key of ['lat','lng','zip','address','dist']) assert.equal(org[key], null);
    for (const key of ['email','phone']) assert.equal(Object.hasOwn(org, key), false);
    sql.exec(`INSERT INTO organizations
      (id,name,is_public,status,created_at,updated_at,city,state,address,zip,lat,lng,email,phone,publicity_consent)
      VALUES ('consented','Program',1,'active','2026','2026','Denver','CO','101 Private Way','80202',39.75,-104.99,'public@example.test','555-0101',1)`);
    const consented = await getOrg(db, 'consented');
    assert.equal(consented.zip, '80202');
    assert.equal(consented.lat, 39.75);
    assert.equal(consented.lng, -104.99);
    assert.equal(consented.email, 'public@example.test');
    assert.equal(consented.phone, '555-0101');
    assert.equal(consented.address, null);
    sql.exec(`INSERT INTO organizations
      (id,name,is_public,status,created_at,updated_at,city,state,address,address_publicity_consent)
      VALUES ('address-consented','Program',1,'active','2026','2026','Denver','CO','102 Public Way',1)`);
    assert.equal((await getOrg(db, 'address-consented')).address, '102 Public Way');
    const result = await listPrograms(db, new URLSearchParams({lat:'42.7',lng:'-73.7'}), {zcta:null});
    assert.equal(result.items.length, 3);
    assert.ok(result.items.every(item => item.dist === null));
  } finally { sql.close(); }
});

// 0007 gives a new database the column with production's definition (staging
// and production already have it; see the migration's comment).
test('publicity consent migration defaults to zero and accepts only zero or one', () => {
  const sql = new DatabaseSync(':memory:');
  try {
    sql.exec('CREATE TABLE organizations (id TEXT PRIMARY KEY)');
    sql.prepare("INSERT INTO organizations (id) VALUES ('existing')").run();
    sql.exec(read('db/migrations/0007_publicity_consent.sql'));
    sql.prepare("INSERT INTO organizations (id) VALUES ('default')").run();
    sql.prepare("INSERT INTO organizations (id, publicity_consent) VALUES ('consented', 1)").run();
    const consent = id => sql.prepare('SELECT publicity_consent AS consent FROM organizations WHERE id = ?').get(id).consent;
    assert.equal(consent('existing'), 0, 'rows from before the migration start without consent');
    assert.equal(consent('default'), 0);
    assert.equal(consent('consented'), 1);
    assert.throws(() => sql.prepare("INSERT INTO organizations (id, publicity_consent) VALUES ('invalid', 2)").run());
    assert.throws(() => sql.prepare("INSERT INTO organizations (id, publicity_consent) VALUES ('unknown', NULL)").run());
  } finally { sql.close(); }
});

test('address publicity consent migration defaults to zero and accepts only zero or one', () => {
  const sql = new DatabaseSync(':memory:');
  try {
    sql.exec('CREATE TABLE organizations (id TEXT PRIMARY KEY)');
    sql.prepare("INSERT INTO organizations (id) VALUES ('existing')").run();
    sql.exec(read('db/migrations/0012_address_publicity_consent.sql'));
    sql.prepare("INSERT INTO organizations (id) VALUES ('default')").run();
    sql.prepare("INSERT INTO organizations (id, address_publicity_consent) VALUES ('consented', 1)").run();
    const consent = id => sql.prepare('SELECT address_publicity_consent AS consent FROM organizations WHERE id = ?').get(id).consent;
    assert.equal(consent('existing'), 0);
    assert.equal(consent('default'), 0);
    assert.equal(consent('consented'), 1);
    assert.throws(() => sql.prepare("INSERT INTO organizations (id, address_publicity_consent) VALUES ('invalid', 2)").run());
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
    // The app (public/app/app.js) loads the slim directory once (/api/listings) and a
    // listing's details only on its own page (/api/organizations/:id); never the paged API.
    const app=read('public/app/app.js');
    assert.match(app,/"\/api\/listings"/);
    assert.match(app,/"\/api\/organizations\/"/);
    assert.doesNotMatch(app,/\/api\/programs/);
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

test('concurrent misses each get their own Response, never one tied to the loading request',async () => {
  // On Workers, a Response read from D1 belongs to the request that loaded it: a second request that
  // clones or reads it throws "Cannot perform I/O on behalf of a different request". Model that by
  // making the loaded Response refuse clone(), so only its owner may read it, and only once.
  const env={DB:{}},store=cache(); let reads=0;
  const load=async()=>{
    reads++; await new Promise(r=>setTimeout(r,5));
    const response=new Response(JSON.stringify({ok:true,reads}),{status:200,statusText:'OK',headers:{'Content-Type':'application/json','X-Load':'1'}});
    response.clone=()=>{throw new TypeError('Cannot perform I/O on behalf of a different request.');};
    return response;
  };
  const results=await Promise.all(Array.from({length:5},()=>cachedDirectoryResponse(req('/api/directory'),env,load,store)));
  assert.equal(reads,1);
  assert.equal(new Set(results).size,results.length);
  for(const response of results) {
    assert.equal(response.status,200); assert.equal(response.statusText,'OK');
    assert.equal(response.headers.get('X-Load'),'1');
    assert.deepEqual(await response.json(),{ok:true,reads:1});
  }
  results[0].headers.set('X-Mutated','yes');
  assert.equal(results[1].headers.get('X-Mutated'),null);
  const cached=await cachedDirectoryResponse(req('/api/directory'),env,load,store);
  assert.equal(reads,1); assert.equal(cached.headers.get('Cache-Control'),'public, max-age=300');
  assert.deepEqual(await cached.json(),{ok:true,reads:1});
  const empty=await cachedDirectoryResponse(req('/api/stats'),{DB:{}},async()=>new Response(null,{status:204}),store);
  assert.equal(empty.status,204); assert.equal(empty.body,null);
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

// /api/orgs/:id is public: the same rule as the directory, and never our own
// research files (CSV names, Google Drive links, a teammate's name).
test('a contact nobody can see does not make a listing public', async () => {
  const {sql,db} = database();
  try {
    const org = sql.prepare("INSERT INTO organizations (id,name,is_public,status,created_at,updated_at,state,email,phone,publicity_consent) VALUES (?,?,1,'active','2026','2026','GA',?,?,?)");
    org.run('33333333-3333-3333-3333-333333333333','Hidden Contact Club','coach@example.test','555-0100',0);
    org.run('44444444-4444-4444-4444-444444444444','Consenting Contact Club','coach@example.test','555-0100',1);
    const snap = await directorySnapshot(db);
    assert.deepEqual(snap.items.map(p => p.name), ['Consenting Contact Club']);
    assert.equal(await getOrg(db, '33333333-3333-3333-3333-333333333333'), null, 'not public by direct link either');
    assert.equal((await getOrg(db, '44444444-4444-4444-4444-444444444444')).email, 'coach@example.test');
  } finally { sql.close(); }
});

test('getOrg follows the public rule and returns only public sources', async () => {
  const {sql,db} = database();
  try {
    const org = sql.prepare("INSERT INTO organizations (id,name,is_public,status,created_at,updated_at,city,state,website_url,primary_data_source,verification_status,verification_method) VALUES (?,?,1,'active','2026-09-30T20:26:18Z','2026',?,?,?,?,?,?)");
    org.run('11111111-1111-1111-1111-111111111111','Atlanta Wolfpack','Atlanta','GA','https://adaptedsports.org/','csv-verified-2026-09:1lLGFuCjzt','verified','{"verification_month":"2026-09"}');
    org.run('22222222-2222-2222-2222-222222222222','Name Only',null,null,null,'US Paralympics Club Finder','unverified',null);
    const src = sql.prepare("INSERT INTO data_sources (source_id,source_name,source_organization,source_url,status) VALUES (?,?,?,?,'active')");
    src.run('s1','10_georgia_adaptive_sports_organizations.csv (verified September 2026)','Karen Atkinson','https://drive.google.com/file/d/1lLGFuCjzt/view');
    src.run('s2','11_georgia_followup.csv','Karen Atkinson','https://drive.google.com/file/d/2x/view');
    src.run('s3','US Paralympics Club Finder','U.S. Olympic & Paralympic Committee','https://www.teamusa.org');
    const link = sql.prepare("INSERT INTO organization_data_sources (organization_id,source_id) VALUES (?,?)");
    for (const s of ['s1','s2','s3']) link.run('11111111-1111-1111-1111-111111111111', s);
    const o = await getOrg(db, '11111111-1111-1111-1111-111111111111');
    assert.equal(o.primarySource, 'Adaptive Sports Near Me research');
    assert.deepEqual(o.sources, [
      { name: 'Adaptive Sports Near Me research', organization: null, url: null },
      { name: 'US Paralympics Club Finder', organization: 'U.S. Olympic & Paralympic Committee', url: 'https://www.teamusa.org' },
    ]);
    assert.ok(!JSON.stringify(o).match(/drive\.google|Karen|\.csv|csv-verified/), 'no internal source in the public record');
    assert.equal(o.verifiedMonth, '2026-09'); assert.equal(o.listedAt, '2026-09-30T20:26:18Z');
    assert.equal(await getOrg(db, '22222222-2222-2222-2222-222222222222'), null, 'a name-only row is not public by direct link either');
  } finally { sql.close(); }
});

// City centers (src/geo.js cityCenter over public/data/places.json): a listing's
// city is public text, so the center of that city is public too, and maps and
// "near you" use it. The listing's own lat/lng/zip stay behind publicity_consent.
const PLACES = { 'CO|denver': [39.762, -104.881], 'TN|franklin': [35.914, -86.852] };
function seedCities(sql) {
  const insert = sql.prepare(`INSERT INTO organizations
    (id,name,is_public,status,created_at,updated_at,city,state,zip,lat,lng,website_url,publicity_consent)
    VALUES (?,?,1,'active','2026','2026',?,?,?,?,?,?,?)`);
  insert.run('private','Denver Program','Denver','CO','80202',39.75,-104.99,'https://a.example',0);
  insert.run('consented','Franklin Program','Franklin / Middle Tennessee','TN','37064',35.92,-86.86,'https://b.example',1);
  insert.run('statewide','Statewide Program','Statewide','CO',null,null,null,'https://c.example',0);
}

test('the snapshot carries each listing\'s city center only when given the places table', async () => {
  const {sql,db} = database();
  try {
    seedCities(sql);
    const by = Object.fromEntries((await directorySnapshot(db, { places: PLACES })).items.map(p => [p.id, p]));
    assert.deepEqual(by.private.cityCenter, [39.762, -104.881]);
    assert.deepEqual(by.consented.cityCenter, [35.914, -86.852]);
    assert.equal(by.statewide.cityCenter, null, 'no city, no center; never a guess');
    // The center is the city's; the listing's own point needs consent.
    for (const key of ['lat','lng','zip','geoPrecision']) assert.equal(by.private[key], null, key);
    assert.equal(by.consented.lat, 35.92); assert.equal(by.consented.lng, -86.86); assert.equal(by.consented.zip, '37064');
    const plain = await directorySnapshot(db);
    assert.equal(plain.total, 3);
    assert.ok(plain.items.every(p => !Object.hasOwn(p, 'cityCenter')), 'no places table, no cityCenter field');
    assert.equal(plain.items.find(p => p.id === 'private').lat, null);
  } finally { sql.close(); }
});

test('/api/directory adds city centers from the places table it reads once through ASSETS', async () => {
  const {sql,db} = database();
  const fetched = [];
  let available = false;
  const ASSETS = { fetch: async (input) => {
    const url = typeof input === 'string' ? input : input.url;
    fetched.push(url);
    return available && url === 'https://assets.local/data/places.json' ? Response.json(PLACES) : new Response('missing', { status: 404 });
  } };
  _resetPlacesCache();
  try {
    seedCities(sql);
    const get = async () => (await worker.fetch(new Request('https://example.test/api/directory'), { DB: db, ASSETS }, {})).json();
    // A missing places table never breaks the directory, and is not remembered.
    const without = await get();
    assert.equal(without.ok, true); assert.equal(without.total, 3);
    assert.ok(without.items.every(p => !Object.hasOwn(p, 'cityCenter')));
    available = true;
    const first = await get();
    const denver = first.items.find(p => p.id === 'private');
    assert.deepEqual(denver.cityCenter, [39.762, -104.881]);
    assert.equal(denver.lat, null);
    await get();
    assert.deepEqual(fetched, Array(2).fill('https://assets.local/data/places.json'), 'loaded once, then reused');
  } finally { sql.close(); _resetPlacesCache(); }
});

// The slim directory (/api/listings): what lists, maps and sport pages need, nothing
// a listing's own page adds, and nothing private.
test('/api/listings carries only what lists need, works out each sport, and leaves out non-programs', async () => {
  const {sql,db} = database();
  try {
    const org = sql.prepare("INSERT INTO organizations (id,name,is_public,status,created_at,updated_at,city,state,website_url,sport,sport_key,description,email,phone,zip,lat,lng,publicity_consent,verification_status,verification_method,last_ok_at,cost_note) VALUES (?,?,1,'active','2026-10-14T14:32:17.000Z','2026',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
    org.run('11111111-1111-1111-1111-111111111111','Tampa Tennis','Tampa','FL','https://tennis.example','Wheelchair Tennis','tennis','Sports and activities: tennis.','a@b.test','555-0100','33602',27.9,-82.4,0,'verified','{"verification_month":"2026-09"}','2026-10-08T16:01:20.494Z','Free');
    org.run('22222222-2222-2222-2222-222222222222','Many Sports Club','Denver','CO','https://many.example','Multi-sport',null,'Sports and activities: wheelchair basketball; sled hockey; swimming. Athletes served: all.',null,null,null,null,null,1,'unverified',null,null,null);
    org.run('33333333-3333-3333-3333-333333333333','Donate','','','',null,null,null,null,null,null,null,null,0,'unverified',null,null,null);
    const places = { 'FL|tampa': [27.95, -82.46], 'CO|denver': [39.76, -104.88] };
    const { listingsSnapshot } = await import('../src/data.js');
    const snap = await listingsSnapshot(db, { places });
    assert.equal(snap.total, 2, 'the scraped menu row never ships');
    const by = Object.fromEntries(snap.items.map(p => [p.name, p]));
    assert.deepEqual(by['Tampa Tennis'], { id: '11111111-1111-1111-1111-111111111111', name: 'Tampa Tennis', key: 'tennis', city: 'Tampa', state: 'FL', center: [27.95, -82.46], checked: '2026-10-08', team: 1 });
    assert.deepEqual(by['Many Sports Club'].trio, ['basketball', 'sledhockey', 'swimming']);
    assert.equal(by['Many Sports Club'].key, 'multi');
    assert.equal(by['Many Sports Club'].listed, '2026-10-14', 'no check date yet: the day it was listed');
    assert.equal(by['Many Sports Club'].verified, 1, 'the program confirmed its listing');
    const text = JSON.stringify(snap);
    for (const leak of ['tennis.example', 'Sports and activities', 'a@b.test', '555-0100', '33602', 'Free', '27.9,', 'verification_month']) assert.ok(!text.includes(leak), `no ${leak} in the slim directory`);
  } finally { sql.close(); }
});

// Programs are places of their own in the slim directory (Alec, 2026-10-17: people look
// for a sport at a place). An organization whose programs are listed is shown through
// them; the placeholder "Organization not yet assigned" is never named.
test('/api/listings lists programs as places, says who runs them, and never names the placeholder', async () => {
  const {sql,db} = database();
  try {
    const org = sql.prepare("INSERT INTO organizations (id,name,org_type,is_public,status,created_at,updated_at,city,state,website_url,sport,sport_key) VALUES (?,?,?,1,'active','2026-10-01','2026',?,?,?,?,?)");
    org.run('aaaaaaaa-0000-4000-8000-000000000001','Empath Health','Nonprofit','St. Petersburg','FL','https://empath.example','Veteran meetups','veteran-meetup');
    org.run('aaaaaaaa-0000-4000-8000-000000000002','Organization not yet assigned','placeholder',null,null,null,null,null);
    org.run('aaaaaaaa-0000-4000-8000-000000000003','Tampa Tennis','Nonprofit','Tampa','FL','https://tennis.example','Wheelchair Tennis','tennis');
    const prog = sql.prepare("INSERT INTO programs (id,organization_id,name,sport,sport_key,city,state,website_url,is_public,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,1,'active','2026-10-14','2026')");
    prog.run('bbbbbbbb-0000-4000-8000-000000000001','aaaaaaaa-0000-4000-8000-000000000001','Veterans Coffee Connection','Veteran meetups','veteran-meetup','Brandon','FL','https://empath.example/coffee');
    prog.run('program-bay-area-outreach','aaaaaaaa-0000-4000-8000-000000000002','Bay Area Outreach & Recreation Program','Multi-sport',null,'Berkeley','CA','https://borp.example');
    prog.run('bbbbbbbb-0000-4000-8000-000000000003','aaaaaaaa-0000-4000-8000-000000000002','Programs',null,null,null,null,'/programs/');
    const { listingsSnapshot, getProgram } = await import('../src/data.js');
    const snap = await listingsSnapshot(db, { places: {} });
    const by = Object.fromEntries(snap.items.map(p => [p.name, p]));
    assert.equal(by['Veterans Coffee Connection'].prog, 1);
    assert.equal(by['Veterans Coffee Connection'].org, 'Empath Health', 'a program says who runs it');
    assert.equal(by['Veterans Coffee Connection'].city, 'Brandon');
    assert.equal(by['Empath Health'].progs, 1, 'an organization with listed programs is shown through them');
    assert.equal(by['Tampa Tennis'].progs, undefined, 'an organization with no programs lists as itself');
    assert.equal(by['Bay Area Outreach & Recreation Program'].prog, 1);
    assert.ok(!('org' in by['Bay Area Outreach & Recreation Program']), 'the placeholder is never named');
    assert.ok(!by['Organization not yet assigned'], 'the placeholder itself is not a listing');
    assert.ok(!by['Programs'], 'a link scraped from a site menu never ships');
    const borp = await getProgram(db, 'program-bay-area-outreach');
    assert.equal(borp.organization, null, "a program's page never names the placeholder");
    const coffee = await getProgram(db, 'bbbbbbbb-0000-4000-8000-000000000001');
    assert.equal(coffee.organization.name, 'Empath Health');
    sql.prepare("UPDATE programs SET address = ?, address_publicity_consent = 1, lat = ?, lng = ? WHERE id = ?").run('100 Public Way', 27.94, -82.46, 'bbbbbbbb-0000-4000-8000-000000000001');
    const mapped = await getProgram(db, 'bbbbbbbb-0000-4000-8000-000000000001');
    assert.equal(mapped.address, '100 Public Way');
    assert.equal(mapped.addressPublicityConsent, true);
    assert.equal(mapped.lat, 27.94);
    assert.equal(mapped.lng, -82.46);
    const res = await worker.fetch(new Request('https://example.test/api/programs/program-bay-area-outreach'), { DB: db }, {});
    assert.equal(res.status, 200, 'a readable program id loads');
    assert.equal((await res.json()).program.name, 'Bay Area Outreach & Recreation Program');
  } finally { sql.close(); }
});
