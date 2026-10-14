/* Clubhouse (Reddit-first) prototype. Real data via Proto.load(); hash routes
   shaped like the real paths they would become (#/sports/tennis -> /sports/tennis).
   Honesty rules: city and state only, distances only from city-level geocoding
   and always "about N mi", a date or "not checked yet" on every listing. */
(() => {
const P = window.Proto, E = P.esc, L = window.ListingArt;
let D = null, SH = {}, CENTERS = {}, PLACES = null, ZCTA = null;
const app = () => document.getElementById("app");

/* ---------- sport names and one-line abouts ---------- */
const NAME = {
  multi: "Multi-sport", tennis: "Tennis", soccer: "Soccer", baseball: "Baseball", equestrian: "Horseback riding",
  basketball: "Basketball", rowing: "Rowing and paddling", sledhockey: "Sled hockey", skiing: "Skiing", swimming: "Swimming",
  golf: "Golf", "equine-therapy": "Equine therapy", cycling: "Cycling", archery: "Archery", sailing: "Sailing",
  blindsports: "Blind sports", trackfield: "Track and field", surfing: "Surfing", fencing: "Fencing", climbing: "Climbing",
  rugby: "Rugby", martialarts: "Martial arts", triathlon: "Triathlon", pickleball: "Pickleball", running: "Running",
  amputeesports: "Amputee sports", waterskiing: "Water skiing", volleyball: "Volleyball", goalball: "Goalball",
  wheelchairracing: "Wheelchair racing", curling: "Curling", boccia: "Boccia", shooting: "Shooting sports",
  nordicskiing: "Nordic skiing", beepbaseball: "Beep baseball", football: "Football", handcycling: "Handcycling",
  equestrianvaulting: "Equestrian vaulting", softball: "Softball", lacrosse: "Lacrosse", handball: "Handball",
  powerlifting: "Powerlifting", dance: "Wheelchair dance", "veteran-meetup": "Veteran meetups", "art-therapy": "Art therapy",
};
const ABOUT = {
  multi: "Programs that offer several sports in one place.", tennis: "Wheelchair and adaptive tennis, from first lessons to tournaments.",
  soccer: "Youth TOPSoccer teams, power soccer and more.", baseball: "Miracle League fields and adaptive baseball.",
  equestrian: "Adaptive and therapeutic horseback riding.", basketball: "Wheelchair basketball teams and clinics.",
  rowing: "Rowing, kayaking and canoeing.", sledhockey: "Ice hockey played on a sled.", skiing: "Sit-skiing, snowboarding and snow sports.",
  swimming: "Swim lessons and aquatics.", golf: "Adaptive golf lessons and leagues.", "equine-therapy": "Time with horses, guided by therapists.",
  cycling: "Handcycles, adaptive bikes and mountain biking.", archery: "Adaptive archery ranges and clubs.", sailing: "Adaptive sailing on lakes and coasts.",
  blindsports: "Sports for blind and low-vision athletes.", trackfield: "Racing, throwing and jumping.", surfing: "Adaptive surfing.",
  fencing: "Wheelchair fencing.", climbing: "Adaptive climbing walls and crags.", rugby: "Wheelchair rugby.", martialarts: "Martial arts and self-defense.",
  triathlon: "Para triathlon training.", pickleball: "Adaptive and wheelchair pickleball.", running: "Running groups and road races.",
  amputeesports: "Sports for amputee athletes.", waterskiing: "Water skiing and tubing.", volleyball: "Sitting volleyball.",
  goalball: "A team ball sport for blind players.", wheelchairracing: "Racing chairs on track and road.", curling: "Wheelchair curling.",
  boccia: "A precision ball sport.", shooting: "Adaptive shooting and hunting.", nordicskiing: "Cross-country sit-skiing.",
  beepbaseball: "Baseball for blind players.", football: "Flag and wheelchair football.", handcycling: "Hand-powered cycling.",
  equestrianvaulting: "Gymnastics on horseback.", softball: "Adaptive softball.", lacrosse: "Adaptive lacrosse.", handball: "Wheelchair handball.",
  powerlifting: "Para powerlifting.", dance: "Wheelchair dance.", "veteran-meetup": "Veterans meeting up to play and move.", "art-therapy": "Making art together.",
};
const nameOf = (k) => NAME[k] || "Multi-sport";

/* ---------- optical sizing (r3 image lab: bbox w, h, g, ink density, x offset) ---------- */
const OPT = {"amputeesports":[0.893,0.855,0.874,0.242,0.019],"archery":[0.795,0.893,0.842,0.276,-0.061],"art-therapy":[0.893,0.816,0.854,0.344,-0.009],"baseball":[0.727,0.893,0.805,0.321,-0.037],"basketball":[0.797,0.893,0.843,0.342,-0.027],"beepbaseball":[0.787,0.891,0.837,0.245,-0.079],"blindsports":[0.893,0.34,0.551,0.307,0.034],"boccia":[0.891,0.686,0.781,0.319,-0.099],"climbing":[0.645,0.893,0.758,0.308,0.005],"curling":[0.893,0.602,0.733,0.305,-0.093],"cycling":[0.893,0.418,0.611,0.34,-0.019],"dance":[0.83,0.893,0.861,0.242,0.007],"equestrian":[0.893,0.73,0.807,0.347,-0.03],"equestrianvaulting":[0.893,0.73,0.807,0.347,-0.03],"equine-therapy":[0.893,0.73,0.807,0.347,-0.03],"event":[0.891,0.77,0.828,0.413,0.034],"fencing":[0.891,0.568,0.711,0.255,-0.156],"football":[0.879,0.895,0.887,0.434,0.011],"goalball":[0.893,0.34,0.551,0.307,0.034],"golf":[0.742,0.891,0.813,0.301,-0.064],"grant":[0.75,0.891,0.817,0.262,-0.064],"handball":[0.84,0.893,0.866,0.317,-0.077],"handcycling":[0.893,0.418,0.611,0.34,-0.019],"lacrosse":[0.834,0.891,0.862,0.319,0.098],"martialarts":[0.891,0.885,0.888,0.35,-0.08],"multi":[0.893,0.738,0.812,0.215,-0.001],"nordicskiing":[0.891,0.697,0.788,0.23,0.015],"pickleball":[0.893,0.781,0.835,0.321,-0.08],"powerlifting":[0.893,0.629,0.749,0.338,0.005],"rowing":[0.891,0.648,0.76,0.303,0.018],"rugby":[0.893,0.691,0.786,0.381,-0.044],"running":[0.855,0.891,0.873,0.259,0.038],"sailing":[0.891,0.895,0.893,0.286,0.061],"shooting":[0.895,0.754,0.821,0.3,-0.12],"skiing":[0.891,0.68,0.778,0.251,0.003],"sledhockey":[0.891,0.562,0.708,0.299,-0.01],"soccer":[0.895,0.684,0.782,0.322,-0.104],"softball":[0.891,0.777,0.832,0.282,0.003],"surfing":[0.893,0.738,0.812,0.215,-0.001],"swimming":[0.891,0.441,0.627,0.351,0.038],"tennis":[0.895,0.871,0.883,0.259,-0.098],"trackfield":[0.891,0.547,0.698,0.279,-0.09],"triathlon":[0.891,0.555,0.703,0.302,0.015],"veteran-meetup":[0.893,0.547,0.699,0.451,0.008],"volleyball":[0.893,0.719,0.801,0.301,0.059],"waterskiing":[0.891,0.566,0.71,0.254,-0.076],"wheelchairracing":[0.891,0.547,0.698,0.279,-0.09]};
const FLOOR_PROP = new Set(["soccer", "sledhockey", "golf", "boccia", "curling", "goalball", "blindsports"]);
const dk = (d) => Math.min(1.04, Math.max(0.9, Math.pow(0.31 / d, 0.3)));
const srcOf = (k) => k === "grant" ? L.GRANT_ART : k === "event" ? L.EVENT_ART : L.symbolSrc(k);
function fig(k) {
  const o = OPT[k] || OPT.multi;
  return `<i class="fig" aria-hidden="true" style="--src:url('${srcOf(k)}');--w:${o[0]};--h:${o[1]};--g:${o[2]};--dk:${dk(o[3]).toFixed(3)};--dx:${Math.max(-0.12, Math.min(0.12, o[4])).toFixed(3)}"></i>`;
}
const toneOf = (k) => k === "grant" ? "t-grant" : k === "event" ? "t-event" : "t-" + ((k && k !== "multi" && L.FAMILY[k]) || "house");
const plate = (k, cls = "", inner) => `<div class="plate ${toneOf(k)} ${cls}">${inner || fig(k)}</div>`;
const avatar = (k, cls = "") => `<span class="plate av ${toneOf(k)} ${cls}">${fig(k)}</span>`;

/* A multi-sport program that names its sports gets them drawn (up to three). */
function sportsNamed(p) {
  const m = /Sports and activities:\s*([^.]*)/i.exec(p.desc || "");
  if (!m) return { keys: [], all: false };
  const segs = m[1].split(/[;,]/).map((s) => s.trim()).filter(Boolean);
  const keys = segs.map((s) => L.symbolKey({ sportLabel: s }));
  const uniq = [...new Set(keys.filter((k) => k && k !== "multi"))];
  return { keys: uniq, all: keys.every((k) => k && k !== "multi") };
}
function art(p, cls = "") {
  if (p.k === "multi" && p.trio && p.trio.length >= 2) {
    const t = p.trio.slice(0, 3);
    return `<div class="plate t-house ${cls}"><div class="trio ${t.length === 2 ? "two" : ""}">${t.map((k) => `<div class="cell">${fig(k)}</div>`).join("")}</div></div>`;
  }
  return plate(p.k, cls);
}

/* ---------- honest geography ---------- */
const R = 3958.8, rad = (d) => d * Math.PI / 180;
function miles(a, b) { const dLat = rad(b[0] - a[0]), dLng = rad(b[1] - a[1]); const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }
const normName = (s) => String(s || "").toLowerCase().replace(/\./g, "").replace(/\bsaint\b/g, "st").replace(/\bfort\b/g, "ft").replace(/\s+/g, " ").trim();
const about = (d) => `about ${Math.max(1, Math.round(d))} mi`;
/* Placed = a real city we could find on the map. Rows whose city says
   "statewide", or that were only ever a state centroid, are not placed. */
const isPlaced = (p) => p.lat != null && p.geo === "city" && p.geoPrecision !== "state" && !/statewide/i.test(p.city || "");
const goodUrl = (u) => /^https?:\/\//i.test(String(u || "")) ? u : null;
const stName = (st) => P.STATE_NAMES[st] || st;
function placeText(p) {
  if (p.placeAs) return p.placeAs;
  const c = P.cleanCity(p.city);
  if (c && p.state) return `${c}, ${p.state}`;
  if (p.state) return `${stName(p.state)}, city not listed`;
  return "Location not listed";
}
const shortPlace = (p) => P.cleanCity(p.city) ? `${P.cleanCity(p.city)}, ${p.state}` : p.state ? stName(p.state) : "Location not listed";

async function loadPlaces() { PLACES = PLACES || await fetch("/design/places.json").then((r) => r.json()); return PLACES; }
async function loadZcta() { ZCTA = ZCTA || await fetch("/design/zcta.json").then((r) => r.json()); return ZCTA; }
async function locate(q) {
  const where = P.parsePlace(q, D.items);
  if (!where) return null;
  where.q = q;
  const zip = String(q).trim().match(/^\d{5}/);
  if (zip) { const z = await loadZcta(); if (z[zip[0]]) where.coords = z[zip[0]]; where.zip = zip[0]; where.label = "ZIP " + zip[0]; }
  else if (where.city) { const pl = await loadPlaces(); const c = pl[where.state + "|" + normName(where.city)]; if (c) where.coords = c; }
  return where;
}
/* Near: in your city, then about 25 miles, then the rest of your state, then
   programs in your state with no city on file. Nothing is ever dropped. */
function ladder(where, pool) {
  const st = where.state;
  const cityRe = where.city ? new RegExp("\\b" + where.city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i") : null;
  const withD = (p) => isPlaced(p) && where.coords ? { ...p, dist: miles(where.coords, [p.lat, p.lng]) } : { ...p, dist: null };
  const all = pool.map(withD);
  const inCity = cityRe ? all.filter((p) => p.state === st && cityRe.test(p.city || "")) : [];
  const taken = new Set(inCity.map((p) => p.id));
  const near = all.filter((p) => !taken.has(p.id) && p.dist != null && Math.round(p.dist) <= 25).sort((a, b) => a.dist - b.dist);
  near.forEach((p) => taken.add(p.id));
  const state = all.filter((p) => !taken.has(p.id) && p.state === st && isPlaced(p)).sort((a, b) => (a.dist ?? 1e9) - (b.dist ?? 1e9) || P.byTrust(a, b));
  state.forEach((p) => taken.add(p.id));
  const across = all.filter((p) => !taken.has(p.id) && p.state === st).sort(P.byTrust);
  inCity.forEach((p) => { p.dist = null; if (!cityRe.test(P.cleanCity(p.city) || "")) p.placeAs = `${where.city} and other cities, ${st}`; }); inCity.sort(P.byTrust);
  return { inCity, near, state, across, total: inCity.length + near.length + state.length + across.length };
}

/* ---------- small parts ---------- */
const ICON = {
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>',
  checkL: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>',
  clock: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  search: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  pin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  share: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v13M7 8l5-5 5 5M5 14v6h14v-6"/></svg>',
  ext: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  home: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
  map: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/></svg>',
  plus: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  book: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/></svg>',
  mail: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  shield: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  pen: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
};
const dateOf = (p) => L.shortDate(p.lastChecked);
function trustBits(p, short = false) {
  const d = dateOf(p);
  const head = p.verified ? `<span class="ok">${ICON.check}Verified</span>` : `<span class="nv">Not yet verified</span>`;
  const when = d ? (short ? `checked ${d.replace(/, \d{4}$/, "")}` : `last checked ${d}`) : p.verified ? "no check date on file yet" : "not checked yet";
  return `${head}<span>· ${when}</span>`;
}
function row(p, hide = false) {
  const dist = p.dist != null ? `<span class="dist">${about(p.dist)}</span><span class="dot">·</span>` : "";
  return `<a class="row${hide ? " hide" : ""}" href="#/programs/${p.id}">${art(p)}<div><div class="rn">${E(p.name)}</div><div class="rm">${dist}${E(nameOf(p.k))}<span class="dot">·</span>${E(placeText(p))}</div><div class="rt">${trustBits(p, true)}</div></div></a>`;
}
function card(p) {
  const dist = p.dist != null ? `${about(p.dist)} · ` : "";
  return `<a class="card" href="#/programs/${p.id}"><div style="position:relative">${art(p)}${p.verified ? `<span class="vpill">${ICON.check}Verified</span>` : ""}</div><div class="nm">${E(p.name)}</div><div class="mt">${E(nameOf(p.k))} · ${E(shortPlace(p))}</div><div class="tr">${dist}${dateOf(p) ? "Checked " + dateOf(p) : p.verified ? "No check date on file yet" : "Not yet verified, not checked yet"}</div></a>`;
}
let feedN = 0;
function feed(list, show = 6) {
  if (!list.length) return "";
  const id = "f" + (++feedN);
  return `<div class="feed" id="${id}">${list.map((p, i) => row(p, i >= show)).join("")}</div>${list.length > show ? `<button class="btn ghost morebtn" data-more="${id}">Show all ${list.length}</button>` : ""}`;
}
const gname = (s) => String(s || "").replace(/\s+[—–]\s+/g, ": ");
const TODAY = new Date();
function pastDeadline(g) { if (!/\b20\d\d\b/.test(g.deadline || "") || /\/|·/.test(g.deadline)) return false; const t = Date.parse(g.deadline); return Number.isFinite(t) && t < TODAY.getTime() - 864e5; }
const deadlineText = (g) => !g.deadline ? null : pastDeadline(g) ? "Last deadline was " + g.deadline : g.deadline;
const realAmt = (g) => g.amount && !/^varies$/i.test(g.amount) ? g.amount : null;
function grantRow(g, hide = false) {
  const bits = [realAmt(g) ? `<span class="amt">${E(realAmt(g))}</span>` : null, deadlineText(g) ? E(deadlineText(g)) : null].filter(Boolean).join('<span class="dot">·</span>');
  return `<a class="row${hide ? " hide" : ""}" href="#/grants/${g.id}">${plate("grant")}<div><div class="rn">${E(gname(g.name))}</div><div class="rm">From ${E(g.source || "the organization")}</div><div class="rt"><span class="gtag t-grant">${g.audience === "program" ? "For programs" : "For athletes"}</span>${bits ? `<span>${bits}</span>` : ""}${g.open ? "" : '<span class="nv">Closed for now</span>'}</div></div></a>`;
}
function grantCard(g) {
  return `<a class="card gcard" href="#/grants/${g.id}"><div style="position:relative">${plate("grant")}<span class="vpill" style="color:var(--ink)">${g.audience === "program" ? "For programs" : "For athletes"}</span>${realAmt(g) ? `<span class="amtbig">${E(realAmt(g))}</span>` : ""}</div><div class="nm">${E(gname(g.name))}</div><div class="mt">From ${E(g.source || "")}</div><div class="tr">${E(deadlineText(g) || "Deadline: see their site")}</div></a>`;
}
function stateSvg(st, dots = []) {
  const d = SH[st]; if (!d) return "";
  return `<svg viewBox="0 0 100 100" aria-hidden="true" preserveAspectRatio="xMidYMid meet"><path d="${d}"/>${dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6"/>`).join("")}</svg>`;
}
const letterBand = (title = "Get the letter", text = "New programs, grants and events near you, when there is something worth sending. No spam, unsubscribe any time.") => `
  <section class="letter" id="letter" aria-labelledby="letterH"><span class="deco plate" style="background:none">${fig("multi")}</span>
   <h2 id="letterH">${E(title)}</h2><p>${E(text)}</p>
   <form data-letter><label class="sr" for="em${feedN}">Email</label><input id="em${feedN}" type="email" required placeholder="you@example.com" autocomplete="email"><input class="hp" name="company" tabindex="-1" autocomplete="off" aria-hidden="true"><button class="btn" type="submit">Subscribe</button></form></section>`;
const helpBand = () => `<section class="help" aria-labelledby="helpH"><h2 id="helpH">Help build this</h2><p>This directory is new and still growing. Know a program, a grant or an event we are missing? A person reads every note.</p>
  <div class="btns"><a class="btn dark" href="#/add/program">Add a program</a><a class="btn" href="#/add/event">Add an event</a></div></section>`;
function sideBox() {
  return `<aside class="side"><div class="box"><h2>About Adaptive Sports Near Me</h2><p>A free directory of adaptive sports programs, grants and events. Every listing says whether a person has checked it, and when.</p><div style="margin-top:12px"><a class="link" href="#/about">How we check listings</a></div></div>
   <div class="box"><h2>Help build this</h2><p>Know a program we are missing? Add it, and a person checks it before it goes up.</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><a class="btn dark pill" href="#/add/program">Add a program</a><a class="btn pill ghost" href="#/add/event">Add an event</a></div></div></aside>`;
}
const page = (inner, side = true) => `<div class="page${side ? " has-side" : ""}"><div class="pmain">${inner}</div>${side ? sideBox() : ""}</div>`;

/* ---------- stored place and recently viewed sports (on this phone only) ---------- */
const store = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (_) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} } };
function remember(k) { if (!k || k === "multi" && false) return; const r = store.get("asnm.recent", []).filter((x) => x !== k); r.unshift(k); store.set("asnm.recent", r.slice(0, 3)); }

/* ---------- views ---------- */
async function home() {
  const counts = D.counts;
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 11);
  const saved = store.get("asnm.place", null);
  let nearHtml;
  if (saved) {
    const w = await locate(saved);
    if (w) {
      const g = ladder(w, D.items);
      const first = [...g.inCity, ...g.near].slice(0, 5);
      const list = first.length ? first : [...g.state, ...g.across].slice(0, 5);
      nearHtml = `<div class="sechead"><h2>Near ${E(w.label)}</h2><a class="link" href="#/near/${encodeURIComponent(saved)}">See all ${g.total}</a></div>
        <p>${first.length ? `${g.inCity.length + g.near.length} in ${w.city ? E(w.city) : "your area"} or within about 25 miles.` : `Nothing within about 25 miles yet. Here is what we have in ${E(stName(w.state))}.`}</p>${feed(list, 5)}`;
    }
  }
  if (!nearHtml) {
    nearHtml = `<div class="sechead"><h2>Near you</h2></div><div class="prompt"><p>Tell us where you play and we will show what is close, starting with your city.</p>
      <div class="locrow"><button class="btn dark pill" data-loc>${ICON.pin}Use my location</button><button class="btn pill ghost" data-search>Type a city or ZIP</button></div></div>`;
  }
  const open = D.grants.filter((g) => g.open && !pastDeadline(g));
  const pick = [...open.filter((g) => realAmt(g)), ...open.filter((g) => !realAmt(g))].slice(0, 8);
  return page(`
  <section class="hero"><span class="kick">Free. No account needed.</span>
    <h1>Find your place in <em>adaptive sports.</em></h1>
    <p class="sub">Programs, grants and events for athletes with disabilities, shown by sport and by place.</p>
    <button class="spill" data-search aria-label="Search by place and sport">${ICON.search}<span style="flex:1;min-width:0"><b>Where do you want to play?</b><span>City, state or ZIP · any sport</span></span><span class="go" aria-hidden="true">${ICON.search}</span></button>
  </section>
  <section class="sec" aria-labelledby="sportsH"><div class="sechead"><h2 id="sportsH">Pick a sport</h2><a class="link" href="#/sports">All sports</a></div>
    <div class="comms">${top.map(([k, n]) => `<a class="comm" href="#/sports/${k}">${avatar(k)}<b>${E(nameOf(k))}</b><small>${n} listed</small></a>`).join("")}
      <a class="comm all" href="#/sports"><span class="av">All</span><b>All sports</b><small>${Object.keys(counts).length} so far</small></a></div></section>
  <section class="sec" aria-label="Near you">${nearHtml}</section>
  <section class="sec" aria-labelledby="grH"><div class="sechead"><h2 id="grH">Grants open now</h2><a class="link" href="#/grants">See all</a></div><p>Money for equipment, training and travel, from the groups that run them.</p>
    <div class="hrail">${pick.map(grantCard).join("")}</div></section>
  <section class="sec" aria-labelledby="stH"><div class="sechead"><h2 id="stH">Pick your state</h2><a class="link" href="#/states">List of states</a></div><p>Darker squares have more listings so far. Every state is still growing.</p>${tileMap()}</section>
  <section class="sec" aria-labelledby="evH"><div class="sechead"><h2 id="evH">Events</h2><a class="link" href="#/events">See events</a></div>
    <a class="row" href="#/events" style="border-top:1px solid var(--line);margin-top:10px">${plate("event")}<div><div class="rn">No events listed yet</div><div class="rm">Know a clinic, tryout or game day? Add it and we will check it.</div><div class="rt"><span class="link" style="min-height:0">Add an event</span></div></div></a></section>
  ${letterBand()}${helpBand()}`);
}

function tileMap() {
  const GRID = {ME:[10,0],WI:[5,1],VT:[9,1],NH:[10,1],WA:[0,2],ID:[1,2],MT:[2,2],ND:[3,2],MN:[4,2],IL:[5,2],MI:[6,2],NY:[8,2],MA:[9,2],OR:[0,3],NV:[1,3],WY:[2,3],SD:[3,3],IA:[4,3],IN:[5,3],OH:[6,3],PA:[7,3],NJ:[8,3],CT:[9,3],RI:[10,3],CA:[0,4],UT:[1,4],CO:[2,4],NE:[3,4],MO:[4,4],KY:[5,4],WV:[6,4],VA:[7,4],MD:[8,4],DE:[9,4],AZ:[1,5],NM:[2,5],KS:[3,5],AR:[4,5],TN:[5,5],NC:[6,5],SC:[7,5],DC:[8,5],OK:[3,6],LA:[4,6],MS:[5,6],AL:[6,6],GA:[7,6],HI:[0,7],AK:[1,7],TX:[3,7],FL:[8,7]};
  const b = (n) => n >= 90 ? 5 : n >= 55 ? 4 : n >= 25 ? 3 : n >= 10 ? 2 : n >= 1 ? 1 : 0;
  return `<div class="tiles">${Object.entries(GRID).map(([st, [c, r]]) => { const n = (D.byState[st] || []).length; return `<a class="tile b${b(n)}" style="grid-column:${c + 1};grid-row:${r + 1}" href="#/states/${st}" aria-label="${E(stName(st))}, ${n} listed">${st}<small>${n}</small></a>`; }).join("")}</div>
   <div class="tilekey" aria-hidden="true">Fewer <i class="tile b1"></i><i class="tile b2"></i><i class="tile b3"></i><i class="tile b4"></i><i class="tile b5"></i> More</div>`;
}

async function results(placeQ, q) {
  const fam = q.s || "", vOnly = q.v === "1";
  const w = await locate(placeQ);
  if (!w) return page(`<div class="rhead"><h1>We could not find that place</h1><p class="sub" style="margin-top:6px">Enter a city, state, or ZIP code. For example: Tampa, FL or 60614.</p><div style="margin-top:14px"><button class="btn dark" data-search>Search again</button></div></div>`);
  if (!w.city && !w.zip) { location.replace("#/states/" + w.state + (fam ? "?s=" + fam : "")); return ""; }
  store.set("asnm.place", placeQ);
  const base = D.items.filter((p) => !vOnly || p.verified);
  const gAll = ladder(w, base);
  const pool = base.filter((p) => !fam || p.k === fam);
  const g = ladder(w, pool);
  const st = stName(w.state), here = w.city || "your area";
  // sport chips: what exists around this place
  const sc = {}; for (const p of [...gAll.inCity, ...gAll.near, ...gAll.state, ...gAll.across]) sc[p.k] = (sc[p.k] || 0) + 1;
  const link = (o) => { const u = new URLSearchParams(); const s = "s" in o ? o.s : fam, v = "v" in o ? o.v : (vOnly ? "1" : ""); if (s) u.set("s", s); if (v) u.set("v", v); const t = u.toString(); return "#/near/" + encodeURIComponent(placeQ) + (t ? "?" + t : ""); };
  const chips = `<div class="chiprow wrap" role="list"><a role="listitem" class="chip${vOnly ? " on" : ""}" href="${link({ v: vOnly ? "" : "1" })}" aria-pressed="${vOnly}">${ICON.check}Verified only</a><a role="listitem" class="chip${fam ? "" : " on"}" href="${link({ s: "" })}">Any sport <span class="n">${gAll.total}</span></a>${Object.entries(sc).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<a role="listitem" class="chip${k === fam ? " on" : ""}" href="${link({ s: k })}">${E(nameOf(k))} <span class="n">${n}</span></a>`).join("")}</div>`;
  const title = `${fam ? E(nameOf(fam)) + " near " : "Near "}${E(w.label)}`;
  const steps = [
    w.city ? [`In ${here}`, g.inCity.length, "g-city"] : null,
    ["Within about 25 mi", g.near.length, "g-near"],
    [`Elsewhere in ${st}`, g.state.length, "g-state"],
    [`${st}, no city`, g.across.length, "g-across"],
  ].filter((x) => x && x[1] > 0);
  const head = `<button class="placebar" data-search>${ICON.pin}<span style="min-width:0"><b>${E(w.label)}</b><span>${fam ? E(nameOf(fam)) : "Any sport"}${vOnly ? " · verified only" : ""}</span></span><span class="ed">Change</span></button>
   <div class="rhead"><h1>${title}</h1><div class="ladder">${steps.map(([t, n, id]) => `<a href="#${id}" data-jump="${id}">${E(t)} <b>${n}</b></a>`).join("")}</div></div>${chips}`;
  let body = "";
  if (w.city) body += g.inCity.length ? `<div class="ghead" id="g-city"><h2>In ${E(here)}</h2><span class="n">${g.inCity.length}</span></div>${feed(g.inCity, 8)}` : "";
  body += g.near.length ? `<div class="ghead" id="g-near"><h2>Within about 25 miles</h2><span class="n">${g.near.length}</span></div><p class="gnote">Measured from the city each program lists.</p>${feed(g.near, 6)}` : "";
  if (!g.inCity.length && !g.near.length) body += `<div class="empty" id="g-near"><h2>Nothing within about 25 miles yet</h2><p>${g.state.length + g.across.length ? `Here is everything we have in ${E(st)}. ` : ""}If you know a program near ${E(here)}, add it and a person will check it.</p><div class="btns"><a class="btn dark" href="#/add/program">Add a program</a></div></div>`;
  body += g.state.length ? `<div class="ghead" id="g-state"><h2>Elsewhere in ${E(st)}</h2><span class="n">${g.state.length}</span></div><p class="gnote">Closest first.</p>${feed(g.state, 4)}` : "";
  body += g.across.length ? `<div class="ghead" id="g-across"><h2>In ${E(st)}, no city on file</h2><span class="n">${g.across.length}</span></div><p class="gnote">These programs have not told us a city yet. Check the website for where they meet.</p>${feed(g.across, 4)}` : "";
  if (!g.total) {
    const other = D.items.filter((p) => p.k === fam && p.verified).slice(0, 6);
    body = `<div class="empty"><span class="plate av ${toneOf(fam)}" style="width:96px;height:96px;display:grid">${fig(fam || "multi")}</span><h2>No ${fam ? E(nameOf(fam).toLowerCase()) : ""} programs in ${E(st)} yet</h2><p>This directory is new and still growing. ${other.length ? "Here are some in other states, or" : "You can"} help us build it.</p><div class="btns"><a class="btn dark" href="#/add/program">Add a program</a><a class="btn" href="${link({ s: "" })}">Any sport near ${E(here)}</a></div></div>${other.length ? `<div class="ghead"><h2>${E(nameOf(fam))} in other states</h2></div>${feed(other, 6)}` : ""}`;
  }
  return page(`${head}<div class="wrap">${body}</div>${letterBand(`Get the letter for ${w.city || st}`, "We email when new programs, grants or events show up. No spam, unsubscribe any time.")}`);
}

function sportPage(k, q) {
  const tab = q.t || "programs";
  const all = D.items.filter((p) => p.k === k);
  const ver = all.filter((p) => p.verified).length;
  const byS = {}; for (const p of all) if (p.state) byS[p.state] = (byS[p.state] || 0) + 1;
  const topS = Object.entries(byS).sort((a, b) => b[1] - a[1]);
  remember(k);
  const st = q.st || "";
  const list = all.filter((p) => !st || p.state === st).sort((a, b) => P.byTrust(a, b) || (a.state || "zz").localeCompare(b.state || "zz"));
  const tabs = `<nav class="tabs" aria-label="${E(nameOf(k))} sections"><a class="tab${tab === "programs" ? " on" : ""}" href="#/sports/${k}">Programs<span class="n">${all.length}</span></a><a class="tab${tab === "grants" ? " on" : ""}" href="#/sports/${k}?t=grants">Grants<span class="n">${D.grants.length}</span></a><a class="tab${tab === "events" ? " on" : ""}" href="#/sports/${k}?t=events">Events<span class="n">0</span></a></nav>`;
  const where = topS.slice(0, 3).map(([s]) => stName(s));
  const saved = store.get("asnm.place", null);
  let body = "";
  if (tab === "programs") {
    body = `<div class="chiprow wrap"><button class="chip" data-search data-sport-pre="${k}">${ICON.pin}${saved ? "Near " + E(saved) : "Near me"}</button><a class="chip${st ? "" : " on"}" href="#/sports/${k}">All states <span class="n">${all.length}</span></a>${topS.map(([s, n]) => `<a class="chip${s === st ? " on" : ""}" href="#/sports/${k}?st=${s}">${E(stName(s))} <span class="n">${n}</span></a>`).join("")}</div>
      <div class="wrap">${list.length ? `<div class="ghead"><h2>${st ? "In " + E(stName(st)) : "Verified first"}</h2><span class="n">${list.length}</span></div>${feed(list, 12)}` : `<div class="empty"><span class="plate av ${toneOf(k)}" style="width:96px;height:96px;display:grid">${fig(k)}</span><h2>No ${E(nameOf(k).toLowerCase())} programs listed yet</h2><p>This directory is new and still growing. Know one? Add it and a person will check it before it goes up.</p><div class="btns"><a class="btn dark" href="#/add/program">Add a program</a><a class="btn" href="#/sports">Explore other sports</a></div></div>`}</div>`;
  } else if (tab === "grants") {
    body = `<div class="wrap"><p class="gnote" style="margin-top:16px">Most grants cover any adaptive sport, including ${E(nameOf(k).toLowerCase())}.</p>${grantsFeed(q.a || "", `#/sports/${k}?t=grants`)}</div>`;
  } else {
    body = `<div class="wrap">${eventsEmpty(k)}</div>`;
  }
  return page(`<div class="${toneOf(k)}"><div class="banner" role="img" aria-label=""><span class="bigfig ghost" style="--src:url('${srcOf(k)}')"></span><span class="bigfig${FLOOR_PROP.has(k) ? " floor" : ""}" style="--src:url('${srcOf(k)}')"></span></div>
    <div class="chead"><div class="ctitle">${avatar(k)}<div class="acts"><button class="btn pill dark" data-jumpletter>Get the letter</button><button class="iconbtn" data-share aria-label="Share this page" style="border:1px solid var(--line2)">${ICON.share}</button></div></div>
      <h1>${E(nameOf(k))}</h1><p class="about">${E(ABOUT[k] || "")}</p>
      <div class="facts">${all.length ? `<span><b>${all.length}</b> listed so far</span><span><b>${ver}</b> checked by a person</span>${where.length ? `<span>Most in ${E(where.join(", "))}</span>` : ""}` : "<span>None listed yet</span>"}</div></div></div>
    ${tabs}${body}${letterBand(`Get the letter`, `We email when new ${nameOf(k).toLowerCase()} programs, grants or events show up near you.`)}`);
}

function sportsIndex() {
  const live = Object.entries(D.counts).sort((a, b) => b[1] - a[1]);
  const none = Object.keys(NAME).filter((k) => !D.counts[k]);
  return page(`<div class="rhead"><h1>All sports</h1><p class="sub" style="margin-top:6px">Every sport is its own page, with its programs, grants and events.</p></div>
   <section class="sec" style="padding-top:8px"><div class="comms">${live.map(([k, n]) => `<a class="comm" href="#/sports/${k}">${avatar(k)}<b>${E(nameOf(k))}</b><small>${n} listed</small></a>`).join("")}</div></section>
   <section class="sec"><div class="sechead"><h2>Not listed yet</h2></div><p>Know a program for one of these? Add it and it will be the first.</p><div class="comms">${none.map((k) => `<a class="comm" href="#/sports/${k}">${avatar(k)}<b>${E(nameOf(k))}</b><small>Add the first</small></a>`).join("")}</div></section>
   ${helpBand()}`);
}

function statePage(st, q) {
  if (!P.STATE_NAMES[st]) return page(`<div class="rhead"><h1>State not found</h1></div>`);
  const all = D.byState[st] || [];
  const fam = q.s || "";
  const list = all.filter((p) => !fam || p.k === fam);
  const counts = {}; for (const p of all) counts[p.k] = (counts[p.k] || 0) + 1;
  const placed = list.filter(isPlaced), rest = list.filter((p) => !isPlaced(p));
  const byCity = {}; for (const p of placed) { const c = P.cleanCity(p.city); (byCity[c] = byCity[c] || []).push(p); }
  const cities = Object.entries(byCity).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  const dots = all.filter((p) => isPlaced(p) && p.px != null).map((p) => [p.px, p.py]);
  const ver = all.filter((p) => p.verified).length;
  const big = cities.filter(([, l]) => l.length >= 2);
  const singles = cities.filter(([, l]) => l.length < 2).flatMap(([, l]) => l).sort(P.byTrust);
  return page(`<div class="banner state" aria-hidden="true">${stateSvg(st, dots)}</div>
   <div class="chead"><div class="ctitle"><span class="plate av st">${stateSvg(st)}</span><div class="acts"><button class="btn pill dark" data-jumpletter>Get the letter</button><button class="iconbtn" data-share aria-label="Share this page" style="border:1px solid var(--line2)">${ICON.share}</button></div></div>
    <h1>${E(stName(st))}</h1><p class="about">Adaptive sports programs across ${E(stName(st))}. Orange dots are the cities on file.</p>
    <div class="facts">${all.length ? `<span><b>${all.length}</b> listed so far</span><span><b>${ver}</b> checked by a person</span><span><b>${Object.keys(byCity).length || 0}</b> cities</span>` : "<span>None listed yet</span>"}</div></div>
   <div class="chiprow wrap" style="margin-top:16px"><a class="chip${fam ? "" : " on"}" href="#/states/${st}">All <span class="n">${all.length}</span></a>${Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<a class="chip${k === fam ? " on" : ""}" href="#/states/${st}?s=${k}">${E(nameOf(k))} <span class="n">${n}</span></a>`).join("")}</div>
   <div class="wrap">
    ${big.map(([c, l]) => `<div class="ghead"><h2>${E(c)}</h2><span class="n">${l.length}</span></div>${feed(l.sort(P.byTrust), 4)}`).join("")}
    ${singles.length ? `<div class="ghead"><h2>${big.length ? "More cities" : "By city"}</h2><span class="n">${singles.length}</span></div>${feed(singles, 6)}` : ""}
    ${rest.length ? `<div class="ghead"><h2>No city on file</h2><span class="n">${rest.length}</span></div><p class="gnote">These programs have not told us a city yet. Check the website for where they meet.</p>${feed(rest.sort(P.byTrust), 6)}` : ""}
    ${!list.length ? `<div class="empty"><h2>Nothing listed in ${E(stName(st))} yet</h2><p>This directory is new and still growing. Know a program here? Add it and a person will check it.</p><div class="btns"><a class="btn dark" href="#/add/program">Add a program</a></div></div>` : ""}
   </div>${letterBand(`Get the letter for ${stName(st)}`, "We email when new programs, grants or events show up in your state.")}`);
}

function statesIndex() {
  const st = Object.keys(P.STATE_NAMES).sort((a, b) => stName(a).localeCompare(stName(b)));
  return page(`<div class="rhead"><h1>Pick your state</h1><p class="sub" style="margin-top:6px">Darker squares have more listings so far.</p></div><div class="wrap">${tileMap()}
   <div class="feed" style="margin-top:20px">${st.map((s) => `<a class="row" style="grid-template-columns:56px 1fr;align-items:center" href="#/states/${s}"><span class="plate av st" style="width:56px;height:56px;display:grid;place-items:center;background:var(--mist)"><svg viewBox="0 0 100 100" width="40" height="40" aria-hidden="true"><path d="${SH[s] || ""}" fill="#1A1A1A"/></svg></span><div><div class="rn">${E(stName(s))}</div><div class="rm">${(D.byState[s] || []).length} listed</div></div></a>`).join("")}</div></div>`);
}

function listing(id) {
  const p = D.items.find((x) => x.id === id);
  if (!p) return page(`<div class="rhead"><h1>We could not find that listing</h1><p class="sub">It may have moved. <a class="link" href="#/">Go home</a></p></div>`);
  const saved = store.get("asnm.place", null);
  const d = dateOf(p);
  const sn = sportsNamed(p);
  const m = /Sports and activities:\s*([^]*?)\.?\s*Athletes served:\s*([^]*)$/i.exec(p.desc || "");
  const offer = m ? m[1].trim().replace(/\.$/, "") : null, who = m ? m[2].trim().replace(/\.$/, "") : null;
  const facts = [["Cost", p.cost], ["Ages", p.ages], ["Equipment", p.equipment]].filter(([, v]) => v);
  const kv = [
    offer ? `<div><h2>What they offer</h2><p>${E(offer)}.</p></div>` : (p.desc ? `<div><h2>About</h2><p>${E(p.desc)}</p></div>` : ""),
    who ? `<div><h2>Who it is for</h2><p>${E(who)}.</p></div>` : "",
    ...facts.map(([k, v]) => `<div><h2>${k}</h2><p>${E(v)}</p></div>`),
  ].join("") || `<div><p class="mute">No description yet. If you know this program, suggest an update and we will add one.</p></div>`;
  const placed = isPlaced(p);
  const hereC = P.cleanCity(p.city);
  let near = [], nearTitle = "";
  if (placed) {
    near = D.items.filter((x) => x.id !== p.id && x.k === p.k && isPlaced(x)).map((x) => ({ ...x, dist: miles([p.lat, p.lng], [x.lat, x.lng]) })).filter((x) => Math.round(x.dist) <= 25).sort((a, b) => a.dist - b.dist).slice(0, 8);
    nearTitle = `More ${nameOf(p.k).toLowerCase()} within about 25 miles`;
  }
  if (!near.length && p.state) { near = (D.byState[p.state] || []).filter((x) => x.id !== p.id && x.k === p.k).sort(P.byTrust).slice(0, 8).map((x) => ({ ...x, dist: null })); nearTitle = `More ${nameOf(p.k).toLowerCase()} in ${stName(p.state)}`; }
  const web = goodUrl(p.website);
  const vt = p.verified ? L.verifiedText(null) : L.unverifiedText(null, false);
  const action = `${web ? `<a class="btn dark" href="${E(web)}" target="_blank" rel="noopener">Visit website ${ICON.ext}</a>` : `<a class="btn dark" href="#/update/${p.id}">Suggest a website</a>`}`;
  return `<div class="lwrap"><div>
   <div class="lpost">${avatar(p.k)}<span><a href="#/sports/${p.k}">${E(nameOf(p.k))}</a>${p.state ? ` <span class="mute">in <a href="#/states/${p.state}">${E(stName(p.state))}</a></span>` : ""}</span></div>
   <div class="lhero">${art(p, "inv")}${p.verified ? `<span class="vpill">${ICON.check}Verified</span>` : ""}<button class="share" data-share aria-label="Share this listing">${ICON.share}</button></div>
   <div class="lbody"><h1>${E(p.name)}</h1><p class="where1">${E(nameOf(p.k))} · ${E(placeText(p))}</p>
    <div class="trust${p.verified ? " v" : ""}"><span class="ic">${p.verified ? ICON.checkL : ICON.clock}</span><div><b>${p.verified ? "Verified" : "Not yet verified"}</b><div class="date">${d ? "Last checked " + d : p.verified ? "No check date on file yet" : "Not checked yet"}</div><p>${E(vt)}</p></div></div>
    ${p.k === "multi" && sn.keys.length >= 2 ? `<div class="chiprow" style="margin-top:14px">${sn.keys.slice(0, 6).map((k) => `<a class="chip" href="#/sports/${k}">${E(nameOf(k))}</a>`).join("")}</div>` : ""}
    <div class="kv">${kv}</div>
    <div class="lsec"><h2>Where you will play</h2><div class="wherebox">${p.state ? `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${SH[p.state] || ""}"/>${placed && p.px != null ? `<circle cx="${p.px}" cy="${p.py}" r="5"/>` : ""}</svg>` : ""}<div><b>${E(placeText(p))}</b><p>${placed ? "Shown at the city. Check the website for the exact place." : p.state ? "No city on file yet. Check the website for where they meet." : "Check the website for where they meet."}</p></div></div></div>
    <div class="lsec"><h2>About this listing</h2><p class="sub" style="font-size:16px">See something out of date? A person reads every suggestion before anything changes.</p><div class="fixrow"><a class="btn" href="#/update/${p.id}">${ICON.pen}Suggest an update</a><a class="btn ghost" href="#/update/${p.id}?rel=run">I run this program</a></div></div>
    ${near.length ? `<div class="lsec"><h2>${E(nearTitle)}</h2><div class="hrail">${near.map(card).join("")}</div></div>` : ""}
   </div></div>
   <div class="actionbar desk"><div class="info"><b>${p.verified ? `<span class="ok">${ICON.check}Verified</span>` : "Not yet verified"}</b><span>${d ? "Checked " + d : p.verified ? "No check date on file yet" : "Not checked yet"}</span></div>${action}</div></div>`;
}

function grantsFeed(a, baseHref) {
  const list = D.grants.filter((g) => !a || g.audience === a).sort((x, y) => (y.open - x.open) || (!!realAmt(y) - !!realAmt(x)) || x.name.localeCompare(y.name));
  const n = (aud) => D.grants.filter((g) => !aud || g.audience === aud).length;
  const sep = baseHref.includes("?") ? "&" : "?";
  return `<div class="chiprow" role="list" style="margin-top:14px"><a class="chip${!a ? " on" : ""}" href="${baseHref}">All <span class="n">${n("")}</span></a><a class="chip${a === "athlete" ? " on" : ""}" href="${baseHref}${sep}a=athlete">For athletes <span class="n">${n("athlete")}</span></a><a class="chip${a === "program" ? " on" : ""}" href="${baseHref}${sep}a=program">For programs <span class="n">${n("program")}</span></a></div>
   <div class="feed" id="gf">${list.map((g, i) => grantRow(g, i >= 12)).join("")}</div>${list.length > 12 ? `<button class="btn ghost morebtn" data-more="gf">Show all ${list.length}</button>` : ""}`;
}
function grants(q) {
  return page(`<div class="t-grant"><div class="banner"><span class="bigfig ghost" style="--src:url('${L.GRANT_ART}')"></span><span class="bigfig" style="--src:url('${L.GRANT_ART}')"></span></div>
   <div class="chead"><div class="ctitle">${avatar("grant")}<div class="acts"><button class="btn pill dark" data-jumpletter>Get the letter</button></div></div><h1>Grants</h1>
   <p class="about">Money for adaptive sports equipment, training and travel. Each grant is run by its own group, so you apply on their site.</p>
   <div class="facts"><span><b>${D.grants.filter((g) => g.audience === "athlete").length}</b> for athletes</span><span><b>${D.grants.filter((g) => g.audience === "program").length}</b> for programs</span></div></div></div>
   <div class="wrap">${grantsFeed(q.a || "", "#/grants")}</div>${letterBand("Hear about new grants", "We email when a grant opens or a deadline is close. No spam.")}`);
}
function grantPage(id) {
  const g = D.grants.find((x) => x.id === id);
  if (!g) return page(`<div class="rhead"><h1>We could not find that grant</h1><a class="link" href="#/grants">All grants</a></div>`);
  const url = goodUrl(g.url);
  const others = D.grants.filter((x) => x.id !== g.id && x.audience === g.audience && x.open).slice(0, 8);
  return `<div class="lwrap"><div>
   <div class="lpost">${avatar("grant")}<span><a href="#/grants">Grants</a> <span class="mute">${g.audience === "program" ? "for programs" : "for athletes"}</span></span></div>
   <div class="lhero">${plate("grant", "inv")}<button class="share" data-share aria-label="Share this grant">${ICON.share}</button></div>
   <div class="lbody"><h1>${E(gname(g.name))}</h1><p class="where1">From ${E(g.source || "the organization")}</p>
    <div class="factgrid"><div><span>Amount</span><b>${E(realAmt(g) || "Varies, see their site")}</b></div><div><span>Deadline</span><b>${E(pastDeadline(g) ? "Next round: see their site" : g.deadline || "See their site")}</b></div><div><span>Who can apply</span><b>${g.audience === "program" ? "Programs and groups" : "Athletes"}</b></div><div><span>Status</span><b>${!g.open ? "Closed for now" : pastDeadline(g) ? "Last deadline " + E(g.deadline) : "Open"}</b></div></div>
    <div class="kv">${g.desc ? `<div><h2>What it covers</h2><p>${E(g.desc)}</p></div>` : ""}<div><h2>Before you apply</h2><p>Amounts and deadlines change. Check their site for the latest. Adaptive Sports Near Me does not run this grant.</p></div></div>
    <div class="lsec"><h2>See something out of date?</h2><div class="fixrow"><a class="btn" href="#/update/grant-${g.id}">${ICON.pen}Suggest an update</a></div></div>
    ${others.length ? `<div class="lsec"><h2>More grants ${g.audience === "program" ? "for programs" : "for athletes"}</h2><div class="hrail">${others.map(grantCard).join("")}</div></div>` : ""}
   </div></div>
   <div class="actionbar desk"><div class="info"><b>${E(realAmt(g) || "Amount varies")}</b><span>${E(pastDeadline(g) ? "Next round: see their site" : g.deadline || "Deadline: see their site")}</span></div>${url ? `<a class="btn dark" href="${E(url)}" target="_blank" rel="noopener">Apply on their site ${ICON.ext}</a>` : `<a class="btn dark" href="#/update/grant-${g.id}">Suggest a link</a>`}</div></div>`;
}

function eventsEmpty(k) {
  return `<div class="empty" style="margin-top:18px"><h2>No ${k ? E(nameOf(k).toLowerCase()) + " " : ""}events listed yet</h2><p>We are just starting to collect clinics, tryouts, camps and game days. If you know of one, add it. A person checks every event before it goes up.</p>
    <div class="btns"><a class="btn acc" href="#/add/event">${ICON.plus}Add an event</a><button class="btn" data-jumpletter>Hear when events are posted</button></div></div>`;
}
function events() {
  return page(`<div class="t-event"><div class="banner"><span class="bigfig ghost" style="--src:url('${L.EVENT_ART}')"></span><span class="bigfig" style="--src:url('${L.EVENT_ART}')"></span></div>
   <div class="chead"><div class="ctitle">${avatar("event")}<div class="acts"><a class="btn pill acc" href="#/add/event">Add an event</a></div></div><h1>Events</h1>
   <p class="about">Clinics, tryouts, camps and game days you can attend.</p></div></div>
   <div class="wrap">${eventsEmpty("")}<p class="gnote" style="margin-top:14px">Want events on your calendar when they land? <a class="link" href="/events.ics">Subscribe to the calendar</a></p></div>
   ${letterBand("Hear when events are posted", "We email when there is an event near you. No spam, unsubscribe any time.")}`);
}

function formPage(kind, id, q) {
  const sportOpts = Object.keys(NAME).sort((a, b) => nameOf(a).localeCompare(nameOf(b))).map((k) => `<option value="${k}">${E(nameOf(k))}</option>`).join("");
  const stOpts = Object.keys(P.STATE_NAMES).map((s) => `<option>${s}</option>`).join("");
  let title, intro, fields, icon;
  if (kind === "event") {
    icon = "event"; title = "Add an event"; intro = "Clinics, tryouts, camps, game days. A person checks every event before it goes up.";
    fields = `<label>Event name<input required name="t" placeholder="Wheelchair tennis clinic"></label><label>Sport<select name="s"><option value="">Choose a sport</option>${sportOpts}</select></label>
     <label>Date<input type="date" required name="d"></label><div class="two"><label>City<input required name="c"></label><label>State<select name="st">${stOpts}</select></label></div>
     <label>Website <small>Where people can read more or sign up</small><input type="url" name="u" placeholder="https://"></label><label>Your email <small>Only so we can ask a question. Never shown.</small><input type="email" required name="em"></label>`;
  } else if (kind === "program") {
    icon = "multi"; title = "Add a program"; intro = "Know an adaptive sports program we are missing? Tell us and a person will check it before it goes up.";
    fields = `<label>Program name<input required name="pn"></label><label>Organization <small>If different</small><input name="org"></label><label>Sport<select name="sport"><option value="">Choose a sport</option>${sportOpts}</select></label>
     <div class="two"><label>City<input required name="city"></label><label>State<select name="state">${stOpts}</select></label></div><label>Website<input type="url" name="u" placeholder="https://"></label>
     <label>Anything else <small>Optional</small><textarea name="notes"></textarea></label><label>Your email <small>Only so we can ask a question. Never shown.</small><input type="email" required name="em"></label>`;
  } else {
    const isGrant = String(id).startsWith("grant-");
    const p = isGrant ? D.grants.find((g) => "grant-" + g.id === id) : D.items.find((x) => x.id === id);
    const run = q.rel === "run";
    icon = isGrant ? "grant" : (p ? p.k : "multi");
    title = run ? "Confirm your listing" : "Suggest an update";
    intro = p ? `For ${gname(p.name)}. A person reads every suggestion before anything changes.` : "A person reads every suggestion before anything changes.";
    fields = `${isGrant ? "" : `<label>How do you know this program?<select name="rel"><option value="run"${run ? " selected" : ""}>I run it or work there</option><option value="attend">I take part</option><option value="other">Other</option></select></label>`}
      <label>What should change?<textarea required name="notes" placeholder="${run ? "Tell us what is right and what is out of date." : "A new website, a moved location, a program that ended..."}"></textarea></label><label>Your email <small>Only so we can ask a question. Never shown.</small><input type="email" required name="em"></label>`;
  }
  return page(`<div class="rhead" style="display:flex;gap:14px;align-items:center">${avatar(icon)}<h1>${E(title)}</h1></div><div class="wrap"><p class="sub" style="margin-top:10px">${E(intro)}</p>
   <form class="form" data-fakeform>${fields}<input class="hp" name="company" tabindex="-1" autocomplete="off" aria-hidden="true"><button class="btn dark" type="submit">Send</button></form></div>`);
}

function aboutPage() {
  return page(`<div class="rhead"><h1>How we check listings</h1></div><div class="wrap"><div class="kv">
   <div><h2>Verified</h2><p>A person on our team checked the program against an official source, like its own website. Every verified listing shows the date it was last checked.</p></div>
   <div><h2>Not yet verified</h2><p>We found the program, but no one has confirmed it yet. It still shows a date, or says it has not been checked yet.</p></div>
   <div><h2>Where it is</h2><p>We show the city and state a program lists. Distances are measured from that city, so they are always about. We never show a program's email or phone here; use its website.</p></div>
   <div><h2>Something wrong?</h2><p>Every listing has a Suggest an update button. A person reads each one.</p></div></div></div>${helpBand()}`);
}

/* ---------- drawer ---------- */
function drawer(route) {
  const recent = store.get("asnm.recent", []).filter((k) => NAME[k]);
  const top = Object.entries(D.counts).sort((a, b) => b[1] - a[1]);
  const on = (r) => route === r ? " on" : "";
  return `<div class="dhead"><a class="brand" href="#/"><img src="/favicon.svg" alt="Adaptive Sports Near Me"><span>Near Me</span></a><button class="iconbtn" data-close aria-label="Close menu"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
   <a class="di${on("home")}" href="#/">${ICON.home}Home</a>
   <a class="di" href="#" data-search>${ICON.search}Search near me</a>
   <a class="di${on("grants")}" href="#/grants">${avatar("grant")}Grants<span class="n">${D.grants.length}</span></a>
   <a class="di${on("events")}" href="#/events">${avatar("event")}Events</a>
   <a class="di${on("states")}" href="#/states">${ICON.map}States</a>
   ${recent.length ? `<h3>Recently viewed</h3>${recent.map((k) => `<a class="di" href="#/sports/${k}">${avatar(k)}${E(nameOf(k))}</a>`).join("")}` : ""}
   <h3>Sports</h3>${top.slice(0, 12).map(([k, n]) => `<a class="di${on("sport:" + k)}" href="#/sports/${k}">${avatar(k)}${E(nameOf(k))}<span class="n">${n}</span></a>`).join("")}
   <a class="di more" href="#/sports">All sports</a>
   <h3>Help build this</h3>
   <a class="di" href="#/add/program">${ICON.plus}Add a program</a><a class="di" href="#/add/event">${ICON.plus}Add an event</a>
   <a class="di" href="#/about">${ICON.shield}How we check listings</a>
   <a class="di" href="#" data-jumpletter>${ICON.mail}The letter</a>
   <a class="di" href="/resources/veteran-owned-businesses">${ICON.book}Resources</a>`;
}

/* ---------- search sheet ---------- */
let sheetSport = "", lastFocus = null;
function openSheet(pre) {
  lastFocus = document.activeElement;
  const r = route();
  sheetSport = pre != null ? pre : (r.q.s || (r.name === "sport" ? r.arg : ""));
  const saved = store.get("asnm.place", "");
  document.getElementById("where").value = r.name === "near" ? r.arg : (saved || "");
  document.getElementById("whereMsg").textContent = "";
  const keys = Object.entries(D.counts).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  document.getElementById("sportGrid").innerHTML = `<button type="button" class="any${!sheetSport ? " on" : ""}" data-sport=""><span class="av">Any</span>Any sport</button>` + keys.map((k) => `<button type="button" data-sport="${k}" class="${k === sheetSport ? "on" : ""}" aria-pressed="${k === sheetSport}">${avatar(k)}${E(nameOf(k))}</button>`).join("");
  document.getElementById("sheet").classList.add("on");
  document.body.style.overflow = "hidden";
  setTimeout(() => document.getElementById("where").focus(), 30);
}
function closeSheet() { document.getElementById("sheet").classList.remove("on"); document.body.style.overflow = ""; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
function goSearch() {
  const v = document.getElementById("where").value.trim();
  if (!v) { if (sheetSport) { closeSheet(); location.hash = "#/sports/" + sheetSport; return; } document.getElementById("whereMsg").textContent = "Enter a city, state, or ZIP code."; return; }
  const w = P.parsePlace(v, D.items);
  if (!w) { document.getElementById("whereMsg").textContent = "We could not find that place. Try a city and state, like Tampa, FL, or a ZIP code."; return; }
  closeSheet();
  location.hash = "#/near/" + encodeURIComponent(v) + (sheetSport ? "?s=" + sheetSport : "");
}
async function useLocation(btn) {
  const msg = document.getElementById("whereMsg");
  if (!navigator.geolocation) { openSheet(); document.getElementById("whereMsg").textContent = "Your browser cannot share a location. Type a city or ZIP instead."; return; }
  if (btn) btn.disabled = true;
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const c = [pos.coords.latitude, pos.coords.longitude];
    const pl = await loadPlaces();
    let best = null, bd = 1e9;
    for (const [key, cc] of Object.entries(pl)) { const d = miles(c, cc); if (d < bd) { bd = d; best = key; } }
    if (btn) btn.disabled = false;
    if (!best) return;
    const [st, city] = best.split("|");
    const nice = city.replace(/\b\w/g, (x) => x.toUpperCase());
    closeSheet(); location.hash = "#/near/" + encodeURIComponent(nice + ", " + st);
  }, () => { if (btn) btn.disabled = false; if (!document.getElementById("sheet").classList.contains("on")) openSheet(); document.getElementById("whereMsg").textContent = "We could not get your location. Type a city or ZIP instead."; }, { timeout: 8000 });
}

/* ---------- router ---------- */
function route() {
  const h = decodeURIComponent(location.hash.replace(/^#/, "") || "/");
  const [path, qs] = h.split("?");
  const q = Object.fromEntries(new URLSearchParams(qs || ""));
  const seg = path.split("/").filter(Boolean);
  if (!seg.length) return { name: "home", q };
  const [a, b, c] = seg;
  if (a === "near" && b) return { name: "near", arg: seg.slice(1).join("/"), q };
  if (a === "sports") return b ? { name: "sport", arg: b, q } : { name: "sports", q };
  if (a === "states") return b ? { name: "state", arg: b.toUpperCase(), q } : { name: "states", q };
  if (a === "programs" && b) return { name: "program", arg: b, q };
  if (a === "grants") return b ? { name: "grant", arg: b, q } : { name: "grants", q };
  if (a === "events") return { name: "events", q };
  if (a === "add" && b) return { name: "add", arg: b, q };
  if (a === "update" && b) return { name: "update", arg: b, q };
  if (a === "about") return { name: "about", q };
  return { name: "home", q };
}
const TITLE = { home: "Adaptive Sports Near Me", grants: "Grants", events: "Events", sports: "All sports", states: "States", about: "How we check listings" };
async function render() {
  const r = route();
  feedN = 0;
  let html = "", title = TITLE[r.name] || "", active = r.name;
  try {
    switch (r.name) {
      case "near": html = await results(r.arg, r.q); title = "Near " + r.arg; break;
      case "sport": html = sportPage(r.arg, r.q); title = nameOf(r.arg); active = "sport:" + r.arg; break;
      case "sports": html = sportsIndex(); break;
      case "state": html = statePage(r.arg, r.q); title = stName(r.arg); break;
      case "states": html = statesIndex(); break;
      case "program": { html = listing(r.arg); const p = D.items.find((x) => x.id === r.arg); title = p ? p.name : "Listing"; break; }
      case "grants": html = grants(r.q); break;
      case "grant": { html = grantPage(r.arg); const g = D.grants.find((x) => x.id === r.arg); title = g ? gname(g.name) : "Grant"; break; }
      case "events": html = events(); break;
      case "add": html = formPage(r.arg, null, r.q); title = r.arg === "event" ? "Add an event" : "Add a program"; break;
      case "update": html = formPage("update", r.arg, r.q); title = "Suggest an update"; break;
      case "about": html = aboutPage(); break;
      default: html = await home();
    }
  } catch (err) { console.error(err); html = page(`<div class="rhead"><h1>Something went wrong</h1><p class="sub">Try again, or <a class="link" href="#/">go home</a>.</p></div>`); }
  if (!html) return;
  app().innerHTML = html;
  document.title = title && title !== TITLE.home ? `${title} · Adaptive Sports Near Me` : TITLE.home;
  document.getElementById("drawer").innerHTML = drawer(active);
  const fl = document.getElementById("footLetter"); if (fl) fl.hidden = !!document.getElementById("letter");
  toggleDrawer(false);
  window.scrollTo(0, 0);
}
function toggleDrawer(on) {
  const d = document.getElementById("drawer"); if (window.matchMedia("(min-width: 1024px)").matches) on = false;
  d.classList.toggle("on", on); document.getElementById("scrim").classList.toggle("on", on); document.getElementById("menuBtn").setAttribute("aria-expanded", String(on));
  if (on) setTimeout(() => { const f = d.querySelector("a,button"); f && f.focus(); }, 30);
}

/* ---------- wiring ---------- */
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-search],[data-close],#menuBtn,#scrim,[data-sport],#sheetClose,#sheetGo,#sheetClear,[data-loc],#useLoc,[data-more],[data-jumpletter],[data-share],[data-jump],#betaX");
  if (!t) return;
  if (t.matches("[data-search]")) { e.preventDefault(); toggleDrawer(false); openSheet(t.dataset.sportPre); }
  else if (t.id === "menuBtn") toggleDrawer(true);
  else if (t.matches("[data-close],#scrim")) toggleDrawer(false);
  else if (t.matches("[data-sport]")) { sheetSport = t.dataset.sport; document.querySelectorAll("#sportGrid button").forEach((b) => { b.classList.toggle("on", b === t); b.setAttribute("aria-pressed", String(b === t)); }); }
  else if (t.id === "sheetClose") closeSheet();
  else if (t.id === "sheetClear") { document.getElementById("where").value = ""; sheetSport = ""; document.querySelectorAll("#sportGrid button").forEach((b) => b.classList.toggle("on", b.dataset.sport === "")); }
  else if (t.id === "sheetGo") goSearch();
  else if (t.matches("[data-loc],#useLoc")) { e.preventDefault(); useLocation(t); }
  else if (t.matches("[data-more]")) { document.getElementById(t.dataset.more).classList.add("open"); t.remove(); }
  else if (t.matches("[data-jumpletter]")) { e.preventDefault(); toggleDrawer(false); const l = document.getElementById("letter") || document.getElementById("footLetter"); if (l) { l.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" }); setTimeout(() => l.querySelector("input").focus({ preventScroll: true }), 400); } }
  else if (t.matches("[data-jump]")) { e.preventDefault(); const g = document.getElementById(t.dataset.jump); if (g) g.scrollIntoView({ block: "start" }); }
  else if (t.matches("[data-share]")) { if (navigator.share) navigator.share({ title: document.title, url: location.href }).catch(() => {}); else if (navigator.clipboard) { navigator.clipboard.writeText(location.href).catch(() => {}); t.setAttribute("aria-label", "Link copied"); } }
  else if (t.id === "betaX") { document.getElementById("beta").remove(); }
});
document.addEventListener("submit", (e) => {
  const f = e.target;
  if (f.matches("[data-letter]")) { e.preventDefault(); f.outerHTML = `<p class="ok2" role="status">Thanks. You are on the list.</p><p class="proto">Prototype: nothing was sent.</p>`; }
  else if (f.matches("[data-fakeform]")) { e.preventDefault(); f.outerHTML = `<div class="thanks" role="status"><b>Thank you. A person will read this.</b><p>We may email you with a question. Nothing goes live until someone on our team checks it.</p><p class="proto">Prototype: nothing was sent.</p></div>`; }
});
document.getElementById("where").addEventListener("keydown", (e) => { if (e.key === "Enter") goSearch(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { if (document.getElementById("sheet").classList.contains("on")) closeSheet(); else toggleDrawer(false); }
  if (e.key === "Tab" && document.getElementById("sheet").classList.contains("on")) {
    const f = [...document.querySelectorAll("#sheet button, #sheet input")].filter((x) => !x.disabled && x.offsetParent);
    if (!f.length) return; const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
window.addEventListener("hashchange", render);

Promise.all([P.load(), fetch("/design/states.json").then((r) => r.json())]).then(([d, s]) => {
  SH = s.shapes; CENTERS = s.centers;
  for (const p of d.items) {
    let k = p.sportKey || "multi";
    if (!NAME[k]) k = "multi";
    if (k === "multi") {
      const sn = sportsNamed(p);
      // Retag only when every sport the listing names is the same one.
      if (sn.all && sn.keys.length === 1) k = sn.keys[0]; else p.trio = sn.keys;
    }
    p.k = k;
  }
  d.counts = {}; for (const p of d.items) d.counts[p.k] = (d.counts[p.k] || 0) + 1;
  D = d;
  render();
}).catch((err) => { console.error(err); app().innerHTML = `<div class="rhead"><h1>We could not load the directory</h1><p class="sub">Refresh the page to try again.</p></div>`; });
})();
