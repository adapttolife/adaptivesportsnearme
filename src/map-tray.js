// Apple-Maps-style pin tray: fat targets, a peek sheet that slides up
// from the bottom, and in-place swaps when the next pin is tapped.
// The homepage (public/index.html) mirrors this state machine on /maps.

import { locLine, photoPath } from "./program-page.js";

export const PIN_HIT_PX = 44;
export const TRAY_MS = 280;
export const SWIPE_DISMISS_PX = 56;

function esc(s) {
  return s == null ? "" : String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function createTrayState() {
  return { open: false, programId: null };
}

// Tap a pin. First tap opens; a different pin updates in place (no close).
export function selectPin(tray, programId) {
  if (!programId) return { open: false, programId: null, swapped: false };
  const swapped = !!(tray && tray.open && tray.programId && tray.programId !== programId);
  return { open: true, programId, swapped };
}

// Empty-map tap (or swipe / Escape) dismisses. Pin / cluster / tray / chrome do not.
export function dismissTray(tray, reason) {
  if (!tray || !tray.open) return { open: false, programId: null, dismissed: false, reason };
  return { open: false, programId: null, dismissed: true, reason };
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

// Peek CTA: Visit when there is a website, otherwise Open listing.
// Not the full listing-sheet primaryCta (Call / Email / View source).
export function trayAction(org) {
  if (org && org.website) {
    return { href: org.website, label: "Visit", external: true };
  }
  const id = org && org.id ? org.id : "";
  return { href: id ? `/programs/${id}` : "#", label: "Open listing", external: false };
}

export function trayPeekHtml(org) {
  const loc = locLine(org || {});
  const photo = photoPath(org && org.sport);
  const action = trayAction(org);
  const img = photo
    ? `<img class="tray-photo" src="${photo}" alt="">`
    : `<div class="tray-photo tray-photo-fallback" aria-hidden="true"></div>`;
  const target = action.external ? ' target="_blank" rel="noopener"' : "";
  const dataProg = action.external || !org || !org.id ? "" : ` data-prog="${esc(org.id)}"`;
  const sport = org && org.sportLabel
    ? `<div class="tray-sport">${esc(org.sportLabel)}</div>`
    : "";
  return `<div class="tray-handle" aria-hidden="true"></div>`
    + `<div class="tray-in">`
    + img
    + `<div class="tray-copy">`
    + `<div class="tray-name">${esc(org && org.name ? org.name : "")}</div>`
    + `<div class="tray-city">${esc(loc)}</div>`
    + sport
    + `<a class="tray-cta" href="${esc(action.href)}"${target}${dataProg}>${action.label}</a>`
    + `</div></div>`;
}
