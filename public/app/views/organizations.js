import * as A from "../app.js";
import { site, PAGES } from "../page-meta.js";

// A to Z by the name people read (displayName), so the page means what it says.
const az = (list) => [...list].sort((a, b) => A.displayName(a.name).localeCompare(A.displayName(b.name), "en", { sensitivity: "base" }));
const draw = (items) => items.length ? `<div class="rows">${items.map((item) => A.programRow(item)).join("")}</div>` : `<p>No organizations match that search.</p>`;
export async function render(ctx) {
  const D = ctx.data || await A.loadData();
  const orgs = az(D.orgs || D.items);
  return {
    title: site(PAGES.organizations.title),
    description: PAGES.organizations.description,
    html: `<section class="sec"><h1 tabindex="-1">Organizations</h1><p>All ${orgs.length.toLocaleString()} organizations in the directory, A to Z. Type a name to find one.</p><label for="organization-search">Search organizations</label><input id="organization-search" type="search" autocomplete="off" placeholder="Organization name" value="${A.esc(ctx.query.q || "")}"><div id="organization-results">${draw(orgs)}</div></section>`,
  };
}
export function mount(root, ctx) {
  const input = root.querySelector("#organization-search"), results = root.querySelector("#organization-results");
  const items = az(ctx.data.orgs || ctx.data.items);
  const update = () => {
    const q = input.value.trim().toLowerCase();
    results.innerHTML = draw(q ? items.filter((item) => item.name.toLowerCase().includes(q)) : items);
  };
  input.addEventListener("input", update);
  update();
  return () => input.removeEventListener("input", update);
}
