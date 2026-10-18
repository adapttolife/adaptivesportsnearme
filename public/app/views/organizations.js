import * as A from "../app.js";

const draw = (items) => items.length ? `<div class="rows">${items.map((item) => A.programRow(item)).join("")}</div>` : `<p>No organizations match that search.</p>`;
export async function render(ctx) {
  const D = ctx.data || await A.loadData();
  return {
    title: "Organizations · Adaptive Sports Near Me",
    description: "Browse adaptive sports organizations and the programs they run.",
    html: `<section class="sec"><h1 tabindex="-1">Organizations</h1><p>Browse the ${D.items.length.toLocaleString()} organizations in our directory and the programs they run.</p><label for="organization-search">Search organizations</label><input id="organization-search" type="search" autocomplete="off" placeholder="Organization name" value="${A.esc(ctx.query.q || "")}"><div id="organization-results">${draw(D.items)}</div></section>`,
  };
}
export function mount(root, ctx) {
  const input = root.querySelector("#organization-search"), results = root.querySelector("#organization-results");
  const items = ctx.data.items;
  const update = () => {
    const q = input.value.trim().toLowerCase();
    results.innerHTML = draw(q ? items.filter((item) => item.name.toLowerCase().includes(q)) : items);
  };
  input.addEventListener("input", update);
  update();
  return () => input.removeEventListener("input", update);
}
