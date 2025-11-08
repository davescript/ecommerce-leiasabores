import { Hono } from 'hono'
import { eq, and, or, like, desc, asc, sql, gte, lte } from 'drizzle-orm'
import type { WorkerBindings } from '../../types/bindings'
import { AdminJWTPayload } from '../../middleware/adminAuth'
import { adminAuthMiddleware, createAuditLog, getRequestInfo, requirePermission } from '../../middleware/adminAuth'
import { getDb } from '../../lib/db'
import { orders, orderItems, auditLogs, orderStatusHistory } from '../../models/schema'
import { bustOrderCache } from '../../utils/cache'
import { generateId } from '../../utils/id'

const ordersRouter = new Hono<{ Bindings: WorkerBindings; Variables: { adminUser?: AdminJWTPayload } }>()

ordersRouter.use('*', adminAuthMiddleware)

/**
 * GET /api/v1/admin/orders
 * List orders with pagination and filters
 */
ordersRouter.get('/', requirePermission('orders:read'), async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limitParam = c.req.query('limit') || '20'
    const limit = parseInt(limitParam)
    const status = c.req.query('status') || ''
    const search = c.req.query('search') || ''
    const sortBy = c.req.query('sortBy') || 'createdAt'
    const sortOrder = c.req.query('sortOrder') || 'desc'
    const startDate = c.req.query('startDate')
    const endDate = c.req.query('endDate')

    const db = getDb(c.env)
    const offset = (page - 1) * limit

    const conditions = []
    if (status) {
      conditions.push(eq(orders.status, status))
    }
    if (search) {
      // Search in email, order ID, and stripeSessionId (if not null)
      conditions.push(
        or(
          like(orders.email, `%${search}%`),
          like(orders.id, `%${search}%`),
          // Only search stripeSessionId if it exists (not null)
          sql`${orders.stripeSessionId} IS NOT NULL AND ${orders.stripeSessionId} LIKE ${'%' + search + '%'}`
        )
      )
    }
    if (startDate) {
      conditions.push(gte(sql`datetime(${orders.createdAt})`, startDate))
    }
    if (endDate) {
      conditions.push(lte(sql`datetime(${orders.createdAt})`, endDate))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    const sortMap: Record<string, any> = {
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      status: orders.status,
      total: orders.total,
      email: orders.email,
    }
    const sortColumn = sortMap[sortBy] || orders.createdAt
    const orderBy = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn)

    const ordersList = await db.query.orders.findMany({
      where: whereClause,
      orderBy: [orderBy],
      limit,
      offset,
    })

    const totalResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(whereClause)
      .get()

    const total = totalResult?.count || 0

    return c.json({
      orders: ordersList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List orders error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * GET /api/v1/admin/orders/:id
 * Get order details with items
 */
ordersRouter.get('/:id', requirePermission('orders:read'), async (c) => {
  try {
    const id = c.req.param('id')
    const db = getDb(c.env)

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    })

    if (!order) {
      return c.json({ error: 'Order not found' }, 404)
    }

    const items = await db.query.orderItems.findMany({
      where: eq(orderItems.orderId, id),
    })

    return c.json({
      ...order,
      items,
    })
  } catch (error) {
    console.error('Get order error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * PUT /api/v1/admin/orders/:id/status
 * Update order status
 */
ordersRouter.put('/:id/status', requirePermission('orders:write'), async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { status, notes } = body
    const adminUser = c.get('adminUser')!
    const db = getDb(c.env)

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
    if (!validStatuses.includes(status)) {
      return c.json({ error: 'Invalid status' }, 400)
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    })

    if (!order) {
      return c.json({ error: 'Order not found' }, 404)
    }

    const oldStatus = order.status

    await db.update(orders)
      .set({
        status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(orders.id, id))

    // Create status history entry
    const statusHistoryId = generateId('order_status')
    await db.insert(orderStatusHistory).values({
      id: statusHistoryId,
      orderId: id,
      status,
      adminUserId: adminUser.adminUserId,
      notes: notes || null,
      createdAt: new Date().toISOString(),
    })

    // Bust cache
    await bustOrderCache(c.env, id)

    // Audit log
    await createAuditLog(c.env, {
      adminUserId: adminUser.adminUserId,
      action: 'update',
      resource: 'order',
      resourceId: id,
      details: { oldStatus, newStatus: status },
      ...getRequestInfo(c as any),
    })

    const updatedOrder = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    })

    return c.json(updatedOrder)
  } catch (error) {
    console.error('Update order status error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * GET /api/v1/admin/orders/:id/timeline
 * Get order timeline (status changes)
 */
ordersRouter.get('/:id/timeline', requirePermission('orders:read'), async (c) => {
  try {
    const id = c.req.param('id')
    const db = getDb(c.env)

    // Get order to include creation in timeline
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    })

    if (!order) {
      return c.json({ error: 'Order not found' }, 404)
    }

    // Get status history
    const statusHistory = await db.query.orderStatusHistory.findMany({
      where: eq(orderStatusHistory.orderId, id),
      orderBy: [asc(orderStatusHistory.createdAt)],
    })

    // Get audit logs for additional context
    const auditLogsList = await db.query.auditLogs.findMany({
      where: and(
        eq(auditLogs.resource, 'order'),
        eq(auditLogs.resourceId, id)
      ),
      orderBy: [desc(auditLogs.createdAt)],
      limit: 50,
    })

    // Build timeline
    const timeline = [
      {
        id: 'created',
        status: order.status || 'pending',
        notes: 'Pedido criado',
        adminUserId: null,
        createdAt: order.createdAt || new Date().toISOString(),
        type: 'created' as const,
      },
      ...statusHistory.map(history => ({
        id: history.id,
        status: history.status,
        notes: history.notes || null,
        adminUserId: history.adminUserId,
        createdAt: history.createdAt || new Date().toISOString(),
        type: 'status_change' as const,
      })),
    ].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return timeA - timeB
    })

    return c.json({ timeline, auditLogs: auditLogsList })
  } catch (error) {
    console.error('Get order timeline error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default ordersRouter

