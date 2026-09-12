// Shared-table discipline in src/intake.js: rows carry their lane, the sweep
// only re-notifies its own lane (production adopts legacy NULL rows), a row is
// never notified twice, and canaries never land in the human inbox.
import test from "node:test";
import assert from "node:assert/strict";
import {
  recordIntake, sweepIntake, notifyIntakeRow, runIntakeCanary,
  canaryInbox, intakeInbox, intakeLane, SWEEP_GRACE_MS,
} from "../src/intake.js";

// Minimal D1 double: records every (sql, binds) and answers from a script.
function fakeD1(answers = {}) {
  const calls = [];
  const stmt = (sql) => ({
    bind: (...binds) => {
      const c = { sql, binds }; calls.push(c);
      return {
        run: async () => ({ success: true }),
        all: async () => ({ results: answers.all ? answers.all(c) : [] }),
        first: async () => (answers.first ? answers.first(c) : null),
      };
    },
  });
  return { prepare: stmt, calls };
}

test("recordIntake stamps the writer's lane", async () => {
  const db = fakeD1();
  const r = await recordIntake({ INTAKE: db, ENV_NAME: "gate" }, { site: "s", kind: "k", payload: {} });
  assert.equal(r.ok, true);
  const ins = db.calls.find((c) => /INSERT INTO intake/.test(c.sql));
  assert.match(ins.sql, /lane\)/);
  assert.equal(ins.binds.at(-1), "gate");
  assert.equal(intakeLane({}), "unknown");
});

test("sweep asks only for its own lane, outside the grace window; production also adopts NULL-lane rows", async () => {
  const db = fakeD1();
  const before = Date.now();
  await sweepIntake({ INTAKE: db, ENV_NAME: "production" });
  const q = db.calls.find((c) => /SELECT \* FROM intake/.test(c.sql));
  assert.match(q.sql, /received_at < \?/);
  assert.match(q.sql, /lane = \? OR \(lane IS NULL AND \? = 'production'\)/);
  const [cut, lane, lane2, limit] = q.binds;
  assert.equal(lane, "production"); assert.equal(lane2, "production"); assert.equal(limit, 25);
  const cutMs = Date.parse(cut);
  assert.ok(before - SWEEP_GRACE_MS - 1000 <= cutMs && cutMs <= before - SWEEP_GRACE_MS + 1000, "cutoff is now minus the grace");
});

test("a row already notified is never emailed again", async () => {
  let sends = 0;
  const env = { SEND_EMAIL: { send: async () => { sends++; } }, INTAKE: fakeD1() };
  assert.equal(await notifyIntakeRow(env, { id: "r1", notified_at: "2026-09-12T00:00:00Z", summary: "x", payload: "{}" }), true);
  assert.equal(sends, 0);
});

test("canary rows go to the canary inbox; real rows go to the human inbox", async () => {
  const to = [];
  const env = { SEND_EMAIL: { send: async (m) => { to.push(m.to); } }, INTAKE: fakeD1(), INTAKE_INBOX: "hello@example.org" };
  await notifyIntakeRow(env, { id: "c", is_canary: 1, summary: "canary", payload: "{}" });
  await notifyIntakeRow(env, { id: "p", is_canary: 0, summary: "person", payload: "{}", email: "p@example.com" });
  assert.deepEqual(to, [canaryInbox(env), "hello@example.org"]);
  assert.equal(canaryInbox({}), "stingel@alectranel.com");
  assert.equal(canaryInbox({ INTAKE_CANARY_INBOX: "x@y.z" }), "x@y.z");
  assert.notEqual(canaryInbox({}), intakeInbox({}), "the defaults must differ or the noise returns");
});

test("the canary row itself is addressed to the canary inbox", async () => {
  const db = fakeD1({ first: () => null });
  await runIntakeCanary({ INTAKE: db, ENV_NAME: "production", SEND_EMAIL: { send: async () => {} } }, "site");
  const ins = db.calls.find((c) => /INSERT INTO intake/.test(c.sql));
  assert.equal(ins.binds[5], "stingel@alectranel.com"); // email column
  assert.equal(ins.binds[9], "canary:production");     // source column
});
