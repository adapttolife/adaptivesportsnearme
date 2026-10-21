/* Who a listing says it serves, as short codes the lists can filter by ("Who it's for").
   Read only from what the listing says about who it serves: the "Athletes served:" part
   of a description, or the "Who it's for:" parts of the veteran research rows. Never from
   the organization's name. A plain keyword list, so the same text always gives the same
   codes. Shared by the Worker (the slim /api/listings rows) and the browser. */
import { parseDesc } from "./listing-sport.js";

/** Codes in the order the chip row shows them. */
export const WHO_ORDER = ["veterans", "kids", "adults", "blind", "deaf", "autism", "intellectual", "physical", "brain"];

/** code -> what the page shows. */
export const WHO_LABELS = {
  veterans: "Veterans",
  kids: "Kids and teens",
  adults: "Adults",
  blind: "Blind or low vision",
  deaf: "Deaf or hard of hearing",
  autism: "Autism",
  intellectual: "Intellectual or developmental",
  physical: "Physical disabilities",
  brain: "Brain injury",
};

// Each starts at a word boundary, so "insight" is never sight and "deafblind" is read
// from the words around it. Endings are open only where a longer word means the same
// (children, adults, amputee, paralysis); exact where it would not (hearing, not hearings).
const RULES = {
  veterans: /\b(?:veterans?|military|service ?members?|wounded warriors?|armed forces)\b/i,
  kids: /\b(?:child(?:ren)?|kids?|youths?|teens?|teenagers?|juniors?|students?|grades? (?:k|\d)|ages? (?:\d|1\d) ?(?:to|through|-|–) ?1\d)\b/i,
  adults: /\badults?\b/i,
  blind: /\b(?:blind(?:ness)?|low vision|visual(?:ly)?[ -]impair\w*|vision loss|sight(?:ed|less)?)\b/i,
  deaf: /\b(?:deaf\w*|hard of hearing|hearing)\b/i,
  autism: /\b(?:autism|autistic)\b/i,
  intellectual: /\b(?:intellectual\w*|developmental\w*|down syndrome|cognitive\w*)\b/i,
  physical: /\b(?:physical\w*|mobility|amput\w*|spinal|paralys\w*|paralyz\w*|cerebral palsy|spina bifida|wheelchairs?|strokes?|multiple sclerosis|limbs?)\b/i,
  brain: /\b(?:brain injur(?:y|ies)|tbi)\b/i,
};

/** The part of a description that says who a listing serves, or "" when it doesn't say. */
export function whoText(desc) {
  const d = String(desc || "");
  const served = parseDesc(d).served;
  if (served) return served;
  // Veteran research: "... Who it's for: W." possibly once per program ("Also equine therapy: ...").
  const out = [];
  const re = /\bWho it's for:\s*([\s\S]*?)(?=\s+(?:Also [A-Za-z ]+?|Programs|Approach|When):|$)/g;
  let m;
  while ((m = re.exec(d))) if (m[1].trim()) out.push(m[1].trim());
  return out.join(" ");
}

/** text: what a listing says about who it serves; key: its sport key. -> codes in WHO_ORDER. */
export function whoTags(text, key) {
  const t = String(text || "");
  return WHO_ORDER.filter((code) => (code === "veterans" && key === "veteran-meetup") || RULES[code].test(t));
}
