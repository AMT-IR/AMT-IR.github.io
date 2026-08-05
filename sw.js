const CACHE_NAME = 'sponsoracb-pwa-v2';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  // اجبار به فعال‌سازی فوری نسخه جدید
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // فقط درخواست‌های GET را مدیریت می‌کنیم
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    // ابتدا تلاش برای دریافت از شبکه (اینترنت)
    fetch(event.request).catch(() => {
      // اگر اینترنت قطع بود، بررسی در کش
      return caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        // اگر صفحه درخواستی HTML بود و در کش نبود، صفحه اصلی را برگردان
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
