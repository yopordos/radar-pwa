const CACHE = 'radar-v50';
const ASSETS = ['./app', './manifest.json', './icon-192.png', './icon-512.png', './icon.png', './favicon.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(ASSETS.map(a => c.add(a))))
      .then(() => self.skipWaiting())
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

  if (e.request.mode === 'navigate') {
    const url = new URL(e.request.url);
    const isApp = url.pathname === '/app.html' || url.pathname === '/app' || url.pathname.endsWith('/app.html');

    // Landing page and other non-app routes go straight to network — no SW interception
    if (!isApp) return;

    // App shell: serve from cache using canonical URL (./app, no redirect)
    e.respondWith(
      caches.open(CACHE).then(c =>
        c.match('./app')
          .then(cached => cached || fetch('./app'))
          .catch(() => fetch('./app'))
      )
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
