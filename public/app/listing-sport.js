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

/** row: { sport (key), sportLabel, name, desc } -> { key, trio } (trio only for multi-sport rows naming 2+ sports). */
export function listingSport(row) {
  const L = globalThis.ListingArt;
  const sk = L.symbolKey(row);
  let key = sk && L.SPORTS.includes(sk) && sk !== "grant" && sk !== "event" ? sk : "multi";
  let trio = null;
  if (key === "multi") {
    const s = parseDesc(row.desc).sports;
    const ks = [];
    if (s) for (const part of s.split(/[;,]/)) {
      const k = L.symbolKey({ sportLabel: part.trim() });
      if (k && k !== "multi" && !ks.includes(k)) ks.push(k);
    }
    if (ks.length === 1) key = ks[0];
    else if (ks.length >= 2) trio = [...ks.filter((k) => !GROUP_SCENE.has(k)), ...ks.filter((k) => GROUP_SCENE.has(k))].slice(0, 3);
  }
  return { key, trio };
}
