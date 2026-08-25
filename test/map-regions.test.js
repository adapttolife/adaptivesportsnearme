// Region clustering: the Census table, the pill grouping, and the zoom threshold.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  CENSUS_REGIONS, REGION_ANCHOR, OFFSHORE_STATES, CLUSTER_MAX_ZOOM, REGION_ZOOM_MARGIN, REGION_MAX_ZOOM,
  regionOf, clusterKeyFor, shouldCluster, regionZoom, groupStatesByRegion,
} from "../src/map-regions.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const index = readFileSync(join(root, "public/index.html"), "utf8");

const ALL = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN",
  "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA",
  "WA", "WV", "WI", "WY", "DC"];

test("every state plus DC lands in exactly one Census region", () => {
  assert.equal(ALL.length, 51);
  const seen = new Map();
  for (const [region, states] of Object.entries(CENSUS_REGIONS)) {
    for (const s of states) {
      assert.ok(!seen.has(s), s + " is in two regions: " + seen.get(s) + " and " + region);
      seen.set(s, region);
    }
  }
  for (const s of ALL) {
    assert.ok(seen.has(s), s + " has no region");
    assert.equal(regionOf(s), seen.get(s));
  }
  assert.equal(seen.size, 51, "no extra codes in the table");
});

test("the four regions are the Census ones, with the Census membership", () => {
  assert.deepEqual(Object.keys(CENSUS_REGIONS).sort(), ["Midwest", "Northeast", "South", "West"]);
  assert.equal(CENSUS_REGIONS.Northeast.length, 9);
  assert.equal(CENSUS_REGIONS.Midwest.length, 12);
  assert.equal(CENSUS_REGIONS.South.length, 17);
  assert.equal(CENSUS_REGIONS.West.length, 13);
  // The three the bureau places against intuition.
  assert.equal(regionOf("DC"), "South");
  assert.equal(regionOf("MD"), "South");
  assert.equal(regionOf("TX"), "South");
  assert.equal(regionOf("AK"), "West");
  assert.equal(regionOf("HI"), "West");
  assert.equal(regionOf("PR"), null);
  assert.equal(regionOf("pa"), "Northeast");
  for (const k of Object.keys(CENSUS_REGIONS)) {
    assert.ok(Array.isArray(REGION_ANCHOR[k]), k + " needs a map anchor");
    const [lng, lat] = REGION_ANCHOR[k];
    assert.ok(lng > -125 && lng < -66, k + " anchor longitude is off the mainland");
    assert.ok(lat > 24 && lat < 50, k + " anchor latitude is off the mainland");
  }
});

test("offshore states and territories keep their own pill", () => {
  assert.deepEqual(OFFSHORE_STATES, ["AK", "HI"]);
  assert.equal(clusterKeyFor("AK"), "AK");
  assert.equal(clusterKeyFor("HI"), "HI");
  assert.equal(clusterKeyFor("PR"), "PR");
  assert.equal(clusterKeyFor("GU"), "GU");
  assert.equal(clusterKeyFor(""), "");
  assert.equal(clusterKeyFor("CA"), "West");
  assert.equal(clusterKeyFor("dc"), "South");
});

test("region totals equal the sum of their states", () => {
  const counts = {};
  ALL.forEach((s, i) => { counts[s] = i + 1; });
  counts.PR = 4;
  const groups = groupStatesByRegion(counts);
  const total = groups.reduce((n, g) => n + g.count, 0);
  assert.equal(total, ALL.reduce((n, s) => n + counts[s], 0) + 4);

  const by = new Map(groups.map(g => [g.key, g]));
  for (const [region, states] of Object.entries(CENSUS_REGIONS)) {
    const mainland = states.filter(s => !OFFSHORE_STATES.includes(s));
    assert.equal(by.get(region).count, mainland.reduce((n, s) => n + counts[s], 0), region);
    assert.deepEqual(by.get(region).states, mainland.slice().sort());
  }
  // AK, HI and PR stand alone rather than joining a mainland chip.
  for (const k of ["AK", "HI", "PR"]) {
    assert.equal(by.get(k).count, counts[k]);
    assert.equal(by.get(k).anchor, null);
  }
  assert.equal(groups.length, 7);
});

test("grouping is honest about sparse and empty input", () => {
  assert.deepEqual(groupStatesByRegion({}), []);
  assert.deepEqual(groupStatesByRegion(null), []);
  const one = groupStatesByRegion({ NV: 6 });
  assert.equal(one.length, 1);
  assert.equal(one[0].key, "West");
  assert.equal(one[0].count, 6);
  assert.deepEqual(one[0].anchor, REGION_ANCHOR.West);
});

test("the threshold clusters below and splits at or above", () => {
  assert.equal(CLUSTER_MAX_ZOOM, 4);
  assert.equal(shouldCluster(CLUSTER_MAX_ZOOM - 0.01), true);
  assert.equal(shouldCluster(CLUSTER_MAX_ZOOM), false);
  assert.equal(shouldCluster(CLUSTER_MAX_ZOOM + 0.01), false);
  // The two viewports that matter open on opposite sides of it.
  assert.equal(shouldCluster(2.2), true, "390x844 opens clustered");
  assert.equal(shouldCluster(4.1), false, "1440x900 opens split into states");
  assert.equal(shouldCluster(5.2), false, "mapxShowState lands on state pills");
  assert.equal(shouldCluster(0), true);
  assert.equal(shouldCluster(22), false);
});

test("tapping a region always lands past the threshold", () => {
  assert.ok(REGION_ZOOM_MARGIN > 0);
  const floor = CLUSTER_MAX_ZOOM + REGION_ZOOM_MARGIN;
  // The West is too wide to fit on a phone, so its fit zoom is below the floor.
  assert.equal(regionZoom(3.1), floor);
  assert.equal(regionZoom(4), floor);
  // The Northeast fits well past it, so keep the tighter frame.
  assert.equal(regionZoom(6.4), 6.4);
  assert.equal(regionZoom(undefined), floor);
  // A one-state region must not slam into the street.
  assert.equal(regionZoom(11), REGION_MAX_ZOOM);
  assert.ok(REGION_MAX_ZOOM > floor);
  assert.equal(shouldCluster(regionZoom(2)), false);
  assert.equal(shouldCluster(regionZoom(9)), false);
});

test("public/index.html mirrors the region logic inline", () => {
  assert.ok(index.includes("CLUSTER_MAX_ZOOM=4"));
  assert.ok(index.includes("REGION_ZOOM_MARGIN=.35") || index.includes("REGION_ZOOM_MARGIN=0.35"));
  assert.ok(index.includes("function clusterKeyFor("));
  assert.ok(index.includes("function shouldCluster("));
  assert.ok(index.includes("function regionZoom("));
  assert.ok(index.includes("CENSUS_REGIONS"));
  assert.ok(index.includes("REGION_ANCHOR"));
  assert.ok(index.includes("OFFSHORE_STATES"));
  assert.ok(index.includes("mpill-region"));
  assert.ok(index.includes("'zoomend'"));
  // The mirrored membership has to be the same table, region by region.
  for (const [region, states] of Object.entries(CENSUS_REGIONS)) {
    const m = index.match(new RegExp(region + ":\\['([A-Z',]+)'\\]"));
    assert.ok(m, "no inline list for " + region);
    assert.deepEqual(m[1].split("','"), states, region + " membership drifted");
  }
  for (const [k, a] of Object.entries(REGION_ANCHOR)) {
    assert.ok(index.includes(k + ":[" + a[0] + "," + a[1] + "]"), k + " anchor drifted");
  }
  // Marker swap must be reversible and token-guarded, and dots stay at all zooms.
  assert.ok(index.includes("token!==mapToken"));
  assert.ok(index.includes("function applyClusterMode("));
});
