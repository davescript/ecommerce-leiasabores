import { Context, Next } from 'hono'
import { eq, lt } from 'drizzle-orm'
import type { WorkerBindings } from '../types/bindings'
import { getDb } from '../lib/db'
import { rateLimits } from '../models/schema'

export interface RateLimitOptions {
  window: number // seconds
  max: number // max requests per window
  keyGenerator?: (c: Context) => string
}

/**
 * Rate limiting middleware
 */
export function rateLimit(options: RateLimitOptions) {
  return async (c: Context<{ Bindings: WorkerBindings }>, next: Next) => {
    const key = options.keyGenerator
      ? options.keyGenerator(c)
      : c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'

    const db = getDb(c.env)
    const now = new Date()

    // Clean up expired rate limits
    await db.delete(rateLimits).where(lt(rateLimits.resetAt, now.toISOString()))

    // Get or create rate limit entry
    const rateLimitEntry = await db.query.rateLimits.findFirst({
      where: eq(rateLimits.key, key),
    })

    if (rateLimitEntry) {
      const resetAt = new Date(rateLimitEntry.resetAt)

      // Check if window has expired
      if (now > resetAt) {
        // Reset counter
        await db.update(rateLimits)
          .set({
            count: 1,
            resetAt: new Date(now.getTime() + options.window * 1000).toISOString(),
          })
          .where(eq(rateLimits.key, key))
      } else {
        // Check if limit exceeded
        if (rateLimitEntry.count >= options.max) {
          c.header('X-RateLimit-Limit', options.max.toString())
          c.header('X-RateLimit-Remaining', '0')
          c.header('X-RateLimit-Reset', Math.floor(resetAt.getTime() / 1000).toString())
          return c.json({ error: 'Too many requests' }, 429)
        }

        // Increment counter
        await db.update(rateLimits)
          .set({ count: rateLimitEntry.count + 1 })
          .where(eq(rateLimits.key, key))

        c.header('X-RateLimit-Limit', options.max.toString())
        c.header('X-RateLimit-Remaining', (options.max - rateLimitEntry.count - 1).toString())
        c.header('X-RateLimit-Reset', Math.floor(resetAt.getTime() / 1000).toString())
      }
    } else {
      // Create new rate limit entry
      await db.insert(rateLimits).values({
        key,
        count: 1,
        resetAt: new Date(now.getTime() + options.window * 1000).toISOString(),
        createdAt: now.toISOString(),
      })

      c.header('X-RateLimit-Limit', options.max.toString())
      c.header('X-RateLimit-Remaining', (options.max - 1).toString())
      c.header('X-RateLimit-Reset', Math.floor((now.getTime() + options.window * 1000) / 1000).toString())
    }

    return next()
  }
}

/**
 * Default rate limiters
 */
export const loginRateLimit = rateLimit({
  window: 60 * 15, // 15 minutes
  max: 5, // 5 attempts
  keyGenerator: (c) => {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
    const email = c.req.query('email') || 'unknown'
    return `login:${ip}:${email}`
  },
})

export const apiRateLimit = rateLimit({
  window: 60, // 1 minute
  max: 100, // 100 requests
})

