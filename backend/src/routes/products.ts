import { Hono } from 'hono'
import { and, asc, count, desc, eq, like, or } from 'drizzle-orm'
import { getDb, dbSchema, type DrizzleSchema } from '../lib/db'
import type { WorkerBindings } from '../types/bindings'
import { adminMiddleware, authMiddleware, JWTPayload } from '../middleware/auth'
import { buildProductResponse, resolveImageBaseUrl } from '../utils/product-images'

const router = new Hono<{ Bindings: WorkerBindings; Variables: { user?: JWTPayload } }>()

// =====================
// LISTAGEM DE PRODUTOS
// =====================
router.get('/', async (c) => {
  const db = getDb(c.env as WorkerBindings)
  const { products } = dbSchema as DrizzleSchema

  const category = c.req.query('category') ?? undefined
  const search = c.req.query('search') ?? undefined
  const sort = c.req.query('sort') ?? 'relevancia'
  const page = Math.max(parseInt(c.req.query('page') ?? '1', 10) || 1, 1)
  const limit = Math.min(Math.max(parseInt(c.req.query('limit') ?? '12', 10) || 12, 1), 48)
  const offset = (page - 1) * limit

  try {
    // Garantir CORS
    c.header('Access-Control-Allow-Origin', '*')
    c.header('Access-Control-Allow-Headers', '*')
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')

    const categoryFilter = category ? eq(products.category, category) : undefined
    const searchFilter = (() => {
      if (!search) return undefined
      const pattern = `%${search}%`
      return or(like(products.name, pattern), like(products.description, pattern))
    })()

    const whereClause =
      categoryFilter && searchFilter
        ? and(categoryFilter, searchFilter)
        : categoryFilter ?? searchFilter

    const totalResult = whereClause
      ? await db.select({ value: count() }).from(products).where(whereClause)
      : await db.select({ value: count() }).from(products)
    const total = totalResult[0]?.value ?? 0

    const productQueryBase = whereClause
      ? db.select().from(products).where(whereClause)
      : db.select().from(products)

    const orderings = (() => {
      switch (sort) {
        case 'preco-asc':
          return [asc(products.price)]
        case 'preco-desc':
          return [desc(products.price)]
        case 'avaliacoes':
          return [desc(products.rating)]
        case 'novos':
          return [desc(products.createdAt)]
        default:
          return [desc(products.updatedAt), desc(products.createdAt)]
      }
    })()

    const rows = await productQueryBase.orderBy(...orderings).limit(limit).offset(offset)
    const env = c.env as WorkerBindings
    const baseUrl = resolveImageBaseUrl(c.req.url, env)

    // Cache curto para melhorar performance do catálogo
    c.header('Cache-Control', 'public, max-age=60')
    return c.json({
      data: rows.map((row) => buildProductResponse(row, baseUrl, env)),
      page,
      limit,
      total,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    })
  } catch (error) {
    console.error('Failed to list products', error)
    c.header('Access-Control-Allow-Origin', '*')
    c.header('Access-Control-Allow-Headers', '*')
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    return c.json({ error: 'Failed to fetch products' }, 500)
  }
})

// =====================
// PRODUTO INDIVIDUAL
// =====================
router.get('/:id', async (c) => {
  const db = getDb(c.env as WorkerBindings)
  const { products } = dbSchema as DrizzleSchema
  const id = c.req.param('id')

  try {
    c.header('Access-Control-Allow-Origin', '*')
    c.header('Access-Control-Allow-Headers', '*')
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')

    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    })

    if (!product) {
      return c.json({ error: 'Product not found' }, 404)
    }

    const env = c.env as WorkerBindings
    const baseUrl = resolveImageBaseUrl(c.req.url, env)
    return c.json(buildProductResponse(product, baseUrl, env))
  } catch (error) {
    console.error('Failed to retrieve product', error)
    c.header('Access-Control-Allow-Origin', '*')
    c.header('Access-Control-Allow-Headers', '*')
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    return c.json({ error: 'Failed to fetch product' }, 500)
  }
})

// =====================
// CRUD ADMIN
// =====================
router.post('/', authMiddleware, adminMiddleware, async (c) => {
  const db = getDb(c.env as WorkerBindings)
  const { products } = dbSchema as DrizzleSchema

  try {
    const body = await c.req.json<{
      name: string
      description?: string
      shortDescription?: string
      price: number
      originalPrice?: number
      category: string
      images?: string[]
      inStock?: boolean
      tags?: string[]
    }>()

    if (!body.name || !body.category || !body.price) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    const now = new Date().toISOString()
    const [created] = await db
      .insert(products)
      .values({
        id: crypto.randomUUID(),
        name: body.name,
        description: body.description,
        shortDescription: body.shortDescription,
        price: body.price,
        originalPrice: body.originalPrice,
        category: body.category,
        images: body.images ?? [],
        inStock: body.inStock ?? true,
        tags: body.tags ?? [],
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    const env = c.env as WorkerBindings
    const baseUrl = resolveImageBaseUrl(c.req.url, env)
    return c.json(buildProductResponse(created, baseUrl, env), 201)
  } catch (error) {
    console.error('Failed to create product', error)
    return c.json({ error: 'Failed to create product' }, 500)
  }
})

router.put('/:id', authMiddleware, adminMiddleware, async (c) => {
  const db = getDb(c.env)
  const { products } = dbSchema
  const id = c.req.param('id')

  try {
    const body = await c.req.json<Partial<{
      name: string
      description: string
      shortDescription: string
      price: number
      originalPrice: number
      category: string
      images: string[]
      inStock: boolean
      tags: string[]
    }>>()

    const existing = await db.query.products.findFirst({
      where: eq(products.id, id),
    })

    if (!existing) {
      return c.json({ error: 'Product not found' }, 404)
    }

    const [updated] = await db
      .update(products)
      .set({
        ...body,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(products.id, id))
      .returning()

    const env = c.env as WorkerBindings
    const baseUrl = resolveImageBaseUrl(c.req.url, env)
    return c.json(buildProductResponse(updated, baseUrl, env))
  } catch (error) {
    console.error('Failed to update product', error)
    return c.json({ error: 'Failed to update product' }, 500)
  }
})

router.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  const db = getDb(c.env)
  const { products } = dbSchema
  const id = c.req.param('id')

  try {
    const product = await db.query.products.findFirst({ where: eq(products.id, id) })
    if (!product) {
      return c.json({ error: 'Product not found' }, 404)
    }

    await db.delete(products).where(eq(products.id, id))
    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to delete product', error)
    return c.json({ error: 'Failed to delete product' }, 500)
  }
})

export default router
