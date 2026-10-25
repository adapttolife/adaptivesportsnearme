/* Events `/events` (spec 6.11, WP-F).
   No calendar or RSS feed links: there are no events yet, so the page promises no feed.
   Under the dated calendar, Yearly events (docs/specs/programs-that-come-back.md): every
   yearly event, by when it usually happens next, each with its next dates or "Usually late
   October". Before the yearly events exist on the server, that section is simply not there. */
import * as A from "../app.js";
import { site, PAGES } from "../page-meta.js";
import { seriesState, dateRange, ordinal, dayParts } from "../yearly.js";
import { usualText } from "./event-series.js";

const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Month groups (h2 "October 2026") of event cards, soonest first. */
function monthGroups(events) {
  const dated = events
    .map((e) => { const d = A.eventDay(e.start || e.date); return { e, t: d ? d.getTime() : NaN }; })
    .filter((x) => Number.isFinite(x.t))
    .sort((a, b) => a.t - b.t);
  const groups = new Map();
  for (const { e, t } of dated) {
    const d = new Date(t);
    const k = MONTH[d.getMonth()] + " " + d.getFullYear();
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(e);
  }
  let i = 0;
  return [...groups].map(([label, list]) => {
    const id = "ev-m" + (++i);
    return `<section class="ev-month" aria-labelledby="${id}"><h2 id="${id}" class="num">${A.esc(label)}</h2><div class="ev-list">${list.map(A.eventCard).join("")}</div></section>`;
  }).join("");
}

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** When a yearly event comes round next, as a day number for sorting: its next dates when
    they're set, else its usual part of the month this year or next. Unknown goes last. */
function nextTime(st, now) {
  if (st.next) { const p = dayParts(st.next.starts_at); return new Date(p.y, p.m, p.d).getTime(); }
  if (!st.usualMonth) return Infinity;
  const day = /^early /.test(st.usual) ? 5 : /^mid /.test(st.usual) ? 15 : /^late /.test(st.usual) ? 25 : 1;
  // seriesState works out the year the next dates should fall in (this year, or next once this year's has run).
  return new Date(st.nextYear || now.getFullYear(), st.usualMonth - 1, day).getTime();
}

/** One yearly event card: the month it falls in, its name (to its page), and its next dates or usual time. */
function yearlyCard(s, st) {
  const p = st.next ? dayParts(st.next.starts_at) : null;
  const mon = p ? MON[p.m] : st.usualMonth ? MON[st.usualMonth - 1] : "";
  const at = s.city && s.state ? `${s.city}, ${s.state}` : s.state ? A.stateName(s.state) : "";
  const sport = s.sport_key && s.sport_key !== "multi" ? A.sportName(s.sport_key) : "";
  const meta = [sport, at].filter(Boolean).join(" · ");
  const when = st.next
    ? `<p class="ec-when num">${st.nth ? `${A.esc(ordinal(st.nth))} annual · ` : ""}${A.esc(dateRange(st.next.starts_at, st.next.ends_at))}</p>`
    : `<p class="ec-when">${A.esc(st.usual ? usualText(st.usual) : "Every year")}</p><p class="ye-wait">Dates not announced yet</p>`;
  return `<article class="ecard ycard"><div class="ec-date num${p ? "" : " is-usual"}" aria-hidden="true"><span>${A.esc(mon)}</span>${p ? `<b>${p.d}</b>` : `<b class="ye-ic">${A.icon("history", 22)}</b>`}</div><div class="ec-body"><h3 class="ec-name"><a href="/events/${A.esc(encodeURIComponent(s.slug))}">${A.esc(s.name)}</a></h3>${meta ? `<p class="meta">${A.esc(meta)}</p>` : ""}${when}</div></article>`;
}

/** The Yearly events section, soonest first; "" when there are none. */
export function yearlySection(series, now = new Date()) {
  const rows = (series || []).filter((s) => s && s.slug && s.name)
    .map((s) => { const st = seriesState(s, s.editions || [], now); return { s, st, t: nextTime(st, now) }; })
    .sort((a, b) => (a.t - b.t) || a.s.name.localeCompare(b.s.name));
  if (!rows.length) return "";
  return `<section class="ev-yearly" aria-labelledby="ev-yearly-h"><h2 id="ev-yearly-h">Yearly events</h2><p class="ev-ysub">Held every year, in the order they come round next.</p><div class="ev-list">${rows.map(({ s, st }) => yearlyCard(s, st)).join("")}</div></section>`;
}

/** Every public yearly event, or [] when the server has none (or doesn't have them yet). */
async function loadSeries() {
  try {
    const r = await fetch("/api/event-series");
    if (!r.ok) return [];
    const body = await r.json();
    return Array.isArray(body && body.items) ? body.items : [];
  } catch (_) { return []; }
}

export async function render(ctx) {
  const events = ctx.data.events || [];
  const yearly = yearlySection(await loadSeries(), ctx.now || new Date());

  const body = events.length
    ? `<div class="ev-groups">${monthGroups(events)}</div>
<div class="btns ev-add">${A.btn("Add an event", "/add/event", "orange", { icon: "calendar-plus" })}</div>`
    : yearly
    ? `<div class="ev-none"><p>No dated events right now. Know one coming up? Tell us and we'll check it.</p><div class="btns">${A.btn("Add an event", "/add/event", "orange", { icon: "calendar-plus" })}</div></div>`
    : `<div class="ev-empty">${A.emptyState({
        title: "No events posted yet",
        body: "Know one coming up? Tell us and we'll check it.",
        image: "event",
        actions: [
          { label: "Add an event", href: "/add/event", kind: "orange" },
          { label: "Get the letter", href: "", kind: "line", attrs: 'data-jump="letter"' },
        ],
      })}</div>`;

  const html = `<div class="ehead">
  <h1 tabindex="-1">Events</h1>
  <p>Clinics, tryouts, games and meetups, soonest first.</p>
</div>
${body}
${yearly}
${A.letterBlock({ source: "events" })}`;

  return {
    title: site(PAGES.events.title),
    description: PAGES.events.description,
    html,
    aside: A.aboutBox(),
    railActive: "events",
  };
}

export function mount() {
  return () => {};
}
