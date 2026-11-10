import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";

import worker from "../src/index.js";
import {
  TOKEN_SECONDS,
  clearBetaCookie,
  issueBetaLoginToken,
  serializeBetaCookie,
  setBetaTester,
} from "../src/beta-access.js";
import { hashToken } from "../src/organization-access.js";

const ORIGIN = "https://adaptivesportsnearme.com";
const TESTER = "tester@example.test";

function database() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(
    readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"),
  );
  const db = {
    prepare(sql) {
      let values = [];
      const statement = sqlite.prepare(sql);
      return {
        bind(...args) {
          values = args;
          return this;
        },
        async first() {
          return statement.get(...values) || null;
        },
        async all() {
          return { results: statement.all(...values) };
        },
        async run() {
          return {
            meta: { changes: Number(statement.run(...values).changes) },
          };
        },
      };
    },
  };
  return { sqlite, db };
}

async function setup() {
  const { sqlite, db } = database();
  await setBetaTester(db, TESTER, true);
  const env = {
    DB: db,
    BETA_AUTH_SIGNING_KEY: "beta-secret",
    PRELAUNCH: "true",
    ENV_NAME: "staging",
  };
  const token = await issueBetaLoginToken(db, TESTER);
  const used = () =>
    sqlite.prepare("SELECT used_at FROM beta_login_tokens").get().used_at;
  const sessions = () =>
    Number(sqlite.prepare("SELECT COUNT(*) AS n FROM beta_sessions").get().n);
  return { sqlite, db, env, token, used, sessions };
}

function confirmGet(token, headers = {}) {
  return new Request(
    `${ORIGIN}/api/beta-auth/verify?token=${encodeURIComponent(token)}`,
    { headers },
  );
}

function confirmPost(token, headers = {}) {
  return new Request(`${ORIGIN}/api/beta-auth/verify`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Origin: ORIGIN,
      ...headers,
    },
    body: new URLSearchParams({ token }).toString(),
  });
}

function cookiePair(setCookie) {
  return setCookie.split(";")[0];
}

test("GET verify shows a confirm page and does not consume the token or set a cookie", async () => {
  const { sqlite, env, token, used, sessions } = await setup();
  try {
    for (let i = 0; i < 3; i++) {
      const response = await worker.fetch(confirmGet(token), env, {});
      assert.equal(response.status, 200);
      assert.match(response.headers.get("Content-Type"), /text\/html/);
      assert.equal(response.headers.get("Cache-Control"), "no-store");
      assert.equal(response.headers.get("X-Robots-Tag"), "noindex");
      assert.equal(response.headers.get("Set-Cookie"), null);
      const html = await response.text();
      assert.match(html, /name="robots" content="noindex"/);
      assert.match(
        html,
        /<form method="post" action="\/api\/beta-auth\/verify">/,
      );
      assert.match(html, /name="token" value="[^"]+"/);
      assert.match(html, />Open the beta<\/button>/);
    }
    assert.equal(used(), null);
    assert.equal(sessions(), 0);
  } finally {
    sqlite.close();
  }
});

test("POST verify consumes the token once, sets the Lax cookie, and redirects home", async () => {
  const { sqlite, env, token, used, sessions } = await setup();
  try {
    const response = await worker.fetch(confirmPost(token), env, {});
    assert.equal(response.status, 303);
    assert.equal(response.headers.get("Location"), "/");
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    const cookie = response.headers.get("Set-Cookie");
    assert.match(cookie, /^asnm_beta=[^;]+;/);
    assert.match(cookie, /; SameSite=Lax;/);
    assert.doesNotMatch(cookie, /Strict/);
    assert.match(cookie, /; HttpOnly;/);
    assert.match(cookie, /; Secure;/);
    assert.match(cookie, /; Path=\/;/);
    assert.ok(used());
    assert.equal(sessions(), 1);

    const again = await worker.fetch(confirmPost(token), env, {});
    assert.equal(again.status, 401);
    assert.equal(again.headers.get("Set-Cookie"), null);
    assert.match(again.headers.get("Content-Type"), /text\/html/);
    assert.equal(sessions(), 1);
  } finally {
    sqlite.close();
  }
});

test("a link opened from another site, then confirmed on this origin, keeps the tester signed in", async () => {
  const { sqlite, env, token, used, sessions } = await setup();
  try {
    // The click starts in a webmail app, so the browser sends a cross site
    // navigation with no beta cookie. That GET must not burn the link.
    const landing = await worker.fetch(
      confirmGet(token, {
        Referer: "https://mail.example.test/",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-Mode": "navigate",
      }),
      env,
      {},
    );
    assert.equal(landing.status, 200);
    assert.equal(landing.headers.get("Set-Cookie"), null);
    assert.equal(used(), null);
    const html = await landing.text();
    const posted = html.match(/name="token" value="([^"]+)"/)[1];
    assert.equal(posted, token);

    // The button is a same origin form POST.
    const confirm = await worker.fetch(
      confirmPost(posted, {
        Referer: `${ORIGIN}/api/beta-auth/verify`,
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "navigate",
      }),
      env,
      {},
    );
    assert.equal(confirm.status, 303);
    const setCookie = confirm.headers.get("Set-Cookie");
    assert.match(setCookie, /SameSite=Lax/);
    assert.equal(sessions(), 1);

    // A Lax cookie rides along on the same site redirect to /, and on later
    // top level navigations from other sites. The session is valid.
    const session = await worker.fetch(
      new Request(`${ORIGIN}/api/beta-auth/session`, {
        headers: { Cookie: cookiePair(setCookie) },
      }),
      env,
      {},
    );
    assert.equal(session.status, 200);
    assert.equal((await session.json()).email, TESTER);
  } finally {
    sqlite.close();
  }
});

test("POST verify from another origin is refused without consuming the token", async () => {
  const { sqlite, env, token, used, sessions } = await setup();
  try {
    const response = await worker.fetch(
      confirmPost(token, { Origin: "https://evil.example.test" }),
      env,
      {},
    );
    assert.equal(response.status, 403);
    assert.equal(response.headers.get("Set-Cookie"), null);
    assert.equal(used(), null);
    assert.equal(sessions(), 0);
  } finally {
    sqlite.close();
  }
});

test("expired, used, and missing links show a branded page with a new link button", async () => {
  const { sqlite, env, token, used } = await setup();
  try {
    const expired = await issueBetaLoginToken(env.DB, TESTER);
    sqlite
      .prepare(
        "UPDATE beta_login_tokens SET expires_at = ? WHERE token_hash = ?",
      )
      .run(new Date(Date.now() - 1000).toISOString(), await hashToken(expired));
    // Burn the first token through the real POST.
    await worker.fetch(confirmPost(token), env, {});

    for (const t of [token, expired, "", "not-a-real-token"]) {
      const response = await worker.fetch(confirmGet(t), env, {});
      assert.equal(response.status, 401, `token ${t}`);
      assert.match(response.headers.get("Content-Type"), /text\/html/);
      assert.equal(response.headers.get("Cache-Control"), "no-store");
      assert.equal(response.headers.get("Set-Cookie"), null);
      const html = await response.text();
      assert.doesNotMatch(html, /^\s*\{/);
      assert.match(html, /Adaptive Sports Near Me/);
      assert.match(html, /expired, was already used/);
      assert.match(html, /<form method="get" action="\/">/);
      assert.match(html, />Send me a new link<\/button>/);
    }
    const expiredRow = sqlite
      .prepare(
        "SELECT used_at FROM beta_login_tokens WHERE expires_at < ? LIMIT 1",
      )
      .get(new Date().toISOString());
    assert.equal(expiredRow.used_at, null);
    assert.ok(used());
  } finally {
    sqlite.close();
  }
});

test("the gated sign in page checks for a live session on load", async () => {
  const { sqlite, env } = await setup();
  try {
    const response = await worker.fetch(new Request(`${ORIGIN}/`), env, {});
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /Welcome, beta tester/);
    assert.match(html, /fetch\('\/api\/beta-auth\/session'/);
    assert.match(html, /location\.replace\(back\)/);
  } finally {
    sqlite.close();
  }
});

test("beta cookies are SameSite=Lax, HttpOnly, Secure, Path=/", () => {
  for (const cookie of [serializeBetaCookie("id", "sig"), clearBetaCookie()]) {
    assert.match(cookie, /; HttpOnly;/);
    assert.match(cookie, /; Secure;/);
    assert.match(cookie, /; SameSite=Lax;/);
    assert.match(cookie, /; Path=\/;/);
  }
});

test("beta links last 30 minutes and the email says so", async () => {
  assert.equal(TOKEN_SECONDS, 30 * 60);
  const { sqlite, db } = database();
  try {
    const before = Date.now();
    await issueBetaLoginToken(db, TESTER);
    const expires = Date.parse(
      sqlite.prepare("SELECT expires_at FROM beta_login_tokens").get()
        .expires_at,
    );
    assert.ok(expires - before >= 29 * 60 * 1000);
    assert.ok(expires - before <= 31 * 60 * 1000);
  } finally {
    sqlite.close();
  }
  const source = readFileSync(
    new URL("../src/email.js", import.meta.url),
    "utf8",
  );
  const beta = source.slice(
    source.indexOf("export async function sendBetaLoginLink"),
    source.indexOf("export async function sendBetaTesterInvitation"),
  );
  assert.equal((beta.match(/expires in 30 minutes/g) || []).length, 2);
  assert.doesNotMatch(beta, /15 minutes/);
});

test("a double tap or a reopened link sends a signed in tester home instead of an error", async () => {
  const { sqlite, env, token, sessions } = await setup();
  try {
    const first = await worker.fetch(confirmPost(token), env, {});
    const cookie = cookiePair(first.headers.get("Set-Cookie"));

    const second = await worker.fetch(
      confirmPost(token, { Cookie: cookie }),
      env,
      {},
    );
    assert.equal(second.status, 303);
    assert.equal(second.headers.get("Location"), "/");
    assert.equal(second.headers.get("Set-Cookie"), null);

    const reopened = await worker.fetch(
      confirmGet(token, { Cookie: cookie }),
      env,
      {},
    );
    assert.equal(reopened.status, 303);
    assert.equal(reopened.headers.get("Location"), "/");
    assert.equal(sessions(), 1);
  } finally {
    sqlite.close();
  }
});

test("POST verify with a null Origin is refused without consuming the token", async () => {
  const { sqlite, env, token, used, sessions } = await setup();
  try {
    const response = await worker.fetch(
      confirmPost(token, { Origin: "null" }),
      env,
      {},
    );
    assert.equal(response.status, 403);
    assert.equal(used(), null);
    assert.equal(sessions(), 0);
  } finally {
    sqlite.close();
  }
});

test("the session check upgrades an older Strict cookie to Lax", async () => {
  const { sqlite, env, token } = await setup();
  try {
    const first = await worker.fetch(confirmPost(token), env, {});
    const pair = cookiePair(first.headers.get("Set-Cookie"));
    const response = await worker.fetch(
      new Request(`${ORIGIN}/api/beta-auth/session`, {
        headers: { Cookie: pair },
      }),
      env,
      {},
    );
    assert.equal(response.status, 200);
    const reissued = response.headers.get("Set-Cookie");
    assert.equal(cookiePair(reissued), pair);
    assert.match(reissued, /SameSite=Lax/);

    const signedOut = await worker.fetch(
      new Request(`${ORIGIN}/api/beta-auth/session`),
      env,
      {},
    );
    assert.equal(signedOut.status, 401);
    assert.equal(signedOut.headers.get("Set-Cookie"), null);
  } finally {
    sqlite.close();
  }
});

test("production config previews refuse beta verify, so a preview never consumes a real link", async () => {
  const { sqlite, env, token, used } = await setup();
  try {
    const preview = { ...env, ENV_NAME: "production" };
    const response = await worker.fetch(
      new Request(
        `https://preview.adaptivesportsnearme.workers.dev/api/beta-auth/verify?token=${token}`,
      ),
      preview,
      {},
    );
    assert.equal(response.status, 403);
    assert.equal(used(), null);
  } finally {
    sqlite.close();
  }
});
