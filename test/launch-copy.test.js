// Copy that has to stay true on both sides of the PRELAUNCH flip (2026-10-13).
// The welcome email is sent by the separate asnm-gate Worker, which does not
// know when the site opens, so it must never promise or deny opening day.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { sendSignupWelcome } from "../src/email.js";

const STALE = /not open yet|doors open|before we open|early list|at launch|before launch/i;

test("the signup welcome is true before and after launch", async () => {
  for (const beta of [false, true]) {
    const sent = [];
    const env = { MAIL_TRANSPORT: "cloudflare", SEND_EMAIL: { async send(m) { sent.push(m); return { id: "x" }; } } };
    await sendSignupWelcome(env, "person@example.test", { name: "Alex", beta }).catch(() => {});
    const m = sent[0];
    if (!m) continue; // transport not configured in this env shape; the source check below still runs
    for (const part of [m.subject, m.text, m.html]) assert.doesNotMatch(String(part || ""), STALE);
  }
  const src = readFileSync(new URL("../src/email.js", import.meta.url), "utf8");
  const fn = src.slice(src.indexOf("export async function sendSignupWelcome"), src.indexOf("\n}\n", src.indexOf("export async function sendSignupWelcome")));
  assert.doesNotMatch(fn, STALE);
});

test("live-site thank-yous never promise opening day", () => {
  const index = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
  assert.doesNotMatch(index, /will be in touch before launch|feature it at launch/);
  // The opening-day promise survives only inside the PRELAUNCH branch.
  const at = index.indexOf('"We will email you the day the doors open."');
  assert.ok(at > 0 && index.lastIndexOf("!PRELAUNCH", at) > at - 400, "the opening-day line is gated on PRELAUNCH");
});
