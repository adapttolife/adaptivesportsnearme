/* Your sports and seasons: the checklist an organization fills in on Confirm your listing
   (/update/<id>?rel=run) and in its own editor (/manage). Each ticked sport gets season
   chips: Spring, Summer, Fall, Winter, Year-round. The answer is one object,
   {"skiing":["winter"],"tennis":["spring","summer"]}, the same one the server stores as
   organizations.sport_seasons_json (docs/specs/programs-that-come-back.md).
   Also the Yearly events rows (name, usual month, website) for Confirm your listing.
   No import of app.js: the caller passes sport names in, so tests can load this file. */
import { SEASONS, MONTHS, cleanSeasons, sportSeasonsJson, parseSportSeasons } from "./yearly.js";

const SEASON_LABEL = { spring: "Spring", summer: "Summer", fall: "Fall", winter: "Winter", "year-round": "Year-round" };
const NOT_A_SPORT = new Set(["multi", "grant", "event"]);
// A small lock where the box would be (a disabled box draws grey, which reads as "off").
const LOCK = `<svg class="sck-lock-ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

/** The groups, in this order; any sport not named here goes under Other. */
export const SPORT_GROUPS = [
  ["winter", "Winter", ["skiing", "nordicskiing", "sledhockey", "curling"]],
  ["water", "Water", ["swimming", "rowing", "sailing", "surfing", "waterskiing"]],
  ["court", "Court and racket", ["tennis", "pickleball", "basketball", "volleyball", "rugby", "goalball", "boccia", "fencing", "handball"]],
  ["field", "Team and field", ["soccer", "baseball", "softball", "beepbaseball", "football", "lacrosse", "trackfield"]],
  ["outdoors", "Outdoors and fitness", ["cycling", "handcycling", "running", "wheelchairracing", "triathlon", "climbing", "golf", "archery", "shooting", "equestrian", "equestrianvaulting", "martialarts", "powerlifting", "dance"]],
  ["other", "Other", []],
];

const escHtml = (s) => (s == null ? "" : String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])));
let N = 0;

/** keys -> [{ id, label, keys }] in group order, each group A to Z by name, empty groups dropped. */
export function groupSports(keys, nameOf = (k) => k) {
  const all = [...new Set(keys)].filter((k) => k && !NOT_A_SPORT.has(k));
  const placed = new Set();
  const out = [];
  for (const [id, label, members] of SPORT_GROUPS) {
    const list = id === "other" ? all.filter((k) => !placed.has(k)) : members.filter((k) => all.includes(k));
    list.forEach((k) => placed.add(k));
    if (list.length) out.push({ id, label, keys: list.sort((a, b) => String(nameOf(a)).localeCompare(String(nameOf(b)))) });
  }
  return out;
}

/** What an organization already says, for prefilling: its own sport_seasons_json, else its sports_json
    list or its one sport (seasons not said yet). Returns [{ key, seasons }]. */
export function chosenFrom(org, validKey = () => true) {
  const told = org && parseSportSeasons(org.sport_seasons_json, validKey);
  if (told) return told;
  let keys = [];
  const raw = org && org.sports_json;
  if (raw) {
    try { const v = typeof raw === "string" ? JSON.parse(raw) : raw; if (Array.isArray(v)) keys = v.map((k) => String(k).trim().toLowerCase()); } catch (_) {}
  }
  if (!keys.length && org) keys = [String(org.sport_key || org.sport || "").trim().toLowerCase()];
  return [...new Set(keys)].filter((k) => k && !NOT_A_SPORT.has(k) && k !== "several" && validKey(k)).map((key) => ({ key, seasons: [] }));
}

/** The checklist. keys: every sport to offer; nameOf: key -> "Skiing"; chosen: [{ key, seasons }] ticked to start.
    Real checkboxes with labels; no field names, so nothing posts until readChecklist() says what to send. */
/** The five season chips for one sport (or one program, key "_"). */
function chipsHtml(key, seasons, esc) {
  const s = cleanSeasons(seasons);
  const all = SEASONS.every((x) => s.includes(x));
  const chip = (season, checked) => `<label class="sck-chip${season === "year-round" ? " sck-chip--all" : ""}"><input type="checkbox" data-of="${esc(key)}" data-season="${season}"${checked ? " checked" : ""}><span>${SEASON_LABEL[season]}</span></label>`;
  return `<div class="sck-chips">${SEASONS.map((x) => chip(x, s.includes(x))).join("")}${chip("year-round", all)}</div>`;
}

/** keys: every sport to offer; nameOf: key -> "Skiing"; chosen: [{ key, seasons }] ticked to start;
    locked: sport keys that have their own program page, shown ticked and fixed (their seasons
    still change here; the program itself is managed under Programs). */
export function checklistHtml({ keys, nameOf = (k) => k, chosen = [], locked = [], esc = escHtml } = {}) {
  const uid = "sck" + (++N);
  const on = new Map((chosen || []).map((c) => [c.key, cleanSeasons(c.seasons)]));
  const fixed = new Set((locked || []).filter((k) => k && !NOT_A_SPORT.has(k)));
  for (const k of fixed) if (!on.has(k)) on.set(k, []);
  const groups = groupSports([...keys, ...on.keys()], nameOf);
  const box = (k) => fixed.has(k)
    ? `<label class="sck-sport is-on is-locked"><input type="checkbox" data-sport="${esc(k)}" checked disabled aria-describedby="${uid}-lock-${esc(k)}">${LOCK}<span>${esc(nameOf(k))}<small class="sck-lock" id="${uid}-lock-${esc(k)}">Has its own program. Manage it under Programs.</small></span></label>`
    : `<label class="sck-sport${on.has(k) ? " is-on" : ""}"><input type="checkbox" data-sport="${esc(k)}"${on.has(k) ? " checked" : ""}><span>${esc(nameOf(k))}</span></label>`;
  const sports = groups.map((g) => `<div class="sck-group" role="group" aria-labelledby="${uid}-${g.id}"><p class="sck-gh" id="${uid}-${g.id}">${esc(g.label)}</p><div class="sck-list">${g.keys.map(box).join("")}</div></div>`).join("");
  const rows = groups.flatMap((g) => g.keys).map((k) => `<fieldset class="sck-row" data-row="${esc(k)}"${on.has(k) ? "" : " hidden"}><legend>${esc(nameOf(k))}</legend>${chipsHtml(k, on.get(k) || [], esc)}</fieldset>`).join("");
  return `<div class="sck" data-sport-checklist><div class="sck-sports">${sports}</div><div class="sck-when"${on.size ? "" : " hidden"}><p class="sck-wh">When does each one run?</p><p class="sck-hint">Pick its seasons. Leave them blank if you're not sure.</p>${rows}</div></div>`;
}

/** [{ key, seasons }] from the checklist's boxes, in the order they appear. inputs: the
    checkboxes (DOM elements or anything with { checked, dataset }). */
export function collect(inputs) {
  const list = [...inputs];
  const out = [];
  for (const box of list) {
    const key = box.dataset && box.dataset.sport;
    if (!key || !box.checked) continue;
    const seasons = list.filter((x) => x.dataset && x.dataset.of === key && x.checked).map((x) => x.dataset.season);
    out.push({ key, seasons: cleanSeasons(seasons) });
  }
  return out;
}
/** The checklist's answer, read from the page. */
export function readChecklist(root) {
  return collect(root.querySelectorAll("[data-sport-checklist] input[type=checkbox]"));
}
/** The value to post: '{"skiing":["winter"]}', or "" when nothing is ticked. */
export function sportsValue(list) {
  return sportSeasonsJson(list) || "";
}

/** Keeps the checklist honest as it's ticked: a ticked sport shows its season chips, Year-round
    ticks all four (and unticks with any of them). onChange runs after each change. Returns cleanup. */
/* ---------- One program's seasons (the program form in /manage) ---------- */
/** A fieldset of season chips. Read it with readSeasons(); post it as seasons_json. */
export function seasonsFieldHtml({ seasons = [], legend = "When it runs", esc = escHtml } = {}) {
  return `<fieldset class="sck-row sck-solo" data-seasons><legend>${esc(legend)}</legend><p class="sck-hint">Pick its seasons. Leave them blank if you're not sure.</p>${chipsHtml("_", seasons, esc)}</fieldset>`;
}
/** ["winter"] from the chips (DOM elements or anything with { checked, dataset }). */
export function collectSeasons(inputs) {
  return cleanSeasons([...inputs].filter((x) => x.checked && x.dataset && x.dataset.season).map((x) => x.dataset.season));
}
export function readSeasons(root) {
  return collectSeasons(root.querySelectorAll("[data-seasons] input[data-season]"));
}
/** Year-round ticks all four, any of the four unticks it. One rule for every set of chips. */
function chipChange(scope, t) {
  const chips = [...scope.querySelectorAll(`input[data-of="${t.dataset.of}"]`)];
  const all = chips.find((x) => x.dataset.season === "year-round");
  const four = chips.filter((x) => x !== all);
  if (t === all) four.forEach((x) => { x.checked = t.checked; });
  else if (all) all.checked = four.every((x) => x.checked);
}
export function wireSeasons(root, onChange = () => {}) {
  const change = (e) => {
    const t = e.target;
    if (!t || !t.matches || !t.matches("[data-seasons] input[data-of]")) return;
    chipChange(t.closest("[data-seasons]"), t);
    onChange();
  };
  root.addEventListener("change", change);
  return () => root.removeEventListener("change", change);
}

export function wireChecklist(root, onChange = () => {}) {
  const box = root.querySelector("[data-sport-checklist]");
  if (!box) return () => {};
  const change = (e) => {
    const t = e.target;
    if (!t || !t.matches || !t.matches("input[type=checkbox]")) return;
    if (t.dataset.sport) {
      t.closest(".sck-sport").classList.toggle("is-on", t.checked);
      const row = box.querySelector(`.sck-row[data-row="${t.dataset.sport}"]`);
      if (row) row.hidden = !t.checked;
      const when = box.querySelector(".sck-when");
      if (when) when.hidden = !box.querySelector("input[data-sport]:checked");
    } else if (t.dataset.of) chipChange(box, t);
    onChange();
  };
  box.addEventListener("change", change);
  return () => box.removeEventListener("change", change);
}

/* ---------- The check-up's sports (/update/<id>?rel=run): the sports on file, each with its
   season chips right under it, then "Add a sport" (type "ski", tap Skiing). No grid of every sport. */
/** One sport: its name, a remove button and its season chips. The ticked box keeps readChecklist() working. */
export function pickedRow(key, seasons = [], { nameOf = (k) => k, esc = escHtml } = {}) {
  const name = nameOf(key);
  return `<fieldset class="sck-row ck-pick" data-row="${esc(key)}"><legend>${esc(name)}</legend><input type="checkbox" data-sport="${esc(key)}" checked hidden><button type="button" class="ck-x" data-remove="${esc(key)}" aria-label="Remove ${esc(name)}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>${chipsHtml(key, seasons, esc)}</fieldset>`;
}
/** The sports on file, then the search. chosen: [{ key, seasons }]. */
export function pickedHtml(chosen = [], { nameOf = (k) => k, esc = escHtml } = {}) {
  const uid = "ckq" + (++N);
  const rows = (chosen || []).filter((c) => c && c.key && !NOT_A_SPORT.has(c.key)).map((c) => pickedRow(c.key, c.seasons, { nameOf, esc })).join("");
  return `<div class="sck ck-sports" data-sport-checklist><div class="ck-picked" data-picked>${rows}</div><p class="ck-none" data-none${rows ? " hidden" : ""}>No sports on the listing yet. Add one below.</p><div class="field ck-add"><label for="${uid}">Add a sport</label><input id="${uid}" type="search" data-sport-search autocomplete="off" placeholder="Type a sport, like ski" aria-describedby="${uid}-h" aria-controls="${uid}-l"><p class="sr" id="${uid}-h">Matching sports show below as you type.</p><div class="ck-found" id="${uid}-l" data-found role="group" aria-label="Matching sports"></div></div></div>`;
}
/** Sports whose name (or a word in it) starts with what was typed, A to Z, past the ones already
    chosen; up to `limit`. "ski" -> Skiing, Nordic skiing, Water skiing. */
export function matchSports(keys, text, { nameOf = (k) => k, chosen = [], limit = 6 } = {}) {
  const q = String(text || "").trim().toLowerCase();
  if (!q) return [];
  const have = new Set(chosen);
  return [...new Set(keys)].filter((k) => k && !NOT_A_SPORT.has(k) && !have.has(k)).map((k) => [k, String(nameOf(k))])
    .filter(([k, n]) => n.toLowerCase().split(/[\s/,-]+/).some((w) => w.startsWith(q)) || n.toLowerCase().startsWith(q) || k.startsWith(q))
    .sort((a, b) => (b[1].toLowerCase().startsWith(q) - a[1].toLowerCase().startsWith(q)) || a[1].localeCompare(b[1]))
    .slice(0, limit).map(([k]) => k);
}

/* ---------- Yearly events (Confirm your listing): up to three rows ---------- */
export const YEARLY_MAX = 3;

/** One row: name, usual month, website. Fields carry data-y, not names: yearlyValue() posts them as one. */
export function yearlyRow(i, esc = escHtml) {
  const uid = "yr" + (++N);
  const months = `<option value="">Not sure</option>` + MONTHS.map((m, j) => `<option value="${j + 1}">${m}</option>`).join("");
  return `<fieldset class="yr-row" data-yearly-row><legend>Yearly event ${i}</legend><div class="field"><label for="${uid}-n">Event name</label><input id="${uid}-n" data-y="name" type="text" autocomplete="off" maxlength="120"></div><div class="yr-two"><div class="field"><label for="${uid}-m">Usual month</label><select id="${uid}-m" data-y="month">${months}</select></div><div class="field"><label for="${uid}-u">Event website</label><input id="${uid}-u" data-y="url" type="url" inputmode="url" placeholder="https://" autocomplete="off"></div></div></fieldset>`;
}
/** The rows block, one row to start and an "Add another" button. */
export function yearlyHtml(esc = escHtml) {
  return `<div class="yr" data-yearly>${yearlyRow(1, esc)}<button type="button" class="btn btn--line yr-add" data-yearly-add><span>Add another</span></button></div>`;
}
/** [{ name, month, url }] from row values ([{ name, month, url }] as typed); rows without a name are left out. */
export function collectYearly(rows) {
  const out = [];
  for (const r of rows || []) {
    const name = String(r.name || "").trim().replace(/\s+/g, " ").slice(0, 120);
    if (!name) continue;
    const m = Number(r.month);
    let url = String(r.url || "").trim();
    // The same rule the form check uses: "thepicklelodge.com" means https://thepicklelodge.com.
    if (url && !/^[a-z][a-z0-9+.-]*:/i.test(url) && /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(url)) url = "https://" + url;
    out.push({ name, month: m >= 1 && m <= 12 ? m : null, url: /^https?:\/\/\S+$/i.test(url) ? url : null });
    if (out.length >= YEARLY_MAX) break;
  }
  return out;
}
export function readYearly(root) {
  return collectYearly([...root.querySelectorAll("[data-yearly-row]")].map((row) => {
    const v = (k) => { const el = row.querySelector(`[data-y="${k}"]`); return el ? el.value : ""; };
    return { name: v("name"), month: v("month"), url: v("url") };
  }));
}
/** The value to post: '[{"name":"Spooky Spokes","month":10,"url":"https://..."}]', or "" when none. */
export function yearlyValue(list) {
  return list && list.length ? JSON.stringify(list.slice(0, YEARLY_MAX)) : "";
}
/** "Add another" adds a row (up to three) and moves focus to its name. Returns cleanup. */
export function wireYearly(root, onChange = () => {}) {
  const box = root.querySelector("[data-yearly]");
  if (!box) return () => {};
  const click = (e) => {
    const add = e.target.closest && e.target.closest("[data-yearly-add]");
    if (!add) return;
    const n = box.querySelectorAll("[data-yearly-row]").length;
    if (n >= YEARLY_MAX) return;
    add.insertAdjacentHTML("beforebegin", yearlyRow(n + 1));
    if (n + 1 >= YEARLY_MAX) add.hidden = true;
    const rows = box.querySelectorAll("[data-yearly-row]");
    const name = rows[rows.length - 1].querySelector('[data-y="name"]');
    if (name) name.focus();
    onChange();
  };
  box.addEventListener("click", click);
  box.addEventListener("input", onChange);
  box.addEventListener("change", onChange);
  return () => { box.removeEventListener("click", click); box.removeEventListener("input", onChange); box.removeEventListener("change", onChange); };
}
