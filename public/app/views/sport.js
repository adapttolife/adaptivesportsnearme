/* Sport community page: /sports/:key (spec 6.5, community header 4.10). WP-D.
   Query: t = programs | grants | events (default programs), st = two-letter state.
   Counts stay local (5.4): the header counts only with a state (st) or the
   visitor's remembered place, never a national total.
   PROMOTE:
   - .v-sport .pchips: horizontal row of filter chip links with a right fade edge
     (place chips). Same shape the state page could use for city chips.
   - .v-sport .stsel: compact 48px labelled <select> used as the visible fallback
     for a chip row.
   (The .grp group heading is shared and lives in app.css.) */
import * as A from "../app.js";
import { guideFor } from "../sport-guides.js";

const TABS = ["programs", "grants", "events"];
const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const byName = (a, b) => a.name.localeCompare(b.name);
const byCity = (a, b) => (b.placed - a.placed) || String(a.cityFirst || "").localeCompare(String(b.cityFirst || "")) || byName(a, b);

function hrefFor(key, { st = "", t = "" } = {}) {
  const q = new URLSearchParams();
  if (t && t !== "programs") q.set("t", t);
  if (st) q.set("st", st);
  const s = q.toString();
  return "/sports/" + key + (s ? "?" + s : "");
}

/** One state group: h3 with a local count, the first rows, then a link to the state view. */
function stateGroup(key, st, list, cap, hidden = false) {
  const show = list.length <= cap + 1 ? list : list.slice(0, cap);
  const more = list.length > show.length
    ? `<a class="grp-all" href="${A.esc(hrefFor(key, { st }))}" data-replace>See all ${list.length} in ${A.esc(A.stateName(st))}${A.icon("arrow-right", 18)}</a>` : "";
  return `<div class="grp"${hidden ? " hidden" : ""}><div class="grp-hd"><h3 class="grp-h">${A.esc(A.stateName(st))}</h3><span class="grp-n num">${list.length === 1 ? "1 program" : list.length + " programs"}</span></div><div class="rows">${show.map((p) => A.programRow(p, { single: true })).join("")}</div>${more}</div>`;
}

function nearestBlock(key, st, pool) {
  const groups = A.nearestOutside({ kind: "state", state: st, coords: null, city: null }, pool);
  if (!groups.length) return "";
  const name = lc(A.sportName(key));
  return `<section class="sec" aria-labelledby="sp-out">${A.sectionHead({ title: `Nearest ${name} outside ${A.stateName(st)}`, id: "sp-out", sub: "Nearest states first. A program with no single city counts from the middle of its state." })}${groups.map((g) => `<div class="grp"><div class="grp-hd"><h3 class="grp-h">${A.esc(A.stateName(g.state))}</h3></div><div class="rows">${g.items.map((p) => A.programRow(p, { single: true, outside: true })).join("")}</div></div>`).join("")}</section>`;
}

/** The sport in plain words (public/app/sport-guides.js): what it is always visible, then
    "New to X? Start here" opens who plays, what you need, how to start and the national body. */
function guideBlock(key, low) {
  const g = guideFor(key);
  if (!g) return "";
  const row = (dt, dd) => `<div><dt>${dt}</dt><dd>${A.esc(dd)}</dd></div>`;
  const body = `<a class="tlink" href="${A.esc(g.body.url)}" target="_blank" rel="noopener">${A.esc(g.body.name)}${A.icon("external-link", 18)}<span class="sr"> (opens in a new tab)</span></a>`;
  return `<section class="sp-guide" aria-labelledby="sp-guide-h"><h2 id="sp-guide-h" class="sr">About ${A.esc(low)}</h2><p class="sp-guide-what">${A.esc(g.what)}</p><details class="sp-guide-more"><summary>${A.icon("chevron-right", 20)}<span>New to ${A.esc(low)}? Start here</span></summary><div class="sp-guide-in"><dl class="sp-guide-dl">${row("Who plays", g.who)}${row("What you need", g.gear)}${row("How to start", g.start)}</dl><p class="sp-guide-body"><span>National body</span>${body}</p></div></details></section>`;
}

function programsTab(key, st, pool) {
  const name = A.sportName(key), low = lc(name);
  const counts = {};
  for (const p of pool) if (p.state) counts[p.state] = (counts[p.state] || 0) + 1;
  const ranked = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || A.stateName(a).localeCompare(A.stateName(b)));

  // Place chips: All states, then each state with this sport by local count.
  const chip = (label, n, href, cur) => `<a class="chip${cur ? " is-cur" : ""}" href="${A.esc(href)}" data-replace${cur ? ' aria-current="page"' : ""}>${cur ? A.icon("check", 18) : ""}<span>${A.esc(label)}</span>${n != null ? ` <span class="num chip-n">${n}</span>` : ""}</a>`;
  const chips = ranked.length || st ? `<nav class="pchips" aria-label="${A.esc(name)} by state"><div class="pchips-in">${chip("All states", null, hrefFor(key), !st)}${st && !counts[st] ? chip(A.stateName(st), null, hrefFor(key, { st }), true) : ""}${ranked.map((s) => chip(A.stateName(s), counts[s], hrefFor(key, { st: s }), st === s)).join("")}</div></nav>` : "";

  // The visible fallback: a native select of every state (listed ones first).
  const opt = (s) => `<option value="${s}"${st === s ? " selected" : ""}>${A.esc(A.stateName(s))}${counts[s] ? " " + counts[s] : ""}</option>`;
  const listed = A.STATE_CODES.filter((s) => counts[s]), rest = A.STATE_CODES.filter((s) => !counts[s]);
  const select = `<form class="stsel" data-st-form><label for="sp-st">Choose a state</label><div class="stsel-row"><select id="sp-st" name="st"><option value=""${!st ? " selected" : ""}>All states</option>${listed.length ? `<optgroup label="${A.esc(name)} listed">${listed.map(opt).join("")}</optgroup>` : ""}${rest.length ? `<optgroup label="Not listed yet">${rest.map(opt).join("")}</optgroup>` : ""}</select><button type="submit" class="btn btn--line">Show</button></div></form>`;

  // Small tile map (tablet and desktop only). Tiles change the filter, so they replace.
  // Six states or more: fewer than that, the map is mostly zeros and the chips say it better.
  const map = ranked.length >= 6 ? `<div class="sp-map"><h3 class="sp-map-h">Where ${A.esc(low)} is listed</h3>${A.tileMap({ counts, hrefFor: (s) => hrefFor(key, { st: s }), selected: st, list: "none" }).replace(/<a class="tile /g, '<a data-replace class="tile ')}</div>` : "";

  const tools = `<section class="sp-where" aria-labelledby="sp-where-h"><h2 class="sr" id="sp-where-h">Find ${A.esc(low)} by state</h2>${chips}${select}${map}</section>`;

  let body = "";
  if (st) {
    const list = pool.filter((p) => p.state === st).sort((a, b) => (b.verified - a.verified) || byCity(a, b));
    if (list.length) {
      body = `<section class="sec sec--first" aria-labelledby="sp-in">${A.sectionHead({ title: `${name} in ${A.stateName(st)}`, id: "sp-in" })}${A.rowList(list, { single: true }, { id: "sp-in-rows" })}</section>`;
    } else {
      body = `<section class="sec sec--first">${A.emptyState({
        title: `No ${low} listed in ${A.stateName(st)} yet.`,
        body: "This directory is new and still growing. If you know one, tell us and a person will check it.",
        actions: [{ label: `See ${low} everywhere`, href: hrefFor(key), attrs: "data-replace" }, { label: "Tell us about one", href: "/add/program" }],
      })}</section>${nearestBlock(key, st, pool)}`;
    }
  } else if (!pool.length) {
    body = `<section class="sec sec--first">${A.emptyState({
      title: `No ${low} listed yet`,
      body: "This directory is new and still growing. Know a program? Add it and a person will check it before it goes up.",
      actions: [{ label: "Tell us about one", href: "/add/program" }, { label: "Browse sports", href: "/sports" }],
    })}</section>`;
  } else {
    // One list by state. Verified listings (the program confirmed) sort first in each state;
    // nothing is split out or labeled "not verified" (Alec, 2026-10-14).
    const withState = pool.filter((p) => p.state);
    const none = pool.filter((p) => !p.state).sort(byName);
    if (withState.length) {
      const by = {};
      for (const p of withState) (by[p.state] = by[p.state] || []).push(p);
      const sts = Object.keys(by).sort((a, b) => A.stateName(a).localeCompare(A.stateName(b)));
      // Twelve states first, then "Show all N states" opens the rest in place (the state chips
      // above jump straight to any one state).
      const FIRST = 12;
      const groups = sts.map((s, i) => stateGroup(key, s, by[s].sort((a, b) => (b.verified - a.verified) || byCity(a, b)), sts.length > FIRST ? 2 : 3, i >= FIRST)).join("");
      const moreBtn = sts.length > FIRST ? `<button type="button" class="btn btn--line rows-more" data-more="sp-v-groups" data-count="${sts.length} states">Show all ${sts.length} states</button>` : "";
      body += `<section class="sec sec--first" aria-labelledby="sp-v">${A.sectionHead({ title: "By state", id: "sp-v" })}<div class="grps" id="sp-v-groups">${groups}</div>${moreBtn}</section>`;
    }
    if (none.length) {
      body += `<section class="sec" aria-labelledby="sp-n">${A.sectionHead({ title: "Place not listed yet", id: "sp-n", sub: "These listings don't say where they are yet. If you know, suggest an update." })}${A.rowList(none, { single: true }, { id: "sp-n-rows" })}</section>`;
    }
  }
  return tools + body;
}

export async function render(ctx) {
  const D = ctx.data;
  const key = ctx.params.key;
  if (!key || !D.sportByKey[key] || key === "grant" || key === "event") return A.notFound();
  const name = A.sportName(key), low = lc(name);
  const t = TABS.includes(ctx.query.t) ? ctx.query.t : "programs";
  const stQ = String(ctx.query.st || "").toUpperCase();
  const st = D.shapes[stQ] && A.stateName(stQ) !== stQ ? stQ : "";
  const pool = D.items.filter((p) => p.key === key);
  A.remember("recent", key);

  // Header count: local only. A link to the visitor's own results when there is a remembered place.
  const link = (text, href, ic) => `<a class="sp-count" href="${A.esc(href)}"${href.startsWith("/sports/") ? " data-replace" : ""}>${A.icon(ic, 18)}<span>${A.esc(text)}</span></a>`;
  let count = null;
  if (st) {
    const inSt = pool.filter((p) => p.state === st);
    if (inSt.length) count = `${inSt.length} in ${A.esc(A.stateName(st))}`;
  } else {
    const label = A.recall("place");
    if (label) {
      try {
        const w = await A.resolvePlace(label);
        if (w && w.kind !== "none" && w.state) {
          if (w.kind === "state") {
            const n = pool.filter((p) => p.state === w.state).length;
            if (n) count = link(`${n} in ${A.stateName(w.state)}`, hrefFor(key, { st: w.state }), "map");
          } else {
            const g = A.ladder(w, pool);
            const n = g.inCity.length + g.near.length;
            const inState = g.inCity.length + g.elsewhere.length + g.statewide.length + g.near.filter((p) => p.state === w.state).length;
            if (n) count = link(`${n} near ${w.short}`, "/near/" + encodeURIComponent(label) + "?s=" + encodeURIComponent(key), "map-pin");
            else if (inState) count = link(`${inState} in ${A.stateName(w.state)}`, hrefFor(key, { st: w.state }), "map");
          }
        }
      } catch (e) { /* no count is the honest fallback */ }
    }
  }

  const tabs = [
    { label: "Programs", href: hrefFor(key, { st }), current: t === "programs" },
    { label: "Grants", href: hrefFor(key, { st, t: "grants" }), current: t === "grants" },
    { label: "Events", href: hrefFor(key, { st, t: "events" }), current: t === "events" },
  ];
  const head = A.communityHeader({ kind: "sport", key, title: name, line: A.sportNote(key), count, tabs });

  let body = "";
  if (t === "programs") {
    body = programsTab(key, st, pool);
    // Veterans: the meetups, plus Karen's state-by-state veteran-owned business directories.
    if (key === "veteran-meetup") body = `<a class="vet-res" href="/resources/veteran-owned-businesses"><b>Veteran-owned businesses</b><span>Directories for all 50 states</span>${A.icon("arrow-right", 22)}</a>` + body;
  } else if (t === "grants") {
    const gs = D.grants.map((g) => [g, A.grantInfo(g)]);
    const sorter = (a, b) => (!!b[1].amount - !!a[1].amount) || a[0].name.localeCompare(b[0].name);
    const open = gs.filter(([, i]) => i.open).sort(sorter), shut = gs.filter(([, i]) => !i.open).sort(sorter);
    body = `<section class="sec sec--first" aria-labelledby="sp-g">${A.sectionHead({ title: "Grants for any sport", id: "sp-g", sub: "Most grants cover any sport. Check each one's rules." })}
      ${open.length ? `<h3 class="grp-h grp-h--g">Open now</h3><div class="glist">${open.map(([g]) => A.grantRow(g)).join("")}</div>` : ""}
      ${shut.length ? `<h3 class="grp-h grp-h--g">Past deadlines and closed for now</h3><p class="grp-sub">Check their site for the next round.</p><div class="glist">${shut.map(([g]) => A.grantRow(g)).join("")}</div>` : ""}</section>`;
  } else {
    body = `<section class="sec sec--first">${A.emptyState({
      title: `No ${low} events posted yet`,
      body: "Know of a clinic, tryout or game day coming up? Add it and a person will check it before it goes live.",
      actions: [{ label: "Add an event", href: "/add/event" }, { label: "Get the letter", href: "", kind: "line", attrs: 'data-jump="letter"' }],
      image: "event",
    })}</section>`;
  }

  const title = st ? `${name} in ${A.stateName(st)}: adaptive programs, grants and events` : `${name}: adaptive programs, grants and events`;
  return {
    title,
    description: `Adaptive ${low} programs, grants and events${st ? " in " + A.stateName(st) : ""}. Every listing shows when we last checked it.`,
    html: `<div class="sp sp--${A.esc(t)}">${head}${t === "programs" ? guideBlock(key, low) : ""}${body}${A.letterBlock({ source: "sport" })}</div>`,
    aside: A.aboutBox(),
    railActive: "sport:" + key,
  };
}

export function mount(root, ctx) {
  // Touch screens: choosing in the native picker is the whole action. With a keyboard the
  // select waits for its own button, so arrow keys never navigate by surprise.
  const form = root.querySelector("[data-st-form]");
  const go = () => A.nav(hrefFor(ctx.params.key, { st: form.elements.st.value }), { replace: true });
  const onSubmit = (e) => { e.preventDefault(); go(); };
  const onChange = () => { if (matchMedia("(pointer: coarse)").matches) go(); };
  if (form) { form.addEventListener("submit", onSubmit); form.elements.st.addEventListener("change", onChange); }
  // Keep the selected state chip in view.
  const cur = root.querySelector(".pchips .is-cur");
  const row = root.querySelector(".pchips");
  if (cur && row && cur.offsetLeft > row.clientWidth - 40) row.scrollLeft = cur.offsetLeft - 16;
  return () => { if (form) { form.removeEventListener("submit", onSubmit); form.elements.st.removeEventListener("change", onChange); } };
}
