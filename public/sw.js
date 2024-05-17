const CACHE_NAME = 'music-cache';
const CACHE_FONT = 'font-cache';
const CACHE_IMAGE = 'image-cache';
const CACHE_FE = 'fe-cache';
const CACHE_BE = 'be-cache';

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                'static/js/bundle.js'
            ]).then(() => self.skipWaiting());
        })
    );
});

self.addEventListener('active', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {

    const fetchRequest = event.request.clone();

    event.respondWith(
        caches.match(fetchRequest)
            .then(response => {
                return response || fetch(fetchRequest).then(response => {
                    const responseToCache = response.clone();

                    if (fetchRequest.url.startsWith('https://fonts')) {
                        caches.open(CACHE_FONT).then(cache => {
                            cache.put(event.request, responseToCache)
                        });
                    } else if (fetchRequest.headers.get('Accept').includes('image')) {
                        caches.open(CACHE_IMAGE).then(cache => {
                            cache.put(event.request, responseToCache)
                        });
                    } else if (fetchRequest.url.startsWith(`${process.env.REACT_APP_URL_FRONTEND || 'https://music-fe-rho.vercel.app'}`) && response.status === 200) {
                        caches.open(CACHE_FE).then(cache => {
                            cache.put(event.request, responseToCache)
                        });
                    } else if (fetchRequest.url.startsWith(`${process.env.REACT_APP_URL_BACKEND || 'https://music-be-six.vercel.app'} `) && response.status === 200 && !response.headers.get('Content-Type').includes('audio')) {
                        caches.open(CACHE_BE).then(cache => {
                            cache.put(event.request, responseToCache)
                        });
                    }

                    return response;
                }).catch(error => {
                    return caches.match('offline.html')
                });
            })
    );
});