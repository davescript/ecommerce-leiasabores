import { Hono } from 'hono'
import { count, desc, eq } from 'drizzle-orm'
import { getDb, dbSchema, type DrizzleSchema } from '../lib/db'
import { serializeReview } from '../utils/serializers'
import type { WorkerBindings } from '../types/bindings'
import { adminMiddleware, authMiddleware, JWTPayload } from '../middleware/auth'

const router = new Hono<{ Bindings: WorkerBindings; Variables: { user?: JWTPayload } }>()

router.get('/product/:productId', async (c) => {
  const db = getDb(c.env as WorkerBindings)
  const { reviews } = dbSchema as DrizzleSchema
  const productId = c.req.param('productId')
  const page = Math.max(parseInt(c.req.query('page') ?? '1', 10) || 1, 1)
  const limit = Math.min(Math.max(parseInt(c.req.query('limit') ?? '10', 10) || 10, 1), 50)
  const offset = (page - 1) * limit

  try {
    const whereClause = eq(reviews.productId, productId)

    const totalQuery = db.select({ value: count() }).from(reviews).where(whereClause)
    const totalResult = await totalQuery
    const total = totalResult[0]?.value ?? 0

    const rows = await db
      .select()
      .from(reviews)
      .where(whereClause)
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset)

    return c.json({
      data: rows.map(serializeReview),
      page,
      limit,
      total,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    })
  } catch (error) {
    console.error('Failed to fetch reviews', error)
    return c.json({ error: 'Failed to fetch reviews' }, 500)
  }
})

router.post('/', async (c) => {
  const db = getDb(c.env as WorkerBindings)
  const { reviews, products } = dbSchema as DrizzleSchema

  try {
    const body = await c.req.json<{
      productId: string
      author: string
      rating: number
      title: string
      content: string
      verified?: boolean
      images?: string[]
    }>()

    if (!body.productId || !body.author || !body.rating || !body.title || !body.content) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    const product = await db.query.products.findFirst({
      where: eq(products.id, body.productId),
    })

    if (!product) {
      return c.json({ error: 'Product not found' }, 404)
    }

    const now = new Date().toISOString()
    const [createdReview] = await db
      .insert(reviews)
      .values({
        id: crypto.randomUUID(),
        productId: body.productId,
        author: body.author,
        rating: body.rating,
        title: body.title,
        content: body.content,
        verified: body.verified ?? false,
        images: body.images ?? [],
        createdAt: now,
        helpful: 0,
      })
      .returning()

    await db
      .update(products)
      .set({
        reviewCount: (product.reviewCount ?? 0) + 1,
        rating: calculateAverageRating(product.rating ?? 0, product.reviewCount ?? 0, body.rating),
      })
      .where(eq(products.id, body.productId))

    return c.json(serializeReview(createdReview), 201)
  } catch (error) {
    console.error('Failed to create review', error)
    return c.json({ error: 'Failed to create review' }, 500)
  }
})

router.put('/:id/helpful', async (c) => {
  const db = getDb(c.env as WorkerBindings)
  const { reviews } = dbSchema as DrizzleSchema
  const id = c.req.param('id')

  try {
    const existing = await db.query.reviews.findFirst({
      where: eq(reviews.id, id),
    })

    if (!existing) {
      return c.json({ error: 'Review not found' }, 404)
    }

    const [updated] = await db
      .update(reviews)
      .set({ helpful: (existing.helpful ?? 0) + 1 })
      .where(eq(reviews.id, id))
      .returning()

    return c.json(serializeReview(updated))
  } catch (error) {
    console.error('Failed to mark review as helpful', error)
    return c.json({ error: 'Failed to update review' }, 500)
  }
})

router.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  const db = getDb(c.env as WorkerBindings)
  const { reviews, products } = dbSchema as DrizzleSchema
  const id = c.req.param('id')

  try {
    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, id),
    })

    if (!review) {
      return c.json({ error: 'Review not found' }, 404)
    }

    await db.delete(reviews).where(eq(reviews.id, id))

    const product = await db.query.products.findFirst({
      where: eq(products.id, review.productId),
    })

    if (product && (product.reviewCount ?? 0) > 0) {
      const remainingCount = (product.reviewCount ?? 0) - 1
      const newRating =
        remainingCount > 0
          ? (Number(product.rating ?? 0) * (product.reviewCount ?? 0) - (review.rating ?? 0)) / remainingCount
          : 0

      await db
        .update(products)
        .set({
          reviewCount: remainingCount,
          rating: newRating,
        })
        .where(eq(products.id, review.productId))
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to delete review', error)
    return c.json({ error: 'Failed to delete review' }, 500)
  }
})

function calculateAverageRating(currentRating: number, currentCount: number, newRating: number) {
  const total = currentRating * currentCount + newRating
  return Number((total / (currentCount + 1)).toFixed(2))
}

export default router
