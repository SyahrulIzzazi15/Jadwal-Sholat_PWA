const CACHE_NAME = 'jadwal-sholat-cache-v1';
const DATA_CACHE_NAME = 'jadwal-sholat-data-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/icon-192x192.png',
    '/icon-512x512.png'
];

// Event listener untuk instalasi service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Failed to cache', error);
            })
    );
});

// Event listener untuk fetch request
self.addEventListener('fetch', event => {
    if (event.request.url.includes('api.aladhan.com')) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(event.request)
                    .then(response => {
                        if (response.status === 200) {
                            cache.put(event.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(() => {
                        return caches.match(event.request);
                    });
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    return response || fetch(event.request);
                })
                .catch(error => {
                    console.error('Fetch failed; returning offline page instead.', error);
                    return caches.match('/');
                })
        );
    }
});


// Event listener untuk menangani push notifikasi
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Notifikasi';
    const options = {
        body: data.body || '',
        icon: data.icon || '/icon-192x192.png',
        badge: '/icon-192x192.png',
    };

    event.waitUntil(self.registration.showNotification(title, options));
});
