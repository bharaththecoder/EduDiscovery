const CACHE_NAME = 'edudiscovery-cache-v3';
const ASSETS_TO_CACHE = [
  '/',
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

// Fetch Event - Stale-While-Revalidate Strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and local/http/https origins (ignore chrome-extension, etc.)
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Bypass Firebase Authentication, APIs, or database streams from being cached here.
  // We want to fetch dynamic items directly from the network.
  const isApiOrAuth = event.request.url.includes('/api/') || 
                      event.request.url.includes('identitytoolkit') || 
                      event.request.url.includes('firestore') ||
                      event.request.url.includes('firebase');

  if (isApiOrAuth) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchedResponse = fetch(event.request)
          .then((networkResponse) => {
            // Check valid response and cache it
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Fallback for document navigation when offline
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });

        // Return cached response immediately if exists, otherwise wait for network
        return cachedResponse || fetchedResponse;
      });
    })
  );
});
