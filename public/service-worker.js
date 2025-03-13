const CACHE_NAME = 'spin-the-wheel-v1';
const urlsToCache = [
    '/spin',
    '/spin.html',
    '/manifest.json',
    '/service-worker.js',
    '/icon-192.png',
    '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('wheel-cache-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/spin.html',
        '/style.css',
        '/images/icon-192.png'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
