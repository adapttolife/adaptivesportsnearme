// Browser truth for the animated icons: pause every CSS animation at fixed
// times and screenshot. node frames.cjs <engine> <out.png> <n> a.svg b.svg ...
// Needs Playwright (PLAYWRIGHT_CORE=/path/to/playwright-core for a pinned engine).
const fs = require('fs');
const path = require('path');
const pw = require(process.env.PLAYWRIGHT_CORE || 'playwright');
// every inlined copy needs its own ids, or url(#id) resolves to the first copy on the page
const uniq = (svg, tag) => svg.replace(/id="([^"]+)"/g, `id="$1-${tag}"`).replace(/url\(#([^)]+)\)/g, `url(#$1-${tag})`);
(async () => {
  const [engine, out, n, ...files] = process.argv.slice(2);
  const N = +n || 8;
  const browser = await pw[engine].launch();
  const page = await browser.newPage({ viewport: { width: 150 * N, height: 160 * files.length }, deviceScaleFactor: 1 });
  let html = '<body style="margin:0;font:11px sans-serif;background:#fff">';
  files.forEach((f, r) => {
    const svg = fs.readFileSync(f, 'utf8');
    const dur = Math.max(...[...svg.matchAll(/animation:\S+ ([\d.]+)s/g)].map(m => +m[1]), 1);
    for (let i = 0; i < N; i++) {
      // each cell gets its own copy; data-t is the time to freeze at
      html += `<div data-t="${(i / N) * dur * 1000}" style="position:absolute;left:${i * 150}px;top:${r * 160}px;width:140px;height:155px">`
        + `<div style="color:#c00;height:15px;line-height:15px;overflow:hidden;white-space:nowrap">${path.basename(f, '.svg')} ${(i / N).toFixed(2)}</div>`
        + `<div style="position:absolute;left:0;top:15px;width:140px;height:140px">${uniq(svg, `c${r}x${i}`).replace(/<svg /, '<svg width="140" height="140" style="display:block" ')}</div></div>`;
    }
  });
  await page.setContent(html + '</body>');
  await page.evaluate(() => {
    for (const a of document.getAnimations()) {
      const cell = a.effect.target.closest('[data-t]');
      a.pause();
      a.currentTime = +cell.dataset.t;
    }
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: out });
  await browser.close();
})();
