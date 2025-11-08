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
 */
export async function bustProductCache(env: WorkerBindings, productId: string) {
  await Promise.all([
    invalidateCache(env, `product:${productId}`),
    invalidateCache(env, 'products:list'),
    invalidateCache(env, 'products:categories'),
    revalidate(env, [`/products/${productId}`, '/catalogo', '/']),
  ])
}

/**
 * Cache busting for category updates
 */
export async function bustCategoryCache(env: WorkerBindings, categoryId?: string) {
  await Promise.all([
    invalidateCache(env, 'categories:tree'),
    invalidateCache(env, 'categories:list'),
    invalidateCache(env, 'products:list'),
    revalidate(env, ['/catalogo', '/']),
  ])

  if (categoryId) {
    await invalidateCache(env, `category:${categoryId}`)
    await revalidate(env, [`/catalogo?category=${categoryId}`])
  }
}

/**
 * Cache busting for coupon updates
 */
export async function bustCouponCache(env: WorkerBindings) {
  await Promise.all([
    invalidateCache(env, 'coupons:active'),
    invalidateCache(env, 'coupons:list'),
    revalidate(env, ['/cart', '/checkout']),
  ])
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

