#!/usr/bin/env node
/**
 * For listings we hid because a deep page 404'd, see if the site home is up.
 * Writes an inbox card of URL fills. Does not write the database.
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { checkUrl, originHome, isNeverTouch, ROOT } from "./lib.mjs";

function loadKnown() {
  const out = [];
  const seen = new Set();
  const add = (i) => {
    const id = i.id || i.organization_id;
    if (!id || seen.has(id) || isNeverTouch(id)) return;
    seen.add(id);
    out.push({
      id,
      name: i.name,
      state: i.state,
      website_url: i.url || i.website_url,
    });
  };
  for (const f of [`${ROOT}/recheck-validate.json`, `${ROOT}/validate-404s.json`]) {
    if (!existsSync(f)) continue;
    const raw = JSON.parse(readFileSync(f, "utf8"));
    const items = raw.items || raw;
    const list = Array.isArray(items) ? items : (raw.buckets?.["404"] || []);
    for (const i of list) {
      if (i.now === 200) continue;
      add(i);
    }
  }
  return out;
}

const rows = loadKnown();
const fills = [];
const stillDead = [];
for (const r of rows) {
  const home = originHome(r.website_url);
  if (!home) continue;
  if (home.replace(/\/$/, "") === String(r.website_url || "").replace(/\/$/, "")) {
    stillDead.push({ name: r.name, state: r.state, home, status: "already-home" });
    continue;
  }
  const hit = checkUrl(home);
  if (hit.ok) {
    fills.push({
      id: r.id,
      source_url: hit.final,
      fields: { website_url: hit.final },
      name: r.name,
      state: r.state,
      old_url: r.website_url,
    });
  } else {
    stillDead.push({ name: r.name, state: r.state, home, status: hit.status });
  }
}

const card = {
  pile: {
    name: "Homepage rescue",
    slug: "homepage-rescue",
    region: "",
    approved: false,
    approved_by: "",
    approved_at: null,
  },
  do_not_touch: [],
  taps: [...new Set(fills.map((f) => f.state).filter(Boolean))],
  queue: { approve: [], reject: [] },
  fills,
  folds: [],
  adds: [],
  holds: stillDead.map((s) => ({ name: s.name, reason: `home ${s.status}` })),
  outs: [],
};

mkdirSync(`${ROOT}/inbox`, { recursive: true });
const out = `${ROOT}/inbox/homepage-rescue.json`;
writeFileSync(out, JSON.stringify(card, null, 2) + "\n");
console.log(`checked ${rows.length} known 404s`);
console.log(`home is up: ${fills.length}`);
console.log(`home still down or already the home: ${stillDead.length}`);
console.log(out);
console.log("not approved. live stays locked.");
