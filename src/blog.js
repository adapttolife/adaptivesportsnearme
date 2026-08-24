// Blog lane — Beehiiv is the CMS. Alec writes posts in Beehiiv; this module
// fetches them via the v2 API, caches successful upstream responses in
// caches.default (300s hot / 86400s stale-on-failure), and server-renders SEO
// HTML. The network/cache orchestration lives in exported async functions
// (listPosts, getPostBySlug); everything below the "pure" line is pure and
// covered by test/blog.test.js without touching the Cache API.

const SITE = "https://adaptivesportsnearme.com";
const HOT_TTL = 300; // normal serve window — matches API_CACHE/FEED_CACHE elsewhere
const STALE_TTL = 86400; // outlives a bad beehiiv day; served only when a live fetch fails

// ---- Beehiiv fetch + cache ----------------------------------------------------

// Synthetic cache key — caches.default keys on Request/URL, not a string, and
// this never hits the network, it's just an address in the cache.
function cacheKey(bucket, id) {
  return new Request(`https://asnm-blog-cache.internal/${bucket}/${encodeURIComponent(id)}`);
}

async function safeText(res) {
  try { return await res.text(); } catch { return "(no body)"; }
}

// Fetch `url` through caches.default keyed on `id`. Serves the hot cache when
// fresh; on a cache miss, secrets-missing, or an upstream failure, falls back
// to the longer-lived stale copy so one bad beehiiv call doesn't take the page
// down. Returns { ok, data, stale } — data is null when ok is false.
async function cachedFetch(env, url, id) {
  const cache = caches.default;
  const hotKey = cacheKey("hot", id);
  const staleKey = cacheKey("stale", id);

  const hot = await cache.match(hotKey);
  if (hot) return { ok: true, data: await hot.json(), stale: false };

  if (!env.BEEHIIV_API_KEY || !env.BEEHIIV_PUBLICATION_ID) {
    console.error("beehiiv not configured (missing API key or publication id)");
    return tryStale(cache, staleKey);
  }

  let res;
  try {
    res = await fetch(url, { headers: { Authorization: `Bearer ${env.BEEHIIV_API_KEY}` } });
  } catch (err) {
    console.error("beehiiv request failed:", err);
    return tryStale(cache, staleKey);
  }
  if (!res.ok) {
    console.error("beehiiv error", res.status, await safeText(res));
    return tryStale(cache, staleKey);
  }

  let data;
  try {
    data = await res.json();
  } catch (err) {
    console.error("beehiiv response parse failed:", err);
    return tryStale(cache, staleKey);
  }

  const body = JSON.stringify(data);
  await cache.put(hotKey, new Response(body, { headers: { "Content-Type": "application/json", "Cache-Control": `max-age=${HOT_TTL}` } }));
  await cache.put(staleKey, new Response(body, { headers: { "Content-Type": "application/json", "Cache-Control": `max-age=${STALE_TTL}` } }));
  return { ok: true, data, stale: false };
}

async function tryStale(cache, staleKey) {
  const stale = await cache.match(staleKey);
  if (stale) return { ok: true, data: await stale.json(), stale: true };
  return { ok: false, data: null, stale: false };
}

// List the 20 most recent confirmed posts, newest first. Never throws —
// upstream/cache failures come back as { ok: false }, the caller renders the
// fallback page.
export async function listPosts(env) {
  if (!env.BEEHIIV_PUBLICATION_ID) {
    console.error("beehiiv not configured (missing or empty publication id)"); // never fail silent
    return { ok: false, posts: [], stale: false };
  }
  const url = `https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUBLICATION_ID}/posts` +
    `?status=confirmed&order_by=publish_date&direction=desc&limit=20`;
  const result = await cachedFetch(env, url, "list:1");
  if (!result.ok) return { ok: false, posts: [], stale: false };
  return { ok: true, posts: normalizePosts(result.data), stale: result.stale };
}

// Find a post by slug (list fetch, cheap) then fetch its full content by id.
// notFound distinguishes "no such post" (404) from "couldn't tell" (fallback).
export async function getPostBySlug(env, slug) {
  const list = await listPosts(env);
  if (!list.ok) return { ok: false, notFound: false, stale: false };
  const match = findPostBySlug(list.posts, slug);
  if (!match) return { ok: false, notFound: true, stale: false };

  const url = `https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUBLICATION_ID}/posts/${encodeURIComponent(match.id)}?expand=free_web_content`;
  const result = await cachedFetch(env, url, `post:${match.id}`);
  if (!result.ok) return { ok: false, notFound: false, stale: false };
  return { ok: true, post: normalizePostDetail(result.data, match), stale: result.stale };
}

// ============================ pure below this line ============================

// Defensive against beehiiv shape drift: every field is type-checked, missing
// fields fall back to "". Drops posts with no slug (can't link to them) or no
// id (can't fetch their content), and hides anything publish_date puts in the
// future (scheduled-but-not-live). `now` is injectable for deterministic tests.
export function normalizePosts(data, now = Date.now()) {
  const raw = Array.isArray(data && data.data) ? data.data : [];
  const nowSecs = now / 1000;
  const out = [];
  for (const p of raw) {
    if (!p || typeof p !== "object") continue;
    const id = p.id != null ? String(p.id) : "";
    const slug = typeof p.slug === "string" ? p.slug.trim() : "";
    if (!id || !slug) continue;
    const publishDate = typeof p.publish_date === "number" ? p.publish_date : null;
    if (publishDate != null && publishDate > nowSecs) continue;
    out.push({
      id,
      slug,
      title: typeof p.title === "string" ? p.title : "",
      subtitle: typeof p.subtitle === "string" ? p.subtitle : "",
      publishDate,
      thumbnailUrl: typeof p.thumbnail_url === "string" ? p.thumbnail_url : "",
      webUrl: typeof p.web_url === "string" ? p.web_url : "",
    });
  }
  return out;
}

export function findPostBySlug(posts, slug) {
  return posts.find((p) => p.slug === slug) || null;
}

// Merges the detail-endpoint response over the list-fetch fallback (fallback
// covers a detail response that's missing/malformed fields) and sanitizes the
// post body HTML.
export function normalizePostDetail(data, fallback) {
  const p = data && typeof data.data === "object" && data.data ? data.data : {};
  const bodyHtmlRaw = p.content && typeof p.content === "object"
    && p.content.free && typeof p.content.free === "object"
    && typeof p.content.free.web === "string" ? p.content.free.web : "";
  return {
    id: fallback.id,
    slug: fallback.slug,
    title: typeof p.title === "string" ? p.title : fallback.title,
    subtitle: typeof p.subtitle === "string" ? p.subtitle : fallback.subtitle,
    publishDate: typeof p.publish_date === "number" ? p.publish_date : fallback.publishDate,
    thumbnailUrl: typeof p.thumbnail_url === "string" ? p.thumbnail_url : fallback.thumbnailUrl,
    webUrl: typeof p.web_url === "string" ? p.web_url : fallback.webUrl,
    bodyHtml: sanitizeHtml(bodyHtmlRaw),
  };
}

// Regex-based defensive strip — Alec-authored content via beehiiv, not
// untrusted user input, but stripped anyway: whole script/style/iframe/
// object/embed tags (open+close and any stray opening tag), on*="..."
// inline handlers in any quote style, and javascript: hrefs.
export function sanitizeHtml(html) {
  if (typeof html !== "string") return "";
  return html
    .replace(/<(script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<\/?(script|style|iframe|object|embed)\b[^>]*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*"(?:[^"\\]|\\.)*"/gi, "")
    .replace(/\son[a-z]+\s*=\s*'(?:[^'\\]|\\.)*'/gi, "")
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/(\shref\s*=\s*)"\s*javascript:[^"]*"/gi, '$1"#"')
    .replace(/(\shref\s*=\s*)'\s*javascript:[^']*'/gi, "$1'#'");
}

// Same escaping as the SPA's own esc() (public/index.html ~line 810) —
// server-rendered HTML gets its own copy so blog.js has no runtime dependency
// on the client bundle.
function esc(s) {
  return s == null ? "" : String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// unix seconds -> "July 12, 2026". UTC so a Worker's server clock and a
// test's local clock always agree.
export function formatPostDate(unixSeconds) {
  if (typeof unixSeconds !== "number" || !Number.isFinite(unixSeconds)) return "";
  const d = new Date(unixSeconds * 1000);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

// JSON-LD is data, not markup, but it still sits inside a <script> tag — guard
// against a post title containing "</script>" breaking out of it.
function jsonLdScript(obj) {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

// ---- shared page shell ---------------------------------------------------------
// Lifted from public/index.html: DM Sans via the same Google Fonts link, the
// same design tokens (ink/paper/mist/line/orange), the same brand wordmark
// linking home, a simple footer. No client JS — this is server-rendered HTML.
const BLOG_CSS = `
:root{
  color-scheme: light;
  --ink:#1A1A1A; --ink2:#3A3A37;
  --paper:#FFFFFF; --mist:#F7F7F5; --sand:#F0EFEC;
  --line:#E7E6E2; --muted:#6E6D6A; --faint:#736F6A;
  --orange:#C5430C; --orange-ink:#A8370A; --orange-soft:#FBEBDC; --sand2:#E8E7E3;
  /* --faint darkened to meet WCAG AA (matches index.html) */
  /* Rhythm. Do not tighten these to "fix AI look"; Alec locked 24/32/40/48/64 on 2026-08-21. */
  --space-page: 24px;  /* gutter */
  --space-header: 64px;
  --tap: 44px;
  --space-title-gap: 8px;
  --space-after-photo: 32px;
  --space-section: 40px;
  --space-nearby: 48px;
  --space-row: 16px;
  --hdr: var(--space-header);
  --shadow-sm:0 1px 2px rgba(17,17,19,.04),0 1px 3px rgba(17,17,19,.06);
  --r:12px; --r-lg:16px; --r-full:999px; --max:920px; --gut: var(--space-page);
}
*{box-sizing:border-box;}
@media (prefers-reduced-motion: reduce){*{transition:none!important;animation:none!important;}}
html,body{margin:0;padding:0;background:var(--mist);color:var(--ink);}
/* Column layout so the footer sits at the bottom of a short page instead of
   leaving a band of body background under it. */
body{font-family:'DM Sans',system-ui,sans-serif;font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;min-height:100vh;display:flex;flex-direction:column;}
body>main{flex:1 0 auto;}
/* The app resets buttons; without it the hamburger renders with the browser's
   border and grey fill, which is why blog chrome read as a different site. */
button{font:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer;}
img{display:block;max-width:100%;}
a{color:inherit;text-decoration:none;}
.wrap{max-width:var(--max);margin:0 auto;padding:0 var(--space-page);}
/* Header and footer span the app's measure; only the article stays narrow. */
.hdr .wrap,.foot .wrap{max-width:1280px;}
.skip{position:absolute;left:-999px;top:8px;background:var(--ink);color:#fff;padding:10px 16px;border-radius:var(--r);}
.skip:focus{left:12px;}
/* App-matching header (☰ · brand · search pill · orange "+"). Rendered server-side
   for zero-flash + no-JS styling; site-nav.js mirrors this CSS and owns the drawer. */
.hdr{position:sticky;top:0;z-index:60;background:rgba(255,255,255,.92);backdrop-filter:saturate(150%) blur(10px);border-bottom:1px solid var(--line);}
.hdr.scrolled{box-shadow:var(--shadow-sm);}
.hdr-in{height:var(--space-header);display:flex;align-items:center;justify-content:space-between;gap:18px;}
.brand{flex:0 0 auto;transition:opacity .15s;}
.brand:hover{opacity:.7;}
.brand b{font-family:'DM Sans',sans-serif;font-weight:700;font-size:16px;letter-spacing:-.015em;color:var(--ink);white-space:nowrap;}
.menu-btn{flex:0 0 auto;width:40px;height:40px;display:grid;place-items:center;border-radius:var(--r-full);color:var(--ink);transition:background .15s;}
.menu-btn:hover{background:var(--mist);}
.menu-btn svg{width:22px;height:22px;}
.search{flex:0 1 520px;max-width:520px;height:54px;display:flex;align-items:center;background:var(--paper);border:1px solid var(--line);border-radius:var(--r-full);box-shadow:0 3px 12px rgba(17,17,19,.10),0 1px 2px rgba(17,17,19,.05);transition:box-shadow .2s,border-color .2s;}
.search:hover{box-shadow:0 6px 16px rgba(17,17,19,.13),0 1px 3px rgba(17,17,19,.06);}
.search:focus-within{box-shadow:0 8px 22px rgba(17,17,19,.15),0 1px 3px rgba(17,17,19,.06);border-color:var(--sand2);}
.search .loc{display:flex;align-items:center;gap:8px;padding:0 14px 0 20px;height:100%;border-radius:var(--r-full) 0 0 var(--r-full);white-space:nowrap;color:var(--ink);font-size:15px;font-weight:600;cursor:default;}
.search .loc:hover{background:transparent;}
.search .loc svg{width:16px;height:16px;color:var(--orange);}
.search .sep{width:1px;height:26px;background:var(--line);flex:0 0 auto;}
.search input{flex:1 1 auto;min-width:40px;height:100%;border:none;background:transparent;outline:none;padding:0 22px 0 16px;font-size:15px;font-weight:500;color:var(--ink);}
.search input::placeholder{color:var(--muted);font-weight:500;}
.hdr-actions{flex:0 0 auto;display:flex;align-items:center;gap:10px;}
.hdr-add{flex:0 0 auto;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;color:var(--orange-ink);border:1px solid var(--orange-soft);background:var(--orange-soft);transition:border-color .15s,background .15s,color .15s;}
.hdr-add:hover{background:var(--orange);color:#fff;border-color:var(--orange);}
.hdr-add svg{width:19px;height:19px;}
@media (max-width:720px){.hdr-add{width:36px;height:36px;}.hdr-add svg{width:17px;height:17px;}.hdr .brand{display:none;}.search{flex:1 1 100%;max-width:none;min-width:0;}.search .loc span{display:none;}.search input{min-width:0;}}
/* One reading column, left-aligned with the app. Body copy ran the full 872px
   measure, about 110 characters a line; 70ch is what the listing pages use. */
.blog-main{padding:var(--space-nearby) var(--space-page) var(--space-header);max-width:1280px;}
.blog-main>*{max-width:70ch;}
.blog-main>.blog-grid{max-width:none;}
.eyebrow{font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--faint);margin:0 0 var(--space-title-gap);}
.blog-h1{font-family:'DM Sans',sans-serif;font-size:34px;font-weight:700;letter-spacing:-.02em;line-height:1.15;margin:0 0 20px;}
.blog-empty{color:var(--muted);font-size:15px;}
.blog-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:28px;}
.blog-card{display:block;background:var(--paper);border:1px solid var(--line);border-radius:var(--r-lg);overflow:hidden;transition:box-shadow .15s,border-color .15s;}
.blog-card:hover{border-color:var(--ink);box-shadow:0 6px 20px rgba(17,17,19,.08);}
.blog-card-media{aspect-ratio:16/9;background:var(--sand);overflow:hidden;}
.blog-card-media img{width:100%;height:100%;object-fit:cover;}
.blog-card-body{padding:16px 18px 20px;}
.blog-card-date{font-size:12px;color:var(--faint);margin:0 0 6px;font-weight:600;}
.blog-card-title{font-family:'DM Sans',sans-serif;font-size:17px;font-weight:700;line-height:1.3;margin:0 0 6px;color:var(--ink);}
.blog-card-sub{font-size:14px;color:var(--muted);margin:0;line-height:1.45;}
.blog-back{display:inline-block;font-size:14px;font-weight:600;color:var(--muted);margin-bottom:var(--space-page);}
.blog-back:hover{color:var(--ink);}
.blog-sub{font-size:17px;color:var(--muted);margin:0 0 20px;line-height:1.5;}
.blog-hero{border-radius:var(--r-lg);overflow:hidden;margin:0 0 28px;background:var(--sand);}
.blog-hero img{width:100%;height:auto;}
.blog-body{font-size:16px;line-height:1.7;color:var(--ink2);}
.blog-body img{border-radius:var(--r);margin:16px 0;}
.blog-body a{color:var(--orange-ink);text-decoration:underline;}
.blog-body h2,.blog-body h3{font-family:'DM Sans',sans-serif;color:var(--ink);letter-spacing:-.01em;}
.foot{border-top:1px solid var(--line);margin-top:var(--space-page);padding:var(--space-nearby) var(--space-page) 56px;background:var(--paper);}
.foot-in{display:flex;justify-content:space-between;gap:36px 48px;flex-wrap:wrap;}
.foot .brand b{font-size:15px;}
.foot .tagline{font-size:14px;color:var(--muted);margin:10px 0 0;max-width:380px;line-height:1.5;}
.foot-cols{display:flex;gap:36px 48px;flex-wrap:wrap;}
.foot-col h2{font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);font-weight:400;margin:0 0 12px;}
.foot-col a{display:block;font-size:14px;color:var(--ink2);padding:6px 0;transition:color .15s;}
.foot-col a:hover{color:var(--orange);}
@media(max-width:720px){.blog-h1{font-size:26px;}.blog-grid{grid-template-columns:1fr;}}
`;

function pageShell({ title, description, canonical, ogImage, bodyHtml, jsonLd }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Adaptive Sports Near Me">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:url" content="${esc(canonical)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(ogImage)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/tokens.css">${
  jsonLd ? `\n<script type="application/ld+json">${jsonLdScript(jsonLd)}</script>` : ""
}
<style>${BLOG_CSS}</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="hdr">
  <div class="wrap hdr-in">
    <button class="menu-btn" id="menuBtn" aria-label="Menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
    <a class="brand" href="/" aria-label="Adaptive Sports Near Me home"><b>Adaptive Sports Near Me</b></a>
    <form class="search" role="search" action="/" method="get">
      <span class="loc" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg><span>United States</span></span>
      <span class="sep"></span>
      <input id="q" name="q" type="text" placeholder="Search a sport, zip, or program" aria-label="Search programs">
    </form>
    <div class="hdr-actions">
      <a class="hdr-add" href="/?add=program" aria-label="Submit a program" title="Submit a program"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></a>
    </div>
  </div>
</header>
<main id="main" class="wrap blog-main">
${bodyHtml}
</main>
<footer class="foot">
  <div class="wrap foot-in">
    <div class="foot-brand">
      <a class="brand" href="/"><b>Adaptive Sports Near Me</b></a>
      <p class="tagline">An open directory of adaptive sports programs across the country. No logins, no walls. Built for the community.</p>
    </div>
    <div class="foot-cols">
      <div class="foot-col"><h2>Explore</h2><a href="/">Discover</a><a href="/maps">Map view</a><a href="/events">Events</a><a href="/blog">All stories</a></div>
      <div class="foot-col"><h2>About</h2><a href="/">The project</a><a href="https://sign.adapttolife.org/waiver?source=asnm">Sign waiver</a></div>
    </div>
  </div>
</footer>
<!-- bump ?v= on any site-nav.js change so browsers fetch the new file (cache-bust) -->
<script src="/site-nav.js?v=20260821a" defer></script>
</body>
</html>
`;
}

function postCardHtml(p, site) {
  const date = formatPostDate(p.publishDate);
  return `<a class="blog-card" href="${esc(site)}/blog/${esc(p.slug)}">${
    p.thumbnailUrl ? `<div class="blog-card-media"><img src="${esc(p.thumbnailUrl)}" alt="" loading="lazy"></div>` : ""
  }<div class="blog-card-body">${
    date ? `<p class="blog-card-date">${esc(date)}</p>` : ""
  }<h2 class="blog-card-title">${esc(p.title)}</h2>${
    p.subtitle ? `<p class="blog-card-sub">${esc(p.subtitle)}</p>` : ""
  }</div></a>`;
}

export function blogIndexTemplate(posts, { site = SITE } = {}) {
  const body = `<p class="eyebrow">Stories</p>
<h1 class="blog-h1">From Adaptive Sports Near Me</h1>
${posts.length
    ? `<div class="blog-grid">${posts.map((p) => postCardHtml(p, site)).join("")}</div>`
    : `<p class="blog-empty">Stories are on the way. Check back soon.</p>`}`;
  return pageShell({
    title: "Blog · Adaptive Sports Near Me",
    description: "Stories, updates and guides from the adaptive sports community.",
    canonical: `${site}/blog`,
    ogImage: `${site}/og-image.jpg`,
    bodyHtml: body,
  });
}

export function blogPostTemplate(post, { site = SITE } = {}) {
  const date = formatPostDate(post.publishDate);
  const canonical = `${site}/blog/${post.slug}`;
  const ogImage = post.thumbnailUrl || `${site}/og-image.jpg`;
  const description = post.subtitle || "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: description || undefined,
    image: post.thumbnailUrl ? [post.thumbnailUrl] : undefined,
    datePublished: post.publishDate ? new Date(post.publishDate * 1000).toISOString() : undefined,
    url: canonical,
    author: { "@type": "Organization", name: "Adaptive Sports Near Me" },
  };
  const body = `<a class="blog-back" href="/blog">&larr; All stories</a>
<article>
  ${date ? `<p class="blog-card-date">${esc(date)}</p>` : ""}
  <h1 class="blog-h1">${esc(post.title)}</h1>
  ${post.subtitle ? `<p class="blog-sub">${esc(post.subtitle)}</p>` : ""}
  ${post.thumbnailUrl ? `<div class="blog-hero"><img src="${esc(post.thumbnailUrl)}" alt=""></div>` : ""}
  <div class="blog-body">${post.bodyHtml || ""}</div>
</article>`;
  return pageShell({
    title: `${post.title} · Adaptive Sports Near Me`,
    description,
    canonical,
    ogImage,
    bodyHtml: body,
    jsonLd,
  });
}

export function blogFallbackTemplate({ site = SITE } = {}) {
  const body = `<p class="eyebrow">Stories</p>
<h1 class="blog-h1">Stories are on the way</h1>
<p class="blog-empty">We're getting the blog set up. Check back soon, or head back to <a href="/">the directory</a>.</p>`;
  return pageShell({
    title: "Blog · Adaptive Sports Near Me",
    description: "Stories, updates and guides from the adaptive sports community.",
    canonical: `${site}/blog`,
    ogImage: `${site}/og-image.jpg`,
    bodyHtml: body,
  });
}

export function blogNotFoundTemplate({ site = SITE } = {}) {
  const body = `<p class="eyebrow">Stories</p>
<h1 class="blog-h1">Story not found</h1>
<p class="blog-empty">That story may have moved or been unpublished. <a href="/blog">See all stories</a>.</p>`;
  return pageShell({
    title: "Story not found · Adaptive Sports Near Me",
    description: "That story may have moved or been unpublished.",
    canonical: `${site}/blog`,
    ogImage: `${site}/og-image.jpg`,
    bodyHtml: body,
  });
}
