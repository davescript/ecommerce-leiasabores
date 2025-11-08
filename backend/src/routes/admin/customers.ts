import { Hono } from 'hono'
import { eq, and, or, like, desc, asc, sql } from 'drizzle-orm'
import type { WorkerBindings } from '../../types/bindings'
import { AdminJWTPayload } from '../../middleware/adminAuth'
import { adminAuthMiddleware, createAuditLog, getRequestInfo, requirePermission } from '../../middleware/adminAuth'
import { getDb } from '../../lib/db'
import { users, orders, customerNotes } from '../../models/schema'

const customersRouter = new Hono<{ Bindings: WorkerBindings; Variables: { adminUser?: AdminJWTPayload } }>()

customersRouter.use('*', adminAuthMiddleware)

/**
 * GET /api/v1/admin/customers
 * List customers with pagination and search
 */
customersRouter.get('/', requirePermission('customers:read'), async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const search = c.req.query('search') || ''
    const sortBy = c.req.query('sortBy') || 'createdAt'
    const sortOrder = c.req.query('sortOrder') || 'desc'

    const db = getDb(c.env)
    const offset = (page - 1) * limit

    const conditions = []
    if (search) {
      conditions.push(
        or(
          like(users.email, `%${search}%`),
          like(users.name, `%${search}%`)
        )
      )
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    const sortMap: Record<string, any> = {
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }
    const sortColumn = sortMap[sortBy] || users.createdAt
    const orderBy = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn)

    const customersList = await db.query.users.findMany({
      where: whereClause,
      orderBy: [orderBy],
      limit,
      offset,
    })

    const totalResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(whereClause)
      .get()

    const total = totalResult?.count || 0

    return c.json({
      customers: customersList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List customers error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * GET /api/v1/admin/customers/:id
 * Get customer details
 */
customersRouter.get('/:id', requirePermission('customers:read'), async (c) => {
  try {
    const id = c.req.param('id')
    const db = getDb(c.env)

    const customer = await db.query.users.findFirst({
      where: eq(users.id, id),
    })

    if (!customer) {
      return c.json({ error: 'Customer not found' }, 404)
    }

    // Get customer orders
    const customerOrders = await db.query.orders.findMany({
      where: eq(orders.userId, id),
      orderBy: [desc(orders.createdAt)],
      limit: 10,
    })

    // Get customer notes
    const notes = await db.query.customerNotes.findMany({
      where: eq(customerNotes.userId, id),
      orderBy: [desc(customerNotes.createdAt)],
    })

    // Calculate total spent
    const totalSpentResult = await db
      .select({ total: sql<number>`SUM(${orders.total})` })
      .from(orders)
      .where(and(
        eq(orders.userId, id),
        eq(orders.status, 'completed')
      ))
      .get()

    return c.json({
      ...customer,
      orders: customerOrders,
      notes,
      stats: {
        totalOrders: customerOrders.length,
        totalSpent: totalSpentResult?.total || 0,
      },
    })
  } catch (error) {
    console.error('Get customer error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * GET /api/v1/admin/customers/:id/orders
 * Get customer orders
 */
customersRouter.get('/:id/orders', requirePermission('customers:read'), async (c) => {
  try {
    const id = c.req.param('id')
    const db = getDb(c.env)

    const customerOrders = await db.query.orders.findMany({
      where: eq(orders.userId, id),
      orderBy: [desc(orders.createdAt)],
    })

    return c.json({ orders: customerOrders })
  } catch (error) {
    console.error('Get customer orders error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * POST /api/v1/admin/customers/:id/notes
 * Add note to customer
 */
customersRouter.post('/:id/notes', requirePermission('customers:write'), async (c) => {
  try {
    const id = c.req.param('id')
    const { note, internal = true } = await c.req.json()
    const adminUser = c.get('adminUser')!
    const db = getDb(c.env)

    if (!note) {
      return c.json({ error: 'Note is required' }, 400)
    }

    const customer = await db.query.users.findFirst({
      where: eq(users.id, id),
    })

    if (!customer) {
      return c.json({ error: 'Customer not found' }, 404)
    }

    const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    await db.insert(customerNotes).values({
      id: noteId,
      userId: id,
      adminUserId: adminUser.adminUserId,
      note,
      internal,
      createdAt: new Date().toISOString(),
    })

    const createdNote = await db.query.customerNotes.findFirst({
      where: eq(customerNotes.id, noteId),
    })

    // Audit log
    await createAuditLog(c.env, {
      adminUserId: adminUser.adminUserId,
      action: 'create',
      resource: 'customer_note',
      resourceId: noteId,
      details: { customerId: id, note },
      ...getRequestInfo(c as any),
    })

    return c.json(createdNote, 201)
  } catch (error) {
    console.error('Add customer note error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * GET /api/v1/admin/customers/:id/notes
 * Get customer notes
 */
customersRouter.get('/:id/notes', requirePermission('customers:read'), async (c) => {
  try {
    const id = c.req.param('id')
    const db = getDb(c.env)

    const notes = await db.query.customerNotes.findMany({
      where: eq(customerNotes.userId, id),
      orderBy: [desc(customerNotes.createdAt)],
    })

    return c.json({ notes })
  } catch (error) {
    console.error('Get customer notes error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default customersRouter

