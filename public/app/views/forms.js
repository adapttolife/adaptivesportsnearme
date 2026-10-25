/* Forms: /add/program, /add/event, /update/:id.
   Every form is form[data-send] with the honeypot `company`. app.js validates in
   place, then posts it with a Turnstile token and shows the data-done line.
   Field names are the API's (src/index.js handleSubmitProgram). A person reads
   every submission before anything in the directory changes.
   Email: a fix or an event can come without one (Alec, 2026-10-14: "No email
   required"); a new program and "I'm with this organization" need one, because we
   write back to confirm. */
import * as A from "../app.js";
import { site, PAGES } from "../page-meta.js";
import { checklistHtml, readChecklist, sportsValue, wireChecklist, yearlyHtml, readYearly, yearlyValue, wireYearly } from "../sport-checklist.js";

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

/* The side box: what Verified means, in the /about words. */
function checkBox() {
  return `<div class="fm-check"><h2>How we check listings</h2>
<div class="fm-ck-item"><span class="fm-ck-badge is-v">${A.icon("badge-check", 18)}Verified</span><p>The organization itself confirmed its listing with us.</p></div>
<div class="fm-ck-item"><span class="fm-ck-badge is-u">${A.icon("search-check", 18)}Checked by our team</span><p>A person checked the listing against public sources, like the organization's own website.</p></div>
<div class="fm-ck-item"><span class="fm-ck-badge is-p">${A.icon("lock", 18)}Your email</span><p>Used only for what you sent us. Never shown. <a href="/privacy">Privacy policy</a></p></div>
<a class="tlink" href="/about">More about how we check${A.icon("arrow-right", 18)}</a></div>`;
}

function page({ title, description, h1, intro, tile, top = "", form, back = "" }) {
  return {
    title: site(title),
    description,
    html: `<div class="fm">${back}<div class="fm-head">${tile || ""}<div class="fm-htext"><h1 tabindex="-1">${A.esc(h1)}</h1>${intro ? `<p class="fm-intro">${A.esc(intro)}</p>` : ""}</div></div>
<div class="fm-grid"><div class="fm-main">${top}${form}</div><div class="fm-side">${checkBox()}</div></div></div>`,
  };
}

function addProgram(D) {
  const form = `<form class="fm-form" data-send="/api/submit-program" data-source="asnm-add-program" novalidate data-done-href="/" data-done-label="Back to the directory" data-done="Thanks. A person on our team will check it before it goes live, and we'll write if we have a question.">${reqNote}
<fieldset class="fm-set"><legend>The program</legend>
${field({ name: "org", label: "Organization", required: true, auto: "organization", hint: "Who runs it, like a club, a parks department or a nonprofit." })}
${field({ name: "pn", label: "Program", auto: "off", hint: "What they offer, like wheelchair basketball or a monthly coffee meetup. Leave it blank if they offer many." })}
${select({ name: "sport", label: "Sport", options: sportOptions(D), placeholder: "Choose a sport" })}
<div class="fm-two fm-two--place">${field({ name: "city", label: "City", auto: "address-level2" })}${select({ name: "state", label: "State", options: stateOptions(), required: true, placeholder: "Choose a state" })}</div>
${field({ name: "url", label: "Website", type: "url", auto: "url", attrs: 'inputmode="url" placeholder="https://"' })}
</fieldset>
<fieldset class="fm-set"><legend>About you</legend>
${field({ name: "em", label: "Your email", type: "email", required: true, auto: "email", hint: "We write back to confirm. Never shown." })}
${field({ name: "notes", label: "Anything else we should know", type: "textarea" })}
</fieldset>${honeypot}${submit("Send for review")}</form>`;
  return page({
    title: PAGES.addProgram.title, description: PAGES.addProgram.description, h1: "Add a program",
    intro: "Tell us about an adaptive sports program. It's free, and a person on our team checks every new listing before it goes live.",
    tile: A.plate("multi", { kind: "row", cls: "fm-tile" }), form,
  });
}

function addOrganization(D) {
  const form = `<form class="fm-form" data-send="/api/submit-organization" data-source="asnm-add-organization" novalidate data-done-href="/" data-done-label="Back to the directory" data-done="Thanks. A person on our team will check it before it goes live, and we'll write if we have a question.">${reqNote}
<fieldset class="fm-set"><legend>The organization</legend>
${field({ name: "org", label: "Organization", required: true, auto: "organization", hint: "The club, parks department, nonprofit, or other group that runs programs." })}
${select({ name: "sport", label: "Main sport", options: sportOptions(D), placeholder: "Choose a sport" })}
<div class="fm-two fm-two--place">${field({ name: "city", label: "City", auto: "address-level2" })}${select({ name: "state", label: "State", options: stateOptions(), required: true, placeholder: "Choose a state" })}</div>
${field({ name: "url", label: "Website", type: "url", auto: "url", attrs: 'inputmode="url" placeholder="https://"' })}
</fieldset>
<fieldset class="fm-set"><legend>About you</legend>
${field({ name: "em", label: "Your email", type: "email", required: true, auto: "email", hint: "We write back to confirm. Never shown." })}
${field({ name: "notes", label: "Anything else we should know", type: "textarea" })}
</fieldset>${honeypot}${submit("Send for review")}</form>`;
  return page({
    title: "Add an organization", h1: "Add an organization",
    intro: "Tell us about an organization that runs adaptive sports programs. It's free, and a person on our team checks every new listing before it goes live.",
    tile: A.plate("multi", { kind: "row", cls: "fm-tile" }), form,
  });
}

function addEvent(D) {
  const form = `<form class="fm-form" data-send="/api/submit-event" data-source="asnm-add-event" novalidate data-done-href="/events" data-done-label="Back to events" data-done="Thanks. A person checks every event before it goes live.">${reqNote}
<fieldset class="fm-set"><legend>The event</legend>
${field({ name: "en", label: "Event name", required: true, auto: "off" })}
${select({ name: "sport", label: "Sport", options: sportOptions(D), placeholder: "Choose a sport" })}
<div class="fm-when">${field({ name: "ed", label: "Start date", type: "date", required: true, error: "Enter the date the event starts." })}${field({ name: "et", label: "Start time", type: "time" })}${field({ name: "ee", label: "End date", type: "date", hint: "Only if it runs more than one day." })}</div>
<div class="fm-two fm-two--place">${field({ name: "city", label: "City", required: true, auto: "address-level2" })}${select({ name: "state", label: "State", options: stateOptions(), required: true, placeholder: "Choose a state" })}</div>
${field({ name: "url", label: "Event website", type: "url", required: true, auto: "url", attrs: 'inputmode="url" placeholder="https://"', error: "Enter the event website. It starts with https://" })}
${field({ name: "org", label: "Who's running it", auto: "organization" })}
</fieldset>
<fieldset class="fm-set"><legend>About you</legend>
${field({ name: "em", label: "Your email (optional)", type: "email", auto: "email", hint: "Add it for a receipt, or if we may write with a question. Never shown." })}
${field({ name: "notes", label: "Notes", type: "textarea" })}
</fieldset>${honeypot}${submit("Send for review")}</form>`;
  return page({
    title: PAGES.addEvent.title, description: PAGES.addEvent.description, h1: "Add an event",
    intro: "Share a clinic, tryout, game day or meetup. A person checks every event before it goes live.",
    tile: A.plate("event", { kind: "row", cls: "fm-tile" }), form,
  });
}

const REL = {
  run: { h1: "Confirm your listing", intro: "Tell us what's right and what to fix. We'll write back to confirm, and then your listing shows the Verified check." },
  fix: { h1: "Suggest a fix", intro: "What's wrong or missing? A person on our team reads every note." },
};
const EMAIL_HINT = { run: "We write back to confirm. Never shown.", fix: "Only if you'd like us to write back. Never shown." };
const NOTES_LABEL = { run: "Anything else to fix? (optional)", fix: "What should we fix?" };

/* "I'm with this organization": your sports and seasons, and the events you hold every year
   (docs/specs/programs-that-come-back.md). Posted as two fields, sports and yearly, each one
   JSON string; mount() writes them from the boxes. Organizations only: a program's sports are its own. */
function runSets(D, p, run) {
  const keys = D.sports.map((s) => s.key).filter((k) => k !== "multi" && k !== "grant" && k !== "event");
  const chosen = p.seasons && p.seasons.length ? p.seasons : A.sportsOf(p).filter((k) => keys.includes(k)).map((key) => ({ key, seasons: [] }));
  const sports = `<fieldset class="fm-set fm-sports"><legend>Your sports</legend><p class="hint">Tick every sport you run, then its seasons. We've ticked the ones your listing shows.</p>${checklistHtml({ keys, nameOf: A.sportName, chosen, esc: A.esc })}</fieldset>`;
  const yearly = `<fieldset class="fm-set fm-yearly"><legend>Yearly events</legend><p class="hint">Do you hold an event every year, like a tournament or a ski day? Each one gets its own page that stays up between years.</p>${yearlyHtml(A.esc)}</fieldset>`;
  return `<div class="fm-run" data-run${run ? "" : " hidden"}>${sports}${yearly}<input type="hidden" name="sports" value=""><input type="hidden" name="yearly" value=""></div>`;
}

function update(D, pid, relRaw) {
  const p = D.byId.get(pid);
  if (!p) {
    return {
      title: site(PAGES.listingNotFound.title), description: PAGES.listingNotFound.description,
      html: `<section class="nf"><h1 tabindex="-1">We couldn't find that listing</h1><p>It may have been removed or merged with another listing.</p><div class="btns">${A.btn("Find a program", "/", "ink")}${A.btn("Browse sports", "/sports", "line")}</div></section>`,
    };
  }
  const rel = relRaw === "run" || relRaw === "attend" || relRaw === "other" ? relRaw : "";
  const r = REL[rel === "run" ? "run" : "fix"];
  const href = p.href || "/organizations/" + p.id;
  const back = `<a class="fm-back" href="${A.esc(href)}" data-back="${A.esc(href)}">${A.icon("arrow-left", 20)}<span>Back to the listing</span></a>`;
  const top = `<div class="fm-listing"><p class="fm-lab">The listing</p><div class="rows">${A.programRow(p, {})}</div></div>`;
  const opts = [["run", "I'm with this organization"], ["attend", "I've been"], ["other", "Something else"]];
  const radios = `<fieldset class="fm-set fm-rel"><legend class="fm-q">How do you know this organization? <span class="fm-opt-note">(optional)</span></legend><div class="fm-opts">${opts.map(([v, t]) => `<label class="fm-opt"><input type="radio" name="rel" value="${v}"${v === rel ? " checked" : ""}><span>${A.esc(t)}</span></label>`).join("")}</div></fieldset>`;
  const run = rel === "run";
  const org = !p.prog;
  // In run mode the note comes after the sports and events, and is optional (mount() moves it as the answer changes).
  const notes = `<div class="fm-set fm-set--plain fm-notes">
${field({ name: "notes", label: NOTES_LABEL[run && org ? "run" : "fix"], type: "textarea", required: !(run && org), error: "Tell us what to fix." })}
</div>`;
  const form = `<form class="fm-form" data-send="/api/submit-program" data-source="asnm-listing-fix" data-update novalidate data-done-href="${A.esc(href)}" data-done-label="Back to the listing" data-done="${run ? "Thanks. We'll write to you to confirm the listing." : "Thanks. A person on our team will read it."}">
<input type="hidden" name="lid" value="${A.esc(p.id)}">
${run && org ? "" : notes}
${radios}
${org ? runSets(D, p, run) : ""}
${run && org ? notes : ""}
<div class="fm-set fm-set--plain fm-email">
${field({ name: "em", label: run ? "Your email" : "Your email (optional)", type: "email", required: run, auto: "email", hint: EMAIL_HINT[run ? "run" : "fix"] })}
</div>${honeypot}${submit("Send")}</form>`;
  return page({ title: r.h1 + ": " + p.name, description: PAGES.update.description, h1: r.h1, intro: r.intro, top, form, back });
}

export async function render(ctx) {
  const D = ctx.data;
  if (ctx.path === "/add/program") return addProgram(D);
  if (ctx.path === "/add/organization") return addOrganization(D);
  if (ctx.path === "/add/event") return addEvent(D);
  return update(D, String(ctx.params.id || "").toLowerCase(), ctx.query.rel || "");
}

/** Run mode on the fix form: show the sports and yearly events, write them into the two posted
    fields, put the note after them and make it optional once either one says something. */
function syncRun(form, run) {
  const box = form.querySelector("[data-run]");
  if (!box) return;
  box.hidden = !run;
  const sports = form.querySelector('input[name="sports"]'), yearly = form.querySelector('input[name="yearly"]');
  sports.value = run ? sportsValue(readChecklist(box)) : "";
  yearly.value = run ? yearlyValue(readYearly(box)) : "";
  const notesSet = form.querySelector(".fm-notes"), ta = notesSet && notesSet.querySelector("textarea");
  if (!ta) return;
  const lid = form.querySelector('input[name="lid"]');
  if (run && box.nextElementSibling !== notesSet) box.after(notesSet);
  else if (!run && lid.nextElementSibling !== notesSet) lid.after(notesSet);
  ta.required = !run || (!sports.value && !yearly.value);
  ta.setAttribute("data-error", run ? "Tick a sport, add a yearly event, or tell us what to fix." : "Tell us what to fix.");
  const lab = form.querySelector(`label[for="${ta.id}"]`);
  const text = run ? NOTES_LABEL.run : NOTES_LABEL.fix;
  if (lab && lab.dataset.mode !== (run ? "run" : "fix")) {
    lab.dataset.mode = run ? "run" : "fix";
    lab.innerHTML = A.esc(text) + (run ? "" : '<span class="req" aria-hidden="true">*</span>');
  }
}

export function mount(root) {
  // Radio tiles: mirror :checked on the label for browsers without :has().
  // On the fix form, "I'm with this organization" makes the email required (we write back to confirm).
  const sync = () => {
    root.querySelectorAll(".fm-opt").forEach((l) => l.classList.toggle("is-on", !!l.querySelector("input:checked")));
    const form = root.querySelector("form[data-update]");
    if (!form) return;
    const run = !!form.querySelector('input[name="rel"][value="run"]:checked');
    syncRun(form, run);
    const em = form.querySelector('input[name="em"]'), lab = em && form.querySelector(`label[for="${em.id}"]`), hint = em && document.getElementById(em.id + "-h");
    if (!em || em.required === run) return;
    em.required = run;
    if (lab) lab.innerHTML = run ? 'Your email<span class="req" aria-hidden="true">*</span>' : "Your email (optional)";
    if (hint) hint.textContent = EMAIL_HINT[run ? "run" : "fix"];
    form.setAttribute("data-done", run ? "Thanks. We'll write to you to confirm the listing." : "Thanks. A person on our team will read it.");
  };
  sync();
  root.addEventListener("change", sync);
  root.addEventListener("input", sync);
  // Before app.js checks and sends the form (its listener is on the document), the two fields are current.
  root.addEventListener("submit", sync);
  const offChecklist = wireChecklist(root, sync);
  const offYearly = wireYearly(root, sync);
  return () => { root.removeEventListener("change", sync); root.removeEventListener("input", sync); root.removeEventListener("submit", sync); offChecklist(); offYearly(); };
}
