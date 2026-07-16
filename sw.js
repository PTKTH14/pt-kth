const CACHE_NAME = 'pt-kth-v20260716-line-share-v11';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.svg', './icon-512.svg'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).catch(() => undefined));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(name => name.startsWith('pt-kth') && name !== CACHE_NAME).map(name => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET') return;
  const url = new URL(request.url);
  if(url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request, { cache:'no-store' })
      .then(response => {
        if(response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request.mode === 'navigate' ? './index.html' : request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if(cached) return cached;
        if(request.mode === 'navigate') return caches.match('./index.html');
        throw new Error('Offline and no cached response');
      })
  );
});

self.addEventListener('message', event => {
  if(event.data === 'SKIP_WAITING') self.skipWaiting();
});
