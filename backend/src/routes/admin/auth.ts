import { Hono } from 'hono'
import { eq, and } from 'drizzle-orm'
import type { WorkerBindings } from '../../types/bindings'
import { getDb } from '../../lib/db'
import { adminUsers, refreshTokens } from '../../models/schema'
import { hashPassword, verifyPassword } from '../../utils/bcrypt'
import { adminAuthMiddleware, createAuditLog, getRequestInfo, AdminJWTPayload } from '../../middleware/adminAuth'
import { createSession, setSessionCookie, destroySession, clearSessionCookie } from '../../middleware/session'
import { loginRateLimit } from '../../middleware/rateLimit'

const auth = new Hono<{ Bindings: WorkerBindings; Variables: { adminUser?: AdminJWTPayload } }>()

/**
 * POST /api/v1/admin/auth/login
 * Login admin user with httpOnly cookie session
 */
auth.post('/login', loginRateLimit, async (c) => {
  try {
    const { email, password } = await c.req.json()

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    const db = getDb(c.env)

    // Find admin user
    const adminUser = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, email.toLowerCase()),
    })

    if (!adminUser) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // Check if user is active
    if (!adminUser.active) {
      return c.json({ error: 'Account is disabled' }, 403)
    }

    // Verify password
    if (!adminUser.password) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    const isValid = await verifyPassword(password, adminUser.password)

    if (!isValid) {
      // Log failed login attempt
      await createAuditLog(c.env, {
        action: 'login_failed',
        resource: 'admin_user',
        resourceId: adminUser.id,
        ...getRequestInfo(c as any),
      })

      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // Create session with httpOnly cookie
    const ipAddress = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
    const userAgent = c.req.header('User-Agent') || 'unknown'
    
    const { token, expiresAt } = await createSession(
      c.env,
      adminUser.id,
      ipAddress,
      userAgent
    )

    // Set httpOnly cookie
    setSessionCookie(c, token, expiresAt)

    // Also generate refresh token for mobile/API clients
    const refreshTokenValue = crypto.getRandomValues(new Uint8Array(32))
      .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
    
    const refreshTokenId = `rt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await db.insert(refreshTokens).values({
      id: refreshTokenId,
      adminUserId: adminUser.id,
      token: refreshTokenValue,
      expiresAt: refreshExpiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    })

    // Update last login
    await db.update(adminUsers)
      .set({
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(adminUsers.id, adminUser.id))

    // Log successful login
    await createAuditLog(c.env, {
      adminUserId: adminUser.id,
      action: 'login',
      resource: 'admin_user',
      resourceId: adminUser.id,
      ...getRequestInfo(c as any),
    })

    return c.json({
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        permissions: adminUser.permissions || [],
      },
      // Include refresh token for API clients (cookie is set automatically)
      refreshToken: refreshTokenValue,
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * POST /api/v1/admin/auth/refresh
 * Refresh access token
 */
auth.post('/refresh', async (c) => {
  try {
    const { refreshToken } = await c.req.json()

    if (!refreshToken) {
      return c.json({ error: 'Refresh token is required' }, 400)
    }

    const db = getDb(c.env)

    // Find refresh token
    const tokenRecord = await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.token, refreshToken),
    })

    if (!tokenRecord) {
      return c.json({ error: 'Invalid refresh token' }, 401)
    }

    // Check if token is expired
    if (new Date(tokenRecord.expiresAt) < new Date()) {
      // Delete expired token
      await db.delete(refreshTokens).where(eq(refreshTokens.id, tokenRecord.id))
      return c.json({ error: 'Refresh token expired' }, 401)
    }

    // Get admin user
    const adminUser = await db.query.adminUsers.findFirst({
      where: and(
        eq(adminUsers.id, tokenRecord.adminUserId),
        eq(adminUsers.active, true)
      ),
    })

    if (!adminUser) {
      return c.json({ error: 'Admin user not found' }, 401)
    }

    // Generate new access token
    const payload: AdminJWTPayload = {
      adminUserId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      permissions: adminUser.permissions || [],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
    }

    const accessToken = await sign(payload, c.env.JWT_SECRET)

    return c.json({
      accessToken,
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * POST /api/v1/admin/auth/logout
 * Logout admin user and destroy session
 */
auth.post('/logout', adminAuthMiddleware, async (c) => {
  try {
    const { refreshToken } = await c.req.json().catch(() => ({}))
    const adminUser = c.get('adminUser')

    // Destroy session
    if (adminUser) {
      // Try to verify session to get sessionId
      try {
        const { verifySession } = await import('../../middleware/session')
        const session = await verifySession(c as any)
        if (session && session.sessionId) {
          await destroySession(c.env, session.sessionId)
        }
      } catch (error) {
        // Session verification failed, continue with logout
      }

      // Log logout
      await createAuditLog(c.env, {
        adminUserId: adminUser.adminUserId,
        action: 'logout',
        resource: 'admin_user',
        resourceId: adminUser.adminUserId,
        ...getRequestInfo(c as any),
      })
    }

    // Delete refresh token if provided
    if (refreshToken) {
      const db = getDb(c.env)
      await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken))
    }

    // Clear session cookie
    clearSessionCookie(c)

    return c.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * GET /api/v1/admin/auth/me
 * Get current admin user
 */
auth.get('/me', adminAuthMiddleware, async (c) => {
  try {
    const adminUserPayload = c.get('adminUser')
    if (!adminUserPayload) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    const db = getDb(c.env)

    const adminUser = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, adminUserPayload.adminUserId),
    })

    if (!adminUser) {
      return c.json({ error: 'Admin user not found' }, 404)
    }

    return c.json({
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      permissions: adminUser.permissions || [],
      lastLoginAt: adminUser.lastLoginAt,
    })
  } catch (error) {
    console.error('Get me error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * POST /api/v1/admin/auth/change-password
 * Change admin user password
 */
auth.post('/change-password', adminAuthMiddleware, async (c) => {
  try {
    const { currentPassword, newPassword } = await c.req.json()
    const adminUserPayload = c.get('adminUser')

    if (!adminUserPayload) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    if (!currentPassword || !newPassword) {
      return c.json({ error: 'Current password and new password are required' }, 400)
    }

    if (newPassword.length < 8) {
      return c.json({ error: 'New password must be at least 8 characters' }, 400)
    }

    const db = getDb(c.env)

    const adminUser = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, adminUserPayload.adminUserId),
    })

    if (!adminUser || !adminUser.password) {
      return c.json({ error: 'Admin user not found' }, 404)
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, adminUser.password)

    if (!isValid) {
      return c.json({ error: 'Current password is incorrect' }, 401)
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await db.update(adminUsers)
      .set({
        password: hashedPassword,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(adminUsers.id, adminUser.id))

    // Log password change
    await createAuditLog(c.env, {
      adminUserId: adminUser.id,
      action: 'change_password',
      resource: 'admin_user',
      resourceId: adminUser.id,
      ...getRequestInfo(c as any),
    })

    return c.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default auth

