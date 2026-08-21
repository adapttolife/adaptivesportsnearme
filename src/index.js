// Adaptive Sports Near Me — Worker entry.
// Serves the static site (env.ASSETS), the D1-backed directory API, the admin
// review surface, and the cron maintenance pipeline (validate + enrich lanes).
//   POST /api/subscribe        -> beehiiv (email capture, tagged asnm-prelaunch)
//   POST /api/submit-program   -> Airtable Agent Inbox + D1 submissions
//   GET  /api/config           -> env name + prelaunch flag (front-end gate)
//   GET  /api/programs         -> directory list (sport/state/q + zip/city/lat-lng nearby, paged)
//   GET  /programs/:id         -> shareable program page (photo hero, name, city/state, website, source)
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
// All secrets stay server-side (Worker secrets). Bot defence: honeypot + optional Turnstile.

import { listPrograms, getOrg, stats } from "./data.js";
import { programPageTemplate, programNotFoundTemplate, PROGRAM_ID_RE } from "./program-page.js";
import { listEvents, eventsToRss, eventsToIcs } from "./events.js";
import { handleAdmin } from "./admin.js";
import { runLane } from "./pipeline.js";
import { json, text } from "./http.js";
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
    if (url.pathname === "/api/profile") {
      if (request.method === "POST") return handleProfileUpsert(request, env);
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
        return text(programPageTemplate(record, { site: url.origin }), 200, "text/html; charset=utf-8", API_CACHE);
      } catch (err) {
        console.error("program page error:", err);
        return text(programNotFoundTemplate({ site: url.origin }), 500, "text/html; charset=utf-8");
      }
    }

    // /maps is the map explorer's real URL — same app, booted into the map.
    if (url.pathname === "/maps" || url.pathname === "/maps/") {
      return env.ASSETS.fetch(new Request(new URL("/", url), request));
    }
    // /profile and /events are real URLs for their sections — same mechanism as
    // /maps. /events is also where the RSS feed's item links land.
    if (/^\/(profile|events)\/?$/.test(url.pathname)) {
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

  // Newsletter subscribe is honeypot-only by design: it's a low-value target (Beehiiv
  // dedupes/validates, nothing writes to our systems), so we don't tax the highest-
  // conversion forms with a Turnstile widget. If a token IS sent (footer/gate forms
  // include one) we still verify it; a missing token is fine here. Turnstile stays
  // REQUIRED on handleSubmitProgram, which writes to the Airtable inbox.
  const cfTok = str(data.cf_token);
  if (cfTok && !(await verifyTurnstile(env, cfTok, request.headers.get("CF-Connecting-IP")))) {
    return json({ ok: false, error: "Verification failed. Please reload the page and try again." }, 403);
  }

  const email = str(data.em);
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: "Please enter a valid email." }, 422);
  }

  const source = str(data.source).slice(0, 80) || "asnm-prelaunch";
  const result = await subscribeToBeehiiv(env, email, source);
  if (!result.ok) return json({ ok: false, error: result.error }, result.status);

  return json({ ok: true });
}

// Shared beehiiv POST, factored out of handleSubscribe so /api/profile's newsletter
// opt-in reuses the exact same call instead of duplicating it. Returns a plain
// {ok, status, error} shape rather than a Response — callers decide the envelope.
async function subscribeToBeehiiv(env, email, campaign) {
  if (!env.BEEHIIV_API_KEY || !env.BEEHIIV_PUBLICATION_ID) {
    console.error("beehiiv not configured (missing API key or publication id)");
    return { ok: false, status: 503, error: "Sign-up is temporarily unavailable. Please try again soon." };
  }

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
          utm_campaign: campaign,
          referring_site: "adaptivesportsnearme.com",
        }),
      }
    );
  } catch (err) {
    console.error("beehiiv request failed:", err);
    return { ok: false, status: 502, error: "Could not sign you up right now. Please try again soon." };
  }

  if (!res.ok) {
    console.error("beehiiv error", res.status, await safeText(res));
    return { ok: false, status: 502, error: "Could not sign you up right now. Please try again soon." };
  }

  return { ok: true };
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

// ---- Profiles (no passwords) -------------------------------------------------
const PROFILE_CACHE = "private, no-store"; // a profile is one person's data, never shared

async function handleProfileUpsert(request, env) {
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
    if (!result.ok) console.error("profile newsletter opt-in failed:", result.error); // profile save already succeeded
  }

  const sig = await signProfileId(id, env.PROFILE_SIGNING_KEY);
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
