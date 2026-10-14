/* Grants list `/grants` (spec 6.9, WP-F).
   PROMOTE: .v-grants .gband (Sand page band with a 120px figure tile; events
   uses the same shape as .v-events .eband) and .v-grants .seg (segmented
   filter links, 48px, aria-current). Both could become shared components. */
import * as A from "../app.js";

const AUD = [
  ["athlete", "For athletes"],
  ["program", "For programs"],
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

  const html = `<header class="gband">
  <div class="gb-text"><h1 tabindex="-1">Grants</h1><p>Money for adaptive sports from the groups that give it. You apply on their site.</p></div>
  <div class="gb-art">${A.plate("grant", { kind: "tile" })}</div>
</header>
${seg}
<section class="g-sec g-open" aria-labelledby="g-open">${A.sectionHead({ title: "Open now", id: "g-open" })}${openHtml}</section>
${shutHtml}
${A.letterBlock({ source: "grants" })}`;

  return {
    title: "Grants for adaptive sports · Adaptive Sports Near Me",
    description: "Money for adaptive sports from the groups that give it: equipment, travel, fees and program support. You apply on their site.",
    html,
    aside: A.aboutBox(),
    railActive: "grants",
  };
}

export function mount() {
  return () => {};
}
