// The search box must be fully in the first screen on common phones.
import { createRequire } from "module";
const require = createRequire("/srv/alec-version-2/node_modules/");
const { chromium } = require("playwright");
const base = process.argv[2];
const b = await chromium.launch({ executablePath: process.env.HOME + "/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
let bad = 0;
for (const [w, h, name] of [[375, 667, "iPhone SE"], [390, 844, "iPhone 15"], [430, 932, "iPhone 15 Pro Max"], [360, 780, "Android"], [320, 568, "small"]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto(base + "/design/c2/index.html#/", { waitUntil: "load" }); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => { const s = document.querySelector(".hb .wf-row").getBoundingClientRect(); return { bottom: Math.round(s.bottom), vh: innerHeight }; });
  const ok = r.bottom <= r.vh;
  if (!ok) bad++;
  console.log(`${ok ? "ok  " : "FOLD"} ${name} ${w}x${h}: search box bottom at ${r.bottom}px of ${r.vh}`);
  await ctx.close();
}
await b.close();
console.log(bad ? `${bad} screens push the search below the fold` : "SEARCH IN FIRST SCREEN ON ALL PHONES TESTED");
