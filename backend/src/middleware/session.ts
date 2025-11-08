import { Context, Next } from 'hono'
import { sign, verify } from 'hono/jwt'
import { eq, and } from 'drizzle-orm'
import type { WorkerBindings } from '../types/bindings'
import { getDb } from '../lib/db'
import { adminUsers, adminSessions } from '../models/schema'
import { generateId } from '../utils/id'

export interface SessionPayload {
  sessionId: string
  adminUserId: string
  email: string
  role: string
  permissions: string[]
  iat: number
  exp: number
}

type SessionContext = Context<{
  Bindings: WorkerBindings
  Variables: { session?: SessionPayload; adminUser?: SessionPayload }
}>

const SESSION_DURATION = 60 * 60 * 8 // 8 hours
const INACTIVITY_TIMEOUT = 60 * 60 * 2 // 2 hours of inactivity

/**
 * Create a new session with httpOnly cookie
 */
export async function createSession(
  env: WorkerBindings,
  adminUserId: string,
  ipAddress: string,
  userAgent: string
): Promise<{ token: string; expiresAt: Date }> {
  const db = getDb(env)
  
  // Get admin user with permissions
  const adminUser = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.id, adminUserId),
  })

  if (!adminUser || !adminUser.active) {
    throw new Error('Admin user not found or inactive')
  }

  const sessionId = generateId('sess')
  const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000)
  const lastActivityAt = new Date()

  // Create session in database
  await db.insert(adminSessions).values({
    id: sessionId,
    adminUserId,
    token: sessionId, // We'll use sessionId as token
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
    expiresAt: expiresAt.toISOString(),
    lastActivityAt: lastActivityAt.toISOString(),
    createdAt: new Date().toISOString(),
  })

  // Create JWT token
  const payload: SessionPayload = {
    sessionId,
    adminUserId,
    email: adminUser.email,
    role: adminUser.role,
    permissions: adminUser.permissions || [],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(expiresAt.getTime() / 1000),
  }

  const token = await sign(payload, env.JWT_SECRET)

  return { token, expiresAt }
}

/**
 * Verify session from httpOnly cookie or Authorization header
 */
export async function verifySession(c: SessionContext): Promise<SessionPayload | null> {
  // Try to get token from cookie first (preferred)
  const cookieToken = c.req.cookie('admin_session')
  // Fallback to Authorization header
  const authHeader = c.req.header('Authorization')
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null

  const token = cookieToken || headerToken

  if (!token) {
    return null
  }

  try {
    const payload = await verify(token, c.env.JWT_SECRET) as SessionPayload

    // Verify session exists and is still valid
    const db = getDb(c.env)
    const session = await db.query.adminSessions.findFirst({
      where: eq(adminSessions.id, payload.sessionId),
    })

    if (!session) {
      return null
    }

    // Check if session has expired
    const expiresAt = new Date(session.expiresAt)
    if (expiresAt < new Date()) {
      // Session expired
      await db.delete(adminSessions).where(eq(adminSessions.id, payload.sessionId))
      return null
    }

    // Check inactivity timeout
    const lastActivity = new Date(session.lastActivityAt)
    const now = new Date()
    const inactivityDuration = (now.getTime() - lastActivity.getTime()) / 1000

    if (inactivityDuration > INACTIVITY_TIMEOUT) {
      // Session expired due to inactivity
      await db.delete(adminSessions).where(eq(adminSessions.id, payload.sessionId))
      return null
    }

    // Update last activity
    await db.update(adminSessions)
      .set({ lastActivityAt: now.toISOString() })
      .where(eq(adminSessions.id, payload.sessionId))

    // Verify admin user is still active
    const adminUser = await db.query.adminUsers.findFirst({
      where: and(
        eq(adminUsers.id, payload.adminUserId),
        eq(adminUsers.active, true)
      ),
    })

    if (!adminUser) {
      await db.delete(adminSessions).where(eq(adminSessions.id, payload.sessionId))
      return null
    }

    return payload
  } catch (error) {
    return null
  }
}

/**
 * Middleware to authenticate admin users via session
 */
export async function sessionAuthMiddleware(c: SessionContext, next: Next) {
  const session = await verifySession(c)

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('adminUser', session)
  c.set('session', session)
  return next()
}

/**
 * Destroy session (logout)
 */
export async function destroySession(env: WorkerBindings, sessionId: string) {
  const db = getDb(env)
  await db.delete(adminSessions).where(eq(adminSessions.id, sessionId))
}

/**
 * Set httpOnly cookie with session token
 */
export function setSessionCookie(c: SessionContext, token: string, expiresAt: Date) {
  c.header('Set-Cookie', `admin_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${Math.floor((expiresAt.getTime() - Date.now()) / 1000)}`)
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(c: SessionContext) {
  c.header('Set-Cookie', 'admin_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0')
}

