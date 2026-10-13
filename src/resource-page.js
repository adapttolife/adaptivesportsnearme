// Server-rendered resource pages: /resources and /resources/veteran-owned-businesses.
// Plain links to directories other people keep, so they paint with zero JS and
// wear the same header, beta bar and footer as every listing page.

import { headerHtml, footerHtml, navScriptHtml } from "./site-chrome.js";
import { VETERAN_BUSINESS_COPY as COPY, NATIONWIDE, STATES } from "./resources/veteran-businesses.js";

const SITE = "https://adaptivesportsnearme.com";
export const VETERAN_BUSINESS_PATH = "/resources/veteran-owned-businesses";

function esc(s) {
  return s == null ? "" : String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const ext = (url, text, cls = "") =>
  `<a${cls ? ` class="${cls}"` : ""} href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}</a>`;

function page({ title, description, canonical, body }) {
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
<meta property="og:image" content="${SITE}/og-image.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
</head>
<body class="content-page">
<a class="skip" href="#main">Skip to content</a>
${headerHtml()}
<main id="main" class="wrap resource-page">
${body}
</main>
${footerHtml()}
${navScriptHtml()}
</body>
</html>`;
}

function stateCard(s) {
  const official = s.official
    ? `<li>${ext(s.official.url, s.official.name)} <span class="res-tag is-official">Official state directory</span></li>`
    : `<li class="res-pending">${esc(COPY.notVerified)}</li>`;
  return `<section class="state-card" id="state-${s.code.toLowerCase()}" aria-labelledby="state-${s.code.toLowerCase()}-h">
<h3 id="state-${s.code.toLowerCase()}-h">${esc(s.name)}</h3>
<ul>${official}<li>${ext(s.national.url, s.national.name)}</li></ul>
</section>`;
}

export function veteranBusinessPageTemplate({ site = SITE } = {}) {
  const chips = STATES.map((s) =>
    `<a href="#state-${s.code.toLowerCase()}" aria-label="${esc(s.name)}">${s.code}</a>`).join("");
  const nationwide = NATIONWIDE.map((d) =>
    `<li class="res-card">${ext(d.url, d.name, "res-card-name")}<p>${esc(d.note)}</p></li>`).join("");
  const body = `<header class="bar"><a class="back" href="/resources">← Resources</a></header>
<div class="res-hero">
<p class="res-eyebrow">Resources</p>
<h1>${esc(COPY.title)}</h1>
<p class="res-kicker">${esc(COPY.kicker)}</p>
${COPY.intro.map((p) => `<p class="res-lede">${esc(p)}</p>`).join("\n")}
<p class="res-note">${esc(COPY.disclaimer)}</p>
</div>
<section class="res-section" aria-labelledby="res-national-h">
<h2 id="res-national-h">Nationwide directories</h2>
<ul class="res-cards">${nationwide}</ul>
</section>
<section class="res-section" aria-labelledby="res-states-h">
<h2 id="res-states-h">${esc(COPY.stateLead)}</h2>
<p class="res-scope">${esc(COPY.scope)}</p>
<nav class="state-chips" aria-label="Jump to a state">${chips}</nav>
<div class="state-grid">${STATES.map(stateCard).join("\n")}</div>
</section>
<section class="res-section res-help" aria-labelledby="res-help-h">
<h2 id="res-help-h">Know a directory we should add?</h2>
<p>If your state keeps an official list of veteran-owned businesses, send us the link and a person on our team will check it.</p>
<p><a class="fix-btn" href="mailto:hello@adaptivesportsnearme.com?subject=Veteran-owned%20business%20directory">Email us a directory</a></p>
</section>`;
  return page({
    title: `${COPY.title} · Adaptive Sports Near Me`,
    description: `${COPY.intro[0]} Find veteran-owned businesses in your state.`,
    canonical: `${site}${VETERAN_BUSINESS_PATH}`,
    body,
  });
}

// The resources door. One page today; more resource lists join it here.
export function resourcesIndexTemplate({ site = SITE } = {}) {
  const body = `<header class="bar"><a class="back" href="/">← Directory</a></header>
<div class="res-hero">
<p class="res-eyebrow">Resources</p>
<h1>Resources</h1>
<p class="res-lede">Lists other people keep, gathered in one place. We link to them; we do not vouch for every business or group they list.</p>
</div>
<ul class="res-cards">
<li class="res-card"><a class="res-card-name" href="${VETERAN_BUSINESS_PATH}">${esc(COPY.title)}</a><p>Nationwide and state directories of veteran-owned businesses.</p></li>
</ul>`;
  return page({
    title: "Resources · Adaptive Sports Near Me",
    description: "Lists of veteran-owned businesses and other resources, gathered in one place.",
    canonical: `${site}/resources`,
    body,
  });
}
