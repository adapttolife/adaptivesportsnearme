#!/usr/bin/env node
/**
 * Turn one pending review lane into an inbox card. Does not write the database.
 *   node export-lane.mjs geocode
 *   node export-lane.mjs classify
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { staging, parseJson, isNeverTouch, ROOT } from "./lib.mjs";

const lane = (process.argv[2] || "").toLowerCase();
const allowed = new Set(["geocode", "classify", "enrich", "resolve", "validate"]);
if (!allowed.has(lane)) {
  console.error("usage: node export-lane.mjs geocode|classify|enrich|resolve|validate");
  process.exit(1);
}

const rows = staging(`
  SELECT q.item_id, q.organization_id, q.proposed_change, q.evidence, q.confidence,
         o.name, o.city, o.state, o.website_url
  FROM review_queue q JOIN organizations o ON o.id = q.organization_id
  WHERE q.status='pending' AND q.lane='${lane}'
  ORDER BY q.confidence DESC, q.item_id
`);

const fills = [];
const folds = [];
const skipped = [];
for (const r of rows) {
  if (isNeverTouch(r.organization_id)) {
    skipped.push({ id: r.organization_id, name: r.name, reason: "never-touch" });
    continue;
  }
  const ch = parseJson(r.proposed_change);
  const ev = parseJson(r.evidence);
  if (lane === "resolve") {
    const keep = ev.duplicate_of;
    if (!keep || isNeverTouch(r.organization_id)) {
      skipped.push({ id: r.organization_id, name: r.name, reason: "unsafe fold" });
      continue;
    }
    folds.push({ keep, hide: [r.organization_id], reason: `same website (queue ${r.item_id})` });
    continue;
  }
  const fields = {};
  for (const [k, v] of Object.entries(ch)) {
    if (v && typeof v === "object" && "to" in v) fields[k] = v.to;
  }
  if (!Object.keys(fields).length) continue;
  let source = ev.url || r.website_url || "";
  if (/^http:\/\//i.test(source)) source = "https://" + source.slice(7);
  if (!/^https:\/\//i.test(source)) source = "https://adaptivesportsnearme.com";
  fills.push({
    id: r.organization_id,
    source_url: source,
    fields,
    queue_item: r.item_id,
    confidence: r.confidence,
    name: r.name,
    city: r.city,
    state: r.state,
  });
}

const card = {
  pile: {
    name: `Tester ${lane} pile`,
    slug: `queue-${lane}`,
    region: "",
    approved: false,
    approved_by: "",
    approved_at: null,
  },
  do_not_touch: [],
  taps: [],
  queue: { approve: rows.map((r) => r.item_id), reject: [] },
  fills,
  folds,
  adds: [],
  holds: skipped,
  outs: [],
};

mkdirSync(`${ROOT}/inbox`, { recursive: true });
const out = `${ROOT}/inbox/queue-${lane}.json`;
writeFileSync(out, JSON.stringify(card, null, 2) + "\n");
console.log(`exported ${lane}: fills ${fills.length} folds ${folds.length} skipped ${skipped.length}`);
console.log(out);
console.log("not approved. live stays locked. lint then wait for a yes.");
