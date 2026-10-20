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

  // Lucide placeholders are rendered automatically by /icons.js.
  var IC = {
    x: '<i stroke-width="2" data-lucide="x" aria-hidden="true" focusable="false"></i>',
  };

  // Presentation is shared through /styles.css.
  function drawerHtml() {
    var head =
      '<div class="drawer-head"><b>Adaptive Sports Near Me</b>' +
      '<button class="drawer-x" type="button" aria-label="Close menu">' + IC.x + "</button></div>";
    // The same groups, in the same order, as the app's menu (drawerList in public/app/app.js).
    var row = function (href, label) { return '<a class="drawer-row-main" href="' + href + '"><span class="drawer-row-label">' + label + "</span></a>"; };
    var group = function (title, rows) { return '<div class="drawer-div"></div><div class="drawer-sec drawer-util"><p class="eyebrow">' + title + "</p>" + rows + "</div>"; };
    var find =
      '<div class="drawer-sec drawer-util">' +
      row("/", "Programs near you") + row("/sports", "Sports") + row("/grants", "Grants") + row("/events", "Events") + row("/resources", "Guides") +
      "</div>";
    var browse = group("Browse", row("/states", "States") + row("/organizations", "Organizations"));
    var build = group("Help build this", row("/add/program", "Add a program") + row("/add/event", "Add an event") + row("/help", "Claim your organization"));
    var about = group("About this directory", row("/about", "How we check listings") + row("/blog", "Blog") + row("/build", "Build with us") +
      '<a class="drawer-row-main" href="https://sign.adapttolife.org/waiver?source=asnm"><span class="drawer-row-label">Sign waiver</span></a>');
    // The letter: the same words as the app's letter block.
    var news =
      '<div class="drawer-div"></div><div class="drawer-news">' +
      '<p class="dn-eyebrow">Get the letter</p>' +
      "<p class=\"dn-head\">New programs, grants and events, only when there's something worth sending.</p>" +
      '<form class="cta-sub" novalidate>' +
      '<input class="hp" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<input name="em" type="email" autocomplete="email" placeholder="name@example.com" aria-label="Email">' +
      '<button class="cta-go" type="submit">Subscribe</button>' +
      '<div class="cf-turnstile" data-sitekey="0x4AAAAAADr2WPepRgjp8g-R"></div>' +
      '<div class="cta-msg" aria-live="polite"></div>' +
      "</form>" +
      '<p class="dn-fine">Unsubscribe any time.</p>' +
      "</div>";
    return head + find + browse + build + about + news;
  }

  // These pages do not load Turnstile up front and the drawer is injected after page
  // load, so load the script on first open and render the drawer widget explicitly.
  var TS_SITEKEY = "0x4AAAAAADr2WPepRgjp8g-R";
  function renderDrawerTurnstile() {
    var el = document.querySelector("#drawer form.cta-sub .cf-turnstile");
    if (!el || el.childElementCount) return;
    if (window.turnstile) {
      // Runs only when the button is pressed (see waitForToken); compact fits the card.
      try {
        window.turnstile.render(el, {
          sitekey: TS_SITEKEY, appearance: "interaction-only", execution: "execute",
          size: el.clientWidth < 300 ? "compact" : "flexible",
        });
      } catch (_) { }
      return;
    }
    if (document.getElementById("ts-api")) return;
    window.__drawerTs = renderDrawerTurnstile;
    var s = document.createElement("script");
    s.id = "ts-api"; s.async = true; s.defer = true;
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__drawerTs";
    document.head.appendChild(s);
  }

  // A fast submit can beat the managed check; wait briefly for the token.
  // Tokens are single-use, so every submit resets and runs the widget again.
  function waitForToken(form, ms) {
    return new Promise(function (resolve) {
      var el = form.querySelector(".cf-turnstile");
      if (!el) return resolve("");
      if (window.turnstile) {
        try { window.turnstile.reset(el); } catch (_) { }
        try { window.turnstile.execute(el); } catch (_) { }
      }
      var waited = 0, asked = false;
      (function poll() {
        // An interaction-only widget has no height until Cloudflare wants a tap;
        // a person shown the box needs time to tap it, and a prompt.
        if (!asked && el.offsetHeight > 0) {
          asked = true;
          el.style.marginTop = "0"; // give the shown box its row gap back
          var m = form.querySelector(".cta-msg");
          if (m) m.textContent = "Tap the box to finish signing up.";
        }
        var v = form.querySelector('[name="cf-turnstile-response"]');
        if (v && v.value) return resolve(v.value);
        if (waited >= (asked ? 120000 : ms)) return resolve("");
        waited += 250;
        setTimeout(poll, 250);
      })();
    });
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
    renderDrawerTurnstile();
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
      var em = (form.em && form.em.value || "").trim().replace(/^mailto:/i, "");
      if (form.em) form.em.value = em;
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) {
        if (msg) { msg.textContent = "Enter an email address, like name@example.com."; msg.className = "cta-msg err"; }
        return;
      }
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      var body = new URLSearchParams(new FormData(form));
      waitForToken(form, 8000).then(function (tok) {
        if (!tok) return { ok: false, error: "We couldn't send that. Reload the page and try again." };
        body.set("cf_token", tok);
        return fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body,
        });
      })
        .then(function (r) { return r && r.json ? r.json().catch(function () { return {}; }) : r; })
        .then(function (res) {
          if (res && res.ok) {
            form.innerHTML =
              '<div class="cta-done"><i stroke-width="2.6" data-lucide="check" aria-hidden="true" focusable="false"></i>' +
              "<span>Almost done. Check your inbox and tap Confirm.</span></div>";
          } else {
            if (btn) { btn.disabled = false; btn.textContent = "Subscribe"; }
            if (msg) { msg.textContent = (res && res.error) || "We couldn't send that. Check your connection and try again."; msg.className = "cta-msg err"; }
          }
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = "Subscribe"; }
          if (msg) { msg.textContent = "We couldn't send that. Check your connection and try again."; msg.className = "cta-msg err"; }
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
