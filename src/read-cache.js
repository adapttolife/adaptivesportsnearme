// Only public directory GETs belong here. Never cache intake, admin, profiles,
// location, authentication, or errors. Entries expire within five minutes.
const PUBLIC_PARAMS = {
  '/api/directory': [],
  '/api/programs': ['sport', 'state', 'q', 'zip', 'city', 'lat', 'lng', 'radius', 'limit', 'offset'],
  '/api/stats': [],
  '/api/grants': ['audience'],
};
const inFlight = new WeakMap();

export async function cachedDirectoryResponse(request, env, load, cache = globalThis.caches?.default) {
  const url = new URL(request.url);
  const params = PUBLIC_PARAMS[url.pathname];
  if (request.method !== 'GET' || !env.DB || !params || !cache) return load();
  const keyUrl = new URL(url.origin);
  keyUrl.pathname = `/__directory-cache/v1/${encodeURIComponent(env.ENV_NAME || 'production')}${url.pathname}`;
  // Ignore irrelevant tracking parameters, preserving the first value just as
  // URLSearchParams.get does in the handlers. Never key on visitor credentials.
  for (const name of params) if (url.searchParams.has(name)) keyUrl.searchParams.set(name, url.searchParams.get(name));
  const key = new Request(keyUrl);
  try {
    const hit = await cache.match(key);
    if (hit) return hit;
  } catch { /* Cache availability must not break the directory. */ }
  let pending = inFlight.get(env.DB);
  if (!pending) inFlight.set(env.DB, pending = new Map());
  if (pending.has(key.url)) return (await pending.get(key.url)).clone();
  const work = fill();
  pending.set(key.url, work);
  try { return (await work).clone(); }
  finally { pending.delete(key.url); }

  async function fill() {
    const response = await load();
    if (response.status === 200 && !response.headers.has('Set-Cookie') &&
        !/private|no-store/i.test(response.headers.get('Cache-Control') || '')) {
      try {
        const stored = new Response(response.clone().body, response);
        stored.headers.set('Cache-Control', 'public, max-age=300');
        // Await the put so the next page load sees it; D1 failures are never stored.
        await cache.put(key, stored);
      } catch { /* The origin response remains usable if caching fails. */ }
    }
    return response;
  }
}

// D1 bindings scope counts to their database, including local/staging/prod.
// Coalesce simultaneous page requests; cap memory for arbitrary search terms.
const counts = new WeakMap();
export function cachedCount(db, condition, binds) {
  let entries = counts.get(db);
  if (!entries) counts.set(db, entries = new Map());
  const key = JSON.stringify([condition, binds]);
  const hit = entries.get(key);
  if (hit && hit.expires > Date.now()) return hit.promise;
  if (entries.size >= 128) entries.delete(entries.keys().next().value);
  const entry = { expires: Date.now() + 300000 };
  entry.promise = Promise.resolve().then(() => db.prepare(`SELECT COUNT(*) AS n FROM organizations WHERE ${condition}`).bind(...binds).first())
    .catch(error => { if (entries.get(key) === entry) entries.delete(key); throw error; });
  entries.set(key, entry);
  return entry.promise;
}
