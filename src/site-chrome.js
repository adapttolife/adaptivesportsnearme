// The one site chrome for server-rendered pages: /blog, /programs/:id, /grants/:id.
// Header (hamburger · brand · search · orange "+") and the slim sitemap footer,
// lifted out of blog.js so there is exactly one of each instead of one per lane.
//
// The header paints with zero JS: the page links /styles.css, the search is a
// real GET form to /?q=, the "+" is a link. public/site-nav.js adds the drawer
// behind the hamburger and uses the shared stylesheet; NAV_VERSION is the cache-buster on
// that file, so bump it on any site-nav.js change (browser caches ignore CDN
// purges, and that has bitten us three times).

export const NAV_VERSION = "20260915a";

// Shared presentation lives in public/styles.css.

// Hamburger · brand · search · orange "+". Every control is a plain link or a
// real GET form, so the header works before (and without) site-nav.js.
export function headerHtml() {
  return `<header class="hdr">
  <div class="hdr-in wrap">
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
  <div class="foot-in wrap">
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
