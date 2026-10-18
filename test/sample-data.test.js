// db/sample/sample.sql ships in a public repository: public listings only, and no
// contact details (scripts/build-sample-data.mjs refuses to write one that has any).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sql = readFileSync(new URL("../db/sample/sample.sql", import.meta.url), "utf8");
const CONTACT = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\(?\b\d{3}\)?[ .-]\d{3}[ .-]\d{4}\b/i;

test("the contact check catches an email address and a phone number", () => {
  assert.match("Questions: info@example.org", CONTACT);
  assert.match("call 510-849-4663", CONTACT);
  assert.match("(915) 779-4770", CONTACT);
});

test("the sample data has no email address or phone number", () => {
  assert.doesNotMatch(sql, CONTACT);
});

test("the sample data never names a private column", () => {
  const cols = new Set([...sql.matchAll(/^INSERT INTO \w+ \(([^)]*)\) VALUES/gm)].flatMap((m) => m[1].split(", ")));
  for (const col of ["email", "phone", "claim_email", "internal_notes", "intake_row", "zip"]) assert.ok(!cols.has(col), `sample.sql writes ${col}`);
  assert.ok(cols.has("name") && cols.has("website_url"), "the column lists were read");
});

test("the sample data has listings to show", () => {
  assert.ok((sql.match(/^INSERT INTO organizations /gm) || []).length >= 50);
  assert.ok((sql.match(/^INSERT INTO grants /gm) || []).length >= 10);
});
