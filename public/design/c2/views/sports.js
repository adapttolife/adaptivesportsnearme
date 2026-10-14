/* Sports index `#/sports` (spec 6.4, WP-B).
   Two grids of picture groups (3.5) in popularity order: the sports listed so
   far, then the ones not listed yet. No numbers anywhere (5.4). A sibling that
   shares a listed group's picture but has no listing yet is named in the
   "Not listed yet" section as a text link, so each picture gets one tile per grid.
   PROMOTE: .v-sports .sx (sport tile: 72px avatar, label, "Also:" links). */
import * as A from "../app.js";

function tile(g) {
  const also = g.also.length
    ? `<p class="sx-also">Also: ${g.also.map((k) => `<a href="#/sports/${A.esc(k)}">${A.esc(A.sportName(k))}</a>`).join(", ")}</p>`
    : "";
  return `<li class="sx-item"><a class="sx" href="#/sports/${A.esc(g.key)}" style="--t:${A.toneOf(g.key).t}">${A.avatar(g.key, 72)}<span class="sx-name">${A.esc(A.sportName(g.key))}</span></a>${also}</li>`;
}

export async function render(ctx) {
  const D = ctx.data || await A.loadData();
  const n = (k) => D.countByKey[k] || 0;
  const listed = [], unlisted = [], unlistedSibs = [];
  for (const g of A.pictureGroups()) {
    const members = [g.key, ...g.also];
    const have = members.filter((k) => n(k) > 0), none = members.filter((k) => n(k) === 0);
    if (have.length) {
      listed.push({ key: have[0], also: have.slice(1) });
      unlistedSibs.push(...none);
    } else unlisted.push(g);
  }
  const sibLine = unlistedSibs.length
    ? `<p class="sx-sibs">Also not listed yet: ${unlistedSibs.map((k) => `<a href="#/sports/${A.esc(k)}">${A.esc(A.sportName(k))}</a>`).join(", ")}</p>`
    : "";
  const html = `<header class="sx-head"><h1 tabindex="-1">Sports</h1><p class="sx-sub">Pick a sport to see programs, grants and events.</p></header>
<section class="sx-sec" aria-labelledby="sx-listed"><h2 id="sx-listed">Listed so far</h2><ul class="sx-grid">${listed.map(tile).join("")}</ul></section>
<section class="sx-sec sx-sec--none" aria-labelledby="sx-none"><h2 id="sx-none">Not listed yet</h2><p class="sx-secsub">Know a program? Add it and we'll check it.</p>${unlisted.length ? `<ul class="sx-grid">${unlisted.map(tile).join("")}</ul>` : ""}${sibLine}<div class="btns">${A.btn("Add a program", "#/add/program", "ink", { icon: "plus" })}</div></section>`;
  return {
    title: "Sports · Adaptive Sports Near Me",
    description: "Adaptive sports by sport: pick one to see programs, grants and events.",
    html,
    railActive: "sports",
  };
}

export function mount() {
  return () => {};
}
