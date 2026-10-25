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
  // The organization's own word comes first (row.seasons, [{ key, seasons }]): every sport it says it runs.
  const told = [];
  for (const s of Array.isArray(row.seasons) ? row.seasons : []) {
    const k = s && String(s.key || "").toLowerCase();
    if (k && L.SPORTS.includes(k) && k !== "multi" && k !== "grant" && k !== "event" && !told.includes(k)) told.push(k);
  }
  if (told.length === 1) return { key: told[0], trio: null, more: 0 };
  if (told.length >= 2) {
    const trio = [...told.filter((k) => !GROUP_SCENE.has(k)), ...told.filter((k) => GROUP_SCENE.has(k))].slice(0, 3);
    return { key: "multi", trio, more: told.length - trio.length };
  }
  const sk = L.symbolKey(row);
  let key = sk && L.SPORTS.includes(sk) && sk !== "grant" && sk !== "event" ? sk : "multi";
  let trio = null, more = 0;
  if (key === "multi") {
    const s = parseDesc(row.desc).sports;
    const ks = [];
    if (s) for (const part of s.split(/[;,]/)) {
      const k = L.symbolKey({ sportLabel: part.trim() });
      if (k && k !== "multi" && !ks.includes(k)) ks.push(k);
    }
    if (ks.length === 1) key = ks[0];
    else if (ks.length >= 2) {
      trio = [...ks.filter((k) => !GROUP_SCENE.has(k)), ...ks.filter((k) => GROUP_SCENE.has(k))].slice(0, 3);
      more = ks.length - trio.length;
    }
  }
  return { key, trio, more };
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
