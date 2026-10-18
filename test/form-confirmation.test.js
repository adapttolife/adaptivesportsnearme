import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from '../src/index.js';

function setup(t, options = {}) {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(`CREATE TABLE sports(sport_key TEXT); INSERT INTO sports VALUES ('cycling');
    CREATE TABLE profiles(id TEXT PRIMARY KEY,email TEXT UNIQUE,name TEXT,state TEXT,sports_json TEXT,newsletter INTEGER,created_at TEXT,updated_at TEXT);
    CREATE TABLE submissions(kind TEXT,payload TEXT,contact_email TEXT,status TEXT,created_at TEXT);`);
  sqlite.exec(readFileSync(new URL('../db/intake-schema.sql', import.meta.url), 'utf8'));
  const DB = {
    prepare(sql) {
      const statement = sqlite.prepare(sql); let values = []; return {
        bind(...args) { values = args; return this; }, async first() { return statement.get(...values) || null; },
        async all() { return { results: statement.all(...values) }; }, async run() { return statement.run(...values); },
      };
    },
    async batch(statements) { sqlite.exec('BEGIN'); try { const r = []; for (const s of statements) r.push(await s.run()); sqlite.exec('COMMIT'); return r; } catch (e) { sqlite.exec('ROLLBACK'); throw e; } }
  };
  const sent = [], calls = [], jobs = [];
  // The house notice (hello@) and the submitter receipt are separate mail; these
  // tests are about the receipt.
  const receipts = () => sent.filter(m => m.to !== 'hello@adapttolife.org');
  const env = {
    ENV_NAME: 'staging', DB, INTAKE: DB, PROFILE_SIGNING_KEY: 'test-only-key',
    SEND_EMAIL: { async send(message) { sent.push(message); if (options.mailFailure) throw Error('uncertain send'); return { id: 'accepted' }; } }
  };
  const original = globalThis.fetch;
  globalThis.fetch = async (url) => {
    calls.push(url);
    if (url.startsWith('https://challenges.cloudflare.com/')) return Response.json({ success: false });
    throw Error('Unexpected network request');
  };
  t.after(() => { globalThis.fetch = original; sqlite.close(); });
  const ctx = { waitUntil: job => jobs.push(job) };
  const post = (path, body, cookie) => worker.fetch(new Request('https://staging-adaptivesportsnearme.adapt-to-life.workers.dev' + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify(body) }), env, ctx);
  return { env, sqlite, sent, receipts, calls, jobs, post };
}
test('new program saves and queues one escaped confirmation with the submitted name', async t => {
  const x = setup(t);
  const response = await x.post('/api/submit-program', { pn: 'Youth <basketball>', em: 'person@example.test' });
  assert.equal(response.status, 200); assert.equal(x.jobs.length, 2); await Promise.all(x.jobs);
  assert.equal(x.sqlite.prepare('SELECT count(*) AS n FROM submissions').get().n, 1);
  const [receipt] = x.receipts();
  assert.equal(x.receipts().length, 1); assert.equal(receipt.to, 'person@example.test');
  assert.equal(receipt.replyTo, 'hello@adaptivesportsnearme.com');
  assert.match(receipt.html, /Youth &lt;basketball&gt;/); assert.doesNotMatch(receipt.html, /<basketball>/);
  assert.match(receipt.text, /does not mean the program has been approved/);
});
for (const [label, body, status] of [
  ['missing email', { pn: 'Program' }, 422], ['invalid email', { pn: 'Program', em: 'invalid' }, 422],
  ['missing program', { em: 'person@example.test' }, 422], ['honeypot', { pn: 'Program', em: 'person@example.test', company: 'bot' }, 200],
]) test(`program ${label} sends no confirmation`, async t => {
  const x = setup(t); const response = await x.post('/api/submit-program', body);
  assert.equal(response.status, status); assert.equal(x.calls.length, 0); assert.equal(x.sent.length, 0); assert.equal(x.jobs.length, 0);
});
test('failed capture does not send confirmation', async t => {
  const x = setup(t); x.sqlite.exec('DROP TABLE submissions');
  const original = console.error; console.error = () => { }; t.after(() => { console.error = original; });
  assert.equal((await x.post('/api/submit-program', { pn: 'Program', em: 'person@example.test' })).status, 502);
  assert.equal(x.sent.length, 0); assert.equal(x.jobs.length, 0);
});
test('failed verification does not save or send', async t => {
  const x = setup(t); x.env.TURNSTILE_SECRET_KEY = 'fixture';
  assert.equal((await x.post('/api/submit-program', { pn: 'Program', em: 'person@example.test', cf_token: 'bad' })).status, 403);
  assert.equal(x.sent.length, 0); assert.equal(x.jobs.length, 0);
});
test('email failure preserves the saved submission and never retries the send', async t => {
  const x = setup(t, { mailFailure: true });
  assert.equal((await x.post('/api/submit-program', { pn: 'Program', em: 'person@example.test' })).status, 200);
  await Promise.all(x.jobs); assert.equal(x.receipts().length, 1);
  assert.equal(x.sqlite.prepare('SELECT count(*) AS n FROM submissions').get().n, 1);
});
test('slow confirmation does not block a saved program response', async t => {
  const x = setup(t); let finish;
  const pending = [];
  x.env.SEND_EMAIL.send = () => new Promise(resolve => { pending.push(resolve); });
  const response = await x.post('/api/submit-program', { pn: 'Program', em: 'person@example.test' });
  assert.equal(response.status, 200); assert.equal(x.jobs.length, 2);
  // Both sends were still pending when the response returned; release them.
  let settled = false; Promise.all(x.jobs).then(() => { settled = true; });
  while (!settled) { pending.splice(0).forEach(finish => finish({ id: 'accepted' })); await new Promise(r => setImmediate(r)); }
});
test('missing Gmail credentials log the delivery gap without falling back or losing the submission', async t => {
  const x = setup(t); x.env.MAIL_TRANSPORT = 'gmail'; const logs = [];
  const original = console.error; console.error = (...args) => logs.push(args); t.after(() => { console.error = original; });
  assert.equal((await x.post('/api/submit-program', { pn: 'Program', em: 'person@example.test' })).status, 200);
  await Promise.all(x.jobs); assert.equal(x.sent.length, 0);
  assert.deepEqual(logs, [['Form confirmation unavailable', { kind: 'program', reason: 'mail-not-configured' }]]);
  assert.equal(x.sqlite.prepare('SELECT count(*) AS n FROM submissions').get().n, 1);
});
test('profile create and edit each send their own confirmation without newsletter opt-in', async t => {
  const x = setup(t); const body = { em: 'person@example.test', name: 'Person', sports: 'cycling' };
  const created = await x.post('/api/profile', body); assert.equal(created.status, 201);
  await Promise.all(x.jobs); assert.equal(x.sent.length, 1); assert.match(x.sent[0].subject, /profile is ready/);
  const cookie = created.headers.get('Set-Cookie').split(';')[0];
  const updated = await x.post('/api/profile', { ...body, name: 'Updated' }, cookie); assert.equal(updated.status, 200);
  await Promise.all(x.jobs); assert.equal(x.sent.length, 2); assert.match(x.sent[1].subject, /profile was updated/);
  const duplicate = await x.post('/api/profile', body); assert.equal(duplicate.status, 409);
  assert.equal(x.sent.length, 2); assert.equal(x.calls.length, 0);
});
test('program confirmations use Gmail when selected', async t => {
  const x = setup(t); Object.assign(x.env, { MAIL_TRANSPORT: 'gmail', GMAIL_FROM: 'hello@adaptivesportsnearme.com', GMAIL_CLIENT_ID: 'fixture', GMAIL_CLIENT_SECRET: 'fixture', GMAIL_REFRESH_TOKEN: 'fixture' });
  const network = globalThis.fetch; let gmailSends = 0;
  globalThis.fetch = async (url, init) => {
    if (url.includes('oauth2.googleapis.com')) return Response.json({ access_token: 'fixture', token_type: 'Bearer' });
    if (url.includes('gmail.googleapis.com')) { gmailSends++; return Response.json({ id: 'gmail-receipt' }); }
    return network(url, init);
  };
  assert.equal((await x.post('/api/submit-program', { pn: 'Program', em: 'person@example.test' })).status, 200);
  // One Gmail send for the submitter receipt, one for the hello@ house notice.
  await Promise.all(x.jobs); assert.equal(gmailSends, 2); assert.equal(x.sent.length, 0);
});
