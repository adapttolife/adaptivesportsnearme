/* Grant page `/grants/:id` (spec 6.10, WP-F).
   PROMOTE: .v-grant .bbox (desktop booking box: sticky, border, radius 20,
   --sh-2; the listing page needs the same one) and .v-grant .facts (the dl
   fact list). Never shows an email address or a phone number. */
import * as A from "../app.js";

/** Open now order (same as the grants list): real amount, then any deadline text, then A to Z. */
function openOrder(a, b) {
  const ia = A.grantInfo(a), ib = A.grantInfo(b);
  return (!!ib.amount - !!ia.amount) || (!!b.deadline - !!a.deadline) || a.name.localeCompare(b.name);
}

/** Our strings never carry en or em dashes; ranges read "8 to 18". */
function clean(s) {
  return String(s || "").trim()
    .replace(/(\d)\s*[–—]\s*(\d)/g, "$1 to $2")
    .replace(/\s+[–—]\s+/g, ", ")
    .replace(/[–—]/g, " to ");
}
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

function notFoundGrant() {
  return {
    title: "Grant not found · Adaptive Sports Near Me",
    description: "This grant may have been removed or renamed.",
    html: `<section class="nf"><h1 tabindex="-1">We couldn't find that grant</h1><p>It may have been removed or renamed.</p><div class="btns">${A.btn("See all grants", "/grants", "ink")}${A.btn("Find a program", "/", "line")}</div></section>`,
    railActive: "grants",
  };
}

export async function render(ctx) {
  const D = ctx.data;
  const g = D.grantById.get(ctx.params.id);
  if (!g) return notFoundGrant();

  const gi = A.grantInfo(g);
  const source = g.source || "the grant maker";
  const isVaries = !gi.amount && /^varies$/i.test(String(g.amount || "").trim());
  const amountText = gi.amount || (isVaries ? "Amount varies" : "Amount: see their site");
  const amountFact = gi.amount || (isVaries ? "Amount varies" : "Not listed. See their site.");
  const deadlineFact = cap(gi.deadlineText.replace(/^Deadline:\s*/, ""));
  const who = g.audience === "program" ? "Programs" : "Athletes";
  const aud = g.audience === "program" ? "program" : "athlete";
  const listHref = aud === "athlete" ? "/grants" : "/grants?a=program";
  const url = g.url && /^https?:\/\//i.test(g.url) ? g.url : null;
  const actionLabel = gi.open ? "Apply on their site" : "Visit their site";

  // 1. Hero: grant soft tint with the deep figure, never inverted.
  const heroInner = `<button type="button" class="hb-back" data-back="${listHref}" aria-label="Back">${A.icon("arrow-left", 22)}</button>`
    + `<span class="vpill vpill--plain hb-aud">${A.esc(gi.audienceLabel)}</span>`;
  const hero = `<div class="gp-hero">${A.plate("grant", { kind: "hero", keepText: true, inner: heroInner })}</div>`;

  // 2. Amount, name, source.
  const head = `<div class="gp-head">${gi.amount ? `<p class="gp-amt num">${A.esc(gi.amount)}</p>` : ""}<h1 tabindex="-1">${A.esc(g.name)}</h1><p class="gp-from">From ${A.esc(source)}</p>${gi.closed ? `<p class="tags"><span class="tag tag--muted">Closed for now</span></p>` : ""}</div>`;

  // 3. Facts.
  const facts = `<dl class="facts">
<div><dt>Amount</dt><dd class="num">${A.esc(amountFact)}</dd></div>
<div><dt>Deadline</dt><dd class="num">${A.esc(deadlineFact)}</dd></div>
<div><dt>Who can apply</dt><dd>${who}</dd></div>
<div><dt>About</dt><dd>${A.esc(g.desc ? clean(g.desc) : "See their site for details.")}</dd></div>
</dl>`;

  // 4. Note box.
  let note = `Details come from ${A.esc(source)}. We haven't recorded a check date for this grant yet, so check their site for current dates and rules.`;
  if (gi.past) note += ` The last deadline was <span class="num">${A.esc(String(g.deadline).trim())}</span>.`;
  if (gi.closed) note += " They list this grant as closed for now.";
  if (!url) note += " We don't have a link to their site yet.";
  const noteBox = `<div class="gp-note">${A.icon("info", 20)}<p>${note}</p></div>`;

  // 6. Other grants, same audience, open.
  const others = D.grants.filter((x) => x.id !== g.id && x.audience === g.audience && A.grantInfo(x).open).sort(openOrder).slice(0, 4);
  const othersHtml = others.length
    ? `<section class="sec gp-others" aria-labelledby="g-others">${A.sectionHead({ title: aud === "athlete" ? "Other grants for athletes" : "Other grants for programs", id: "g-others", seeAll: { label: "See all grants", href: listHref } })}<div class="glist">${others.map(A.grantRow).join("")}</div></section>`
    : "";

  // 5. Booking box (desktop) and sticky bar (phone).
  const action = url
    ? A.btn(actionLabel, url, "ink", { external: true })
    : A.btn("See other grants", "", "line", { attrs: 'data-jump="g-others"' });
  const box = `<aside class="bbox" aria-label="Apply">
<p class="bb-amt num${gi.amount ? "" : " is-soft"}">${A.esc(amountText)}</p>
<p class="bb-dl num">${A.esc(gi.deadlineText)}</p>
<div class="bb-act">${action}</div>
<p class="bb-fine">${url ? `You apply with ${A.esc(source)}. We don't take applications or handle money.` : "We don't have a link to their site yet."}</p>
<a class="tlink" href="${listHref}">See all grants</a>
</aside>`;

  // Same layout as a listing: the hero in the main column, the booking box beside it.
  const html = `<article class="gp">
<div class="gp-grid">
  <div class="gp-main">${hero}${head}${facts}${noteBox}${othersHtml}</div>
  ${box}
</div>
</article>`;

  const sticky = A.stickyBar({
    left: `<b class="num">${A.esc(amountText)}</b>`,
    action: url ? { label: actionLabel, href: url, external: true } : action,
  });

  return {
    title: `${g.name}: grant from ${source} · Adaptive Sports Near Me`,
    description: `${g.name}, a grant from ${source}${gi.amount ? ", " + gi.amount : ""}. ${gi.deadlineText}. You apply on their site.`,
    html,
    sticky,
    railActive: "grants",
  };
}

export function mount() {
  return () => {};
}
