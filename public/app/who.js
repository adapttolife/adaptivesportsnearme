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
  // School-age programs often run to 21 ("ages 5-21").
  kids: /\b(?:child(?:ren)?|kids?|youths?|teens?|teenagers?|juniors?|grades? (?:k|\d)|ages? (?:\d|1\d) ?(?:to|through|-|–) ?(?:1\d|2[01]))\b/i,
  adults: /\badults?\b/i,
  // "visual" counts only next to impairment or disability, including inside a list
  // ("visual and hearing disabilities"), so "visual arts" is not blind. A bare "sighted"
  // ("sighted guides") is not blind either; "partially sighted" is.
  blind: new RegExp("\\b(?:blind(?:ness)?|low vision|vision[ -]impair\\w*|vision disabilit(?:y|ies)|vision loss|sight[ -]impair\\w*|sightless|sight loss|loss of sight|partially[ -]sighted|visual(?:ly)?" +
    "(?:[ -]|(?:\\s*(?:,\\s*(?:and|or)?|and|or|/|&)\\s*(?:hearing|physical|cognitive|intellectual|developmental|sensory|auditory|speech|mobility|learning|emotional))+\\s+)" +
    "(?:impair\\w*|disabilit(?:y|ies)))\\b", "i"),
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

/** Is `c` one of the nine codes? Own keys only, so "constructor" or "__proto__" never is. */
export function isWho(c) { return typeof c === "string" && Object.prototype.hasOwnProperty.call(WHO_LABELS, c); }

/** A ?w= value we know, or "". */
export function whoCode(w) { return isWho(w) ? w : ""; }

// The line says people first ("people who are blind"), not the chip's short label.
const WHO_SAY = {
  veterans: "veterans", kids: "kids and teens", adults: "adults",
  blind: "people who are blind or have low vision", deaf: "people who are deaf or hard of hearing",
  autism: "people with autism", intellectual: "people with intellectual or developmental disabilities",
  physical: "people with physical disabilities", brain: "people with brain injuries",
};

/** How a line says a code, people first; "" for anything that isn't a code. */
export function whoSay(code) { return isWho(code) ? WHO_SAY[code] : ""; }

function esc(s) {
  return s == null ? "" : String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/** Chip row: "Anyone", then each code at least one listing in `pool` has (and the active one).
    hrefFor(code) builds the link ("" clears it). Chips change the filter, so they replace.
    check: the HTML for the current chip's check icon (the page passes its icon). */
export function whoChips({ pool = [], active = "", hrefFor, label = "Who it's for", check = "" } = {}) {
  const on = whoCode(active);
  // A code every listing here has filters nothing (veterans on the veteran meetups page), so it isn't offered.
  const n = {};
  for (const p of pool) for (const c of p.who || []) if (isWho(c)) n[c] = (n[c] || 0) + 1;
  const have = new Set(Object.keys(n).filter((c) => n[c] < pool.length));
  if (on) have.add(on);
  if (!have.size) return "";
  const chip = (text, code) => {
    const cur = code === on;
    return `<a class="chip${cur ? " is-cur" : ""}" href="${esc(hrefFor(code))}" data-replace${cur ? ' aria-current="page"' : ""}>${cur ? check : ""}<span>${esc(text)}</span></a>`;
  };
  return `<nav class="who" aria-label="${esc(label)}"><h2 class="who-h">Who it's for</h2><div class="who-row"><div class="who-in">${chip("Anyone", "")}${WHO_ORDER.filter((c) => have.has(c)).map((c) => chip(WHO_LABELS[c], c)).join("")}</div></div></nav>`;
}

/** The honest line above filtered results. shown: how many say they serve `code`; quiet: how many
    in the same pool don't say who they serve; where: " nearby" or "". "" for anything that isn't a code. */
export function whoLine(code, shown, quiet, where = "") {
  if (!isWho(code)) return "";
  const say = esc(WHO_SAY[code]);
  const lead = shown ? `Showing <b class="num">${shown}</b> that ${shown === 1 ? "says it serves" : "say they serve"} ${say}.` : `None${esc(where)} say they serve ${say} yet.`;
  const tail = quiet ? ` <b class="num">${quiet}</b> more${esc(where)} ${quiet === 1 ? "doesn't" : "don't"} say who they serve yet.` : "";
  return `<p class="who-line">${lead}${tail}</p>`;
}
