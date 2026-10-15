import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker, { PROGRAM_INTAKE_KIND, EVENT_INTAKE_KIND } from '../src/index.js';
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
  const postTo = (path, body, method = 'POST') => worker.fetch(new Request('https://adaptivesportsnearme.com' + path, {
    method, headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.9' }, body: method === 'GET' ? undefined : JSON.stringify(body),
  }), env, ctx);
  const post = (body) => postTo('/api/submit-program', body);
  const count = (db, sql) => db.prepare(sql).get().n;
  return {
    env, directory, intake, sent, calls, jobs, logs, post, postTo,
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
  assert.deepEqual(JSON.parse(row.payload), { program: 'Sled Hockey', org: 'Troy Adaptive', sport: 'hockey', city: 'Troy', state: 'NY', website: '', notes: 'Tuesdays' });
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

// Suggest an update (Alec, 2026-10-13: invite people to suggest updates to
// listings). Same capture path; lid names the listing, a person reads it, and
// nothing here touches the organizations table.
const LISTING = 'c76e8bad-5df9-5a4f-a526-1324f99877e1';
const update = { pn: 'Atlanta Wolfpack', lid: LISTING, rel: 'run', notes: 'We moved practice to Decatur.', em: 'person@example.test', sid: '9c2e8b1a-1d4f-4b7e-8a00-abcdefabcdef' };
// The listing a fix is about, as the directory has it. Receipts and notices take
// its name from here, never from text the browser sent.
const listed = (x) => x.directory.exec("INSERT INTO organizations (id,name,created_at,updated_at,city,state) VALUES ('" + LISTING + "','Atlanta Wolfpack','2026','2026','Atlanta','GA')");

test('a suggested update is captured like a submission and changes no listing', async t => {
  const x = setup(t); verified(x);
  x.directory.exec("INSERT INTO organizations (id,name,created_at,updated_at,city,state) VALUES ('" + LISTING + "','Atlanta Wolfpack','2026','2026','Atlanta','GA')");
  const response = await x.post({ ...update, cf_token: 'ok' });
  assert.equal(response.status, 200); assert.deepEqual(await response.json(), { ok: true });
  const [row] = x.intakeRows();
  assert.equal(row.kind, 'program');
  assert.equal(row.summary, 'Organization confirming its listing: Atlanta Wolfpack');
  assert.deepEqual(JSON.parse(row.payload), { program: 'Atlanta Wolfpack', update_of: LISTING, relation: 'run', notes: 'We moved practice to Decatur.' });
  const sub = x.directory.prepare('SELECT * FROM submissions').get();
  assert.equal(sub.kind, 'listing_update'); assert.equal(JSON.parse(sub.payload).update_of, LISTING);
  await Promise.all(x.jobs);
  assert.equal(x.notices().length, 1);
  assert.equal(x.receipts().length, 1); assert.equal(x.receipts()[0].subject, 'We received your suggested update');
  const org = x.directory.prepare('SELECT city, updated_at FROM organizations WHERE id = ?').get(LISTING);
  assert.deepEqual({ ...org }, { city: 'Atlanta', updated_at: '2026' });
});

test('an update with nothing to change is refused before anything is saved', async t => {
  const x = setup(t); verified(x);
  const response = await x.post({ ...update, notes: '  ', cf_token: 'ok' });
  assert.equal(response.status, 422);
  assert.equal((await response.json()).error, 'Please tell us what should change.');
  assert.equal(x.intakeRows().length, 0); assert.equal(x.submissions(), 0); assert.equal(x.sent.length, 0);
});

test('a plain suggestion reads as a listing update; a malformed listing id is ignored', async t => {
  const x = setup(t); verified(x); listed(x);
  await x.post({ ...update, rel: 'other', cf_token: 'ok' });
  assert.equal(x.intakeRows()[0].summary, 'Listing update: Atlanta Wolfpack');
  const y = setup(t); verified(y);
  await y.post({ ...body, lid: 'not-a-listing', cf_token: 'ok' });
  assert.match(y.intakeRows()[0].summary, /^New program submission: /);
  assert.equal(y.directory.prepare('SELECT kind FROM submissions').get().kind, 'new_program');
});

// The 2026-10 forms (public/app/views/forms.js) post the API's field names:
// url is the program's or the event's website, ed/ee/et the event's date, end
// date and start time. Email (Alec, 2026-10-14: "No email required"): a fix to
// a listing or a suggested event may come without one; a new program and a
// program confirming its own listing (rel=run) need one, because we write back.

test('a new program keeps its website (field url) for the person who reviews it', async t => {
  const x = setup(t); verified(x);
  assert.equal((await send(x, { url: 'https://troyadaptive.example/sled' })).status, 200);
  assert.equal(JSON.parse(x.intakeRows()[0].payload).website, 'https://troyadaptive.example/sled');
  assert.equal(JSON.parse(x.directory.prepare('SELECT payload FROM submissions').get().payload).website, 'https://troyadaptive.example/sled');
});

const event = { en: 'Sled Hockey Clinic', sport: 'sledhockey', ed: '2026-11-07', ee: '2026-11-08', et: '10:00', city: 'Troy', state: 'NY', url: 'https://troyadaptive.example/clinic', org: 'Troy Adaptive', notes: 'Bring gloves', em: 'person@example.test', sid: '5d6e7f80-1a2b-4c3d-8e9f-0a1b2c3d4e5f' };
const sendEvent = (x, extra = {}) => x.postTo('/api/submit-event', { ...event, cf_token: 'ok', ...extra });

test('a suggested event is captured with its end date and website, then hello@ and the submitter are mailed', async t => {
  const x = setup(t); verified(x);
  const response = await sendEvent(x);
  assert.equal(response.status, 200); assert.deepEqual(await response.json(), { ok: true });
  const [row] = x.intakeRows();
  assert.equal(row.kind, EVENT_INTAKE_KIND); assert.equal(row.kind, 'event');
  assert.equal(row.email, 'person@example.test');
  assert.equal(row.summary, 'New event submission: Sled Hockey Clinic (2026-11-07, Troy, NY)');
  assert.deepEqual(JSON.parse(row.payload), { event: 'Sled Hockey Clinic', date: '2026-11-07', end: '2026-11-08', time: '10:00', city: 'Troy', state: 'NY', url: 'https://troyadaptive.example/clinic', org: 'Troy Adaptive', sport: 'sledhockey', notes: 'Bring gloves' });
  const sub = x.directory.prepare('SELECT * FROM submissions').get();
  assert.equal(sub.kind, 'new_event'); assert.equal(sub.contact_email, 'person@example.test');
  assert.equal(JSON.parse(sub.payload).intake_id, row.id);
  await Promise.all(x.jobs);
  assert.equal(x.notices().length, 1); assert.equal(x.notices()[0].replyTo, 'person@example.test');
  assert.equal(x.receipts().length, 1); assert.equal(x.receipts()[0].subject, 'We received your event');
});

test('an event end date that is not a date is dropped; an event with no name or date is refused', async t => {
  const x = setup(t); verified(x);
  assert.equal((await sendEvent(x, { ee: 'the Sunday after' })).status, 200);
  assert.equal(JSON.parse(x.intakeRows()[0].payload).end, '');
  for (const [extra, error] of [[{ en: '' }, 'Please add the event name.'], [{ ed: '' }, 'Please add the date of the event.'], [{ ed: '11/07/2026' }, 'Please add the date of the event.']]) {
    const y = setup(t); verified(y);
    const response = await sendEvent(y, extra);
    assert.equal(response.status, 422); assert.equal((await response.json()).error, error);
    assert.equal(y.intakeRows().length, 0); assert.equal(y.submissions(), 0); assert.equal(y.sent.length, 0);
  }
});

test('an event without an email is captured; hello@ is told and no receipt is attempted', async t => {
  const x = setup(t); verified(x);
  const { em, ...anonymous } = event;
  const response = await x.postTo('/api/submit-event', { ...anonymous, cf_token: 'ok' });
  assert.equal(response.status, 200); assert.deepEqual(await response.json(), { ok: true });
  assert.equal(x.intakeRows()[0].email, null);
  assert.equal(x.directory.prepare('SELECT contact_email FROM submissions').get().contact_email, null);
  await Promise.all(x.jobs);
  assert.equal(x.notices().length, 1); assert.equal(x.notices()[0].replyTo, 'hello@adapttolife.org');
  assert.equal(x.sent.length, 1, 'the notice only: there is no one to send a receipt to');
  const bad = setup(t); verified(bad);
  assert.equal((await sendEvent(bad, { em: 'not-an-email' })).status, 422, 'an email that is given still has to be one');
});

test('a fix names the listing from the directory, not from what the browser sent', async t => {
  const x = setup(t); verified(x); listed(x);
  await x.post({ ...update, pn: 'Free prizes at evil.example', rel: 'other', cf_token: 'ok' });
  assert.equal(x.intakeRows()[0].summary, 'Listing update: Atlanta Wolfpack');
  const y = setup(t); verified(y); // a listing id the directory does not have
  await y.post({ ...update, pn: 'Free prizes at evil.example', rel: 'other', cf_token: 'ok' });
  assert.equal(y.intakeRows()[0].summary, `Listing update: listing ${LISTING}`);
});

test('a fix to a listing needs no email unless the program itself is confirming it', async t => {
  const { em, ...fix } = update;
  for (const rel of ['other', 'attend', undefined]) {
    const x = setup(t); verified(x); listed(x);
    const response = await x.post({ ...fix, rel, cf_token: 'ok' });
    assert.equal(response.status, 200, `rel=${rel}`);
    const [row] = x.intakeRows();
    assert.equal(row.summary, 'Listing update: Atlanta Wolfpack'); assert.equal(row.email, null);
    assert.deepEqual(JSON.parse(row.payload), { program: 'Atlanta Wolfpack', update_of: LISTING, relation: rel || '', notes: 'We moved practice to Decatur.' });
    const sub = x.directory.prepare('SELECT kind, contact_email FROM submissions').get();
    assert.equal(sub.kind, 'listing_update'); assert.equal(sub.contact_email, null);
    await Promise.all(x.jobs);
    assert.equal(x.notices().length, 1); assert.equal(x.receipts().length, 0);
  }
  // rel=run is the route to Verified: we write back to confirm, so it needs an email.
  const run = setup(t); verified(run);
  const refused = await run.post({ ...fix, rel: 'run', cf_token: 'ok' });
  assert.equal(refused.status, 422);
  assert.equal((await refused.json()).error, 'Please enter a valid email so we can confirm your submission.');
  assert.equal(run.intakeRows().length, 0); assert.equal(run.submissions(), 0); assert.equal(run.sent.length, 0);
  // A new program needs one too.
  const fresh = setup(t); verified(fresh);
  const { em: _, ...anonymousProgram } = body;
  assert.equal((await fresh.post({ ...anonymousProgram, cf_token: 'ok' })).status, 422);
  assert.equal(fresh.intakeRows().length, 0);
});

test('the event endpoint takes POST only, and like every form needs Turnstile and the rate limiter', async t => {
  const x = setup(t); verified(x);
  assert.equal((await x.postTo('/api/submit-event', null, 'GET')).status, 405);
  assert.equal((await x.postTo('/api/submit-event', { ...event })).status, 403, 'no Turnstile token in production');
  const limited = setup(t, { limited: true }); verified(limited);
  assert.equal((await sendEvent(limited)).status, 429);
  assert.equal(x.intakeRows().length + limited.intakeRows().length, 0);
});

// A new listing names its organization; the program (what they offer) is optional
// (Alec and Faisal, 2026-10-15: a listing is an organization, a program is what it offers).
test('a new listing can name just its organization', async t => {
  const x = setup(t); verified(x);
  const { pn, ...noProgram } = body;
  const response = await x.post({ ...noProgram, org: 'Troy Adaptive Sports', cf_token: 'ok' });
  assert.equal(response.status, 200);
  assert.match(x.intakeRows()[0].summary, /^New program submission: Troy Adaptive Sports/);
  const y = setup(t); verified(y);
  const { org, ...nothing } = noProgram;
  const refused = await y.post({ ...nothing, cf_token: 'ok' });
  assert.equal(refused.status, 422);
  assert.equal((await refused.json()).error, "Please add the organization's name.");
});
