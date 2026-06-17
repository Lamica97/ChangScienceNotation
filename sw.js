const CACHE_NAME = 'scinotation-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './icon.png',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;700&family=Prompt:wght@300;400;600;700&display=swap'
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
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              // Note: Google Fonts woff2 files are from a different origin, their type is 'cors' or 'opaque'
              // So we should relax the type check for gstatic.com
              if (event.request.url.includes('fonts.gstatic.com')) {
                 const responseToCache = response.clone();
                 caches.open(CACHE_NAME).then(cache => {
                   cache.put(event.request, responseToCache);
                 });
                 return response;
              }
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});
