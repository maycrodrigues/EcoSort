const CACHE_NAME = 'ecosort-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/client',
  'https://aistudiocdn.com/@google/genai@^1.29.0',
  'https://cdn.tailwindcss.com',
  '/icon.svg'
];

// Install event: cache the application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Use addAll for atomic operation
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(err => {
        console.error('Failed to cache assets during install:', err);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: serve from cache if available, otherwise fetch from network and cache
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request)
        .then((response) => {
          // If the resource is in the cache, serve it
          if (response) {
            return response;
          }

          // If the resource is not in the cache, fetch it from the network
          return fetch(event.request)
            .then((networkResponse) => {
              // Clone the response because it's a stream and can only be consumed once.
              const responseToCache = networkResponse.clone();

              // Cache the new resource for future use.
              // Do not cache API requests to Gemini.
              if (networkResponse && networkResponse.status === 200 && !networkResponse.url.includes('generativelanguage')) {
                 cache.put(event.request, responseToCache);
              }
              
              return networkResponse;
            });
        });
    })
  );
});
