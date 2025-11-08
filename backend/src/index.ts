import { Hono } from 'hono'
import { logger } from 'hono/logger'

import productRoutes from './routes/products'
import reviewRoutes from './routes/reviews'
import cartRoutes from './routes/cart'
import checkoutRoutes from './routes/checkout'
import paymentIntentRoutes from './routes/payment-intent'
import uploadsRoutes from './routes/uploads'
import r2Routes from './routes/r2'
import r2AutoSyncRoutes from './routes/r2-auto-sync'
import seedPartylandRoutes from './routes/seed-partyland'
import categoriesRoutes from './routes/categories'
import couponsRoutes from './routes/coupons'
import adminRoutes from './routes/admin'
import { errorHandler } from './middleware/errorHandler'
import { getDb, dbSchema, type DrizzleSchema } from './lib/db'
import { eq } from 'drizzle-orm'
import type { WorkerBindings } from './types/bindings'

const app = new Hono<{ Bindings: WorkerBindings; Variables: { user?: { userId: string; email: string; role: string } } }>()

app.use(logger())

// CORS configurado com segurança
// Em produção, restringir origins permitidas
app.use('*', async (c, next) => {
  const env = c.env as unknown as WorkerBindings
  const allowedOrigins = env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || []
  
  // Em desenvolvimento, permitir qualquer origin
  // Em produção, usar lista de origins permitidas
  const origin = env.ENVIRONMENT === 'production' && allowedOrigins.length > 0
    ? (c.req.header('origin') && allowedOrigins.includes(c.req.header('origin')!) 
       ? c.req.header('origin') 
       : allowedOrigins[0])
    : '*'
  
  await next()
  
  // Adicionar headers CORS
  c.header('Access-Control-Allow-Origin', origin || '*')
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  c.header('Access-Control-Max-Age', '86400')
  
  // Headers de segurança
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('X-XSS-Protection', '1; mode=block')
  
  // Em produção, adicionar CSP básico
  if (env.ENVIRONMENT === 'production') {
    c.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://*.stripe.com;")
  }
})

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

// Debug endpoint para verificar configurações
app.get('/debug/config', (c) => {
  const env = c.env as WorkerBindings
  
  // Verificar variáveis de ambiente críticas (sem expor valores sensíveis)
  return c.json({
    environment: env.ENVIRONMENT,
    bindings: {
      hasDB: !!env.DB,
      hasR2: !!env.R2,
      hasStripeKey: !!env.STRIPE_SECRET_KEY,
      hasStripeWebhookSecret: !!env.STRIPE_WEBHOOK_SECRET,
      hasJWTSecret: !!env.JWT_SECRET,
      stripeKeyPreview: env.STRIPE_SECRET_KEY ? `${env.STRIPE_SECRET_KEY.substring(0, 10)}...` : 'MISSING',
    },
    timestamp: new Date().toISOString(),
  })
})

// Seed endpoints BEFORE admin router (so they don't get caught by app.route('/api/admin'))

// Seed Admin User (proteção por token via ADMIN_SEED_TOKEN)
app.post('/api/admin/seed-admin', async (c) => {
  const token = c.req.query('token')
  const expected = c.env.ADMIN_SEED_TOKEN
  if (!expected || token !== expected) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const { seedAdmin } = await import('./seeds/admin-seed')
    await seedAdmin(c.env as WorkerBindings)
    return c.json({ ok: true, message: 'Admin user seeded successfully' })
  } catch (error) {
    console.error('Seed admin error:', error)
    return c.json({ error: 'Failed to seed admin', message: error instanceof Error ? error.message : 'Unknown error' }, 500)
  }
})

// Seed de Categorias (proteção por token via ADMIN_SEED_TOKEN)
app.post('/api/admin/seed-categories', async (c) => {
  const token = c.req.query('token')
  const expected = c.env.ADMIN_SEED_TOKEN
  if (!expected || token !== expected) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = getDb(c.env as WorkerBindings)
  const { categories } = dbSchema as DrizzleSchema

  try {
    const categoryStructure = [
      {
        id: 'cat-novidades',
        name: 'Novidades',
        slug: 'novidades',
        description: 'Produtos recém-adicionados',
        parentId: null,
        displayOrder: 1,
      },
      {
        id: 'cat-bolos',
        name: 'Bolos & Bolos Personalizados',
        slug: 'bolos',
        description: 'Bolos únicos e personalizados para suas celebrações',
        parentId: null,
        displayOrder: 2,
      },
      {
        id: 'cat-bolos-premium',
        name: 'Bolos Premium',
        slug: 'bolos-premium',
        description: 'Bolos gourmet e premium',
        parentId: 'cat-bolos',
        displayOrder: 1,
      },
      {
        id: 'cat-bolos-pequenos',
        name: 'Bolos Pequenos',
        slug: 'bolos-pequenos',
        description: 'Bolos individuais e pequenos',
        parentId: 'cat-bolos',
        displayOrder: 2,
      },
      {
        id: 'cat-bolos-casamentos',
        name: 'Bolos para Casamentos',
        slug: 'bolos-casamentos',
        description: 'Bolos elegantes para cerimónias',
        parentId: 'cat-bolos',
        displayOrder: 3,
      },
      {
        id: 'cat-bolos-tematicos',
        name: 'Bolos Temáticos',
        slug: 'bolos-tematicos',
        description: 'Bolos decorados com temas especiais',
        parentId: 'cat-bolos',
        displayOrder: 4,
      },
      {
        id: 'cat-topos',
        name: 'Topos de Bolo',
        slug: 'topos-de-bolo',
        description: 'Topos personalizados e temáticos para seus bolos',
        parentId: null,
        displayOrder: 3,
      },
      {
        id: 'cat-topos-classicos',
        name: 'Topos Clássicos',
        slug: 'topos-classicos',
        description: 'Topos clássicos em acrílico',
        parentId: 'cat-topos',
        displayOrder: 1,
      },
      {
        id: 'cat-topos-personalizados',
        name: 'Topos Personalizados',
        slug: 'topos-personalizados',
        description: 'Topos com nome, idade ou mensagem',
        parentId: 'cat-topos',
        displayOrder: 2,
      },
      {
        id: 'cat-topos-tematicos',
        name: 'Topos Temáticos',
        slug: 'topos-tematicos',
        description: 'Topos com temas especiais',
        parentId: 'cat-topos',
        displayOrder: 3,
      },
      {
        id: 'cat-temas-festas',
        name: 'Temas para Festas',
        slug: 'temas-festas',
        description: 'Inspiração e produtos por tema de festa',
        parentId: null,
        displayOrder: 4,
      },
      {
        id: 'cat-tema-aniversario',
        name: 'Festa de Aniversário',
        slug: 'festa-aniversario',
        description: 'Tudo para uma festa de aniversário',
        parentId: 'cat-temas-festas',
        displayOrder: 1,
      },
      {
        id: 'cat-tema-frozen',
        name: 'Festa Frozen',
        slug: 'festa-frozen',
        description: 'Tema Frozen e Elsa',
        parentId: 'cat-temas-festas',
        displayOrder: 2,
      },
      {
        id: 'cat-tema-barbie',
        name: 'Festa Barbie',
        slug: 'festa-barbie',
        description: 'Tema Barbie',
        parentId: 'cat-temas-festas',
        displayOrder: 3,
      },
      {
        id: 'cat-tema-princesas',
        name: 'Festa Princesas',
        slug: 'festa-princesas',
        description: 'Tema Princesas Disney',
        parentId: 'cat-temas-festas',
        displayOrder: 4,
      },
      {
        id: 'cat-tema-unicornio',
        name: 'Festa Unicórnio',
        slug: 'festa-unicornio',
        description: 'Tema Unicórnio mágico',
        parentId: 'cat-temas-festas',
        displayOrder: 5,
      },
      {
        id: 'cat-decoracoes',
        name: 'Decorações & Acessórios',
        slug: 'decoracoes-acessorios',
        description: 'Complementos para suas celebrações',
        parentId: null,
        displayOrder: 5,
      },
      {
        id: 'cat-velas',
        name: 'Velas para Bolos',
        slug: 'velas-bolos',
        description: 'Velas coloridas e temáticas',
        parentId: 'cat-decoracoes',
        displayOrder: 1,
      },
      {
        id: 'cat-confeitos',
        name: 'Confeitos & Sprinkles',
        slug: 'confeitos-sprinkles',
        description: 'Adornos e confeitos para bolos',
        parentId: 'cat-decoracoes',
        displayOrder: 2,
      },
      {
        id: 'cat-caixas',
        name: 'Caixas de Bolo Personalizadas',
        slug: 'caixas-bolo',
        description: 'Caixas decoradas e personalizadas',
        parentId: 'cat-decoracoes',
        displayOrder: 3,
      },
    ]

    let inserted = 0
    const updated = 0
    
    for (const cat of categoryStructure) {
      try {
        const existing = await db.query.categories.findFirst({ 
          where: eq(categories.slug, cat.slug) 
        }).catch(() => null)

        if (!existing) {
          await db.insert(categories).values(cat)
          inserted++
        }
      } catch (err) {
        console.warn(`Failed to insert category ${cat.slug}:`, err)
      }
    }

    return c.json({ ok: true, inserted, updated, total: categoryStructure.length })
  } catch (error) {
    console.error('Seed categories error', error)
    return c.json({ error: 'Failed to seed categories' }, 500)
  }
})

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

// Seed Partyland categories and products
app.post('/api/admin/seed-partyland', async (c) => {
  const token = c.req.query('token')
  const expected = c.env.ADMIN_SEED_TOKEN
  if (!expected || token !== expected) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const { seedPartyland } = await import('./seeds/partyland-categories')
    const result = await seedPartyland(c.env as WorkerBindings)
    return c.json(result)
  } catch (error) {
    console.error('Seed Partyland error', error)
    return c.json({ error: error instanceof Error ? error.message : 'Failed to seed Partyland' }, 500)
  }
})

app.route('/api/products', productRoutes)
app.route('/api/reviews', reviewRoutes)
app.route('/api/cart', cartRoutes)
app.route('/api/checkout', checkoutRoutes)
app.route('/api/payment-intent', paymentIntentRoutes)
app.route('/api/uploads', uploadsRoutes)
app.route('/api/r2', r2Routes)
app.route('/api/r2-auto-sync', r2AutoSyncRoutes)
app.route('/api/admin', seedPartylandRoutes)
app.route('/api/categories', categoriesRoutes)
app.route('/api/coupons', couponsRoutes)

// CSRF token endpoint (public, but protected by origin)
app.get('/api/csrf-token', async (c) => {
  const { getCSRFToken } = await import('./middleware/csrf')
  return getCSRFToken(c)
})

// Admin Panel API (v1)
app.route('/api/v1/admin', adminRoutes)

// Health endpoint sob o prefixo /api para funcionar com rotas de produção
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Debug endpoint sob o prefixo /api
app.get('/api/debug/config', (c) => {
  const env = c.env as WorkerBindings
  
  // Verificar variáveis de ambiente críticas (sem expor valores sensíveis)
  return c.json({
    environment: env.ENVIRONMENT,
    bindings: {
      hasDB: !!env.DB,
      hasR2: !!env.R2,
      hasStripeKey: !!env.STRIPE_SECRET_KEY,
      hasStripeWebhookSecret: !!env.STRIPE_WEBHOOK_SECRET,
      hasJWTSecret: !!env.JWT_SECRET,
      stripeKeyPreview: env.STRIPE_SECRET_KEY ? `${env.STRIPE_SECRET_KEY.substring(0, 10)}...` : 'MISSING',
    },
    timestamp: new Date().toISOString(),
  })
})

// Health simples em /health (mantido para compatibilidade)
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Rota raiz com informações da API
app.get('/', (c) => {
  return c.json({
    name: 'Leia Sabores API',
    version: '1.0.0',
    status: 'ok',
    endpoints: {
      health: '/health',
      apiHealth: '/api/health',
      debug: '/api/debug/config',
      products: '/api/products',
      checkout: '/api/checkout',
      paymentIntent: '/api/payment-intent',
    },
    timestamp: new Date().toISOString(),
  })
})

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

export default app
