import { sendMail } from './mail-transport.js';
// Transactional mail through the explicitly selected transport. Gmail is opt-in
// and fails closed; the cfSend name is retained for caller compatibility.
export const HOUSE_FROM = "Adaptive Sports Near Me <hello@adapttolife.org>";
export const HOUSE_REPLY = "hello@adapttolife.org";

export async function cfSend(env, message) {
  return sendMail(env, message);
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
  const betaText = beta
    ? "You asked for the first look, so that is what you get. Your link comes " +
      "before we open. Tell us what is missing where you live and that is what " +
      "we work on next, so the next person who searches your town finds " +
      "something real.\n\n"
    : "";
  const betaHtml = beta
    ? `<p style="margin:0 0 16px">You asked for the first look, so that is what you get. Your link ` +
      `comes before we open. Tell us what is missing where you live and that is what we work on ` +
      `next, so the next person who searches your town finds something real.</p>`
    : "";
  const text =
    hi + "\n\n" +
    "Adaptive Sports Near Me is a free national directory of adaptive sports " +
    "programs: one place to find a program near you, an event to show up to, " +
    "and grants that help pay for it. No account, no fee, and nobody here " +
    "will ever ask you for money.\n\n" +
    "We are not open yet. We are testing every listing so that when the doors " +
    "open, what you find is real. You signed up, so you hear the day that " +
    "happens - before anyone else.\n\n" +
    betaText +
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
    `<p style="margin:0 0 16px">We are not open yet. We are testing every listing so that when the ` +
    `doors open, what you find is real. You signed up, so you hear the day that happens, before ` +
    `anyone else.</p>` +
    betaHtml +
    `<p style="margin:0 0 16px">If you run a program, or know one we should list, just reply to this ` +
    `email. A person reads it.</p>` +
    `<p style="margin:0">Talk soon,<br>Alec and Karen</p>`
  );
  return cfSend(env, { from: HOUSE_FROM, to: esc(email) && email, replyTo: HOUSE_REPLY, subject, text, html });
}
