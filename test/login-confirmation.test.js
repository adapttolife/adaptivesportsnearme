import assert from "node:assert/strict";
import test from "node:test";

import worker from "../src/index.js";

const VERIFY_PATHS = [
  "/api/profile-auth/verify",
  "/api/org-auth/verify",
  "/api/admin-auth/verify",
];

test("passwordless login links need a confirmation POST", async () => {
  for (const path of VERIFY_PATHS) {
    const response = await worker.fetch(
      new Request(`https://adaptivesportsnearme.com${path}?token=scanner-safe`),
      {},
      {},
    );
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("Content-Type") || "", /text\/html/);
    assert.equal(response.headers.get("Set-Cookie"), null);
    const html = await response.text();
    assert.match(html, /method="post"/i);
    assert.match(html, /name="token"/i);
  }
});

test("production workers.dev denies every passwordless verification route", async () => {
  for (const path of VERIFY_PATHS) {
    const response = await worker.fetch(
      new Request(`https://adaptivesportsnearme.workers.dev${path}?token=blocked`),
      { ENV_NAME: "production" },
      {},
    );
    assert.equal(response.status, 403, path);
  }
});
