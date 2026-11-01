import { notifyIntake } from "./intake.js";

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
      if (existing?.state === "resend-subscribed")
        return { ok: true, existing: true };
      return {
        ...fail,
        status: 409,
        error:
          "This signup is already being processed. Please try again later.",
      };
    }

    stage = "contact-create";
    const body = { email, unsubscribed: false, segments: [{ id: segmentId }] };
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
    const background = notifyIntake(env, intakeId);
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
