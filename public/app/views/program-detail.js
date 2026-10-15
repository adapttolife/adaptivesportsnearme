import * as A from "../app.js";
export async function render(ctx) {
  const response = await fetch(`/api/programs/${encodeURIComponent(ctx.params.id)}`);
  if (response.status === 404) return { title: "Program not found · Adaptive Sports Near Me", html: `<section class="nf"><h1 tabindex="-1">We couldn't find that program</h1></section>` };
  if (!response.ok) throw new Error(`program ${response.status}`);
  const { program: p } = await response.json();
  const place = A.placeText(p);
  const organization = p.organization ? `<section class="pg-sec"><h2>Organization</h2><p>This program is run by <a href="/organizations/${A.esc(p.organization.id)}">${A.esc(p.organization.name)}</a>.</p></section>` : "";
  return { title: `${p.name} · Adaptive Sports Near Me`, description: `${p.name}${place ? ` in ${place}` : ""}.`, html: `<div class="pg-grid"><div class="pg-main"><div class="pg-head"><h1 tabindex="-1">${A.esc(p.name)}</h1><p class="pg-meta">${A.esc(p.sportLabel || "Adaptive sports")}${place ? ` · ${A.esc(place)}` : ""}</p></div>${p.website ? A.btn("Visit website", p.website, "ink", { external: true }) : ""}${p.desc ? `<section class="pg-sec"><h2>About this program</h2><p>${A.esc(p.desc)}</p></section>` : ""}${organization}</div></div>` };
}
