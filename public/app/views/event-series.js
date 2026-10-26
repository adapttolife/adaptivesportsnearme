/* A yearly event `/events/:slug` (docs/specs/programs-that-come-back.md).
   One page that stays true all year: the next dates and a Register button once the host
   has set them, else when it usually happens and that the next dates aren't out yet.
   Past years list each year's dates and place, with a link to the host's own results and
   photos. Never an athlete's name. The words for "when" come from public/app/yearly.js. */
import * as A from "../app.js";
import { site, PAGES, seriesMeta } from "../page-meta.js";
import { seriesState, dateRange, ordinal, dayParts } from "../yearly.js";

const good = (u) => (/^https?:\/\/\S+$/i.test(String(u || "").trim()) ? String(u).trim() : null);
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const where = (x) => [x && x.venue, x && x.city && x.state ? `${x.city}, ${x.state}` : x && (x.city || (x.state ? A.stateName(x.state) : ""))].filter(Boolean).join(", ");
const place = (x) => (x && x.city && x.state ? `${x.city}, ${x.state}` : x && x.state ? A.stateName(x.state) : "");

function notFoundSeries() {
  return {
    title: site(PAGES.seriesNotFound.title),
    description: PAGES.seriesNotFound.description,
    html: `<section class="nf"><h1 tabindex="-1">We couldn't find that event</h1><p>It may have been removed or renamed.</p><div class="btns">${A.btn("See all events", "/events", "ink")}${A.btn("Find a program", "/", "line")}</div></section>`,
    railActive: "events",
  };
}

/** "Usually late October" or, from the usual month alone, "Usually in October". */
export function usualText(usual) {
  if (!usual) return "";
  return /^(early|mid|late) /.test(usual) ? `Usually ${usual}` : `Usually in ${usual}`;
}

/** Who hosts it: the organization's page (the API names it whenever the host is public), else the host's name. */
function hostHtml(s) {
  const org = s.organization && s.organization.id ? s.organization : null;
  if (org) return `<a href="/organizations/${A.esc(encodeURIComponent(org.id))}">${A.esc(org.name || s.host_name || "")}</a>`;
  const name = (org && org.name) || s.host_name || "";
  return name ? A.esc(name) : "";
}

/** The top of the page: the next dates, or when it usually happens. */
function stateBlock(s, st) {
  const home = good(s.url);
  // On its days it's happening, not next: too late to register, and the results come from the host.
  if (st.now) {
    const e = st.now;
    const at = where(e) || place(s);
    const site = good(e.url) || home;
    return `<section class="es-state is-next" aria-labelledby="es-now-h"><p class="es-lab" id="es-now-h">${A.icon("calendar-check", 18)}<span>Happening now</span></p><p class="es-when num">${st.nowNth ? `<span class="es-nth">${A.esc(ordinal(st.nowNth))} annual</span><span class="es-dot" aria-hidden="true"> · </span>` : ""}${A.esc(dateRange(e.starts_at, e.ends_at))}</p>${at ? `<p class="es-at">${A.esc(at)}</p>` : ""}${site ? `<div class="btns">${A.btn("Event website", site, "ink", { external: true })}</div>` : ""}</section>`;
  }
  if (st.next) {
    const e = st.next;
    const when = dateRange(e.starts_at, e.ends_at);
    const at = where(e) || place(s);
    const reg = good(e.url) || home;
    return `<section class="es-state is-next" aria-labelledby="es-next-h"><p class="es-lab" id="es-next-h">${A.icon("calendar-check", 18)}<span>Next</span></p><p class="es-when num">${st.nth ? `<span class="es-nth">${A.esc(ordinal(st.nth))} annual</span><span class="es-dot" aria-hidden="true"> · </span>` : ""}${A.esc(when)}</p>${at ? `<p class="es-at">${A.esc(at)}</p>` : ""}${reg ? `<div class="btns">${A.btn("Register", reg, "ink", { external: true })}</div>` : ""}</section>`;
  }
  const since = st.since ? `Every year since <span class="num">${st.since}</span>.` : "";
  const usual = st.usual ? `${A.esc(usualText(st.usual))}.` : "";
  const wait = st.nextYear ? `The <span class="num">${st.nextYear}</span> dates aren't announced yet.` : "The next dates aren't announced yet.";
  return `<section class="es-state is-wait" aria-labelledby="es-wait-h"><p class="es-lab" id="es-wait-h">${A.icon("history", 18)}<span>Yearly event</span></p><p class="es-say">${[since, usual].filter(Boolean).join(" ")}</p><p class="es-say">${wait}</p>${home ? `<div class="btns">${A.btn("Visit their website", home, "ink", { external: true })}</div>` : ""}</section>`;
}

/** Past years, newest first: the year, its dates and place, and the host's results page. */
function pastYears(st) {
  if (!st.past.length) return "";
  const rows = st.past.map((e) => {
    const y = dayParts(e.starts_at).y;
    const at = where(e);
    const recap = good(e.recap_url);
    return `<li class="es-year"><b class="es-y num">${y}</b><div class="es-yb"><p class="num">${A.esc(dateRange(e.starts_at, e.ends_at))}</p>${at ? `<p class="es-yat">${A.esc(at)}</p>` : ""}${recap ? `<a class="tlink" href="${A.esc(recap)}" target="_blank" rel="noopener">Results and photos${A.icon("external-link", 16)}<span class="sr"> (opens in a new tab)</span></a>` : ""}</div></li>`;
  }).join("");
  return `<section class="es-sec" aria-labelledby="es-past-h"><h2 id="es-past-h">Past years</h2><ol class="es-years">${rows}</ol></section>`;
}

/** The page for one yearly event. s: the API's series row with its editions; now: today. */
export function seriesHtml(s, D, now = new Date()) {
  const st = seriesState(s, s.editions || [], now);
  const key = s.sport_key && s.sport_key !== "multi" ? s.sport_key : "";
  const sport = key ? A.sportName(key) : "";
  const at = place(s) || ((st.now || st.next) ? place(st.now || st.next) : st.past[0] ? place(st.past[0]) : "");
  const host = hostHtml(s);
  const meta = [sport ? A.esc(sport) : "", at ? A.esc(at) : "", host ? `Hosted by ${host}` : ""].filter(Boolean).join(" · ");
  const back = `<a class="es-back" href="/events" data-back="/events">${A.icon("arrow-left", 20)}<span>Events</span></a>`;
  const head = `<div class="es-head">${A.plate(key || "event", { kind: "row", cls: "es-tile" })}<div class="es-htext"><h1 tabindex="-1">${A.esc(s.name)}</h1>${meta ? `<p class="es-meta">${meta}</p>` : ""}</div></div>`;
  const about = s.description ? `<section class="es-sec" aria-labelledby="es-about-h"><h2 id="es-about-h">About</h2><p>${A.esc(s.description)}</p></section>` : "";
  const tell = `<p class="es-tell">Know about next year's dates? <a href="/add/event">Tell us</a></p>`;
  const html = `<article class="es">${back}${head}${stateBlock(s, st)}${about}${pastYears(st)}${tell}</article>
${A.letterBlock({ source: "event-series" })}`;
  const m = seriesMeta({ name: s.name, sport, host: (s.organization && s.organization.name) || s.host_name || "", place: at, usual: st.usual });
  const lead = st.now || st.next;
  const reg = lead ? good(lead.url) || good(s.url) : good(s.url);
  const sticky = reg ? A.stickyBar({
    left: lead ? `<b class="num">${A.esc(dateRange(lead.starts_at, lead.ends_at))}</b>` : `<span>${A.esc(st.usual ? cap(usualText(st.usual)) : "Yearly event")}</span>`,
    action: { label: st.now ? "Event website" : st.next ? "Register" : "Visit their website", href: reg, external: true },
  }) : "";
  return { title: site(m.title), description: m.description, html, sticky, railActive: "events" };
}

export async function render(ctx) {
  const slug = String(ctx.params.slug || "").toLowerCase();
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return notFoundSeries();
  const s = await A.retryOnce(async () => {
    const r = await fetch("/api/event-series/" + encodeURIComponent(slug));
    if (r.status === 404) return null;
    if (!r.ok) throw new Error("/api/event-series " + r.status);
    const body = await r.json();
    return (body && body.series) || null;
  }).catch((e) => { const err = new Error(String(e && e.message || e)); err.loadFailed = true; throw err; });
  if (!s || !s.name) return notFoundSeries();
  return seriesHtml(s, ctx.data, ctx.now || new Date());
}

export function mount() {
  return () => {};
}
