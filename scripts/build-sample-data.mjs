// Writes db/sample/sample.sql: a small slice of the public directory, so a fresh
// clone shows a working site after `npm run setup` (no Cloudflare account needed).
//
// Maintainers only (it reads a remote D1 database):
//   node scripts/build-sample-data.mjs --db asnm-db-staging --config wrangler.preview.json
//
// What it copies: public, active listings with a website in a few states, their
// programs, every sport, and the public grants. Columns are an ALLOW list, so a
// column added later stays out until someone decides it is public. Email, phone,
// claim and intake fields, internal notes and ZIP codes are never copied. Free text
// (descriptions, cost and equipment notes) is left out too: researchers' notes in it
// carry contact details, some of them personal. The file is refused if any email
// address or phone number is left in it.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { isListable } from "../public/app/listable.js";

const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : fallback; };
const DB = arg("--db", "asnm-db-staging");
const CONFIG = arg("--config", "wrangler.preview.json");
const STATES = ["CA", "CO", "FL", "NY", "TX"];
const PER_STATE = 24;

const COLUMNS = {
  sports: ["sport_key", "name", "super_type", "category", "is_paralympic", "is_team", "icon_key"],
  organizations: ["id", "name", "org_type", "sport", "sport_key", "sports_json", "website_url", "city", "state", "state_name", "country", "lat", "lng", "geo_precision",
    "description", "cost_note", "equipment_provided", "ages", "data_quality_rating", "primary_data_source", "verification_status", "verification_method", "status", "is_public",
    "last_ok_at", "created_at", "updated_at", "last_checked_at", "publicity_consent"],
  programs: ["id", "organization_id", "name", "sport", "sport_key", "sports_json", "website_url", "city", "state", "state_name", "publicity_consent", "country", "lat", "lng",
    "geo_precision", "description", "cost_note", "equipment_provided", "ages", "verification_status", "verification_method", "status", "is_public", "last_ok_at", "created_at", "updated_at"],
  grants: ["id", "name", "source", "type", "audience", "amount_min_cents", "amount_max_cents", "amount_display", "deadline_display", "deadline_next", "description",
    "eligibility_criteria", "how_to_apply", "application_url", "source_url", "sports_json", "is_open", "is_renewable", "is_public", "status", "created_at", "updated_at"],
};

function query(sql) {
  const out = execFileSync("npx", ["wrangler", "d1", "execute", DB, "--remote", "--json", "--config", CONFIG, `--command=${sql}`], { encoding: "utf8", maxBuffer: 64 << 20 });
  return JSON.parse(out)[0].results;
}
const FREE_TEXT = new Set(["description", "cost_note", "equipment_provided"]);
const lit = (v) => v == null ? "NULL" : typeof v === "number" ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
const keep = (table, c) => table === "grants" || !FREE_TEXT.has(c);
const inserts = (table, rows) => rows.map((r) => `INSERT INTO ${table} (${COLUMNS[table].join(", ")}) VALUES (${COLUMNS[table].map((c) => lit(keep(table, c) ? r[c] : null)).join(", ")});`).join("\n");

const sports = query(`SELECT ${COLUMNS.sports.join(", ")} FROM sports ORDER BY sport_key`);
const orgs = [];
for (const st of STATES) {
  const rows = query(`SELECT ${COLUMNS.organizations.join(", ")} FROM organizations WHERE state = '${st}' AND is_public = 1 AND status = 'active' AND website_url IS NOT NULL ORDER BY name`);
  orgs.push(...rows.filter((r) => isListable({ ...r, website: r.website_url })).slice(0, PER_STATE));
}
const ids = orgs.map((o) => lit(o.id)).join(", ");
const programs = query(`SELECT ${COLUMNS.programs.join(", ")} FROM programs WHERE is_public = 1 AND organization_id IN (${ids}) ORDER BY organization_id, name`);
const grants = query(`SELECT ${COLUMNS.grants.join(", ")} FROM grants WHERE is_public = 1 ORDER BY name`);

const sql = `-- Sample data for local development: written by scripts/build-sample-data.mjs from ${DB}.
-- Public listings only, ${orgs.length} organizations in ${STATES.join(", ")}, their ${programs.length} programs,
-- ${sports.length} sports and ${grants.length} grants. No email, phone, claim or intake fields.
-- Loaded by \`npm run setup\` into your local database only.
DELETE FROM programs; DELETE FROM organizations; DELETE FROM grants; DELETE FROM sports;
${inserts("sports", sports)}
${inserts("organizations", orgs)}
${inserts("programs", programs)}
${inserts("grants", grants)}
`;
// Grant makers' own text stays (it is what each grant page shows), but nothing that
// looks like an email address or a phone number may ship in a public repository.
const leak = sql.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\(?\b\d{3}\)?[ .-]\d{3}[ .-]\d{4}\b/i);
if (leak) throw new Error(`refusing to write db/sample/sample.sql: it contains contact details ("${leak[0]}")`);
mkdirSync(new URL("../db/sample/", import.meta.url), { recursive: true });
writeFileSync(new URL("../db/sample/sample.sql", import.meta.url), sql);
console.log(`db/sample/sample.sql: ${orgs.length} organizations, ${programs.length} programs, ${sports.length} sports, ${grants.length} grants`);
