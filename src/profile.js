// Profiles lane — no passwords, no walls. A profile is claimed by the device
// that created it: a signed, HttpOnly cookie carries the profile id, HMAC'd
// with a Worker secret so it can't be forged client-side. The crypto and
// validation helpers below are pure (secret/payload passed in as arguments)
// so they're unit-testable without a live Request/Response or a D1 binding;
// the D1 reads/writes live in their own section further down.

export const COOKIE_NAME = "asnm_p";
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
    `UPDATE profiles SET email = ?, name = ?, state = ?, sports_json = ?, newsletter = ?, updated_at = ? WHERE id = ?`
  ).bind(email, name || "", state || "", JSON.stringify(sports || []), newsletter ? 1 : 0, now, id).run();
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
  };
}
