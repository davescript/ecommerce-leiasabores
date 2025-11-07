import { Hono } from 'hono'
import { getDb, dbSchema } from '../../lib/db'
import { desc, eq, and, gte, lte } from 'drizzle-orm'
import type { WorkerBindings } from '../../types/bindings'
import { authMiddleware, adminMiddleware, JWTPayload } from '../../middleware/auth'

const orders = new Hono<{ Bindings: WorkerBindings; Variables: { user?: JWTPayload } }>()

orders.get('/', authMiddleware, adminMiddleware, async (c) => {
  const db = getDb(c.env as WorkerBindings)
  const { orders: ordersTable } = dbSchema

  try {
    const status = c.req.query('status')
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '50')

    let query = db.select().from(ordersTable)

    if (status && status !== 'all') {
      query = query.where(eq(ordersTable.status, status)) as any
    }

    const allOrders = await query.orderBy(desc(ordersTable.createdAt)).all()

    const start = (page - 1) * limit
    const end = start + limit
    const paginatedOrders = allOrders.slice(start, end)

    return c.json({
      data: paginatedOrders.map((order) => ({
        id: order.id,
        email: order.email,
        customerName: (order as any).customerName || null,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        stripeSessionId: order.stripeSessionId,
      })),
      total: allOrders.length,
      page,
      limit,
    })
  } catch (error) {
    console.error('Failed to fetch orders', error)
    return c.json({ error: 'Failed to fetch orders' }, 500)
  }
})

orders.get('/:id', authMiddleware, adminMiddleware, async (c) => {
  const db = getDb(c.env as WorkerBindings)
  const { orders: ordersTable } = dbSchema
  const id = c.req.param('id')

  try {
    const order = await db.query.orders.findFirst({
      where: eq(ordersTable.id, id),
    })

    if (!order) {
      return c.json({ error: 'Order not found' }, 404)
    }

    return c.json(order)
  } catch (error) {
    console.error('Failed to fetch order', error)
    return c.json({ error: 'Failed to fetch order' }, 500)
  }
})

orders.put('/:id/status', authMiddleware, adminMiddleware, async (c) => {
  const db = getDb(c.env as WorkerBindings)
  const { orders: ordersTable } = dbSchema
  const id = c.req.param('id')

  try {
    const body = await c.req.json<{ status: string }>()

    await db
      .update(ordersTable)
      .set({
        status: body.status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(ordersTable.id, id))

    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to update order status', error)
    return c.json({ error: 'Failed to update order status' }, 500)
  }
})

export default orders

