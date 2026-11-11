import assert from "node:assert/strict";
import test from "node:test";

import { serializeAdminCookie } from "../src/admin-access.js";
import { serializeBetaCookie } from "../src/beta-access.js";
import { serializeOrgCookie } from "../src/organization-access.js";
import { serializeProfileCookie } from "../src/profile.js";

const FIVE_DAYS = 60 * 60 * 24 * 5;

test("every ASNM login session cookie expires after five days", () => {
  const cookies = [
    serializeAdminCookie("admin", "signature"),
    serializeBetaCookie("beta", "signature"),
    serializeOrgCookie("organization", "signature"),
    serializeProfileCookie("profile", "signature"),
  ];

  for (const cookie of cookies) {
    assert.match(cookie, new RegExp(`Max-Age=${FIVE_DAYS}`));
  }
});
