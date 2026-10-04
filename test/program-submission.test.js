import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker, { PROGRAM_INTAKE_KIND } from '../src/index.js';
import { sweepIntake } from '../src/intake.js';

// Production shape: DB (asnm-db) and INTAKE (atl-intake) are separate databases.
function d1(sqlite) {
  return {
    prepare(sql) {
      const stmt = sqlite.prepare(sql); let values = [];
      return {
        bind(...v) { values = v; return this; },
        async first() { return stmt.get(...values) || null; },
        async all() { return { results: stmt.all(...values) }; },
        async run() { return { meta: { changes: Number(stmt.run(...values).changes) } }; },
      };
    },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try { const r = []; for (const s of statements) r.push(await s.run()); sqlite.exec('COMMIT'); return r; } catch (e) { sqlite.exec('ROLLBACK'); throw e; }
    },
  };
}

function setup(t, options = {}) {
  const directory = new DatabaseSync(':memory:');
  directory.exec(readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8'));
  const intake = new DatabaseSync(':memory:');
  intake.exec(readFileSync(new URL('../db/intake-schema.sql', import.meta.url), 'utf8'));
  const sent = [], calls = [], jobs = [], logs = [];
  const env = {
    ENV_NAME: 'production', DB: d1(directory), INTAKE: d1(intake), REQUIRE_FORM_LIMITER: 'true',
    FORM_LIMITER: { async limit() { if (options.limiterError) throw Error('limiter down'); return { success: !options.limited }; } },
    SEND_EMAIL: { async send(m) { sent.push(m); return { id: 'accepted-' + sent.length }; } },
    ...options.env,
  };
  const network = globalThis.fetch, log = console.error;
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    if (String(url).startsWith('https://api.airtable.com/')) return new Response('down', { status: 500 });
    throw Error('Unexpected network request');
  };
  console.error = (...args) => logs.push(args);
  t.after(() => { globalThis.fetch = network; console.error = log; directory.close(); intake.close(); });
  const ctx = { waitUntil: job => jobs.push(job) };
  const post = (body) => worker.fetch(new Request('https://adaptivesportsnearme.com/api/submit-program', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.9' }, body: JSON.stringify(body),
  }), env, ctx);
  const count = (db, sql) => db.prepare(sql).get().n;
  return {
    env, directory, intake, sent, calls, jobs, logs, post,
    intakeRows: () => intake.prepare('SELECT * FROM intake').all(),
    claims: () => intake.prepare('SELECT * FROM intake_delivery_claims').all(),
    submissions: () => count(directory, 'SELECT count(*) AS n FROM submissions'),
    receipts: () => sent.filter(m => m.to === 'person@example.test'),
    notices: () => sent.filter(m => m.to === 'hello@adapttolife.org'),
  };
}
const body = { pn: 'Sled Hockey', org: 'Troy Adaptive', sport: 'hockey', city: 'Troy', state: 'NY', em: 'person@example.test', notes: 'Tuesdays', sid: '3b1f8e2a-7c4d-4e1a-9f00-1234567890ab' };
// Production fails closed without Turnstile; these tests are about capture, so
// verification passes through the real code path with a test secret.
function verified(x) {
  x.env.TURNSTILE_SECRET_KEY = 'test-secret';
  const network = globalThis.fetch;
  globalThis.fetch = async (url, init) => String(url).startsWith('https://challenges.cloudflare.com/') ? Response.json({ success: true }) : network(url, init);
}
const send = (x, extra = {}) => x.post({ ...body, cf_token: 'ok', ...extra });

test('capture first: intake row + claim and submissions row exist before ok, then hello@ and the submitter are mailed', async t => {
  const x = setup(t); verified(x);
  const response = await send(x);
  assert.equal(response.status, 200); assert.deepEqual(await response.json(), { ok: true });
  const [row] = x.intakeRows();
  assert.equal(x.intakeRows().length, 1);
  assert.equal(row.site, 'adaptivesportsnearme.com'); assert.equal(row.kind, PROGRAM_INTAKE_KIND); assert.equal(row.kind, 'program');
  assert.equal(row.email, 'person@example.test'); assert.equal(row.is_canary, 0);
  assert.match(row.summary, /^New program submission: Sled Hockey \(Troy, NY\)$/);
  assert.deepEqual(JSON.parse(row.payload), { program: 'Sled Hockey', org: 'Troy Adaptive', sport: 'hockey', city: 'Troy', state: 'NY', notes: 'Tuesdays' });
  assert.equal(x.submissions(), 1);
  const sub = x.directory.prepare('SELECT * FROM submissions').get();
  assert.equal(sub.kind, 'new_program'); assert.equal(JSON.parse(sub.payload).intake_id, row.id);
  await Promise.all(x.jobs);
  assert.equal(x.notices().length, 1); assert.equal(x.notices()[0].replyTo, 'person@example.test');
  assert.equal(x.receipts().length, 1);
  assert.equal(x.claims()[0].state, 'done'); assert.ok(x.intakeRows()[0].notified_at);
  assert.ok(!x.calls.some(u => u.includes('airtable')), 'Airtable is never called');
});

test('intake failure returns an honest 5xx and saves nothing anywhere', async t => {
  const x = setup(t); verified(x); x.intake.exec('DROP TABLE intake_delivery_claims');
  const response = await send(x);
  assert.equal(response.status, 502); assert.equal((await response.json()).ok, false);
  assert.equal(x.intakeRows().length, 0, 'batch rolled back'); assert.equal(x.submissions(), 0);
  assert.equal(x.jobs.length, 0); assert.equal(x.sent.length, 0);
  assert.deepEqual(x.logs.find(l => l[0] === 'Program submission failed closed'), ['Program submission failed closed', { stage: 'intake-capture', reason: 'database-schema-missing' }]);
  assert.ok(!JSON.stringify(x.logs).includes('person@example.test'), 'no PII in logs');
});

test('directory D1 failure returns 5xx; the intake record stands and a retry completes it exactly once', async t => {
  const x = setup(t); verified(x);
  x.directory.exec('ALTER TABLE submissions RENAME TO submissions_offline');
  const failed = await send(x);
  assert.equal(failed.status, 502); assert.equal((await failed.json()).ok, false);
  assert.equal(x.sent.length, 0); assert.equal(x.jobs.length, 0);
  assert.equal(x.intakeRows().length, 1, 'house intake still holds the person'); assert.equal(x.claims()[0].state, 'pending');
  x.directory.exec('ALTER TABLE submissions_offline RENAME TO submissions');
  const retried = await send(x);
  assert.equal(retried.status, 200); await Promise.all(x.jobs);
  assert.equal(x.intakeRows().length, 1); assert.equal(x.submissions(), 1);
  assert.equal(x.receipts().length, 1); assert.equal(x.notices().length, 1);
});

test('missing bindings refuse rather than pretend', async t => {
  for (const missing of ['DB', 'INTAKE']) {
    const x = setup(t, { env: { [missing]: undefined } }); verified(x);
    const response = await send(x);
    assert.equal(response.status, 503); assert.equal(x.sent.length, 0);
  }
});

test('Airtable configured or not, failing or not, the submission is captured and Airtable is never called', async t => {
  const x = setup(t, { env: { AIRTABLE_TOKEN: 'leftover', AIRTABLE_BASE_ID: 'apphZsPGanzJ5xyl7', AIRTABLE_INBOX_TABLE_ID: 'tblBcgV7oQ9Q3q34L' } }); verified(x);
  assert.equal((await send(x)).status, 200);
  assert.equal(x.intakeRows().length, 1); assert.equal(x.submissions(), 1);
  assert.ok(!x.calls.some(u => u.includes('airtable')));
});

test('idempotent retry: a double-click with the same sid records, notifies and receipts once', async t => {
  const x = setup(t); verified(x);
  const [a, b] = await Promise.all([send(x), send(x)]);
  assert.equal(a.status, 200); assert.equal(b.status, 200);
  assert.equal((await send(x)).status, 200);
  await Promise.all(x.jobs);
  assert.equal(x.intakeRows().length, 1); assert.equal(x.claims().length, 1); assert.equal(x.submissions(), 1);
  assert.equal(x.notices().length, 1); assert.equal(x.receipts().length, 1);
});

test('identical content without a sid is one record; a corrected resubmission is a new one', async t => {
  const x = setup(t); verified(x);
  await send(x, { sid: undefined }); await send(x, { sid: undefined });
  assert.equal(x.intakeRows().length, 1);
  await send(x, { sid: undefined, notes: 'Tuesdays and Thursdays' });
  assert.equal(x.intakeRows().length, 2); assert.equal(x.submissions(), 2);
});

test('rate limit: over the limit is 429, limiter error or required-but-missing limiter fails closed, nothing captured', async t => {
  for (const [options, status] of [[{ limited: true }, 429], [{ limiterError: true }, 503], [{ env: { FORM_LIMITER: undefined } }, 503]]) {
    const x = setup(t, options); verified(x);
    const response = await send(x);
    assert.equal(response.status, status);
    assert.equal(x.intakeRows().length, 0); assert.equal(x.submissions(), 0); assert.equal(x.sent.length, 0);
  }
});

test('a notice that could not go out on the request is sent by the scheduled sweep', async t => {
  const x = setup(t, { env: { MAIL_TRANSPORT: 'gmail' } }); verified(x); // Gmail selected but not configured
  assert.equal((await send(x)).status, 200); await Promise.all(x.jobs);
  assert.equal(x.sent.length, 0); assert.equal(x.claims()[0].state, 'pending');
  delete x.env.MAIL_TRANSPORT;
  const swept = await sweepIntake(x.env);
  assert.deepEqual(swept, { swept: 1, sent: 1, failed: 0 });
  assert.equal(x.notices().length, 1); assert.match(x.notices()[0].text, /Form: program/);
});
