import { mailConfigured, sendMail } from './mail-transport.js';
// Intake — every form submission across every Adapt To Life property lands here,
// and Alec gets an email about it.
//
// THE CONTRACT, and the reason each line of it exists:
//
//   1. The row is written BEFORE anything that can fail. If we cannot record the
//      submission we tell the submitter so, rather than losing them quietly.
//   2. The submitter's confirmation never waits on email or Sheets. Notification
//      happens after the response, through waitUntil.
//   3. Claims prevent blind repeat sends. A post-send crash leaves an ambiguous
//      claim for review: at-most-once attempts, NOT guaranteed delivery.
//   4. The owning Worker must explicitly schedule sweepNotifications; importing
//      this module alone does not activate a cron or prove inbox delivery.
//
// There is no model, agent or judgement anywhere in this path. A form submission
// is deterministic code end to end. Something with judgement may READ this table
// later; nothing with judgement stands between a person and their record.

// Where notifications land. hello@adapttolife.org is the answer for all three
// properties (Alec, 2026-09-09). Overridable per environment so a review lane can
// prove delivery into an inbox that is actually readable from the box, which is
// the only way this path gets verified rather than assumed.
export const INTAKE_INBOX_DEFAULT = "hello@adapttolife.org";
export const INTAKE_FROM = "Adapt To Life Intake <hello@adapttolife.org>";
export const intakeInbox = (env) => (env && env.INTAKE_INBOX) || INTAKE_INBOX_DEFAULT;

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/** Best-effort, never throws: a broken label must not break a submission. */
function line(k, v) {
  const s = String(v ?? "").trim();
  return s ? `${k}: ${s}\n` : "";
}

/** The notification Alec actually reads. Plain, scannable, reply-to the person. */
function notificationBody(row) {
  let payload = {};
  try { payload = JSON.parse(row.payload || "{}"); } catch (_) { /* keep {} */ }

  const facts =
    line("Name", row.name) +
    line("Email", row.email) +
    line("Phone", row.phone) +
    line("Site", row.site) +
    line("Form", row.kind) +
    line("Source", row.source) +
    line("Received", row.received_at);

  const extras = Object.entries(payload)
    .filter(([k, v]) => v !== null && v !== undefined && String(v).trim() !== "")
    .map(([k, v]) => line(k, typeof v === "object" ? JSON.stringify(v) : v))
    .join("");

  const text =
    `${row.summary}\n\n${facts}` +
    (extras ? `\n${extras}` : "") +
    `\nReply to this email to answer them directly.\n` +
    `\nintake id ${row.id}\n`;

  const html =
    `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#1c1a15;max-width:620px">` +
    `<p style="margin:0 0 14px;font-size:17px"><strong>${esc(row.summary)}</strong></p>` +
    `<table style="border-collapse:collapse;margin:0 0 14px">` +
    [["Name", row.name], ["Email", row.email], ["Phone", row.phone],
     ["Site", row.site], ["Form", row.kind], ["Source", row.source],
     ["Received", row.received_at]]
      .filter(([, v]) => String(v ?? "").trim())
      .map(([k, v]) => `<tr><td style="padding:2px 14px 2px 0;color:#6b6b70">${esc(k)}</td><td style="padding:2px 0">${esc(v)}</td></tr>`)
      .join("") +
    Object.entries(payload)
      .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "")
      .map(([k, v]) => `<tr><td style="padding:2px 14px 2px 0;color:#6b6b70">${esc(k)}</td><td style="padding:2px 0">${esc(typeof v === "object" ? JSON.stringify(v) : v)}</td></tr>`)
      .join("") +
    `</table>` +
    `<p style="margin:0 0 14px;color:#6b6b70">Reply to this email to answer them directly.</p>` +
    `<p style="margin:0;color:#9a9aa0;font-size:12px">intake id ${esc(row.id)}</p></div>`;

  return { text, html };
}

/**
 * Notify on one row and stamp it. Returns true only if the stamp landed, because
 * an unstamped row is one the sweeper must pick up again.
 */
export async function notifyIntakeRow(env, row) {
  if (row.is_canary) return false;
  if (row.notified_at) return true;
  // Only upgraded producers create a claim, atomically with the record. An old
  // unclaimed row may already have sent mail before losing its stamp; alert on
  // that debt rather than inventing safe-to-retry evidence.
  if (!mailConfigured(env)) return false;
  const claim = await env.INTAKE.prepare("UPDATE intake_delivery_claims SET state='sending',started_at=? WHERE intake_id=? AND state='pending' RETURNING intake_id")
    .bind(new Date().toISOString(),row.id).first();
  if (!claim) return false;
  const {text,html}=notificationBody(row);
  try {
    await sendMail(env, {from:INTAKE_FROM,to:intakeInbox(env),replyTo:row.email||intakeInbox(env),subject:row.summary,text,html});
    const now=new Date().toISOString();
    await env.INTAKE.batch([
      env.INTAKE.prepare("UPDATE intake SET notified_at=?,notify_error=NULL WHERE id=?").bind(now,row.id),
      env.INTAKE.prepare("UPDATE intake_delivery_claims SET state='done',completed_at=?,error=NULL WHERE intake_id=? AND state='sending'").bind(now,row.id)
    ]);
    return true;
  } catch(e) {
    // A transport exception or failed post-send stamp is ambiguous. Keep it
    // reviewable; automatically resending can duplicate the visitor's message.
    const error=String(e.message).slice(0,300);
    await env.INTAKE.batch([
      env.INTAKE.prepare("UPDATE intake_delivery_claims SET state='review',error=? WHERE intake_id=? AND state='sending'").bind(error,row.id),
      env.INTAKE.prepare("UPDATE intake SET notify_attempts=notify_attempts+1,notify_error=? WHERE id=? AND notified_at IS NULL").bind('Needs review: '+error,row.id)
    ]);
    return false;
  }
}

async function bumpAttempt(env, id, error) {
  try {
    await env.INTAKE.prepare(
      `UPDATE intake SET notify_attempts = notify_attempts + 1, notify_error = ? WHERE id = ?`
    ).bind(error, id).run();
  } catch (_) { /* the row still stands; the sweeper will find it */ }
}

/** Fetch and notify one row by id — the request path's fire-and-stamp. */
export async function notifyIntake(env, id) {
  try {
    const row = await env.INTAKE.prepare(`SELECT * FROM intake WHERE id = ?`).bind(id).first();
    if (!row) return false;
    return await notifyIntakeRow(env, row);
  } catch (err) {
    console.error("intake: notify lookup failed", id, err);
    return false;
  }
}

/**
 * The cron's job: anything still unnotified gets another try. This is what makes
 * an email outage a delay instead of a loss.
 */
export async function sweepIntake(env, limit=25) {
  const expired=new Date(Date.now()-15*60_000).toISOString();
  await env.INTAKE.prepare("UPDATE intake_delivery_claims SET state='review',error='Sender interrupted: verify provider acceptance before retry' WHERE state='sending' AND started_at<? AND intake_id IN (SELECT id FROM intake WHERE site='adaptivesportsnearme.com')").bind(expired).run();
  const {results:rows}=await env.INTAKE.prepare(`SELECT intake.* FROM intake
    JOIN intake_delivery_claims c ON c.intake_id=intake.id
    WHERE notified_at IS NULL AND COALESCE(is_canary,0)=0 AND c.state='pending'
      AND intake.site='adaptivesportsnearme.com'
    ORDER BY received_at ASC LIMIT ?`).bind(limit).all();
  let sent=0;
  for(const row of rows) if(await notifyIntakeRow(env,row))sent++;
  return {swept:rows.length,sent,failed:rows.length-sent};
}
