// signing + validation tests for organization manager sign-in — pure functions only, no D1/Request mocking.
import test from "node:test";
import assert from "node:assert/strict";
import {
  signProfileId, verifyProfileCookie, parseCookieHeader, validState,
} from "../src/profile.js";

const SECRET = "test-signing-key-do-not-use-in-prod";
const ID = "b6f2a1c4-1111-4a22-9c33-abcdefabcdef";
const NAME = "session";

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

// ---- cookie header parsing ------------------------------------------------------

test("parseCookieHeader: finds the named cookie among several", () => {
  const header = `other=1; ${NAME}=abc.def; third=xyz`;
  assert.equal(parseCookieHeader(header, NAME), "abc.def");
});

test("parseCookieHeader: returns null when the cookie is absent or header is empty", () => {
  assert.equal(parseCookieHeader("other=1", NAME), null);
  assert.equal(parseCookieHeader("", NAME), null);
  assert.equal(parseCookieHeader(null, NAME), null);
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
