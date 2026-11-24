import { mailConfigured, sendMail } from "./mail-transport.js";
import { BRAND, houseAddress } from "./email.js";
import { recordSendFailure } from "./mail-ledger.js";
import { SPORT_NAMES } from "./sport-names.js";
import { seasonsText, MONTHS } from "../public/app/yearly.js";
import { checkupSummary, FIX_WORDS } from "./offerings.js";
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
// properties (Alec, 2026-10-02, superseding the 2026-09-09 choice of
// hello@adaptivesportsnearme.com; every live producer already sent there).
// The sender is this property's house address (src/email.js houseFrom: the
// mail. subdomain on Resend) under the intake name. Overridable per environment so a review lane can
// prove delivery into an inbox that is actually readable from the box, which is
// the only way this path gets verified rather than assumed.
export const INTAKE_INBOX_DEFAULT = "hello@adapttolife.org";
export const INTAKE_NAME = "Adapt To Life Intake";
export const intakeFrom = (env) => `${INTAKE_NAME} <${houseAddress(env)}>`;
// Resend keeps an Idempotency-Key for 24 hours; retries stop an hour short.
const RETRY_WINDOW_MS = 23 * 60 * 60 * 1000;
const withinRetryWindow = (row) =>
  Date.now() - Date.parse(row.received_at || 0) < RETRY_WINDOW_MS;
export const intakeInbox = (env) =>
  (env && env.INTAKE_INBOX) || INTAKE_INBOX_DEFAULT;

const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

/** Best-effort, never throws: a broken label must not break a submission. */
function line(k, v) {
  const s = String(v ?? "").trim();
  return s ? `${k}: ${s}\n` : "";
}

// An organization confirming its listing sends its sports with seasons and its yearly
// events as data; the notice says them in words ("Skiing: Winter").
function answerText(k, v) {
  if (k === "sports" && v && typeof v === "object" && !Array.isArray(v)) {
    return Object.entries(v)
      .map(
        ([sport, seasons]) =>
          `${SPORT_NAMES[sport] || sport}: ${seasonsText(seasons) || "season not given"}`,
      )
      .join("; ");
  }
  if (k === "checkup" && v && typeof v === "object") return checkupSummary(v);
  if (k === "reason" && typeof v === "string") return FIX_WORDS[v] || v;
  if (k === "yearly" && Array.isArray(v)) {
    return v
      .map((e) =>
        [e.name, e.month ? `usually ${MONTHS[e.month - 1]}` : "", e.url]
          .filter(Boolean)
          .join(", "),
      )
      .join("; ");
  }
  return typeof v === "object" ? JSON.stringify(v) : v;
}

/** The notification Alec actually reads. Plain, scannable, reply-to the person. */
function notificationBody(row) {
  let payload = {};
  try {
    payload = JSON.parse(row.payload || "{}");
  } catch (_) {
    /* keep {} */
  }

  const facts =
    line("Name", row.name) +
    line("Email", row.email) +
    line("Phone", row.phone) +
    line("Site", row.site) +
    line("Form", row.kind) +
    line("Source", row.source) +
    line("Received", row.received_at);

  const extras = Object.entries(payload)
    .filter(
      ([k, v]) => v !== null && v !== undefined && String(v).trim() !== "",
    )
    .map(([k, v]) => line(k, answerText(k, v)))
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
    [
      ["Name", row.name],
      ["Email", row.email],
      ["Phone", row.phone],
      ["Site", row.site],
      ["Form", row.kind],
      ["Source", row.source],
      ["Received", row.received_at],
    ]
      .filter(([, v]) => String(v ?? "").trim())
      .map(
        ([k, v]) =>
          `<tr><td style="padding:2px 14px 2px 0;color:#6b6b70">${esc(k)}</td><td style="padding:2px 0">${esc(v)}</td></tr>`,
      )
      .join("") +
    Object.entries(payload)
      .filter(
        ([, v]) => v !== null && v !== undefined && String(v).trim() !== "",
      )
      .map(
        ([k, v]) =>
          `<tr><td style="padding:2px 14px 2px 0;color:#6b6b70">${esc(k)}</td><td style="padding:2px 0">${esc(answerText(k, v))}</td></tr>`,
      )
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
  const claim = await env.INTAKE.prepare(
    "UPDATE intake_delivery_claims SET state='sending',started_at=? WHERE intake_id=? AND state='pending' RETURNING intake_id",
  )
    .bind(new Date().toISOString(), row.id)
    .first();
  if (!claim) return false;
  const { text, html } = notificationBody(row);
  try {
    // The key is the intake id and the body is built only from the stored row,
    // so a retry sends the same message and Resend dedupes it.
    await sendMail(env, {
      from: intakeFrom(env),
      to: intakeInbox(env),
      replyTo: row.email || intakeInbox(env),
      subject: row.summary,
      text,
      html,
      idempotencyKey: `intake:${row.id}`,
      tags: { brand: BRAND, kind: "intake-notice" },
    });
    const now = new Date().toISOString();
    await env.INTAKE.batch([
      env.INTAKE.prepare(
        "UPDATE intake SET notified_at=?,notify_error=NULL WHERE id=?",
      ).bind(now, row.id),
      env.INTAKE.prepare(
        "UPDATE intake_delivery_claims SET state='done',completed_at=?,error=NULL WHERE intake_id=? AND state='sending'",
      ).bind(now, row.id),
    ]);
    return true;
  } catch (e) {
    const error = String(e.message).slice(0, 300);
    // A retryable Resend refusal (429, 5xx, timeout) goes back in the queue: the
    // same Idempotency-Key makes the next try safe until the key expires.
    if (e?.retryable && withinRetryWindow(row)) {
      await env.INTAKE.batch([
        env.INTAKE.prepare(
          "UPDATE intake_delivery_claims SET state='pending',error=? WHERE intake_id=? AND state='sending'",
        ).bind(error, row.id),
        env.INTAKE.prepare(
          "UPDATE intake SET notify_attempts=notify_attempts+1,notify_error=? WHERE id=? AND notified_at IS NULL",
        ).bind("Will retry: " + error, row.id),
      ]);
      return false;
    }
    // Anything else, or a failed post-send stamp, is ambiguous. Keep it
    // reviewable, and tell someone: the ledger is what the alert reads.
    await recordSendFailure(env, "asnm-intake-notice", intakeInbox(env), `intake ${row.id}: ${error}`);
    await env.INTAKE.batch([
      env.INTAKE.prepare(
        "UPDATE intake_delivery_claims SET state='review',error=? WHERE intake_id=? AND state='sending'",
      ).bind(error, row.id),
      env.INTAKE.prepare(
        "UPDATE intake SET notify_attempts=notify_attempts+1,notify_error=? WHERE id=? AND notified_at IS NULL",
      ).bind("Needs review: " + error, row.id),
    ]);
    return false;
  }
}

async function bumpAttempt(env, id, error) {
  try {
    await env.INTAKE.prepare(
      `UPDATE intake SET notify_attempts = notify_attempts + 1, notify_error = ? WHERE id = ?`,
    )
      .bind(error, id)
      .run();
  } catch (_) {
    /* the row still stands; the sweeper will find it */
  }
}

/** Fetch and notify one row by id — the request path's fire-and-stamp. */
export async function notifyIntake(env, id) {
  try {
    const row = await env.INTAKE.prepare(`SELECT * FROM intake WHERE id = ?`)
      .bind(id)
      .first();
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
export async function sweepIntake(env, limit = 25) {
  const expired = new Date(Date.now() - 15 * 60_000).toISOString();
  // A send interrupted mid-flight. On Resend, the idempotency key makes a retry
  // safe for a day, so it goes back in the queue; on Gmail it cannot be known.
  if (env.MAIL_TRANSPORT === "resend")
    await env.INTAKE.prepare(
      "UPDATE intake_delivery_claims SET state='pending',error='Sender interrupted: retrying under the same idempotency key' WHERE state='sending' AND started_at<? AND intake_id IN (SELECT id FROM intake WHERE site='adaptivesportsnearme.com' AND received_at>?)",
    )
      .bind(expired, new Date(Date.now() - RETRY_WINDOW_MS).toISOString())
      .run();
  const { results: interrupted = [] } = await env.INTAKE.prepare(
    "UPDATE intake_delivery_claims SET state='review',error='Sender interrupted: verify provider acceptance before retry' WHERE state='sending' AND started_at<? AND intake_id IN (SELECT id FROM intake WHERE site='adaptivesportsnearme.com') RETURNING intake_id",
  )
    .bind(expired)
    .all();
  for (const { intake_id } of interrupted)
    await recordSendFailure(
      env,
      "asnm-intake-notice",
      intakeInbox(env),
      `intake ${intake_id}: sender interrupted, check Resend's log before resending`,
    );
  const { results: rows } = await env.INTAKE.prepare(
    `SELECT intake.* FROM intake
    JOIN intake_delivery_claims c ON c.intake_id=intake.id
    WHERE notified_at IS NULL AND COALESCE(is_canary,0)=0 AND c.state='pending'
      AND intake.site='adaptivesportsnearme.com'
    ORDER BY received_at ASC LIMIT ?`,
  )
    .bind(limit)
    .all();
  // Past the retry window a pending notice is parked for a person, not resent.
  const fresh = [];
  for (const row of rows) {
    if (env.MAIL_TRANSPORT !== "resend" || withinRetryWindow(row) || !row.notify_attempts) {
      fresh.push(row);
      continue;
    }
    const parked = await env.INTAKE.prepare(
      "UPDATE intake_delivery_claims SET state='review',error='Retries ran out: check Resend before resending' WHERE intake_id=? AND state='pending' RETURNING intake_id",
    )
      .bind(row.id)
      .first();
    if (parked)
      await recordSendFailure(env, "asnm-intake-notice", intakeInbox(env), `intake ${row.id}: retries ran out`);
  }
  let sent = 0;
  for (const row of fresh) if (await notifyIntakeRow(env, row)) sent++;
  return { swept: rows.length, sent, failed: rows.length - sent };
}
