// Server-rendered program detail page — the shareable URL for one listing.
// Same sheet as the in-app detail (public/index.html): Directory header,
// photo hero, name, city+state (or statewide), primary action, fact rows
// only when present. A listing, not a marketing page — no invented copy,
// no verification/trust line. Nearby is a horizontal shelf, not a stack.

import { listingVisual, isCoverVisual, stampAttr } from "./visuals.js";

const SITE = "https://adaptivesportsnearme.com";

// Legacy 11-photo launch set. Kept so older callers still resolve a key.
// New listings use listingVisual (scene or stamp) unless a real photo exists.
export const SPORT_PHOTOS = new Set([
  "baseball", "basketball", "cycling", "football", "goalball",
  "pickleball", "rugby", "skiing", "sledhockey", "tennis", "waterskiing",
]);

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

function sourceWithUrl(org) {
  const list = (org.sources && org.sources.length)
    ? org.sources
    : (org.primarySource ? [{ name: org.primarySource, url: org.primarySourceUrl || null }] : []);
  return list.find((s) => s && s.url) || null;
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

function nearbyCard(p) {
  const loc = locLine(p);
  // Distance or nothing. The org type is a default, not a difference (see cardLine in index.html).
  const line = p.dist != null ? `${p.dist} mi away` : "";
  const v = listingVisual(p, "program");
  const media = isCoverVisual(v)
    ? `<div class="pcard-media has-photo"><img class="pcard-img" src="${esc(v.src)}" alt=""${stampAttr(p, "program")}></div>`
    : `<div class="pcard-media has-stamp">${v.src ? `<img class="pcard-stamp" src="${esc(v.src)}" alt="">` : ""}</div>`;
  return `<a class="pcard" href="/programs/${esc(p.id)}">${media}<div class="pcard-body"><div class="pcard-sport">${esc(p.sportLabel || "Multi-Sport")}</div><div class="pcard-name">${esc(p.name)}</div><div class="pcard-loc">${esc(loc)}</div>${line ? `<div class="pcard-line">${esc(line)}</div>` : ""}</div></a>`;
}

function nearbyStrip(items, sportLabel) {
  if (!items || !items.length) return "";
  const list = items.slice(0, 6);
  return `<div class="nearby"><h2>Nearby ${esc((sportLabel || "adaptive sport").toLowerCase())}</h2><div class="frow-scroll">${list.map(nearbyCard).join("")}</div></div>`;
}

const CSS = `
:root{
  color-scheme:light;--ink:#1A1A1A;--ink2:#3A3A37;--paper:#FFFFFF;--mist:#F7F7F5;--sand:#F0EFEC;--line:#E7E6E2;--muted:#6E6D6A;--faint:#736F6A;--orange:#C5430C;--orange-ink:#A8370A;--r:12px;--r-lg:16px;--r-full:999px;
  /* Rhythm. Do not tighten these to "fix AI look"; Alec locked 24/32/40/48/64 on 2026-08-21. */
  --space-page: 24px;  /* gutter */
  --space-header: 64px;
  --tap: 44px;
  --space-title-gap: 8px;
  --space-after-photo: 32px;
  --space-section: 40px;
  --space-nearby: 48px;
  --space-row: 16px;
  --gut: var(--space-page);
}
*{box-sizing:border-box;}
@media (prefers-reduced-motion: reduce){*{transition:none!important;animation:none!important;}}
html,body{margin:0;padding:0;background:var(--mist);color:var(--ink);}
body{font-family:'DM Sans',system-ui,sans-serif;font-size:16px;line-height:1.45;-webkit-font-smoothing:antialiased;}
img,svg{display:block;max-width:100%;}
a{color:var(--orange-ink);}
.wrap{max-width:880px;margin:0 auto;padding:var(--space-page) var(--space-page) var(--space-header);}
.bar{min-height:var(--space-header);display:flex;align-items:center;}
.back{display:inline-flex;align-items:center;min-height:var(--tap);font-size:16px;font-weight:600;color:var(--ink);text-decoration:none;}
.back:hover{color:var(--orange-ink);}
.dhero{position:relative;width:100%;height:clamp(180px,24vw,260px);border-radius:var(--r-lg);overflow:hidden;margin:0 0 var(--space-after-photo);}
.dhero.has-dphoto{background:#23211f;height:clamp(240px,48vw,520px);}
.dhero.has-dphoto .dhero-img{object-fit:cover;object-position:50% 58%;}
@media(min-width:900px){
  main.wrap>.dhero.has-dphoto{width:100vw;max-width:100vw;margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);border-radius:0;height:min(48vw,560px);}
}
.dhero.has-stamp{background:#F6F4F0;display:flex;align-items:center;justify-content:center;}
.dhero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 30%;}
.dhero-stamp{width:min(42%,180px);height:auto;object-fit:contain;position:relative;z-index:1;}
.dhero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(0,0,0,.55));pointer-events:none;}
.dhero.has-stamp::after{background:linear-gradient(180deg,transparent 58%,rgba(26,26,26,.10));}
.dhero.has-stamp .dov{color:var(--ink);}
.dov{position:absolute;left:16px;bottom:16px;z-index:1;color:#fff;}
.dov-sport{display:block;font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;}
.dov-loc{display:block;font-size:14px;font-weight:500;margin-top:2px;}
h1{font-size:clamp(22px,2.8vw,30px);font-weight:700;letter-spacing:-.02em;line-height:1.15;margin:0 0 var(--space-title-gap);}
.loc{font-size:16px;color:var(--ink2);margin:0;}
.desc{font-size:16px;line-height:1.55;color:var(--ink2);margin:16px 0 0;max-width:68ch;}
/* Scraped descriptions run long and tail off into source notes. Show a readable
   opening and let the reader ask for the rest. No JS: the toggle is a label,
   and the full text stays in the document for search engines and copy-paste. */
.desc-x{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;}
.desc-long{display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden;}
.desc-x:checked ~ .desc-long{display:block;-webkit-line-clamp:none;}
.desc-btn{display:inline-flex;align-items:center;min-height:var(--tap);font-size:15px;font-weight:600;color:var(--orange-ink);cursor:pointer;text-decoration:underline;text-underline-offset:3px;}
.desc-btn .dm-less,.desc-x:checked ~ .desc-btn .dm-more{display:none;}
.desc-x:checked ~ .desc-btn .dm-less{display:inline;}
.desc-x:focus-visible ~ .desc-btn{outline:2px solid var(--orange);outline-offset:3px;border-radius:4px;}
@media(max-width:720px){.desc-long{-webkit-line-clamp:8;}}
.titleb{margin:0 0 var(--space-section);}
.cta{display:inline-flex;align-items:center;justify-content:center;min-width:220px;height:var(--tap);padding:0 22px;background:var(--orange);color:#fff;border-radius:var(--r);font-size:16px;font-weight:700;text-decoration:none;}
.cta:hover{background:var(--orange-ink);}
.host{font-size:14px;color:var(--muted);margin-left:12px;}
.act{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 var(--space-section);}
.rows{margin:0;border-top:1px solid var(--line);}
.row{display:flex;gap:var(--space-row);padding:var(--space-row) 0;border-bottom:1px solid var(--line);font-size:16px;}
.row .k{color:var(--muted);width:92px;flex:0 0 auto;}
.row .v{color:var(--ink);font-weight:500;min-width:0;}
.empty{color:var(--muted);margin:0;}
.nearby{margin-top:var(--space-nearby);}
.act + .nearby,.titleb + .nearby{margin-top:8px;}
.nearby h2{font-size:22px;font-weight:700;letter-spacing:-.02em;margin:0 0 var(--space-row);}
.frow-scroll{display:flex;gap:var(--space-row);overflow-x:auto;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;padding-bottom:6px;padding-right:var(--space-page);margin-right:calc(-1 * var(--space-page));scrollbar-width:none;}
.frow-scroll::-webkit-scrollbar{display:none;}
.frow-scroll>.pcard{flex:0 0 78vw;width:78vw;scroll-snap-align:start;}
.pcard{display:block;color:inherit;text-decoration:none;}
.pcard-media{position:relative;aspect-ratio:4/3;border-radius:10px;overflow:hidden;background:#F6F4F0;}
.pcard-media.has-stamp{display:flex;align-items:center;justify-content:center;}
.pcard-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.pcard-stamp{width:46%;height:auto;object-fit:contain;position:relative;z-index:1;}
.pcard-body{padding:8px 1px 0;}
.pcard-sport{font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--faint);}
/* Two-line box either way, so the rail keeps its baselines. */
.pcard-name{font-size:16px;font-weight:600;line-height:1.25;margin:2px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.5em;}
.pcard-loc,.pcard-line{font-size:14px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
@media(max-width:720px){
  .frow-scroll{gap:12px;}
}
@media(min-width:721px){
  .frow-scroll>.pcard{flex:0 0 calc((100% - 48px)/4.2);width:calc((100% - 48px)/4.2);}
}
@media(max-width:600px){
  .cta{width:100%;min-width:0;}
}
`;

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
<link rel="stylesheet" href="/tokens.css">
<style>${CSS}</style>
</head>
<body>
<main class="wrap">
${body}
</main>
</body>
</html>`;
}

// The listing body shared by /programs/:id and the map tray expanded height.
// Photo, title, city, desc, fact rows, Visit CTA, nearby rail. No Directory chrome.
export function listingInnerHtml(org, { nearby = [] } = {}) {
  const name = org.name || "Adaptive sports program";
  const sport = org.sportLabel || "Multi-Sport";
  const loc = locLine(org);
  const v = listingVisual(org, "program");
  const overlay = `<div class="dov"><span class="dov-sport">${esc(sport)}</span><span class="dov-loc">${esc(loc)}</span></div>`;
  const hero = isCoverVisual(v)
    ? `<div class="dhero has-dphoto"><img class="dhero-img" src="${esc(v.src)}" alt=""${stampAttr(org, "program")}>${overlay}</div>`
    : `<div class="dhero has-stamp">${v.src ? `<img class="dhero-stamp" src="${esc(v.src)}" alt="">` : ""}${overlay}</div>`;
  const cta = primaryCta(org);
  const action = cta
    ? `<div class="act"><a class="cta" href="${esc(cta.href)}" rel="noopener">${esc(cta.label)}</a>${org.website ? `<span class="host">${esc(hostFromUrl(org.website))}</span>` : ""}</div>`
    : "";
  const desc = descBlock(org.desc);
  return `${hero}
<div class="titleb">
<h1>${esc(name)}</h1>
<p class="loc">${esc(loc)}</p>
${desc}
</div>
${action}
${denseRows(org)}
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
    image: photo ? `${site}${photo}` : undefined,
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
