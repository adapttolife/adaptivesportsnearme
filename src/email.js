import { mailConfigured, sendMail } from './mail-transport.js';
// Transactional mail through the explicitly selected transport. Gmail is opt-in
// and fails closed; the cfSend name is retained for caller compatibility.
export const HOUSE_FROM = "Adaptive Sports Near Me <hello@adaptivesportsnearme.com>";
export const HOUSE_REPLY = "hello@adaptivesportsnearme.com";

export async function cfSend(env, message) {
  return sendMail(env, message);
}

export async function sendOrganizationLoginLink(env, email, link) {
  const subject = "Your Adaptive Sports Near Me sign-in link";
  const text = `Use this link to manage your organization's listing:\n\n${link}\n\nThis link expires in 15 minutes and can be used once. If you did not request it, you can ignore this email.`;
  const html = shell(`<p>Use this link to manage your organization's listing:</p><p><a href="${esc(link)}">Manage your listing</a></p><p>This link expires in 15 minutes and can be used once. If you did not request it, you can ignore this email.</p>`);
  return cfSend(env, { from: HOUSE_FROM, to: email, replyTo: HOUSE_REPLY, subject, text, html });
}

export async function sendAdminLoginLink(env, email, link) {
  const subject = "Your Adaptive Sports Near Me admin sign-in link";
  const text = `Use this link to access the Adaptive Sports Near Me admin dashboard:\n\n${link}\n\nThis link expires in 15 minutes and can be used once. If you did not request it, you can ignore this email.`;
  const html = shell(`<p>Use this link to access the Adaptive Sports Near Me admin dashboard:</p><p><a href="${esc(link)}">Open the admin dashboard</a></p><p>This link expires in 15 minutes and can be used once. If you did not request it, you can ignore this email.</p>`);
  return cfSend(env, { from: HOUSE_FROM, to: email, replyTo: HOUSE_REPLY, subject, text, html });
}

export async function sendBetaLoginLink(env, email, link) {
  const subject = "Your Adaptive Sports Near Me beta sign-in link";
  const text = `Use this link to access the Adaptive Sports Near Me beta:\n\n${link}\n\nThis link expires in 15 minutes and can be used once. If you did not request it, you can ignore this email.`;
  const html = shell(`<p>Use this link to access the Adaptive Sports Near Me beta:</p><p><a href="${esc(link)}">Open the beta</a></p><p>This link expires in 15 minutes and can be used once. If you did not request it, you can ignore this email.</p>`);
  return cfSend(env, { from: HOUSE_FROM, to: email, replyTo: HOUSE_REPLY, subject, text, html });
}

export async function sendProfileLoginLink(env, email, link) {
  const subject = "Your Adaptive Sports Near Me sign-in link";
  const text = `Use this link to open your saved items:\n\n${link}\n\nThis link expires in 15 minutes and can be used once. If you did not request it, you can ignore this email.`;
  const html = shell(`<p>Use this link to open your saved items:</p><p><a href="${esc(link)}">Open your saved items</a></p><p>This link expires in 15 minutes and can be used once. If you did not request it, you can ignore this email.</p>`);
  return cfSend(env, { from: HOUSE_FROM, to: email, replyTo: HOUSE_REPLY, subject, text, html });
}

// Called only after the form's primary save succeeds. One send attempt, with
// no automatic retry: a lost provider response may still mean mail was sent.
export async function queueFormConfirmation(env, ctx, { kind, email, program }) {
  const job = (async () => {
    try {
      if (!mailConfigured(env)) {
        console.error('Form confirmation unavailable', { kind, reason: 'mail-not-configured' });
        return;
      }
      const subject = kind === 'program' ? 'We received your program submission'
        : kind === 'organization' ? 'We received your organization submission'
        : kind === 'listing-update' ? 'We received your suggested update'
        : kind === 'event' ? 'We received your event'
        : kind === 'profile-created' ? 'Your ASNM profile is ready' : 'Your ASNM profile was updated';
      const body = kind === 'program'
        ? `Thank you for submitting ${program} to Adaptive Sports Near Me. We received your submission and will review it before publishing or updating a listing. This receipt does not mean the program has been approved.`
        : kind === 'organization'
          ? `Thank you for submitting ${program} to Adaptive Sports Near Me. We received your submission and will review it before publishing the organization. This receipt does not mean the organization has been approved.`
        : kind === 'listing-update'
          ? `Thank you for helping keep ${program} accurate on Adaptive Sports Near Me. A person will read your suggestion before anything on the listing changes. This receipt does not mean the change has been made yet.`
        : kind === 'event'
          ? `Thank you for telling us about ${program}. A person will check it before it appears on Adaptive Sports Near Me. This receipt does not mean the event has been listed yet.`
        : kind === 'profile-created'
          ? 'Your Adaptive Sports Near Me profile has been created. You can use it on the device where you signed up to save programs and manage your preferences. This email is not a sign-in or recovery link.'
          : 'Your Adaptive Sports Near Me profile changes have been saved. You can view your updated preferences on the device where you made the changes.';
      const closing = 'If you have questions or did not submit this form, reply to this email.';
      const receipt = await sendMail(env, {
        from: HOUSE_FROM, to: email, replyTo: HOUSE_REPLY, subject,
        text: body + '\n\n' + closing + '\n\nAdaptive Sports Near Me',
        html: shell('<p>' + esc(body) + '</p><p>' + closing + '</p>')
      });
      if (!receipt?.messageId && !receipt?.id) throw new Error('Missing send receipt');
    } catch {
      // Do not expose recipient addresses, message content, or credentials.
      console.error('Form confirmation needs review', { kind, reason: 'send-failed-or-unconfirmed' });
    }
  })();
  if (ctx?.waitUntil) ctx.waitUntil(job);
  else await job;
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

export async function sendSignupWelcome(env, email, { name = "", beta = false } = {}) {
  const subject = "You're on the list";
  // The name is a courtesy, never a requirement: an unnamed signup gets the
  // same note without an awkward blank.
  const hi = name ? `You're in, ${name}.` : "You're in.";
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
    hi + "\n\n" +
    WELCOME[0] + "\n\n" + WELCOME[1] + "\n\n" +
    betaText +
    "If you run a program, or know one we should list, just reply to this " +
    "email. A person reads it.\n\n" +
    "Talk soon,\nAlec and Karen\n\n" +
    "Adaptive Sports Near Me\n" +
    "Made with ❤️ by Adapt To Life - 501(c)(3) nonprofit - EIN 41-3213344";
  const html = shell(
    `<p style="margin:0 0 16px"><strong>${esc(hi)}</strong></p>` +
    WELCOME.map((t) => `<p style="margin:0 0 16px">${esc(t)}</p>`).join("") +
    betaHtml +
    `<p style="margin:0 0 16px">If you run a program, or know one we should list, just reply to this ` +
    `email. A person reads it.</p>` +
    `<p style="margin:0">Talk soon,<br>Alec and Karen</p>`
  );
  return cfSend(env, { from: HOUSE_FROM, to: esc(email) && email, replyTo: HOUSE_REPLY, subject, text, html });
}
