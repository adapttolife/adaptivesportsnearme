import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { claimLane, runLane } from "../src/pipeline.js";
import { validateLane } from "../src/lanes/validate.js";
import { updateProfile } from "../src/profile.js";

function database() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
  sqlite.exec("ALTER TABLE organizations ADD COLUMN last_checked_at TEXT");
  sqlite.exec("CREATE TABLE profiles (id TEXT PRIMARY KEY, email TEXT, name TEXT, state TEXT, sports_json TEXT, newsletter INTEGER, updated_at TEXT)");
  const db = {
    prepare(sql) {
      let values = [];
      const statement = sqlite.prepare(sql);
      return {
        bind(...args) { values = args; return this; },
        async first() { return statement.get(...values) || null; },
        async all() { return { results: statement.all(...values) }; },
        async run() { return { meta: { rows_written: Number(statement.run(...values).changes) } }; },
      };
    },
    async batch(statements) { return Promise.all(statements.map(s => s.run())); },
  };
  return { sqlite, db };
}

test("maintenance claims preserve cursor and reject repeat runs without row changes", async () => {
  const { sqlite, db } = database();
  try {
    const now = new Date("2026-09-16T00:00:00Z");
    assert.equal((await claimLane(db, "geocode", now)).cursor, "");
    sqlite.exec("UPDATE lane_cursors SET cursor = 'org-42' WHERE lane = 'geocode'");
    const before = sqlite.prepare("SELECT total_changes() AS n").get().n;
    assert.equal(await claimLane(db, "geocode", now), null);
    assert.equal(await claimLane(db, "geocode", new Date(+now + 3 * 3600000)), null);
    assert.equal(sqlite.prepare("SELECT total_changes() AS n").get().n, before);
    assert.equal((await claimLane(db, "geocode", new Date(+now + 4 * 3600000))).cursor, "org-42");
    assert.ok(await claimLane(db, "validate", now));
    assert.ok(await claimLane(db, "validate", new Date(+now + 2 * 3600000)));
  } finally { sqlite.close(); }
});

test("manual runs respect the same maintenance cooldown", async () => {
  const { sqlite, db } = database();
  try {
    await claimLane(db, "resolve");
    assert.equal((await runLane({ DB: db }, "resolve")).skipped, true);
    await claimLane(db, "dispatch");
    assert.equal((await runLane({ DB: db }, "dispatch")).skipped, true);
    assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM pipeline_runs").get().n, 0);
  } finally { sqlite.close(); }
});

test("two callers cannot claim the same lane slot", async () => {
  const { sqlite, db } = database();
  try {
    const claims = await Promise.all([claimLane(db, "enrich"), claimLane(db, "enrich")]);
    assert.equal(claims.filter(Boolean).length, 1);
  } finally { sqlite.close(); }
});

test("failed validation preserves last successful check and proposes review", async () => {
  const { sqlite, db } = database();
  const originalFetch = globalThis.fetch;
  try {
    sqlite.exec("INSERT INTO organizations (id,name,website_url,last_ok_at,created_at,updated_at) VALUES ('org','Org','https://example.test','previous','2026','2026')");
    globalThis.fetch = async () => new Response("missing", { status: 404 });
    const result = await validateLane({ db });
    assert.equal(result.flagged, 1);
    assert.equal(sqlite.prepare("SELECT last_ok_at FROM organizations").get().last_ok_at, "previous");
    assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM review_queue").get().n, 1);
  } finally { globalThis.fetch = originalFetch; sqlite.close(); }
});

test("validation skips recent checks and combines successful timestamp writes", async () => {
  const { sqlite, db } = database();
  const originalFetch = globalThis.fetch;
  try {
    sqlite.prepare("INSERT INTO organizations (id,name,website_url,created_at,updated_at) VALUES ('org','Org','https://example.test','2026','2026')").run();
    let calls = 0;
    globalThis.fetch = async () => { calls++; return new Response("ok"); };
    const before = sqlite.prepare("SELECT total_changes() AS n").get().n;
    assert.equal((await validateLane({ db })).processed, 1);
    assert.equal(sqlite.prepare("SELECT total_changes() AS n").get().n - before, 2);
    const org = sqlite.prepare("SELECT last_checked_at, last_ok_at FROM organizations").get();
    assert.equal(org.last_checked_at, org.last_ok_at);
    assert.equal((await validateLane({ db })).processed, 0);
    assert.equal(calls, 1);
  } finally { globalThis.fetch = originalFetch; sqlite.close(); }
});

test("saving an unchanged profile does not write or change its timestamp", async () => {
  const { sqlite, db } = database();
  try {
    sqlite.exec("INSERT INTO profiles VALUES ('id','a@b.test','A','NY','[]',0,'original')");
    const data = { email: "a@b.test", name: "A", state: "NY", sports: [], newsletter: false };
    const before = sqlite.prepare("SELECT total_changes() AS n").get().n;
    await updateProfile(db, "id", data);
    assert.equal(sqlite.prepare("SELECT total_changes() AS n").get().n, before);
    assert.equal(sqlite.prepare("SELECT updated_at FROM profiles").get().updated_at, "original");
    await updateProfile(db, "id", { ...data, name: "Changed" });
    assert.equal(sqlite.prepare("SELECT name FROM profiles").get().name, "Changed");
  } finally { sqlite.close(); }
});
