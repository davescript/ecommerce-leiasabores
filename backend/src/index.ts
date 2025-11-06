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
import categoriesRoutes from './routes/categories'
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
app.route('/api/categories', categoriesRoutes)

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

// Seed para Categorias com base no Partyland
app.post('/api/admin/seed-categories', async (c) => {
  const token = c.req.query('token')
  const expected = c.env.ADMIN_SEED_TOKEN
  if (!expected || token !== expected) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = getDb(c.env as WorkerBindings)
  const { categories } = dbSchema as DrizzleSchema

  try {
    const categoriesData = [
      // Categorias principais
      { id: 'cat-bolos', name: 'Bolos Personalizados', slug: 'bolos-personalizados', description: 'Bolos personalizados por tema', displayOrder: 0 },
      { id: 'cat-topos', name: 'Topos de Bolo', slug: 'topos-de-bolo', description: 'Topos premium para bolos', displayOrder: 1 },
      { id: 'cat-decoracoes', name: 'Decorações para Bolos', slug: 'decoracoes-para-bolos', description: 'Decorações, flores, velas e acessórios', displayOrder: 2 },
      { id: 'cat-ocasioes', name: 'Ocasiões Especiais', slug: 'ocasioes-especiais', description: 'Bolos e decorações por ocasião', displayOrder: 3 },
      
      // Subcategorias de Bolos Personalizados (por tema)
      { id: 'cat-bolo-aniversario-menina', name: 'Aniversário Menina', slug: 'bolo-aniversario-menina', parentId: 'cat-bolos', displayOrder: 0 },
      { id: 'cat-bolo-aniversario-menino', name: 'Aniversário Menino', slug: 'bolo-aniversario-menino', parentId: 'cat-bolos', displayOrder: 1 },
      { id: 'cat-bolo-princesas', name: 'Princesas', slug: 'bolo-princesas', parentId: 'cat-bolos', displayOrder: 2 },
      { id: 'cat-bolo-super-herois', name: 'Super-Heróis', slug: 'bolo-super-herois', parentId: 'cat-bolos', displayOrder: 3 },
      { id: 'cat-bolo-frozen', name: 'Frozen', slug: 'bolo-frozen', parentId: 'cat-bolos', displayOrder: 4 },
      { id: 'cat-bolo-mickey', name: 'Mickey & Minnie', slug: 'bolo-mickey', parentId: 'cat-bolos', displayOrder: 5 },
      { id: 'cat-bolo-unicornio', name: 'Unicórnio', slug: 'bolo-unicornio', parentId: 'cat-bolos', displayOrder: 6 },
      { id: 'cat-bolo-dinossauros', name: 'Dinossauros', slug: 'bolo-dinossauros', parentId: 'cat-bolos', displayOrder: 7 },
      { id: 'cat-bolo-selva', name: 'Selva e Animais', slug: 'bolo-selva', parentId: 'cat-bolos', displayOrder: 8 },
      { id: 'cat-bolo-futebol', name: 'Futebol e Desporto', slug: 'bolo-futebol', parentId: 'cat-bolos', displayOrder: 9 },
      { id: 'cat-bolo-arco-iris', name: 'Arco Íris', slug: 'bolo-arco-iris', parentId: 'cat-bolos', displayOrder: 10 },
      { id: 'cat-bolo-sereia', name: 'Sereia', slug: 'bolo-sereia', parentId: 'cat-bolos', displayOrder: 11 },
      { id: 'cat-bolo-pirata', name: 'Piratas', slug: 'bolo-pirata', parentId: 'cat-bolos', displayOrder: 12 },
      { id: 'cat-bolo-construcao', name: 'Construção', slug: 'bolo-construcao', parentId: 'cat-bolos', displayOrder: 13 },
      { id: 'cat-bolo-carros', name: 'Carros', slug: 'bolo-carros', parentId: 'cat-bolos', displayOrder: 14 },
      { id: 'cat-bolo-lego', name: 'Lego', slug: 'bolo-lego', parentId: 'cat-bolos', displayOrder: 15 },
      { id: 'cat-bolo-minecraft', name: 'Minecraft', slug: 'bolo-minecraft', parentId: 'cat-bolos', displayOrder: 16 },
      { id: 'cat-bolo-pokemon', name: 'Pokémon', slug: 'bolo-pokemon', parentId: 'cat-bolos', displayOrder: 17 },
      { id: 'cat-bolo-harry-potter', name: 'Harry Potter', slug: 'bolo-harry-potter', parentId: 'cat-bolos', displayOrder: 18 },
      { id: 'cat-bolo-star-wars', name: 'Star Wars', slug: 'bolo-star-wars', parentId: 'cat-bolos', displayOrder: 19 },
      
      // Subcategorias de Topos
      { id: 'cat-topo-classico', name: 'Topos Clássicos', slug: 'topo-classico', parentId: 'cat-topos', displayOrder: 0 },
      { id: 'cat-topo-personalizado', name: 'Topos Personalizados', slug: 'topo-personalizado', parentId: 'cat-topos', displayOrder: 1 },
      { id: 'cat-topo-premium', name: 'Topos Premium', slug: 'topo-premium', parentId: 'cat-topos', displayOrder: 2 },
      
      // Subcategorias de Decorações
      { id: 'cat-decoracao-flores', name: 'Flores de Bolo', slug: 'decoracao-flores', parentId: 'cat-decoracoes', displayOrder: 0 },
      { id: 'cat-decoracao-velas', name: 'Velas', slug: 'decoracao-velas', parentId: 'cat-decoracoes', displayOrder: 1 },
      { id: 'cat-decoracao-confetes', name: 'Confetes e Adornos', slug: 'decoracao-confetes', parentId: 'cat-decoracoes', displayOrder: 2 },
      { id: 'cat-decoracao-bases', name: 'Bases e Caixas', slug: 'decoracao-bases', parentId: 'cat-decoracoes', displayOrder: 3 },
      { id: 'cat-decoracao-corantes', name: 'Corantes e Coberturas', slug: 'decoracao-corantes', parentId: 'cat-decoracoes', displayOrder: 4 },
      
      // Subcategorias de Ocasiões
      { id: 'cat-ocasiao-natal', name: 'Natal', slug: 'ocasiao-natal', parentId: 'cat-ocasioes', displayOrder: 0 },
      { id: 'cat-ocasiao-halloween', name: 'Halloween', slug: 'ocasiao-halloween', parentId: 'cat-ocasioes', displayOrder: 1 },
      { id: 'cat-ocasiao-pascoa', name: 'Páscoa', slug: 'ocasiao-pascoa', parentId: 'cat-ocasioes', displayOrder: 2 },
      { id: 'cat-ocasiao-casamento', name: 'Casamento', slug: 'ocasiao-casamento', parentId: 'cat-ocasioes', displayOrder: 3 },
      { id: 'cat-ocasiao-batizado', name: 'Batizado e Comunhão', slug: 'ocasiao-batizado', parentId: 'cat-ocasioes', displayOrder: 4 },
      { id: 'cat-ocasiao-despedida', name: 'Despedida de Solteira', slug: 'ocasiao-despedida', parentId: 'cat-ocasioes', displayOrder: 5 },
    ]

    let inserted = 0
    for (const cat of categoriesData) {
      const exists = await db.query.categories.findFirst({ where: eq(categories.slug, cat.slug) }).catch(() => null)
      if (!exists) {
        await db.insert(categories).values({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          parentId: cat.parentId || null,
          displayOrder: cat.displayOrder,
        })
        inserted++
      }
    }

    return c.json({ ok: true, inserted })
  } catch (error) {
    console.error('Seed categories error', error)
    return c.json({ error: 'Failed to seed categories' }, 500)
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

// Health endpoint sob o prefixo /api para funcionar com rotas de produção
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Health simples em /health (mantido para compatibilidade)
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

export default app
