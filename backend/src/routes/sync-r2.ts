import { Hono } from 'hono'
import type { WorkerBindings } from '../types/bindings'
import { getDb, dbSchema } from '../lib/db'
import { eq } from 'drizzle-orm'

const LEGACY_ADMIN_TOKEN = 'seed-topos-20251105'
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'svg', 'avif'])
const syncR2 = new Hono<{ Bindings: WorkerBindings }>()

syncR2.get('/sync-r2', async (c) => {
  const token = c.req.query('token')
  const expectedToken = c.env.ADMIN_SEED_TOKEN ?? LEGACY_ADMIN_TOKEN
  if (!expectedToken || token !== expectedToken) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = getDb(c.env as WorkerBindings)
  const { products } = dbSchema

  const requestedPrefix = c.req.query('prefix') ?? c.env.R2_DEFAULT_PREFIX ?? 'topos-de-bolo'
  const normalizedPrefix = (requestedPrefix ?? '')
    .toString()
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
  const prefixForList = normalizedPrefix ? `${normalizedPrefix}/` : ''

  const list = await c.env.R2.list(prefixForList ? { prefix: prefixForList } : undefined)
  const categorySlug = c.req.query('category') ?? (normalizedPrefix || 'topos-de-bolo')

  const now = new Date().toISOString()
  let count = 0

  for (const obj of list.objects) {
    if (!obj || !obj.key || obj.key.endsWith('/')) {
      continue
    }

    const extension = obj.key.split('.').pop()?.toLowerCase()
    if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
      continue
    }

    const fileKey = obj.key
    const nameFromKey = fileKey.split('/').pop() ?? fileKey
    const name = nameFromKey
      .replace(/\.(jpeg|jpg|png|svg|webp)$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())

    const existing = await db.query.products.findFirst({
      where: eq(products.name, name),
    })

    if (existing) {
      const nextImages = Array.from(
        new Set([fileKey, ...((existing.images as string[] | null) ?? [])])
      )
      await db
        .update(products)
        .set({
          images: nextImages,
          updatedAt: now,
        })
        .where(eq(products.id, existing.id))
    } else {
      await db.insert(products).values({
        id: crypto.randomUUID(),
        name,
        description: `Topo personalizado ${name}`,
        shortDescription: 'Topo para bolo em acrílico',
        price: 9.9,
        category: categorySlug,
        images: [fileKey],
        inStock: true,
        tags: ['topo', 'bolo'],
        createdAt: now,
        updatedAt: now,
      })
    }
    count++
  }

  return c.json({ success: true, count })
})

export default syncR2
