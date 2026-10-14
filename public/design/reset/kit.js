/* Shared bits for the reset boards: inline sport icons (so CSS can set
   --asnm-ink and --asnm-accent), and a tiny hash router between screens. */
(function () {
  let n = 0;
  async function inlineIcons(root) {
    const spots = [...(root || document).querySelectorAll("[data-icon]")];
    await Promise.all(spots.map(async (el) => {
      const key = el.dataset.icon;
      const txt = await fetch("/emblems/sports/" + key + ".svg").then((r) => r.text());
      const u = "u" + (n++) + "-";
      // Masks are referenced by id, so every inline copy needs its own ids.
      el.innerHTML = txt.replace(/id="asnm-/g, 'id="' + u + "asnm-").replace(/url\(#asnm-/g, "url(#" + u + "asnm-");
      const svg = el.querySelector("svg");
      if (svg) { svg.setAttribute("aria-hidden", "true"); svg.removeAttribute("role"); const t = svg.querySelector("title"); if (t) t.remove(); }
    }));
  }
  function route() {
    const want = (location.hash || "#home").slice(1);
    document.querySelectorAll("[data-screen]").forEach((s) => { s.hidden = s.dataset.screen !== want; });
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", () => { route(); inlineIcons(); });
})();
