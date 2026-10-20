/* Grants list `/grants` (spec 6.9, WP-F).
   PROMOTE: .v-grants .gband (Sand page band with a 120px figure tile; events
   uses the same shape as .v-events .eband) and .v-grants .seg (segmented
   filter links, 48px, aria-current). Both could become shared components. */
import * as A from "../app.js";
import { site, PAGES } from "../page-meta.js";

const AUD = [
  ["athlete", "For athletes"],
  ["program", "For organizations"],
  ["all", "All grants"],
];

/** Open now order: a real amount first, then any deadline text, then A to Z. */
function openOrder(a, b) {
  const ia = A.grantInfo(a), ib = A.grantInfo(b);
  return (!!ib.amount - !!ia.amount) || (!!b.deadline - !!a.deadline) || a.name.localeCompare(b.name);
}

export async function render(ctx) {
  const D = ctx.data;
  const a = ["athlete", "program", "all"].includes(ctx.query.a) ? ctx.query.a : "athlete";
  const one = a !== "all" ? " is-one" : "";
  const pool = D.grants.filter((g) => a === "all" || g.audience === a);
  const open = pool.filter((g) => A.grantInfo(g).open).sort(openOrder);
  const shut = pool.filter((g) => !A.grantInfo(g).open).sort((x, y) => x.name.localeCompare(y.name));

  const seg = `<nav class="seg" aria-label="Who the grant is for">${AUD.map(([k, label]) => {
    const href = k === "athlete" ? "/grants" : "/grants?a=" + k;
    const cur = k === a;
    return `<a href="${href}" data-replace${cur ? ' aria-current="page"' : ""}>${cur ? A.icon("check", 18) : ""}<span>${label}</span></a>`;
  }).join("")}</nav>`;

  const openHtml = open.length
    ? `<div class="glist${one}">${open.map(A.grantRow).join("")}</div>`
    : `<p class="g-none">Nothing is open for this group right now. Check the list below for the next round.</p>`;

  const shutHtml = shut.length
    ? `<section class="sec g-sec" aria-labelledby="g-past">${A.sectionHead({ title: "Past deadlines and closed for now", sub: "Check their site for the next round.", id: "g-past" })}<div class="glist${one}">${shut.map(A.grantRow).join("")}</div></section>`
    : "";

  const html = `<div class="gband">
  <div class="gb-text"><h1 tabindex="-1">Grants</h1><p>Money for gear, travel and fees, from the groups that give it. You apply on their site.</p></div>
  <div class="gb-art">${A.plate("grant", { kind: "tile" })}</div>
</div>
${seg}
<section class="g-sec g-open" aria-labelledby="g-open">${A.sectionHead({ title: "Open now", id: "g-open" })}${openHtml}</section>
${shutHtml}
${A.letterBlock({ source: "grants" })}`;

  return {
    title: site(PAGES.grants.title),
    description: PAGES.grants.description,
    html,
    aside: A.aboutBox(),
    railActive: "grants",
  };
}

export function mount(root) {
  const seg = root.querySelector(".seg");
  let timer = 0;
  const move = (event) => {
    const link = event.target.closest(".seg a");
    if (!link || !seg.contains(link) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const links = [...seg.querySelectorAll("a")];
    const next = links.indexOf(link);
    if (link.getAttribute("aria-current") === "page") { A.nav(link.href, { replace: true }); return; }
    if (timer) clearTimeout(timer);
    seg.style.setProperty("--seg-pos", next);
    links.forEach((item) => item.toggleAttribute("aria-current", item === link));
    const delay = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 240;
    timer = window.setTimeout(() => A.nav(link.href, { replace: true }), delay);
  };
  if (seg) seg.addEventListener("click", move);
  return () => { if (timer) clearTimeout(timer); if (seg) seg.removeEventListener("click", move); };
}
