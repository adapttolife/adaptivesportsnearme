// The one site chrome for server-rendered pages: /blog, /programs/:id, /grants/:id.
// Header (hamburger · brand · search · orange "+") and the slim sitemap footer,
// lifted out of blog.js so there is exactly one of each instead of one per lane.
//
// The header paints with zero JS: the CSS ships in the page, the search is a
// real GET form to /?q=, the "+" is a link. public/site-nav.js adds the drawer
// behind the hamburger and mirrors this CSS; NAV_VERSION is the cache-buster on
// that file, so bump it on any site-nav.js change (browser caches ignore CDN
// purges, and that has bitten us three times).

export const NAV_VERSION = "20260821a";

// Chrome-only CSS. Self-contained: it declares the few tokens the listing pages
// don't already have, and it scopes link colour inside .hdr/.foot so a host page
// with its own `a{color:...}` rule doesn't turn the nav orange.
export const CHROME_CSS = `
:root{--sand2:#E8E7E3;--orange-soft:#FBEBDC;--shadow-sm:0 1px 2px rgba(17,17,19,.04),0 1px 3px rgba(17,17,19,.06);}
/* Column layout so the footer sits at the bottom of a short page instead of
   leaving a band of body background under it. */
body{min-height:100vh;display:flex;flex-direction:column;}
body>main{flex:1 0 auto;width:100%;}
/* The app resets buttons; without it the hamburger renders with the browser's
   border and grey fill, which is why bare chrome read as a different site. */
button{font:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer;}
.skip{position:absolute;left:-999px;top:8px;background:var(--ink);color:#fff;padding:10px 16px;border-radius:var(--r);}
.skip:focus{left:12px;}
/* App-matching header. Rendered server-side for zero-flash + no-JS styling;
   site-nav.js mirrors this CSS and owns the drawer. */
.hdr{position:sticky;top:0;z-index:60;background:rgba(255,255,255,.92);backdrop-filter:saturate(150%) blur(10px);border-bottom:1px solid var(--line);}
.hdr.scrolled{box-shadow:var(--shadow-sm);}
.hdr a{color:inherit;text-decoration:none;}
.hdr-in{max-width:1280px;margin:0 auto;padding:0 var(--space-page);height:var(--space-header);display:flex;align-items:center;justify-content:space-between;gap:18px;}
.brand{flex:0 0 auto;transition:opacity .15s;}
.brand:hover{opacity:.7;}
.brand b{font-family:'DM Sans',sans-serif;font-weight:700;font-size:16px;letter-spacing:-.015em;color:var(--ink);white-space:nowrap;}
.menu-btn{flex:0 0 auto;width:40px;height:40px;display:grid;place-items:center;border-radius:var(--r-full);color:var(--ink);transition:background .15s;}
.menu-btn:hover{background:var(--mist);}
.menu-btn svg{width:22px;height:22px;}
.search{flex:0 1 520px;max-width:520px;height:54px;display:flex;align-items:center;background:var(--paper);border:1px solid var(--line);border-radius:var(--r-full);box-shadow:0 3px 12px rgba(17,17,19,.10),0 1px 2px rgba(17,17,19,.05);transition:box-shadow .2s,border-color .2s;}
.search:hover{box-shadow:0 6px 16px rgba(17,17,19,.13),0 1px 3px rgba(17,17,19,.06);}
.search:focus-within{box-shadow:0 8px 22px rgba(17,17,19,.15),0 1px 3px rgba(17,17,19,.06);border-color:var(--sand2);}
.search .loc{display:flex;align-items:center;gap:8px;padding:0 14px 0 20px;height:100%;border-radius:var(--r-full) 0 0 var(--r-full);white-space:nowrap;color:var(--ink);font-size:15px;font-weight:600;cursor:default;}
.search .loc:hover{background:transparent;}
.search .loc svg{width:16px;height:16px;color:var(--orange);}
.search .sep{width:1px;height:26px;background:var(--line);flex:0 0 auto;}
.search input{flex:1 1 auto;min-width:40px;height:100%;border:none;background:transparent;outline:none;padding:0 22px 0 16px;font-size:15px;font-weight:500;color:var(--ink);}
.search input::placeholder{color:var(--muted);font-weight:500;}
.hdr-actions{flex:0 0 auto;display:flex;align-items:center;gap:10px;}
.hdr-add{flex:0 0 auto;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;color:var(--orange-ink);border:1px solid var(--orange-soft);background:var(--orange-soft);transition:border-color .15s,background .15s,color .15s;}
.hdr-add:hover{background:var(--orange);color:#fff;border-color:var(--orange);}
.hdr-add svg{width:19px;height:19px;}
@media (max-width:720px){.hdr-add{width:36px;height:36px;}.hdr-add svg{width:17px;height:17px;}.hdr .brand{display:none;}.search{flex:1 1 100%;max-width:none;min-width:0;}.search .loc span{display:none;}.search input{min-width:0;}}
.foot{border-top:1px solid var(--line);margin-top:var(--space-page);padding:var(--space-nearby) 0 56px;background:var(--paper);}
.foot a{text-decoration:none;}
.foot-in{max-width:1280px;margin:0 auto;padding:0 var(--space-page);display:flex;justify-content:space-between;gap:36px 48px;flex-wrap:wrap;}
.foot .brand b{font-size:15px;}
.foot .tagline{font-size:14px;color:var(--muted);margin:10px 0 0;max-width:380px;line-height:1.5;}
.foot .tagline a{color:var(--ink2);text-decoration:underline;text-underline-offset:2px;}
.foot-cols{display:flex;gap:36px 48px;flex-wrap:wrap;}
.foot-col h2{font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);font-weight:400;margin:0 0 12px;}
.foot-col a{display:block;font-size:14px;color:var(--ink2);padding:6px 0;transition:color .15s;}
.foot-col a:hover{color:var(--orange);}
/* Same mobile behaviour as the app's footer: three columns stay three columns
   instead of wrapping two-plus-one. */
@media(max-width:720px){.foot-cols{width:100%;justify-content:space-between;gap:32px 16px;}}
`;

// Hamburger · brand · search · orange "+". Every control is a plain link or a
// real GET form, so the header works before (and without) site-nav.js.
export function headerHtml() {
  return `<header class="hdr">
  <div class="hdr-in">
    <button class="menu-btn" id="menuBtn" aria-label="Menu" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
    <a class="brand" href="/" aria-label="Adaptive Sports Near Me home"><b>Adaptive Sports Near Me</b></a>
    <form class="search" role="search" action="/" method="get">
      <span class="loc" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg><span>United States</span></span>
      <span class="sep"></span>
      <input id="q" name="q" type="text" placeholder="Search a sport, zip, or program" aria-label="Search programs">
    </form>
    <div class="hdr-actions">
      <a class="hdr-add" href="/?add=program" aria-label="Submit a program" title="Submit a program"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></a>
    </div>
  </div>
</header>`;
}

// Same three columns, same order, same destinations as the app's own footer in
// public/index.html. The app opens them through click handlers; these are the
// URLs those handlers land on, so the two pages never disagree about what the
// site contains. "Browse by sport" is a filter rather than a destination, so it
// stays where it works, in the drawer.
export function footerHtml() {
  return `<footer class="foot">
  <div class="foot-in">
    <div class="foot-brand">
      <a class="brand" href="/"><b>Adaptive Sports Near Me</b></a>
      <p class="tagline">An open directory of adaptive sports programs across the country. No logins, no walls, because it is a free service of <a href="https://adapttolife.org" target="_blank" rel="noopener">Adapt To Life</a>, a recognized 501(c)(3) nonprofit.</p>
    </div>
    <div class="foot-cols">
      <div class="foot-col"><h2>Explore</h2><a href="/">Discover</a><a href="/maps">Map view</a><a href="/?db=programs">Browse all</a><a href="/events">Events</a><a href="/?db=grants">Funding</a><a href="/blog">Blog</a></div>
      <div class="foot-col"><h2>Programs</h2><a href="/?add=program">Add a program</a><a href="/?add=program">Update a listing</a></div>
      <div class="foot-col"><h2>About</h2><a href="/?about=project">The project</a><a href="/?about=verify">How we verify</a><a href="/?about=a11y">Accessibility</a><a href="/?profile=1">Your profile</a><a href="https://adapttolife.org" target="_blank" rel="noopener">Adapt To Life</a><a href="https://sign.adapttolife.org/waiver?source=asnm">Sign waiver</a></div>
    </div>
  </div>
</footer>`;
}

export function navScriptHtml() {
  return `<!-- bump NAV_VERSION in src/site-chrome.js on any site-nav.js change (cache-bust) -->
<script src="/site-nav.js?v=${NAV_VERSION}" defer></script>`;
}
