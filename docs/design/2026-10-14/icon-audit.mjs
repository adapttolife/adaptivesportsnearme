// Icon clip audit for /design/c2. For every icon x every spot x every width, put the icon
// in the spot with the real CSS, then measure where the DRAWING lands (the square box from
// getBoundingClientRect, shrunk by the drawing's share --w/--h). Reports pixels cut off by any
// clipping ancestor or the viewport, pixels outside a round avatar, and overlaps with the hero
// headline text, the listing's buttons and place stamp.
// Usage: node audit.mjs <base> [widths]
import { createRequire } from "module";
const require = createRequire("/srv/alec-version-2/node_modules/");
const { chromium } = require("playwright");
const base = process.argv[2];
const widths = (process.argv[3] || "320,360,375,390,414,430,768,1024,1280,1440").split(",").map(Number);
const LISTING = "e29002d5-c892-5753-a6bd-d381220d9d51";
const SCEN = [
  { name: "home hero", route: "#/", sel: ".hb-fig.is-on", opts: { color: "#1A1A1A", big: true, cls: "fig--pin fig--mid" }, text: ".hb h1" },
  { name: "home door", route: "#/", sel: ".door-fig", opts: { color: "#1A1A1A", big: true }, avoidIn: [".door", "b, span:not(.door-fig)"] },
  { name: "home band", route: "#/", sel: ".band-fig", opts: { color: "#1A1A1A", big: true } },
  { name: "sport tile", route: "#/", sel: ".st .plate", opts: {} },
  { name: "card (rail)", route: "#/", sel: ".pcard .plate--card", opts: {} , keep: ".vpill, .pstamp", avoidIn: [".plate--card", ".vpill, .pstamp"] },
  { name: "card (list)", route: "#/near/Tampa%2C%20FL", sel: ".cards:not(.is-rail) .pcard .plate--card", opts: {}, keep: ".vpill, .pstamp", avoidIn: [".plate--card", ".vpill, .pstamp"] },
  { name: "vets hero", route: "#/resources/veteran-owned-businesses", sel: ".vb-art", opts: { color: "#FFFFFF", big: true, cls: "fig--pin fig--mid" }, text: ".vb-hero h1" },
  { name: "listing hero", route: `#/programs/${LISTING}`, sel: ".pg-hero .plate--hero", opts: { big: true }, avoid: ".pg-hb, .pg-stamp, .pg-vpill", keep: ".vpill, .pg-stamp" },
  { name: "hero long city", route: "#/programs/71d75b33-cae2-58e7-a751-e6496cb4d078", sel: ".pg-hero .plate--hero", opts: { big: true }, avoid: ".pg-hb, .pg-stamp, .pg-vpill" },
  { name: "hero statewide", route: "#/programs/5719f643-77a7-47b5-90ad-2248131027e6", sel: ".pg-hero .plate--hero", opts: { big: true }, avoid: ".pg-hb, .pg-stamp, .pg-vpill" },
  { name: "hero no state", route: "#/programs/592375c9-cab3-4f07-8447-13b2f672faf0", sel: ".pg-hero .plate--hero", opts: { big: true }, avoid: ".pg-hb, .pg-stamp, .pg-vpill" },
  { name: "sport banner", route: "#/sports/tennis", sel: ".ch-banner--sport", opts: { big: true } },
  { name: "sport avatar", route: "#/sports/tennis", sel: ".ch-av .av", opts: {} },
  { name: "bar avatar", route: "#/near/Tampa%2C%20FL", sel: ".sb-link .av:not(.av--all)", opts: {} },
  { name: "row", route: "#/near/Tampa%2C%20FL", sel: ".prow .plate--row", opts: {} },
  { name: "poster", route: `#/programs/${LISTING}?share=1`, sel: ".pp-art", opts: { big: true } },
];
const b = await chromium.launch({ executablePath: process.env.HOME + "/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const results = [];
for (const w of widths) {
  const mobile = w < 1000;
  const ctx = await b.newContext({ viewport: { width: w, height: mobile ? 844 : 900 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  let lastRoute = "";
  for (const sc of SCEN) {
    if (sc.route !== lastRoute) { await page.goto(base + "/design/c2/index.html" + sc.route, { waitUntil: "load" }); await page.waitForTimeout(1800); lastRoute = sc.route; }
    const r = await page.evaluate((sc) => {
      const host = document.querySelector(sc.sel);
      if (!host) return { missing: true };
      const keep = sc.keep ? [...host.querySelectorAll(sc.keep)] : [];
      const avoid = (sc.avoid ? [...document.querySelectorAll(sc.avoid)] : []).concat(sc.avoidIn ? [...host.closest(sc.avoidIn[0]).querySelectorAll(sc.avoidIn[1])].filter((e) => !e.contains(host)) : []).filter((e) => e.getBoundingClientRect().width > 0);
      const keys = window.ASNM_ICON_KEYS;
      let worst = { px: 0, key: "", why: "" };
      const textRects = sc.text ? (() => { const h = document.querySelector(sc.text); const rg = document.createRange(); rg.selectNodeContents(h); return [...rg.getClientRects()]; })() : [];
      const inter = (a, c) => Math.max(0, Math.min(a.r, c.right) - Math.max(a.l, c.left)) > 0.5 && Math.max(0, Math.min(a.b, c.bottom) - Math.max(a.t, c.top)) > 0.5 ? Math.min(Math.min(a.r, c.right) - Math.max(a.l, c.left), Math.min(a.b, c.bottom) - Math.max(a.t, c.top)) : 0;
      for (const k of keys) {
        // Put the icon in (replacing the existing figure; keep pills and stamps).
        const old = host.querySelector(":scope > .fig") || host.querySelector(".fig");
        const tmp = document.createElement("div"); tmp.innerHTML = window.ASNM_FIG(k, sc.opts); const fig = tmp.firstElementChild;
        if (old) old.replaceWith(fig); else host.prepend(fig);
        const cs = getComputedStyle(fig);
        const fw = parseFloat(cs.getPropertyValue("--w")), fh = parseFloat(cs.getPropertyValue("--h"));
        const R = fig.getBoundingClientRect();
        const ink = { l: R.left + (1 - fw) / 2 * R.width, r: R.right - (1 - fw) / 2 * R.width, t: R.top + (1 - fh) / 2 * R.height, b: R.bottom - (1 - fh) / 2 * R.height };
        const bump = (px, why) => { if (px > worst.px) worst = { px: Math.round(px * 10) / 10, key: k, why }; };
        bump(-ink.l, "off screen left"); bump(ink.r - innerWidth, "off screen right");
        for (let el = fig.parentElement; el && el !== document.body; el = el.parentElement) {
          const s = getComputedStyle(el);
          const c = el.getBoundingClientRect();
          if (s.overflowX !== "visible" || s.overflowY !== "visible") {
            bump(c.left - ink.l, "clipped left by ." + el.className.split(" ")[0]); bump(ink.r - c.right, "clipped right by ." + el.className.split(" ")[0]);
            bump(c.top - ink.t, "clipped top by ." + el.className.split(" ")[0]); bump(ink.b - c.bottom, "clipped bottom by ." + el.className.split(" ")[0]);
          }
          if (el.classList.contains("av")) {      // round: the drawing's box must sit inside the circle
            const cx = c.left + c.width / 2, cy = c.top + c.height / 2, rad = c.width / 2;
            const far = Math.max(...[[ink.l, ink.t], [ink.r, ink.t], [ink.l, ink.b], [ink.r, ink.b]].map(([x, y]) => Math.hypot(x - cx, y - cy)));
            bump((far - rad) * 0.5, "outside circle");   // half: box corners are usually empty
          }
        }
        for (const tr of textRects) bump(inter(ink, tr), "covers headline");
        for (const a of avoid) bump(inter(ink, a.getBoundingClientRect()), "covers ." + a.className.split(" ")[0]);
      }
      return { worst };
    }, sc);
    results.push({ w, name: sc.name, ...r });
  }
  await ctx.close();
}
await b.close();
let fails = 0;
for (const r of results) {
  const bad = r.missing ? "MISSING" : r.worst.px > 0.5 ? "FAIL" : "ok";
  if (bad !== "ok") fails++;
  if (bad !== "ok" || process.env.VERBOSE) console.log(`${bad.padEnd(7)} ${String(r.w).padStart(4)} ${r.name.padEnd(13)} ${r.missing ? "" : `${r.worst.px}px ${r.worst.key} (${r.worst.why})`}`);
}
console.log(fails ? `${fails} spot/width combinations fail` : `ALL CLEAR: ${results.length} spot/width combinations, ${47} icons each, 0 pixels cut off`);
