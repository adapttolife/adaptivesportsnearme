/* Icon lab `#/lab`: every one of Alec's 47 images in every place the site shows
   it, each spot built at true phone size with the real CSS, then scaled down to
   fit. For eyes; the machine check (docs/design/2026-10-14/icon-audit.mjs) measures
   the same spots at 10 widths from 320 to 1440 px. */
import * as A from "../app.js";

const KEYS = () => window.ASNM_ICON_KEYS.slice().sort((a, b) => (a === "grant" || a === "event") - (b === "grant" || b === "event") || A.sportName(a).localeCompare(A.sportName(b)));
const label = (k) => k === "grant" ? "Grants" : k === "event" ? "Events" : A.sportName(k);
const cell = (k, stage, cls = "") => `<figure class="lab-cell ${cls}"><div class="lab-stage">${stage}</div><figcaption>${A.esc(label(k))}</figcaption></figure>`;

function heroBand(k) {
  const { t } = A.toneOf(k);
  return `<div class="lab-band" style="--t:${t}"><div class="lab-art">${A.fig(k, { color: t === "#1A1A1A" ? "#FFFFFF" : "#1A1A1A", big: true })}</div><div class="lab-lines"><i></i><i></i></div></div>`;
}
function listingHero(k) {
  return `<div class="lab-hero">${A.plate(k, { kind: "hero" })}<span class="lab-btn lab-btn--l"></span><span class="lab-btn lab-btn--r"></span><span class="lab-stamp">City, ST</span></div>`;
}

export async function render() {
  const keys = KEYS();
  const sec = (title, sub, cells, cls) => `<section class="sec lab-sec" aria-label="${A.esc(title)}">${A.sectionHead({ title, sub })}<div class="lab-grid ${cls}">${cells}</div></section>`;
  return {
    title: "Icon lab · Adaptive Sports Near Me",
    description: "Every icon in every spot.",
    html: `<div class="lab">
<h1 tabindex="-1">Every icon, every spot</h1>
<p class="lab-lede">All ${keys.length} images in each place the site shows them, built at true phone size and scaled down to fit. A machine check measured the same spots at 10 widths from 320 to 1440 px: 0 pixels cut off, and nothing runs under a headline, button or place stamp.</p>
${sec("Home hero", "The athlete stands on the line above the headline.", keys.map((k) => cell(k, heroBand(k), "is-band")).join(""), "is-2")}
${sec("Listing hero", "Clear of the back and share buttons and the place stamp.", keys.map((k) => cell(k, listingHero(k), "is-hero")).join(""), "is-2")}
${sec("Cards in rails", "Home and listing rails (4:3).", keys.map((k) => cell(k, A.plate(k, { kind: "card" }), "is-card")).join(""), "is-2")}
${sec("Cards in lists", "Results on a phone (16:9).", keys.map((k) => cell(k, A.plate(k, { kind: "card", wide: true }), "is-card")).join(""), "is-2")}
${sec("Tiles, rows and circles", "Sport grid, list rows, the sport bar and small circles.", keys.map((k) => cell(k, `<div class="lab-small">${A.plate(k, { kind: "tile", cls: "lab-tile" })}${A.plate(k, { kind: "row" })}${A.avatar(k, 56)}${A.avatar(k, 40)}</div>`, "is-small")).join(""), "is-1")}
</div>`,
  };
}

export function mount(root) {
  // Each stage is a true phone-size spot; scale it to the cell.
  const fit = () => root.querySelectorAll(".lab-stage").forEach((st) => {
    const inner = st.firstElementChild; if (!inner || st.closest(".is-small")) return;
    const s = st.clientWidth / inner.offsetWidth;
    st.style.setProperty("--s", String(s));
    st.style.height = inner.offsetHeight * s + "px";   // the stage keeps the spot's own shape
  });
  fit();
  const ro = new ResizeObserver(fit); ro.observe(root);
  return () => ro.disconnect();
}
