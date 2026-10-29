import { servePage, robotsTxt, sitemapXml } from "./pages.js";
import { safeNewsletterSubscribe } from './newsletter.js';
import { queueFormConfirmation, sendAdminLoginLink, sendBetaLoginLink, sendOrganizationLoginLink, sendProfileLoginLink } from './email.js';
import { notifyIntake } from './intake.js';
// Adaptive Sports Near Me — Worker entry.
// Serves the static site (env.ASSETS), the D1-backed directory API, the admin
// review surface, and the cron maintenance pipeline (validate + enrich lanes).
//   POST /api/subscribe        -> beehiiv (email capture, tagged asnm-prelaunch)
//   POST /api/submit-program   -> shared intake (hello@ notice) + D1 submissions (new program or a fix to a listing)
//   POST /api/submit-event     -> the same path for a suggested event
//   GET  /api/config           -> env name + prelaunch flag (front-end gate)
//   GET  /api/listings         -> cached slim snapshot the site's lists and maps load first
//   GET  /api/directory        -> cached full public snapshot for client filters/maps
//   GET  /api/programs         -> directory list (sport/state/q + zip/city/lat-lng nearby, paged)
//   GET  /, /programs/:id, /sports/:key, /states/:st, /grants, /events, ... -> the site's
//                                 pages: one app shell (public/index.html + public/app/) with
//                                 each page's own title, description and canonical (src/pages.js)
//   GET  /api/grants           -> public grant list (athlete + program)
//   GET  /api/grants/:id       -> one grant
//   GET  /api/orgs/:id         -> one org with source provenance
//   GET  /api/stats            -> counts by sport/state
//   GET  /api/events           -> upcoming public events (json)
//   GET  /api/event-series     -> yearly events with every year's dates (?org=<id> for one host)
//   GET  /api/event-series/:slug -> one yearly event (docs/specs/programs-that-come-back.md)
//   GET  /events.xml           -> the same feed as RSS 2.0
//   GET  /events.ics           -> the same feed as an iCalendar subscription
//   POST /api/profile          -> create/update a no-password profile (signed cookie)
//   GET  /api/profile          -> the signed-in profile + saved programs
//   POST /api/profile/favorites-> save/unsave a program
//   POST /api/profile/signout  -> clear the profile cookie
//   GET  /blog                 -> beehiiv-backed blog index (server-rendered HTML, SEO)
//   GET  /blog/:slug           -> beehiiv-backed blog post (server-rendered HTML, SEO)
// All secrets stay server-side (Worker secrets). Bot defence: honeypot + required Turnstile.

import { directorySnapshot, listingsSnapshot, listActualPrograms, getProgram, getOrg, stats, listGrants, getGrant } from "./data.js";
import { listEvents, eventsToRss, eventsToIcs, listSeries, getSeries } from "./events.js";
import { parseSportsAnswer, parseYearlyAnswer, parseCheckup, parseFixReason } from "./listing-answers.js";
import { logActivity, sportsSummary, yearlySummary, checkupSummary, FIX_WORDS } from "./offerings.js";
import { runLane } from "./pipeline.js";
import { json, text } from "./http.js";
import { cachedDirectoryResponse } from "./read-cache.js";
import { loadPlaces } from "./geo.js";
import {
  readProfileCookie, signProfileId, serializeProfileCookie, clearProfileCookie,
  getValidSportKeys, getProfileById, getProfileByEmail, createProfile, updateProfile,
  getProfileWithFavorites, orgExists, setFavorite, validState, parseSports,
  issueProfileLoginToken, consumeProfileLoginToken, findOrCreateProfile, setSavedItem,
} from "./profile.js";
import {
  clearOrgCookie, consumeLoginToken, createOrganizationSession, issueLoginToken, serializeOrgCookie,
  organizationsForClaimEmail, organizationForClaimEmail, readOrganizationSession,
  updateClaimedOrganization, validEmail, managedOrganizationPrograms, createManagedProgram, updateManagedProgram, deleteManagedProgram,
  managedOrganizationEvents, createManagedEvent, updateManagedEvent, deleteManagedEvent,
} from "./organization-access.js";
import {
  acceptAdminQueueItem, clearAdminCookie, consumeAdminLoginToken, createAdminSession, createAdminItem, getAdminItem,
  getAdminQueueItem, isAdminEmail, issueAdminLoginToken, listAdminItems, listAdminQueue, readAdminSession, saveAdminItem, serializeAdminCookie,
  adminOrganizationActivity, addAdminNote,
} from "./admin-access.js";
import {
  listPosts, getPostBySlug, blogIndexTemplate, blogPostTemplate, blogFallbackTemplate, blogNotFoundTemplate,
} from "./blog.js";
import {
  betaAuthReady, clearBetaCookie, consumeBetaLoginToken, createBetaSession,
  isBetaTester, issueBetaLoginToken, listBetaTesters, readBetaSession,
  serializeBetaCookie, setBetaTester,
} from "./beta-access.js";

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
    if (env.ENV_NAME === 'production' &&
      (!['GET', 'HEAD'].includes(request.method) || url.pathname === '/api/org-auth/verify') &&
      !['adaptivesportsnearme.com', 'www.adaptivesportsnearme.com'].includes(url.hostname)) {
      return json({ ok: false, error: 'This preview is read-only. Use the isolated review environment.' }, 403);
    }
    const betaGate = await prelaunchGate(request, env, url);
    if (betaGate) return betaGate;

    if (url.pathname === "/api/beta-auth/request-link") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      const limited = await formLimited(request, env, "Beta sign-in is temporarily unavailable.");
      if (limited) return limited;
      return handleBetaLoginRequest(request, env, url);
    }
    if (url.pathname === "/api/beta-auth/verify") {
      if (request.method !== "GET") return json({ ok: false, error: "Method not allowed" }, 405);
      return handleBetaLoginVerify(url, env);
    }
    if (url.pathname === "/api/beta-auth/session") {
      if (request.method !== "GET") return json({ ok: false, error: "Method not allowed" }, 405);
      return handleBetaSession(request, env);
    }
    if (url.pathname === "/api/beta-auth/signout") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Set-Cookie": clearBetaCookie() } });
    }
    if (url.pathname === "/api/subscribe") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      const limited = await formLimited(request, env, 'Sign-up is temporarily unavailable.');
      if (limited) return limited;
      return handleSubscribe(request, env, ctx);
    }
    if (url.pathname === "/api/submit-program" || url.pathname === "/api/submit-organization" || url.pathname === "/api/submit-event") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      const limited = await formLimited(request, env, 'Submissions are temporarily unavailable.');
      if (limited) return limited;
      return handleSubmitProgram(request, env, ctx, {
        event: url.pathname === "/api/submit-event",
        organization: url.pathname === "/api/submit-organization",
      });
    }
    if (url.pathname === "/api/profile") {
      if (request.method === "POST") return handleProfileUpsert(request, env, ctx);
      if (request.method === "GET") return handleProfileGet(request, env);
      return json({ ok: false, error: "Method not allowed" }, 405);
    }
    if (url.pathname === "/api/profile-auth/request-link") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      const limited = await formLimited(request, env, "Sign-in is temporarily unavailable.");
      if (limited) return limited;
      return handleProfileLoginRequest(request, env, url);
    }
    if (url.pathname === "/api/profile-auth/verify") {
      if (request.method !== "GET") return json({ ok: false, error: "Method not allowed" }, 405);
      return handleProfileLoginVerify(url, env);
    }
    if (url.pathname === "/api/profile-auth/session") {
      if (request.method !== "GET") return json({ ok: false, error: "Method not allowed" }, 405);
      return handleProfileGet(request, env);
    }
    if (url.pathname === "/api/profile/saved") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      return handleProfileSaved(request, env);
    }
    if (url.pathname === "/api/profile/favorites") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      return handleProfileFavorite(request, env);
    }
    if (url.pathname === "/api/profile/signout") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      return handleProfileSignout();
    }
    if (url.pathname === "/api/org-auth/request-link") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      const limited = await formLimited(request, env, 'Sign-in is temporarily unavailable.');
      if (limited) return limited;
      return handleOrganizationLoginRequest(request, env, url);
    }
    if (url.pathname === "/api/org-auth/verify") {
      if (request.method !== "GET") return json({ ok: false, error: "Method not allowed" }, 405);
      return handleOrganizationLoginVerify(url, env);
    }
    if (url.pathname === "/api/org-auth/session") {
      if (request.method !== "GET") return json({ ok: false, error: "Method not allowed" }, 405);
      return handleOrganizationSession(request, env);
    }
    if (url.pathname === "/api/org-auth/signout") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Set-Cookie": clearOrgCookie() } });
    }
    if (url.pathname === "/api/admin-auth/request-link") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      const limited = await formLimited(request, env, "Admin sign-in is temporarily unavailable.");
      if (limited) return limited;
      return handleAdminLoginRequest(request, env, url);
    }
    if (url.pathname === "/api/admin-auth/verify") {
      if (request.method !== "GET") return json({ ok: false, error: "Method not allowed" }, 405);
      return handleAdminLoginVerify(url, env);
    }
    if (url.pathname === "/api/admin-auth/session") {
      if (request.method !== "GET") return json({ ok: false, error: "Method not allowed" }, 405);
      return handleAdminSession(request, env);
    }
    if (url.pathname === "/api/admin-auth/signout") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Set-Cookie": clearAdminCookie() } });
    }
    if (url.pathname === "/api/admin-data/beta-testers") return handleAdminBetaTesters(request, env);
    const adminItem = url.pathname.match(/^\/api\/admin-data\/(organizations|programs|events|grants)(?:\/([0-9a-f-]{36}))?$/i);
    if (adminItem) return handleAdminData(request, env, url, adminItem[1].toLowerCase(), adminItem[2]);
    const adminActivity = url.pathname.match(/^\/api\/admin-data\/organizations\/([0-9a-f-]{36})\/activity$/i);
    if (adminActivity) return handleAdminActivity(request, env, adminActivity[1].toLowerCase());
    const adminQueue = url.pathname.match(/^\/api\/admin-data\/queue(?:\/(\d+))?$/i);
    if (adminQueue) return handleAdminQueue(request, env, adminQueue[1]);
    const managedOrganization = url.pathname.match(/^\/api\/organizations\/([0-9a-f-]{36})\/manage$/i);
    if (managedOrganization) {
      if (!["GET", "PATCH"].includes(request.method)) return json({ ok: false, error: "Method not allowed" }, 405);
      return request.method === "GET"
        ? handleManagedOrganizationGet(request, env, managedOrganization[1])
        : handleManagedOrganizationUpdate(request, env, managedOrganization[1]);
    }
    const managedItems = url.pathname.match(/^\/api\/organizations\/([0-9a-f-]{36})\/manage\/(programs|events)(?:\/([a-z0-9-]{1,80}))?$/i);
    if (managedItems) return handleManagedOrganizationItems(request, env, managedItems[1], managedItems[2], managedItems[3]);

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
        if (url.pathname === "/api/listings") {
          const places = await loadPlaces(env.ASSETS);
          return json({ ok: true, ...(await listingsSnapshot(env.DB, { places })) }, 200, API_CACHE);
        }
        if (url.pathname === "/api/directory") {
          const places = await loadPlaces(env.ASSETS);
          return json({ ok: true, ...(await directorySnapshot(env.DB, { places })) }, 200, API_CACHE);
        }
        if (url.pathname === "/api/programs") {
          return json({ ok: true, ...(await listActualPrograms(env.DB, url.searchParams)) }, 200, API_CACHE);
        }
        // Program ids are UUIDs, plus a few readable ones (program-lutz-buddy-up-venice).
        const program = url.pathname.match(/^\/api\/programs\/([a-z0-9-]{1,80})$/);
        if (program) {
          const record = await getProgram(env.DB, program[1]);
          return record ? json({ ok: true, program: record }, 200, API_CACHE) : json({ ok: false, error: "Not found" }, 404);
        }
        const org = url.pathname.match(/^\/api\/(?:orgs|organizations)\/([0-9a-f-]{36})$/);
        if (org) {
          const record = await getOrg(env.DB, org[1]);
          return record ? json({ ok: true, organization: record, org: record }, 200, API_CACHE)
            : json({ ok: false, error: "Not found" }, 404);
        }
        const organizationPrograms = url.pathname.match(/^\/api\/organizations\/([0-9a-f-]{36})\/programs$/);
        if (organizationPrograms) {
          const items = await listActualPrograms(env.DB, new URLSearchParams({ organization_id: organizationPrograms[1], limit: "200" }));
          return json({ ok: true, ...items }, 200, API_CACHE);
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
        if (url.pathname === "/api/event-series") {
          return json({ ok: true, ...(await listSeries(env.DB, url.searchParams)) }, 200, API_CACHE);
        }
        const seriesApi = url.pathname.match(/^\/api\/event-series\/([a-z0-9-]{1,80})$/);
        if (seriesApi) {
          const record = await getSeries(env.DB, seriesApi[1]);
          return record ? json({ ok: true, series: record }, 200, API_CACHE) : json({ ok: false, error: "Not found" }, 404);
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
    // Blog — server-rendered (SEO), not a SPA branch. Beehiiv is the CMS.
    if (url.pathname === "/blog" || url.pathname === "/blog/") {
      return handleBlogIndex(url, env);
    }
    const blogSlug = url.pathname.match(/^\/blog\/([^/]+)$/);
    if (blogSlug) {
      return handleBlogPost(url, env, decodeURIComponent(blogSlug[1]));
    }

    // The site's pages (the 2026-10 design): one app shell, a real URL per page,
    // the page's own title, description and canonical, a 404 for a listing that
    // does not exist. See src/pages.js.
    if (url.pathname === "/robots.txt") {
      return text(robotsTxt(env), 200, "text/plain; charset=utf-8", "public, max-age=3600");
    }
    if (url.pathname === "/sitemap.xml") {
      try {
        return text(await sitemapXml(env), 200, "application/xml; charset=utf-8", "public, max-age=3600");
      } catch (err) {
        console.error("sitemap error:", err);
        return text("", 503, "application/xml; charset=utf-8");
      }
    }
    const page = await servePage(request, env, url);
    if (page) return page;

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

  // A pasted "mailto:" prefix is not part of the address (same as the program form).
  const email = str(data.em).replace(/^mailto:/i, "");
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

  // A new signup has to confirm its email first; someone already subscribed is told so.
  return json({ ok: true, ...(result.existing ? { existing: true } : { confirm: true }) });
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
export const ORGANIZATION_INTAKE_KIND = "organization";
export const EVENT_INTAKE_KIND = "event";
const LISTING_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LISTING_RELATIONS = new Set(["run", "attend", "other"]);
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

async function draftProgramId(intakeId) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`draft-program\n${intakeId}`));
  const hex = Array.from(new Uint8Array(digest), (x) => x.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${((parseInt(hex[16], 16) & 3) | 8).toString(16)}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

async function draftOrganizationId(intakeId) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`draft-organization\n${intakeId}`));
  const hex = Array.from(new Uint8Array(digest), (x) => x.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${((parseInt(hex[16], 16) & 3) | 8).toString(16)}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

async function handleSubmitProgram(request, env, ctx, opts = {}) {
  const data = await readBody(request);
  if (data === null) return json({ ok: false, error: "Could not read your submission." }, 400);

  if (str(data.company)) return json({ ok: true }); // honeypot

  if (!(await verifyTurnstile(env, str(data.cf_token), request.headers.get("CF-Connecting-IP")))) {
    return json({ ok: false, error: "Verification failed. Please reload the page and try again." }, 403);
  }

  // A suggested update to an existing listing rides the same capture path as a
  // new program: lid names the listing, rel says who is asking (rel=run is the
  // organization itself, the route to Verified). A person reads both before anything
  // in the directory changes; nothing here writes organizations.
  // A suggested event (kind=event) rides the same path too (opening-day bar:
  // add-an-event works); a person checks it before it is listed.
  const isEvent = !!opts.event || str(data.kind) === "event";
  const isOrganization = !!opts.organization;
  const listingId = !isEvent && LISTING_ID_RE.test(str(data.lid)) ? str(data.lid).toLowerCase() : "";
  const relation = LISTING_RELATIONS.has(str(data.rel)) ? str(data.rel) : "";
  // A fix or a claim names the listing by its id; the receipt and the notice use
  // the listing's own name from the directory, never text the browser sent.
  // A new listing names its organization; the program (what they offer) is optional.
  let program = isEvent ? str(data.en) : isOrganization ? str(data.org) : (str(data.pn) || str(data.org));
  if (listingId) {
    let listed = "";
    try { listed = str((await env.DB?.prepare("SELECT name FROM organizations WHERE id = ?").bind(listingId).first())?.name); } catch { /* the id still names it */ }
    program = listed || `listing ${listingId}`;
  }
  const org = str(data.org);
  const sport = str(data.sport);
  const city = str(data.city);
  const stateRegion = str(data.state);
  const email = str(data.em).replace(/^mailto:/i, "");
  const notes = str(data.notes);
  const eventDate = str(data.ed);
  const eventEnd = /^\d{4}-\d{2}-\d{2}$/.test(str(data.ee)) ? str(data.ee) : "";
  const eventTime = str(data.et).slice(0, 40);
  const siteUrl = str(data.url).slice(0, 300);

  // An organization confirming its listing can also tell us every sport it runs,
  // with seasons, and the events it holds every year (docs/specs/programs-that-come-back.md).
  // A person applies them from the review queue; nothing here writes the listing.
  const confirming = !!listingId && relation === "run";
  const sportsAnswer = confirming ? parseSportsAnswer(data.sports) : [];
  const yearlyAnswer = confirming ? parseYearlyAnswer(data.yearly) : [];
  // The one-minute check-up (docs/specs/community-kept-directory.md): the organization's answer to
  // "here's what families see", and for everyone else a one-tap reason for what's wrong.
  const checkup = confirming ? parseCheckup(data.checkup) : null;
  const fixReason = listingId && !confirming ? parseFixReason(data.reason) : "";

  if (!program) return json({ ok: false, error: isEvent ? "Please add the event name." : "Please add the organization's name." }, 422);
  const answered = !!checkup || sportsAnswer.length > 0 || yearlyAnswer.length > 0 || (fixReason && fixReason !== "other");
  if (listingId && !notes && !answered) return json({ ok: false, error: "Please tell us what should change." }, 422);
  if (isEvent && !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) return json({ ok: false, error: "Please add the date of the event." }, 422);
  // Email: a fix to a listing or a suggested event may come without one (Alec,
  // 2026-10-14: "No email required"); a person reviews every one either way.
  // A program owner confirming its listing (rel=run) and a new program need one,
  // because we write back to confirm, and that reply is what earns Verified.
  const emailOptional = isEvent || (listingId && relation !== "run");
  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  if (email ? !emailValid : !emailOptional) {
    return json({ ok: false, error: "Please enter a valid email so we can confirm your submission." }, 422);
  }

  if (!env.INTAKE || !env.DB) {
    console.error("Program submission unavailable", { reason: "binding-missing", intake: !!env.INTAKE, db: !!env.DB });
    return json({ ok: false, error: "Submissions are temporarily unavailable. Please try again soon." }, 503);
  }

  const answers = isEvent
    ? { event: program, date: eventDate, end: eventEnd, time: eventTime, city, state: stateRegion, url: siteUrl, org, sport, notes }
    : listingId
      ? { program, update_of: listingId, relation, notes,
        ...(sportsAnswer.length ? { sports: Object.fromEntries(sportsAnswer.map((x) => [x.key, x.seasons])) } : {}),
        ...(yearlyAnswer.length ? { yearly: yearlyAnswer } : {}),
        ...(checkup ? { checkup } : {}),
        ...(fixReason ? { reason: fixReason } : {}) }
      : isOrganization
        ? { organization: program, sport, city, state: stateRegion, website: siteUrl, notes }
        : { program, org, sport, city, state: stateRegion, website: siteUrl, notes };
  const intakeId = await programSubmissionId(str(data.sid), email, answers);
  const location = [city, stateRegion].filter(Boolean).join(", ");
  // The summary is the notice's subject line: one line, bounded.
  const summary = (isEvent
    ? `New event submission: ${program.slice(0, 120)} (${eventDate}${location ? `, ${location.slice(0, 80)}` : ""})`
    : listingId
      ? `${relation === "run" ? "Organization confirming its listing" : "Listing update"}: ${program.slice(0, 120)}`
      : isOrganization
        ? `New organization submission: ${program.slice(0, 120)}${location ? ` (${location.slice(0, 80)})` : ""}`
      : `New program submission: ${program.slice(0, 120)}${location ? ` (${location.slice(0, 80)})` : ""}`).replace(/[\r\n]+/g, " ");
  const submissionKind = isEvent ? "new_event" : listingId ? "listing_update" : isOrganization ? "new_organization" : "new_program";
  const source = str(data.source).slice(0, 80) || "asnm-prelaunch";
  const now = new Date().toISOString();
  const createProgramDraft = !isEvent && !listingId && !isOrganization;
  const createOrganizationDraft = isOrganization;
  const draftId = createProgramDraft ? await draftProgramId(intakeId) : createOrganizationDraft ? await draftOrganizationId(intakeId) : "";

  let stage = "intake-capture";
  let fresh;
  try {
    // Intake row + its pending delivery claim are one transaction, the same
    // shape the newsletter path writes. INSERT OR IGNORE makes a retry a no-op.
    await env.INTAKE.batch([
      env.INTAKE.prepare(`INSERT OR IGNORE INTO intake (id,received_at,site,kind,name,email,summary,payload,source,is_canary) VALUES (?,?,'adaptivesportsnearme.com',?,?,?,?,?,?,0)`)
        .bind(intakeId, now, isEvent ? EVENT_INTAKE_KIND : isOrganization ? ORGANIZATION_INTAKE_KIND : PROGRAM_INTAKE_KIND, null, email || null, summary, JSON.stringify(answers), source),
      env.INTAKE.prepare("INSERT OR IGNORE INTO intake_delivery_claims (intake_id,state) VALUES (?,'pending')").bind(intakeId),
    ]);
    // In production DB (asnm-db) and INTAKE (atl-intake) are separate D1
    // databases, so one batch cannot span them. The submissions write is
    // idempotent on the same id, so a failure here is safe to retry.
    stage = "submission-capture";
    const submission = env.DB.prepare(
      `INSERT INTO submissions (kind, payload, contact_email, status, created_at)
       SELECT ?, ?, ?, 'new', ?
       WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE kind = ? AND json_extract(payload, '$.intake_id') = ?)`
    ).bind(submissionKind, JSON.stringify({ ...answers, intake_id: intakeId }), email || null, now, submissionKind, intakeId);
    const writes = [submission];
    if (createOrganizationDraft) {
      writes.push(
        env.DB.prepare(`INSERT OR IGNORE INTO organizations
          (id, name, sport, sport_key, website_url, city, state, verification_status, status, is_public, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'unverified', 'active', 0, ?, ?)`).bind(
          draftId, program, sport || null, sport || null, siteUrl || null, city || null, stateRegion || null, now, now
        )
      );
    } else if (createProgramDraft) {
      writes.push(
        env.DB.prepare(`INSERT OR IGNORE INTO organizations (id, name, org_type, is_public, status, created_at, updated_at)
          VALUES ('a461f29b-0b89-4e17-b879-6a80e0abd101', 'Organization not yet assigned', 'placeholder', 1, 'active', ?, ?)`).bind(now, now),
        env.DB.prepare(`INSERT OR IGNORE INTO programs
          (id, organization_id, name, sport, sport_key, website_url, city, state, verification_status, status, is_public, created_at, updated_at)
          VALUES (?, 'a461f29b-0b89-4e17-b879-6a80e0abd101', ?, ?, ?, ?, ?, ?, 'unverified', 'active', 0, ?, ?)`).bind(
          draftId, program, sport || null, sport || null, siteUrl || null, city || null, stateRegion || null, now, now
        )
      );
    }
    const [result] = await env.DB.batch(writes);
    fresh = Number(result?.meta?.changes ?? result?.changes ?? 0) > 0;
  } catch (error) {
    const message = String(error?.message || "");
    const reason = /no such table|no such column|has no column named/i.test(message) ? "database-schema-missing"
      : /constraint failed/i.test(message) ? "database-constraint" : "operation-failed";
    // Fixed categories only: raw errors can carry the bound email.
    console.error("Program submission failed closed", { stage, reason });
    return json(env.ENV_NAME === "staging" ? { ...programUnavailable, diagnostic: { stage, reason } } : programUnavailable, 502);
  }

  // The organization's team-only history gets one line (docs/specs/programs-that-come-back.md).
  // Best effort: the submission is already captured, so a failure here never un-saves it.
  if (fresh && listingId && program !== `listing ${listingId}`) {   // an organization we found by that id
    try {
      const parts = [];
      if (sportsAnswer.length) parts.push(`sports: ${sportsSummary(sportsAnswer)}`);
      if (yearlyAnswer.length) parts.push(`yearly events: ${yearlySummary(yearlyAnswer)}`);
      if (notes) parts.push(`note: ${notes.slice(0, 160)}`);
      const who = relation === "run" ? "the organization" : relation === "attend" ? "someone who goes there" : "someone";
      if (checkup) parts.unshift(checkupSummary(checkup));
      const reasonWords = fixReason ? FIX_WORDS[fixReason] : "";
      const summary = confirming ? `Confirmation received from the organization${parts.length ? `. ${parts.join("; ")}` : ""}`
        : `Fix suggested by ${who}: ${[reasonWords, notes.slice(0, 200)].filter(Boolean).join(". ")}`;
      await logActivity(env.DB, listingId, confirming ? "confirmation" : "fix", summary, { actor: confirming ? "organization" : "visitor", ref: `intake ${intakeId}` });
    } catch (error) {
      console.error("activity log failed", { reason: String(error?.message || "").slice(0, 80) });
    }
  }

  // Captured. Correspondence never holds the response and never un-saves it.
  // The house notice is claim-gated (at most once); the submitter receipt goes
  // out only for the first capture of this id, so a retry does not mail twice.
  const notice = notifyIntake(env, intakeId);
  if (ctx?.waitUntil) ctx.waitUntil(notice); else await notice;
  if (fresh && email) await queueFormConfirmation(env, ctx, { kind: isEvent ? 'event' : listingId ? 'listing-update' : isOrganization ? 'organization' : 'program', email, program });

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

async function handleProfileLoginRequest(request, env, url) {
  if (!env.DB || !env.PROFILE_SIGNING_KEY) return json({ ok: false, error: "Sign-in is temporarily unavailable." }, 503, PROFILE_CACHE);
  const data = await readBody(request);
  const email = validEmail(data?.email);
  if (!email) return json({ ok: false, error: "Enter a valid email address." }, 422, PROFILE_CACHE);
  try {
    const token = await issueProfileLoginToken(env.DB, email);
    const link = new URL("/api/profile-auth/verify", url.origin); link.searchParams.set("token", token);
    await sendProfileLoginLink(env, email, link.toString());
    return json({ ok: true }, 200, PROFILE_CACHE);
  } catch (err) {
    console.error("profile login request failed", { reason: err instanceof Error ? err.message : "unknown" });
    return json({ ok: false, error: "We could not send a sign-in link. Please try again." }, 503, PROFILE_CACHE);
  }
}

async function handleProfileLoginVerify(url, env) {
  if (!env.DB || !env.PROFILE_SIGNING_KEY) return json({ ok: false, error: "Sign-in is temporarily unavailable." }, 503, PROFILE_CACHE);
  try {
    const email = await consumeProfileLoginToken(env.DB, url.searchParams.get("token") || "");
    if (!email) return json({ ok: false, error: "This sign-in link has expired or was already used." }, 401, PROFILE_CACHE);
    const id = await findOrCreateProfile(env.DB, email);
    const signature = await signProfileId(id, env.PROFILE_SIGNING_KEY);
    return new Response(null, { status: 303, headers: { "Cache-Control": "no-store", "Location": "/account", "Set-Cookie": serializeProfileCookie(id, signature) } });
  } catch (err) {
    console.error("profile login verification failed", { reason: err instanceof Error ? err.message : "unknown" });
    return json({ ok: false, error: "We could not sign you in. Please request a new link." }, 503, PROFILE_CACHE);
  }
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

async function handleProfileSaved(request, env) {
  if (!env.DB || !env.PROFILE_SIGNING_KEY) return json({ ok: false, error: "Saved items are temporarily unavailable." }, 503, PROFILE_CACHE);
  const profileId = await readProfileCookie(request, env.PROFILE_SIGNING_KEY);
  if (!profileId) return json({ ok: false, error: "Sign in to save items." }, 401, PROFILE_CACHE);
  const data = await readBody(request);
  const kind = String(data?.kind || "").toLowerCase(), itemId = str(data?.item_id);
  const on = data?.on === true || data?.on === "true" || data?.on === "1";
  const saved = await setSavedItem(env.DB, profileId, kind, itemId, on);
  return saved ? json({ ok: true, kind, item_id: itemId, on }, 200, PROFILE_CACHE) : json({ ok: false, error: "That item was not found." }, 404, PROFILE_CACHE);
}

function handleProfileSignout() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Set-Cookie": clearProfileCookie() },
  });
}

const ORGANIZATION_AUTH_CACHE = "private, no-store";

function organizationAuthReady(env) {
  return !!(env.DB && (env.ORG_AUTH_SIGNING_KEY || env.PROFILE_SIGNING_KEY));
}

function organizationAuthSecret(env) {
  return env.ORG_AUTH_SIGNING_KEY || env.PROFILE_SIGNING_KEY;
}

async function handleOrganizationLoginRequest(request, env, url) {
  if (!organizationAuthReady(env)) {
    console.error("organization authentication unavailable");
    return json({ ok: false, error: "Organization sign-in is temporarily unavailable." }, 503, ORGANIZATION_AUTH_CACHE);
  }
  const data = await readBody(request);
  if (data === null) return json({ ok: false, error: "Could not read your request." }, 400, ORGANIZATION_AUTH_CACHE);
  if (str(data.company)) return json({ ok: true }, 200, ORGANIZATION_AUTH_CACHE);
  const email = validEmail(data.email || data.em);
  if (!email) return json({ ok: false, error: "Please enter a valid email." }, 422, ORGANIZATION_AUTH_CACHE);
  try {
    const organizations = await organizationsForClaimEmail(env.DB, email);
    if (!organizations.length) return json({ ok: true }, 200, ORGANIZATION_AUTH_CACHE);
    const token = await issueLoginToken(env.DB, email);
    const link = new URL("/api/org-auth/verify", url.origin);
    link.searchParams.set("token", token);
    await sendOrganizationLoginLink(env, email, link.toString());
    return json({ ok: true }, 200, ORGANIZATION_AUTH_CACHE);
  } catch (err) {
    console.error("organization login link failed", { reason: err instanceof Error ? err.message : "unknown" });
    return json({ ok: false, error: "Organization sign-in is temporarily unavailable." }, 503, ORGANIZATION_AUTH_CACHE);
  }
}

async function handleOrganizationLoginVerify(url, env) {
  if (!organizationAuthReady(env)) return json({ ok: false, error: "Organization sign-in is temporarily unavailable." }, 503, ORGANIZATION_AUTH_CACHE);
  try {
    const email = await consumeLoginToken(env.DB, url.searchParams.get("token") || "");
    if (!email) return json({ ok: false, error: "This sign-in link has expired or was already used." }, 401, ORGANIZATION_AUTH_CACHE);
    const session = await createOrganizationSession(env.DB, email, organizationAuthSecret(env));
    return new Response(null, {
      status: 303,
      headers: { "Cache-Control": "no-store", "Location": "/manage", "Set-Cookie": serializeOrgCookie(session.id, session.signature) },
    });
  } catch (err) {
    console.error("organization login verification failed", { reason: err instanceof Error ? err.message : "unknown" });
    return json({ ok: false, error: "Organization sign-in is temporarily unavailable." }, 503, ORGANIZATION_AUTH_CACHE);
  }
}

async function authorizedOrganizationSession(request, env) {
  if (!organizationAuthReady(env)) return null;
  return readOrganizationSession(request, env.DB, organizationAuthSecret(env));
}

async function handleOrganizationSession(request, env) {
  const session = await authorizedOrganizationSession(request, env);
  if (!session) return json({ ok: false, error: "Sign in to manage a program." }, 401, ORGANIZATION_AUTH_CACHE);
  try {
    return json({ ok: true, organizations: await organizationsForClaimEmail(env.DB, session.email) }, 200, ORGANIZATION_AUTH_CACHE);
  } catch (err) {
    console.error("organization session fetch failed", { reason: err instanceof Error ? err.message : "unknown" });
    return json({ ok: false, error: "Organization details are temporarily unavailable." }, 503, ORGANIZATION_AUTH_CACHE);
  }
}

async function handleManagedOrganizationGet(request, env, id) {
  const session = await authorizedOrganizationSession(request, env);
  if (!session) return json({ ok: false, error: "Sign in to manage a program." }, 401, ORGANIZATION_AUTH_CACHE);
  try {
    const organization = await organizationForClaimEmail(env.DB, id, session.email);
    return organization ? json({ ok: true, organization }, 200, ORGANIZATION_AUTH_CACHE)
      : json({ ok: false, error: "Program not found." }, 404, ORGANIZATION_AUTH_CACHE);
  } catch (err) {
    console.error("managed organization fetch failed", { reason: err instanceof Error ? err.message : "unknown" });
    return json({ ok: false, error: "Organization details are temporarily unavailable." }, 503, ORGANIZATION_AUTH_CACHE);
  }
}

async function handleManagedOrganizationUpdate(request, env, id) {
  const session = await authorizedOrganizationSession(request, env);
  if (!session) return json({ ok: false, error: "Sign in to manage a program." }, 401, ORGANIZATION_AUTH_CACHE);
  const data = await readBody(request);
  if (data === null) return json({ ok: false, error: "Could not read your changes." }, 400, ORGANIZATION_AUTH_CACHE);
  try {
    const organization = await updateClaimedOrganization(env.DB, id, session.email, data);
    return organization ? json({ ok: true, organization }, 200, ORGANIZATION_AUTH_CACHE)
      : json({ ok: false, error: "Program not found." }, 404, ORGANIZATION_AUTH_CACHE);
  } catch (err) {
    const reason = err instanceof Error ? err.message : "";
    if (reason === "address-not-found") {
      return json({ ok: false, error: "We couldn't find that address. Check it and try again." }, 422, ORGANIZATION_AUTH_CACHE);
    }
    if (["name-required", "website-invalid", "email-invalid", "sports-invalid"].includes(reason)) {
      return json({ ok: false, error: "Please check the program details and try again." }, 422, ORGANIZATION_AUTH_CACHE);
    }
    console.error("managed organization update failed", { reason: reason || "unknown" });
    return json({ ok: false, error: "Could not save organization details right now." }, 503, ORGANIZATION_AUTH_CACHE);
  }
}

async function handleManagedOrganizationItems(request, env, organizationId, kind, itemId) {
  const session = await authorizedOrganizationSession(request, env);
  if (!session) return json({ ok: false, error: "Sign in to manage an organization." }, 401, ORGANIZATION_AUTH_CACHE);
  const operations = kind === "programs"
    ? { list: managedOrganizationPrograms, create: createManagedProgram, update: updateManagedProgram, remove: deleteManagedProgram }
    : { list: managedOrganizationEvents, create: createManagedEvent, update: updateManagedEvent, remove: deleteManagedEvent };
  try {
    if (!itemId && request.method === "GET") {
      const items = await operations.list(env.DB, organizationId, session.email);
      return items === null ? json({ ok: false, error: "Organization not found." }, 404, ORGANIZATION_AUTH_CACHE)
        : json({ ok: true, items }, 200, ORGANIZATION_AUTH_CACHE);
    }
    if (!itemId && request.method === "POST") {
      const data = await readBody(request);
      if (data === null) return json({ ok: false, error: "Could not read your changes." }, 400, ORGANIZATION_AUTH_CACHE);
      const item = await operations.create(env.DB, organizationId, session.email, data);
      return item === null ? json({ ok: false, error: "Organization not found." }, 404, ORGANIZATION_AUTH_CACHE)
        : json({ ok: true, item }, 201, ORGANIZATION_AUTH_CACHE);
    }
    if (itemId && request.method === "PATCH") {
      const data = await readBody(request);
      if (data === null) return json({ ok: false, error: "Could not read your changes." }, 400, ORGANIZATION_AUTH_CACHE);
      const item = await operations.update(env.DB, organizationId, itemId, session.email, data);
      return item === null ? json({ ok: false, error: "Organization not found." }, 404, ORGANIZATION_AUTH_CACHE)
        : item === false ? json({ ok: false, error: `${kind === "programs" ? "Program" : "Event"} not found.` }, 404, ORGANIZATION_AUTH_CACHE)
          : json({ ok: true, item }, 200, ORGANIZATION_AUTH_CACHE);
    }
    if (itemId && request.method === "DELETE") {
      const removed = await operations.remove(env.DB, organizationId, itemId, session.email);
      return removed === null ? json({ ok: false, error: "Organization not found." }, 404, ORGANIZATION_AUTH_CACHE)
        : removed ? json({ ok: true }, 200, ORGANIZATION_AUTH_CACHE)
          : json({ ok: false, error: `${kind === "programs" ? "Program" : "Event"} not found.` }, 404, ORGANIZATION_AUTH_CACHE);
    }
    return json({ ok: false, error: "Method not allowed" }, 405, ORGANIZATION_AUTH_CACHE);
  } catch (err) {
    const reason = err instanceof Error ? err.message : "";
    if (["name-required", "title-required", "start-invalid", "end-invalid", "website-invalid", "year-invalid", "sports-invalid"].includes(reason)) {
      return json({ ok: false, error: "Please check the details and try again." }, 422, ORGANIZATION_AUTH_CACHE);
    }
    console.error("managed organization item failed", { kind, reason: reason || "unknown" });
    return json({ ok: false, error: "Could not save right now. Please try again." }, 503, ORGANIZATION_AUTH_CACHE);
  }
}

const BETA_AUTH_CACHE = "private, no-store";

function betaHtml() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Adaptive Sports Near Me beta</title><meta name="robots" content="noindex"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f3ec;color:#1a1a1a;font-family:system-ui,sans-serif;padding:24px;box-sizing:border-box}.beta{max-width:540px;width:100%;background:#fff;border:1px solid #d8d1c5;border-radius:15px;padding:clamp(28px,6vw,52px);box-sizing:border-box}.beta p{line-height:1.55;color:#555}.beta label{display:block;font-weight:650;margin-top:24px}.beta input{box-sizing:border-box;width:100%;margin-top:8px;padding:13px 14px;border:1px solid #777;border-radius:8px;font:inherit}.beta button{margin-top:14px;background:#1a1a1a;color:#fff;border:0;border-radius:8px;padding:13px 18px;font:inherit;font-weight:700;cursor:pointer}.beta [role=status]{min-height:1.5em;margin:12px 0 0}</style></head><body><main class="beta"><p>Adaptive Sports Near Me</p><h1>We're in beta.</h1><p>Beta testers can sign in with their approved email address to explore the site.</p><form id="beta-login"><label for="email">Email address</label><input id="email" name="email" type="email" autocomplete="email" required><button type="submit">Email me a sign-in link</button><p role="status" id="status"></p></form></main><script>if(location.pathname!=='/')history.replaceState(null,'','/');document.getElementById('beta-login').addEventListener('submit',async(e)=>{e.preventDefault();const f=e.currentTarget,s=document.getElementById('status');if(!f.reportValidity())return;s.textContent='Sending your sign-in link...';try{const r=await fetch('/api/beta-auth/request-link',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:f.email.value})}),b=await r.json();s.textContent=r.ok&&b.ok?'Check your email for a one-time sign-in link.':(b.error||'We could not send a sign-in link.');}catch(_){s.textContent='We could not send a sign-in link.';}});</script></body></html>`;
}

async function prelaunchGate(request, env, url) {
  if (env.PRELAUNCH !== "true") return null;
  const path = url.pathname;
  const admin = path === "/admin" || path.startsWith("/admin/") || path.startsWith("/api/admin-") || path.startsWith("/api/admin-data/");
  const beta = path.startsWith("/api/beta-auth/");
  const asset = /\.(?:css|js|svg|png|jpg|jpeg|webp|ico|woff2?|map)$/i.test(path) || path.startsWith("/app/") || path.startsWith("/assets/");
  if (admin || beta || asset) return null;
  const secret = env.BETA_AUTH_SIGNING_KEY || env.ADMIN_AUTH_SIGNING_KEY || env.PROFILE_SIGNING_KEY;
  const session = betaAuthReady(env) ? await readBetaSession(request, env.DB, secret) : null;
  if (session) return null;
  if (path.startsWith("/api/")) return json({ ok: false, error: "Beta access is required." }, 401, BETA_AUTH_CACHE);
  return new Response(betaHtml(), { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}

async function handleBetaLoginRequest(request, env, url) {
  if (!betaAuthReady(env)) return json({ ok: false, error: "Beta sign-in is temporarily unavailable." }, 503, BETA_AUTH_CACHE);
  const data = await readBody(request);
  const email = validEmail(data?.email || data?.em);
  if (!email) return json({ ok: false, error: "Enter a valid email address." }, 422, BETA_AUTH_CACHE);
  if (!(await isBetaTester(env.DB, email))) return json({ ok: false, error: "This email does not have beta access." }, 403, BETA_AUTH_CACHE);
  try {
    const token = await issueBetaLoginToken(env.DB, email);
    const link = new URL("/api/beta-auth/verify", url.origin);
    link.searchParams.set("token", token);
    await sendBetaLoginLink(env, email, link.toString());
    return json({ ok: true }, 200, BETA_AUTH_CACHE);
  } catch (err) {
    console.error("beta login link failed", { reason: err instanceof Error ? err.message : "unknown" });
    return json({ ok: false, error: "We could not send a sign-in link. Please try again." }, 503, BETA_AUTH_CACHE);
  }
}

async function handleBetaLoginVerify(url, env) {
  if (!betaAuthReady(env)) return json({ ok: false, error: "Beta sign-in is temporarily unavailable." }, 503, BETA_AUTH_CACHE);
  try {
    const email = await consumeBetaLoginToken(env.DB, url.searchParams.get("token") || "");
    if (!email || !(await isBetaTester(env.DB, email))) return json({ ok: false, error: "This sign-in link has expired, was already used, or no longer has beta access." }, 401, BETA_AUTH_CACHE);
    const secret = env.BETA_AUTH_SIGNING_KEY || env.ADMIN_AUTH_SIGNING_KEY || env.PROFILE_SIGNING_KEY;
    const session = await createBetaSession(env.DB, email, secret);
    return new Response(null, { status: 303, headers: { "Cache-Control": "no-store", Location: "/", "Set-Cookie": serializeBetaCookie(session.id, session.signature) } });
  } catch (err) {
    console.error("beta login verification failed", { reason: err instanceof Error ? err.message : "unknown" });
    return json({ ok: false, error: "We could not sign you in. Please request a new link." }, 503, BETA_AUTH_CACHE);
  }
}

async function handleBetaSession(request, env) {
  if (!betaAuthReady(env)) return json({ ok: false }, 503, BETA_AUTH_CACHE);
  const secret = env.BETA_AUTH_SIGNING_KEY || env.ADMIN_AUTH_SIGNING_KEY || env.PROFILE_SIGNING_KEY;
  const session = await readBetaSession(request, env.DB, secret);
  return session ? json({ ok: true, email: session.email }, 200, BETA_AUTH_CACHE) : json({ ok: false }, 401, BETA_AUTH_CACHE);
}

async function handleAdminBetaTesters(request, env) {
  const session = await authorizedAdminSession(request, env);
  if (!session) return json({ ok: false, error: "Sign in to access the admin dashboard." }, 401, ADMIN_AUTH_CACHE);
  try {
    if (request.method === "GET") return json({ ok: true, items: await listBetaTesters(env.DB) }, 200, ADMIN_AUTH_CACHE);
    if (request.method === "POST") {
      const data = await readBody(request);
      const item = await setBetaTester(env.DB, data?.email, data?.enabled !== false && data?.enabled !== 0 && data?.enabled !== "0");
      return json({ ok: true, item }, 200, ADMIN_AUTH_CACHE);
    }
    return json({ ok: false, error: "Method not allowed" }, 405, ADMIN_AUTH_CACHE);
  } catch (err) {
    if (err instanceof Error && err.message === "email-invalid") return json({ ok: false, error: "Enter a valid email address." }, 422, ADMIN_AUTH_CACHE);
    console.error("admin beta tester update failed", { reason: err instanceof Error ? err.message : "unknown" });
    return json({ ok: false, error: "Beta testers are temporarily unavailable." }, 503, ADMIN_AUTH_CACHE);
  }
}

const ADMIN_AUTH_CACHE = "private, no-store";

function adminAuthSecret(env) {
  return env.ADMIN_AUTH_SIGNING_KEY || env.ORG_AUTH_SIGNING_KEY || env.PROFILE_SIGNING_KEY;
}

function adminAuthReady(env) {
  return !!(env.DB && adminAuthSecret(env));
}

async function authorizedAdminSession(request, env) {
  if (!adminAuthReady(env)) return null;
  return readAdminSession(request, env.DB, adminAuthSecret(env));
}

async function handleAdminLoginRequest(request, env, url) {
  if (!adminAuthReady(env)) return json({ ok: false, error: "Admin sign-in is temporarily unavailable." }, 503, ADMIN_AUTH_CACHE);
  const data = await readBody(request);
  if (data === null) return json({ ok: false, error: "Could not read your request." }, 400, ADMIN_AUTH_CACHE);
  if (str(data.company)) return json({ ok: true }, 200, ADMIN_AUTH_CACHE);
  const email = isAdminEmail(data.email || data.em);
  if (!email) return json({ ok: false, error: "Use an @adaptivesportsnearme.com or @faisaln.com email address." }, 403, ADMIN_AUTH_CACHE);
  try {
    const token = await issueAdminLoginToken(env.DB, email);
    const link = new URL("/api/admin-auth/verify", url.origin);
    link.searchParams.set("token", token);
    await sendAdminLoginLink(env, email, link.toString());
    return json({ ok: true }, 200, ADMIN_AUTH_CACHE);
  } catch (err) {
    console.error("admin login link failed", { reason: err instanceof Error ? err.message : "unknown" });
    return json({ ok: false, error: "Admin sign-in is temporarily unavailable." }, 503, ADMIN_AUTH_CACHE);
  }
}

async function handleAdminLoginVerify(url, env) {
  if (!adminAuthReady(env)) return json({ ok: false, error: "Admin sign-in is temporarily unavailable." }, 503, ADMIN_AUTH_CACHE);
  try {
    const email = await consumeAdminLoginToken(env.DB, url.searchParams.get("token") || "");
    if (!email) return json({ ok: false, error: "This sign-in link has expired or was already used." }, 401, ADMIN_AUTH_CACHE);
    const session = await createAdminSession(env.DB, email, adminAuthSecret(env));
    return new Response(null, { status: 303, headers: { "Cache-Control": "no-store", "Location": "/admin", "Set-Cookie": serializeAdminCookie(session.id, session.signature) } });
  } catch (err) {
    console.error("admin login verification failed", { reason: err instanceof Error ? err.message : "unknown" });
    return json({ ok: false, error: "Admin sign-in is temporarily unavailable." }, 503, ADMIN_AUTH_CACHE);
  }
}

async function handleAdminSession(request, env) {
  const session = await authorizedAdminSession(request, env);
  return session ? json({ ok: true, email: session.email }, 200, ADMIN_AUTH_CACHE)
    : json({ ok: false, error: "Sign in to access the admin dashboard." }, 401, ADMIN_AUTH_CACHE);
}

async function handleAdminData(request, env, url, kind, id) {
  const session = await authorizedAdminSession(request, env);
  if (!session) return json({ ok: false, error: "Sign in to access the admin dashboard." }, 401, ADMIN_AUTH_CACHE);
  try {
    if (!id && request.method === "GET") {
      const result = await listAdminItems(env.DB, kind, { query: url.searchParams.get("q") || "", limit: url.searchParams.get("limit"), offset: url.searchParams.get("offset") });
      return result ? json({ ok: true, ...result }, 200, ADMIN_AUTH_CACHE) : json({ ok: false, error: "Not found." }, 404, ADMIN_AUTH_CACHE);
    }
    if (!id && request.method === "POST") {
      const data = await readBody(request);
      if (data === null) return json({ ok: false, error: "Could not read your changes." }, 400, ADMIN_AUTH_CACHE);
      const item = await createAdminItem(env.DB, kind, data);
      return item ? json({ ok: true, item }, 201, ADMIN_AUTH_CACHE) : json({ ok: false, error: "Not found." }, 404, ADMIN_AUTH_CACHE);
    }
    if (id && request.method === "GET") {
      const item = await getAdminItem(env.DB, kind, id);
      return item ? json({ ok: true, item }, 200, ADMIN_AUTH_CACHE) : json({ ok: false, error: "Not found." }, 404, ADMIN_AUTH_CACHE);
    }
    if (id && request.method === "PATCH") {
      const data = await readBody(request);
      if (data === null) return json({ ok: false, error: "Could not read your changes." }, 400, ADMIN_AUTH_CACHE);
      const item = await saveAdminItem(env.DB, kind, id, data, session.email);
      return item === false ? json({ ok: false, error: "Not found." }, 404, ADMIN_AUTH_CACHE)
        : item ? json({ ok: true, item }, 200, ADMIN_AUTH_CACHE) : json({ ok: false, error: "Not found." }, 404, ADMIN_AUTH_CACHE);
    }
    return json({ ok: false, error: "Method not allowed" }, 405, ADMIN_AUTH_CACHE);
  } catch (err) {
    const reason = err instanceof Error ? err.message : "";
    if (["name-required", "organization-required", "url-invalid", "email-invalid", "sports-invalid", "start-invalid", "end-invalid", "slug-invalid", "month-invalid", "year-invalid", "status-invalid"].includes(reason)) {
      return json({ ok: false, error: "Please check the item details and try again." }, 422, ADMIN_AUTH_CACHE);
    }
    if (["kind-invalid", "listing-invalid"].includes(reason)) {
      return json({ ok: false, error: "Please check the item details and try again." }, 422, ADMIN_AUTH_CACHE);
    }
    if (/UNIQUE constraint failed: programs\.slug/i.test(reason)) {
      return json({ ok: false, error: "Another yearly event already uses that web address (slug)." }, 422, ADMIN_AUTH_CACHE);
    }
    console.error("admin data request failed", { kind, operation: request.method, reason: reason || "unknown" });
    return json({ ok: false, error: "Could not save admin changes right now." }, 503, ADMIN_AUTH_CACHE);
  }
}

// The team-only history of an organization (docs/specs/programs-that-come-back.md), and adding a note.
async function handleAdminActivity(request, env, id) {
  const session = await authorizedAdminSession(request, env);
  if (!session) return json({ ok: false, error: "Sign in to access the admin dashboard." }, 401, ADMIN_AUTH_CACHE);
  try {
    if (request.method === "GET") {
      const items = await adminOrganizationActivity(env.DB, id);
      return items ? json({ ok: true, items }, 200, ADMIN_AUTH_CACHE) : json({ ok: false, error: "Not found." }, 404, ADMIN_AUTH_CACHE);
    }
    if (request.method === "POST") {
      const data = await readBody(request);
      const items = await addAdminNote(env.DB, id, data?.note, session.email);
      return items ? json({ ok: true, items }, 201, ADMIN_AUTH_CACHE) : json({ ok: false, error: "Not found." }, 404, ADMIN_AUTH_CACHE);
    }
    return json({ ok: false, error: "Method not allowed" }, 405, ADMIN_AUTH_CACHE);
  } catch (err) {
    const reason = err instanceof Error ? err.message : "";
    if (reason === "note-required") return json({ ok: false, error: "Write the note first." }, 422, ADMIN_AUTH_CACHE);
    console.error("admin activity request failed", { operation: request.method, reason: reason || "unknown" });
    return json({ ok: false, error: "Could not load this organization's activity right now." }, 503, ADMIN_AUTH_CACHE);
  }
}

async function handleAdminQueue(request, env, id) {
  const session = await authorizedAdminSession(request, env);
  if (!session) return json({ ok: false, error: "Sign in to access the admin dashboard." }, 401, ADMIN_AUTH_CACHE);
  try {
    if (!id && request.method === "GET") return json({ ok: true, items: await listAdminQueue(env.DB) }, 200, ADMIN_AUTH_CACHE);
    if (id && request.method === "GET") {
      const item = await getAdminQueueItem(env.DB, id);
      return item ? json({ ok: true, item }, 200, ADMIN_AUTH_CACHE) : json({ ok: false, error: "Queue item not found." }, 404, ADMIN_AUTH_CACHE);
    }
    if (id && request.method === "POST") {
      const data = await readBody(request);
      if (!data || data.action !== "accept") return json({ ok: false, error: "Unknown queue action." }, 422, ADMIN_AUTH_CACHE);
      const accepted = await acceptAdminQueueItem(env.DB, id, session.email);
      return accepted ? json({ ok: true, item: accepted }, 200, ADMIN_AUTH_CACHE) : json({ ok: false, error: "Queue item not found or already handled." }, 404, ADMIN_AUTH_CACHE);
    }
    return json({ ok: false, error: "Method not allowed" }, 405, ADMIN_AUTH_CACHE);
  } catch (err) {
    const reason = err instanceof Error ? err.message : "";
    if (["draft-missing", "start-invalid", "organization-missing"].includes(reason)) return json({ ok: false, error: "This submission needs an edit before it can be accepted." }, 422, ADMIN_AUTH_CACHE);
    if (/no such (column|table)/i.test(reason)) return json({ ok: false, error: "Run database migration 0015 before applying programs and yearly events." }, 422, ADMIN_AUTH_CACHE);
    console.error("admin queue request failed", { operation: request.method, reason: reason || "unknown" });
    return json({ ok: false, error: "Could not update this queue item right now." }, 503, ADMIN_AUTH_CACHE);
  }
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

