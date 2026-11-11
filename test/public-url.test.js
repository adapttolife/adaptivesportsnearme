import assert from "node:assert/strict";
import test from "node:test";

import { normalizePublicUrl } from "../src/public-url.js";

test("public URL writes normalize permitted HTTP URLs", () => {
  assert.equal(
    normalizePublicUrl("example.org/programs"),
    "https://example.org/programs",
  );
  assert.equal(
    normalizePublicUrl("HTTP://Example.ORG:80/path"),
    "http://example.org/path",
  );
});

test("public URL writes reject unsafe or non-public URLs", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,hello",
    "//evil.example",
    "http://127.0.0.1/",
    "https://8.8.8.8/",
    "http://localhost/",
    "https://user:pass@example.org/",
  ]) assert.throws(() => normalizePublicUrl(value), /url-invalid/);
});
