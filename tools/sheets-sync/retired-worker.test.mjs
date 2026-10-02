import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import worker from './retired-worker.mjs';
test('retired Worker never reads bindings for any scheduled event',()=>{const env=new Proxy({},{get(){throw Error('binding touched')}});worker.scheduled({cron:'10,30,50 * * * *'},env);worker.scheduled({cron:'* * * * *'},env)});
test('retired Worker exposes no sync endpoint',()=>assert.equal(worker.fetch().status,404));
test('retired configuration has no schedule, routes or bindings',()=>{const c=JSON.parse(fs.readFileSync(new URL('./wrangler.json',import.meta.url)));assert.deepEqual(c.triggers.crons,[]);assert.equal(c.workers_dev,false);assert.equal(c.preview_urls,false);assert.equal(c.d1_databases,undefined);assert.equal(c.services,undefined)});
