// Signup extras (first name + beta opt-in) -> beehiiv custom fields.
// Pure mapping only; the live round trip was verified against the publication.
import test from "node:test";
import assert from "node:assert/strict";
import { beehiivCustomFields, parseBetaFlag } from "../src/index.js";

test("beta flag: only an explicit yes counts", () => {
  for (const yes of ["1", "true", "on", "yes", "YES", "True"]) {
    assert.equal(parseBetaFlag(yes), true, `${yes} should be true`);
  }
  // An unchecked box is absent from the body entirely.
  for (const no of [undefined, null, "", "0", "false", "off", "maybe", 1, {}]) {
    assert.equal(parseBetaFlag(no), false, `${JSON.stringify(no)} should be false`);
  }
});

test("custom fields: a blank name is never sent, so a repeat signup cannot wipe a good one", () => {
  assert.deepEqual(beehiivCustomFields({ name: "", beta: false }), []);
  assert.deepEqual(beehiivCustomFields({}), []);
  assert.deepEqual(beehiivCustomFields(), []);
});

test("custom fields: each answer maps to its own publication field", () => {
  assert.deepEqual(beehiivCustomFields({ name: "Alec", beta: false }), [
    { name: "First Name", value: "Alec" },
  ]);
  assert.deepEqual(beehiivCustomFields({ name: "", beta: true }), [
    { name: "Beta Tester", value: true },
  ]);
  assert.deepEqual(beehiivCustomFields({ name: "Alec", beta: true }), [
    { name: "First Name", value: "Alec" },
    { name: "Beta Tester", value: true },
  ]);
});
