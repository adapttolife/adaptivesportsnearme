// Share cards (og:image) for every page family: 1200x630 PNG files in public/og/, built
// from the site's own parts. See src/share-cards.js for which page wears which card.
//
//   node scripts/og/build.mjs            all cards
//   node scripts/og/build.mjs sports/tennis states/FL home
//
// Needs Playwright with Chromium (npm i -D playwright && npx playwright install chromium;
// PLAYWRIGHT_MODULE and CHROMIUM_PATH point at an install elsewhere). Cards render at 2x
// and are scaled down, with ffmpeg's Lanczos and a 256-colour palette when ffmpeg is on the
// PATH, so edges stay crisp at the size platforms fetch and each file stays small. Fonts
// load from Google Fonts, as on the site.
//
// The layouts follow the site: Laura Lian's four colours, each paired with black (a
// sport's colour is its family's, as on its page); Alec's athlete drawings unchanged from
// public/emblems/sports, black on colour and cream on black; Sofia Sans Extra Condensed 900
// caps; the cream mark. The words are each page's headline, word for word.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { SPORT_NAMES } from "../../src/sport-names.js";
import { STATE_NAMES } from "../../src/pages.js";
import { HOME_CARD, PAGE_CARDS, sportCard, stateCard, CARD_WIDTH as W, CARD_HEIGHT as H } from "../../src/share-cards.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => readFileSync(join(root, p), "utf8");

// The site's own tables: sport families (public/listing-art.js) and tones (public/app/app.js).
const box = { console };
vm.runInNewContext(read("public/listing-art.js"), box);
const FAMILY = box.ListingArt.FAMILY;
const appJs = read("public/app/app.js");
const C = Object.fromEntries([...appJs.matchAll(/(CORAL|ORANGE|TEAL|YELLOW|INK) = "(#[0-9A-F]{6})"/g)].map((m) => [m[1], m[2]]));
const TONES = vm.runInNewContext("(" + appJs.match(/const TONES = (\{[\s\S]*?\});/)[1] + ")", C);
const family = (k) => (k === "grant" || k === "event" ? k : (k && k !== "multi" && FAMILY[k]) || "house");
const tone = (k) => { const [bg, fg] = TONES[family(k)]; return { bg, fg }; };
const CREAM = "#F3F3F3";
const art = (k) => read(`public/emblems/sports/${k}.svg`).replace(/<title>[^<]*<\/title>/, "");
const SHAPES = JSON.parse(read("public/data/states.json")).shapes;
const MARK = read("public/app/logo-cream.svg").replace(/<!--[\s\S]*?-->/, "");

// Layouts, in card pixels. [data-fit] text is sized to fill its box (x,y,w,h,largest) and
// sits on the box's bottom; [data-art] drawings are placed by their own ink (x,y,w,h).
const mark = (onInk) => onInk
  ? `<div class="mk" style="left:56px;top:52px;width:104px;height:104px">${MARK}</div>`
  : `<div class="mk" style="left:64px;top:60px;width:92px;height:92px;background:${C.INK}"><div style="width:70px;height:70px">${MARK}</div></div>`;
const LAYOUTS = {
  // A colour, the page's headline at the left, the athlete at the right on the same baseline.
  banner: ({ title, key, bg, fg, max = 250, textW = 600 }) => `<div class="card" style="background:${bg}">${mark(bg === C.INK)}
    <h1 class="t" data-fit="64,180,${textW},386,${max}" style="color:${fg}">${title}</h1>
    <div data-art data-box="720,52,424,514" style="color:${fg}">${art(key)}</div></div>`,
  // The home card (Alec's pick, "B: Four colours"): the black header with the promise over
  // four sports, one per brand colour.
  lineup: ({ title, keys }) => `<div class="card" style="background:${C.INK}">
    <div class="mk" style="left:56px;top:56px;width:96px;height:96px">${MARK}</div>
    <h1 class="t" data-fit="190,52,950,236,140" style="color:${CREAM}">${title}</h1>
    ${keys.map((k, i) => { const t = tone(k); return `<div class="pane" style="left:${i * 300}px;top:330px;width:300px;height:300px;background:${t.bg}"></div>
      <div data-art data-box="${i * 300 + 34},366,232,228" style="color:${t.fg}">${art(k)}</div>`; }).join("")}</div>`,
  // A state: its shape in coral on black, its name in cream.
  state: ({ title, st }) => `<div class="card" style="background:${C.INK}">${mark(true)}
    <h1 class="t" data-fit="64,180,580,386,250" style="color:${CREAM}">${title}</h1>
    <svg class="shape" style="left:680px;top:64px;width:460px;height:502px" viewBox="0 0 100 100"><path d="${SHAPES[st]}" fill="${C.CORAL}"/></svg></div>`,
};

// Every card: its file, its layout, and its headline (the page's h1; <br> only where a
// line must break, ‑ keeps "Veteran-Owned" whole).
const CARDS = [
  { path: HOME_CARD, layout: "lineup", headline: "Find your place in adaptive sports.", title: "Find your place in<br>adaptive sports.", keys: ["basketball", "tennis", "swimming", "baseball"] },
  { path: PAGE_CARDS.grants, layout: "banner", headline: "Grants", key: "grant", ...tone("grant") },
  { path: PAGE_CARDS.events, layout: "banner", headline: "Events", key: "event", ...tone("event") },
  { path: PAGE_CARDS["veteran-owned-businesses"], layout: "banner", headline: "Support Veteran-Owned Businesses",
    title: "Support<br>Veteran‑Owned<br>Businesses", key: "veteran-meetup", ...tone("veteran-meetup"), max: 160 },
  ...Object.entries(SPORT_NAMES).map(([key, name]) => ({ path: sportCard(key), layout: "banner", headline: name, key, ...tone(key) })),
  ...Object.entries(STATE_NAMES).map(([st, name]) => ({ path: stateCard(st), layout: "state", headline: name, st })),
];

const CSS = `html,body{margin:0}
.card{position:relative;width:${W}px;height:${H}px;overflow:hidden}
.t{position:absolute;margin:0;font-family:"Sofia Sans Extra Condensed","Sofia Sans",Arial,sans-serif;font-weight:900;text-transform:uppercase;line-height:.86;letter-spacing:-.012em}
.mk,.shape,.pane{position:absolute}.mk{display:grid;place-items:center}.mk svg{display:block;width:100%;height:100%}`;
const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Sofia+Sans:wght@400..900&family=Sofia+Sans+Extra+Condensed:wght@700..900&display=swap" rel="stylesheet">`;
function place() {
  for (const el of document.querySelectorAll("[data-fit]")) {
    const [x, y, w, h, max] = el.dataset.fit.split(",").map(Number);
    Object.assign(el.style, { left: x + "px", width: w + "px" });
    if (el.querySelector("br")) el.style.whiteSpace = "nowrap";
    let lo = 40, hi = max;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      el.style.fontSize = mid + "px";
      if (el.scrollWidth <= w + 1 && el.offsetHeight <= h) lo = mid; else hi = mid;
    }
    el.style.fontSize = Math.floor(lo) + "px";
    el.style.top = y + h - el.offsetHeight + "px";
  }
  for (const holder of document.querySelectorAll("[data-art]")) {
    const svg = holder.querySelector("svg"), bb = svg.querySelector("path").getBBox();
    const [x, y, w, h] = holder.dataset.box.split(",").map(Number);
    const s = Math.min(w / bb.width, h / bb.height), aw = bb.width * s, ah = bb.height * s;
    svg.setAttribute("viewBox", `${bb.x} ${bb.y} ${bb.width} ${bb.height}`);
    svg.removeAttribute("role");
    Object.assign(svg.style, { position: "absolute", width: aw + "px", height: ah + "px", left: x + (w - aw) / 2 + "px", top: y + h - ah + "px" });
  }
}

const only = process.argv.slice(2);
const pick = only.length ? CARDS.filter((c) => only.some((o) => c.path === `/og/${o.replace(/\.png$/, "")}.png`)) : CARDS;
let pw;
try { pw = await import(process.env.PLAYWRIGHT_MODULE || "playwright"); }
catch (_) { console.error("Needs Playwright: npm i -D playwright && npx playwright install chromium (or set PLAYWRIGHT_MODULE)"); process.exit(1); }
const ffmpeg = spawnSync("ffmpeg", ["-version"]).status === 0;
const browser = await pw.chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
const tmp = join(root, ".og-tmp.png");
for (const card of pick) {
  const html = LAYOUTS[card.layout]({ ...card, title: card.title || card.headline });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${CSS}</style></head><body>${html}</body></html>`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(place);
  const file = join(root, "public", card.path);
  mkdirSync(dirname(file), { recursive: true });
  const big = await page.locator(".card").screenshot();
  if (ffmpeg) {
    writeFileSync(tmp, big);
    // Lanczos down to size, then 256 colours with no dithering: flat cards look the same at
    // half the bytes (WhatsApp drops a preview image over 300 KB).
    const vf = `scale=${W}:${H}:flags=lanczos,split[a][b];[a]palettegen=max_colors=256:stats_mode=full[p];[b][p]paletteuse=dither=none`;
    const r = spawnSync("ffmpeg", ["-nostdin", "-loglevel", "error", "-y", "-i", tmp, "-filter_complex", vf, "-pred", "mixed", file]);
    if (r.status !== 0) throw new Error(`ffmpeg: ${r.stderr}`);
  } else {
    const data = await page.evaluate(async ({ b64, w, h }) => {
      const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(img, 0, 0, w, h);
      return c.toDataURL("image/png").split(",")[1];
    }, { b64: big.toString("base64"), w: W, h: H });
    writeFileSync(file, Buffer.from(data, "base64"));
  }
  console.log(card.path);
}
rmSync(tmp, { force: true });
await browser.close();

// The record the tests read: every card, the headline it carries, and its file's hash.
const manifest = CARDS.map((c) => ({ path: c.path, headline: c.headline,
  sha256: createHash("sha256").update(readFileSync(join(root, "public", c.path))).digest("hex").slice(0, 16) }));
writeFileSync(join(root, "public/og/cards.json"), JSON.stringify(manifest, null, 1) + "\n");
