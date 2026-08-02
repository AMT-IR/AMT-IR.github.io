```javascript
const CACHE_NAME = 'sponsoracb-pwa-v1';

// لیست فایل‌هایی که برای اجرای آفلاین باید کش شوند
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://sponsoracb.ir/20474.png'
];

// مرحله نصب: فایل‌های ضروری را کش می‌کنیم
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  // فعالسازی سریع سرویس ورکر
  self.skipWaiting();
});

// مرحله فعال‌سازی: کش‌های قدیمی را پاک می‌کنیم
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

// مدیریت درخواست‌ها: اگر آفلاین بودیم از کش می‌خوانیم
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // بازگرداندن فایل کش شده در صورت وجود
        if (response) {
          return response;
        }
        // اگر در کش نبود، از شبکه می‌گیریم
        return fetch(event.request).catch(() => {
          // اگر کاربر کاملا آفلاین بود و درخواستی برای صفحه داشت، صفحه اصلی کش شده را نمایش می‌دهیم
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

```
