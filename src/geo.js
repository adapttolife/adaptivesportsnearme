// Nearby-origin helpers for /api/programs (zip / city / lat-lng).
// Zip centroids come from the vendored Census ZCTA table (public/assets/data/zcta.json)
// via env.ASSETS — same load path as the geocode lane. City centroids are a small
// built-in table so city=Denver works even when organizations.city is mostly empty.
// Distance is haversine miles (D1 has no acos/pow).

import { normalizeZip } from "./lanes/geocode.js";

export { normalizeZip };

const EARTH_MI = 3958.8;
export const DEFAULT_RADIUS_MI = 100;
export const MAX_RADIUS_MI = 500;

// Major US city centroids. Keys are normalizeCity() output. Enough for the
// directory's "near me" query without a second gazetteer.
export const CITY_CENTROIDS = {
  albuquerque: [35.0844, -106.6504],
  anaheim: [33.8366, -117.9143],
  anchorage: [61.2181, -149.9003],
  arlington: [32.7357, -97.1081],
  atlanta: [33.749, -84.388],
  aurora: [39.7294, -104.8319],
  austin: [30.2672, -97.7431],
  bakersfield: [35.3733, -119.0187],
  baltimore: [39.2904, -76.6122],
  birmingham: [33.5207, -86.8025],
  boise: [43.615, -116.2023],
  boston: [42.3601, -71.0589],
  boulder: [40.015, -105.2705],
  buffalo: [42.8864, -78.8784],
  charlotte: [35.2271, -80.8431],
  chicago: [41.8781, -87.6298],
  cincinnati: [39.1031, -84.512],
  cleveland: [41.4993, -81.6944],
  "colorado springs": [38.8339, -104.8214],
  columbus: [39.9612, -82.9988],
  dallas: [32.7767, -96.797],
  denver: [39.7392, -104.9903],
  "des moines": [41.5868, -93.625],
  detroit: [42.3314, -83.0458],
  durham: [35.994, -78.8986],
  "el paso": [31.7619, -106.485],
  "fort collins": [40.5853, -105.0844],
  "fort worth": [32.7555, -97.3308],
  fresno: [36.7378, -119.7871],
  honolulu: [21.3069, -157.8583],
  houston: [29.7604, -95.3698],
  indianapolis: [39.7684, -86.1581],
  jacksonville: [30.3322, -81.6557],
  "kansas city": [39.0997, -94.5783],
  "las vegas": [36.1699, -115.1398],
  lexington: [38.0406, -84.5037],
  "little rock": [34.7465, -92.2896],
  "long beach": [33.7701, -118.1937],
  "los angeles": [34.0522, -118.2437],
  louisville: [38.2527, -85.7585],
  madison: [43.0731, -89.4012],
  memphis: [35.1495, -90.049],
  mesa: [33.4152, -111.8315],
  miami: [25.7617, -80.1918],
  milwaukee: [43.0389, -87.9065],
  minneapolis: [44.9778, -93.265],
  nashville: [36.1627, -86.7816],
  "new orleans": [29.9511, -90.0715],
  "new york": [40.7128, -74.006],
  oakland: [37.8044, -122.2712],
  "oklahoma city": [35.4676, -97.5164],
  omaha: [41.2565, -95.9345],
  orlando: [28.5383, -81.3792],
  philadelphia: [39.9526, -75.1652],
  phoenix: [33.4484, -112.074],
  pittsburgh: [40.4406, -79.9959],
  portland: [45.5152, -122.6784],
  raleigh: [35.7796, -78.6382],
  richmond: [37.5407, -77.436],
  riverside: [33.9806, -117.3755],
  sacramento: [38.5816, -121.4944],
  "salt lake city": [40.7608, -111.891],
  "san antonio": [29.4241, -98.4936],
  "san diego": [32.7157, -117.1611],
  "san francisco": [37.7749, -122.4194],
  "san jose": [37.3382, -121.8863],
  seattle: [47.6062, -122.3321],
  "st louis": [38.627, -90.1994],
  "st paul": [44.9537, -93.09],
  tampa: [27.9506, -82.4572],
  tucson: [32.2226, -110.9747],
  tulsa: [36.154, -95.9928],
  washington: [38.9072, -77.0369],
  wichita: [37.6872, -97.3301],
};

export function normalizeCity(raw) {
  if (raw == null) return "";
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/,.*$/, "")
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function cityCentroid(raw) {
  const key = normalizeCity(raw);
  return key ? CITY_CENTROIDS[key] || null : null;
}

export function milesBetween(lat1, lng1, lat2, lng2) {
  const toR = (d) => (d * Math.PI) / 180;
  const dLat = toR(lat2 - lat1);
  const dLng = toR(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_MI * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function parseRadius(params, fallback = DEFAULT_RADIUS_MI) {
  const n = parseInt(params.get("radius") || "", 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(MAX_RADIUS_MI, Math.max(1, n));
}

export function parseLatLng(params) {
  const lat = parseFloat(params.get("lat") || "");
  const lng = parseFloat(params.get("lng") || "");
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return [lat, lng];
}

// Resolve a search origin. Priority: explicit lat/lng > zip (ZCTA) > city table.
// Returns { lat, lng, radius, zip?, city? } or null if the caller should not
// apply a nearby filter (no location params, or city falls through to SQL).
export function resolveOrigin(params, zcta) {
  const radius = parseRadius(params);
  const pair = parseLatLng(params);
  if (pair) return { lat: pair[0], lng: pair[1], radius, source: "latlng" };

  const zip = normalizeZip(params.get("zip"));
  if (zip) {
    const coords = zcta && zcta[zip];
    if (!coords) return { missing: "zip", zip, radius };
    return { lat: coords[0], lng: coords[1], radius, zip, source: "zip" };
  }

  const cityRaw = (params.get("city") || "").trim();
  if (cityRaw) {
    const coords = cityCentroid(cityRaw);
    if (!coords) return { missing: "city", city: cityRaw, radius };
    return {
      lat: coords[0],
      lng: coords[1],
      radius,
      city: cityRaw,
      source: "city",
    };
  }

  return null;
}

let zctaCache = null;
export async function loadZcta(assets) {
  if (zctaCache) return zctaCache;
  if (!assets) return null;
  try {
    const res = await assets.fetch(
      "https://assets.local/assets/data/zcta.json",
    );
    if (!res.ok) return null;
    zctaCache = await res.json();
    return zctaCache;
  } catch {
    return null;
  }
}

// Test hook — do not call from production code.
export function _resetZctaCache() {
  zctaCache = null;
}

// City centers for listings. A listing's city is public text, so the center of
// that city is public too; the listing's own lat/lng stays behind
// publicity_consent. The table is the Census places gazetteer the site already
// ships for typed searches (public/data/places.json, "ST|city" -> [lat, lng],
// keys normalized the same way as cityKey below).
let placesCache = null;
export async function loadPlaces(assets) {
  if (placesCache) return placesCache;
  if (!assets) return null;
  try {
    const res = await assets.fetch("https://assets.local/data/places.json");
    if (!res.ok) return null;
    placesCache = await res.json();
    return placesCache;
  } catch {
    return null;
  }
}

// Test hook — do not call from production code.
export function _resetPlacesCache() {
  placesCache = null;
}

const cityKey = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\bsaint\b/g, "st")
    .replace(/\bfort\b/g, "ft")
    .replace(/\s+/g, " ")
    .trim();
const REGION_WORDS =
  /\b(statewide|area|metro|region|regional|county|counties|greater|downtown|suburbs?|and surrounding|surrounding)\b/g;

// "Franklin / Middle Tennessee", TN -> Franklin's center. Tries each place named
// in the text, then each side of a hyphen ("Raleigh-Durham"), then the words after
// a dash label ("Community Connections - Fort Smith"). Never guesses past the table.
export function cityCenter(city, state, places) {
  if (!city || !state || !places) return null;
  const st = String(state).toUpperCase();
  const tokens = String(city)
    .split(/[,/;\u2013\u2014|()&]| and | or /i)
    .map((t) =>
      cityKey(t).replace(REGION_WORDS, "").replace(/\s+/g, " ").trim(),
    )
    .filter((t) => t.length > 1);
  for (const t of tokens) {
    for (const c of [
      t,
      ...t.split(/-| - /).map((x) => x.trim()),
      t.split(" - ").pop(),
    ]) {
      const hit = c && places[st + "|" + c];
      if (hit) return [hit[0], hit[1]];
    }
  }
  return null;
}

export function applyNearby(rows, origin) {
  const out = [];
  for (const r of rows) {
    if (r.lat == null || r.lng == null) continue;
    const dist = milesBetween(origin.lat, origin.lng, r.lat, r.lng);
    if (dist <= origin.radius) out.push({ row: r, dist });
  }
  out.sort(
    (a, b) =>
      a.dist - b.dist ||
      String(a.row.name || "").localeCompare(String(b.row.name || "")),
  );
  return out;
}
