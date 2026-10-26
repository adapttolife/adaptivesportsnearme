/* A listing's sport for the site: the key its picture and sport pages use, and,
   for a multi-sport listing whose description names several sports, up to three
   to draw together. Shared by the Worker (the slim /api/listings rows) and the
   browser, so neither needs the description to know a listing's sport.
   Needs globalThis.ListingArt (public/listing-art.js). */
// Group scenes go last in a trio: they read as the backdrop, not the lead.
const GROUP_SCENE = new Set(["event", "veteran-meetup", "art-therapy", "grant", "multi", "soccer", "football", "lacrosse", "handball", "softball", "volleyball", "triathlon", "nordicskiing"]);

/** { sports, served } from "Sports and activities: ...; Athletes served: ..." */
export function parseDesc(desc) {
  const d = String(desc || "");
  const m1 = /Sports and activities:\s*([\s\S]*?)(?:[.;]\s*Athletes served:|$)/i.exec(d);
  const m2 = /Athletes served:\s*([\s\S]*)$/i.exec(d);
  const sports = m1 && m1[1].trim() ? m1[1].trim().replace(/[.;]\s*$/, "") : null;
  const served = m2 && m2[1].trim() ? m2[1].trim() : null;
  return { sports, served };
}

/** row: { sport (key), sportLabel, name, desc } -> { key, trio, more } (trio only for multi-sport rows naming
    2+ sports; more = how many further sports the row names beyond the three in the trio). */
export function listingSport(row) {
  const L = globalThis.ListingArt;
  const isKey = (k) => k && L.SPORTS.includes(k) && k !== "multi" && k !== "grant" && k !== "event";
  // What the listing already says: its sport, or for a multi-sport row the sports its description names.
  const listed = [];
  const sk = L.symbolKey(row);
  if (isKey(sk)) listed.push(sk);
  else {
    const s = parseDesc(row.desc).sports;
    if (s) for (const part of s.split(/[;,]/)) {
      const k = L.symbolKey({ sportLabel: part.trim() });
      if (isKey(k) && !listed.includes(k)) listed.push(k);
    }
  }
  // The organization's own word (row.seasons, [{ key, seasons }]) adds every sport it says it runs;
  // a sport added this way joins the ones the listing already shows, it never replaces them.
  const all = [...listed];
  for (const s of Array.isArray(row.seasons) ? row.seasons : []) {
    const k = s && String(s.key || "").toLowerCase();
    if (isKey(k) && !all.includes(k)) all.push(k);
  }
  if (all.length === 0) return { key: "multi", trio: null, more: 0 };
  // A listing whose own sport we don't know keeps the multi-sport picture until there are two to
  // draw: one added sport says "they also run pickleball", not "this is a pickleball club".
  // Search still finds it under that sport (row.seasons).
  if (all.length === 1) return listed.length ? { key: all[0], trio: null, more: 0 } : { key: "multi", trio: null, more: 0 };
  const trio = [...all.filter((k) => !GROUP_SCENE.has(k)), ...all.filter((k) => GROUP_SCENE.has(k))].slice(0, 3);
  return { key: "multi", trio, more: all.length - trio.length };
}

/** The words for a multi-sport row that names its sports ("Baseball, basketball, and 5 more"), or
    null when the row has one sport or names none. nameOf: sport key -> display name. */
export function sportsLabel(row, nameOf) {
  const { trio, more } = listingSport(row);
  return trio ? sportsWords(trio.map(nameOf), more) : null;
}

/** The sports a listing offers, in words: ["Baseball", "Basketball", "Track and field"], 4 ->
    "Baseball, basketball, track and field, and 4 more". Names after the first are lowercased;
    the serial comma keeps a name with "and" in it readable. */
export function sportsWords(names, more = 0) {
  const n = names.map((x, i) => (i ? String(x).toLowerCase() : String(x)));
  if (more > 0) n.push(`${more} more`);
  if (n.length <= 1) return n[0] || "";
  if (n.length === 2) return `${n[0]} and ${n[1]}`;
  return `${n.slice(0, -1).join(", ")}, and ${n[n.length - 1]}`;
}
