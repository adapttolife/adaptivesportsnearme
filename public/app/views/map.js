/* Map overlay (spec 6.3, WP-C). app.js calls openMap(ctx, { where, state, sport,
   verifiedOnly }) when query.map === "1" on near or state routes, and closeMap()
   when map=1 leaves the hash. Both are idempotent.
   Honesty rules: one pin per city (listings with no city are never pins; they sit
   in the statewide strip), a city's pin is the mean of its listings' city points,
   and the list stays the keyboard alternative. Dragging is never required.

   PROMOTE: (none; every class is scoped under .v-map, the dialog's own class.) */
import * as A from "../app.js";

const STYLE = "https://tiles.openfreemap.org/styles/positron";
const INK = "#1A1A1A", ORANGE = "#C5430C";
let S = null;        // current open state: { el, map, key, pushed, base, cities, ctx, ... }
let FROM_APP = false; // closeMap() in progress (the hash already lost map=1)
let LIB_P = null;

/* ---------- helpers ---------- */
function stripMap(hash) {
  const i = hash.indexOf("?");
  if (i < 0) return hash;
  const q = new URLSearchParams(hash.slice(i + 1));
  q.delete("map");
  const s = q.toString();
  return hash.slice(0, i) + (s ? "?" + s : "");
}
const hasMap = (hash) => /[?&]map=1(&|$)/.test(hash);
function wasPushed(base) {
  if (window.__asnmMapFrom === base) return true;
  try {
    const n = window.navigation;
    if (n && n.currentEntry && n.currentEntry.index > 0) {
      const prev = n.entries()[n.currentEntry.index - 1];
      if (prev) { const u = new URL(prev.url); if (u.pathname + u.search === base) return true; }
    }
  } catch (_) {}
  return false;
}
function loadLib() {
  if (window.maplibregl) return Promise.resolve(window.maplibregl);
  if (LIB_P) return LIB_P;
  LIB_P = new Promise((ok, no) => {
    if (!document.querySelector('link[href="/assets/vendor/maplibre-gl.css"]')) {
      const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "/assets/vendor/maplibre-gl.css"; document.head.appendChild(l);
    }
    const s = document.createElement("script"); s.src = "/assets/vendor/maplibre-gl.js";
    s.onload = () => (window.maplibregl ? ok(window.maplibregl) : no(new Error("maplibre missing")));
    s.onerror = () => { LIB_P = null; no(new Error("maplibre failed")); };
    document.head.appendChild(s);
  });
  return LIB_P;
}

async function geocodeAddress(address) {
  if (!address) return null;
  try {
    const url = new URL("https://geocoding.geo.census.gov/geocoder/locations/onelineaddress");
    url.searchParams.set("benchmark", "Public_AR_Current");
    url.searchParams.set("format", "json");
    url.searchParams.set("address", address);
    const response = await fetch(url);
    if (!response.ok) return null;
    const match = (await response.json())?.result?.addressMatches?.[0]?.coordinates;
    return Number.isFinite(match?.y) && Number.isFinite(match?.x) ? [match.y, match.x] : null;
  } catch (_) {
    return null;
  }
}

export async function mountLocationMaps(root) {
  const entries = [...root.querySelectorAll("[data-location-map]")];
  const maps = [];
  const lib = await loadLib().catch(() => null);
  if (!lib) {
    for (const el of entries) el.classList.add("is-map-unavailable");
    return () => {};
  }
  for (const el of entries) {
    let lat = Number(el.dataset.lat), lng = Number(el.dataset.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      const point = await geocodeAddress(el.dataset.address || "");
      if (!point) { el.classList.add("is-map-unavailable"); continue; }
      [lat, lng] = point;
    }
    const map = new lib.Map({
      container: el,
      style: STYLE,
      center: [lng, lat],
      zoom: 15,
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      cooperativeGestures: true,
    });
    map.touchZoomRotate.disableRotation();
    map.addControl(new lib.NavigationControl({ showCompass: false }), "top-right");
    map.once("load", () => {
      map.addSource("location", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [lng, lat] } } });
      map.addLayer({ id: "location-ring", type: "circle", source: "location", paint: { "circle-radius": 12, "circle-color": "#C5430C", "circle-stroke-color": "#fff", "circle-stroke-width": 3 } });
    });
    maps.push(map);
  }
  return () => maps.forEach((map) => map.remove());
}
const cityName = (p) => p.cityFirst.replace(/ and more$/, "");
const cityLabel = (c) => `${c.name}, ${c.state}`;

/* Find a heading on the page by its words (works for the near and state views alike). */
function findHeading(ids, test) {
  for (const id of ids) { const el = document.getElementById(id); if (el) return el; }
  const main = document.getElementById("main");
  return main ? [...main.querySelectorAll("h2, h3")].find((h) => test(h.textContent.trim())) || null : null;
}
function jumpToEl(el) {
  if (!el) return;
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  el.focus({ preventScroll: true });
}

/* ---------- data for this map ---------- */
function scope(D, { where, state, sport, verifiedOnly }) {
  let pool = D.items.filter((p) => p.state);
  if (verifiedOnly) pool = pool.filter((p) => p.verified);
  if (sport) pool = pool.filter((p) => p.key === sport);
  let placed, statewide, fitTo;
  if (where && where.coords) {
    const g = A.ladder(where, pool);
    placed = [...g.inCity, ...g.near, ...g.elsewhere];
    statewide = g.statewide;
    fitTo = [...g.inCity, ...g.near];
  } else {
    placed = pool.filter((p) => p.state === state && p.placed);
    statewide = pool.filter((p) => p.state === state && !p.placed);
    fitTo = placed;
  }
  // One point per city: state|city, at the mean of its listings.
  const by = new Map();
  for (const p of placed) {
    const k = p.state + "|" + (p.cityKey || cityName(p).toLowerCase());
    if (!by.has(k)) by.set(k, { id: by.size + 1, k, name: cityName(p), state: p.state, lat: 0, lng: 0, items: [] });
    const c = by.get(k); c.lat += p.lat; c.lng += p.lng; c.items.push(p);
  }
  const byTrust = (a, b) => (b.verified - a.verified) || a.name.localeCompare(b.name);
  for (const c of by.values()) { c.lat /= c.items.length; c.lng /= c.items.length; }
  // Two names for one spot ("Tampa" and "Tampa area") would stack two pins; merge
  // groups under a mile apart in the same state, keeping the bigger group's name.
  const groups = [...by.values()].sort((a, b) => b.items.length - a.items.length || a.name.length - b.name.length);
  const merged = [];
  for (const c of groups) {
    const host = merged.find((m) => m.state === c.state && Math.abs(m.lat - c.lat) < 0.012 && Math.abs(m.lng - c.lng) < 0.015);
    if (host) {
      const n = host.items.length, k = c.items.length;
      host.lat = (host.lat * n + c.lat * k) / (n + k); host.lng = (host.lng * n + c.lng * k) / (n + k);
      host.items.push(...c.items);
    } else merged.push(c);
  }
  by.clear(); merged.forEach((c, i) => { c.id = i + 1; by.set(c.k, c); });
  for (const c of by.values()) {
    c.items.sort(byTrust);
    const keys = new Set(c.items.map((p) => p.key));
    c.key = keys.size === 1 ? [...keys][0] : "";
  }
  return { cities: [...by.values()], statewide, fitTo, pool };
}

/* ---------- the dialog ---------- */
function titleFor({ where, state, sport }) {
  if (where && where.label && where.kind !== "state") return `${sport ? A.sportName(sport) : "Programs"} near ${where.label}`;
  return sport ? `${A.sportName(sport)} in ${A.stateName(state)}` : A.stateName(state);
}

export async function openMap(ctx, opts = {}) {
  const { where = null, sport = "", verifiedOnly = false } = opts;
  const state = (opts.state || (where && where.state) || "").toUpperCase();
  const key = [A.here().split("?")[0], state, sport, verifiedOnly ? 1 : 0].join("|");
  if (S && S.key === key && document.contains(S.el)) return;   // already open for this view
  if (S) closeMap();

  const D = await A.loadData();
  if (!state || !D.shapes[state]) return;
  const sc = scope(D, { where, state, sport, verifiedOnly });
  const title = titleFor({ where, state, sport });
  const base = stripMap(A.here());
  const ST = A.stateName(state);
  const swN = sc.statewide.length;
  const legendYou = where && where.coords ? `<li><i class="mp-k mp-k--you" aria-hidden="true"></i>${A.esc(where.kind === "zip" ? where.zip : where.short)}</li>` : "";

  const html = `<div class="mp-top">
  <button type="button" class="iconbtn mp-x" data-close aria-label="Close">${A.icon("x", 24)}</button>
  <h2 id="mp-h">${A.esc(title)}</h2>
</div>
${swN ? `<div class="mp-strip"><button type="button" class="mp-sw" data-mp-sw aria-label="Across ${A.esc(ST)}, no single city listed: ${swN} ${swN === 1 ? "listing" : "listings"}">${A.stateOutline(state, { size: 32, fill: true })}<span class="mp-swt" aria-hidden="true"><span class="mp-sw-long">Across ${A.esc(ST)}, no single city listed</span><span class="mp-sw-short">No single city listed</span></span><b class="mp-swn num" aria-hidden="true">${swN}</b>${A.icon("chevron-right", 20)}</button></div>` : ""}
<div class="mp-stage">
  <div class="mp-canvas" id="mp-canvas"></div>
  <ul class="mp-legend" aria-hidden="true">${legendYou}<li><i class="mp-k mp-k--pin"></i>A city, with its count</li></ul>
  <p class="mp-status" role="status">Loading the map…</p>
  <div class="mp-card" hidden></div>
  <button type="button" class="mp-list" data-close>${A.icon("list", 20)}<span>List</span></button>
</div>`;

  FROM_APP = false;
  const el = A.showOverlay({ name: "map", cls: "v-map", labelledby: "mp-h", html, scrim: false, onClose });
  S = { el, key, base, pushed: wasPushed(base), cities: sc.cities, sc, where, state, sport, verifiedOnly, map: null, sel: null, afterClose: null, dead: false };
  window.__asnmMapFrom = null;
  el.addEventListener("click", onDialogClick);
  build(S).catch((e) => { console.warn(e); fail(S); });
}

function fail(s) {
  if (!s || s.dead) return;
  const st = s.el.querySelector(".mp-status");
  const stage = s.el.querySelector(".mp-stage");
  stage.classList.add("is-failed");
  st.innerHTML = `<span class="mp-fail-t">The map could not load. Your results are still in the list.</span><button type="button" class="btn btn--ink" data-close>Back to the list</button>`;
  const b = st.querySelector("button"); if (b) b.focus();
}

async function build(s) {
  const lib = await loadLib();
  if (s.dead) return;
  const fc = { type: "FeatureCollection", features: s.cities.map((c) => ({ type: "Feature", id: c.id, properties: { id: c.id, count: c.items.length, key: c.key, label: cityLabel(c) }, geometry: { type: "Point", coordinates: [c.lng, c.lat] } })) };
  const D = await A.loadData();
  const ctr = D.centers[s.state] || [39, -96];
  const map = new lib.Map({
    container: s.el.querySelector("#mp-canvas"), style: STYLE,
    center: [ctr[1], ctr[0]], zoom: 5.5, attributionControl: { compact: true },
    dragRotate: false, pitchWithRotate: false, touchPitch: false, cooperativeGestures: false,
  });
  s.map = map;
  s.el._map = map; // for QA scripts: project a city to a pixel
  map.touchZoomRotate.disableRotation();
  map.addControl(new lib.NavigationControl({ showCompass: false }), "top-right");
  const timer = setTimeout(() => { if (!s.loaded) fail(s); }, 12000);
  map.on("error", (e) => { if (!s.loaded) { console.warn(e && e.error); } });
  await new Promise((ok) => map.once("load", ok));
  clearTimeout(timer);
  if (s.dead) return;
  s.loaded = true;
  s.el.querySelector(".mp-stage").classList.add("is-ready");
  s.el.querySelector(".mp-status").textContent = s.cities.length ? "" : "No organization in this view lists a city yet.";

  const font = ["Noto Sans Bold"];
  if (s.where && s.where.coords) {
    map.addSource("you", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [s.where.coords[1], s.where.coords[0]] } } });
    // "You": an orange ring. Drawn under the pins, so it rings the home city's pin when they meet.
    map.addLayer({ id: "you-ring", type: "circle", source: "you", paint: { "circle-radius": 27, "circle-color": "rgba(197,67,12,.10)", "circle-stroke-color": ORANGE, "circle-stroke-width": 3 } });
    map.addLayer({ id: "you", type: "circle", source: "you", paint: { "circle-radius": 8, "circle-color": "#fff", "circle-stroke-color": ORANGE, "circle-stroke-width": 4 } });
  }
  map.addSource("cities", { type: "geojson", data: fc, cluster: true, clusterMaxZoom: 6, clusterRadius: 44, clusterProperties: { n: ["+", ["get", "count"]] } });
  // Clusters (zoom under 7): ink circles, white count.
  map.addLayer({ id: "cl", type: "circle", source: "cities", filter: ["has", "point_count"], paint: { "circle-color": INK, "circle-radius": ["step", ["get", "n"], 20, 10, 23, 30, 27], "circle-stroke-color": "#fff", "circle-stroke-width": 2 } });
  map.addLayer({ id: "cl-n", type: "symbol", source: "cities", filter: ["has", "point_count"], layout: { "text-field": ["to-string", ["get", "n"]], "text-font": font, "text-size": 15, "text-allow-overlap": true }, paint: { "text-color": "#fff" } });
  // City pins: white circle, 2px ink ring, ink count; 36px and up.
  map.addLayer({ id: "pin", type: "circle", source: "cities", filter: ["!", ["has", "point_count"]], paint: { "circle-color": "#fff", "circle-radius": ["step", ["get", "count"], 18, 10, 20, 30, 23], "circle-stroke-color": INK, "circle-stroke-width": 2 } });
  map.addLayer({ id: "pin-n", type: "symbol", source: "cities", filter: ["!", ["has", "point_count"]], layout: { "text-field": ["to-string", ["get", "count"]], "text-font": font, "text-size": 15, "text-allow-overlap": true }, paint: { "text-color": INK } });
  // Selected: orange fill, white count, 44px, and the city name. Shape and size change, not only colour.
  map.addSource("sel", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  map.addLayer({ id: "sel", type: "circle", source: "sel", paint: { "circle-color": ORANGE, "circle-radius": 22, "circle-stroke-color": "#fff", "circle-stroke-width": 3 } });
  map.addLayer({ id: "sel-n", type: "symbol", source: "sel", layout: { "text-field": ["to-string", ["get", "count"]], "text-font": font, "text-size": 16, "text-allow-overlap": true }, paint: { "text-color": "#fff" } });
  map.addLayer({ id: "sel-l", type: "symbol", source: "sel", layout: { "text-field": ["get", "label"], "text-font": font, "text-size": 16, "text-anchor": "left", "text-offset": [1.9, 0], "text-allow-overlap": true }, paint: { "text-color": INK, "text-halo-color": "#fff", "text-halo-width": 2.5 } });

  map.on("click", "cl", async (e) => {
    const f = e.features[0];
    try { const z = await map.getSource("cities").getClusterExpansionZoom(f.properties.cluster_id); map.easeTo({ center: f.geometry.coordinates, zoom: Math.max(z, 7) }); } catch (_) {}
  });
  map.on("click", "pin", (e) => select(s, Number(e.features[0].properties.id)));
  map.on("click", "sel", () => {});
  map.on("click", (e) => {
    const hit = map.queryRenderedFeatures(e.point, { layers: ["pin", "cl", "sel"] });
    if (!hit.length) select(s, null);
  });
  for (const id of ["cl", "pin"]) {
    map.on("mouseenter", id, () => { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", id, () => { map.getCanvas().style.cursor = ""; });
  }
  fit(s, lib);
}

function fit(s, lib) {
  const map = s.map;
  const pts = [];
  if (s.where && s.where.coords) {
    pts.push([s.where.coords[1], s.where.coords[0]]);
    for (const p of s.sc.fitTo) pts.push([p.lng, p.lat]);
    if (pts.length < 2) {
      // Nothing within 25 miles: show the place and its five nearest cities, so the rest is in view.
      const o = s.where.coords;
      const near = s.cities.map((c) => [c, (c.lat - o[0]) ** 2 + ((c.lng - o[1]) * Math.cos(o[0] * Math.PI / 180)) ** 2]).sort((a, b) => a[1] - b[1]).slice(0, 5);
      for (const [c] of near) pts.push([c.lng, c.lat]);
    }
  } else for (const c of s.cities) pts.push([c.lng, c.lat]);
  const phone = innerWidth < 768;
  // Bottom padding clears the floating List pill (and the credit line under it), so the
  // fitted pins sit above the pill, never under it.
  const pad = { top: 72, bottom: pillClearance(s), left: phone ? 36 : 80, right: phone ? 36 : 80 };
  if (pts.length >= 2) {
    const b = new lib.LngLatBounds(pts[0], pts[0]);
    for (const p of pts) b.extend(p);
    map.fitBounds(b, { padding: pad, maxZoom: s.where && s.where.coords ? (s.sc.fitTo.length ? 10.5 : 11) : 9, duration: 0 });
  } else if (pts.length === 1) {
    map.jumpTo({ center: pts[0], zoom: 9.5 });
    map.panBy([0, (pad.bottom - pad.top) / 2], { duration: 0 });   // the one pin sits above the pill
  }
  // Pins outside the fitted set (elsewhere in the state) can still land under the pill:
  // zoom out a little around the padded center until none does.
  clearPill(s);
}

/* Height from the bottom of the map to the top of the List pill, plus a pin's radius and a margin. */
function pillClearance(s) {
  const stage = s.el.querySelector(".mp-stage"), pill = s.el.querySelector(".mp-list");
  if (!stage || !pill || !pill.offsetParent) return 132;
  return Math.round(stage.getBoundingClientRect().bottom - pill.getBoundingClientRect().top) + 32;
}
function clearPill(s) {
  const map = s.map, pill = s.el.querySelector(".mp-list"), legend = s.el.querySelector(".mp-legend");
  if (!map || !pill || !pill.offsetParent) return;
  const canvas = map.getContainer().getBoundingClientRect();
  // Keep-out boxes in canvas pixels, grown by a pin's radius: the List pill (down to the
  // bottom edge, so the credit line too) and the legend card.
  const grow = (el, toBottom) => { const b = el.getBoundingClientRect(); return [b.left - canvas.left - 24, b.top - canvas.top - 24, b.right - canvas.left + 24, toBottom ? canvas.height : b.bottom - canvas.top + 24]; };
  const pillBox = grow(pill, true), legBox = legend && legend.offsetParent ? grow(legend, false) : null;
  const covered = (box) => {
    if (!box) return false;
    const [l, t, r, b] = box;
    if (map.queryRenderedFeatures([[l, t], [r, b]], { layers: ["pin", "cl"] }).length) return true;
    return s.cities.some((c) => { const p = map.project([c.lng, c.lat]); return p.x > l && p.x < r && p.y > t && p.y < b; });
  };
  // Try the fitted zoom, then up to one level out in quarter steps, around the canvas center
  // (pins near the edges move in). First choice: nothing under the pill or the legend;
  // then nothing under the pill; else keep the fit as it was.
  const z0 = map.getZoom(), center = map.getCenter();
  let pillOnly = null;
  for (let i = 0; i <= 4; i++) {
    const z = z0 - i * 0.25;
    map.jumpTo({ zoom: z, center });
    const underPill = covered(pillBox);
    if (!underPill && !covered(legBox)) return;
    if (!underPill && pillOnly == null) pillOnly = z;
  }
  map.jumpTo({ zoom: pillOnly != null ? pillOnly : z0, center });
}

function select(s, id) {
  const c = id == null ? null : s.cities.find((x) => x.id === id);
  s.sel = c;
  const src = s.map && s.map.getSource("sel");
  if (src) src.setData(c ? { type: "Feature", properties: { count: c.items.length, label: c.name }, geometry: { type: "Point", coordinates: [c.lng, c.lat] } } : { type: "FeatureCollection", features: [] });
  const card = s.el.querySelector(".mp-card");
  if (!c) { card.hidden = true; card.innerHTML = ""; s.el.querySelector(".mp-stage").classList.remove("has-card"); return; }
  const n = c.items.length;
  const ctxRow = { where: s.where && s.where.coords ? s.where : null, single: !!s.sport, sameCity: false };
  card.innerHTML = `<div class="mp-card-h"><h2 id="mp-card-h" tabindex="-1">${A.esc(cityLabel(c))}</h2><button type="button" class="iconbtn" data-mp-unselect aria-label="Close ${A.esc(c.name)}">${A.icon("x", 22)}</button></div>
<p class="mp-card-sub num">${n} ${n === 1 ? "listing" : "listings"} in ${A.esc(c.name)}</p>
<div class="rows">${c.items.slice(0, 3).map((p) => A.programRow(p, ctxRow)).join("")}</div>
<button type="button" class="tlink mp-all" data-mp-all="${c.id}">See all ${n} in ${A.esc(c.name)}${A.icon("arrow-right", 18)}</button>`;
  card.hidden = false;
  s.el.querySelector(".mp-stage").classList.add("has-card");
  const h = card.querySelector("h2"); if (h) h.focus({ preventScroll: true });
  // Some phones leave the canvas blank behind a newly opened card until it repaints.
  if (s.map) requestAnimationFrame(() => { try { s.map.resize(); s.map.triggerRepaint(); } catch (_) {} });
  if (s.map) {
    // Keep the chosen pin in view above the card (phones) or beside it (desktop).
    // Deferred so the tap gesture that chose the pin has finished first.
    const map = s.map;
    setTimeout(() => {
      if (s.dead || s.sel !== c) return;
      const phone = innerWidth < 768;
      const canvas = map.getContainer().getBoundingClientRect();
      const pt = map.project([c.lng, c.lat]);
      const cardBox = card.getBoundingClientRect();
      const safeBottom = phone ? cardBox.top - canvas.top - 40 : canvas.height - 40;
      const safeLeft = phone ? 40 : cardBox.right - canvas.left + 40;
      const inView = pt.y > 60 && pt.y < safeBottom && pt.x > safeLeft && pt.x < canvas.width - 40;
      if (inView) return;
      const tx = phone ? canvas.width / 2 : safeLeft + (canvas.width - safeLeft) / 2;
      const ty = phone ? Math.max(80, safeBottom / 2 + 20) : canvas.height / 2;
      map.panBy([pt.x - tx, pt.y - ty], { duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 300 });
    }, 60);
  }
}

function onDialogClick(e) {
  const s = S; if (!s) return;
  if (e.target.closest("[data-mp-unselect]")) { select(s, null); return; }
  if (e.target.closest("[data-mp-sw]")) {
    const ST = A.stateName(s.state);
    s.afterClose = () => jumpToEl(findHeading(["nr-sw", "statewide"], (t) => t.startsWith(`Across ${ST}`)));
    A.closeOverlay({ restore: false });
    return;
  }
  const all = e.target.closest("[data-mp-all]");
  if (all) {
    const c = s.cities.find((x) => x.id === Number(all.getAttribute("data-mp-all")));
    if (!c) return;
    const home = s.where && s.where.city && c.state === s.where.state && c.name.toLowerCase() === String(s.where.city).toLowerCase();
    const onPage = home ? findHeading(["nr-in"], () => false) : findHeading([], (t) => t === c.name);
    if (onPage) { s.afterClose = () => jumpToEl(home ? findHeading(["nr-in"], () => false) : findHeading([], (t) => t === c.name)); A.closeOverlay({ restore: false }); return; }
    // Another city: open its own results ("In Brandon" first), keeping the filters.
    const q = new URLSearchParams();
    if (s.sport) q.set("s", s.sport);
    if (s.verifiedOnly) q.set("v", "1");
    const target = "/near/" + encodeURIComponent(cityLabel(c)) + (q.toString() ? "?" + q : "");
    s.afterClose = "nav";
    try { history.replaceState(history.state, "", s.base); } catch (_) {}
    A.closeOverlay({ restore: false });
    A.nav(target);
  }
}

/* Runs whenever the dialog closes: Escape, Close, List, closeMap(), or a page change. */
function onClose() {
  const s = S; if (!s) return;
  S = null;
  s.dead = true;
  s.el.removeEventListener("click", onDialogClick);
  try { if (s.map) s.map.remove(); } catch (_) {}
  const after = s.afterClose;
  if (!FROM_APP && after !== "nav" && hasMap(A.here()) && stripMap(A.here()) === s.base) {
    if (s.pushed) history.back();
    else A.nav(s.base, { replace: true });
  }
  if (typeof after === "function") setTimeout(after, 140);
}

export function closeMap() {
  if (!S) return;
  if (!document.contains(S.el)) { const s = S; S = null; s.dead = true; try { if (s.map) s.map.remove(); } catch (_) {} return; }
  FROM_APP = true;
  try { A.closeOverlay(); } finally { FROM_APP = false; }
  if (S) { const s = S; S = null; s.dead = true; try { if (s.map) s.map.remove(); } catch (_) {} }
}
