import * as A from "../app.js";
import { site, programMeta } from "../page-meta.js";
import { seasonsText } from "../yearly.js";
import { factsStrip, freshness } from "../listing-facts.js";

const place = (p) => A.placeText(p);
const host = (url) => { try { return new URL(url).hostname.replace(/^www\./i, ""); } catch (_) { return null; } };

// Back with no history goes where the program is: its city, else its state, else all sports.
const backTo = (p) => (p.city && p.state ? "/near/" + encodeURIComponent(place(p)) : p.state ? "/states/" + p.state : "/sports");
function hero(p) {
  const label = place(p);
  const stamp = label ? `<div class="pg-stamp"><span class="pg-stamp-map">${p.state ? A.stateOutline(p.state, { size: 40, fill: !p.city }) : A.icon("map-pin", 24)}</span><span class="pg-stamp-text"><span>${A.esc(label)}</span></span></div>` : "";
  return `<div class="pg-hero${stamp ? " has-stamp" : ""}">${A.plate(p.sport || "multi", { kind: "hero" })}<button type="button" class="pg-hb pg-back" data-back="${A.esc(backTo(p))}" aria-label="Back">${A.icon("arrow-left", 22)}</button><div class="pg-edge">${stamp}</div></div>`;
}
function visit(p, { full = false } = {}) { return p.website ? A.btn("Visit website", p.website, "ink", { external: true, cls: full ? "pg-full" : "" }) : ""; }
const fixHref = (p) => `/update/${p.id}?fix=1`;
const wrong = (p, cls = "") => A.btn("Something's wrong?", fixHref(p), "line", { cls: "pg-wrong" + (cls ? " " + cls : "") });
/* Visit website, and beside it "Something's wrong?" (docs/specs/community-kept-directory.md). */
function actions(p) { const site = host(p.website); return `<div class="pg-acts"><div class="pg-act-row">${visit(p, { full: true })}${wrong(p, p.website ? "" : "pg-full")}</div>${site ? `<p class="pg-host">Opens ${A.esc(site)}</p>` : ""}</div>`; }
function about(p) { return `<section class="pg-sec"><h2>About this program</h2>${p.desc ? `<p>${A.esc(p.desc)}</p>` : `<p class="pg-quiet">We don't have a description for this program yet.${p.website ? " Its website has the details." : ""}</p>`}</section>`; }
/** "Runs in winter", "Runs in summer and fall", "Runs year-round"; "" when it hasn't said. */
export function runsText(p) {
  const list = Array.isArray(p.seasons) && p.seasons[0] ? p.seasons[0].seasons : [];
  const t = seasonsText(list);
  if (!t) return "";
  return t === "Year-round" ? "Runs year-round" : `Runs in ${t.toLowerCase()}`;
}
/* The facts strip: When (or "Off season · back in winter"), Cost, Ages, Who it's for, Equipment. */
function facts(p, now) { return factsStrip(p, now, A.esc); }
function organization(p) { if (!p.organization) return ""; const detail = [p.organization.city, p.organization.state].filter(Boolean).join(", "); return `<section class="pg-sec"><h2>Organization</h2><p>This program is run by <a href="/organizations/${A.esc(p.organization.id)}">${A.esc(p.organization.name)}</a>${detail ? ` in ${A.esc(detail)}` : ""}.</p></section>`; }
/* The same trust line and fix link as an organization's page. */
function fresh(p) { const f = freshness(p); return f ? `<p class="pg-fresh num"><span>${A.esc(f)}</span></p>` : ""; }
function where(p) {
  const label = place(p);
  const canMap = p.addressPublicityConsent && (p.address || (Number.isFinite(p.lat) && Number.isFinite(p.lng)));
  if (!label && !canMap) return "";
  const address = [p.address, p.city, p.state, p.zip, p.country].filter(Boolean).join(", ");
  const map = canMap ? `<div class="pg-map" data-location-map data-lat="${A.esc(p.lat)}" data-lng="${A.esc(p.lng)}" data-address="${A.esc(address)}" aria-label="Map showing ${A.esc(p.name)}"></div>` : "";
  const stateZip = [p.stateName || p.state, p.zip].filter(Boolean).join(" ");
  const location = [p.city, stateZip].filter(Boolean).join(", ");
  const fullAddress = [p.address, location, p.country].filter(Boolean).join(", ");
  return `<section class="pg-sec"><h2>Where you'll play</h2>${p.address ? `<p>${A.esc(fullAddress)}.</p>` : label ? `<p>${A.esc(label)}. We show the city only, so check the website for the exact place.</p>` : ""}${p.city && p.state ? `<a class="tlink" href="/near/${encodeURIComponent(label)}">Programs near ${A.esc(label)}${A.icon("arrow-right", 18)}</a>` : ""}${map}</section>`;
}
function booking(p) { const site = host(p.website); return p.website ? `<div class="pg-book"><div class="pg-book-in"><p class="pg-book-kind">${A.esc(p.sportLabel || "Adaptive sports")}${place(p) ? ` · ${A.esc(place(p))}` : ""}</p>${visit(p, { full: true })}${site ? `<p class="pg-host">Opens ${A.esc(site)}</p>` : ""}${wrong(p, "pg-full")}</div></div>` : ""; }

export async function render(ctx) {
  // A 404 is an answer. A dropped request or a server error is asked once more, then the page
  // says it could not load (loadFailed), never that the program is gone.
  const response = await A.retryOnce(async () => {
    const r = await A.early(`/api/programs/${encodeURIComponent(ctx.params.id)}`);
    if (!r.ok && r.status !== 404) throw new Error(`program ${r.status}`);
    return r;
  }).catch((e) => { throw Object.assign(new Error(String(e && e.message || e)), { loadFailed: true }); });
  if (response.status === 404) return { title: site("Program not found"), html: `<section class="pg-nf"><h1 tabindex="-1">We couldn't find that program</h1><p>It may have been removed or merged with another listing.</p></section>` };
  const { program: p } = await response.json();
  // A yearly event is a program underneath; its page is the yearly event page.
  if (p && p.kind === "event" && p.slug) {
    A.nav(`/events/${encodeURIComponent(p.slug)}`, { replace: true });
    return { title: site(p.name), html: "" };
  }
  const location = place(p);
  const now = ctx.now || new Date();
  const main = `<div class="pg-grid"><div class="pg-main">${hero(p)}<div class="pg-head"><h1 tabindex="-1">${A.esc(p.name)}</h1><p class="pg-meta">${A.esc(p.sportLabel || "Adaptive sports")}${location ? ` · ${A.esc(location)}` : ""}</p>${fresh(p)}</div>${actions(p)}${facts(p, now)}${about(p)}${organization(p)}${where(p)}</div>${booking(p)}</div>`;
  return { ...programMeta({ name: p.name, sport: p.sportLabel || "Adaptive sports", place: location }), html: main, sticky: p.website ? A.stickyBar({ action: { label: "Visit website", href: p.website, kind: "ink", external: true } }) : "" };
}

export function mount(root) {
  let removeMaps = () => {};
  let disposed = false;
  if (root.querySelector("[data-location-map]")) import("./map.js").then((maps) => maps.mountLocationMaps(root)).then((remove) => { if (disposed) remove(); else removeMaps = remove; }).catch(() => {});
  return () => { disposed = true; removeMaps(); };
}
