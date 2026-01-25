/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope

const CACHE_VERSION = 'v1'
const CACHE_NAME = `sternengeschichten-${CACHE_VERSION}`

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
]

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Fail silently if some assets can't be cached
        console.log('Some assets could not be cached')
      })
    })
  )
})

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event
  const url = new URL(request.url)

  // Don't cache external resources (audio streams, external URLs)
  if (url.origin !== location.origin) {
    return
  }

  // Use network first for HTML, CSS, JS
  if (request.method === 'GET') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          // Fall back to cache if network fails
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || new Response('Offline', { status: 503 })
          })
        })
    )
  }
})
