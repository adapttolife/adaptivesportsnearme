try {
  const saved = JSON.parse(localStorage.getItem("asnm.theme") || "null");
  document.documentElement.dataset.theme =
    saved === "light" || saved === "dark"
      ? saved
      : matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
} catch {
  document.documentElement.dataset.theme = matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches
    ? "dark"
    : "light";
}

window.ASNM_EARLY = window.ASNM_EARLY || {};
for (const url of ["/api/listings", "/data/states.json", "/data/sports.json"])
  window.ASNM_EARLY[url] = fetch(url).catch(() => {});

if ("serviceWorker" in navigator)
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      for (const registration of registrations)
        registration.update().catch(() => {});
    })
    .catch(() => {});
