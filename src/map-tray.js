// Phone: Google-Maps two-height bottom tray — peek (~35%) and expanded (~90%).
// Desktop (≥721px): Google Maps WEB left column — full height, 420px, same listing
// HTML. Not a floating peek card. The homepage (public/index.html) mirrors this
// state machine on /maps.

import { locLine, listingInnerHtml } from "./program-page.js";

export const PIN_HIT_PX = 44;
export const TRAY_MS = 280;
export const SWIPE_DISMISS_PX = 56;
export const PEEK_VH = 35;
export const EXPANDED_VH = 90;
export const DESKTOP_MIN_PX = 721;
export const DESKTOP_PANEL_WIDTH_PX = 420;
export const DESKTOP_PANEL_INSET_PX = 24;
export const DESKTOP_PANEL_CLASS = "panel";

export function trayChrome(viewportW) {
  return Number(viewportW) >= DESKTOP_MIN_PX ? "panel" : "sheet";
}

function esc(s) {
  return s == null ? "" : String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function createTrayState() {
  return { open: false, programId: null, height: "peek" };
}

// Tap a pin. First tap opens at peek. A different pin updates in place
// and keeps the current height (stay expanded if already expanded).
export function selectPin(tray, programId) {
  if (!programId) return { open: false, programId: null, height: "peek", swapped: false };
  const swapped = !!(tray && tray.open && tray.programId && tray.programId !== programId);
  const height = tray && tray.open && tray.height === "expanded" ? "expanded" : "peek";
  return { open: true, programId, height, swapped };
}

export function setTrayHeight(tray, height) {
  if (!tray || !tray.open) return { open: false, programId: null, height: "peek" };
  const next = height === "expanded" ? "expanded" : "peek";
  return { open: true, programId: tray.programId, height: next };
}

// Empty-map tap (or swipe-from-peek / Escape) dismisses.
export function dismissTray(tray, reason) {
  if (!tray || !tray.open) return { open: false, programId: null, height: "peek", dismissed: false, reason };
  return { open: false, programId: null, height: "peek", dismissed: true, reason };
}

export function mapClickAction(hitKind) {
  if (hitKind === "pin") return "select";
  if (hitKind === "cluster") return "cluster";
  if (hitKind === "empty") return "dismiss";
  return "ignore";
}

export function classifyHit(classNames) {
  const list = Array.isArray(classNames)
    ? classNames
    : String(classNames || "").split(/\s+/).filter(Boolean);
  const s = new Set(list);
  if ([...s].some((c) => c === "map-tray" || c.startsWith("tray-"))) return "tray";
  if (s.has("mdot") || s.has("mpin") || s.has("mdot-mark") || s.has("mpin-mark")) return "pin";
  if (s.has("mpill") || s.has("mc")) return "cluster";
  if (
    s.has("maplibregl-ctrl") ||
    s.has("mapx-close") ||
    s.has("mapx-open") ||
    s.has("mapx-drawer") ||
    s.has("mapchip")
  ) return "control";
  return "empty";
}

export function swipeDismisses(dy) {
  return Number(dy) >= SWIPE_DISMISS_PX;
}

// Snap between peek / expanded / closed from a drag.
// dy > 0 is finger moving down. Midpoint is halfway between the two heights.
export function snapHeight(current, dy, viewportH) {
  const h = Number(viewportH) || 0;
  const peek = h * (PEEK_VH / 100);
  const exp = h * (EXPANDED_VH / 100);
  const mid = (exp - peek) / 2;
  const delta = Number(dy) || 0;
  if (current === "peek") {
    if (delta >= SWIPE_DISMISS_PX) return "closed";
    if (-delta >= mid) return "expanded";
    return "peek";
  }
  if (delta >= mid) return "peek";
  return "expanded";
}

export function trayMetaLine(org) {
  const loc = locLine(org || {});
  const sport = org && org.sportLabel ? String(org.sportLabel) : "";
  if (loc && sport) return `${loc} · ${sport}`;
  return loc || sport || "";
}

// Peek CTA: Visit when there is a website, otherwise Open listing.
export function trayAction(org) {
  if (org && org.website) {
    return { href: org.website, label: "Visit", external: true };
  }
  const id = org && org.id ? org.id : "";
  return { href: id ? `/programs/${id}` : "#", label: "Open listing", external: false };
}

// 1–3 action pills: Visit (or Open listing) + Call + Email when we have them.
export function trayPills(org) {
  const pills = [trayAction(org)];
  const phone = org && org.phone && String(org.phone).trim();
  if (phone) {
    pills.push({ href: `tel:${phone.replace(/[^\d+]/g, "")}`, label: "Call", external: false });
  }
  if (org && org.email) {
    pills.push({ href: `mailto:${org.email}`, label: "Email", external: false });
  }
  return pills;
}

function pillHtml(action, org, primary) {
  const target = action.external ? ' target="_blank" rel="noopener"' : "";
  const dataProg = action.external || !org || !org.id || action.label === "Call" || action.label === "Email"
    ? ""
    : ` data-prog="${esc(org.id)}"`;
  const cls = primary ? "tray-pill primary" : "tray-pill";
  return `<a class="${cls}" href="${esc(action.href)}"${target}${dataProg}>${action.label}</a>`;
}

export function trayPeekHtml(org) {
  const pills = trayPills(org);
  const pillRow = pills.map((a, i) => pillHtml(a, org, i === 0)).join("");
  return `<div class="tray-handle-hit"><div class="tray-handle" aria-hidden="true"></div>`
    + `<button class="tray-x" type="button" aria-label="Close"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>`
    + `<div class="tray-peek">`
    + `<div class="tray-name">${esc(org && org.name ? org.name : "")}</div>`
    + `<div class="tray-meta">${esc(trayMetaLine(org))}</div>`
    + `<div class="tray-pills">${pillRow}</div>`
    + `</div>`;
}

export function trayExpandedHtml(org, nearby = []) {
  return listingInnerHtml(org || {}, { nearby });
}

export function trayHtml(org, nearby = []) {
  return trayPeekHtml(org)
    + `<div class="tray-full sheet">${trayExpandedHtml(org, nearby)}</div>`;
}
