/* The listing page and its 4:5 share poster.
   One listing, told as a postcard: the athlete is the picture, the place stamp
   says where, the line under the name says when we last checked it, and the
   website is the one action. Distance only comes from A.relation(); nothing is
   guessed. The tag in the picture's lower right says "Verified" (the program
   confirmed its listing with us) or "Not verified yet", and opens the story of
   how listings are checked (Alec, 2026-10-14).

   PROMOTE (scoped here as .v-program-*, candidates for app.css):
   - .pg-links      48px link rows with a leading icon, optional sub line and a chevron
   - .pg-book       desktop booking box (the grant page 6.10 wants the same box)
   - .pg-poster     the 4:5 share poster (an og:image / Instagram export twin, 11.4)
   - .pg-chips      non-interactive text chips, optionally led by a 40px avatar */
import * as A from "../app.js";

const L = window.ListingArt;
// Group scenes never draw under 56px (3.2), so they get no avatar in a chip.
const GROUP_SCENE = new Set(["event", "veteran-meetup", "art-therapy", "grant", "multi", "soccer", "football", "lacrosse", "handball", "softball", "volleyball", "triathlon", "nordicskiing"]);
const FLOOR_PROP = new Set(["soccer", "sledhockey", "golf", "boccia", "curling", "goalball", "blindsports"]);
const INVERTS = new Set(["court", "racquet", "field", "snow", "water", "trail", "calm"]);

// Set when the share sheet was opened from this page (a pushed history entry),
// so closing it can step back instead of stacking another entry.
let SHARE_FROM = null;
// Which share control opened the sheet, so focus can go back to it on close.
let RETURN_TO = null;

const enc = encodeURIComponent;
const lowerFirst = (s) => s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
const upperFirst = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const isTrio = (p) => Array.isArray(p.trio) && p.trio.length >= 2;
const sportLabel = (p) => isTrio(p) ? "Multi-sport" : A.sportName(p.key);
const sportNoun = (p) => (p.key === "multi" ? "multi-sport programs" : lowerFirst(A.sportName(p.key)));
const statewideText = (p) => /no single city listed$/.test(A.placeText(p));

/** Short place for the stamp and the poster: "Tampa, FL", "Florida, statewide", "Escambia County, FL". */
// The stamp is one short line ("Tampa, FL" or "Mississippi"): the full place
// ("Mississippi, no single city listed") is in the line under the name.
function stampLabel(p) {
  if (!p.state) return null;
  if (p.placed) return A.placeText(p);
  return A.stateName(p.state);
}
/** Place words for the title: "Tampa, FL" or "Florida". */
function titlePlace(p) {
  if (p.placed) return A.placeText(p);
  return p.state ? A.stateName(p.state) : null;
}
function backHref(p) {
  if (p.placed) return "/near/" + enc(A.placeText(p));
  if (p.state) return "/states/" + p.state;
  return "/";
}
function host(u) {
  try { return new URL(u).hostname.replace(/^www\./i, ""); } catch (_) { return null; }
}

/* ---------- the hero (3.2, 3.3) ---------- */
function hero(p) {
  const label = stampLabel(p);
  const stamp = label ? `<div class="pg-stamp" aria-hidden="true"><span class="pg-stamp-map">${A.stateOutline(p.state, { size: 40, dots: p.placed ? [p] : [], fill: !p.placed })}</span><span class="pg-stamp-text"><span>${A.esc(label)}</span></span></div>` : "";
  return `<div class="pg-hero has-vtag${label ? " has-stamp" : ""}">
${A.plate(p, { kind: "hero" })}
<button type="button" class="pg-hb pg-back" data-back="${A.esc(backHref(p))}" aria-label="Back">${A.icon("arrow-left", 22)}</button>
<a class="pg-hb pg-share" href="/programs/${A.esc(p.id)}?share=1" data-poster="hero" aria-label="Share this program">${A.icon("share", 20)}</a>
<div class="pg-edge">${stamp}${vtag(p)}</div></div>`;
}

/* ---------- Verified: the corner tag, the date line and the story (Alec, 2026-10-14) ---------- */
function vtag(p) {
  return `<button type="button" class="pg-vtag${p.verified ? " is-v" : ""}" data-verify aria-haspopup="dialog">${A.icon(p.verified ? "badge-check" : "info", 18)}<span>${p.verified ? "Verified" : "Not verified yet"}</span></button>`;
}
/** "Website checked Oct 8" (or "Listed Oct 14") and "Checked by our team, September 2026". */
function freshBits(p) {
  const out = [];
  const f = A.freshText(p);
  if (f) out.push(f);
  const ml = p.teamChecked && p.checkedMonth && L && L.monthLabel ? L.monthLabel(p.checkedMonth) : null;
  if (ml) out.push("Checked by our team, " + ml);
  return out;
}
function freshLine(p) {
  const bits = freshBits(p);
  return bits.length ? `<p class="pg-fresh num">${bits.map((b) => `<span>${A.esc(b)}</span>`).join("")}</p>` : "";
}
function verifyHtml(p) {
  const fix = A.btn("Suggest a fix", `/update/${p.id}`, "line");
  const run = A.btn("I run this program", `/update/${p.id}?rel=run`, "ink");
  const bits = freshBits(p);
  const facts = bits.length ? `<ul class="vx-facts">${bits.map((b) => `<li>${A.icon("check", 18)}<span class="num">${A.esc(b)}</span></li>`).join("")}</ul>` : "";
  const body = p.verified
    ? `<p>The program itself confirmed this listing with us.</p>${facts}<p>Schedules change, so check the program's website before you go.</p>`
    : `<p>We found this program in public sources, like its own website, and we check that website regularly.</p>${facts}<p><b>Verified</b> means the program itself confirmed its listing with us. We're asking every program.</p><p>Not verified doesn't mean anything is wrong. Check the program's website before you go.</p>`;
  return `<div class="ss-top"><button type="button" class="iconbtn" data-close aria-label="Close">${A.icon("x", 24)}</button><h2 id="vx-h" tabindex="-1">${p.verified ? "Verified" : "Not verified yet"}</h2></div>
<div class="ss-body vx-body">${body}<div class="btns vx-btns">${p.verified ? fix : run + fix}</div><a class="tlink vx-more" href="/about">How we check listings${A.icon("arrow-right", 18)}</a></div>`;
}

/* ---------- About: "Who it's for" and "Sports here" (6.8.5) ---------- */
function sportChips(text) {
  const seen = new Set();
  const parts = String(text).split(/[;,]/).map((s) => s.trim().replace(/\.$/, "")).filter((s) => s && !/^see\b/i.test(s));
  const out = [];
  for (const part of parts) {
    const label = upperFirst(part);
    if (seen.has(label.toLowerCase())) continue;
    seen.add(label.toLowerCase());
    const k0 = L && L.symbolKey ? L.symbolKey({ sportLabel: part }) : null;
    const k = k0 ? A.picGroup(k0) : null;
    const withAv = k && k !== "multi" && !GROUP_SCENE.has(k);
    out.push(`<li class="pg-chip${withAv ? " has-av" : ""}">${withAv ? A.avatar(k, 40) : ""}<span>${A.esc(label)}</span></li>`);
  }
  return out.length ? `<ul class="pg-chips">${out.join("")}</ul>` : "";
}
function about(p) {
  const { sports, served } = A.parseDesc(p);
  let inner = "";
  if (served) inner += `<h3 class="pg-h3">Who it's for</h3><p>${A.esc(upperFirst(served.replace(/\s+/g, " ")))}</p>`;
  const chips = sports ? sportChips(sports) : "";
  if (chips) inner += `<h3 class="pg-h3">Sports here</h3>${chips}`;
  if (!inner && p.desc && !/Sports and activities:|Athletes served:/i.test(p.desc)) inner = `<p>${A.esc(p.desc)}</p>`;
  if (!inner) inner = `<p class="pg-quiet">We don't have a description for this program yet.${p.website ? " The program's website has the details." : ""}</p>`;
  return `<section class="pg-sec" aria-labelledby="pg-about"><h2 id="pg-about">About this program</h2>${inner}</section>`;
}
/* Karen's veteran research (meetups, equine therapy, art therapy) carries what
   happens, the approach, when, where (a venue name only), format, cost and who. */
const KIND = { "veteran-meetup": "Veteran meetup", "equine-therapy": "Equine therapy", "art-therapy": "Art therapy" };
// In the directory those facts ride in the description, in this order:
// "[Programs: X.] What happens. [Approach: Y.] [When: Z.] [Who it's for: W.]", then
// "Also equine therapy: ..." for a second program at the same place.
const KIND_OF = { "veteran meetup": "veteran-meetup", "equine therapy": "equine-therapy", "art therapy": "art-therapy" };
function readMeet(text) {
  const parts = String(text).split(/\s*\b(Programs|Approach|When|Who it's for):\s*/);
  const m = { program: "", what: "", how: "", when: "", who: "" };
  let what = parts[0].trim();
  for (let i = 1; i < parts.length; i += 2) {
    const k = parts[i], v = (parts[i + 1] || "").trim();
    if (k === "Programs") {
      const j = v.indexOf(". ");
      if (j > 0) { m.program = v.slice(0, j); what = (what + " " + v.slice(j + 2)).trim(); } else m.program = v.replace(/\.$/, "");
    } else if (k === "Approach") m.how = v.replace(/\.$/, "");
    else if (k === "When") m.when = v.replace(/\.$/, "");
    else m.who = v.replace(/\.$/, "");
  }
  m.what = what;
  return m;
}
function meetFrom(p) {
  if (!KIND[p.key] || !p.desc || !/\b(Programs|Approach|When|Who it's for):/.test(p.desc)) return null;
  const [main, ...rest] = String(p.desc).split(/\s(?=Also [A-Za-z ]+?:)/);
  const also = rest.map((r) => {
    const mm = /^Also ([A-Za-z ]+?):\s*([\s\S]*)$/.exec(r);
    if (!mm) return null;
    return { ...readMeet(mm[2]), kind: KIND_OF[mm[1].toLowerCase()] || "" };
  }).filter(Boolean);
  return { meet: { ...readMeet(main), cost: p.cost || "" }, also };
}
function meetDl(m) {
  const row = (k, v) => v ? `<div><dt>${k}</dt><dd>${A.esc(v)}</dd></div>` : "";
  return `<dl class="pg-facts">${row("Approach", m.how)}${row("When", m.when)}${row("Where", m.where)}${row("Format", m.format)}${row("Cost", m.cost)}${row("Who it's for", m.who)}</dl>`;
}
function meetup(p) {
  const m = p.meet;
  if (!m) return "";
  const prog = m.program && m.program.toLowerCase() !== String(p.name).toLowerCase() ? m.program : "";
  const title = p.key === "veteran-meetup" ? "The meetup" : "The program";
  const also = (p.also || []).map((x) => `<h3 class="pg-h3">Also here: ${A.esc(KIND[x.kind] || "Another program")}</h3>${x.program ? `<p class="pg-meet-prog">${A.esc(x.program)}</p>` : ""}${x.what ? `<p>${A.esc(x.what)}</p>` : ""}${meetDl(x)}`).join("");
  return `<section class="pg-sec pg-meet" aria-labelledby="pg-meet"><h2 id="pg-meet">${title}</h2>${prog ? `<p class="pg-meet-prog">${A.esc(prog)}</p>` : ""}${m.what ? `<p>${A.esc(m.what)}</p>` : ""}
${meetDl(m)}${also}
<p class="pg-quiet">Times change, so confirm the next date with them before you go.</p></section>`;
}
function facts(p) {
  if (p.meet) return "";
  const rows = [["Ages", p.ages], ["Cost", p.cost], ["Equipment", p.equipment]].filter(([, v]) => v != null && String(v).trim());
  if (!rows.length) return "";
  return `<dl class="pg-facts">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${A.esc(String(v).trim())}</dd></div>`).join("")}</dl>`;
}
function wherePlay(p) {
  let body;
  if (p.placed) {
    body = `<p>${A.esc(A.placeText(p))}. We show the city only, so check the website for the exact place.</p><a class="tlink" href="/near/${enc(A.placeText(p))}">Programs near ${A.esc(A.placeText(p))}${A.icon("arrow-right", 18)}</a>`;
  } else if (p.state) {
    body = `<p>This program serves ${A.esc(A.stateName(p.state))} and doesn't list a single city.</p><a class="tlink" href="/states/${A.esc(p.state)}">Programs in ${A.esc(A.stateName(p.state))}${A.icon("arrow-right", 18)}</a>`;
  } else {
    body = `<p>This listing doesn't say where it is yet. If you know, <a href="/update/${A.esc(p.id)}">suggest a fix</a>.</p>`;
  }
  return `<section class="pg-sec" aria-labelledby="pg-where"><h2 id="pg-where">${p.meet ? "Where it meets" : "Where you'll play"}</h2>${body}</section>`;
}
function links(p) {
  const row = (href, ic, label, sub, attrs = "") => `<li><a class="pg-link" href="${A.esc(href)}" ${attrs}><span class="pg-link-ic">${A.icon(ic, 20)}</span><span class="pg-link-text"><span class="pg-link-label">${A.esc(label)}</span>${sub ? `<span class="pg-link-sub">${A.esc(sub)}</span>` : ""}</span>${A.icon("chevron-right", 20)}</a></li>`;
  const runSub = p.verified ? "Update your listing." : "Confirm your listing to get the Verified check.";
  return `<ul class="pg-links">${row(`/update/${p.id}`, "pencil", "Suggest a fix")}${row(`/update/${p.id}?rel=run`, "badge-check", "I run this program", runSub)}${row(`/programs/${p.id}?share=1`, "share", "Share", "", 'data-poster="links"')}</ul>`;
}

/* ---------- More of this sport, from the listing's own city (6.8.9) ---------- */
function more(p, D) {
  const pool = D.items.filter((x) => x.id !== p.id && x.key === p.key);
  if (!pool.length) return "";
  const noun = sportNoun(p);
  const st = p.state ? A.stateName(p.state) : null;
  const where = A.whereFromProgram(p);
  const ctx = { where: p.placed ? where : null, single: true, sameCity: true };
  const sec = (title, inner, seeAll) => `<section class="pg-sec pg-more" aria-labelledby="pg-more">${A.sectionHead({ title, id: "pg-more", seeAll })}${inner}</section>`;
  const rows = (list) => `<div class="rows">${list.map((x) => A.programRow(x, ctx)).join("")}</div>`;
  if (p.state) {
    const lad = A.ladder(where, pool);
    const close = [...lad.inCity, ...lad.near];
    const rest = [...lad.elsewhere, ...lad.statewide];
    if (p.placed && close.length) {
      const first = close.slice(0, 6);
      const extra = rest.slice(0, 6 - first.length);
      const elsewhere = extra.length ? `<h3 class="pg-h3 pg-more-sub">Elsewhere in ${A.esc(st)}</h3>${rows(extra)}` : "";
      return sec(`More ${noun} near ${where.short}`, rows(first) + elsewhere, { label: `See all near ${where.short}`, href: `/near/${enc(A.placeText(p))}?s=${enc(p.key)}` });
    }
    if (rest.length) return sec(`More ${noun} in ${st}`, rows(rest.slice(0, 6)), { label: `See all in ${st}`, href: `/states/${p.state}?s=${enc(p.key)}` });
    const out = A.nearestOutside(where, pool, 6).flatMap((g) => g.items);
    if (out.length) return sec(`More ${noun === "multi-sport programs" ? noun : noun + " programs"}`, `<div class="rows">${out.map((x) => A.programRow(x, { ...ctx, outside: true })).join("")}</div>`, { label: "See all", href: `/sports/${enc(p.key)}` });
    return "";
  }
  const list = pool.slice().sort((a, b) => (b.verified - a.verified) || a.name.localeCompare(b.name)).slice(0, 6);
  return sec(`More ${noun === "multi-sport programs" ? noun : noun + " programs"}`, rows(list), { label: "See all", href: `/sports/${enc(p.key)}` });
}

/* ---------- actions: phone row, desktop booking box, sticky bar ---------- */
function visitBtn(p, { full = false } = {}) {
  const cls = full ? "pg-full" : "";
  return p.website
    ? A.btn("Visit website", p.website, "ink", { external: true, cls })
    : A.btn("Suggest a website", `/update/${p.id}`, "line", { cls });
}
function hostNote(p) {
  const h = p.website && host(p.website);
  return h ? `<p class="pg-host">Opens ${A.esc(h)}</p>` : `<p class="pg-host">We don't have a website for this program yet.</p>`;
}
function actionRow(p) {
  // data-sticky-twin: the phone sticky bar steps aside while this row is on screen (one ink button at a time).
  return `<div class="pg-acts" data-sticky-twin>${visitBtn(p, { full: true })}${hostNote(p)}</div>`;
}
function bookBox(p) {
  return `<div class="pg-book"><div class="pg-book-in"><p class="pg-book-kind">${A.esc(sportLabel(p))}${stampLabel(p) ? ` · ${A.esc(stampLabel(p))}` : ""}</p>${A.trust(p, "short") ? `<p class="pg-book-trust">${A.trust(p, "short")}</p>` : ""}${visitBtn(p, { full: true })}${hostNote(p)}<a class="tlink pg-book-upd" href="/update/${A.esc(p.id)}">Suggest a fix</a></div></div>`;
}

/* ---------- the share poster (3.2, 6.8.12) ---------- */
function poster(p) {
  const trio = isTrio(p);
  const key = trio ? "multi" : p.key;
  const tone = A.toneOf(key);
  const inv = !trio && INVERTS.has(A.familyOf(key));
  const art = trio ? A.trioFigs(p.trio, "poster").replace('class="trio"', 'class="trio pp-trio"') : A.fig(key, { big: true });
  const place = stampLabel(p);
  const label = `${p.name}, ${lowerFirst(sportLabel(p))}${place ? ", " + place : ""}. Adaptive Sports Near Me`;
  return `<div class="pg-poster${inv ? " is-inv" : ""}${trio ? " is-trio" : ""}${FLOOR_PROP.has(key) ? " is-floor" : ""}" style="--t:${tone.t};--d:${tone.d}" role="img" aria-label="${A.esc(label)}"><span class="pp-in">
<span class="pp-sport">${A.esc(sportLabel(p))}</span>
<span class="pp-art">${art}</span>
<span class="pp-name">${A.esc(p.name)}</span>
${place ? `<span class="pp-place">${A.esc(place)}</span>` : ""}
<span class="pp-foot"><span class="pp-url">adaptivesportsnearme.com</span><span class="pp-disc"><img src="/app/logo.svg" alt="" width="36" height="36"></span></span>
</span></div>`;
}
function shareHtml(p) {
  const native = typeof navigator !== "undefined" && typeof navigator.share === "function";
  return `<div class="ss-top"><button type="button" class="iconbtn" data-close aria-label="Close">${A.icon("x", 24)}</button><h2 id="pg-sh-h">Share this program</h2></div>
<div class="ss-body pg-sh-body">${poster(p)}
<div class="btns pg-sh-btns"><button type="button" class="btn btn--ink" data-copy-link>${A.icon("link", 20)}<span>Copy link</span></button>${native ? `<button type="button" class="btn btn--line" data-native-share>${A.icon("share", 20)}<span>Share</span></button>` : ""}</div>
<p class="pg-sh-status" role="status"></p>
<p class="pg-sh-foot">Sized for an Instagram post. The link opens this listing.</p></div>`;
}

/* ---------- render ---------- */
export async function render(ctx) {
  const D = ctx.data;
  const p = D.byId.get(String(ctx.params.id || "").toLowerCase());
  if (!p) {
    return {
      title: "Listing not found · Adaptive Sports Near Me",
      description: "It may have been removed or merged with another listing.",
      html: `<section class="pg-nf"><h1 tabindex="-1">We couldn't find that listing</h1><p>It may have been removed or merged with another listing.</p><div class="btns">${A.btn("Find a program", "/", "ink")}${A.btn("Browse sports", "/sports", "line")}</div></section>`,
    };
  }

  if (p.meet === undefined) { const m = meetFrom(p); p.meet = m ? m.meet : null; p.also = m ? m.also : []; }

  // " · About 12 mi from Brandon" when the visitor's saved place resolves and this listing is elsewhere.
  let from = "";
  const saved = A.recall("place");
  if (saved && p.placed) {
    try {
      const w = await A.resolvePlace(saved);
      if (w && (w.kind === "city" || w.kind === "zip")) {
        const r = A.relation(p, w);
        // Only when it helps: same state, or within about 100 miles (not "970 mi from Tampa").
        const t = !r.inCity && (p.state === w.state || (r.miles != null && r.miles <= 100)) && A.aboutMi(r.miles, { cap: true });
        if (t) from = ` · ${t} from ${w.short}`;
      }
    } catch (_) { /* no distance is better than a wrong one */ }
  }

  const sport = sportLabel(p);
  const tp = titlePlace(p);
  const meta = `${A.esc(sport)} · ${A.esc(A.placeText(p))}<span class="num">${A.esc(from)}</span>`;
  const main = `<div class="pg-grid"><div class="pg-main">
${hero(p)}
<div class="pg-head"><h1 tabindex="-1">${A.esc(p.name)}${A.vcheck(p)}</h1><p class="pg-meta">${meta}</p>${freshLine(p)}</div>
${actionRow(p)}
${p.meet ? meetup(p) : about(p)}
${facts(p)}
${wherePlay(p)}
${links(p)}
${more(p, D)}
</div>${bookBox(p)}</div>`;

  const sticky = A.stickyBar({
    left: A.trust(p, "sticky"),
    action: p.website ? { label: "Visit website", href: p.website, kind: "ink", external: true } : A.btn("Suggest a website", `/update/${p.id}`, "line"),
  });

  return {
    title: `${p.name}, ${sport}${tp ? " in " + tp : ""} · Adaptive Sports Near Me`,
    description: `${p.name}: ${lowerFirst(sport)}${tp ? " in " + tp : ""}.${p.verified ? " Verified: the program confirmed this listing." : ""} Free, no account needed.`,
    html: main,
    sticky,
  };
}

/* ---------- mount: share sheet, copy link ---------- */
function baseHash(id) { return "/programs/" + id; }
function hasShare() { return /[?&]share=1(?:&|$)/.test(A.here()); }

async function copyLink(url) {
  try { await navigator.clipboard.writeText(url); return true; }
  catch (_) {
    const ta = document.createElement("textarea");
    ta.value = url; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand("copy"); } catch (_) {}
    ta.remove();
    return ok;
  }
}

export function mount(root, ctx) {
  const p = ctx.data.byId.get(String(ctx.params.id || "").toLowerCase());
  if (!p) return () => {};
  let disposed = false;
  const base = baseHash(p.id);

  // Remember that the sheet is opened from here, so Close steps back (keeps the scroll).
  const onClick = (e) => {
    if (e.target.closest("[data-verify]")) {
      e.preventDefault();
      const el = A.showOverlay({ name: "verify", cls: "ov--sheet v-program-verify", labelledby: "vx-h", html: verifyHtml(p) });
      A.pushSheet();   // phone Back closes the story instead of leaving the listing
      const h = el.querySelector("#vx-h"); if (h) h.focus();
      return;
    }
    const a = e.target.closest("a[data-poster]");
    if (a && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      SHARE_FROM = base;
      RETURN_TO = a.getAttribute("data-poster");
      try { sessionStorage.setItem("asnm.scroll." + A.here(), String(Math.round(scrollY))); } catch (_) {}
    }
  };
  root.addEventListener("click", onClick);

  if (ctx.query.share === "1") {
    // Keep the page behind the sheet where it was.
    if (SHARE_FROM === base) {
      const y = Number(sessionStorage.getItem("asnm.scroll." + base) || 0);
      requestAnimationFrame(() => scrollTo(0, y));
    }
    const el = A.showOverlay({
      name: "share", cls: "ov--sheet v-program-share", labelledby: "pg-sh-h", html: shareHtml(p),
      onClose: () => {
        if (disposed || !hasShare() || !A.here().startsWith(base + "?")) return;
        if (SHARE_FROM === base && Number(sessionStorage.getItem("asnm.navs") || 0) > 0) { SHARE_FROM = null; history.back(); }
        else { SHARE_FROM = null; A.nav(base, { replace: true }); }
      },
    });
    const status = el.querySelector(".pg-sh-status");
    const url = location.origin + base;
    el.addEventListener("click", async (e) => {
      if (e.target.closest("[data-copy-link]")) {
        const ok = await copyLink(url);
        status.textContent = ok ? "Link copied" : url;
        if (ok) A.announce("Link copied");
      } else if (e.target.closest("[data-native-share]")) {
        try { await navigator.share({ title: document.title.replace(/ · Adaptive Sports Near Me$/, ""), url }); }
        catch (err) { if (!err || err.name !== "AbortError") { const ok = await copyLink(url); status.textContent = ok ? "Link copied" : url; } }
      }
    });
  } else if (RETURN_TO) {
    // Back from the sheet: put focus on the control that opened it (after the router's h1 focus).
    const which = RETURN_TO; RETURN_TO = null;
    setTimeout(() => {
      if (disposed) return;
      const t = root.querySelector(`a[data-poster="${which}"]`);
      if (t) t.focus({ preventScroll: true });
    }, 120);
  }

  return () => { disposed = true; root.removeEventListener("click", onClick); };
}
