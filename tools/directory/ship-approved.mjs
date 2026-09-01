#!/usr/bin/env node
/**
 * Deterministic Adaptive Sports Near Me pile ship.
 * JSON in -> SQL -> tester D1 only (asnm-db-staging).
 * Never writes asnm-db. Live stays locked.
 *
 *   node tools/directory/ship-approved.mjs --file pile.json
 *   node tools/directory/ship-approved.mjs --file pile.json --apply
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, basename } from "node:path";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const HERE = dirname(fileURLToPath(import.meta.url));
const WORKER_DIR = join(HERE, "../..");
const AUDIT_DIR = join(HERE, ".local");
const NEVER_PATH = join(HERE, "never-touch.json");
const STAGING_DB = "asnm-db-staging";
const STAGING_ID = "ae83f752-9f7a-476c-914a-94b9ced0627f";
const LIVE_DB = "asnm-db";
const LIVE_PUBLIC_EXPECTED = 1544;
const TESTER = "https://asnm-staging.alec-af3.workers.dev";

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

const FILL_FIELDS = new Set([
  "name", "org_type", "sport", "sport_key", "sports_json", "website_url", "email",
  "phone", "city", "state", "state_name", "zip", "country", "lat", "lng",
  "geo_precision", "description", "cost_note", "equipment_provided", "ages",
  "data_quality_rating", "primary_data_source", "verification_status",
  "verification_method", "status", "is_public", "last_ok_at",
]);

function die(msg) {
  console.error(`ship-approved: ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const out = { file: null, apply: false, allowLiveDrift: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply") out.apply = true;
    else if (a === "--allow-live-drift") out.allowLiveDrift = true;
    else if (a === "--file") out.file = argv[++i];
    else if (a.startsWith("--file=")) out.file = a.slice(7);
    else die(`unknown arg ${a}`);
  }
  if (!out.file) die("usage: node ship-approved.mjs --file pile.json [--apply] [--allow-live-drift]");
  return out;
}

function q(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  if (typeof v === "boolean") return v ? "1" : "0";
  return `'${String(v).replace(/'/g, "''")}'`;
}

function isHttps(url) {
  return typeof url === "string" && /^https:\/\//i.test(url);
}

function loadNever() {
  const raw = JSON.parse(readFileSync(NEVER_PATH, "utf8"));
  return {
    ids: new Set((raw.ids || []).map(String)),
    prefixes: (raw.prefixes || []).map(String),
  };
}

function isNeverTouch(id, never, extra) {
  if (!id) return false;
  const s = String(id);
  if (never.ids.has(s) || extra.has(s)) return true;
  return never.prefixes.some((p) => s === p || s.startsWith(`${p}-`) || s.startsWith(p));
}

function slugOf(card, file) {
  const s = card.pile?.slug || basename(file, ".json").replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
  if (!s) die("pile.slug missing");
  return s;
}

function validateCard(card, never) {
  const errors = [];
  const pile = card.pile || {};
  if (!pile.name) errors.push("pile.name required");
  const extra = new Set((card.do_not_touch || []).map(String));

  for (const fill of card.fills || []) {
    if (!fill.id) errors.push("fill missing id");
    if (!isHttps(fill.source_url)) errors.push(`fill ${fill.id || "?"} needs https source_url`);
    if (isNeverTouch(fill.id, never, extra)) errors.push(`fill ${fill.id} is never-touch (no parent rewrite)`);
    for (const k of Object.keys(fill.fields || {})) {
      if (!FILL_FIELDS.has(k)) errors.push(`fill ${fill.id} unknown field ${k}`);
    }
  }

  for (const fold of card.folds || []) {
    if (!fold.keep) errors.push("fold missing keep");
    for (const hid of fold.hide || []) {
      if (isNeverTouch(hid, never, extra)) errors.push(`fold hides never-touch ${hid}`);
      if (hid === fold.keep) errors.push(`fold hides its own keep ${hid}`);
    }
  }

  for (const add of card.adds || []) {
    if (!add.name) errors.push("add missing name");
    if (!isHttps(add.source_url)) errors.push(`add ${add.name || "?"} needs https source_url`);
    if (/^Adaptive Sports\s/i.test(add.name || "")) {
      errors.push(`refusing invented statewide name: ${add.name}`);
    }
    if (/^CAF[- ]/i.test(add.name || "") || /^Challenged Athletes Foundation[- ]/i.test(add.name || "")) {
      if (!isHttps(add.official_caf_region_url)) {
        errors.push(`refusing guessed CAF-region parent: ${add.name}`);
      }
    }
    if (add.id && isNeverTouch(add.id, never, extra)) {
      errors.push(`add id ${add.id} collides with never-touch`);
    }
  }

  if (errors.length) die(errors.join("\n"));
}

function sqlHeader(slug, pile) {
  return [
    `-- ASNM STAGING ONLY — ${pile.name || slug}`,
    `-- Target: ${STAGING_DB} (${STAGING_ID})`,
    `-- DO NOT run against asnm-db / production`,
    `-- Generated: ${new Date().toISOString()}`,
    `-- Live stays locked.`,
    ``,
  ].join("\n");
}

function buildSql(card, slug, now) {
  const pile = card.pile;
  const lines = [sqlHeader(slug, pile)];
  const sourceId = randomUUID();
  const newIds = [];
  const addCount = (card.adds || []).length;
  const region = pile.region || "";

  lines.push(
    `INSERT OR IGNORE INTO data_sources (source_id, source_name, source_organization, source_url, source_type, coverage_scope, data_quality_rating, record_count, status)`,
    `VALUES (${q(sourceId)}, ${q(pile.name)}, 'Adaptive Sports Near Me', ${q(TESTER)}, 'human_review', ${q(region || null)}, 'high', ${addCount}, 'active');`,
    ``,
  );

  const approve = card.queue?.approve || [];
  const reject = card.queue?.reject || [];
  if (approve.length) {
    lines.push(
      `UPDATE review_queue SET status='approved', resolved_at=${q(now)}, resolved_by=${q(`ship-${slug}`)}`,
      `WHERE item_id IN (${approve.map((n) => Number(n)).join(", ")}) AND status='pending';`,
      ``,
    );
  }
  if (reject.length) {
    lines.push(
      `UPDATE review_queue SET status='rejected', resolved_at=${q(now)}, resolved_by=${q(`ship-${slug}`)}`,
      `WHERE item_id IN (${reject.map((n) => Number(n)).join(", ")}) AND status='pending';`,
      ``,
    );
  }

  for (const fill of card.fills || []) {
    const fields = { ...(fill.fields || {}) };
    if (fields.state && !fields.state_name && STATE_NAMES[fields.state]) {
      fields.state_name = STATE_NAMES[fields.state];
    }
    const sets = Object.entries(fields).map(([k, v]) => `${k}=${q(v)}`);
    sets.push(`updated_at=${q(now)}`);
    lines.push(`-- fill ${fill.id} from ${fill.source_url}`);
    lines.push(`UPDATE organizations SET ${sets.join(", ")} WHERE id=${q(fill.id)};`, ``);
  }

  const folded = [];
  for (const fold of card.folds || []) {
    const hide = fold.hide || [];
    if (!hide.length) continue;
    folded.push(...hide);
    lines.push(`-- fold twins of ${fold.keep}: ${fold.reason || "same legal org"}`);
    lines.push(
      `UPDATE organizations SET status='duplicate', is_public=0, updated_at=${q(now)}`,
      `WHERE id IN (${hide.map(q).join(", ")});`,
      ``,
    );
  }

  const sourceRows = [];
  for (const add of card.adds || []) {
    const id = add.id || randomUUID();
    newIds.push(id);
    let description = add.description || null;
    if (add.parent_id && description && !description.includes(add.parent_id)) {
      description = `Child of already-listed ${add.parent_id}. ${description}`;
    } else if (add.parent_id && !description) {
      description = `Child of already-listed ${add.parent_id}.`;
    }
    const sports = add.sports || (add.sport_key ? [add.sport_key] : []);
    const stateName = add.state_name || STATE_NAMES[add.state] || null;
    lines.push(`-- add ${add.name} from ${add.source_url}`);
    lines.push(`INSERT INTO organizations (`);
    lines.push(`  id, name, org_type, sport, sport_key, sports_json, website_url, email, phone, city, state, state_name, zip, country, lat, lng, geo_precision, description, cost_note, equipment_provided, ages, data_quality_rating, primary_data_source, verification_status, verification_method, status, is_public, last_ok_at, created_at, updated_at`);
    lines.push(`) VALUES (`);
    lines.push(`  ${[
      q(id), q(add.name), q(add.org_type || "adaptive_club"), q(add.sport || null),
      q(add.sport_key || null), q(JSON.stringify(sports)), q(add.website_url || null),
      q(add.email ?? null), q(add.phone ?? null), q(add.city || null), q(add.state || null),
      q(stateName), q(add.zip ?? null), q(add.country || "United States"),
      q(add.lat ?? null), q(add.lng ?? null), q(add.geo_precision || (add.city ? "city" : null)),
      q(description), q(add.cost_note ?? null), q(add.equipment_provided ?? null),
      q(add.ages ?? null), q("high"), q(pile.name), q("unverified"), q("website_crawl"),
      q("active"), 1, q(now), q(now), q(now),
    ].join(", ")}`);
    lines.push(`);`, ``);
    sourceRows.push({ id, url: add.source_url });
  }

  if (sourceRows.length) {
    lines.push(`INSERT OR IGNORE INTO organization_data_sources (organization_id, source_id, source_record_url, data_quality_rating, retrieved_at, verified) VALUES`);
    lines.push(sourceRows.map((r) => `  (${q(r.id)}, ${q(sourceId)}, ${q(r.url)}, 'high', ${q(now)}, 0)`).join(",\n") + ";");
    lines.push(``);
  }

  return { sql: lines.join("\n"), newIds, folded, sourceId };
}

function wranglerJson(args) {
  // LIVE LOCK: refuse asnm-db writes. Public live count must stay 1544.
  const cmdIdx = args.indexOf("--command");
  const command = cmdIdx >= 0 ? (args[cmdIdx + 1] || "") : "";
  if (args.includes(LIVE_DB) && command && !/^\s*select/i.test(command)) {
    die("refusing a non-SELECT against asnm-db (live stays locked; public count must stay 1544)");
  }
  if (args.includes(LIVE_DB) && args.includes("--file")) {
    die("refusing --file against asnm-db (live stays locked; public count must stay 1544)");
  }
  const out = execFileSync("wrangler", args, {
    cwd: WORKER_DIR,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return out;
}

function livePublicCount() {
  // READ ONLY. Never pass a mutating statement to asnm-db.
  const raw = wranglerJson([
    "d1", "execute", LIVE_DB, "--remote",
    "--command", "SELECT COUNT(*) AS n FROM organizations WHERE is_public = 1 AND status = 'active'",
    "--json",
  ]);
  const parsed = JSON.parse(raw);
  const rows = parsed?.[0]?.results || parsed?.result?.[0]?.results || parsed?.results || [];
  const n = Number(rows[0]?.n ?? rows[0]?.COUNT ?? rows[0]?.["COUNT(*)"]);
  if (!Number.isFinite(n)) die(`could not parse live count from: ${raw.slice(0, 400)}`);
  return n;
}

function tap(qstr) {
  const url = `${TESTER}/api/programs?q=${encodeURIComponent(qstr)}`;
  try {
    const raw = execFileSync("curl", ["-fsS", url], { encoding: "utf8" });
    const json = JSON.parse(raw);
    const list = json.programs || json.results || json.items || [];
    return Array.isArray(list) ? list.length : (json.total ?? json.count ?? "?");
  } catch (e) {
    return `error: ${e.message}`;
  }
}

function collectTaps(card) {
  const taps = [...(card.taps || [])];
  for (const add of card.adds || []) if (add.city) taps.push(add.city);
  for (const fill of card.fills || []) if (fill.fields?.city) taps.push(fill.fields.city);
  return [...new Set(taps.map((t) => String(t).trim()).filter(Boolean))];
}

function main() {
  const args = parseArgs(process.argv);
  const file = resolve(args.file);
  const card = JSON.parse(readFileSync(file, "utf8"));
  const never = loadNever();
  validateCard(card, never);

  if (args.apply && !(card.pile?.approved === true || (card.pile?.approved_by || "").trim())) {
    die("refusing --apply: pile.approved is not true (and no approved_by)");
  }

  const slug = slugOf(card, file);
  const now = card.pile?.approved_at || new Date().toISOString();
  const { sql, newIds, folded, sourceId } = buildSql(card, slug, now);

  mkdirSync(AUDIT_DIR, { recursive: true });
  const sqlPath = `${AUDIT_DIR}/${slug}-staging.sql`;
  const receiptPath = `${AUDIT_DIR}/${slug}-receipt.json`;
  writeFileSync(sqlPath, sql);

  const receipt = {
    slug,
    file,
    sqlPath,
    applied: false,
    live_count: null,
    sourceId,
    newIds,
    folded,
    queue: card.queue || {},
    holds: card.holds || [],
    outs: card.outs || [],
    tester: TESTER,
    target: STAGING_DB,
  };

  if (!args.apply) {
    writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + "\n");
    console.log(`dry-run wrote ${sqlPath}`);
    console.log(`receipt ${receiptPath}`);
    console.log(`adds ${newIds.length} folds ${folded.length}`);
    console.log("pass --apply to write tester D1 (asnm-db-staging only)");
    return;
  }

  const live = livePublicCount();
  receipt.live_count = live;
  if (live !== LIVE_PUBLIC_EXPECTED && !args.allowLiveDrift) {
    writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + "\n");
    die(`live public count is ${live}, expected ${LIVE_PUBLIC_EXPECTED}. abort (live stays locked). pass --allow-live-drift only if you mean it.`);
  }

  console.log(`live public still ${live} (locked)`);
  wranglerJson(["d1", "execute", STAGING_DB, "--env", "staging", "--remote", "--file", sqlPath]);
  receipt.applied = true;
  receipt.applied_at = new Date().toISOString();

  const taps = {};
  for (const t of collectTaps(card)) taps[t] = tap(t);
  receipt.taps = taps;
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + "\n");

  console.log(`applied ${sqlPath} -> ${STAGING_DB}`);
  console.log(`new ids: ${newIds.join(", ") || "(none)"}`);
  console.log(`folded: ${folded.join(", ") || "(none)"}`);
  console.log(`taps: ${JSON.stringify(taps)}`);
  console.log(`tester ${TESTER}`);
  console.log("live still locked");
}

main();
