// ============================================================
// sw.js — Service Worker for EN PWA (drdangeli.com)
// IMPORTANT: increment CACHE_NAME with every index.html update!
// ============================================================

const CACHE_NAME = 'ns-en-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install — cache core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(err => {
        console.warn('Cache addAll failed:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate — delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — network-first strategy (always fresh data, cache as fallback)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Skip waiting — for instant update when new version is available
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
