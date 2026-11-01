// This repository is public. A file committed here may never carry an email address, phone number or street address
// from the directory: the site shows those only with the organization's yes (src/public-text.js).
// Earned 2026-10-18: db/maintenance/staging_only_into_production.sql carried the email and phone columns of 129
// organizations; it was removed and purged from the history. The first test covers the data-fix folders; the second
// covers every committed file, because the next copy of the database could land anywhere.
// A failure names the file, never the detail.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { contactIn } from "../src/public-text.js";

const root = new URL("../", import.meta.url);
const OURS =
  /@(adaptivesportsnearme\.com|mail\.adaptivesportsnearme\.com|adapttolife\.org|example\.(org|com))\b/i;
const withoutOurs = (text) =>
  text
    .split("\n")
    .filter((line) => !OURS.test(line))
    .join("\n");
const files = [
  ["db/maintenance", /\.(sql|csv)$/],
  ["docs/data-fixes", /\.(csv|md|sql)$/],
  ["db/sample", /\.sql$/],
].flatMap(([dir, re]) =>
  existsSync(new URL(dir, root))
    ? readdirSync(new URL(dir, root))
        .filter((f) => re.test(f))
        .map((f) => `${dir}/${f}`)
    : [],
);

test("data-fix files carry no contact details", () => {
  assert.ok(files.length > 5, "the data-fix files were found");
  for (const f of files)
    assert.equal(
      contactIn(withoutOurs(readFileSync(new URL(f, root), "utf8"))),
      null,
      `${f} contains a contact detail`,
    );
});

// Files that hold a contact-like detail on purpose, each read and kept by a person. Tests are left out as a whole:
// they use made-up details and copies of organizations' own public web pages.
const REVIEWED = new Map([
  ["docs/FIELD-CONTRACTS.md", "an example of a scraped address fragment"],
  ["docs/START-HERE.md", "the team's own contact"],
  ["public/site-nav.js", "a placeholder in the signup box"],
  ["src/description-contract.js", "an example note in a comment"],
  ["src/public-text.js", "the example note that explains the rule"],
  [
    "tools/directory/eval-lanes.mjs",
    "a value expected from a saved copy of a public web page",
  ],
]);
const BINARY =
  /\.(svg|png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|mp4|webm|mov|pdf|eps|zip|gz)$/i;

function committedFiles() {
  try {
    return execFileSync("git", ["ls-files", "-z"], { cwd: fileURLToPath(root) })
      .toString()
      .split("\0")
      .filter(Boolean);
  } catch {
    // No git (a downloaded copy): walk the tree instead.
    const out = [];
    const walk = (dir) => {
      for (const name of readdirSync(new URL(dir, root))) {
        if (["node_modules", ".git", ".wrangler"].includes(name)) continue;
        const rel = dir ? `${dir}/${name}` : name;
        if (statSync(new URL(rel, root)).isDirectory()) walk(rel);
        else out.push(rel);
      }
    };
    walk("");
    return out;
  }
}

test("no committed file carries a contact detail, outside tests and the reviewed list", () => {
  const all = committedFiles();
  assert.ok(all.length > 100, "the committed files were found");
  const found = [];
  for (const f of all) {
    if (
      f.startsWith("test/") ||
      BINARY.test(f) ||
      REVIEWED.has(f) ||
      !existsSync(new URL(f, root))
    )
      continue;
    const bytes = readFileSync(new URL(f, root));
    if (bytes.subarray(0, 8000).includes(0)) continue;
    if (contactIn(withoutOurs(bytes.toString("utf8"))) != null) found.push(f);
  }
  assert.deepEqual(
    found,
    [],
    `contact details in: ${found.join(", ")}. Take them out, or if one is meant to be public, add the file to REVIEWED with the reason`,
  );
  for (const f of REVIEWED.keys())
    assert.ok(
      all.includes(f),
      `${f} is on the reviewed list but no longer committed; take it off`,
    );
});
