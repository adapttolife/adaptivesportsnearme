import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import {
  consumeBetaLoginToken, createBetaSession, isBetaTester, issueBetaLoginToken,
  listBetaTesters, readBetaSession, serializeBetaCookie, setBetaTester,
} from "../src/beta-access.js";

function database() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
  const db = {
    prepare(sql) {
      let values = [];
      const statement = sqlite.prepare(sql);
      return {
        bind(...args) { values = args; return this; },
        async first() { return statement.get(...values) || null; },
        async all() { return { results: statement.all(...values) }; },
        async run() { return { meta: { changes: Number(statement.run(...values).changes) } }; },
      };
    },
  };
  return { sqlite, db };
}

test("beta access requires an enabled approved email and consumes each magic link once", async () => {
  const { sqlite, db } = database();
  try {
    assert.equal(await isBetaTester(db, "tester@example.test"), false);
    await setBetaTester(db, "Tester@Example.test");
    assert.equal(await isBetaTester(db, "tester@example.test"), true);
    assert.equal((await listBetaTesters(db))[0].email, "tester@example.test");

    const token = await issueBetaLoginToken(db, "tester@example.test");
    assert.equal(await consumeBetaLoginToken(db, token), "tester@example.test");
    assert.equal(await consumeBetaLoginToken(db, token), null);

    const session = await createBetaSession(db, "tester@example.test", "beta-secret");
    const request = new Request("https://example.test", { headers: { Cookie: serializeBetaCookie(session.id, session.signature) } });
    assert.equal((await readBetaSession(request, db, "beta-secret")).email, "tester@example.test");

    await setBetaTester(db, "tester@example.test", false);
    assert.equal(await readBetaSession(request, db, "beta-secret"), null);
  } finally {
    sqlite.close();
  }
});

test("admin email domains have beta access without a beta tester row", async () => {
  const { sqlite, db } = database();
  try {
    assert.equal(await isBetaTester(db, "admin@adaptivesportsnearme.com"), true);
    assert.equal(await isBetaTester(db, "owner@faisaln.com"), true);
    assert.equal(await isBetaTester(db, "visitor@example.test"), false);
  } finally {
    sqlite.close();
  }
});
