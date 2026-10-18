/* help view (WP-G): /help, /about, /resources, /letter (spec 6.13).
   The claim finder on /help searches listing names in the browser and links
   each match to /update/<id>?rel=run. Nothing is sent from this page.
   PROMOTE: .v-help .hp-figs (a house-tint banner with three athletes) could
   become a shared "banner trio" next to communityHeader(). */
import * as A from "../app.js";
import { site, PAGES } from "../page-meta.js";

const TRIO = ["basketball", "tennis", "skiing"];

/* ---------- /help ---------- */
function card({ ic, title, body, action, cls = "", extra = "" }) {
  return `<section class="hp-card${cls ? " " + cls : ""}" aria-labelledby="${title.replace(/\W+/g, "-").toLowerCase()}-h"><div class="hp-card-in"><span class="hp-ic" aria-hidden="true">${A.icon(ic, 24)}</span><h2 id="${title.replace(/\W+/g, "-").toLowerCase()}-h">${A.esc(title)}</h2><p>${A.esc(body)}</p>${action ? `<div class="hp-act">${action}</div>` : ""}</div>${extra}</section>`;
}

function helpPage() {
  const art = `<div class="hp-figs" aria-hidden="true">${TRIO.map((k, i) => `<span class="hp-slot${i === 0 ? " is-first" : ""}">${A.fig(k, { color: "#1A1A1A", big: true })}</span>`).join("")}</div>`;
  const finder = `<div class="hp-find" role="search" aria-label="Find your organization">
<label class="hp-flabel" for="hp-claim">Organization name</label>
<div class="hp-frow">${A.icon("search", 20)}<input id="hp-claim" type="search" autocomplete="off" enterkeyhint="search" aria-describedby="hp-claim-st" aria-controls="hp-claim-list"></div>
<p class="hp-status" id="hp-claim-st" role="status">Type two or more letters of the name.</p>
<div class="hp-results" id="hp-claim-list" hidden></div></div>`;
  const html = `<div class="hp-page">
<div class="hp-hero" style="--t:${A.toneOf("multi").t}">${art}<div class="hp-text"><h1 tabindex="-1">Help build this</h1><p class="hp-sub">Add what's missing, fix what's wrong, or confirm your organization's listing.</p></div></div>
<div class="hp-cards">
${card({ ic: "badge-check", title: "Claim your organization", body: "Run or work for an organization listed here? Find it and confirm the details.", cls: "hp-card--claim", extra: finder })}
${card({ ic: "plus", title: "Add a program", body: "Know a program we're missing? Tell us and we'll check it.", action: A.btn("Add a program", "/add/program", "ink") })}
${card({ ic: "calendar-plus", title: "Add an event", body: "Share a clinic, tryout, game day or meetup.", action: A.btn("Add an event", "/add/event", "line") })}
${card({ ic: "square-pen", title: "Suggest a fix", body: "Spot something wrong? Every listing has a Suggest a fix link.", cls: "hp-card--wide", action: A.btn("Find a listing", "", "line", { attrs: 'data-open="search"', icon: "search" }) })}
</div>
${A.letterBlock({ source: "help" })}</div>`;
  return { title: site(PAGES.help.title), description: PAGES.help.description, html };
}

/* ---------- /about ---------- */
const ABOUT = [
  ["is-v", "badge-check", "Verified", "The organization itself confirmed its listing with us. Only then does a listing show the check. We're asking every organization."],
  ["", "search-check", "Checked by our team", "A person on our team checked the listing against public sources, like the organization's own website. The listing says when."],
  ["is-u", "info", "Not verified yet", "We found the organization in public sources, and we check its website regularly. Not verified doesn't mean anything is wrong. Check the website before you go."],
  ["", "calendar-check", "Dates", "Every listing shows the last day we checked that the organization's website works."],
  ["", "lock", "Privacy", "We show the city and state. An organization's address, phone number and email show only when the organization says yes."],
  ["", "building-2", "Who runs each program", "Organizations run their own programs. We help you find them."],
  ["", "accessibility", "Accessibility", null],
];
function aboutPage() {
  const a11y = `We aim to meet WCAG 2.2 AA. If something doesn't work for you, tell us through <a href="/help">Suggest a fix</a>.`;
  const secs = ABOUT.map(([cls, ic, h, body], i) => `<section class="ab-sec"${ic === "accessibility" ? ' id="accessibility"' : ""} aria-labelledby="ab-${i}"><span class="ab-ic ${cls}" aria-hidden="true">${A.icon(ic, 24)}</span><div class="ab-text"><h2 id="ab-${i}">${A.esc(h)}</h2><p>${body == null ? a11y : A.esc(body)}</p></div></section>`).join("");
  const html = `<div class="ab"><div class="ab-head"><h1 tabindex="-1">How we check listings</h1></div><div class="ab-grid">${secs}</div>${A.helpBand()}</div>`;
  return { title: site(PAGES.about.title), description: PAGES.about.description, html };
}

/* ---------- /resources: Guides ----------
   Named for what is in it (Alec, 2026-10-17: every page here is a resource, so the
   word told nobody anything). Grants, programs and events keep their own doors. */
function resourcesPage() {
  const card = (id, key, title, body, label, href) => `<article class="rs-card" aria-labelledby="${id}">${A.plate(key, { kind: "card", wide: true, cls: "rs-plate" })}<div class="rs-body"><h2 id="${id}">${A.esc(title)}</h2><p>${A.esc(body)}</p><div class="rs-act">${A.btn(label, href, "ink", { icon: "arrow-right" })}</div></div></article>`;
  const html = `<div class="rs"><h1 tabindex="-1">Guides</h1><p class="rs-lede">Getting started, and life beyond sports. New guides join as we write them.</p>
${card("rs-sports", "multi", "Every sport, explained", "What each sport is, who plays, what you need and how to start.", "Browse the sports", "/sports")}
${card("rs-vob", "veteran-meetup", "Veteran-owned business directories by state", "State lists of veteran-owned businesses, gathered in one place.", "Open the directories", "/resources/veteran-owned-businesses")}</div>`;
  return { title: site(PAGES.guides.title), description: PAGES.guides.description, html };
}

/* ---------- /build: Build with us ----------
   The project is open source (MIT). Alec, 2026-10-18: "a project people believe in and
   want to contribute to... make it easy to contribute." Ideas carry no dates: an idea
   becomes "Live" when it is on the site, never before. */
const REPO = "https://github.com/adapttolife/adaptivesportsnearme";
const TOOLS = [
  { state: "Live", ic: "search", h: "Find programs, grants and events", body: "Search by place or sport. Every listing shows when we last checked it.", href: "/" },
  { state: "Live", ic: "book-open", h: "Guides", body: "Every sport explained: who plays, what you need and how to start.", href: "/resources" },
  { state: "Idea", ic: "file-text", h: "Grant helper", body: "Walk an athlete or an organization through a grant application, start to finish, so it gets sent.", issue: 74 },
  { state: "Idea", ic: "trophy", h: "Tournament brackets", body: "Run a bracket for a clinic, a league or a game day, free and right here.", issue: 75 },
  { state: "Idea", ic: "wrench", h: "Gear to borrow, try or rent", body: "One search for adaptive equipment near you, from every program and lending library that has it. A sit-ski your size, a handcycle to try, before anyone spends thousands.", issue: 76 },
];
const WRITE = (subject) => "mailto:hello@adaptivesportsnearme.com?subject=" + encodeURIComponent(subject);
const HELP = [
  { ic: "code", h: "Write code", body: "Pick an issue marked good first issue. A person reviews every change before it goes live.", label: "See good first issues", href: REPO + "/labels/good%20first%20issue", ext: true },
  { ic: "square-pen", h: "Fix a listing", body: "No code needed. Add a program we're missing, or suggest a fix on any listing.", label: "Help build this", href: "/help" },
  { ic: "pencil", h: "Write a guide", body: "Know a sport well? Help us explain it to someone trying it for the first time.", label: "Write to us", href: WRITE("I'd like to write a guide") },
  { ic: "accessibility", h: "Test it", body: "Use the site with a screen reader, switch control or voice, and tell us what gets in the way.", label: "How to test it", href: REPO + "/issues/77", ext: true },
];
const HOW = [
  { ic: "link", h: "In public", body: "The code, the plans and every change are on GitHub for anyone to read." },
  { ic: "lock", h: "Free to use", body: "MIT license: take it, change it, build on it." },
  { ic: "badge-check", h: "Checked by people", body: "A person reviews every change before it goes live, and every listing before it's published." },
];
function buildPage() {
  const sec = ({ ic, h, body }, extra = "", tag = "") => `<section class="ab-sec"><span class="ab-ic" aria-hidden="true">${A.icon(ic, 24)}</span><div class="ab-text"><h3>${tag}${A.esc(h)}</h3><p>${A.esc(body)}</p>${extra}</div></section>`;
  const go = (label, href, ext) => `<a class="tlink" href="${A.esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ""}>${A.esc(label)}${A.icon(ext ? "external-link" : "arrow-right", 18)}${ext ? '<span class="sr"> (opens in a new tab)</span>' : ""}</a>`;
  const tools = TOOLS.map((t) => sec(t, t.href ? go("Open it", t.href) : go("Join the conversation", `${REPO}/issues/${t.issue}`, true), `<span class="bw-tag${t.state === "Live" ? " is-live" : ""}">${t.state}</span>`)).join("");
  const help = HELP.map((t) => sec(t, go(t.label, t.href, t.ext))).join("");
  const html = `<div class="ab bw"><div class="ab-head"><h1 tabindex="-1">Build this with us</h1>
<p class="bw-lede">Adaptive Sports Near Me is open source. The code is public and free to use, and anyone can help make it better.</p>
<div class="btns">${A.btn("See the code on GitHub", REPO, "ink", { external: true })}${A.btn("How to contribute", REPO + "/blob/staging/CONTRIBUTING.md", "line", { external: true })}</div></div>
<h2 class="bw-h">Where we're going</h2><p class="bw-p">The directory is the first tool. We're building the whole bench of tools the adaptive sports community needs, in the open, one at a time.</p>
<div class="ab-grid">${tools}</div>
<h2 class="bw-h">What do you see?</h2><p class="bw-p">Tell us the tool you wish existed. The best ideas come from people who play, coach and run programs.</p>
<div class="btns">${A.btn("Share an idea", REPO + "/discussions/categories/ideas", "ink", { external: true })}${A.btn("Email us instead", WRITE("An idea for Adaptive Sports Near Me"), "line", { icon: "mail" })}</div>
<h2 class="bw-h">How you can help</h2><div class="ab-grid">${help}</div>
<h2 class="bw-h">How we build</h2><div class="ab-grid">${HOW.map((t) => sec(t)).join("")}</div></div>`;
  return { title: site(PAGES.build.title), description: PAGES.build.description, html };
}

/* ---------- /letter ---------- */
function letterPage() {
  const stack = ["basketball", "grant", "event"].map((k) => A.avatar(k, 64)).join("");
  const html = `<div class="lt"><div class="lt-stack" aria-hidden="true">${stack}</div><h1 tabindex="-1">Get the letter</h1>${A.letterBlock({ source: "letter", heading: false })}</div>`;
  return { title: site(PAGES.letter.title), description: PAGES.letter.description, html };
}

export async function render(ctx) {
  if (ctx.path === "/about") return aboutPage();
  if (ctx.path === "/resources") return resourcesPage();
  if (ctx.path === "/letter") return letterPage();
  if (ctx.path === "/build") return buildPage();
  return helpPage();
}

/* ---------- claim finder ---------- */
const fold = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

export function mount(root, ctx) {
  const input = root.querySelector("#hp-claim");
  if (!input) return () => {};
  const list = root.querySelector("#hp-claim-list"), status = root.querySelector("#hp-claim-st");
  const items = ctx.data.items.map((p) => ({ p, f: " " + fold(p.name) + " " + fold(p.rawName) }));
  let t = null;
  const run = () => {
    const q = fold(input.value);
    if (q.length < 2) {
      list.hidden = true; list.innerHTML = "";
      status.textContent = "Type two or more letters of the name.";
      return;
    }
    const toks = q.split(" ");
    const hits = items.filter((x) => toks.every((w) => x.f.includes(w)))
      .map((x) => ({ ...x, s: x.f.startsWith(" " + q) ? 0 : x.f.includes(" " + toks[0]) ? 1 : 2 }))
      .sort((a, b) => a.s - b.s || a.p.name.localeCompare(b.p.name));
    const shown = hits.slice(0, 6);
    list.innerHTML = shown.map((x) => A.programRow(x.p, {}).replace(/href="[^"]*"/, `href="/update/${A.esc(x.p.id)}?rel=run"`)).join("");
    list.hidden = !shown.length;
    if (!hits.length) {
      status.innerHTML = `We couldn't find an organization called "${A.esc(input.value.trim())}". Check the spelling, or <a href="/add/program">add it</a>.`;
    } else if (hits.length > 6) {
      status.textContent = `Showing 6 of ${hits.length}. Type more of the name to narrow it down.`;
    } else {
      status.textContent = hits.length === 1 ? "1 organization matches. Choose it to confirm the details." : `${hits.length} organizations match. Choose yours to confirm the details.`;
    }
  };
  const onInput = () => { clearTimeout(t); t = setTimeout(run, 120); };
  input.addEventListener("input", onInput);
  if (input.value) run();
  return () => { clearTimeout(t); input.removeEventListener("input", onInput); };
}
