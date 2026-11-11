#!/usr/bin/env node
// Read-only release check for the adaptivesportsnearme Worker.
//
//   npm run check:release
//
// Run it before every production release and again after it. It uses your
// own Wrangler login and only reads: it never uploads, deploys or edits.
// Exit codes: 0 safe, 1 not safe, 2 could not read the Worker.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import {
  assessRelease,
  deployedVersionId,
  newestVersion,
  secretNames,
} from "./lib/release-secrets.mjs";

const spec = JSON.parse(
  readFileSync(new URL("../config/production-secrets.json", import.meta.url), "utf8"),
);
const worker = spec.worker;
const required = Object.keys(spec.required);

function wrangler(...args) {
  const output = execFileSync(
    "npx",
    ["wrangler", ...args, "--name", worker, "--json"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  );
  return JSON.parse(output);
}

let deployed;
let newest;
try {
  const liveId = deployedVersionId(wrangler("deployments", "status"));
  const latest = newestVersion(wrangler("versions", "list"));
  deployed = wrangler("versions", "view", liveId);
  newest = latest.id === liveId ? deployed : wrangler("versions", "view", latest.id);
} catch (error) {
  console.error(
    `Could not read ${worker} through Wrangler. Are you logged in to the Adapt To Life account?`,
  );
  console.error(error.message);
  process.exit(2);
}

const day = (version) => (version.metadata?.created_on ?? "").slice(0, 10);
const alias = (version) => version.annotations?.["workers/alias"];
const deployedSecrets = secretNames(deployed);
const newestSecrets = secretNames(newest);
const result = assessRelease({ required, newestSecrets, deployedSecrets });

console.log(
  `Live version:  #${deployed.number} (${day(deployed)}), ${deployedSecrets.length} secrets`,
);
console.log(
  `Newest upload: #${newest.number} (${day(newest)}${
    alias(newest) ? `, alias ${alias(newest)}` : ""
  }), ${newestSecrets.length} secrets`,
);
console.log("The next release copies its secrets from the newest upload.");

if (newest.id !== deployed.id) {
  console.log(
    `\nThe newest upload is not the live version. Do not add or edit secrets or variables in the Cloudflare dashboard right now: a dashboard edit deploys #${newest.number} to production.`,
  );
}

if (result.missingFromDeployed.length > 0) {
  console.log(
    `\nThe live version itself lacks: ${result.missingFromDeployed.join(", ")}`,
  );
}

if (result.safe) {
  console.log(`\nSAFE: the newest upload holds all ${required.length} required secrets.`);
  process.exit(0);
}

console.log(
  `\nNOT SAFE: releasing now would ship production without: ${result.missingFromNewest.join(", ")}`,
);
console.log("\nFix it first. Each command makes a new version and deploys nothing:");
for (const name of result.missingFromNewest) {
  console.log(`  npx wrangler versions secret put ${name} --name ${worker}`);
}
console.log("\nThen run npm run check:release again. Release only when it says SAFE.");
process.exit(1);
