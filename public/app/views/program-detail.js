import * as A from "../app.js";

const place = (p) => A.placeText(p);
const host = (url) => { try { return new URL(url).hostname.replace(/^www\./i, ""); } catch (_) { return null; } };

function hero(p) {
  const label = place(p);
  const stamp = label ? `<div class="pg-stamp"><span class="pg-stamp-map">${p.state ? A.stateOutline(p.state, { size: 40, fill: !p.city }) : A.icon("map-pin", 24)}</span><span class="pg-stamp-text"><span>${A.esc(label)}</span></span></div>` : "";
  return `<div class="pg-hero${stamp ? " has-stamp" : ""}">${A.plate(p.sport || "multi", { kind: "hero" })}<button type="button" class="pg-hb pg-back" data-back="/programs" aria-label="Back">${A.icon("arrow-left", 22)}</button><div class="pg-edge">${stamp}</div></div>`;
}
function visit(p, { full = false } = {}) { return p.website ? A.btn("Visit website", p.website, "ink", { external: true, cls: full ? "pg-full" : "" }) : ""; }
function actions(p) { const site = host(p.website); return p.website ? `<div class="pg-acts">${visit(p, { full: true })}${site ? `<p class="pg-host">Opens ${A.esc(site)}</p>` : ""}</div>` : ""; }
function about(p) { return `<section class="pg-sec"><h2>About this program</h2>${p.desc ? `<p>${A.esc(p.desc)}</p>` : `<p class="pg-quiet">We don't have a description for this program yet.${p.website ? " Its website has the details." : ""}</p>`}</section>`; }
function facts(p) { const rows = [["Ages", p.ages], ["Cost", p.cost], ["Equipment", p.equipment]].filter(([, value]) => value != null && String(value).trim()); return rows.length ? `<dl class="pg-facts">${rows.map(([label, value]) => `<div><dt>${A.esc(label)}</dt><dd>${A.esc(String(value).trim())}</dd></div>`).join("")}</dl>` : ""; }
function organization(p) { if (!p.organization) return ""; const detail = [p.organization.city, p.organization.state].filter(Boolean).join(", "); return `<section class="pg-sec"><h2>Organization</h2><p>This program is run by <a href="/organizations/${A.esc(p.organization.id)}">${A.esc(p.organization.name)}</a>${detail ? ` in ${A.esc(detail)}` : ""}.</p></section>`; }
function where(p) { const label = place(p); return label ? `<section class="pg-sec"><h2>Where you'll play</h2><p>${A.esc(label)}. We show the city only, so check the website for the exact place.</p>${p.city && p.state ? `<a class="tlink" href="/near/${encodeURIComponent(label)}">Programs near ${A.esc(label)}${A.icon("arrow-right", 18)}</a>` : ""}</section>` : ""; }
function booking(p) { const site = host(p.website); return p.website ? `<div class="pg-book"><div class="pg-book-in"><p class="pg-book-kind">${A.esc(p.sportLabel || "Adaptive sports")}${place(p) ? ` · ${A.esc(place(p))}` : ""}</p>${visit(p, { full: true })}${site ? `<p class="pg-host">Opens ${A.esc(site)}</p>` : ""}</div></div>` : ""; }

export async function render(ctx) {
  const response = await fetch(`/api/programs/${encodeURIComponent(ctx.params.id)}`);
  if (response.status === 404) return { title: "Program not found · Adaptive Sports Near Me", html: `<section class="pg-nf"><h1 tabindex="-1">We couldn't find that program</h1><p>It may have been removed or merged with another listing.</p></section>` };
  if (!response.ok) throw new Error(`program ${response.status}`);
  const { program: p } = await response.json();
  const location = place(p);
  const main = `<div class="pg-grid"><div class="pg-main">${hero(p)}<div class="pg-head"><h1 tabindex="-1">${A.esc(p.name)}</h1><p class="pg-meta">${A.esc(p.sportLabel || "Adaptive sports")}${location ? ` · ${A.esc(location)}` : ""}</p></div>${actions(p)}${about(p)}${facts(p)}${organization(p)}${where(p)}</div>${booking(p)}</div>`;
  return { title: `${p.name} · Adaptive Sports Near Me`, description: `${p.name}${location ? ` in ${location}` : ""}.`, html: main, sticky: p.website ? A.stickyBar({ action: { label: "Visit website", href: p.website, kind: "ink", external: true } }) : "" };
}