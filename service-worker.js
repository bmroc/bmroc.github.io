    const CACHE_NAME = 'my-pwa-cache-v2';
    const EXPIRY_DATE = new Date('2026-01-15T22:59:59').getTime();
    const LAST_TIME_KEY = "last_known_time";
    const urlsToCache = [
        '/fcghvjg.html'
    ];

    self.addEventListener('install', (event) => {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then((cache) => {
                    console.log('Opened cache');
                    return cache.addAll(urlsToCache);
                })
        );
    });

    self.addEventListener('fetch', (event) => {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    });

    self.addEventListener('activate', (event) => {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        );

    });
