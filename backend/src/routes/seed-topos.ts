
import { Hono } from 'hono'
import type { WorkerBindings } from '../types/bindings'   // ../ (não ../../)
import { getDb, dbSchema, type DrizzleSchema } from '../lib/db'               // ../ (não ../../)
import { eq } from 'drizzle-orm'

// mesmo token do wrangler.toml
const ADMIN_TOKEN = 'seed-topos-20251105'

const router = new Hono<{ Bindings: WorkerBindings }>()

router.get('/seed-topos', async (c) => {
  const token = c.req.query('token')
  if (token !== ADMIN_TOKEN) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = getDb(c.env as WorkerBindings)
  const { products } = dbSchema as DrizzleSchema

  // nomes reais que estão no teu bucket leiasabores-r2/topos-de-bolo/
  const bucketImages = [
    { name: 'Topo Heineken', file: 'topo-heineken.jpeg' },
    { name: 'Topo Lilo Stitch', file: 'topo-lilo-stitch.jpeg' },
    { name: 'Topo Patrulha Pata', file: 'topo-patrulha-pata.jpeg' },
    { name: 'Topo Minnie', file: 'tpo-minie.jpeg' },
    { name: 'Topo Homem Aranha', file: 'topopo-homem-aranha.jpeg' },
  ]

  const now = new Date().toISOString()

  for (const item of bucketImages) {
    const existing = await db.query.products.findFirst({
      where: eq(products.name, item.name),
    })

    if (existing) {
      await db
        .update(products)
        .set({
          images: [item.file],           // salva só o nome do ficheiro
          category: 'topos-de-bolo',
          updatedAt: now,
        })
        .where(eq(products.id, existing.id))
    } else {
      await db.insert(products).values({
        id: crypto.randomUUID(),
        name: item.name,
        description: `Topo personalizado ${item.name}`,
        shortDescription: 'Topo para bolo em acrílico',
        price: 9.9,
        category: 'topos-de-bolo',
        images: [item.file],
        inStock: true,
        tags: ['topo', 'bolo'],
        createdAt: now,
        updatedAt: now,
      })
    }
  }

  return c.json({ success: true, count: bucketImages.length })
})

export default router