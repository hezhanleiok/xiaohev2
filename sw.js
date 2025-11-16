
const CACHE_NAME = 'xiaohev2-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/hooks/useServerManager.ts',
  '/components/icons.tsx',
  '/components/ServerItem.tsx',
  '/components/ServerList.tsx',
  '/components/ControlPanel.tsx',
  '/components/SettingsModal.tsx',
  '/components/Modal.tsx',
  '/components/AboutModal.tsx',
  '/components/ShareModal.tsx',
  '/components/AddServerModal.tsx',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Use addAll with a new Request object to bypass cache for updates
        const promises = urlsToCache.map((url) => {
          return cache.add(new Request(url, { cache: 'reload' }));
        });
        return Promise.all(promises);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache first, then network
        return response || fetch(event.request);
      })
  );
});

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