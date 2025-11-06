const CACHE_NAME = 'cake-decor-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  // Ignore non-http(s) schemes (e.g., chrome-extension://) to prevent Cache API errors
  const reqUrl = new URL(event.request.url)
  if (reqUrl.protocol !== 'http:' && reqUrl.protocol !== 'https:') {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }

      return fetch(event.request).then((response) => {
        // Cache only successful same-origin responses
        const isOk = !!response && response.status === 200
        const isSameOrigin = reqUrl.origin === self.location.origin
        const isBasic = response.type === 'basic'
        if (!isOk || !isSameOrigin || !isBasic) {
          return response
        }

        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          // Best-effort put into cache; ignore failures
          cache.put(event.request, responseToCache).catch(() => {})
        })

        return response
      }).catch(() => {
        return caches.match('/')
      })
    })
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
