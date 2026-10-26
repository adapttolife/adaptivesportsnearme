import { hashToken, newLoginToken, validEmail } from "./organization-access.js";
import { parseCookieHeader, signProfileId, verifyProfileCookie, validState } from "./profile.js";
import { newerOrOlder } from "./schema-probe.js";
import { cleanSeasons } from "../public/app/yearly.js";
import { SLUG_RE } from "./events.js";
import { applyConfirmation, logActivity, organizationActivity, organizationSports, FIX_WORDS } from "./offerings.js";

export const ADMIN_COOKIE_NAME = "asnm_admin";
const SESSION_SECONDS = 60 * 60 * 12;
const TOKEN_MINUTES = 15;
const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATE_NAMES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

const now = () => new Date().toISOString();
const future = (seconds) => new Date(Date.now() + seconds * 1000).toISOString();
const clean = (value, length = 5000) => String(value == null ? "" : value).trim().slice(0, length);
const nullable = (value, length) => clean(value, length) || null;
const INSTANTS = new Set(["starts_at", "ends_at", "last_ok_at"]);
const ZONE = /(?:Z|[+-]\d{2}:\d{2})$/i;

// Keep the stored text when the instant did not change, so a load-then-save
// does not rewrite "2026-11-01T18:30:00Z" as a different spelling of the same moment.
function instantValue(incoming, current) {
  if (incoming == null || String(incoming).trim() === "") return null;
  const text = String(incoming).trim();
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return text;
  if (current != null && String(current).trim() !== "") {
    const prior = new Date(current);
    if (!Number.isNaN(prior.getTime()) && prior.getTime() === parsed.getTime()) return String(current);
  }
  return ZONE.test(text) ? parsed.toISOString() : text;
}
const flag = (value, fallback = 0) => [true, 1, "1", "true", "yes", "on"].includes(value) ? 1
  : [false, 0, "0", "false", "no", "off"].includes(value) ? 0 : fallback;
const number = (value, fallback = null) => {
  if (value === "" || value == null) return null;
  const result = Number(value);
  return Number.isFinite(result) ? result : fallback;
};

export function isAdminEmail(value) {
  const email = validEmail(value);
  return /@(adaptivesportsnearme\.com|faisaln\.com)$/i.test(email) ? email : "";
}

export function serializeAdminCookie(id, signature, maxAge = SESSION_SECONDS) {
  return `${ADMIN_COOKIE_NAME}=${id}.${signature}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

export function clearAdminCookie() {
  return `${ADMIN_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export async function issueAdminLoginToken(db, email) {
  const token = newLoginToken();
  await db.prepare(`INSERT INTO admin_login_tokens (id, token_hash, email, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`)
    .bind(crypto.randomUUID(), await hashToken(token), email, future(TOKEN_MINUTES * 60), now()).run();
  return token;
}

export async function consumeAdminLoginToken(db, token) {
  if (!token || token.length > 500) return null;
  const row = await db.prepare(`SELECT id, email FROM admin_login_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?`)
    .bind(await hashToken(token), now()).first();
  if (!row || !isAdminEmail(row.email)) return null;
  const result = await db.prepare(`UPDATE admin_login_tokens SET used_at = ? WHERE id = ? AND used_at IS NULL`).bind(now(), row.id).run();
  return Number(result?.meta?.changes || 0) ? String(row.email).toLowerCase() : null;
}

export async function createAdminSession(db, email, secret) {
  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO admin_sessions (id, email, expires_at, created_at) VALUES (?, ?, ?, ?)`)
    .bind(id, email, future(SESSION_SECONDS), now()).run();
  return { id, signature: await signProfileId(id, secret) };
}

export async function readAdminSession(request, db, secret) {
  const id = await verifyProfileCookie(parseCookieHeader(request.headers.get("Cookie"), ADMIN_COOKIE_NAME), secret);
  if (!id || !ID_RE.test(id)) return null;
  const row = await db.prepare(`SELECT email FROM admin_sessions WHERE id = ? AND revoked_at IS NULL AND expires_at > ?`).bind(id, now()).first();
  const email = isAdminEmail(row?.email);
  return email ? { id, email } : null;
}

const ENTITY = {
  organizations: {
    table: "organizations", title: "organization", name: "name",
    fields: ["name", "org_type", "sport", "sport_key", "sports_json", "website_url", "email", "claim_email", "phone", "city", "state", "state_name", "zip", "address", "country", "lat", "lng", "geo_precision", "description", "cost_note", "equipment_provided", "ages", "data_quality_rating", "primary_data_source", "verification_status", "verification_method", "status", "is_public", "publicity_consent", "address_publicity_consent", "last_ok_at"],
    booleans: ["equipment_provided", "is_public", "publicity_consent", "address_publicity_consent"], numbers: ["lat", "lng"], states: true,
  },
  programs: {
    table: "programs", title: "program", name: "name",
    fields: ["organization_id", "name", "sport", "sport_key", "sports_json", "website_url", "email", "phone", "city", "state", "state_name", "zip", "address", "country", "lat", "lng", "geo_precision", "description", "cost_note", "equipment_provided", "ages", "verification_status", "verification_method", "status", "is_public", "publicity_consent", "address_publicity_consent", "last_ok_at", "kind", "listing", "seasons_json", "usual_month", "first_year", "slug"],
    booleans: ["equipment_provided", "is_public", "publicity_consent", "address_publicity_consent"], numbers: ["lat", "lng", "usual_month", "first_year"], states: true,
    // When it comes back (migration 0015, docs/specs/programs-that-come-back.md).
    newer: ["kind", "listing", "seasons_json", "usual_month", "first_year", "slug"],
  },
  events: {
    table: "events", title: "event", name: "title",
    fields: ["title", "description", "org_id", "sport_key", "venue", "city", "state", "url", "starts_at", "ends_at", "all_day", "status", "is_public", "source", "program_id", "recap_url"],
    booleans: ["all_day", "is_public"], numbers: [], states: true,
    newer: ["program_id", "recap_url"],
  },
  grants: {
    table: "grants", title: "grant", name: "name",
    fields: ["name", "source", "type", "audience", "amount_min_cents", "amount_max_cents", "amount_display", "deadline_display", "deadline_next", "description", "eligibility_criteria", "how_to_apply", "application_url", "source_url", "email", "phone", "sports_json", "is_open", "is_renewable", "is_public", "status"],
    booleans: ["is_open", "is_renewable", "is_public"], numbers: ["amount_min_cents", "amount_max_cents"], states: false,
  },
};

export function adminEntity(kind) { return ENTITY[kind] || null; }

// Columns from a migration that may not have run yet (src/schema-probe.js):
// before it runs, the dashboard edits what the database has.
const OLDER = (entity) => ({ ...entity, fields: entity.fields.filter((f) => !(entity.newer || []).includes(f)) });
function withSchema(db, entity, run) {
  if (!entity.newer) return run(entity);
  return newerOrOlder(db, "programs_come_back", () => run(entity), () => run(OLDER(entity)));
}

export async function listAdminItems(db, kind, options = {}) {
  const entity = adminEntity(kind); if (!entity) return null;
  return listItems(db, entity, options);
}

async function listItems(db, entity, { query = "", limit = 100, offset = 0 } = {}) {
  const needle = clean(query, 120);
  const where = needle ? ` WHERE ${entity.name} LIKE ? COLLATE NOCASE` : "";
  const binds = needle ? [`%${needle}%`, Math.min(Math.max(Number(limit) || 100, 1), 200), Math.max(Number(offset) || 0, 0)] : [Math.min(Math.max(Number(limit) || 100, 1), 200), Math.max(Number(offset) || 0, 0)];
  const count = await db.prepare(`SELECT count(*) AS total FROM ${entity.table}${where}`).bind(...(needle ? [`%${needle}%`] : [])).first();
  const rows = await db.prepare(`SELECT id, ${entity.name} AS name, is_public, status, updated_at FROM ${entity.table}${where} ORDER BY ${entity.name} COLLATE NOCASE LIMIT ? OFFSET ?`).bind(...binds).all();
  return { total: Number(count?.total || 0), items: rows.results || [] };
}

export async function getAdminItem(db, kind, id) {
  const entity = adminEntity(kind); if (!entity || !ID_RE.test(id)) return null;
  return withSchema(db, entity,
    (e) => db.prepare(`SELECT id, ${e.fields.join(", ")}, created_at, updated_at FROM ${e.table} WHERE id = ?`).bind(id).first());
}

function values(entity, input, current = {}) {
  const value = {};
  for (const field of entity.fields) {
    const present = Object.prototype.hasOwnProperty.call(input, field);
    const source = present ? input[field] : current[field];
    if (entity.booleans.includes(field)) value[field] = flag(source, Number(current[field]) || 0);
    else if (entity.numbers.includes(field)) value[field] = number(source, current[field] == null ? null : Number(current[field]));
    else if (INSTANTS.has(field)) value[field] = instantValue(source, current[field]);
    else value[field] = nullable(source, 5000);
  }
  if (!current.id) {
    if (entity.table === "organizations" || entity.table === "programs") {
      value.status ||= "active";
      value.verification_status ||= "unverified";
      if (!Object.prototype.hasOwnProperty.call(input, "is_public")) value.is_public = 1;
    }
    if (entity.table === "events") {
      value.description ||= "";
      value.status ||= "scheduled";
      value.source ||= "admin";
      if (!Object.prototype.hasOwnProperty.call(input, "is_public")) value.is_public = 1;
    }
    if (entity.table === "grants") {
      value.audience ||= "athlete";
      value.status ||= "active";
      if (!Object.prototype.hasOwnProperty.call(input, "is_public")) value.is_public = 1;
      if (!Object.prototype.hasOwnProperty.call(input, "is_open")) value.is_open = 1;
    }
  }
  if (!value[entity.name]) throw new Error("name-required");
  if (entity.table === "programs" && !value.organization_id) throw new Error("organization-required");
  if (entity.states) {
    value.state = validState(value.state);
    if (!entity.noStateName) value.state_name = value.state ? STATE_NAMES[value.state] : null;
  }
  if (entity.table === "programs") {
    if ("kind" in value) value.kind = value.kind || "program";
    if ("listing" in value) value.listing = value.listing || "own";
    if ("kind" in value && !["program", "event"].includes(value.kind)) throw new Error("kind-invalid");
    if ("listing" in value && !["own", "with_org"].includes(value.listing)) throw new Error("listing-invalid");
    if (value.slug) { value.slug = String(value.slug).toLowerCase(); if (!SLUG_RE.test(value.slug)) throw new Error("slug-invalid"); }
    if (value.usual_month != null && !(Number.isInteger(value.usual_month) && value.usual_month >= 1 && value.usual_month <= 12)) throw new Error("month-invalid");
    if (value.first_year != null && !(Number.isInteger(value.first_year) && value.first_year >= 1900 && value.first_year <= 2100)) throw new Error("year-invalid");
    if (value.seasons_json) {
      let list; try { list = JSON.parse(value.seasons_json); } catch { list = null; }
      if (!Array.isArray(list)) throw new Error("sports-invalid");
      value.seasons_json = JSON.stringify(cleanSeasons(list));
    }
  }
  for (const field of ["website_url", "url", "application_url", "source_url", "recap_url"]) if (field in value && value[field]) {
    try { const url = new URL(value[field]); if (!/^https?:$/.test(url.protocol)) throw new Error(); } catch { throw new Error("url-invalid"); }
  }
  for (const field of ["email", "claim_email"]) if (field in value && value[field]) {
    const email = validEmail(value[field]); if (!email) throw new Error("email-invalid"); value[field] = email;
  }
  for (const field of ["sports_json"]) if (field in value && value[field]) {
    try { if (!Array.isArray(JSON.parse(value[field]))) throw new Error(); } catch { throw new Error("sports-invalid"); }
  }
  if (entity.table === "events" && (!value.starts_at || Number.isNaN(Date.parse(value.starts_at)))) throw new Error("start-invalid");
  if (entity.table === "events" && value.ends_at && Number.isNaN(Date.parse(value.ends_at))) throw new Error("end-invalid");
  return value;
}

export async function saveAdminItem(db, kind, id, input, actor = null) {
  const full = adminEntity(kind); if (!full || !ID_RE.test(id)) return null;
  const current = await getAdminItem(db, kind, id); if (!current) return false;
  return withSchema(db, full, async (entity) => {
    const value = values(entity, input, current);
    const fields = entity.fields;
    await db.prepare(`UPDATE ${entity.table} SET ${fields.map((field) => `${field} = ?`).join(", ")}, updated_at = ? WHERE id = ?`)
      .bind(...fields.map((field) => value[field]), now(), id).run();
    // What the person changed: fields they sent whose stored value is now different.
    const changed = fields.filter((f) => Object.prototype.hasOwnProperty.call(input, f) && String(current[f] ?? "") !== String(value[f] ?? ""));
    if (changed.length && actor) {
      const orgId = entity.table === "organizations" ? id : entity.table === "programs" ? value.organization_id : entity.table === "events" ? value.org_id : null;
      const what = entity.table === "organizations" ? "the listing" : `${entity.title} "${String(value[entity.name] || "").slice(0, 80)}"`;
      if (orgId) await logActivity(db, orgId, "admin_edit", `Edited ${what}: ${changed.map((f) => f.replace(/_/g, " ")).join(", ")}`, { actor });
    }
    return getAdminItem(db, kind, id);
  });
}

export async function createAdminItem(db, kind, input) {
  const full = adminEntity(kind); if (!full) return null;
  return withSchema(db, full, async (entity) => {
    const value = values(entity, input, {}); const id = crypto.randomUUID(); const timestamp = now();
    const fields = entity.fields;
    await db.prepare(`INSERT INTO ${entity.table} (id, ${fields.join(", ")}, created_at, updated_at) VALUES (?, ${fields.map(() => "?").join(", ")}, ?, ?)`)
      .bind(id, ...fields.map((field) => value[field]), timestamp, timestamp).run();
    return getAdminItem(db, kind, id);
  });
}

const QUEUE_KINDS = new Set(["new_organization", "new_program", "new_event", "listing_update"]);

function queueTitle(row, payload) {
  if (row.kind === "listing_update") return payload.program || "Untitled organization";
  if (row.kind === "new_organization") return payload.organization || "Untitled organization";
  if (row.kind === "new_program") return payload.program || "Untitled program";
  return payload.event || "Untitled event";
}

function queueRow(row) {
  let payload = {};
  try { payload = JSON.parse(row.payload || "{}"); } catch { payload = {}; }
  return { id: Number(row.submission_id), kind: row.kind, title: queueTitle(row, payload), city: payload.city || "", state: payload.state || "", created_at: row.created_at, payload };
}

async function draftId(kind, intakeId) {
  if (!intakeId || typeof intakeId !== "string") return "";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`draft-${kind}\n${intakeId}`));
  const hex = Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${((parseInt(hex[16], 16) & 3) | 8).toString(16)}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export async function listAdminQueue(db) {
  const { results } = await db.prepare(`SELECT submission_id, kind, payload, created_at FROM submissions
    WHERE status = 'new' AND kind IN ('new_organization', 'new_program', 'new_event', 'listing_update')
    ORDER BY created_at ASC`).all();
  return (results || []).map(queueRow);
}

export async function getAdminQueueItem(db, id) {
  const numberId = Number(id);
  if (!Number.isInteger(numberId) || numberId < 1) return null;
  const row = await db.prepare(`SELECT submission_id, kind, payload, contact_email, status, created_at FROM submissions WHERE submission_id = ?`).bind(numberId).first();
  if (!row || !QUEUE_KINDS.has(row.kind)) return null;
  const item = { ...queueRow(row), contact_email: row.contact_email, status: row.status };
  if (row.kind === "listing_update") {
    // Organizations confirming their listing (Apply) and "Something's wrong?" reports (Done) share the queue,
    // so the team works in one place (docs/specs/community-kept-directory.md).
    const id = String(item.payload.update_of || "");
    const org = ID_RE.test(id) ? await db.prepare(`SELECT id, name, city, state, website_url, ages, cost_note FROM organizations WHERE id = ?`).bind(id).first() : null;
    if (org) item.organization = { id: org.id, name: org.name, city: org.city, state: org.state, website: org.website_url || null, ages: org.ages || null, cost: org.cost_note || null,
      // What it runs now, so the queue can say "Adds Skiing (winter)" rather than list everything.
      sports: (await organizationSports(db, org.id)).map(({ key, seasons }) => ({ key, seasons })) };
  }
  if (row.kind === "new_organization") {
    const id = await draftId("organization", item.payload.intake_id);
    const draft = id ? await db.prepare(`SELECT id FROM organizations WHERE id = ?`).bind(id).first() : null;
    if (draft) item.draft = { kind: "organizations", id: draft.id };
  } else if (row.kind === "new_program") {
    const id = await draftId("program", item.payload.intake_id);
    const draft = id ? await db.prepare(`SELECT id FROM programs WHERE id = ?`).bind(id).first() : null;
    if (draft) item.draft = { kind: "programs", id: draft.id };
  }
  return item;
}

export async function acceptAdminQueueItem(db, id, actor = "system") {
  const item = await getAdminQueueItem(db, id);
  if (!item || item.status !== "new") return null;
  // Claim it first, so a double click (or two people) can't apply it twice; give it back on failure.
  const claimed = await db.prepare(`UPDATE submissions SET status = 'accepted' WHERE submission_id = ? AND status = 'new'`).bind(item.id).run();
  if (!Number(claimed?.meta?.changes || 0)) return null;
  try {
    return await acceptClaimed(db, item, actor);
  } catch (err) {
    await db.prepare(`UPDATE submissions SET status = 'new' WHERE submission_id = ? AND status = 'accepted'`).bind(item.id).run();
    throw err;
  }
}

async function acceptClaimed(db, item, actor) {
  const timestamp = now();
  let kind = item.kind, recordId = null;
  if (kind === "new_organization") {
    const row = item.draft ? await db.prepare(`SELECT id FROM organizations WHERE id = ? AND is_public = 0`).bind(item.draft.id).first() : null;
    if (!row) throw new Error("draft-missing");
    recordId = row.id;
    await db.prepare(`UPDATE organizations SET is_public = 1, verification_status = 'verified', verification_method = ?, updated_at = ? WHERE id = ?`)
      .bind("admin-accepted", timestamp, recordId).run();
  } else if (kind === "new_program") {
    const row = item.draft ? await db.prepare(`SELECT id FROM programs WHERE id = ? AND is_public = 0`).bind(item.draft.id).first() : null;
    if (!row) throw new Error("draft-missing");
    recordId = row.id;
    await db.prepare(`UPDATE programs SET is_public = 1, verification_status = 'verified', verification_method = ?, updated_at = ? WHERE id = ?`)
      .bind("admin-accepted", timestamp, recordId).run();
  } else if (kind === "listing_update" && item.payload.relation !== "run") {
    // A report from a visitor: a person fixes the listing by hand in the dashboard; Done closes it.
    if (!item.organization) throw new Error("organization-missing");
    recordId = item.organization.id;
    const what = [FIX_WORDS[item.payload.reason], String(item.payload.notes || "").slice(0, 120)].filter(Boolean).join(". ");
    await logActivity(db, recordId, "admin_edit", `Report handled${what ? `: ${what}` : ""}`, { actor, ref: `submission ${item.id}`, at: timestamp });
  } else if (kind === "listing_update") {
    if (!item.organization) throw new Error("organization-missing");
    recordId = item.organization.id;
    await applyConfirmation(db, item.organization, item.payload, { actor, ref: `submission ${item.id}`, timestamp });
  } else {
    const event = item.payload;
    const date = clean(event.date, 20);
    const time = clean(event.time, 20) || "00:00";
    const start = new Date(`${date}T${time}`);
    if (Number.isNaN(start.getTime())) throw new Error("start-invalid");
    const startsAt = start.toISOString();
    recordId = crypto.randomUUID();
    await db.prepare(`INSERT INTO events (id, title, description, sport_key, venue, city, state, url, starts_at, ends_at, all_day, status, is_public, source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'scheduled', 1, 'submission', ?, ?)`)
      .bind(recordId, queueTitle({ kind }, event), clean(event.notes, 5000), nullable(event.sport, 80), nullable(event.org, 300), nullable(event.city, 120), validState(event.state), nullable(event.url, 500), startsAt, null, timestamp, timestamp).run();
  }
  return { kind, record_id: recordId };
}

// The team-only history of an organization, and a note added to it ("Emailed Oct 26").
export async function adminOrganizationActivity(db, id) {
  if (!ID_RE.test(id)) return null;
  const org = await db.prepare(`SELECT id FROM organizations WHERE id = ?`).bind(id).first();
  return org ? organizationActivity(db, id) : null;
}

export async function addAdminNote(db, id, text, actor) {
  if (!ID_RE.test(id)) return null;
  const note = clean(text, 500).replace(/\s+/g, " ");
  if (!note) throw new Error("note-required");
  const org = await db.prepare(`SELECT id FROM organizations WHERE id = ?`).bind(id).first();
  if (!org) return null;
  await logActivity(db, id, "note", note, { actor });
  return organizationActivity(db, id);
}
