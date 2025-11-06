/**
 * Middleware de segurança para proteção da API
 */

import type { Context, Next } from 'hono'
import { isValidOrigin, SECURITY_LIMITS } from '../utils/validation'

/**
 * Valida tamanho do payload da requisição
 */
export async function validateRequestSize(c: Context, next: Next) {
  const contentLength = c.req.header('content-length')
  
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    if (!Number.isNaN(size) && size > SECURITY_LIMITS.MAX_PAYLOAD_SIZE) {
      return c.json(
        { 
          error: 'Request payload too large',
          maxSize: `${SECURITY_LIMITS.MAX_PAYLOAD_SIZE / 1024}KB`
        },
        413
      )
    }
  }
  
  await next()
}

/**
 * Valida origin da requisição (proteção básica contra CSRF)
 */
export function validateOrigin(allowedOrigins?: string[]) {
  return async (c: Context, next: Next) => {
    const origin = c.req.header('origin')
    
    // Permitir requisições sem origin (ex: curl, Postman em dev)
    if (!origin) {
      await next()
      return
    }
    
    if (!isValidOrigin(origin, allowedOrigins)) {
      console.warn('⚠️ Invalid origin detected:', origin)
      return c.json({ error: 'Invalid origin' }, 403)
    }
    
    await next()
  }
}

/**
 * Rate limiting simples baseado em IP (básico - em produção usar Cloudflare Rate Limiting)
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('cf-connecting-ip') || 
               c.req.header('x-forwarded-for')?.split(',')[0] || 
               'unknown'
    
    const now = Date.now()
    const record = requestCounts.get(ip)
    
    // Limpar registros antigos periodicamente
    if (requestCounts.size > 10000) {
      for (const [key, value] of requestCounts.entries()) {
        if (value.resetAt < now) {
          requestCounts.delete(key)
        }
      }
    }
    
    if (!record || record.resetAt < now) {
      requestCounts.set(ip, { count: 1, resetAt: now + windowMs })
      await next()
      return
    }
    
    if (record.count >= maxRequests) {
      console.warn(`⚠️ Rate limit exceeded for IP: ${ip}`)
      return c.json(
        { 
          error: 'Too many requests',
          retryAfter: Math.ceil((record.resetAt - now) / 1000)
        },
        429
      )
    }
    
    record.count++
    await next()
  }
}

/**
 * Sanitiza headers de requisição
 */
export async function sanitizeHeaders(c: Context, next: Next) {
  // Remover headers potencialmente perigosos
  const dangerousHeaders = ['x-forwarded-host', 'x-real-ip']
  
  for (const header of dangerousHeaders) {
    if (c.req.header(header)) {
      console.warn(`⚠️ Dangerous header detected and ignored: ${header}`)
    }
  }
  
  await next()
}

