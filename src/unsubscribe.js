// Leaving the Adaptive Sports Near Me list: the signed link in every list email,
// the one click List-Unsubscribe header, and the brand Topic behind both.
//
// One Resend team holds the contacts for adapttolife.org, this site and
// alectranel.com, and Resend's `unsubscribed` flag is team wide: setting it would
// silently take someone off every brand's list. So this code never writes that
// flag. Leaving ASNM opts the contact out of the ASNM Topic (RESEND_TOPIC_ID,
// "Adaptive Sports Near Me news") and nothing else. (docs/EMAIL.md in
// adapt-to-life, "Contacts, lists and unsubscribing".)
//
// Links are signed with NEWSLETTER_LINK_SECRET, never the Resend key, so
// rotating the key never breaks a link already sent. The signed token carries
// the brand, so an ASNM link can only ever leave the ASNM list.
import { mailAllowed } from "./mail-transport.js";
import { recordSendFailure } from "./mail-ledger.js";

const RESEND_API = "https://api.resend.com";
const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const encoder = new TextEncoder();
const TOKEN_CONTEXT = "newsletter-unsubscribe:v1:";
export const LIST_BRAND = "asnm";

// Anything that is not a Resend id counts as unset (and leaving then fails
// loudly rather than touching anything else).
export function newsletterTopicId(env) {
  const id = String(env?.RESEND_TOPIC_ID || "").trim();
  return ID_RE.test(id) ? id : null;
}

const b64url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
function fromB64url(value) {
  const s = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(s + "===".slice((s.length + 3) % 4)), (c) =>
    c.charCodeAt(0),
  );
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

const normal = (email) => String(email || "").trim().toLowerCase();

// What the token signs: the brand and the address.
const signed = (brand, email) => encoder.encode(`${TOKEN_CONTEXT}${brand}:${normal(email)}`);

export async function unsubscribeToken(env, email, brand = LIST_BRAND) {
  if (!env?.NEWSLETTER_LINK_SECRET) throw new Error("NEWSLETTER_LINK_SECRET is not set");
  const key = await hmacKey(env.NEWSLETTER_LINK_SECRET);
  return b64url(await crypto.subtle.sign("HMAC", key, signed(brand, email)));
}

export async function unsubscribeUrl(env, origin, email) {
  const url = new URL("/unsubscribe", origin);
  url.searchParams.set("b", LIST_BRAND);
  url.searchParams.set("e", b64url(encoder.encode(normal(email))));
  url.searchParams.set("t", await unsubscribeToken(env, email));
  return url.toString();
}

// Returns the address the link was made for, or null. Constant time (HMAC
// verify). Only a link signed for this brand passes.
export async function verifyUnsubscribe(env, e, t, brand = LIST_BRAND) {
  if (brand !== LIST_BRAND) return null;
  if (!env?.NEWSLETTER_LINK_SECRET || !e || !t) return null;
  if (String(e).length > 600 || String(t).length > 100) return null;
  try {
    const email = new TextDecoder().decode(fromB64url(e));
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return null;
    const key = await hmacKey(env.NEWSLETTER_LINK_SECRET);
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      fromB64url(t),
      signed(brand, email),
    );
    return ok ? normal(email) : null;
  } catch {
    return null;
  }
}

// List-Unsubscribe headers for one list email (RFC 8058 one click).
export function listUnsubscribeHeaders(link) {
  return {
    "List-Unsubscribe": `<${link}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

function resendHeaders(env) {
  return {
    Authorization: `Bearer ${env.RESEND_API_KEY}`,
    "Content-Type": "application/json",
  };
}

// opt_in or opt_out on the ASNM Topic only. Throws when the Topic or key is not
// configured, or Resend refuses.
export async function setNewsletterTopic(env, email, subscription) {
  const topic = newsletterTopicId(env);
  if (!topic) throw new Error("RESEND_TOPIC_ID is not a Resend Topic id");
  if (!env.RESEND_API_KEY) throw new Error("Resend is not configured");
  const response = await fetch(
    `${RESEND_API}/contacts/${encodeURIComponent(normal(email))}/topics`,
    {
      method: "PATCH",
      headers: resendHeaders(env),
      body: JSON.stringify([{ id: topic, subscription }]),
      signal: AbortSignal.timeout(10000),
    },
  );
  // No contact means nothing to opt out of.
  if (response.status === 404 && subscription === "opt_out") return true;
  if (!response.ok) throw new Error(`Resend topic update refused (${response.status})`);
  return true;
}

// Takes one address off the ASNM list, and nothing else. Never the team wide flag.
export async function leaveNewsletter(env, email) {
  await setNewsletterTopic(env, email, "opt_out");
}

// Joining a brand is a yes to that brand. Someone who once unsubscribed from
// everything has the team wide flag set, which would block this brand too; it
// is cleared on joining. Safe because every brand Topic is opt_out: clearing it
// only re-opens mail from Topics they have each said yes to.
export async function clearTeamUnsubscribe(env, email) {
  if (!env.RESEND_API_KEY) throw new Error("Resend is not configured");
  const response = await fetch(`${RESEND_API}/contacts/${encodeURIComponent(normal(email))}`, {
    method: "PATCH",
    headers: resendHeaders(env),
    body: JSON.stringify({ unsubscribed: false }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Resend contact update refused (${response.status})`);
}

const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

function page(title, bodyHtml, status = 200) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width, initial-scale=1">` +
      `<meta name="robots" content="noindex"><title>${esc(title)} · Adaptive Sports Near Me</title>` +
      `<style>:root{color-scheme:light dark;--bg:#fbfaf7;--fg:#1c1a15;--muted:#5b5b60;--btn:#1c1a15;--btnfg:#fff}` +
      `@media (prefers-color-scheme:dark){:root{--bg:#141310;--fg:#f3f1ea;--muted:#c4c2bb;--btn:#f3f1ea;--btnfg:#141310}}` +
      `body{margin:0;background:var(--bg);color:var(--fg);font:18px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}` +
      `main{max-width:560px;margin:0 auto;padding:48px 16px}h1{font-size:28px;line-height:1.25;margin:0 0 16px}` +
      `p{margin:0 0 16px}.muted{color:var(--muted);font-size:16px}a{color:inherit}` +
      `button{font:inherit;font-weight:600;background:var(--btn);color:var(--btnfg);border:0;border-radius:999px;padding:12px 24px;min-height:48px;cursor:pointer}` +
      `button:focus-visible,a:focus-visible{outline:3px solid #2f6fde;outline-offset:3px}</style></head>` +
      `<body><main>${bodyHtml}<p class="muted"><a href="/">Adaptive Sports Near Me</a></p></main></body></html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex",
        "Referrer-Policy": "no-referrer",
      },
    },
  );
}

const BAD_LINK = () =>
  page(
    "This link does not work",
    `<h1>This link does not work</h1><p>It may have been cut short when it was copied. ` +
      `Use the unsubscribe link in the newest email from us, or reply to any of our emails and a person will take you off the list.</p>`,
    400,
  );

// GET shows a button (a mail scanner opening the link changes nothing); POST
// does it. Mail clients' one click unsubscribe POSTs to the same address with
// List-Unsubscribe=One-Click in the body.
export async function handleUnsubscribe(request, env, url) {
  if (!["GET", "HEAD", "POST"].includes(request.method))
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, POST" } });
  const b = url.searchParams.get("b");
  const e = url.searchParams.get("e");
  const t = url.searchParams.get("t");
  const email = await verifyUnsubscribe(env, e, t, b);
  if (!email) return BAD_LINK();

  if (request.method !== "POST") {
    const action = `/unsubscribe?b=${encodeURIComponent(b)}&e=${encodeURIComponent(e)}&t=${encodeURIComponent(t)}`;
    return page(
      "Unsubscribe",
      `<h1>Stop the Adaptive Sports Near Me emails?</h1>` +
        `<p>We'll stop sending news from Adaptive Sports Near Me to <strong>${esc(email)}</strong>. ` +
        `Sign-in links and receipts for things you do on the site still come.</p>` +
        `<form method="post" action="${esc(action)}"><button type="submit">Unsubscribe</button></form>`,
    );
  }

  // Staging and preview never touch the real list for anyone outside the team.
  if (!mailAllowed(env, email)) {
    console.log("Unsubscribe skipped outside production", { env: env.ENV_NAME });
    return page(
      "Test site",
      `<h1>This is the test site</h1><p>Nothing changed. Use the link in an email from adaptivesportsnearme.com.</p>`,
    );
  }
  try {
    await leaveNewsletter(env, email);
  } catch (err) {
    await recordSendFailure(env, "asnm-unsubscribe", email, err);
    console.error("Unsubscribe failed", { reason: String(err?.message || "").slice(0, 120) });
    return page(
      "Try again",
      `<h1>We couldn't do that just now</h1><p>Please try the link again in a few minutes, ` +
        `or reply to any of our emails and a person will take you off the list.</p>`,
      503,
    );
  }
  // Keep the profile's newsletter switch honest. Best effort: the list is what counts.
  if (env.DB) {
    try {
      await env.DB.prepare(
        "UPDATE profiles SET newsletter = 0, updated_at = ? WHERE email = ? COLLATE NOCASE AND newsletter <> 0",
      )
        .bind(new Date().toISOString(), email)
        .run();
    } catch {}
  }
  return page(
    "You're unsubscribed",
    `<h1>You're unsubscribed</h1><p>We won't send Adaptive Sports Near Me news to <strong>${esc(email)}</strong> again. ` +
      `Changed your mind? Sign up again any time on the site.</p>`,
  );
}
