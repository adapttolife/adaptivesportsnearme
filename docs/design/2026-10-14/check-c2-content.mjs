// Content check: every sport page's Programs tab lists programs (not the events empty state),
// and the veterans pages carry their pieces. Fails loudly.
import { createRequire } from "module";
const require = createRequire("/srv/alec-version-2/node_modules/");
const { chromium } = require("playwright");
const base = process.argv[2];
const b = await chromium.launch({ executablePath: process.env.HOME + "/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const p = await b.newPage();
const fails = [];
const keys = ["tennis", "basketball", "soccer", "baseball", "equestrian", "swimming", "multi", "veteran-meetup", "equine-therapy", "art-therapy", "sledhockey", "golf"];
for (const k of keys) {
  await p.goto(`${base}/design/c2/index.html#/sports/${k}`, { waitUntil: "load" }); await p.waitForTimeout(1800);
  const r = await p.evaluate(() => ({ t: document.querySelector("main").innerText, rows: document.querySelectorAll("main .prow, main .pcard").length }));
  const bad = /events posted yet/i.test(r.t) || r.rows === 0;
  console.log(`${bad ? "FAIL" : "ok  "} #/sports/${k}: ${r.rows} program rows`);
  if (bad) fails.push(k);
}
await p.goto(`${base}/design/c2/index.html#/sports/veteran-meetup`, { waitUntil: "load" }); await p.waitForTimeout(1500);
if (!(await p.evaluate(() => !!document.querySelector(".vet-res")))) { fails.push("vet-res link"); console.log("FAIL veteran-owned businesses link missing"); } else console.log("ok   veteran-owned businesses link");
await b.close();
if (fails.length) { console.log("FAILED:", fails.join(", ")); process.exit(1); } else console.log("ALL CONTENT CHECKS PASS");
