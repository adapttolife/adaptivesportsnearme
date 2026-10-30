import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("the legacy favicon URL serves a valid ICO container", () => {
  const icon = readFileSync(new URL("../public/favicon.ico", import.meta.url));
  assert.equal(icon.readUInt16LE(0), 0);
  assert.equal(icon.readUInt16LE(2), 1);
  assert.equal(icon.readUInt16LE(4), 1);
  assert.equal(icon.readUInt8(6), 32);
  assert.equal(icon.readUInt8(7), 32);
  assert.ok(icon.subarray(22, 30).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])));
});
