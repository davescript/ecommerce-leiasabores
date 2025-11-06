import { Hono } from 'hono'
import { getDb, dbSchema, type DrizzleSchema } from '../lib/db'
import { eq } from 'drizzle-orm'
import type { WorkerBindings } from '../types/bindings'
import { adminMiddleware, authMiddleware, JWTPayload } from '../middleware/auth'
import syncR2Routes from './sync-r2'

const admin = new Hono<{ Bindings: WorkerBindings; Variables: { user?: JWTPayload } }>()

// ------------------------------------------------------
// 🧩 1. SEED INICIAL PROTEGIDO (JWT ADMIN)
// ------------------------------------------------------
admin.post('/seed', authMiddleware, adminMiddleware, async (c) => {
  const db = getDb(c.env as WorkerBindings)
  const { products } = dbSchema as DrizzleSchema

  const seedProducts = [
    {
      id: 'prod_baloes_gold',
      name: 'Balões Metallic Gold 30cm',
      description: 'Balões metalizados dourados premium para qualquer celebração.',
      shortDescription: 'Dourados 30cm premium',
      price: 14.99,
      originalPrice: 22.99,
      category: 'Balões',
      images: [
        'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=800&q=80',
      ],
      inStock: true,
      tags: ['popular', 'premium'],
    },
  ]

  let inserted = 0
  for (const p of seedProducts) {
    const exists = await db.query.products.findFirst({ where: eq(products.id, p.id) }).catch(() => null)
    if (!exists) {
      await db.insert(products).values({
        ...p,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      inserted++
    }
  }

  return c.json({ ok: true, inserted })
})

// ------------------------------------------------------
// 🧩 2. SEED TOPOS DE BOLO (TOKEN ADMIN_SEED_TOKEN)
// ------------------------------------------------------
admin.post('/seed-topos', async (c) => {
  const token = c.req.query('token')
  const expected = (c.env as WorkerBindings).ADMIN_SEED_TOKEN
  if (!expected || token !== expected) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = getDb(c.env as WorkerBindings)
  const { products, categories } = dbSchema as DrizzleSchema
  const now = new Date().toISOString()

  // 🔹 Garante categoria “topos-de-bolo”
  const existingCat = await db.query.categories.findFirst({
    where: eq(categories.slug, 'topos-de-bolo'),
  }).catch(() => null)

  if (!existingCat) {
    await db.insert(categories).values({
      id: 'cat-topos-de-bolo',
      name: 'Topos de Bolo',
      slug: 'topos-de-bolo',
      image: 'https://api.leiasabores.pt/api/uploads/topos-de-bolo/categoria.svg',
      description: 'Topos personalizados para bolos',
    })
  }

  // 🔹 Produtos iniciais
  const items = [
    {
      id: 'prod-topo-001',
      name: 'Topo Clássico Dourado',
      description: 'Topo acrílico dourado clássico para bolos de aniversário',
      shortDescription: 'Topo dourado premium',
      price: 14.99,
      originalPrice: 19.99,
      category: 'topos-de-bolo',
      images: [
        'https://api.leiasabores.pt/api/uploads/topos-de-bolo/topo-classico-1.svg',
        'https://api.leiasabores.pt/api/uploads/topos-de-bolo/topo-classico-2.svg',
      ],
      inStock: true,
      tags: ['topo', 'dourado', 'classico'],
    },
  ]

  let inserted = 0
  for (const p of items) {
    const exists = await db.query.products.findFirst({ where: eq(products.id, p.id) }).catch(() => null)
    if (!exists) {
      await db.insert(products).values({
        ...p,
        createdAt: now,
        updatedAt: now,
      })
      inserted++
    }
  }

  return c.json({ ok: true, inserted })
})

// ------------------------------------------------------
// 🧩 3. SYNC AUTOMÁTICO COM R2
// ------------------------------------------------------
admin.route('/', syncR2Routes)

// ------------------------------------------------------
// 🧩 4. DEFAULT EXPORT
// ------------------------------------------------------
export default admin