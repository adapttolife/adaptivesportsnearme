/* Veteran-owned businesses `#/resources/veteran-owned-businesses`.
   Karen Atkinson's page (her Oct 8, 2026 email, "Page to link state directories"):
   her words, her links (checked Oct 13), the same data as production's
   src/resources/veteran-businesses.js, exported to data/veteran-businesses.json. */
import * as A from "../app.js";

let DATA = null;
async function data() {
  DATA = DATA || await fetch("/design/c2/data/veteran-businesses.json").then((r) => r.json());
  return DATA;
}

export async function render() {
  const d = await data(), c = d.copy;
  const ext = (href, label) => `<a class="vb-link" href="${A.esc(href)}" target="_blank" rel="noopener">${A.esc(label)}${A.icon("external-link", 18)}</a>`;
  const nation = d.nationwide.map((n) => `<li class="vb-card"><h3>${A.esc(n.name)}</h3><p>${A.esc(n.note)}</p>${ext(n.url, "Open the directory")}</li>`).join("");
  const states = d.states.map((s) => `<li class="vb-st" id="vb-${A.esc(s.code)}"><h3>${A.esc(s.name)}</h3>
${s.official ? ext(s.official.url, s.official.name) : `<p class="vb-nv">${A.esc(c.notVerified)}</p>`}
${ext(s.national.url, s.national.name)}</li>`).join("");
  const opts = d.states.map((s) => `<option value="vb-${A.esc(s.code)}">${A.esc(s.name)}</option>`).join("");
  return {
    title: `${c.title} · Adaptive Sports Near Me`,
    description: c.intro[1],
    html: `<div class="vb">
<header class="vb-hero">${A.fig("veteran-meetup", { color: "#FFFFFF", big: true, cls: "vb-fig" })}<h1 tabindex="-1">${A.esc(c.title)}</h1><p class="vb-kicker">${A.esc(c.kicker)}</p></header>
<div class="vb-intro">${c.intro.map((t) => `<p>${A.esc(t)}</p>`).join("")}</div>
<section class="sec" aria-labelledby="vb-n">${A.sectionHead({ title: "Nationwide", id: "vb-n" })}<ul class="vb-cards">${nation}</ul></section>
<section class="sec" aria-labelledby="vb-s">${A.sectionHead({ title: "By state", id: "vb-s", sub: c.stateLead })}
<form class="vb-pick" data-vb-pick><label for="vb-sel">Choose your state</label><div class="vb-row"><select id="vb-sel" class="input">${opts}</select><button class="btn btn--ink" type="submit">Go</button></div></form>
<ul class="vb-states">${states}</ul></section>
<p class="vb-fine">${A.esc(c.scope)}</p><p class="vb-fine">${A.esc(c.disclaimer)}</p>
<p class="vb-back"><a class="tlink" href="#/sports/veteran-meetup">${A.icon("arrow-left", 18)}Veteran meetups near you</a></p>
</div>`,
    railActive: "resources",
  };
}

export function mount(root) {
  const f = root.querySelector("[data-vb-pick]");
  const go = (e) => { e.preventDefault(); const el = root.querySelector("#" + root.querySelector("#vb-sel").value); if (el) { el.scrollIntoView({ block: "start" }); el.querySelector("a")?.focus({ preventScroll: true }); } };
  if (f) f.addEventListener("submit", go);
  return () => f && f.removeEventListener("submit", go);
}
