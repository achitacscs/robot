// Service worker mínimo: permite instalar el robot como app.
// Siempre busca la versión nueva en internet y, si no hay conexión, usa la última guardada.
const CACHE = 'robot-v2';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // las llamadas a la IA pasan directo
  e.respondWith(
    fetch(e.request, { cache:'no-cache' }).then(r => {
      if (r.ok && !url.pathname.endsWith('version.json')) {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
      }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch:true }))
  );
});
