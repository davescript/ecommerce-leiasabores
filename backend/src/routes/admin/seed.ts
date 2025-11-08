import { Hono } from 'hono'
import type { WorkerBindings } from '../../types/bindings'
import { getDb } from '../../lib/db'
import { adminUsers, rateLimits } from '../../models/schema'
import { hashPassword } from '../../utils/bcrypt'
import { generateId } from '../../utils/id'
import { eq } from 'drizzle-orm'

const seed = new Hono<{ Bindings: WorkerBindings }>()

/**
 * POST /api/v1/admin/seed
 * Seed admin user (only in development/test)
 */
seed.post('/', async (c) => {
  try {
    // Only allow in development or test environments
    if (c.env.ENVIRONMENT !== 'development' && c.env.ENVIRONMENT !== 'test') {
      return c.json({ error: 'Seeding is only allowed in development/test environments' }, 403)
    }

    const db = getDb(c.env)

    // Check if admin user already exists
    const existingAdmin = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, 'admin@leiasabores.pt'),
    })

    if (existingAdmin) {
      return c.json({ 
        message: 'Admin user already exists',
        user: {
          id: existingAdmin.id,
          email: existingAdmin.email,
        },
      })
    }

    // Create admin user
    const adminId = generateId('admin')
    const hashedPassword = await hashPassword('admin123')

    await db.insert(adminUsers).values({
      id: adminId,
      email: 'admin@leiasabores.pt',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
      permissions: ['*'], // All permissions
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return c.json({
      message: 'Admin user created successfully',
      user: {
        id: adminId,
        email: 'admin@leiasabores.pt',
        password: 'admin123', // Only returned in seed
      },
    }, 201)
  } catch (error) {
    console.error('Seed error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * POST /api/v1/admin/seed/clear-rate-limits
 * Clear rate limits (only in development/test, or with X-Test-Mode header)
 */
seed.post('/clear-rate-limits', async (c) => {
  try {
    // Allow in development/test environments OR when test header is present
    const hasTestHeader = c.req.header('X-Test-Mode') === 'true' ||
                          c.req.header('X-Playwright-Test') === 'true'
    const isDevOrTestEnv = c.env.ENVIRONMENT === 'development' || 
                           c.env.ENVIRONMENT === 'test'
    
    if (!hasTestHeader && !isDevOrTestEnv) {
      return c.json({ error: 'Clearing rate limits is only allowed in development/test environments or with test headers' }, 403)
    }

    const db = getDb(c.env)

    // Delete all rate limits that start with 'login:'
    // Get all rate limits and filter in memory (Drizzle doesn't support LIKE directly)
    const allRateLimits = await db.query.rateLimits.findMany()
    const loginRateLimits = allRateLimits.filter(rl => rl.key && rl.key.startsWith('login:'))
    
    if (loginRateLimits.length > 0) {
      const keysToDelete = loginRateLimits.map(rl => rl.key!).filter(Boolean)
      for (const key of keysToDelete) {
        await db.delete(rateLimits).where(eq(rateLimits.key, key))
      }
    }

    return c.json({
      message: 'Rate limits cleared successfully',
      cleared: loginRateLimits.length,
    })
  } catch (error) {
    console.error('Clear rate limits error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default seed

