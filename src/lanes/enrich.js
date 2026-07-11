// enrich: propose missing contact/location fields from the org's own website.
// Spec 72 T03 v2: structured extraction (src/extract.js — JSON-LD, mailto:/tel: hrefs,
// text regex) with a contact-page follow-up when the homepage has no email at all.
// Confidence is tiered by extraction method (JSON-LD > mailto:/tel: link > text regex)
// and, when a proposal spans multiple fields pulled from different tiers, reflects the
// WEAKEST tier used so the reviewer never sees a stronger confidence than the shakiest
// fact backing it.

import { pendingOrgIds, proposeStmt, fetchText } from "../lane-utils.js";
import { extractJsonLd, extractEmails, extractPhones, extractAddress, extractContactLinks } from "../extract.js";

// Subrequest budget: 15 orgs x up to 2 fetches (homepage + optional contact page) + 3 D1
// calls (select, pendingOrgIds, batch) = 33 < 50 (Workers' per-invocation subrequest cap).
const BATCH = 15;

const CONFIDENCE = { jsonld: 0.8, links: 0.7, regex: 0.6 };
const TIER_RANK = { jsonld: 3, links: 2, regex: 1 };

function decodeEntities(raw) {
  return raw
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&amp;/gi, "&");
}

function decodeHref(raw) {
  let s = decodeEntities(raw.split("?")[0]);
  try {
    s = decodeURIComponent(s);
  } catch {
    // malformed % sequence — keep the entity-decoded form
  }
  return s.trim();
}

// Which mailto:/tel: hrefs are literally present on the page — used only to tell a
// "links" hit apart from a "regex" (visible-text) hit for the SAME winning value.
function hrefEmailSet(html) {
  const out = new Set();
  const re = /href\s*=\s*(["'])mailto:([^"']*)\1/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const email = decodeHref(m[2]).toLowerCase();
    if (email) out.add(email);
  }
  return out;
}

function hrefPhoneSet(html) {
  const out = new Set();
  const re = /href\s*=\s*(["'])tel:([^"']*)\1/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const phone = decodeHref(m[2]).replace(/[^\d+xX]/g, "");
    if (phone) out.add(phone);
  }
  return out;
}

function jsonldEmail(nodes) {
  for (const n of nodes) {
    if (n && typeof n.email === "string" && n.email.includes("@")) return n.email.trim().toLowerCase();
  }
  return null;
}

function jsonldPhone(nodes) {
  for (const n of nodes) {
    if (n && typeof n.telephone === "string" && n.telephone.trim()) return n.telephone.trim();
  }
  return null;
}

function hasJsonLdAddress(nodes) {
  for (const obj of nodes) {
    const candidates = [obj, obj && obj.address].filter((c) => c && typeof c === "object");
    if (candidates.some((c) => c.addressLocality || c.addressRegion || c.postalCode)) return true;
  }
  return false;
}

// One page's contact fields, each tagged with the tier that produced it so the caller
// can price confidence and pick a winner across (up to) two pages.
function extractTiered(html, baseUrl) {
  const jsonld = extractJsonLd(html);
  const emails = extractEmails(html);
  const phones = extractPhones(html);
  const address = extractAddress(html);

  const jEmail = jsonldEmail(jsonld);
  const email = jEmail
    ? { value: jEmail, source: "jsonld" }
    : emails.length
      ? { value: emails[0], source: hrefEmailSet(html).has(emails[0]) ? "links" : "regex" }
      : null;

  const jPhone = jsonldPhone(jsonld);
  const phone = jPhone
    ? { value: jPhone, source: "jsonld" }
    : phones.length
      ? { value: phones[0], source: hrefPhoneSet(html).has(phones[0]) ? "links" : "regex" }
      : null;

  const address_ = address ? { value: address, source: hasJsonLdAddress(jsonld) ? "jsonld" : "regex" } : null;

  return { email, phone, address: address_, contactLinks: extractContactLinks(html, baseUrl) };
}

export async function enrichLane({ db, cursor }) {
  const { results: orgs } = await db.prepare(
    `SELECT id, name, website_url, email, phone, city, state, zip FROM organizations
     WHERE website_url IS NOT NULL AND status = 'active'
       AND (email IS NULL OR phone IS NULL OR state IS NULL OR city IS NULL)
       AND id > ?
     ORDER BY id LIMIT ?`
  ).bind(cursor, BATCH).all();
  if (!orgs.length) return { cursor: "", processed: 0, flagged: 0, detail: "cycle complete, cursor reset" };

  const pending = await pendingOrgIds(db, "enrich", orgs.map((o) => o.id));
  const now = new Date().toISOString();
  const stmts = [];
  let flagged = 0;
  for (const org of orgs) {
    if (pending.has(org.id)) continue; // don't re-scrape while a proposal awaits review

    const home = await fetchText(org.website_url);
    if (home?.fatal) break; // subrequest budget: stop, record nothing false
    if (!home) continue;

    let picked = extractTiered(home.text, org.website_url);
    let contactPageUrl = null;

    if (!org.email && !picked.email && picked.contactLinks.length) {
      const contactUrl = picked.contactLinks[0];
      const contact = await fetchText(contactUrl);
      if (contact?.fatal) break; // subrequest budget: stop, record nothing false
      if (contact) {
        contactPageUrl = contactUrl;
        const fromContact = extractTiered(contact.text, contactUrl);
        // Homepage values win ties — only fall back to the contact page per field.
        picked = {
          email: picked.email ?? fromContact.email,
          phone: picked.phone ?? fromContact.phone,
          address: picked.address ?? fromContact.address,
          contactLinks: picked.contactLinks,
        };
      }
    }

    const change = {};
    const sources = [];

    if (!org.email && picked.email) {
      change.email = { from: null, to: picked.email.value };
      sources.push(picked.email.source);
    }
    if (!org.phone && picked.phone) {
      change.phone = { from: null, to: picked.phone.value };
      sources.push(picked.phone.source);
    }
    if ((!org.city || !org.state || !org.zip) && picked.address) {
      const { city, state, zip } = picked.address.value;
      if (!org.city && city) { change.city = { from: null, to: city }; sources.push(picked.address.source); }
      if (!org.state && state) { change.state = { from: null, to: state }; sources.push(picked.address.source); }
      if (!org.zip && zip) { change.zip = { from: null, to: zip }; sources.push(picked.address.source); }
    }
    if (!Object.keys(change).length) continue;

    const weakest = sources.reduce((a, b) => (TIER_RANK[b] < TIER_RANK[a] ? b : a));

    flagged++;
    stmts.push(proposeStmt(db, org.id, "enrich", change,
      { url: org.website_url, scanned_at: now, method: weakest, contact_page: contactPageUrl },
      CONFIDENCE[weakest], now));
  }
  if (stmts.length) await db.batch(stmts);
  return { cursor: orgs[orgs.length - 1].id, processed: orgs.length, flagged };
}
