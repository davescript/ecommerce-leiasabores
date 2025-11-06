import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import productRoutes from './routes/products'
import reviewRoutes from './routes/reviews'
import cartRoutes from './routes/cart'
import checkoutRoutes from './routes/checkout'
import uploadsRoutes from './routes/uploads'
import adminRoutes from './routes/admin'
import r2Routes from './routes/r2'
import { errorHandler } from './middleware/errorHandler'
import { getDb, dbSchema, type DrizzleSchema } from './lib/db'
import { eq } from 'drizzle-orm'
import type { WorkerBindings } from './types/bindings'

const app = new Hono<{ Bindings: WorkerBindings; Variables: { user?: { userId: string; email: string; role: string } } }>()

app.use(logger())
// CORS dinâmico baseado em variável de ambiente ALLOWED_ORIGINS (CSV)
// CORS permissivo para evitar bloqueios no navegador
// Em produção podemos restringir novamente para os domínios específicos
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['*', 'Content-Type', 'Authorization'],
  credentials: false,
  maxAge: 86400,
}))

// Garantir cabeçalhos CORS mesmo quando o plugin não os adiciona
app.use('*', async (c, next) => {
  // Preflight
  if (c.req.method === 'OPTIONS') {
    c.header('Access-Control-Allow-Origin', '*')
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    c.header('Access-Control-Allow-Headers', '*')
    return new Response(null, { status: 204 })
  }

  await next()
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  c.header('Access-Control-Allow-Headers', '*')
})

app.onError(errorHandler)

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.route('/api/products', productRoutes)
app.route('/api/reviews', reviewRoutes)
app.route('/api/cart', cartRoutes)
app.route('/api/checkout', checkoutRoutes)
app.route('/api/uploads', uploadsRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/r2', r2Routes)

// Seed direto para Topos de Bolo (proteção por token via ADMIN_SEED_TOKEN)
app.post('/api/admin/seed-topos', async (c) => {
  const token = c.req.query('token')
  const expected = c.env.ADMIN_SEED_TOKEN
  if (!expected || token !== expected) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = getDb(c.env as WorkerBindings)
  const { products, categories } = dbSchema as DrizzleSchema
  const now = new Date().toISOString()

  try {
    const existingCat = await db.query.categories.findFirst({ where: eq(categories.slug, 'topos-de-bolo') }).catch(() => null)
    if (!existingCat) {
      await db.insert(categories).values({
        id: 'cat-topos-de-bolo',
        name: 'Topos de Bolo',
        slug: 'topos-de-bolo',
        image: 'https://api.leiasabores.pt/api/uploads/topos-de-bolo/categoria.svg',
        description: 'Topos personalizados para bolos',
      })
    }

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
          'https://api.leiasabores.pt/api/uploads/topos-de-bolo/topo-personalizado-estrela.svg',
        ],
        inStock: true,
        tags: ['topo','dourado','classico'],
      },
      {
        id: 'prod-topo-002',
        name: 'Topo Clássico Azul',
        description: 'Topo acrílico azul elegante, ideal para eventos e celebrações',
        shortDescription: 'Topo azul elegante',
        price: 12.99,
        originalPrice: 16.99,
        category: 'topos-de-bolo',
        images: [
          'https://api.leiasabores.pt/api/uploads/topos-de-bolo/topo-classico-2.svg',
          'https://api.leiasabores.pt/api/uploads/topos-de-bolo/topo-classico-1.svg',
          'https://api.leiasabores.pt/api/uploads/topos-de-bolo/topo-personalizado-estrela.svg',
        ],
        inStock: true,
        tags: ['topo','azul','classico'],
      },
      {
        id: 'prod-topo-003',
        name: 'Topo Personalizado Estrela',
        description: 'Topo acrílico em formato de estrela para personalização com nome/idade',
        shortDescription: 'Topo estrela personalizado',
        price: 17.99,
        originalPrice: 22.99,
        category: 'topos-de-bolo',
        images: [
          'https://api.leiasabores.pt/api/uploads/topos-de-bolo/topo-personalizado-estrela.svg',
          'https://api.leiasabores.pt/api/uploads/topos-de-bolo/topo-classico-1.svg',
          'https://api.leiasabores.pt/api/uploads/topos-de-bolo/topo-classico-2.svg',
        ],
        inStock: true,
        tags: ['topo','personalizado','estrela'],
      },
    ]

    let inserted = 0
    for (const p of items) {
      const exists = await db.query.products.findFirst({ where: eq(products.id, p.id) }).catch(() => null)
      if (!exists) {
        await db.insert(products).values({
          id: p.id,
          name: p.name,
          description: p.description,
          shortDescription: p.shortDescription,
          price: p.price,
          originalPrice: p.originalPrice,
          category: p.category,
          images: p.images,
          inStock: p.inStock,
          tags: p.tags,
          createdAt: now,
          updatedAt: now,
        })
        inserted++
      }
    }

    return c.json({ ok: true, inserted })
  } catch (error) {
    console.error('Seed Topos error', error)
    return c.json({ error: 'Failed to seed' }, 500)
  }
})

// Health endpoint sob o prefixo /api para funcionar com rotas de produção
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Health simples em /health (mantido para compatibilidade)
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

export default app
