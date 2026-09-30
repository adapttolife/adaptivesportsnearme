// Server-rendered grant detail page — same sheet as /programs/:id, and the same
// chrome: it is a standalone shareable URL, so it wears the site header and the
// sitemap footer from site-chrome.js.
// Photo hero, name, funder/amount/deadline, Apply CTA, fact rows only when
// present. Other grants is a horizontal rail, not miles. No invented copy,
// no verification/trust line.

import { SPORT_PHOTOS, photoPath } from "./program-page.js";
import { listingVisual, isCoverVisual, stampAttr } from "./visuals.js";
import { headerHtml, footerHtml, navScriptHtml } from "./site-chrome.js";

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
