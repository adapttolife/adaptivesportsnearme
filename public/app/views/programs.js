import * as A from "../app.js";
import { site, PAGES } from "../page-meta.js";
let ITEMS = [];

function rows(items) {
  if (!items.length) return `<p>No programs are available yet.</p>`;
  return `<div class="rows">${items.map((program) => `<a class="prow" href="/programs/${A.esc(program.id)}"><div class="pr-body"><h2 class="pr-name">${A.esc(program.name)}</h2><p class="meta">${A.esc(program.sportLabel || "Adaptive sports")}${program.organization?.name ? ` · ${A.esc(program.organization.name)}` : ""}</p></div></a>`).join("")}</div>`;
}

export async function render(ctx) {
  const response = await fetch("/api/programs?limit=200");
  if (!response.ok) throw new Error(`programs ${response.status}`);
  const body = await response.json();
  const items = body.items || [];
  ITEMS = items;
  return {
    title: site(PAGES.programs.title),
    description: PAGES.programs.description,
    html: `<section class="sec"><h1 tabindex="-1">Programs</h1><p>Browse the ${(body.total ?? items.length).toLocaleString()} programs across all organizations.</p><label for="program-search">Search programs</label><input id="program-search" type="search" autocomplete="off" placeholder="Program name"><div id="program-results">${rows(items)}</div></section>`,
  };
}

export function mount(root, ctx) {
  const input = root.querySelector("#program-search"), results = root.querySelector("#program-results");
  const items = ITEMS;
  const update = () => {
    const query = input.value.trim().toLowerCase();
    results.innerHTML = rows(query ? items.filter((program) => `${program.name} ${program.organization?.name || ""}`.toLowerCase().includes(query)) : items);
  };
  input.addEventListener("input", update);
  return () => input.removeEventListener("input", update);
}
