// Page routes (src/pages.js). Every page is the one app shell (public/index.html);
// the Worker gives each page its own title, description, canonical and Open
// Graph tags, a 404 status for a listing or sport that does not exist, 301s for
// old URLs, noindex outside production, and /robots.txt and /sitemap.xml.
import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import worker from "../src/index.js";
import { injectMeta, servePage, robotsTxt, sitemapXml, SITE_NAME, STATE_NAMES } from "../src/pages.js";
import { SPORT_NAMES } from "../src/sport-names.js";
import "../public/listing-art.js";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const SHELL = read("public/index.html");
const ORIGIN = "https://adaptivesportsnearme.com";
const PROGRAM = "11111111-2222-4333-8444-555555555555";
const HIDDEN = "22222222-3333-4444-8555-666666666666";
const MENU_ROW = "33333333-4444-4555-8666-777777777777";
const MISSING = "99999999-8888-4777-8666-555555555555";
const GRANT = "b0298125-6d6a-4114-b0a2-5275750c09ae";
const DRAFT_GRANT = "c7168314-73f4-5559-8387-d04651e400a9";

const count = (text, needle) => text.split(needle).length - 1;
const titleOf = (html) => (html.match(/<title>([^<]*)<\/title>/) || [])[1];
const jsonLd = (html) => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);

// env.ASSETS: "/" is the shell, anything else is a missing file.
function assets() {
  const requested = [];
  return {
    requested,
    async fetch(input) {
      const path = new URL(typeof input === "string" ? input : input.url).pathname;
      requested.push(path);
      return path === "/" ? new Response(SHELL, { headers: { "content-type": "text/html" } }) : new Response("missing", { status: 404 });
    },
  };
}

// env.DB: an in-memory D1 with the real schema.
function database() {
  const sql = new DatabaseSync(":memory:");
  sql.exec(read("db/schema.sql"));
  sql.exec(read("db/migrations/0004_grants.sql"));
  const org = sql.prepare(`INSERT INTO organizations
    (id,name,sport,sport_key,website_url,city,state,description,is_public,status,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,'active','2026','2026')`);
  org.run(PROGRAM, "Atlanta Wolfpack", "Wheelchair Basketball", "basketball", "https://adaptedsports.org/", "Atlanta", "GA", "Junior wheelchair basketball.", 1);
  org.run(HIDDEN, "Hidden Program", "Tennis", "tennis", "https://hidden.example/", "Boise", "ID", null, 0);
  // A grant maker's site menu scraped as a listing (public/app/listable.js):
  // public and actionable in the table, but not a program, so never a page.
  org.run(MENU_ROW, "Our Board", null, null, "https://www.challengedathletes.org/our-board/", null, null, null, 1);
  sql.prepare(`INSERT INTO grants (id,name,source,audience,is_public,created_at,updated_at) VALUES (?,?,?,?,1,'2026','2026')`)
    .run(GRANT, "Hustle & Heart Fund", "Adapt To Life", "athlete");
  const DB = { prepare(query) {
    const statement = sql.prepare(query); let args = [];
    return {
      bind(...values) { args = values; return this; },
      async first() { return statement.get(...args) ?? null; },
      async all() { return { results: statement.all(...args) }; },
    };
  } };
  return { sql, DB };
}

const serve = (path, env) => { const url = new URL(ORIGIN + path); return servePage(new Request(url), env, url); };
const viaWorker = (path, env) => worker.fetch(new Request(ORIGIN + path), env, {});

test("injectMeta replaces the whole meta block: one canonical, one og:title, the page's own title and description", () => {
  const url = new URL(ORIGIN + "/sports/tennis/");
  const html = injectMeta(SHELL, { title: "Tennis: adaptive tennis programs near you", description: "Find adaptive tennis programs." }, { url, production: true });
  for (const tag of ['<link rel="canonical"', 'property="og:title"', 'property="og:description"', 'property="og:url"', 'name="twitter:card"']) {
    assert.equal(count(html, tag), 1, tag);
  }
  assert.ok(!html.includes("<!--asnm:meta-->") && !html.includes("<!--/asnm:meta-->"), "the markers go with the block");
  assert.ok(html.includes(`<link rel="canonical" href="${ORIGIN}/sports/tennis">`), "canonical, without the trailing slash");
  assert.ok(html.includes(`<meta property="og:url" content="${ORIGIN}/sports/tennis">`));
  assert.ok(!html.includes(`href="${ORIGIN}/"`), "the shell's home canonical is gone");
  assert.ok(html.includes('<meta property="og:title" content="Tennis: adaptive tennis programs near you">'));
  assert.equal(count(html, "<title>"), 1);
  assert.equal(titleOf(html), `Tennis: adaptive tennis programs near you · ${SITE_NAME}`);
  assert.equal(count(html, '<meta name="description"'), 1);
  assert.ok(html.includes('<meta name="description" content="Find adaptive tennis programs.">'));
  // Everything after the block is the shell as shipped, so the app still boots.
  const tail = SHELL.slice(SHELL.indexOf("<!--/asnm:meta-->") + "<!--/asnm:meta-->".length);
  assert.ok(html.endsWith(tail));
});

test("injectMeta escapes page text and keeps structured data inside its script", () => {
  const html = injectMeta(SHELL, {
    title: `Tom & Jerry's "Club" <b>`,
    description: `Fees < 5 dollars & "free" gear`,
    jsonld: { "@type": "SportsOrganization", name: "</script><script>alert(1)</script>" },
  }, { url: new URL(ORIGIN + "/programs/x"), production: true });
  assert.equal(titleOf(html), `Tom &amp; Jerry&#39;s &quot;Club&quot; &lt;b&gt; · ${SITE_NAME}`);
  assert.ok(html.includes('<meta name="description" content="Fees &lt; 5 dollars &amp; &quot;free&quot; gear">'));
  assert.ok(!html.includes("<script>alert(1)"));
  assert.equal(jsonLd(html).name, "</script><script>alert(1)</script>");
});

// String.replace treats $& $` $' in a replacement string as patterns. /near/<place>
// takes its title from the URL, so /near/a%24%26b drew a second <title> and
// three canonicals before this was pinned.
test("injectMeta inserts page text literally, even text with $ in it", async () => {
  const html = injectMeta(SHELL, { title: "Cash $& Carry $` $'", description: "Fees $' $&" }, { url: new URL(ORIGIN + "/near/x"), production: true });
  assert.equal(count(html, "<title>"), 1);
  assert.equal(count(html, '<link rel="canonical"'), 1);
  assert.equal(titleOf(html), `Cash $&amp; Carry $\` $&#39; · ${SITE_NAME}`);
  const crafted = await (await serve("/near/a%24%26b", { ENV_NAME: "production", ASSETS: assets() })).text();
  assert.equal(count(crafted, "<title>"), 1);
  assert.equal(count(crafted, '<link rel="canonical"'), 1);
});

test("only production asks to be indexed: staging, previews and noindex pages say noindex in the page and the header", async () => {
  const url = new URL(ORIGIN + "/sports");
  assert.ok(!injectMeta(SHELL, { title: "X" }, { url, production: true }).includes('name="robots"'));
  assert.equal(count(injectMeta(SHELL, { title: "X" }, { url, production: false }), '<meta name="robots" content="noindex">'), 1);
  assert.equal(count(injectMeta(SHELL, { title: "X", noindex: true }, { url, production: true }), '<meta name="robots" content="noindex">'), 1);
  for (const [ENV_NAME, path, noindex] of [
    ["production", "/sports", false], ["production", "/states/FL", false], ["production", "/grants", false],
    ["staging", "/sports", true], ["preview", "/states/FL", true], [undefined, "/sports", true],
    ["production", "/near/Tampa%2C%20FL", true], ["production", "/add/program", true], ["production", `/update/${PROGRAM}`, true],
  ]) {
    const response = await serve(path, { ENV_NAME, ASSETS: assets() });
    assert.equal(response.status, 200, `${ENV_NAME} ${path}`);
    assert.equal(response.headers.get("x-robots-tag"), noindex ? "noindex" : null, `${ENV_NAME} ${path}`);
    assert.equal((await response.text()).includes('<meta name="robots" content="noindex">'), noindex, `${ENV_NAME} ${path}`);
  }
});

test("servePage: a program or grant id with no listing is a 404; a listed one is a 200 titled with its name", async () => {
  const { sql, DB } = database();
  try {
    const env = { ENV_NAME: "production", DB, ASSETS: assets() };
    const missing = await serve(`/programs/${MISSING}`, env);
    assert.equal(missing.status, 404);
    assert.equal(missing.headers.get("x-robots-tag"), "noindex");
    const missingHtml = await missing.text();
    assert.ok(missingHtml.includes('<meta name="robots" content="noindex">'));
    assert.ok(missingHtml.includes('<script type="module" src="/app/app.js"></script>'), "the app still draws its own not-found page");
    assert.equal((await serve(`/programs/${HIDDEN}`, env)).status, 404, "not public");
    assert.equal((await serve(`/programs/${MENU_ROW}`, env)).status, 404, "not a program");

    const found = await serve(`/programs/${PROGRAM}`, env);
    assert.equal(found.status, 200);
    assert.equal(found.headers.get("x-robots-tag"), null);
    assert.match(found.headers.get("content-type"), /text\/html/);
    const html = await found.text();
    assert.match(titleOf(html), /^Atlanta Wolfpack\b/);
    assert.ok(html.includes(`<link rel="canonical" href="${ORIGIN}/programs/${PROGRAM}">`));
    const ld = jsonLd(html);
    assert.equal(ld["@type"], "SportsOrganization");
    assert.equal(ld.name, "Atlanta Wolfpack");
    assert.equal(ld.url, "https://adaptedsports.org/");
    assert.equal(ld.address.addressRegion, "GA");
    assert.equal((await serve(`/programs/${PROGRAM.toUpperCase()}`, env)).status, 200, "ids match in any case");

    assert.equal((await serve(`/grants/${MISSING}`, env)).status, 404);
    const grant = await serve(`/grants/${GRANT}`, env);
    assert.equal(grant.status, 200);
    assert.match(titleOf(await grant.text()), /^Hustle &amp; Heart Fund/);
  } finally { sql.close(); }
});

test("servePage: sport keys and state codes the site does not have are 404s", async () => {
  const env = { ENV_NAME: "production", ASSETS: assets() };
  for (const path of ["/sports/not-a-sport", "/sports/Tennis", "/states/ZZ", "/states/USA"]) {
    const response = await serve(path, env);
    assert.equal(response.status, 404, path);
    assert.equal(response.headers.get("x-robots-tag"), "noindex", path);
  }
  const tennis = await serve("/sports/tennis", env);
  assert.equal(tennis.status, 200);
  assert.match(titleOf(await tennis.text()), /^Tennis: adaptive tennis programs/);
  assert.match(titleOf(await (await serve("/sports/multi", env)).text()), /multi-sport/);
  assert.equal((await serve("/sports/veteran-meetup", env)).status, 200);
  const lower = await serve("/states/fl", env);
  assert.equal(lower.status, 301, "one spelling per state");
  assert.equal(lower.headers.get("location"), `${ORIGIN}/states/FL`);
  const florida = await (await serve("/states/FL", env)).text();
  assert.match(titleOf(florida), /Florida/);
  assert.ok(florida.includes(`<link rel="canonical" href="${ORIGIN}/states/FL">`));
});

test("old URLs redirect permanently to the page that replaced them", async () => {
  const id = "AAAAAAAA-BBBB-4CCC-8DDD-EEEEEEEEEEEE";
  for (const [path, to] of [["/maps", "/"], ["/maps/", "/"], ["/profile", "/"], ["/profile/", "/"], ["/directory", "/sports"], ["/directory/programs", "/sports"],
    ["/directory/grants/", "/grants"], ["/directory/events", "/events"], ["/directory/resources", "/resources"],
    [`/programs/${id}`, `/programs/${id.toLowerCase()}`], [`/update/${id}`, `/update/${id.toLowerCase()}`], ["/states/wi", "/states/WI"]]) {
    for (const response of [await serve(path, { ASSETS: assets() }), await viaWorker(path, { ASSETS: assets() })]) {
      assert.equal(response.status, 301, path);
      assert.equal(response.headers.get("location"), ORIGIN + to, path);
    }
  }
});

// The blog header's search is a plain GET form to /near (it works without script).
test("a search sent as /near?q= lands on that place's results page", async () => {
  for (const [path, to] of [["/near?q=Tampa%2C+FL", "/near/Tampa%2C%20FL"], ["/near/?q=60614", "/near/60614"], ["/near?q=", "/"], ["/near", "/"]]) {
    const response = await serve(path, { ASSETS: assets() });
    assert.equal(response.status, 302, path);
    assert.equal(response.headers.get("location"), ORIGIN + to, path);
  }
});

// Moved from directory-routes.test.js, which otherwise tested the old app's
// client router (public/directory-routes.js) and its sample listings.
test("the Worker answers page paths with the shell, old paths with a redirect, and leaves files and APIs alone", async () => {
  const env = { ASSETS: assets() }; // no database: a page never needs one to answer
  for (const path of [
    "/sports", "/sports/cycling", "/sports/tennis/", "/states", "/states/FL", "/grants", "/events", "/help", "/about",
    "/resources", "/resources/veteran-owned-businesses", "/letter", "/add/program", "/add/event", `/update/${PROGRAM}`,
    "/near/Tampa%2C%20FL", `/programs/${PROGRAM}`, `/grants/${GRANT}`,
  ]) {
    const response = await viaWorker(path, env);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("content-type"), /text\/html/, path);
    assert.ok((await response.text()).includes('<script type="module" src="/app/app.js"></script>'), path);
  }
  // Not a page: the app's own not-found page, with a real 404 (never a soft 200).
  for (const path of ["/sports/made-up", "/no-such-page", "/programs/nuggets-youth"]) {
    const response = await viaWorker(path, env);
    assert.equal(response.status, 404, path);
    assert.ok((await response.text()).includes("/app/app.js"), path);
  }
  // A path that is not a listing id never reaches the database.
  const guarded = { ASSETS: assets(), DB: { prepare() { throw new Error("a slug must not query D1"); } } };
  assert.equal((await viaWorker("/programs/nuggets-youth", guarded)).status, 404);
  // Files and API paths are never pages: they go to the static assets as asked.
  env.ASSETS.requested.length = 0;
  for (const path of ["/missing.png", "/app/missing.js", "/api/nope"]) {
    const response = await viaWorker(path, env);
    assert.equal(response.status, 404, path);
    assert.equal(await response.text(), "missing", path);
  }
  assert.deepEqual(env.ASSETS.requested, ["/missing.png", "/app/missing.js", "/api/nope"]);
});

// In production the asset layer answers "/" with index.html before the Worker
// runs (wrangler.json has no run_worker_first), so visitors do not see this today.
test("the home page is a page: the Worker answers / with the shell, not a 404", async () => {
  const response = await viaWorker("/", { ENV_NAME: "production", ASSETS: assets() });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-robots-tag"), null);
  assert.doesNotMatch(titleOf(await response.text()), /not found/i);
});

test("every sport and state the app draws has a server page under the same name", () => {
  // The app's sports are ListingArt.SPORTS, named by public/data/sports.json.
  assert.deepEqual(Object.keys(SPORT_NAMES).sort(), [...globalThis.ListingArt.SPORTS].sort());
  for (const s of JSON.parse(read("public/data/sports.json")).sports) assert.equal(SPORT_NAMES[s.key], s.name, s.key);
  // The app's states are window.Proto.STATE_NAMES (public/app/core.js).
  const context = vm.createContext({ window: {} });
  vm.runInContext(read("public/app/core.js"), context);
  assert.deepEqual({ ...context.window.Proto.STATE_NAMES }, STATE_NAMES);
});

test("robots.txt: production allows crawling and names the sitemap; anything else disallows everything", async () => {
  const production = robotsTxt({ ENV_NAME: "production" });
  assert.match(production, /^User-agent: \*$/m);
  assert.match(production, /^Allow: \/$/m);
  assert.doesNotMatch(production, /^Disallow: \/$/m);
  assert.match(production, /^Disallow: \/api\/$/m);
  assert.match(production, /^Sitemap: https:\/\/adaptivesportsnearme\.com\/sitemap\.xml$/m);
  for (const ENV_NAME of ["staging", "preview", undefined]) {
    const text = robotsTxt({ ENV_NAME });
    assert.match(text, /^User-agent: \*$/m, String(ENV_NAME));
    assert.match(text, /^Disallow: \/$/m, String(ENV_NAME));
    assert.doesNotMatch(text, /^Allow:|^Sitemap:/m, String(ENV_NAME));
  }
  const response = await viaWorker("/robots.txt", { ENV_NAME: "production" });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/plain/);
  assert.equal(await response.text(), production);
});

test("sitemap.xml lists every sport, every state, each listed program and each grant", async () => {
  const { sql, DB } = database();
  try {
    const xml = await sitemapXml({ DB });
    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
    const locs = [...xml.matchAll(/<url><loc>([^<]+)<\/loc><\/url>/g)].map((m) => m[1]);
    assert.equal(new Set(locs).size, locs.length, "no URL twice");
    for (const path of ["/", "/sports", "/states", "/grants", "/events", "/help", "/about", "/resources", "/resources/veteran-owned-businesses", "/letter"]) {
      assert.ok(locs.includes(ORIGIN + path), path);
    }
    for (const key of Object.keys(SPORT_NAMES)) assert.ok(locs.includes(`${ORIGIN}/sports/${key}`), key);
    for (const st of Object.keys(STATE_NAMES)) assert.ok(locs.includes(`${ORIGIN}/states/${st}`), st);
    assert.ok(locs.includes(`${ORIGIN}/programs/${PROGRAM}`));
    assert.ok(locs.includes(`${ORIGIN}/grants/${GRANT}`));
    assert.ok(!xml.includes(HIDDEN) && !xml.includes(MENU_ROW), "never a hidden listing or a row that is not a program");
    assert.ok(!locs.some((u) => /\/(near|add|update)\//.test(u)), "never a page that asks not to be indexed");
  } finally { sql.close(); }
  const bare = await sitemapXml({});
  assert.ok(bare.includes(`${ORIGIN}/sports/tennis`));
  assert.doesNotMatch(bare, /\/programs\/|\/grants\/[0-9a-f]/, "no database, no listings");
});

test("sitemap.xml leaves out grants that are not public (their pages are 404s)", async () => {
  const { sql, DB } = database();
  try {
    sql.prepare(`INSERT INTO grants (id,name,audience,is_public,created_at,updated_at) VALUES (?,?,'athlete',0,'2026','2026')`).run(DRAFT_GRANT, "Draft Grant");
    assert.equal((await serve(`/grants/${DRAFT_GRANT}`, { ENV_NAME: "production", DB, ASSETS: assets() })).status, 404);
    assert.ok(!(await sitemapXml({ DB })).includes(DRAFT_GRANT));
  } finally { sql.close(); }
});

test("the Worker serves the sitemap as XML, and a failing database is a 503, not a partial map", async () => {
  const { sql, DB } = database();
  try {
    const response = await viaWorker("/sitemap.xml", { ENV_NAME: "production", DB });
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /application\/xml/);
    assert.ok((await response.text()).includes(`${ORIGIN}/programs/${PROGRAM}`));
  } finally { sql.close(); }
  const errors = [], log = console.error;
  console.error = (...args) => errors.push(args);
  try {
    const broken = await viaWorker("/sitemap.xml", { ENV_NAME: "production", DB: { prepare() { throw new Error("D1 unavailable"); } } });
    assert.equal(broken.status, 503);
    assert.equal(await broken.text(), "");
  } finally { console.error = log; }
  assert.ok(errors.length, "the failure is logged");
});

// Every page starts its own code (and a listing its details) with the page, so a
// slow phone never waits for one download to start the next.
test("each page names its own code, and a listing page its details, for the browser to start early", async () => {
  const { preloadHints } = await import("../src/pages.js");
  const hrefs = (path) => preloadHints(path).map((t) => t.match(/href="([^"]+)"/)[1]);
  assert.deepEqual(hrefs("/"), ["/app/views/home.js", "/app/views/home.css"]);
  assert.deepEqual(hrefs("/sports/tennis/"), ["/app/views/sport.js", "/app/views/sport.css"]);
  assert.deepEqual(hrefs("/update/" + PROGRAM), ["/app/views/forms.js", "/app/views/forms.css"]);
  assert.deepEqual(hrefs("/programs/" + PROGRAM.toUpperCase()), ["/app/views/program.js", "/app/views/program.css", "/api/orgs/" + PROGRAM]);
  assert.deepEqual(hrefs("/nope"), []);
  // The shell starts the listings for every page, and a missing page names no code.
  assert.ok(SHELL.includes('<link rel="preload" href="/api/listings" as="fetch" crossorigin>'));
  const env = { ASSETS: assets(), DB: undefined, ENV_NAME: "production" };
  const missing = await (await serve("/nope", env)).text();
  assert.ok(!missing.includes("/app/views/"), "a 404 names no page code");
});

test("the privacy policy and terms are pages, in the sitemap", async () => {
  const env = { ASSETS: assets(), ENV_NAME: "production" };
  const privacy = await serve("/privacy", env), terms = await serve("/terms", env);
  assert.equal(privacy.status, 200); assert.equal(terms.status, 200);
  assert.equal(titleOf(await privacy.text()), "Privacy policy · Adaptive Sports Near Me");
  assert.equal(titleOf(await terms.text()), "Terms of use · Adaptive Sports Near Me");
  const map = await sitemapXml({ ENV_NAME: "production" });
  assert.ok(map.includes(`<loc>${ORIGIN}/privacy</loc>`) && map.includes(`<loc>${ORIGIN}/terms</loc>`));
});
