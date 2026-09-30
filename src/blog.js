// Blog lane — Beehiiv is the CMS. Alec writes posts in Beehiiv; this module
// fetches them via the v2 API, caches successful upstream responses in
// caches.default (300s hot / 86400s stale-on-failure), and server-renders SEO
// HTML. The network/cache orchestration lives in exported async functions
// (listPosts, getPostBySlug); everything below the "pure" line is pure and
// covered by test/blog.test.js without touching the Cache API.

import { headerHtml, footerHtml, navScriptHtml } from "./site-chrome.js";

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

// ---- page shell ---------------------------------------------------------------
// Page presentation is shared through public/styles.css.
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
<link rel="stylesheet" href="/styles.css">${
  jsonLd ? `\n<script type="application/ld+json">${jsonLdScript(jsonLd)}</script>` : ""
}
</head>
<body class="content-page">
<a class="skip" href="#main">Skip to content</a>
${headerHtml()}
<main id="main" class="wrap blog-main">
${bodyHtml}
</main>
${footerHtml()}
${navScriptHtml()}
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
