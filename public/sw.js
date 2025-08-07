// A simple service worker for caching static assets
const CACHE_NAME = 'collab-tool-cache-v1';
const urlsToCache = [
    '/',
    '/login',
    '/globals.css',
    '/manifest.json',
    '/favicon.ico',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});