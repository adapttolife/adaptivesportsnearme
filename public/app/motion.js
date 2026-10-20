/* The sport figures in motion. Every figure on the site is a CSS mask of Alec's
   drawing (fig() in app.js). This upgrades a figure in place to the same drawing as
   inline SVG, made of the drawing's own shapes, and plays its sport's move: a short
   move, then rest. At rest the figure is exactly the drawing, so the swap is invisible.

   Big figures (the home banner, sport tiles, page banners, heroes) play once when they
   come into view and again on hover. Figures in lists (cards, rows, avatars) play only
   on hover, so a list never moves by itself. Nothing moves, and no motion data loads,
   for anyone who asks for reduced motion or for less data.

   Data: /emblems/motion/<drawing>.json, built from scripts/motion/specs by
   scripts/motion/build.py; motion-index.js maps each sport key to its file. */
import { MOTION } from "./motion-index.js";

const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const canHover = matchMedia("(hover: hover) and (pointer: fine)");
const LIST = ".pcard, .prow, .gcard, .av, .fm-tile, .empty";   // these play on hover only
const DATA = new Map();      // file -> Promise<data>
const LIVE = new WeakMap();  // fig element -> { svg, data, anims, run }
let uid = 0, io = null, heroWatch = null, added = null;

const forced = matchMedia("(forced-colors: active)");
const off = () => reduce.matches || forced.matches || !!(navigator.connection && navigator.connection.saveData);
const keyOf = (fig) => (/\/emblems\/sports\/([a-z-]+)\.svg/.exec(fig.getAttribute("style") || "") || [])[1];

function load(key) {
  const file = MOTION[key];
  if (!file) return null;
  if (!DATA.has(file)) DATA.set(file, fetch("/emblems/motion/" + file).then((r) => (r.ok ? r.json() : null)).catch(() => null));
  return DATA.get(file);
}

/** Make the figure live: the drawing as inline SVG in the mask's exact square. */
async function upgrade(fig) {
  if (LIVE.has(fig)) return LIVE.get(fig);
  const data = await load(keyOf(fig));
  if (!data || LIVE.has(fig) || !fig.isConnected) return LIVE.get(fig) || null;
  const p = "mv" + ++uid + "-";
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 512 512");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.innerHTML = data.svg.replace(/@c/g, p + "c");
  data.m.forEach(([o], i) => {
    const g = svg.querySelector(`[data-m="${i}"]`);
    if (g && o) { g.style.transformBox = "view-box"; g.style.transformOrigin = `${o[0]}px ${o[1]}px`; }
  });
  fig.appendChild(svg);
  fig.classList.add("fig--live");
  const live = { svg, data, anims: [], run: 0 };
  LIVE.set(fig, live);
  return live;
}

const EASE = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function bendAt(keys, f, lin) {
  for (let i = 1; i < keys.length; i++) if (f <= keys[i][0]) {
    const a = keys[i - 1], b = keys[i], t = (f - a[0]) / (b[0] - a[0] || 1), u = lin ? t : EASE(t);
    return [1, 2, 3].map((j) => (a[j] || 0) + ((b[j] || 0) - (a[j] || 0)) * u);
  }
  return [0, 0, 0];
}
function bendD(rig, [deg, sx, sy]) {
  const [px, py] = rig.pivot, P = rig.pts, W = rig.w, out = [];
  const pt = (i) => {
    const a = (deg * W[i] * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), dx = P[i][0] - px, dy = P[i][1] - py;
    return (px + c * dx - s * dy + W[i] * sx).toFixed(2) + " " + (py + s * dx + c * dy + W[i] * sy).toFixed(2);
  };
  out.push("M" + pt(0));
  let k = 1;
  for (const s of rig.segs) { if (s === "C") { out.push("C" + pt(k) + " " + pt(k + 1) + " " + pt(k + 2)); k += 3; } else { out.push("L" + pt(k)); k += 1; } }
  return out.join("") + "Z";
}

/** Play the figure's move once from the start. A move already playing finishes first. */
export async function play(fig) {
  if (off() || !fig) return;
  const live = await upgrade(fig);
  if (!live || live.playing) return;
  live.playing = true;
  const { svg, data } = live;
  live.anims.forEach((a) => a.cancel());
  live.anims = [];
  const run = ++live.run;
  let end = data.dur;
  data.m.forEach(([, delay, frames], i) => {
    const g = svg.querySelector(`[data-m="${i}"]`);
    if (!g) return;
    const kf = frames.map(([offset, transform, opacity, easing]) => {
      const f = { offset, transform };
      if (opacity != null) f.opacity = opacity;
      if (easing) f.easing = easing;
      return f;
    });
    live.anims.push(g.animate(kf, { duration: data.dur, delay, fill: "both" }));
    end = Math.max(end, data.dur + delay);
  });
  const bends = data.b.map(([rig, keys, lin], i) => [svg.querySelector(`[data-b="${i}"]`), rig, keys, lin]).filter(([el]) => el);
  bends.forEach((b) => { if (!b[0].__rest) b[0].__rest = b[0].getAttribute("d"); });
  const t0 = performance.now();
  const step = (now) => {
    if (live.run !== run) return;
    const t = now - t0, f = Math.min(1, t / data.dur);
    for (const [el, rig, keys, lin] of bends) el.setAttribute("d", f < 1 ? bendD(rig, bendAt(keys, f, lin)) : el.__rest);
    if (t < end) requestAnimationFrame(step);
    else { live.anims.forEach((a) => a.cancel()); live.anims = []; live.playing = false; }   // back to rest: the drawing
  };
  requestAnimationFrame(step);
}

/** Watch a freshly rendered view: big figures play when seen, all play on hover. */
export function attach(roots) {
  roots = [].concat(roots).filter(Boolean);
  if (off() || !roots.length || !("IntersectionObserver" in window)) return;
  if (io) io.disconnect();                     // the last view's figures are gone
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const hb = e.target.closest(".hb-fig");
      if (hb && !hb.classList.contains("is-on")) continue;   // a hidden banner figure waits its turn
      io.unobserve(e.target);
      play(e.target);
    }
  }, { threshold: 0.6 });
  const watch = (fig) => {
    if (!keyOf(fig) || fig.__motion) return;
    fig.__motion = true;
    if (!fig.closest(LIST)) io.observe(fig);
    const host = fig.closest("a, button") || fig.closest(".hb, .plate, .ch-banner") || fig;   // the whole card or tile
    if (!host.__motionHover) {
      host.__motionHover = true;
      host.addEventListener("pointerenter", () => { if (canHover.matches) host.querySelectorAll(".fig").forEach((f) => { if (!f.closest(".hb-fig:not(.is-on)")) play(f); }); });
    }
  };
  for (const r of roots) r.querySelectorAll(".fig").forEach(watch);
  // Lists that fill in later (more results, a filter, a "Show all") bring new figures.
  if (added) added.disconnect();
  added = new MutationObserver((list) => {
    for (const m of list) for (const n of m.addedNodes) if (n.nodeType === 1) { if (n.matches(".fig")) watch(n); n.querySelectorAll(".fig").forEach(watch); }
  });
  for (const r of roots) added.observe(r, { childList: true, subtree: true });
  // The home banner swaps its athlete (every few seconds, or on a sport tile's hover):
  // the athlete coming on plays its move. Its first three neighbours load ahead.
  const hb = roots.map((r) => r.querySelector(".hb")).find(Boolean);
  if (hb) {
    if (heroWatch) heroWatch.disconnect();
    heroWatch = new MutationObserver((list) => {
      for (const m of list) if (m.target.classList.contains("is-on") && !m.oldValue?.includes("is-on")) play(m.target.querySelector(".fig"));
    });
    for (const s of hb.querySelectorAll(".hb-fig")) heroWatch.observe(s, { attributes: true, attributeFilter: ["class"], attributeOldValue: true });
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1200));
    idle(() => [...hb.querySelectorAll(".hb-fig .fig")].slice(0, 4).forEach((f) => load(keyOf(f))));
  }
}
