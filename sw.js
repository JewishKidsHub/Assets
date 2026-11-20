/* Caches the page and the AI library so the app opens with no Wi-Fi.
   (The model itself is cached separately by the AI library.) */
const CACHE = "jkh-ai-shell-v1";
const HOSTS = ["esm.run", "cdn.jsdelivr.net"];

self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(self.clients.claim()); });

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const ok = url.origin === self.location.origin || HOSTS.includes(url.hostname);
  if (!ok) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req);
    const net = fetch(req).then(res => {
      if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    return hit || (await net) || new Response("Offline", {status: 503});
  })());
});
