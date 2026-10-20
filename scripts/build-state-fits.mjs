// Adds each state's map fit to public/data/states.json. Every outline there is a
// Mercator projection fitted to a 100 x 100 box, so a city's dot on its state is
//   x = k * lng + x0,  y = y0 - k * ln(tan(pi/4 + lat/2))   (radians; Alaska's
// longitude is rotated by 152 degrees first so the Aleutians stay in one piece).
// Saved per state as [k, x0, y0, rotation]. Run from a folder with d3-geo,
// topojson-client and us-atlas installed (the outlines' own sources):
//   node scripts/build-state-fits.mjs <path to us-atlas/states-10m.json>
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { feature } from "topojson-client";
import { geoMercator } from "d3-geo";

const FIPS = {"01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE","11":"DC","12":"FL","13":"GA","15":"HI","16":"ID","17":"IL","18":"IN","19":"IA","20":"KS","21":"KY","22":"LA","23":"ME","24":"MD","25":"MA","26":"MI","27":"MN","28":"MS","29":"MO","30":"MT","31":"NE","32":"NV","33":"NH","34":"NJ","35":"NM","36":"NY","37":"NC","38":"ND","39":"OH","40":"OK","41":"OR","42":"PA","44":"RI","45":"SC","46":"SD","47":"TN","48":"TX","49":"UT","50":"VT","51":"VA","53":"WA","54":"WV","55":"WI","56":"WY"};
const atlas = process.argv[2];
if (!atlas) { console.error("usage: node scripts/build-state-fits.mjs <us-atlas/states-10m.json>"); process.exit(1); }
const topo = JSON.parse(readFileSync(atlas, "utf8"));
const fits = {};
for (const f of feature(topo, topo.objects.states).features) {
  const st = FIPS[String(f.id).padStart(2, "0")];
  if (!st) continue;
  const p = st === "AK" ? geoMercator().rotate([152, 0]).fitExtent([[8, 8], [92, 92]], f) : geoMercator().fitExtent([[8, 8], [92, 92]], f);
  const [tx, ty] = p.translate();
  fits[st] = [+p.scale().toFixed(4), +tx.toFixed(4), +ty.toFixed(4), st === "AK" ? 152 : 0];
}
const path = fileURLToPath(new URL("../public/data/states.json", import.meta.url));
const s = JSON.parse(readFileSync(path, "utf8"));
s.fits = fits;
writeFileSync(path, JSON.stringify(s));
console.log(Object.keys(fits).length, "state fits written");
