    const CACHE_NAME = 'my-pwa-cache-v3';
    const EXPIRY_DATE = new Date('2026-01-15T22:59:59').getTime();
    const LAST_TIME_KEY_PWA = 0;
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
                const now = new Date().getTime();
                const lastStoredTime = localStorage.getItem(LAST_TIME_KEY_PWA);
                if (now > EXPIRY_DATE) {
                    return new Response('the app has expired', {
                            status: 200,
                            headers: { 'Content-Type': 'text/html; charset=utf-8' }
                        });
                }
                if (now < lastStoredTime) {
                    return new Response('Time system error.Please set the clock automatically', {
                            status: 200,
                            headers: { 'Content-Type': 'text/html; charset=utf-8' }
                        });
                }
                localStorage.setItem(LAST_TIME_KEY_PWA, now);
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