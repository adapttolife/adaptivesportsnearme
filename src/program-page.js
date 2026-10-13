// Server-rendered program detail page — the shareable URL for one listing.
// The standalone page wears the site header and the sitemap footer (shared with
// /blog via site-chrome.js); the in-app sheet reuses listingInnerHtml only.
// Same sheet as the in-app detail (public/index.html): Directory header,
// symbol hero, name, city+state (or statewide), whether a person has verified
// it, primary action, fact rows only when present, then "About this listing":
// last checked date, source, and the two ways to fix it (Alec, 2026-10-13: say
// whether a listing is verified, and invite people to suggest updates).
// A listing, not a marketing page — no invented copy. Nearby is a shelf.

import { listingVisual, isCoverVisual, stampAttr, symbolTile } from "./visuals.js";
import { headerHtml, footerHtml, navScriptHtml } from "./site-chrome.js";

const ListingArt = globalThis.ListingArt;

const SITE = "https://adaptivesportsnearme.com";

// The 11 launch sports that have an action photo. One list, owned by
// visuals.js, re-exported here for the callers that already import it.
export { SPORT_PHOTOS } from "./visuals.js";

// org_type -> the human label. Mirrors TYPE_LABEL in public/index.html so the
// shared link and the in-app sheet name the same thing the same way.
const TYPE_LABEL = {
  member: "Community program", team: "Competitive team", chapter: "Chapter",
  adaptive_club: "Adaptive club", inclusive_club: "Inclusive club",
  affiliate: "Affiliate", event_partner: "Event partner",
};

function esc(s) {
  return s == null ? "" : String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function locLine(org) {
  const statewide = org.geoPrecision === "state" || org.geoPrecision === "state-level";
  if (statewide) {
    const st = org.stateName || org.state;
    return st ? `${st} · statewide` : "United States · statewide";
  }
  if (org.city && org.state) return `${org.city}, ${org.state}`;
  if (org.city && org.stateName) return `${org.city}, ${org.stateName}`;
  if (org.city) return org.city;
  if (org.stateName) return org.stateName;
  if (org.state) return org.state;
  return "United States";
}

export function typeLabel(org) {
  if (!org || !org.type) return null;
  return TYPE_LABEL[org.type] || null;
}

export function photoPath(sport, item) {
  const v = listingVisual(item || { sport }, "program");
  return isCoverVisual(v) ? v.src : null;
}

function hostFromUrl(u) {
  try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; }
}

// A public source with a link, for the "View source" fallback. Our own research
// files (Drive links, CSV names) are never a destination for a visitor.
function sourceWithUrl(org) {
  const list = (org.sources && org.sources.length)
    ? org.sources
    : (org.primarySource ? [{ name: org.primarySource, url: org.primarySourceUrl || null }] : []);
  return list.find((s) => s && s.url && !ListingArt.isInternalSource(s)) || null;
}

// website → tel → mailto → primary source link. Never an empty-page stub.
export function primaryCta(org) {
  if (org.website) return { href: org.website, label: "Visit website" };
  const phone = org.phone && String(org.phone).trim();
  if (phone) return { href: `tel:${phone.replace(/[^\d+]/g, "")}`, label: "Call" };
  if (org.email) return { href: `mailto:${org.email}`, label: "Email" };
  const src = sourceWithUrl(org);
  if (src) return { href: src.url, label: "View source" };
  return null;
}

function denseRows(org) {
  const type = typeLabel(org);
  const pairs = [
    ["Cost", org.cost],
    ["Ages", org.ages],
    ["Equipment", org.equipment],
    ["Phone", org.phone],
    ["Email", org.email],
    ["Type", type],
  ].filter(([, v]) => v);
  if (!pairs.length) return "";
  return `<div class="rows">${pairs.map(([k, v]) => {
    let val = esc(v);
    if (k === "Phone") {
      const tel = String(v).replace(/[^\d+]/g, "");
      val = `<a href="tel:${esc(tel)}">${esc(v)}</a>`;
    } else if (k === "Email") {
      val = `<a href="mailto:${esc(v)}">${esc(v)}</a>`;
    }
    return `<div class="row"><span class="k">${k}</span><span class="v">${val}</span></div>`;
  }).join("")}</div>`;
}

// Long descriptions get a clamp plus a native toggle. 340 characters is roughly
// what the clamp shows at the 68ch measure, so the toggle only appears when it
// is actually hiding something.
function descBlock(desc) {
  if (!desc) return "";
  if (String(desc).length <= 340) return `<p class="desc">${esc(desc)}</p>`;
  return `<input class="desc-x" type="checkbox" id="descmore" aria-label="Show the full description">`
    + `<p class="desc desc-long">${esc(desc)}</p>`
    + `<label class="desc-btn" for="descmore"><span class="dm-more">More</span><span class="dm-less">Less</span></label>`;
}

// The card's one trust line: Verified, or Not yet verified. Same words as the app.
export function trustHtml(p) {
  const t = ListingArt.trustLine(p);
  return `<div class="pcard-trust ${t.cls}">${t.text}</div>`;
}

function nearbyCard(p) {
  const loc = locLine(p);
  // Distance or nothing. The org type is a default, not a difference (see cardLine in index.html).
  const line = p.dist != null ? `${p.dist} mi away` : "";
  const v = listingVisual(p, "program");
  const media = isCoverVisual(v)
    ? `<div class="pcard-media has-photo"><img class="pcard-img" src="${esc(v.src)}" alt=""${stampAttr(p, "program")}></div>`
    : symbolTile(v, "pcard-media");
  return `<a class="pcard" href="/programs/${esc(p.id)}">${media}<div class="pcard-body"><div class="pcard-sport">${esc(p.sportLabel || "Multi-Sport")}</div><div class="pcard-name">${esc(p.name)}</div><div class="pcard-loc">${esc(loc)}</div>${line ? `<div class="pcard-line">${esc(line)}</div>` : ""}${trustHtml(p)}</div></a>`;
}

// "Nearby" only when the closest one is within reach; 600 miles is not nearby.
export const NEARBY_MILES = 100;
export function nearbyHeading(items, sportLabel) {
  const label = (sportLabel || "adaptive sports").toLowerCase();
  const first = items && items[0];
  return first && first.dist != null && first.dist <= NEARBY_MILES ? `Nearby ${label}` : `More ${label}`;
}

function nearbyStrip(items, sportLabel) {
  if (!items || !items.length) return "";
  const list = items.slice(0, 6);
  return `<div class="nearby"><h2>${esc(nearbyHeading(list, sportLabel))}</h2><div class="frow-scroll">${list.map(nearbyCard).join("")}</div></div>`;
}

// What a visitor should know before they rely on a listing, and how to fix it.
// Verified means a person checked it against an official source; nothing
// automatic earns the word. The checked date is the automatic website check.
export function aboutListingHtml(org) {
  const verified = ListingArt.isVerified(org);
  const month = ListingArt.monthLabel(org.verifiedMonth);
  const sources = (org.sources && org.sources.length)
    ? org.sources
    : (org.primarySource ? [{ name: org.primarySource, url: null }] : []);
  const src = ListingArt.publicSource(sources.find((x) => x && x.name) || null);
  const srcHtml = src
    ? (src.url
      ? `<a href="${esc(src.url)}" rel="noopener" target="_blank">${esc(src.name)}</a>`
      : esc(src.name))
    : null;
  const status = verified
    ? `<p class="about-status is-verified"><b>Verified.</b> ${esc(ListingArt.verifiedText(month))}</p>`
    : `<p class="about-status is-unverified"><b>Not yet verified.</b> ${ListingArt.unverifiedText(srcHtml, !!src && src.name === ListingArt.RESEARCH)}</p>`;
  const id = esc(org.id || "");
  const rows = [
    ListingArt.checkedRow(org).map(esc),
    verified && srcHtml ? ["Source", srcHtml] : null,
  ].filter(Boolean);
  return `<section class="about-listing" aria-labelledby="about-listing-h">
<h2 id="about-listing-h">About this listing</h2>
${status}
<div class="rows">${rows.map(([k, v]) => `<div class="row"><span class="k">${k}</span><span class="v">${v}</span></div>`).join("")}</div>
<div class="fix-links">
<a class="fix-btn" href="/?update=${id}" data-update="${id}">Suggest an update</a>
<a class="fix-link" href="/?update=${id}&amp;rel=run" data-update="${id}" data-rel="run">Run this program? Confirm your listing</a>
</div>
</section>`;
}



function page({ title, description, canonical, image, body }) {
  const ogImage = image
    ? `<meta property="og:image" content="${esc(image)}">`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
${ogImage}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
</head>
<body class="content-page">
<a class="skip" href="#main">Skip to content</a>
${headerHtml()}
<main id="main" class="wrap detail-page">
${body}
</main>
${footerHtml()}
${navScriptHtml()}
</body>
</html>`;
}

// The listing body shared by /programs/:id and the map tray expanded height.
// Photo, title, city, desc, fact rows, Visit CTA, nearby rail. Deliberately
// bare: the site header and footer belong to the standalone page's wrapper
// (page() below), never here, because in the app this HTML is already inside
// the app's own chrome.
export function listingInnerHtml(org, { nearby = [] } = {}) {
  const name = org.name || "Adaptive sports program";
  const sport = org.sportLabel || "Multi-Sport";
  const loc = locLine(org);
  const v = listingVisual(org, "program");
  const overlay = `<div class="dov"><span class="dov-sport">${esc(sport)}</span><span class="dov-loc">${esc(loc)}</span></div>`;
  const hero = isCoverVisual(v)
    ? `<div class="dhero has-dphoto"><img class="dhero-img" src="${esc(v.src)}" alt=""${stampAttr(org, "program")}>${overlay}</div>`
    : symbolTile(v, "dhero", overlay);
  const trust = ListingArt.trustLine(org);
  const cta = primaryCta(org);
  const action = cta
    ? `<div class="act"><a class="cta" href="${esc(cta.href)}" rel="noopener">${esc(cta.label)}</a>${org.website ? `<span class="host">${esc(hostFromUrl(org.website))}</span>` : ""}</div>`
    : "";
  const desc = descBlock(org.desc);
  return `${hero}
<div class="titleb">
<h1>${esc(name)}</h1>
<p class="loc">${esc(loc)}</p>
<p class="listing-trust ${trust.cls}">${trust.text}</p>
${desc}
</div>
${action}
${denseRows(org)}
${aboutListingHtml(org)}
${nearbyStrip(nearby, sport)}`;
}

export function programPageTemplate(org, { site = SITE, nearby = [] } = {}) {
  const name = org.name || "Adaptive sports program";
  const sport = org.sportLabel || "Multi-Sport";
  const loc = locLine(org);
  const canonical = `${site}/programs/${org.id}`;
  const photo = photoPath(org.sport, org);
  const body = `<header class="bar"><a class="back" href="/">← Directory</a></header>
${listingInnerHtml(org, { nearby })}`;
  return page({
    title: `${name} · Adaptive Sports Near Me`,
    description: `${sport} in ${loc}.`,
    canonical,
    image: `${site}${photo || "/og-image.jpg"}`,
    body,
  });
}

export function programNotFoundTemplate({ site = SITE } = {}) {
  const body = `<header class="bar"><a class="back" href="/">← Directory</a></header>
<h1>Program not found</h1>
<p class="empty">That listing is not in the directory.</p>`;
  return page({
    title: "Program not found · Adaptive Sports Near Me",
    description: "That listing is not in the directory.",
    canonical: `${site}/programs`,
    body,
  });
}

export const PROGRAM_ID_RE = /^\/programs\/([0-9a-f-]{36})\/?$/i;
