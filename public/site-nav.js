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
 * Header and drawer styles live in /styles.css.
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

  // Lucide placeholders are rendered automatically by /icons.js.
  var IC = {
    compass: '<i stroke-width="2" data-lucide="compass" aria-hidden="true" focusable="false"></i>',
    map: '<i stroke-width="2" data-lucide="map" aria-hidden="true" focusable="false"></i>',
    calsm: '<i stroke-width="2" data-lucide="calendar-days" aria-hidden="true" focusable="false"></i>',
    price: '<i stroke-width="2" data-lucide="tag" aria-hidden="true" focusable="false"></i>',
    book: '<i stroke-width="2" data-lucide="book-open" aria-hidden="true" focusable="false"></i>',
    plus: '<i stroke-width="2" data-lucide="plus" aria-hidden="true" focusable="false"></i>',
    user: '<i stroke-width="2" data-lucide="user-round" aria-hidden="true" focusable="false"></i>',
    x: '<i stroke-width="2" data-lucide="x" aria-hidden="true" focusable="false"></i>',
  };

  // Presentation is shared through /styles.css.
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
    var mb = document.getElementById("menuBtn");
    if (mb) mb.setAttribute("aria-expanded", "true");
    scrim.classList.add("open");
    document.body.classList.add("drawer-open");
    var x = d.querySelector(".drawer-x");
    if (x) setTimeout(function () { try { x.focus(); } catch (_) { } }, 40);
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
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    var back = menuBtn || opener;
    if (back && back.focus) { try { back.focus(); } catch (_) { } }
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
    // Validate → POST /api/subscribe (Turnstile required: the form must render the widget) → success/inline-error.
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
      var body = new URLSearchParams(new FormData(form));
      var tok = form.querySelector('[name="cf-turnstile-response"]');
      if (tok && tok.value) body.set("cf_token", tok.value);
      fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body,
      })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (res) {
          if (res && res.ok) {
            form.innerHTML =
              '<div class="cta-done"><i stroke-width="2.6" data-lucide="check" aria-hidden="true" focusable="false"></i>' +
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
    injectDrawer();
    wire();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
