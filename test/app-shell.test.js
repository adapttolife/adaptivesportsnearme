// The site's front end, read as text: public/index.html (the one shell every
// page route serves, src/pages.js) and public/app/ (the app that draws every
// page from the live API). These pin the shell's contract with the Worker and
// the forms' contract with the API, plus the copy rules that hold everywhere.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import worker from "../src/index.js";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const count = (text, needle) => text.split(needle).length - 1;
const SHELL = read("public/index.html");
const APP = read("public/app/app.js");
const APP_FILES = readdirSync(new URL("../public/app/", import.meta.url), { recursive: true })
  .map((f) => `public/app/${String(f).replace(/\\/g, "/")}`).sort();
const JS = APP_FILES.filter((f) => f.endsWith(".js"));
const CSS = APP_FILES.filter((f) => f.endsWith(".css"));
const VIEWS = JS.filter((f) => f.startsWith("public/app/views/"));

// A small JavaScript scanner: drops // and /* */ comments and returns the text
// of every string literal and every template-literal segment, following ${...}
// nesting and skipping regex literals, so a "//" inside a URL string or a quote
// inside a regex never derails it.
const KEYWORDS = new Set(["return", "typeof", "case", "in", "of", "void", "delete", "throw", "new", "instanceof", "yield", "await", "else", "do"]);
function scan(src) {
  const strings = [];
  let code = "", i = 0, last = "", word = "", template = false, buf = "";
  const depth = []; // open ${ ... } expressions, each with its own brace depth
  const isWord = (c) => /[A-Za-z0-9_$]/.test(c);
  while (i < src.length) {
    const c = src[i];
    if (template) {
      if (c === "\\") { buf += src.slice(i, i + 2); i += 2; continue; }
      if (c === "`") { strings.push(buf); buf = ""; template = false; code += c; last = ")"; word = ""; i++; continue; }
      if (c === "$" && src[i + 1] === "{") { strings.push(buf); buf = ""; template = false; depth.push(0); code += "${"; last = "{"; word = ""; i += 2; continue; }
      buf += c; i++; continue;
    }
    if (c === "/" && src[i + 1] === "/") { const end = src.indexOf("\n", i); i = end === -1 ? src.length : end; continue; }
    if (c === "/" && src[i + 1] === "*") { const end = src.indexOf("*/", i + 2); i = end === -1 ? src.length : end + 2; code += " "; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1, s = "";
      while (j < src.length && src[j] !== c && src[j] !== "\n") { if (src[j] === "\\") { s += src.slice(j, j + 2); j += 2; } else s += src[j++]; }
      strings.push(s); code += c + c; i = j + 1; last = ")"; word = ""; continue;
    }
    if (c === "`") { template = true; buf = ""; code += c; i++; continue; }
    if (c === "/" && (!last || /[(,=:[!&|?{};+\-*%<>~^]/.test(last) || KEYWORDS.has(word))) {
      let j = i + 1, inClass = false;
      for (; j < src.length && src[j] !== "\n"; j++) {
        if (src[j] === "\\") { j++; continue; }
        if (src[j] === "[") inClass = true;
        else if (src[j] === "]") inClass = false;
        else if (src[j] === "/" && !inClass) break;
      }
      j++;
      while (j < src.length && /[a-z]/i.test(src[j])) j++;
      code += src.slice(i, j); i = j; last = ")"; word = ""; continue;
    }
    if (c === "{" && depth.length) depth[depth.length - 1]++;
    if (c === "}" && depth.length) {
      if (depth[depth.length - 1] === 0) { depth.pop(); template = true; buf = ""; code += c; i++; continue; }
      depth[depth.length - 1]--;
    }
    code += c;
    if (isWord(c)) { word = (isWord(last) ? word : "") + c; last = c; }
    else if (!/\s/.test(c)) { last = c; word = ""; }
    i++;
  }
  return { code, strings };
}

const NOT_VERIFIED = /\bunverified\b|not yet verified/i;

test("the scanner sees strings and templates, not comments", () => {
  const words = (src) => scan(src).strings.join("\n");
  assert.doesNotMatch(words('// never say "unverified"\n/* Unverified */ const a = 1;'), NOT_VERIFIED);
  assert.match(words('const t = `<b>${ok ? `Verified` : `Unverified`}</b>`; // https://x'), NOT_VERIFIED);
  assert.match(words("const u = 'https://example.org/'; const t = 'Not yet verified';"), NOT_VERIFIED);
  assert.match(words('const h = `<a href="https://a.example">${x ? `in https://b.example Unverified` : ""}</a>`;'), NOT_VERIFIED);
  assert.match(words('s.replace(/[&<>"\']/g, (c) => c); const w = "unverified";'), NOT_VERIFIED);
  assert.deepEqual(scan('x = a / b / "c"; y = /"/g.test(z) ? "d" : `e${f({ g: "h" })}i`;').strings, ["c", "d", "e", "h", "i"]);
});

// Alec, 2026-10-14: Verified (a check) means the program itself confirmed its
// listing; lists never say "unverified" or "Not yet verified". Comments may
// explain the rule; no string the app can show may break it. ListingArt's
// trustLine/unverifiedText write those words, so the app must not call them.
test("the app never shows the words Unverified or Not yet verified", () => {
  for (const file of JS) {
    const { code, strings } = scan(read(file));
    const hit = strings.find((s) => NOT_VERIFIED.test(s));
    assert.equal(hit, undefined, `${file} shows: ${hit}`);
    assert.doesNotMatch(code, /\b(?:trustLine|unverifiedText)\s*\(/, `${file} calls a ListingArt helper that writes "Not yet verified"`);
  }
  assert.ok(VIEWS.length >= 10, "the views are where they were");
});

test("no page or asset of the app points at the /design/ prototypes", () => {
  for (const file of [...JS, ...CSS, "public/index.html"]) {
    assert.ok(!read(file).includes("/design/"), `${file} names /design/`);
  }
  assert.ok(CSS.length >= 10);
});

test("the shell has what the Worker and the app rely on", () => {
  const head = SHELL.slice(0, SHELL.indexOf("</head>"));
  // src/pages.js injectMeta replaces exactly these: the one block, title and description.
  assert.equal(count(SHELL, "<!--asnm:meta-->"), 1);
  assert.equal(count(SHELL, "<!--/asnm:meta-->"), 1);
  assert.ok(head.indexOf("<!--asnm:meta-->") > 0 && head.indexOf("<!--asnm:meta-->") < head.indexOf("<!--/asnm:meta-->"), "the block is in <head>, open then close");
  assert.equal((SHELL.match(/<title>[^<]*<\/title>/g) || []).length, 1);
  assert.equal((SHELL.match(/<meta name="description" content="[^"]*">/g) || []).length, 1);
  // Turnstile (explicit render, forms draw their own widget) and the UserWay widget load
  // from app.js after the page has drawn, never from the shell ahead of the page's data.
  assert.ok(!SHELL.includes("challenges.cloudflare.com") && !SHELL.includes("cdn.userway.org"));
  assert.match(APP, /const TURNSTILE_SRC = "https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js\?render=explicit";/);
  assert.match(between(APP, "function turnstileApi() {", "\n}\n"), /ensureTurnstile\(\);/);
  assert.match(APP, /loadScript\(USERWAY_SRC, \{ "data-account": "sFogOSJsXe" \}\)/);
  assert.ok(head.includes('<script type="module" src="/app/app.js"></script>'));
});

test("the shell's inline scripts and every app file are valid JavaScript", () => {
  let inline = 0;
  for (const [, attrs = "", body] of SHELL.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    if (!body.trim() || /application\/ld\+json/.test(attrs)) continue;
    new vm.Script(body);
    inline++;
  }
  assert.ok(inline >= 1);
  // No build step stands between these files and the browser.
  for (const file of JS) execFileSync(process.execPath, ["--check", fileURLToPath(new URL(`../${file}`, import.meta.url))], { stdio: "pipe" });
});

// Field names are the API's (src/index.js handleSubmitProgram); a renamed field
// on either side silently drops what a person typed.
function between(src, from, to) {
  const a = src.indexOf(from), b = to ? src.indexOf(to, a + from.length) : src.length;
  assert.ok(a >= 0 && b > a, `${from} ... ${to}`);
  return src.slice(a, b);
}
const fieldNames = (src) => new Set([...src.matchAll(/\bname(?::\s*|=)"([a-z]+)"/g)].map((m) => m[1]));

test("the forms post the API's field names to the API's endpoints", () => {
  const forms = read("public/app/views/forms.js");
  const server = read("src/index.js");
  const addProgram = between(forms, "function addProgram(", "\n}\n");
  const addEvent = between(forms, "function addEvent(", "\n}\n");
  const update = between(forms, "function update(", "\n}\n");
  assert.match(addProgram, /data-send="\/api\/submit-program"/);
  assert.match(addEvent, /data-send="\/api\/submit-event"/);
  assert.match(update, /data-send="\/api\/submit-program"/);
  for (const [form, names] of [[addProgram, ["pn", "org", "url", "em", "notes"]], [addEvent, ["en", "ed", "ee", "et", "url", "org", "em", "notes"]], [update, ["lid", "notes", "rel", "em"]]]) {
    const posted = fieldNames(form);
    for (const name of names) assert.ok(posted.has(name), `missing field ${name}`);
  }
  // Every field a form posts (bar the honeypot) is one the server reads.
  for (const name of fieldNames(forms)) {
    if (name === "company") continue;
    assert.ok(server.includes(`data.${name}`), `src/index.js never reads the field ${name}`);
  }
  assert.ok(server.includes("data.company"), "the honeypot is still checked");
});

test("the letter form posts an email (field em) to /api/subscribe", () => {
  const letter = between(APP, '<form class="letter-form"', "</form>");
  assert.match(letter, /data-send="\/api\/subscribe"/);
  assert.match(letter, /<input [^>]*name="em" type="email"/);
  assert.match(letter, /name="company"/);
  const server = between(read("src/index.js"), "async function handleSubscribe(", "export function parseBetaFlag(");
  assert.ok(server.includes("str(data.em)") && server.includes("data.beta"));
});

test("every form the app sends carries a Turnstile token for the ASNM site key", () => {
  assert.match(APP, /const TS_KEY = "0x4AAAAAADr2WPepRgjp8g-R";/);
  assert.match(APP, /sitekey: TS_KEY/);
  const send = between(APP, "async function sendForm(", "\n}\n");
  assert.match(send, /body\.cf_token = await turnstileToken\(form\);/);
  assert.ok(send.indexOf("cf_token") < send.indexOf("fetch("), "the token is in the body before it is posted");
  assert.match(send, /fetch\(form\.getAttribute\("data-send"\)/);
});

// 2026-10-03: a pasted "mailto:" prefix was removed before the email was checked
// (the old site and site-nav.js still do it). The new app's letter form sends the
// field as typed, and /api/subscribe does not strip it (handleSubmitProgram does).
test("a pasted mailto: prefix never reaches the letter list", async () => {
  const PUB = JSON.parse(read("wrangler.json")).vars.BEEHIIV_PUBLICATION_ID;
  const seen = [], network = globalThis.fetch, log = console.error;
  console.error = () => {}; // the stubbed provider makes the signup fail closed, by design
  globalThis.fetch = async (url) => {
    if (String(url).startsWith("https://challenges.cloudflare.com/")) return Response.json({ success: true });
    seen.push(String(url));
    return new Response("stop", { status: 500 });
  };
  try {
    await worker.fetch(new Request("https://adaptivesportsnearme.com/api/subscribe", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ em: "mailto:person@example.test", cf_token: "ok" }),
    }), { ENV_NAME: "production", TURNSTILE_SECRET_KEY: "test", INTAKE: {}, BEEHIIV_API_KEY: "test", BEEHIIV_PUBLICATION_ID: PUB }, {});
  } finally { globalThis.fetch = network; console.error = log; }
  const lookup = seen.find((u) => u.includes("/by_email/"));
  assert.ok(lookup, "the signup reached the newsletter lookup");
  const clientStrips = /\^mailto:/.test(scan(between(APP, "async function sendForm(", "\n}\n")).code);
  assert.ok(clientStrips || lookup.includes("/by_email/person%40example.test"), `looked up ${lookup}`);
});

// One h1 per page: the page's own title. The footer's site name is the brand,
// styled like a title but not a heading (2026-10-14).
test("the footer never adds a second h1 to the page", () => {
  const footer = between(APP, "function footer(", "\n}\n");
  assert.ok(footer.includes('class="ft-name"'), "the site name is in the footer");
  assert.ok(!/<h1[\s>]/.test(footer), "no h1 in the footer");
});

// Phone Back closes a sheet opened by a tap instead of leaving the page.
test("sheets opened by a tap get their own Back step", () => {
  assert.match(APP, /export function pushSheet\(\)/);
  assert.match(between(APP, 'const op = t.closest("[data-open]");', "return;\n    }"), /pushSheet\(\);/);
  assert.match(read("public/app/views/program.js"), /A\.pushSheet\(\);/);
  assert.match(between(APP, 'window.addEventListener("popstate"', "render();\n  });"), /closeOverlay\(\{ mode: "pop" \}\)/);
});

// The header sticks to the top (#top). Anything else that sticks to the top of the
// page must sit below it (top uses --top-h), or it slides under the header when you
// scroll. Sticky parts inside a sheet or the map dialog have their own scroll box.
test("everything that sticks to the top of the page sits below the sticky header", () => {
  const dir = new URL("../public/app/", import.meta.url);
  const css = readdirSync(dir, { recursive: true }).filter((f) => f.endsWith(".css")).map((f) => [f, read(`public/app/${f}`)]);
  const OWN_SCROLL = /^(#top|\.dr-head|\.v-map \.mp-all)$/;
  let checked = 0;
  for (const [file, text] of css) {
    for (const m of text.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*position:\s*sticky[^{}]*)\}/g)) {
      const selector = m[1].trim().split("\n").pop().trim(), body = m[2];
      const top = (body.match(/(?:^|[;\s])top:\s*([^;]+)/) || [])[1];
      if (!top || OWN_SCROLL.test(selector)) continue;
      checked++;
      assert.match(top, /var\(--top-h/, `${file}: ${selector} sticks at top: ${top.trim()}, under the sticky header`);
    }
  }
  assert.ok(checked >= 6, `checked only ${checked} sticky rules`);
  assert.match(read("public/app/app.css"), /scroll-padding-top:\s*calc\(var\(--top-h\)/, "jumps land below the header");
});

// On phones the home hero's drawing joins the flow above the headline. The hero is a
// flex container, so the phone rule must stack it; as a row, the drawing took half the
// width and the search box shrank to a sliver (390px, October 15).
test("on phones the home hero stacks the drawing above the headline and search", () => {
  const css = read("public/app/views/home.css").replace(/\/\*[\s\S]*?\*\//g, "");
  const rule = (src, sel) => (src.match(new RegExp(`(?:^|\\})\\s*${sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^{}]*)\\}`)) || [])[1] || "";
  const phone = (css.match(/@media \(max-width: 767px\) \{([\s\S]*?)\n\}/) || [])[1] || "";
  assert.match(rule(phone, ".v-home .hb-art"), /position:\s*relative/, "the drawing is in the flow on phones");
  if (/display:\s*flex/.test(rule(css, ".v-home .hb")))
    assert.match(rule(phone, ".v-home .hb"), /flex-direction:\s*column/, "the flex hero stacks on phones");
  // The sharp look clamps the headline beside the desktop drawing; on phones that
  // clamp went negative (0px wide, one word per line), so phones lift it.
  const app = read("public/app/app.css").replace(/\/\*[\s\S]*?\*\//g, "");
  if (/max-width:\s*calc\(/.test(rule(app, '[data-look="sharp"] .v-home .hb h1'))) {
    const phones = [...app.matchAll(/@media \(max-width: 767px\) \{([\s\S]*?)\n\}/g)].map((m) => rule(m[1], '[data-look="sharp"] .v-home .hb h1')).join(" ");
    assert.match(phones, /max-width:\s*none/, "the headline gets the full width on phones");
  }
});

// The letter's thank-you says what happens next: a new signup confirms its email first.
test("the letter's thank-you asks a new subscriber to confirm, and the confirmation lands on a note", () => {
  const send = between(APP, "async function sendForm(", "\n}\n");
  assert.match(send, /out\.confirm \? "Almost done\. Check your inbox for an email from Adaptive Sports Near Me and tap Confirm\."/);
  assert.match(send, /out\.existing \? "You're already on the list/);
  assert.match(APP, /get\("confirmed"\) === "1"/);
  assert.match(APP, /You're confirmed\. The letter will come to your inbox/);
});
