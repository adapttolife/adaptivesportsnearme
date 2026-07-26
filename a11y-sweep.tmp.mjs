// ASNM a11y sweep — axe-core over staging (full experience) + prod (prelaunch).
// Spec 90 pre-flip gate. Findings only; fixes land as repo commits after triage.
import { chromium } from "playwright";
import { readFileSync } from "fs";

const AXE = readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const TARGETS = [
  ["staging /",      "https://asnm-staging.alec-af3.workers.dev/"],
  ["staging /blog",  "https://asnm-staging.alec-af3.workers.dev/blog"],
  ["prod / (gate)",  "https://adaptivesportsnearme.com/"],
];
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 375, height: 812 } };

const browser = await chromium.launch({ executablePath: '/home/agentos/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome' });
const all = {};
for (const [label, url] of TARGETS) {
  for (const [vp, size] of Object.entries(VIEWPORTS)) {
    const page = await browser.newPage({ viewport: size });
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(2500); await page.addScriptTag({ content: AXE });
      const res = await page.evaluate(async () =>
        await axe.run(document, { resultTypes: ["violations"] }));
      for (const v of res.violations) {
        const key = `${v.id} [${v.impact}]`;
        all[key] ??= { help: v.help, pages: new Set(), nodes: 0, sample: v.nodes[0]?.target?.join(" ") };
        all[key].pages.add(`${label}/${vp}`);
        all[key].nodes += v.nodes.length;
      }
      console.log(`swept ${label} ${vp}: ${res.violations.length} violation types`);
    } catch (e) {
      console.log(`SWEEP-FAIL ${label} ${vp}: ${e.message.slice(0, 90)}`);
    }
    await page.close();
  }
}
await browser.close();
console.log("\n=== TRIAGE (by impact, deduped across pages) ===");
const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
for (const [k, v] of Object.entries(all).sort((a, b) =>
  (order[a[0].match(/\[(\w+)\]/)[1]] ?? 9) - (order[b[0].match(/\[(\w+)\]/)[1]] ?? 9))) {
  console.log(`${k}  nodes=${v.nodes}  where=${[...v.pages].join(",")}`);
  console.log(`   ${v.help}\n   e.g. ${v.sample}`);
}
