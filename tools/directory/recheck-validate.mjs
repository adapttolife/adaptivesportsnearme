#!/usr/bin/env node
/** Recheck pending validate items. Does not write the database. */
import { writeFileSync } from "node:fs";
import { staging, parseJson, checkUrl, ROOT } from "./lib.mjs";

const rows = staging(`
  SELECT q.item_id, q.organization_id, q.evidence, o.name, o.city, o.state, o.website_url, o.status, o.is_public
  FROM review_queue q JOIN organizations o ON o.id = q.organization_id
  WHERE q.status='pending' AND q.lane='validate'
`);

const items = [];
for (const r of rows) {
  const ev = parseJson(r.evidence);
  const url = ev.url || r.website_url;
  const hit = checkUrl(url);
  items.push({
    item_id: r.item_id,
    id: r.organization_id,
    name: r.name,
    city: r.city,
    state: r.state,
    url,
    old_status: ev.http_status ?? ev.detail ?? null,
    now: hit.status,
    final: hit.final,
    still_public: r.is_public === 1 && r.status === "active",
  });
}

const buckets = { "200": [], "404": [], timeout: [], other: [] };
for (const i of items) {
  if (i.now === 200) buckets["200"].push(i);
  else if (i.now === 404 || i.now === 410) buckets["404"].push(i);
  else if (i.now === "err" || /timeout/i.test(String(i.old_status))) buckets.timeout.push(i);
  else buckets.other.push(i);
}

writeFileSync(`${ROOT}/recheck-validate.json`, JSON.stringify({ when: new Date().toISOString(), buckets, items }, null, 2) + "\n");
console.log(`rechecked ${items.length} pending link checks`);
console.log(`  up now: ${buckets["200"].length}`);
console.log(`  still 404: ${buckets["404"].length}`);
console.log(`  timeout/error: ${buckets.timeout.length}`);
console.log(`  other: ${buckets.other.length}`);
console.log("wrote recheck-validate.json (local, not committed)");
console.log("no database writes. live stays locked.");
