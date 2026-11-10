import { hashToken, newLoginToken, validEmail } from "./organization-access.js";
import {
  parseCookieHeader,
  signProfileId,
  verifyProfileCookie,
} from "./profile.js";
import { isAdminEmail } from "./admin-access.js";

export const BETA_COOKIE_NAME = "asnm_beta";
const SESSION_SECONDS = 60 * 60 * 24 * 30;
export const TOKEN_SECONDS = 60 * 30;
const now = () => new Date().toISOString();
const future = (seconds) => new Date(Date.now() + seconds * 1000).toISOString();

export function betaAuthSecret(env) {
  return (
    env.BETA_AUTH_SIGNING_KEY ||
    env.ADMIN_AUTH_SIGNING_KEY ||
    env.PROFILE_SIGNING_KEY
  );
}

export function betaAuthReady(env) {
  return !!(env.DB && betaAuthSecret(env));
}

export function serializeBetaCookie(id, signature, maxAge = SESSION_SECONDS) {
  return `${BETA_COOKIE_NAME}=${id}.${signature}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export function clearBetaCookie() {
  return `${BETA_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export async function issueBetaLoginToken(db, email) {
  const token = newLoginToken();
  await db
    .prepare(
      `INSERT INTO beta_login_tokens (id, token_hash, email, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      await hashToken(token),
      email,
      future(TOKEN_SECONDS),
      now(),
    )
    .run();
  return token;
}

// Read only check used by the GET confirm page. It never marks the token used,
// so a mail scanner that only follows links cannot burn a tester's link.
export async function peekBetaLoginToken(db, token) {
  if (!token || token.length > 500) return null;
  const row = await db
    .prepare(
      `SELECT email FROM beta_login_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?`,
    )
    .bind(await hashToken(token), now())
    .first();
  return validEmail(row?.email) || null;
}

export async function consumeBetaLoginToken(db, token) {
  if (!token || token.length > 500) return null;
  const row = await db
    .prepare(
      `SELECT id, email FROM beta_login_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?`,
    )
    .bind(await hashToken(token), now())
    .first();
  const email = validEmail(row?.email);
  if (!row || !email) return null;
  const changed = await db
    .prepare(
      `UPDATE beta_login_tokens SET used_at = ? WHERE id = ? AND used_at IS NULL`,
    )
    .bind(now(), row.id)
    .run();
  return Number(changed?.meta?.changes || 0) ? email : null;
}

export async function isBetaTester(db, email) {
  const valid = validEmail(email);
  if (!valid) return false;
  if (isAdminEmail(valid)) return true;
  const row = await db
    .prepare(
      `SELECT email FROM beta_testers WHERE email = ? COLLATE NOCASE AND enabled = 1`,
    )
    .bind(valid)
    .first();
  return !!row;
}

export async function createBetaSession(db, email, secret) {
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO beta_sessions (id, email, expires_at, created_at) VALUES (?, ?, ?, ?)`,
    )
    .bind(id, email, future(SESSION_SECONDS), now())
    .run();
  return { id, signature: await signProfileId(id, secret) };
}

export async function readBetaSession(request, db, secret) {
  const raw = parseCookieHeader(
    request.headers.get("Cookie"),
    BETA_COOKIE_NAME,
  );
  const id = await verifyProfileCookie(raw, secret);
  if (!id) return null;
  const row = await db
    .prepare(
      `SELECT email FROM beta_sessions WHERE id = ? AND revoked_at IS NULL AND expires_at > ?`,
    )
    .bind(id, now())
    .first();
  return row && (await isBetaTester(db, row.email))
    ? { id, email: row.email }
    : null;
}

export async function listBetaTesters(db) {
  const { results } = await db
    .prepare(
      `SELECT email, name, organization, phone, enabled, created_at, updated_at
       FROM beta_testers
       ORDER BY email COLLATE NOCASE`,
    )
    .all();
  return results || [];
}

function detailsForBetaTester(details) {
  if (!details || typeof details !== "object") return null;
  const name = String(details.name || "").trim();
  if (!name) throw new Error("name-required");
  if (name.length > 160) throw new Error("name-invalid");
  const organization = String(details.organization || "").trim();
  const phone = String(details.phone || "").trim();
  if (organization.length > 240 || phone.length > 60)
    throw new Error("details-invalid");
  return { name, organization: organization || null, phone: phone || null };
}

export async function setBetaTester(db, email, enabled = true, details = null) {
  const valid = validEmail(email);
  if (!valid) throw new Error("email-invalid");
  const timestamp = now();
  const cleaned = detailsForBetaTester(details);
  if (cleaned) {
    await db
      .prepare(
        `INSERT INTO beta_testers (email, name, organization, phone, enabled, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(email) DO UPDATE SET
           name = excluded.name,
           organization = excluded.organization,
           phone = excluded.phone,
           enabled = excluded.enabled,
           updated_at = excluded.updated_at`,
      )
      .bind(
        valid,
        cleaned.name,
        cleaned.organization,
        cleaned.phone,
        enabled ? 1 : 0,
        timestamp,
        timestamp,
      )
      .run();
  } else {
    await db
      .prepare(
        `INSERT INTO beta_testers (email, enabled, created_at, updated_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(email) DO UPDATE SET enabled = excluded.enabled, updated_at = excluded.updated_at`,
      )
      .bind(valid, enabled ? 1 : 0, timestamp, timestamp)
      .run();
  }
  return db
    .prepare(
      `SELECT email, name, organization, phone, enabled, created_at, updated_at
       FROM beta_testers
       WHERE email = ? COLLATE NOCASE`,
    )
    .bind(valid)
    .first();
}
