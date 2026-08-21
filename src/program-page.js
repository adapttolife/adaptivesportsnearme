// Server-rendered program detail page — the shareable URL for one listing.
// Fields on the page: name, sport, city/state, website, source. No extra chrome.

const SITE = "https://adaptivesportsnearme.com";

function esc(s) {
  return s == null ? "" : String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function locLine(org) {
  if (org.city && org.state) return `${org.city}, ${org.state}`;
  if (org.city && org.stateName) return `${org.city}, ${org.stateName}`;
  if (org.city) return org.city;
  if (org.stateName) return org.stateName;
  if (org.state) return org.state;
  return "United States";
}

function hostFromUrl(u) {
  try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; }
}

function sourceLines(org) {
  const srcs = (org.sources && org.sources.length)
    ? org.sources
    : (org.primarySource ? [{ name: org.primarySource }] : []);
  if (!srcs.length) return "<p class=\"src\">Community submission</p>";
  return srcs.map((s) => {
    const name = esc(s.name || "Source");
    const orgName = s.organization ? ` <span class="muted">${esc(s.organization)}</span>` : "";
    const link = s.url
      ? `<a href="${esc(s.url)}" rel="noopener">${name}</a>${orgName}`
      : `${name}${orgName}`;
    return `<p class="src">${link}</p>`;
  }).join("");
}

const CSS = `
:root{color-scheme:light;--ink:#1A1A1A;--ink2:#3A3A37;--paper:#FFFFFF;--mist:#F7F7F5;--sand:#F0EFEC;--line:#E7E6E2;--muted:#6E6D6A;--faint:#736F6A;--orange:#C5430C;--orange-ink:#A8370A;--r:12px;--r-lg:16px;--gut:clamp(20px,4vw,48px);}
*{box-sizing:border-box;}
html,body{margin:0;padding:0;background:var(--mist);color:var(--ink);}
body{font-family:'DM Sans',system-ui,sans-serif;font-size:16px;line-height:1.55;-webkit-font-smoothing:antialiased;}
a{color:var(--orange-ink);}
.wrap{max-width:720px;margin:0 auto;padding:28px var(--gut) 64px;}
.back{display:inline-block;font-size:14px;font-weight:600;color:var(--muted);text-decoration:none;margin-bottom:22px;}
.back:hover{color:var(--ink);}
.eyebrow{font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--faint);margin:0 0 8px;}
h1{font-size:32px;font-weight:700;letter-spacing:-.02em;line-height:1.15;margin:0 0 10px;}
.loc{font-size:16px;color:var(--ink2);margin:0 0 22px;}
.card{background:var(--paper);border:1px solid var(--line);border-radius:var(--r-lg);padding:18px 20px;margin:0 0 14px;}
.k{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);margin:0 0 6px;}
.v{margin:0;color:var(--ink);}
.src{margin:0 0 6px;}
.src:last-child{margin-bottom:0;}
.muted{color:var(--muted);font-weight:400;}
.web{display:inline-block;margin-top:4px;font-weight:600;text-decoration:none;}
.web:hover{text-decoration:underline;}
.empty{color:var(--muted);margin:0;}
`;

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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>
<main class="wrap">
${body}
</main>
</body>
</html>`;
}

export function programPageTemplate(org, { site = SITE } = {}) {
  const name = org.name || "Adaptive sports program";
  const sport = org.sportLabel || "Multi-Sport";
  const loc = locLine(org);
  const canonical = `${site}/programs/${org.id}`;
  const website = org.website
    ? `<a class="web" href="${esc(org.website)}" rel="noopener">${esc(hostFromUrl(org.website))}</a>`
    : `<p class="empty">No website on file.</p>`;
  const body = `<a class="back" href="/">← Directory</a>
<p class="eyebrow">${esc(sport)}</p>
<h1>${esc(name)}</h1>
<p class="loc">${esc(loc)}</p>
<div class="card"><p class="k">Sport</p><p class="v">${esc(sport)}</p></div>
<div class="card"><p class="k">City / state</p><p class="v">${esc(loc)}</p></div>
<div class="card"><p class="k">Website</p>${website}</div>
<div class="card"><p class="k">Source</p>${sourceLines(org)}</div>`;
  return page({
    title: `${name} · Adaptive Sports Near Me`,
    description: `${sport} in ${loc}.`,
    canonical,
    body,
  });
}

export function programNotFoundTemplate({ site = SITE } = {}) {
  const body = `<a class="back" href="/">← Directory</a>
<p class="eyebrow">Program</p>
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
