    const CACHE_NAME = 'durable-cache-v5';
    const EXPIRY_DATE = new Date('2026-01-20T23:59:59').getTime();
    const DB_NAME = 'SecurityDB';
    const STORE_NAME = 'AccessInfo';
    const LAST_ENTRY_KEY = 'lastEntry';
    const urlsToCache = [
        '/fcghvjg.html'
    ];

    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                    console.log("تم إنشاء مخزن البيانات بنجاح");
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject("خطأ في فتح قاعدة البيانات");
        });
    }

    async function getStorageData(key) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const getReq = store.get(key);
            getReq.onsuccess = () => resolve(getReq.result);
            getReq.onerror = () => reject(getReq.error);
        });
    }

    async function updateStorageData(key, value) {
        try {
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.put(value, key);
        } catch (err) {
            console.error("فشل تحديث البيانات:", err);
        }
    }

    self.addEventListener('install', (event) => {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then((cache) => {
                    return cache.addAll(urlsToCache);
                })
                .then(() => self.skipWaiting())
        );
    });

    self.addEventListener('fetch', (event) => {
        event.respondWith(
            (async () => {
                const { request } = event;
                const url = new URL(request.url);
                const response = await caches.match(request);
                if (url.pathname === '/fcghvjg.html'){
                    try {
                        const now = Date.now();
                        if (now > EXPIRY_DATE) {
                            return new Response("<h1 style='text-align:center;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;'>the app has expired</h1>", {
                                headers: { 'Content-Type': 'text/html; charset=utf-8' }
                            });
                        }
                        const lastStoredValue = await getStorageData(LAST_ENTRY_KEY);
                        if (lastStoredValue && now < lastStoredValue) {
                            return new Response("<h1 style='text-align:center;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;'>Time system error.Please set the clock automatically</h1>", {
                                headers: { 'Content-Type': 'text/html; charset=utf-8' }
                            });
                        }
                        updateStorageData(LAST_ENTRY_KEY, now);
                    } catch (error) {
                        return new Response("<h1 style='text-align:center;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;'>Security Check Error</h1>", {
                            headers: { 'Content-Type': 'text/html; charset=utf-8' }
                        });
                    }
                }
                return response || fetch(request);
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
            .then(() => self.clients.claim())
        );
    });