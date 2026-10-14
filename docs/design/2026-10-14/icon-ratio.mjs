// Visual-size consistency: in each spot, how close each icon gets to the spot's optical
// target (A x host height, density-corrected). 1.00 = on target; lower = held back by a cap.
import { createRequire } from "module";
const require = createRequire("/srv/alec-version-2/node_modules/");
const { chromium } = require("playwright");
const base = process.argv[2], W = Number(process.argv[3] || 390);
const SPOTS = [
  { name: "home hero", route: "#/", sel: ".hb-fig.is-on", opts: { color: "#1A1A1A", big: true, cls: "fig--pin fig--mid" } },
  { name: "home door", route: "#/", sel: ".door-fig", opts: { big: true } },
  { name: "sport tile", route: "#/", sel: ".st .plate", opts: {} },
  { name: "card (rail)", route: "#/", sel: ".pcard .plate--card", opts: {} },
  { name: "card (list)", route: "#/near/Tampa%2C%20FL", sel: ".cards:not(.is-rail) .pcard .plate--card", opts: {} },
  { name: "row", route: "#/near/Tampa%2C%20FL", sel: ".prow .plate--row", opts: {} },
  { name: "bar avatar", route: "#/near/Tampa%2C%20FL", sel: ".sb-link .av:not(.av--all)", opts: {} },
  { name: "listing hero", route: "#/programs/e29002d5-c892-5753-a6bd-d381220d9d51", sel: ".pg-hero .plate--hero", opts: { big: true } },
  { name: "sport banner", route: "#/sports/tennis", sel: ".ch-banner--sport", opts: { big: true } },
];
const b = await chromium.launch({ executablePath: process.env.HOME + "/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const ctx = await b.newContext({ viewport: { width: W, height: 844 }, isMobile: W < 1000, reducedMotion: "reduce" });
const p = await ctx.newPage(); let last = "";
for (const sp of SPOTS) {
  if (sp.route !== last) { await p.goto(base + "/design/c2/index.html" + sp.route, { waitUntil: "load" }); await p.waitForTimeout(1600); last = sp.route; }
  const r = await p.evaluate((sp) => {
    const host = document.querySelector(sp.sel); const out = [];
    for (const k of window.ASNM_ICON_KEYS) {
      const old = host.querySelector(":scope > .fig") || host.querySelector(".fig"); const t = document.createElement("div"); t.innerHTML = window.ASNM_FIG(k, sp.opts); const f = t.firstElementChild; old.replaceWith(f);
      const cs = getComputedStyle(f); const num = (v) => parseFloat(cs.getPropertyValue(v));
      const B = f.getBoundingClientRect().width;
      const fhost = f.parentElement; const H = fhost.clientHeight - parseFloat(getComputedStyle(fhost).paddingTop) - parseFloat(getComputedStyle(fhost).paddingBottom);
      const target = num("--A") * H * num("--dk");
      out.push([k, (num("--g") * B) / target]);
    }
    return out;
  }, sp);
  r.sort((a, b) => a[1] - b[1]);
  const vals = r.map((x) => x[1]); const med = vals[Math.floor(vals.length / 2)];
  const low = r.filter((x) => x[1] < 0.8).map((x) => `${x[0]} ${x[1].toFixed(2)}`);
  console.log(`${sp.name.padEnd(13)} median ${med.toFixed(2)}  min ${vals[0].toFixed(2)}  on target ${vals.filter((v) => v > 0.97).length}/47  under 0.8: ${low.length ? low.join(", ") : "none"}`);
}
await b.close();
