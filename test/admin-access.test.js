import test from "node:test";
import assert from "node:assert/strict";
import { isAdminEmail } from "../src/admin-access.js";

test("admin sign-in accepts only the two allowed mail domains", () => {
  assert.equal(isAdminEmail("Person@adaptivesportsnearme.com"), "person@adaptivesportsnearme.com");
  assert.equal(isAdminEmail("person@faisaln.com"), "person@faisaln.com");
  assert.equal(isAdminEmail("person@sub.adaptivesportsnearme.com"), "");
  assert.equal(isAdminEmail("person@example.com"), "");
});
