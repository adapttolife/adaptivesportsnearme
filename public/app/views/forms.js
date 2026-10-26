/* Forms: /add/program, /add/event, /update/:id.
   Every form is form[data-send] with the honeypot `company`. app.js validates in
   place, then posts it with a Turnstile token and shows the data-done line.
   Field names are the API's (src/index.js handleSubmitProgram). A person reads
   every submission before anything in the directory changes.
   Email: a fix or an event can come without one (Alec, 2026-10-14: "No email
   required"); a new program and "I'm with this organization" need one, because we
   write back to confirm.
   /update/:id is the one-minute check-up (docs/specs/community-kept-directory.md, phase 1):
   one question per screen inside one form, steps shown and hidden in place. */
import * as A from "../app.js";
import { site, PAGES } from "../page-meta.js";
import { pickedHtml, pickedRow, matchSports, readChecklist, sportsValue, wireChecklist, yearlyHtml, readYearly, yearlyValue, wireYearly } from "../sport-checklist.js";
import { seasonsText, MONTHS } from "../yearly.js";

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


/* ---------- /update/:id: the one-minute check-up, and "Something's wrong?" ----------
   One question per screen, answered in one tap (docs/specs/community-kept-directory.md).
   Every screen is a section of one form[data-send]; mount() shows one at a time, keeps the
   answers in memory, moves focus to the new screen's heading (which says "Step 2 of 8"),
   and on Send writes the answers into the posted fields:
     an organization (rel=run): pn, lid, rel, em, notes, checkup (JSON), and sports and yearly
       (as before) only when those screens were changed;
     anyone else: pn, lid, rel (attend or other, when we know it), em, notes, reason.
   Inputs on the screens have no names: nothing posts until mount() says what to send. */
export const FACTS = ["website", "place", "sports", "who", "cost", "yearly"];
const FACT_TITLE = { website: "Website", place: "Where", sports: "Sports and seasons", who: "Who it's for", cost: "Cost", yearly: "Yearly events" };
export const STOP_REASONS = [["closed_for_now", "Closed for now"], ["closed_for_good", "Closed for good"], ["merged", "Merged with another group"], ["moved", "Moved"]];
export const FIX_REASONS = [["website", "Website moved or broken"], ["closed_for_now", "Closed for now"], ["closed_for_good", "Closed for good"], ["place", "Wrong place"], ["sport", "Wrong sport"], ["duplicate", "Listed twice"], ["other", "Something else"]];
const COSTS = [["free", "Free"], ["fee", "There's a fee"], ["varies", "It varies"]];

/** The posted fields for an organization's check-up. state: { verdict, facts: { website: { status, value },
    place: { status, city, state }, sports: { status }, who: { status, value }, cost: { status, value, note },
    yearly: { status } }, stopped: { reason }, sports: [{ key, seasons }], yearly: [{ name, month, url }] }.
    Only facts the person answered go in; sports and yearly post only when those screens were changed. */
export function checkupPayload(state = {}) {
  const verdict = ["all_right", "changed", "stopped"].includes(state.verdict) ? state.verdict : "all_right";
  const facts = {};
  if (verdict === "changed") {
    for (const k of FACTS) {
      const f = state.facts && state.facts[k];
      if (!f || (f.status !== "right" && f.status !== "change")) continue;
      if (f.status === "right") { facts[k] = { status: "right" }; continue; }
      if (k === "website") facts[k] = { status: "change", value: String(f.value || "") };
      else if (k === "place") facts[k] = { status: "change", city: String(f.city || ""), state: String(f.state || "") };
      else if (k === "who") facts[k] = { status: "change", value: Array.isArray(f.value) ? f.value.slice() : [] };
      else if (k === "cost") facts[k] = { status: "change", value: f.value, ...(f.note ? { note: String(f.note) } : {}) };
      else facts[k] = { status: "change" };
    }
  }
  const out = { checkup: JSON.stringify({ verdict, facts, ...(verdict === "stopped" ? { stopped: { reason: state.stopped && state.stopped.reason } } : {}) }) };
  if (facts.sports && facts.sports.status === "change" && Array.isArray(state.sports)) { const v = sportsValue(state.sports); if (v) out.sports = v; }
  if (facts.yearly && facts.yearly.status === "change" && Array.isArray(state.yearly) && state.yearly.length) out.yearly = yearlyValue(state.yearly);
  return out;
}
/** The posted fields for "Something's wrong?": the reason, and rel when we know it. */
export function fixPayload({ reason, rel } = {}) {
  return { reason: FIX_REASONS.some(([v]) => v === reason) ? reason : "other", ...(rel === "attend" || rel === "other" || rel === "run" ? { rel } : {}) };
}
/** "Thanks. ..." for the finish screen. now: today (the month families will see). */
export function finishText(mode, { verdict = "", email = false, now = new Date() } = {}) {
  if (mode === "fix") return `Thanks. A person on our team reads every report, usually within a week.${email ? " We'll write to tell you what we did." : ""}`;
  if (verdict === "stopped") return "Thanks. A person on our team checks it, usually within a week, and then hides the listing. Nothing is deleted, and it can come back any time.";
  return `Thanks. A person on our team checks it, usually within a week. Families will then see: Confirmed by the organization · ${MONTHS[now.getMonth()]} ${now.getFullYear()}.`;
}

const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./i, ""); } catch (_) { return ""; } };
const sportKeys = (D) => D.sports.map((s) => s.key).filter((k) => k !== "multi" && k !== "grant" && k !== "event");
/** What the listing says now, as the check-up shows it. */
function onFile(D, p, series) {
  const keys = sportKeys(D);
  const sports = p.seasons && p.seasons.length ? p.seasons.map((s) => ({ key: s.key, seasons: s.seasons || [] })) : A.sportsOf(p).filter((k) => keys.includes(k)).map((key) => ({ key, seasons: [] }));
  const who = A.WHO.order.filter((c) => (p.who || []).includes(c));
  return {
    website: p.website || "", host: p.website ? hostOf(p.website) : "",
    city: p.placed ? (p.cityFirst || p.city || "") : "", state: p.state || "", where: p.state ? A.placeText(p) : "",
    sports, who, ages: String(p.ages || "").trim(), cost: String(p.cost || "").trim(),
    yearly: (series || []).map((s) => ({ name: s.name, month: Number(s.usual_month) || null })),
  };
}
const sportLine = (s) => `${A.sportName(s.key)}${seasonsText(s.seasons) ? ` · ${seasonsText(s.seasons)}` : ""}`;
const whoLine = (f) => [f.who.map((c) => A.WHO.labels[c]).join(", "), f.ages ? `Ages: ${f.ages}` : ""].filter(Boolean).join(" · ");
const yearlyLine = (y) => `${y.name}${y.month >= 1 && y.month <= 12 ? `, usually in ${MONTHS[y.month - 1]}` : ""}`;
const NONE = `<span class="ck-empty">Not on the listing yet</span>`;

function ckStep(name, title, body, { hidden = true, back = true } = {}) {
  return `<section class="ck-step" data-step="${name}"${hidden ? " hidden" : ""} aria-labelledby="ck-${name}-h">${back ? `<button type="button" class="btn btn--text ck-back" data-step-back>${A.icon("arrow-left", 20)}<span>Back</span></button>` : ""}<h2 class="ck-h" id="ck-${name}-h" tabindex="-1"><span class="ck-count" data-count></span><span class="ck-t">${A.esc(title)}</span></h2>${body}</section>`;
}
function summaryStep(p, f, back, hidden) {
  const row = (k, v) => `<div><dt>${k}</dt><dd>${v || NONE}</dd></div>`;
  const card = `<div class="ck-card"><p class="ck-name">${A.esc(p.name)}</p><dl class="ck-dl">
${row("Website", f.host ? A.esc(f.host) : "")}${row("Where", A.esc(f.where))}${row("Sports", f.sports.map((s) => `<span class="ck-line">${A.esc(sportLine(s))}</span>`).join(""))}${row("Who it's for", A.esc(whoLine(f)))}${row("Cost", A.esc(f.cost))}${row("Yearly events", f.yearly.map((y) => `<span class="ck-line">${A.esc(yearlyLine(y))}</span>`).join(""))}</dl></div>`;
  const answers = `<div class="ck-answers"><button type="button" class="btn btn--ink ck-big" data-verdict="all_right">${A.icon("check", 20)}<span>Yes, it's all still right</span></button><button type="button" class="btn btn--line ck-big" data-verdict="changed"><span>Something changed</span></button><button type="button" class="btn btn--text ck-stop" data-verdict="stopped"><span>We don't run this anymore</span></button></div>`;
  return ckStep("summary", "Here's what families see", `${card}${answers}`, { hidden, back });
}
/** One fact: what's on file, then Still right / Change it; Change it opens the editor on the same screen. */
function factStep(name, now, edit) {
  const has = !!now;
  return ckStep(name, FACT_TITLE[name], `<div class="ck-now"><p class="ck-lab">On the listing now</p><div class="ck-val">${now || NONE}</div></div>
<div class="ck-two"><button type="button" class="btn btn--ink ck-big" data-fact="right"><span>${has ? "Still right" : "Leave it blank"}</span></button><button type="button" class="btn btn--line ck-big" data-fact="change" aria-expanded="false" aria-controls="ck-edit-${name}"><span>${has ? "Change it" : "Add it"}</span></button></div>
<div class="ck-edit" id="ck-edit-${name}" hidden>${edit}<button type="button" class="btn btn--ink ck-big ck-next" data-fact-next><span>Next</span>${A.icon("arrow-right", 20)}</button></div>`);
}
const ckField = (k, label, input, hint = "") => { const i = id("ck-" + k); return `<div class="field"><label for="${i}">${A.esc(label)}</label>${hint ? `<p class="hint" id="${i}-h">${A.esc(hint)}</p>` : ""}${input(i, hint ? ` aria-describedby="${i}-h"` : "")}</div>`; };
const pressChips = (attr, list, on = [], label) => `<div class="ck-chips" role="group" aria-label="${A.esc(label)}">${list.map(([v, t]) => `<button type="button" class="chip ck-chip" data-${attr}="${A.esc(v)}" aria-pressed="${on.includes(v)}">${A.icon("check", 18)}<span>${A.esc(t)}</span></button>`).join("")}</div>`;

function factSteps(D, f) {
  const states = `<option value="">Choose a state</option>` + A.STATE_CODES.map((st) => `<option value="${st}"${st === f.state ? " selected" : ""}>${A.esc(A.stateName(st))}</option>`).join("");
  const costGuess = /\bfree\b|no cost|no charge/i.test(f.cost) ? ["free"] : [];
  return [
    factStep("website", f.website ? A.esc(f.host || f.website) : "", ckField("url", "The website now", (i, d) => `<input id="${i}" data-ck="url" type="text" inputmode="url" autocomplete="url" placeholder="https://" value="${A.esc(f.website)}"${d}>`, "Like https://example.org")),
    factStep("place", A.esc(f.where), `<div class="fm-two fm-two--place">${ckField("city", "City", (i) => `<input id="${i}" data-ck="city" type="text" autocomplete="address-level2" value="${A.esc(f.city)}">`)}${ckField("state", "State", (i) => `<select id="${i}" data-ck="state">${states}</select>`)}</div>`),
    factStep("sports", f.sports.map((s) => `<span class="ck-line">${A.esc(sportLine(s))}</span>`).join(""), `<p class="ck-p">Tick each sport's seasons. Leave them blank if you're not sure.</p>${pickedHtml(f.sports, { nameOf: A.sportName, esc: A.esc })}`),
    factStep("who", A.esc(whoLine(f)), `<p class="ck-p">Pick every one that fits.</p>${pressChips("who", A.WHO.order.map((c) => [c, A.WHO.labels[c]]), f.who, "Who it's for")}`),
    factStep("cost", A.esc(f.cost), `${pressChips("cost", COSTS, costGuess, "Cost")}${ckField("costnote", "Anything to add? (optional)", (i) => `<input id="${i}" data-ck="costnote" type="text" autocomplete="off" maxlength="200" placeholder="Like $40 for the season">`)}`),
    factStep("yearly", f.yearly.map((y) => `<span class="ck-line">${A.esc(yearlyLine(y))}</span>`).join(""), `<p class="ck-q" id="ck-yq">Do you hold an event every year?</p><div class="ck-chips" role="group" aria-labelledby="ck-yq"><button type="button" class="chip ck-chip" data-yq="yes" aria-pressed="false">${A.icon("check", 18)}<span>Yes</span></button><button type="button" class="chip ck-chip" data-yq="no" aria-pressed="false">${A.icon("check", 18)}<span>No</span></button></div><div class="ck-yearly" data-yearly-box hidden><p class="ck-p">Add the ones that aren't listed yet, up to three. Each gets its own page that stays up between years.</p>${yearlyHtml(A.esc)}</div>`),
  ].join("");
}
function stoppedStep() {
  return ckStep("stopped", "What happened?", `<p class="ck-p">We never delete a listing. A person on our team hides it, and it can come back any time.</p><div class="ck-reasons">${STOP_REASONS.map(([v, t]) => `<button type="button" class="btn btn--line ck-big ck-reason" data-stop="${v}"><span>${A.esc(t)}</span>${A.icon("chevron-right", 20)}</button>`).join("")}</div>`);
}
/** The last screen: email (and a note), then Send. fields: the em and notes fields. */
function sendStep(name, title, fields) {
  return ckStep(name, title, `${fields}${submit("Send")}`);
}
function fixSteps(back, hidden, fields) {
  return ckStep("fix", "What's wrong?", `<div class="ck-reasons">${FIX_REASONS.map(([v, t]) => `<button type="button" class="btn btn--line ck-big ck-reason" data-reason="${v}"><span>${A.esc(t)}</span>${A.icon("chevron-right", 20)}</button>`).join("")}</div>`, { back, hidden })
    + sendStep("fix-send", "Anything to add?", fields);
}
function chooserStep() {
  const opts = [["run", "I'm with this organization"], ["attend", "I've been"], ["other", "Something else"]];
  return ckStep("who-asks", "How do you know this organization?", `<div class="ck-rel">${opts.map(([v, t]) => `<button type="button" class="fm-opt ck-opt" data-rel="${v}"><span>${A.esc(t)}</span>${A.icon("chevron-right", 20)}</button>`).join("")}</div>`, { hidden: false, back: false });
}

async function update(D, pid, relRaw, fixRaw) {
  const listed = D.byId.get(pid);
  if (!listed) {
    return {
      title: site(PAGES.listingNotFound.title), description: PAGES.listingNotFound.description,
      html: `<section class="nf"><h1 tabindex="-1">We couldn't find that listing</h1><p>It may have been removed or merged with another listing.</p><div class="btns">${A.btn("Find a program", "/", "ink")}${A.btn("Browse sports", "/sports", "line")}</div></section>`,
    };
  }
  // What families see needs the listing's own details (website, cost, ages): read here, on a copy, so the
  // shared listing stays as the directory has it. A lost request shows what the list has.
  let p = listed;
  try {
    const r = await fetch("/api/organizations/" + encodeURIComponent(listed.id));
    const o = r.ok ? await r.json().then((b) => b && (b.organization || b.org)) : null;
    const url = o && /^https?:\/\/\S+$/i.test(String(o.website || "").trim()) ? String(o.website).trim() : null;
    if (o) p = { ...listed, website: url || listed.website || null, cost: o.cost || null, ages: o.ages || null };
  } catch (_) {}
  const org = !p.prog;
  const rel = relRaw === "run" || relRaw === "attend" || relRaw === "other" ? relRaw : "";
  // Where it starts: an organization's own link goes straight to the check-up; ?fix=1 (the listing's
  // "Something's wrong?") and rel=attend|other straight to the reasons; no rel asks how they know it.
  const start = rel === "run" && org ? "checkup" : rel || fixRaw === "1" ? "fix" : "ask";
  let series = [];
  if (org && start !== "fix") {
    try {
      const r = await fetch(`/api/event-series?org=${encodeURIComponent(p.id)}`);
      const body = r.ok ? await r.json() : null;
      series = Array.isArray(body && body.items) ? body.items.filter((s) => s && s.name) : [];
    } catch (_) {}
  }
  const f = onFile(D, p, series);
  const href = p.href || "/organizations/" + p.id;
  const back = `<a class="fm-back" href="${A.esc(href)}" data-back="${A.esc(href)}">${A.icon("arrow-left", 20)}<span>Back to the listing</span></a>`;
  const top = `<div class="fm-listing" data-ck-top${start === "ask" ? "" : " hidden"}><p class="fm-lab">The listing</p><div class="rows">${A.programRow(p, {})}</div></div>`;
  // The posted email and note: one pair on each last screen; only the one showing posts (mount()).
  const mail = (required, hint) => field({ name: "em", label: required ? "Your email" : "Your email (optional)", type: "email", required, auto: "email", hint });
  const note = (label) => field({ name: "notes", label, type: "textarea", error: "Tell us what to fix." });
  const checkup = org ? summaryStep(p, f, start === "ask", start !== "checkup") + factSteps(D, f) + stoppedStep()
    + sendStep("send", "Last step: your email", mail(true, "We write once to say it's done. Never shown.") + note("Anything else? (optional)")) : "";
  // Every screen is in the page; only the first one of where it starts shows.
  const steps = (start === "ask" ? chooserStep() : "") + checkup
    + fixSteps(start === "ask", start !== "fix", mail(rel === "run", rel === "run" ? "We write back to confirm. Never shown." : "Only if you'd like to hear back. Never shown.") + note("Anything to add? (optional)"));
  const form = `<form class="fm-form ck-form" data-send="/api/submit-program" data-source="${start === "checkup" ? "asnm-checkup" : "asnm-listing-fix"}" data-flow="${start}" data-org="${org ? 1 : 0}" novalidate data-done-href="${A.esc(href)}" data-done-label="Back to the listing" data-done="${A.esc(finishText(start === "checkup" ? "checkup" : "fix"))}">
<input type="hidden" name="pn" value="${A.esc(p.rawName || p.name)}"><input type="hidden" name="lid" value="${A.esc(p.id)}"><input type="hidden" name="rel" value="${A.esc(rel)}">
<input type="hidden" name="checkup" value=""><input type="hidden" name="sports" value=""><input type="hidden" name="yearly" value=""><input type="hidden" name="reason" value="">
${steps}<div class="ts-box"></div>${honeypot}</form>`;
  const h1 = start === "checkup" ? "Confirm your listing" : start === "fix" ? "Something's wrong?" : "Update this listing";
  const intro = start === "checkup" ? "One minute: is what families see still right?" : start === "fix" ? `Tell us what to fix on ${p.name}. A person on our team reads every report.` : "";
  return page({ title: h1 + ": " + p.name, description: PAGES.update.description, h1, intro, top, form, back });
}

export async function render(ctx) {
  const D = ctx.data;
  if (ctx.path === "/add/program") return addProgram(D);
  if (ctx.path === "/add/organization") return addOrganization(D);
  if (ctx.path === "/add/event") return addEvent(D);
  return update(D, String(ctx.params.id || "").toLowerCase(), ctx.query.rel || "", ctx.query.fix || "");
}

/* ---------- the steps, in the page ---------- */
const PATHS = { all_right: ["summary", "send"], changed: ["summary", ...FACTS, "send"], stopped: ["summary", "stopped", "send"], fix: ["fix", "fix-send"] };
const normUrl = (v) => {
  let u = String(v || "").trim();
  if (u && !/^[a-z][a-z0-9+.-]*:/i.test(u) && /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(u)) u = "https://" + u;
  return /^https?:\/\/\S+\.\S+/i.test(u) ? u : "";
};

function mountFlow(root, form, D) {
  const st = { verdict: "", facts: {}, stopped: {}, reason: "", trail: [], cur: "", path: null };
  const $s = (name) => form.querySelector(`.ck-step[data-step="${name}"]`);
  const field = (k) => form.querySelector(`[data-ck="${k}"]`);
  st.cur = (form.querySelector(".ck-step:not([hidden])") || {}).dataset?.step || "";
  st.path = form.dataset.flow === "fix" ? PATHS.fix : null;
  const count = () => {
    for (const sec of form.querySelectorAll(".ck-step")) {
      const c = sec.querySelector("[data-count]");
      const i = st.path ? st.path.indexOf(sec.dataset.step) : -1;
      c.textContent = i >= 0 && !(sec.dataset.step === "summary" && !st.verdict) ? `Step ${i + 1} of ${st.path.length}` : "";
    }
  };
  const go = (name, { push = true } = {}) => {
    const next = $s(name);
    if (!next) return;
    if (push && st.cur) st.trail.push(st.cur);
    form.querySelectorAll(".ck-step").forEach((s) => { s.hidden = s !== next; });
    st.cur = name;
    count();
    const top = root.querySelector("[data-ck-top]");
    if (top) top.hidden = name !== "who-asks";
    const h = next.querySelector(".ck-h");
    if (h) { h.focus({ preventScroll: true }); h.scrollIntoView({ block: "nearest" }); }
    const fold = form.getBoundingClientRect ? form.getBoundingClientRect().top : 0;
    if (fold < 0 && typeof scrollBy === "function") scrollBy(0, fold - 80);
  };
  const back = () => { const prev = st.trail.pop(); if (prev) go(prev, { push: false }); };
  const nextOf = (name) => { const i = st.path.indexOf(name); return st.path[i + 1]; };
  const setRel = (v) => { form.querySelector('input[name="rel"]').value = v; };

  const openEdit = (sec, open) => {
    const ed = sec.querySelector(".ck-edit"), btn = sec.querySelector('[data-fact="change"]');
    ed.hidden = !open; btn.setAttribute("aria-expanded", String(open));
    sec.classList.toggle("is-editing", open);
    if (open) { const first = ed.querySelector("input:not([type=checkbox]):not([hidden]), select, button"); if (first) first.focus(); }
  };
  const pressed = (sec, attr) => [...sec.querySelectorAll(`[data-${attr}][aria-pressed="true"]`)].map((b) => b.dataset[attr]);
  const press = (b, single) => {
    if (single) b.parentElement.querySelectorAll(".ck-chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    else b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
  };
  /** Read and check the open editor; returns the fact, or null after showing what's missing. */
  const readFact = (name, sec) => {
    if (name === "website") {
      const el = field("url"), v = normUrl(el.value);
      if (!v) { A.showFieldError(el, "Enter the website, like https://example.org"); el.focus(); return null; }
      A.clearFieldError(el); el.value = v;
      return { status: "change", value: v };
    }
    if (name === "place") {
      const el = field("state");
      if (!el.value) { A.showFieldError(el, "Choose a state."); el.focus(); return null; }
      A.clearFieldError(el);
      return { status: "change", city: field("city").value.trim().replace(/\s+/g, " "), state: el.value };
    }
    if (name === "sports") return { status: "change" };
    if (name === "who") {
      const v = pressed(sec, "who");
      if (!v.length) { A.announce("Pick at least one, or go back and choose Still right."); sec.querySelector("[data-who]").focus(); return null; }
      return { status: "change", value: A.WHO.order.filter((c) => v.includes(c)) };
    }
    if (name === "cost") {
      const v = pressed(sec, "cost")[0];
      if (!v) { A.announce("Pick Free, There's a fee, or It varies."); sec.querySelector("[data-cost]").focus(); return null; }
      return { status: "change", value: v, note: field("costnote").value.trim() };
    }
    if (name === "yearly") {
      const yq = pressed(sec, "yq")[0];
      if (!yq) { A.announce("Choose Yes or No."); sec.querySelector("[data-yq]").focus(); return null; }
      if (yq === "yes" && !readYearly(sec).length) { const n = sec.querySelector('[data-y="name"]'); A.showFieldError(n, "Add the event's name."); n.focus(); return null; }
      return { status: "change" };
    }
    return null;
  };

  /** Writes the posted fields from the answers (also used just before app.js sends the form). */
  const write = () => {
    const set = (k, v) => { form.querySelector(`input[name="${k}"]`).value = v || ""; };
    // Only the send screen that is showing posts its email and note (app.js leaves out disabled fields).
    form.querySelectorAll('[name="em"], [name="notes"]').forEach((x) => { x.disabled = !!x.closest("[hidden]"); });
    if (st.cur === "fix-send") {
      const fx = fixPayload({ reason: st.reason, rel: form.querySelector('input[name="rel"]').value });
      set("reason", fx.reason); set("checkup", ""); set("sports", ""); set("yearly", "");
      form.setAttribute("data-source", "asnm-listing-fix");
      const mail = form.querySelector('.ck-step:not([hidden]) [name="em"]');
      form.setAttribute("data-done", finishText("fix", { email: !!(mail && mail.value.trim()) }));
    } else if (st.cur === "send") {
      const out = checkupPayload({ verdict: st.verdict, facts: st.facts, stopped: st.stopped, sports: readChecklist(form), yearly: readYearly(form) });
      set("checkup", out.checkup); set("sports", out.sports); set("yearly", out.yearly); set("reason", "");
      setRel("run");
      form.setAttribute("data-source", "asnm-checkup");
      form.setAttribute("data-done", finishText("checkup", { verdict: st.verdict }));
    }
  };

  const sendLabels = () => {
    // "Something else" needs a word on what to fix; every other reason is enough on its own.
    const sec = $s("fix-send"), ta = sec && sec.querySelector("textarea[name=notes]");
    if (!ta) return;
    const other = st.reason === "other";
    ta.required = other;
    const lab = form.querySelector(`label[for="${ta.id}"]`);
    if (lab) lab.innerHTML = other ? 'What should we fix?<span class="req" aria-hidden="true">*</span>' : "Anything to add? (optional)";
    sec.querySelector(".ck-t").textContent = other ? "What should we fix?" : "Anything to add?";
    const em = sec.querySelector("input[name=em]"), elab = em && form.querySelector(`label[for="${em.id}"]`);
    const run = form.querySelector('input[name="rel"]').value === "run";
    if (em) { em.required = run; if (elab) elab.innerHTML = run ? 'Your email<span class="req" aria-hidden="true">*</span>' : "Your email (optional)"; }
  };

  const click = (e) => {
    const t = e.target.closest && e.target.closest("button");
    if (!t || !form.contains(t)) return;
    const sec = t.closest(".ck-step");
    if (t.matches("[data-step-back]")) return back();
    if (t.dataset.rel) {
      setRel(t.dataset.rel);
      if (t.dataset.rel === "run" && form.dataset.org === "1") return go("summary");
      st.path = PATHS.fix; sendLabels(); return go("fix");
    }
    if (t.dataset.verdict) { st.verdict = t.dataset.verdict; st.path = PATHS[st.verdict]; setRel("run"); return go(nextOf("summary")); }
    if (t.dataset.fact) {
      const name = sec.dataset.step;
      if (t.dataset.fact === "right") { st.facts[name] = { status: "right" }; openEdit(sec, false); return go(nextOf(name)); }
      return openEdit(sec, true);
    }
    if (t.matches("[data-fact-next]")) {
      const name = sec.dataset.step, fact = readFact(name, sec);
      if (!fact) return;
      st.facts[name] = fact;
      return go(nextOf(name));
    }
    if (t.dataset.stop) { st.stopped = { reason: t.dataset.stop }; return go("send"); }
    if (t.dataset.reason) { st.reason = t.dataset.reason; st.path = PATHS.fix; sendLabels(); return go("fix-send"); }
    if (t.dataset.who) return press(t, false);
    if (t.dataset.cost) return press(t, true);
    if (t.dataset.yq) { press(t, true); const box = sec.querySelector("[data-yearly-box]"); box.hidden = t.dataset.yq !== "yes"; if (!box.hidden) { const n = box.querySelector('[data-y="name"]'); if (n) n.focus(); } return; }
    if (t.dataset.remove) {
      const row = t.closest("[data-row]"), name = row.querySelector("legend").textContent;
      const list = row.parentElement; row.remove();
      form.querySelector("[data-none]").hidden = !!list.querySelector("[data-row]");
      A.announce(`${name} removed`);
      const s = form.querySelector("[data-sport-search]"); if (s) s.focus();
      return;
    }
    if (t.dataset.addSport) return addSport(t.dataset.addSport);
  };
  const addSport = (key) => {
    const list = form.querySelector("[data-picked]");
    if (!list || list.querySelector(`[data-row="${CSS.escape(key)}"]`)) return;
    list.insertAdjacentHTML("beforeend", pickedRow(key, [], { nameOf: A.sportName, esc: A.esc }));
    form.querySelector("[data-none]").hidden = true;
    const s = form.querySelector("[data-sport-search]"); s.value = ""; found("");
    A.announce(`${A.sportName(key)} added. Pick its seasons.`);
    const chip = list.querySelector(`[data-row="${CSS.escape(key)}"] input[data-of]`); if (chip) chip.focus();
  };
  const found = (text) => {
    const box = form.querySelector("[data-found]");
    if (!box) return [];
    const chosen = [...form.querySelectorAll("[data-picked] [data-row]")].map((r) => r.dataset.row);
    const keys = matchSports(sportKeys(D), text, { nameOf: A.sportName, chosen });
    box.innerHTML = keys.map((k) => `<button type="button" class="chip ck-found-chip" data-add-sport="${A.esc(k)}">${A.icon("plus", 18)}<span>${A.esc(A.sportName(k))}</span></button>`).join("")
      + (String(text || "").trim() && !keys.length ? `<p class="ck-p">No sport by that name. Try another word, or say it in the note at the end.</p>` : "");
    return keys;
  };
  const input = (e) => { if (e.target.matches && e.target.matches("[data-sport-search]")) found(e.target.value); };
  // Enter in a field moves on, it never sends early; Send is only on the last screen.
  const submit = (e) => {
    if (st.cur !== "send" && st.cur !== "fix-send") {
      e.preventDefault(); e.stopPropagation();
      const sec = $s(st.cur);
      const act = document.activeElement;
      if (act && act.matches && act.matches("[data-sport-search]")) {
        const k = found(act.value)[0]; if (k) addSport(k); return;
      }
      const nx = sec && !sec.querySelector(".ck-edit")?.hidden && sec.querySelector("[data-fact-next]");
      if (nx) nx.click();
      return;
    }
    write();
  };
  form.addEventListener("click", click);
  form.addEventListener("input", input);
  form.addEventListener("submit", submit);
  const offChecklist = wireChecklist(form, () => {});
  const offYearly = wireYearly(form, () => {});
  sendLabels();
  count();
  return () => { form.removeEventListener("click", click); form.removeEventListener("input", input); form.removeEventListener("submit", submit); offChecklist(); offYearly(); };
}

export function mount(root, ctx) {
  // Every form starts its spam check as it opens, so Send never waits on a surprise challenge.
  root.querySelectorAll("form[data-send]").forEach((f) => A.warmTurnstile(f));
  const form = root.querySelector("form[data-flow]");
  return form ? mountFlow(root, form, (ctx && ctx.data) || { sports: [] }) : () => {};
}
