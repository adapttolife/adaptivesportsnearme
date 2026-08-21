import test from "node:test";
import assert from "node:assert/strict";
import { programPageTemplate, programNotFoundTemplate, PROGRAM_ID_RE } from "../src/program-page.js";

const ORG = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  name: "Denver Rolling Nuggets",
  sportLabel: "Wheelchair Basketball",
  city: "Denver",
  state: "CO",
  website: "https://www.example.org/nuggets",
  primarySource: "US Paralympics Club Finder",
  sources: [{ name: "US Paralympics Club Finder", organization: "U.S. Olympic & Paralympic Committee", url: "https://www.teamusa.org" }],
};

test("PROGRAM_ID_RE matches a UUID program path", () => {
  const m = "/programs/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa".match(PROGRAM_ID_RE);
  assert.ok(m);
  assert.equal(m[1], "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
  assert.equal("/programs/not-a-uuid".match(PROGRAM_ID_RE), null);
  assert.equal("/maps".match(PROGRAM_ID_RE), null);
});

test("programPageTemplate: name, sport, city/state, website, source are in the HTML", () => {
  const html = programPageTemplate(ORG, { site: "https://asnm-staging.alec-af3.workers.dev" });
  assert.ok(html.includes("Denver Rolling Nuggets"));
  assert.ok(html.includes("Wheelchair Basketball"));
  assert.ok(html.includes("Denver, CO"));
  assert.ok(html.includes("https://www.example.org/nuggets"));
  assert.ok(html.includes("US Paralympics Club Finder"));
  assert.ok(html.includes("<h1>Denver Rolling Nuggets</h1>"));
  assert.ok(!html.includes("We are not live yet"));
});

test("programPageTemplate: escapes untrusted name/sport", () => {
  const html = programPageTemplate({
    ...ORG,
    name: '<script>alert(1)</script>',
    sportLabel: 'Basketball & "Rugby"',
  });
  assert.ok(!html.includes("<script>alert(1)</script>"));
  assert.ok(html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
  assert.ok(html.includes("Basketball &amp; &quot;Rugby&quot;"));
});

test("programNotFoundTemplate: no launch modal, says not found", () => {
  const html = programNotFoundTemplate({ site: "https://example.test" });
  assert.ok(html.includes("Program not found"));
  assert.ok(!html.includes("We are not live yet"));
});
