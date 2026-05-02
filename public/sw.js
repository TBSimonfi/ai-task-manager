// Service Worker for AI Task Manager PWA
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('fetch', (event) => {
  // Simple pass-through for now, can be improved for offline support
  event.respondWith(fetch(event.request));
});
