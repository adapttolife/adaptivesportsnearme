#!/usr/bin/env node
/**
 * One front door for Adaptive Sports Near Me directory tools.
 * Staging / tester only. Live stays locked.
 *
 *   node asnm.mjs status | queue | diff | gaps | recheck | rescue
 *   node asnm.mjs export geocode
 *   node asnm.mjs lint path.json
 *   node asnm.mjs read https://…
 *   node asnm.mjs discover leftover-candidates.json
 *   node asnm.mjs eval-lanes
 */
import { spawnSync } from "node:child_process";
import { ROOT } from "./lib.mjs";

const [cmd, ...rest] = process.argv.slice(2);
const run = (file, args = []) => {
  const r = spawnSync(process.execPath, [`${ROOT}/${file}`, ...args], { stdio: "inherit" });
  process.exit(r.status ?? 1);
};

const help = `asnm — tester directory tools. Live stays locked.

  status              live vs tester counts + last cron jobs
  queue               what's waiting in the review pile
  diff                live vs tester
  gaps                thinnest states (for later discover)
  recheck             re-hit pending dead-link proposals
  rescue              if a hidden listing's home page is up, write an inbox card
  hide-404s           dry-run hide last recheck 404s (add --apply for tester)
  twins               keep only obvious same-name twins in the resolve card
  export <lane>       geocode|classify|enrich|resolve|validate → inbox card
  lint <card.json>    refuse invented names
  read <https://…>    same page reader the website cron jobs use
  ship <card.json>    dry-run tester SQL (add --apply only after a yes)
  discover [file]     propose leftover candidates to tester review_queue (add --apply)
  eval-lanes          prove extract / discover-dry / resolve twins still hold
`;

if (!cmd || cmd === "help" || cmd === "-h") {
  process.stdout.write(help);
  process.exit(0);
}

if (cmd === "status") {
  run("clock-status.mjs");
} else if (cmd === "queue") {
  run("queue-peek.mjs");
} else if (cmd === "diff") {
  run("live-vs-tester.mjs");
} else if (cmd === "gaps") {
  run("file-discover.mjs", ["--gaps"]);
} else if (cmd === "recheck") {
  run("recheck-validate.mjs");
} else if (cmd === "rescue") {
  run("homepage-rescue.mjs");
} else if (cmd === "hide-404s") {
  run("apply-recheck.mjs", rest);
} else if (cmd === "twins") {
  run("twin-filter.mjs", rest);
} else if (cmd === "export") {
  run("export-lane.mjs", rest);
} else if (cmd === "lint") {
  run("lint-card.mjs", rest);
} else if (cmd === "read") {
  run("read-page.mjs", rest);
} else if (cmd === "ship") {
  const apply = rest.includes("--apply");
  const file = rest.find((a) => a !== "--apply");
  run("ship-approved.mjs", apply ? ["--file", file, "--apply"] : ["--file", file]);
} else if (cmd === "discover") {
  const apply = rest.includes("--apply");
  const file = rest.find((a) => a !== "--apply");
  const args = [];
  if (file) args.push("--file", file);
  if (apply) args.push("--apply");
  run("discover-tester.mjs", args);
} else if (cmd === "eval-lanes") {
  run("eval-lanes.mjs", rest);
} else {
  console.error(help);
  process.exit(1);
}
