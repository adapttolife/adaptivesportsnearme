// Karen's veteran-owned business page (2026-10-08 email, "Page to link state
// directories"): her copy, her links, and "State directory not yet verified"
// wherever no official state directory has been found and checked.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import worker from "../src/index.js";
import { veteranBusinessPageTemplate, resourcesIndexTemplate, VETERAN_BUSINESS_PATH } from "../src/resource-page.js";
import { VETERAN_BUSINESS_COPY as COPY, NATIONWIDE, STATES } from "../src/resources/veteran-businesses.js";

const html = veteranBusinessPageTemplate({ site: "https://example.test" });

test("every state is on the page, alphabetical, with its own national directory page", () => {
  assert.equal(STATES.length, 50);
  assert.deepEqual(STATES.map((s) => s.name), [...STATES.map((s) => s.name)].sort());
  assert.equal((html.match(/class="state-card"/g) || []).length, 50);
  assert.equal((html.match(/<nav class="state-chips"[\s\S]*?<\/nav>/)[0].match(/<a /g) || []).length, 50);
  for (const s of STATES) {
    assert.ok(html.includes(`id="state-${s.code.toLowerCase()}"`), s.name);
    assert.ok(html.includes(`https://www.veteranownedbusiness.com/${s.code.toLowerCase()}`), s.name);
  }
});

test("Karen's five official state directories, and her words for the rest", () => {
  const official = STATES.filter((s) => s.official).map((s) => s.code);
  assert.deepEqual(official, ["CA", "FL", "IL", "NY", "WI"]);
  for (const url of [
    "https://www.dgs.ca.gov/PD/Services/Page-Content/Procurement-Division-Services-List-Folder/Search-For-State-Certified-Small-And-Diverse-Businesses",
    "https://osd.dms.myflorida.com/directories",
    "https://cei.illinois.gov/supplier-diversity-management-system.html",
    "https://sdves.ogs.ny.gov/business-search",
    "https://apps.dva.wisconsin.gov/VeteranOwnedBusiness",
  ]) assert.ok(html.includes(url), url);
  assert.equal((html.match(/State directory not yet verified/g) || []).length, 45);
  assert.equal((html.match(/Official state directory/g) || []).length, 5);
});

test("her copy, her nationwide directories, and her disclaimer, word for word", () => {
  assert.ok(html.includes("<h1>Support Veteran-Owned Businesses</h1>"));
  assert.ok(html.includes("Their service doesn&#39;t end when the uniform comes off."));
  assert.ok(html.includes("Adaptive Sports Near Me provides these links as a public resource. Inclusion does not constitute an endorsement or independent verification of a business."));
  assert.ok(html.includes("Choose your state. Shop veteran-owned. Support those who served."));
  for (const d of ["https://avosba.org/avoba-membership/veteran-owned-businesses-by-state/", "https://www.veteranownedbusiness.com/advanced_search.php", "https://veterans.certify.sba.gov/"]) {
    assert.ok(NATIONWIDE.some((n) => n.url === d) && html.includes(d), d);
  }
});

test("links are plain https and open in a new tab; no dashes or money asks in the copy", () => {
  const hrefs = [...html.matchAll(/<a[^>]+href="(https?:[^"]+)"[^>]*>/g)].map((m) => m[0]);
  const external = hrefs.filter((a) => !a.includes("example.test") && !a.includes("fonts.g"));
  assert.ok(external.length >= 58);
  for (const a of external) {
    assert.match(a, /href="https:\/\//, a);
  }
  const words = JSON.stringify(COPY) + JSON.stringify(NATIONWIDE);
  assert.ok(!/[–—]/.test(words), "no en or em dashes");
  assert.ok(!/donat|give money|sponsor/i.test(words), "Near Me never asks for money");
});

// The site's page is the app's /resources/veteran-owned-businesses view
// (public/app/views/vob.js), drawn from public/data/veteran-businesses.json.
// That file is an export of src/resources/veteran-businesses.js, so Karen's
// words, links and "not yet verified" notes have to survive the export unchanged.
test("the app's copy of the page data is Karen's, word for word", () => {
  const exported = JSON.parse(readFileSync(new URL("../public/data/veteran-businesses.json", import.meta.url), "utf8"));
  assert.deepEqual(exported, { copy: COPY, nationwide: NATIONWIDE, states: STATES });
  const view = readFileSync(new URL("../public/app/views/vob.js", import.meta.url), "utf8");
  assert.match(view, /fetch\("\/data\/veteran-businesses\.json"\)/);
  assert.match(view, /c\.notVerified/);
  assert.match(view, /c\.disclaimer/);
});

test("the Worker serves the page and the resources door without a database", async () => {
  const shell = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
  const ASSETS = { fetch: async (request) => new URL(request.url).pathname === "/" ? new Response(shell) : new Response("missing", { status: 404 }) };
  for (const [path, title] of [[VETERAN_BUSINESS_PATH, COPY.title], [VETERAN_BUSINESS_PATH + "/", COPY.title], ["/resources", "Resources"], ["/resources/", "Resources"]]) {
    const response = await worker.fetch(new Request("https://adaptivesportsnearme.com" + path), { ASSETS }, {});
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("content-type"), /text\/html/);
    const html = await response.text();
    assert.ok(html.includes(`<title>${title} · Adaptive Sports Near Me</title>`), path);
    assert.ok(html.includes('<script type="module" src="/app/app.js"></script>'), `${path} is the app shell`);
  }
  assert.ok(resourcesIndexTemplate().includes(`href="${VETERAN_BUSINESS_PATH}"`));
});
