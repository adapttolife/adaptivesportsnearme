import * as A from "../app.js";

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

function login(message = "") {
  return {
    title: "Manage your organization · Adaptive Sports Near Me",
    description: "Sign in to review and update your organization's details.",
    html: `<section class="om"><div class="om-head"><h1 tabindex="-1">Manage your organization</h1><p>Use the email address your organization gave us. We’ll send a one-time sign-in link.</p></div><form class="om-card om-login" novalidate><div class="field"><label for="om-email">Email address</label><input id="om-email" name="email" type="email" autocomplete="email" required></div><p class="om-status" role="status">${esc(message)}</p><button class="btn btn--ink" type="submit">Email me a sign-in link</button></form><p class="om-note">Need access to a listing? <a href="/help">Contact us</a>.</p></section>`,
  };
}

function chooser(organizations) {
  return {
    title: "Manage your organization · Adaptive Sports Near Me",
    description: "Choose an organization to review its details.",
    html: `<section class="om"><div class="om-head"><h1 tabindex="-1">Your organizations</h1><p>Choose an organization to review its public details.</p></div><div class="om-list">${organizations.map((organization) => `<a class="om-org" href="/manage/organizations/${esc(organization.id)}"><span>${esc(organization.name)}</span>${A.icon("arrow-right", 20)}</a>`).join("")}</div><button class="om-signout btn btn--line" type="button">Sign out</button></section>`,
  };
}

function editor(organization, sports) {
  const checked = (key) => Number(organization[key]) === 1 ? " checked" : "";
  return {
    title: `Manage ${organization.name} · Adaptive Sports Near Me`,
    description: "Review and update your organization's details.",
    html: `<section class="om"><a class="om-back" href="/manage">${A.icon("arrow-left", 20)}<span>Your organizations</span></a><div class="om-head"><h1 tabindex="-1">${esc(organization.name)}</h1><p>Changes appear on your organization page after you save.</p></div><form class="om-card om-edit" novalidate><fieldset><legend>Organization details</legend><div class="field"><label for="om-name">Organization name <span class="req" aria-hidden="true">*</span></label><input id="om-name" name="name" required value="${value(organization, "name")}"></div><div class="field"><label for="om-type">Organization type</label><input id="om-type" name="org_type" value="${value(organization, "org_type")}" autocomplete="organization-title"></div><div class="field"><label for="om-website">Website</label><input id="om-website" name="website_url" type="url" inputmode="url" value="${value(organization, "website_url")}" placeholder="https://"></div><div class="field"><label for="om-description">Description</label><textarea id="om-description" name="description" rows="5">${value(organization, "description")}</textarea></div><label class="om-visibility"><span class="om-visibility-copy">Organization visibility<small>Show this organization on Adaptive Sports Near Me.</small></span><input name="is_public" type="checkbox" role="switch" value="1"${checked("is_public")}><span class="dl-switch" aria-hidden="true"></span></label></fieldset><fieldset><legend>Location and contact</legend><div class="field"><label for="om-address">Address</label><input id="om-address" name="address" value="${value(organization, "address")}" autocomplete="street-address"></div><div class="om-two"><div class="field"><label for="om-city">City</label><input id="om-city" name="city" value="${value(organization, "city")}" autocomplete="address-level2"></div><div class="field"><label for="om-state">State</label><select id="om-state" name="state">${stateOptions(organization.state)}</select></div></div><div class="om-two"><div class="field"><label for="om-zip">ZIP code</label><input id="om-zip" name="zip" value="${value(organization, "zip")}" autocomplete="postal-code"></div><div class="field"><label for="om-country">Country</label><input id="om-country" name="country" value="${value(organization, "country") || "United States"}" autocomplete="country-name"></div></div><label class="om-visibility"><span class="om-visibility-copy">Address visibility<small>Show the organization full address publicly.</small></span><input name="address_publicity_consent" type="checkbox" role="switch" value="1"${checked("address_publicity_consent")}><span class="dl-switch" aria-hidden="true"></span></label><div class="field"><label for="om-public-email">Public email</label><input id="om-public-email" name="email" type="email" value="${value(organization, "email")}" autocomplete="email"></div><div class="field"><label for="om-phone">Public phone</label><input id="om-phone" name="phone" type="tel" value="${value(organization, "phone")}" autocomplete="tel"></div><label class="om-visibility"><span class="om-visibility-copy">Contact visibility<small>Show my organization’s email and phone publicly.</small></span><input name="publicity_consent" type="checkbox" role="switch" value="1"${checked("publicity_consent")}><span class="dl-switch" aria-hidden="true"></span></label></fieldset><fieldset><legend>Program information</legend><div class="field"><label for="om-sport">Primary sport</label><select id="om-sport" name="sport">${sportOptions(sports, organization)}</select></div><div class="field"><label for="om-cost">Cost or fee information</label><input id="om-cost" name="cost_note" value="${value(organization, "cost_note")}"></div><div class="field"><label for="om-ages">Who it is for</label><input id="om-ages" name="ages" value="${value(organization, "ages")}"></div><label class="om-check"><input name="equipment_provided" type="checkbox" value="1"${checked("equipment_provided")}><span>We provide equipment.</span></label></fieldset><p class="om-status" role="status"></p><div class="btns"><button class="btn btn--ink" type="submit">Save changes</button><a class="btn btn--line" href="/organizations/${esc(organization.id)}">Go to page</a></div></form></section>`,
  };
}

export async function render(ctx) {
  const id = String(ctx.params.id || "").toLowerCase();
  const session = await response("/api/org-auth/session");
  if (!session.result.ok) return login();
  const organizations = session.body.organizations || [];
  if (!id) return chooser(organizations);
  const managed = await response(`/api/organizations/${encodeURIComponent(id)}/manage`);
  if (!managed.result.ok || !managed.body.organization) return login("That organization is not available for this sign-in.");
  return editor(managed.body.organization, ctx.data?.sports || []);
}

export function mount(root) {
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
    return () => form.removeEventListener("submit", submit);
  }
  const edit = root.querySelector(".om-edit");
  const signouts = [...root.querySelectorAll(".om-signout")];
  signouts.forEach((button) => button.addEventListener("click", signout));
  if (!edit) return () => signouts.forEach((button) => button.removeEventListener("click", signout));
  const save = async (event) => {
    event.preventDefault();
    const name = edit.elements.name, status = root.querySelector(".om-status");
    if (!name.checkValidity()) { name.reportValidity(); return; }
    const data = Object.fromEntries(new FormData(edit));
    data.sport_key = data.sport;
    data.is_public = edit.elements.is_public.checked ? 1 : 0;
    data.publicity_consent = edit.elements.publicity_consent.checked ? 1 : 0;
    data.address_publicity_consent = edit.elements.address_publicity_consent.checked ? 1 : 0;
    data.equipment_provided = edit.elements.equipment_provided.checked ? 1 : 0;
    status.textContent = "Saving changes…";
    const id = location.pathname.split("/").at(-1);
    const { result, body } = await response(`/api/organizations/${encodeURIComponent(id)}/manage`, { method: "PATCH", body: JSON.stringify(data) });
    status.textContent = result.ok && body.ok ? "Changes saved." : (body.error || "We couldn't save your changes. Please try again.");
    if (result.ok && body.organization?.name) { const heading = root.querySelector("h1"); if (heading) heading.textContent = body.organization.name; }
  };
  edit.addEventListener("submit", save);
  return () => { edit.removeEventListener("submit", save); signouts.forEach((button) => button.removeEventListener("click", signout)); };
}
