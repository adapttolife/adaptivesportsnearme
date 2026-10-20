// Every word stays readable in both themes. Alec, 2026-10-17, on the veteran-owned
// businesses page in dark mode: "Cannot see the links. Fix the color contrast and make
// sure it is fixed everywhere else on the website."
//
// Dark mode changes the theme colours: the tokens redefined under :root[data-theme="dark"]
// (--ink, --paper, --muted...). A colour written as a fixed value (#1a1a1a, or a brand
// colour like var(--orange)) stays the same. Each bug fixed that day mixed the two: black
// link text on the page (the page turned dark), light text on an --ink block (the block
// turned light), a pale box whose text followed the theme. These checks read the app's CSS
// the way the cascade does (later rules win, !important wins, dark mode's own rules win in
// dark mode), find the surface under each text colour (its own background, else the
// nearest one its selector names, else the page) and measure the contrast in both themes.
// The full check is a browser audit of every page in both themes (see the PR that added
// this file); this one keeps the same mistakes from coming back.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
const sheets = [["app.css", read("../public/app/app.css")], ...readdirSync(new URL("../public/app/views/", import.meta.url))
  .filter((f) => f.endsWith(".css")).map((f) => [`views/${f}`, read(`../public/app/views/${f}`)])];
const DARK = ':root[data-theme="dark"] ';

// Every declaration by selector and screen size, the cascade applied: later wins unless the
// earlier one is !important.
const RULES = new Map();   // "media|selector" -> { file, media, sel, decls: { prop: { v, imp } } }
for (const [file, css] of sheets) {
  const heads = [];
  let buf = "";
  for (const ch of css.replace(/\/\*[\s\S]*?\*\//g, "")) {
    if (ch === "{") { heads.push(buf.trim().replace(/\s+/g, " ")); buf = ""; continue; }
    if (ch !== "}") { buf += ch; continue; }
    const head = heads.pop();
    if (head && !head.startsWith("@") && !heads.some((h) => /^@(keyframes|font-face)/.test(h))) {
      const media = heads.filter((h) => h.startsWith("@media")).join(" ");
      for (const sel of head.split(",").map((s) => s.trim())) {
        const key = `${media}|${sel}`;
        const r = RULES.get(key) || { file, media, sel, decls: {} };
        for (const d of buf.split(";")) {
          const k = d.indexOf(":");
          if (k <= 0) continue;
          const prop = d.slice(0, k).trim(), raw = d.slice(k + 1).trim(), imp = /!important/.test(raw);
          if (prop === "background" || prop === "background-color" || prop === "color" || prop.startsWith("--")) {
            const name = prop === "background-color" ? "background" : prop;
            if (!(r.decls[name] && r.decls[name].imp && !imp)) r.decls[name] = { v: raw.replace(/\s*!important/, ""), imp };
          }
        }
        RULES.set(key, r);
      }
    }
    buf = "";
  }
}
const tokens = (sel) => Object.fromEntries(Object.entries((RULES.get(`|${sel}`) || { decls: {} }).decls).filter(([k]) => k.startsWith("--")).map(([k, d]) => [k, d.v]));
const THEME = { light: tokens(":root") };
THEME.dark = { ...THEME.light, ...tokens(DARK.trim()) };

// Colour maths (WCAG 2): relative luminance and contrast ratio.
function rgb(v, theme) {
  const t = String(v || "").trim(), m = t.match(/^var\((--[\w-]+)\s*(?:,\s*(.+))?\)$/);
  if (m) return theme[m[1]] ? rgb(theme[m[1]], theme) : m[2] ? rgb(m[2], theme) : null;
  const h = t.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (h) { const s = h[1].length === 3 ? [...h[1]].map((c) => c + c).join("") : h[1]; return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)); }
  const r = t.match(/^rgba?\(([^)]+)\)$/);
  if (r) { const p = r[1].split(/[\s,/]+/).map(Number); return p.length > 3 && p[3] < 1 ? null : p.slice(0, 3); }
  return null;
}
const lum = (c) => c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const hex = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
const see = (v) => v && !/url\(|gradient|currentcolor|inherit|initial|unset/i.test(v);           // a colour this check can read
const clear = (v) => /^(transparent|none)$/i.test(String(v).trim());

/** The parts a selector names: ".a .b>.c.d" -> [".a", ".a .b", ".a .b>.c.d"]. */
function prefixes(sel) {
  const out = []; let depth = 0;
  for (let i = 0; i < sel.length; i++) {
    const ch = sel[i];
    if (ch === "[" || ch === "(") depth++; else if (ch === "]" || ch === ")") depth--;
    else if (depth === 0 && i > 0 && (ch === " " || ch === ">") && !/[\s>]/.test(sel[i - 1])) out.push(sel.slice(0, i).trim());
  }
  return [...out, sel];
}
/** ".x .a.b[c]" -> [".x .a.b", ".x .a[c]", ".x .b[c]", ".x .a", ...]: the same element under fewer classes. */
function looser(sel) {
  const cut = Math.max(sel.lastIndexOf(" "), sel.lastIndexOf(">")) + 1, lead = sel.slice(0, cut), last = sel.slice(cut);
  const parts = last.match(/(?:[.#]?[\w-]+|\[[^\]]*\]|::?[\w-]+(?:\([^)]*\))?)/g) || [last];
  if (parts.length < 2 || parts.length > 4) return [];
  const out = [];
  for (let mask = (1 << parts.length) - 2; mask > 0; mask--) {
    const pick = parts.filter((_, i) => mask & (1 << i));
    if (/^::?/.test(pick[0])) continue;
    out.push({ sel: lead + pick.join(""), n: pick.length });
  }
  return out.sort((a, b) => b.n - a.n).map((x) => x.sel);
}
/** One property for one element (as its selector names it) in a theme. */
function prop(sel, media, theme, name) {
  const hit = (s) => [theme === "dark" && RULES.get(`${media}|${DARK}${s}`), theme === "dark" && RULES.get(`|${DARK}${s}`),
    RULES.get(`${media}|${s}`), RULES.get(`|${s}`)].find((r) => r && r.decls[name]);
  const own = hit(sel), loose = looser(sel).map(hit).filter(Boolean);
  const imp = loose.find((r) => r.decls[name].imp);
  const r = own && !(imp && !own.decls[name].imp) ? own : imp || loose[0];
  return r ? r.decls[name].v : undefined;
}
/** The colour painted behind an element's text, else null when it is not a plain colour. */
function surface(sel, media, theme) {
  for (const p of prefixes(sel).reverse()) {
    const v = prop(p, media, theme, "background");
    if (v === undefined || clear(v)) continue;
    return see(v) ? rgb(v, THEME[theme]) : null;
  }
  return rgb("var(--paper)", THEME[theme]);
}
/** The text colour an element ends up with: its own, else the nearest named ancestor's, else --ink. */
function textColour(sel, media, theme) {
  const base = sel.replace(/:(hover|focus|focus-visible|focus-within|active)$/, "");
  for (const p of [sel, ...prefixes(base).reverse()]) {
    const v = prop(p, media, theme, "color");
    if (v !== undefined) return see(v) ? rgb(v, THEME[theme]) : null;
  }
  return rgb("var(--ink)", THEME[theme]);
}
// Where the real surface is one the selector does not name, this check can't see it. Each
// of these was measured in a browser in both themes; the reason says what is behind it.
const SEEN_IN_BROWSER = new Map([
  ["views/home.css .v-home .hb .wf-label", "drawn over the field, which is --paper in both themes"],
  ["views/home.css .v-home .hb .wf:has(.input:focus) .wf-label", "drawn over the field, which is --paper in both themes"],
  ["views/home.css .v-home .hb .wf:has(.input:not(:placeholder-shown)) .wf-label", "drawn over the field, which is --paper in both themes"],
  ["views/help.css @media (min-width: 768px) .v-help .hp-sub", "on the .hp-hero colour band from 768px"],
  ["app.css @media (min-width: 768px) .hp-hero h1", "on the .hp-hero colour band from 768px"],
  ["views/home.css .v-home .door", "every .door--* is a colour block; .door--ink sets light text"],
  ["views/home.css .v-home .door--sun", "black text from .door"], ["views/home.css .v-home .door--sea", "black text from .door"],
  ["views/home.css .v-home .door--coral", "black text from .door"],
  ["views/home.css .v-home .band", "every .band--* is a colour block"],
  ["views/home.css .v-home .band--sun", "black text from .band"], ["views/home.css .v-home .band--sea", "black text from .band"],
  ["views/home.css .v-home .hb-art", "inside the .hb banner, which is a colour block in both themes"],
  ["views/home.css .v-home .hb-lede", "inside the .hb banner, which is a colour block in both themes"],
  ["views/near.css .v-near .nr-sum", "inside the coral .nr-hd header"], ["views/near.css .v-near .nr-note", "inside the coral .nr-hd header"],
  ["views/near.css .v-near .nr-legend", "inside the coral .nr-hd header"],
  ["views/letter-confirmed.css .v-letter-confirmed .lc-art", "inside the coral .lc block"],
  ["views/letter-confirmed.css .v-letter-confirmed .lc-lede", "inside the coral .lc block"],
  ['app.css [data-look="sharp"] .hd', "inside the #top bar, #121212 in both themes"],
  ['app.css [data-look="sharp"] .hd .iconbtn', "inside the #top bar, #121212 in both themes"],
  ["app.css .dl-switch", "the dark mode switch: an outline, no text (3:1 measured: --muted on --paper)"],
  ["app.css .dl-switch::after", "the switch knob, no text"],
  ['app.css .dl-theme[aria-pressed="true"] .dl-switch', "the switch when on: --ink on --paper, no text"],
  ['app.css .dl-theme[aria-pressed="true"] .dl-switch::after', "the knob when on: --paper on --ink, no text"],
  ["views/sport.css .v-sport .pchips .chip.is-cur .chip-n", "the current chip has aria-current: .chip[aria-current] paints it --ink"],
  ["views/vob.css .v-vob .vb-kicker", "inside the black .vb-hero"],
  ["views/near.css .v-near .nr-k--dot", "a key dot, no text"], ["views/map.css .v-map .mp-stage", "the map, no text on it"],
  ["app.css .tm-key .t1", "a key swatch, no text"], ["app.css .tm-key .t2", "a key swatch, no text"],
  ["app.css .tm-key .t3", "a key swatch, no text"], ["app.css .tm-key .t4", "a key swatch, no text"],
  ['app.css .dl-item[aria-current="page"]::before', "a coral bar, no text"],
  ['app.css .sb-link[aria-current="true"]::after', "a bar, no text"],
  ['app.css [data-look="sharp"] #beta', "the beta bar: its words set light text (#beta .beta)"],
  ['app.css [data-look="sharp"] #top', "the header bar: its words set light text (.hd)"],
  ['views/grants.css .v-grants .seg::before', "the segmented control backdrop has no text"],
  ['views/grants.css .v-grants .seg a[aria-current="page"]', "the selected segment sits on the control backdrop"],
  ['views/manage.css .v-manage .om-visibility input:checked + .dl-switch', "the form switch has no text"],
]);
const where = (r) => `${r.file} ${r.media ? r.media + " " : ""}${r.sel}`;
// The looks kept for comparison only (?look=today, ?look=hues); sharp is the site.
const ELEMENTS = [...RULES.values()].filter((r) => !/\[data-look="(today|hues)"\]/.test(r.sel) && r.sel !== ":root" && !r.sel.startsWith(":root[")
  || r.sel.startsWith(DARK)).map((r) => ({ ...r, sel: r.sel.startsWith(DARK) ? r.sel.slice(DARK.length) : r.sel, darkOnly: r.sel.startsWith(DARK) }))
  .filter((r) => !SEEN_IN_BROWSER.has(where(r)) && !SEEN_IN_BROWSER.has(where({ ...r, sel: r.darkOnly ? DARK + r.sel : r.sel })));
// Icons and marks need 3:1 (WCAG 1.4.11); words need 4.5:1. .vcheck is the verified badge icon.
const need = (sel) => /\.ic\b|-ic\b|\.vcheck\b|svg|::before|::after/.test(sel) ? 3 : 4.5;

function failures(pick) {
  const bad = new Set();
  for (const r of ELEMENTS.filter(pick)) {
    for (const theme of r.darkOnly ? ["dark"] : ["light", "dark"]) {
      const fg = textColour(r.sel, r.media, theme), bg = surface(r.sel, r.media, theme);
      if (!fg || !bg) continue;
      const x = ratio(fg, bg);
      if (x < need(r.sel)) bad.add(`${where(r)} (${theme}): ${hex(fg)} on ${hex(bg)} = ${x.toFixed(2)}:1`);
    }
  }
  return [...bad];
}

test("the theme's own text colours read on its surfaces, light and dark", () => {
  const PAIRS = [["--ink", "--paper"], ["--graphite", "--paper"], ["--muted", "--paper"], ["--muted", "--mist"], ["--muted", "--sand"],
    ["--on-ink", "--ink"], ["--error", "--paper"], ["--paper", "--orange-ink"], ["--ink", "--orange-soft"], ["--ink", "--teal-soft"], ["--ink", "--sun-soft"]];
  for (const theme of ["light", "dark"]) {
    for (const [fg, bg] of PAIRS) {
      const r = ratio(rgb(`var(${fg})`, THEME[theme]), rgb(`var(${bg})`, THEME[theme]));
      assert.ok(r >= 4.5, `${theme}: ${fg} on ${bg} is ${r.toFixed(2)}:1, under 4.5:1`);
    }
    for (const [fg, bg] of [["--teal", "--paper"], ["--teal", "--teal-soft"]]) {   // verified marks and icons: 3:1
      const r = ratio(rgb(`var(${fg})`, THEME[theme]), rgb(`var(${bg})`, THEME[theme]));
      assert.ok(r >= 3, `${theme}: ${fg} marks on ${bg} are ${r.toFixed(2)}:1, under 3:1`);
    }
  }
});

test("every text colour reads on the surface under it, in both themes", () => {
  const bad = failures((r) => r.decls.color && see(r.decls.color.v));
  assert.deepEqual(bad, [], "use var(--ink), --graphite or --muted for text on the page, and a fixed colour only on a fixed block:\n" + bad.join("\n"));
});

test("every background reads with the text colour it takes from above, in both themes", () => {
  const bad = failures((r) => r.decls.background && see(r.decls.background.v) && !clear(r.decls.background.v) && !r.decls.color);
  assert.deepEqual(bad, [], "give the block a text colour of its own, or set it again for dark mode:\n" + bad.join("\n"));
});
