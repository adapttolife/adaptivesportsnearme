// blog lane tests (Lane C) — pure functions only, no caches.default/Request mocking.
import test from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeHtml, normalizePosts, normalizePostDetail, findPostBySlug, formatPostDate,
  blogIndexTemplate, blogPostTemplate, blogFallbackTemplate, blogNotFoundTemplate,
} from "../src/blog.js";

const SITE = "https://adaptivesportsnearme.com";

// ---- sanitizeHtml --------------------------------------------------------------

test("sanitizeHtml: strips <script>...</script> entirely", () => {
  const out = sanitizeHtml('<p>Hi</p><script>alert(1)</script><p>Bye</p>');
  assert.ok(!out.includes("<script"));
  assert.ok(!out.includes("alert(1)"));
  assert.equal(out, "<p>Hi</p><p>Bye</p>");
});

test("sanitizeHtml: strips <style>, <iframe>, <object>, <embed> (paired and self-closing)", () => {
  const out = sanitizeHtml(
    '<style>body{color:red}</style><iframe src="https://evil.example"></iframe>' +
    '<object data="evil.swf"></object><embed src="evil.swf">'
  );
  assert.ok(!out.includes("<style"));
  assert.ok(!out.includes("<iframe"));
  assert.ok(!out.includes("<object"));
  assert.ok(!out.includes("<embed"));
  assert.ok(!out.includes("color:red"));
});

test("sanitizeHtml: strips inline on*= handlers regardless of quote style", () => {
  const out = sanitizeHtml(
    `<div onclick="alert(1)">a</div><img src="x.png" onerror='alert(2)'><span onmouseover=alert(3)>b</span>`
  );
  assert.ok(!/on[a-z]+\s*=/i.test(out));
  assert.ok(out.includes('<div>a</div>'));
  assert.ok(out.includes('<img src="x.png">'));
});

test("sanitizeHtml: neutralizes javascript: hrefs but keeps normal links", () => {
  const out = sanitizeHtml('<a href="javascript:alert(1)">bad</a><a href="/safe">good</a>');
  assert.ok(!out.includes("javascript:"));
  assert.ok(out.includes('href="/safe"'));
});

test("sanitizeHtml: keeps benign markup untouched", () => {
  const html = '<p>Some <b>bold</b> text with a <a href="https://example.org">link</a> and an <img src="/pic.jpg" alt="a photo"></p>';
  assert.equal(sanitizeHtml(html), html);
});

test("sanitizeHtml: non-string input returns empty string", () => {
  assert.equal(sanitizeHtml(null), "");
  assert.equal(sanitizeHtml(undefined), "");
  assert.equal(sanitizeHtml(42), "");
});

// ---- normalizePosts / normalizePostDetail (shape-drift defense) ----------------

const NOW = Date.parse("2026-07-12T00:00:00Z");

test("normalizePosts: keeps well-formed posts, newest-first order preserved", () => {
  const data = { data: [
    { id: 1, slug: "one", title: "One", subtitle: "s1", publish_date: 1700000000, thumbnail_url: "t1.jpg", web_url: "w1" },
    { id: "2", slug: "two", title: "Two", publish_date: 1690000000 },
  ] };
  const posts = normalizePosts(data, NOW);
  assert.equal(posts.length, 2);
  assert.equal(posts[0].slug, "one");
  assert.equal(posts[0].id, "1");
  assert.equal(posts[1].id, "2");
  assert.equal(posts[1].subtitle, ""); // missing field defaults to ""
});

test("normalizePosts: drops posts with no slug", () => {
  const data = { data: [{ id: 1, slug: "", title: "No slug" }, { id: 2, title: "Also no slug" }] };
  assert.deepEqual(normalizePosts(data, NOW), []);
});

test("normalizePosts: drops posts with no id (can't fetch their content)", () => {
  const data = { data: [{ slug: "no-id", title: "No id" }] };
  assert.deepEqual(normalizePosts(data, NOW), []);
});

test("normalizePosts: hides posts whose publish_date is in the future", () => {
  const futureSecs = NOW / 1000 + 3600;
  const pastSecs = NOW / 1000 - 3600;
  const data = { data: [
    { id: 1, slug: "future", publish_date: futureSecs },
    { id: 2, slug: "past", publish_date: pastSecs },
  ] };
  const posts = normalizePosts(data, NOW);
  assert.equal(posts.length, 1);
  assert.equal(posts[0].slug, "past");
});

test("normalizePosts: defends against non-array/missing data", () => {
  assert.deepEqual(normalizePosts({}, NOW), []);
  assert.deepEqual(normalizePosts({ data: "not-an-array" }, NOW), []);
  assert.deepEqual(normalizePosts(null, NOW), []);
});

test("normalizePostDetail: merges detail response over the list fallback and sanitizes body", () => {
  const fallback = { id: "1", slug: "one", title: "Fallback Title", subtitle: "fb sub", publishDate: 1000, thumbnailUrl: "fb.jpg", webUrl: "fb-url" };
  const data = { data: { title: "Real Title", content: { free: { web: '<p>Body</p><script>alert(1)</script>' } } } };
  const post = normalizePostDetail(data, fallback);
  assert.equal(post.title, "Real Title");
  assert.equal(post.subtitle, "fb sub"); // missing in detail response -> falls back
  assert.equal(post.bodyHtml, "<p>Body</p>");
  assert.equal(post.id, "1");
  assert.equal(post.slug, "one");
});

test("normalizePostDetail: defends against a missing/malformed content shape", () => {
  const fallback = { id: "1", slug: "one", title: "T", subtitle: "s", publishDate: 1000, thumbnailUrl: "", webUrl: "" };
  assert.equal(normalizePostDetail({}, fallback).bodyHtml, "");
  assert.equal(normalizePostDetail({ data: { content: "not-an-object" } }, fallback).bodyHtml, "");
  assert.equal(normalizePostDetail(null, fallback).bodyHtml, "");
});

// ---- findPostBySlug --------------------------------------------------------------

test("findPostBySlug: finds an exact slug match", () => {
  const posts = [{ slug: "a" }, { slug: "b" }];
  assert.equal(findPostBySlug(posts, "b"), posts[1]);
});

test("findPostBySlug: returns null when no post matches", () => {
  assert.equal(findPostBySlug([{ slug: "a" }], "missing"), null);
});

// ---- formatPostDate --------------------------------------------------------------

test("formatPostDate: formats unix seconds as a long UTC date", () => {
  assert.equal(formatPostDate(Date.parse("2026-07-12T00:00:00Z") / 1000), "July 12, 2026");
});

test("formatPostDate: non-numeric or NaN input returns empty string", () => {
  assert.equal(formatPostDate(null), "");
  assert.equal(formatPostDate("not a number"), "");
  assert.equal(formatPostDate(NaN), "");
});

// ---- templates: escaping of hostile metadata ------------------------------------

const HOSTILE_POST = {
  id: "1",
  slug: "hostile",
  title: `<script>alert('t')</script> & "quoted"`,
  subtitle: `</title><b>injected</b>`,
  publishDate: Date.parse("2026-07-12T00:00:00Z") / 1000,
  thumbnailUrl: "",
  webUrl: "",
  bodyHtml: "<p>safe body</p>",
};

test("blogIndexTemplate: escapes hostile post title/subtitle in cards", () => {
  const html = blogIndexTemplate([HOSTILE_POST], { site: SITE });
  assert.ok(!html.includes("<script>alert('t')</script>"));
  assert.ok(html.includes("&lt;script&gt;alert(&#39;t&#39;)&lt;/script&gt; &amp; &quot;quoted&quot;"));
  assert.ok(html.includes(`/blog/hostile`));
});

test("blogPostTemplate: escapes hostile title/subtitle in head, body and OG tags", () => {
  const html = blogPostTemplate(HOSTILE_POST, { site: SITE });
  assert.ok(!html.includes("<script>alert('t')</script>"));
  assert.ok(!html.includes("</title><b>injected</b>"));
  assert.ok(html.includes("&lt;script&gt;alert(&#39;t&#39;)&lt;/script&gt;"));
  assert.ok(html.includes(`<link rel="canonical" href="${SITE}/blog/hostile">`));
  assert.ok(html.includes('og:title'));
});

test("blogPostTemplate: JSON-LD is safely encoded, a title containing </script> cannot break out", () => {
  const post = { ...HOSTILE_POST, title: `Evil</script><script>alert(1)</script>` };
  const html = blogPostTemplate(post, { site: SITE });
  assert.ok(!html.includes("</script><script>alert(1)</script>"));
  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(ld, "expected a JSON-LD script tag");
  const parsed = JSON.parse(ld[1]);
  assert.equal(parsed.headline, `Evil</script><script>alert(1)</script>`);
});

test("blogPostTemplate: post body HTML passes through as-is (already sanitized upstream)", () => {
  const html = blogPostTemplate(HOSTILE_POST, { site: SITE });
  assert.ok(html.includes("<p>safe body</p>"));
});

// ---- index/fallback/not-found page shape -----------------------------------------

test("blogIndexTemplate: empty post list renders a friendly empty state, not a broken grid", () => {
  const html = blogIndexTemplate([], { site: SITE });
  assert.ok(html.includes("Stories are on the way"));
  assert.ok(!html.includes('class="blog-grid"'));
});

test("blogFallbackTemplate: 200-shaped friendly page, links back to the directory", () => {
  const html = blogFallbackTemplate({ site: SITE });
  assert.ok(html.includes("Stories are on the way"));
  assert.ok(html.includes('href="/"'));
});

test("blogNotFoundTemplate: friendly 404 copy, links back to /blog", () => {
  const html = blogNotFoundTemplate({ site: SITE });
  assert.ok(html.includes("Story not found"));
  assert.ok(html.includes('href="/blog"'));
});
