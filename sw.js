const CACHE = 'radar-v43';
const ASSETS = ['./', './manifest.json', './icon-192.png', './icon-512.png', './icon.png', './favicon.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  // Navigation requests (page loads): always serve the root document from cache.
  // This prevents auth callback URLs (?lastfm_token=, ?access_token=, etc.) from
  // being cached and re-served on refresh, which would trigger a stale token exchange.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match('./').then(cached => cached || fetch('./'))
    );
    return;
  }

  // Assets: stale-while-revalidate
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
      return cached || fetchPromise;
    })
  );
});
