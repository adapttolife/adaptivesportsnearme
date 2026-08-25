// Region clustering for the national map. Zoomed out, one pill per US Census
// region; zoom past the threshold and it splits into the per-state pills.
//
// Why Census REGIONS (4) and not Census DIVISIONS (9): the division names are
// bureau language. Nobody scanning for Kansas thinks "West North Central", so a
// division pill would make people guess which bucket holds their state, which is
// the one thing clustering must never do. "Midwest", "South", "West" and
// "Northeast" are names people already say. Four pills also fit across a 390px
// phone; nine do not.
//
// public/index.html mirrors this table and these rules inline (same pattern as
// src/map-tray.js). Change one, change the other; the tests check both.

// U.S. Census Bureau regions. Every state plus DC appears exactly once.
export const CENSUS_REGIONS = {
  Northeast: ["CT", "ME", "MA", "NH", "RI", "VT", "NJ", "NY", "PA"],
  Midwest: ["IL", "IN", "MI", "OH", "WI", "IA", "KS", "MN", "MO", "NE", "ND", "SD"],
  South: ["DE", "DC", "FL", "GA", "MD", "NC", "SC", "VA", "WV", "AL", "KY", "MS", "TN", "AR", "LA", "OK", "TX"],
  West: ["AZ", "CO", "ID", "MT", "NV", "NM", "UT", "WY", "AK", "CA", "HI", "OR", "WA"],
};

// Alaska and Hawaii are Census West. They are not drawn as West: their pill sits
// thousands of miles from the rest of the region, so folding their count into a
// chip over Utah would be a lie. They keep their own state pill at every zoom,
// where nothing can collide with them anyway. Territories (PR, GU, VI) are not
// in any Census region at all, so they get the same treatment rather than an
// invented home.
export const OFFSHORE_STATES = ["AK", "HI"];

// Hand-placed so the four pills read as places and clear each other at the zoom
// the phone opens at. Close to each region's bounding-box centre, nudged inland
// so the Northeast chip does not hang off the right edge of a 390px screen.
export const REGION_ANCHOR = {
  Northeast: [-77.5, 42.0],
  Midwest: [-97.5, 43.0],
  South: [-88.0, 32.5],
  West: [-115.0, 41.5],
};

// Below this the country is region pills, at or above it every state gets its
// own pill. Tuned against the two viewports that matter: a 390px phone opens the
// national fit around zoom 2.2 (clustered), a 1440px desktop around zoom 4.1
// (not clustered). A smaller desktop window opens lower and clusters, which is
// correct: the threshold tracks pill density, not device class.
export const CLUSTER_MAX_ZOOM = 4;
// Tapping a region always lands past the threshold, even for a region too big to
// fit, so the state pills are guaranteed to appear.
export const REGION_ZOOM_MARGIN = 0.35;

const REGION_OF = {};
for (const [region, states] of Object.entries(CENSUS_REGIONS)) {
  for (const s of states) REGION_OF[s] = region;
}

export function regionOf(state) {
  return REGION_OF[String(state || "").toUpperCase()] || null;
}

// What a state's pill collapses into when the map is zoomed out. Offshore states
// and anything outside the Census table stand alone.
export function clusterKeyFor(state) {
  const k = String(state || "").toUpperCase();
  if (!k) return "";
  if (OFFSHORE_STATES.includes(k)) return k;
  return REGION_OF[k] || k;
}

export function shouldCluster(zoom, maxZoom = CLUSTER_MAX_ZOOM) {
  return Number(zoom) < maxZoom;
}

// Where to leave the camera after a region pill is tapped. Floored so the state
// pills always appear even for a region too wide to fit, ceilinged so a region
// that happens to hold one state does not slam into the street.
export const REGION_MAX_ZOOM = 6.5;
export function regionZoom(fitZoom, maxZoom = CLUSTER_MAX_ZOOM, margin = REGION_ZOOM_MARGIN) {
  const z = Number(fitZoom);
  const floor = maxZoom + margin;
  if (!Number.isFinite(z)) return floor;
  return Math.min(Math.max(z, floor), REGION_MAX_ZOOM);
}

// counts: { CA: 36, NV: 6, ... } -> one entry per pill drawn at low zoom.
export function groupStatesByRegion(counts) {
  const out = new Map();
  for (const [state, n] of Object.entries(counts || {})) {
    const key = clusterKeyFor(state);
    if (!key) continue;
    if (!out.has(key)) {
      out.set(key, { key, label: key, count: 0, states: [], anchor: REGION_ANCHOR[key] || null });
    }
    const e = out.get(key);
    e.count += Number(n) || 0;
    e.states.push(String(state).toUpperCase());
  }
  for (const e of out.values()) e.states.sort();
  return [...out.values()];
}
