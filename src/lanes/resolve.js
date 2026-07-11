// resolve: deterministic duplicate detection (Spec 72 T04).
// Contract: tiers (a) same normalized website domain, (b) same normalized name + state,
// (c) fuzzy token-set >= 0.9 within same city+state. Proposes on the NON-canonical org:
//   { status: {from: 'active', to: 'duplicate'} }
// evidence { duplicate_of, tier, score }, confidence 0.95/0.9/0.75 by tier. Canonical
// pick: verified > has website > older created_at. Idempotent: skips ids with a
// resolve proposal already in review_queue (any status — a rejected pair stays rejected).

import { proposeStmt } from "../lane-utils.js";

const RESOLVE_CAP = 20; // proposals per run — keeps the review queue reviewable

// Platforms an org's "website" is often just a hosted page on, shared across many
// unrelated orgs. A shared domain is NOT an identity signal — matching two orgs on
// facebook.com (or instagram.com / sites.google.com) would false-merge them.
const SHARED_PLATFORM_SUFFIXES = ["facebook.com", "instagram.com", "sites.google.com"];

const LEGAL_SUFFIXES = new Set(["inc", "incorporated", "llc", "corp", "corporation", "co", "ltd", "nfp"]);

export function normalizeDomain(url) {
  if (!url || typeof url !== "string") return null;
  let parsed;
  try {
    parsed = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(url) ? url : `https://${url}`);
  } catch {
    return null;
  }
  let host = parsed.hostname.toLowerCase();
  host = host.replace(/^www\./, "");
  host = host.replace(/\.+$/, ""); // strip trailing dot(s) / junk
  if (!host || !host.includes(".")) return null;
  if (SHARED_PLATFORM_SUFFIXES.some((s) => host === s || host.endsWith(`.${s}`))) return null;
  return host;
}

export function normalizeName(name) {
  if (!name || typeof name !== "string") return null;
  let s = name.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!s) return null;
  let tokens = s.split(" ");
  if (tokens[0] === "the") tokens = tokens.slice(1);
  while (tokens.length && LEGAL_SUFFIXES.has(tokens[tokens.length - 1])) {
    tokens = tokens.slice(0, -1);
  }
  const result = tokens.join(" ");
  return result || null;
}

function tokenSet(s) {
  return new Set(
    String(s || "").toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter(Boolean)
  );
}

// Dice coefficient over unique token sets: ratio = 2*|A∩B| / (|A|+|B|).
// Simple, symmetric, deterministic — identical strings -> 1, disjoint strings -> 0.
export function tokenSetRatio(a, b) {
  const setA = tokenSet(a);
  const setB = tokenSet(b);
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;
  let common = 0;
  for (const t of setA) if (setB.has(t)) common++;
  return (2 * common) / (setA.size + setB.size);
}

// Total order, symmetric in its arguments: verified > has-website > older created_at
// > lower id. pickCanonical(a, b) === pickCanonical(b, a) always.
export function pickCanonical(a, b) {
  if (!a) return b;
  if (!b) return a;

  const aVerified = a.verification_status === "verified";
  const bVerified = b.verification_status === "verified";
  if (aVerified !== bVerified) return aVerified ? a : b;

  const aHasWebsite = !!a.website_url;
  const bHasWebsite = !!b.website_url;
  if (aHasWebsite !== bHasWebsite) return aHasWebsite ? a : b;

  if (a.created_at !== b.created_at) return a.created_at < b.created_at ? a : b;

  return a.id <= b.id ? a : b;
}

function unionFind(n) {
  const parent = Array.from({ length: n }, (_, i) => i);
  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }
  function union(x, y) {
    const rx = find(x);
    const ry = find(y);
    if (rx !== ry) parent[rx] = ry;
  }
  return { find, union };
}

// Resolves one candidate group into { canonical, dups[] }, respecting orgs already
// claimed by a higher-priority tier. Mutates `claimed`.
function resolveGroup(members, tier, scoreFn, claimed, results) {
  const remaining = members.filter((o) => !claimed.has(o.id));
  if (remaining.length < 2) return;
  const canonical = remaining.reduce((best, o) => pickCanonical(best, o));
  claimed.add(canonical.id);
  for (const o of remaining) {
    if (o.id === canonical.id) continue;
    results.push({ dupId: o.id, canonicalId: canonical.id, tier, score: scoreFn(o, canonical) });
    claimed.add(o.id);
  }
}

// Each org appears as a dupId at most once — the highest-priority tier it matches in
// wins, and both members of a resolved pair (canonical and dups) are removed from
// consideration by lower tiers so tier ordering can never produce conflicting proposals.
export function findDuplicates(orgs) {
  const claimed = new Set();
  const results = [];

  // Tier a: same normalized website domain.
  const byDomain = new Map();
  for (const o of orgs) {
    const d = normalizeDomain(o.website_url);
    if (!d) continue;
    if (!byDomain.has(d)) byDomain.set(d, []);
    byDomain.get(d).push(o);
  }
  for (const group of byDomain.values()) resolveGroup(group, "domain", () => 1, claimed, results);

  // Tier b: same normalized name + state.
  const byNameState = new Map();
  for (const o of orgs) {
    if (claimed.has(o.id)) continue;
    const n = normalizeName(o.name);
    if (!n || !o.state) continue;
    const key = `${n}|${o.state.toLowerCase()}`;
    if (!byNameState.has(key)) byNameState.set(key, []);
    byNameState.get(key).push(o);
  }
  for (const group of byNameState.values()) resolveGroup(group, "name-state", () => 1, claimed, results);

  // Tier c: fuzzy name match (token-set ratio >= 0.9) within the same city+state.
  // Bucket by city+state first (cheap, exact) then do pairwise fuzzy compare + union-find
  // within each bucket so a chain of near-matches (A~B~C) collapses to one group even if
  // A and C alone don't clear the threshold.
  const byCityState = new Map();
  for (const o of orgs) {
    if (claimed.has(o.id) || !o.city || !o.state) continue;
    const key = `${o.city.trim().toLowerCase()}|${o.state.trim().toLowerCase()}`;
    if (!byCityState.has(key)) byCityState.set(key, []);
    byCityState.get(key).push(o);
  }
  for (const bucket of byCityState.values()) {
    if (bucket.length < 2) continue;
    const uf = unionFind(bucket.length);
    for (let i = 0; i < bucket.length; i++) {
      for (let j = i + 1; j < bucket.length; j++) {
        if (tokenSetRatio(bucket[i].name, bucket[j].name) >= 0.9) uf.union(i, j);
      }
    }
    const groups = new Map();
    for (let i = 0; i < bucket.length; i++) {
      const r = uf.find(i);
      if (!groups.has(r)) groups.set(r, []);
      groups.get(r).push(bucket[i]);
    }
    for (const members of groups.values()) {
      resolveGroup(members, "fuzzy", (o, canonical) => tokenSetRatio(o.name, canonical.name), claimed, results);
    }
  }

  return results;
}

const CONFIDENCE_BY_TIER = { domain: 0.95, "name-state": 0.9, fuzzy: 0.75 };

export async function resolveLane({ db, cursor }) {
  const { results: orgs } = await db.prepare(
    `SELECT id, name, state, city, website_url, verification_status, created_at
     FROM organizations WHERE status='active'`
  ).all();
  if (!orgs.length) return { cursor: "", processed: 0, flagged: 0, detail: "no candidates" };

  // Any-status (not just pending) makes re-runs idempotent: a rejected pair is not
  // re-proposed every cycle just because it's no longer 'pending'.
  const { results: proposedRows } = await db.prepare(
    `SELECT DISTINCT organization_id FROM review_queue WHERE lane='resolve'`
  ).all();
  const alreadyProposed = new Set(proposedRows.map((r) => r.organization_id));

  const candidates = findDuplicates(orgs).filter((d) => !alreadyProposed.has(d.dupId));
  const toPropose = candidates.slice(0, RESOLVE_CAP);
  const remaining = candidates.length - toPropose.length;

  const now = new Date().toISOString();
  const stmts = toPropose.map((d) =>
    proposeStmt(
      db,
      d.dupId,
      "resolve",
      { status: { from: "active", to: "duplicate" } },
      { duplicate_of: d.canonicalId, tier: d.tier, score: d.score, method: "deterministic-dedup v1" },
      CONFIDENCE_BY_TIER[d.tier],
      now
    )
  );
  if (stmts.length) await db.batch(stmts);

  return {
    cursor: "",
    processed: orgs.length,
    flagged: toPropose.length,
    detail: remaining > 0 ? `${remaining} more candidates queued for later runs` : null,
  };
}
