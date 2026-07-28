const CACHE_NAME = 'edudiscovery-cache-v4';
const ASSETS_TO_CACHE = [
  '/index.html',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// Install Event - Pre-cache essential shells
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline shell');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

const shouldBypassCache = (requestUrl) => {
  return requestUrl.includes('/api/') ||
         requestUrl.includes('identitytoolkit') ||
         requestUrl.includes('firestore') ||
         requestUrl.includes('firebase') ||
         requestUrl.includes('googleapis.com');
};

const isStaticAsset = (request) => {
  return request.destination === 'script' ||
         request.destination === 'style' ||
         request.destination === 'image' ||
         request.destination === 'font' ||
         request.destination === 'manifest';
};

// Fetch Event - network-first for app navigation, cache-first for hashed assets.
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and local/http/https origins (ignore chrome-extension, etc.)
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Bypass Firebase Authentication, APIs, or database streams from being cached here.
  // We want to fetch dynamic items directly from the network.
  if (shouldBypassCache(event.request.url)) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match('/index.html').then((cached) => cached || caches.match('/')))
    );
    return;
  }

  if (isStaticAsset(event.request)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => (
        cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;

          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        })
      ))
    );
  }
});
