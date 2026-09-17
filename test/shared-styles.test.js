import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { blogIndexTemplate, blogPostTemplate, blogFallbackTemplate, blogNotFoundTemplate } from "../src/blog.js";
import { programNotFoundTemplate } from "../src/program-page.js";
import { grantNotFoundTemplate } from "../src/grant-page.js";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("static and nested server-rendered pages load the same public stylesheet", () => {
  const pages = [
    read("public/index.html"), read("public/admin/index.html"),
    blogIndexTemplate([]), blogPostTemplate({ slug: "story", title: "Story" }),
    blogFallbackTemplate(), blogNotFoundTemplate(),
    programNotFoundTemplate(), grantNotFoundTemplate(),
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
