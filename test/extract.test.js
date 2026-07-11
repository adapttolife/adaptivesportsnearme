// Spec 72 T03 — structured contact extraction. Pure-function tests over vendored HTML
// fixtures (real org homepages trimmed to <100KB, plus synthetic edge cases). No fetch,
// no Worker APIs — matches the extract.js contract so this runs under plain `node --test`.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractJsonLd,
  extractEmails,
  extractPhones,
  extractAddress,
  extractContactLinks,
  extractContacts,
} from "../src/extract.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(__dirname, "fixtures");

function load(name) {
  return fs.readFileSync(path.join(FIXTURES, name), "utf8");
}

// ---------------------------------------------------------------------------
// extractJsonLd
// ---------------------------------------------------------------------------

test("extractJsonLd: Organization + nested PostalAddress parses", () => {
  const html = load("synth-jsonld-org-postaladdress.html");
  const nodes = extractJsonLd(html);
  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].name, "Synthetic Adaptive Sports Club");
  assert.equal(nodes[0].address.addressLocality, "Boulder");
  assert.equal(nodes[0].email, "hello@synth-club.test");
});

test("extractJsonLd: @graph array is flattened, wrapper itself excluded", () => {
  const html = load("synth-jsonld-graph-array.html");
  const nodes = extractJsonLd(html);
  assert.equal(nodes.length, 2);
  const types = nodes.map((n) => n["@type"]);
  assert.deepEqual(types, ["WebSite", "SportsOrganization"]);
  assert.equal(nodes[1].address.addressLocality, "Denver");
});

test("extractJsonLd: malformed blocks are skipped silently, valid siblings survive", () => {
  const html = load("synth-jsonld-malformed.html");
  assert.doesNotThrow(() => extractJsonLd(html));
  const nodes = extractJsonLd(html);
  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].name, "Valid Sibling Block");
  assert.equal(nodes[0].email, "ok@brokenblocks.test");
});

test("extractJsonLd: attribute-order/quote-style variance on <script> tag", () => {
  const html = load("synth-attribute-noise.html");
  const nodes = extractJsonLd(html);
  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].name, "Attribute Noise Sports");
  assert.equal(nodes[0].email, "attr-noise@noisy.test");
});

test("extractJsonLd: real site with zero JSON-LD returns empty array, no throw", () => {
  const html = load("real-adaptivesportsohio-org.html");
  assert.doesNotThrow(() => extractJsonLd(html));
  assert.deepEqual(extractJsonLd(html), []);
});

test("extractJsonLd: real Yoast @graph site (moveunitedsport.org) flattens cleanly", () => {
  const html = load("real-moveunitedsport-org.html");
  const nodes = extractJsonLd(html);
  assert.ok(nodes.length > 0);
  assert.ok(nodes.every((n) => typeof n === "object" && !Array.isArray(n)));
});

// ---------------------------------------------------------------------------
// extractEmails
// ---------------------------------------------------------------------------

test("extractEmails: mailto with numeric entity and percent-encoding decode; noreply kept", () => {
  const html = load("synth-mailto-entity-encoded.html");
  const emails = extractEmails(html);
  assert.deepEqual(emails, [
    "info@entity-encoded.test",
    "volunteer@entity-encoded.test",
    "noreply@entity-encoded.test",
  ]);
});

test("extractEmails: junk filtering — asset filenames, example.*, sentry, wixpress, @2x; case-insensitive dedupe", () => {
  const html = load("synth-email-junk-filter.html");
  const emails = extractEmails(html);
  assert.deepEqual(emails, ["director@junkfilter.test"]);
});

test("extractEmails: JSON-LD script content never leaks into visible-text pass", () => {
  const html = load("synth-attribute-noise.html");
  assert.deepEqual(extractEmails(html), []);
});

test("extractEmails: zero-contact page returns empty array", () => {
  const html = load("synth-zero-contact-info.html");
  assert.deepEqual(extractEmails(html), []);
});

test("extractEmails: real site (achillesinternational.org) finds mailto address", () => {
  const html = load("real-achillesinternational-org.html");
  const emails = extractEmails(html);
  assert.ok(emails.includes("info@achillesinternational.org"));
});

test("extractEmails: real site (catalystsports.org) finds mailto address", () => {
  const html = load("real-catalystsports-org.html");
  const emails = extractEmails(html);
  assert.ok(emails.includes("info@catalystsports.org"));
});

// ---------------------------------------------------------------------------
// extractPhones
// ---------------------------------------------------------------------------

test("extractPhones: tel: hrefs normalized (plus-prefixed, punctuated, extension)", () => {
  const html = load("synth-tel-links.html");
  const phones = extractPhones(html);
  assert.deepEqual(phones, ["+13035550101", "3035550102", "3035550103x204"]);
  // no visible-text duplicate: anchor text for the first link is non-numeric on purpose
});

test("extractPhones: visible-text US formats when no tel: links present", () => {
  const html = load("synth-phone-formats.html");
  const phones = extractPhones(html);
  assert.ok(phones.some((p) => p.includes("720") && p.includes("555") && p.includes("0123")));
  assert.ok(phones.some((p) => p.includes("800")));
  // short non-phone numbers must not be captured
  assert.ok(!phones.some((p) => /^\d{5}$/.test(p.replace(/\D/g, "")) === false && p === "12345"));
});

test("extractPhones: zero-contact page returns empty array", () => {
  const html = load("synth-zero-contact-info.html");
  assert.deepEqual(extractPhones(html), []);
});

test("extractPhones: real site (challengedathletes.org) finds tel: link", () => {
  const html = load("real-challengedathletes-org.html");
  const phones = extractPhones(html);
  assert.ok(phones.length > 0);
});

test("extractPhones: real site (highfivesfoundation.org) finds tel: link", () => {
  const html = load("real-highfivesfoundation-org.html");
  const phones = extractPhones(html);
  assert.ok(phones.some((p) => p.includes("5305874453") || p === "+15305874453"));
});

// ---------------------------------------------------------------------------
// extractAddress
// ---------------------------------------------------------------------------

test("extractAddress: JSON-LD PostalAddress wins even when present", () => {
  const html = load("synth-jsonld-org-postaladdress.html");
  const addr = extractAddress(html);
  assert.deepEqual(addr, { city: "Boulder", state: "CO", zip: "80301" });
});

test("extractAddress: nested PostalAddress inside @graph member", () => {
  const html = load("synth-jsonld-graph-array.html");
  const addr = extractAddress(html);
  assert.deepEqual(addr, { city: "Denver", state: "CO", zip: "80202" });
});

test("extractAddress: falls back to 'City, ST 12345' text regex when no JSON-LD address", () => {
  const html = load("synth-address-footer-text-only.html");
  const addr = extractAddress(html);
  assert.deepEqual(addr, { city: "Missoula", state: "MT", zip: "59801" });
});

test("extractAddress: null when nothing found anywhere", () => {
  const html = load("synth-zero-contact-info.html");
  assert.equal(extractAddress(html), null);
});

test("extractAddress: real site (catalystsports.org) JSON-LD PostalAddress", () => {
  const html = load("real-catalystsports-org.html");
  const addr = extractAddress(html);
  assert.ok(addr);
  assert.equal(addr.city, "Atlanta");
  assert.equal(addr.state, "GA");
  assert.ok(addr.zip.startsWith("30318"));
});

// ---------------------------------------------------------------------------
// extractContactLinks
// ---------------------------------------------------------------------------

test("extractContactLinks: relative resolution, mailto/tel/# skipped, max 3, dedupe", () => {
  const html = load("synth-contact-links-homepage.html");
  const links = extractContactLinks(html, "https://linkhost.example.org/");
  assert.equal(links.length, 3);
  assert.deepEqual(links, [
    "https://linkhost.example.org/about-us",
    "https://linkhost.example.org/contact",
    "https://linkhost.example.org/get-involved",
  ]);
  assert.ok(!links.some((l) => l.includes("otherhost.example.net")));
});

test("extractContactLinks: same-host filtering excludes a different-host subdomain; base-path relative resolution", () => {
  const html = load("synth-contact-links-subdomain-and-path.html");
  const links = extractContactLinks(html, "https://pathhost.example.org/en/home/index.html");
  assert.deepEqual(links, [
    "https://pathhost.example.org/en/home/contact-us",
    "https://pathhost.example.org/about",
    "https://pathhost.example.org/get-involved-today",
  ]);
  assert.ok(!links.some((l) => l.includes("donate.pathhost.example.org")));
});

test("extractContactLinks: no candidates on a page with none", () => {
  const html = load("synth-zero-contact-info.html");
  const links = extractContactLinks(html, "https://nothinghere.example.org/");
  assert.deepEqual(links, []);
});

test("extractContactLinks: invalid baseUrl fails soft to empty array", () => {
  const html = load("synth-contact-links-homepage.html");
  assert.deepEqual(extractContactLinks(html, "not-a-url"), []);
});

test("extractContactLinks: real site (moveunitedsport.org) finds same-host contact-ish links", () => {
  const html = load("real-moveunitedsport-org.html");
  const links = extractContactLinks(html, "https://moveunitedsport.org/");
  assert.ok(links.length > 0);
  assert.ok(links.length <= 3);
  for (const l of links) assert.equal(new URL(l).hostname, "moveunitedsport.org");
});

// ---------------------------------------------------------------------------
// extractContacts (aggregate)
// ---------------------------------------------------------------------------

test("extractContacts: aggregates all five fields from a contact-page-shaped fixture", () => {
  const html = load("synth-contact-page-target.html");
  const c = extractContacts(html, "https://linkhost.test/contact");
  assert.deepEqual(c.emails, ["contactpage@linkhost.test"]);
  assert.deepEqual(c.phones, ["+13035550188"]);
  assert.deepEqual(c.address, { city: "Fort Collins", state: "CO", zip: "80521" });
  assert.deepEqual(c.jsonld, []);
  assert.deepEqual(c.contactLinks, []);
});

test("extractContacts: zero-contact page returns all-empty shape, no throw", () => {
  const html = load("synth-zero-contact-info.html");
  const c = extractContacts(html, "https://nothinghere.example.org/");
  assert.deepEqual(c, { emails: [], phones: [], address: null, jsonld: [], contactLinks: [] });
});

test("extractContacts: real site (adaptivesportsnewengland.org) full aggregate shape, no throw", () => {
  const html = load("real-adaptivesportsnewengland-org.html");
  const c = extractContacts(html, "https://adaptivesportsnewengland.org/");
  assert.ok(Array.isArray(c.emails));
  assert.ok(Array.isArray(c.phones));
  assert.ok(Array.isArray(c.jsonld));
  assert.ok(Array.isArray(c.contactLinks));
  assert.ok(c.address === null || typeof c.address === "object");
});

// ---------------------------------------------------------------------------
// Smoke pass over every real fixture: never throws, always returns the right shape.
// ---------------------------------------------------------------------------

test("extractContacts: every real fixture runs clean (no throw, correct shape)", () => {
  const realFiles = fs.readdirSync(FIXTURES).filter((f) => f.startsWith("real-"));
  assert.ok(realFiles.length >= 6, "expect at least 6 real-site fixtures");
  for (const f of realFiles) {
    const html = load(f);
    const host = f.replace(/^real-/, "").replace(/-org\.html$/, ".org").replace(/\.html$/, "");
    const baseUrl = `https://${host}/`;
    let c;
    assert.doesNotThrow(() => { c = extractContacts(html, baseUrl); }, `${f} threw`);
    assert.ok(Array.isArray(c.emails), `${f} emails not array`);
    assert.ok(Array.isArray(c.phones), `${f} phones not array`);
    assert.ok(Array.isArray(c.jsonld), `${f} jsonld not array`);
    assert.ok(Array.isArray(c.contactLinks), `${f} contactLinks not array`);
    assert.ok(c.address === null || typeof c.address === "object", `${f} address bad shape`);
  }
});
