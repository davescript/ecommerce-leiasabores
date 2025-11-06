import { Hono } from 'hono'
import type { WorkerBindings } from '../types/bindings'

const router = new Hono<{ Bindings: WorkerBindings }>()

router.get('/:filename{.*}', async (c) => {
  const key = c.req.param('filename')
  if (!key) return c.json({ error: 'Filename is required' }, 400)

  // remove barras iniciais
  const normalizedKey = key.replace(/^\/+/, '')

  // tenta buscar direto no bucket
  let object = await c.env.R2.get(normalizedKey)

  // se não achar, tenta dentro da pasta "topos-de-bolo/"
  if (!object) {
    object = await c.env.R2.get(`topos-de-bolo/${normalizedKey}`)
  }

  // se ainda não achar, retorna erro
  if (!object) return c.json({ error: 'Not Found' }, 404)

  // tenta detectar o tipo de conteúdo
  const contentType =
    object.httpMetadata?.contentType || guessMimeType(normalizedKey)

  const headers = new Headers()
  if (contentType) headers.set('Content-Type', contentType)
  headers.set('Cache-Control', 'public, max-age=3600')

  // inclui metadados HTTP se existirem
  if ('writeHttpMetadata' in object && typeof object.writeHttpMetadata === 'function') {
    object.writeHttpMetadata(headers)
  }

  return new Response(object.body, { headers })
})

function guessMimeType(key: string): string | undefined {
  const ext = key.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    case 'svg':
      return 'image/svg+xml'
    case 'avif':
      return 'image/avif'
    default:
      return 'application/octet-stream'
  }
}

export default router