import { mailConfigured, sendMail } from "./mail-transport.js";
import { recordSendFailure } from "./mail-ledger.js";
import { listUnsubscribeHeaders } from "./unsubscribe.js";
// Transactional and list mail through the one selected transport
// (src/mail-transport.js, MAIL_TRANSPORT). Every send carries a stable
// idempotency key and brand/kind tags (docs/EMAIL.md in adapt-to-life).
//
// Sites send from the brand's mail. subdomain (Resend); people answer hello@ in
// Workspace. MAIL_FROM overrides the sender per Worker, so falling back to the
// Gmail transport is a config change: MAIL_TRANSPORT=gmail with
// MAIL_FROM=hello@adaptivesportsnearme.com.
export const HOUSE_FROM =
  "Adaptive Sports Near Me <hello@mail.adaptivesportsnearme.com>";
export const HOUSE_REPLY = "hello@adaptivesportsnearme.com";
export const BRAND = "asnm";
export const POSTAL_ADDRESS =
  "Adapt To Life NFP, 1509 N Milwaukee Ave, Libertyville, IL 60048";

export const houseFrom = (env) => (env && env.MAIL_FROM) || HOUSE_FROM;
// The bare address of the house sender, for senders that use another display name.
export const houseAddress = (env) =>
  (houseFrom(env).match(/<([^<>]+)>\s*$/)?.[1] || houseFrom(env)).trim();

// Short, stable digest for idempotency keys: never puts an address or a
// sign-in token into a key Resend stores.
export async function keyDigest(value) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(String(value)),
  );
  return Array.from(new Uint8Array(bytes).slice(0, 16), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

export async function cfSend(env, message) {
  return sendMail(env, message);
}

// One house send. A dropped send (staging, address not on MAIL_ALLOW) counts as
// done and not sent, so callers never report it as a failure.
async function houseSend(env, kind, idempotencyKey, message) {
  return sendMail(env, {
    from: houseFrom(env),
    replyTo: HOUSE_REPLY,
    ...message,
    idempotencyKey,
    tags: { brand: BRAND, kind },
  });
}

// A sign-in link's key is the digest of the link itself: the link carries a
// fresh one-time token, so each request is its own email, and a retry of the
// same request can never send it twice. (A key per address per time window
// would make Resend refuse the second request's new link with a 409, and the
// newer nonce cookie makes the first link unusable.) The per-address limit
// lives with the token tables: src/signin-limit.js.
async function sendSignInLink(env, kind, email, link, subject, text, html) {
  return houseSend(env, kind, `${kind}:${await keyDigest(link)}`, {
    to: email,
    subject,
    text,
    html,
  });
}

export async function sendOrganizationLoginLink(env, email, link) {
  const subject = "Your Adaptive Sports Near Me sign-in link";
  const text = `Use this link to manage your organization's listing:\n\n${link}\n\nThis link expires in 15 minutes and can be used once. If you did not request it, you can ignore this email.`;
  const html = shell(
    `<p>Use this link to manage your organization's listing:</p><p><a href="${esc(link)}">Manage your listing</a></p><p>This link expires in 15 minutes and can be used once. If you did not request it, you can ignore this email.</p>`,
  );
  return sendSignInLink(env, "signin-organization", email, link, subject, text, html);
}

export async function sendAdminLoginLink(env, email, link) {
  const subject = "Your Adaptive Sports Near Me admin sign-in link";
  const text = `Use this link to access the Adaptive Sports Near Me admin dashboard:\n\n${link}\n\nThis link expires in 15 minutes and can be used once. If you did not request it, you can ignore this email.`;
  const html = shell(
    `<p>Use this link to access the Adaptive Sports Near Me admin dashboard:</p><p><a href="${esc(link)}">Open the admin dashboard</a></p><p>This link expires in 15 minutes and can be used once. If you did not request it, you can ignore this email.</p>`,
  );
  return sendSignInLink(env, "signin-admin", email, link, subject, text, html);
}

export async function sendBetaLoginLink(env, email, link) {
  const subject = "Your Adaptive Sports Near Me beta sign-in link";
  const text = `Use this link to access the Adaptive Sports Near Me beta:\n\n${link}\n\nThis link expires in 30 minutes and can be used once. If you did not request it, you can ignore this email.`;
  const html = shell(
    `<p>Use this link to access the Adaptive Sports Near Me beta:</p><p><a href="${esc(link)}">Open the beta</a></p><p>This link expires in 30 minutes and can be used once. If you did not request it, you can ignore this email.</p>`,
  );
  return sendSignInLink(env, "signin-beta", email, link, subject, text, html);
}

export async function sendBetaTesterInvitation(env, email, name, siteUrl) {
  const subject = "You are invited to the Adaptive Sports Near Me beta";
  const greeting = `Hi ${name},`;
  const text = `${greeting}\n\nYou have been added to the Adaptive Sports Near Me beta. Visit the website to get started:\n\n${siteUrl}\n\nWhen the beta sign-in form asks for your email address, use:\n${email}\n\nWe will send a one-time sign-in link to that address.`;
  const html = shell(
    `<p>${esc(greeting)}</p><p>You have been added to the Adaptive Sports Near Me beta.</p><p><a href="${esc(siteUrl)}">Visit Adaptive Sports Near Me</a></p><p>When the beta sign-in form asks for your email address, use:</p><p><strong>${esc(email)}</strong></p><p>We will send a one-time sign-in link to that address.</p>`,
  );
  // One invitation per tester: a retry, or a second click on Add, within a day
  // returns the first send instead of mailing again.
  return houseSend(env, "beta-invite", `invite:${await keyDigest(email.toLowerCase())}`, {
    to: email,
    subject,
    text,
    html,
  });
}

export async function sendProfileLoginLink(env, email, link) {
  const subject = "Your Adaptive Sports Near Me sign-in link";
  const text = `Use this link to open your saved items:\n\n${link}\n\nThis link expires in 15 minutes and can be used once. If you did not request it, you can ignore this email.`;
  const html = shell(
    `<p>Use this link to open your saved items:</p><p><a href="${esc(link)}">Open your saved items</a></p><p>This link expires in 15 minutes and can be used once. If you did not request it, you can ignore this email.</p>`,
  );
  return sendSignInLink(env, "signin-profile", email, link, subject, text, html);
}

// Called only after the form's primary save succeeds. `key` names this one
// submission (the intake id, or the profile and what changed), so the same
// confirmation is never mailed twice. A retryable refusal (429, 5xx, timeout)
// is tried once more under the same key, which Resend dedupes; anything else
// that does not go out is written to send_failures, where the alert reads it.
export async function queueFormConfirmation(
  env,
  ctx,
  { kind, email, program, key },
) {
  const route = `asnm-confirm-${kind}`;
  const job = (async () => {
    try {
      if (!mailConfigured(env)) {
        console.error("Form confirmation unavailable", {
          kind,
          reason: "mail-not-configured",
        });
        await recordSendFailure(env, route, email, "Mail transport is not configured");
        return;
      }
      const subject =
        kind === "program"
          ? "We received your program submission"
          : kind === "organization"
            ? "We received your organization submission"
            : kind === "listing-update"
              ? "We received your suggested update"
              : kind === "event"
                ? "We received your event"
                : kind === "profile-created"
                  ? "Your ASNM profile is ready"
                  : "Your ASNM profile was updated";
      const body =
        kind === "program"
          ? `Thank you for submitting ${program} to Adaptive Sports Near Me. We received your submission and will review it before publishing or updating a listing. This receipt does not mean the program has been approved.`
          : kind === "organization"
            ? `Thank you for submitting ${program} to Adaptive Sports Near Me. We received your submission and will review it before publishing the organization. This receipt does not mean the organization has been approved.`
            : kind === "listing-update"
              ? `Thank you for helping keep ${program} accurate on Adaptive Sports Near Me. A person will read your suggestion before anything on the listing changes. This receipt does not mean the change has been made yet.`
              : kind === "event"
                ? `Thank you for telling us about ${program}. A person will check it before it appears on Adaptive Sports Near Me. This receipt does not mean the event has been listed yet.`
                : kind === "profile-created"
                  ? "Your Adaptive Sports Near Me profile has been created. You can use it on the device where you signed up to save programs and manage your preferences. This email is not a sign-in or recovery link."
                  : "Your Adaptive Sports Near Me profile changes have been saved. You can view your updated preferences on the device where you made the changes.";
      const closing =
        "If you have questions or did not submit this form, reply to this email.";
      const message = {
        to: email,
        subject,
        text: body + "\n\n" + closing + "\n\nAdaptive Sports Near Me",
        html: shell("<p>" + esc(body) + "</p><p>" + closing + "</p>"),
      };
      const idempotencyKey = `confirm-${kind}:${key || (await keyDigest(`${email}\n${program || ""}\n${Date.now()}`))}`;
      let receipt;
      try {
        receipt = await houseSend(env, `confirm-${kind}`, idempotencyKey, message);
      } catch (error) {
        if (!error?.retryable) throw error;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        receipt = await houseSend(env, `confirm-${kind}`, idempotencyKey, message);
      }
      if (receipt?.dropped) return;
      if (!receipt?.messageId && !receipt?.id)
        throw new Error("Missing send receipt");
    } catch (error) {
      // The log never carries recipient addresses, message content or credentials;
      // the ledger keeps the address so a person can follow up.
      console.error("Form confirmation needs review", {
        kind,
        reason: "send-failed-or-unconfirmed",
      });
      await recordSendFailure(env, route, email, error);
    }
  })();
  if (ctx?.waitUntil) ctx.waitUntil(job);
  else await job;
}

const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

// Deliberately plain, same reasoning as ATL's shell: transactional notes have
// to survive any mail client. The site is where design lives; this is where
// trust does.
function shell(bodyHtml) {
  return (
    `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;` +
    `font-size:16px;line-height:1.6;color:#1c1a15;max-width:560px">` +
    bodyHtml +
    `<p style="margin-top:28px;color:#6b6b70;font-size:14px">Adaptive Sports Near Me<br>` +
    `Made with ❤️ by Adapt To Life &middot; 501(c)(3) nonprofit &middot; EIN 41-3213344</p>` +
    `</div>`
  );
}

// The signup receipt. Fires once, right after a successful email capture. It
// answers the only three questions a new signup has: did it work, what is
// this, and what happens next. The words are true before and after the
// PRELAUNCH flip (2026-10-13), so this Worker never waits on opening day.
// What the site is and what the letter brings: the same product line as the site
// (public/app/page-meta.js), and no promise of a schedule.
const WELCOME = [
  "Adaptive Sports Near Me helps you find adaptive sports programs, grants and events by place or sport. " +
    "It's free, there's no account, and nobody here will ever ask you for money.",
  "Every listing shows when we last checked it. We'll email you only when there's something worth sending: " +
    "new programs, grants and events.",
];

// Why they get it, who sends it, and how to leave: every list email's footer
// (CAN-SPAM, and Gmail and Yahoo's bulk sender rules).
function listFooterText(unsubscribeLink) {
  return (
    "You're getting this because you signed up for news at adaptivesportsnearme.com.\n" +
    `Unsubscribe in one click: ${unsubscribeLink}\n\n` +
    "Adaptive Sports Near Me is made by Adapt To Life, a 501(c)(3) nonprofit, EIN 41-3213344.\n" +
    POSTAL_ADDRESS
  );
}
function listShell(bodyHtml, unsubscribeLink) {
  return (
    `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;` +
    `font-size:16px;line-height:1.6;color:#1c1a15;max-width:560px">` +
    bodyHtml +
    `<p style="margin-top:28px;color:#6b6b70;font-size:14px">You're getting this because you signed up ` +
    `for news at adaptivesportsnearme.com. <a href="${esc(unsubscribeLink)}" style="color:#6b6b70">Unsubscribe</a> in one click.</p>` +
    `<p style="margin:0;color:#6b6b70;font-size:14px">Adaptive Sports Near Me<br>` +
    `Made with ❤️ by Adapt To Life &middot; 501(c)(3) nonprofit &middot; EIN 41-3213344<br>` +
    `${esc(POSTAL_ADDRESS)}</p>` +
    `</div>`
  );
}

// `key` is the signup's claim key, so one signup gets one welcome.
// `unsubscribeLink` is the signed /unsubscribe link (src/unsubscribe.js); a
// list email never goes out without one.
export async function sendSignupWelcome(
  env,
  email,
  { name = "", beta = false, unsubscribeLink, key } = {},
) {
  if (!unsubscribeLink) throw new Error("A list email needs an unsubscribe link");
  if (!key) throw new Error("The welcome needs its signup key");
  const subject = "You're on the list";
  // The name is a courtesy, never a requirement: an unnamed signup gets the
  // same note without an awkward blank.
  const hi = name ? `You're on the list, ${name}.` : "You're on the list.";
  const leave = "Not what you wanted? Unsubscribe in one click:";
  const betaText = beta
    ? "You asked for a first look. Tell us what is missing where you live and " +
      "that is what we work on next, so the next person who searches your town " +
      "finds something real.\n\n"
    : "";
  const betaHtml = beta
    ? `<p style="margin:0 0 16px">You asked for a first look. Tell us what is missing where you live ` +
      `and that is what we work on next, so the next person who searches your town finds something real.</p>`
    : "";
  const text =
    hi +
    "\n" +
    leave +
    " " +
    unsubscribeLink +
    "\n\n" +
    WELCOME[0] +
    "\n\n" +
    WELCOME[1] +
    "\n\n" +
    betaText +
    "If you run a program, or know one we should list, just reply to this " +
    "email. A person reads it.\n\n" +
    "Talk soon,\nAlec and Karen\n\n" +
    listFooterText(unsubscribeLink);
  const html = listShell(
    `<p style="margin:0 0 4px"><strong>${esc(hi)}</strong></p>` +
      `<p style="margin:0 0 16px;color:#6b6b70;font-size:14px">Not what you wanted? ` +
      `<a href="${esc(unsubscribeLink)}" style="color:#6b6b70">Unsubscribe in one click</a>.</p>` +
      WELCOME.map((t) => `<p style="margin:0 0 16px">${esc(t)}</p>`).join("") +
      betaHtml +
      `<p style="margin:0 0 16px">If you run a program, or know one we should list, just reply to this ` +
      `email. A person reads it.</p>` +
      `<p style="margin:0">Talk soon,<br>Alec and Karen</p>`,
    unsubscribeLink,
  );
  return houseSend(env, "welcome", `welcome:${key}`, {
    to: email,
    subject,
    text,
    html,
    headers: listUnsubscribeHeaders(unsubscribeLink),
  });
}
