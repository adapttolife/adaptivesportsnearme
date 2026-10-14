// Trio audit: multi-sport listings show up to three athletes in one plate (cards, listing hero, poster).
import { createRequire } from "module";
const require = createRequire("/srv/alec-version-2/node_modules/");
const { chromium } = require("playwright");
const base = process.argv[2];
const TRIOS = [["basketball", "tennis", "baseball"], ["cycling", "swimming", "rowing"], ["handcycling", "sledhockey", "goalball"], ["blindsports", "waterskiing", "trackfield"], ["climbing", "archery", "golf"], ["veteran-meetup", "event", "art-therapy"], ["soccer", "football", "lacrosse"], ["swimming", "cycling"], ["handcycling", "wheelchairracing", "triathlon"], ["equestrian", "sailing", "nordicskiing"]];
const SPOTS = [
  { name: "card (rail)", route: "#/", sel: ".pcard .plate--card", kind: "card", avoid: ".pcard .vpill, .pcard .pstamp" },
  { name: "card (list)", route: "#/near/Tampa%2C%20FL", sel: ".cards:not(.is-rail) .pcard .plate--card", kind: "card", wide: true, avoid: ".pcard .vpill, .pcard .pstamp" },
  { name: "listing hero", route: "#/programs/e29002d5-c892-5753-a6bd-d381220d9d51", sel: ".pg-hero .plate--hero", kind: "hero", avoid: ".pg-hb, .pg-stamp" },
  { name: "poster", route: "#/programs/e29002d5-c892-5753-a6bd-d381220d9d51?share=1", sel: ".pp-art", kind: "poster" },
];
const b = await chromium.launch({ executablePath: process.env.HOME + "/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
let fails = 0, n = 0;
for (const w of [320, 390, 768, 1440]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  for (const sp of SPOTS) {
    await page.goto(base + "/design/c2/index.html" + sp.route, { waitUntil: "load" }); await page.waitForTimeout(1600);
    const r = await page.evaluate(([sp, TRIOS]) => {
      let host = document.querySelector(sp.sel); if (!host) return { missing: true };
      let worst = { px: 0, trio: "", why: "" };
      for (const t of TRIOS) {
        if (sp.kind === "poster") {
          const old = host.querySelector(".trio, .fig"); const tmp = document.createElement("div");
          tmp.innerHTML = window.ASNM_PLATE({ key: "multi", trio: t }, { kind: "poster" }); const tr = tmp.querySelector(".trio");
          tr.classList.add("pp-trio"); old.replaceWith(tr);
        } else {
          const tmp = document.createElement("div"); tmp.innerHTML = window.ASNM_PLATE({ key: "multi", trio: t }, { kind: sp.kind, wide: sp.wide });
          const np = tmp.firstElementChild; host.replaceWith(np); host = np;
        }
        const avoid = sp.avoid ? [...document.querySelectorAll(sp.avoid)] : [];
        for (const fig of host.querySelectorAll(".trio .fig")) {
          const cs = getComputedStyle(fig), fw = parseFloat(cs.getPropertyValue("--w")), fh = parseFloat(cs.getPropertyValue("--h"));
          const R = fig.getBoundingClientRect();
          // The border box is the full square (negative margins only change layout): shrink it to the drawing.
          const ink = { l: R.left + (1 - fw) / 2 * R.width, r: R.right - (1 - fw) / 2 * R.width, t: R.top + (1 - fh) / 2 * R.height, b: R.bottom - (1 - fh) / 2 * R.height };
          const bump = (px, why) => { if (px > worst.px) worst = { px: Math.round(px * 10) / 10, trio: t.join("+"), why }; };
          for (let el = fig.parentElement; el && el !== document.body; el = el.parentElement) {
            const s = getComputedStyle(el), c = el.getBoundingClientRect();
            if (s.overflowX !== "visible" || s.overflowY !== "visible") { bump(c.left - ink.l, "left"); bump(ink.r - c.right, "right"); bump(c.top - ink.t, "top"); bump(ink.b - c.bottom, "bottom"); }
          }
          for (const a of avoid) { const c = a.getBoundingClientRect(); const ox = Math.min(ink.r, c.right) - Math.max(ink.l, c.left), oy = Math.min(ink.b, c.bottom) - Math.max(ink.t, c.top); if (ox > .5 && oy > .5) bump(Math.min(ox, oy), "covers ." + a.className.split(" ")[0]); }
        }
      }
      return { worst };
    }, [sp, TRIOS]);
    n++;
    const bad = r.missing ? "MISSING" : r.worst.px > 0.5 ? "FAIL" : "ok";
    if (bad !== "ok") { fails++; console.log(`${bad} ${w} ${sp.name} ${r.missing ? "" : r.worst.px + "px " + r.worst.trio + " (" + r.worst.why + ")"}`); }
  }
  await ctx.close();
}
await b.close();
console.log(fails ? `${fails} of ${n} trio spot/width combinations fail` : `TRIOS CLEAR: ${n} spot/width combinations x ${TRIOS.length} trios`);
