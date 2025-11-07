import { Hono } from 'hono'
import { getDb, dbSchema } from '../../lib/db'
import { eq } from 'drizzle-orm'
import type { WorkerBindings } from '../../types/bindings'
import { authMiddleware, adminMiddleware, JWTPayload } from '../../middleware/auth'

// Schema temporário para cupons (criar tabela depois)
const coupons = new Hono<{ Bindings: WorkerBindings; Variables: { user?: JWTPayload } }>()

coupons.get('/', authMiddleware, adminMiddleware, async (c) => {
  // TODO: Implementar quando a tabela de cupons for criada
  return c.json({
    data: [],
  })
})

coupons.post('/', authMiddleware, adminMiddleware, async (c) => {
  // TODO: Implementar criação de cupons
  return c.json({ error: 'Not implemented yet' }, 501)
})

coupons.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  // TODO: Implementar quando a tabela de cupons for criada
  return c.json({ success: true })
})

export default coupons

