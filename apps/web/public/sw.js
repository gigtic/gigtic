self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A basic fetch handler to satisfy the PWA installability requirements.
  // In a real production app, you might want to cache assets here.
  event.respondWith(fetch(event.request));
});
