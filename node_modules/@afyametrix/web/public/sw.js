self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("afyametrix-shell-v1").then((cache) => {
      return cache.addAll(["/"]);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    }),
  );
});
