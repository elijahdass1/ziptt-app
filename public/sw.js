const CACHE = 'ziptt-v1'
const OFFLINE_URL = '/offline'

const PRECACHE = [
  '/',
  '/offline',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  // Only handle GET requests for same-origin navigations and assets.
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith(self.location.origin)) return
  // Skip API routes — always go to network.
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // Cache successful responses for static assets.
        if (res.ok && (event.request.destination === 'script' || event.request.destination === 'style' || event.request.destination === 'image')) {
          const clone = res.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, clone))
        }
        return res
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached
          if (event.request.mode === 'navigate') return caches.match(OFFLINE_URL)
          return new Response('Offline', { status: 503 })
        })
      )
  )
})
