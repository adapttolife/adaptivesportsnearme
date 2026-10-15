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
import { getOrg, getGrant, directorySnapshot } from "./data.js";
import { SPORT_NAMES } from "./sport-names.js";
import { isListable } from "../public/app/listable.js";

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
const HOME_DESCRIPTION = "Find adaptive sports programs, grants and events near you. Every listing shows when it was last checked. Free, no account needed.";

// Old URLs from earlier versions of the site, sent somewhere useful.
const REDIRECTS = [
  [/^\/maps\/?$/, "/"],
  [/^\/profile\/?$/, "/"],
  [/^\/directory\/grants\/?$/, "/grants"],
  [/^\/directory\/events\/?$/, "/events"],
  [/^\/directory\/resources\/?$/, "/resources"],
  [/^\/directory(\/[a-z]+)?\/?$/, "/sports"],
];

// pattern, builder(match, env, url) -> { title, description, noindex?, status?, jsonld?, canonical? }
// ("/" is usually served straight from the assets; the Worker answers it the same way.)
const ROUTES = [
  [/^\/$/, () => ({})],
  [/^\/near\/([^/]+)\/?$/, (m) => {
    const place = safeDecode(m[1]).slice(0, 80);
    return { title: `Adaptive sports near ${place}`, description: `Adaptive sports programs near ${place}: in town first, then about 25 miles, then the rest of the state.`, noindex: true };
  }],
  [/^\/sports\/?$/, () => ({ title: "Adaptive sports by sport", description: "Browse adaptive sports programs by sport, from tennis and basketball to sled hockey, sailing and veteran meetups." })],
  [/^\/sports\/([a-z-]+)\/?$/, (m) => {
    const name = SPORT_NAMES[m[1]];
    if (!name) return notFound();
    const low = m[1] === "multi" ? "multi-sport" : name.toLowerCase();
    return { title: `${name}: adaptive ${low} programs near you`, description: `Find adaptive ${low} programs, grants and events near you. Every listing shows when it was last checked.` };
  }],
  [/^\/states\/?$/, () => ({ title: "Adaptive sports by state", description: "Find adaptive sports programs in every state." })],
  [/^\/states\/([A-Za-z]{2})\/?$/, (m) => {
    const st = m[1].toUpperCase(), name = STATE_NAMES[st];
    if (!name) return notFound();
    return { title: `Adaptive sports in ${name}`, description: `Adaptive sports programs, grants and events in ${name}. Every listing shows when it was last checked.`, canonical: `${ORIGIN}/states/${st}` };
  }],
  [new RegExp(`^/programs/(${UUID})/?$`, "i"), async (m, env) => {
    if (!env.DB) return { title: "Program", description: HOME_DESCRIPTION };
    const p = await getOrg(env.DB, m[1].toLowerCase());
    if (!p || !isListable(p)) return notFound("We couldn't find that program");
    const place = placeText(p);
    const sport = p.sportLabel || "Adaptive sports";
    return {
      title: `${p.name}: ${sport}${place ? ` in ${place}` : ""}`,
      description: `${p.name}${place ? ` in ${place}` : ""}. ${sport}. See the program's website, when we last checked it, and suggest a fix.`,
      jsonld: programJsonLd(p, env),
    };
  }],
  [/^\/grants\/?$/, () => ({ title: "Grants for adaptive athletes and programs", description: "Grants that pay for adaptive sports equipment, travel, fees and programs. You apply on the grant maker's site." })],
  [new RegExp(`^/grants/(${UUID})/?$`, "i"), async (m, env) => {
    if (!env.DB) return { title: "Grant", description: HOME_DESCRIPTION };
    let g = null;
    try { g = await getGrant(env.DB, m[1].toLowerCase()); } catch (_) { g = null; }
    if (!g) return notFound("We couldn't find that grant");
    return { title: `${g.name}${g.source ? `, from ${g.source}` : ""}`, description: `${g.name}: a grant for adaptive sports. See who it is for, the deadline and how to apply.` };
  }],
  [/^\/events\/?$/, () => ({ title: "Adaptive sports events", description: "Clinics, tryouts and game days. Know of one? Add it and a person will check it." })],
  [/^\/add\/program\/?$/, () => ({ title: "Add a program", description: "Tell us about an adaptive sports program. A person checks every one before it goes up.", noindex: true })],
  [/^\/add\/event\/?$/, () => ({ title: "Add an event", description: "Tell us about an adaptive sports event. A person checks every one before it goes up.", noindex: true })],
  [new RegExp(`^/update/(${UUID})/?$`, "i"), () => ({ title: "Suggest a fix", description: "Tell us what to fix on a listing.", noindex: true })],
  [/^\/help\/?$/, () => ({ title: "Help build this", description: "Add a program or an event, suggest a fix, or confirm the program you run." })],
  [/^\/about\/?$/, () => ({ title: "How we check listings", description: "What Verified means, what Not verified yet means, and how we keep every listing up to date." })],
  [/^\/resources\/?$/, () => ({ title: "Resources", description: "Directories and resources for adaptive athletes, veterans and families." })],
  [/^\/resources\/veteran-owned-businesses\/?$/, () => ({ title: "Support Veteran-Owned Businesses", description: "Find veteran-owned businesses in your state using these directories." })],
  [/^\/letter\/?$/, () => ({ title: "Get the letter", description: "New programs, grants and events, when there is something worth sending." })],
  [/^\/privacy\/?$/, () => ({ title: "Privacy policy", description: "What Adaptive Sports Near Me collects, why, and the choices you have." })],
  [/^\/terms\/?$/, () => ({ title: "Terms of use", description: "The terms for using Adaptive Sports Near Me, a free directory run by Adapt To Life." })],
];

function notFound(title = "Page not found") {
  return { title, description: "That page isn't here. Search adaptive sports near you instead.", noindex: true, status: 404 };
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
  [/^\/states$/, "states"], [/^\/states\/[^/]+$/, "state"], [/^\/programs\/[^/]+$/, "program"],
  [/^\/grants$/, "grants"], [/^\/grants\/[^/]+$/, "grant"], [/^\/events$/, "events"],
  [/^\/(add\/program|add\/event|update\/[^/]+)$/, "forms"], [/^\/resources\/veteran-owned-businesses$/, "vob"],
  [/^\/(help|about|resources|letter|privacy|terms)$/, "help"],
];
export function preloadHints(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
  const hit = VIEWS.find(([re]) => re.test(path));
  if (!hit) return [];
  const tags = [`<link rel="modulepreload" href="/app/views/${hit[1]}.js">`, `<link rel="preload" href="/app/views/${hit[1]}.css" as="style">`];
  const id = path.match(new RegExp(`^/programs/(${UUID})$`, "i"));
  if (id) tags.push(`<link rel="preload" href="/api/orgs/${id[1].toLowerCase()}" as="fetch" crossorigin>`);
  return tags;
}

export function injectMeta(html, meta, { url, production, hints = [] }) {
  const title = meta.title ? `${meta.title} · ${SITE_NAME}` : `${SITE_NAME}: find adaptive sports programs near you`;
  const description = meta.description || HOME_DESCRIPTION;
  const canonical = meta.canonical || ORIGIN + (url.pathname.replace(/\/+$/, "") || "/");
  const noindex = meta.noindex || !production;
  const tags = [
    `<link rel="canonical" href="${esc(canonical)}">`,
    `<meta property="og:title" content="${esc(meta.title || SITE_NAME)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(canonical)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    `<meta property="og:image" content="${ORIGIN}/og-image.jpg">`,
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
  const id = pathname.match(new RegExp(`^/(programs|grants|update)/(${UUID})/?$`, "i"));
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
  if (to) return Response.redirect(new URL(to, url).toString(), 301);
  const hit = matchPage(url.pathname);
  // Not a page we know and not a file or an API: the app's own "not found" page, as a 404.
  if (!hit && (/\.[a-z0-9]{1,8}$/i.test(url.pathname) || /^\/(api|admin)(\/|$)/.test(url.pathname))) return null;
  let meta;
  if (!hit) meta = notFound();
  else try { meta = await hit.build(hit.m, env, url); } catch (err) {
    console.error("page meta error:", err);
    meta = { title: SITE_NAME, description: HOME_DESCRIPTION };
  }
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
    for (const p of snap.items) if (isListable(p)) urls.push(`/programs/${p.id}`);
    try {
      const g = await env.DB.prepare("SELECT id FROM grants WHERE is_public = 1 AND status = 'active'").all();
      for (const r of g.results || []) urls.push(`/grants/${r.id}`);
    } catch (_) { /* no grants table yet */ }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${ORIGIN}${u}</loc></url>`).join("\n")}\n</urlset>\n`;
}
