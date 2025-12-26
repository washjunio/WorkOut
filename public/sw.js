self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Cache-first basico para assets; pode ser expandido.
  if (event.request.method !== 'GET') return;
});
