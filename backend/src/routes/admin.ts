import { Hono } from 'hono'
import { sign } from 'hono/jwt'
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
// 🧩 3. GERAR TOKEN JWT ADMIN (TOKEN ADMIN_SEED_TOKEN)
// ------------------------------------------------------
admin.post('/login', async (c) => {
  const token = c.req.query('token')
  const expected = (c.env as WorkerBindings).ADMIN_SEED_TOKEN
  if (!expected || token !== expected) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const env = c.env as WorkerBindings
  
  if (!env.JWT_SECRET) {
    return c.json({ error: 'JWT_SECRET not configured' }, 500)
  }

  try {
    // Gerar token JWT com role admin
    const payload: JWTPayload = {
      userId: 'admin',
      email: 'admin@leiasabores.pt',
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 ano de validade
    }

    const jwtToken = await sign(payload, env.JWT_SECRET)

    return c.json({
      token: jwtToken,
      expiresIn: '1 year',
      role: 'admin',
    })
  } catch (error) {
    console.error('Failed to generate JWT token', error)
    return c.json({ error: 'Failed to generate token' }, 500)
  }
})

// ------------------------------------------------------
// 🧩 4. PRODUTO DE TESTE 1€ (TOKEN ADMIN_SEED_TOKEN)
// ------------------------------------------------------
admin.post('/seed-teste-1eur', async (c) => {
  const token = c.req.query('token')
  const expected = (c.env as WorkerBindings).ADMIN_SEED_TOKEN
  if (!expected || token !== expected) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = getDb(c.env as WorkerBindings)
  const { products } = dbSchema as DrizzleSchema
  const now = new Date().toISOString()

  const productId = 'prod-teste-1eur'
  const existing = await db.query.products.findFirst({
    where: eq(products.id, productId),
  }).catch(() => null)

  if (existing) {
    // Atualizar se já existe
    await db
      .update(products)
      .set({
        name: 'Produto de Teste - 1€',
        description: 'Produto de teste para validação de pagamento. Este é um produto temporário para testar o sistema de pagamento.',
        shortDescription: 'Produto de teste para pagamento',
        price: 1.00,
        category: 'Teste',
        images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80'],
        inStock: true,
        tags: ['teste', 'pagamento'],
        updatedAt: now,
      })
      .where(eq(products.id, productId))
    
    return c.json({ ok: true, action: 'updated', productId })
  }

  // Criar novo
  await db.insert(products).values({
    id: productId,
    name: 'Produto de Teste - 1€',
    description: 'Produto de teste para validação de pagamento. Este é um produto temporário para testar o sistema de pagamento.',
    shortDescription: 'Produto de teste para pagamento',
    price: 1.00,
    category: 'Teste',
    images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80'],
    inStock: true,
    tags: ['teste', 'pagamento'],
    createdAt: now,
    updatedAt: now,
  })

  return c.json({ ok: true, action: 'created', productId })
})

// ------------------------------------------------------
// 🧩 4. SYNC AUTOMÁTICO COM R2
// ------------------------------------------------------
admin.route('/', syncR2Routes)

// ------------------------------------------------------
// 🧩 4. DEFAULT EXPORT
// ------------------------------------------------------
export default admin