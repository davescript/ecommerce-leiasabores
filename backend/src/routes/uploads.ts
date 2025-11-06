import { Hono } from 'hono'
import type { WorkerBindings } from '../types/bindings'
import { authMiddleware, adminMiddleware, JWTPayload } from '../middleware/auth'

const router = new Hono<{ Bindings: WorkerBindings; Variables: { user?: JWTPayload } }>()

// Upload autenticado via JWT (admin) para R2
router.post('/', authMiddleware, adminMiddleware, async (c) => {
  const env = c.env as WorkerBindings
  const formData = await c.req.formData().catch(() => null)
  if (!formData) return c.json({ error: 'Invalid form data' }, 400)

  const file = formData.get('file') as File | null
  const keyPrefix = (formData.get('keyPrefix') as string | null) || 'uploads'
  if (!file) return c.json({ error: 'Missing file' }, 400)

  const ext = file.name.split('.').pop() || 'bin'
  const key = `${keyPrefix}/${crypto.randomUUID()}.${ext}`

  await env.R2.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || 'application/octet-stream' },
  })

  return c.json({ ok: true, key })
})

// Download público via Worker (controlado)
router.get('/:key{.*}', async (c) => {
  const env = c.env as WorkerBindings
  const key = c.req.param('key')
  // Tenta no bucket principal; se não encontrar, tenta no legado
  let obj = await env.R2.get(key)
  if (!obj && env.R2Legacy) {
    obj = await env.R2Legacy.get(key)
  }
  if (!obj) return c.json({ error: 'Not Found' }, 404)
  const headers = new Headers()
  if (obj.httpMetadata?.contentType) headers.set('Content-Type', obj.httpMetadata.contentType)
  headers.set('Cache-Control', 'public, max-age=86400')
  return new Response(obj.body, { headers })
})

export default router