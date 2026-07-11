// resolve lane tests (Spec 72 T04) — pure-function coverage plus a mock-D1 pass over
// resolveLane itself. Mock mirrors the two query shapes and the batch/insert shape the
// lane actually issues; it does not attempt to be a general D1 emulator.
import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeDomain,
  normalizeName,
  tokenSetRatio,
  pickCanonical,
  findDuplicates,
  resolveLane,
} from "../src/lanes/resolve.js";

// ---------- mock D1 ----------

class Stmt {
  constructor(sql, args, db) {
    this.sql = sql;
    this.args = args;
    this.db = db;
  }
  bind(...args) {
    return new Stmt(this.sql, args, this.db);
  }
  async all() {
    if (this.sql.includes("FROM organizations")) {
      return { results: this.db.organizations };
    }
    if (this.sql.includes("SELECT DISTINCT organization_id FROM review_queue")) {
      return { results: this.db.reviewQueue.map((r) => ({ organization_id: r.organization_id })) };
    }
    return { results: [] };
  }
}

function makeDb({ organizations = [], reviewQueue = [] } = {}) {
  const db = { organizations, reviewQueue, inserted: [] };
  db.prepare = (sql) => new Stmt(sql, [], db);
  db.batch = async (stmts) => {
    for (const stmt of stmts) {
      if (stmt.sql.includes("INSERT INTO review_queue")) {
        const [organization_id, lane, proposed_change, evidence, confidence, created_at] = stmt.args;
        const row = {
          organization_id,
          lane,
          proposed_change: JSON.parse(proposed_change),
          evidence: JSON.parse(evidence),
          confidence,
          created_at,
        };
        db.reviewQueue.push(row);
        db.inserted.push(row);
      }
    }
    return stmts.map(() => ({ success: true }));
  };
  return db;
}

function org(overrides) {
  return {
    id: "id",
    name: "Org",
    state: "CO",
    city: "Denver",
    website_url: null,
    verification_status: "unverified",
    created_at: "2026-01-01T00:00:00Z",
    status: "active",
    ...overrides,
  };
}

// ---------- normalizeDomain ----------

test("normalizeDomain: lowercases and strips www.", () => {
  assert.equal(normalizeDomain("https://WWW.Example.COM/path"), "example.com");
});

test("normalizeDomain: bare host without protocol", () => {
  assert.equal(normalizeDomain("example.com"), "example.com");
});

test("normalizeDomain: strips trailing dot junk", () => {
  assert.equal(normalizeDomain("https://example.com./"), "example.com");
});

test("normalizeDomain: null/missing/invalid -> null", () => {
  assert.equal(normalizeDomain(null), null);
  assert.equal(normalizeDomain(""), null);
  assert.equal(normalizeDomain("not a url"), null);
});

test("normalizeDomain: facebook is not identity", () => {
  assert.equal(normalizeDomain("https://www.facebook.com/someorg"), null);
  assert.equal(normalizeDomain("https://m.facebook.com/someorg"), null);
});

test("normalizeDomain: instagram and google sites are not identity", () => {
  assert.equal(normalizeDomain("https://instagram.com/someorg"), null);
  assert.equal(normalizeDomain("https://sites.google.com/view/someorg"), null);
});

// ---------- normalizeName ----------

test("normalizeName: strips leading 'the' and trailing 'Inc.', keeps 'Foundation'", () => {
  assert.equal(normalizeName("The Denver Adaptive Sports Foundation, Inc."), "denver adaptive sports foundation");
});

test("normalizeName: strips trailing llc, keeps 'Association'", () => {
  assert.equal(normalizeName("Wheelchair Association LLC"), "wheelchair association");
});

test("normalizeName: collapses whitespace and punctuation", () => {
  assert.equal(normalizeName("  Mile   High -- Sports!!  "), "mile high sports");
});

test("normalizeName: null/missing -> null", () => {
  assert.equal(normalizeName(null), null);
  assert.equal(normalizeName(""), null);
});

// ---------- tokenSetRatio ----------

test("tokenSetRatio: identical strings -> 1", () => {
  assert.equal(tokenSetRatio("Denver Adaptive Sports", "Denver Adaptive Sports"), 1);
});

test("tokenSetRatio: disjoint strings -> 0", () => {
  assert.equal(tokenSetRatio("abc def ghi", "jkl mno pqr"), 0);
});

test("tokenSetRatio: partial overlap is between 0 and 1", () => {
  const r = tokenSetRatio("Denver Adaptive Sports Club", "Denver Adaptive Sports Foundation");
  assert.ok(r > 0.7 && r < 1);
});

// ---------- pickCanonical ----------

test("pickCanonical: verified beats unverified, both directions", () => {
  const a = org({ id: "a", verification_status: "unverified" });
  const b = org({ id: "b", verification_status: "verified" });
  assert.equal(pickCanonical(a, b).id, "b");
  assert.equal(pickCanonical(b, a).id, "b");
});

test("pickCanonical: has website beats no website (verification tied)", () => {
  const a = org({ id: "a", website_url: null });
  const b = org({ id: "b", website_url: "https://example.com" });
  assert.equal(pickCanonical(a, b).id, "b");
  assert.equal(pickCanonical(b, a).id, "b");
});

test("pickCanonical: older created_at wins (verification + website tied)", () => {
  const a = org({ id: "a", created_at: "2026-05-01T00:00:00Z" });
  const b = org({ id: "b", created_at: "2020-01-01T00:00:00Z" });
  assert.equal(pickCanonical(a, b).id, "b");
  assert.equal(pickCanonical(b, a).id, "b");
});

test("pickCanonical: lower id wins as final tie-break", () => {
  const a = org({ id: "zzz" });
  const b = org({ id: "aaa" });
  assert.equal(pickCanonical(a, b).id, "aaa");
  assert.equal(pickCanonical(b, a).id, "aaa");
});

// ---------- findDuplicates ----------

test("findDuplicates: domain tier matches same normalized website", () => {
  const orgs = [
    org({ id: "1", name: "Denver Wheelchair Sports", website_url: "https://www.denverwheelchair.org" }),
    org({ id: "2", name: "Denver Wheelchair Sports Alt Listing", website_url: "https://denverwheelchair.org/home" }),
  ];
  const dups = findDuplicates(orgs);
  assert.equal(dups.length, 1);
  assert.equal(dups[0].tier, "domain");
  assert.equal(dups[0].dupId, "2"); // "1" is older/lower-id-tied but equal created_at -> lower id wins
  assert.equal(dups[0].canonicalId, "1");
});

test("findDuplicates: name-state tier matches same normalized name + state, no domain", () => {
  const orgs = [
    org({ id: "1", name: "The Mile High Sports Club, Inc.", state: "CO", website_url: null }),
    org({ id: "2", name: "Mile High Sports Club", state: "CO", website_url: null }),
  ];
  const dups = findDuplicates(orgs);
  assert.equal(dups.length, 1);
  assert.equal(dups[0].tier, "name-state");
});

test("findDuplicates: fuzzy tier matches similar names in same city+state", () => {
  const orgs = [
    org({ id: "1", name: "Rocky Mountain Adaptive Sports Wheelchair Basketball Youth League", city: "Denver", state: "CO" }),
    org({ id: "2", name: "Rocky Mountain Adaptive Sports Wheelchair Basketball Youth League Foundation", city: "Denver", state: "CO" }),
  ];
  const dups = findDuplicates(orgs);
  assert.equal(dups.length, 1);
  assert.equal(dups[0].tier, "fuzzy");
  assert.ok(dups[0].score >= 0.9);
});

test("findDuplicates: never pairs a lone org with itself", () => {
  const orgs = [org({ id: "1", name: "Solo Org", website_url: "https://solo-org.example" })];
  assert.deepEqual(findDuplicates(orgs), []);
});

test("findDuplicates: 3-org group collapses to one canonical, two dups", () => {
  const orgs = [
    org({ id: "1", name: "Same Domain Org A", website_url: "https://shared-domain.example", created_at: "2020-01-01T00:00:00Z" }),
    org({ id: "2", name: "Same Domain Org B", website_url: "https://shared-domain.example/page2" }),
    org({ id: "3", name: "Same Domain Org C", website_url: "https://www.shared-domain.example/page3" }),
  ];
  const dups = findDuplicates(orgs);
  assert.equal(dups.length, 2);
  const canonicalIds = new Set(dups.map((d) => d.canonicalId));
  assert.equal(canonicalIds.size, 1);
  assert.deepEqual(canonicalIds, new Set(["1"]));
  const dupIds = new Set(dups.map((d) => d.dupId));
  assert.deepEqual(dupIds, new Set(["2", "3"]));
});

test("findDuplicates: idempotency — filtering out already-proposed ids yields zero new", () => {
  const orgs = [
    org({ id: "1", name: "Adaptive Rowing Team", website_url: "https://adaptiverowing.example" }),
    org({ id: "2", name: "Adaptive Rowing Team Dup", website_url: "https://adaptiverowing.example/other" }),
  ];
  const dups = findDuplicates(orgs);
  assert.equal(dups.length, 1);
  const alreadyProposed = new Set(dups.map((d) => d.dupId));
  const fresh = dups.filter((d) => !alreadyProposed.has(d.dupId));
  assert.equal(fresh.length, 0);
});

// ---------- resolveLane (mock D1) ----------

test("resolveLane: proposes duplicates with tiered confidence and evidence", async () => {
  const orgs = [
    org({ id: "1", name: "Adaptive Climbing Co", website_url: "https://adaptiveclimb.example", created_at: "2020-01-01T00:00:00Z" }),
    org({ id: "2", name: "Adaptive Climbing Co Two", website_url: "https://adaptiveclimb.example/dup" }),
    org({ id: "3", name: "The Mile High Sports Club, Inc.", state: "CO", website_url: null }),
    org({ id: "4", name: "Mile High Sports Club", state: "CO", website_url: null }),
    org({ id: "5", name: "Unrelated Solo Org" }),
  ];
  const db = makeDb({ organizations: orgs });
  const result = await resolveLane({ db, cursor: "" });

  assert.equal(result.processed, 5);
  assert.equal(result.flagged, 2);
  assert.equal(result.cursor, "");
  assert.equal(db.inserted.length, 2);

  const domainRow = db.inserted.find((r) => r.evidence.tier === "domain");
  assert.equal(domainRow.organization_id, "2");
  assert.equal(domainRow.confidence, 0.95);
  assert.equal(domainRow.evidence.duplicate_of, "1");
  assert.equal(domainRow.evidence.method, "deterministic-dedup v1");
  assert.deepEqual(domainRow.proposed_change, { status: { from: "active", to: "duplicate" } });

  const nameStateRow = db.inserted.find((r) => r.evidence.tier === "name-state");
  assert.equal(nameStateRow.organization_id, "4");
  assert.equal(nameStateRow.confidence, 0.9);
});

test("resolveLane: skips ids that already have a resolve proposal (any status)", async () => {
  const orgs = [
    org({ id: "1", name: "Adaptive Climbing Co", website_url: "https://adaptiveclimb.example" }),
    org({ id: "2", name: "Adaptive Climbing Co Two", website_url: "https://adaptiveclimb.example/dup" }),
  ];
  const db = makeDb({
    organizations: orgs,
    reviewQueue: [{ organization_id: "2", lane: "resolve", status: "rejected" }],
  });
  const result = await resolveLane({ db, cursor: "" });
  assert.equal(result.flagged, 0);
  assert.equal(db.inserted.length, 0);
});

test("resolveLane: caps proposals per run and reports remaining in detail", async () => {
  const orgs = [];
  for (let i = 0; i < 25; i++) {
    const n = String(i).padStart(2, "0");
    orgs.push(org({ id: `a${n}`, name: `Group ${n} Org A`, website_url: `https://group${n}.example` }));
    orgs.push(org({ id: `b${n}`, name: `Group ${n} Org B`, website_url: `https://group${n}.example/dup` }));
  }
  const db = makeDb({ organizations: orgs });
  const result = await resolveLane({ db, cursor: "" });

  assert.equal(result.flagged, 20);
  assert.equal(db.inserted.length, 20);
  assert.match(result.detail, /5 more candidates queued for later runs/);
});
