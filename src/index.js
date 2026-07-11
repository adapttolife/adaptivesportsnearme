// Adaptive Sports Near Me — Worker entry.
// Serves the static site (env.ASSETS), the D1-backed directory API, the admin
// review surface, and the cron maintenance pipeline (validate + enrich lanes).
//   POST /api/subscribe        -> beehiiv (email capture, tagged asnm-prelaunch)
//   POST /api/submit-program   -> Airtable Agent Inbox + D1 submissions
//   GET  /api/config           -> env name + prelaunch flag (front-end gate)
//   GET  /api/programs         -> directory list (sport/state/q filters, paged)
//   GET  /api/orgs/:id         -> one org with source provenance
//   GET  /api/stats            -> counts by sport/state
//   *    /api/admin/*          -> review queue + lane triggers (ADMIN_KEY bearer)
// All secrets stay server-side (Worker secrets). Bot defence: honeypot + optional Turnstile.

import { listPrograms, getOrg, stats } from "./data.js";
import { handleAdmin } from "./admin.js";
import { runLane } from "./pipeline.js";
import { json } from "./http.js";

const API_CACHE = "public, max-age=300, stale-while-revalidate=600";

// Single source for cron -> lane routing; must list every schedule in
// wrangler.jsonc triggers. Unknown crons error loudly instead of misrouting.
const CRON_LANES = {
  "0 */2 * * *": "validate",
  "*/20 * * * *": "dispatch", // rotates enrich -> classify -> geocode -> resolve (pipeline.js)
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/subscribe") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      return handleSubscribe(request, env);
    }
    if (url.pathname === "/api/submit-program") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      return handleSubmitProgram(request, env);
    }

    if (url.pathname === "/api/config") {
      return json({
        ok: true,
        env: env.ENV_NAME || "production",
        prelaunch: env.PRELAUNCH !== "false",
        dataApi: !!env.DB,
      });
    }
    if (env.DB && request.method === "GET") {
      try {
        if (url.pathname === "/api/programs") {
          return json({ ok: true, ...(await listPrograms(env.DB, url.searchParams)) }, 200, API_CACHE);
        }
        const org = url.pathname.match(/^\/api\/orgs\/([0-9a-f-]{36})$/);
        if (org) {
          const record = await getOrg(env.DB, org[1]);
          return record ? json({ ok: true, org: record }, 200, API_CACHE)
                        : json({ ok: false, error: "Not found" }, 404);
        }
        if (url.pathname === "/api/stats") {
          return json({ ok: true, ...(await stats(env.DB)) }, 200, API_CACHE);
        }
      } catch (err) {
        console.error("data api error:", err);
        return json({ ok: false, error: "Data temporarily unavailable" }, 500);
      }
    }
    if (url.pathname.startsWith("/api/admin/") && env.DB) {
      return handleAdmin(request, env, url);
    }

    // /maps is the map explorer's real URL — same app, booted into the map.
    if (url.pathname === "/maps" || url.pathname === "/maps/") {
      return env.ASSETS.fetch(new Request(new URL("/", url), request));
    }

    // Everything else: the static site.
    return env.ASSETS.fetch(request);
  },

  async scheduled(controller, env, ctx) {
    if (!env.DB) return;
    const lane = CRON_LANES[controller.cron];
    if (!lane) {
      console.error(`no lane mapped for cron "${controller.cron}" — update CRON_LANES + wrangler.jsonc together`);
      return;
    }
    ctx.waitUntil(
      runLane(env, lane).then(
        (r) => console.log(`lane ${lane}: processed=${r.processed} flagged=${r.flagged}`),
        (err) => console.error(`lane ${lane} failed:`, err)
      )
    );
  },
};

// ---- Email capture -> beehiiv ------------------------------------------------
async function handleSubscribe(request, env) {
  const data = await readBody(request);
  if (data === null) return json({ ok: false, error: "Could not read your submission." }, 400);

  // Honeypot — bots fill the hidden "company" field. Accept silently, do nothing.
  if (str(data.company)) return json({ ok: true });

  if (!(await verifyTurnstile(env, str(data.cf_token), request.headers.get("CF-Connecting-IP")))) {
    return json({ ok: false, error: "Verification failed. Please reload the page and try again." }, 403);
  }

  const email = str(data.em);
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: "Please enter a valid email." }, 422);
  }

  if (!env.BEEHIIV_API_KEY || !env.BEEHIIV_PUBLICATION_ID) {
    console.error("beehiiv not configured (missing API key or publication id)");
    return json({ ok: false, error: "Sign-up is temporarily unavailable. Please try again soon." }, 503);
  }

  const source = str(data.source).slice(0, 80) || "asnm-prelaunch";
  let res;
  try {
    res = await fetch(
      `https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${env.BEEHIIV_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: "asnm-prelaunch",
          utm_medium: "website",
          utm_campaign: source,
          referring_site: "adaptivesportsnearme.com",
        }),
      }
    );
  } catch (err) {
    console.error("beehiiv request failed:", err);
    return json({ ok: false, error: "Could not sign you up right now. Please try again soon." }, 502);
  }

  if (!res.ok) {
    console.error("beehiiv error", res.status, await safeText(res));
    return json({ ok: false, error: "Could not sign you up right now. Please try again soon." }, 502);
  }

  return json({ ok: true });
}

// ---- Program submission -> Airtable Agent Inbox ------------------------------
async function handleSubmitProgram(request, env) {
  const data = await readBody(request);
  if (data === null) return json({ ok: false, error: "Could not read your submission." }, 400);

  if (str(data.company)) return json({ ok: true }); // honeypot

  if (!(await verifyTurnstile(env, str(data.cf_token), request.headers.get("CF-Connecting-IP")))) {
    return json({ ok: false, error: "Verification failed. Please reload the page and try again." }, 403);
  }

  const program = str(data.pn);
  const org = str(data.org);
  const sport = str(data.sport);
  const city = str(data.city);
  const stateRegion = str(data.state);
  const email = str(data.em);
  const notes = str(data.notes);

  if (!program) return json({ ok: false, error: "Please add the program name." }, 422);
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: "That email does not look right." }, 422);
  }

  if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE_ID || !env.AIRTABLE_INBOX_TABLE_ID) {
    console.error("Airtable not configured");
    return json({ ok: false, error: "Submissions are temporarily unavailable. Please try again soon." }, 503);
  }

  const location = [city, stateRegion].filter(Boolean).join(", ");
  const description = [
    `Program: ${program}`,
    org && `Organization: ${org}`,
    sport && `Sport: ${sport}`,
    location && `Location: ${location}`,
    email && `Contact: ${email}`,
    notes && `Notes: ${notes}`,
    ``,
    `Submitted via the adaptivesportsnearme.com pre-launch page.`,
  ].filter((l) => l !== false && l !== undefined).join("\n");

  const fields = {
    Title: program,
    Type: "New program",
    From: "Volunteer / Guest",
    Status: "New",
    Priority: "Medium",
    Description: description,
    Submitted: new Date().toISOString(),
  };

  let res;
  try {
    res = await fetch(
      `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_INBOX_TABLE_ID}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ records: [{ fields }], typecast: true }),
      }
    );
  } catch (err) {
    console.error("Airtable request failed:", err);
    return json({ ok: false, error: "Could not save right now. Please try again soon." }, 502);
  }

  if (!res.ok) {
    console.error("Airtable error", res.status, await safeText(res));
    return json({ ok: false, error: "Could not save right now. Please try again soon." }, 502);
  }

  // Also record in D1 (the directory's own data plane) — Airtable stays the team surface.
  if (env.DB) {
    try {
      await env.DB.prepare(
        `INSERT INTO submissions (kind, payload, contact_email, status, created_at)
         VALUES ('new_program', ?, ?, 'new', ?)`
      ).bind(
        JSON.stringify({ program, org, sport, city, state: stateRegion, notes }),
        email || null,
        new Date().toISOString()
      ).run();
    } catch (err) {
      console.error("D1 submission mirror failed:", err); // Airtable write already succeeded
    }
  }

  return json({ ok: true });
}

// ---- helpers ----------------------------------------------------------------
async function readBody(request) {
  try {
    const ct = request.headers.get("content-type") || "";
    return ct.includes("application/json")
      ? await request.json()
      : Object.fromEntries(await request.formData());
  } catch {
    return null;
  }
}

async function verifyTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET_KEY) return true; // not configured yet -> honeypot only
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip || undefined }),
    });
    const out = await res.json();
    return !!out.success;
  } catch (err) {
    console.error("turnstile verify failed:", err);
    return false;
  }
}

function str(v) {
  return (typeof v === "string" ? v : "").trim().slice(0, 5000);
}

async function safeText(res) {
  try { return await res.text(); } catch { return "(no body)"; }
}
