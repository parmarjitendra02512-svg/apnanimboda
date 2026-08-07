// Service Worker - APNA NIMBODA PWA
// Auto-update: जब भी website update हो, app अपने आप refresh हो जाएगी
const CACHE_VERSION = 'v' + Date.now(); // हर डिप्लॉय पर नया version
const CACHE_NAME = 'apna-nimboda-' + CACHE_VERSION;

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.jpg',
  '/icon-512.jpg',
  '/icon.jpg',
  '/posts/post1.jpg',
  '/posts/post2.jpg',
  '/posts/post3.jpg',
  '/posts/post4.jpg',
  '/posts/post5.jpg',
  '/posts/post6.jpg',
  '/posts/post7.jpg',
  '/posts/post8.jpg',
  '/posts/post9.jpg',
  '/posts/post10.jpg'
];

// Install - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(() => {})
  );
  // Immediately take control - auto update!
  self.skipWaiting();
});

// Activate - delete old caches, claim clients for instant update
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key.startsWith('apna-nimboda-'))
          .map(key => caches.delete(key))
      )
    ).then(() => {
      // Notify all open tabs to refresh
      return self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
        });
      });
    })
  );
  return self.clients.claim();
});

// Fetch - Network first for dynamic, Cache first for static
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Always network-first for: API, Firebase, auth
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('firebaseio') ||
    url.hostname.includes('firebasestorage') ||
    url.hostname.includes('pixabay') ||
    url.hostname.includes('cdn.')
  ) {
    event.respondWith(
      fetch(event.request)
        .catch(() => new Response('', { status: 503 }))
    );
    return;
  }

  // Cache first for images (posts, icons)
  if (url.pathname.startsWith('/posts/') || url.pathname.startsWith('/icons/') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.png')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network first for pages - so updates show immediately
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200 && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Return a fallback Response so the browser doesn't throw a TypeError
          return new Response('Network Error: Offline and not cached', { status: 503 });
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
