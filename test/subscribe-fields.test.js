import test from "node:test";
import assert from "node:assert/strict";
import { parseBetaFlag } from "../src/index.js";

test("beta flag: only an explicit yes counts", () => {
  for (const yes of ["1", "true", "on", "yes", "YES", "True"]) {
    assert.equal(parseBetaFlag(yes), true);
  }
  for (const no of [undefined, null, "", "0", "false", "off", "maybe", 1, {}]) {
    assert.equal(parseBetaFlag(no), false);
  }
});
