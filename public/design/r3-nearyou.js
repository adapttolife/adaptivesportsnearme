/* Round 3 · Near You (place + sport). Prototype on the real 2026-10-13 snapshot.
   Honesty rules this file keeps:
   - Places are city and state only. A distance exists only when BOTH the visitor's
     place and the program's city were found in the city gazetteer, and it reads
     "about N mi". Programs with no city on file are "statewide", never a pin.
   - Near = in your city, then about 25 miles, then elsewhere in your state, then
     statewide in your state. Nothing is invented to fill a gap.
   - Trust is "Verified" or "Not yet verified" plus a date. No scores.
   - Nothing is sent from this prototype: every form says so. No money ask. */
(function () {
  const P = window.Proto, E = P.esc, L = window.ListingArt;
  let D, SH, CENTERS, SPORTS_META = {}, PLACES = null, ZCTA = null;

  // ---------- sport names (short, plain) ----------
  const NAME = {
    amputeesports: "Amputee sports", archery: "Archery", "art-therapy": "Art therapy", baseball: "Baseball",
    basketball: "Basketball", beepbaseball: "Beep baseball", blindsports: "Blind sports", boccia: "Boccia",
    climbing: "Climbing", curling: "Curling", cycling: "Cycling", dance: "Wheelchair dance",
    equestrian: "Horseback riding", equestrianvaulting: "Equestrian vaulting", "equine-therapy": "Equine therapy",
    fencing: "Fencing", football: "Football", goalball: "Goalball", golf: "Golf", handball: "Handball",
    handcycling: "Handcycling", lacrosse: "Lacrosse", martialarts: "Martial arts", multi: "Multi-sport",
    nordicskiing: "Nordic skiing", pickleball: "Pickleball", powerlifting: "Powerlifting", rowing: "Rowing and paddling",
    rugby: "Rugby", running: "Running", sailing: "Sailing", shooting: "Shooting sports", skiing: "Skiing",
    sledhockey: "Sled hockey", soccer: "Soccer", softball: "Softball", surfing: "Surfing", swimming: "Swimming",
    tennis: "Tennis", trackfield: "Track and field", triathlon: "Triathlon", "veteran-meetup": "Veteran meetups",
    volleyball: "Sitting volleyball", waterskiing: "Water skiing", wheelchairracing: "Wheelchair racing",
    grant: "Grants", event: "Events",
  };
  const nm = (k) => NAME[k] || "Multi-sport";
  // Fixed order, biggest groups first, so things stay where people left them.
  const RAIL = ["multi", "tennis", "soccer", "baseball", "equestrian", "basketball", "rowing", "sledhockey", "skiing", "swimming", "golf", "equine-therapy", "cycling", "archery", "sailing"];

  // ---------- image presentation (from the r3 image lab) ----------
  // [bbox width, bbox height, sqrt(w*h), ink density] per file, measured.
  const OPT = {"amputeesports":[0.893,0.855,0.874,0.242],"archery":[0.795,0.893,0.842,0.276],"art-therapy":[0.893,0.816,0.854,0.344],"baseball":[0.727,0.893,0.805,0.321],"basketball":[0.797,0.893,0.843,0.342],"beepbaseball":[0.787,0.891,0.837,0.245],"blindsports":[0.893,0.34,0.551,0.307],"boccia":[0.891,0.686,0.781,0.319],"climbing":[0.645,0.893,0.758,0.308],"curling":[0.893,0.602,0.733,0.305],"cycling":[0.893,0.418,0.611,0.34],"dance":[0.83,0.893,0.861,0.242],"equestrian":[0.893,0.73,0.807,0.347],"equestrianvaulting":[0.893,0.73,0.807,0.347],"equine-therapy":[0.893,0.73,0.807,0.347],"event":[0.891,0.77,0.828,0.413],"fencing":[0.891,0.568,0.711,0.255],"football":[0.879,0.895,0.887,0.434],"goalball":[0.893,0.34,0.551,0.307],"golf":[0.742,0.891,0.813,0.301],"grant":[0.75,0.891,0.817,0.262],"handball":[0.84,0.893,0.866,0.317],"handcycling":[0.893,0.418,0.611,0.34],"lacrosse":[0.834,0.891,0.862,0.319],"martialarts":[0.891,0.885,0.888,0.35],"multi":[0.893,0.738,0.812,0.215],"nordicskiing":[0.891,0.697,0.788,0.23],"pickleball":[0.893,0.781,0.835,0.321],"powerlifting":[0.893,0.629,0.749,0.338],"rowing":[0.891,0.648,0.76,0.303],"rugby":[0.893,0.691,0.786,0.381],"running":[0.855,0.891,0.873,0.259],"sailing":[0.891,0.895,0.893,0.286],"shooting":[0.895,0.754,0.821,0.3],"skiing":[0.891,0.68,0.778,0.251],"sledhockey":[0.891,0.562,0.708,0.299],"soccer":[0.895,0.684,0.782,0.322],"softball":[0.891,0.777,0.832,0.282],"surfing":[0.893,0.738,0.812,0.215],"swimming":[0.891,0.441,0.627,0.351],"tennis":[0.895,0.871,0.883,0.259],"trackfield":[0.891,0.547,0.698,0.279],"triathlon":[0.891,0.555,0.703,0.302],"veteran-meetup":[0.893,0.547,0.699,0.451],"volleyball":[0.893,0.719,0.801,0.301],"waterskiing":[0.891,0.566,0.71,0.254],"wheelchairracing":[0.891,0.547,0.698,0.279]};
  // [soft tint, deep] per family. Deep on its own tint clears 3:1 for graphics.
  const TONE = {
    court: ["#F7E1CF", "#B4461C"], racquet: ["#EAF0CF", "#5A6F10"], field: ["#D9EBD5", "#2F7043"],
    snow: ["#DAE7F4", "#2B62A0"], water: ["#D3ECE8", "#0C716F"], trail: ["#F2E5CC", "#925F17"],
    calm: ["#E7E0F2", "#5E4A9C"], house: ["#EDE8E0", "#262523"], grant: ["#F5EBC9", "#8A6300"], event: ["#FBE2D8", "#C63F22"],
  };
  const toneOf = (k) => (k === "grant" || k === "event") ? k : (L.FAMILY[k] || "house");
  const tvars = (k) => { const [t, d] = TONE[toneOf(k)]; return `--tint:${t};--deep:${d}`; };
  const srcOf = (k) => k === "grant" ? "/emblems/sports/grant.svg" : k === "event" ? "/emblems/sports/event.svg" : L.symbolSrc(k);
  function fig(k) {
    const o = OPT[k] || OPT.multi;
    const dk = Math.min(1.04, Math.max(0.9, Math.pow(0.31 / o[3], 0.3)));
    return `<i class="fig" style="--src:url('${srcOf(k)}');--w:${o[0]};--h:${o[1]};--g:${o[2]};--dk:${dk.toFixed(3)}" aria-hidden="true"></i>`;
  }
  const plate = (k, cls = "", inner = "") => `<div class="plate ${cls}" style="${tvars(k)}">${fig(k)}${inner}</div>`;
  const roundIcon = (k, cls = "rt") => `<span class="${cls}" style="${tvars(k)}">${fig(k)}</span>`;

  // ---------- small helpers ----------
  const ICON = {
    check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
    ext: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>`,
    back: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>`,
    share: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>`,
    x: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
    shield: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>`,
    clock: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
    chev: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>`,
    pin: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`,
    gift: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18M12 8S10 3 7.5 4 9 8 12 8zm0 0s2-5 4.5-4S15 8 12 8z"/></svg>`,
    cal: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>`,
    map: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/></svg>`,
    plus: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`,
    mail: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>`,
    book: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/></svg>`,
    home: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>`,
    edit: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>`,
  };
  const qs = () => Object.fromEntries(new URLSearchParams(location.hash.slice(1)));
  const link = (o) => { const p = new URLSearchParams(); for (const [k, v] of Object.entries(o)) if (v) p.set(k, v); return "#" + p.toString(); };
  const normName = (s) => String(s || "").toLowerCase().replace(/\./g, "").replace(/\bsaint\b/g, "st").replace(/\bfort\b/g, "ft").replace(/[–—-]/g, " ").replace(/\s+/g, " ").trim();
  const R = 3958.8, rad = (d) => d * Math.PI / 180;
  const miles = (a, b) => { const dLat = rad(b[0] - a[0]), dLng = rad(b[1] - a[1]); const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
  const aboutMi = (d) => "About " + Math.max(1, Math.round(d)) + " mi";
  const titleCase = (s) => s.replace(/\b[a-z]/g, (c) => c.toUpperCase());
  const stName = (st) => P.STATE_NAMES[st] || st;
  const isWeb = (u) => /^https?:\/\//i.test(String(u || ""));
  const shortD = (iso) => { const s = L.shortDate(iso); return s ? s.replace(/, \d{4}$/, "") : null; };

  // A city a person would read: first place in a list, no county notes.
  function cityShort(c) {
    if (!c) return null;
    let s = String(c).trim();
    if (!s || /^statewide$/i.test(s)) return null;
    s = s.replace(/\s*\*.*$/, "").replace(/\s+[A-Z]{2}$/, "").trim();
    if (/ - /.test(s)) s = s.split(" - ").pop().trim();
    const many = /[,;]/.test(s) && !/,\s*[A-Z]{2}$/.test(s);
    s = s.split(/\s*[\/;(]\s*|,\s*/)[0].replace(/[–—-]\s*$/, "").trim();
    if (s.length > 28) s = s.slice(0, 26).trim() + "…";
    return many ? s + " and more" : s;
  }

  // ---------- the state outline, with a dot when we know the city ----------
  function stateSvg(st, { dots = [], you = null, fill = false, r = 9 } = {}) {
    const d = SH[st];
    if (!d) return "";
    return `<svg class="st" viewBox="0 0 100 100" aria-hidden="true"><path class="${fill ? "sw" : ""}" d="${d}"/>${dots.map(([x, y]) => `<circle class="dt" cx="${x}" cy="${y}" r="${r}"/>`).join("")}${you ? `<circle class="you" cx="${you[0]}" cy="${you[1]}" r="6.5"/><circle class="youc" cx="${you[0]}" cy="${you[1]}" r="2"/>` : ""}</svg>`;
  }
  // Each state outline is a Mercator fit to its own 100x100 box. Recover the fit
  // from the programs already placed there, so the visitor's city can be drawn too.
  const FIT = {};
  const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2));
  function fitFor(st) {
    if (st in FIT) return FIT[st];
    const pts = D.items.filter((p) => p.state === st && p.px != null && p.lat != null);
    const lngs = [...new Set(pts.map((p) => p.lng))];
    if (pts.length < 2 || lngs.length < 2) return (FIT[st] = null);
    const n = pts.length, mx = pts.reduce((s, p) => s + rad(p.lng), 0) / n, my = pts.reduce((s, p) => s + p.px, 0) / n;
    let num = 0, den = 0; for (const p of pts) { num += (rad(p.lng) - mx) * (p.px - my); den += (rad(p.lng) - mx) ** 2; }
    const k = num / den, bx = my - k * mx;
    const mmy = pts.reduce((s, p) => s + mercY(p.lat), 0) / n, mpy = pts.reduce((s, p) => s + p.py, 0) / n;
    const dy = mpy + k * mmy;
    return (FIT[st] = (lat, lng) => [Math.round((k * rad(lng) + bx) * 10) / 10, Math.round((dy - k * mercY(lat)) * 10) / 10]);
  }

  // ---------- cards and rows ----------
  function stamp(p) {
    if (!p.state || !SH[p.state]) return "";
    return p.placed
      ? `<span class="stamp">${stateSvg(p.state, { dots: [[p.px, p.py]], r: 11 })}${E(p.state)}</span>`
      : `<span class="stamp">${stateSvg(p.state, { fill: true })}Statewide</span>`;
  }
  const where = (p) => p.placed || p.cityShort ? `${E(p.cityShort || "")}, ${E(p.state)}` : p.state ? `Statewide in ${E(stName(p.state))}` : "No state listed";
  function trustText(p) {
    const dt = shortD(p.lastChecked);
    return `${p.verified ? `<span class="ok">Verified</span>` : "Not yet verified"} · ${dt ? "checked " + dt : "no date yet"}`;
  }
  function trustShort(p, tight) {
    const dt = shortD(p.lastChecked);
    return `${p.verified ? `<span class="ok">Verified</span>` : "Not yet verified"} · <span title="Last checked">${dt ? (tight ? "" : "checked ") + dt : "no date yet"}</span>`;
  }
  const vpill = (p) => p.verified ? `<span class="vpill">${ICON.check}Verified</span>` : "";
  function card(p, ctx) {
    const dist = ctx && ctx.distOf ? ctx.distOf(p) : "";
    return `<a class="card" href="#p=${p.id}">${plate(p.key, "", vpill(p) + stamp(p))}<div class="ct"><h3 class="nm">${E(p.name)}</h3><p class="mt">${E(nm(p.key))} · ${where(p)}</p>${dist ? `<p class="ds">${dist}</p>` : ""}<p class="tr">${trustText(p)}</p></div></a>`;
  }
  function row(p, ctx, hidden) {
    const dist = ctx && ctx.distOf ? ctx.distOf(p) : "";
    return `<a class="row${hidden ? " hide" : ""}" href="#p=${p.id}">${plate(p.key, "row-p")}<div><h3>${E(p.name)}</h3><p class="mt">${E(nm(p.key))} · ${where(p)}</p><p class="tr">${dist ? `<b style="color:var(--ink)">${dist}</b> · ` : ""}${trustShort(p, !!dist)}</p></div></a>`;
  }
  let gid = 0;
  function rowList(list, ctx, first = 8) {
    const id = "g" + (++gid);
    return `<div class="rows" id="${id}">${list.map((p, i) => row(p, ctx, i >= first)).join("")}</div>${list.length > first ? `<button class="morebtn" data-more="${id}">Show all ${list.length}</button>` : ""}`;
  }
  function cardList(list, ctx, first = 12) {
    const id = "g" + (++gid);
    return `<div class="cards" id="${id}">${list.map((p, i) => card(p, ctx).replace('class="card"', `class="card${i >= first ? " hide" : ""}"`)).join("")}</div>${list.length > first ? `<button class="morebtn" data-more="${id}">Show all ${list.length}</button>` : ""}`;
  }
  const hasAmt = (g) => g.amount && !/^varies$/i.test(g.amount);
  function grantRow(g) {
    return `<a class="grow" href="#g=${g.id}"><h3>${E(g.name)}</h3><div class="gl"><span class="who">${g.audience === "program" ? "For programs" : "For athletes"}</span><b>${hasAmt(g) ? E(g.amount) : "Amount varies"}</b>${g.deadline ? `<span>Deadline: ${E(g.deadline)}</span>` : ""}</div><p class="gl" style="margin-top:2px;color:var(--muted)">From ${E(g.source || "the provider")}</p></a>`;
  }
  function grantCard(g) {
    const amt = g.amount && !/^varies$/i.test(g.amount) ? `<p class="amt">${E(g.amount)}</p>` : `<p class="amt soft">Amount varies</p>`;
    return `<a class="gcard" href="#g=${g.id}"><div><span class="who">${g.audience === "program" ? "For programs" : "For athletes"}</span>${amt}<h3>${E(g.name)}</h3><p class="mt">${E(g.source || "")}${g.deadline ? " · " + E(g.deadline) : ""}</p></div>${plate("grant")}</a>`;
  }

  // ---------- places ----------
  async function places() { return PLACES || (PLACES = await fetch("/design/places.json").then((r) => r.json())); }
  // "Tampa" / "Chicago, IL" / "60614" / "Wisconsin" → { kind, label, state, city, coords, note }
  async function resolve(q) {
    const raw = String(q || "").trim();
    if (!raw) return null;
    const zip = raw.match(/^\d{5}$/);
    if (zip) {
      ZCTA = ZCTA || await fetch("/design/zcta.json").then((r) => r.json());
      const c = ZCTA[zip[0]], base = P.parsePlace(zip[0], D.items);
      if (!c || !base) return { kind: "none", label: raw };
      return { kind: "zip", label: "ZIP " + zip[0], short: zip[0], state: base.state, city: null, coords: c };
    }
    const w = P.parsePlace(raw, D.items);
    if (!w) return { kind: "none", label: raw };
    if (!w.city) return { kind: "state", label: stName(w.state), state: w.state };
    const pl = await places();
    const c = pl[w.state + "|" + normName(w.city)] || null;
    return { kind: "city", label: w.city + ", " + w.state, short: w.city, state: w.state, city: w.city, coords: c };
  }
  function cityHit(p, city) {
    if (!city || !p.city) return false;
    const re = new RegExp("(^|[^a-z])" + normName(city).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z]|$)");
    return re.test(normName(p.city));
  }
  // The honest ladder.
  function ladder(w, pool) {
    const out = { inCity: [], near: [], elsewhere: [], statewide: [], dist: new Map() };
    for (const p of pool) {
      const d = w.coords && p.placed ? miles(w.coords, [p.lat, p.lng]) : null;
      if (d != null) out.dist.set(p.id, d);
      if (w.city && p.state === w.state && (cityHit(p, w.city) || (d != null && d < 1))) out.inCity.push(p);
      else if (d != null && d <= 25) out.near.push(p);
      else if (p.state === w.state && p.placed) out.elsewhere.push(p);
      else if (p.state === w.state) out.statewide.push(p);
    }
    const byD = (a, b) => (out.dist.get(a.id) ?? 1e9) - (out.dist.get(b.id) ?? 1e9) || P.byTrust(a, b);
    out.inCity.sort(P.byTrust); out.near.sort(byD); out.elsewhere.sort(w.coords ? byD : P.byTrust); out.statewide.sort(P.byTrust);
    return out;
  }

  // ---------- views ----------
  function letter(sub) {
    return `<section class="letter" aria-labelledby="letterH"><div><h2 id="letterH">Get the letter</h2><p>${sub || "New programs, grants and events, when there is something worth sending. No spam."}</p></div>
      <form data-letter><label class="sr" for="em${gid}">Email</label><input id="em${gid}" type="email" placeholder="you@email.com" required autocomplete="email"><button type="submit">Subscribe</button></form></section>`;
  }
  function home() {
    const MOS = ["basketball", "tennis", "swimming", "equestrian", "skiing", "running", "sailing", "goalball", "climbing"];
    const tiles = MOS.map((k, i) => `<a href="${link({ s: k })}" class="${i === 0 ? "big" : ""}">${plate(k, "sq")}<span class="lb">${E(nm(k))}</span></a>`).join("");
    // A mix of verified programs, one per sport, so the cards show the range.
    const seen = new Set(), mix = [];
    const pool = D.items.filter((p) => p.verified && p.placed).sort((a, b) => String(b.lastChecked || "").localeCompare(String(a.lastChecked || "")));
    for (const k of ["tennis", "basketball", "equestrian", "soccer", "swimming", "baseball", "sledhockey", "golf", "rowing", "multi", "archery", "cycling"]) {
      const p = pool.find((x) => x.key === k && !seen.has(x.state)); if (p) { mix.push(p); seen.add(p.state); }
    }
    const grants = D.grants.filter((g) => g.amount && !/varies/i.test(g.amount)).slice(0, 6);
    return `<section class="hello"><div><h1>Find adaptive sports <em>near you.</em></h1>
      <p class="lede">Programs, grants and events for athletes with disabilities. Tell us where you play.</p>
      <form class="where" data-where><div class="inp">${ICON.pin}<label class="sr" for="homeWhere">City, state or ZIP code</label><input id="homeWhere" placeholder="City, state or ZIP" autocomplete="off" enterkeyhint="search"></div><button class="btn acc" type="submit">Search</button></form>
      <div class="tries"><button class="chip" data-loc>${ICON.pin.replace('width="22" height="22"', 'width="18" height="18"')}Use my location</button><span>or try</span><a class="chip" href="${link({ near: "Chicago, IL" })}">Chicago</a><a class="chip" href="${link({ near: "Richmond, VA" })}">Richmond</a><a class="chip" href="${link({ near: "Tampa, FL" })}">Tampa</a></div></div>
      <div><div class="mosaic">${tiles}</div><p style="text-align:right;margin-top:6px"><button class="ulink" data-search style="min-height:44px">All sports</button></p></div></section>
    <div class="sechead"><div><h2 class="sec">Tap your state</h2><p class="secsub">Darker means more listings. Every state is still growing.</p></div></div>
    <div class="tilebox">${tileMap()}</div>
    <div class="sechead"><div><h2 class="sec">Checked by a person</h2><p class="secsub">Someone on our team matched these to an official source.</p></div></div>
    <div class="hrail">${mix.map((p) => card(p)).join("")}</div>
    <div class="sechead"><div><h2 class="sec">Help paying for it</h2><p class="secsub">Grants for gear, training and travel, from the groups that give them.</p></div><a href="#grants">All grants</a></div>
    <div class="hrail">${grants.map(grantCard).join("")}</div>
    <div class="sechead"><div><h2 class="sec">Events</h2></div><a href="#events">See events</a></div>
    <a class="row" href="#events" style="border-top:1px solid var(--line)">${plate("event", "row-p")}<div><h3>No events listed yet</h3><p class="mt">Know a clinic, tryout or game day? Add it and a person will check it.</p></div></a>
    ${letter()}`;
  }
  function tileMap(counts, sport) {
    const GRID = {ME:[10,0],WI:[5,1],VT:[9,1],NH:[10,1],WA:[0,2],ID:[1,2],MT:[2,2],ND:[3,2],MN:[4,2],IL:[5,2],MI:[6,2],NY:[8,2],MA:[9,2],OR:[0,3],NV:[1,3],WY:[2,3],SD:[3,3],IA:[4,3],IN:[5,3],OH:[6,3],PA:[7,3],NJ:[8,3],CT:[9,3],RI:[10,3],CA:[0,4],UT:[1,4],CO:[2,4],NE:[3,4],MO:[4,4],KY:[5,4],WV:[6,4],VA:[7,4],MD:[8,4],DE:[9,4],AZ:[1,5],NM:[2,5],KS:[3,5],AR:[4,5],TN:[5,5],NC:[6,5],SC:[7,5],DC:[8,5],OK:[3,6],LA:[4,6],MS:[5,6],AL:[6,6],GA:[7,6],HI:[0,7],AK:[1,7],TX:[3,7],FL:[8,7]};
    counts = counts || Object.fromEntries(Object.entries(D.byState).map(([k, v]) => [k, v.length]));
    const max = Math.max(1, ...Object.values(counts));
    const b = (n) => !n ? 0 : n / max > .7 ? 5 : n / max > .45 ? 4 : n / max > .22 ? 3 : n / max > .08 ? 2 : 1;
    return `<div class="tiles">${Object.entries(GRID).map(([st, [c, r]]) => { const n = counts[st] || 0; return `<a class="tile b${b(n)}" style="grid-column:${c + 1};grid-row:${r + 1}" href="${link({ st, s: sport })}" aria-label="${E(stName(st))}: ${n} listings">${st}<small>${n}</small></a>`; }).join("")}</div>
      <div class="tilekey"><span>Fewer</span><i style="background:#FDF3EA"></i><i style="background:var(--orange-soft)"></i><i style="background:#F4C9A8"></i><i style="background:#E38A57"></i><i style="background:var(--orange)"></i><span>More</span></div>`;
  }

  async function results(q) {
    const s = q.s || "";
    const w = await resolve(q.near);
    if (!w || w.kind === "none") {
      return `<section class="rhead" style="grid-template-columns:1fr"><div><p class="eyebrow">Search</p><h1>We could not find “${E(q.near)}”</h1><p class="sum">Enter a city and state, a state, or a 5-digit ZIP code. For example: Chicago, IL or 60614.</p></div></section>
        <div class="btns"><button class="btn acc" data-search>Try another place</button><a class="btn line" href="#">Browse by state</a></div>`;
    }
    if (w.kind === "state") { location.replace(link({ st: w.state, s })); return ""; }
    state.focus = w;
    const pool = D.items.filter((p) => !s || p.key === s);
    const g = ladder(w, pool);
    const ST = stName(w.state);
    const placeName = w.short || w.label;
    const ctx = { distOf: (p) => g.inCity.includes(p) ? "" : g.dist.has(p.id) ? aboutMi(g.dist.get(p.id)) : "" };
    const close = g.inCity.length + g.near.length;
    const fit = fitFor(w.state);
    const you = w.coords && fit ? fit(w.coords[0], w.coords[1]) : null;
    const dots = [...g.inCity, ...g.near, ...g.elsewhere].filter((p) => p.state === w.state && p.px != null).map((p) => [p.px, p.py]);
    const sumBits = [];
    if (w.city && g.inCity.length) sumBits.push(`<b>${g.inCity.length}</b> in ${E(w.short)}`);
    if (w.coords) sumBits.push(`<b>${g.near.length}</b> within about 25 miles`);
    sumBits.push(`<b>${g.elsewhere.length + g.statewide.length}</b> more in ${E(ST)}`);
    const sportWord = s ? nm(s).toLowerCase() : "";
    let h = `<section class="rhead"><div><p class="eyebrow">${s ? E(nm(s)) + " near" : "Near"}</p><h1>${E(w.label)}</h1><p class="sum">${sumBits.join(" · ")}</p></div>
      <div class="rmap" title="${E(ST)}">${stateSvg(w.state, { dots, you, r: 3.6 })}</div></section>
      <div class="legend"><span><i class="y"></i>${w.coords ? E(placeName) : "Your city could not be placed"}</span><span><i></i>A program, shown at its city</span></div>`;
    if (!w.coords) h += `<div class="note"><b>We know the state, not the spot.</b>We could not place ${E(w.label)} on our city list, so there are no distances. Here is everything in ${E(ST)}${s ? " for " + E(sportWord) : ""}.</div>`;
    else if (!close) h += `<div class="note"><b>Nothing ${w.city ? "in " + E(w.short) : "within about 25 miles"} yet.</b>Here ${g.elsewhere.length + g.statewide.length === 1 ? "is a program" : "are programs"} elsewhere in ${E(ST)}${s ? " for " + E(sportWord) : ""}. Know one closer? <a class="ulink" href="#help">Add it</a>.</div>`;
    const big = (list) => s ? rowList(list, ctx, 12) : cardList(list, ctx, 8);
    if (g.inCity.length) h += `<section class="group"><div class="group-h"><h2>In ${E(w.short)}</h2><span class="n">${g.inCity.length}</span></div><p class="gs">Listed in ${E(w.short)}. Check the website for the exact place.</p>${big(g.inCity)}</section>`;
    if (g.near.length) h += `<section class="group"><div class="group-h"><h2>Within about 25 miles</h2><span class="n">${g.near.length}</span></div><p class="gs">Distances are city to city, so they are close, not exact.</p>${big(g.near)}</section>`;
    if (g.elsewhere.length) h += `<section class="group"><div class="group-h"><h2>Elsewhere in ${E(ST)}</h2><span class="n">${g.elsewhere.length}</span></div><p class="gs">${w.coords ? "Closest first." : "Verified first."}</p>${rowList(g.elsewhere, ctx, 6)}</section>`;
    if (g.statewide.length) h += `<section class="group"><div class="group-h"><h2>Across ${E(ST)}</h2><span class="n">${g.statewide.length}</span></div><p class="gs">These serve the whole state or did not list a city. Check the website to see where they meet.</p>${rowList(g.statewide, ctx, 6)}</section>`;
    if (!close && !g.elsewhere.length && !g.statewide.length) h += `<div class="empty" style="margin-top:22px"><b>No ${E(sportWord || "programs")} listed in ${E(ST)} yet.</b><p style="margin-top:6px">The directory is new. ${s ? `<a class="ulink" href="${link({ near: q.near })}">See every sport near ${E(placeName)}</a>, or ` : ""}<a class="ulink" href="#help">tell us about one</a>.</p></div>`;
    h += letter(`Hear when new programs open near ${E(placeName)}. We email when there is something worth sending.`);
    return h;
  }

  function sportPage(s) {
    const list = D.items.filter((p) => p.key === s);
    const counts = {}; for (const p of list) if (p.state) counts[p.state] = (counts[p.state] || 0) + 1;
    const ver = list.filter((p) => p.verified).sort((a, b) => a.state === b.state ? P.byTrust(a, b) : String(a.state).localeCompare(String(b.state)));
    const rest = list.filter((p) => !p.verified).sort(P.byTrust);
    const note = (SPORTS_META[s] && SPORTS_META[s].note) || "";
    let h = `<section class="banner" style="${tvars(s)}"><div class="bt"><h1>${E(nm(s))}</h1><p>${E(note.replace(/ The biggest group on the site\.?/, ""))}</p></div><div class="bfig">${fig(s)}</div></section>
      <div class="btns"><button class="btn acc" data-search data-preset="${s}">Find ${E(nm(s).toLowerCase())} near you</button></div>`;
    if (!list.length) return h + `<div class="empty" style="margin-top:22px"><b>No ${E(nm(s).toLowerCase())} programs listed yet.</b><p style="margin-top:6px">Know one? <a class="ulink" href="#help">Add it</a> and a person will check it.</p></div>` + letter();
    h += `<div class="sechead"><div><h2 class="sec">Where to play</h2><p class="secsub">Tap a state to see its ${E(nm(s).toLowerCase())} listings.</p></div></div><div class="tilebox">${tileMap(counts, s)}</div>`;
    if (ver.length) h += `<section class="group"><div class="group-h"><h2>Checked by a person</h2><span class="n">${ver.length}</span></div><p class="gs">Sorted by state.</p>${rowList(ver, null, 8)}</section>`;
    if (rest.length) h += `<section class="group"><div class="group-h"><h2>Not yet verified</h2><span class="n">${rest.length}</span></div><p class="gs">Found in public lists. No one has confirmed these yet.</p>${rowList(rest, null, 4)}</section>`;
    return h + letter(`Hear about new ${E(nm(s).toLowerCase())} programs. We email when there is something worth sending.`);
  }

  function statePage(st, s) {
    state.focus = { state: st };
    const all = D.byState[st] || [];
    const list = all.filter((p) => !s || p.key === s);
    // Mixed-sport lists take turns by sport, verified first, so a grid of cards
    // does not open with the same picture six times.
    let placed = list.filter((p) => p.placed).sort(P.byTrust);
    if (!s) {
      const by = new Map(); for (const p of placed) { const k = p.verified + "|" + p.key; if (!by.has(k)) by.set(k, []); by.get(k).push(p); }
      const turn = (v) => { const qs = [...by.entries()].filter(([k]) => k.startsWith(v + "|")).map(([, a]) => a.slice()); const out = []; while (qs.some((q) => q.length)) for (const q of qs) if (q.length) out.push(q.shift()); return out; };
      placed = [...turn(true), ...turn(false)];
    }
    const wide = list.filter((p) => !p.placed).sort(P.byTrust);
    const fams = {}; for (const p of all) fams[p.key] = (fams[p.key] || 0) + 1;
    const ver = list.filter((p) => p.verified).length;
    const chips = `<nav class="chips" aria-label="Sports in ${E(stName(st))}"><a class="chip" href="${link({ st })}" ${!s ? "aria-current" : ""}>All sports <span class="n">${all.length}</span></a>${Object.entries(fams).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<a class="chip" href="${link({ st, s: k })}" ${s === k ? "aria-current" : ""}>${roundIcon(k, "ci")}${E(nm(k))} <span class="n">${n}</span></a>`).join("")}</nav>`;
    let h = `<section class="statehero"><div class="stt"><p class="eyebrow" style="font-weight:700;color:var(--orange-ink)">${s ? E(nm(s)) + " in" : "Adaptive sports in"}</p><h1>${E(stName(st))}</h1><p class="sum">${list.length} listing${list.length === 1 ? "" : "s"} · ${ver} verified by a person</p></div>
      <div class="big">${stateSvg(st, { dots: list.filter((p) => p.placed).map((p) => [p.px, p.py]), r: 2.2 })}</div>
      <form class="where" data-where data-state="${st}"><div class="inp">${ICON.pin}<label class="sr" for="stWhere">Your city or ZIP</label><input id="stWhere" placeholder="Your city or ZIP" autocomplete="off"></div><button class="btn acc" type="submit">Near me</button></form></section>${chips}`;
    if (!list.length) h += `<div class="empty" style="margin-top:22px"><b>No ${E(nm(s).toLowerCase())} listed in ${E(stName(st))} yet.</b><p style="margin-top:6px"><a class="ulink" href="${link({ st })}">See every sport in ${E(stName(st))}</a>, or <a class="ulink" href="#help">tell us about one</a>.</p></div>`;
    if (placed.length) h += `<section class="group"><div class="group-h"><h2>In a city</h2><span class="n">${placed.length}</span></div><p class="gs">Verified first, mixed by sport. Each is shown at its city.</p>${s ? rowList(placed, null, 12) : cardList(placed, null, 8)}</section>`;
    if (wide.length) h += `<section class="group"><div class="group-h"><h2>Across ${E(stName(st))}</h2><span class="n">${wide.length}</span></div><p class="gs">These serve the whole state or did not list a city.</p>${rowList(wide, null, 6)}</section>`;
    return h + letter(`Hear when new programs open in ${E(stName(st))}.`);
  }

  // "Sports and activities: X; Athletes served: Y." → readable rows.
  function parseDesc(desc) {
    const out = {};
    const m1 = /Sports and activities:\s*([^]*?)(?:\.\s*Athletes served:|;\s*Athletes served:|$)/i.exec(desc || "");
    const m2 = /Athletes served:\s*([^]*)$/i.exec(desc || "");
    if (m1 && m1[1].trim()) out.sports = m1[1].trim().replace(/[.;]\s*$/, "");
    if (m2) out.who = m2[1].trim().replace(/\.$/, "");
    if (!out.sports && !out.who && desc) out.text = desc;
    return out;
  }
  function listing(id) {
    const p = D.items.find((x) => x.id === id);
    if (!p) return `<div class="empty"><b>We could not find that listing.</b><p><a class="ulink" href="#">Start a new search</a></p></div>`;
    const ST = p.state ? stName(p.state) : null;
    const dt = L.shortDate(p.lastChecked);
    const desc = parseDesc(p.desc);
    const named = desc.sports ? [...new Set(desc.sports.split(/[;,]/).map((t) => L.symbolKey({ sportLabel: t })).filter(Boolean))].slice(0, 8) : [];
    const stampBig = p.state && SH[p.state] ? `<div class="bigstamp">${p.placed ? stateSvg(p.state, { dots: [[p.px, p.py]], r: 8 }) : stateSvg(p.state, { fill: true })}<div><b>${p.placed || p.cityShort ? E(p.cityShort) + ", " + E(p.state) : "Statewide"}</b><span>${p.placed ? E(ST) : p.cityShort ? "City not placed on the map" : E(ST)}</span></div></div>` : "";
    const fact = (k, v) => v ? `<div><dt>${k}</dt><dd>${E(v)}</dd></div>` : "";
    const facts = fact("Cost", p.cost) + fact("Ages", p.ages) + fact("Equipment", p.equipment) + fact("Sports and activities", desc.sports) + fact("Who it serves", desc.who) + fact("About", desc.text);
    // More of the same sport, nearest first when both cities are known.
    let more = D.items.filter((x) => x.id !== p.id && x.key === p.key && x.state);
    if (p.placed) more = more.filter((x) => x.placed).map((x) => [x, miles([p.lat, p.lng], [x.lat, x.lng])]).sort((a, b) => a[1] - b[1]).slice(0, 4);
    else more = more.filter((x) => x.state === p.state).sort(P.byTrust).slice(0, 4).map((x) => [x, null]);
    const moreNear = p.placed && more.length && more[0][1] <= 25;
    const moreCtx = { distOf: (x) => { const m = more.find((y) => y[0] === x); return m && m[1] != null ? (m[1] < 1 ? "Same city" : aboutMi(m[1]) + " away") : ""; } };
    const web = isWeb(p.website);
    const h = `<div class="lhero">${plate(p.key, "inv hero-p", vpill(p))}${stampBig}
        <div class="float l"><a href="javascript:history.back()" aria-label="Back">${ICON.back}</a></div>
        <div class="float r"><button data-share="${p.id}" aria-label="Share this listing">${ICON.share}</button></div></div>
      <article class="lbody">
        <a class="kick" href="${link({ s: p.key })}">${E(nm(p.key))}</a>
        <h1>${E(p.name)}</h1>
        <p class="sub">${p.placed || p.cityShort ? E(p.cityShort) + ", " + E(ST || "") : ST ? "Serves " + E(ST) + ", no single city listed" : "No place listed yet"}</p>
        <div class="trust"><span class="ic" style="color:${p.verified ? "var(--teal)" : "var(--muted)"}">${p.verified ? ICON.shield : ICON.clock}</span>
          <b class="${p.verified ? "v" : ""}">${p.verified ? "Verified" : "Not yet verified"}</b>
          <p>${p.verified ? E(L.verifiedText(null)) : "No one on our team has confirmed this listing yet. Check the website before you go."}</p>
          <p class="dt">${dt ? "Last checked " + dt : "Not checked yet"}</p></div>
        ${facts ? `<dl class="facts">${facts}</dl>` : ""}
        ${named.length > 1 ? `<section class="lsec"><h2>Sports here</h2><div class="sporthere">${named.map((k) => `<a href="${link({ s: k })}">${roundIcon(k)}${E(nm(k))}</a>`).join("")}</div></section>` : ""}
        <section class="lsec"><h2>Where you will play</h2><div class="whereyou">${p.state ? (p.placed ? stateSvg(p.state, { dots: [[p.px, p.py]], r: 5 }) : stateSvg(p.state, { fill: true })) : ""}<div>
          ${p.placed ? `<b>${E(p.cityShort)}, ${E(p.state)}</b><p>Shown at the city. Check the website for the exact place.</p>` : `<b>${ST ? "Across " + E(ST) : "Place not listed"}</b><p>This program did not list a city we could place. Check the website to see where it meets.</p>`}</div></div></section>
        ${more.length ? `<section class="lsec"><h2>More ${E(nm(p.key).toLowerCase())}${p.placed ? (moreNear ? " near " + E(p.cityShort) : ", closest first") : " in " + E(ST)}</h2>${rowList(more.map((m) => m[0]), moreCtx, 4)}</section>` : ""}
        <section class="lsec fix"><h2>Help keep this right</h2><p>Something changed or looks wrong? A person reads every note.</p>
          <div class="btns"><a class="btn line" href="/?update=${p.id}">Suggest an update</a><a class="btn line" href="/?update=${p.id}&rel=run">I run this program</a></div></section>
      </article>
      <div class="actionbar"><div class="info"><b>${p.verified ? `<span class="ok">Verified</span>` : "Not yet verified"}</b><span>${dt ? "Last checked " + dt : "Not checked yet"}</span></div>
        ${web ? `<a class="btn dark" href="${E(p.website)}" target="_blank" rel="noopener">Visit website ${ICON.ext}</a>` : `<a class="btn line" href="/?update=${p.id}">Suggest a website</a>`}</div>`;
    return h;
  }

  function grantsView(a) {
    const list = D.grants.filter((g) => !a || g.audience === a).sort((x, y) => (hasAmt(y) - hasAmt(x)) || (!!y.deadline - !!x.deadline) || x.name.localeCompare(y.name));
    return `<section class="banner" style="${tvars("grant")}"><div class="bt"><h1>Grants</h1><p>Money for gear, training and travel, from the groups that give it.</p></div><div class="bfig">${fig("grant")}</div></section>
      <nav class="seg" aria-label="Who the grant is for"><a href="#grants" ${!a ? "aria-current" : ""}>All ${D.grants.length}</a><a href="${link({ grants: 1, a: "athlete" })}" ${a === "athlete" ? "aria-current" : ""}>For athletes</a><a href="${link({ grants: 1, a: "program" })}" ${a === "program" ? "aria-current" : ""}>For programs</a></nav>
      <div class="glist">${list.map(grantRow).join("")}</div>
      <p class="secsub" style="margin-top:18px">Amounts and deadlines change. Check the provider's site before you apply.</p>${letter("Hear when a new grant opens. We email when there is something worth sending.")}`;
  }
  function grantPage(id) {
    const g = D.grants.find((x) => x.id === id);
    if (!g) return `<div class="empty"><b>We could not find that grant.</b> <a class="ulink" href="#grants">See all grants</a></div>`;
    const amt = g.amount && !/^varies$/i.test(g.amount) ? g.amount : "Amount varies";
    const others = D.grants.filter((x) => x.id !== g.id && x.audience === g.audience).slice(0, 4);
    return `<div class="lhero">${plate("grant", "inv hero-p")}<div class="float l"><a href="#grants" aria-label="Back to grants">${ICON.back}</a></div></div>
      <article class="lbody"><a class="kick" href="${link({ grants: 1, a: g.audience })}">${g.audience === "program" ? "Grant for programs" : "Grant for athletes"}</a>
        <h1>${E(g.name)}</h1><p class="sub">From ${E(g.source || "the provider")}</p>
        <dl class="facts"><div><dt>Amount</dt><dd>${E(amt)}</dd></div><div><dt>Deadline</dt><dd>${E(g.deadline || "Not listed. Check their site.")}</dd></div><div><dt>Who can apply</dt><dd>${g.audience === "program" ? "Programs and organizations" : "Athletes"}</dd></div>${g.desc ? `<div><dt>About</dt><dd>${E(g.desc)}</dd></div>` : ""}</dl>
        <div class="fix lsec"><p>We list grants so you can find them. The provider decides who gets one. Rules and deadlines change, so read their page before you apply.</p><div class="btns"><a class="btn line" href="/?update=grant-${g.id}">Suggest an update</a></div></div>
        ${others.length ? `<section class="lsec"><h2>Other grants ${g.audience === "program" ? "for programs" : "for athletes"}</h2><div class="glist" style="margin-top:0">${others.map(grantRow).join("")}</div></section>` : ""}
      </article>
      <div class="actionbar"><div class="info"><b>${E(amt)}</b><span>${E(g.deadline || "Deadline not listed")}</span></div>${isWeb(g.url) ? `<a class="btn dark" href="${E(g.url)}" target="_blank" rel="noopener">Apply on their site ${ICON.ext}</a>` : ""}</div>`;
  }
  function eventsView(add) {
    const form = `<form class="f" data-proto id="addEvent"><h2 class="sec" style="margin-bottom:2px">Add an event</h2><p class="secsub" style="margin-top:0">A person checks every event before it goes up.</p>
      <label>Event name<input required placeholder="Wheelchair tennis clinic"></label>
      <label>Sport<select>${["multi", ...L.SPORTS.filter((k) => k !== "multi")].map((k) => `<option>${E(nm(k))}</option>`).join("")}</select></label>
      <label>Date<input type="date" required></label>
      <div class="two"><label>City<input required></label><label>State<select>${Object.keys(P.STATE_NAMES).map((s) => `<option>${s}</option>`).join("")}</select></label></div>
      <label>Event website<input type="url" placeholder="https://"></label>
      <label>Your email <small>So we can ask a question. Never shown.</small><input type="email" required></label>
      <button class="btn acc" type="submit">Send for review</button></form>`;
    return `<section class="banner" style="${tvars("event")}"><div class="bt"><h1>Events</h1><p>Clinics, tryouts, game days and meetups.</p></div><div class="bfig">${fig("event")}</div></section>
      <section class="evempty"><div><h2 class="sec">No events listed yet</h2><p style="color:var(--ink2);margin-top:6px">This list is new. If you know an event, add it. When events are listed, they show here by month with the city and a link.</p>
        <div class="btns"><a class="btn acc" href="#events&add=1">Add an event</a><a class="btn line" href="#grants">See grants</a></div></div></section>
      ${add ? form : ""}${letter("Hear when events are added near you.")}`;
  }
  function helpView() {
    return `<section class="banner" style="${tvars("multi")}"><div class="bt"><h1>Help build this</h1><p>This directory is new and still growing. A person reads every note.</p></div><div class="bfig">${fig("multi")}</div></section>
      <div class="rows" style="margin-top:20px">
        <a class="row" href="#help&f=program">${plate("multi", "row-p")}<div><h3>Add a program</h3><p class="mt">Tell us about a program we are missing.</p></div></a>
        <a class="row" href="#events&add=1">${plate("event", "row-p")}<div><h3>Add an event</h3><p class="mt">A clinic, tryout or game day.</p></div></a>
        <a class="row" href="#help&f=program">${plate("tennis", "row-p")}<div><h3>Claim your program</h3><p class="mt">Run a listed program? Open its page and tap “I run this program”.</p></div></a>
        <a class="row" href="/resources">${plate("veteran-meetup", "row-p")}<div><h3>Resources</h3><p class="mt">State directories of veteran-owned businesses, and more.</p></div></a>
      </div>
      <form class="f" data-proto id="addProgram"><h2 class="sec" style="margin:18px 0 2px">Add a program</h2>
        <label>Program name<input required></label><label>Website<input type="url" placeholder="https://"></label>
        <label>Sport<select>${["multi", ...L.SPORTS.filter((k) => k !== "multi")].map((k) => `<option>${E(nm(k))}</option>`).join("")}</select></label>
        <div class="two"><label>City<input></label><label>State<select>${Object.keys(P.STATE_NAMES).map((s) => `<option>${s}</option>`).join("")}</select></label></div>
        <label>Your email <small>Never shown.</small><input type="email" required></label><button class="btn acc" type="submit">Send for review</button></form>`;
  }
  function footer() {
    return `<footer class="foot"><div class="fine"><img src="/favicon.svg" alt=""><p><b style="color:var(--ink)">Adaptive Sports Near Me</b></p><p>A free directory from Adapt To Life. Every listing says whether a person has checked it, and when. We do not run these programs, so check with them before you go.</p></div>
      <div><h3>Help build this</h3><a href="#help">Add a program</a><a href="#events&add=1">Add an event</a><a href="#help">Claim your program</a></div>
      <div><h3>More</h3><a href="#grants">Grants</a><a href="/resources">Resources</a><a href="#letter" data-letterlink>The letter</a></div></footer>`;
  }

  // ---------- drawer, rail, sheet ----------
  function drawer(q) {
    const recent = JSON.parse(localStorage.getItem("asnm-r3-recent") || "[]").filter((k) => NAME[k]);
    const counts = D.families;
    const di = (href, ic, text, n, cur) => `<a class="di" href="${href}" ${cur ? "aria-current" : ""}>${ic}<span>${text}</span>${n != null ? `<span class="n">${n}</span>` : ""}</a>`;
    const sp = (k) => di(link({ s: k }), roundIcon(k), E(nm(k)), counts[k] || 0, q.s === k && !q.st && !q.near);
    const allSports = L.SPORTS.filter((k) => counts[k]).sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
    return `<div class="dhead"><a class="brand" href="#"><img src="/favicon.svg" alt="">ASNM</a><button class="iconbtn dclose" data-close aria-label="Close menu">${ICON.x}</button></div>
      ${di("#", ICON.home, "Home", null, !location.hash || location.hash === "#")}
      <h3>Find</h3>${di("#", ICON.pin, "Programs near you")}${di("#map=1", ICON.map, "Map")}${di("#grants", ICON.gift, "Grants", D.grants.length, "grants" in q)}${di("#events", ICON.cal, "Events", null, "events" in q)}
      ${recent.length ? `<h3>Recently viewed</h3>${recent.map(sp).join("")}` : ""}
      <h3>Sports</h3>${allSports.slice(0, 8).map(sp).join("")}
      <details><summary>All sports ${ICON.chev}</summary>${allSports.slice(8).map(sp).join("")}</details>
      <details><summary>States ${ICON.chev}</summary><div class="stgrid">${Object.keys(P.STATE_NAMES).map((s) => `<a href="${link({ st: s })}" aria-label="${E(stName(s))}">${s}</a>`).join("")}</div></details>
      <h3>Help build this</h3>${di("#help", ICON.plus, "Add a program")}${di("#events&add=1", ICON.cal, "Add an event")}${di("#help", ICON.edit, "Claim or update a listing")}
      <h3>More</h3>${di("#letter", ICON.mail, "The letter")}${di("/resources", ICON.book, "Resources")}`;
  }
  function rail(q) {
    const base = q.near ? { near: q.near } : q.st ? { st: q.st } : {};
    return `<a href="${link(base)}" ${!q.s ? "aria-current" : ""}><span class="rt all"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.5 2.5 2.5 13.5 0 16M12 4c-2.5 2.5-2.5 13.5 0 16"/></svg></span>All sports</a>` +
      RAIL.map((k) => `<a href="${link({ ...base, s: k })}" ${q.s === k ? "aria-current" : ""}>${roundIcon(k)}${E(nm(k).replace(" and paddling", "")).replace("-", "\u2011")}</a>`).join("");
  }
  let sheetSport = "";
  function openSheet(preset) {
    const q = qs();
    sheetSport = preset != null ? preset : (q.s || "");
    const keys = ["", ...L.SPORTS.filter((k) => D.families[k]).sort((a, b) => D.families[b] - D.families[a])];
    document.getElementById("sportGrid").innerHTML = keys.map((k) => `<button type="button" data-sport="${k}" aria-pressed="${k === sheetSport}">${k ? roundIcon(k) : `<span class="rt all">✱</span>`}${k ? E(nm(k)) : "Any sport"}</button>`).join("");
    const inp = document.getElementById("whereIn");
    inp.value = q.near || (q.st ? stName(q.st) : "");
    document.getElementById("whereErr").hidden = true;
    document.getElementById("sheet").classList.add("on");
    lastFocus = document.activeElement;
    setTimeout(() => inp.focus(), 30);
  }
  let lastFocus = null;
  const closeSheet = () => { document.getElementById("sheet").classList.remove("on"); if (lastFocus) lastFocus.focus(); };
  function toggleDrawer(on) {
    const d = document.getElementById("drawer");
    d.classList.toggle("on", on); document.getElementById("scrim").classList.toggle("on", on);
    document.getElementById("menuBtn").setAttribute("aria-expanded", on);
    if (on) setTimeout(() => d.querySelector("a,button").focus(), 30);
  }
  async function locateMe() {
    if (!navigator.geolocation) return alert("Your browser cannot share a location. Type a city or ZIP instead.");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      // Snap to the nearest city we know, so every distance stays city to city.
      const pl = await places(); const me = [pos.coords.latitude, pos.coords.longitude];
      let best = null, bd = 1e9;
      for (const [k, c] of Object.entries(pl)) { const d = (c[0] - me[0]) ** 2 + (c[1] - me[1]) ** 2; if (d < bd) { bd = d; best = k; } }
      if (best) { const [st, city] = best.split("|"); closeSheet(); location.hash = link({ near: titleCase(city) + ", " + st, s: qs().s }).slice(1); }
    }, () => alert("We could not get your location. Type a city or ZIP instead."), { timeout: 8000 });
  }

  // ---------- map ----------
  const state = { focus: null, map: null };
  function loadMapLibre() { return window.maplibregl ? Promise.resolve() : new Promise((ok, no) => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "/assets/vendor/maplibre-gl.css"; document.head.appendChild(l); const s = document.createElement("script"); s.src = "/assets/vendor/maplibre-gl.js"; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }
  async function openMap() {
    const q = qs(), s = q.s || "";
    document.getElementById("mapview").classList.add("open");
    document.getElementById("mapCard").classList.remove("on");
    const f = state.focus && (q.near || q.st) ? state.focus : null;
    document.getElementById("mapTitle").innerHTML = `<span>${E(s ? nm(s) : "All sports")}${f ? " · " + E(f.label || stName(f.state)) : ""}</span>`;
    // One pin per city, with a count. Programs with no city are never pins.
    const byCity = new Map();
    for (const p of D.items) if (p.placed && (!s || p.key === s)) { const k = p.lat + "," + p.lng; if (!byCity.has(k)) byCity.set(k, []); byCity.get(k).push(p); }
    const fc = { type: "FeatureCollection", features: [...byCity.entries()].map(([k, ps]) => ({ type: "Feature", properties: { k, n: ps.length }, geometry: { type: "Point", coordinates: [ps[0].lng, ps[0].lat] } })) };
    const sw = {}; for (const p of D.items) if (!p.placed && p.state && (!s || p.key === s)) sw[p.state] = (sw[p.state] || 0) + 1;
    const swList = f && f.state ? (sw[f.state] ? [[f.state, sw[f.state]]] : []) : Object.entries(sw).sort((a, b) => b[1] - a[1]).slice(0, 12);
    document.getElementById("swStrip").innerHTML = swList.map(([st, n]) => `<a href="${link({ st, s })}" data-closemap>${stateSvg(st, { fill: true })}Statewide in ${E(stName(st))} · ${n}</a>`).join("");
    try { await loadMapLibre(); } catch (_) { document.getElementById("map").innerHTML = `<p style="padding:90px 20px">The map could not load. <a class="ulink" href="#">Back to the list</a></p>`; return; }
    const you = f && f.coords ? { type: "FeatureCollection", features: [{ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [f.coords[1], f.coords[0]] } }] } : { type: "FeatureCollection", features: [] };
    if (!state.map) {
      state.map = new maplibregl.Map({ container: "map", style: "https://tiles.openfreemap.org/styles/positron", center: [-96, 38.5], zoom: 3.1, attributionControl: { compact: true } });
      state.byCity = byCity;
      await new Promise((ok) => state.map.on("load", ok));
      state.map.addSource("you", { type: "geojson", data: you });
      state.map.addLayer({ id: "you", type: "circle", source: "you", paint: { "circle-color": "rgba(26,26,26,.08)", "circle-radius": 26, "circle-stroke-color": "#1A1A1A", "circle-stroke-width": 3 } });
      state.map.addSource("pts", { type: "geojson", data: fc, cluster: true, clusterRadius: 46, clusterMaxZoom: 9, clusterProperties: { n: ["+", ["get", "n"]] } });
      state.map.addLayer({ id: "cl", type: "circle", source: "pts", filter: ["has", "point_count"], paint: { "circle-color": "#C5430C", "circle-radius": ["step", ["get", "n"], 16, 10, 20, 40, 26], "circle-stroke-color": "#fff", "circle-stroke-width": 3 } });
      state.map.addLayer({ id: "cln", type: "symbol", source: "pts", filter: ["has", "point_count"], layout: { "text-field": ["to-string", ["get", "n"]], "text-font": ["Noto Sans Bold"], "text-size": 14 }, paint: { "text-color": "#fff" } });
      state.map.addLayer({ id: "pt", type: "circle", source: "pts", filter: ["!", ["has", "point_count"]], paint: { "circle-color": "#C5430C", "circle-radius": ["step", ["get", "n"], 12, 2, 14, 5, 17], "circle-stroke-color": "#fff", "circle-stroke-width": 2.5 } });
      state.map.addLayer({ id: "ptn", type: "symbol", source: "pts", filter: ["!", ["has", "point_count"]], layout: { "text-field": ["to-string", ["get", "n"]], "text-font": ["Noto Sans Bold"], "text-size": 13 }, paint: { "text-color": "#fff" } });
      state.map.on("click", "cl", (e) => { const ft = e.features[0]; state.map.getSource("pts").getClusterExpansionZoom(ft.properties.cluster_id).then((z) => state.map.easeTo({ center: ft.geometry.coordinates, zoom: z })); });
      state.map.on("click", "pt", (e) => showCity(e.features[0].properties.k));
      for (const id of ["cl", "pt"]) { state.map.on("mouseenter", id, () => state.map.getCanvas().style.cursor = "pointer"); state.map.on("mouseleave", id, () => state.map.getCanvas().style.cursor = ""); }
    } else { state.byCity = byCity; state.map.getSource("pts").setData(fc); state.map.getSource("you").setData(you); state.map.resize(); }
    if (f && f.coords) state.map.jumpTo({ center: [f.coords[1], f.coords[0]], zoom: 8 });
    else if (f && f.state && CENTERS[f.state]) state.map.jumpTo({ center: [CENTERS[f.state][1], CENTERS[f.state][0]], zoom: 5.4 });
    else state.map.jumpTo({ center: [-92, 37.5], zoom: window.innerWidth < 600 ? 2.6 : 3.4 });
  }
  function showCity(k) {
    const ps = (state.byCity.get(k) || []).slice().sort(P.byTrust);
    if (!ps.length) return;
    const p0 = ps[0], city = p0.cityShort.replace(/ and more$/, "");
    const el = document.getElementById("mapCard");
    el.innerHTML = `<button class="iconbtn x" data-mapx aria-label="Close">${ICON.x}</button><h3>${E(city)}, ${E(p0.state)}</h3><p class="secsub" style="margin-top:0">${ps.length} listing${ps.length > 1 ? "s" : ""} shown at this city</p>
      <div class="rows">${ps.slice(0, 3).map((p) => row(p).replace('class="row"', 'class="row" data-closemap')).join("")}</div>
      ${ps.length > 3 ? `<a class="ulink" style="display:inline-flex;min-height:44px;align-items:center" data-closemap href="${link({ near: city + ", " + p0.state, s: qs().s })}">See all ${ps.length} near ${E(city)}</a>` : ""}`;
    el.classList.add("on");
  }
  const closeMap = () => { document.getElementById("mapview").classList.remove("open"); document.getElementById("mapCard").classList.remove("on"); };

  // ---------- render ----------
  async function render() {
    const q = qs(), el = document.getElementById("app");
    gid = 0; state.focus = null;
    let html;
    if (q.p) html = listing(q.p);
    else if (q.g) html = grantPage(q.g);
    else if ("grants" in q) html = grantsView(q.a || "");
    else if ("events" in q) html = eventsView(!!q.add);
    else if ("help" in q) html = helpView();
    else if (q.near) html = await results(q);
    else if (q.st) html = statePage(q.st, q.s || "");
    else if (q.s) html = sportPage(q.s);
    else html = home();
    const isPage = !!(q.p || q.g);
    el.innerHTML = html + (isPage ? "" : footer());
    if (q.s && NAME[q.s]) { const r = JSON.parse(localStorage.getItem("asnm-r3-recent") || "[]").filter((k) => k !== q.s); r.unshift(q.s); localStorage.setItem("asnm-r3-recent", JSON.stringify(r.slice(0, 3))); }
    document.getElementById("drawer").innerHTML = drawer(q);
    const showRail = !!(q.near || q.st || q.s) && !isPage && !("grants" in q) && !("events" in q);
    document.getElementById("rail").innerHTML = showRail ? rail(q) : "";
    document.getElementById("rail").style.display = showRail ? "" : "none";
    const showPill = !isPage && !!(q.near || q.st || q.s || "grants" in q || "events" in q || "help" in q);
    document.getElementById("searchPill").style.display = showPill ? "" : "none";
    document.getElementById("subhead").classList.toggle("off", !showPill && !showRail);
    document.getElementById("fab").style.display = isPage || "grants" in q || "events" in q || "help" in q ? "none" : "";
    const f = state.focus;
    document.getElementById("pillTitle").textContent = f && f.label ? f.label : q.st ? stName(q.st) : "Where do you want to play?";
    document.getElementById("pillSub").textContent = q.s ? nm(q.s) : "Any sport";
    toggleDrawer(false); closeSheet(); lastFocus = null;
    if (q.map) openMap(); else closeMap();
    const rc = document.querySelector("#rail [aria-current]"); if (rc) rc.scrollIntoView({ inline: "center", block: "nearest" });
    if (q.f) { const t = document.getElementById("addProgram"); if (t) t.scrollIntoView(); } else if (q.add) { const t = document.getElementById("addEvent"); if (t) t.scrollIntoView(); } else window.scrollTo(0, 0);
    document.title = (q.p ? (D.items.find((x) => x.id === q.p) || {}).name + " · " : f && f.label ? "Near " + f.label + " · " : q.st ? stName(q.st) + " · " : q.s ? nm(q.s) + " · " : "") + "Adaptive Sports Near Me";
  }
  async function goWhere(v, st) {
    v = String(v || "").trim();
    if (!v) return;
    if (st && !/\d{5}/.test(v) && !/,/.test(v) && !P.STATE_NAMES[v.toUpperCase()]) v = v + ", " + st;
    location.hash = link({ near: v, s: qs().s }).slice(1);
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-search],#searchPill,[data-close],#menuBtn,#scrim,#fab,#mapBack,#mapList,[data-sport],#sheetClose,#sheetGo,#sheetClear,[data-loc],#useLoc,[data-closemap],[data-mapx],[data-more],[data-share],[data-letterlink],a[href='#letter']");
    if (!t) return;
    if (t.matches("[data-search],#searchPill")) { e.preventDefault(); openSheet(t.dataset.preset); }
    else if (t.id === "menuBtn") toggleDrawer(true);
    else if (t.matches("[data-close],#scrim")) toggleDrawer(false);
    else if (t.id === "fab") { e.preventDefault(); openMap(); }
    else if (t.matches("#mapBack,#mapList")) { closeMap(); if (qs().map) history.back(); }
    else if (t.matches("[data-mapx]")) document.getElementById("mapCard").classList.remove("on");
    else if (t.matches("[data-closemap]")) closeMap();
    else if (t.matches("[data-sport]")) { sheetSport = t.dataset.sport; document.querySelectorAll("#sportGrid button").forEach((b) => b.setAttribute("aria-pressed", b === t)); }
    else if (t.id === "sheetClose") closeSheet();
    else if (t.id === "sheetClear") { document.getElementById("whereIn").value = ""; sheetSport = ""; document.querySelectorAll("#sportGrid button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.sport === "")); }
    else if (t.id === "sheetGo") {
      const v = document.getElementById("whereIn").value.trim();
      if (!v && !sheetSport) { const er = document.getElementById("whereErr"); er.textContent = "Enter a city, state or ZIP code, or pick a sport."; er.hidden = false; return; }
      closeSheet(); location.hash = link(v ? { near: v, s: sheetSport } : { s: sheetSport }).slice(1);
    }
    else if (t.matches("[data-loc],#useLoc")) { e.preventDefault(); locateMe(); }
    else if (t.matches("[data-more]")) { document.querySelectorAll("#" + t.dataset.more + " .hide").forEach((x) => x.classList.remove("hide")); t.remove(); }
    else if (t.matches("[data-share]")) { const url = location.href; if (navigator.share) navigator.share({ title: document.title, url }).catch(() => {}); else navigator.clipboard && navigator.clipboard.writeText(url).then(() => { t.setAttribute("aria-label", "Link copied"); }); }
    else if (t.matches("[data-letterlink],a[href='#letter']")) { e.preventDefault(); toggleDrawer(false); const l = document.querySelector(".letter"); if (l) { l.scrollIntoView({ behavior: "smooth" }); const i = l.querySelector("input"); if (i) setTimeout(() => i.focus({ preventScroll: true }), 400); } else location.hash = ""; }
  });
  document.addEventListener("submit", (e) => {
    const f = e.target;
    e.preventDefault();
    if (f.matches("[data-where]")) return goWhere(f.querySelector("input").value, f.dataset.state);
    if (f.matches("[data-letter]")) { f.innerHTML = `<p class="sent">Prototype only: nothing was sent. On the live site this signs you up for the letter.</p>`; return; }
    if (f.matches("[data-proto]")) { const b = f.querySelector("button[type=submit]"); b.insertAdjacentHTML("afterend", `<p class="ok-msg">Prototype only: nothing was sent. On the live site a person reads this and checks it.</p>`); b.remove(); }
  });
  document.getElementById("whereIn").addEventListener("keydown", (e) => { if (e.key === "Enter") document.getElementById("sheetGo").click(); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (document.getElementById("sheet").classList.contains("on")) closeSheet();
    else if (document.getElementById("mapview").classList.contains("open")) closeMap();
    else toggleDrawer(false);
  });
  window.addEventListener("hashchange", render);

  (async function boot() {
    const [d, g, sp] = await Promise.all([P.load(), fetch("/design/states.json").then((r) => r.json()), fetch("/design/sports.json").then((r) => r.json())]);
    D = d; SH = g.shapes; CENTERS = g.centers;
    for (const s of sp.sports) SPORTS_META[s.key] = s;
    for (const p of D.items) {
      p.key = p.sportKey && NAME[p.sportKey] ? p.sportKey : "multi";
      // Placed = we found the program's city. Rows that say "statewide" or list
      // several places are not pinned anywhere, even if a city matched.
      p.placed = p.lat != null && p.px != null && p.geoPrecision !== "state" && !/statewide|multiple|various/i.test(p.city || "");
      p.cityShort = p.placed ? cityShort(p.city) : null;
    }
    D.families = {}; for (const p of D.items) D.families[p.key] = (D.families[p.key] || 0) + 1;
    render();
  })();
})();
