import { Hono } from 'hono'
import { and, eq } from 'drizzle-orm'
import { getDb, dbSchema, Database, type DrizzleSchema } from '../lib/db'
import { serializeCartItem } from '../utils/serializers'
import type { BaseBindings } from '../types/bindings'

const router = new Hono<{ Bindings: BaseBindings }>()

function calculateTotals(items: Array<ReturnType<typeof serializeCartItem>>) {
  const subtotal = items.reduce((total, item) => {
    const price = item.product?.price ?? 0
    return total + price * (item.quantity ?? 0)
  }, 0)

  const tax = Number((subtotal * 0.23).toFixed(2))
  const shipping = subtotal >= 39 ? 0 : 5.99
  const total = Number((subtotal + tax + shipping).toFixed(2))

  return { subtotal, tax, shipping, total }
}

async function fetchCart(db: Database, userId: string) {
  const { cartItems, products } = dbSchema
  const rows = await db
    .select({
      item: cartItems,
      product: products,
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId))

  const items = rows.map(({ item, product }) => serializeCartItem(item, product ?? undefined))
  return {
    items,
    ...calculateTotals(items),
  }
}

router.get('/:userId', async (c) => {
  const db = getDb(c.env as BaseBindings)
  const userId = c.req.param('userId')

  try {
    const cart = await fetchCart(db, userId)
    return c.json(cart)
  } catch (error) {
    console.error('Failed to fetch cart', error)
    return c.json({ error: 'Failed to fetch cart' }, 500)
  }
})

router.post('/:userId/add', async (c) => {
  const db = getDb(c.env as BaseBindings)
  const { cartItems, products } = dbSchema as DrizzleSchema
  const userId = c.req.param('userId')

  try {
    const body = await c.req.json<{ productId: string; quantity?: number }>()
    const quantity = body.quantity && body.quantity > 0 ? body.quantity : 1

    const productExists = await db.query.products.findFirst({
      where: eq(products.id, body.productId),
    })

    if (!productExists) {
      return c.json({ error: 'Product not found' }, 404)
    }

    const existing = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.userId, userId), eq(cartItems.productId, body.productId)),
    })

    if (existing) {
      await db
        .update(cartItems)
        .set({ quantity: existing.quantity + quantity })
        .where(eq(cartItems.id, existing.id))
        .returning()

      const cart = await fetchCart(db, userId)
      return c.json(cart)
    }

    await db
      .insert(cartItems)
      .values({
        id: crypto.randomUUID(),
        userId,
        productId: body.productId,
        quantity,
        addedAt: new Date().toISOString(),
      })
      .returning()

    const cart = await fetchCart(db, userId)
    return c.json(cart, 201)
  } catch (error) {
    console.error('Failed to add item to cart', error)
    return c.json({ error: 'Failed to add item to cart' }, 500)
  }
})

router.put('/:userId/update/:productId', async (c) => {
  const db = getDb(c.env as BaseBindings)
  const { cartItems } = dbSchema as DrizzleSchema
  const userId = c.req.param('userId')
  const productId = c.req.param('productId')

  try {
    const body = await c.req.json<{ quantity: number }>()
    const quantity = Math.max(body.quantity ?? 0, 0)

    const existing = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)),
    })

    if (!existing) {
      return c.json({ error: 'Item not found' }, 404)
    }

    if (quantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, existing.id))
      const cart = await fetchCart(db, userId)
      return c.json(cart)
    }

    await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, existing.id))
      .returning()
    const cart = await fetchCart(db, userId)
    return c.json(cart)
  } catch (error) {
    console.error('Failed to update cart item', error)
    return c.json({ error: 'Failed to update cart item' }, 500)
  }
})

router.delete('/:userId/:productId', async (c) => {
  const db = getDb(c.env as BaseBindings)
  const { cartItems } = dbSchema as DrizzleSchema
  const userId = c.req.param('userId')
  const productId = c.req.param('productId')

  try {
    const existing = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)),
    })

    if (!existing) {
      return c.json({ error: 'Item not found' }, 404)
    }

    await db.delete(cartItems).where(eq(cartItems.id, existing.id))
    const cart = await fetchCart(db, userId)
    return c.json(cart)
  } catch (error) {
    console.error('Failed to remove item from cart', error)
    return c.json({ error: 'Failed to remove item from cart' }, 500)
  }
})

router.delete('/:userId/clear', async (c) => {
  const db = getDb(c.env as BaseBindings)
  const { cartItems } = dbSchema as DrizzleSchema
  const userId = c.req.param('userId')

  try {
    await db.delete(cartItems).where(eq(cartItems.userId, userId))
    const cart = await fetchCart(db, userId)
    return c.json(cart)
  } catch (error) {
    console.error('Failed to clear cart', error)
    return c.json({ error: 'Failed to clear cart' }, 500)
  }
})

export default router
