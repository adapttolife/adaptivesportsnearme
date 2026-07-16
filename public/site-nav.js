/* site-nav.js — shared navbar drawer for pages that render the app-matching
 * static header (currently the server-rendered /blog). Vanilla, no deps.
 *
 * What it owns: the hamburger drawer + scrim (markup, CSS, open/close, a11y).
 * What it does NOT own: the header markup itself (server-rendered by the host
 * page so it paints with zero flash and works without JS) or the search form /
 * "+" anchor (plain HTML that navigates to the app on their own). Every drawer
 * item is a plain link/button that NAVIGATES to the app — this script performs
 * no app state changes, it only shows/hides the overlay.
 *
 * Header + drawer CSS is injected here too so the file is a genuine drop-in for
 * any page; the host page (blog.js) also server-renders the header CSS for the
 * zero-flash / no-JS path, so the two copies are intentionally mirrored.
 */
(function () {
  "use strict";

  // 11 sports — mirror of `const SPORTS` in public/index.html. Chip → /?sport=<key>.
  var SPORTS = [
    { key: "basketball", label: "Basketball" },
    { key: "tennis", label: "Tennis" },
    { key: "pickleball", label: "Pickleball" },
    { key: "rugby", label: "Rugby" },
    { key: "football", label: "Football" },
    { key: "baseball", label: "Baseball" },
    { key: "cycling", label: "Cycling" },
    { key: "sledhockey", label: "Sled Hockey" },
    { key: "skiing", label: "Skiing" },
    { key: "waterskiing", label: "Water Ski" },
    { key: "goalball", label: "Goalball" },
  ];

  // Icons copied verbatim from public/index.html (NAVICON / DRAWER_* / x).
  var IC = {
    compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="m15 9-2 5-4 2 2-5 4-2Z"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>',
    calsm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M9 3v4M15 3v4"/></svg>',
    price: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z"/><circle cx="8" cy="8" r="1.4"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5a2 2 0 0 1 2-2h6v18H6a2 2 0 0 0-2 2V5ZM20 5a2 2 0 0 0-2-2h-6v18h6a2 2 0 0 1 2 2V5Z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  };

  // Header + drawer CSS + tokens the blog CSS lacks — copied from public/index.html.
  var CSS =
    ":root{" +
    "--sand2:#E8E7E3;--orange-soft:#FBEBDC;" +
    "--hdr:64px;--r-xl:20px;" +
    "--shadow-sm:0 1px 2px rgba(17,17,19,.04),0 1px 3px rgba(17,17,19,.06);" +
    "--shadow:0 6px 20px rgba(17,17,19,.08);" +
    "--shadow-lg:0 12px 34px rgba(17,17,19,.13);" +
    "--ease:cubic-bezier(.2,.6,.2,1);" +
    "}" +
    /* ---- header ---- */
    ".hdr{position:sticky;top:0;z-index:60;background:rgba(255,255,255,.92);backdrop-filter:saturate(150%) blur(10px);border-bottom:1px solid var(--line);}" +
    ".hdr.scrolled{box-shadow:var(--shadow-sm);}" +
    ".hdr-in{height:var(--hdr);display:flex;align-items:center;justify-content:space-between;gap:18px;}" +
    ".brand{flex:0 0 auto;transition:opacity .15s;}" +
    ".brand:hover{opacity:.7;}" +
    ".brand b{font-family:'DM Sans',sans-serif;font-weight:700;font-size:16px;letter-spacing:-.015em;color:var(--ink);white-space:nowrap;}" +
    ".search{flex:0 1 520px;max-width:520px;height:54px;display:flex;align-items:center;background:var(--paper);border:1px solid var(--line);border-radius:var(--r-full);box-shadow:0 3px 12px rgba(17,17,19,.10),0 1px 2px rgba(17,17,19,.05);transition:box-shadow .2s,border-color .2s;}" +
    ".search:hover{box-shadow:0 6px 16px rgba(17,17,19,.13),0 1px 3px rgba(17,17,19,.06);}" +
    ".search:focus-within{box-shadow:0 8px 22px rgba(17,17,19,.15),0 1px 3px rgba(17,17,19,.06);border-color:var(--sand2);}" +
    ".search .loc{display:flex;align-items:center;gap:8px;padding:0 14px 0 20px;height:100%;border-radius:var(--r-full) 0 0 var(--r-full);white-space:nowrap;color:var(--ink);font-size:15px;font-weight:600;cursor:default;}" +
    ".search .loc:hover{background:transparent;}" +
    ".search .loc svg{width:16px;height:16px;color:var(--orange);}" +
    ".search .sep{width:1px;height:26px;background:var(--line);flex:0 0 auto;}" +
    ".search input{flex:1 1 auto;min-width:40px;height:100%;border:none;background:transparent;outline:none;padding:0 22px 0 16px;font-size:15px;font-weight:500;color:var(--ink);}" +
    ".search input::placeholder{color:var(--muted);font-weight:500;}" +
    ".hdr-actions{flex:0 0 auto;display:flex;align-items:center;gap:10px;}" +
    ".hdr-add{flex:0 0 auto;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;color:var(--orange-ink);border:1px solid var(--orange-soft);background:var(--orange-soft);transition:border-color .15s,background .15s,color .15s;}" +
    ".hdr-add:hover{background:var(--orange);color:#fff;border-color:var(--orange);}" +
    ".hdr-add svg{width:19px;height:19px;}" +
    "@media (max-width:720px){.hdr-add{width:36px;height:36px;}.hdr-add svg{width:17px;height:17px;}.hdr .brand{display:none;}.search{flex:1 1 100%;max-width:none;min-width:0;}.search .loc span{display:none;}.search input{min-width:0;}}" +
    /* ---- hamburger + drawer ---- */
    ".menu-btn{flex:0 0 auto;width:40px;height:40px;display:grid;place-items:center;border-radius:var(--r-full);color:var(--ink);transition:background .15s;}" +
    ".menu-btn:hover{background:var(--mist);}" +
    ".menu-btn svg{width:22px;height:22px;}" +
    "#scrim{position:fixed;inset:0;background:rgba(17,17,19,.4);z-index:110;opacity:0;pointer-events:none;transition:opacity .28s var(--ease);}" +
    "#scrim.open{opacity:1;pointer-events:auto;}" +
    "body.drawer-open{overflow:hidden;}" +
    ".drawer{position:fixed;top:0;left:0;bottom:0;width:min(320px,86vw);background:var(--paper);z-index:120;transform:translateX(-100%);transition:transform .28s var(--ease);display:flex;flex-direction:column;overflow-y:auto;box-shadow:var(--shadow-lg);}" +
    ".drawer.open{transform:none;}" +
    ".drawer-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 16px 14px;border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--paper);z-index:1;}" +
    ".drawer-head b{font-family:'DM Sans',sans-serif;font-weight:700;font-size:15px;letter-spacing:-.015em;color:var(--ink);}" +
    ".drawer-profile{display:flex;align-items:center;gap:11px;width:100%;text-align:left;padding:11px 16px;background:none;transition:background .15s;}" +
    ".drawer-profile:hover{background:var(--mist);}" +
    ".dp-av{flex:0 0 auto;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--orange-soft);color:var(--orange-ink);font-weight:700;font-size:13px;}" +
    ".dp-av svg{width:16px;height:16px;}" +
    ".dp-meta{display:flex;flex-direction:column;min-width:0;}" +
    ".dp-name{font-weight:600;font-size:14px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}" +
    ".dp-sub{font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}" +
    ".drawer-x{flex:0 0 auto;width:34px;height:34px;display:grid;place-items:center;border-radius:var(--r-full);color:var(--ink);transition:background .15s;}" +
    ".drawer-x:hover{background:var(--mist);}" +
    ".drawer-x svg{width:20px;height:20px;}" +
    ".drawer-sec{padding:10px 10px 4px;}" +
    ".drawer-sec .eyebrow{display:block;padding:6px 8px 4px;font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--faint);margin:0;}" +
    ".drawer-row-main{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:12px;height:44px;padding:0 8px;border-radius:var(--r);color:var(--ink);font-size:15px;font-weight:600;transition:background .15s;cursor:pointer;}" +
    ".drawer-row-main:hover{background:var(--mist);}" +
    ".drawer-row-main img,.drawer-row-main svg{width:24px;height:24px;flex:0 0 auto;object-fit:contain;}" +
    ".drawer-row-main svg{color:var(--ink);}" +
    ".drawer-row-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}" +
    ".drawer-div{height:1px;background:var(--line);margin:8px 16px;}" +
    ".drawer-util .drawer-row-main{width:100%;}" +
    ".drawer-chips{display:flex;flex-wrap:wrap;gap:8px;padding:4px 8px 8px;}" +
    ".drawer-chip{display:block;padding:8px 14px;border:1px solid var(--line);background:var(--paper);border-radius:var(--r-full);font-size:13.5px;font-weight:600;color:var(--ink2);transition:.15s;}" +
    ".drawer-chip:hover{border-color:var(--ink);color:var(--ink);background:var(--mist);}" +
    ".drawer-about{display:flex;flex-direction:column;gap:2px;padding-bottom:18px;}" +
    ".drawer-about a{display:block;width:100%;text-align:left;padding:8px;font-size:13.5px;color:var(--muted);cursor:pointer;border-radius:var(--r);transition:.15s;}" +
    ".drawer-about a:hover{color:var(--ink);background:var(--mist);}" +
    /* ---- newsletter CTA (email-first drawer top) + capture form, copied verbatim from index.html ---- */
    ".hp{position:absolute!important;left:-9999px;width:1px;height:1px;opacity:0;}" +
    ".drawer-news{margin:10px 12px;padding:18px;border-radius:var(--r-lg);background:linear-gradient(162deg,var(--orange-soft) 0%,#F7EEE6 52%,var(--sand) 100%);border:1px solid #EFE0D1;}" +
    ".dn-eyebrow{font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--orange-ink);font-weight:700;margin:0 0 7px;}" +
    ".dn-head{font-family:'DM Sans',sans-serif;font-size:16.5px;font-weight:700;line-height:1.2;letter-spacing:-.01em;color:var(--ink);margin:0 0 13px;}" +
    ".dn-fine{font-size:12px;color:var(--muted);margin:10px 0 0;}" +
    ".cta-sub{display:flex;flex-wrap:wrap;gap:8px;align-items:center;}" +
    ".cta-sub input{flex:1 1 auto;min-width:0;height:48px;padding:0 16px;border:1px solid var(--line);border-radius:var(--r-full);background:var(--paper);color:var(--ink);font-size:15px;box-shadow:var(--shadow-sm);}" +
    ".cta-sub input::placeholder{color:var(--faint);}" +
    ".cta-sub input:focus{outline:none;border-color:var(--ink);}" +
    ".cta-go{flex:0 0 auto;height:48px;padding:0 22px;border-radius:var(--r-full);background:var(--orange);color:#fff;font-size:15px;font-weight:700;white-space:nowrap;transition:background .15s;cursor:pointer;border:none;}" +
    ".cta-go:hover{background:var(--orange-ink);}" +
    ".cta-go:disabled{opacity:.6;cursor:default;}" +
    ".cta-msg{flex-basis:100%;font-size:13px;line-height:1.4;margin-top:2px;min-height:1px;}" +
    ".cta-msg:empty{margin-top:0;}" +
    ".cta-msg.err{color:var(--orange-ink);}" +
    ".cta-done{display:flex;align-items:center;justify-content:center;gap:10px;font-size:15px;font-weight:600;color:var(--ink);padding:6px 2px;}" +
    ".cta-done svg{flex:0 0 auto;width:22px;height:22px;color:var(--orange);}" +
    ".drawer-news .cta-sub{flex-direction:column;flex-wrap:nowrap;align-items:stretch;gap:8px;}" +
    ".drawer-news .cta-sub input{width:100%;height:44px;}" +
    ".drawer-news .cta-go{width:100%;height:44px;padding:0;}";

  function injectStyle() {
    if (document.getElementById("site-nav-css")) return;
    var s = document.createElement("style");
    s.id = "site-nav-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function drawerHtml() {
    var head =
      '<div class="drawer-head"><b>Adaptive Sports Near Me</b>' +
      '<button class="drawer-x" type="button" aria-label="Close menu">' + IC.x + "</button></div>";
    var prof =
      '<a class="drawer-profile" href="/?profile=1">' +
      '<span class="dp-av">' + IC.user + "</span>" +
      '<span class="dp-meta"><span class="dp-name">Set up your profile</span>' +
      '<span class="dp-sub">Save favorites, follow sports</span></span></a>';
    // Newsletter CTA — the drawer's top slot (email-first). Standalone form + handler (see wire()).
    var news =
      '<div class="drawer-news">' +
      '<p class="dn-eyebrow">The newsletter</p>' +
      '<p class="dn-head">Programs, events &amp; funding near you.</p>' +
      '<form class="cta-sub" novalidate>' +
      '<input class="hp" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<input name="em" type="email" placeholder="you@email.com" aria-label="Email address">' +
      '<button class="cta-go" type="submit">Get updates</button>' +
      '<div class="cta-msg" aria-live="polite"></div>' +
      "</form>" +
      '<p class="dn-fine">Free. No spam.</p>' +
      "</div>";
    var dest =
      '<div class="drawer-sec drawer-util">' +
      '<a class="drawer-row-main" href="/">' + IC.compass + '<span class="drawer-row-label">Discover</span></a>' +
      '<a class="drawer-row-main" href="/maps">' + IC.map + '<span class="drawer-row-label">Map view</span></a>' +
      '<a class="drawer-row-main" href="/events">' + IC.calsm + '<span class="drawer-row-label">Events</span></a>' +
      '<a class="drawer-row-main" href="/?db=grants">' + IC.price + '<span class="drawer-row-label">Funding &amp; grants</span></a>' +
      '<a class="drawer-row-main" href="/blog">' + IC.book + '<span class="drawer-row-label">Blog</span></a>' +
      "</div>";
    var contribute =
      '<div class="drawer-div"></div><div class="drawer-sec drawer-util">' +
      '<a class="drawer-row-main" href="/?add=program">' + IC.plus + '<span class="drawer-row-label">Add a program</span></a>' +
      "</div>";
    var chipList = '<a class="drawer-chip" href="/">All sports</a>' +
      SPORTS.map(function (s) {
        return '<a class="drawer-chip" href="/?sport=' + s.key + '">' + s.label + "</a>";
      }).join("");
    var chips =
      '<div class="drawer-div"></div><div class="drawer-sec"><p class="eyebrow">Browse by sport</p>' +
      '<div class="drawer-chips">' + chipList + "</div></div>";
    var about =
      '<div class="drawer-div"></div><div class="drawer-sec drawer-about">' +
      '<a href="/">The project</a>' +
      '<a href="https://sign.adapttolife.org/waiver?source=asnm">Sign waiver</a>' +
      "</div>";
    // Profile block moves to the bottom (just above About), fronted by a divider.
    var profileBlock = '<div class="drawer-div"></div>' + prof;
    return head + news + dest + chips + contribute + profileBlock + about;
  }

  function injectDrawer() {
    if (document.getElementById("drawer")) return;
    var scrim = document.createElement("div");
    scrim.id = "scrim";

    var drawer = document.createElement("div");
    drawer.id = "drawer";
    drawer.className = "drawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-label", "Menu");
    drawer.setAttribute("aria-hidden", "true");
    drawer.setAttribute("inert", "");
    drawer.innerHTML = drawerHtml();

    document.body.appendChild(scrim);
    document.body.appendChild(drawer);
  }

  var opener = null;

  function openDrawer() {
    var d = document.getElementById("drawer");
    var scrim = document.getElementById("scrim");
    if (!d || !scrim) return;
    opener = document.activeElement;
    d.classList.add("open");
    d.removeAttribute("inert");
    d.setAttribute("aria-hidden", "false");
    scrim.classList.add("open");
    document.body.classList.add("drawer-open");
    var x = d.querySelector(".drawer-x");
    if (x) setTimeout(function () { try { x.focus(); } catch (_) {} }, 40);
  }

  function closeDrawer() {
    var d = document.getElementById("drawer");
    var scrim = document.getElementById("scrim");
    if (!d || !d.classList.contains("open")) return;
    d.classList.remove("open");
    d.setAttribute("aria-hidden", "true");
    d.setAttribute("inert", "");
    if (scrim) scrim.classList.remove("open");
    document.body.classList.remove("drawer-open");
    var menuBtn = document.getElementById("menuBtn") || (opener && opener.closest ? opener.closest(".menu-btn") : null);
    var back = menuBtn || opener;
    if (back && back.focus) { try { back.focus(); } catch (_) {} }
    opener = null;
  }

  function wire() {
    document.addEventListener("click", function (e) {
      if (e.target.closest(".menu-btn")) { e.preventDefault(); openDrawer(); return; }
      if (e.target.closest(".drawer-x") || e.target.closest("#scrim")) { e.preventDefault(); closeDrawer(); return; }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });
    // Newsletter subscribe — standalone (no shared ctaForm handler on the blog).
    // Validate → POST /api/subscribe (honeypot-only endpoint) → success/inline-error.
    document.addEventListener("submit", function (e) {
      var form = e.target.closest && e.target.closest("form.cta-sub");
      if (!form) return;
      e.preventDefault();
      var btn = form.querySelector(".cta-go");
      var msg = form.querySelector(".cta-msg");
      if (msg) { msg.textContent = ""; msg.className = "cta-msg"; }
      var em = (form.em && form.em.value || "").trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) {
        if (msg) { msg.textContent = "Please enter a valid email."; msg.className = "cta-msg err"; }
        return;
      }
      if (btn) { btn.disabled = true; btn.textContent = "Signing up..."; }
      fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)),
      })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (res) {
          if (res && res.ok) {
            form.innerHTML =
              '<div class="cta-done"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' +
              "<span>You’re in — look for a welcome email.</span></div>";
          } else {
            if (btn) { btn.disabled = false; btn.textContent = "Get updates"; }
            if (msg) { msg.textContent = (res && res.error) || "Something went wrong. Please try again."; msg.className = "cta-msg err"; }
          }
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = "Get updates"; }
          if (msg) { msg.textContent = "Something went wrong. Please try again."; msg.className = "cta-msg err"; }
        });
    });
  }

  function init() {
    injectStyle();
    injectDrawer();
    wire();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
