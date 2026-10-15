/* Events `/events` (spec 6.11, WP-F).
   No calendar or RSS feed links: there are no events yet, so the page promises no feed. */
import * as A from "../app.js";

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

export async function render(ctx) {
  const events = ctx.data.events || [];

  const body = events.length
    ? `<div class="ev-groups">${monthGroups(events)}</div>
<div class="btns ev-add">${A.btn("Add an event", "/add/event", "orange", { icon: "calendar-plus" })}</div>`
    : `<div class="ev-empty">${A.emptyState({
        title: "No events posted yet",
        body: "Events are the newest part of this directory. Know of one coming up? Add it and a person will check it before it goes live.",
        image: "event",
        actions: [
          { label: "Add an event", href: "/add/event", kind: "orange" },
          { label: "Get the letter", href: "", kind: "line", attrs: 'data-jump="letter"' },
        ],
      })}</div>`;

  const html = `<div class="ehead">
  <h1 tabindex="-1">Events</h1>
  <p>Clinics, tryouts, games and meetups.</p>
</div>
${body}
${A.letterBlock({ source: "events" })}`;

  return {
    title: "Adaptive sports events · Adaptive Sports Near Me",
    description: "Adaptive sports clinics, tryouts, games and meetups. A person checks every event before it goes live.",
    html,
    aside: A.aboutBox(),
    railActive: "events",
  };
}

export function mount() {
  return () => {};
}
