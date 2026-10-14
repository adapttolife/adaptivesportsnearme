// Retired 2026-10-14 with the old site. A visitor who still has the old service
// worker gets this one on their next visit: it deletes the old caches and
// unregisters itself, so every page comes straight from the network again.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) await caches.delete(k);
    await self.registration.unregister();
  })());
});
