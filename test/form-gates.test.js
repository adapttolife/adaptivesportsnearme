// The gates as the Worker applies them, through worker.fetch: a subscribe
// without a Turnstile token is refused, and the rate limiter answers 429 before
// any handler runs (a honeypot body proves that — it has no side effects).
import test from "node:test";
import assert from "node:assert/strict";

async function worker() { return (await import("../src/index.js")).default; }

function post(path, fields, ip = "7.7.7.7") {
  return new Request("https://adaptivesportsnearme.com" + path, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "CF-Connecting-IP": ip },
    body: new URLSearchParams(fields),
  });
}

function baseEnv(over = {}) {
  return {
    ENV_NAME: "test",
    TURNSTILE_SECRET_KEY: "sek",
    FORM_LIMITER: { limit: async () => ({ success: true }) },
    ASSETS: { fetch: async () => new Response("asset") },
    ...over,
  };
}

test("subscribe: no Turnstile token -> 403, and nothing downstream is touched", async (t) => {
  const real = globalThis.fetch;
  let outbound = 0;
  globalThis.fetch = async () => { outbound++; return new Response("{}"); };
  t.after(() => { globalThis.fetch = real; });
  const w = await worker();
  const res = await w.fetch(post("/api/subscribe", { em: "person@example.com" }), baseEnv(), { waitUntil() {} });
  assert.equal(res.status, 403);
  assert.equal((await res.json()).ok, false);
  assert.equal(outbound, 0, "no siteverify, no beehiiv, no intake");
});

test("subscribe: a lane with no secret refuses too (no more fail-open)", async () => {
  const w = await worker();
  const res = await w.fetch(post("/api/subscribe", { em: "person@example.com", cf_token: "tok" }),
    baseEnv({ TURNSTILE_SECRET_KEY: undefined }), { waitUntil() {} });
  assert.equal(res.status, 403);
});

test("rate limit: the limiter answers 429 on every form POST, before the handler", async () => {
  const w = await worker();
  let calls = 0;
  const env = baseEnv({ FORM_LIMITER: { limit: async () => { calls++; return { success: calls <= 1 }; } } });
  const honeypot = { em: "bot@example.com", company: "filled" };
  for (const path of ["/api/subscribe", "/api/submit-program", "/api/profile"]) {
    calls = 0;
    const ok = await w.fetch(post(path, honeypot), env, { waitUntil() {} });
    assert.notEqual(ok.status, 429, `${path}: first call passes the limiter`);
    const limited = await w.fetch(post(path, honeypot), env, { waitUntil() {} });
    assert.equal(limited.status, 429, `${path}: second call is refused`);
    assert.match((await limited.json()).error, /Too many submissions/);
  }
});

test("rate limit: GET traffic is never counted", async () => {
  const w = await worker();
  let calls = 0;
  const env = baseEnv({ FORM_LIMITER: { limit: async () => { calls++; return { success: false }; } } });
  const res = await w.fetch(new Request("https://adaptivesportsnearme.com/api/config"), env, { waitUntil() {} });
  assert.notEqual(res.status, 429);
  assert.equal(calls, 0);
});
