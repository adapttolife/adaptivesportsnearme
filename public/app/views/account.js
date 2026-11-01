import * as A from "../app.js";
import { site, PAGES } from "../page-meta.js";

const esc = A.esc;

function href(item) {
  if (item.href) return item.href;
  if (item.kind === "organizations") return `/organizations/${item.id}`;
  if (item.kind === "programs") return `/programs/${item.id}`;
  if (item.kind === "grants") return `/grants/${item.id}`;
  return "/events";
}

function label(kind) {
  return kind === "organizations"
    ? "Organization"
    : kind === "programs"
      ? "Program"
      : kind === "grants"
        ? "Grant"
        : kind === "sports"
          ? "Sport"
          : "Event";
}

async function api(path, options) {
  const response = await fetch(path, options);
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

function login(message = "") {
  return {
    title: site(PAGES.account.title),
    description: PAGES.account.description,
    html: `<section class="account">
      <div class="account-head">
        <h1 tabindex="-1">Save what matters to you</h1>
        <p>Keep sports, organizations, programs, events and grants in one place. We'll email you a one-time sign-in link.</p>
      </div>
      <form class="account-card account-login" novalidate>
        <div class="field">
          <label for="account-email">Email address</label>
          <input id="account-email" name="email" type="email" autocomplete="email" required>
        </div>
        <p class="account-status" role="status">${esc(message)}</p>
        <button class="btn btn--ink" type="submit">Email me a sign-in link</button>
      </form>
    </section>`,
    railActive: "account",
  };
}

function savedItem(item) {
  const location = [item.city, item.state].filter(Boolean).join(", ");
  return `<a class="account-item" href="${esc(href(item))}">
    <span>
      <small>${label(item.kind)}</small>
      <b>${esc(item.name)}</b>
      ${location ? `<em>${esc(location)}</em>` : ""}
    </span>
    ${A.icon("arrow-right", 20)}
  </a>`;
}

function dashboard(profile) {
  const items = profile.saved || [];
  const rows = items.length
    ? items.map(savedItem).join("")
    : `<div class="account-empty">
        <h2>Nothing saved yet</h2>
        <p>When you find a sport, organization, program, event or grant you want to revisit, choose Save on its page.</p>
        <a class="btn btn--ink" href="/sports">Browse sports</a>
      </div>`;
  return {
    title: site(PAGES.account.title),
    description: PAGES.account.description,
    html: `<section class="account">
      <div class="account-head">
        <h1 tabindex="-1">Your saved items</h1>
        <p>${esc(profile.email)}</p>
      </div>
      <div class="account-list">${rows}</div>
      <button class="btn btn--line account-signout" type="button">Sign out</button>
    </section>`,
    railActive: "account",
  };
}

export async function render() {
  const { response, body } = await api("/api/profile-auth/session");
  return response.ok && body?.profile ? dashboard(body.profile) : login();
}

export function mount(root) {
  const form = root.querySelector(".account-login");
  if (form)
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = root.querySelector(".account-status");
      const email = new FormData(form).get("email");
      status.textContent = "Sending your link...";
      const { response, body } = await api("/api/profile-auth/request-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      status.textContent = response.ok
        ? "Check your inbox for your sign-in link."
        : body.error || "We could not send a sign-in link.";
    });
  root
    .querySelector(".account-signout")
    ?.addEventListener("click", async () => {
      await fetch("/api/profile/signout", { method: "POST" });
      A.nav("/account", { replace: true });
    });
  return () => {};
}
