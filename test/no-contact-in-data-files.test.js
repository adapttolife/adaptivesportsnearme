// Data-fix files are committed to a public repository. They may never carry an
// email address, phone number or street address from the directory: the site
// shows those only with the organization's yes (src/public-text.js).
// Earned 2026-10-18: db/maintenance/staging_only_into_production.sql carried the
// email and phone columns of 129 organizations and was removed.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { contactIn } from "../src/public-text.js";

const root = new URL("../", import.meta.url);
const OURS = /@(adaptivesportsnearme\.com|mail\.adaptivesportsnearme\.com|adapttolife\.org|example\.(org|com))\b/i;
const files = [["db/maintenance", /\.(sql|csv)$/], ["docs/data-fixes", /\.(csv|md|sql)$/], ["db/sample", /\.sql$/]]
  .flatMap(([dir, re]) => existsSync(new URL(dir, root)) ? readdirSync(new URL(dir, root)).filter((f) => re.test(f)).map((f) => `${dir}/${f}`) : []);

test("data-fix files carry no contact details", () => {
  assert.ok(files.length > 5, "the data-fix files were found");
  for (const f of files) {
    const text = readFileSync(new URL(f, root), "utf8").split("\n").filter((line) => !OURS.test(line)).join("\n");
    assert.equal(contactIn(text), null, `${f} contains a contact detail`);
  }
});
