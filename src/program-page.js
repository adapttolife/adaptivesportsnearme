// Server-rendered program detail page — the shareable URL for one listing.
// Same visual language as the in-app sheet: sport photo hero, name, city+state,
// website button, source, back to directory. No extra chrome, no repeated fields.

const SITE = "https://adaptivesportsnearme.com";

// The 11-photo launch set in public/assets/sport-photos/. Same keys the
// homepage cards and in-app sheet use (photoSrc in public/index.html).
export const SPORT_PHOTOS = new Set([
  "baseball", "basketball", "cycling", "football", "goalball",
  "pickleball", "rugby", "skiing", "sledhockey", "tennis", "waterskiing",
]);

function esc(s) {
  return s == null ? "" : String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function locLine(org) {
  if (org.city && org.state) return `${org.city}, ${org.state}`;
  if (org.city && org.stateName) return `${org.city}, ${org.stateName}`;
  if (org.city) return org.city;
  if (org.stateName) return org.stateName;
  if (org.state) return org.state;
  return "United States";
}

export function photoPath(sport) {
  return sport && SPORT_PHOTOS.has(sport) ? `/assets/sport-photos/${sport}.jpg` : null;
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
:root{color-scheme:light;--ink:#1A1A1A;--ink2:#3A3A37;--paper:#FFFFFF;--mist:#F7F7F5;--sand:#F0EFEC;--line:#E7E6E2;--muted:#6E6D6A;--faint:#736F6A;--orange:#C5430C;--orange-ink:#A8370A;--r:12px;--r-lg:16px;--r-xl:20px;--r-full:999px;--gut:clamp(20px,4vw,48px);}
*{box-sizing:border-box;}
html,body{margin:0;padding:0;background:var(--mist);color:var(--ink);}
body{font-family:'DM Sans',system-ui,sans-serif;font-size:16px;line-height:1.55;-webkit-font-smoothing:antialiased;}
img,svg{display:block;max-width:100%;}
a{color:var(--orange-ink);}
.wrap{max-width:760px;margin:0 auto;padding:22px var(--gut) 64px;}
.back{display:inline-block;font-size:14px;font-weight:600;color:var(--muted);text-decoration:none;margin-bottom:18px;}
.back:hover{color:var(--ink);}
.dhero{position:relative;width:100%;height:clamp(220px,32vw,360px);border-radius:var(--r-xl);overflow:hidden;margin:0 0 22px;}
.dhero.has-dphoto{background:#23211f;}
.dhero.g-sand{background:linear-gradient(140deg,#F2EFEA 0%,#E5DED3 100%);}
.dhero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 30%;}
.dhero .eyebrow{position:absolute;bottom:16px;left:18px;background:rgba(255,255,255,.9);border-radius:var(--r-full);padding:6px 12px;font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--muted);}
h1{font-size:clamp(28px,4vw,40px);font-weight:700;letter-spacing:-.02em;line-height:1.1;margin:0 0 8px;}
.loc{font-size:16px;color:var(--ink2);margin:0 0 22px;}
.cta{display:flex;align-items:center;justify-content:center;width:100%;height:50px;background:var(--orange);color:#fff;border-radius:var(--r);font-size:16px;font-weight:700;text-decoration:none;}
.cta:hover{background:var(--orange-ink);}
.empty{color:var(--muted);margin:0 0 8px;}
.listed{margin-top:28px;}
.listed .k{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin:0 0 8px;}
.src{margin:0 0 6px;}
.src:last-child{margin-bottom:0;}
.muted{color:var(--muted);font-weight:400;}
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
  const photo = photoPath(org.sport);
  const hero = photo
    ? `<div class="dhero has-dphoto"><img class="dhero-img" src="${esc(photo)}" alt=""><span class="eyebrow">${esc(sport)}</span></div>`
    : `<div class="dhero g-sand"><span class="eyebrow">${esc(sport)}</span></div>`;
  const website = org.website
    ? `<a class="cta" href="${esc(org.website)}" rel="noopener">Visit website</a>`
    : `<p class="empty">No website on file.</p>`;
  const body = `<a class="back" href="/">← Directory</a>
${hero}
<h1>${esc(name)}</h1>
<p class="loc">${esc(loc)}</p>
${website}
<div class="listed"><p class="k">Listed from</p>${sourceLines(org)}</div>`;
  return page({
    title: `${name} · Adaptive Sports Near Me`,
    description: `${sport} in ${loc}.`,
    canonical,
    image: photo ? `${site}${photo}` : undefined,
    body,
  });
}

export function programNotFoundTemplate({ site = SITE } = {}) {
  const body = `<a class="back" href="/">← Directory</a>
<p class="empty">Program</p>
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
