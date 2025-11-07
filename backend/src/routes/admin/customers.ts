import { Hono } from 'hono'
import { getDb, dbSchema } from '../../lib/db'
import { sql } from 'drizzle-orm'
import type { WorkerBindings } from '../../types/bindings'
import { authMiddleware, adminMiddleware, JWTPayload } from '../../middleware/auth'

const customers = new Hono<{ Bindings: WorkerBindings; Variables: { user?: JWTPayload } }>()

customers.get('/', authMiddleware, adminMiddleware, async (c) => {
  const db = getDb(c.env as WorkerBindings)
  const { orders } = dbSchema

  try {
    // Agrupar pedidos por email para criar lista de clientes
    const customerData = await db
      .select({
        email: orders.email,
        customerName: sql<string>`COALESCE(${orders.customerName}, 'Cliente')`,
        totalSpent: sql<number>`SUM(${orders.total})`,
        orderCount: sql<number>`COUNT(*)`,
        lastOrderDate: sql<string>`MAX(${orders.createdAt})`,
      })
      .from(orders)
      .where(sql`${orders.status} = 'paid'`)
      .groupBy(orders.email)
      .all()

    return c.json({
      data: customerData.map((c) => ({
        id: c.email, // Usar email como ID temporário
        email: c.email,
        name: c.customerName,
        totalSpent: c.totalSpent || 0,
        orderCount: c.orderCount || 0,
        lastOrderDate: c.lastOrderDate || null,
      })),
    })
  } catch (error) {
    console.error('Failed to fetch customers', error)
    return c.json({ error: 'Failed to fetch customers' }, 500)
  }
})

customers.get('/:id', authMiddleware, adminMiddleware, async (c) => {
  const db = getDb(c.env as WorkerBindings)
  const { orders } = dbSchema
  const id = c.req.param('id') // Email do cliente

  try {
    const customerOrders = await db
      .select()
      .from(orders)
      .where(sql`${orders.email} = ${id}`)
      .all()

    if (customerOrders.length === 0) {
      return c.json({ error: 'Customer not found' }, 404)
    }

    const totalSpent = customerOrders
      .filter((o) => o.status === 'paid')
      .reduce((sum, o) => sum + o.total, 0)

    return c.json({
      id,
      email: id,
      name: (customerOrders[0] as { customerName?: string }).customerName || 'Cliente',
      totalSpent,
      orderCount: customerOrders.length,
      orders: customerOrders,
    })
  } catch (error) {
    console.error('Failed to fetch customer', error)
    return c.json({ error: 'Failed to fetch customer' }, 500)
  }
})

export default customers

