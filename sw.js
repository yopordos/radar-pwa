const CACHE = 'radar-v48';
const ASSETS = ['./', './app.html', './manifest.json', './icon-192.png', './icon-512.png', './icon.png', './favicon.png'];

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

  // Navigation requests: serve the correct shell, stripping any auth callback params
  // (?access_token=, ?lastfm_token=, etc.) to prevent stale token re-exchange on refresh.
  if (e.request.mode === 'navigate') {
    const url = new URL(e.request.url);
    const shell = url.pathname.endsWith('app.html') ? './app.html' : './';
    e.respondWith(
      caches.match(shell).then(cached => cached || fetch(shell))
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
