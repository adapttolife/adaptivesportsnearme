import { notifyIntake } from "./intake.js";
import { mailAllowed } from "./mail-transport.js";
import { recordSendFailure } from "./mail-ledger.js";
import { sendSignupWelcome } from "./email.js";
import {
  clearTeamUnsubscribe,
  newsletterTopicId,
  setNewsletterTopic,
  unsubscribeUrl,
} from "./unsubscribe.js";

// Signup: record it, put the contact in the ASNM Segment and the ASNM Topic
// (their permission for this brand's mail), then send the welcome with its
// unsubscribe link. A contact who already exists in the team (Resend 409) gets
// the same: the ASNM Topic, the welcome, and the team wide flag cleared if they
// had once unsubscribed from everything (docs/EMAIL.md: safe, because every
// brand Topic is opt_out).
const SITE_ORIGIN = "https://adaptivesportsnearme.com";

// An existing contact joining ASNM. Each step is ledgered on failure, never
// fatal: the Segment add is the signup.
async function joinExistingContact(env, email) {
  for (const [route, step] of [
    ["asnm-newsletter-team-flag", () => clearTeamUnsubscribe(env, email)],
    ["asnm-newsletter-topic", () => setNewsletterTopic(env, email, "opt_in")],
  ]) {
    try {
      await step();
    } catch (error) {
      await recordSendFailure(env, route, email, error);
    }
  }
}

const fail = {
  ok: false,
  status: 502,
  error: "Sign-up is temporarily unavailable. Please try again soon.",
};

function digest(value) {
  return crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(value))
    .then((bytes) =>
      Array.from(new Uint8Array(bytes), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join(""),
    );
}

function providerError(error) {
  const message = String(error?.message || "");
  if (/no such table|no such column|has no column named/i.test(message))
    return "database-schema-missing";
  if (/constraint failed/i.test(message)) return "database-constraint";
  if (error?.name === "TimeoutError") return "timeout";
  if (error?.name === "SyntaxError") return "invalid-json";
  return "operation-failed";
}

export async function safeNewsletterSubscribe(
  env,
  input,
  campaign,
  extra = {},
) {
  const db = env.INTAKE;
  const segmentId = env.RESEND_SEGMENT_ID;
  if (!db || !env.RESEND_API_KEY || !segmentId) return { ...fail, status: 503 };

  const email = input.trim().toLowerCase();
  const name =
    typeof extra.name === "string" ? extra.name.trim().slice(0, 60) : "";
  const beta = extra.beta === true;
  let origin = SITE_ORIGIN;
  try {
    if (extra.origin) origin = new URL(extra.origin).origin;
  } catch {}
  // Staging, preview and dev never write the real list for anyone outside the
  // team (MAIL_ALLOW), and never mail them.
  if (!mailAllowed(env, email)) {
    console.log("Newsletter signup skipped outside production", {
      env: env.ENV_NAME,
    });
    return { ok: true, dropped: true };
  }
  const topicId = newsletterTopicId(env);
  const headers = {
    Authorization: `Bearer ${env.RESEND_API_KEY}`,
    "Content-Type": "application/json",
  };
  let stage = "claim-key";
  let providerStatus = null;
  let key;

  try {
    key = await digest(`${segmentId}\\n${email}`);
    const intakeId = `newsletter:${key}`;
    const now = new Date().toISOString();

    stage = "intake-capture";
    await db.batch([
      db
        .prepare(
          "INSERT OR IGNORE INTO newsletter_delivery_claims (claim_key,publication_id,state) VALUES (?,?,'pending')",
        )
        .bind(key, segmentId),
      db
        .prepare(
          "INSERT OR IGNORE INTO intake (id,received_at,site,kind,name,email,summary,payload,source,is_canary) VALUES (?,?,'adaptivesportsnearme.com','newsletter',?,?,?,?,?,0)",
        )
        .bind(
          intakeId,
          now,
          name || null,
          email,
          "ASNM newsletter signup",
          JSON.stringify({ name, beta }),
          campaign || "asnm-prelaunch",
        ),
      db
        .prepare(
          "INSERT OR IGNORE INTO intake_delivery_claims (intake_id,state) VALUES (?,'pending')",
        )
        .bind(intakeId),
    ]);

    stage = "creation-claim";
    const claim = await db
      .prepare(
        "UPDATE newsletter_delivery_claims SET state='creating' WHERE claim_key=? AND state='pending' RETURNING claim_key",
      )
      .bind(key)
      .first();
    if (!claim) {
      const existing = await db
        .prepare(
          "SELECT state FROM newsletter_delivery_claims WHERE claim_key=?",
        )
        .bind(key)
        .first();
      if (existing?.state === "resend-subscribed") {
        // Signing up again after leaving is a fresh yes for this brand.
        await joinExistingContact(env, email);
        return { ok: true, existing: true };
      }
      return {
        ...fail,
        status: 409,
        error:
          "This signup is already being processed. Please try again later.",
      };
    }

    stage = "contact-create";
    const body = { email, unsubscribed: false, segments: [{ id: segmentId }] };
    if (topicId) body.topics = [{ id: topicId, subscription: "opt_in" }];
    if (name) body.first_name = name;
    const response = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify(body),
    });
    providerStatus = response.status;
    let contact = null;
    if (response.ok) {
      contact = await response.json();
      if (!contact?.id) throw new Error("Invalid contact creation response");
    } else if (response.status === 409) {
      stage = "segment-existing-contact";
      const membership = await fetch(
        `https://api.resend.com/contacts/${encodeURIComponent(email)}/segments/${encodeURIComponent(segmentId)}`,
        {
          method: "POST",
          headers,
          signal: AbortSignal.timeout(10000),
        },
      );
      providerStatus = membership.status;
      if (!membership.ok && membership.status !== 409)
        throw new Error("Contact segment membership rejected");
      await joinExistingContact(env, email);
    } else {
      throw new Error("Contact creation rejected");
    }

    stage = "contact-record";
    providerStatus = null;
    await db
      .prepare(
        "UPDATE newsletter_delivery_claims SET subscription_id=?,state='resend-subscribed' WHERE claim_key=?",
      )
      .bind(contact?.id || null, key)
      .run();
    const background = Promise.all([
      notifyIntake(env, intakeId),
      sendWelcome(env, email, { name, beta, origin, key }),
    ]);
    return {
      ok: true,
      ...(contact ? {} : { existing: true }),
      welcomeJob: background,
    };
  } catch (error) {
    const reason = providerError(error);
    console.error("Newsletter signup failed closed", {
      stage,
      providerStatus,
      reason,
    });
    if (key) {
      try {
        await db
          .prepare(
            "UPDATE newsletter_delivery_claims SET state='needs-review' WHERE claim_key=? AND state='creating'",
          )
          .bind(key)
          .run();
      } catch {}
    }
    return env.ENV_NAME === "staging"
      ? { ...fail, diagnostic: { stage, providerStatus, reason } }
      : fail;
  }
}

// The welcome, once per signup (its key is the signup's claim key). Never
// throws: the signup already succeeded, so a welcome that does not go out is
// written to send_failures for the alert, and a retryable refusal is tried once
// more under the same key.
export async function sendWelcome(env, email, { name, beta, origin, key }) {
  try {
    const unsubscribeLink = await unsubscribeUrl(env, origin || SITE_ORIGIN, email);
    const send = () =>
      sendSignupWelcome(env, email, { name, beta, unsubscribeLink, key });
    let receipt;
    try {
      receipt = await send();
    } catch (error) {
      if (!error?.retryable) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      receipt = await send();
    }
    return !!(receipt?.id || receipt?.dropped);
  } catch (error) {
    console.error("Newsletter welcome needs review", {
      reason: String(error?.message || "").slice(0, 120),
    });
    await recordSendFailure(env, "asnm-welcome", email, error);
    return false;
  }
}
