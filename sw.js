const CACHE_NAME = 'pt-kth-v20260802-admin-center-monthly-history-v77';
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

  if(request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache:'no-store' })
        .then(response => {
          if(response && response.ok)caches.open(CACHE_NAME).then(cache => cache.put('./index.html',response.clone()));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const update=fetch(request).then(response => {
        if(response && response.ok)caches.open(CACHE_NAME).then(cache => cache.put(request,response.clone()));
        return response;
      }).catch(() => cached);
      return cached || update;
    })
  );
});

self.addEventListener('message', event => {
  if(event.data === 'SKIP_WAITING') self.skipWaiting();
});
