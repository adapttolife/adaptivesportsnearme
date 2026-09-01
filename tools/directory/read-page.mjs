#!/usr/bin/env node
/**
 * Read one official page with the same extractors the website cron jobs use.
 * No guessing. Prints emails, phones, city/state/zip, contact links.
 *
 *   node read-page.mjs https://example.org/
 */
import { extractContacts } from "../../src/extract.js";

const url = process.argv[2];
if (!url || !/^https:\/\//i.test(url)) {
  console.error("usage: node read-page.mjs https://official-page.example/");
  process.exit(1);
}

const res = await fetch(url, {
  redirect: "follow",
  headers: { "user-agent": "ASNM-ReadPage/1 (+https://adaptivesportsnearme.com)" },
  signal: AbortSignal.timeout(15000),
});
const html = await res.text();
const facts = extractContacts(html, res.url || url);
const out = {
  url,
  final_url: res.url,
  http_status: res.status,
  emails: facts.emails,
  phones: facts.phones,
  address: facts.address,
  contact_links: facts.contactLinks,
};
process.stdout.write(JSON.stringify(out, null, 2) + "\n");
