import { geocodeAddress } from "./address-geocode.js";
import { parseCookieHeader, signProfileId, verifyProfileCookie, validState } from "./profile.js";

export const ORG_COOKIE_NAME = "asnm_org";
const SESSION_SECONDS = 60 * 60 * 24 * 30;
const TOKEN_MINUTES = 15;
const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const STATE_NAMES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado",
  CT: "Connecticut", DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts",
  MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
  NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

const now = () => new Date().toISOString();
const future = (ms) => new Date(Date.now() + ms).toISOString();
const clean = (value, length = 5000) => String(value == null ? "" : value).trim().slice(0, length);

function base64Url(bytes) {
  let text = "";
  for (const byte of bytes) text += String.fromCharCode(byte);
  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function validEmail(value) {
  const email = clean(value, 320).toLowerCase();
  return EMAIL_RE.test(email) ? email : "";
}

export async function hashToken(token) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return base64Url(new Uint8Array(digest));
}

export function newLoginToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

export function serializeOrgCookie(id, signature, maxAge = SESSION_SECONDS) {
  return `${ORG_COOKIE_NAME}=${id}.${signature}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export function clearOrgCookie() {
  return `${ORG_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export async function readOrganizationSession(request, db, secret) {
  const value = parseCookieHeader(request.headers.get("Cookie"), ORG_COOKIE_NAME);
  const id = await verifyProfileCookie(value, secret);
  if (!id || !ID_RE.test(id)) return null;
  const session = await db.prepare(
    `SELECT email FROM organization_sessions WHERE id = ? AND revoked_at IS NULL AND expires_at > ?`
  ).bind(id, now()).first();
  return session?.email ? { id, email: String(session.email).toLowerCase() } : null;
}

export async function issueLoginToken(db, email) {
  const token = newLoginToken();
  const id = crypto.randomUUID();
  const createdAt = now();
  await db.prepare(
    `INSERT INTO organization_login_tokens (id, token_hash, email, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(id, await hashToken(token), email, future(TOKEN_MINUTES * 60 * 1000), createdAt).run();
  return token;
}

export async function consumeLoginToken(db, token) {
  if (!token || token.length > 500) return null;
  const hash = await hashToken(token);
  const record = await db.prepare(
    `SELECT id, email FROM organization_login_tokens
     WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?`
  ).bind(hash, now()).first();
  if (!record) return null;
  const result = await db.prepare(
    `UPDATE organization_login_tokens SET used_at = ? WHERE id = ? AND used_at IS NULL`
  ).bind(now(), record.id).run();
  if (!Number(result?.meta?.changes ?? result?.meta?.rows_written ?? 0)) return null;
  return String(record.email).toLowerCase();
}

export async function createOrganizationSession(db, email, secret) {
  const id = crypto.randomUUID();
  await db.prepare(
    `INSERT INTO organization_sessions (id, email, expires_at, created_at) VALUES (?, ?, ?, ?)`
  ).bind(id, email, future(SESSION_SECONDS * 1000), now()).run();
  return { id, signature: await signProfileId(id, secret) };
}

const EDIT_COLUMNS = [
  "name", "org_type", "sport", "sport_key", "sports_json", "website_url", "email", "phone",
  "city", "state", "state_name", "zip", "country", "description", "cost_note", "equipment_provided",
  "ages", "publicity_consent", "address_publicity_consent", "is_public", "address", "lat", "lng", "geo_precision",
];

export async function organizationsForClaimEmail(db, email) {
  const { results } = await db.prepare(
    `SELECT id, name, org_type, sport, sport_key, sports_json, website_url, email, phone, city, state,
            state_name, zip, country, description, cost_note, equipment_provided, ages, publicity_consent, address_publicity_consent,
            is_public, address, lat, lng, geo_precision
     FROM organizations WHERE claim_email = ? COLLATE NOCASE ORDER BY name COLLATE NOCASE`
  ).bind(email).all();
  return results;
}

export async function organizationForClaimEmail(db, id, email) {
  if (!ID_RE.test(id)) return null;
  return db.prepare(
    `SELECT id, name, org_type, sport, sport_key, sports_json, website_url, email, phone, city, state,
            state_name, zip, country, description, cost_note, equipment_provided, ages, publicity_consent, address_publicity_consent,
            is_public, address, lat, lng, geo_precision
     FROM organizations WHERE id = ? AND claim_email = ? COLLATE NOCASE`
  ).bind(id, email).first();
}

export async function updateClaimedOrganization(db, id, email, input) {
  const existing = await organizationForClaimEmail(db, id, email);
  if (!existing) return null;
  const supplied = (key) => Object.prototype.hasOwnProperty.call(input, key);
  const text = (key, length) => supplied(key) ? clean(input[key], length) : clean(existing[key], length);
  const state = validState(supplied("state") ? input.state : existing.state);
  const boolean = (key, current) => {
    if (!supplied(key)) return current == null ? null : Number(current) ? 1 : 0;
    return [true, 1, "1", "true", "yes"].includes(input[key]) ? 1 : [false, 0, "0", "false", "no"].includes(input[key]) ? 0 : null;
  };
  const value = {
    name: text("name", 200),
    org_type: text("org_type", 100),
    sport: text("sport", 120),
    sport_key: text("sport_key", 80).toLowerCase(),
    sports_json: text("sports_json", 4000),
    website_url: text("website_url", 500),
    email: validEmail(supplied("email") ? input.email : existing.email),
    phone: text("phone", 80),
    city: text("city", 120),
    state,
    state_name: STATE_NAMES[state] || "",
    zip: text("zip", 20),
    country: text("country", 120) || "United States",
    address: text("address", 500),
    description: text("description", 5000),
    cost_note: text("cost_note", 1000),
    equipment_provided: boolean("equipment_provided", existing.equipment_provided),
    ages: text("ages", 300),
    publicity_consent: boolean("publicity_consent", existing.publicity_consent) || 0,
    address_publicity_consent: boolean("address_publicity_consent", existing.address_publicity_consent) || 0,
    is_public: boolean("is_public", existing.is_public) || 0,
    lat: existing.lat == null ? null : Number(existing.lat),
    lng: existing.lng == null ? null : Number(existing.lng),
    geo_precision: existing.geo_precision || null,
  };
  if (!value.name) throw new Error("name-required");
  if (value.website_url) {
    try { const url = new URL(value.website_url); if (!/^https?:$/.test(url.protocol)) throw new Error(); }
    catch { throw new Error("website-invalid"); }
  }
  if (supplied("email") && clean(input.email) && !value.email) throw new Error("email-invalid");
  if (value.sports_json) {
    try { if (!Array.isArray(JSON.parse(value.sports_json))) throw new Error(); }
    catch { throw new Error("sports-invalid"); }
  }
  const locationChanged = ["address", "city", "state", "zip", "country"]
    .some((key) => String(existing[key] ?? "") !== String(value[key] ?? ""));
  if (locationChanged) {
    if (!value.address) {
      value.lat = null;
      value.lng = null;
      value.geo_precision = null;
    } else {
      const locality = [value.city, value.state, value.zip].filter(Boolean).join(" ");
      const point = await geocodeAddress([value.address, locality, value.country].filter(Boolean).join(", "));
      if (!point) throw new Error("address-not-found");
      Object.assign(value, point);
    }
  }
  const changed = EDIT_COLUMNS.some((column) => String(existing[column] ?? "") !== String(value[column] ?? ""));
  if (!changed) return existing;
  await db.prepare(
    `UPDATE organizations SET name = ?, org_type = ?, sport = ?, sport_key = ?, sports_json = ?, website_url = ?,
     email = ?, phone = ?, city = ?, state = ?, state_name = ?, zip = ?, country = ?, address = ?, description = ?, cost_note = ?,
     equipment_provided = ?, ages = ?, publicity_consent = ?, address_publicity_consent = ?, is_public = ?, lat = ?, lng = ?, geo_precision = ?, updated_at = ? WHERE id = ? AND claim_email = ? COLLATE NOCASE`
  ).bind(value.name, value.org_type || null, value.sport || null, value.sport_key || null, value.sports_json || null,
    value.website_url || null, value.email || null, value.phone || null, value.city || null, value.state || null,
    value.state_name || null, value.zip || null, value.country, value.address || null, value.description || null, value.cost_note || null,
    value.equipment_provided, value.ages || null, value.publicity_consent, value.address_publicity_consent, value.is_public, value.lat, value.lng,
    value.geo_precision, now(), id, email).run();
  return organizationForClaimEmail(db, id, email);
}
