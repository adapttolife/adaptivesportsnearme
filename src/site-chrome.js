// The one site chrome for server-rendered pages (the blog).
// Header (hamburger · brand · search · orange "+") and the slim sitemap footer,
// lifted out of blog.js so there is exactly one of each instead of one per lane.
//
// The header paints with zero JS: the page links /styles.css, the search is a
// real GET form to /near (the Worker sends /near?q=Tampa to /near/Tampa), the "+"
// is a link. Every link is a page the app draws (public/app). public/site-nav.js adds the drawer
// behind the hamburger and uses the shared stylesheet; NAV_VERSION is the cache-buster on
// that file, so bump it on any site-nav.js change (browser caches ignore CDN
// purges, and that has bitten us three times).

export const NAV_VERSION = "20261014a";

// Shared presentation lives in public/styles.css.

// The beta bar (Alec, 2026-10-13: launch before everything is complete and say
// so at the top). Same words and script as the bar in public/index.html. It
// paints without JS; the inline script only remembers a dismissal. The words
// are true before and after the PRELAUNCH flip, so shipping this design never
// waits on, or implies, the go-live decision.
export const BETA_MESSAGE = "This directory is new and still growing";
export function betaBarHtml() {
  return `<div class="beta-bar" id="betaBar" role="region" aria-label="Beta notice">
  <div class="wrap beta-in">
    <span class="beta-tag">Beta</span>
    <p class="beta-msg"><span class="beta-long">${BETA_MESSAGE}.</span><span class="beta-short">New and still growing.</span> <a href="/help">Help us build it</a></p>
    <button class="beta-x" type="button" data-beta-close aria-label="Hide the beta notice">&times;</button>
  </div>
</div>
<script>(function(){var b=document.getElementById("betaBar");try{if(localStorage.getItem("asnm-beta-hidden"))b.hidden=true}catch(_){}b.querySelector("[data-beta-close]").addEventListener("click",function(){b.hidden=true;try{localStorage.setItem("asnm-beta-hidden","1")}catch(_){}})})();</script>`;
}

// Hamburger · brand · search · orange "+". Every control is a plain link or a
// real GET form, so the header works before (and without) site-nav.js.
export function headerHtml() {
  return `${betaBarHtml()}
<header class="hdr">
  <div class="hdr-in wrap">
    <button class="menu-btn" id="menuBtn" aria-label="Menu" aria-expanded="false"><i stroke-width="2" data-lucide="menu" aria-hidden="true" focusable="false"></i></button>
    <a class="brand" href="/" aria-label="Adaptive Sports Near Me home"><b>Adaptive Sports Near Me</b></a>
    <form class="search" role="search" action="/near" method="get">
      <span class="loc" aria-hidden="true"><i stroke-width="2" data-lucide="map-pin" aria-hidden="true" focusable="false"></i><span>United States</span></span>
      <span class="sep"></span>
      <input id="q" name="q" type="text" placeholder="City, state or ZIP" aria-label="Find programs near a city, state or ZIP">
    </form>
    <div class="hdr-actions">
      <a class="hdr-add" href="/add/program" aria-label="Add a program" title="Add a program"><i stroke-width="2.2" data-lucide="plus" aria-hidden="true" focusable="false"></i></a>
    </div>
  </div>
</header>`;
}

// Same four groups, same order, same destinations as the app's own footer
// (footer() in public/app/app.js), so the blog and the app never disagree about
// what the site contains.
export function footerHtml() {
  return `<footer class="foot">
  <div class="foot-in wrap">
    <div class="foot-brand">
      <a class="brand" href="/"><b>Adaptive Sports Near Me</b></a>
      <p class="tagline">Find adaptive sports programs, grants and events by place or sport. Free, no account needed. Every listing shows when we last checked it.</p>
      <p class="tagline">Made with love from <a href="https://adapttolife.org" target="_blank" rel="noopener">Adapt To Life</a>.</p>
    </div>
    <div class="foot-cols">
      <div class="foot-col"><h2>Find</h2><a href="/">Programs near you</a><a href="/sports">Sports</a><a href="/grants">Grants</a><a href="/events">Events</a><a href="/resources">Guides</a></div>
      <div class="foot-col"><h2>Browse</h2><a href="/states">States</a><a href="/organizations">Organizations</a></div>
      <div class="foot-col"><h2>Help build this</h2><a href="/add/program">Add a program</a><a href="/add/event">Add an event</a><a href="/help">Claim your organization</a></div>
      <div class="foot-col"><h2>About this directory</h2><a href="/about">How we check listings</a><a href="/letter">Get the letter</a><a href="/blog">Blog</a><a href="/about">Accessibility</a><a href="https://adapttolife.org" target="_blank" rel="noopener">Adapt To Life</a></div>
    </div>
  </div>
</footer>`;
}

export function navScriptHtml() {
  return `<!-- bump NAV_VERSION in src/site-chrome.js on any site-nav.js change (cache-bust) -->
<script src="/assets/vendor/lucide-1.49.0.min.js" defer></script>
<script src="/icons.js" defer></script>
<script src="/site-nav.js?v=${NAV_VERSION}" defer></script>`;
}
