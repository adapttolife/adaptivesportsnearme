/* States index `/states` (spec 6.6, WP-B).
   The tile map (listings per state; a per-state count, never a national total)
   and the "Choose a state" list, always open here, then the letter. */
import * as A from "../app.js";
import { site, PAGES } from "../page-meta.js";

export async function render(ctx) {
  const D = ctx.data || (await A.loadData());
  const counts = Object.fromEntries(
    Object.entries(D.byState).map(([st, list]) => [st, list.length]),
  );
  const html = `<div class="st-head"><h1 tabindex="-1">Browse by state</h1><p class="st-sub">Pick a state to see its programs, city by city.</p></div>
<section class="st-map" aria-label="States">${A.tileMap({ counts, list: "open" }).replace(/<h3 class="slist-title">([^<]*)<\/h3>/, '<h2 class="slist-title">$1</h2>')}</section>
${A.letterBlock({ source: "states" })}`;
  return {
    title: site(PAGES.states.title),
    description: PAGES.states.description,
    html,
    railActive: "states",
  };
}

export function mount() {
  return () => {};
}
