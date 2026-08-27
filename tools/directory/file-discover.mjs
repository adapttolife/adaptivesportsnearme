#!/usr/bin/env node
/**
 * Discover filing half — port of alecs-version/scripts/discover.py
 * against the tester list. Does not write any database.
 *
 * A person (or a later search) produces candidates.
 * This script drops ones we already have and writes inbox cards.
 *
 *   node file-discover.mjs --gaps
 *   node file-discover.mjs --file candidates.tsv
 *   node file-discover.mjs --file candidates.json
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, basename } from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

import { WORKER_DIR, ROOT } from "./lib.mjs";
export { WORKER_DIR };
export const INBOX = `${ROOT}/inbox`;
export const STAGING_DB = "asnm-db-staging";
export const GENERIC = new Set([
  "facebook.com", "instagram.com", "youtube.com", "twitter.com", "x.com",
  "linkedin.com", "wikipedia.org", "yelp.com", "eventbrite.com",
  "moveunitedsport.org", "challengedathletes.org", "teamusa.org", "usopc.org",
  "adaptivesportsnearme.com", "reddit.com", "tiktok.com", "google.com",
  "nchpad.org", "disabledsportsusa.org", "specialolympics.org",
  "sites.google.com",
]);

function die(msg) {
  console.error(`file-discover: ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const out = { file: null, gaps: false, slug: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--gaps") out.gaps = true;
    else if (a === "--file") out.file = argv[++i];
    else if (a.startsWith("--file=")) out.file = a.slice(7);
    else if (a === "--slug") out.slug = argv[++i];
    else die(`unknown arg ${a}`);
  }
  if (!out.gaps && !out.file) {
    die("usage: node file-discover.mjs --gaps | --file candidates.tsv|json [--slug name]");
  }
  return out;
}

function wranglerJson(args) {
  return execFileSync("wrangler", args, {
    cwd: WORKER_DIR,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function d1Select(sql) {
  const raw = wranglerJson([
    "d1", "execute", STAGING_DB, "--env", "staging", "--remote",
    "--command", sql, "--json",
  ]);
  const parsed = JSON.parse(raw);
  return parsed?.[0]?.results || parsed?.result?.[0]?.results || parsed?.results || [];
}

export function normName(name) {
  let n = String(name || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9 ]/g, " ");
  n = n.replace(/\b(inc|llc|the|incorporated|corp|corporation)\b/g, " ");
  return n.replace(/\s+/g, " ").trim();
}

export function host(url) {
  try {
    const u = new URL(/^https?:/i.test(url) ? url : `https://${url}`);
    return u.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function baseDomain(h) {
  const parts = h.split(".").filter(Boolean);
  return parts.length >= 2 ? parts.slice(-2).join(".") : h;
}

export function loadKnown() {
  const rows = d1Select(
    "SELECT id, name, website_url, state, status FROM organizations WHERE status IN ('active','duplicate')",
  );
  const names = new Set();
  const domains = new Set();
  const byDomain = new Map();
  for (const r of rows) {
    if (r.name) names.add(normName(r.name));
    const d = baseDomain(host(r.website_url || ""));
    if (d) {
      domains.add(d);
      if (!byDomain.has(d)) byDomain.set(d, []);
      byDomain.get(d).push(r);
    }
  }
  return { names, domains, byDomain, count: rows.length };
}

export function parseCandidates(file) {
  const text = readFileSync(file, "utf8");
  if (file.endsWith(".json")) {
    const data = JSON.parse(text);
    const list = Array.isArray(data) ? data : (data.candidates || data.adds || []);
    return list.map((c) => ({
      name: c.name,
      url: c.website_url || c.url || c.source_url,
      state: c.state || "",
      city: c.city || "",
      zip: c.zip || "",
      email: c.email || null,
      phone: c.phone || null,
      org_type: c.org_type || null,
      sport: c.sport || null,
      sport_key: c.sport_key || null,
      sports: Array.isArray(c.sports) ? c.sports : [],
      evidence: c.evidence || c.description || "",
      description: c.description || c.evidence || null,
      source_url: c.source_url || c.website_url || c.url,
    }));
  }
  return text.split(/\r?\n/).map((line) => {
    if (!line.trim() || line.startsWith("#")) return null;
    const [name, url, state, evidence] = line.split("\t");
    if (!name || !url) return null;
    return {
      name: name.trim(),
      url: url.trim(),
      state: (state || "").trim(),
      city: "",
      zip: "",
      email: null,
      phone: null,
      org_type: null,
      sport: null,
      sport_key: null,
      sports: [],
      evidence: (evidence || "").trim(),
      description: (evidence || "").trim() || null,
      source_url: url.trim(),
    };
  }).filter(Boolean);
}

export function skipReason(c, known) {
  const d = baseDomain(host(c.url || c.source_url || ""));
  const n = normName(c.name);
  if (!c.name || !/^https:\/\//i.test(c.source_url || c.url || "")) return "need name + https source";
  if (/^Adaptive Sports\s/i.test(c.name)) return "invented statewide name";
  if (/^CAF[- ]/i.test(c.name) || /^Challenged Athletes Foundation[- ]/i.test(c.name)) return "guessed CAF-region parent";
  if (GENERIC.has(d)) return `generic domain ${d}`;
  if (known.names.has(n)) return "name already on the list";
  if (d && known.domains.has(d)) {
    return `same website as ${(known.byDomain.get(d) || []).map((r) => r.name).slice(0, 2).join("; ")}`;
  }
  return null;
}

export function filterAdds(cands, known) {
  const adds = [];
  const skipped = [];
  for (const c of cands) {
    const reason = skipReason(c, known);
    if (reason) {
      skipped.push({ name: c.name, reason });
      continue;
    }
    const d = baseDomain(host(c.url || c.source_url || ""));
    const n = normName(c.name);
    adds.push({
      name: c.name,
      website_url: c.url || c.source_url,
      source_url: c.source_url || c.url,
      state: (c.state || "").slice(0, 2).toUpperCase() || null,
      city: c.city || null,
      zip: c.zip || null,
      email: c.email || null,
      phone: c.phone || null,
      org_type: c.org_type || null,
      sport: c.sport || null,
      sport_key: c.sport_key || null,
      sports: Array.isArray(c.sports) ? c.sports : [],
      description: c.description || c.evidence || null,
    });
    known.names.add(n);
    if (d) known.domains.add(d);
  }
  return { adds, skipped };
}

export function writeInboxCard(adds, skipped, slug) {
  mkdirSync(INBOX, { recursive: true });
  const out = `${INBOX}/${slug}.json`;
  const card = {
    pile: {
      name: `Discover ${slug}`,
      slug,
      region: adds[0]?.state || "",
      approved: false,
      approved_by: "",
      approved_at: null,
    },
    do_not_touch: [],
    taps: [...new Set(adds.map((a) => a.city || a.state).filter(Boolean))],
    queue: { approve: [], reject: [] },
    fills: [],
    folds: [],
    adds,
    holds: [],
    outs: skipped.filter((s) => /invented|CAF/.test(s.reason)).map((s) => ({ name: s.name, reason: s.reason })),
  };
  writeFileSync(out, JSON.stringify(card, null, 2) + "\n");
  const receipt = `${INBOX}/${slug}-receipt.json`;
  return { out, receipt, card };
}

function main() {
  const args = parseArgs(process.argv);
  if (args.gaps) {
    const rows = d1Select(
      "SELECT state, COUNT(*) AS n FROM organizations WHERE status='active' AND is_public=1 AND state IS NOT NULL GROUP BY state ORDER BY n ASC, state LIMIT 15",
    );
    console.log("thinnest states on tester (active, public):");
    for (const r of rows) console.log(`  ${(r.state || "?").padEnd(4)} ${r.n}`);
    console.log("search hints: adaptive sports program {state}; wheelchair sports club {state}; {state} park district adaptive recreation");
    return;
  }

  const known = loadKnown();
  const cands = parseCandidates(resolve(args.file));
  const { adds, skipped } = filterAdds(cands, known);

  const slug = args.slug || basename(args.file, basename(args.file).includes(".") ? `.${args.file.split(".").pop()}` : "").replace(/[^a-z0-9-]+/gi, "-").toLowerCase() || "discover";
  const { out, receipt } = writeInboxCard(adds, skipped, slug);
  writeFileSync(receipt, JSON.stringify({ known: known.count, filed: adds.length, skipped, out }, null, 2) + "\n");
  console.log(`known on tester: ${known.count}`);
  console.log(`filed ${adds.length} → ${out}`);
  console.log(`skipped ${skipped.length}`);
  for (const s of skipped.slice(0, 20)) console.log(`  - ${s.name}: ${s.reason}`);
  if (skipped.length > 20) console.log(`  … ${skipped.length - 20} more`);
  console.log("live stays locked. Alec still has to say yes before ship.");
}

function isMain() {
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
}

if (isMain()) main();
