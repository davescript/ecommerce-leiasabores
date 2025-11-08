import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import type { WorkerBindings } from '../../types/bindings'
import { AdminJWTPayload } from '../../middleware/adminAuth'
import { adminAuthMiddleware, createAuditLog, getRequestInfo, requirePermission } from '../../middleware/adminAuth'
import { getDb } from '../../lib/db'
import { storeSettings } from '../../models/schema'

const settingsRouter = new Hono<{ Bindings: WorkerBindings; Variables: { adminUser?: AdminJWTPayload } }>()

settingsRouter.use('*', adminAuthMiddleware)

/**
 * GET /api/v1/admin/settings
 * Get store settings
 */
settingsRouter.get('/', requirePermission('settings:read'), async (c) => {
  try {
    const db = getDb(c.env)

    let settings = await db.query.storeSettings.findFirst({
      where: eq(storeSettings.id, 'main'),
    })

    // Create default settings if they don't exist
    if (!settings) {
      const now = new Date().toISOString()
      await db.insert(storeSettings).values({
        id: 'main',
        storeName: 'Leia Sabores',
        storeEmail: 'info@leiasabores.pt',
        currency: 'EUR',
        taxRate: 0.23,
        createdAt: now,
        updatedAt: now,
      })

      settings = await db.query.storeSettings.findFirst({
        where: eq(storeSettings.id, 'main'),
      })
    }

    // Don't expose sensitive data
    const safeSettings = {
      ...settings,
      stripeSecretKey: settings?.stripeSecretKey ? '***' : null,
      stripeWebhookSecret: settings?.stripeWebhookSecret ? '***' : null,
      smtpPassword: settings?.smtpPassword ? '***' : null,
    }

    return c.json(safeSettings)
  } catch (error) {
    console.error('Get settings error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * PUT /api/v1/admin/settings
 * Update store settings
 */
settingsRouter.put('/', requirePermission('settings:write'), async (c) => {
  try {
    const body = await c.req.json()
    const adminUser = c.get('adminUser')!
    const db = getDb(c.env)

    let settings = await db.query.storeSettings.findFirst({
      where: eq(storeSettings.id, 'main'),
    })

    if (!settings) {
      // Create if doesn't exist
      const now = new Date().toISOString()
      await db.insert(storeSettings).values({
        id: 'main',
        ...body,
        createdAt: now,
        updatedAt: now,
      })
    } else {
      // Update existing
      await db.update(storeSettings)
        .set({
          ...body,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(storeSettings.id, 'main'))
    }

    // Audit log
    await createAuditLog(c.env, {
      adminUserId: adminUser.adminUserId,
      action: 'update',
      resource: 'settings',
      resourceId: 'main',
      details: Object.keys(body).reduce((acc, key) => {
        acc[key] = true
        return acc
      }, {} as Record<string, unknown>),
      ...getRequestInfo(c as any),
    })

    const updatedSettings = await db.query.storeSettings.findFirst({
      where: eq(storeSettings.id, 'main'),
    })

    // Don't expose sensitive data
    const safeSettings = {
      ...updatedSettings,
      stripeSecretKey: updatedSettings?.stripeSecretKey ? '***' : null,
      stripeWebhookSecret: updatedSettings?.stripeWebhookSecret ? '***' : null,
      smtpPassword: updatedSettings?.smtpPassword ? '***' : null,
    }

    return c.json(safeSettings)
  } catch (error) {
    console.error('Update settings error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default settingsRouter

