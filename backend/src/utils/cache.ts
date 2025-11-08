import type { WorkerBindings } from '../types/bindings'
import { getDb } from '../lib/db'
import { cacheKeys } from '../models/schema'
import { eq } from 'drizzle-orm'

/**
 * Invalidate cache by updating version
 */
export async function invalidateCache(env: WorkerBindings, key: string) {
  const db = getDb(env)
  const version = Date.now().toString()

  await db.insert(cacheKeys)
    .values({
      key,
      version,
      updatedAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: cacheKeys.key,
      set: {
        version,
        updatedAt: new Date().toISOString(),
      },
    })
}

/**
 * Get cache version for a key
 */
export async function getCacheVersion(env: WorkerBindings, key: string): Promise<string> {
  const db = getDb(env)
  const entry = await db.query.cacheKeys.findFirst({
    where: eq(cacheKeys.key, key),
  })

  return entry?.version || '0'
}

/**
 * Revalidate cache for specific paths
 */
export async function revalidate(env: WorkerBindings, paths: string[]) {
  for (const path of paths) {
    await invalidateCache(env, `path:${path}`)
  }

  // Also invalidate global cache
  await invalidateCache(env, 'global')
}

/**
 * Cache busting for product updates
 * This function invalidates all caches related to a product update
 */
export async function bustProductCache(env: WorkerBindings, productId: string) {
  const timestamp = Date.now().toString()
  
  await Promise.all([
    // Invalidate product-specific cache
    invalidateCache(env, `product:${productId}`),
    // Invalidate list caches
    invalidateCache(env, 'products:list'),
    invalidateCache(env, 'products:categories'),
    invalidateCache(env, 'products:all'),
    // Invalidate category caches (product might change categories)
    invalidateCache(env, 'categories:tree'),
    invalidateCache(env, 'categories:list'),
    // Revalidate paths
    revalidate(env, [`/products/${productId}`, '/catalogo', '/', '/produtos']),
  ])
  
  // Also invalidate global cache to ensure everything is fresh
  await invalidateCache(env, 'global')
  
  console.log(`[Cache] Product cache busted for product ${productId} at ${timestamp}`)
}

/**
 * Cache busting for category updates
 */
export async function bustCategoryCache(env: WorkerBindings, categoryId?: string) {
  const timestamp = Date.now().toString()
  
  await Promise.all([
    invalidateCache(env, 'categories:tree'),
    invalidateCache(env, 'categories:list'),
    invalidateCache(env, 'products:list'),
    invalidateCache(env, 'products:categories'),
    invalidateCache(env, 'products:all'),
    revalidate(env, ['/catalogo', '/', '/produtos']),
  ])

  if (categoryId) {
    await invalidateCache(env, `category:${categoryId}`)
    await revalidate(env, [`/catalogo?category=${categoryId}`])
  }
  
  // Also invalidate global cache
  await invalidateCache(env, 'global')
  
  console.log(`[Cache] Category cache busted${categoryId ? ` for category ${categoryId}` : ''} at ${timestamp}`)
}

/**
 * Cache busting for coupon updates
 */
export async function bustCouponCache(env: WorkerBindings) {
  const timestamp = Date.now().toString()
  
  await Promise.all([
    invalidateCache(env, 'coupons:active'),
    invalidateCache(env, 'coupons:list'),
    invalidateCache(env, 'coupons:all'),
    revalidate(env, ['/cart', '/checkout', '/carrinho']),
  ])
  
  // Also invalidate global cache
  await invalidateCache(env, 'global')
  
  console.log(`[Cache] Coupon cache busted at ${timestamp}`)
}

/**
 * Cache busting for order updates
 */
export async function bustOrderCache(env: WorkerBindings, orderId?: string) {
  await Promise.all([
    invalidateCache(env, 'orders:list'),
    invalidateCache(env, 'dashboard:stats'),
    revalidate(env, ['/admin/orders', '/admin']),
  ])
  
  if (orderId) {
    await invalidateCache(env, `orders:${orderId}`)
  }
}

/**
 * Generate cache-busted URL
 */
export async function getCacheBustedUrl(env: WorkerBindings, path: string): Promise<string> {
  const version = await getCacheVersion(env, `path:${path}`)
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}v=${version}`
}

