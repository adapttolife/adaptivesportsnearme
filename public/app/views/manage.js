import * as A from "../app.js";
import { fromDateTimeLocal, toDateTimeLocal } from "../local-datetime.js";
import { PAGES, site } from "../page-meta.js";
import { checklistHtml, chosenFrom, readChecklist, sportsValue, wireChecklist, seasonsFieldHtml, readSeasons, wireSeasons } from "../sport-checklist.js";
import { seasonsText } from "../yearly.js";

const esc = A.esc;
const stateOptions = (current) => `<option value="">Choose a state</option>${A.STATE_CODES.map((state) => `<option value="${state}"${state === current ? " selected" : ""}>${esc(A.stateName(state))}</option>`).join("")}`;
const value = (item, key) => esc(item?.[key] || "");
const sportOptions = (sports, organization) => {
  const choices = sports.filter((sport) => sport.key !== "multi")
    .map((sport) => [sport.key, A.sportName(sport.key)])
    .sort((a, b) => a[1].localeCompare(b[1]));
  choices.push(["several", "Several sports"]);
  const keys = new Set(choices.map(([key]) => key));
  const current = organization.sport_key || organization.sport || "";
  if (current && !keys.has(current)) choices.unshift([current, organization.sport || current]);
  return `<option value="">Choose a sport</option>${choices.map(([key, label]) => `<option value="${esc(key)}"${key === current ? " selected" : ""}>${esc(label)}</option>`).join("")}`;
};

async function response(path, options) {
  const result = await fetch(path, { ...options, headers: { "content-type": "application/json", ...(options?.headers || {}) } });
  const body = await result.json().catch(() => ({}));
  return { result, body };
}

function dateValue(stored) {
  return toDateTimeLocal(stored);
}

/** A program's seasons as the manage API sends them (seasons_json, '["winter"]'), else []. */
function programSeasons(item) {
  const raw = item?.seasons_json ?? item?.seasons;
  if (Array.isArray(raw)) return raw;
  try { const list = JSON.parse(raw || "[]"); return Array.isArray(list) ? list : []; } catch (_) { return []; }
}

function managedProgram(item, sports) {
  const id = item?.id || "";
  return `<form class="om-card om-managed" data-kind="programs"${id ? ` data-id="${esc(id)}"` : ""} novalidate><fieldset><legend>${id ? "Edit program" : "Add a program"}</legend><div class="field"><label>Name <span class="req" aria-hidden="true">*</span></label><input name="name" required value="${value(item, "name")}"></div><div class="field"><label>Sport</label><select name="sport_key">${sportOptions(sports, item || {})}</select></div>${seasonsFieldHtml({ seasons: programSeasons(item), esc })}<div class="field"><label>Website</label><input name="website_url" type="url" value="${value(item, "website_url")}" placeholder="https://"></div><div class="om-two"><div class="field"><label>City</label><input name="city" value="${value(item, "city")}"></div><div class="field"><label>State</label><select name="state">${stateOptions(item?.state)}</select></div></div><div class="field"><label>Description</label><textarea name="description" rows="3">${value(item, "description")}</textarea></div><label class="om-visibility"><span class="om-visibility-copy">Equipment<small>We provide equipment.</small></span><input name="equipment_provided" type="checkbox" role="switch" value="1"${Number(item?.equipment_provided) === 1 ? " checked" : ""}><span class="dl-switch" aria-hidden="true"></span></label><label class="om-visibility"><span class="om-visibility-copy">Program visibility<small>Show this program on Adaptive Sports Near Me.</small></span><input name="is_public" type="checkbox" role="switch" value="1"${id ? Number(item?.is_public) === 1 ? " checked" : "" : " checked"}><span class="dl-switch" aria-hidden="true"></span></label></fieldset><p class="om-status" role="status"></p><div class="btns"><button class="btn btn--ink" type="submit">${id ? "Save program" : "Add program"}</button>${id ? `<button class="btn btn--line" type="button" data-delete>Delete program</button>` : ""}</div></form>`;
}

function managedEvent(item, sports) {
  const id = item?.id || "";
  return `<form class="om-card om-managed" data-kind="events"${id ? ` data-id="${esc(id)}"` : ""} novalidate><fieldset><legend>${id ? "Edit event" : "Add an event"}</legend><div class="field"><label>Event name <span class="req" aria-hidden="true">*</span></label><input name="title" required value="${value(item, "title")}"></div><div class="field"><label>Sport</label><select name="sport_key">${sportOptions(sports, item || {})}</select></div><div class="om-two"><div class="field"><label>Starts <span class="req" aria-hidden="true">*</span></label><input name="starts_at" type="datetime-local" required step="1" value="${dateValue(item?.starts_at)}"${item?.starts_at ? ` data-utc="${esc(item.starts_at)}"` : ""}></div><div class="field"><label>Ends</label><input name="ends_at" type="datetime-local" step="1" value="${dateValue(item?.ends_at)}"${item?.ends_at ? ` data-utc="${esc(item.ends_at)}"` : ""}></div></div><div class="field"><label>Venue</label><input name="venue" value="${value(item, "venue")}"></div><div class="om-two"><div class="field"><label>City</label><input name="city" value="${value(item, "city")}"></div><div class="field"><label>State</label><select name="state">${stateOptions(item?.state)}</select></div></div><div class="field"><label>Event URL</label><input name="url" type="url" value="${value(item, "url")}" placeholder="https://"></div><div class="field"><label>Description</label><textarea name="description" rows="3">${value(item, "description")}</textarea></div><label class="om-visibility"><span class="om-visibility-copy">We hold this every year<small>It gets one page that stays up between years, with past years listed.</small></span><input name="yearly" type="checkbox" role="switch" value="1"${item?.program_id ? " checked" : ""}><span class="dl-switch" aria-hidden="true"></span></label>${item?.program_id && item?.series_slug ? `<p class="om-yearly-link"><a class="tlink" href="/events/${esc(encodeURIComponent(item.series_slug))}">See its yearly page${A.icon("arrow-right", 18)}</a></p>` : ""}<div class="field om-first-year"${item?.program_id ? "" : " hidden"}><label>First year it ran</label><input name="first_year" type="text" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" placeholder="2024" value="${value(item, "first_year")}"></div><div class="field"><label>Results or photos link</label><input name="recap_url" type="url" value="${value(item, "recap_url")}" placeholder="https://"></div><label class="om-visibility"><span class="om-visibility-copy">Event visibility<small>Show this event on Adaptive Sports Near Me.</small></span><input name="is_public" type="checkbox" role="switch" value="1"${id ? Number(item?.is_public) === 1 ? " checked" : "" : " checked"}><span class="dl-switch" aria-hidden="true"></span></label></fieldset><p class="om-status" role="status"></p><div class="btns"><button class="btn btn--ink" type="submit">${id ? "Save event" : "Add event"}</button>${id ? `<button class="btn btn--line" type="button" data-delete>Delete event</button>` : ""}</div></form>`;
}

function withPublicLink(form, href, label) {
  return form.replace('</div></form>', `<a class="btn btn--line" href="${esc(href)}">Go to ${label}</a></div></form>`);
}

function login(message = "") {
  return {
    title: site(PAGES.manage.title),
    description: PAGES.manage.description,
    html: `<section class="om"><div class="om-head"><h1 tabindex="-1">Manage your organization</h1><p>Use the email address your organization gave us. We’ll send a one-time sign-in link.</p></div><form class="om-card om-login" novalidate><div class="field"><label for="om-email">Email address</label><input id="om-email" name="email" type="email" autocomplete="email" required></div><p class="om-status" role="status">${esc(message)}</p><button class="btn btn--ink" type="submit">Email me a sign-in link</button></form><p class="om-note">Need access to a listing? <a href="/help">Contact us</a>.</p></section>`,
  };
}

function chooser(organizations) {
  return {
    title: site(PAGES.manage.title),
    description: PAGES.manage.description,
    html: `<section class="om"><div class="om-head"><h1 tabindex="-1">Your organizations</h1><p>Choose an organization to review its public details.</p></div><div class="om-list">${organizations.map((organization) => `<a class="om-org" href="/manage/organizations/${esc(organization.id)}"><span>${esc(organization.name)}</span>${A.icon("arrow-right", 20)}</a>`).join("")}</div><button class="om-signout btn btn--line" type="button">Sign out</button></section>`,
  };
}

function dashboard(organization) {
  const id = esc(organization.id);
  const item = (href, label, note) => `<a class="om-org" href="${href}"><span><b>${label}</b><small>${note}</small></span>${A.icon("arrow-right", 20)}</a>`;
  return {
    title: site(`Manage ${organization.name}`), description: PAGES.manage.description,
    html: `<section class="om"><a class="om-back" href="/manage">${A.icon("arrow-left", 20)}<span>Your organizations</span></a><div class="om-head"><h1 tabindex="-1">${esc(organization.name)}</h1><p>Choose what you want to manage.</p></div><div class="btns"><a class="btn btn--line" href="/organizations/${esc(organization.id)}">Go to organization</a></div><div class="om-list">${item(`/manage/organizations/${id}/edit`, "Edit organization details", "Name, contact, location and visibility")}${item(`/manage/organizations/${id}/programs`, "Manage programs", "Programs this organization runs")}${item(`/manage/organizations/${id}/events`, "Manage events", "Events hosted by this organization")}</div></section>`,
  };
}

/** Under each name: where it is, and for a program when it runs ("Cincinnati · Winter"). */
function itemNote(kind, item) {
  const where = item.city || item.venue || "";
  const when = kind === "programs" ? seasonsText(programSeasons(item)) : "";
  const hidden = kind === "programs" && Number(item.is_public) === 0 ? "Hidden" : "";
  return [where, when, hidden].filter(Boolean).join(" · ") || "No location listed";
}

function itemList(kind, organization, items) {
  // A yearly event is a program underneath, but it's managed under Events, never in this list.
  if (kind === "programs") items = items.filter((item) => item.kind !== "event");
  const noun = kind === "programs" ? "program" : "event";
  const title = kind === "programs" ? "Programs" : "Events";
  const id = esc(organization.id);
  const href = (item) => `/manage/${kind}/${esc(item.id)}`;
  return {
    title: site(`${title} · ${organization.name}`), description: PAGES.manage.description,
    html: `<section class="om"><a class="om-back" href="/manage/organizations/${id}">${A.icon("arrow-left", 20)}<span>${esc(organization.name)}</span></a><div class="om-head"><h1 tabindex="-1">${title}</h1><p>${items.length ? `${items.length} linked ${items.length === 1 ? noun : `${noun}s`}.` : `No linked ${noun}s yet.`}</p></div><div class="om-list">${items.map((item) => `<a class="om-org" href="${href(item)}"><span><b>${esc(item.name || item.title)}</b><small>${esc(itemNote(kind, item))}</small></span>${A.icon("arrow-right", 20)}</a>`).join("")}</div><a class="om-add btn btn--ink" href="/manage/organizations/${id}/${kind}/new">Add ${noun}</a></section>`,
  };
}

/** Your sports and seasons, in place of the one "Primary sport" (docs/specs/programs-that-come-back.md).
    Prefilled from what the organization already said, else its listed sports. Saved as sport_seasons_json. */
function sportsSet(sports, organization) {
  const keys = sports.map((sport) => sport.key).filter((key) => key !== "multi" && key !== "grant" && key !== "event");
  const chosen = chosenFrom(organization, (key) => keys.includes(key));
  // A sport with its own program page stays ticked here; it comes off under Programs.
  const locked = (Array.isArray(organization.own_program_sports) ? organization.own_program_sports : []).filter((key) => keys.includes(key));
  return `<fieldset class="om-sports"><legend>Sports and seasons</legend><p class="hint">Tick every sport you run. A sport you untick comes off your listing.</p>${checklistHtml({ keys, nameOf: A.sportName, chosen, locked, esc })}</fieldset>`;
}

function editor(organization, sports, programs = [], events = []) {
  const checked = (key) => Number(organization[key]) === 1 ? " checked" : "";
  return {
    title: site(`Manage ${organization.name}`),
    description: PAGES.manage.description,
    html: `<section class="om"><a class="om-back" href="/manage/organizations/${esc(organization.id)}">${A.icon("arrow-left", 20)}<span>${esc(organization.name)}</span></a><div class="om-head"><h1 tabindex="-1">${esc(organization.name)}</h1><p>Changes appear on your organization page after you save.</p></div><form class="om-card om-edit" novalidate><fieldset><legend>Organization details</legend><div class="field"><label for="om-name">Organization name <span class="req" aria-hidden="true">*</span></label><input id="om-name" name="name" required value="${value(organization, "name")}"></div><div class="field"><label for="om-type">Organization type</label><input id="om-type" name="org_type" value="${value(organization, "org_type")}" autocomplete="organization-title"></div><div class="field"><label for="om-website">Website</label><input id="om-website" name="website_url" type="url" inputmode="url" value="${value(organization, "website_url")}" placeholder="https://"></div><div class="field"><label for="om-description">Description</label><textarea id="om-description" name="description" rows="5">${value(organization, "description")}</textarea></div><label class="om-visibility"><span class="om-visibility-copy">Organization visibility<small>Show this organization on Adaptive Sports Near Me.</small></span><input name="is_public" type="checkbox" role="switch" value="1"${checked("is_public")}><span class="dl-switch" aria-hidden="true"></span></label></fieldset><fieldset><legend>Location and contact</legend><div class="field"><label for="om-address">Address</label><input id="om-address" name="address" value="${value(organization, "address")}" autocomplete="street-address"></div><div class="om-two"><div class="field"><label for="om-city">City</label><input id="om-city" name="city" value="${value(organization, "city")}" autocomplete="address-level2"></div><div class="field"><label for="om-state">State</label><select id="om-state" name="state">${stateOptions(organization.state)}</select></div></div><div class="om-two"><div class="field"><label for="om-zip">ZIP code</label><input id="om-zip" name="zip" value="${value(organization, "zip")}" autocomplete="postal-code"></div><div class="field"><label for="om-country">Country</label><input id="om-country" name="country" value="${value(organization, "country") || "United States"}" autocomplete="country-name"></div></div><label class="om-visibility"><span class="om-visibility-copy">Address visibility<small>Show the organization full address publicly.</small></span><input name="address_publicity_consent" type="checkbox" role="switch" value="1"${checked("address_publicity_consent")}><span class="dl-switch" aria-hidden="true"></span></label><div class="field"><label for="om-public-email">Public email</label><input id="om-public-email" name="email" type="email" value="${value(organization, "email")}" autocomplete="email"></div><div class="field"><label for="om-phone">Public phone</label><input id="om-phone" name="phone" type="tel" value="${value(organization, "phone")}" autocomplete="tel"></div><label class="om-visibility"><span class="om-visibility-copy">Contact visibility<small>Show my organization’s email and phone publicly.</small></span><input name="publicity_consent" type="checkbox" role="switch" value="1"${checked("publicity_consent")}><span class="dl-switch" aria-hidden="true"></span></label></fieldset><fieldset><legend>Program information</legend>${sportsSet(sports, organization)}<div class="field"><label for="om-cost">Cost or fee information</label><input id="om-cost" name="cost_note" value="${value(organization, "cost_note")}"></div><div class="field"><label for="om-ages">Who it is for</label><input id="om-ages" name="ages" value="${value(organization, "ages")}"></div><label class="om-visibility"><span class="om-visibility-copy">Equipment<small>We provide equipment.</small></span><input name="equipment_provided" type="checkbox" role="switch" value="1"${checked("equipment_provided")}><span class="dl-switch" aria-hidden="true"></span></label></fieldset><p class="om-status" role="status"></p><div class="btns"><button class="btn btn--ink" type="submit">Save changes</button><a class="btn btn--line" href="/organizations/${esc(organization.id)}">Go to organization</a></div></form></section>`,
  };
}

export async function render(ctx) {
  const path = location.pathname.replace(/\/+$/, "");
  const session = await response("/api/org-auth/session");
  if (!session.result.ok) return login();
  const organizations = session.body.organizations || [];
  if (path === "/manage" || path === "/manage/organizations") return chooser(organizations);
  const itemMatch = path.match(/^\/manage\/(programs|events)\/([a-z0-9-]{1,80})$/i);
  if (itemMatch) {
    const kind = itemMatch[1];
    const itemId = itemMatch[2];
    for (const organization of organizations) {
      const listed = await response(`/api/organizations/${encodeURIComponent(organization.id)}/manage/${kind}`);
      const item = (listed.body.items || []).find((row) => row.id === itemId);
      if (!item) continue;
      const form = withPublicLink(
        (kind === "programs" ? managedProgram(item, ctx.data?.sports || []) : managedEvent(item, ctx.data?.sports || []))
          .replace(`data-kind="${kind}"`, `data-kind="${kind}" data-org="${esc(organization.id)}"`),
        kind === "programs" ? `/programs/${item.id}` : (item.url || "/events"),
        kind === "programs" ? "program" : "event"
      );
      return { title: site(`Edit ${item.name || item.title}`), description: PAGES.manage.description,
        html: `<section class="om"><a class="om-back" href="/manage/organizations/${esc(organization.id)}/${kind}">${A.icon("arrow-left", 20)}<span>${kind === "programs" ? "Programs" : "Events"}</span></a><div class="om-head"><h1 tabindex="-1">Edit ${kind === "programs" ? "program" : "event"}</h1></div>${form}</section>` };
    }
    return login("That item is not available for this sign-in.");
  }
  const orgMatch = path.match(/^\/manage\/organizations\/([0-9a-f-]{36})(?:\/(edit|programs|events)(\/new)?)?$/i);
  if (!orgMatch) return chooser(organizations);
  const id = orgMatch[1].toLowerCase();
  const managed = await response(`/api/organizations/${encodeURIComponent(id)}/manage`);
  if (!managed.result.ok || !managed.body.organization) return login("That organization is not available for this sign-in.");
  if (!orgMatch[2]) return dashboard(managed.body.organization);
  if (orgMatch[2] === "edit") return editor(managed.body.organization, ctx.data?.sports || []);
  const base = `/api/organizations/${encodeURIComponent(id)}/manage`;
  const kind = orgMatch[2];
  if (orgMatch[3]) {
    const isProgram = kind === "programs";
    return { title: site(`Add ${isProgram ? "program" : "event"}`), description: PAGES.manage.description,
      html: `<section class="om"><a class="om-back" href="/manage/organizations/${esc(id)}">${A.icon("arrow-left", 20)}<span>${esc(managed.body.organization.name)}</span></a><div class="om-head"><h1 tabindex="-1">Add ${isProgram ? "program" : "event"}</h1></div>${(isProgram ? managedProgram(null, ctx.data?.sports || []) : managedEvent(null, ctx.data?.sports || [])).replace(`data-kind="${kind}"`, `data-kind="${kind}" data-org="${esc(id)}"`)}</section>` };
  }
  const listed = await response(`${base}/${kind}`);
  return itemList(kind, managed.body.organization, listed.body.items || []);
}

/** "We hold this every year": yearly is "1" or absent; the first year only goes with it.
    A program's seasons go as seasons_json, '["winter"]'. */
function yearlyFields(form, data) {
  if (form.dataset.kind === "programs" && form.querySelector("[data-seasons]")) data.seasons_json = JSON.stringify(readSeasons(form));
  if (!form.elements.yearly) return;
  if (form.elements.yearly.checked) data.yearly = "1";
  else { delete data.yearly; delete data.first_year; }
  if (data.first_year != null) data.first_year = String(data.first_year).trim();
}

export function mount(root) {
  // The yearly switch shows "First year it ran"; the sports checklist shows each ticked sport's seasons.
  const showFirstYear = (event) => {
    const t = event.target;
    if (!t || t.name !== "yearly") return;
    const box = t.form && t.form.querySelector(".om-first-year");
    if (box) box.hidden = !t.checked;
  };
  root.addEventListener("change", showFirstYear);
  const offChecklist = wireChecklist(root);
  const offSeasons = wireSeasons(root);
  const signout = async () => {
    await fetch("/api/org-auth/signout", { method: "POST" });
    A.nav("/manage", { replace: true });
  };
  const form = root.querySelector(".om-login");
  if (form) {
    const submit = async (event) => {
      event.preventDefault();
      const input = form.elements.email, status = root.querySelector(".om-status");
      if (!input.checkValidity()) { input.reportValidity(); return; }
      status.textContent = "Sending your sign-in link…";
      const { result, body } = await response("/api/org-auth/request-link", { method: "POST", body: JSON.stringify({ email: input.value }) });
      status.textContent = result.ok && body.ok ? "If that email can manage an organization, a sign-in link is on its way." : (body.error || "We couldn't send a sign-in link. Please try again.");
    };
    form.addEventListener("submit", submit);
    return () => { form.removeEventListener("submit", submit); root.removeEventListener("change", showFirstYear); offChecklist(); offSeasons(); };
  }
  const edit = root.querySelector(".om-edit");
  const signouts = [...root.querySelectorAll(".om-signout")];
  signouts.forEach((button) => button.addEventListener("click", signout));
  if (!edit) {
    const managedForms = [...root.querySelectorAll(".om-managed")];
    const saveManaged = async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const required = form.querySelector("[required]");
      if (required && !required.checkValidity()) { required.reportValidity(); return; }
      const data = Object.fromEntries(new FormData(form));
      for (const key of ["is_public", "equipment_provided"]) if (form.elements[key]) data[key] = form.elements[key].checked ? 1 : 0;
      for (const key of ["starts_at", "ends_at"]) if (form.elements[key]) data[key] = fromDateTimeLocal(form.elements[key].value, form.elements[key].dataset.utc);
      yearlyFields(form, data);
      const organizationId = form.dataset.org;
      const suffix = form.dataset.id ? `/${encodeURIComponent(form.dataset.id)}` : "";
      const status = form.querySelector(".om-status");
      status.textContent = "Saving changes…";
      const { result, body } = await response(`/api/organizations/${encodeURIComponent(organizationId)}/manage/${form.dataset.kind}${suffix}`, { method: form.dataset.id ? "PATCH" : "POST", body: JSON.stringify(data) });
      if (!result.ok || !body.ok) { status.textContent = body.error || "We couldn't save this right now. Please try again."; return; }
      A.nav(`/manage/organizations/${encodeURIComponent(organizationId)}/${form.dataset.kind}`, { replace: true });
    };
    const deleteManaged = async (event) => {
      const form = event.currentTarget.closest(".om-managed");
      const status = form.querySelector(".om-status");
      status.textContent = "Deleting…";
      const { result, body } = await response(`/api/organizations/${encodeURIComponent(form.dataset.org)}/manage/${form.dataset.kind}/${encodeURIComponent(form.dataset.id)}`, { method: "DELETE" });
      if (!result.ok || !body.ok) { status.textContent = body.error || "We couldn't delete this right now. Please try again."; return; }
      A.nav(`/manage/organizations/${encodeURIComponent(form.dataset.org)}/${form.dataset.kind}`, { replace: true });
    };
    managedForms.forEach((managed) => managed.addEventListener("submit", saveManaged));
    const deletes = [...root.querySelectorAll(".om-managed [data-delete]")];
    deletes.forEach((button) => button.addEventListener("click", deleteManaged));
    return () => { managedForms.forEach((managed) => managed.removeEventListener("submit", saveManaged)); deletes.forEach((button) => button.removeEventListener("click", deleteManaged)); signouts.forEach((button) => button.removeEventListener("click", signout)); root.removeEventListener("change", showFirstYear); offChecklist(); offSeasons(); };
  }
  const save = async (event) => {
    event.preventDefault();
    const name = edit.elements.name, status = root.querySelector(".om-status");
    if (!name.checkValidity()) { name.reportValidity(); return; }
    const data = Object.fromEntries(new FormData(edit));
    // The server works out sport, sport_key and sports_json from this one answer.
    data.sport_seasons_json = sportsValue(readChecklist(edit));
    data.is_public = edit.elements.is_public.checked ? 1 : 0;
    data.publicity_consent = edit.elements.publicity_consent.checked ? 1 : 0;
    data.address_publicity_consent = edit.elements.address_publicity_consent.checked ? 1 : 0;
    data.equipment_provided = edit.elements.equipment_provided.checked ? 1 : 0;
    status.textContent = "Saving changes…";
    const id = location.pathname.split("/").at(-2) === "organizations" ? location.pathname.split("/").at(-1) : location.pathname.split("/").at(-2);
    const { result, body } = await response(`/api/organizations/${encodeURIComponent(id)}/manage`, { method: "PATCH", body: JSON.stringify(data) });
    status.textContent = result.ok && body.ok ? "Changes saved." : (body.error || "We couldn't save your changes. Please try again.");
    if (result.ok && body.organization?.name) { const heading = root.querySelector("h1"); if (heading) heading.textContent = body.organization.name; }
  };
  edit.addEventListener("submit", save);
  const managedForms = [...root.querySelectorAll(".om-managed")];
  const saveManaged = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const required = form.querySelector("[required]");
    if (required && !required.checkValidity()) { required.reportValidity(); return; }
    const data = Object.fromEntries(new FormData(form));
    for (const key of ["is_public", "equipment_provided"]) if (form.elements[key]) data[key] = form.elements[key].checked ? 1 : 0;
    for (const key of ["starts_at", "ends_at"]) if (form.elements[key]) data[key] = fromDateTimeLocal(form.elements[key].value, form.elements[key].dataset.utc);
    yearlyFields(form, data);
    const id = location.pathname.split("/").at(-1);
    const suffix = form.dataset.id ? `/${encodeURIComponent(form.dataset.id)}` : "";
    const status = form.querySelector(".om-status");
    status.textContent = "Saving changes…";
    const { result, body } = await response(`/api/organizations/${encodeURIComponent(id)}/manage/${form.dataset.kind}${suffix}`, { method: form.dataset.id ? "PATCH" : "POST", body: JSON.stringify(data) });
    if (!result.ok || !body.ok) { status.textContent = body.error || "We couldn't save this right now. Please try again."; return; }
    A.nav(location.pathname, { replace: true });
  };
  const deleteManaged = async (event) => {
    const form = event.currentTarget.closest(".om-managed");
    const id = location.pathname.split("/").at(-1);
    const status = form.querySelector(".om-status");
    status.textContent = "Deleting…";
    const { result, body } = await response(`/api/organizations/${encodeURIComponent(id)}/manage/${form.dataset.kind}/${encodeURIComponent(form.dataset.id)}`, { method: "DELETE" });
    if (!result.ok || !body.ok) { status.textContent = body.error || "We couldn't delete this right now. Please try again."; return; }
    A.nav(location.pathname, { replace: true });
  };
  managedForms.forEach((form) => form.addEventListener("submit", saveManaged));
  const deletes = [...root.querySelectorAll(".om-managed [data-delete]")];
  deletes.forEach((button) => button.addEventListener("click", deleteManaged));
  return () => { edit.removeEventListener("submit", save); managedForms.forEach((form) => form.removeEventListener("submit", saveManaged)); deletes.forEach((button) => button.removeEventListener("click", deleteManaged)); signouts.forEach((button) => button.removeEventListener("click", signout)); root.removeEventListener("change", showFirstYear); offChecklist(); offSeasons(); };
}
