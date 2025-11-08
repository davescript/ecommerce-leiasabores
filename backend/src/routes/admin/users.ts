import { Hono } from 'hono'
import { eq, and, like, desc, asc, sql } from 'drizzle-orm'
import type { WorkerBindings } from '../../types/bindings'
import { AdminJWTPayload } from '../../middleware/adminAuth'
import { adminAuthMiddleware, createAuditLog, getRequestInfo, requirePermission, requireRole } from '../../middleware/adminAuth'
import { getDb } from '../../lib/db'
import { adminUsers } from '../../models/schema'
import { hashPassword } from '../../utils/bcrypt'

const usersRouter = new Hono<{ Bindings: WorkerBindings; Variables: { adminUser?: AdminJWTPayload } }>()

usersRouter.use('*', adminAuthMiddleware)

/**
 * GET /api/v1/admin/users
 * List admin users (only admins can see all users)
 */
usersRouter.get('/', requireRole('admin'), async (c) => {
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
        like(adminUsers.email, `%${search}%`)
      )
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    const sortMap: Record<string, any> = {
      name: adminUsers.name,
      email: adminUsers.email,
      role: adminUsers.role,
      createdAt: adminUsers.createdAt,
      updatedAt: adminUsers.updatedAt,
    }
    const sortColumn = sortMap[sortBy] || adminUsers.createdAt
    const orderBy = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn)

    const usersList = await db.query.adminUsers.findMany({
      where: whereClause,
      orderBy: [orderBy],
      limit,
      offset,
    })

    // Remove passwords from response
    const safeUsers = usersList.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions || [],
      active: user.active,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }))

    const totalResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(adminUsers)
      .where(whereClause)
      .get()

    const total = totalResult?.count || 0

    return c.json({
      users: safeUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List admin users error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * GET /api/v1/admin/users/:id
 * Get admin user by ID
 */
usersRouter.get('/:id', requireRole('admin'), async (c) => {
  try {
    const id = c.req.param('id')
    const db = getDb(c.env)

    const user = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, id),
    })

    if (!user) {
      return c.json({ error: 'Admin user not found' }, 404)
    }

    // Remove password from response
    return c.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions || [],
      active: user.active,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  } catch (error) {
    console.error('Get admin user error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * POST /api/v1/admin/users
 * Create new admin user (only admins can create users)
 */
usersRouter.post('/', requireRole('admin'), async (c) => {
  try {
    const body = await c.req.json()
    const adminUser = c.get('adminUser')!
    const db = getDb(c.env)

    const { email, name, password, role, permissions, active } = body

    if (!email || !name || !password) {
      return c.json({ error: 'Email, name, and password are required' }, 400)
    }

    if (!['admin', 'manager', 'editor'].includes(role)) {
      return c.json({ error: 'Invalid role' }, 400)
    }

    if (password.length < 8) {
      return c.json({ error: 'Password must be at least 8 characters' }, 400)
    }

    // Check if email already exists
    const existing = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, email.toLowerCase()),
    })

    if (existing) {
      return c.json({ error: 'Email already exists' }, 400)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    const userId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const now = new Date().toISOString()

    await db.insert(adminUsers).values({
      id: userId,
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      role: role || 'editor',
      permissions: permissions || [],
      active: active !== false,
      createdAt: now,
      updatedAt: now,
    })

    // Audit log
    await createAuditLog(c.env, {
      adminUserId: adminUser.adminUserId,
      action: 'create',
      resource: 'admin_user',
      resourceId: userId,
      details: { email, name, role },
      ...getRequestInfo(c as any),
    })

    const newUser = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, userId),
    })

    // Remove password from response
    return c.json({
      id: newUser!.id,
      email: newUser!.email,
      name: newUser!.name,
      role: newUser!.role,
      permissions: newUser!.permissions || [],
      active: newUser!.active,
      createdAt: newUser!.createdAt,
      updatedAt: newUser!.updatedAt,
    }, 201)
  } catch (error) {
    console.error('Create admin user error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * PUT /api/v1/admin/users/:id
 * Update admin user (only admins can update users)
 */
usersRouter.put('/:id', requireRole('admin'), async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const adminUser = c.get('adminUser')!
    const db = getDb(c.env)

    const user = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, id),
    })

    if (!user) {
      return c.json({ error: 'Admin user not found' }, 404)
    }

    const { email, name, password, role, permissions, active } = body

    // Prevent self-demotion (admin can't remove their own admin role)
    if (id === adminUser.adminUserId && role && role !== 'admin') {
      return c.json({ error: 'Cannot change your own role' }, 400)
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    }

    if (email && email !== user.email) {
      // Check if email already exists
      const existing = await db.query.adminUsers.findFirst({
        where: eq(adminUsers.email, email.toLowerCase()),
      })

      if (existing) {
        return c.json({ error: 'Email already exists' }, 400)
      }

      updateData.email = email.toLowerCase()
    }

    if (name) updateData.name = name
    if (role && ['admin', 'manager', 'editor'].includes(role)) updateData.role = role
    if (permissions !== undefined) updateData.permissions = permissions
    if (active !== undefined) updateData.active = active

    // If password is provided, hash it
    if (password) {
      if (password.length < 8) {
        return c.json({ error: 'Password must be at least 8 characters' }, 400)
      }
      updateData.password = await hashPassword(password)
    }

    await db.update(adminUsers)
      .set(updateData)
      .where(eq(adminUsers.id, id))

    // Audit log
    await createAuditLog(c.env, {
      adminUserId: adminUser.adminUserId,
      action: 'update',
      resource: 'admin_user',
      resourceId: id,
      details: Object.keys(body),
      ...getRequestInfo(c as any),
    })

    const updatedUser = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, id),
    })

    // Remove password from response
    return c.json({
      id: updatedUser!.id,
      email: updatedUser!.email,
      name: updatedUser!.name,
      role: updatedUser!.role,
      permissions: updatedUser!.permissions || [],
      active: updatedUser!.active,
      createdAt: updatedUser!.createdAt,
      updatedAt: updatedUser!.updatedAt,
    })
  } catch (error) {
    console.error('Update admin user error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * DELETE /api/v1/admin/users/:id
 * Delete admin user (only admins can delete users)
 */
usersRouter.delete('/:id', requireRole('admin'), async (c) => {
  try {
    const id = c.req.param('id')
    const adminUser = c.get('adminUser')!
    const db = getDb(c.env)

    // Prevent self-deletion
    if (id === adminUser.adminUserId) {
      return c.json({ error: 'Cannot delete your own account' }, 400)
    }

    const user = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, id),
    })

    if (!user) {
      return c.json({ error: 'Admin user not found' }, 404)
    }

    await db.delete(adminUsers).where(eq(adminUsers.id, id))

    // Audit log
    await createAuditLog(c.env, {
      adminUserId: adminUser.adminUserId,
      action: 'delete',
      resource: 'admin_user',
      resourceId: id,
      details: { email: user.email, name: user.name },
      ...getRequestInfo(c as any),
    })

    return c.json({ message: 'Admin user deleted successfully' })
  } catch (error) {
    console.error('Delete admin user error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default usersRouter

