// enrich: propose missing contact/location fields from the org's own website.
// T01 stub carries the previous homepage-regex behavior unchanged so the branch never
// regresses; Spec 72 T03 replaces the innards with src/extract.js structured extraction
// (JSON-LD, mailto:/tel:, contact-page follow) and confidence tiers.

import { pendingOrgIds, proposeStmt, fetchText } from "../lane-utils.js";

const ENRICH_BATCH = 20;

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g;
const STATE_ABBR = "AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC|PR|GU|VI|AS|MP";
const ADDR_RE = new RegExp(`([A-Z][A-Za-z .'-]{2,30}),\\s*(${STATE_ABBR})[\\s,]+(\\d{5})(?:-\\d{4})?`);

export async function enrichLane({ db, cursor }) {
  const { results: orgs } = await db.prepare(
    `SELECT id, name, website_url, email, phone, city, state, zip FROM organizations
     WHERE website_url IS NOT NULL AND status = 'active'
       AND (email IS NULL OR phone IS NULL OR state IS NULL OR city IS NULL)
       AND id > ?
     ORDER BY id LIMIT ?`
  ).bind(cursor, ENRICH_BATCH).all();
  if (!orgs.length) return { cursor: "", processed: 0, flagged: 0, detail: "cycle complete, cursor reset" };

  const pending = await pendingOrgIds(db, "enrich", orgs.map((o) => o.id));
  const now = new Date().toISOString();
  const stmts = [];
  let flagged = 0;
  for (const org of orgs) {
    if (pending.has(org.id)) continue; // don't re-scrape while a proposal awaits review

    const page = await fetchText(org.website_url);
    if (page?.fatal) break; // subrequest budget: stop, record nothing false
    if (!page) continue;
    const html = page.text;

    const change = {};
    if (!org.email) {
      const emails = [...new Set((html.match(EMAIL_RE) || [])
        .map((e) => e.toLowerCase())
        .filter((e) => !/\.(png|jpg|jpeg|gif|svg|webp|css|js)$/.test(e))
        .filter((e) => !/(example\.|sentry|wixpress|@2x)/.test(e)))];
      if (emails.length) change.email = { from: null, to: emails[0] };
    }
    if (!org.phone) {
      const phones = html.match(PHONE_RE) || [];
      if (phones.length) change.phone = { from: null, to: phones[0].trim() };
    }
    if (!org.state || !org.city) {
      const m = html.replace(/<[^>]+>/g, " ").match(ADDR_RE);
      if (m) {
        if (!org.city) change.city = { from: null, to: m[1].trim() };
        if (!org.state) change.state = { from: null, to: m[2] };
        if (!org.zip) change.zip = { from: null, to: m[3] };
      }
    }
    if (!Object.keys(change).length) continue;

    flagged++;
    stmts.push(proposeStmt(db, org.id, "enrich", change,
      { url: org.website_url, scanned_at: now, method: "homepage regex scan" }, 0.6, now));
  }
  if (stmts.length) await db.batch(stmts);
  return { cursor: orgs[orgs.length - 1].id, processed: orgs.length, flagged };
}
