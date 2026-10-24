// Offline support: the database is fetched network-first (fresh data when online),
// everything else is served from cache and refreshed in the background.
const CACHE = 'openpaintdepth-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  const network = fetch(req).then((res) => {
    if (res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
    }
    return res;
  });

  if (req.url.endsWith('/db.json')) {
    event.respondWith(network.catch(() => caches.match(req)));
  } else {
    event.respondWith(caches.match(req).then((hit) => hit || network));
    event.waitUntil(network.catch(() => {}));
  }
});
