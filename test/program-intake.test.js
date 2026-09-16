import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import worker from "../src/index.js";

// A D1 stand-in that records what was written, so the test asserts the row and
// not just the status code.
function fakeIntake(failOnInsert = false) {
  const inserts = [];
  return {
    inserts,
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async run() {
              if (/INSERT INTO intake/i.test(sql)) {
                if (failOnInsert) throw new Error("d1 down");
                inserts.push(args);
              }
              return { success: true };
            },
            async all() { return { results: [] }; },
            async first() { return null; },
          };
        },
      };
    },
  };
}

function submit(body) {
  return new Request("https://adaptivesportsnearme.com/api/submit-program", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const ctx = { waitUntil() {} };

test("a program submission is recorded in intake, with the fields a human needs", async () => {
  const INTAKE = fakeIntake();
  const res = await worker.fetch(
    submit({ pn: "Front Range Sled Hockey", org: "Rocky Mountain", sport: "Sled Hockey",
             city: "Littleton", state: "CO", em: "coach@example.org", notes: "Fridays" }),
    { INTAKE }, ctx
  );
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(INTAKE.inserts.length, 1);
  const row = INTAKE.inserts[0];
  // id, received_at, site, kind, name, email, phone, summary, payload, source, is_canary, lane
  assert.equal(row[2], "adaptivesportsnearme.com");
  assert.equal(row[3], "program");
  assert.equal(row[5], "coach@example.org");
  assert.match(row[7], /Front Range Sled Hockey/);
  const payload = JSON.parse(row[8]);
  assert.equal(payload.Program, "Front Range Sled Hockey");
  assert.equal(payload.Location, "Littleton, CO");
  assert.equal(payload.Notes, "Fridays");
  assert.equal(row[9], "asnm-add-a-program");
});

test("if the record cannot be written, the person is told — never thanked for a lost submission", async () => {
  const res = await worker.fetch(submit({ pn: "Somewhere Adaptive Rowing" }), { INTAKE: fakeIntake(true) }, ctx);
  assert.equal(res.status, 503);
  assert.equal((await res.json()).ok, false);

  // No INTAKE binding at all is the same contract, not a silent success.
  const none = await worker.fetch(submit({ pn: "Somewhere Adaptive Rowing" }), {}, ctx);
  assert.equal(none.status, 503);
});

test("the submission path calls no third-party API and no Airtable", () => {
  const src = readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
  assert.equal(/AIRTABLE|airtable/.test(src), false, "Airtable is retired — nothing may read it");
});

// The 2026-09-12 incident: production lost the */10 trigger and the sweep plus
// its canary went dead for a day with no deploy involved. The cron list lives in
// the config, so the config is what the test reads.
test("every schedule the Worker handles is declared in wrangler.json", () => {
  const src = readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
  const declared = JSON.parse(readFileSync(new URL("../wrangler.json", import.meta.url), "utf8"))
    .triggers.crons;
  const sweep = src.match(/INTAKE_SWEEP_CRON = "([^"]+)"/)[1];
  assert.ok(declared.includes(sweep), `wrangler.json must declare the intake sweep cron ${sweep}`);
  for (const cron of src.matchAll(/^\s*"(\*?[\d*/ ]+)":\s*"(validate|dispatch)"/gm)) {
    assert.ok(declared.includes(cron[1]), `wrangler.json must declare lane cron ${cron[1]}`);
  }
});
