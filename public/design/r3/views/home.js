/* Home `#/` (spec 6.1, WP-B).
   Order: hero (headline, inline place search) beside the poster mosaic, then
   "Near <city>" (only after a search), "Checked by a person", grants for
   athletes, the state tile map, events, the letter and the help band.
   No national counts anywhere on this page (5.4). No aside.
   PROMOTE: .v-home .mz (poster mosaic: square tiles, the figure in the upper
   area and the label on its own band below it). Built here because only home uses it today. */
import * as A from "../app.js";

const MOSAIC = ["basketball", "tennis", "swimming", "equestrian", "skiing", "running", "sailing", "goalball", "climbing"];
const CHECKED_ORDER = ["tennis", "basketball", "equestrian", "soccer", "swimming", "baseball", "sledhockey", "golf", "rowing", "archery", "cycling", "sailing"];

/** One verified, placed, dated listing per sport, each from a different state, newest check first. */
function checkedMix(items) {
  const pool = items.filter((p) => p.verified && p.placed && p.lastChecked)
    .sort((a, b) => String(b.lastChecked).localeCompare(String(a.lastChecked)));
  const states = new Set(), out = [];
  for (const k of CHECKED_ORDER) {
    const p = pool.find((x) => x.key === k && !states.has(x.state));
    if (p) { out.push(p); states.add(p.state); }
    if (out.length === 8) break;
  }
  return out;
}

function mosaic() {
  const tiles = MOSAIC.map((k, i) => {
    const name = A.sportName(k);
    const { t, d } = A.toneOf(k);
    // The label sits on its own band under the figure, never on top of it.
    return `<li class="mz-item${i === 0 ? " is-big" : name.length > 10 ? " is-long" : ""}"><a class="mz-tile" href="#/sports/${A.esc(k)}" style="--t:${t};--d:${d}">${A.plate(k, { kind: "tile", cls: "mz-plate" })}<span class="mz-label">${A.esc(name)}</span></a></li>`;
  }).join("");
  return `<section class="mz" aria-labelledby="mz-h"><h2 id="mz-h" class="mz-h">Explore by sport</h2><ul class="mz-grid">${tiles}</ul><p class="mz-all"><a class="tlink" href="#/sports">See all sports${A.icon("arrow-right", 18)}</a></p></section>`;
}

function hero() {
  const last = A.recall("place");
  // The last search sits on the same line as "Use my location", so the mosaic stays in the first screen.
  const chip = last ? `<a class="chip hero-last" href="#/near/${encodeURIComponent(last)}">${A.icon("history", 18)}<span>Last search: ${A.esc(last)}</span></a>` : "";
  return `<section class="hero"><div class="hero-text"><h1 class="display" tabindex="-1">Find adaptive sports near you.</h1><p class="hero-lede">Programs, grants and events, each with the date we last checked it. Free, and no account needed.</p>${A.whereForm({ id: "home-where", after: chip })}</div>${mosaic()}</section>`;
}

async function nearRail(D) {
  const label = A.recall("place");
  if (!label) return "";
  let where;
  try { where = await A.resolvePlace(label); } catch (_) { return ""; }
  if (!where || (where.kind !== "city" && where.kind !== "zip") || !where.coords) return "";
  const L = A.ladder(where, D.items);
  const list = [...L.inCity, ...L.near].slice(0, 8);
  if (!list.length) return "";
  const short = where.short || where.city;
  return `<section class="sec home-near">${A.sectionHead({ title: "Near " + short, seeAll: { label: "See all near " + short, href: "#/near/" + encodeURIComponent(where.label) } })}<div class="cards is-rail cols-4">${list.map((p) => A.programCard(p, { where })).join("")}</div></section>`;
}

function checkedRail(D) {
  const list = checkedMix(D.items);
  if (!list.length) return "";
  return `<section class="sec home-checked">${A.sectionHead({ title: "Checked by a person", sub: "A person on our team confirmed each of these against an official source." })}<div class="cards is-rail cols-4">${list.map((p) => A.programCard(p, { stamp: true })).join("")}</div></section>`;
}

function grants(D) {
  const open = D.grants.filter((g) => g.audience === "athlete" && A.grantInfo(g).open);
  const withAmt = open.filter((g) => A.grantInfo(g).amount), rest = open.filter((g) => !A.grantInfo(g).amount);
  const list = [...withAmt, ...rest].slice(0, 3);
  if (!list.length) return "";
  return `<section class="sec home-grants">${A.sectionHead({ title: "Grants for athletes", sub: "Money for equipment, travel and fees. You apply on the grant maker's site.", seeAll: { label: "See all grants", href: "#/grants?a=athlete" } })}<div class="grows glist is-one">${list.map(A.grantRow).join("")}</div></section>`;
}

function states() {
  return `<section class="sec home-states">${A.sectionHead({ title: "Browse by state" })}${A.tileMap({ list: "toggle" })}</section>`;
}

function events() {
  return `<section class="sec home-events">${A.sectionHead({ title: "Events" })}${A.emptyState({
    title: "No events posted yet",
    body: "Know of a clinic, tryout or game day coming up? Add it and a person will check it before it goes live.",
    image: "event",
    // Line buttons: the letter's Subscribe, just below, is this screen's one ink button (4.14).
    actions: [{ label: "Add an event", href: "#/add/event", kind: "line" }],
  })}</section>`;
}

export async function render(ctx) {
  const D = ctx.data || await A.loadData();
  const near = await nearRail(D);
  return {
    title: "Adaptive Sports Near Me: find adaptive sports near you",
    description: "Find adaptive sports programs, grants and events near you, each with the date we last checked it. Free, no account needed.",
    html: hero() + near + checkedRail(D) + grants(D) + states() + events() + A.letterBlock({ source: "home" }) + A.helpBand(),
  };
}

export function mount(root) {
  // A blank placeholder lets CSS float the label once the field has text.
  const input = root.querySelector("#home-where");
  if (input) input.setAttribute("placeholder", " ");
  return () => {};
}
