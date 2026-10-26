import * as A from "../app.js";
import { fromDateTimeLocal, toDateTimeLocal } from "../local-datetime.js";
import { PAGES, site } from "../page-meta.js";
import { seasonsText, MONTHS, dateRange } from "../yearly.js";

const esc = A.esc;
const KINDS = ["organizations", "programs", "events", "grants"];
const LABEL = { organizations: "Organizations", programs: "Programs", events: "Events", grants: "Grants" };
const ONE = { organizations: "organization", programs: "program", events: "event", grants: "grant" };
const FIELDS = {
  organizations: ["name", "org_type", "website_url", "email", "claim_email", "phone", "city", "state", "zip", "address", "country", "lat", "lng", "geo_precision", "description", "cost_note", "equipment_provided", "ages", "data_quality_rating", "primary_data_source", "verification_status", "verification_method", "status", "is_public", "publicity_consent", "address_publicity_consent", "last_ok_at"],
  programs: ["organization_id", "name", "website_url", "email", "phone", "city", "state", "zip", "address", "country", "lat", "lng", "geo_precision", "description", "cost_note", "equipment_provided", "ages", "verification_status", "verification_method", "status", "is_public", "publicity_consent", "address_publicity_consent", "last_ok_at", "kind", "listing", "seasons_json", "usual_month", "first_year", "slug"],
  events: ["title", "description", "org_id", "program_id", "sport_key", "venue", "city", "state", "url", "recap_url", "starts_at", "ends_at", "all_day", "status", "is_public", "source"],
  grants: ["name", "source", "type", "audience", "amount_min_cents", "amount_max_cents", "amount_display", "deadline_display", "deadline_next", "description", "eligibility_criteria", "how_to_apply", "application_url", "source_url", "email", "phone", "sports_json", "is_open", "is_renewable", "is_public", "status"],
};
const BOOL = { organizations: ["equipment_provided", "is_public", "publicity_consent", "address_publicity_consent"], programs: ["equipment_provided", "is_public", "publicity_consent", "address_publicity_consent"], events: ["all_day", "is_public"], grants: ["is_open", "is_renewable", "is_public"] };
// Choices with fixed values (docs/specs/programs-that-come-back.md).
const SELECTS = {
  kind: [["program", "Program"], ["event", "Yearly event"]],
  listing: [["own", "Own card"], ["with_org", "On the organization's card"]],
};
const FIELD_LABELS = { seasons_json: "Seasons (JSON, like [\"winter\"])", usual_month: "Usual month (1 to 12)", first_year: "First year", program_id: "Program ID (a yearly event)", recap_url: "Results or photos URL" };
const AREAS = new Set(["description", "cost_note", "sports_json", "eligibility_criteria", "how_to_apply"]);
const DATETIME = new Set(["starts_at", "ends_at", "last_ok_at"]);
const TOGGLE_LABELS = {
  equipment_provided: "Equipment provided",
  is_public: "Public listing",
  publicity_consent: "Show contact details",
  address_publicity_consent: "Show full address",
  all_day: "All-day event",
  is_open: "Open for applications",
  is_renewable: "Renewable grant",
};

const api = async (path, options) => { const result = await fetch(path, { ...options, headers: { "content-type": "application/json", ...(options?.headers || {}) } }); return { result, body: await result.json().catch(() => ({})) }; };
const title = (field) => field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const val = (item, field) => esc(item?.[field] ?? "");

function login(message = "") { return { title: site(PAGES.admin.title), description: PAGES.admin.description, railActive: "", html: `<section class="adm"><div class="adm-head"><p class="eyebrow">Private area</p><h1 tabindex="-1">Admin dashboard</h1><p>Use an Adaptive Sports Near Me email address. We’ll send a one-time sign-in link.</p></div><form class="adm-card adm-login" novalidate><div class="field"><label for="admin-email">Email address</label><input id="admin-email" name="email" type="email" autocomplete="email" required></div><p class="adm-status" role="status">${esc(message)}</p><button class="btn btn--ink" type="submit">Email me a sign-in link</button></form></section>` }; }
function home(email, queueCount = 0, totals = {}) { const queueLabel = `Submission queue${queueCount ? ` (${queueCount})` : ""}`; return { title: site(PAGES.admin.title), description: PAGES.admin.description, railActive: "", html: `<section class="adm"><div class="adm-head"><p class="eyebrow">Private area</p><h1 tabindex="-1">Admin dashboard</h1><p>Signed in as ${esc(email)}.</p></div><div class="adm-grid"><a class="adm-kind long" href="/admin/queue"><span>${esc(queueLabel)}</span>${A.icon("arrow-right", 20)}</a>${KINDS.map((kind) => `<a class="adm-kind" href="/admin/${kind}"><span>${esc(`${LABEL[kind]} (${Number(totals[kind]) || 0})`)}</span>${A.icon("arrow-right", 20)}</a>`).join("")}</div><div class="btns"><button class="adm-signout btn btn--line" type="button">Sign out</button></div></section>` }; }
function list(kind, data, q) {
  const rows = data.items.map((item) => `<a href="/admin/${kind}/${esc(item.id)}" data-admin-searchable data-search="${esc(String(item.name || "").toLowerCase())}"><span><b>${esc(item.name)}</b><small>${item.is_public == null ? "" : Number(item.is_public) ? "Public" : "Hidden"}${item.status ? ` · ${esc(title(item.status))}` : ""}</small></span>${A.icon("arrow-right", 20)}</a>`).join("");
  return { title: site(`${LABEL[kind]} · Admin`), railActive: "", html: `<section class="adm"><a class="adm-back" href="/admin">${A.icon("arrow-left", 20)}<span>Admin dashboard</span></a><div class="adm-head"><h1 tabindex="-1">${LABEL[kind]}</h1><p>${data.total} total ${kind}.</p></div><form class="adm-search" data-admin-search novalidate><label for="admin-q">Search ${ONE[kind]} names</label><div><input id="admin-q" name="q" value="${esc(q)}"><button class="btn btn--ink" type="submit">Search</button></div></form><div class="btns"><a class="btn btn--line" href="/admin/${kind}/new">Add ${ONE[kind]}</a></div><div class="adm-list" data-admin-list>${rows}<p data-admin-empty${data.items.length ? " hidden" : ""}>No matching items.</p></div></section>` };
}

const sportOptions = (sports = [], current = "") => {
  const choices = sports.filter((sport) => sport.key !== "multi").map((sport) => [sport.key, A.sportName(sport.key)]).sort((a, b) => a[1].localeCompare(b[1]));
  if (current && !choices.some(([key]) => key === current)) choices.unshift([current, A.sportName(current) || current]);
  return `<option value="">Choose a sport</option>${choices.map(([key, label]) => `<option value="${esc(key)}"${key === current ? " selected" : ""}>${esc(label)}</option>`).join("")}`;
};
const sportKeys = (item = {}) => {
  let keys = [];
  try { keys = Array.isArray(JSON.parse(item.sports_json || "")) ? JSON.parse(item.sports_json) : []; } catch {}
  if (!keys.length && (item.sport_key || item.sport)) keys = [item.sport_key || item.sport];
  return [...new Set(keys.filter((key) => typeof key === "string" && key.trim()))];
};
const sportFields = (sports, item) => {
  const keys = sportKeys(item); const rows = (keys.length ? keys : [""]).map((key) => `<div class="adm-sport-row" data-sport-row><select name="sports">${sportOptions(sports, key)}</select><button class="adm-sport-remove" type="button" data-sport-remove aria-label="Remove sport">${A.icon("x", 18)}</button></div>`).join("");
  return `<div class="field adm-sports"><label>Sports</label><div class="adm-sport-list" data-sports-list>${rows}</div><button class="adm-sport-add" type="button" data-sport-add>${A.icon("plus", 18)}<span>Add sport</span></button></div>`;
};

function control(kind, name, item) { if (BOOL[kind].includes(name)) return `<label class="adm-toggle"><span>${esc(TOGGLE_LABELS[name] || title(name))}</span><input name="${esc(name)}" type="checkbox" role="switch" value="1"${Number(item?.[name]) ? " checked" : ""}><span class="dl-switch" aria-hidden="true"></span></label>`; if (SELECTS[name]) { const current = item?.[name] ?? SELECTS[name][0][0]; return `<div class="field"><label>${esc(title(name))}<select name="${esc(name)}">${SELECTS[name].map(([v, t]) => `<option value="${esc(v)}"${String(current) === v ? " selected" : ""}>${esc(t)}</option>`).join("")}</select></label></div>`; } if (AREAS.has(name)) return `<div class="field"><label>${esc(title(name))}<textarea name="${esc(name)}" rows="4">${val(item, name)}</textarea></label></div>`; const type = name.includes("email") ? "email" : /url$/.test(name) ? "url" : DATETIME.has(name) ? "datetime-local" : name === "deadline_next" ? "date" : ["lat", "lng", "amount_min_cents", "amount_max_cents", "usual_month", "first_year"].includes(name) ? "number" : "text"; const required = name === "name" || name === "title" || name === "starts_at"; const range = name === "usual_month" ? ' min="1" max="12" step="1"' : name === "first_year" ? ' min="1900" max="2100" step="1"' : ""; const value = type === "datetime-local" ? toDateTimeLocal(item?.[name]) : type === "date" ? item?.[name] ? String(item[name]).slice(0, 10) : "" : val(item, name); const when = type === "datetime-local" ? ` step="1"${item?.[name] ? ` data-utc="${esc(item[name])}"` : ""}` : ""; return `<div class="field"><label>${FIELD_LABELS[name] || esc(title(name))}${required ? ' <span class="req" aria-hidden="true">*</span>' : ""}<input name="${esc(name)}" type="${type}"${required ? " required" : ""}${when}${range} value="${value}"></label></div>`; }
/* ---------- An organization's activity: the team-only history (docs/specs/programs-that-come-back.md) ---------- */
const ACTIVITY_LABEL = { confirmation: "Confirmation received", fix: "Fix suggested", applied: "Applied", self_edit: "Edited by the organization", admin_edit: "Edited by the team", note: "Note" };
/** The timeline, newest first: date, what happened, the line, and who. */
export function activityItems(items) {
  if (!items || !items.length) return `<p class="adm-act-none">Nothing yet. Confirmations, fixes, edits and your notes show here.</p>`;
  return `<ol class="adm-timeline">${items.map((a) => `<li class="adm-act is-${esc(String(a.kind || "note").replace(/[^a-z_]/g, ""))}"><p class="adm-act-top"><time datetime="${esc(a.created_at || "")}">${esc(dateRange(a.created_at))}</time><b>${esc(ACTIVITY_LABEL[a.kind] || title(String(a.kind || "")))}</b></p>${a.summary ? `<p class="adm-act-sum">${esc(a.summary)}</p>` : ""}${a.actor ? `<small class="adm-act-who">${esc(a.actor)}</small>` : ""}</li>`).join("")}</ol>`;
}
function activityPanel(id, items) {
  return `<section class="adm-card adm-activity" aria-labelledby="adm-act-h"><h2 id="adm-act-h">Activity</h2><p class="adm-act-lead">Team only, never shown on the site.</p><form class="adm-note" data-id="${esc(id)}" novalidate><div class="field"><label for="adm-note-text">Add a note</label><textarea id="adm-note-text" name="note" rows="2" maxlength="500" placeholder="Emailed Oct 26"></textarea></div><p class="adm-status adm-note-status" role="status"></p><button class="btn btn--line" type="submit">Add note</button></form><div class="adm-act-list">${activityItems(items)}</div></section>`;
}
function edit(kind, item = {}, fresh = false, activity = null) { const heading = fresh ? `Add ${ONE[kind]}` : `Edit ${ONE[kind]}`; return { title: site(`${heading} · Admin`), railActive: "", html: `<section class="adm"><a class="adm-back" href="/admin/${kind}">${A.icon("arrow-left", 20)}<span>${LABEL[kind]}</span></a><div class="adm-head"><h1 tabindex="-1">${heading}</h1><p>Changes are saved directly to this record.</p></div><form class="adm-card adm-form" data-kind="${kind}"${fresh ? "" : ` data-id="${esc(item.id)}"`} novalidate>${FIELDS[kind].map((name) => control(kind, name, item)).join("")}<p class="adm-status" role="status"></p><button class="btn btn--ink" type="submit">${fresh ? "Create" : "Save changes"}</button></form>${activity ? activityPanel(item.id, activity.items) : ""}</section>` }; }
const QUEUE_LABEL = { listing_update: "Organization confirming its listing" };
const queueKind = (kind) => QUEUE_LABEL[kind] || title(String(kind || "").replace("new_", ""));
const sportWord = (key) => (A.sportName(key) === "Multi-sport" && key !== "multi" ? title(key) : A.sportName(key));
/* ---------- The check-up and "Something's wrong?" in the queue (docs/specs/community-kept-directory.md) ----------
   Each item says plainly what Apply would change, so the team reads one list and taps once. */
const STOP_WORDS = { closed_for_now: "closed for now", closed_for_good: "closed for good", merged: "merged with another group", moved: "moved" };
const REASON_WORDS = { website: "website moved or broken", closed_for_now: "closed for now", closed_for_good: "closed for good", place: "wrong place", sport: "wrong sport", duplicate: "listed twice", other: "something else" };
const COST_WORDS = { free: "Free", fee: "There's a fee", varies: "It varies" };
const readJson = (v) => { if (v && typeof v === "object") return v; try { const x = JSON.parse(String(v || "")); return x && typeof x === "object" ? x : null; } catch { return null; } };
const bareUrl = (u) => String(u || "").replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
const seasonWords = (seasons) => { const t = seasonsText(seasons); return t ? t.toLowerCase() : "seasons not given"; };
/** Its sports now, when the item carries them: [{ key, seasons }] or null. */
function sportsNow(org) {
  if (!org) return null;
  if (Array.isArray(org.sports)) return org.sports.filter((s) => s && s.key).map((s) => ({ key: s.key, seasons: s.seasons || [] }));
  const told = readJson(org.sport_seasons_json);
  return told && !Array.isArray(told) ? Object.entries(told).map(([key, seasons]) => ({ key, seasons: seasons || [] })) : null;
}
function sportLines(sports, before) {
  if (!before) return sports.length ? [`Sports and seasons: ${sports.map(([k, v]) => `${sportWord(k)} (${seasonWords(v)})`).join(", ")}`] : [];
  const was = new Map(before.map((s) => [s.key, seasonsText(s.seasons)]));
  const now = new Map(sports.map(([k, v]) => [k, v]));
  const out = [];
  for (const [k, v] of sports) {
    if (!was.has(k)) out.push(`Adds ${sportWord(k)} (${seasonWords(v)})`);
    else if (was.get(k) !== seasonsText(v)) out.push(`${sportWord(k)}: ${seasonWords(v)}`);
  }
  for (const s of before) if (!now.has(s.key)) out.push(`Removes ${sportWord(s.key)}`);
  return out;
}
/** The plain lines for a listing_update: "Confirms everything is still right", "Website: old → new",
    "Adds Skiing (winter)", "Stopped: closed for good, hides the listing", "Reported: website moved or broken". */
export function changeLines(item = {}) {
  const payload = item.payload || {};
  const org = item.organization || null;
  const checkup = readJson(payload.checkup);
  const sports = payload.sports && typeof payload.sports === "object" && !Array.isArray(payload.sports) ? Object.entries(payload.sports) : [];
  const yearly = Array.isArray(payload.yearly) ? payload.yearly.filter((y) => y && y.name) : [];
  const out = [];
  if (payload.reason && !checkup) out.push(`Reported: ${REASON_WORDS[payload.reason] || REASON_WORDS.other}`);
  if (checkup && checkup.verdict === "all_right") out.push("Confirms everything is still right");
  if (checkup && checkup.verdict === "stopped") out.push(`Stopped: ${STOP_WORDS[checkup.stopped && checkup.stopped.reason] || "no longer runs"}, hides the listing`);
  const f = (checkup && checkup.verdict === "changed" && checkup.facts) || {};
  const changed = (k) => f[k] && f[k].status === "change";
  if (changed("website")) out.push(`Website: ${org && org.website ? bareUrl(org.website) : "none"} → ${bareUrl(f.website.value)}`);
  if (changed("place")) { const was = org ? [org.city, org.state].filter(Boolean).join(", ") : ""; out.push(`Where: ${was || "not listed"} → ${[f.place.city, f.place.state].filter(Boolean).join(", ")}`); }
  if (changed("sports") || (!checkup && sports.length)) out.push(...sportLines(sports, sportsNow(org)));
  if (changed("who")) out.push(`Who it's for: ${(f.who.value || []).map((c) => A.WHO.labels[c]).filter(Boolean).join(", ") || "not said"}`);
  if (changed("cost")) out.push(`Cost: ${org && org.cost ? org.cost : "none"} → ${COST_WORDS[f.cost.value] || f.cost.value}${f.cost.note ? ` (${f.cost.note})` : ""}`);
  for (const y of yearly) { const m = Number(y.month); out.push(`Adds yearly event ${y.name}${m >= 1 && m <= 12 ? ` (usually ${MONTHS[m - 1]})` : ""}`); }
  if (changed("yearly") && !yearly.length) out.push("Yearly events: says it holds none");
  if (checkup && checkup.verdict === "changed") out.push(out.length ? "Nothing else changed." : "Says something changed, but sent no changes.");
  return out;
}
const isFix = (item) => item.kind === "listing_update" && (item.payload || {}).relation !== "run";
const verdictOf = (item) => { const c = readJson((item.payload || {}).checkup); return c ? c.verdict : ""; };
/** An organization confirming its listing (rel=run), or anyone's "Something's wrong?": what would change, said plainly. */
function listingUpdate(payload, item = {}) {
  const yearly = Array.isArray(payload.yearly) ? payload.yearly : [];
  const org = payload.update_of ? `<a href="/organizations/${esc(encodeURIComponent(payload.update_of))}" target="_blank" rel="noopener">${esc(payload.program || "Open the listing")}</a>` : esc(payload.program || "");
  const lines = changeLines({ ...item, payload });
  const change = lines.length ? `<ul class="adm-bullets adm-change">${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>` : "Nothing said";
  const yearlyList = yearly.length ? `<ul class="adm-bullets">${yearly.map((y) => { const url = y && /^https?:\/\//i.test(String(y.url || "")) ? String(y.url) : ""; return url ? `<li><b>${esc(y && y.name)}</b>, <a href="${esc(url)}" target="_blank" rel="noopener">${esc(url)}</a></li>` : ""; }).join("")}</ul>` : "";
  const who = payload.relation === "run" ? "Someone who runs this organization" : payload.relation === "attend" ? "Someone who has been" : "Someone else";
  const rest = Object.entries(payload).filter(([key]) => !["intake_id", "notes", "program", "update_of", "relation", "sports", "yearly", "checkup", "reason"].includes(key) && payload[key] != null && typeof payload[key] !== "object").map(([key, value]) => `<dt>${esc(title(key))}</dt><dd>${esc(value)}</dd>`).join("");
  return `<dt class="adm-wide">What would change</dt><dd class="adm-wide">${change}</dd><dt>Organization</dt><dd>${org}</dd><dt>Who sent it</dt><dd>${who}</dd>${yearlyList.includes("<li>") ? `<dt>Yearly event websites</dt><dd>${yearlyList}</dd>` : ""}${rest}`;
}
function queueLine(item) {
  if (item.kind !== "listing_update") return queueKind(item.kind);
  if (isFix(item)) return `Something's wrong: ${REASON_WORDS[(item.payload || {}).reason] || "see the note"}`;
  return { all_right: "Organization: all still right", changed: "Organization: something changed", stopped: "Organization: we stopped" }[verdictOf(item)] || queueKind(item.kind);
}
function queue(items) {
  const ready = items.filter((item) => item.kind === "listing_update" && !isFix(item) && verdictOf(item) === "all_right");
  const all = ready.length ? `<div class="adm-card adm-allright"><p>${ready.length === 1 ? "1 organization says" : `${ready.length} organizations say`} everything is still right. Applying only records the confirmation.</p><p class="adm-status adm-all-status" role="status"></p><button class="btn btn--ink adm-apply-all" type="button" data-ids="${esc(ready.map((x) => x.id).join(","))}">Apply all that are still right (${ready.length})</button></div>` : "";
  return { title: site("Submission queue · Admin"), description: PAGES.admin.description, railActive: "", html: `<section class="adm"><a class="adm-back" href="/admin">${A.icon("arrow-left", 20)}<span>Admin dashboard</span></a><div class="adm-head"><h1 tabindex="-1">Submission queue</h1><p>${items.length ? `${items.length} submissions need review.` : "No submissions need review."}</p></div>${all}<div class="adm-list">${items.map((item) => `<a href="/admin/queue/${item.id}"><span><b>${esc(item.title)}</b><small>${esc(queueLine(item))}${item.city ? ` · ${esc([item.city, item.state].filter(Boolean).join(", "))}` : ""}</small></span>${A.icon("arrow-right", 20)}</a>`).join("")}</div></section>` };
}
function queueItem(item) {
  const update = item.kind === "listing_update", fix = update && isFix(item);
  const details = update ? listingUpdate(item.payload || {}, item) : Object.entries(item.payload).filter(([key]) => key !== "intake_id" && key !== "notes").map(([key, value]) => `<dt>${esc(title(key))}</dt><dd>${esc(value)}</dd>`).join("");
  const edit = item.draft ? `<a class="btn btn--line" href="/admin/${item.draft.kind}/${item.draft.id}">Edit draft</a>` : fix && item.payload.update_of ? `<a class="btn btn--line" href="/admin/organizations/${esc(encodeURIComponent(item.payload.update_of))}">Edit the listing</a>` : "";
  const lead = fix ? "Someone says something on this listing is wrong. Check it, edit the listing if it needs it, then mark it Done." : update ? "Read what would change, then apply it. Applying writes these changes and logs them. It doesn't mark the listing Verified." : "Review the details, edit the draft if needed, then accept it.";
  const label = fix ? "Done" : update ? "Apply" : "Accept and publish";
  return { title: site("Review submission · Admin"), description: PAGES.admin.description, railActive: "", html: `<section class="adm"><a class="adm-back" href="/admin/queue">${A.icon("arrow-left", 20)}<span>Submission queue</span></a><div class="adm-head"><h1 tabindex="-1">${esc(item.title)}</h1><p>${lead}</p></div><div class="adm-card"><dl class="adm-details">${details}</dl>${item.payload.notes ? `<div class="field"><label>Notes<textarea readonly rows="4">${esc(item.payload.notes)}</textarea></label></div>` : ""}<p class="adm-status" role="status"></p><div class="btns">${edit}<button class="btn btn--ink adm-accept" type="button" data-id="${item.id}"${update ? ` data-apply="${fix ? "done" : "1"}"` : ""}>${label}</button></div></div></section>` };
}

export async function render(ctx) { const path = location.pathname.replace(/\/+$/, ""); const session = await api("/api/admin-auth/session"); if (!session.result.ok) return login(); if (path === "/admin") { const results = await Promise.all([api("/api/admin-data/queue"), ...KINDS.map((kind) => api(`/api/admin-data/${kind}?limit=1`))]); const queueCount = results[0].result.ok ? (results[0].body.items || []).length : 0; const totals = Object.fromEntries(KINDS.map((kind, index) => [kind, results[index + 1].result.ok ? results[index + 1].body.total : 0])); return home(session.body.email, queueCount, totals); } const queued = path.match(/^\/admin\/queue(?:\/(\d+))?$/); if (queued) { const result = await api(`/api/admin-data/queue${queued[1] ? `/${queued[1]}` : ""}`); return result.result.ok ? queued[1] ? queueItem(result.body.item) : queue(result.body.items) : home(session.body.email); } const match = path.match(/^\/admin\/(organizations|programs|events|grants)(?:\/([0-9a-z_-]{1,80}))?$/i); if (!match) return home(session.body.email); const kind = match[1].toLowerCase(), id = match[2]; if (!id) { const q = new URLSearchParams(location.search).get("q") || ""; const result = await api(`/api/admin-data/${kind}?q=${encodeURIComponent(q)}`); return result.result.ok ? list(kind, result.body, q) : home(session.body.email); } if (id === "new") return edit(kind, {}, true); const result = await api(`/api/admin-data/${kind}/${id}`); if (!result.result.ok) return list(kind, { total: 0, items: [] }, ""); if (kind !== "organizations") return edit(kind, result.body.item); const log = await api(`/api/admin-data/organizations/${encodeURIComponent(id)}/activity`); return edit(kind, result.body.item, false, { items: log.result.ok ? log.body.items || [] : [] }); }
function mountListSearch(root) {
  const form = root.querySelector("[data-admin-search]");
  if (!form) return () => {};
  const input = form.elements.q;
  const rows = [...root.querySelectorAll("[data-admin-searchable]")];
  const empty = root.querySelector("[data-admin-empty]");
  const filter = () => {
    const query = String(input.value || "").trim().toLowerCase();
    let shown = 0;
    rows.forEach((row) => {
      const match = !query || String(row.dataset.search || "").includes(query);
      row.hidden = !match;
      if (match) shown++;
    });
    if (empty) empty.hidden = shown > 0;
  };
  const submit = (event) => { event.preventDefault(); filter(); };
  form.addEventListener("submit", submit);
  input.addEventListener("input", filter);
  filter();
  return () => { form.removeEventListener("submit", submit); input.removeEventListener("input", filter); };
}

function mountNote(root) {
  const form = root.querySelector(".adm-note");
  if (!form) return () => {};
  const submit = async (event) => {
    event.preventDefault();
    const status = form.querySelector(".adm-note-status"), text = form.elements.note;
    if (!text.value.trim()) { status.textContent = "Write the note first."; text.focus(); return; }
    status.textContent = "Adding your note…";
    const { result, body } = await api(`/api/admin-data/organizations/${encodeURIComponent(form.dataset.id)}/activity`, { method: "POST", body: JSON.stringify({ note: text.value }) });
    if (!result.ok || !body.ok) { status.textContent = body.error || "We couldn't add that note."; return; }
    root.querySelector(".adm-act-list").innerHTML = activityItems(body.items || []);
    text.value = "";
    status.textContent = "Note added.";
  };
  form.addEventListener("submit", submit);
  return () => form.removeEventListener("submit", submit);
}
/** "Apply all that are still right": accept each one in turn, saying how far it got. */
function mountApplyAll(root) {
  const button = root.querySelector(".adm-apply-all");
  if (!button) return () => {};
  const run = async () => {
    const ids = String(button.dataset.ids || "").split(",").filter(Boolean);
    const status = root.querySelector(".adm-all-status");
    button.disabled = true;
    let done = 0, failed = 0;
    for (const [n, id] of ids.entries()) {
      status.textContent = `Applying ${n + 1} of ${ids.length}…`;
      const { result, body } = await api(`/api/admin-data/queue/${encodeURIComponent(id)}`, { method: "POST", body: JSON.stringify({ action: "accept" }) }).catch(() => ({ result: {}, body: {} }));
      if (result.ok && body.ok) { done++; const row = root.querySelector(`.adm-list a[href="/admin/queue/${id}"]`); if (row) row.remove(); } else failed++;
    }
    // Applied ones leave the list; anything that failed stays, to open one by one.
    status.textContent = `Applied ${done} of ${ids.length}.${failed ? ` ${failed === 1 ? "One" : failed} couldn't be applied; open ${failed === 1 ? "it" : "them"} below.` : ""}`;
    if (!failed) button.hidden = true; else button.disabled = false;
    const left = root.querySelectorAll(".adm-list a").length, head = root.querySelector(".adm-head p");
    if (head) head.textContent = left ? `${left} submissions need review.` : "No submissions need review.";
  };
  button.addEventListener("click", run);
  return () => button.removeEventListener("click", run);
}
function formDataWithSports(form) {
  const data = Object.fromEntries(new FormData(form));
  const keys = [...form.querySelectorAll('[data-sports-list] select')].map((select) => select.value).filter(Boolean);
  data.sports_json = JSON.stringify([...new Set(keys)]);
  data.sport_key = keys[0] || "";
  data.sport = keys[0] ? A.sportName(keys[0]) : "";
  delete data.sports;
  return data;
}

function bindSportControls(root) {
  const options = root.querySelector('[data-sports-list] select')?.innerHTML;
  if (!options) return () => {};
  const change = (event) => {
    const add = event.target.closest('[data-sport-add]');
    const remove = event.target.closest('[data-sport-remove]');
    if (!add && !remove) return;
    const list = (add || remove).closest('.adm-sports').querySelector('[data-sports-list]');
    if (add) list.insertAdjacentHTML('beforeend', `<div class="adm-sport-row" data-sport-row><select name="sports">${options}</select><button class="adm-sport-remove" type="button" data-sport-remove aria-label="Remove sport">${A.icon("x", 18)}</button></div>`);
    else {
      const row = remove.closest('[data-sport-row]');
      if (list.querySelectorAll('[data-sport-row]').length === 1) row.querySelector('select').value = "";
      else row.remove();
    }
  };
  root.addEventListener('click', change);
  return () => root.removeEventListener('click', change);
}

export function mount(root) { const offSearch = mountListSearch(root); const offNote = mountNote(root); const signout = root.querySelector(".adm-signout"); const leave = async () => { await fetch("/api/admin-auth/signout", { method: "POST" }); A.nav("/admin", { replace: true }); }; if (signout) signout.addEventListener("click", leave); const accept = root.querySelector(".adm-accept"); if (accept) accept.addEventListener("click", async () => { const status = root.querySelector(".adm-status"); status.textContent = accept.dataset.apply === "done" ? "Closing it…" : accept.dataset.apply ? "Applying…" : "Accepting submission…"; const { result, body } = await api(`/api/admin-data/queue/${accept.dataset.id}`, { method: "POST", body: JSON.stringify({ action: "accept" }) }); if (!result.ok || !body.ok) { status.textContent = body.error || "We couldn't accept this submission."; return; } A.nav("/admin/queue", { replace: true }); }); const offAll = mountApplyAll(root); const loginForm = root.querySelector(".adm-login"); if (loginForm) { const submit = async (event) => { event.preventDefault(); const input = loginForm.elements.email, status = root.querySelector(".adm-status"); if (!input.checkValidity()) return input.reportValidity(); status.textContent = "Sending your sign-in link…"; const { result, body } = await api("/api/admin-auth/request-link", { method: "POST", body: JSON.stringify({ email: input.value }) }); status.textContent = result.ok && body.ok ? "Check your email for a one-time sign-in link." : (body.error || "We couldn't send a sign-in link."); }; loginForm.addEventListener("submit", submit); return () => { offSearch(); loginForm.removeEventListener("submit", submit); if (signout) signout.removeEventListener("click", leave); }; } const form = root.querySelector(".adm-form"); if (form) { const sportControls = bindSportControls(root); const submit = async (event) => { event.preventDefault(); const required = form.querySelector("[required]"); if (required && !required.checkValidity()) return required.reportValidity(); const data = formDataWithSports(form); for (const key of BOOL[form.dataset.kind]) data[key] = form.elements[key].checked ? 1 : 0; for (const key of DATETIME) if (form.elements[key]) data[key] = fromDateTimeLocal(form.elements[key].value, form.elements[key].dataset.utc); const status = form.querySelector(".adm-status"), id = form.dataset.id; status.textContent = "Saving changes…"; const { result, body } = await api(`/api/admin-data/${form.dataset.kind}${id ? `/${id}` : ""}`, { method: id ? "PATCH" : "POST", body: JSON.stringify(data) }); if (!result.ok || !body.ok) return status.textContent = body.error || "We couldn't save this item."; A.nav(`/admin/${form.dataset.kind}/${body.item.id}`, { replace: true }); }; form.addEventListener("submit", submit); return () => { offSearch(); sportControls(); form.removeEventListener("submit", submit); offNote(); if (signout) signout.removeEventListener("click", leave); }; } return () => { offSearch(); offAll(); if (signout) signout.removeEventListener("click", leave); }; }
