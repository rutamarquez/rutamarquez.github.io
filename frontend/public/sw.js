// Service worker de Ruta Márquez.
// Guarda en el celular lo que el visitante ya abrió, para que la app cargue rápido
// y siga funcionando sin señal en las veredas.
//
// - Datos (data/*.json): primero intenta internet (para tener lo más reciente) y,
//   si no hay señal, usa la copia guardada.
// - Lo demás (código, estilos, íconos, PDF, fuentes, mapa): usa la copia guardada
//   y la actualiza en segundo plano.
//
// Al publicar una versión nueva, cambie VERSION para que se borre la copia vieja.

const VERSION = 'ruta-marquez-v1'
const BASICOS = ['./', './index.html', './manifest.webmanifest', './icons/icono-192.png']

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(VERSION).then((c) => c.addAll(BASICOS)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

async function primeroRed(peticion) {
  const cache = await caches.open(VERSION)
  try {
    const respuesta = await fetch(peticion)
    if (respuesta.ok) cache.put(peticion, respuesta.clone())
    return respuesta
  } catch {
    return (await cache.match(peticion)) ?? Response.error()
  }
}

async function primeroCache(peticion) {
  const cache = await caches.open(VERSION)
  const guardada = await cache.match(peticion)
  const deRed = fetch(peticion)
    .then((r) => {
      if (r.ok || r.type === 'opaque') cache.put(peticion, r.clone())
      return r
    })
    .catch(() => null)
  return guardada ?? (await deRed) ?? Response.error()
}

self.addEventListener('fetch', (evento) => {
  const { request } = evento
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  // Firebase (reseñas) siempre va directo a internet.
  if (url.hostname.includes('googleapis.com') && !url.hostname.startsWith('fonts')) return

  if (request.mode === 'navigate') {
    evento.respondWith(primeroRed(request).then((r) => (r.type === 'error' ? caches.match('./') : r)))
  } else if (url.pathname.includes('/data/')) {
    evento.respondWith(primeroRed(request))
  } else if (url.origin === location.origin || url.hostname.includes('fonts.') || url.hostname.includes('tile.openstreetmap.org')) {
    evento.respondWith(primeroCache(request))
  }
})
