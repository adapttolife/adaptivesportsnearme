// Outbound transactional email — Cloudflare Email Sending via the native
// `send_email` Worker binding. Carried over from adapt-to-life's email.js
// (the contact / grant / waiver receipts): one helper, one house shell, so
// every note from this project reads as one organisation.
//
// Sender note (2026-09-01): adaptivesportsnearme.com is NOT onboarded to
// Cloudflare Email Service (its SPF/MX are Google-only), so mail goes out as
// Adapt To Life — which is true: ASNM is an Adapt To Life project. If the
// asnm domain is ever onboarded (SPF include + DKIM on the zone), change
// HOUSE_FROM and nothing else.

export const HOUSE_FROM = "Adaptive Sports Near Me <hello@adapttolife.org>";
export const HOUSE_REPLY = "hello@adapttolife.org";

export async function cfSend(env, { from, to, replyTo, subject, text, html }) {
  if (!env.SEND_EMAIL) throw new Error("SEND_EMAIL binding not configured");
  const msg = { from, to, subject };
  if (text) msg.text = text;
  if (html) msg.html = html;
  if (replyTo) msg.replyTo = replyTo;
  return (await env.SEND_EMAIL.send(msg)) || {};
}

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
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
    `an Adapt To Life project &middot; 501(c)(3) nonprofit &middot; EIN 41-3213344</p>` +
    `</div>`
  );
}

// The signup receipt. Fires once, right after a successful email capture on
// the prelaunch site. It answers the only three questions a new signup has:
// did it work, what is this, and what happens next.
export async function sendSignupWelcome(env, email, { name = "", beta = false } = {}) {
  const subject = beta ? "You're on the early list" : "You're on the list";
  // The name is a courtesy, never a requirement: an unnamed signup gets the
  // same note without an awkward blank.
  const hi = name ? `You're in, ${name}.` : "You're in.";
  const middleText = beta
    ? "You asked for the first look, so that is what you get. Your link comes " +
      "before the doors open. Tell us what is missing where you live and that " +
      "is what we work on next, so the next person who searches your town " +
      "finds something real.\n\n"
    : "We are checking every listing so that what you find is real. You hear " +
      "the day the doors open, before anyone else.\n\n";
  const middleHtml = beta
    ? `<p style="margin:0 0 16px">You asked for the first look, so that is what you get. Your link ` +
      `comes before the doors open. Tell us what is missing where you live and that is what we ` +
      `work on next, so the next person who searches your town finds something real.</p>`
    : `<p style="margin:0 0 16px">We are checking every listing so that what you find is real. ` +
      `You hear the day the doors open, before anyone else.</p>`;
  const text =
    hi + "\n\n" +
    "Adaptive Sports Near Me is a free national directory of adaptive sports " +
    "programs: one place to find a program near you, an event to show up to, " +
    "and grants that help pay for it. No account, no fee, and nobody here " +
    "will ever ask you for money.\n\n" +
    middleText +
    "If you run a program, or know one we should list, just reply to this " +
    "email. A person reads it.\n\n" +
    "Talk soon,\nAlec and Karen\n\n" +
    "Adaptive Sports Near Me\n" +
    "an Adapt To Life project - 501(c)(3) nonprofit - EIN 41-3213344";
  const html = shell(
    `<p style="margin:0 0 16px"><strong>${esc(hi)}</strong></p>` +
    `<p style="margin:0 0 16px">Adaptive Sports Near Me is a free national directory of adaptive sports ` +
    `programs: one place to find a program near you, an event to show up to, and grants that help pay ` +
    `for it. No account, no fee, and nobody here will ever ask you for money.</p>` +
    middleHtml +
    `<p style="margin:0 0 16px">If you run a program, or know one we should list, just reply to this ` +
    `email. A person reads it.</p>` +
    `<p style="margin:0">Talk soon,<br>Alec and Karen</p>`
  );
  return cfSend(env, { from: HOUSE_FROM, to: esc(email) && email, replyTo: HOUSE_REPLY, subject, text, html });
}

// The receipt for someone who submits a program. Until 2026-09-10 this form sent
// the submitter nothing at all: they handed us their program, saw a "thank you"
// on screen, and never heard from us again. A person who takes the trouble to
// tell us about a program should get something back that a human clearly wrote.
export async function sendProgramReceipt(env, email, { program, org, name } = {}) {
  const who = (name || "").trim();
  const what = (program || "the program").trim();
  const subject = "We got your program";
  const text =
    (who ? `Thanks, ${who}.\n\n` : "Thanks.\n\n") +
    `We received ${what}${org ? ` (${org})` : ""} and a person will look at it before ` +
    "the directory opens.\n\n" +
    "We check every listing by hand, so it may take us a few days. If we need " +
    "anything from you, we will just reply to this email.\n\n" +
    "If you spot something we got wrong, or you know other programs we should " +
    "list, reply here too. A person reads it.\n\n" +
    "Talk soon,\nAlec and Karen\n\n" +
    "Adaptive Sports Near Me\n" +
    "an Adapt To Life project - 501(c)(3) nonprofit - EIN 41-3213344";
  const html = shell(
    `<p style="margin:0 0 16px"><strong>${who ? `Thanks, ${esc(who)}.` : "Thanks."}</strong></p>` +
    `<p style="margin:0 0 16px">We received <strong>${esc(what)}</strong>${org ? ` (${esc(org)})` : ""} ` +
    `and a person will look at it before the directory opens.</p>` +
    `<p style="margin:0 0 16px">We check every listing by hand, so it may take us a few days. ` +
    `If we need anything from you, we will just reply to this email.</p>` +
    `<p style="margin:0 0 16px">If you spot something we got wrong, or you know other programs we ` +
    `should list, reply here too. A person reads it.</p>` +
    `<p style="margin:0">Talk soon,<br>Alec and Karen</p>`
  );
  return cfSend(env, { from: HOUSE_FROM, to: email, replyTo: HOUSE_REPLY, subject, text, html });
}
