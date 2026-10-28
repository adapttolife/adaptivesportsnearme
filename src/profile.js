// Profiles lane — no passwords, no walls. A profile is claimed by the device
// that created it: a signed, HttpOnly cookie carries the profile id, HMAC'd
// with a Worker secret so it can't be forged client-side. The crypto and
// validation helpers below are pure (secret/payload passed in as arguments)
// so they're unit-testable without a live Request/Response or a D1 binding;
// the D1 reads/writes live in their own section further down.

export const COOKIE_NAME = "asnm_p";
const LOGIN_MINUTES = 15;
const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAVE_KINDS = new Set(["organizations", "programs", "events", "grants", "sports"]);
const now = () => new Date().toISOString();

function newToken() { const bytes = new Uint8Array(32); crypto.getRandomValues(bytes); return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(""); }
async function tokenHash(value) { const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)); return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(""); }
export function validEmail(value) { const email = String(value || "").trim().toLowerCase(); return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && email.length <= 320 ? email : ""; }
const COOKIE_MAX_AGE = 31536000; // 1 year, seconds — matches the migration comment's intent

// ---- HMAC cookie (WebCrypto) --------------------------------------------------
async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function toBase64Url(buf) {
  let bin = "";
  for (const b of new Uint8Array(buf)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Sign a profile id -> base64url(HMAC-SHA256(secret, id)). Pure given (id, secret).
export async function signProfileId(id, secret) {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(id));
  return toBase64Url(sig);
}

// Constant-time compare — length is checked up front (that alone leaks nothing
// useful, the secret never appears), then every char is compared regardless of
// where a mismatch first occurs.
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Verify a raw cookie value "{id}.{sig}" against the secret. Returns the profile
// id on success, null on any failure: missing, malformed, garbage, or tampered.
export async function verifyProfileCookie(cookieValue, secret) {
  if (!cookieValue || typeof cookieValue !== "string") return null;
  const dot = cookieValue.indexOf(".");
  if (dot < 1 || dot === cookieValue.length - 1) return null;
  const id = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  if (!/^[A-Za-z0-9_-]+$/.test(sig)) return null; // base64url shape, no padding
  const expected = await signProfileId(id, secret);
  return timingSafeEqual(sig, expected) ? id : null;
}

export function serializeProfileCookie(id, sig, maxAge = COOKIE_MAX_AGE) {
  return `${COOKIE_NAME}=${id}.${sig}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export function clearProfileCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

// Pure header parse — takes the raw Cookie header string, not a Request, so it's
// testable on its own.
export function parseCookieHeader(header, name) {
  for (const part of String(header || "").split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return null;
}

export async function readProfileCookie(request, secret) {
  const raw = parseCookieHeader(request.headers.get("Cookie"), COOKIE_NAME);
  if (!raw) return null;
  return verifyProfileCookie(raw, secret);
}

// ---- validation -----------------------------------------------------------------
const STATE_CODES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL",
  "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
  "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
]);

// USPS 2-letter code, uppercased. Anything else clamps to "" rather than error —
// state is optional, so a bad value just means "no state on file", same spirit
// as the sport/state filters in data.js.
export function validState(s) {
  const v = (typeof s === "string" ? s : "").trim().toUpperCase();
  return STATE_CODES.has(v) ? v : "";
}

// Accepts an array or a CSV string of sport_keys (the SPA posts a CSV, admin/API
// callers may post an array). Clamps each entry to [a-z]+, dedupes, and — when a
// valid-keys set is supplied — drops anything not in it, the same clamp-to-known
// discipline the sport filter uses elsewhere in this codebase.
export function parseSports(input, validKeys) {
  const raw = Array.isArray(input) ? input : String(input == null ? "" : input).split(",");
  const seen = new Set();
  const out = [];
  for (const item of raw) {
    const key = String(item == null ? "" : item).trim().toLowerCase();
    if (!key || !/^[a-z]+$/.test(key)) continue;
    if (validKeys && !validKeys.has(key)) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

// ---- D1 operations ----------------------------------------------------------------
export async function getValidSportKeys(db) {
  const { results } = await db.prepare(`SELECT sport_key FROM sports`).all();
  return new Set(results.map((r) => r.sport_key));
}

export async function getProfileByEmail(db, email) {
  return db.prepare(`SELECT * FROM profiles WHERE email = ? COLLATE NOCASE`).bind(email).first();
}

export async function getProfileById(db, id) {
  return db.prepare(`SELECT * FROM profiles WHERE id = ?`).bind(id).first();
}

export async function issueProfileLoginToken(db, email) {
  const raw = newToken(), expires = new Date(Date.now() + LOGIN_MINUTES * 60 * 1000).toISOString();
  await db.prepare(`INSERT INTO profile_login_tokens (id, token_hash, email, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`)
    .bind(crypto.randomUUID(), await tokenHash(raw), email, expires, now()).run();
  return raw;
}

export async function consumeProfileLoginToken(db, raw) {
  if (!raw || raw.length > 500) return null;
  const row = await db.prepare(`SELECT id, email FROM profile_login_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?`).bind(await tokenHash(raw), now()).first();
  const email = validEmail(row?.email);
  if (!row || !email) return null;
  const changed = await db.prepare(`UPDATE profile_login_tokens SET used_at = ? WHERE id = ? AND used_at IS NULL`).bind(now(), row.id).run();
  return Number(changed?.meta?.changes || 0) ? email : null;
}

export async function findOrCreateProfile(db, email) {
  const existing = await getProfileByEmail(db, email);
  return existing ? existing.id : createProfile(db, { email, name: "", state: "", sports: [], newsletter: false });
}

export async function createProfile(db, { email, name, state, sports, newsletter }) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.prepare(
    `INSERT INTO profiles (id, email, name, state, sports_json, newsletter, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, email, name || "", state || "", JSON.stringify(sports || []), newsletter ? 1 : 0, now, now).run();
  return id;
}

export async function updateProfile(db, id, { email, name, state, sports, newsletter }) {
  const now = new Date().toISOString();
  await db.prepare(
    `UPDATE profiles SET email = ?, name = ?, state = ?, sports_json = ?, newsletter = ?, updated_at = ? WHERE id = ?
     AND (email IS NOT ? OR name IS NOT ? OR state IS NOT ? OR sports_json IS NOT ? OR newsletter IS NOT ?)`
  ).bind(email, name || "", state || "", JSON.stringify(sports || []), newsletter ? 1 : 0, now, id,
    email, name || "", state || "", JSON.stringify(sports || []), newsletter ? 1 : 0).run();
}

export async function orgExists(db, orgId) {
  const row = await db.prepare(`SELECT id FROM organizations WHERE id = ?`).bind(orgId).first();
  return !!row;
}

export async function setFavorite(db, profileId, orgId, on) {
  if (on) {
    await db.prepare(
      `INSERT OR IGNORE INTO profile_favorites (profile_id, org_id, created_at) VALUES (?, ?, ?)`
    ).bind(profileId, orgId, new Date().toISOString()).run();
  } else {
    await db.prepare(
      `DELETE FROM profile_favorites WHERE profile_id = ? AND org_id = ?`
    ).bind(profileId, orgId).run();
  }
}

function parseSportsJson(s) {
  try { return JSON.parse(s) || []; } catch { return []; }
}

async function savedExists(db, kind, id) {
  if (kind === "sports") return !!(await db.prepare(`SELECT sport_key FROM sports WHERE sport_key = ?`).bind(String(id || "")).first());
  if (!ID_RE.test(String(id || ""))) return false;
  const table = kind === "organizations" ? "organizations" : kind === "programs" ? "programs" : kind === "events" ? "events" : "grants";
  return !!(await db.prepare(`SELECT id FROM ${table} WHERE id = ? AND is_public = 1`).bind(id).first());
}

export async function setSavedItem(db, profileId, kind, itemId, on) {
  if (!SAVE_KINDS.has(kind) || !(await savedExists(db, kind, itemId))) return false;
  if (kind === "sports") {
    if (on) await db.prepare(`INSERT OR IGNORE INTO profile_saved_sports (profile_id, sport_key, created_at) VALUES (?, ?, ?)`)
      .bind(profileId, itemId, now()).run();
    else await db.prepare(`DELETE FROM profile_saved_sports WHERE profile_id = ? AND sport_key = ?`).bind(profileId, itemId).run();
    return true;
  }
  if (on) await db.prepare(`INSERT OR IGNORE INTO profile_saved_items (profile_id, item_kind, item_id, created_at) VALUES (?, ?, ?, ?)`)
    .bind(profileId, kind, itemId, now()).run();
  else await db.prepare(`DELETE FROM profile_saved_items WHERE profile_id = ? AND item_kind = ? AND item_id = ?`).bind(profileId, kind, itemId).run();
  return true;
}

export async function profileSavedItems(db, profileId) {
  const { results } = await db.prepare(`SELECT item_kind, item_id FROM profile_saved_items WHERE profile_id = ? ORDER BY created_at DESC`).bind(profileId).all();
  const out = [];
  for (const row of results || []) {
    const query = row.item_kind === "organizations" ? `SELECT id, name, city, state FROM organizations WHERE id = ? AND is_public = 1`
      : row.item_kind === "programs" ? `SELECT id, name, city, state FROM programs WHERE id = ? AND is_public = 1`
      : row.item_kind === "events" ? `SELECT e.id, e.title AS name, e.city, e.state, p.slug FROM events e LEFT JOIN programs p ON p.id = e.program_id WHERE e.id = ? AND e.is_public = 1`
      : `SELECT id, name, '' AS city, '' AS state FROM grants WHERE id = ? AND is_public = 1`;
    const item = await db.prepare(query).bind(row.item_id).first();
    if (item) out.push({ ...item, kind: row.item_kind, href: row.item_kind === "events" && item.slug ? `/events/${item.slug}` : null });
  }
  const sports = await db.prepare(`SELECT s.sport_key AS id, s.name FROM profile_saved_sports p JOIN sports s ON s.sport_key = p.sport_key WHERE p.profile_id = ? ORDER BY p.created_at DESC`).bind(profileId).all();
  for (const sport of sports.results || []) out.push({ ...sport, kind: "sports", href: `/sports/${sport.id}` });
  return out;
}

// Profile + favorites joined to minimal org info — enough for the SPA's saved
// list without shipping the full organizations row (email/phone/etc. stay out).
export async function getProfileWithFavorites(db, id) {
  const profile = await getProfileById(db, id);
  if (!profile) return null;
  const { results } = await db.prepare(
    `SELECT o.id, o.name, o.sport_key AS sport, o.city, o.state
     FROM profile_favorites f JOIN organizations o ON o.id = f.org_id
     WHERE f.profile_id = ? ORDER BY o.name`
  ).bind(id).all();
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    state: profile.state,
    sports: parseSportsJson(profile.sports_json),
    newsletter: !!profile.newsletter,
    favorites: results,
    saved: await profileSavedItems(db, id),
  };
}
