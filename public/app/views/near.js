/* Near results, /near/:place (spec 6.2, WP-C).
   The honest order: in your city, then within about 25 miles (or the distance the
   visitor picks: ?mi=50, 100 or 250; any state), then elsewhere in your state, then
   across your state with no single city listed. Distances come only from
   A.relation() through the shared cards and rows.

   PROMOTE: (none yet; the results header, toolbar and group head are scoped here
   as .v-near .nr-*. If the state page wants the same group head, lift .nr-gh.) */
import * as A from "../app.js";
import { site, PAGES, nearMeta } from "../page-meta.js";

const GROUP_IDS = { inCity: "nr-in", near: "nr-near", elsewhere: "nr-else", statewide: "nr-sw" };
let LAST = null; // { path, qs } of the previous near render, to announce filter changes

/* ---------- address helpers (the path stays exactly as typed, so map=1 stays an overlay-only change) ---------- */
function hrefFor(ctx, changes = {}) {
  const q = { s: ctx.query.s || "", mi: ctx.query.mi || "", ...changes };
  const qs = new URLSearchParams();
  if (q.s) qs.set("s", q.s);
  if (q.mi && String(A.radiusFrom(q.mi)) === String(q.mi) && A.radiusFrom(q.mi) !== A.RADII[0]) qs.set("mi", String(q.mi));
  if (q.map === "1") qs.set("map", "1");
  const s = qs.toString();
  return ctx.path + (s ? "?" + s : "");
}
const plural = (n, one, many) => (n === 1 ? one : many);

/* ---------- pieces ---------- */
function groupHead({ id, title, count, sub }) {
  return `<div class="nr-gh"><h2 id="${A.esc(id)}" tabindex="-1">${A.esc(title)}</h2>${count != null ? `<span class="nr-n num" aria-hidden="true">${count}</span>` : ""}</div>${sub ? `<p class="nr-gsub">${A.esc(sub)}</p>` : ""}`;
}

/* Cards on a card grid; on phones only the first `phoneCards` show, and the rest
   come back as compact rows (both lists exist; CSS shows one per breakpoint).
   Cards stop at the first card that would repeat the picture just before it, so two
   identical posters never stack; the order of the list never changes. The desktop
   grid (two columns beside the aside) gets an even number so no card sits alone. */
function cardsThenRows(list, rctx, { deskCards, phoneCards = 2, id }) {
  let run = 0;
  while (run < list.length && run < deskCards && (run === 0 || list[run].key !== list[run - 1].key || (list[run].trio && list[run - 1].trio))) run++;
  const phoneN = Math.min(phoneCards, run);
  const deskN = run >= 2 ? run - (run % 2) : 0;
  const n = Math.max(phoneN, deskN);
  const cards = list.slice(0, n).map((p, i) =>
    `<div class="nr-ci${i >= phoneN ? " nr-desk-only" : ""}${i >= deskN ? " nr-phone-only" : ""}">${A.programCard(p, { where: rctx.where })}</div>`).join("");
  const phoneRest = list.slice(phoneN);
  const deskRest = list.slice(deskN);
  return (n ? `<div class="cards nr-cards">${cards}</div>` : "") +
    (phoneRest.length ? `<div class="nr-phone-only nr-after">${A.rowList(phoneRest, rctx, { id: id + "-pr" })}</div>` : "") +
    (deskRest.length ? `<div class="nr-desk-only nr-after">${A.rowList(deskRest, rctx, { id: id + "-dr" })}</div>` : "");
}

function legend(where, hasDots, hasYou) {
  const bits = [];
  if (hasYou) bits.push(`<li><i class="nr-k nr-k--you" aria-hidden="true"></i>Where you searched</li>`);
  if (hasDots) bits.push(`<li><i class="nr-k nr-k--dot" aria-hidden="true"></i>Cities with programs</li>`);
  return bits.length ? `<ul class="nr-legend">${bits.join("")}</ul>` : "";
}

/* ---------- views ---------- */
function notFoundPlace(ctx, text, dym = []) {
  const shown = text || "that place";
  return {
    title: site(PAGES.placeNotFound.title),
    description: PAGES.placeNotFound.description,
    html: `<section class="nr-none">
  <h1 tabindex="-1">We couldn't find "${A.esc(shown)}"</h1>
  <p class="nr-none-body">Try a city and state, like Springfield, IL, or a 5\u2011digit ZIP code.</p>
  ${dym.length ? `<div class="nr-dym">${A.didYouMeanHtml(dym)}</div>` : ""}
  <div class="nr-none-form">${A.whereForm({ value: text, sport: ctx.query.s && A.sportName(ctx.query.s) ? ctx.query.s : "", id: "nr-where" })}</div>
  ${A.stateList({ mode: "open" })}
</section>${A.letterBlock({ source: "near" })}${A.helpBand()}`,
    aside: A.aboutBox(),
  };
}

export async function render(ctx) {
  const D = ctx.data || await A.loadData();
  const text = String(ctx.params.place || "").trim();
  const where = await A.resolvePlace(text);

  if (where.kind === "state") {
    // A state search shows the state page instead (sport kept).
    const s = ctx.query.s && D.sportByKey[ctx.query.s] ? ctx.query.s : "";
    A.nav("/states/" + where.state + (s ? "?s=" + encodeURIComponent(s) : ""), { replace: true });
    return { title: site(A.stateName(where.state)), html: `<section class="nr-none"><h1 tabindex="-1">${A.esc(A.stateName(where.state))}</h1></section>` };
  }
  if (where.kind === "none") {
    const sp = ctx.query.s && D.sportByKey[ctx.query.s] ? ctx.query.s : "";
    return notFoundPlace(ctx, text, await A.didYouMean(text, sp));
  }

  A.remember("place", where.label);

  const s = ctx.query.s && D.sportByKey[ctx.query.s] ? ctx.query.s : "";
  const sportLow = s ? A.sportName(s).toLowerCase() : "";
  const ST = A.stateName(where.state);
  const city = where.short;

  const mi = A.radiusFrom(ctx.query.mi);
  const pool = s ? D.items.filter((p) => A.offers(p, s)) : D.items;
  const g = A.ladder(where, pool, { radius: mi });
  const total = g.inCity.length + g.near.length + g.elsewhere.length + g.statewide.length;
  const more = g.elsewhere.length + g.statewide.length;

  // Sport bar: sports present anywhere in this place's ladder, plus the active one.
  const full = A.ladder(where, D.items, { radius: mi });
  const keys = new Set();
  for (const list of [full.inCity, full.near, full.elsewhere, full.statewide]) for (const p of list) for (const k of A.sportsOf(p)) keys.add(k);
  if (s) keys.add(s);

  // Programs are listed as places of their own now, so the list says what the menu's
  // "Programs near you" promised; the separate programs section this replaced is gone.
  const h1 = `${s ? A.sportName(s) : "Programs"} near ${where.label}`;
  const rctx = { where, single: !!s };
  /* 1. results header */
  const dots = pool.filter((p) => p.state === where.state && p.placed);
  const outline = A.stateOutline(where.state, { dots, you: where.coords, size: 120 });
  const hasYou = /class="so-you"/.test(outline);
  const sum = [];
  if (g.inCity.length) sum.push(`<b class="num">${g.inCity.length}</b> in ${A.esc(city)}`);
  if (g.near.length) sum.push(`<b class="num">${g.near.length}</b> within about ${mi} miles`);
  if (more) sum.push(`<b class="num">${more}</b> more in ${A.esc(ST)}`);
  const header = `<div class="nr-hd">
  ${outline ? `<div class="nr-stamp" aria-hidden="true">${outline}</div>` : ""}
  <div class="nr-text">
    <h1 tabindex="-1">${A.esc(h1)}</h1>
    ${sum.length ? `<p class="nr-sum">${sum.join(" · ")}</p>` : ""}
  </div>
  <div class="nr-foot">
    <p class="nr-note">${A.icon("info", 18)}<span>Distances are city to city, so they are close, not exact.</span></p>
    ${outline ? legend(where, dots.length > 0, hasYou) : ""}
  </div>
</div>`;

  /* 2. sticky toolbar */
  const toolbar = `<div class="nr-tools" role="group" aria-label="Search and filters">
  <button type="button" class="nr-place" data-open="search" data-place="${A.esc(where.label)}" data-sport="${A.esc(s)}">
    <span class="nr-place-t"><b>${A.esc(where.label)}</b><span class="nr-place-sep" aria-hidden="true"> · </span><span class="nr-place-s">${A.esc(s ? A.sportName(s) : "Any sport")}</span></span>${A.icon("chevron-down", 20)}
  </button>
  <a class="chip nr-mapbtn" href="${A.esc(hrefFor(ctx, { map: "1" }))}" data-nr-map>${A.icon("map", 18)}<span class="nr-maplabel">Map</span></a>
</div>`;

  /* 3. sport bar, 3b. how far, 4. jump chips */
  const bar = `<div class="nr-bar">${A.sportBar({ keys: [...keys], active: s, hrefFor: (k) => hrefFor(ctx, { s: k }), label: "Sports near " + where.label, sheet: true })}</div>`;
  const dist = `<nav class="nr-dist" aria-label="How far from ${A.esc(where.short)}"><span class="nr-dist-t" aria-hidden="true">How far</span><ul>${A.RADII.map((r) =>
    `<li><a class="chip" href="${A.esc(hrefFor(ctx, { mi: String(r) }))}" data-replace${r === mi ? ' aria-current="true"' : ""}><span><span class="num">${r}</span> mi</span></a></li>`).join("")}</ul></nav>`;
  const jumps = total ? `<div class="nr-jumps">${A.jumpChips([
    { id: GROUP_IDS.inCity, label: "In " + city, count: g.inCity.length },
    { id: GROUP_IDS.near, label: `About ${mi} mi`, count: g.near.length },
    { id: GROUP_IDS.elsewhere, label: "Elsewhere in " + ST, count: g.elsewhere.length },
    { id: GROUP_IDS.statewide, label: "Across " + ST, count: g.statewide.length },
  ])}</div>` : "";

  /* 5. groups */
  let groups = "";
  if (g.inCity.length) {
    groups += `<section class="nr-group" aria-labelledby="${GROUP_IDS.inCity}">${groupHead({ id: GROUP_IDS.inCity, title: "In " + city, count: g.inCity.length, sub: `Listed in ${city}. Check each website for the exact place.` })}${s ? A.rowList(g.inCity, rctx, { id: "nr-in-rows" }) : cardsThenRows(g.inCity, rctx, { deskCards: 6, id: "nr-in" })}</section>`;
  }
  if (g.near.length) {
    const body = s ? A.rowList(g.near, rctx, { id: "nr-near-rows" }) : cardsThenRows(g.near, rctx, { deskCards: 6, id: "nr-near" });
    groups += `<section class="nr-group" aria-labelledby="${GROUP_IDS.near}">${groupHead({ id: GROUP_IDS.near, title: `Within about ${mi} miles`, count: g.near.length, sub: "Closest first." })}${body}</section>`;
  }
  if (g.elsewhere.length) {
    groups += `<section class="nr-group" aria-labelledby="${GROUP_IDS.elsewhere}">${groupHead({ id: GROUP_IDS.elsewhere, title: "Elsewhere in " + ST, count: g.elsewhere.length, sub: where.coords ? "Closest first." : null })}${A.rowList(g.elsewhere, rctx, { id: "nr-else-rows" })}</section>`;
  }
  if (g.statewide.length) {
    groups += `<section class="nr-group" aria-labelledby="${GROUP_IDS.statewide}">${groupHead({ id: GROUP_IDS.statewide, title: `Across ${ST}, no single city listed`, count: g.statewide.length, sub: `These organizations serve ${ST} but don't list a single city.` })}${A.rowList(g.statewide, rctx, { id: "nr-sw-rows" })}</section>`;
  }

  /* 6. empty or thin */
  let empty = "";
  if (!total) {
    const what = s ? sportLow : "programs";
    const actions = [];
    // Offer the nearest distance that finds something; never a button to another empty page.
    const wider = A.RADII.find((r) => r > mi && A.ladder(where, pool, { radius: r }).near.length);
    if (wider) actions.push({ label: `Look within ${wider} miles`, href: hrefFor(ctx, { mi: String(wider) }), attrs: "data-replace" });
    if (s) actions.push({ label: "See every sport near " + city, href: hrefFor(ctx, { s: "" }), attrs: "data-replace" });
    else actions.push({ label: "Browse by state", href: "/states" });
    actions.push({ label: "Tell us about one", href: "/add/program" });
    empty = `<div class="nr-empty">${A.emptyState({
      title: `No ${what} near ${city} yet`,
      body: "Know one? Tell us and we'll check it.",
      actions,
    })}</div>`;
    const out = A.nearestOutside(where, pool);
    if (out.length) {
      empty += `<section class="nr-group nr-outside" aria-labelledby="nr-out">${groupHead({ id: "nr-out", title: `Nearest ${s ? sportLow : "programs"} outside ${ST}`, sub: "Nearest states first. An organization with no single city counts from the middle of its state, so it shows no miles." })}${out.map((grp) =>
        `<h3 class="nr-sth">${A.esc(A.stateName(grp.state))}</h3><div class="rows">${grp.items.map((p) => A.programRow(p, { ...rctx, outside: true })).join("")}</div>`).join("")}</section>`;
    }
  }

  const html = `<div class="nr">${header}${toolbar}${bar}${dist}${jumps}${empty}${groups}</div>${A.letterBlock({ source: "near" })}${A.helpBand()}`;
  return {
    title: site(h1),
    description: nearMeta(where.label, s ? { name: A.sportName(s), low: sportLow } : null, mi).description,
    html,
    aside: A.aboutBox(),
    railActive: "near",
  };
}

export function mount(root, ctx) {
  // The results toolbar sticks below the header: jumps land below both.
  const tools = root.querySelector(".nr-tools"), rootStyle = document.documentElement.style;
  const setStick = () => rootStyle.setProperty("--stick-h", (tools ? tools.offsetHeight : 0) + "px");
  setStick();
  const ro = window.ResizeObserver && tools ? new ResizeObserver(setStick) : null;
  if (ro) ro.observe(tools);
  const unstick = () => { if (ro) ro.disconnect(); rootStyle.removeProperty("--stick-h"); };
  const qs = ctx.query.s || "", mi = A.radiusFrom(ctx.query.mi);
  // Announce the new count after a filter change on the same place (spec 6.2 side effects).
  if (LAST && LAST.path === ctx.path && (LAST.qs !== qs || LAST.mi !== mi)) {
    const label = (root.querySelector(".nr-place b") || {}).textContent || "";
    const sport = ctx.query.s ? A.sportName(ctx.query.s).toLowerCase() + " " : "";
    if (LAST.qs === qs) {
      const n = Number((root.querySelector(`#${GROUP_IDS.near} + .nr-n`) || {}).textContent) || 0;
      setTimeout(() => A.announce(`${n} ${sport}${plural(n, "program", "programs")} within about ${mi} miles of ${label}`), 80);
    } else {
      const total = countTotal(root);
      setTimeout(() => A.announce(`${total} ${sport}${plural(total, "program", "programs")} near ${label}`), 80);
    }
  }
  LAST = { path: ctx.path, qs, mi };

  const onClick = (e) => {
    // Tell the map it was pushed on top of this page, so closing it can go Back.
    if (e.target.closest("[data-nr-map]")) window.__asnmMapFrom = A.here();
  };
  root.addEventListener("click", onClick);
  return () => { root.removeEventListener("click", onClick); unstick(); };
}

function countTotal(root) {
  let t = 0;
  for (const el of root.querySelectorAll(".nr-group:not(.nr-outside) .nr-n")) t += Number(el.textContent) || 0;
  return t;
}
