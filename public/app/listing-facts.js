/* What a listing page says first: the facts strip (When · Cost · Ages · Who it's for ·
   Equipment) and the one freshness line (docs/specs/community-kept-directory.md, phase 1).
   Off season isn't closed: a summer program in November says "Off season · back in summer".
   Pure functions, no DOM: the organization page, the program page and the tests share them. */
import { SEASONS, seasonsText, cleanSeasons } from "./yearly.js";
import { WHO_ORDER, WHO_LABELS } from "./who.js";

const SEASON_WORD = {
  spring: "spring",
  summer: "summer",
  fall: "fall",
  winter: "winter",
};
const MON = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const escHtml = (s) =>
  s == null
    ? ""
    : String(s).replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c],
      );

/** The season a date falls in: Mar to May spring, Jun to Aug summer, Sep to Nov fall, Dec to Feb winter. */
export function seasonOf(now = new Date()) {
  const m = now.getMonth();
  return m >= 2 && m <= 4
    ? "spring"
    : m >= 5 && m <= 7
      ? "summer"
      : m >= 8 && m <= 10
        ? "fall"
        : "winter";
}

/** Every season a listing runs in, from its sports ([{ key, seasons }]); [] when it hasn't said. */
export function seasonsOf(p) {
  const all = new Set();
  for (const s of p && Array.isArray(p.seasons) ? p.seasons : [])
    for (const x of cleanSeasons(s && s.seasons)) all.add(x);
  return SEASONS.filter((s) => all.has(s));
}

/** "Winter", "Summer and fall", "Year-round", or "Off season · back in winter" when today's season
    isn't one of them; "" when the listing hasn't said. */
export function whenText(p, now = new Date()) {
  const list = seasonsOf(p);
  if (!list.length) return "";
  if (list.length === 4) return "Year-round";
  const cur = seasonOf(now);
  if (list.includes(cur)) return seasonsText(list);
  const i = SEASONS.indexOf(cur);
  const next = [1, 2, 3]
    .map((k) => SEASONS[(i + k) % 4])
    .find((s) => list.includes(s));
  return `Off season · back in ${SEASON_WORD[next]}`;
}

/** "Provided" for the yes we store (the label says Equipment); any other words as they are; "" for none. */
export function equipmentText(v) {
  const t = String(v == null ? "" : v).trim();
  if (!t) return "";
  return /^(provided|yes|1|true)$/i.test(t) ? "Provided" : t;
}

/** Who it's for, up to three labels in the chip order: "Kids and teens, Physical disabilities". */
export function whoText(codes, max = 3) {
  const list = WHO_ORDER.filter(
    (c) => Array.isArray(codes) && codes.includes(c),
  ).map((c) => WHO_LABELS[c]);
  return list.slice(0, max).join(", ");
}

/** [[label, text]] for the strip, empty items left out. */
export function factsOf(p, now = new Date()) {
  const cost = String((p && p.cost) || "").trim();
  return [
    ["When", whenText(p, now)],
    ["Cost", cost],
    ["Ages", String((p && p.ages) || "").trim()],
    ["Who it's for", whoText(p && p.who)],
    ["Equipment", equipmentText(p && p.equipment)],
  ].filter(([, v]) => v);
}

/** The strip under the name and the website button; "" when there is nothing to say. */
export function factsStrip(p, now = new Date(), esc = escHtml) {
  const items = factsOf(p, now);
  if (!items.length) return "";
  return `<dl class="pg-strip">${items.map(([k, v]) => `<div${/^Off season/.test(v) ? ' class="is-off"' : ""}><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`;
}

const monYear = (ym) => {
  const m = /^(\d{4})-(\d{2})/.exec(String(ym || ""));
  return m && +m[2] >= 1 && +m[2] <= 12 ? `${MON[+m[2] - 1]} ${m[1]}` : "";
};
const monDay = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ""));
  return m && +m[2] >= 1 && +m[2] <= 12 ? `${MON[+m[2] - 1]} ${+m[3]}` : "";
};

/** One freshness line: "Confirmed by the organization · Oct 2026", else "Checked Oct 12" (the word the
    cards use too), else "Listed Oct 3" for a listing nobody has checked yet, else "". */
export function freshness(p) {
  const confirmed = monYear(p && p.history && p.history.updatedByOrganization);
  if (confirmed) return `Confirmed by the organization · ${confirmed}`;
  const checked = monDay(p && p.lastChecked);
  if (checked) return `Checked ${checked}`;
  const listed = monDay(p && p.listedAt);
  return listed ? `Listed ${listed}` : "";
}
