/* help view (WP-G): /help, /about, /resources, /letter (spec 6.13).
   The claim finder on /help searches listing names in the browser and links
   each match to /update/<id>?rel=run. Nothing is sent from this page.
   PROMOTE: .v-help .hp-figs (a house-tint banner with three athletes) could
   become a shared "banner trio" next to communityHeader(). */
import * as A from "../app.js";

const DESC = "Find adaptive sports programs, grants and events near you. Free, no account needed.";
const TRIO = ["basketball", "tennis", "skiing"];

/* ---------- /help ---------- */
function card({ ic, title, body, action, cls = "", extra = "" }) {
  return `<section class="hp-card${cls ? " " + cls : ""}" aria-labelledby="${title.replace(/\W+/g, "-").toLowerCase()}-h"><div class="hp-card-in"><span class="hp-ic" aria-hidden="true">${A.icon(ic, 24)}</span><h2 id="${title.replace(/\W+/g, "-").toLowerCase()}-h">${A.esc(title)}</h2><p>${A.esc(body)}</p>${action ? `<div class="hp-act">${action}</div>` : ""}</div>${extra}</section>`;
}

function helpPage() {
  const art = `<div class="hp-figs" aria-hidden="true">${TRIO.map((k, i) => `<span class="hp-slot${i === 0 ? " is-first" : ""}">${A.fig(k, { color: "#1A1A1A", big: true })}</span>`).join("")}</div>`;
  const finder = `<div class="hp-find" role="search" aria-label="Find your program">
<label class="hp-flabel" for="hp-claim">Program name</label>
<div class="hp-frow">${A.icon("search", 20)}<input id="hp-claim" type="search" autocomplete="off" enterkeyhint="search" aria-describedby="hp-claim-st" aria-controls="hp-claim-list"></div>
<p class="hp-status" id="hp-claim-st" role="status">Type two or more letters of the name.</p>
<div class="hp-results" id="hp-claim-list" hidden></div></div>`;
  const html = `<div class="hp-page">
<div class="hp-hero" style="--t:${A.toneOf("multi").t}">${art}<div class="hp-text"><h1 tabindex="-1">Help build this</h1><p class="hp-sub">This directory is new and still growing. Here is how you can help.</p></div></div>
<div class="hp-cards">
${card({ ic: "badge-check", title: "Claim your program", body: "Run a program listed here? Find it and confirm the details.", cls: "hp-card--claim", extra: finder })}
${card({ ic: "plus", title: "Add a program", body: "Know a program we're missing? Tell us and we'll check it.", action: A.btn("Add a program", "/add/program", "ink") })}
${card({ ic: "calendar-plus", title: "Add an event", body: "Share a clinic, tryout, game day or meetup.", action: A.btn("Add an event", "/add/event", "line") })}
${card({ ic: "square-pen", title: "Suggest a fix", body: "Spot something wrong? Every listing has a Suggest a fix link.", cls: "hp-card--wide", action: A.btn("Find a listing", "", "line", { attrs: 'data-open="search"', icon: "search" }) })}
</div>
${A.letterBlock({ source: "help" })}</div>`;
  return { title: "Help build this · Adaptive Sports Near Me", description: DESC, html };
}

/* ---------- /about ---------- */
const ABOUT = [
  ["is-v", "badge-check", "Verified", "The program itself confirmed its listing with us. Only then does a listing show the check. We're asking every program."],
  ["", "search-check", "Checked by our team", "A person on our team checked the listing against public sources, like the program's own website. The listing says when."],
  ["is-u", "info", "Not verified yet", "We found the program in public sources, and we check its website regularly. Not verified doesn't mean anything is wrong. Check the website before you go."],
  ["", "calendar-check", "Dates", "Every listing shows the last day we checked that the program's website works."],
  ["", "lock", "Privacy", "We show the city and state. A program's address, phone number and email show only when the program says yes."],
  ["", "building-2", "We list programs; we don't run them", "Adaptive Sports Near Me is a free directory from Adapt To Life. Each program is run by its own organization."],
  ["", "accessibility", "Accessibility", null],
];
function aboutPage() {
  const a11y = `We aim to meet WCAG 2.2 AA. If something doesn't work for you, tell us through <a href="/help">Suggest a fix</a> or <a href="/add/program">the Add a program form</a>.`;
  const secs = ABOUT.map(([cls, ic, h, body], i) => `<section class="ab-sec" aria-labelledby="ab-${i}"><span class="ab-ic ${cls}" aria-hidden="true">${A.icon(ic, 24)}</span><div class="ab-text"><h2 id="ab-${i}">${A.esc(h)}</h2><p>${body == null ? a11y : A.esc(body)}</p></div></section>`).join("");
  const html = `<div class="ab"><div class="ab-head"><h1 tabindex="-1">How we check listings</h1></div><div class="ab-grid">${secs}</div><p class="ab-legal">Read our <a href="/privacy">privacy policy</a> and <a href="/terms">terms of use</a>.</p>${A.helpBand()}</div>`;
  return { title: "How we check listings · Adaptive Sports Near Me", description: DESC, html };
}

/* ---------- /resources ---------- */
function resourcesPage() {
  const html = `<div class="rs"><h1 tabindex="-1">Resources</h1>
<article class="rs-card" aria-labelledby="rs-vob">${A.plate("veteran-meetup", { kind: "card", wide: true, cls: "rs-plate" })}<div class="rs-body"><h2 id="rs-vob">Veteran-owned business directories by state</h2><p>State lists of veteran-owned businesses, gathered in one place.</p><div class="rs-act">${A.btn("Open the directories", "/resources/veteran-owned-businesses", "ink", { icon: "arrow-right" })}</div></div></article></div>`;
  return { title: "Resources · Adaptive Sports Near Me", description: DESC, html };
}

/* ---------- /letter ---------- */
function letterPage() {
  const stack = ["basketball", "grant", "event"].map((k) => A.avatar(k, 64)).join("");
  const html = `<div class="lt"><div class="lt-stack" aria-hidden="true">${stack}</div><h1 tabindex="-1">Get the letter</h1>${A.letterBlock({ source: "letter" })}</div>`;
  return { title: "Get the letter · Adaptive Sports Near Me", description: DESC, html };
}

/* ---------- /privacy and /terms ----------
   Plain-language drafts (October 15, 2026) for Adapt To Life's counsel to review.
   Every sentence describes what the site does today; when the site changes how it
   handles data, change these pages in the same change. */
const UPDATED = "October 15, 2026";
const MAIL = `<a href="mailto:hello@adaptivesportsnearme.com">hello@adaptivesportsnearme.com</a>`;
function legalPage({ title, description, h1, intro, sections }) {
  const secs = sections.map(([h, body], i) => `<section class="lg-sec" aria-labelledby="lg-${i}"><h2 id="lg-${i}">${h}</h2>${body}</section>`).join("");
  return {
    title: `${title} · Adaptive Sports Near Me`, description,
    html: `<article class="lg"><div class="lg-head"><h1 tabindex="-1">${h1}</h1><p class="lg-date">Last updated ${UPDATED}</p><p class="lg-intro">${intro}</p></div>${secs}</article>`,
  };
}

function privacyPage() {
  return legalPage({
    title: "Privacy policy", h1: "Privacy policy",
    description: "What Adaptive Sports Near Me collects, why, and the choices you have.",
    intro: `Adaptive Sports Near Me is a free directory of adaptive sports programs, grants and events, run by Adapt To Life, a 501(c)(3) nonprofit. This page explains what we collect, why we collect it, and the choices you have.`,
    sections: [
      ["The short version", `<ul>
<li>You can use the directory without an account and without telling us anything about yourself.</li>
<li>We collect only what you choose to send us: your email for the letter, and what you type into our forms.</li>
<li>We don't sell your information, and we don't use advertising or tracking cookies.</li>
<li>A program's street address, phone and email show only when the program says yes.</li></ul>`],
      ["What you send us", `<p><b>The letter.</b> When you sign up, we collect your email address and whether you asked for a first look at new features. Our newsletter service, beehiiv, keeps your subscription and sends the letter. We also keep a record of your signup and send you a receipt from hello@adaptivesportsnearme.com.</p>
<p><b>Forms.</b> When you add a program or event, suggest a fix, or confirm a listing you run, we collect what you type, including your email if you give one. A person on our team reads every submission. If you give your email, we send a receipt and may write to you with a question. We may publish the program or event details you send. We never publish your email.</p>`],
      ["What your browser keeps", `<p>The site remembers your last place search and the sports you looked at recently, in your own browser, so it can show them next time. It also remembers if you closed the beta notice. You can clear this in your browser settings. We don't set cookies.</p>
<p><b>Use my location</b> asks your browser for your position, then finds the nearest city on your device. Your exact position is not sent to us. The city you search for appears in the page address, like any search.</p>`],
      ["Behind the scenes", `<p>Our host, Cloudflare, delivers and protects the site. Like any web host, it handles technical details such as your IP address and browser, and counts visits in total.</p>
<p>When you send a form or sign up for the letter, Cloudflare Turnstile checks that you're a person, not a bot, and we use your IP address for a moment to stop floods of submissions. We don't store your IP address with what you sent.</p>
<p>The letter may record whether it was opened and which links were clicked, so we can tell what's useful. beehiiv provides this.</p>
<p>The site's fonts load from Google Fonts, so your browser contacts Google's servers to fetch them. When you open a map, its map images load from OpenFreeMap.</p>
<p>An accessibility tool from UserWay lets you change how the site looks and reads. If you use it, it remembers your settings on your device, and UserWay's own privacy policy applies to it.</p>`],
      ["Who we share it with", `<p>We don't sell or rent personal information. A few services help us run the site and handle information only to do that work: Cloudflare (hosting, security and form protection), Google (our email and the site's fonts), beehiiv (the letter), UserWay (the accessibility tool) and OpenFreeMap (map images, when you open a map). We may also share information when the law requires it, or to protect the site and the people who use it.</p>`],
      ["Program information", `<p>Listings describe programs, not people. We gather program details from public sources, like a program's own website and national directories, and from programs themselves. We show a program's city and state. Its street address, phone and email show only when the program confirms its listing and says yes.</p>
<p>If you run a program, you can correct your listing, confirm it, or ask us to remove it. <a href="/help">Start here</a>.</p>`],
      ["How long we keep it", `<p>Your letter subscription stays until you unsubscribe. Form submissions stay as long as we need them to review your note and keep the directory accurate. You can ask us to delete what you sent at any time.</p>`],
      ["Your choices", `<p>Every letter has an unsubscribe link, and it works right away. To see, correct or delete what you sent us, email ${MAIL}.</p>`],
      ["Children", `<p>The directory is for everyone, including families. Our forms and the letter are meant for adults. We don't knowingly collect personal information from children under 13. If you think a child has sent us something, email us and we'll delete it.</p>`],
      ["Changes to this policy", `<p>If we change this policy, we'll update this page and the date at the top. If a change affects how we use your email, we'll tell subscribers in the letter before it takes effect.</p>`],
      ["Questions", `<p>Email ${MAIL}. Adaptive Sports Near Me is a project of <a href="https://adapttolife.org">Adapt To Life</a>, a 501(c)(3) nonprofit.</p>`],
    ],
  });
}

function termsPage() {
  return legalPage({
    title: "Terms of use", h1: "Terms of use",
    description: "The terms for using Adaptive Sports Near Me, a free directory run by Adapt To Life.",
    intro: `These terms cover your use of Adaptive Sports Near Me (adaptivesportsnearme.com), a free directory run by Adapt To Life, a 501(c)(3) nonprofit. By using the site, you agree to them.`,
    sections: [
      ["What this site is", `<p>A free directory of adaptive sports programs, grants and events. We list them; we don't run them. Each program, grant maker and event host is its own organization.</p>
<p>We build listings from public sources, like program websites and national directories, and from what programs and visitors send us. Information can be incomplete or out of date, and the directory doesn't list every program. We're adding and checking more every week.</p>`],
      ["What our labels mean", `<ul>
<li><b>Verified</b> means the program itself confirmed its listing with us.</li>
<li><b>Checked by our team</b> means a person on our team checked the listing against public sources in the month shown.</li>
<li><b>Website checked</b> is the date we last saw the program's website working.</li></ul>
<p>None of these is an endorsement, a safety review, or a promise about a program's quality, staff, facilities or insurance.</p>`],
      ["Before you go", `<p>Contact the program to confirm times, costs, eligibility, accessibility and what to bring. Adaptive sports are physical, so talk with your doctor or care team about what's right for you. Taking part is between you and the program, and many programs ask participants to sign their own waiver.</p>`],
      ["Grants", `<p>We list grants offered by grant makers. You apply on the grant maker's site, and the grant maker decides. We can't promise that a grant is open or that you'll receive one.</p>`],
      ["What you send us", `<p>When you add a program or event or suggest a fix, tell us what you know to be true. A person reviews every submission before anything changes, and we may edit it for clarity or decide not to publish it. By sending program or event details, you allow us to publish, edit and share them as part of the directory.</p>
<p>Don't send other people's personal information without their permission, and don't send spam, ads or anything unlawful. If you confirm a listing as the person who runs a program, you're telling us you can speak for that program, and you agree to show the details you approve.</p>`],
      ["Using the site", `<p>Use the site to find and share adaptive sports. Sharing links to listings and pages is welcome. Don't try to break the site, overload it, get around its protections, or copy the directory in bulk with automated tools.</p>`],
      ["Links to other sites", `<p>Listings link to program and grant maker websites. We don't control those sites and aren't responsible for their content or practices.</p>`],
      ["Our content", `<p>The site's design, writing and artwork belong to Adapt To Life. Program names and logos belong to their programs. Please ask before reusing our artwork.</p>`],
      ["No guarantees", `<p>We work to keep the directory accurate, but we provide it as is, without warranties of any kind. To the fullest extent the law allows, Adapt To Life isn't liable for any loss or injury that comes from using the site or from taking part in a listed program, grant or event.</p>`],
      ["Changes to these terms", `<p>We may update these terms. When we do, we'll change the date at the top. Using the site after a change means you accept the updated terms.</p>`],
      ["Questions", `<p>Email ${MAIL}. Our <a href="/privacy">privacy policy</a> explains what we collect and why.</p>`],
    ],
  });
}

export async function render(ctx) {
  if (ctx.path === "/privacy") return privacyPage();
  if (ctx.path === "/terms") return termsPage();
  if (ctx.path === "/about") return aboutPage();
  if (ctx.path === "/resources") return resourcesPage();
  if (ctx.path === "/letter") return letterPage();
  return helpPage();
}

/* ---------- claim finder ---------- */
const fold = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

export function mount(root, ctx) {
  const input = root.querySelector("#hp-claim");
  if (!input) return () => {};
  const list = root.querySelector("#hp-claim-list"), status = root.querySelector("#hp-claim-st");
  const items = ctx.data.items.map((p) => ({ p, f: " " + fold(p.name) + " " + fold(p.rawName) }));
  let t = null;
  const run = () => {
    const q = fold(input.value);
    if (q.length < 2) {
      list.hidden = true; list.innerHTML = "";
      status.textContent = "Type two or more letters of the name.";
      return;
    }
    const toks = q.split(" ");
    const hits = items.filter((x) => toks.every((w) => x.f.includes(w)))
      .map((x) => ({ ...x, s: x.f.startsWith(" " + q) ? 0 : x.f.includes(" " + toks[0]) ? 1 : 2 }))
      .sort((a, b) => a.s - b.s || a.p.name.localeCompare(b.p.name));
    const shown = hits.slice(0, 6);
    list.innerHTML = shown.map((x) => A.programRow(x.p, {}).replace(`href="/programs/${A.esc(x.p.id)}"`, `href="/update/${A.esc(x.p.id)}?rel=run"`)).join("");
    list.hidden = !shown.length;
    if (!hits.length) {
      status.innerHTML = `We couldn't find a program called "${A.esc(input.value.trim())}". Check the spelling, or <a href="/add/program">add it as a new program</a>.`;
    } else if (hits.length > 6) {
      status.textContent = `Showing 6 of ${hits.length}. Type more of the name to narrow it down.`;
    } else {
      status.textContent = hits.length === 1 ? "1 program matches. Choose it to confirm the details." : `${hits.length} programs match. Choose yours to confirm the details.`;
    }
  };
  const onInput = () => { clearTimeout(t); t = setTimeout(run, 120); };
  input.addEventListener("input", onInput);
  if (input.value) run();
  return () => { clearTimeout(t); input.removeEventListener("input", onInput); };
}
