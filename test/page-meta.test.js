// One title and one description per page (Alec, 2026-10-18: "be intentional about
// every bit of content"). public/app/page-meta.js holds the words; the Worker
// (src/pages.js) and the page (public/app/views/*.js) both read them, so a crawler,
// a link preview and the open tab say the same thing.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import {
  HOME,
  PAGES,
  PRODUCT_LINE,
  site,
  nearMeta,
  sportMeta,
  stateMeta,
  organizationMeta,
  grantMeta,
} from "../public/app/page-meta.js";
import { servePage } from "../src/pages.js";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");

test("no page writes its own title or description", () => {
  for (const f of readdirSync(
    new URL("../public/app/views/", import.meta.url),
  ).filter((f) => f.endsWith(".js"))) {
    const src = read("public/app/views/" + f);
    assert.doesNotMatch(
      src,
      /· Adaptive Sports Near Me[`"]/,
      `${f} spells out the site suffix instead of site()`,
    );
    assert.doesNotMatch(
      src,
      /^\s*description: [`"]/m,
      `${f} writes its own description`,
    );
  }
  const routes = read("src/pages.js");
  assert.doesNotMatch(
    routes,
    /description: "/,
    "src/pages.js writes its own description",
  );
});

test("the home page, the shell and the install text say the product line", () => {
  assert.equal(HOME.description, PRODUCT_LINE);
  const shell = read("public/index.html");
  assert.ok(
    shell.includes(`<meta name="description" content="${PRODUCT_LINE}">`),
  );
  assert.ok(shell.includes(`<title>${HOME.title}</title>`));
  assert.equal(
    JSON.parse(read("public/manifest.json")).description,
    PRODUCT_LINE,
  );
});

test("the Worker serves the same title and description the page sets", async () => {
  const shell = read("public/index.html");
  const env = {
    ENV_NAME: "preview",
    ASSETS: {
      fetch: async () =>
        new Response(shell, { headers: { "content-type": "text/html" } }),
    },
  };
  const cases = [
    ["/sports", PAGES.sports],
    ["/grants", PAGES.grants],
    ["/about", PAGES.about],
    ["/add/program", PAGES.addProgram],
    ["/states/FL", stateMeta("Florida")],
    [
      "/sports/tennis",
      sportMeta({ key: "tennis", name: "Tennis", low: "tennis" }),
    ],
  ];
  for (const [path, meta] of cases) {
    const url = new URL("https://example.com" + path);
    const res = await servePage(new Request(url), env, url);
    const html = await res.text();
    const title = html
      .match(/<title>([^<]*)<\/title>/)[1]
      .replace(/&#39;/g, "'");
    assert.equal(title, site(meta.title), path);
    assert.ok(
      html.includes(`content="${meta.description.replace(/'/g, "&#39;")}"`),
      `${path} description`,
    );
  }
});

test("dynamic pages read as one sentence each, with no dashes", () => {
  const all = [
    nearMeta("Tampa, FL", null),
    nearMeta("Tampa, FL", { name: "Tennis", low: "tennis" }),
    sportMeta({ key: "tennis", name: "Tennis", low: "tennis", state: "Ohio" }),
    stateMeta("Ohio", "tennis"),
    organizationMeta({ name: "BORP", sport: "Cycling", place: "Berkeley, CA" }),
    grantMeta({
      name: "Access Grant",
      source: "Challenged Athletes Foundation",
    }),
    ...Object.values(PAGES),
    HOME,
  ];
  for (const m of all)
    for (const s of [m.title, m.description])
      assert.doesNotMatch(s, /[–—]|  |\.\./, s);
});
