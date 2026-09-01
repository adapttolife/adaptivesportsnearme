#!/usr/bin/env node
/**
 * Tester-only discover runner. PROPOSE into review_queue on asnm-db-staging.
 * Never writes asnm-db. Never inserts organizations. Never sets is_public=1.
 * Does not apply the proposal — a person still has to say yes in admin.
 *
 *   node discover-tester.mjs --file leftover-candidates.json
 *   node discover-tester.mjs --file leftover-candidates.json --apply
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { sqlQuote, WORKER_DIR, STAGING_DB, LIVE_DB, ROOT, AUDIT_DIR, LIVE_PUBLIC_EXPECTED } from "./lib.mjs";
import {
  parseCandidates,
  loadKnown,
  filterAdds,
  writeInboxCard,
  normName,
} from "./file-discover.mjs";

const STATE_NAMES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
  ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia",
};

function die(msg) {
  console.error(`discover-tester: ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const out = { file: `${ROOT}/leftover-candidates.json`, apply: false, slug: "leftover" };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply") out.apply = true;
    else if (a === "--file") out.file = argv[++i];
    else if (a.startsWith("--file=")) out.file = a.slice(7);
    else if (a === "--slug") out.slug = argv[++i];
    else die(`unknown arg ${a}`);
  }
  return out;
}

function wranglerJson(args) {
  if (args.includes(LIVE_DB) && !/^\s*select/i.test(args[args.indexOf("--command") + 1] || "")) {
    die("refusing a non-SELECT against asnm-db (live stays locked)");
  }
  return execFileSync("wrangler", args, {
    cwd: WORKER_DIR,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function parseResults(raw) {
  const parsed = JSON.parse(raw);
  return parsed?.[0]?.results || parsed?.result?.[0]?.results || parsed?.results || [];
}

function livePublicCount() {
  const raw = wranglerJson([
    "d1", "execute", LIVE_DB, "--remote",
    "--command", "SELECT COUNT(*) AS n FROM organizations WHERE is_public = 1 AND status = 'active'",
    "--json",
  ]);
  const n = Number(parseResults(raw)[0]?.n);
  if (!Number.isFinite(n)) die(`could not parse live count: ${String(raw).slice(0, 400)}`);
  return n;
}

function stagingSelect(sql) {
  if (!/^\s*select/i.test(sql)) die("stagingSelect is read-only");
  const raw = wranglerJson([
    "d1", "execute", STAGING_DB, "--env", "staging", "--remote",
    "--command", sql, "--json",
  ]);
  return parseResults(raw);
}

function loadPendingDiscover() {
  const rows = stagingSelect(
    "SELECT item_id, proposed_change, evidence FROM review_queue WHERE lane='discover' AND status='pending'",
  );
  const names = new Set();
  const urls = new Set();
  const ids = [];
  for (const r of rows) {
    ids.push(r.item_id);
    let change = r.proposed_change;
    if (typeof change === "string") {
      try { change = JSON.parse(change); } catch { change = {}; }
    }
    const name = change?.name?.to ?? change?.name;
    const url = change?.website_url?.to ?? change?.website_url ?? change?.source_url?.to;
    if (name) names.add(normName(name));
    if (url) urls.add(String(url).toLowerCase());
  }
  return { names, urls, ids };
}

function assertProposeOnly(sql) {
  const upper = sql.toUpperCase();
  if (upper.includes("INSERT INTO ORGANIZATIONS") || upper.includes("UPDATE ORGANIZATIONS")) {
    die("refusing SQL that writes organizations (discover proposes only)");
  }
  if (/IS_PUBLIC\s*=\s*1/.test(upper)) {
    die("refusing SQL that sets is_public=1");
  }
  if (/\bASNM-DB\b/.test(upper) && !/DO NOT RUN AGAINST ASNM-DB/.test(upper)) {
    die("refusing SQL that names live asnm-db as a target");
  }
  if (!/INSERT INTO REVIEW_QUEUE/.test(upper) && /VALUES \(/.test(upper)) {
    die("expected review_queue inserts only");
  }
}

function buildSql(adds, runId, now) {
  const lines = [
    `-- ASNM STAGING ONLY — discover tester propose`,
    `-- Target: ${STAGING_DB}`,
    `-- DO NOT run against asnm-db / production`,
    `-- Generated: ${now}`,
    `-- run_id: ${runId}`,
    `-- Live stays locked. PROPOSE only. No organizations write. No is_public.`,
    ``,
  ];
  const fields = [
    "name", "org_type", "sport", "sport_key", "sports_json", "website_url",
    "email", "phone", "city", "state", "state_name", "zip", "description",
  ];
  for (const add of adds) {
    const change = {};
    const values = {
      name: add.name,
      org_type: add.org_type || "adaptive_club",
      sport: add.sport || null,
      sport_key: add.sport_key || null,
      sports_json: JSON.stringify(add.sports || []),
      website_url: add.website_url,
      email: add.email || null,
      phone: add.phone || null,
      city: add.city || null,
      state: add.state || null,
      state_name: add.state ? (STATE_NAMES[add.state] || null) : null,
      zip: add.zip || null,
      description: add.description || null,
    };
    for (const k of fields) {
      if (values[k] === null || values[k] === undefined || values[k] === "") continue;
      change[k] = { from: null, to: values[k] };
    }
    const evidence = {
      source: "discover-tester",
      run_id: runId,
      source_url: add.source_url,
      method: "file-discover leftover candidates",
      note: "PROPOSE only. Not applied. is_public not set.",
    };
    lines.push(`-- propose ${add.name} from ${add.source_url}`);
    lines.push(
      `INSERT INTO review_queue (organization_id, lane, proposed_change, evidence, confidence, status, created_at)`,
    );
    lines.push(
      `VALUES (NULL, 'discover', ${sqlQuote(JSON.stringify(change))}, ${sqlQuote(JSON.stringify(evidence))}, 0.8, 'pending', ${sqlQuote(now)});`,
    );
    lines.push(``);
  }
  return lines.join("\n");
}

function main() {
  const args = parseArgs(process.argv);
  const file = resolve(args.file);
  const runId = randomUUID();
  const now = new Date().toISOString();

  const liveBefore = livePublicCount();
  if (liveBefore !== LIVE_PUBLIC_EXPECTED) {
    die(`live public count is ${liveBefore}, expected ${LIVE_PUBLIC_EXPECTED}. abort (live stays locked).`);
  }

  const known = loadKnown();
  const cands = parseCandidates(file);
  const { adds: rawAdds, skipped } = filterAdds(cands, known);
  const pending = loadPendingDiscover();
  const adds = [];
  for (const a of rawAdds) {
    if (pending.names.has(normName(a.name))) {
      skipped.push({ name: a.name, reason: "already pending on tester review_queue" });
      continue;
    }
    if (a.website_url && pending.urls.has(a.website_url.toLowerCase())) {
      skipped.push({ name: a.name, reason: "same source already pending on tester review_queue" });
      continue;
    }
    adds.push(a);
  }

  const { out: cardPath } = writeInboxCard(adds, skipped, args.slug);
  mkdirSync(AUDIT_DIR, { recursive: true });
  const sqlPath = `${AUDIT_DIR}/discover-tester-staging.sql`;
  const receiptPath = `${ROOT}/discover-tester-receipt.json`;
  const sql = buildSql(adds, runId, now);
  assertProposeOnly(sql);
  writeFileSync(sqlPath, sql);

  const receipt = {
    slug: args.slug,
    file,
    sqlPath,
    cardPath,
    applied: false,
    target: STAGING_DB,
    live_count_before: liveBefore,
    live_count_after: null,
    run_id: runId,
    filed: adds.length,
    skipped,
    item_ids: [],
    adds: adds.map((a) => ({ name: a.name, source_url: a.source_url, state: a.state })),
    note: "PROPOSE only on asnm-db-staging. No organizations insert. No is_public. Live stays locked.",
  };

  if (!args.apply) {
    writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + "\n");
    console.log(`dry-run wrote ${sqlPath}`);
    console.log(`inbox ${cardPath}`);
    console.log(`receipt ${receiptPath}`);
    console.log(`would propose ${adds.length}; skipped ${skipped.length}`);
    for (const s of skipped) console.log(`  - ${s.name}: ${s.reason}`);
    console.log(`live public still ${liveBefore} (locked)`);
    console.log("pass --apply to INSERT review_queue on asnm-db-staging only");
    return;
  }

  if (!adds.length) {
    receipt.live_count_after = livePublicCount();
    writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + "\n");
    console.log("nothing to propose (all skipped). live stays locked.");
    return;
  }

  wranglerJson(["d1", "execute", STAGING_DB, "--env", "staging", "--remote", "--file", sqlPath]);
  const rows = stagingSelect(
    `SELECT item_id, proposed_change FROM review_queue WHERE lane='discover' AND evidence LIKE '%${runId}%' ORDER BY item_id`,
  );
  const itemIds = rows.map((r) => r.item_id);
  const liveAfter = livePublicCount();
  receipt.applied = true;
  receipt.applied_at = new Date().toISOString();
  receipt.item_ids = itemIds;
  receipt.live_count_after = liveAfter;
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + "\n");

  if (liveAfter !== LIVE_PUBLIC_EXPECTED) {
    die(`live public count drifted to ${liveAfter} after staging propose — STOP`);
  }

  console.log(`applied ${sqlPath} -> ${STAGING_DB}`);
  console.log(`review_queue ids: ${itemIds.join(", ") || "(none)"}`);
  console.log(`proposed ${adds.length}; skipped ${skipped.length}`);
  for (const a of adds) console.log(`  + ${a.name} (${a.state}) ${a.source_url}`);
  console.log(`live public still ${liveAfter} (locked)`);
  console.log("proposals pending. not applied. is_public unchanged.");
}

main();
