// profile cookie + validation tests (Lane B) — pure functions only, no D1/Request mocking.
import test from "node:test";
import assert from "node:assert/strict";
import {
  signProfileId, verifyProfileCookie, serializeProfileCookie, clearProfileCookie,
  parseCookieHeader, validState, parseSports, COOKIE_NAME,
} from "../src/profile.js";

const SECRET = "test-signing-key-do-not-use-in-prod";
const ID = "b6f2a1c4-1111-4a22-9c33-abcdefabcdef";

// ---- signProfileId / verifyProfileCookie --------------------------------------

test("signProfileId: deterministic for the same (id, secret)", async () => {
  const a = await signProfileId(ID, SECRET);
  const b = await signProfileId(ID, SECRET);
  assert.equal(a, b);
});

test("signProfileId: base64url shape — no +, /, or = padding", async () => {
  const sig = await signProfileId(ID, SECRET);
  assert.match(sig, /^[A-Za-z0-9_-]+$/);
  assert.ok(!sig.includes("+"));
  assert.ok(!sig.includes("/"));
  assert.ok(!sig.includes("="));
});

test("verifyProfileCookie: roundtrip — sign then verify returns the original id", async () => {
  const sig = await signProfileId(ID, SECRET);
  const cookie = `${ID}.${sig}`;
  const verified = await verifyProfileCookie(cookie, SECRET);
  assert.equal(verified, ID);
});

test("verifyProfileCookie: rejects a tampered id (signature no longer matches)", async () => {
  const sig = await signProfileId(ID, SECRET);
  const tampered = `${ID}-evil.${sig}`;
  const verified = await verifyProfileCookie(tampered, SECRET);
  assert.equal(verified, null);
});

test("verifyProfileCookie: rejects a tampered signature", async () => {
  const sig = await signProfileId(ID, SECRET);
  const flipped = sig.slice(0, -1) + (sig.slice(-1) === "a" ? "b" : "a");
  const verified = await verifyProfileCookie(`${ID}.${flipped}`, SECRET);
  assert.equal(verified, null);
});

test("verifyProfileCookie: rejects a cookie signed with a different secret", async () => {
  const sig = await signProfileId(ID, "some-other-secret");
  const verified = await verifyProfileCookie(`${ID}.${sig}`, SECRET);
  assert.equal(verified, null);
});

test("verifyProfileCookie: rejects garbage input — empty, null, no dot, non-base64url signature", async () => {
  assert.equal(await verifyProfileCookie("", SECRET), null);
  assert.equal(await verifyProfileCookie(null, SECRET), null);
  assert.equal(await verifyProfileCookie(undefined, SECRET), null);
  assert.equal(await verifyProfileCookie("no-dot-here", SECRET), null);
  assert.equal(await verifyProfileCookie(`${ID}.`, SECRET), null);
  assert.equal(await verifyProfileCookie(`.sigonly`, SECRET), null);
  assert.equal(await verifyProfileCookie(`${ID}.not base64url!!`, SECRET), null);
});

// ---- cookie serialization ------------------------------------------------------

test("serializeProfileCookie: carries the right name, value shape, and flags", () => {
  const out = serializeProfileCookie(ID, "sig123");
  assert.match(out, new RegExp(`^${COOKIE_NAME}=${ID}\\.sig123;`));
  assert.match(out, /HttpOnly/);
  assert.match(out, /Secure/);
  assert.match(out, /SameSite=Lax/);
  assert.match(out, /Path=\//);
  assert.match(out, /Max-Age=31536000/);
});

test("clearProfileCookie: Max-Age=0, same flags, empty value", () => {
  const out = clearProfileCookie();
  assert.match(out, new RegExp(`^${COOKIE_NAME}=;`));
  assert.match(out, /Max-Age=0/);
  assert.match(out, /HttpOnly/);
});

// ---- parseCookieHeader ----------------------------------------------------------

test("parseCookieHeader: finds the named cookie among several", () => {
  const header = `other=1; ${COOKIE_NAME}=abc.def; third=xyz`;
  assert.equal(parseCookieHeader(header, COOKIE_NAME), "abc.def");
});

test("parseCookieHeader: returns null when the cookie is absent or header is empty", () => {
  assert.equal(parseCookieHeader("other=1", COOKIE_NAME), null);
  assert.equal(parseCookieHeader("", COOKIE_NAME), null);
  assert.equal(parseCookieHeader(null, COOKIE_NAME), null);
});

// ---- validState -----------------------------------------------------------------

test("validState: accepts a known USPS code, case-insensitive, trims whitespace", () => {
  assert.equal(validState("CO"), "CO");
  assert.equal(validState("co"), "CO");
  assert.equal(validState("  Co  "), "CO");
});

test("validState: clamps unknown/garbage values to empty string, never throws", () => {
  assert.equal(validState("ZZ"), "");
  assert.equal(validState("Colorado"), "");
  assert.equal(validState(""), "");
  assert.equal(validState(null), "");
  assert.equal(validState(undefined), "");
  assert.equal(validState(42), "");
});

// ---- parseSports ------------------------------------------------------------------

const VALID_KEYS = new Set(["basketball", "tennis", "sledhockey"]);

test("parseSports: accepts a CSV string, lowercases, trims", () => {
  assert.deepEqual(parseSports(" Basketball, TENNIS ,sledhockey", VALID_KEYS), ["basketball", "tennis", "sledhockey"]);
});

test("parseSports: accepts an array input the same way", () => {
  assert.deepEqual(parseSports(["basketball", "TENNIS"], VALID_KEYS), ["basketball", "tennis"]);
});

test("parseSports: dedupes repeated keys", () => {
  assert.deepEqual(parseSports("basketball,basketball,tennis", VALID_KEYS), ["basketball", "tennis"]);
});

test("parseSports: drops anything not matching [a-z]+ (numbers, symbols, spaces-only)", () => {
  assert.deepEqual(parseSports("basketball,sport2,sled hockey,,  ", VALID_KEYS), ["basketball"]);
});

test("parseSports: with a validKeys set, drops keys outside the known taxonomy", () => {
  assert.deepEqual(parseSports("basketball,curling", VALID_KEYS), ["basketball"]);
});

test("parseSports: without a validKeys set, keeps any well-shaped key (clamp-only mode)", () => {
  assert.deepEqual(parseSports("basketball,curling"), ["basketball", "curling"]);
});

test("parseSports: empty/null input returns an empty array, never throws", () => {
  assert.deepEqual(parseSports("", VALID_KEYS), []);
  assert.deepEqual(parseSports(null, VALID_KEYS), []);
  assert.deepEqual(parseSports(undefined, VALID_KEYS), []);
  assert.deepEqual(parseSports([], VALID_KEYS), []);
});
