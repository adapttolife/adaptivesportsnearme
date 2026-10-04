import { safeNewsletterSubscribe } from './newsletter.js';
import { queueFormConfirmation } from './email.js';
import { notifyIntake } from './intake.js';
// Adaptive Sports Near Me — Worker entry.
// Serves the static site (env.ASSETS), the D1-backed directory API, the admin
// review surface, and the cron maintenance pipeline (validate + enrich lanes).
//   POST /api/subscribe        -> beehiiv (email capture, tagged asnm-prelaunch)
//   POST /api/submit-program   -> shared intake (hello@ notice) + D1 submissions
//   GET  /api/config           -> env name + prelaunch flag (front-end gate)
//   GET  /api/directory        -> cached full public snapshot for client filters/maps
//   GET  /api/programs         -> directory list (sport/state/q + zip/city/lat-lng nearby, paged)
//   GET  /programs/:id         -> shareable program page (photo hero, name, city/state, website, source)
//   GET  /api/grants           -> public grant list (athlete + program)
//   GET  /api/grants/:id       -> one grant
//   GET  /grants/:id           -> shareable grant page (same listing sheet as programs)
//   GET  /api/orgs/:id         -> one org with source provenance
//   GET  /api/stats            -> counts by sport/state
//   GET  /api/events           -> upcoming public events (json)
//   GET  /events.xml           -> the same feed as RSS 2.0
//   GET  /events.ics           -> the same feed as an iCalendar subscription
//   POST /api/profile          -> create/update a no-password profile (signed cookie)
//   GET  /api/profile          -> the signed-in profile + saved programs
//   POST /api/profile/favorites-> save/unsave a program
//   POST /api/profile/signout  -> clear the profile cookie
//   GET  /blog                 -> beehiiv-backed blog index (server-rendered HTML, SEO)
//   GET  /blog/:slug           -> beehiiv-backed blog post (server-rendered HTML, SEO)
//   *    /api/admin/*          -> review queue + lane triggers (ADMIN_KEY bearer)
// All secrets stay server-side (Worker secrets). Bot defence: honeypot + required Turnstile.

import { directorySnapshot, listPrograms, getOrg, stats, listSameSportNearby, listGrants, getGrant, listOtherGrants } from "./data.js";
import { programPageTemplate, programNotFoundTemplate, PROGRAM_ID_RE } from "./program-page.js";
import { grantPageTemplate, grantNotFoundTemplate, GRANT_ID_RE } from "./grant-page.js";
import { listEvents, eventsToRss, eventsToIcs } from "./events.js";
import { handleAdmin } from "./admin.js";
import { runLane } from "./pipeline.js";
import { json, text } from "./http.js";
import { cachedDirectoryResponse } from "./read-cache.js";
import {
  readProfileCookie, signProfileId, serializeProfileCookie, clearProfileCookie,
  getValidSportKeys, getProfileById, getProfileByEmail, createProfile, updateProfile,
  getProfileWithFavorites, orgExists, setFavorite, validState, parseSports,
} from "./profile.js";
import {
  listPosts, getPostBySlug, blogIndexTemplate, blogPostTemplate, blogFallbackTemplate, blogNotFoundTemplate,
} from "./blog.js";

const API_CACHE = "public, max-age=300, stale-while-revalidate=600";
const FEED_CACHE = "public, max-age=300";
const BLOG_PAGE_CACHE = "public, max-age=300";
const BLOG_FALLBACK_CACHE = "public, max-age=60"; // short — self-heals fast once beehiiv/secrets are back

// Single source for cron -> lane routing; must list every schedule in
// wrangler.json triggers. Unknown crons error loudly instead of misrouting.
const CRON_LANES = {
  "0 */2 * * *": "validate",
  "0 * * * *": "dispatch", // rotates enrich -> classify -> geocode -> resolve (pipeline.js)
};

const application = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // Versions uploaded with production config must not accept preview mutations.
    // Staging uploads use ENV_NAME=staging and the staging database bindings.
    if (env.ENV_NAME === 'production' && !['GET', 'HEAD'].includes(request.method) &&
      !['adaptivesportsnearme.com', 'www.adaptivesportsnearme.com'].includes(url.hostname)) {
      return json({ ok: false, error: 'This preview is read-only. Use the isolated review environment.' }, 403);
    }

    if (url.pathname === "/api/subscribe") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      const limited = await formLimited(request, env, 'Sign-up is temporarily unavailable.');
      if (limited) return limited;
      return handleSubscribe(request, env, ctx);
    }
    if (url.pathname === "/api/submit-program") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      const limited = await formLimited(request, env, 'Submissions are temporarily unavailable.');
      if (limited) return limited;
      return handleSubmitProgram(request, env, ctx);
    }
    if (url.pathname === "/api/profile") {
      if (request.method === "POST") return handleProfileUpsert(request, env, ctx);
      if (request.method === "GET") return handleProfileGet(request, env);
      return json({ ok: false, error: "Method not allowed" }, 405);
    }
    if (url.pathname === "/api/profile/favorites") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      return handleProfileFavorite(request, env);
    }
    if (url.pathname === "/api/profile/signout") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      return handleProfileSignout();
    }

    if (url.pathname === "/api/location") {
      if (request.method !== 'GET') return json({ ok: false, error: 'Method not allowed' }, 405);
      const cf = request.cf || {};
      const latitude = cf.latitude == null || cf.latitude === '' ? NaN : Number(cf.latitude);
      const longitude = cf.longitude == null || cf.longitude === '' ? NaN : Number(cf.longitude);
      const valid = Number.isFinite(latitude) && Math.abs(latitude) <= 90 && Number.isFinite(longitude) && Math.abs(longitude) <= 180;
      return json({
        city: cf.city || null, region: cf.regionCode || cf.region || null,
        lat: valid ? latitude : null, lng: valid ? longitude : null
      }, 200, 'private, no-store');
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
        if (url.pathname === "/api/directory") {
          return json({ ok: true, ...(await directorySnapshot(env.DB)) }, 200, API_CACHE);
        }
        if (url.pathname === "/api/programs") {
          return json({ ok: true, ...(await listPrograms(env.DB, url.searchParams, { assets: env.ASSETS })) }, 200, API_CACHE);
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
        if (url.pathname === "/api/grants") {
          return json({ ok: true, ...(await listGrants(env.DB, url.searchParams)) }, 200, API_CACHE);
        }
        const grantApi = url.pathname.match(/^\/api\/grants\/([0-9a-f-]{36})$/);
        if (grantApi) {
          const record = await getGrant(env.DB, grantApi[1]);
          return record ? json({ ok: true, grant: record }, 200, API_CACHE)
            : json({ ok: false, error: "Not found" }, 404);
        }
        if (url.pathname === "/api/events") {
          return json({ ok: true, ...(await listEvents(env.DB, url.searchParams)) }, 200, API_CACHE);
        }
        if (url.pathname === "/events.xml") {
          const { items } = await listEvents(env.DB, url.searchParams);
          return text(eventsToRss(items, url.origin), 200, "application/rss+xml; charset=utf-8", FEED_CACHE);
        }
        if (url.pathname === "/events.ics") {
          const { items } = await listEvents(env.DB, url.searchParams);
          return text(eventsToIcs(items), 200, "text/calendar; charset=utf-8", FEED_CACHE);
        }
      } catch (err) {
        console.error("data api error:", err);
        return json({ ok: false, error: "Data temporarily unavailable" }, 500);
      }
    }
    if (url.pathname.startsWith("/api/admin/") && env.DB) {
      return handleAdmin(request, env, url);
    }

    // Blog — server-rendered (SEO), not a SPA branch. Beehiiv is the CMS.
    if (url.pathname === "/blog" || url.pathname === "/blog/") {
      return handleBlogIndex(url, env);
    }
    const blogSlug = url.pathname.match(/^\/blog\/([^/]+)$/);
    if (blogSlug) {
      return handleBlogPost(url, env, decodeURIComponent(blogSlug[1]));
    }

    // Shareable program page — server-rendered so a curl / a pasted link shows
    // the same photo-hero sheet as the in-app detail (name, city/state, website, source).
    const programPath = url.pathname.match(PROGRAM_ID_RE);
    if (programPath && env.DB) {
      try {
        const record = await getOrg(env.DB, programPath[1]);
        if (!record) return text(programNotFoundTemplate({ site: url.origin }), 404, "text/html; charset=utf-8");
        const nearby = await listSameSportNearby(env.DB, record, 6);
        return text(programPageTemplate(record, { site: url.origin, nearby }), 200, "text/html; charset=utf-8", API_CACHE);
      } catch (err) {
        console.error("program page error:", err);
        return text(programNotFoundTemplate({ site: url.origin }), 500, "text/html; charset=utf-8");
      }
    }

    const grantPath = url.pathname.match(GRANT_ID_RE);
    if (grantPath && env.DB) {
      try {
        const record = await getGrant(env.DB, grantPath[1]);
        if (!record) return text(grantNotFoundTemplate({ site: url.origin }), 404, "text/html; charset=utf-8");
        const nearby = await listOtherGrants(env.DB, record, 6);
        return text(grantPageTemplate(record, { site: url.origin, nearby }), 200, "text/html; charset=utf-8", API_CACHE);
      } catch (err) {
        console.error("grant page error:", err);
        return text(grantNotFoundTemplate({ site: url.origin }), 500, "text/html; charset=utf-8");
      }
    }

    // Sample listings use slugs rather than D1 UUIDs. Load the shell so its
    // route parser can select them on direct visits, just as it does on clicks.
    // UUID requests with a DB have already used the server-rendered routes above.
    if (/^\/(programs|grants)\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/i.test(url.pathname)) {
      return env.ASSETS.fetch(new Request(new URL("/", url), request));
    }

    // /maps is the map explorer's real URL — same app, booted into the map.
    if (url.pathname === "/maps" || url.pathname === "/maps/") {
      return env.ASSETS.fetch(new Request(new URL("/", url), request));
    }
    // /profile and /events are real URLs for their sections — same mechanism as
    // /maps. /events is also where the RSS feed's item links land.
    if (/^\/(profile|events|grants|sports|directory)\/?$/.test(url.pathname) ||
      /^\/sports\/(basketball|tennis|pickleball|rugby|football|baseball|cycling|sledhockey|skiing|waterskiing|goalball)\/?$/.test(url.pathname) ||
      /^\/directory\/(sports|programs|providers|events|equipment|grants|resources)\/?$/.test(url.pathname)) {
      return env.ASSETS.fetch(new Request(new URL("/", url), request));
    }

    // Everything else: the static site.
    return env.ASSETS.fetch(request);
  },

  async scheduled(controller, env, ctx) {
    if (!env.DB) return;
    const lane = CRON_LANES[controller.cron];
    if (!lane) {
      console.error(`no lane mapped for cron "${controller.cron}" — update CRON_LANES + wrangler.json together`);
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

export default {
  ...application,
  fetch(request, env, ctx) {
    return cachedDirectoryResponse(request, env, () => application.fetch(request, env, ctx));
  },
};

// ---- Email capture -> beehiiv ------------------------------------------------
async function handleSubscribe(request, env, ctx) {
  const data = await readBody(request);
  if (data === null) return json({ ok: false, error: "Could not read your submission." }, 400);

  // Honeypot — bots fill the hidden "company" field. Accept silently, do nothing.
  if (str(data.company)) return json({ ok: true });

  // Turnstile is REQUIRED here (Alec, 2026-10-02). This was honeypot-only while
  // signup only touched beehiiv; it now records intake, notifies hello@ and sends a
  // welcome email from our own mailbox, so an unchecked endpoint would let anyone
  // make us mail any address. Every form that posts here renders the widget.
  if (!(await verifyTurnstile(env, str(data.cf_token), request.headers.get("CF-Connecting-IP")))) {
    return json({ ok: false, error: "Verification failed. Please reload the page and try again." }, 403);
  }

  const email = str(data.em);
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: "Please enter a valid email." }, 422);
  }

  const source = str(data.source).slice(0, 80) || "asnm-prelaunch";
  // First name and the beta opt-in are both optional. Name is a courtesy (it
  // personalises the receipt and the launch email); beta is a real segment we
  // mail before anyone else. Neither may ever block the capture: the email is
  // the point.
  const name = str(data.nm).slice(0, 60);
  const beta = parseBetaFlag(data.beta);
  const result = await safeNewsletterSubscribe(env, email, source, { name, beta });
  if (!result.ok) return json({
    ok: false, error: result.error,
    ...(env.ENV_NAME === 'staging' && result.diagnostic ? { diagnostic: result.diagnostic } : {}),
  }, result.status);
  if (result.welcomeJob) {
    if (ctx?.waitUntil) ctx.waitUntil(result.welcomeJob);
    else await result.welcomeJob;
  }

  return json({ ok: true });
}

// Maps our two optional signup answers onto the publication's custom fields.
// `name` is dropped when blank so a later signup without a name cannot wipe an
// earlier one; `beta` is only sent when true, for the same reason.
// An unchecked checkbox is simply absent from the form body, so anything we do
// not recognise as a yes is a no. Exported for test.
export function parseBetaFlag(v) {
  return ["1", "true", "on", "yes"].includes(str(v).toLowerCase());
}

export { beehiivCustomFields } from './newsletter.js';

// Shared beehiiv POST, factored out of handleSubscribe so /api/profile's newsletter
// opt-in reuses the exact same call instead of duplicating it. Returns a plain
// {ok, status, error} shape rather than a Response — callers decide the envelope.
async function subscribeToBeehiiv(env, email, campaign, extra = {}) {
  return safeNewsletterSubscribe(env, email, campaign, { ...extra, noWelcome: true });
}

// ---- Program submission -> shared intake + D1 submissions -------------------
// Capture first (the intake contract, src/intake.js): the submission is written
// to the shared intake and the directory's submissions table BEFORE anything
// that can fail quietly, and ok:true is returned only once both rows exist.
// The intake row carries a pending delivery claim, so hello@ is notified by
// this request (best-effort) or, failing that, by the scheduled sweepIntake.
// Airtable is retired: nothing reads the old Agent Inbox base, so nothing writes it.
export const PROGRAM_INTAKE_KIND = "program";
const PROGRAM_SID_RE = /^[A-Za-z0-9-]{8,64}$/;
const programUnavailable = { ok: false, error: "Could not save right now. Please try again soon." };

// Stable id for one submission. The form sends a per-attempt `sid` that
// survives a double-click or a retry after an error; the content is hashed in
// as well, so a corrected resubmission is a new record while an identical
// retry is the same one. Exported for test.
export async function programSubmissionId(sid, email, payload) {
  const material = ["program", PROGRAM_SID_RE.test(sid) ? sid : "", email.toLowerCase(), JSON.stringify(payload)].join("\n");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(material));
  return "program:" + Array.from(new Uint8Array(digest), (x) => x.toString(16).padStart(2, "0")).join("");
}

async function handleSubmitProgram(request, env, ctx) {
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
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: "Please enter a valid email so we can confirm your submission." }, 422);
  }

  if (!env.INTAKE || !env.DB) {
    console.error("Program submission unavailable", { reason: "binding-missing", intake: !!env.INTAKE, db: !!env.DB });
    return json({ ok: false, error: "Submissions are temporarily unavailable. Please try again soon." }, 503);
  }

  const answers = { program, org, sport, city, state: stateRegion, notes };
  const intakeId = await programSubmissionId(str(data.sid), email, answers);
  const location = [city, stateRegion].filter(Boolean).join(", ");
  // The summary is the notice's subject line: one line, bounded.
  const summary = `New program submission: ${program.slice(0, 120)}${location ? ` (${location.slice(0, 80)})` : ""}`.replace(/[\r\n]+/g, " ");
  const source = str(data.source).slice(0, 80) || "asnm-prelaunch";
  const now = new Date().toISOString();

  let stage = "intake-capture";
  let fresh;
  try {
    // Intake row + its pending delivery claim are one transaction, the same
    // shape the newsletter path writes. INSERT OR IGNORE makes a retry a no-op.
    await env.INTAKE.batch([
      env.INTAKE.prepare(`INSERT OR IGNORE INTO intake (id,received_at,site,kind,name,email,summary,payload,source,is_canary) VALUES (?,?,'adaptivesportsnearme.com',?,?,?,?,?,?,0)`)
        .bind(intakeId, now, PROGRAM_INTAKE_KIND, null, email, summary, JSON.stringify(answers), source),
      env.INTAKE.prepare("INSERT OR IGNORE INTO intake_delivery_claims (intake_id,state) VALUES (?,'pending')").bind(intakeId),
    ]);
    // In production DB (asnm-db) and INTAKE (atl-intake) are separate D1
    // databases, so one batch cannot span them. The submissions write is
    // idempotent on the same id, so a failure here is safe to retry.
    stage = "submission-capture";
    const result = await env.DB.prepare(
      `INSERT INTO submissions (kind, payload, contact_email, status, created_at)
       SELECT 'new_program', ?, ?, 'new', ?
       WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE kind = 'new_program' AND json_extract(payload, '$.intake_id') = ?)`
    ).bind(JSON.stringify({ ...answers, intake_id: intakeId }), email, now, intakeId).run();
    fresh = Number(result?.meta?.changes ?? result?.changes ?? 0) > 0;
  } catch (error) {
    const message = String(error?.message || "");
    const reason = /no such table|no such column|has no column named/i.test(message) ? "database-schema-missing"
      : /constraint failed/i.test(message) ? "database-constraint" : "operation-failed";
    // Fixed categories only: raw errors can carry the bound email.
    console.error("Program submission failed closed", { stage, reason });
    return json(env.ENV_NAME === "staging" ? { ...programUnavailable, diagnostic: { stage, reason } } : programUnavailable, 502);
  }

  // Captured. Correspondence never holds the response and never un-saves it.
  // The house notice is claim-gated (at most once); the submitter receipt goes
  // out only for the first capture of this id, so a retry does not mail twice.
  const notice = notifyIntake(env, intakeId);
  if (ctx?.waitUntil) ctx.waitUntil(notice); else await notice;
  if (fresh) await queueFormConfirmation(env, ctx, { kind: 'program', email, program });

  return json({ ok: true });
}

// ---- Profiles (no passwords) -------------------------------------------------
const PROFILE_CACHE = "private, no-store"; // a profile is one person's data, never shared

async function handleProfileUpsert(request, env, ctx) {
  if (!env.DB) return json({ ok: false, error: "Profiles are temporarily unavailable. Please try again soon." }, 503);
  if (!env.PROFILE_SIGNING_KEY) {
    console.error("PROFILE_SIGNING_KEY not configured");
    return json({ ok: false, error: "Profiles are warming up. Please try again soon." }, 503);
  }

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
  const name = str(data.name).slice(0, 200);
  const stateCode = validState(data.state);
  const newsletter = data.newsletter === true || data.newsletter === "true" || data.newsletter === "on" || data.newsletter === "1";

  let validKeys;
  try {
    validKeys = await getValidSportKeys(env.DB);
  } catch (err) {
    console.error("sports lookup failed:", err);
    return json({ ok: false, error: "Profiles are temporarily unavailable. Please try again soon." }, 503);
  }
  const sports = parseSports(data.sports, validKeys);

  const existingId = await readProfileCookie(request, env.PROFILE_SIGNING_KEY);
  let id, isNew = false;

  try {
    if (existingId) {
      const existing = await getProfileById(env.DB, existingId);
      if (!existing) return json({ ok: false, error: "Your profile could not be found. Please start again." }, 404);
      await updateProfile(env.DB, existingId, { email, name, state: stateCode, sports, newsletter });
      id = existingId;
    } else {
      const dupe = await getProfileByEmail(env.DB, email);
      if (dupe) {
        return json({ ok: false, error: "That email already has a profile on another device. Recovery by email link is coming soon." }, 409);
      }
      id = await createProfile(env.DB, { email, name, state: stateCode, sports, newsletter });
      isNew = true;
    }
  } catch (err) {
    // Covers the UNIQUE(email) race between the read above and the write, on both
    // create and update (an update can also collide if the new email belongs to
    // someone else's profile).
    console.error("profile save failed:", err);
    return json({ ok: false, error: "That email already has a profile on another device. Recovery by email link is coming soon." }, 409);
  }

  if (newsletter) {
    const result = await subscribeToBeehiiv(env, email, "asnm-profile");
    if (result.welcomeJob) {
      if (ctx?.waitUntil) ctx.waitUntil(result.welcomeJob);
      else await result.welcomeJob;
    }
    if (!result.ok) console.error("profile newsletter opt-in failed:", result.error); // profile save already succeeded
  }

  const sig = await signProfileId(id, env.PROFILE_SIGNING_KEY);
  await queueFormConfirmation(env, ctx, { kind: isNew ? 'profile-created' : 'profile-updated', email });
  return new Response(JSON.stringify({ ok: true, id, isNew }), {
    status: isNew ? 201 : 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Set-Cookie": serializeProfileCookie(id, sig) },
  });
}

async function handleProfileGet(request, env) {
  if (!env.DB) return json({ ok: false }, 503, PROFILE_CACHE);
  if (!env.PROFILE_SIGNING_KEY) {
    console.error("PROFILE_SIGNING_KEY not configured");
    return json({ ok: false }, 503, PROFILE_CACHE);
  }

  const id = await readProfileCookie(request, env.PROFILE_SIGNING_KEY);
  if (!id) return json({ ok: false }, 401, PROFILE_CACHE);

  try {
    const profile = await getProfileWithFavorites(env.DB, id);
    if (!profile) return json({ ok: false }, 401, PROFILE_CACHE);
    return json({ ok: true, profile }, 200, PROFILE_CACHE);
  } catch (err) {
    console.error("profile fetch failed:", err);
    return json({ ok: false, error: "Profile temporarily unavailable" }, 500, PROFILE_CACHE);
  }
}

async function handleProfileFavorite(request, env) {
  if (!env.DB) return json({ ok: false, error: "Profiles are temporarily unavailable. Please try again soon." }, 503);
  if (!env.PROFILE_SIGNING_KEY) {
    console.error("PROFILE_SIGNING_KEY not configured");
    return json({ ok: false, error: "Profiles are warming up. Please try again soon." }, 503);
  }

  const id = await readProfileCookie(request, env.PROFILE_SIGNING_KEY);
  if (!id) return json({ ok: false, error: "Create a free profile to save programs." }, 401);

  const data = await readBody(request);
  if (data === null) return json({ ok: false, error: "Could not read your submission." }, 400);

  const orgId = str(data.org_id);
  if (!orgId) return json({ ok: false, error: "Missing program." }, 422);
  const on = data.on === true || data.on === "true" || data.on === "1";

  try {
    if (!(await orgExists(env.DB, orgId))) return json({ ok: false, error: "That program was not found." }, 404);
    await setFavorite(env.DB, id, orgId, on);
    return json({ ok: true, org_id: orgId, on });
  } catch (err) {
    console.error("favorite toggle failed:", err);
    return json({ ok: false, error: "Could not save right now. Please try again soon." }, 500);
  }
}

function handleProfileSignout() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Set-Cookie": clearProfileCookie() },
  });
}

// ---- Blog (Beehiiv is the CMS) -----------------------------------------------
async function handleBlogIndex(url, env) {
  const site = url.origin;
  try {
    const result = await listPosts(env);
    if (!result.ok) return text(blogFallbackTemplate({ site }), 200, "text/html; charset=utf-8", BLOG_FALLBACK_CACHE);
    return text(blogIndexTemplate(result.posts, { site }), 200, "text/html; charset=utf-8", BLOG_PAGE_CACHE);
  } catch (err) {
    console.error("blog index failed:", err);
    return text(blogFallbackTemplate({ site }), 200, "text/html; charset=utf-8", BLOG_FALLBACK_CACHE);
  }
}

async function handleBlogPost(url, env, slug) {
  const site = url.origin;
  try {
    const result = await getPostBySlug(env, slug);
    if (result.notFound) return text(blogNotFoundTemplate({ site }), 404, "text/html; charset=utf-8", BLOG_FALLBACK_CACHE);
    if (!result.ok) return text(blogFallbackTemplate({ site }), 200, "text/html; charset=utf-8", BLOG_FALLBACK_CACHE);
    return text(blogPostTemplate(result.post, { site }), 200, "text/html; charset=utf-8", BLOG_PAGE_CACHE);
  } catch (err) {
    console.error("blog post failed:", err);
    return text(blogFallbackTemplate({ site }), 200, "text/html; charset=utf-8", BLOG_FALLBACK_CACHE);
  }
}

// ---- helpers ----------------------------------------------------------------
// One per-IP limiter for every public form. Fails closed: a limiter error, or
// a missing limiter where one is required, refuses the submission.
async function formLimited(request, env, unavailable) {
  if (env.FORM_LIMITER) {
    try {
      const { success } = await env.FORM_LIMITER.limit({ key: request.headers.get('CF-Connecting-IP') || 'unknown' });
      if (!success) return json({ ok: false, error: 'Too many submissions. Please try again later.' }, 429);
    } catch { return json({ ok: false, error: unavailable }, 503); }
  } else if (env.REQUIRE_FORM_LIMITER === 'true') {
    return json({ ok: false, error: unavailable }, 503);
  }
  return null;
}

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
  // Unconfigured is tolerated only outside production. A production Worker that has
  // lost its secret fails closed rather than silently becoming an open relay.
  if (!env.TURNSTILE_SECRET_KEY) return env.ENV_NAME !== "production";
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

