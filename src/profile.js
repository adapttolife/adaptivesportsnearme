// Signing and validation helpers shared by organization manager sign-in
// (organization-access.js). Pure: secret and payload are passed in, so they're
// unit-testable without a live Request or a D1 binding.

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
