    const CACHE_NAME = 'my-pwa-cache-v4';
    const EXPIRY_DATE = new Date('2026-01-16T22:59:59').getTime();
    const DB_NAME = 'SecurityDB';
    const STORE_NAME = 'AccessInfo';
    const LAST_ENTRY_KEY = 'lastEntry';
    const urlsToCache = [
        '/fcghvjg.html'
    ];

    function getStorageData(key) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onsuccess = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    resolve(null);
                    return;
                }
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const getReq = store.get(key);
                getReq.onsuccess = () => resolve(getReq.result);
                getReq.onerror = () => reject(getReq.error);
            };
            request.onerror = () => reject("Failed to open DB");
        });
    }

    function updateStorageData(key, value) {
        const request = indexedDB.open(DB_NAME, 1);
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.put(value, key);
        };
    }

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
            (async () => {
                try {
                    const now = new Date().now();
                    const lastStoredValue = await getStorageData(LAST_ENTRY_KEY);
                    const lastStoredTime = lastStoredValue ? new Date(lastStoredValue) : null;
                    if (now > EXPIRY_DATE) {
                        return new Response("<h1>'the app has expired'</h1>", {
                            headers: { 'Content-Type': 'text/html; charset=utf-8' }
                        });
                    }
                    if (lastStoredTime && now < lastStoredTime) {
                        return new Response("<h1>Time system error.Please set the clock automatically</h1>", {
                            headers: { 'Content-Type': 'text/html; charset=utf-8' }
                        });
                    }
                    updateStorageData(LAST_ENTRY_KEY, now.toISOString());
                    return fetch(event.request);
                } catch (error) {
                    console.error("Security Check Error:", error);
                    return fetch(event.request);
                }
            })()
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