// Service worker de Bilwi Noticias.
// Por ahora solo hace una cosa: si una página no se puede cargar por falta de internet,
// muestra /offline.html en lugar del error del navegador. No guarda noticias ni imágenes,
// así que nunca muestra contenido viejo. Al cambiar offline.html, subir la versión.

const CACHE = "bilwi-offline-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("bilwi-") && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  // Solo las páginas; imágenes, datos y la API siguen su camino normal.
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(OFFLINE_URL);
      return cached ?? Response.error();
    }),
  );
});
