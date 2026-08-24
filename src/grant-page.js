// Server-rendered grant detail page — same sheet as /programs/:id.
// Photo hero, name, funder/amount/deadline, Apply CTA, fact rows only when
// present. Other grants is a horizontal rail, not miles. No invented copy,
// no verification/trust line.

import { SPORT_PHOTOS, photoPath } from "./program-page.js";
import { listingVisual, isCoverVisual, stampAttr } from "./visuals.js";

const SITE = "https://adaptivesportsnearme.com";

const TYPE_LABEL = {
  equipment: "Equipment",
  training: "Training",
  program: "Program",
  general: "Grant",
  quality_of_life: "Quality of life",
};

function esc(s) {
  return s == null ? "" : String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function grantTypeLabel(grant) {
  if (!grant || !grant.type) return null;
  return TYPE_LABEL[grant.type] || null;
}

export function grantAudienceLabel(grant) {
  if (!grant) return null;
  if (grant.audience === "program") return "Program grant";
  if (grant.audience === "athlete") return "Athlete grant";
  return null;
}

function audienceBadge(grant) {
  const label = grantAudienceLabel(grant);
  if (!label) return "";
  const cls = grant.audience === "program" ? "rsvp" : "eq";
  return `<div class="cardtags"><span class="cbadge ${cls}">${esc(label)}</span></div>`;
}

export function grantLocLine(grant) {
  const parts = [grant.source, grant.amountDisplay, grant.deadlineDisplay].filter(Boolean);
  if (parts.length) return parts.join(" · ");
  return "United States · national";
}

export function grantOverlayLoc(grant) {
  return grant.source || "United States · national";
}

function hostFromUrl(u) {
  try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; }
}

// Apply → Call → Email → View source. Never an empty-page stub.
export function primaryCta(grant) {
  if (grant.applicationUrl) return { href: grant.applicationUrl, label: "Apply" };
  const phone = grant.phone && String(grant.phone).trim();
  if (phone) return { href: `tel:${phone.replace(/[^\d+]/g, "")}`, label: "Call" };
  if (grant.email) return { href: `mailto:${grant.email}`, label: "Email" };
  if (grant.sourceUrl) return { href: grant.sourceUrl, label: "View source" };
  return null;
}

function denseRows(grant) {
  const type = grantTypeLabel(grant);
  const pairs = [
    ["Amount", grant.amountDisplay],
    ["Deadline", grant.deadlineDisplay],
    ["Eligibility", grant.eligibility],
    ["Sports", grant.sportsLabel],
    ["Who", grantAudienceLabel(grant)],
    ["Phone", grant.phone],
    ["Email", grant.email],
    ["Type", type],
    ["Org", grant.source],
    ["How to apply", grant.howToApply],
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

function otherCard(g) {
  const loc = g.source || "United States · national";
  const line = g.amountDisplay || g.deadlineDisplay || "";
  const v = listingVisual(g, "grant");
  const media = isCoverVisual(v)
    ? `<div class="pcard-media has-photo"><img class="pcard-img" src="${esc(v.src)}" alt=""${stampAttr(g, "grant")}></div>`
    : `<div class="pcard-media has-stamp">${v.src ? `<img class="pcard-stamp" src="${esc(v.src)}" alt="">` : ""}</div>`;
  const kind = grantAudienceLabel(g) || grantTypeLabel(g) || "Grant";
  return `<a class="pcard" href="/grants/${esc(g.id)}">${media}<div class="pcard-body"><div class="pcard-sport">${esc(kind)}</div><div class="pcard-name">${esc(g.name)}</div><div class="pcard-loc">${esc(loc)}</div>${line ? `<div class="pcard-line">${esc(line)}</div>` : ""}</div></a>`;
}

function otherStrip(items) {
  if (!items || !items.length) return "";
  const list = items.slice(0, 6);
  return `<div class="nearby"><h2>Other grants</h2><div class="frow-scroll">${list.map(otherCard).join("")}</div></div>`;
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
.cardtags{position:absolute;top:12px;left:12px;z-index:2;display:flex;flex-direction:column;align-items:flex-start;gap:6px;}
.cbadge{display:inline-flex;align-items:center;height:24px;padding:0 11px;border-radius:var(--r-full);font-size:12px;font-weight:700;letter-spacing:.01em;}
.cbadge.eq{background:rgba(255,255,255,.94);color:var(--ink);box-shadow:inset 0 0 0 1px rgba(17,17,19,.05);}
.cbadge.rsvp{background:var(--ink);color:#fff;}
h1{font-size:clamp(22px,2.8vw,30px);font-weight:700;letter-spacing:-.02em;line-height:1.15;margin:0 0 var(--space-title-gap);}
.loc{font-size:16px;color:var(--ink2);margin:0;}
.desc{font-size:16px;line-height:1.55;color:var(--ink2);margin:16px 0 0;max-width:68ch;}
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

export function listingInnerHtml(grant, { nearby = [] } = {}) {
  const name = grant.name || "Adaptive sports grant";
  const kind = grantTypeLabel(grant) || "Grant";
  const loc = grantLocLine(grant);
  const overlayLoc = grantOverlayLoc(grant);
  const v = listingVisual(grant, "grant");
  const overlay = `<div class="dov"><span class="dov-sport">${esc(kind)}</span><span class="dov-loc">${esc(overlayLoc)}</span></div>`;
  const badge = audienceBadge(grant);
  const hero = isCoverVisual(v)
    ? `<div class="dhero has-dphoto">${badge}<img class="dhero-img" src="${esc(v.src)}" alt=""${stampAttr(grant, "grant")}>${overlay}</div>`
    : `<div class="dhero has-stamp">${badge}${v.src ? `<img class="dhero-stamp" src="${esc(v.src)}" alt="">` : ""}${overlay}</div>`;
  const cta = primaryCta(grant);
  const action = cta
    ? `<div class="act"><a class="cta" href="${esc(cta.href)}" rel="noopener">${esc(cta.label)}</a>${grant.applicationUrl ? `<span class="host">${esc(hostFromUrl(grant.applicationUrl))}</span>` : ""}</div>`
    : "";
  const desc = grant.desc ? `<p class="desc">${esc(grant.desc)}</p>` : "";
  return `${hero}
<div class="titleb">
<h1>${esc(name)}</h1>
<p class="loc">${esc(loc)}</p>
${desc}
</div>
${action}
${denseRows(grant)}
${otherStrip(nearby)}`;
}

export function grantPageTemplate(grant, { site = SITE, nearby = [] } = {}) {
  const name = grant.name || "Adaptive sports grant";
  const loc = grantLocLine(grant);
  const canonical = `${site}/grants/${grant.id}`;
  const photo = isCoverVisual(listingVisual(grant, "grant")) ? listingVisual(grant, "grant").src : null;
  const body = `<header class="bar"><a class="back" href="/?db=grants">← Grants</a></header>
${listingInnerHtml(grant, { nearby })}`;
  return page({
    title: `${name} · Adaptive Sports Near Me`,
    description: loc,
    canonical,
    image: photo ? `${site}${photo}` : undefined,
    body,
  });
}

export function grantNotFoundTemplate({ site = SITE } = {}) {
  const body = `<header class="bar"><a class="back" href="/?db=grants">← Grants</a></header>
<h1>Grant not found</h1>
<p class="empty">That listing is not in the directory.</p>`;
  return page({
    title: "Grant not found · Adaptive Sports Near Me",
    description: "That listing is not in the directory.",
    canonical: `${site}/?db=grants`,
    body,
  });
}

export { SPORT_PHOTOS, photoPath };
export const GRANT_ID_RE = /^\/grants\/([0-9a-f-]{36})\/?$/i;
