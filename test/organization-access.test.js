import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import {
  consumeLoginToken, createOrganizationSession, hashToken, issueLoginToken,
  organizationForClaimEmail, organizationsForClaimEmail, readOrganizationSession,
  serializeOrgCookie, updateClaimedOrganization, validEmail,
} from "../src/organization-access.js";

function database() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
  sqlite.exec(`CREATE TABLE organization_login_tokens (id TEXT PRIMARY KEY, token_hash TEXT UNIQUE, email TEXT, expires_at TEXT, used_at TEXT, created_at TEXT);
    CREATE TABLE organization_sessions (id TEXT PRIMARY KEY, email TEXT, expires_at TEXT, revoked_at TEXT, created_at TEXT);`);
  const db = { prepare(sql) {
    let values = []; const statement = sqlite.prepare(sql);
    return {
      bind(...args) { values = args; return this; },
      async first() { return statement.get(...values) || null; },
      async all() { return { results: statement.all(...values) }; },
      async run() { return { meta: { changes: Number(statement.run(...values).changes) } }; },
    };
  } };
  return { sqlite, db };
}

test("organization access uses the separate claim email and consumes a magic link once", async () => {
  const { sqlite, db } = database();
  try {
    sqlite.prepare("INSERT INTO organizations (id,name,claim_email,created_at,updated_at) VALUES (?,?,?,?,?)")
      .run("9fd14fc2-5d5d-472d-a0ca-a0a1de7651f6", "Example Program", "manager@example.test", "2026", "2026");
    assert.equal(validEmail("Manager@Example.test"), "manager@example.test");
    assert.equal((await organizationsForClaimEmail(db, "manager@example.test")).length, 1);
    const token = await issueLoginToken(db, "manager@example.test");
    assert.ok(await hashToken(token));
    assert.equal(await consumeLoginToken(db, token), "manager@example.test");
    assert.equal(await consumeLoginToken(db, token), null);
  } finally { sqlite.close(); }
});

test("an organization session can edit only its claimed organization", async () => {
  const { sqlite, db } = database();
  try {
    const id = "9fd14fc2-5d5d-472d-a0ca-a0a1de7651f6";
    sqlite.prepare("INSERT INTO organizations (id,name,claim_email,created_at,updated_at) VALUES (?,?,?,?,?)")
      .run(id, "Example Program", "manager@example.test", "2026", "2026");
    const session = await createOrganizationSession(db, "manager@example.test", "test-secret");
    const request = new Request("https://example.test", { headers: { Cookie: serializeOrgCookie(session.id, session.signature) } });
    assert.equal((await readOrganizationSession(request, db, "test-secret")).email, "manager@example.test");
    const changed = await updateClaimedOrganization(db, id, "manager@example.test", { name: "New Name", city: "Troy", state: "ny" });
    assert.equal(changed.name, "New Name");
    assert.equal(changed.state, "NY");
    assert.equal(changed.state_name, "New York");
    assert.equal(await organizationForClaimEmail(db, id, "other@example.test"), null);
  } finally { sqlite.close(); }
});

test("a claimed organization can control listing visibility and save resolved address coordinates", async (t) => {
  const { sqlite, db } = database();
  const originalFetch = globalThis.fetch;
  let geocoded;
  globalThis.fetch = async (url) => {
    geocoded = new URL(url).searchParams.get("address");
    return Response.json({ result: { addressMatches: [{ coordinates: { y: 42.7284, x: -73.6918 } }] } });
  };
  t.after(() => { globalThis.fetch = originalFetch; });
  try {
    const id = "9fd14fc2-5d5d-472d-a0ca-a0a1de7651f6";
    sqlite.prepare("INSERT INTO organizations (id,name,claim_email,is_public,created_at,updated_at) VALUES (?,?,?,?,?,?)")
      .run(id, "Example Organization", "manager@example.test", 1, "2026", "2026");
    const changed = await updateClaimedOrganization(db, id, "manager@example.test", {
      address: "200 Innovation Drive", city: "Troy", state: "NY", zip: "12180", is_public: 0, address_publicity_consent: 1,
    });
    assert.equal(changed.is_public, 0);
    assert.equal(changed.address, "200 Innovation Drive");
    assert.equal(geocoded, "200 Innovation Drive, Troy NY 12180, United States");
    assert.equal(changed.lat, 42.7284);
    assert.equal(changed.lng, -73.6918);
    assert.equal(changed.geo_precision, "address");
    assert.equal(changed.address_publicity_consent, 1);
    const cleared = await updateClaimedOrganization(db, id, "manager@example.test", { address: "" });
    assert.equal(cleared.address, null);
    assert.equal(cleared.lat, null);
    assert.equal(cleared.lng, null);
  } finally { sqlite.close(); }
});
