// Prototype data build: geocode listing cities with the Census places
// gazetteer, draw a fitted silhouette per state, and place each listing's dot.
import { readFileSync, writeFileSync } from "fs";
import { feature } from "topojson-client";
import { geoMercator, geoPath, geoCentroid, geoAlbersUsa } from "d3-geo";

const FIPS = {"01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE","11":"DC","12":"FL","13":"GA","15":"HI","16":"ID","17":"IL","18":"IN","19":"IA","20":"KS","21":"KY","22":"LA","23":"ME","24":"MD","25":"MA","26":"MI","27":"MN","28":"MS","29":"MO","30":"MT","31":"NE","32":"NV","33":"NH","34":"NJ","35":"NM","36":"NY","37":"NC","38":"ND","39":"OH","40":"OK","41":"OR","42":"PA","44":"RI","45":"SC","46":"SD","47":"TN","48":"TX","49":"UT","50":"VT","51":"VA","53":"WA","54":"WV","55":"WI","56":"WY"};

// ---- gazetteer: "IL|chicago" -> [lat, lng]
const norm = (s) => String(s || "").toLowerCase().replace(/\./g, "").replace(/\bsaint\b/g, "st").replace(/\bfort\b/g, "ft").replace(/\s+/g, " ").trim();
const SUFFIX = / (city|town|village|cdp|borough|municipality|city and borough|consolidated government|metropolitan government|unified government|urban county|metro government|plantation|comunidad|zona urbana|corporation)( \(balance\))?$/;
const gaz = new Map();
const lines = readFileSync("2023_Gaz_place_national.txt", "utf8").split("\n").slice(1);
for (const line of lines) {
  const c = line.split("\t");
  if (c.length < 12) continue;
  const st = c[0], name = norm(c[3].replace(/\s*\(balance\)\s*$/, "")).replace(SUFFIX, "");
  const land = Number(c[6]) || 0, lat = Number(c[10]), lng = Number(c[11]);
  // Consolidated governments ("Nashville-Davidson", "Augusta-Richmond County",
  // "Louisville/Jefferson County") are known by their first name.
  const names = new Set([name, name.split(/[-/]/)[0].trim()]);
  for (const n of names) {
    const key = st + "|" + n, prev = gaz.get(key);
    if (!prev || land > prev.land) gaz.set(key, { lat, lng, land });
  }
}
function geocode(city, st) {
  if (!city || !st) return null;
  const tokens = String(city).split(/[,/;–—|()&]| and | or /i).map((t) => norm(t)
    .replace(/\b(statewide|area|metro|region|regional|county|counties|greater|downtown|suburbs?|and surrounding|surrounding)\b/g, "").replace(/\s+/g, " ").trim())
    .filter((t) => t.length > 1);
  for (const t of tokens) {
    // Try the token, then each side of a hyphen ("Raleigh-Durham"), then the
    // words after a dash label ("Community Connections - Fort Smith").
    for (const c of [t, ...t.split(/-| - /).map((x) => x.trim()), t.split(" - ").pop()]) {
      const hit = c && gaz.get(st + "|" + c);
      if (hit) return { lat: hit.lat, lng: hit.lng, matched: c };
    }
  }
  return null;
}

// ---- state silhouettes, each fitted to its own 100x100 box
const topo = JSON.parse(readFileSync("node_modules/us-atlas/states-10m.json", "utf8"));
const states = feature(topo, topo.objects.states).features;
const shapes = {}, proj = {};
for (const f of states) {
  const st = FIPS[String(f.id).padStart(2, "0")];
  if (!st) continue;
  // Alaska's Aleutians cross the antimeridian; fit to the mainland so it reads.
  // Alaska's Aleutians cross the antimeridian: rotate the globe so the state
  // sits in one piece before fitting it to the box.
  const p = st === "AK"
    ? geoMercator().rotate([152, 0]).fitExtent([[8, 8], [92, 92]], f)
    : geoMercator().fitExtent([[8, 8], [92, 92]], f);
  const path = geoPath(p).digits(1);
  shapes[st] = path(f);
  proj[st] = p;
}

// ---- listings
const src = JSON.parse(readFileSync("/home/agentos/wt/asnm-design2/public/design/programs.json", "utf8"));
let cityHits = 0, withCity = 0;
for (const p of src.items) {
  if (p.city && p.state) withCity++;
  const g = geocode(p.city, p.state);
  if (g) {
    cityHits++;
    p.lat = Math.round(g.lat * 1e4) / 1e4; p.lng = Math.round(g.lng * 1e4) / 1e4; p.geo = "city";
    const xy = proj[p.state] && proj[p.state]([g.lng, g.lat]);
    if (xy) { p.px = Math.round(xy[0] * 10) / 10; p.py = Math.round(xy[1] * 10) / 10; }
  } else { p.lat = null; p.lng = null; p.geo = p.state ? "state" : null; }
}
writeFileSync("/home/agentos/wt/asnm-design2/public/design/programs.json", JSON.stringify(src));
// State centers for statewide pills on the map, and the US outline for
// nationwide listings.
const centers = {};
for (const f of states) { const st = FIPS[String(f.id).padStart(2, "0")]; if (st) { const c = geoCentroid(f); centers[st] = [Math.round(c[1]*1e3)/1e3, Math.round(c[0]*1e3)/1e3]; } }
const nation = feature(topo, topo.objects.nation);
const np = geoAlbersUsa().fitExtent([[6, 14], [94, 86]], nation);
shapes.US = geoPath(np).digits(1)(nation);
writeFileSync("/home/agentos/wt/asnm-design2/public/design/states.json", JSON.stringify({ shapes, centers }));
// City lookup for typed searches: places over 5 km² (drops tiny CDPs), "ST|name": [lat,lng].
const places = {};
for (const line of lines) {
  const c = line.split("\t"); if (c.length < 12) continue;
  if ((Number(c[6]) || 0) < 5e6 && !/ city$/.test(c[3])) continue;
  const name = norm(c[3].replace(/\s*\(balance\)\s*$/, "")).replace(SUFFIX, "");
  places[c[0] + "|" + name] = [Math.round(Number(c[10]) * 1e3) / 1e3, Math.round(Number(c[11]) * 1e3) / 1e3];
}
writeFileSync("/home/agentos/wt/asnm-design2/public/design/places.json", JSON.stringify(places));
console.log("places in city lookup:", Object.keys(places).length);
console.log(`listings with a city: ${withCity}; placed on the map: ${cityHits} (${Math.round(100 * cityHits / withCity)}%)`);
console.log("states drawn:", Object.keys(shapes).length, "| states.json bytes:", JSON.stringify(shapes).length);
const miss = src.items.filter((p) => p.city && p.state && p.geo !== "city").slice(0, 12).map((p) => `${p.city} (${p.state})`);
console.log("examples not placed:", miss.join(" · "));
