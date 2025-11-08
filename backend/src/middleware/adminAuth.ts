import { Context, Next } from 'hono'
import { verify } from 'hono/jwt'
import { eq, and } from 'drizzle-orm'
import type { WorkerBindings } from '../types/bindings'
import { getDb } from '../lib/db'
import { adminUsers, auditLogs } from '../models/schema'

export interface AdminJWTPayload {
  adminUserId: string
  email: string
  role: string
  permissions: string[]
  iat: number
  exp: number
}

type AdminAuthContext = Context<{
  Bindings: WorkerBindings
  Variables: { adminUser?: AdminJWTPayload }
}>

/**
 * Middleware to authenticate admin users via JWT or Session
 * Tries session first (httpOnly cookie), then falls back to JWT token
 */
export async function adminAuthMiddleware(c: AdminAuthContext, next: Next) {
  // Try to verify session first (httpOnly cookie)
  try {
    const { verifySession } = await import('./session')
    const session = await verifySession(c as any)
    
    if (session) {
      // Session is valid, use it
      const payload: AdminJWTPayload = {
        adminUserId: session.adminUserId,
        email: session.email,
        role: session.role,
        permissions: session.permissions,
        iat: session.iat,
        exp: session.exp,
      }
      c.set('adminUser', payload)
      return next()
    }
  } catch (error) {
    // Session verification failed, try JWT token
  }

  // Fallback to JWT token from Authorization header
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid authorization header' }, 401)
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const payload = await verify(token, c.env.JWT_SECRET) as AdminJWTPayload

    // Verify admin user still exists and is active
    const db = getDb(c.env)
    const adminUser = await db.query.adminUsers.findFirst({
      where: and(
        eq(adminUsers.id, payload.adminUserId),
        eq(adminUsers.active, true)
      ),
    })

    if (!adminUser) {
      return c.json({ error: 'Admin user not found or inactive' }, 401)
    }

    c.set('adminUser', payload)
    return next()
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
}

/**
 * Middleware to check admin role
 */
export function requireRole(...allowedRoles: string[]) {
  return async (c: AdminAuthContext, next: Next) => {
    const adminUser = c.get('adminUser')

    if (!adminUser) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    if (!allowedRoles.includes(adminUser.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403)
    }

    return next()
  }
}

/**
 * Middleware to check specific permissions
 */
export function requirePermission(...requiredPermissions: string[]) {
  return async (c: AdminAuthContext, next: Next) => {
    const adminUser = c.get('adminUser')

    if (!adminUser) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Admins have all permissions
    if (adminUser.role === 'admin') {
      return next()
    }

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(perm =>
      adminUser.permissions.includes(perm)
    )

    if (!hasAllPermissions) {
      return c.json({ error: 'Insufficient permissions' }, 403)
    }

    return next()
  }
}

/**
 * Create audit log entry
 */
export async function createAuditLog(
  env: WorkerBindings,
  data: {
    adminUserId?: string
    action: string
    resource: string
    resourceId?: string
    details?: Record<string, unknown>
    ipAddress?: string
    userAgent?: string
  }
) {
  const db = getDb(env)
  const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  await db.insert(auditLogs).values({
    id,
    adminUserId: data.adminUserId,
    action: data.action,
    resource: data.resource,
    resourceId: data.resourceId,
    details: data.details || null,
    ipAddress: data.ipAddress || null,
    userAgent: data.userAgent || null,
    createdAt: new Date().toISOString(),
  })
}

/**
 * Helper to get client IP and User-Agent from request
 */
export function getRequestInfo(c: AdminAuthContext) {
  return {
    ipAddress: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown',
    userAgent: c.req.header('User-Agent') || 'unknown',
  }
}

