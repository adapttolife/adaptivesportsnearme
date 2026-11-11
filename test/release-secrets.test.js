import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import {
  assessRelease,
  deployedVersionId,
  newestVersion,
  secretLikeEnvNames,
  secretNames,
} from "../scripts/lib/release-secrets.mjs";

const spec = JSON.parse(
  readFileSync(new URL("../config/production-secrets.json", import.meta.url), "utf8"),
);
const srcDir = new URL("../src/", import.meta.url);
const source = readdirSync(srcDir, { recursive: true })
  .filter((file) => file.endsWith(".js"))
  .map((file) => readFileSync(new URL(file, srcDir), "utf8"))
  .join("\n");
const reads = (name) => new RegExp(`\\benv\\.${name}\\b`).test(source);

test("every secret the code reads is listed in config/production-secrets.json", () => {
  const listed = new Set([...Object.keys(spec.required), ...Object.keys(spec.optional)]);
  const unlisted = [...secretLikeEnvNames(source)].filter((name) => !listed.has(name));
  assert.deepEqual(
    unlisted,
    [],
    `Add these to config/production-secrets.json (required or optional): ${unlisted.join(", ")}`,
  );
});

test("every required secret is still read by the code", () => {
  assert.deepEqual(Object.keys(spec.required).filter((name) => !reads(name)), []);
});

test("retired secrets are no longer read by the code", () => {
  assert.deepEqual(Object.keys(spec.retired).filter(reads), []);
});

test("a release is not safe when the newest upload lacks secrets the live version has", () => {
  const result = assessRelease({
    required: ["A", "B"],
    newestSecrets: [],
    deployedSecrets: ["A", "B"],
  });
  assert.equal(result.safe, false);
  assert.deepEqual(result.missingFromNewest, ["A", "B"]);
  assert.deepEqual(result.missingFromDeployed, []);
});

test("a release is safe when the newest upload holds every required secret", () => {
  const result = assessRelease({
    required: ["A", "B"],
    newestSecrets: ["A", "B", "OLD"],
    deployedSecrets: ["A"],
  });
  assert.equal(result.safe, true);
  assert.deepEqual(result.missingFromDeployed, ["B"]);
});

test("the helpers read Wrangler's JSON shapes", () => {
  assert.deepEqual(
    secretNames({
      resources: {
        bindings: [
          { type: "secret_text", name: "B" },
          { type: "d1", name: "DB" },
          { type: "secret_text", name: "A" },
        ],
      },
    }),
    ["A", "B"],
  );
  assert.equal(newestVersion([{ number: 3 }, { number: 9 }, { number: 4 }]).number, 9);
  assert.equal(
    deployedVersionId({
      versions: [
        { version_id: "x", percentage: 10 },
        { version_id: "y", percentage: 90 },
      ],
    }),
    "y",
  );
});
