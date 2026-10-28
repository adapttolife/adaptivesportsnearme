// Page routes for the site (the 2026-10 design, public/index.html + public/app).
//
// Every page is the same app shell; the browser renders the content from the
// live API. What the Worker adds is what a crawler or a link preview needs before
// any script runs: a real URL per page, the page's own title and description, a
// canonical link, Open Graph tags, a 404 status for a listing that does not exist,
// and structured data for program pages. Plus /sitemap.xml and /robots.txt.
//
// Previews and staging say noindex (meta robots + X-Robots-Tag); only production
// (ENV_NAME=production) asks to be indexed.
import { getOrg, getProgram, getGrant, directorySnapshot, programsSnapshot } from "./data.js";
import { SPORT_NAMES } from "./sport-names.js";
import { isListable } from "../public/app/listable.js";
import { sportsLabel } from "../public/app/listing-sport.js";
import { HOME, PAGES, nearMeta, sportMeta, stateMeta, organizationMeta, programMeta, grantMeta, seriesMeta } from "../public/app/page-meta.js";
import { getSeries, listSeries } from "./events.js";
import { seriesState } from "../public/app/yearly.js";
import { HOME_CARD, PAGE_CARDS, sportCard, stateCard, listingCard, CARD_WIDTH, CARD_HEIGHT } from "./share-cards.js";

export const SITE_NAME = "Adaptive Sports Near Me";
const ORIGIN = "https://adaptivesportsnearme.com";

export const STATE_NAMES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado",
  CT: "Connecticut", DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts",
  MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
  NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const HOME_DESCRIPTION = HOME.description;

// Old URLs from earlier versions of the site, sent somewhere useful.
const REDIRECTS = [
  // The first home card lived at /og/home.png. Links already shared still ask for it.
  [/^\/og\/home\.png$/, HOME_CARD],
  [/^\/maps\/?$/, "/"],
  [/^\/profile\/?$/, "/"],
  [/^\/directory\/grants\/?$/, "/grants"],
  [/^\/directory\/events\/?$/, "/events"],
  [/^\/directory\/resources\/?$/, "/resources"],
  [/^\/directory(\/[a-z]+)?\/?$/, "/sports"],
];

// pattern, builder(match, env, url) -> { title, description, noindex?, status?, jsonld?, canonical?, image? }
// image: the page's share card (src/share-cards.js); pages without one share the home card.
// ("/" is usually served straight from the assets; the Worker answers it the same way.)
const ROUTES = [
  [/^\/$/, () => ({})],
  [/^\/near\/([^/]+)\/?$/, (m) => {
    const place = safeDecode(m[1]).slice(0, 80);
    return { ...nearMeta(place, null), noindex: true };
  }],
  [/^\/sports\/?$/, () => ({ ...PAGES.sports })],
  [/^\/sports\/([a-z-]+)\/?$/, (m) => {
    const name = SPORT_NAMES[m[1]];
    if (!name) return notFound();
    const low = m[1] === "multi" ? "multi-sport" : name.toLowerCase();
    // The guide's first sentence says what the sport is before the directory line (search snippets).
    return { ...sportMeta({ key: m[1], name, low }), image: sportCard(m[1]) };
  }],
  [/^\/states\/?$/, () => ({ ...PAGES.states })],
  [/^\/states\/([A-Za-z]{2})\/?$/, (m) => {
    const st = m[1].toUpperCase(), name = STATE_NAMES[st];
    if (!name) return notFound();
    return { ...stateMeta(name), canonical: `${ORIGIN}/states/${st}`, image: stateCard(st) };
  }],
  [/^\/organizations\/?$/, () => ({ ...PAGES.organizations })],
  [/^\/programs\/?$/, () => ({ ...PAGES.programs })],
  [new RegExp(`^/organizations/(${UUID})/?$`, "i"), async (m, env) => {
    if (!env.DB) return { title: "Organization", description: HOME_DESCRIPTION };
    const p = await getOrg(env.DB, m[1].toLowerCase());
    if (!p || !isListable(p)) return notFound(PAGES.listingNotFound.title);
    const place = placeText(p);
    // The same words the page shows ("Baseball, basketball, and 5 more"), so search results agree.
    const sport = sportsLabel(p, (k) => SPORT_NAMES[k] || k) || p.sportLabel || "Adaptive sports";
    return {
      ...organizationMeta({ name: p.name, sport, place }),
      jsonld: programJsonLd(p, env),
      image: listingCard(p),
    };
  }],
  [new RegExp(`^/programs/(${UUID}|program-[a-z0-9-]{1,80})/?$`, "i"), async (m, env) => {
    if (!env.DB) return { title: "Program", description: HOME_DESCRIPTION };
    const id = m[1].toLowerCase();
    let p = null;
    try { p = await getProgram(env.DB, id); } catch (_) { p = null; } // a database without the programs table yet
    // A yearly event has one page, at its own address (docs/specs/programs-that-come-back.md).
    if (p && p.kind === "event") return { redirect: `/events/${p.slug || p.id}` };
    if (p) return { ...programMeta({ name: p.name, sport: p.sportLabel || "Adaptive sports", place: placeText(p) }), jsonld: programJsonLd(p, env), image: listingCard(p) };
    // Listings lived at /programs/<organization id> until 2026-10-15: shared links,
    // receipts and search results move to the organization's page for good.
    const org = await getOrg(env.DB, id);
    if (org && isListable(org)) return { redirect: `/organizations/${id}` };
    return notFound("We couldn't find that program");
  }],
  [/^\/grants\/?$/, () => ({ ...PAGES.grants, image: PAGE_CARDS.grants })],
  [new RegExp(`^/grants/(${UUID})/?$`, "i"), async (m, env) => {
    if (!env.DB) return { title: "Grant", description: HOME_DESCRIPTION };
    let g = null;
    try { g = await getGrant(env.DB, m[1].toLowerCase()); } catch (_) { g = null; }
    if (!g) return notFound(PAGES.grantNotFound.title);
    return { ...grantMeta({ name: g.name, source: g.source || "" }), image: PAGE_CARDS.grants };
  }],
  [/^\/events\/?$/, () => ({ ...PAGES.events, image: PAGE_CARDS.events })],
  // A yearly event (docs/specs/programs-that-come-back.md): one page that stays true between years.
  [/^\/events\/([a-z0-9-]{1,80})\/?$/, async (m, env) => {
    if (!env.DB) return { title: "Event", description: HOME_DESCRIPTION };
    let s = null;
    try { s = await getSeries(env.DB, m[1]); } catch (_) { s = null; }
    if (!s) return notFound("We couldn't find that event");
    const place = s.city && s.state ? `${s.city}, ${s.state}` : (STATE_NAMES[s.state] || "");
    const { usual } = seriesState(s, s.editions);
    return { ...seriesMeta({ name: s.name, sport: s.sport_key ? (SPORT_NAMES[s.sport_key] || "") : "", host: s.host_name || "", place, usual }), image: PAGE_CARDS.events };
  }],
  [/^\/add\/program\/?$/, () => ({ ...PAGES.addProgram, noindex: true })],
  [/^\/add\/organization\/?$/, () => ({ ...PAGES.addOrganization, noindex: true })],
  [/^\/add\/event\/?$/, () => ({ ...PAGES.addEvent, noindex: true })],
  [/^\/manage(?:\/(?:organizations\/[^/]+(?:\/(?:edit|programs(?:\/new)?|events(?:\/new)?)?)?|programs\/[^/]+|events\/[^/]+))?\/?$/, () => ({ ...PAGES.manage, noindex: true })],
  [/^\/admin(?:\/queue(?:\/\d+)?|\/(?:organizations|programs|events|grants)(?:\/(?:[0-9a-f-]{36}|new))?)?\/?$/i, () => ({ ...PAGES.admin, noindex: true })],
  [/^\/account\/?$/, () => ({ ...PAGES.account, noindex: true })],
  [new RegExp(`^/update/(${UUID})/?$`, "i"), () => ({ ...PAGES.update, noindex: true })],
  [/^\/help\/?$/, () => ({ ...PAGES.help })],
  [/^\/about\/?$/, () => ({ ...PAGES.about })],
  [/^\/resources\/?$/, () => ({ ...PAGES.guides })],
  [/^\/resources\/veteran-owned-businesses\/?$/, () => ({ ...PAGES.veteranBusinesses, image: PAGE_CARDS["veteran-owned-businesses"] })],
  [/^\/letter\/confirmed\/?$/, () => ({ ...PAGES.letterConfirmed, noindex: true })],
  [/^\/letter\/?$/, () => ({ ...PAGES.letter })],
  [/^\/build\/?$/, () => ({ ...PAGES.build })],
  [/^\/privacy\/?$/, () => ({ ...PAGES.privacy })],
  [/^\/terms\/?$/, () => ({ ...PAGES.terms })],
];

function notFound(title = PAGES.notFound.title) {
  return { title, description: PAGES.notFound.description, noindex: true, status: 404 };
}

function safeDecode(s) {
  try { return decodeURIComponent(s.replace(/\+/g, " ")); } catch (_) { return s; }
}

function placeText(p) {
  const city = p.city && !/statewide|various|multiple/i.test(p.city) ? String(p.city).split(/\s*[/;(,]\s*/)[0].trim() : "";
  if (city && p.state) return `${city}, ${p.state}`;
  if (p.state) return STATE_NAMES[p.state] || p.state;
  return "";
}

function programJsonLd(p, env) {
  const data = { "@context": "https://schema.org", "@type": "SportsOrganization", name: p.name };
  if (p.website) data.url = p.website;
  if (p.sportLabel) data.sport = p.sportLabel;
  if (p.state) data.address = { "@type": "PostalAddress", addressRegion: p.state, addressCountry: "US", ...(placeText(p).includes(",") ? { addressLocality: placeText(p).split(",")[0] } : {}) };
  if (p.desc) data.description = String(p.desc).slice(0, 300);
  return data;
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Put one page's tags into the shell. The shell carries the home page's title,
// description and canonical; everything else goes in at <!--asnm:meta-->.
// The page's own code (public/app/views/<view>.js and .css) for an address: the same
// table as ROUTES in public/app/app.js. A listing page also starts its details
// (/api/orgs/<id>) with the page, so nothing waits for anything else.
const VIEWS = [
  [/^\/$/, "home"], [/^\/near\/[^/]+$/, "near"], [/^\/sports$/, "sports"], [/^\/sports\/[^/]+$/, "sport"],
  [/^\/states$/, "states"], [/^\/states\/[^/]+$/, "state"], [/^\/organizations$/, "organizations"], [/^\/organizations\/[^/]+$/, "program"], [/^\/programs$/, "programs"], [/^\/programs\/[^/]+$/, "program-detail"],
  [/^\/grants$/, "grants"], [/^\/grants\/[^/]+$/, "grant"], [/^\/events$/, "events"], [/^\/events\/[^/]+$/, "event-series"],
  [/^\/(add\/program|add\/organization|add\/event|update\/[^/]+)$/, "forms"], [/^\/manage(?:\/organizations(?:\/[^/]+(?:\/(?:edit|programs(?:\/new)?|events(?:\/new)?)?)?)?|\/programs\/[^/]+|\/events\/[^/]+)?$/, "manage"], [/^\/resources\/veteran-owned-businesses$/, "vob"],
  [/^\/admin(?:\/queue(?:\/\d+)?|\/(?:organizations|programs|events|grants)(?:\/(?:[0-9a-f-]{36}|new))?)?$/i, "admin"], [/^\/account$/, "account"],
  [/^\/letter\/confirmed$/, "letter-confirmed"], [/^\/(help|about|resources|letter|build|privacy|terms)$/, "help"],
];
export function preloadHints(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
  const hit = VIEWS.find(([re]) => re.test(path));
  if (!hit) return [];
  const tags = [`<link rel="modulepreload" href="/app/views/${hit[1]}.js">`, `<link rel="preload" href="/app/views/${hit[1]}.css" as="style">`];
  const orgId = path.match(new RegExp(`^/organizations/(${UUID})$`, "i"));
  if (orgId) tags.push(earlyFetch(`/api/organizations/${orgId[1].toLowerCase()}`));
  const programId = path.match(new RegExp(`^/programs/(${UUID})$`, "i"));
  if (programId) tags.push(earlyFetch(`/api/programs/${programId[1].toLowerCase()}`));
  return tags;
}
// A page's data starts downloading with the page, the way the shell starts the listings
// (public/index.html). A script, not a preload link: Safari, and so every iPhone browser,
// downloads a preloaded file again when fetch() asks for it. app.js takes it once (early).
function earlyFetch(href) {
  const u = JSON.stringify(href).replace(/</g, "\\u003c");
  return `<script>(window.ASNM_EARLY=window.ASNM_EARLY||{})[${u}]=fetch(${u});window.ASNM_EARLY[${u}].catch(function(){});</script>`;
}

export function injectMeta(html, meta, { url, production, hints = [] }) {
  const title = meta.title ? `${meta.title} · ${SITE_NAME}` : HOME.title;
  const description = meta.description || HOME_DESCRIPTION;
  const canonical = meta.canonical || ORIGIN + (url.pathname.replace(/\/+$/, "") || "/");
  const noindex = meta.noindex || !production;
  // A review copy's previews show its own cards; production's show production's.
  const image = (production ? ORIGIN : url.origin) + (meta.image || HOME_CARD);
  const tags = [
    `<link rel="canonical" href="${esc(canonical)}">`,
    `<meta property="og:title" content="${esc(meta.title || SITE_NAME)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(canonical)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    `<meta property="og:image" content="${esc(image)}">`,
    `<meta property="og:image:width" content="${CARD_WIDTH}">`,
    `<meta property="og:image:height" content="${CARD_HEIGHT}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    noindex ? `<meta name="robots" content="noindex">` : "",
    meta.jsonld ? `<script type="application/ld+json">${JSON.stringify(meta.jsonld).replace(/</g, "\\u003c")}</script>` : "",
    ...hints,
  ].filter(Boolean).join("\n");
  return html
    // Functions, not strings: page text can hold "$&" or "$'", which String.replace would expand.
    .replace(/<title>[^<]*<\/title>/, () => `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, () => `<meta name="description" content="${esc(description)}">`)
    .replace(/<!--asnm:meta-->[\s\S]*?<!--\/asnm:meta-->/, () => tags);
}

export function redirectFor(pathname) {
  for (const [re, to] of REDIRECTS) if (re.test(pathname)) return to;
  // One address per page: /states/fl -> /states/FL, an uppercase id -> lowercase.
  const st = pathname.match(/^\/states\/([a-z]{2})\/?$/i);
  if (st && st[1] !== st[1].toUpperCase()) return `/states/${st[1].toUpperCase()}`;
  const id = pathname.match(new RegExp(`^/(programs|organizations|grants|update)/(${UUID})/?$`, "i"));
  if (id && /[A-F]/.test(id[2])) return `/${id[1]}/${id[2].toLowerCase()}`;
  return null;
}

export function matchPage(pathname) {
  for (const [re, build] of ROUTES) {
    const m = pathname.match(re);
    if (m) return { m, build };
  }
  return null;
}

// The page response, or null when the path is not a page (assets, APIs, feeds).
export async function servePage(request, env, url) {
  if (/^\/near\/?$/.test(url.pathname)) {
    const q = (url.searchParams.get("q") || "").trim();
    return Response.redirect(new URL(q ? `/near/${encodeURIComponent(q)}` : "/", url).toString(), 302);
  }
  const to = redirectFor(url.pathname);
  // /og/home.png follows the current home card. A 302 so a later card is not cached forever.
  if (to) return Response.redirect(new URL(to, url).toString(), url.pathname === "/og/home.png" ? 302 : 301);
  const hit = matchPage(url.pathname);
  // Not a page we know and not a file or an API: the app's own "not found" page, as a 404.
  if (!hit && (/\.[a-z0-9]{1,8}$/i.test(url.pathname) || /^\/(api|admin)(\/|$)/.test(url.pathname))) return null;
  let meta;
  if (!hit) meta = notFound();
  else try { meta = await hit.build(hit.m, env, url); } catch (err) {
    console.error("page meta error:", err);
    meta = { title: SITE_NAME, description: HOME_DESCRIPTION };
  }
  if (meta.redirect) return Response.redirect(new URL(meta.redirect, url).toString(), 301);
  const shell = await env.ASSETS.fetch(new Request(new URL("/", url), { method: "GET" }));
  const hints = meta.status === 404 ? [] : preloadHints(url.pathname);
  const html = injectMeta(await shell.text(), meta, { url, production: env.ENV_NAME === "production", hints });
  const headers = { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=60, stale-while-revalidate=300" };
  if (meta.noindex || env.ENV_NAME !== "production") headers["x-robots-tag"] = "noindex";
  return new Response(html, { status: meta.status || 200, headers });
}

export function robotsTxt(env) {
  if (env.ENV_NAME !== "production") return "User-agent: *\nDisallow: /\n";
  return `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\n\nSitemap: ${ORIGIN}/sitemap.xml\n`;
}

export async function sitemapXml(env) {
  const urls = ["/", "/sports", "/states", "/grants", "/events", "/help", "/about", "/resources", "/resources/veteran-owned-businesses", "/letter", "/privacy", "/terms"];
  for (const k of Object.keys(SPORT_NAMES)) urls.push(`/sports/${k}`);
  for (const st of Object.keys(STATE_NAMES)) urls.push(`/states/${st}`);
  if (env.DB) {
    const snap = await directorySnapshot(env.DB);
    for (const p of snap.items) if (isListable(p)) urls.push(`/organizations/${p.id}`);
    for (const p of (await programsSnapshot(env.DB)).items) if (isListable(p)) urls.push(`/programs/${p.id}`);
    try {
      const g = await env.DB.prepare("SELECT id FROM grants WHERE is_public = 1 AND status = 'active'").all();
      for (const r of g.results || []) urls.push(`/grants/${r.id}`);
    } catch (_) { /* no grants table yet */ }
    for (const s of (await listSeries(env.DB)).items) urls.push(`/events/${s.slug}`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${ORIGIN}${u}</loc></url>`).join("\n")}\n</urlset>\n`;
}
