// ASNM service worker — installable app shell, offline-tolerant directory.
// HTML/navigation + /api/*: network-first with cache fallback, so deploys reach
// returning visitors immediately and the last-seen page/directory still renders
// offline. Immutable static assets (photos, icons, fonts): cache-first.
// POST endpoints and /api/admin are never cached.
const VERSION = "asnm-v2";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(["/", "/manifest.json", "/favicon.svg", "/icon-192.png"])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function networkFirst(req) {
  return fetch(req)
    .then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy));
      }
      return res;
    })
    .catch(() => caches.match(req).then((hit) => hit || Response.error()));
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/admin")) return;

  const isHTML = req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");
  if (isHTML || url.pathname.startsWith("/api/")) {
    e.respondWith(networkFirst(req));
    return;
  }

  // immutable static assets: cache-first, fill as we go
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && /\.(css|js|png|jpg|svg|json|woff2?)$/.test(url.pathname)) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
