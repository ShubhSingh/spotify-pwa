const CACHE_NAME = 'spotify-pwa-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/images/icon-192x192.svg',
    '/images/icon-512x512.svg'
];

// Install service worker and cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch resources from cache or network
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (event.request.url.startsWith(self.location.origin) || 
        event.request.url.includes('open.spotify.com')) {
        
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    // Return cached response if found
                    if (response) {
                        return response;
                    }
                    
                    // Clone the request because it's a one-time use stream
                    const fetchRequest = event.request.clone();
                    
                    return fetch(fetchRequest).then(response => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response because it's a one-time use stream
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                            
                        return response;
                    });
                })
        );
    }
});

// Made with Bob
