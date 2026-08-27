#!/usr/bin/env node
/**
 * Tiny lane eval with a receipt.
 * Proves: extractors still work; discover dry-run does not write live;
 * resolve twins helper still filters obvious same-domain pairs.
 *
 *   node tools/directory/eval-lanes.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { execFileSync } from "node:child_process";
import { extractContacts } from "../../src/extract.js";
import { findDuplicates, normalizeDomain } from "../../src/lanes/resolve.js";
import { skipReason, GENERIC } from "./file-discover.mjs";
import { WORKER_DIR, LIVE_DB, ROOT, TESTER, AUDIT_DIR, LIVE_PUBLIC_EXPECTED } from "./lib.mjs";
const RECEIPT = `${ROOT}/eval-lanes-receipt.json`;

function livePublicCount() {
  const raw = execFileSync("wrangler", [
    "d1", "execute", LIVE_DB, "--remote",
    "--command", "SELECT COUNT(*) AS n FROM organizations WHERE is_public = 1 AND status = 'active'",
    "--json",
  ], { cwd: WORKER_DIR, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const parsed = JSON.parse(raw);
  const rows = parsed?.[0]?.results || parsed?.result?.[0]?.results || parsed?.results || [];
  return Number(rows[0]?.n);
}

function testerProgramsSample() {
  const raw = execFileSync("curl", [
    "-sS", `${TESTER}/api/programs?limit=20&offset=0`,
  ], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const data = JSON.parse(raw);
  return data;
}

function check(name, ok, detail) {
  return { name, pass: !!ok, detail };
}

const tests = [];
let failed = 0;
function add(t) {
  tests.push(t);
  if (!t.pass) failed++;
  console.log(`${t.pass ? "PASS" : "FAIL"}  ${t.name}${t.detail ? ` — ${t.detail}` : ""}`);
}

// ---- 1. validate extractors (reuse extract tests + one fixture read) ----
const extractRun = spawnSync(process.execPath, ["--test", "test/extract.test.js"], {
  cwd: WORKER_DIR,
  encoding: "utf8",
});
add(check(
  "extract.test.js",
  extractRun.status === 0,
  extractRun.status === 0 ? "node --test extract.test.js exited 0" : (extractRun.stderr || extractRun.stdout).slice(0, 400),
));

const html = readFileSync(new URL("../../test/fixtures/synth-jsonld-org-postaladdress.html", import.meta.url), "utf8");
const facts = extractContacts(html, "https://synth-club.test/");
add(check("extractContacts emails", facts.emails.includes("hello@synth-club.test"), JSON.stringify(facts.emails)));
add(check("extractContacts address city", facts.address?.city === "Boulder", JSON.stringify(facts.address)));
add(check("extractContacts jsonld name", facts.jsonld?.[0]?.name === "Synthetic Adaptive Sports Club", facts.jsonld?.[0]?.name || "missing"));

// ---- 2. discover dry-run would not write live ----
const liveBefore = livePublicCount();
add(check("live public before dry-run", liveBefore === LIVE_PUBLIC_EXPECTED, `count=${liveBefore}`));

const dry = spawnSync(process.execPath, [
  `${ROOT}/discover-tester.mjs`,
  "--file", `${ROOT}/leftover-candidates.json`,
  "--slug", "leftover",
], { encoding: "utf8" });
add(check(
  "discover-tester dry-run",
  dry.status === 0,
  dry.status === 0 ? (dry.stdout || "").trim().split("\n").slice(0, 4).join(" | ") : (dry.stderr || dry.stdout).slice(0, 500),
));

const liveAfter = livePublicCount();
add(check("live public after dry-run", liveAfter === LIVE_PUBLIC_EXPECTED, `count=${liveAfter}`));
add(check("live count unchanged", liveBefore === liveAfter, `${liveBefore} -> ${liveAfter}`));

let testerApi = null;
try {
  testerApi = testerProgramsSample();
} catch (e) {
  testerApi = { ok: false, error: String(e.message || e).slice(0, 240) };
}
const testerItems = testerApi?.items || [];
const testerFresh = testerItems.find((i) => i.freshness != null);
add(check("tester API ok", testerApi?.ok === true, testerApi?.ok ? `total=${testerApi.total}` : (testerApi?.error || "not ok")));
add(check(
  "tester API returns freshness on at least one row",
  testerFresh != null,
  testerFresh ? `${testerFresh.name} freshness=${testerFresh.freshness}` : "no scored row in first 20",
));

let sql = "";
try {
  sql = readFileSync(`${AUDIT_DIR}/discover-tester-staging.sql`, "utf8");
} catch (e) {
  sql = "";
}
const proposedZero = /would propose 0/.test(dry.stdout || "") || /nothing to propose/.test(dry.stdout || "");
add(check(
  "dry-run wrote staging SQL",
  sql.includes("INSERT INTO review_queue") || (Boolean(sql) && proposedZero),
  sql.includes("INSERT INTO review_queue") ? "review_queue inserts present" : (proposedZero ? "empty propose, header only" : "missing SQL"),
));
add(check("SQL does not insert organizations", !/INSERT INTO organizations/i.test(sql), "no organizations write"));
add(check("SQL does not set is_public=1", !/is_public\s*=\s*1/i.test(sql), "no is_public"));
add(check("SQL targets staging only", /Target: asnm-db-staging/.test(sql) && /DO NOT run against asnm-db/.test(sql), "header lock"));

const invented = skipReason(
  { name: "Adaptive Sports Iowa", url: "https://example-not-real.org/", source_url: "https://example-not-real.org/" },
  { names: new Set(), domains: new Set(), byDomain: new Map() },
);
add(check("file-discover refuses invented statewide name", invented === "invented statewide name", invented));

const generic = skipReason(
  { name: "Some Facebook Page", url: "https://www.facebook.com/someorg", source_url: "https://www.facebook.com/someorg" },
  { names: new Set(), domains: new Set(), byDomain: new Map() },
);
add(check("file-discover skips generic domain", generic === "generic domain facebook.com" && GENERIC.has("facebook.com"), generic));

// ---- 3. resolve twins helper still filters obvious same-domain pairs ----
const sameDomain = findDuplicates([
  {
    id: "keep-1", name: "Denver Wheelchair Sports", state: "CO", city: "Denver",
    website_url: "https://www.denverwheelchair.org", verification_status: "unverified",
    created_at: "2020-01-01T00:00:00Z",
  },
  {
    id: "dup-2", name: "Denver Wheelchair Sports Alt", state: "CO", city: "Denver",
    website_url: "https://denverwheelchair.org/home", verification_status: "unverified",
    created_at: "2024-01-01T00:00:00Z",
  },
]);
add(check(
  "findDuplicates flags same-domain pair",
  sameDomain.length === 1 && sameDomain[0].tier === "domain" && sameDomain[0].dupId === "dup-2" && sameDomain[0].canonicalId === "keep-1",
  JSON.stringify(sameDomain),
));

add(check("normalizeDomain strips www", normalizeDomain("https://WWW.Example.COM/path") === "example.com", String(normalizeDomain("https://WWW.Example.COM/path"))));
add(check("normalizeDomain facebook is not identity", normalizeDomain("https://www.facebook.com/someorg") === null, String(normalizeDomain("https://www.facebook.com/someorg"))));

const facebookPair = findDuplicates([
  {
    id: "a", name: "Alpha Club", state: "CO", city: "Denver",
    website_url: "https://www.facebook.com/alpha", verification_status: "unverified",
    created_at: "2020-01-01T00:00:00Z",
  },
  {
    id: "b", name: "Beta Club", state: "CO", city: "Boulder",
    website_url: "https://www.facebook.com/beta", verification_status: "unverified",
    created_at: "2020-01-01T00:00:00Z",
  },
]);
add(check(
  "findDuplicates does not merge shared facebook.com",
  facebookPair.length === 0,
  JSON.stringify(facebookPair),
));

const receipt = {
  when: new Date().toISOString(),
  pass: failed === 0,
  failed,
  passed: tests.filter((t) => t.pass).length,
  live_public_before: liveBefore,
  live_public_after: liveAfter,
  live_locked: liveBefore === LIVE_PUBLIC_EXPECTED && liveAfter === LIVE_PUBLIC_EXPECTED,
  tests,
  note: "Dry-run only. Live asnm-db was SELECT-only. Discover did not apply.",
};
writeFileSync(RECEIPT, JSON.stringify(receipt, null, 2) + "\n");
console.log("");
console.log(failed === 0 ? `EVAL PASS  ${receipt.passed}/${tests.length}` : `EVAL FAIL  ${failed} failed`);
console.log(`live public ${liveAfter} (locked)`);
console.log(`receipt ${RECEIPT}`);
process.exit(failed === 0 ? 0 : 1);
