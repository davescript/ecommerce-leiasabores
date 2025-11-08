import { Context, Next } from 'hono'
import { verify } from 'hono/jwt'
import type { WorkerBindings } from '../types/bindings'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat: number
  exp: number
}

type AuthContext = Context<{ Bindings: WorkerBindings; Variables: { user?: JWTPayload } }>

export async function authMiddleware(c: AuthContext, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader) {
    return c.json({ error: 'Missing authorization header' }, 401)
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const payload = await verify(token, c.env.JWT_SECRET) as unknown as JWTPayload

    c.set('user', payload)

    return next()
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

export async function adminMiddleware(c: AuthContext, next: Next) {
  const user = c.get('user')

  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Unauthorized' }, 403)
  }

  return next()
}
