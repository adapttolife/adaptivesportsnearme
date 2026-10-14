/* Round 3, concept "Gallery (Airbnb-first)".
   Alec's flat sport images are the photo slot on every card. Real data from
   /design/programs.json and /design/grants.json through Proto.load().
   Honesty rules: city and state only; distances only from city-level
   geocoding, worded "about N mi"; Verified / Not yet verified plus a date;
   no email, phone, score or money ask. Hash routes so it runs as a static file. */
(async function () {
  "use strict";
  const P = window.Proto, LA = window.ListingArt, E = P.esc;
  const app = document.getElementById("app"), over = document.getElementById("over");

  /* ---------- sport images: optical sizing + tones (from r3-imagelab) ---------- */
  // bbox width, bbox height, sqrt(w*h), ink density, centroid x: measured per SVG.
  const OPT = {"amputeesports":[0.893,0.855,0.874,0.242,0.019],"archery":[0.795,0.893,0.842,0.276,-0.061],"art-therapy":[0.893,0.816,0.854,0.344,-0.009],"baseball":[0.727,0.893,0.805,0.321,-0.037],"basketball":[0.797,0.893,0.843,0.342,-0.027],"beepbaseball":[0.787,0.891,0.837,0.245,-0.079],"blindsports":[0.893,0.34,0.551,0.307,0.034],"boccia":[0.891,0.686,0.781,0.319,-0.099],"climbing":[0.645,0.893,0.758,0.308,0.005],"curling":[0.893,0.602,0.733,0.305,-0.093],"cycling":[0.893,0.418,0.611,0.34,-0.019],"dance":[0.83,0.893,0.861,0.242,0.007],"equestrian":[0.893,0.73,0.807,0.347,-0.03],"equestrianvaulting":[0.893,0.73,0.807,0.347,-0.03],"equine-therapy":[0.893,0.73,0.807,0.347,-0.03],"event":[0.891,0.77,0.828,0.413,0.034],"fencing":[0.891,0.568,0.711,0.255,-0.156],"football":[0.879,0.895,0.887,0.434,0.011],"goalball":[0.893,0.34,0.551,0.307,0.034],"golf":[0.742,0.891,0.813,0.301,-0.064],"grant":[0.75,0.891,0.817,0.262,-0.064],"handball":[0.84,0.893,0.866,0.317,-0.077],"handcycling":[0.893,0.418,0.611,0.34,-0.019],"lacrosse":[0.834,0.891,0.862,0.319,0.098],"martialarts":[0.891,0.885,0.888,0.35,-0.08],"multi":[0.893,0.738,0.812,0.215,-0.001],"nordicskiing":[0.891,0.697,0.788,0.23,0.015],"pickleball":[0.893,0.781,0.835,0.321,-0.08],"powerlifting":[0.893,0.629,0.749,0.338,0.005],"rowing":[0.891,0.648,0.76,0.303,0.018],"rugby":[0.893,0.691,0.786,0.381,-0.044],"running":[0.855,0.891,0.873,0.259,0.038],"sailing":[0.891,0.895,0.893,0.286,0.061],"shooting":[0.895,0.754,0.821,0.3,-0.12],"skiing":[0.891,0.68,0.778,0.251,0.003],"sledhockey":[0.891,0.562,0.708,0.299,-0.01],"soccer":[0.895,0.684,0.782,0.322,-0.104],"softball":[0.891,0.777,0.832,0.282,0.003],"surfing":[0.893,0.738,0.812,0.215,-0.001],"swimming":[0.891,0.441,0.627,0.351,0.038],"tennis":[0.895,0.871,0.883,0.259,-0.098],"trackfield":[0.891,0.547,0.698,0.279,-0.09],"triathlon":[0.891,0.555,0.703,0.302,0.015],"veteran-meetup":[0.893,0.547,0.699,0.451,0.008],"volleyball":[0.893,0.719,0.801,0.301,0.059],"waterskiing":[0.891,0.566,0.71,0.254,-0.076],"wheelchairracing":[0.891,0.547,0.698,0.279,-0.09]};
  // Props that sit on the floor line (ball, puck, tee, stone): never crop the bottom.
  const FLOOR = new Set(["soccer", "sledhockey", "golf", "boccia", "curling", "goalball", "blindsports"]);
  const TONE = {
    court: ["#F7E1CF", "#B4461C"], racquet: ["#EAF0CF", "#5A6F10"], field: ["#D9EBD5", "#2F7043"],
    snow: ["#DAE7F4", "#2B62A0"], water: ["#D3ECE8", "#0C716F"], trail: ["#F2E5CC", "#925F17"],
    calm: ["#E7E0F2", "#5E4A9C"], house: ["#EDE8E0", "#262523"], grant: ["#F5EBC9", "#8A6300"],
    event: ["#FBE2D8", "#C63F22"],
  };
  const fam = (k) => (k === "grant" || k === "event") ? k : (LA.FAMILY[k] || "house");
  const tone = (k) => TONE[fam(k)];
  const toneVars = (k) => `--t:${tone(k)[0]};--d:${tone(k)[1]}`;
  const dk = (d) => Math.min(1.04, Math.max(0.9, Math.pow(0.31 / d, 0.3)));
  // symbolSrc only knows the 45 sport keys; grant and event have their own constants.
  const src = (k) => k === "grant" ? LA.GRANT_ART : k === "event" ? LA.EVENT_ART : LA.symbolSrc(k);
  const fv = (k) => { const o = OPT[k] || OPT.multi; return `--w:${o[0]};--h:${o[1]};--g:${o[2]};--dk:${dk(o[3]).toFixed(3)};--src:url(${src(k)})`; };
  const fig = (k, extra = "") => `<i class="fig" style="${fv(k)}${extra}" aria-hidden="true"></i>`;

  /* ---------- icons ---------- */
  const I = {
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7.5 7.5L12 3l4.5 4.5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.4" fill="currentColor"/><path d="M4.6 8.3l2.2 2.2 4.6-4.8" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    checkL: '<svg width="22" height="22" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.4" fill="currentColor"/><path d="M4.6 8.3l2.2 2.2 4.6-4.8" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    dot: '<svg width="22" height="22" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 4.6v4.2M8 11v.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    loc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l18-8-8 18-2-8-8-2z"/></svg>',
    all: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z"/><path d="M4 19a2 2 0 012-2h13"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/></svg>',
  };

  /* ---------- data ---------- */
  const fetchJSON = (u) => fetch(u).then((r) => r.json());
  const [data, SPORTS, STATES] = await Promise.all([P.load(), fetchJSON("/design/sports.json"), fetchJSON("/design/states.json")]);
  const items = data.items, grants = data.grants;
  let PLACES = null, ZCTA = null;
  const places = async () => (PLACES = PLACES || await fetchJSON("/design/places.json"));

  const NAMES = {
    blindsports: "Blind sports", "equine-therapy": "Equine therapy", surfing: "Surfing", wheelchairracing: "Wheelchair racing",
    handcycling: "Handcycling", equestrianvaulting: "Equestrian vaulting",
  };
  for (const s of SPORTS.sports) NAMES[s.key] = s.name;
  const NOTES = Object.fromEntries(SPORTS.sports.map((s) => [s.key, s.note]));
  const sname = (k) => NAMES[k] || "Multi-sport";
  const lower = (k) => k === "multi" ? "multi-sport" : sname(k).toLowerCase();

  const SAME_PIC = { "equine-therapy": "equestrian", equestrianvaulting: "equestrian", blindsports: "goalball", handcycling: "cycling", wheelchairracing: "trackfield", surfing: "multi" };
  // Multi-sport listings: read "Sports and activities:" for the sports they name.
  function readSports(desc) {
    const m = /Sports and activities:\s*(.+?)(?:\.\s*Athletes served:|$)/i.exec(desc || "");
    if (!m) return { keys: [], pure: false };
    const keys = []; let loose = 0;
    for (const seg of m[1].split(";")) {
      const k = LA.symbolKey({ sportLabel: seg });
      if (k && k !== "multi") { if (!keys.includes(k)) keys.push(k); } else if (seg.trim()) loose++;
    }
    const pics = new Set(keys.map((k) => SAME_PIC[k] || k));
    return { keys, pure: keys.length >= 1 && pics.size === 1 && loose === 0 };
  }
  const titleCase = (s) => s.replace(/\b([A-Z])([A-Z]+)\b/g, (m, a, b) => a + b.toLowerCase());
  function niceCity(p) {
    const c = P.cleanCity(p.city);
    if (!c) return null;
    return titleCase(c.split(/[\/;(]|,\s/)[0].trim());
  }
  const UNPLACED = /statewide|multiple|various|throughout|across|county|counties|region/i;
  for (const p of items) {
    p.key0 = p.sportKey || "multi";
    const r = p.key0 === "multi" ? readSports(p.desc) : { keys: [p.key0], pure: true };
    // A multi-sport listing whose own description names exactly one sport wears that sport.
    p.key = p.key0 === "multi" && r.pure ? (r.keys.length === 1 ? r.keys[0] : (SAME_PIC[r.keys[0]] || r.keys[0])) : p.key0;
    p.keys = p.key === "multi" ? r.keys : [p.key];
    // Pictures, not keys: sports that share one drawing show it once.
    p.pics = [...new Set(p.keys.map((k) => SAME_PIC[k] || k))].filter((k) => k !== "multi");
    p.cityName = niceCity(p);
    p.placed = p.geo === "city" && p.lat != null && !!p.cityName && !UNPLACED.test(p.city || "") && p.geoPrecision !== "state";
    p.webOk = /^https?:\/\//i.test(p.website || "");
    p.name = String(p.name).replace(/\s+[–—]\s+/g, ": ");
  }
  const byId = Object.fromEntries(items.map((p) => [p.id, p]));
  const grantById = Object.fromEntries(grants.map((g) => [g.id, g]));
  const counts = {};
  for (const p of items) counts[p.key] = (counts[p.key] || 0) + 1;
  // The sport bar: most-listed first, fixed order so things stay where people left them.
  const BAR = ["multi", "tennis", "soccer", "baseball", "equestrian", "basketball", "rowing", "sledhockey", "skiing", "swimming", "golf", "cycling", "archery", "sailing", "equine-therapy", "trackfield", "fencing", "climbing"];
  const ALLSPORTS = Object.keys(counts).sort((a, b) => sname(a).localeCompare(sname(b)));

  /* ---------- words ---------- */
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MONL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const day = (iso, long) => { const t = Date.parse(iso || ""); if (!isFinite(t)) return null; const d = new Date(t); return `${(long ? MONL : MON)[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`; };
  const SN = P.STATE_NAMES;
  const placeText = (p) => p.placed ? `${p.cityName}, ${p.state}` : p.state ? (p.cityName ? `${p.cityName}, ${p.state}` : SN[p.state]) : "Place not listed";
  const mi = (d) => `about ${d < 1.5 ? 1 : Math.round(d)} mi`;
  const R = 3958.8, rad = (d) => d * Math.PI / 180;
  const miles = (a, b) => { const dLat = rad(b[0] - a[0]), dLng = rad(b[1] - a[1]); const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
  const norm = (s) => String(s || "").toLowerCase().replace(/\./g, "").replace(/\bsaint\b/g, "st").replace(/\bfort\b/g, "ft").replace(/\s+/g, " ").trim();
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sportLine = (p) => {
    if (p.key !== "multi") return sname(p.key);
    if (!p.keys.length) return "Multi-sport";
    const names = p.keys.slice(0, 2).map((k) => lower(k));
    return "Multi-sport: " + names.join(", ") + (p.keys.length > 2 ? " and more" : "");
  };
  const cleanText = (s) => String(s || "").replace(/\s*[–—]\s*/g, " to ").replace(/\s\/\s/g, " or ").replace(/\s·\s/g, ", ");
  const trustCard = (p) => {
    const d = day(p.lastChecked);
    return p.verified
      ? `<p class="tr ok"><b>Verified</b> · ${d ? "Checked " + d : "No check date yet"}</p>`
      : `<p class="tr"><b>Not yet verified</b> · ${d ? "Checked " + d : "No check date yet"}</p>`;
  };

  /* ---------- hash routing ---------- */
  const OVER = ["menu", "sheet", "share"];
  const H = () => Object.fromEntries(new URLSearchParams(location.hash.slice(1)));
  const href = (o) => { const u = new URLSearchParams(); for (const [k, v] of Object.entries(o)) if (v != null && v !== "") u.set(k, v); const s = u.toString(); return "#" + (s || "home"); };
  const pageParams = () => { const h = H(); for (const k of OVER) delete h[k]; delete h.home; return h; };
  const withOver = (k, v) => href({ ...pageParams(), [k]: v });
  let lastWhere = null; // the last place someone searched, for "about N mi from ..."

  /* ---------- pieces ---------- */
  function figTrio(keys) {
    return `<div class="trio">${keys.slice(0, 3).map((k) => fig(k, `;--fd:${tone(k)[1]}`)).join("")}</div>`;
  }
  // The plate: the card's photo. Place as the headline, the athlete as the picture.
  function plate(p, dist) {
    const trio = p.key === "multi" && p.pics.length >= 2;
    let big, sub;
    if (p.placed) { big = p.cityName; sub = p.state + (dist != null && dist > 0.01 ? " · " + mi(dist) : ""); }
    else if (p.state) { big = p.cityName || SN[p.state]; sub = p.cityName ? SN[p.state] : "City not listed"; }
    else { big = "Place"; sub = "not listed"; }
    return `<div class="plate" style="${toneVars(trio ? "multi" : p.key)}">
      <div class="pl-txt"><span class="pl-big">${E(big)}</span><span class="pl-sub">${E(sub)}</span></div>
      ${trio ? figTrio(p.pics) : fig(p.key)}
      ${p.verified ? `<span class="vp">${I.check}Verified</span>` : ""}
    </div>`;
  }
  function card(p, dist) {
    return `<a class="card" href="#p=${p.id}">${plate(p, dist)}<div class="ct"><p class="nm">${E(p.name)}</p><p class="mt">${E(sportLine(p))}</p>${trustCard(p)}</div></a>`;
  }
  function grantAmount(g) { return g.amount && !/^varies$/i.test(g.amount) ? g.amount : null; }
  function deadlineText(g) {
    if (!g.deadline) return null;
    const t = Date.parse(g.deadline);
    if (/\d{4}/.test(g.deadline) && isFinite(t) && t < Date.parse("2026-10-14")) return `Last deadline was ${g.deadline}`;
    return "Deadline: " + cleanText(g.deadline);
  }
  function grantPlate(g) {
    const amt = grantAmount(g);
    return `<div class="plate" style="${toneVars("grant")}">
      <div class="pl-txt"><span class="pl-big">${E(amt || "Amount varies")}</span><span class="pl-sub">${g.audience === "program" ? "For programs" : "For athletes"}</span></div>
      ${fig("grant")}
    </div>`;
  }
  function grantCard(g) {
    const dl = deadlineText(g);
    return `<a class="card" href="#g=${g.id}">${grantPlate(g)}<div class="ct"><p class="nm">${E(g.name)}</p><p class="mt">From ${E(g.source || "the grant maker")}</p><p class="tr">${E(g.open ? (dl || "Check their site for dates") : "Closed for now")}</p></div></a>`;
  }
  function eventEmptyCard() {
    return `<a class="card" href="#v=events"><div class="plate" style="${toneVars("event")}"><div class="pl-txt"><span class="pl-big">Events</span><span class="pl-sub">Coming soon</span></div>${fig("event")}</div><div class="ct"><p class="nm">No events listed yet</p><p class="mt">Know a clinic, game or try-it day?</p><p class="tr"><b style="color:var(--ori)">Add an event</b></p></div></a>`;
  }
  function catBar(active, base) {
    const link = (k) => base ? href({ ...base, s: k === "all" ? "" : k }) : (k === "all" ? "#home" : href({ s: k }));
    const allOn = !active || active === "all";
    return `<nav class="cats" aria-label="Sports">
      <a class="cat" href="${link("all")}" aria-current="${allOn}"><span class="ic">${I.all}</span><span class="lb">All</span></a>
      ${BAR.map((k) => `<a class="cat" data-k="${k}" href="${link(k)}" aria-current="${active === k}"><span class="ic">${fig(k)}</span><span class="lb">${E(sname(k))}</span></a>`).join("")}
      <a class="cat" href="${withOver("sheet", "sports")}"><span class="ic">${I.plus}</span><span class="lb">All sports</span></a>
    </nav>`;
  }
  function finder(o = {}) {
    const where = o.where ? o.where.label : null;
    return `<div class="finder" id="finder"><div class="wrap">
      <a class="pill" href="${withOver("sheet", "search")}" role="button" aria-label="Search by place and sport">
        <span class="pt"><b>${E(where || "Where do you want to play?")}</b><span class="ps">${E(o.sport ? sname(o.sport) : "Any sport")} · ${where ? "Change" : "City, state, or ZIP code"}</span></span>
        <span class="go">${I.search}</span>
      </a>
      ${catBar(o.sport, o.base)}
    </div></div>`;
  }
  function top(current) {
    const cur = (v) => current === v ? ' aria-current="page"' : "";
    return `<div class="beta"><div class="wrap"><span>This directory is new and still growing.</span><a href="#v=help">Help us build it</a></div></div>
    <header class="top"><div class="wrap">
      <a class="iconbtn" href="${withOver("menu", "1")}" aria-label="Open menu">${I.menu}</a>
      <a class="brand" href="#home"><img src="/favicon.svg" alt="" width="36" height="36"><span>Adaptive Sports Near Me</span></a>
      <nav class="toplinks" aria-label="Main"><a href="#home"${cur("home")}>Programs</a><a href="#v=grants"${cur("grants")}>Grants</a><a href="#v=events"${cur("events")}>Events</a><a href="#v=help"${cur("help")}>Help build this</a></nav>
      <a class="iconbtn topadd" href="#v=add" aria-label="Add a program">${I.plus}</a>
    </div></header>`;
  }
  function letter() {
    return `<section class="letter" aria-labelledby="lt"><div class="wrap">
      <div><h2 id="lt">Get the letter</h2><p>New programs, grants and events, sent when there is something worth sending.</p></div>
      <form data-form="letter" novalidate>
        <label class="sr" for="lem">Email address</label>
        <input id="lem" type="email" name="em" autocomplete="email" placeholder="Your email address" required>
        <input class="hp" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button class="btn btn-ink" type="submit">Get the letter</button>
        <p class="fine" data-msg>No spam. Leave any time.</p>
      </form>
    </div></section>`;
  }
  function footer() {
    return `${letter()}<footer><div class="wrap">
      <div class="fcols">
        <div><h3>Find</h3><ul><li><a href="#home">Programs</a></li><li><a href="#v=grants">Grants</a></li><li><a href="#v=events">Events</a></li><li><a href="#v=states">Browse by state</a></li></ul></div>
        <div><h3>Help build this</h3><ul><li><a href="#v=add">Add a program</a></li><li><a href="#v=add-event">Add an event</a></li><li><a href="#v=update">Suggest an update</a></li><li><a href="#v=update&rel=run">Claim your listing</a></li></ul></div>
        <div><h3>Resources</h3><ul><li><a href="#v=resources">State directories</a></li><li><a href="#v=resources">Veteran-owned businesses</a></li></ul></div>
        <div><h3>About</h3><ul><li><a href="#v=help">How we verify</a></li><li><a href="#v=help">Accessibility</a></li></ul></div>
      </div>
      <div class="fbase"><img src="/favicon.svg" alt="Adaptive Sports Near Me"><span>Adaptive Sports Near Me is a free directory from Adapt To Life. Programs are run by the organizations listed.</span></div>
    </div></footer>`;
  }
  const page = (current, body, o = {}) => `${top(current)}${o.finder === false ? "" : finder(o)}<main id="main">${body}</main>${o.foot === false ? "" : footer()}`;
  const sec = (title, sub, see, body) => `<section><div class="sh"><div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ""}</div>${see ? `<a class="see" href="${see}">See all</a>` : ""}</div>${body}</section>`;

  // Spread a list across states so a rail shows many places, not one city.
  function spread(list, n) {
    const by = {}; for (const p of list) (by[p.state || "~"] = by[p.state || "~"] || []).push(p);
    const qs = Object.values(by).sort((a, b) => b.length - a.length), out = [];
    while (out.length < n && qs.some((q) => q.length)) for (const q of qs) { if (q.length && out.length < n) out.push(q.shift()); }
    return out;
  }
  const verifiedFirst = (a, b) => (b.verified - a.verified) || ((b.placed ? 1 : 0) - (a.placed ? 1 : 0)) || (Date.parse(b.lastChecked || 0) - Date.parse(a.lastChecked || 0)) || a.name.localeCompare(b.name);

  /* ---------- state tile map ---------- */
  const TILE = { AK: [0, 0], ME: [0, 10], WI: [1, 5], VT: [1, 9], NH: [1, 10], WA: [2, 0], ID: [2, 1], MT: [2, 2], ND: [2, 3], MN: [2, 4], IL: [2, 5], MI: [2, 6], NY: [2, 8], MA: [2, 9], RI: [2, 10], OR: [3, 0], NV: [3, 1], WY: [3, 2], SD: [3, 3], IA: [3, 4], IN: [3, 5], OH: [3, 6], PA: [3, 7], NJ: [3, 8], CT: [3, 9], CA: [4, 0], UT: [4, 1], CO: [4, 2], NE: [4, 3], MO: [4, 4], KY: [4, 5], WV: [4, 6], VA: [4, 7], MD: [4, 8], DE: [4, 9], AZ: [5, 1], NM: [5, 2], KS: [5, 3], AR: [5, 4], TN: [5, 5], NC: [5, 6], SC: [5, 7], DC: [5, 8], OK: [6, 3], LA: [6, 4], MS: [6, 5], AL: [6, 6], GA: [6, 7], HI: [7, 0], TX: [7, 3], FL: [7, 8] };
  function tileMap(current) {
    const n = (st) => (data.byState[st] || []).length;
    const lv = (c) => c >= 60 ? 3 : c >= 25 ? 2 : c >= 1 ? 1 : 0;
    const tiles = Object.entries(TILE).map(([st, [r, c]]) => `<a class="tile l${lv(n(st))}" style="grid-row:${r + 1};grid-column:${c + 1}" href="#st=${st}" aria-label="${E(SN[st])}" aria-current="${current === st}">${st}</a>`).join("");
    return `<div class="tiles">${tiles}</div>
      <p class="legend"><span><i style="background:var(--ors)"></i>A few</span><span><i style="background:#F1BE98"></i>More</span><span><i style="background:var(--or)"></i>The most</span></p>
      <label class="statepick"><span class="sr">Choose a state</span><select data-statepick><option value="">Or choose a state from the list</option>${Object.keys(SN).sort((a, b) => SN[a].localeCompare(SN[b])).map((st) => `<option value="${st}">${E(SN[st])}</option>`).join("")}</select></label>`;
  }

  /* ---------- where: city, ZIP or state, placed only at the city ---------- */
  async function resolve(q) {
    const raw = String(q || "").trim();
    const w = P.parsePlace(raw, items);
    if (!w) return { q: raw, label: raw, bad: true };
    w.q = raw;
    const zip = raw.match(/^\d{5}/);
    if (zip) {
      ZCTA = ZCTA || await fetchJSON("/design/zcta.json");
      const c = ZCTA[zip[0]];
      if (c) {
        w.coords = c;
        await places();
        let best = null, bd = 9;
        for (const [k, v] of Object.entries(PLACES)) {
          if (!k.startsWith(w.state + "|")) continue;
          const d = miles(c, v); if (d < bd) { bd = d; best = k.split("|")[1]; }
        }
        if (best) { w.city = best.replace(/\b\w/g, (m) => m.toUpperCase()); w.label = `${zip[0]}, ${w.city}, ${w.state}`; }
      }
      return w;
    }
    if (w.city) { await places(); const c = PLACES[w.state + "|" + norm(w.city)]; if (c) w.coords = c; }
    return w;
  }
  const matches = (p, s) => !s ? true : s === "multi" ? p.key0 === "multi" && p.key === "multi" : (p.key === s || p.keys.includes(s));

  // Near = in your city, then within about 25 miles, then the rest of your state, then listings with no city.
  function nearGroups(w, s) {
    const pool = items.filter((p) => matches(p, s));
    const cityRe = w.city ? new RegExp("^" + escRe(norm(w.city)) + "\\b") : null;
    const inCity = [], near = [], rest = [], noCity = [];
    for (const p of pool) {
      const d = w.coords && p.placed ? miles(w.coords, [p.lat, p.lng]) : null;
      const sameCity = cityRe && p.state === w.state && p.cityName && cityRe.test(norm(p.cityName));
      if (sameCity && (d == null || d < 15)) inCity.push([p, null]);
      else if (d != null && d <= 27) near.push([p, d]);
      else if (p.state === w.state && p.placed) rest.push([p, d]);
      else if (p.state === w.state) noCity.push([p, null]);
    }
    const byD = (a, b) => (b[0].verified - a[0].verified) || ((a[1] ?? 0) - (b[1] ?? 0));
    inCity.sort((a, b) => (b[0].verified - a[0].verified) || a[0].name.localeCompare(b[0].name));
    near.sort((a, b) => a[1] - b[1]);
    rest.sort((a, b) => w.coords ? a[1] - b[1] : verifiedFirst(a[0], b[0]));
    noCity.sort((a, b) => verifiedFirst(a[0], b[0]));
    return { inCity, near, rest, noCity, byD };
  }
  function groupBlock(id, title, sub, pairs, limit = 6, compact = false) {
    if (!pairs.length) return "";
    const cards = pairs.map(([p, d], i) => card(p, d).replace('<a class="card"', `<a class="card${i >= limit ? " hide" : ""}"`)).join("");
    return `<section class="group" aria-labelledby="g-${id}"><div class="gh"><h2 id="g-${id}">${title}</h2><span class="n">${pairs.length}</span></div>${sub ? `<p class="gsub">${sub}</p>` : ""}
      <div class="grid${compact ? " compact" : ""}" id="grid-${id}">${cards}</div>
      ${pairs.length > limit ? `<button class="more" type="button" data-open="grid-${id}">Show all ${pairs.length}</button>` : ""}</section>`;
  }

  /* ---------- pages ---------- */
  function homePage() {
    const rail = (k, n = 10) => `<div class="rail">${spread(items.filter((p) => p.key === k && p.verified).sort(verifiedFirst), n).map((p) => card(p)).join("")}</div>`;
    const multiRail = `<div class="rail">${spread(items.filter((p) => p.key === "multi" && p.pics.length >= 2 && p.verified).sort(verifiedFirst), 10).map((p) => card(p)).join("")}</div>`;
    const grantRail = `<div class="rail">${grants.filter((g) => g.audience === "athlete" && g.open).sort((a, b) => (!!grantAmount(b) - !!grantAmount(a)) || a.name.localeCompare(b.name)).slice(0, 10).map(grantCard).join("")}</div>`;
    const hero = `<section class="hero" aria-labelledby="h1">
      <div class="copy"><h1 id="h1">Find your place in adaptive sports.</h1><p>Every listing says who checked it and when.</p></div>
      <div class="stage" aria-hidden="true">${["swimming", "basketball", "skiing"].map((k) => fig(k, `;--fd:${tone(k)[1]}`)).join("")}</div>
      <div class="floor" aria-hidden="true"></div>
      <p class="names" aria-hidden="true"><span>Swimming</span><span>Basketball</span><span>Skiing</span></p>
    </section>`;
    return page("home", `<div class="wrap">${hero}
      ${sec("Tennis", "Wheelchair and adaptive tennis, checked by a person.", href({ s: "tennis" }), rail("tennis"))}
      ${sec("Places with many sports", "One program, several ways to play.", href({ s: "multi" }), multiRail)}
      ${sec("Soccer", null, href({ s: "soccer" }), rail("soccer"))}
      ${sec("Horseback riding", "Adaptive and therapeutic riding.", href({ s: "equestrian" }), rail("equestrian"))}
      ${sec("Grants for athletes", "Money for equipment, fees and travel. You apply on the grant maker's site.", "#v=grants&a=athlete", grantRail)}
      ${sec("Baseball", "Many are Miracle League fields.", href({ s: "baseball" }), rail("baseball"))}
      ${sec("Events", null, "#v=events", `<div class="rail">${eventEmptyCard()}</div>`)}
      ${sec("Browse by state", "Tap a state to see everything listed there.", null, tileMap())}
    </div>`, { base: null });
  }

  async function resultsPage(h) {
    const w = await resolve(h.q), s = h.s || "";
    const base = { q: h.q };
    if (w.bad) {
      return page("home", `<div class="wrap"><div class="phead"><h1>We could not find “${E(h.q)}”</h1><p>Try a city and state, like Columbus, OH, or a 5-digit ZIP code.</p></div>
        <p style="margin-top:18px"><a class="btn btn-or" href="${withOver("sheet", "search")}">Search again</a></p>
        ${sec("Browse by state", null, null, tileMap())}</div>`, { where: { label: h.q }, sport: s, base });
    }
    lastWhere = w;
    const g = nearGroups(w, s);
    const st = SN[w.state], cityLabel = w.city || st;
    const what = s ? (s === "multi" ? "Multi-sport programs" : sname(s)) : "Programs";
    const total = g.inCity.length + g.near.length + g.rest.length + g.noCity.length;
    let body = `<div class="phead"><h1>${E(what)} near ${E(w.city ? w.city + ", " + w.state : st)}</h1>
      <p>${w.coords ? "Closest first. Distances are city to city, so check the website for the exact place." : w.city ? `We could not place ${E(w.city)} on our map, so here is everything in ${E(st)}.` : `Everything listed in ${E(st)}. Add a city or ZIP code to see the closest first.`}</p></div>`;
    if (total) {
      const c = !!s && s !== "multi";
      if (w.city) body += groupBlock("city", `In ${E(w.city)}`, null, g.inCity, 6, c);
      if (w.coords) body += groupBlock("near", "Within about 25 miles", null, g.near, 6, c);
      body += groupBlock("rest", w.city ? `Elsewhere in ${E(st)}` : `In ${E(st)}`, null, g.rest, c ? 8 : 6, c);
      body += groupBlock("state", `Across ${E(st)}`, "These list a state but no city we can place. Check the website for where they meet.", g.noCity, c ? 8 : 6, c);
      if (w.city && !g.inCity.length && !g.near.length) body = body.replace('<section class="group"', `<p class="note">Nothing listed in ${E(w.city)} or within about 25 miles yet. Here is the rest of ${E(st)}.</p><section class="group"`);
    } else {
      // Never an empty page: the closest anywhere, then a way to help.
      const far = items.filter((p) => matches(p, s) && p.placed).map((p) => [p, w.coords ? miles(w.coords, [p.lat, p.lng]) : null]);
      far.sort((a, b) => w.coords ? a[1] - b[1] : verifiedFirst(a[0], b[0]));
      body += `<p class="note"><b>Nothing for ${E(lower(s) || "this")} in ${E(st)} yet.</b> Here are the closest we have in other states. Know one near you? <a href="#v=add">Add a program</a>.</p>`;
      body += groupBlock("far", w.coords ? "Closest in other states" : "In other states", null, far.slice(0, 12));
    }
    body += `<div style="margin-top:36px"><a class="tlink" href="#st=${w.state}${s ? "&s=" + s : ""}">See all of ${E(st)}</a></div>`;
    return page("home", `<div class="wrap">${body}</div>`, { where: w, sport: s, base });
  }

  function sportPage(h) {
    const k = h.s;
    const list = items.filter((p) => matches(p, k)).sort(verifiedFirst);
    const byState = {}; for (const p of list) if (p.state) byState[p.state] = (byState[p.state] || 0) + 1;
    const topStates = Object.entries(byState).sort((a, b) => b[1] - a[1]);
    const shown = spread(list, list.length);
    const limit = 12;
    const banner = `<div class="banner${FLOOR.has(k) ? " floorprop" : ""}" style="${toneVars(k)}"><div class="bt"><span>Adaptive</span><b>${E(sname(k))}</b></div>${k === "multi" ? fig("multi") : fig(k)}</div>`;
    const body = `<div class="wrap">${banner}
      <div class="phead" style="margin-top:18px"><p>${E(NOTES[k] || (k === "multi" ? "Programs that offer several sports." : ""))} Pick a state, or search near you for the closest first.</p></div>
      <div class="chips" role="list">${topStates.map(([st, n]) => `<a class="chip" role="listitem" href="#st=${st}&s=${k}">${E(SN[st] || st)} <span class="n">${n}</span></a>`).join("")}</div>
      <section class="group"><div class="gh"><h2>${E(k === "multi" ? "Multi-sport programs" : sname(k) + " programs")}</h2></div>
        <div class="grid${k !== "multi" ? " compact" : ""}" id="grid-sport">${shown.map((p, i) => card(p).replace('<a class="card"', `<a class="card${i >= limit ? " hide" : ""}"`)).join("")}</div>
        ${shown.length > limit ? `<button class="more" type="button" data-open="grid-sport">Show all ${shown.length}</button>` : ""}
      </section>
      ${sec("Grants for athletes", "Some grants pay for sport chairs, fees and travel.", "#v=grants&a=athlete", `<div class="rail">${grants.filter((g) => g.audience === "athlete" && g.open).slice(0, 8).map(grantCard).join("")}</div>`)}
    </div>`;
    return page("home", body, { sport: k, base: null });
  }

  function statePage(h) {
    const st = h.st.toUpperCase(), s = h.s || "";
    const all = items.filter((p) => p.state === st);
    const list = all.filter((p) => matches(p, s));
    const sportsHere = {}; for (const p of all) sportsHere[p.key] = (sportsHere[p.key] || 0) + 1;
    const placed = list.filter((p) => p.placed).sort((a, b) => (b.verified - a.verified) || a.cityName.localeCompare(b.cityName));
    const noCity = list.filter((p) => !p.placed).sort(verifiedFirst);
    const shape = STATES.shapes[st];
    const banner = `<div class="banner" style="--t:#F4F0E9;--d:var(--or)"><div class="bt"><span>Adaptive sports in</span><b style="color:var(--ink)">${E(SN[st] || st)}</b></div>${shape ? `<svg class="outline" viewBox="0 0 100 100" aria-hidden="true"><path d="${shape}"/></svg>` : ""}</div>`;
    const chips = `<div class="chips"><a class="chip" href="#st=${st}" aria-current="${!s}">All sports <span class="n">${all.length}</span></a>${Object.entries(sportsHere).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<a class="chip" href="#st=${st}&s=${k}" aria-current="${s === k}">${E(sname(k))} <span class="n">${n}</span></a>`).join("")}</div>`;
    let body = `<div class="wrap">${banner}
      <div class="phead" style="margin-top:18px"><p>Search a city or ZIP code in ${E(SN[st])} to see the closest first.</p></div>
      <p style="margin:14px 0 0"><a class="btn btn-line" href="${withOver("sheet", "search")}">${I.search}Search near a city</a></p>
      ${chips}`;
    if (!list.length) body += `<p class="note"><b>No ${E(lower(s))} listed in ${E(SN[st])} yet.</b> <a href="${href({ s })}">See ${E(lower(s))} in other states</a> or <a href="#v=add">add a program</a>.</p>`;
    body += groupBlock("placed", "By city", null, placed.map((p) => [p, null]), 9);
    body += groupBlock("nocity", `Across ${E(SN[st])}`, "These list the state but no city we can place. Check the website for where they meet.", noCity.map((p) => [p, null]), 6);
    body += sec("Other states", null, null, tileMap(st)) + `</div>`;
    return page("home", body, { sport: s, base: { st } });
  }

  function listingPage(h) {
    const p = byId[h.p];
    if (!p) return page("home", `<div class="wrap"><div class="phead"><h1>We could not find that listing</h1><p>It may have moved or closed.</p></div><p><a class="btn btn-or" href="#home">Find a program</a></p></div>`, { finder: false });
    const trio = p.key === "multi" && p.pics.length >= 2;
    const fromHere = lastWhere && lastWhere.coords && p.placed ? miles(lastWhere.coords, [p.lat, p.lng]) : null;
    const date = day(p.lastChecked, true);
    const share = withOver("share", "1");
    const hero = `<div class="lhero${FLOOR.has(p.key) ? " floorprop" : ""}${trio ? " trio3" : ""}" style="${toneVars(trio ? "multi" : p.key)}">
      ${trio ? figTrio(p.pics) : fig(p.key)}
      <span class="tag">${E(trio ? "Multi-sport" : sname(p.key))}</span>
      <a class="hb back" href="#home" data-back aria-label="Back"><i>${I.back}</i></a>
      <a class="hb share" href="${share}" aria-label="Share this program"><i>${I.share}</i></a>
      ${p.verified ? `<span class="vp">${I.check}Verified</span>` : ""}
    </div>`;
    const trust = p.verified
      ? `<div class="trustbox"><div class="ts ok">${I.checkL}Verified</div><p>A person on our team checked this program against an official source. Schedules change, so check the website before you go.</p><p class="dt">${date ? "Last checked " + date : "No check date on file yet"}</p></div>`
      : `<div class="trustbox"><div class="ts">${I.dot}Not yet verified</div><p>No one on our team has confirmed this listing yet. Check the website before you go.</p><p class="dt">${date ? "Last checked " + date : "Not checked yet"}</p></div>`;
    const m = /Sports and activities:\s*(.+?)(?:\.\s*Athletes served:\s*(.+?))?\.?$/i.exec(p.desc || "");
    let about = "";
    if (m) about = `<dl class="facts"><div><dt>Sports and activities</dt><dd>${E(m[1])}</dd></div>${m[2] ? `<div><dt>Who it's for</dt><dd>${E(m[2])}</dd></div>` : ""}</dl>`;
    else if (p.desc) about = `<p>${E(p.desc)}</p>`;
    const facts = [["Ages", p.ages], ["Cost", p.cost], ["Equipment", p.equipment]].filter(([, v]) => v);
    const whereText = p.placed
      ? `<p><b>${E(p.cityName)}, ${E(SN[p.state])}.</b> We show the city only. The website has the exact place and times.</p>`
      : p.state ? `<p><b>${E(SN[p.state])}.</b> This listing does not name a city we can place${p.cityName ? ` (it says “${E(p.city)}”)` : ""}. The website has where they meet.</p>`
        : `<p>This listing does not say where it meets yet. If you know, <a href="#v=update&id=${p.id}">tell us</a>.</p>`;
    // More of the same sport, closest to this program's city first.
    let more = items.filter((x) => x.id !== p.id && x.key === p.key && x.placed);
    if (p.placed) more = more.map((x) => [x, miles([p.lat, p.lng], [x.lat, x.lng])]).sort((a, b) => a[1] - b[1]).slice(0, 8);
    else more = more.filter((x) => x.state === p.state).concat(more.filter((x) => x.state !== p.state)).slice(0, 8).map((x) => [x, null]);
    const moreTitle = `More ${E(trio ? "multi-sport" : lower(p.key))} ${p.placed ? "near " + E(p.cityName) : p.state ? "in and near " + E(SN[p.state]) : ""}`;
    const visit = p.webOk
      ? `<a class="btn btn-ink" href="${E(p.website)}" target="_blank" rel="noopener">Visit website${I.ext}</a>`
      : `<a class="btn btn-ink" href="#v=update&id=${p.id}">Suggest a website</a>`;
    const host = p.webOk ? P.host(p.website) : null;
    const body = `<div class="wrap lpage">${hero}
      <div class="lgrid"><div class="lmain">
        <h1>${E(p.name)}</h1>
        <p class="lmeta"><b>${E(sportLine(p))}</b> · ${E(placeText(p))}${fromHere != null && norm(p.cityName) !== norm(lastWhere.city || "") ? ` · ${mi(fromHere)} from ${E(lastWhere.city || lastWhere.label)}` : ""}</p>
        ${trust}
        ${about ? `<section class="lsec"><h2>About this program</h2>${about}</section>` : ""}
        ${facts.length ? `<section class="lsec"><h2>Good to know</h2><dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${E(v)}</dd></div>`).join("")}</dl></section>` : ""}
        <section class="lsec"><h2>Where you'll play</h2>${whereText}</section>
        <section class="lsec"><h2>Something wrong or missing?</h2><p>Tell us and a person will check it.</p>
          <div class="linkrow"><a class="btn btn-line" href="#v=update&id=${p.id}">Suggest an update</a><a class="btn btn-line" href="#v=update&id=${p.id}&rel=run">I run this program</a></div></section>
      </div>
      <aside class="lside"><div class="sbox">
        <div class="ts${p.verified ? " ok" : ""}">${p.verified ? I.check + "Verified" : "Not yet verified"}</div>
        <p class="d">${date ? "Last checked " + date : "Not checked yet"}</p>
        ${visit}
        <p class="fine">${host ? `Opens ${E(host)}. ` : ""}Programs are run by the organizations listed, not by us.</p>
        <p style="margin:10px 0 0"><a class="tlink" href="${share}">Share this program</a></p>
      </div></aside></div>
      ${more.length ? sec(moreTitle, null, p.placed ? href({ q: `${p.cityName}, ${p.state}`, s: p.key }) : null, `<div class="rail">${more.map(([x, d]) => card(x, d)).join("")}</div>`) : ""}
    </div>
    <div class="actbar"><div class="st"><b class="${p.verified ? "ok" : ""}">${p.verified ? I.check + "Verified" : "Not yet verified"}</b>${date ? "Checked " + day(p.lastChecked) : "Not checked yet"}</div>${visit}</div>`;
    return page("home", body, { finder: false });
  }

  function grantsPage(h) {
    const a = h.a === "program" ? "program" : "athlete";
    const list = grants.filter((g) => g.audience === a).sort((x, y) => (y.open - x.open) || (!!grantAmount(y) - !!grantAmount(x)) || x.name.localeCompare(y.name));
    const body = `<div class="wrap">
      <div class="banner" style="${toneVars("grant")}"><div class="bt"><span>Funding</span><b>Grants</b></div>${fig("grant")}</div>
      <div class="phead" style="margin-top:18px"><p>${a === "athlete" ? "Money for sport chairs, equipment, fees and travel. You apply on the grant maker's site." : "Funding for adaptive programs and the groups that run them. You apply on the grant maker's site."}</p></div>
      <nav class="seg" aria-label="Who the grant is for"><a href="#v=grants&a=athlete" aria-current="${a === "athlete"}">For athletes</a><a href="#v=grants&a=program" aria-current="${a === "program"}">For programs</a></nav>
      <section class="group"><div class="grid compact">${list.map(grantCard).join("")}</div></section>
      <p class="note" style="margin-top:32px">Know a grant we are missing? <a href="#v=add">Tell us about it</a>.</p>
    </div>`;
    return page("grants", body, { finder: false });
  }

  function grantPage(h) {
    const g = grantById[h.g];
    if (!g) return page("grants", `<div class="wrap"><div class="phead"><h1>We could not find that grant</h1></div><p><a class="btn btn-or" href="#v=grants">See all grants</a></p></div>`, { finder: false });
    const amt = grantAmount(g), dl = deadlineText(g);
    const apply = /^https?:/.test(g.url || "") ? `<a class="btn btn-ink" href="${E(g.url)}" target="_blank" rel="noopener">Apply on their site${I.ext}</a>` : `<a class="btn btn-ink" href="#v=update">Suggest a link</a>`;
    const others = grants.filter((x) => x.id !== g.id && x.audience === g.audience).slice(0, 8);
    const body = `<div class="wrap lpage">
      <div class="lhero" style="${toneVars("grant")}">${fig("grant")}<span class="tag">Grant</span><a class="hb back" href="#v=grants&a=${g.audience}" data-back aria-label="Back"><i>${I.back}</i></a></div>
      <div class="lgrid"><div class="lmain">
        <h1>${E(g.name)}</h1>
        <p class="lmeta"><b>From ${E(g.source || "the grant maker")}</b> · ${g.audience === "program" ? "For programs" : "For athletes"}</p>
        <section class="lsec" style="border:0;padding-top:0;margin-top:22px"><dl class="facts">
          <div><dt>Amount</dt><dd>${E(amt || "Varies. Their site has the details.")}</dd></div>
          <div><dt>Deadline</dt><dd>${E(g.open ? (dl ? dl.replace(/^Deadline: /, "") : "Not listed. Check their site.") : "Closed for now")}</dd></div>
          <div><dt>Who can apply</dt><dd>${g.audience === "program" ? "Programs and organizations" : "Athletes, or families applying for an athlete"}</dd></div>
        </dl></section>
        ${g.desc ? `<section class="lsec"><h2>What it pays for</h2><p>${E(cleanText(g.desc))}</p></section>` : ""}
        <section class="lsec"><h2>How to apply</h2><p>Apply directly with ${E(g.source || "the grant maker")}. We do not take applications or handle money.</p></section>
        <section class="lsec"><h2>Something wrong or missing?</h2><div class="linkrow"><a class="btn btn-line" href="#v=update">Suggest an update</a></div></section>
      </div>
      <aside class="lside"><div class="sbox"><div class="ts">${E(amt || "Amount varies")}</div><p class="d">${E(g.open ? (dl || "Deadline not listed") : "Closed for now")}</p>${apply}<p class="fine">Not checked by a person yet. We do not have a check date for grants.</p></div></aside></div>
      ${sec(g.audience === "program" ? "More grants for programs" : "More grants for athletes", null, `#v=grants&a=${g.audience}`, `<div class="rail">${others.map(grantCard).join("")}</div>`)}
    </div>
    <div class="actbar"><div class="st"><b>${E(amt || "Amount varies")}</b>${E(g.open ? (dl ? dl.replace(/^Deadline: /, "") : "Deadline not listed") : "Closed for now")}</div>${apply}</div>`;
    return page("grants", body, { finder: false });
  }

  function eventsPage() {
    const body = `<div class="wrap">
      <div class="banner" style="${toneVars("event")}"><div class="bt"><span>Try it, play it</span><b>Events</b></div>${fig("event")}</div>
      <div class="empty">
        <div><h2>No events listed yet</h2>
          <p>This part of the directory is just getting started. Know about a clinic, try-it day, game or tournament? Add it, and a person on our team will check it before it goes up.</p>
          <div class="linkrow"><a class="btn btn-or" href="#v=add-event">${I.plus}Add an event</a><a class="btn btn-line" href="#lt" data-letter>Get the letter</a></div>
        </div>
      </div>
    </div>`;
    return page("events", body, { finder: false });
  }

  const STATE_OPTS = (sel) => `<option value="">Choose a state</option>${Object.keys(SN).sort((a, b) => SN[a].localeCompare(SN[b])).map((st) => `<option value="${st}"${sel === st ? " selected" : ""}>${E(SN[st])}</option>`).join("")}`;
  const SPORT_OPTS = `<option value="">Choose a sport</option>${Object.keys(OPT).filter((k) => k !== "grant" && k !== "event").sort((a, b) => sname(a).localeCompare(sname(b))).map((k) => `<option value="${k}">${E(sname(k))}</option>`).join("")}`;
  const proto = `<p class="done" data-msg hidden></p>`;

  function formPage(h) {
    const v = h.v;
    if (v === "add-event") return page("events", `<div class="wrap"><div class="phead"><h1>Add an event</h1><p>Clinics, try-it days, games and tournaments. A person checks every event before it goes up.</p></div>
      <form class="form" data-form="event" novalidate>
        <label>Event name<input name="title" required autocomplete="off"></label>
        <div class="row2"><label>Date<input type="date" name="date" required></label><label>Start time <small>(optional)</small><input type="time" name="time"></label></div>
        <div class="row2"><label>City<input name="city" required autocomplete="address-level2"></label><label>State<select name="state" required>${STATE_OPTS()}</select></label></div>
        <label>Sport<select name="sport">${SPORT_OPTS}</select></label>
        <label>Website or sign-up link<input type="url" name="url" placeholder="https://" inputmode="url"></label>
        <label>Your email <small>So we can ask a question if something is unclear. We never show it.</small><input type="email" name="em" required autocomplete="email"></label>
        <input class="hp" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button class="btn btn-or" type="submit">Send for review</button>${proto}
      </form></div>`, { finder: false });
    if (v === "add") return page("help", `<div class="wrap"><div class="phead"><h1>Add a program</h1><p>Know an adaptive sports program? Tell us. A person checks it against an official source before it shows as Verified.</p></div>
      <form class="form" data-form="program" novalidate>
        <label>Program name<input name="pn" required autocomplete="off"></label>
        <label>Organization <small>(if different)</small><input name="org" autocomplete="organization"></label>
        <label>Sport<select name="sport">${SPORT_OPTS}</select></label>
        <div class="row2"><label>City<input name="city" autocomplete="address-level2"></label><label>State<select name="state">${STATE_OPTS()}</select></label></div>
        <label>Website<input type="url" name="url" placeholder="https://" inputmode="url"></label>
        <label>Your email <small>We never show it.</small><input type="email" name="em" required autocomplete="email"></label>
        <label>Anything else? <small>(optional)</small><textarea name="notes"></textarea></label>
        <input class="hp" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button class="btn btn-or" type="submit">Send for review</button>${proto}
      </form></div>`, { finder: false });
    if (v === "update") {
      const p = byId[h.id];
      const run = h.rel === "run";
      return page("help", `<div class="wrap"><div class="phead"><h1>${run ? "Confirm your listing" : "Suggest an update"}</h1><p>${p ? `For <b>${E(p.name)}</b>, ${E(placeText(p))}.` : "Tell us which listing and what to change."} ${run ? "If you run this program, confirming it is the fastest way to get it Verified." : "A person reads every note."}</p></div>
        <form class="form" data-form="update" novalidate>
          ${p ? "" : `<label>Which listing?<input name="which" required></label>`}
          <fieldset><legend>${run ? "Your role" : "What needs to change?"}</legend>
            ${(run ? ["I run this program", "I work or volunteer there"] : ["Website", "City or state", "Sport", "It has closed", "Something else"]).map((o, i) => `<label class="opt"><input type="radio" name="what" value="${E(o)}"${i === 0 ? " checked" : ""}>${E(o)}</label>`).join("")}
          </fieldset>
          <label>Details<textarea name="notes" required placeholder="${run ? "Anything we should fix, like the website or ages served" : "What should it say?"}"></textarea></label>
          <label>Your email <small>So we can confirm. We never show it.</small><input type="email" name="em" required autocomplete="email"></label>
          <input class="hp" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">
          <button class="btn btn-or" type="submit">Send</button>${proto}
        </form></div>`, { finder: false });
    }
    if (v === "resources") return page("help", `<div class="wrap"><div class="phead"><h1>Resources</h1><p>Directories we trust, gathered in one place.</p></div>
      <section class="group"><div class="grid">
        <a class="card" href="https://adaptivesportsnearme.com/resources/veteran-owned-businesses"><div class="plate" style="${toneVars("veteran-meetup")}"><div class="pl-txt"><span class="pl-big">By state</span><span class="pl-sub">50 directories</span></div>${fig("veteran-meetup")}</div><div class="ct"><p class="nm">Veteran-owned business directories</p><p class="mt">Each state's official list, gathered by Karen Atkinson.</p></div></a>
        <a class="card" href="#v=grants"><div class="plate" style="${toneVars("grant")}"><div class="pl-txt"><span class="pl-big">Grants</span><span class="pl-sub">For athletes and programs</span></div>${fig("grant")}</div><div class="ct"><p class="nm">Grants for equipment and fees</p><p class="mt">Apply on the grant maker's site.</p></div></a>
      </div></section></div>`, { finder: false });
    if (v === "states") return page("home", `<div class="wrap"><div class="phead"><h1>Browse by state</h1><p>Tap a state to see everything listed there.</p></div><div style="margin-top:22px">${tileMap()}</div></div>`, { base: null });
    // help
    return page("help", `<div class="wrap"><div class="phead"><h1>Help build this</h1><p>This directory is new and still growing. It gets better every time someone adds a program, fixes a listing or shares an event.</p></div>
      <section class="group"><div class="grid">
        ${[["Add a program", "#v=add", "multi", "Know a program we are missing?"], ["Add an event", "#v=add-event", "event", "Clinics, try-it days, games."], ["Suggest an update", "#v=update", "tennis", "Fix a website, city or sport."], ["Claim your listing", "#v=update&rel=run", "basketball", "Run a program? Confirm it."]].map(([t, u, k, s]) => `<a class="card" href="${u}"><div class="plate" style="${toneVars(k)}"><div class="pl-txt"><span class="pl-big">${E(t)}</span></div>${fig(k)}</div><div class="ct"><p class="nm">${E(t)}</p><p class="mt">${E(s)}</p></div></a>`).join("")}
      </div></section>
      <section class="lsec" style="margin-top:44px"><h2>How we verify</h2><p><b>Verified</b> means a person on our team checked the program against an official source, like its own website or a national governing body. <b>Not yet verified</b> means no one has confirmed it yet. Every listing shows the date it was last checked.</p></section>
      <section class="lsec"><h2>Accessibility</h2><p>We build for screen readers, keyboards, zoom and large text. If something gets in your way, <a href="#v=update">tell us</a>.</p></section>
    </div>`, { finder: false });
  }

  /* ---------- overlays ---------- */
  function drawer() {
    const row = (u, ic, t) => `<a class="drow" href="${u}"><span class="di">${ic}</span>${E(t)}</a>`;
    return `<div class="scrim" data-close></div><nav class="drawer" role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="dtitle">
      <div class="dh"><h2 id="dtitle">Menu</h2><a class="iconbtn" href="${href(pageParams())}" data-close aria-label="Close menu">${I.close}</a></div>
      <div class="dsec"><h3>Find</h3>${row("#home", I.pin, "Programs near you")}${row("#v=grants", fig("grant"), "Grants")}${row("#v=events", fig("event"), "Events")}${row("#v=states", I.map, "Browse by state")}</div>
      <div class="dsec"><h3>Sports</h3>${BAR.slice(0, 10).map((k) => row(href({ ...(lastWhere ? { q: lastWhere.q } : {}), s: k }), fig(k), sname(k))).join("")}${row(withOver("sheet", "sports"), I.all, "All sports")}</div>
      <div class="dsec"><h3>Help build this</h3>${row("#v=add", I.plus, "Add a program")}${row("#v=add-event", I.plus, "Add an event")}${row("#v=update&rel=run", I.plus, "Claim your listing")}${row("#v=update", I.plus, "Suggest an update")}</div>
      <div class="dsec"><h3>More</h3>${row("#lt", I.mail, "Get the letter")}${row("#v=resources", I.book, "Resources")}${row("#v=help", I.book, "How we verify")}</div>
    </nav>`;
  }
  function searchSheet() {
    const h = pageParams();
    const cur = h.s || "";
    const q = h.q || "";
    return `<div class="scrim" data-close></div><div class="sheet" role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="stitle">
      <div class="shh"><a class="iconbtn" href="${href(pageParams())}" data-close aria-label="Close search">${I.close}</a><h2 id="stitle">Find a program</h2></div>
      <form class="shb" data-form="search" novalidate>
        <h3>Where?</h3>
        <label class="where"><span class="sr">City, state, or ZIP code</span>${I.search}<input name="q" value="${E(q)}" placeholder="City, state, or ZIP code" autocomplete="off" enterkeyhint="search"></label>
        <button class="locbtn" type="button" data-loc>${I.loc}Use my location</button>
        <p class="locmsg" data-locmsg aria-live="polite"></p>
        <h3 style="margin-top:22px">Which sport?</h3>
        <input type="hidden" name="s" value="${E(cur)}">
        <div class="sgrid">
          <button type="button" class="sopt" data-pick="" aria-pressed="${!cur}"><span class="ic">${I.all}</span>Any sport</button>
          ${BAR.concat(ALLSPORTS.filter((k) => !BAR.includes(k))).map((k) => `<button type="button" class="sopt" data-pick="${k}" aria-pressed="${cur === k}"><span class="ic">${fig(k)}</span>${E(sname(k))}</button>`).join("")}
        </div>
        <div class="shf" style="margin:20px calc(var(--pad) * -1) -24px"><button class="clear" type="button" data-clear>Clear all</button><button class="btn btn-or" type="submit">${I.search}Search</button></div>
      </form>
    </div>`;
  }
  function sportsSheet() {
    const h = pageParams();
    const base = h.q ? { q: h.q } : h.st ? { st: h.st } : {};
    return `<div class="scrim" data-close></div><div class="sheet" role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="sstitle">
      <div class="shh"><a class="iconbtn" href="${href(pageParams())}" data-close aria-label="Close">${I.close}</a><h2 id="sstitle">All sports</h2></div>
      <div class="shb"><div class="sgrid">${ALLSPORTS.map((k) => `<a class="sopt" href="${href({ ...base, s: k })}"><span class="ic">${fig(k)}</span>${E(sname(k))}</a>`).join("")}</div>
      <p class="sheet-foot">Don't see your sport? <a href="#v=add">Tell us what is missing</a>.</p></div>
    </div>`;
  }
  function shareSheet() {
    const p = byId[pageParams().p];
    if (!p) return "";
    const trio = p.key === "multi" && p.pics.length >= 2;
    return `<div class="scrim" data-close></div><div class="sheet" role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="shtitle">
      <div class="shh"><a class="iconbtn" href="${href(pageParams())}" data-close aria-label="Close">${I.close}</a><h2 id="shtitle">Share this program</h2></div>
      <div class="shb">
        <div class="poster" style="${toneVars(trio ? "multi" : p.key)}" role="img" aria-label="${E(`${p.name}, ${trio ? "multi-sport" : lower(p.key)}, ${placeText(p)}. Adaptive Sports Near Me`)}">
          <span class="k">${E(trio ? "Multi-sport" : sname(p.key))}</span>
          ${trio ? figTrio(p.pics) : fig(p.key)}
          <span class="pn">${E(p.name)}<span class="pp">${E(placeText(p))}</span></span>
          <span class="pf"><span>adaptivesportsnearme.com</span><span class="badge"><img src="/favicon.svg" alt=""></span></span>
        </div>
        <div class="linkrow" style="justify-content:center;margin-top:20px"><button class="btn btn-ink" type="button" data-copy>Copy link</button><button class="btn btn-line" type="button" data-native>Share</button></div>
        <p class="locmsg" data-copymsg aria-live="polite" style="text-align:center"></p>
        <p class="sheet-foot" style="text-align:center">Sized for an Instagram post. The link opens this listing.</p>
      </div>
    </div>`;
  }

  /* ---------- render ---------- */
  let lastKey = null, opener = null, navs = 0;
  async function render() {
    const h = H();
    const pp = pageParams();
    const key = JSON.stringify(pp);
    if (key !== lastKey) {
      const prev = lastKey; lastKey = key;
      let html;
      if (pp.p) html = listingPage(pp);
      else if (pp.g) html = grantPage(pp);
      else if (pp.v === "grants") html = grantsPage(pp);
      else if (pp.v === "events") html = eventsPage();
      else if (pp.v) html = formPage(pp);
      else if (pp.q) html = await resultsPage(pp);
      else if (pp.st) html = statePage(pp);
      else if (pp.s) html = sportPage(pp);
      else html = homePage();
      app.innerHTML = html;
      if (prev !== null) { window.scrollTo(0, 0); navs++; }
      const t = { p: (byId[pp.p] || {}).name, g: (grantById[pp.g] || {}).name, q: pp.q && "Near " + pp.q, st: pp.st && SN[pp.st], s: pp.s && sname(pp.s) };
      document.title = [t.p || t.g || t.q || t.st || t.s, "Adaptive Sports Near Me"].filter(Boolean).join(" · ");
    }
    const ov = h.menu ? drawer() : h.sheet === "search" ? searchSheet() : h.sheet === "sports" ? sportsSheet() : h.share ? shareSheet() : "";
    if (ov) {
      if (!over.innerHTML) opener = document.activeElement;
      over.innerHTML = ov; document.body.classList.add("locked");
      const first = over.querySelector('input[name="q"]') || over.querySelector('[role="dialog"]');
      if (first) first.focus({ preventScroll: true });
    } else if (over.innerHTML) {
      over.innerHTML = ""; document.body.classList.remove("locked");
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    }
  }
  const closeOverlay = () => location.replace(href(pageParams()));

  document.addEventListener("click", async (e) => {
    const t = e.target.closest("a, button");
    if (!t) return;
    if (t.matches("[data-close]")) { e.preventDefault(); closeOverlay(); return; }
    if (t.matches("[data-back]")) { if (navs > 0) { e.preventDefault(); history.back(); } return; }
    if (t.matches("[data-open]")) { const g = document.getElementById(t.dataset.open); g.classList.add("open"); t.remove(); return; }
    if (t.matches(".cat[data-k]")) { t.classList.add("tap"); }
    if (t.matches('a[href="#lt"]')) { e.preventDefault(); if (over.innerHTML) closeOverlay(); setTimeout(() => { const el = document.getElementById("lt"); el.scrollIntoView({ behavior: "smooth" }); document.getElementById("lem").focus({ preventScroll: true }); }, 60); return; }
    if (t.matches("[data-pick]")) {
      const f = t.closest("form"); f.s.value = t.dataset.pick;
      f.querySelectorAll("[data-pick]").forEach((b) => b.setAttribute("aria-pressed", String(b === t)));
      return;
    }
    if (t.matches("[data-clear]")) { const f = t.closest("form"); f.q.value = ""; f.s.value = ""; f.querySelectorAll("[data-pick]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pick === ""))); f.q.focus(); return; }
    if (t.matches("[data-loc]")) {
      const msg = over.querySelector("[data-locmsg]"), f = t.closest("form");
      if (!navigator.geolocation) { msg.textContent = "Your browser does not share location. Type a city or ZIP code instead."; return; }
      msg.textContent = "Finding the nearest city…";
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await places();
        const c = [pos.coords.latitude, pos.coords.longitude]; let best = null, bd = 30;
        for (const [k, v] of Object.entries(PLACES)) { const d = miles(c, v); if (d < bd) { bd = d; best = k; } }
        if (!best) { msg.textContent = "We could not match your location to a U.S. city. Type a city or ZIP code instead."; return; }
        const [st, city] = best.split("|"); f.q.value = city.replace(/\b\w/g, (m) => m.toUpperCase()) + ", " + st;
        msg.textContent = "We use the nearest city, never your exact spot.";
      }, () => { msg.textContent = "Location is off. Type a city or ZIP code instead."; }, { timeout: 8000, maximumAge: 600000 });
      return;
    }
    if (t.matches("[data-copy]")) { const u = location.href.replace(/&?share=1/, ""); try { await navigator.clipboard.writeText(u); over.querySelector("[data-copymsg]").textContent = "Link copied."; } catch (_) { over.querySelector("[data-copymsg]").textContent = u; } return; }
    if (t.matches("[data-native]")) { const u = location.href.replace(/&?share=1/, ""); if (navigator.share) navigator.share({ url: u, title: document.title }).catch(() => {}); else over.querySelector("[data-copymsg]").textContent = u; return; }
  });
  document.addEventListener("change", (e) => { if (e.target.matches("[data-statepick]") && e.target.value) location.hash = "st=" + e.target.value; });
  document.addEventListener("submit", (e) => {
    const f = e.target; e.preventDefault();
    if (f.dataset.form === "search") {
      const q = f.q.value.trim(), s = f.s.value;
      location.replace(q ? href({ q, s }) : s ? href({ s }) : "#home");
      return;
    }
    const msg = f.querySelector("[data-msg]");
    const em = f.querySelector('input[type="email"]');
    if (em && !/^\S+@\S+\.\S+$/.test(em.value)) { msg.hidden = false; msg.innerHTML = '<span class="err">Enter an email address, like name@example.com.</span>'; em.focus(); return; }
    msg.hidden = false;
    msg.textContent = "This is a prototype, so nothing was sent. On the real site a person reads every one of these.";
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && over.innerHTML) { closeOverlay(); return; }
    if (e.key === "Tab" && over.innerHTML) { // keep focus inside the open panel
      const f = [...over.querySelectorAll('a[href], button, input:not([type="hidden"]):not(.hp), select, textarea')].filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  addEventListener("scroll", () => { const fd = document.getElementById("finder"); if (fd) fd.classList.toggle("lift", scrollY > 140); }, { passive: true });
  addEventListener("hashchange", render);
  render();
})();
