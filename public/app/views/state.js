/* State community page: /states/:st (spec 6.7, community header 4.10). WP-D.
   Query: s = sport key (filter), map = 1 (map overlay, handled by app.js + map.js).
   Counts here are for the state being viewed, which 5.4 allows.
   The group heading (.grp) is shared with the sport page and lives in app.css. */
import * as A from "../app.js";
import { site, stateMeta } from "../page-meta.js";

const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const byName = (a, b) => a.name.localeCompare(b.name);
const byTrust = (a, b) => (b.verified - a.verified) || byName(a, b);
const checkedT = (p) => { const t = Date.parse(p.lastChecked || ""); return Number.isFinite(t) ? t : 0; };
const cityKey = (p) => String(p.cityFirst || "").replace(/ and more$/, "");
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

function hrefFor(st, s) { return "/states/" + st + (s ? "?s=" + encodeURIComponent(s) : ""); }

/** 8 cards taking turns by sport: verified first, then the latest check date. */
function around(all) {
  const by = new Map();
  const sorted = all.slice().sort((a, b) => (b.verified - a.verified) || (checkedT(b) - checkedT(a)) || (b.placed - a.placed) || byName(a, b));
  for (const p of sorted) { if (!by.has(p.key)) by.set(p.key, []); by.get(p.key).push(p); }
  const keys = [...by.keys()].sort((a, b) => {
    const pa = by.get(a)[0], pb = by.get(b)[0];
    return (pb.verified - pa.verified) || (by.get(b).length - by.get(a).length);
  });
  const out = [];
  for (let round = 0; out.length < 8; round++) {
    let added = false;
    for (const k of keys) { const p = by.get(k)[round]; if (p) { out.push(p); added = true; if (out.length === 8) break; } }
    if (!added) break;
  }
  return out;
}

function grp(title, list, ctx, n) {
  return `<div class="grp"><div class="grp-hd"><h3 class="grp-h">${A.esc(title)}</h3>${n != null ? `<span class="grp-n num">${plural(n, "program", "programs")}</span>` : ""}</div><div class="rows">${list.map((p) => A.programRow(p, ctx)).join("")}</div></div>`;
}

export async function render(ctx) {
  const D = ctx.data;
  const st = String(ctx.params.st || "");
  if (!D.shapes[st] || st !== st.toUpperCase() || A.stateName(st) === st) return A.notFound();
  const stName = A.stateName(st);
  const s = ctx.query.s && D.sportByKey[ctx.query.s] && ctx.query.s !== "grant" && ctx.query.s !== "event" ? ctx.query.s : "";
  const sName = s ? A.sportName(s) : "", sLow = s ? lc(sName) : "";

  const all = D.byState[st] || [];
  const list = s ? all.filter((p) => p.key === s) : all;
  const placed = list.filter((p) => p.placed), statewide = list.filter((p) => !p.placed);

  // Header
  const h1 = s ? `${sName} in ${stName}` : stName;
  const count = list.length ? plural(list.length, "listing", "listings") : null;
  const head = A.communityHeader({
    kind: "state", st, title: h1, count, dots: placed, sport: s,
    mapHref: s ? `/states/${st}?s=${encodeURIComponent(s)}&map=1` : `/states/${st}?map=1`,
  });

  // Sport bar: sports present in the state, plus the chosen one so it stays selected when empty.
  const keys = new Set(all.map((p) => p.key));
  if (s) keys.add(s);
  const bar = keys.size ? `<div class="st-bar">${A.sportBar({ keys: [...keys], active: s, hrefFor: (k) => hrefFor(st, k), label: `Sports in ${stName}` })}</div>` : "";

  let body = "";
  if (!s && all.length) {
    const cards = around(all);
    body += `<section class="sec st-around" aria-labelledby="st-ar">${A.sectionHead({ title: `Around ${stName}`, id: "st-ar", sub: "A few programs from across the state, one sport at a time." })}<div class="cards is-rail cols-4 st-cards">${cards.map((p) => A.programCard(p, {})).join("")}</div></section>`;
  }

  if (placed.length) {
    const byCity = new Map();
    for (const p of placed) { const c = cityKey(p); if (!byCity.has(c)) byCity.set(c, []); byCity.get(c).push(p); }
    const cities = [...byCity.keys()].sort((a, b) => a.localeCompare(b));
    const nC = cities.length;
    // A city with two or more programs gets its own heading; one-program cities share
    // one A to Z list (each row names its city), so the page is not a wall of headings.
    const many = cities.filter((c) => byCity.get(c).length > 1);
    const singles = cities.filter((c) => byCity.get(c).length === 1).map((c) => byCity.get(c)[0]);
    const groups = many.map((c) => grp(c, byCity.get(c).sort(byTrust), { single: !!s }, byCity.get(c).length)).join("") +
      (singles.length ? grp(many.length ? "Other cities" : "Cities, A to Z", singles, { single: !!s }, singles.length) : "");
    body += `<section class="sec" aria-labelledby="st-city">${A.sectionHead({ title: "Programs by city", id: "st-city", sub: `${plural(nC, "city", "cities")}, A to Z. We show the city only, so check each website for the exact place.` })}${groups}</section>`;
  }

  if (statewide.length) {
    body += `<section class="sec" aria-labelledby="st-wide">${A.sectionHead({ title: `Across ${stName}, no single city listed`, id: "st-wide", sub: `These organizations serve ${stName} but don't list a single city.` })}${A.rowList(statewide.sort(byTrust), { single: !!s }, { id: "st-wide-rows" })}</section>`;
  }

  if (!list.length) {
    const pool = s ? D.items.filter((p) => p.key === s) : D.items;
    body += `<section class="sec">${A.emptyState(s ? {
      title: `No ${sLow} listed in ${stName} yet.`,
      body: "Know one? Tell us and we'll check it.",
      actions: [{ label: `See every sport in ${stName}`, href: hrefFor(st), attrs: "data-replace" }, { label: "Tell us about one", href: "/add/program" }],
    } : {
      title: `No programs listed in ${stName} yet.`,
      body: "Know one? Tell us and we'll check it.",
      actions: [{ label: "Tell us about one", href: "/add/program" }, { label: "Browse by state", href: "/states" }],
    })}</section>`;
    const groups = A.nearestOutside({ kind: "state", state: st, coords: null, city: null }, pool);
    if (groups.length) {
      body += `<section class="sec" aria-labelledby="st-out">${A.sectionHead({ title: `Nearest ${s ? sLow : "programs"} outside ${stName}`, id: "st-out", sub: "Nearest states first. An organization with no single city counts from the middle of its state." })}${groups.map((g) => grp(A.stateName(g.state), g.items, { single: !!s, outside: true })).join("")}</section>`;
    }
  }

  // Grants teaser: 2 open athlete grants, real amounts first.
  const gr = D.grants.map((g) => [g, A.grantInfo(g)]).filter(([g, i]) => g.audience === "athlete" && i.open)
    .sort((a, b) => (!!b[1].amount - !!a[1].amount) || a[0].name.localeCompare(b[0].name)).slice(0, 2);
  if (gr.length) {
    body += `<section class="sec" aria-labelledby="st-gr">${A.sectionHead({ title: "Grants for athletes", id: "st-gr", sub: "Money for equipment, travel and fees. You apply on the grant maker's site.", seeAll: { label: "See all grants", href: "/grants?a=athlete" } })}<div class="glist">${gr.map(([g]) => A.grantRow(g)).join("")}</div></section>`;
  }

  return {
    title: site(stateMeta(stName, s ? sLow : "").title),
    description: stateMeta(stName, s ? sLow : "").description,
    html: `<div class="st">${head}${bar}${body}${A.letterBlock({ source: "state" })}</div>`,
    aside: A.aboutBox(),
    railActive: "states",
  };
}

export function mount(root, ctx) {
  return () => {};
}
