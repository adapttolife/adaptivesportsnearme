// Contact details in free text show only with the organization's yes.
//
// The site promises (How we check listings, /about): "An organization's address,
// phone number and email show only when the organization says yes." The email and
// phone columns already follow that rule (publicity_consent, src/data.js). But
// researchers' notes in `description` and `cost_note` carry the same details in
// prose ("HQ: 1 Minaret Rd...; 760-934-0791; info@..."), some of them a named
// volunteer's personal address.
//
// Without consent, a note that holds any contact detail is not shown at all; the
// page says its website has the details. Cutting the details out of the sentence was
// tried on the real notes (2026-10-18) and left broken fragments ("HQ: . Suite 201"),
// so the whole note waits for a rewrite instead.
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE = /(?:\+?1[ .-]?)?\(?\b\d{3}\)?[ .-]\d{3}[ .-]\d{4}\b/;
const STREET = /\b\d{1,6}\s+(?:[NSEW]\.?\s+)?[A-Z0-9][\w'.-]*(?:\s+[A-Z0-9][\w'.-]*){0,4}\s+(?:St|Street|Rd|Road|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Way|Ln|Lane|Ct|Court|Pl|Place|Pkwy|Parkway|Hwy|Highway|Cir|Circle|Ter|Terrace|Trl|Trail)\b/;
const PO_BOX = /\bP\.?\s?O\.?\s+Box\s+\d+/i;

/** The contact detail found in s, or null. */
export function contactIn(s) {
  const t = String(s ?? "");
  for (const re of [EMAIL, PHONE, STREET, PO_BOX]) { const m = t.match(re); if (m) return m[0]; }
  return null;
}
export const hasContact = (s) => contactIn(s) != null;

/** The note as written, or null when it holds a contact detail the organization hasn't agreed to show. */
export function publicText(text, consent) {
  if (text == null || consent) return text;
  return hasContact(text) ? null : text;
}
