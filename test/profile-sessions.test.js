import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

import {
  createProfile,
  createProfileSession,
  readProfileSession,
  revokeProfileSession,
  revokeProfileSessions,
  serializeProfileCookie,
} from "../src/profile.js";

function database() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
  return {
    sqlite,
    db: {
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
          async run() {
            return { meta: { changes: Number(statement.run(...values).changes) } };
          },
        };
      },
    },
  };
}

function request(cookie) {
  return new Request("https://example.test/api/profile", {
    headers: { Cookie: cookie },
  });
}

test("profile sessions are independently revocable and expire server-side", async () => {
  const { sqlite, db } = database();
  try {
    const profileId = await createProfile(db, {
      email: "person@example.test",
      name: "",
      state: "",
      sports: [],
      newsletter: false,
    });
    const secret = "profile-session-test";
    const first = await createProfileSession(db, profileId, secret);
    const firstCookie = serializeProfileCookie(first.id, first.signature).split(";")[0];
    assert.deepEqual(await readProfileSession(request(firstCookie), db, secret), {
      id: first.id,
      profileId,
    });
    await revokeProfileSession(db, first.id);
    assert.equal(await readProfileSession(request(firstCookie), db, secret), null);

    const second = await createProfileSession(db, profileId, secret);
    const secondCookie = serializeProfileCookie(second.id, second.signature).split(";")[0];
    await revokeProfileSessions(db, profileId);
    assert.equal(await readProfileSession(request(secondCookie), db, secret), null);
  } finally {
    sqlite.close();
  }
});
