import { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'

/**
 * Generate random bytes for CSRF token
 * Using Web Crypto API for Cloudflare Workers compatibility
 */
function randomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Fallback for non-crypto environments
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return array
}

/**
 * CSRF token generation and validation
 */
export function generateCSRFToken(): string {
  const bytes = randomBytes(32)
  // Convert Uint8Array to base64url string
  const base64 = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
  return base64
}

/**
 * CSRF protection middleware
 */
export function csrfProtection() {
  return async (c: Context, next: Next) => {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(c.req.method)) {
      return next()
    }

    // Get CSRF token from header
    const token = c.req.header('X-CSRF-Token')
    const cookieToken = getCookie(c, 'csrf_token')

    if (!token || !cookieToken || token !== cookieToken) {
      return c.json({ error: 'Invalid CSRF token' }, 403)
    }

    return next()
  }
}

/**
 * Set CSRF token cookie
 */
export function setCSRFToken(c: Context) {
  const token = generateCSRFToken()
  c.header('Set-Cookie', `csrf_token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`)
  return token
}

/**
 * Get CSRF token endpoint
 */
export function getCSRFToken(c: Context) {
  const token = setCSRFToken(c)
  return c.json({ token })
}

