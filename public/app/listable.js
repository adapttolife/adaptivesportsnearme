/* Rows that are not programs never list, on the site or for search engines.
   Shared by the browser (public/app/app.js) and the Worker (src/pages.js).
   - A grant maker's site menu scraped as listings (Blog, History, Our Board, Idaho,
     NorCal...): no state, no city, and no website, or one on challengedathletes.org.
   - Donation pages: this site never asks for money (Donate lives on adapttolife.org).
     The name test only applies to rows with no state (the scraped menu); real
     programs keep names like "Adaptive Recreation Partnership".
   Follow-up: drop these rows at the source, then this file can go. */
const goodUrl = (u) => /^https?:\/\/\S+$/i.test(String(u || "").trim()) ? String(u).trim() : null;
const urlHost = (u) => { try { return new URL(u).hostname.toLowerCase(); } catch (_) { return ""; } };

export function isMenuRow(x) {
  if (String(x.state || "").trim() || String(x.city || "").trim()) return false;
  const w = goodUrl(x.website);
  return !w || /(^|\.)challengedathletes\.org$/.test(urlHost(w));
}
export function isDonationRow(x) {
  return /\bdonat/i.test(String(x.name || "")) || /donat|fundrais|partner-with-us|caf-supporters/i.test(String(x.website || "")) ||
    (!x.state && (/\b(give|giving|fundrais\w*|sponsorships?|partnerships?|gala)\b/i.test(String(x.name || "")) || /^(partner|support|volunteer)$/i.test(String(x.name || "").trim())));
}
export const isListable = (x) => !!x && !isMenuRow(x) && !isDonationRow(x);
