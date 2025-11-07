// Service Worker para Leia Sabores
// Versão: 2.0 - Atualizado para novo painel admin

const CACHE_VERSION = 'v2.0-admin-panel'
const CACHE_NAME = `leiasabores-${CACHE_VERSION}`

// Arquivos para cache
const CACHE_FILES = [
  '/',
  '/index.html',
]

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...', CACHE_VERSION)
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cache opened')
      return cache.addAll(CACHE_FILES)
    })
  )
  // Forçar ativação imediata
  self.skipWaiting()
})

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...', CACHE_VERSION)
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Deletar caches antigos
          if (cacheName !== CACHE_NAME && cacheName.startsWith('leiasabores-')) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  // Tomar controle imediato
  return self.clients.claim()
})

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  // Sempre buscar do servidor para HTML (evitar cache de versões antigas)
  if (event.request.destination === 'document' || url.pathname === '/admin') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache apenas se a resposta for válida
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Fallback para cache se offline
          return caches.match(event.request)
        })
    )
    return
  }

  // Para outros recursos, usar estratégia network-first
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(event.request)
      })
  )
})

// Mensagem para forçar atualização
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
