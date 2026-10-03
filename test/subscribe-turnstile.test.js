// Turnstile is required on /api/subscribe (Alec, 2026-10-02). Signup records
// intake, notifies hello@ and sends a welcome email from our own mailbox, so an
// unverified request must be refused before beehiiv, D1 or mail is touched.
import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const PROD = { ENV_NAME: 'production', TURNSTILE_SECRET_KEY: 'secret', BEEHIIV_API_KEY: 'k', BEEHIIV_PUBLICATION_ID: 'pub' };

async function attempt(env, body, verdict) {
  const calls = { siteverify: 0, other: 0 }, old = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).includes('challenges.cloudflare.com')) { calls.siteverify++; return Response.json({ success: verdict === 'pass' }); }
    calls.other++; return new Response('unexpected in this test', { status: 500 });
  };
  try {
    const res = await worker.fetch(new Request('https://adaptivesportsnearme.com/api/subscribe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }), env, {});
    return { status: res.status, body: await res.json(), calls };
  } finally { globalThis.fetch = old; }
}

test('a signup without a Turnstile token is refused before anything else runs', async () => {
  const r = await attempt(PROD, { em: 'person@example.test' }, 'pass');
  assert.equal(r.status, 403);
  assert.equal(r.calls.other, 0, 'no beehiiv, D1 or mail call');
});

test('a signup whose token fails verification is refused', async () => {
  const r = await attempt(PROD, { em: 'person@example.test', cf_token: 'forged' }, 'fail');
  assert.equal(r.status, 403);
  assert.equal(r.calls.siteverify, 1);
  assert.equal(r.calls.other, 0);
});

test('a production Worker that lost its Turnstile secret fails closed', async () => {
  const { TURNSTILE_SECRET_KEY, ...env } = PROD;
  const r = await attempt(env, { em: 'person@example.test', cf_token: 'anything' }, 'pass');
  assert.equal(r.status, 403);
  assert.equal(r.calls.other, 0);
});

test('a verified signup passes the check and goes on to the newsletter step', async () => {
  const r = await attempt(PROD, { em: 'person@example.test', cf_token: 'valid' }, 'pass');
  assert.equal(r.calls.siteverify, 1);
  assert.notEqual(r.status, 403);
  assert.notEqual(r.body.error, 'Verification failed. Please reload the page and try again.');
});

test('the honeypot still accepts silently and verifies nothing', async () => {
  const r = await attempt(PROD, { em: 'bot@example.test', company: 'Acme' }, 'pass');
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { ok: true });
  assert.equal(r.calls.siteverify, 0);
  assert.equal(r.calls.other, 0);
});
