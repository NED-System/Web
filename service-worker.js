// NED - Service Worker para sistema de caché
const CACHE_NAME = 'ned-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/pages/negocios.html',
  '/pages/consumidores.html',
  '/pages/planes.html',
  '/pages/offline.html',
  '/styles/style.css',
  '/styles/negocios.css',
  '/scripts/animations.js',
  '/scripts/register-sw.js',
  '/components/header.js',
  '/components/footer.js',
  '/assets/logo/Logo NED Copy.png',
  '/assets/logo/Logo NED ico.png',
  '/assets/inicio/Consumidores.png',
  '/assets/inicio/Negocios.png',
  '/assets/social/facebook-icon.svg',
  '/assets/social/instagram-icon.svg',
  '/manifest.json'
  // Las imágenes adicionales se agregarán dinámicamente
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación y limpieza de caches antiguos
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de caché: Cache First, luego Network
self.addEventListener('fetch', (event) => {
  // Ignorar solicitudes a APIs externas o CDNs
  if (!event.request.url.startsWith(self.location.origin) ||
      event.request.url.includes('youtube.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Devuelve el recurso cacheado si existe
        if (response) {
          return response;
        }

        // Si no está en caché, busca en la red
        return fetch(event.request).then((networkResponse) => {
          // Verifica si la respuesta es válida
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // Clona la respuesta para guardarla en caché
          const responseToCache = networkResponse.clone();

          // Almacena en caché la nueva respuesta
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return networkResponse;
        });
      })
      .catch(() => {
        // Fallback para recursos que no se pueden cargar
        if (event.request.url.includes('.png') || 
            event.request.url.includes('.jpg') || 
            event.request.url.includes('.svg')) {
          return new Response('', { status: 404 });
        }
        
        // Si es una página HTML, mostrar la página offline
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/pages/offline.html');
        }
      })
  );

});