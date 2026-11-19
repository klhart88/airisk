/* Offline support: serve the app shell from cache, refresh it in the background.
   Bump VERSION whenever you deploy changed files. Supabase requests are never cached. */
const VERSION = "airisk-v5";
const SHELL = [
  "./", "index.html", "css/app.css", "js/config.js", "js/vendor/supabase.js",
  "js/content.js", "js/learning.js", "js/store.js", "js/app.js", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
  "advisor.html", "advisor.webmanifest", "css/advisor.css", "js/ai-provider.js", "js/advisor.js"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(caches.open(VERSION).then(cache =>
    cache.match(e.request).then(hit => {
      const net = fetch(e.request).then(res => { if (res.ok) cache.put(e.request, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })
  ));
});
