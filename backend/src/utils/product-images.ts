import type { WorkerBindings } from '../types/bindings'
import type { ProductEntity } from './serializers'
import { serializeProduct } from './serializers'

const HTTP_URL_REGEX = /^https?:\/\//i

export function resolveImageBaseUrl(reqUrl: string, env: WorkerBindings) {
  const fromEnv = env.PUBLIC_IMAGE_BASE_URL?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, '')
  }
  const parsed = new URL(reqUrl)
  return `${parsed.origin}/api/r2`
}

function appendCacheBuster(url: string, cacheBuster?: string) {
  if (!cacheBuster) {
    return url
  }
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}v=${encodeURIComponent(cacheBuster)}`
}

function guessCacheBuster(product: ProductEntity, env: WorkerBindings) {
  if (env.IMAGE_CACHE_BUSTER) {
    return env.IMAGE_CACHE_BUSTER
  }
  const candidate = product.updatedAt || product.createdAt
  if (!candidate) {
    return undefined
  }
  const parsed = Date.parse(candidate)
  return Number.isNaN(parsed) ? candidate : String(parsed)
}

function getDefaultPrefix(env: WorkerBindings, fallback?: string) {
  if (typeof env.R2_DEFAULT_PREFIX === 'string' && env.R2_DEFAULT_PREFIX.trim().length > 0) {
    return env.R2_DEFAULT_PREFIX.trim().replace(/\/+$/, '')
  }
  if (typeof fallback === 'string' && fallback.trim().length > 0) {
    return fallback.trim().replace(/\/+$/, '')
  }
  return ''
}

function normalizeKeyParts(image: string, product: ProductEntity, env: WorkerBindings) {
  const sanitized = image.replace(/^\/+/, '')
  if (!sanitized) {
    return []
  }

  if (sanitized.includes('/')) {
    return sanitized.split('/').filter(Boolean)
  }

  const prefix = getDefaultPrefix(env, product.category)

  return [prefix, sanitized].filter(Boolean)
}

export function toPublicImageUrl(image: string, product: ProductEntity, baseUrl: string, env: WorkerBindings, cacheBuster?: string) {
  if (!image) {
    return null
  }

  if (HTTP_URL_REGEX.test(image)) {
    return appendCacheBuster(image, cacheBuster)
  }

  const trimmedBase = baseUrl.replace(/\/+$/, '')
  const parts = normalizeKeyParts(image, product, env)
  if (!parts.length) {
    return null
  }

  const encodedPath = parts.map((segment) => encodeURIComponent(segment)).join('/')
  const finalUrl = `${trimmedBase}/${encodedPath}`
  return appendCacheBuster(finalUrl, cacheBuster)
}

export function buildProductResponse(product: ProductEntity, baseUrl: string, env: WorkerBindings) {
  const serialized = serializeProduct(product)
  const cacheBuster = guessCacheBuster(product, env)
  const originalImages = serialized.images ?? []

  const images = originalImages
    .map((image) => toPublicImageUrl(image, product, baseUrl, env, cacheBuster))
    .filter((value): value is string => Boolean(value))

  const fallback =
    images[0] ??
    (() => {
      const firstOriginal = originalImages[0]
      if (firstOriginal) {
        const parts = normalizeKeyParts(firstOriginal, product, env)
        if (parts.length) {
          const encodedPath = parts.map((segment) => encodeURIComponent(segment)).join('/')
          const url = `${baseUrl.replace(/\/+$/, '')}/${encodedPath}`
          return appendCacheBuster(url, cacheBuster)
        }
      }

      const slug =
        serialized.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'sem-imagem'
      const prefix = getDefaultPrefix(env, product.category)
      const fallbackExtension = (() => {
        const ext = firstOriginal?.split('.').pop()
        if (!ext) return 'jpeg'
        return ext.length <= 5 ? ext : 'jpeg'
      })()
      const path = [prefix, `${slug}.${fallbackExtension}`].filter(Boolean).map((segment) => encodeURIComponent(segment)).join('/')
      const url = `${baseUrl.replace(/\/+$/, '')}/${path}`
      return appendCacheBuster(url, cacheBuster)
    })()

  return {
    ...serialized,
    images,
    imageUrl: fallback,
  }
}
