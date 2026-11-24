// POST /api/resend-events: Resend's delivery webhook for this site.
//
// The send contract (docs/EMAIL.md in adapt-to-life): verify the Svix signature
// on the raw body with WebCrypto (HMAC-SHA256 over "id.timestamp.body", key =
// RESEND_WEBHOOK_SECRET after its whsec_ prefix, base64), refuse timestamps more
// than 5 minutes off, store each svix-id once, keep only events tagged with our
// brand and this Worker's ENV_NAME, and write bounces, complaints and failures
// to send_failures once.
//
// The Resend team is shared with adapttolife.org and alectranel.com, so most
// events a misconfigured webhook could send us are someone else's: those are
// answered 200 and dropped without being stored.
export const BRAND = "asnm";
const TOLERANCE_SECONDS = 5 * 60;
const MAX_BODY = 256 * 1024;
const FAILURES = new Set(["email.bounced", "email.complained", "email.failed"]);
const encoder = new TextEncoder();

function base64Bytes(value) {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

function sameBytes(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// Returns true only for a valid, fresh signature. Exported for tests.
export async function verifySvix(secret, headers, body, nowSeconds = Date.now() / 1000) {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatures = headers.get("svix-signature");
  if (!secret || !id || !timestamp || !signatures) return false;
  if (!/^\d{1,12}$/.test(timestamp)) return false;
  if (Math.abs(nowSeconds - Number(timestamp)) > TOLERANCE_SECONDS) return false;
  let keyBytes;
  try {
    keyBytes = base64Bytes(String(secret).replace(/^whsec_/, ""));
  } catch {
    return false;
  }
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(`${id}.${timestamp}.${body}`)),
  );
  // Several space separated "v1,<base64>" values may be present (key rotation).
  for (const part of signatures.split(" ")) {
    const [version, value] = part.split(",");
    if (version !== "v1" || !value) continue;
    try {
      if (sameBytes(base64Bytes(value), expected)) return true;
    } catch {}
  }
  return false;
}

// Resend sends tags as a map in webhooks; accept the array shape too.
function tagMap(tags) {
  if (Array.isArray(tags))
    return Object.fromEntries(tags.map((t) => [String(t?.name), String(t?.value)]));
  return tags && typeof tags === "object" ? tags : {};
}

const reply = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export async function handleResendEvents(request, env) {
  if (request.method !== "POST") return reply({ ok: false, error: "Method not allowed" }, 405);
  // 503 makes Resend retry later instead of losing the event.
  if (!env.RESEND_WEBHOOK_SECRET || !env.INTAKE)
    return reply({ ok: false, error: "Not configured" }, 503);
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY) return reply({ ok: false, error: "Too large" }, 413);
  const body = await request.text();
  if (body.length > MAX_BODY) return reply({ ok: false, error: "Too large" }, 413);
  if (!(await verifySvix(env.RESEND_WEBHOOK_SECRET, request.headers, body)))
    return reply({ ok: false, error: "Invalid signature" }, 401);

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return reply({ ok: false, error: "Invalid JSON" }, 400);
  }
  const data = event?.data || {};
  const tags = tagMap(data.tags);
  if (tags.brand !== BRAND || tags.env !== env.ENV_NAME)
    return reply({ ok: true, ignored: true });

  const svixId = request.headers.get("svix-id");
  const type = String(event.type || "").slice(0, 60);
  const to = Array.isArray(data.to) ? data.to.join(", ") : String(data.to || "");
  const statements = [
    env.INTAKE.prepare(
      "INSERT OR IGNORE INTO resend_events (svix_id, received_at, type, email_id, kind, env) VALUES (?, ?, ?, ?, ?, ?)",
    ).bind(
      svixId,
      new Date().toISOString(),
      type,
      String(data.email_id || "").slice(0, 100) || null,
      String(tags.kind || "").slice(0, 60) || null,
      String(env.ENV_NAME || ""),
    ),
  ];
  if (FAILURES.has(type)) {
    const detail =
      type === "email.bounced"
        ? [data.bounce?.type, data.bounce?.subType, data.bounce?.message]
        : type === "email.failed"
          ? [data.failed?.reason]
          : ["recipient marked it as spam"];
    // Same transaction as the event, and keyed by the svix-id: a failure is
    // written exactly once, however often Resend replays the delivery.
    statements.push(
      env.INTAKE.prepare(
        "INSERT OR IGNORE INTO send_failures (id, ts, route, to_addr, error) VALUES (?, ?, ?, ?, ?)",
      ).bind(
        `resend:${svixId}`,
        Math.floor(Date.now() / 1000),
        `resend-${type.replace(/^email\./, "")}`,
        to.slice(0, 320),
        `${tags.kind || "unknown"} ${data.email_id || ""}: ${detail.filter(Boolean).join(" ")}`
          .trim()
          .slice(0, 2000),
      ),
    );
  }
  try {
    const [stored] = await env.INTAKE.batch(statements);
    // Resend retries and replays deliveries with the same svix-id.
    if (!(Number(stored?.meta?.changes ?? stored?.changes ?? 0) > 0))
      return reply({ ok: true, duplicate: true });
  } catch (err) {
    console.error("resend event store failed", {
      reason: String(err?.message || "").slice(0, 120),
    });
    return reply({ ok: false, error: "Could not store the event" }, 503);
  }
  return reply({ ok: true });
}
