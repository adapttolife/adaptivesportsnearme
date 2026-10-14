/* forms view (WP-G): #/add/program, #/add/event, #/update/:id (spec 6.12).
   Every form is form[data-proto] with the honeypot `company`; app.js validates
   in place and swaps in the "nothing was sent" panel (4.15). Nothing is sent.
   PROMOTE: .v-forms .fm-check (the "How we check listings" side box) could join
   app.css next to aboutBox(); .v-forms .fm-opt (radio tiles) could become a
   shared radio-option component. */
import * as A from "../app.js";

const DESC = "Find adaptive sports programs, grants and events near you. Free, no account needed.";
let N = 0;
const id = (s) => `fm-${s}-${++N}`;

/* ---------- field builders (labels carry a visual * only; `required` does the rest) ---------- */
function field({ name, label, type = "text", required = false, hint = "", auto = "", attrs = "", error = "" }) {
  const i = id(name);
  const h = hint ? `<p class="hint" id="${i}-h">${A.esc(hint)}</p>` : "";
  const input = type === "textarea"
    ? `<textarea id="${i}" name="${name}" rows="4"${required ? " required" : ""}${hint ? ` aria-describedby="${i}-h"` : ""}${error ? ` data-error="${A.esc(error)}"` : ""} ${attrs}></textarea>`
    : `<input id="${i}" name="${name}" type="${type}"${auto ? ` autocomplete="${auto}"` : ""}${required ? " required" : ""}${hint ? ` aria-describedby="${i}-h"` : ""}${error ? ` data-error="${A.esc(error)}"` : ""} ${attrs}>`;
  return `<div class="field"><label for="${i}">${A.esc(label)}${required ? '<span class="req" aria-hidden="true">*</span>' : ""}</label>${h}${input}</div>`;
}
function select({ name, label, options, required = false, placeholder }) {
  const i = id(name);
  const opts = `<option value="">${A.esc(placeholder)}</option>` + options.map(([v, t]) => `<option value="${A.esc(v)}">${A.esc(t)}</option>`).join("");
  return `<div class="field"><label for="${i}">${A.esc(label)}${required ? '<span class="req" aria-hidden="true">*</span>' : ""}</label><select id="${i}" name="${name}"${required ? " required" : ""}>${opts}</select></div>`;
}
const sportOptions = (D) => D.sports.filter((s) => s.key !== "multi")
  .map((s) => [s.key, A.sportName(s.key)]).sort((a, b) => a[1].localeCompare(b[1])).concat([["several", "Several sports"]]);
const stateOptions = () => A.STATE_CODES.map((st) => [st, A.stateName(st)]);
const honeypot = `<input name="company" tabindex="-1" autocomplete="off" class="hpot" aria-hidden="true">`;
const reqNote = `<p class="fm-req">Fields marked <span aria-hidden="true">*</span><span class="sr">with a star</span> are required.</p>`;
const submit = (label) => `<div class="fm-submit"><button type="submit" class="btn btn--ink">${A.icon("send", 20)}<span>${A.esc(label)}</span></button></div>`;

/* The side box: what "Verified" means, in the /about words. */
function checkBox() {
  return `<div class="fm-check"><h2>How we check listings</h2>
<div class="fm-ck-item"><span class="fm-ck-badge is-v">${A.icon("badge-check", 18)}Verified</span><p>A person on our team checked the program against an official source, like the program's own website.</p></div>
<div class="fm-ck-item"><span class="fm-ck-badge is-u">${A.icon("circle-dashed", 18)}Not yet verified</span><p>We found the program, and no one has confirmed it yet.</p></div>
<div class="fm-ck-item"><span class="fm-ck-badge is-p">${A.icon("lock", 18)}Your email</span><p>Only used if we have a question. Never shown.</p></div>
<a class="tlink" href="#/about">More about how we check${A.icon("arrow-right", 18)}</a></div>`;
}

function page({ title, h1, intro, tile, top = "", form, back = "" }) {
  return {
    title: title + " · Adaptive Sports Near Me",
    description: DESC,
    html: `<div class="fm">${back}<header class="fm-head">${tile || ""}<div class="fm-htext"><h1 tabindex="-1">${A.esc(h1)}</h1>${intro ? `<p class="fm-intro">${A.esc(intro)}</p>` : ""}</div></header>
<div class="fm-grid"><div class="fm-main">${top}${form}</div><div class="fm-side">${checkBox()}</div></div></div>`,
  };
}

function addProgram(D) {
  const form = `<form class="fm-form" data-proto data-kind="program" novalidate data-done-href="#/" data-done-label="Back to the directory">${reqNote}
<fieldset class="fm-set"><legend>The program</legend>
${field({ name: "program", label: "Program name", required: true, auto: "off" })}
${field({ name: "org", label: "Organization", auto: "organization" })}
${select({ name: "sport", label: "Sport", options: sportOptions(D), placeholder: "Choose a sport" })}
<div class="fm-two fm-two--place">${field({ name: "city", label: "City", auto: "address-level2" })}${select({ name: "state", label: "State", options: stateOptions(), required: true, placeholder: "Choose a state" })}</div>
${field({ name: "website", label: "Program website", type: "url", auto: "url", attrs: 'inputmode="url" placeholder="https://"' })}
</fieldset>
<fieldset class="fm-set"><legend>About you</legend>
${field({ name: "email", label: "Your email", type: "email", required: true, auto: "email", hint: "Only used if we have a question. Never shown." })}
${field({ name: "notes", label: "Anything else we should know", type: "textarea" })}
</fieldset>${honeypot}${submit("Send for review")}</form>`;
  return page({
    title: "Add a program", h1: "Add a program",
    intro: "Tell us about an adaptive sports program. A person will check it against an official source before it's marked verified.",
    tile: A.plate("multi", { kind: "row", cls: "fm-tile" }), form,
  });
}

function addEvent(D) {
  const form = `<form class="fm-form" data-proto data-kind="event" novalidate data-done-href="#/" data-done-label="Back to the directory">${reqNote}
<fieldset class="fm-set"><legend>The event</legend>
${field({ name: "event", label: "Event name", required: true, auto: "off" })}
${select({ name: "sport", label: "Sport", options: sportOptions(D), placeholder: "Choose a sport" })}
<div class="fm-when">${field({ name: "date", label: "Date", type: "date", required: true, error: "Enter the date of the event." })}${field({ name: "start", label: "Start time", type: "time" })}${field({ name: "end", label: "End date", type: "date" })}</div>
<div class="fm-two fm-two--place">${field({ name: "city", label: "City", required: true, auto: "address-level2" })}${select({ name: "state", label: "State", options: stateOptions(), required: true, placeholder: "Choose a state" })}</div>
${field({ name: "website", label: "Event website", type: "url", required: true, auto: "url", attrs: 'inputmode="url" placeholder="https://"', error: "Enter the event website. It starts with https://" })}
${field({ name: "host", label: "Who's running it", auto: "organization" })}
</fieldset>
<fieldset class="fm-set"><legend>About you</legend>
${field({ name: "email", label: "Your email", type: "email", required: true, auto: "email", hint: "Only used if we have a question. Never shown." })}
${field({ name: "notes", label: "Notes", type: "textarea" })}
</fieldset>${honeypot}${submit("Send for review")}</form>`;
  return page({
    title: "Add an event", h1: "Add an event",
    intro: "Share a clinic, tryout, game day or meetup. A person checks every event before it goes live.",
    tile: A.plate("event", { kind: "row", cls: "fm-tile" }), form,
  });
}

const REL = {
  run: { h1: "Confirm your listing", intro: "Confirm the details and a person on our team will mark this listing verified." },
  attend: { h1: "Tell us about your visit", intro: "" },
  other: { h1: "Suggest an update", intro: "" },
};

function update(D, pid, relRaw) {
  const p = D.byId.get(pid);
  if (!p) {
    return {
      title: "Listing not found · Adaptive Sports Near Me", description: DESC,
      html: `<section class="nf"><h1 tabindex="-1">We couldn't find that listing</h1><p>It may have been removed or merged with another listing.</p><div class="btns">${A.btn("Find a program", "#/", "ink")}${A.btn("Browse sports", "#/sports", "line")}</div></section>`,
    };
  }
  const rel = REL[relRaw] ? relRaw : "other";
  const r = REL[rel];
  const href = "#/programs/" + p.id;
  const back = `<a class="fm-back" href="${A.esc(href)}" data-back="${A.esc(href)}">${A.icon("arrow-left", 20)}<span>Back to the listing</span></a>`;
  const top = `<div class="fm-listing"><p class="fm-lab">The listing</p><div class="rows">${A.programRow(p, {})}</div></div>`;
  const opts = [["run", "I run it"], ["attend", "I've been"], ["other", "Other"]];
  const radios = `<fieldset class="fm-set fm-rel"><legend class="fm-q">How are you connected to this program?</legend><div class="fm-opts">${opts.map(([v, t]) => `<label class="fm-opt"><input type="radio" name="rel" value="${v}"${v === rel ? " checked" : ""}><span>${A.esc(t)}</span></label>`).join("")}</div></fieldset>`;
  const form = `<form class="fm-form" data-proto data-kind="update" data-id="${A.esc(p.id)}" novalidate data-done-href="${A.esc(href)}" data-done-label="Back to the listing">${reqNote}
${radios}
<div class="fm-set fm-set--plain">
${field({ name: "change", label: "What should we change?", type: "textarea", required: true, error: "Tell us what to change." })}
${field({ name: "email", label: "Your email", type: "email", required: true, auto: "email", hint: "Only used if we have a question. Never shown." })}
</div>${honeypot}${submit("Send")}</form>`;
  return page({ title: r.h1 + ": " + p.name, h1: r.h1, intro: r.intro, top, form, back });
}

export async function render(ctx) {
  const D = ctx.data;
  if (ctx.path === "/add/program") return addProgram(D);
  if (ctx.path === "/add/event") return addEvent(D);
  return update(D, ctx.params.id, ctx.query.rel || "other");
}

export function mount(root) {
  // Radio tiles: mirror :checked on the label for browsers without :has().
  const sync = () => root.querySelectorAll(".fm-opt").forEach((l) => l.classList.toggle("is-on", !!l.querySelector("input:checked")));
  sync();
  root.addEventListener("change", sync);
  return () => root.removeEventListener("change", sync);
}
