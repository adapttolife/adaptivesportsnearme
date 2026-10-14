import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { blogIndexTemplate, blogPostTemplate, blogFallbackTemplate, blogNotFoundTemplate } from "../src/blog.js";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

// The server-rendered pages that are still served (the blog and the admin
// review page) share public/styles.css. The site itself is the app shell
// (public/index.html + public/app/), which carries its own stylesheet.
test("static and nested server-rendered pages load the same public stylesheet", () => {
  const pages = [
    read("public/admin/index.html"),
    blogIndexTemplate([]), blogPostTemplate({ slug: "story", title: "Story" }),
    blogFallbackTemplate(), blogNotFoundTemplate(),
  ];
  for (const html of pages) {
    assert.equal((html.match(/href="\/styles\.css"/g) || []).length, 1);
    assert.ok(!html.includes("<style>"));
    assert.ok(!html.includes('/tokens.css'));
  }
  const config = JSON.parse(read("wrangler.json"));
  assert.equal(config.assets.directory, "./public");
  assert.equal(config.env.staging.assets.directory, "./public");
  const css = read("public/styles.css");
  assert.match(css, /--space-section:\s*15px;/);
  assert.equal((css.match(/--space-section:/g) || []).length, 1);
  assert.ok(!read("public/site-nav.js").includes('createElement("style")'));
});

test("the app shell loads its own stylesheet once and none of the old site's", () => {
  const shell = read("public/index.html");
  assert.equal((shell.match(/<link rel="stylesheet" href="\/app\/app\.css">/g) || []).length, 1);
  assert.ok(!shell.includes("/styles.css"), "the old shared stylesheet would restyle the app");
  assert.ok(!shell.includes("/tokens.css"));
  assert.ok(!shell.includes("<style"));
});
