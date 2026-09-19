import { cssIncludes } from './helpers/css.js';
const styles = readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  grantPageTemplate, grantNotFoundTemplate, GRANT_ID_RE,
  grantLocLine, grantAudienceLabel, primaryCta, listingInnerHtml,
} from "../src/grant-page.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const index = readFileSync(join(root, "public/index.html"), "utf8");

const HUSTLE = {
  id: "b0298125-6d6a-4114-b0a2-5275750c09ae",
  name: "Hustle & Heart Fund (Adapt To Life)",
  source: "Adapt To Life",
  type: "general",
  audience: "athlete",
  amountDisplay: "Varies",
  deadlineDisplay: "Rolling",
  eligibility: "Adapt To Life athletes; do not buy first",
  applicationUrl: "https://adapttolife.org",
};

const VA = {
  id: "c7168314-73f4-5559-8387-d04651e400a9",
  name: "VA Adaptive Sports Grant Program",
  source: "U.S. Department of Veterans Affairs",
  type: "program",
  audience: "program",
  amountDisplay: "Up to $750,000",
  email: "grants4vets@va.gov",
  applicationUrl: "https://department.va.gov/veteran-sports/grant-program/",
};

const BARE = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  name: "Bare Fund",
  audience: "athlete",
};

test("GRANT_ID_RE matches a UUID grant path", () => {
  const m = "/grants/b0298125-6d6a-4114-b0a2-5275750c09ae".match(GRANT_ID_RE);
  assert.ok(m);
  assert.equal(m[1], "b0298125-6d6a-4114-b0a2-5275750c09ae");
  assert.equal("/grants/not-a-uuid".match(GRANT_ID_RE), null);
  assert.equal("/programs/b0298125-6d6a-4114-b0a2-5275750c09ae".match(GRANT_ID_RE), null);
});

test("grantLocLine: funder · amount · deadline, else national", () => {
  assert.equal(grantLocLine(HUSTLE), "Adapt To Life · Varies · Rolling");
  assert.equal(grantLocLine({ source: "CAF" }), "CAF");
  assert.equal(grantLocLine({}), "United States · national");
});

test("grantAudienceLabel: athlete vs program, null when missing", () => {
  assert.equal(grantAudienceLabel(HUSTLE), "Athlete grant");
  assert.equal(grantAudienceLabel(VA), "Program grant");
  assert.equal(grantAudienceLabel({}), null);
});

test("primaryCta: Apply → Call → Email → View source. Never an empty stub", () => {
  assert.deepEqual(primaryCta(HUSTLE), { href: HUSTLE.applicationUrl, label: "Apply" });
  assert.deepEqual(primaryCta({ phone: "301-217-0960" }), { href: "tel:3012170960", label: "Call" });
  assert.deepEqual(primaryCta({ email: "hawkeye@gohawkeye.com" }), { href: "mailto:hawkeye@gohawkeye.com", label: "Email" });
  assert.deepEqual(primaryCta({ sourceUrl: "https://example.org/src" }), { href: "https://example.org/src", label: "View source" });
  assert.equal(primaryCta({}), null);
});

test("grantPageTemplate: listing sheet tokens, Apply CTA, audience tag", () => {
  const html = grantPageTemplate(HUSTLE, { site: "https://asnm-staging.adapt-to-life.workers.dev" });
  assert.ok(html.includes("Hustle &amp; Heart Fund (Adapt To Life)"));
  assert.ok(html.includes("<h1>Hustle &amp; Heart Fund (Adapt To Life)</h1>"));
  assert.ok(html.includes("Adapt To Life") && html.includes("Varies") && html.includes("Rolling"));
  assert.ok(html.includes("Apply"));
  assert.ok(html.includes("adapttolife.org"));
  assert.ok(html.includes("Athlete grant"));
  assert.ok(html.includes("cbadge"));
  assert.ok(html.includes("← Grants"));
  assert.ok(html.includes('class="bar"'));
  assert.ok(cssIncludes(styles, "--space-page: 24px"));
  assert.ok(cssIncludes(styles, "--space-header: 64px"));
  assert.ok(cssIncludes(styles, "--tap: 44px"));
  assert.ok(cssIncludes(styles, "min-height:var(--space-header)"));
  assert.ok(cssIncludes(styles, "margin:0 0 var(--space-after-photo)"));
  assert.ok(cssIncludes(styles, "margin:0 0 var(--space-section)"));
  assert.ok(cssIncludes(styles, "margin-top:var(--space-nearby)"));
  assert.ok(cssIncludes(styles, "padding:var(--space-row) 0"));
  assert.ok(cssIncludes(styles, "clamp(180px,24vw,260px)"));
  assert.ok(html.includes('href="/styles.css"'));
  assert.ok(html.includes(">Amount</span>") && html.includes("Varies"));
  assert.ok(html.includes(">Deadline</span>") && html.includes("Rolling"));
  assert.ok(html.includes(">Eligibility</span>"));
  assert.ok(html.includes(">Who</span>") && html.includes("Athlete grant"));
  assert.ok(!html.includes("Unverified"));
  assert.ok(!html.includes("Last checked"));
  assert.ok(!html.includes("Visit website"));
  assert.ok(!html.includes("class=\"card\""));
  assert.ok(!html.includes("Funding that fits"));
});

test("grantPageTemplate: program grant uses the rsvp chip, not athlete", () => {
  const html = grantPageTemplate(VA);
  assert.ok(html.includes("Program grant"));
  assert.ok(html.includes("cbadge rsvp"));
  assert.ok(!html.includes("Athlete grant"));
  assert.ok(html.includes("Apply"));
  assert.ok(html.includes("grants4vets@va.gov"));
});

test("grantPageTemplate: facts only when present; grant-track scene; no empty CTA", () => {
  const html = grantPageTemplate(BARE);
  assert.ok(html.includes("Bare Fund"));
  assert.ok(html.includes("/scenes/grant-track.jpg"));
  assert.ok(html.includes("has-dphoto"));
  assert.ok(!html.includes("g-sand"));
  assert.ok(!html.includes("sport-photos/"));
  assert.ok(!html.includes('class="cta"'));
  assert.ok(!html.includes(">Amount</span>"));
  assert.ok(!html.includes(">Phone</span>"));
  assert.ok(!html.includes('class="desc"'));
  assert.ok(html.includes("Athlete grant"));
});

test("grantPageTemplate: Other grants is one horizontal rail", () => {
  const nearby = [
    { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", name: "Kelly Brush Active Fund", source: "Kelly Brush Foundation", audience: "athlete", amountDisplay: "Up to $5,000" },
    { id: "cccccccc-cccc-cccc-cccc-cccccccccccc", name: "High Fives Empowerment Grant", source: "High Fives Foundation", audience: "athlete", sport: "skiing" },
  ];
  const html = grantPageTemplate(HUSTLE, { nearby });
  assert.ok(html.includes("Other grants"));
  assert.ok(html.includes('class="nearby"'));
  assert.ok(html.includes('class="frow-scroll"'));
  assert.ok(html.includes("Kelly Brush Active Fund"));
  assert.ok(cssIncludes(styles, "78vw"));
  assert.ok(!html.includes('class="grid"'));
  assert.ok(!html.includes("Nearby "));
  const empty = grantPageTemplate(HUSTLE, { nearby: [] });
  assert.ok(!empty.includes('class="nearby"'));
});

test("grantPageTemplate: escapes untrusted name", () => {
  const html = grantPageTemplate({
    ...HUSTLE,
    name: '<script>alert(1)</script>',
    source: 'CAF & "Rebound"',
  });
  assert.ok(!html.includes("<script>alert(1)</script>"));
  assert.ok(html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
  assert.ok(html.includes("CAF &amp; &quot;Rebound&quot;"));
});

test("grantNotFoundTemplate: no launch modal, says not found", () => {
  const html = grantNotFoundTemplate({ site: "https://example.test" });
  assert.ok(html.includes("Grant not found"));
  assert.ok(!html.includes("We are not live yet"));
  assert.ok(!html.includes("Unverified"));
});

test("SPA: BOOT_QP reads db=grants; rows use data-grant; count is not hardcoded 6", () => {
  assert.ok(index.includes("BOOT_QP.get('db')"));
  assert.ok(index.includes("data-grant"));
  assert.ok(index.includes("grantAudience"));
  assert.ok(index.includes("Athlete grant"));
  assert.ok(index.includes("Program grant"));
  assert.match(index, /\{key:"grants", label:"Grants", count:GRANTS\.length/);
  assert.ok(!index.includes('{key:"grants", label:"Grants", count:6'));
});

test("SPA grant sheet reuses listing classes and has no Unverified", () => {
  const fnAt = index.indexOf("function grantSheet(");
  assert.ok(fnAt > 0);
  const chunk = index.slice(fnAt, fnAt + 900);
  assert.ok(chunk.includes('class="sheet"'));
  assert.ok(index.includes("function grantRelatedRow("));
  assert.ok(index.includes("Other grants"));
  assert.ok(index.includes("frow-scroll"));
  assert.ok(index.includes("data-db-link=\"grants\"") || index.includes("/?db=grants"));
  assert.ok(!index.includes("Unverified"));
  assert.ok(!index.includes("Last checked"));
});

// Same split as /programs/:id: the standalone grant page wears the site chrome,
// the shared inner renderer stays bare for the in-app sheet.
test("grantPageTemplate: the standalone grant page wears the app header and footer", () => {
  const html = grantPageTemplate(HUSTLE);
  assert.ok(html.includes('<header class="hdr">'));
  assert.ok(html.includes('<footer class="foot">'));
  assert.ok(html.includes('/site-nav.js?v='));
  assert.ok(html.includes('<form class="search" role="search" action="/" method="get">'));
});

test("grant listingInnerHtml: the in-app sheet stays bare", () => {
  const inner = listingInnerHtml(HUSTLE);
  assert.ok(!inner.includes("<header"));
  assert.ok(!inner.includes("<footer"));
  assert.ok(!inner.includes("site-nav.js"));
  assert.ok(!inner.includes("<!DOCTYPE"));
});
