self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('neru-pwa-v1').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/assets/style.css', // Asegúrate de incluir tus archivos CSS
                '/assets/js/script.js', // Asegúrate de incluir tus archivos JavaScript
                '/manifest.json',
                '/assets/img/icon-192x192.png',
                '/assets/img/icon-512x512.png'
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
