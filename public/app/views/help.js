/* help view (WP-G): /help, /about, /resources, /letter (spec 6.13).
   The claim finder on /help searches listing names in the browser and links
   each match to /update/<id>?rel=run. Nothing is sent from this page.
   PROMOTE: .v-help .hp-figs (a house-tint banner with three athletes) could
   become a shared "banner trio" next to communityHeader(). */
import * as A from "../app.js";
import { site, PAGES } from "../page-meta.js";

const TRIO = ["basketball", "tennis", "skiing"];

/* ---------- /help ---------- */
function card({ ic, title, body, action, cls = "", extra = "" }) {
  return `<section class="hp-card${cls ? " " + cls : ""}" aria-labelledby="${title.replace(/\W+/g, "-").toLowerCase()}-h"><div class="hp-card-in"><span class="hp-ic" aria-hidden="true">${A.icon(ic, 24)}</span><h2 id="${title.replace(/\W+/g, "-").toLowerCase()}-h">${A.esc(title)}</h2><p>${A.esc(body)}</p>${action ? `<div class="hp-act">${action}</div>` : ""}</div>${extra}</section>`;
}

function helpPage() {
  const art = `<div class="hp-figs" aria-hidden="true">${TRIO.map((k, i) => `<span class="hp-slot${i === 0 ? " is-first" : ""}">${A.fig(k, { color: "#1A1A1A", big: true })}</span>`).join("")}</div>`;
  const finder = `<div class="hp-find" role="search" aria-label="Find your organization">
<label class="hp-flabel" for="hp-claim">Organization name</label>
<div class="hp-frow">${A.icon("search", 20)}<input id="hp-claim" type="search" autocomplete="off" enterkeyhint="search" aria-describedby="hp-claim-st" aria-controls="hp-claim-list"></div>
<p class="hp-status" id="hp-claim-st" role="status">Type two or more letters of the name.</p>
<div class="hp-results" id="hp-claim-list" hidden></div></div>`;
  const html = `<div class="hp-page">
<div class="hp-hero" style="--t:${A.toneOf("multi").t}">${art}<div class="hp-text"><h1 tabindex="-1">Help build this</h1><p class="hp-sub">Add what's missing, fix what's wrong, or confirm your organization's listing.</p></div></div>
<div class="hp-cards">
${card({ ic: "badge-check", title: "Claim your organization", body: "Run or work for an organization listed here? Sign in with the verified email to manage its details.", action: A.btn("Manage your organization", "/manage", "ink"), cls: "hp-card--claim", extra: finder })}
${card({ ic: "plus", title: "Add a program", body: "Know a program we're missing? Tell us and we'll check it.", action: A.btn("Add a program", "/add/program", "ink") })}
${card({ ic: "building-2", title: "Add an organization", body: "Know an organization that runs adaptive sports programs? Tell us and we'll check it.", action: A.btn("Add an organization", "/add/organization", "line") })}
${card({ ic: "calendar-plus", title: "Add an event", body: "Share a clinic, tryout, game day or meetup.", action: A.btn("Add an event", "/add/event", "line") })}
${card({ ic: "square-pen", title: "Suggest a fix", body: "Spot something wrong? Every listing has a Suggest a fix link.", action: A.btn("Find a listing", "", "line", { attrs: 'data-open="search"', icon: "search" }) })}
</div>
${A.letterBlock({ source: "help" })}</div>`;
  return { title: site(PAGES.help.title), description: PAGES.help.description, html };
}

/* ---------- /about ---------- */
const ABOUT = [
  ["is-v", "badge-check", "Verified", "The organization itself confirmed its listing with us. Only then does a listing show the check. We're asking every organization."],
  ["", "search-check", "Checked by our team", "Our team checked the listing against public sources, like the organization's own website. When we know the month, the listing shows it."],
  ["is-u", "info", "Not verified yet", "We found the organization in public sources, and we check its website regularly. Not verified doesn't mean anything is wrong. Check the website before you go."],
  ["", "calendar-check", "Dates", "Every listing shows the last day we checked that the organization's website works."],
  ["", "lock", "Privacy", "We show the city and state. An organization's address, phone number and email show only when the organization says yes."],
  ["", "building-2", "Who runs each program", "Organizations run their own programs. We help you find them."],
  ["", "accessibility", "Accessibility", null],
];
function aboutPage() {
  const a11y = `We aim to meet WCAG 2.2 AA. If something doesn't work for you, tell us through <a href="/help">Suggest a fix</a>.`;
  const secs = ABOUT.map(([cls, ic, h, body], i) => `<section class="ab-sec"${ic === "accessibility" ? ' id="accessibility"' : ""} aria-labelledby="ab-${i}"><span class="ab-ic ${cls}" aria-hidden="true">${A.icon(ic, 24)}</span><div class="ab-text"><h2 id="ab-${i}">${A.esc(h)}</h2><p>${body == null ? a11y : A.esc(body)}</p></div></section>`).join("");
  const html = `<div class="ab"><div class="ab-head"><h1 tabindex="-1">How we check listings</h1></div><div class="ab-grid">${secs}</div><p class="ab-legal">Read our <a href="/privacy">privacy policy</a> and <a href="/terms">terms of use</a>.</p>${A.helpBand()}</div>`;
  return { title: site(PAGES.about.title), description: PAGES.about.description, html };
}

/* ---------- /resources: Guides ----------
   Named for what is in it (Alec, 2026-10-17: every page here is a resource, so the
   word told nobody anything). Grants, programs and events keep their own doors. */
function resourcesPage() {
  const card = (id, key, title, body, label, href) => `<article class="rs-card" aria-labelledby="${id}">${A.plate(key, { kind: "card", wide: true, cls: "rs-plate" })}<div class="rs-body"><h2 id="${id}">${A.esc(title)}</h2><p>${A.esc(body)}</p><div class="rs-act">${A.btn(label, href, "ink", { icon: "arrow-right" })}</div></div></article>`;
  const html = `<div class="rs"><h1 tabindex="-1">Guides</h1><p class="rs-lede">Getting started, and life beyond sports. New guides join as we write them.</p>
${card("rs-sports", "multi", "Every sport, explained", "What each sport is, who plays, what you need and how to start.", "Browse the sports", "/sports")}
${card("rs-vob", "veteran-meetup", "Veteran-owned business directories by state", "State lists of veteran-owned businesses, gathered in one place.", "Open the directories", "/resources/veteran-owned-businesses")}</div>`;
  return { title: site(PAGES.guides.title), description: PAGES.guides.description, html };
}

/* ---------- /build: Build with us ----------
   The project is open source (MIT). Alec, 2026-10-18: "a project people believe in and
   want to contribute to... make it easy to contribute." Ideas carry no dates: an idea
   becomes "Live" when it is on the site, never before. */
const REPO = "https://github.com/adapttolife/adaptivesportsnearme";
const TOOLS = [
  { state: "Live", ic: "search", h: "Find programs, grants and events", body: "Search by place or sport. Every listing shows when we last checked it.", href: "/" },
  { state: "Live", ic: "book-open", h: "Guides", body: "Every sport explained: who plays, what you need and how to start.", href: "/resources" },
  { state: "Idea", ic: "file-text", h: "Grant helper", body: "Walk an athlete or an organization through a grant application, start to finish, so it gets sent.", issue: 74 },
  { state: "Idea", ic: "trophy", h: "Tournament brackets", body: "Run a bracket for a clinic, a league or a game day, free and right here.", issue: 75 },
  { state: "Idea", ic: "wrench", h: "Gear to borrow, try or rent", body: "One search for adaptive equipment near you, from every program and lending library that has it. A sit-ski your size, a handcycle to try, before anyone spends thousands.", issue: 76 },
];
const WRITE = (subject) => "mailto:hello@adaptivesportsnearme.com?subject=" + encodeURIComponent(subject);
const HELP = [
  { ic: "code", h: "Write code", body: "Pick an issue marked good first issue. A person reviews every change before it goes live.", label: "See good first issues", href: REPO + "/labels/good%20first%20issue", ext: true },
  { ic: "square-pen", h: "Fix a listing", body: "No code needed. Add a program we're missing, or suggest a fix on any listing.", label: "Help build this", href: "/help" },
  { ic: "pencil", h: "Write a guide", body: "Know a sport well? Help us explain it to someone trying it for the first time.", label: "Write to us", href: WRITE("I'd like to write a guide") },
  { ic: "accessibility", h: "Test it", body: "Use the site with a screen reader, switch control or voice, and tell us what gets in the way.", label: "How to test it", href: REPO + "/issues/77", ext: true },
];
const HOW = [
  { ic: "link", h: "In public", body: "The code, the plans and every change are on GitHub for anyone to read." },
  { ic: "lock", h: "Free to use", body: "The code is MIT licensed: take it, change it, build on it." },
  { ic: "badge-check", h: "Checked by people", body: "A person reviews every code change before it goes live, and every listing before it's published." },
];
function buildPage() {
  const sec = ({ ic, h, body }, extra = "", tag = "") => `<section class="ab-sec"><span class="ab-ic" aria-hidden="true">${A.icon(ic, 24)}</span><div class="ab-text"><h3>${tag}${A.esc(h)}</h3><p>${A.esc(body)}</p>${extra}</div></section>`;
  const go = (label, href, ext) => `<a class="tlink" href="${A.esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ""}>${A.esc(label)}${A.icon(ext ? "external-link" : "arrow-right", 18)}${ext ? '<span class="sr"> (opens in a new tab)</span>' : ""}</a>`;
  const tools = TOOLS.map((t) => sec(t, t.href ? go("Open it", t.href) : go("Join the conversation", `${REPO}/issues/${t.issue}`, true), `<span class="bw-tag${t.state === "Live" ? " is-live" : ""}">${t.state}</span>`)).join("");
  const help = HELP.map((t) => sec(t, go(t.label, t.href, t.ext))).join("");
  const html = `<div class="ab bw"><div class="ab-head"><h1 tabindex="-1">Build this with us</h1>
<p class="bw-lede">Adaptive Sports Near Me is open source. The code is public and free to use, and anyone can help make it better.</p>
<div class="btns">${A.btn("See the code on GitHub", REPO, "ink", { external: true })}${A.btn("How to contribute", REPO + "/blob/staging/CONTRIBUTING.md", "line", { external: true })}</div></div>
<h2 class="bw-h">Where we're going</h2><p class="bw-p">The directory is the first tool. We're building the whole bench of tools the adaptive sports community needs, in the open, one at a time.</p>
<div class="ab-grid">${tools}</div>
<h2 class="bw-h">What do you see?</h2><p class="bw-p">Tell us the tool you wish existed. The best ideas come from people who play, coach and run programs.</p>
<div class="btns">${A.btn("Share an idea", REPO + "/discussions/categories/ideas", "ink", { external: true })}${A.btn("Email us instead", WRITE("An idea for Adaptive Sports Near Me"), "line", { icon: "mail" })}</div>
<h2 class="bw-h">How you can help</h2><div class="ab-grid">${help}</div>
<h2 class="bw-h">How we build</h2><div class="ab-grid">${HOW.map((t) => sec(t)).join("")}</div></div>`;
  return { title: site(PAGES.build.title), description: PAGES.build.description, html };
}

/* ---------- /letter ---------- */
function letterPage() {
  const stack = ["basketball", "grant", "event"].map((k) => A.avatar(k, 64)).join("");
  const html = `<div class="lt"><div class="lt-stack" aria-hidden="true">${stack}</div><h1 tabindex="-1">Get the letter</h1>${A.letterBlock({ source: "letter", heading: false })}</div>`;
  return { title: site(PAGES.letter.title), description: PAGES.letter.description, html };
}

/* ---------- /privacy and /terms ----------
   Plain language, written from an audit of the code and the live site (October 20, 2026).
   Every sentence describes what the site does today; when the site changes how it
   handles data, change these pages in the same change. test/app-shell.test.js checks
   the promises it can. Two things live outside this repo: Cloudflare adds its Web
   Analytics script at the edge (a zone setting), and beehiiv sends the letter's
   confirmation email. */
const UPDATED = "October 20, 2026";
const MAIL = `<a href="mailto:hello@adaptivesportsnearme.com">hello@adaptivesportsnearme.com</a>`;
const ATL = `<a href="https://adapttolife.org">Adapt To Life NFP</a>`;
function legalPage({ meta, h1, intro, sections }) {
  const secs = sections.map(([h, body], i) => `<section class="lg-sec" aria-labelledby="lg-${i}"><h2 id="lg-${i}">${h}</h2>${body}</section>`).join("");
  return {
    title: site(meta.title), description: meta.description,
    html: `<article class="lg"><div class="lg-head"><h1 tabindex="-1">${h1}</h1><p class="lg-date">Last updated ${UPDATED}</p><p class="lg-intro">${intro}</p></div>${secs}</article>`,
  };
}

function privacyPage() {
  return legalPage({
    meta: PAGES.privacy, h1: "Privacy policy",
    intro: `Adaptive Sports Near Me is a free directory of adaptive sports programs, grants and events. It's run by ${ATL}, a 501(c)(3) nonprofit, and on this page "we" means Adapt To Life. Here's what we collect, why, who helps us run the site, and the choices you have.`,
    sections: [
      ["The short version", `<ul>
<li>You can search and browse without an account and without telling us who you are.</li>
<li>We collect what you choose to send us, like your email for the letter or what you type into a form.</li>
<li>Like any website, ours receives technical details from each visit, such as your IP address. Our host keeps them for a month at most.</li>
<li>We don't sell or rent personal information, and we don't run ads or advertising trackers.</li>
<li>An organization's email, phone and street address show only when the organization says yes.</li></ul>`],
      ["What you send us", `<p><b>The letter.</b> When you sign up, we collect your email address and whether you asked for a first look at new features. Our newsletter service, beehiiv, keeps your subscription, sends the letter and notes which page you signed up on. You'll get an email from beehiiv with a link to confirm your signup. It opens on beehiiv's site and brings you back here. If you don't confirm, you may get one reminder. We also keep our own record of your signup, and a copy goes to Adapt To Life's team inbox. We use your email only for the letter and, if you asked, a first look at new features.</p>
<p><b>Forms.</b> When you add an organization, program or event, suggest a fix, or tell us you're with an organization, we collect what you type, including your email. Email is optional when you add an event or suggest a fix, unless you tell us you're with the organization. Each submission goes into our records and to Adapt To Life's team inbox, and a person reads it before anything on the site changes. If you gave your email, we send you a receipt and may write to you with a question. We may publish the organization, program or event details you send. We never publish your email.</p>
<p><b>Managing an organization's listing.</b> If you're with an organization, our team can connect your email to its listing. You then sign in with a link we email you, which works once and expires after a short time. You stay signed in on that browser for up to 30 days, or until you sign out. Changes you save show on the listing right away, and everywhere else on the site within a few minutes. The email you sign in with stays private. The listing's public email and phone are the ones you enter, and they show only when you choose to show them.</p>`],
      ["What your browser keeps", `<p>The site saves a few things in your own browser so it works the way you left it: your light or dark setting, the last place you searched, the sports you looked at most recently, and whether you closed the beta notice. While a tab is open, it also keeps track of the pages you've opened and where you were on each, so going back returns you to the same spot. None of this is sent to us, and you can clear it in your browser settings.</p>
<p><b>Cookies.</b> We don't set cookies while you browse. If you sign in to manage an organization's listing, we set one cookie, only to keep you signed in, for up to 30 days. Cloudflare's security checks may set a cookie of their own if they need to confirm you're a person.</p>
<p><b>Use my location</b> asks your browser for your position, then finds the nearest city on your device. Your exact position is not sent to us. When you search for a place, it becomes part of the page address, like /near/Chicago, IL, and our host sees it like any page address.</p>`],
      ["What our host and tools see", `<p><b>Cloudflare</b> hosts and protects the site. Like any web host, it receives the technical details of each visit: your IP address, the page address, your browser and device, the page you came from, your language, and an approximate location worked out from your IP address. It keeps these request logs, and details of any errors, for up to seven days so we can find and fix problems. Its security tools keep a sample of requests for up to 31 days. Your browser may also tell Cloudflare when a page fails to load.</p>
<p><b>Visit counts.</b> Cloudflare Web Analytics counts visits for us: which pages are opened, where visitors came from, how fast pages load, and visitors' browser, device type and country. It doesn't set cookies.</p>
<p><b>Spam checks.</b> When you start using one of our forms, or open the blog's menu, a check from Cloudflare Turnstile loads to tell people from bots. When you send a form, we use your IP address for that check and to limit how often one connection can send. We don't save your IP address with what you sent.</p>
<p><b>Fonts.</b> The site's fonts load from Google Fonts, so your browser contacts Google's servers.</p>
<p><b>Maps.</b> Map images load from OpenFreeMap when you open a map, and on a listing's page when the organization has said yes to showing its address. If that map has no saved location, your browser asks the U.S. Census Bureau's address lookup where the organization's address is. It sends the organization's address, not yours. We use the same lookup when an organization updates its address.</p>
<p><b>Accessibility tool.</b> Every page except the blog loads an accessibility tool from UserWay, which lets you change how pages look and read. To work, it saves a random ID and your settings in your browser, and receives that ID with the address of each page you open. UserWay's own privacy policy applies to it.</p>
<p><b>The letter and the blog.</b> For each letter, beehiiv can record whether it was opened and which links were clicked, so we can tell what's useful. Our blog posts are written in beehiiv too, and pictures in a post may load from beehiiv's servers.</p>`],
      ["Who we share it with", `<p>We don't sell or rent personal information. Services that help us run the site include Cloudflare (hosting, security, visit counts and spam checks), Google (our email and the site's fonts), beehiiv (the letter and the blog), UserWay (the accessibility tool) and OpenFreeMap (map images). Each has its own privacy policy, and each sees your IP address when your browser contacts it, as any website does. The U.S. Census Bureau's address lookup receives organization addresses, not yours. We may also share information when the law requires it, or to protect the site and the people who use it.</p>`],
      ["Organization information", `<p>Listings describe organizations and the programs they offer. We gather their details from public sources, like an organization's own website and national directories, from people who send updates, and from organizations themselves. Our tools also read organizations' public websites, including contact pages, to keep listings current.</p>
<p>An organization's contact details can belong to a person who works there, like a program coordinator. Here's what shows, and when:</p>
<ul>
<li>City and state show on the listing.</li>
<li>Email and phone show only when the organization says yes to showing them. Until then, we also work to keep contact details out of its description and notes.</li>
<li>The street address, and a map on the listing's page, show only when the organization says yes to showing its address.</li>
<li>Once it says yes to either, its listing also shows its ZIP code.</li></ul>
<p>Grant listings show the contact details grant makers publish for their grants.</p>
<p>If you're with an organization, you can correct its listing, confirm it, or ask us to remove it. Once your email is connected to the listing, you can also hide it yourself. <a href="/help">Start here</a>.</p>`],
      ["How long we keep it", `<p>Your letter subscription lasts until you unsubscribe. We keep form submissions, signup records and sign-in records, including the emails about them, until we no longer need them or you ask us to delete them. Sign-in links expire after a short time, and a sign-in lasts up to 30 days. Cloudflare deletes its request logs within seven days and its security samples within 31 days.</p>`],
      ["Your choices", `<p>Every letter has an unsubscribe link. To see, correct or delete what you've sent us, email ${MAIL}. You can clear what your browser keeps in your browser settings. We don't track you across other websites, so there's nothing for a Do Not Track or Global Privacy Control signal to turn off.</p>`],
      ["Children", `<p>The directory is for everyone, including families. Our forms, the letter and organization sign-in are meant for adults. We don't knowingly collect personal information from children under 13. If you think a child has sent us something, email us and we'll delete it.</p>`],
      ["Keeping it safe", `<p>The site uses encrypted connections. No website is perfectly secure, so please don't send sensitive details, like health information, through our forms. Our services may handle information in the United States and other countries.</p>`],
      ["Changes to this policy", `<p>If we change this policy, we'll update this page and the date at the top. If a change affects how we use your email, we'll tell subscribers in the letter before it takes effect.</p>`],
      ["Questions", `<p>Email ${MAIL}. Adaptive Sports Near Me is a project of ${ATL}, a 501(c)(3) nonprofit.</p>`],
    ],
  });
}

function termsPage() {
  return legalPage({
    meta: PAGES.terms, h1: "Terms of use",
    intro: `These terms cover your use of Adaptive Sports Near Me (adaptivesportsnearme.com), a free directory run by ${ATL}, a 501(c)(3) nonprofit. On this page "we" means Adapt To Life. By using the site, you agree to these terms. If you don't agree, please don't use the site.`,
    sections: [
      ["What this site is", `<p>A free directory of adaptive sports programs, grants and events. We list them; we don't run them. Apart from Adapt To Life's own Hustle & Heart Fund, every organization, grant maker and event host listed here is independent of us.</p>
<p>Listings come from public sources, like organizations' websites and national directories, and from what organizations and visitors send us. Information can be incomplete or out of date, and the directory doesn't list every program. We're adding and checking more all the time.</p>`],
      ["What our labels mean", `<ul>
<li><b>Verified</b> means the organization itself confirmed its listing with us and chose to show its contact details.</li>
<li><b>Checked by our team</b> means our team checked the listing against public sources, like the organization's website. When we know the month, the listing shows it.</li>
<li><b>Website checked</b> is the last date our automatic check found the organization's website working.</li></ul>
<p>None of these is an endorsement, a safety review, or a promise about an organization's programs, staff, facilities or insurance.</p>`],
      ["Before you go", `<p>Contact the organization to confirm times, costs, eligibility, accessibility and what to bring. For events, check with the host, since dates and places can change. Adaptive sports are physical, so talk with your doctor or care team about what's right for you. Taking part is between you and the organization, which may ask you to sign its own waiver.</p>`],
      ["Grants", `<p>We list grants from grant makers. You apply on the grant maker's site, and the grant maker decides. We can't promise that a grant is open, that its details are current, or that you'll receive one.</p>`],
      ["What you send us", `<p>When you add an organization, program or event, or suggest a fix, tell us what you know to be true. A person reviews each one before anything on the site changes, and we may edit it or decide not to publish it. By sending details about an organization, program or event, you let us publish, edit and share them as part of the directory.</p>
<p>Don't send other people's personal information without their permission, and don't send spam, ads or anything unlawful.</p>`],
      ["Managing an organization's listing", `<p>If you tell us you're with an organization, or manage its listing, you're telling us you're allowed to speak for it.</p>
<ul>
<li>Don't share your sign-in link.</li>
<li>Changes you save show on the listing right away, and everywhere else on the site within a few minutes. You're responsible for them.</li>
<li>Show only details the organization agrees to make public. By saving, you let us publish, edit and share them as part of the directory.</li>
<li>You can hide the listing at any time.</li>
<li>We may change or hide a listing, or end someone's access, if something looks wrong, unsafe or against these terms.</li></ul>`],
      ["Using the site", `<p>Use the site to find and share adaptive sports, and link to any page you like. Don't try to break the site, overload it or get around its protections, and don't use contact details from listings to send spam. Please don't copy the directory in bulk with automated tools. If you'd like to build something with the listings, write to us. We may block anyone who misuses the site.</p>`],
      ["The code is open source", `<p>The code behind the site is open source under the <a href="${REPO}/blob/main/LICENSE">MIT License</a>. You're welcome to use it, change it and build on it under that license.</p>`],
      ["Our content", `<p>The sport drawings belong to Adapt To Life and aren't covered by the MIT License (see our <a href="${REPO}/blob/main/THIRD_PARTY_NOTICES.md">license notes</a>). Please ask before using them. The Adaptive Sports Near Me and Adapt To Life names and logos belong to Adapt To Life. Names of organizations, programs and grants belong to their owners.</p>
<p>If you think something on the site uses your work without permission, email us and we'll look into it.</p>`],
      ["Links to other sites", `<p>The site links to organizations' and grant makers' websites, and to other sites we think are useful. We don't control them and aren't responsible for their content or practices.</p>`],
      ["No guarantees", `<p>We work to keep the directory accurate, but we provide the site as is, without warranties of any kind. To the fullest extent the law allows, Adapt To Life isn't liable for any loss or injury that comes from using the site, relying on a listing, or taking part in a listed program, grant or event. Some places don't allow these limits, so they may not all apply to you.</p>`],
      ["Illinois law", `<p>Illinois law governs these terms, without regard to conflict of law rules. Any dispute about these terms or the site will be heard in the state courts of Lake County, Illinois, or the federal court for the Northern District of Illinois, and you agree to those courts.</p>`],
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
  if (ctx.path === "/build") return buildPage();
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
    list.innerHTML = shown.map((x) => A.programRow(x.p, {}).replace(/href="[^"]*"/, `href="/update/${A.esc(x.p.id)}?rel=run"`)).join("");
    list.hidden = !shown.length;
    if (!hits.length) {
      status.innerHTML = `We couldn't find an organization called "${A.esc(input.value.trim())}". Check the spelling, or <a href="/add/program">add it</a>.`;
    } else if (hits.length > 6) {
      status.textContent = `Showing 6 of ${hits.length}. Type more of the name to narrow it down.`;
    } else {
      status.textContent = hits.length === 1 ? "1 organization matches. Choose it to confirm the details." : `${hits.length} organizations match. Choose yours to confirm the details.`;
    }
  };
  const onInput = () => { clearTimeout(t); t = setTimeout(run, 120); };
  input.addEventListener("input", onInput);
  if (input.value) run();
  return () => { clearTimeout(t); input.removeEventListener("input", onInput); };
}
