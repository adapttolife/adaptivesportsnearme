/* Home `/`, direction C ("Signal Blocks").
   Order: the coral hero (headline, place search, an athlete that changes sport
   twice and then rests), sports, the four doors (grants, events, veterans, run a
   program), "Near <city>" after a search, "Checked by our team", grants on a
   yellow band, events on a teal band, states, the letter, help.
   Colour follows Laura Lian's identity: each colour is paired with black.
   No national counts on this page. */
import * as A from "../app.js";

// The hero athlete cycles through these, and the block takes each one's colour.
const HERO = A.LOOK === "hues"
  ? [["basketball", "#FF4FA0"], ["swimming", "#3D7BFF"], ["cycling", "#2DBE6C"], ["soccer", "#8B5CF6"]]
  : [["basketball", "#FF5C39"], ["swimming", "#00C7B1"], ["cycling", "#F6B700"], ["soccer", "#F96C03"]];
const GRID = ["tennis", "basketball", "soccer", "baseball", "equestrian", "swimming", "skiing", "sledhockey"];
const CHECKED_ORDER = ["tennis", "basketball", "equestrian", "soccer", "swimming", "baseball", "sledhockey", "golf", "rowing", "archery", "cycling", "sailing"];

/** One team-checked, placed, dated listing per sport, each from a different state, newest check first. */
function checkedMix(items) {
  const pool = items.filter((p) => p.teamChecked && p.placed && p.lastChecked)
    .sort((a, b) => String(b.lastChecked).localeCompare(String(a.lastChecked)));
  const states = new Set(), out = [];
  for (const k of CHECKED_ORDER) {
    const p = pool.find((x) => x.key === k && !states.has(x.state));
    if (p) { out.push(p); states.add(p.state); }
    if (out.length === 8) break;
  }
  return out;
}

function hero() {
  const last = A.recall("place");
  const chip = last ? `<a class="chip hb-last" href="/near/${encodeURIComponent(last)}">${A.icon("history", 18)}<span>Last search: ${A.esc(last)}</span></a>` : "";
  const figures = [...new Set([...HERO.map(([k]) => k), ...GRID])];
  const figs = figures.map((k, i) => `<span class="hb-fig${i === 0 ? " is-on" : ""}" data-hero-figure="${A.esc(k)}">${A.fig(k, { big: true, cls: "fig--pin fig--mid" })}</span>`).join("");
  return `<section class="hb" data-hero style="--hb:${HERO[0][1]};--hb-fg:${A.toneOf(HERO[0][0]).d}"><div class="hb-art" aria-hidden="true">${figs}</div>
<div class="hb-text"><h1 class="display" tabindex="-1">Find your place in adaptive sports.</h1><p class="hb-lede">Programs, grants and events near you. Every listing shows when we last checked it.</p>${A.whereForm({ id: "home-where", after: chip })}</div></section>`;
}

function sports(D) {
  const counts = {};
  for (const p of D.items) counts[p.key] = (counts[p.key] || 0) + 1;
  const tiles = GRID.map((k) => `<li><a class="st" href="/sports/${A.esc(k)}" data-hero-sport="${A.esc(k)}">${A.plate(k, { kind: "tile", cls: "st-plate" })}<span class="st-name">${A.esc(A.sportName(k))}</span><span class="st-n num">${counts[k] || 0} programs</span></a></li>`).join("");
  const all = `<li><a class="st st--all" href="/sports"><span class="st-allbox">${A.icon("layout-grid", 34)}<b>All sports</b></span><span class="st-name">See all 45</span><span class="st-n">From archery to water skiing</span></a></li>`;
  return `<section class="sec hs" aria-labelledby="hs-h">${A.sectionHead({ title: "Pick a sport", id: "hs-h" })}<ul class="st-grid">${tiles}${all}</ul></section>`;
}

function doors() {
  const d = (cls, href, key, title, line) => `<a class="door ${cls}" href="${href}"><span class="door-fig">${A.fig(key, { color: cls === "door--ink" ? "#FFFFFF" : "#1A1A1A", big: true })}</span><b>${title}</b><span>${line}</span></a>`;
  return `<nav class="doors" aria-label="More ways in">${d("door--sun", "/grants", "grant", "Grants", "Money for gear, travel and programs")}${d("door--sea", "/events", "event", "Events", "Clinics, tryouts and game days")}${d("door--ink", "/sports/veteran-meetup", "veteran-meetup", "Veterans", "Meetups, coffee calls and outdoor days near you")}${d("door--coral", "/add/program", "multi", "Run a program?", "List it free. A person checks it.")}</nav>`;
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
  return `<section class="sec home-near">${A.sectionHead({ title: "Near " + short, seeAll: { label: "See all near " + short, href: "/near/" + encodeURIComponent(where.label) } })}<div class="cards is-rail cols-4">${list.map((p) => A.programCard(p, { where })).join("")}</div></section>`;
}

function checkedRail(D) {
  const list = checkedMix(D.items);
  if (!list.length) return "";
  return `<section class="sec home-checked">${A.sectionHead({ title: "Checked by our team", sub: "A person on our team checked each of these against public sources." })}<div class="cards is-rail cols-4">${list.map((p) => A.programCard(p, { stamp: true })).join("")}</div></section>`;
}

function grants(D) {
  const open = D.grants.filter((g) => g.audience === "athlete" && A.grantInfo(g).open);
  const withAmt = open.filter((g) => A.grantInfo(g).amount), rest = open.filter((g) => !A.grantInfo(g).amount);
  const list = [...withAmt, ...rest].slice(0, 3);
  if (!list.length) return "";
  return `<section class="band band--sun" aria-labelledby="hg-h"><div class="band-in"><div class="band-head"><span class="band-fig">${A.fig("grant", { color: "#1A1A1A", big: true })}</span><div><h2 id="hg-h">Grants for athletes</h2><p>Money for equipment, travel and fees. You apply on the grant maker's site.</p></div></div><div class="grows glist is-one">${list.map(A.grantRow).join("")}</div><a class="btn btn--ink band-all" href="/grants?a=athlete">See all grants</a></div></section>`;
}

function events() {
  return `<section class="band band--sea" aria-labelledby="he-h"><div class="band-in"><div class="band-head"><span class="band-fig">${A.fig("event", { color: "#1A1A1A", big: true })}</span><div><h2 id="he-h">Events</h2><p>No events posted yet. Know of a clinic, tryout or game day coming up? Add it and a person will check it before it goes live.</p></div></div><a class="btn btn--ink band-all" href="/add/event">Add an event</a></div></section>`;
}

function states() {
  return `<section class="sec home-states">${A.sectionHead({ title: "Browse by state" })}${A.tileMap({ list: "toggle" })}</section>`;
}

export async function render(ctx) {
  const D = ctx.data || await A.loadData();
  const near = await nearRail(D);
  return {
    title: "Adaptive Sports Near Me: find your place in adaptive sports",
    description: "Find adaptive sports programs, grants and events near you, each with the date we last checked it. Free, no account needed.",
    html: hero() + sports(D) + doors() + near + checkedRail(D) + grants(D) + events() + states() + A.letterBlock({ source: "home" }) + A.helpBand(),
  };
}

export function mount(root) {
  const input = root.querySelector("#home-where");
  if (input) input.setAttribute("placeholder", " ");
  const hb = root.querySelector("[data-hero]");
  if (!hb) return () => {};
  const title = hb.querySelector("h1");
  const figs = [...hb.querySelectorAll("[data-hero-figure]")];
  const tiles = [...root.querySelectorAll("[data-hero-sport]")];
  let i = 0, active = null;
  const fitTitle = () => {
    title.style.removeProperty("font-size");
    title.style.removeProperty("max-width");
    title.style.removeProperty("width");
    const style = getComputedStyle(title);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = `${style.fontStyle} ${style.fontVariant} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    let size = parseFloat(getComputedStyle(title).fontSize);
    let lineHeight = parseFloat(getComputedStyle(title).lineHeight);
    while (title.scrollHeight > lineHeight * 3 + 1 && size > 24) {
      size -= 1;
      title.style.fontSize = `${size}px`;
      lineHeight = parseFloat(getComputedStyle(title).lineHeight);
    }
  };
  const setBannerHeight = () => {
    const current = title.textContent;
    title.style.setProperty("transition", "none");
    hb.style.removeProperty("min-height");
    let height = 0;
    for (const key of [null, ...new Set([...HERO.map(([sport]) => sport), ...GRID])]) {
      title.textContent = key ? `Find your place in adaptive ${A.sportName(key)}.` : "Find your place in adaptive sports.";
      fitTitle();
      height = Math.max(height, hb.getBoundingClientRect().height);
    }
    title.textContent = current;
    fitTitle();
    hb.style.minHeight = `${Math.ceil(height)}px`;
    title.style.removeProperty("transition");
  };
  const show = (key, color, foreground, sport) => {
    figs.forEach((f) => f.classList.toggle("is-on", f.dataset.heroFigure === key));
    hb.style.setProperty("--hb", color);
    hb.style.setProperty("--hb-fg", foreground);
    hb.classList.toggle("is-ink", foreground === "#FFFFFF");
    title.textContent = sport ? `Find your place in adaptive ${A.sportName(key)}.` : "Find your place in adaptive sports.";
    fitTitle();
  };
  const showLoop = () => show(HERO[i][0], HERO[i][1], A.toneOf(HERO[i][0]).d);
  const begin = (key) => {
    active = key;
    const tone = A.toneOf(key);
    show(key, tone.t, tone.d, true);
  };
  const end = () => {
    active = null;
    showLoop();
  };
  const enter = (event) => begin(event.currentTarget.dataset.heroSport);
  const leave = () => end();
  const focus = (event) => begin(event.currentTarget.dataset.heroSport);
  const blur = () => end();
  const resize = () => setBannerHeight();
  setBannerHeight();
  for (const tile of tiles) {
    tile.addEventListener("pointerenter", enter);
    tile.addEventListener("pointerleave", leave);
    tile.addEventListener("focus", focus);
    tile.addEventListener("blur", blur);
  }
  addEventListener("resize", resize);
  const t = matchMedia("(prefers-reduced-motion: reduce)").matches ? null : setInterval(() => {
    if (active) return;
    i = (i + 1) % HERO.length;
    showLoop();
  }, 2600);
  return () => {
    if (t) clearInterval(t);
    for (const tile of tiles) {
      tile.removeEventListener("pointerenter", enter);
      tile.removeEventListener("pointerleave", leave);
      tile.removeEventListener("focus", focus);
      tile.removeEventListener("blur", blur);
    }
    removeEventListener("resize", resize);
  };
}
