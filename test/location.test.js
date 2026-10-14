// GET /api/location: the visitor's approximate place from Cloudflare's request
// metadata. The old front end's location detector (public/location.js) and its
// distance helpers inside public/index.html left with the old site; the endpoint
// is server code and stays covered here.
import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const ip = { city: 'Boston', region: 'MA', lat: 42.36, lng: -71.06 };

test('IP endpoint returns only location fields and forbids caching', async () => {
  const request = new Request('https://example.test/api/location');
  Object.defineProperty(request, 'cf', { value: { city: 'Boston', regionCode: 'MA', latitude: '42.36', longitude: '-71.06', country: 'US' } });
  const response = await worker.fetch(request, {}, {});
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.deepEqual(await response.json(), ip);
  const local = await worker.fetch(new Request('https://example.test/api/location'), {}, {});
  assert.deepEqual(await local.json(), { city: null, region: null, lat: null, lng: null });
});

test('IP endpoint refuses writes and invalid coordinates', async () => {
  const post = await worker.fetch(new Request('https://example.test/api/location', { method: 'POST' }), {}, {});
  assert.equal(post.status, 405);
  const request = new Request('https://example.test/api/location');
  Object.defineProperty(request, 'cf', { value: { city: 'Nowhere', region: 'XX', latitude: '91', longitude: '' } });
  assert.deepEqual(await (await worker.fetch(request, {}, {})).json(), { city: 'Nowhere', region: 'XX', lat: null, lng: null });
});
