import * as A from "../app.js";
import { site } from "../page-meta.js";

const esc = A.esc;
const date = (value) => value
  ? new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
  : "";

function inline(value) {
  return esc(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');
}

export function renderMarkdown(value) {
  const lines = String(value || "").replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let list = null;
  let quote = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p>${paragraph.map(inline).join("<br>")}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    blocks.push(`<${list.type}>${list.items.map((item) => `<li>${inline(item)}</li>`).join("")}</${list.type}>`);
    list = null;
  };
  const flushQuote = () => {
    if (!quote.length) return;
    blocks.push(`<blockquote><p>${quote.map(inline).join("<br>")}</p></blockquote>`);
    quote = [];
  };
  const flush = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const line of lines) {
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    const ordered = /^\d+[.)]\s+(.+)$/.exec(line);
    const unordered = /^[-*+]\s+(.+)$/.exec(line);
    const quoted = /^>\s?(.*)$/.exec(line);
    if (!line.trim()) {
      flush();
    } else if (heading) {
      flush();
      const level = Math.min(heading[1].length + 1, 4);
      blocks.push(`<h${level}>${inline(heading[2])}</h${level}>`);
    } else if (quoted) {
      flushParagraph();
      flushList();
      quote.push(quoted[1]);
    } else if (ordered || unordered) {
      flushParagraph();
      flushQuote();
      const type = ordered ? "ol" : "ul";
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push((ordered || unordered)[1]);
    } else {
      flushList();
      flushQuote();
      paragraph.push(line);
    }
  }
  flush();
  return blocks.join("");
}

function index(items) {
  const cards = items.map((post) => `<a class="blog-card plate" href="/blog/${esc(post.slug)}">${post.thumbnailDataUrl ? `<img src="${esc(post.thumbnailDataUrl)}" alt="" loading="lazy">` : ""}<div><p class="blog-date">${esc(date(post.publishAt))}</p><h2>${esc(post.title)}</h2><p>${esc(post.subtitle)}</p></div></a>`).join("");
  return {
    title: site("Blog"),
    railActive: "blog",
    html: `<section class="blog sec"><div class="blog-head"><p class="eyebrow">Stories</p><h1 tabindex="-1">From Adaptive Sports Near Me</h1><p>Stories, updates and guides from the adaptive sports community.</p></div><div class="blog-grid">${cards || "<p>No stories yet. Check back soon.</p>"}</div></section>`,
  };
}

function post(item, canEdit) {
  return {
    title: site(item.title),
    railActive: "blog",
    html: `<article class="blog-post sec"><a class="blog-back" href="/blog" data-back="/blog">${A.icon("arrow-left", 20)}<span>All stories</span></a><p class="blog-date">${esc(date(item.publishAt))}</p><h1 tabindex="-1">${esc(item.title)}</h1>${item.subtitle ? `<p class="blog-subtitle">${esc(item.subtitle)}</p>` : ""}${canEdit ? `<div class="blog-actions"><a class="btn btn--line" href="/admin/blog/${esc(item.id)}">Edit post</a></div>` : ""}${item.thumbnailDataUrl ? `<img class="blog-cover" src="${esc(item.thumbnailDataUrl)}" alt="">` : ""}<div class="blog-markdown">${renderMarkdown(item.contentMarkdown)}</div></article>`,
  };
}

async function canEditPosts() {
  try {
    const response = await fetch("/api/admin-auth/session", { cache: "no-store" });
    const body = await response.json().catch(() => ({}));
    return response.ok && body.ok === true;
  } catch {
    return false;
  }
}

export async function render() {
  const slug = location.pathname.match(/^\/blog\/([^/]+)$/)?.[1];
  const response = await fetch(slug ? `/api/blog/${encodeURIComponent(slug)}` : "/api/blog", { cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      title: site("Blog"),
      railActive: "blog",
      html: '<section class="blog sec"><h1>Story not found</h1><p>That story may have moved or is not published yet.</p></section>',
    };
  }
  return slug ? post(body.post, await canEditPosts()) : index(body.items || []);
}

export function mount() {
  return () => {};
}
