import { Hono } from 'hono'
import { eq, and, like, desc, sql } from 'drizzle-orm'
import type { WorkerBindings } from '../../types/bindings'
import { AdminJWTPayload } from '../../middleware/adminAuth'
import { adminAuthMiddleware, createAuditLog, getRequestInfo, requirePermission } from '../../middleware/adminAuth'
import { getDb } from '../../lib/db'
import { coupons } from '../../models/schema'
import { bustCouponCache } from '../../utils/cache'
import { generateId } from '../../utils/id'
import { couponSchema, couponUpdateSchema } from '../../validators/coupon'

const couponsRouter = new Hono<{ Bindings: WorkerBindings; Variables: { adminUser?: AdminJWTPayload } }>()

couponsRouter.use('*', adminAuthMiddleware)

/**
 * GET /api/v1/admin/coupons
 * List coupons
 */
couponsRouter.get('/', requirePermission('coupons:read'), async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const search = c.req.query('search') || ''
    const active = c.req.query('active')

    const db = getDb(c.env)
    const offset = (page - 1) * limit

    const conditions = []
    if (search) {
      conditions.push(like(coupons.code, `%${search}%`))
    }
    if (active !== undefined) {
      conditions.push(eq(coupons.active, active === 'true'))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const couponsList = await db.query.coupons.findMany({
      where: whereClause,
      orderBy: [desc(coupons.createdAt)],
      limit,
      offset,
    })

    const totalResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(coupons)
      .where(whereClause)
      .get()

    const total = totalResult?.count || 0

    return c.json({
      coupons: couponsList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List coupons error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * GET /api/v1/admin/coupons/:id
 * Get coupon by ID
 */
couponsRouter.get('/:id', requirePermission('coupons:read'), async (c) => {
  try {
    const id = c.req.param('id')
    const db = getDb(c.env)

    const coupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, id),
    })

    if (!coupon) {
      return c.json({ error: 'Coupon not found' }, 404)
    }

    return c.json(coupon)
  } catch (error) {
    console.error('Get coupon error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * POST /api/v1/admin/coupons
 * Create coupon
 */
couponsRouter.post('/', requirePermission('coupons:write'), async (c) => {
  try {
    const body = await c.req.json()
    const adminUser = c.get('adminUser')!
    const db = getDb(c.env)

    // Validate input with Zod
    const validationResult = couponSchema.safeParse(body)

    if (!validationResult.success) {
      return c.json({
        error: 'Validation error',
        details: validationResult.error.errors,
      }, 400)
    }

    const validatedData = validationResult.data
    const {
      code,
      type,
      value,
      minPurchase,
      maxDiscount,
      usageLimit,
      expiresAt,
      startsAt,
      active,
      applicableCategories,
    } = validatedData

    // Check if code already exists
    const existing = await db.query.coupons.findFirst({
      where: eq(coupons.code, code.toUpperCase()),
    })

    if (existing) {
      return c.json({ error: 'Coupon code already exists' }, 400)
    }

    const couponId = generateId('coupon')
    const now = new Date().toISOString()

    await db.insert(coupons).values({
      id: couponId,
      code: code.toUpperCase(),
      type,
      value: value,
      minPurchase: minPurchase || null,
      maxDiscount: maxDiscount || null,
      usageLimit: usageLimit || null,
      maxUses: usageLimit || null, // Alias for consistency
      startsAt: startsAt || null,
      endsAt: expiresAt || null,
      active: active !== false,
      applicableCategories: applicableCategories || null,
      categoryScope: applicableCategories || null, // Alias
      uses: 0, // Current usage count
      createdAt: now,
      updatedAt: now,
    })

    // Bust cache
    await bustCouponCache(c.env)

    // Audit log
    await createAuditLog(c.env, {
      adminUserId: adminUser.adminUserId,
      action: 'create',
      resource: 'coupon',
      resourceId: couponId,
      details: { code, type, value },
      ...getRequestInfo(c as any),
    })

    const coupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, couponId),
    })

    return c.json(coupon, 201)
  } catch (error) {
    console.error('Create coupon error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * PUT /api/v1/admin/coupons/:id
 * Update coupon
 */
couponsRouter.put('/:id', requirePermission('coupons:write'), async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const adminUser = c.get('adminUser')!
    const db = getDb(c.env)

    const coupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, id),
    })

    if (!coupon) {
      return c.json({ error: 'Coupon not found' }, 404)
    }

    // Validate input with Zod (partial update allowed)
    const validationResult = couponUpdateSchema.safeParse({
      ...body,
      id,
    })

    if (!validationResult.success) {
      return c.json({
        error: 'Validation error',
        details: validationResult.error.errors,
      }, 400)
    }

    const validatedData = validationResult.data
    const {
      code,
      type,
      value,
      minPurchase,
      maxDiscount,
      usageLimit,
      expiresAt,
      startsAt,
      active,
      applicableCategories,
    } = validatedData

    // Check code uniqueness if changed
    if (code && code.toUpperCase() !== coupon.code) {
      const existing = await db.query.coupons.findFirst({
        where: eq(coupons.code, code.toUpperCase()),
      })

      if (existing) {
        return c.json({ error: 'Coupon code already exists' }, 400)
      }
    }

    await db.update(coupons)
      .set({
        code: code !== undefined ? code.toUpperCase() : coupon.code,
        type: type !== undefined ? type : coupon.type,
        value: value !== undefined ? value : coupon.value,
        minPurchase: minPurchase !== undefined ? minPurchase : coupon.minPurchase,
        maxDiscount: maxDiscount !== undefined ? maxDiscount : coupon.maxDiscount,
        usageLimit: usageLimit !== undefined ? usageLimit : coupon.usageLimit,
        maxUses: usageLimit !== undefined ? usageLimit : coupon.maxUses,
        startsAt: startsAt !== undefined ? startsAt : coupon.startsAt,
        endsAt: expiresAt !== undefined ? expiresAt : coupon.endsAt,
        active: active !== undefined ? active : coupon.active,
        applicableCategories: applicableCategories !== undefined ? applicableCategories : coupon.applicableCategories,
        categoryScope: applicableCategories !== undefined ? applicableCategories : coupon.categoryScope,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(coupons.id, id))

    // Bust cache
    await bustCouponCache(c.env)

    // Audit log
    await createAuditLog(c.env, {
      adminUserId: adminUser.adminUserId,
      action: 'update',
      resource: 'coupon',
      resourceId: id,
      details: body,
      ...getRequestInfo(c as any),
    })

    const updatedCoupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, id),
    })

    return c.json(updatedCoupon)
  } catch (error) {
    console.error('Update coupon error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * DELETE /api/v1/admin/coupons/:id
 * Delete coupon
 */
couponsRouter.delete('/:id', requirePermission('coupons:delete'), async (c) => {
  try {
    const id = c.req.param('id')
    const adminUser = c.get('adminUser')!
    const db = getDb(c.env)

    const coupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, id),
    })

    if (!coupon) {
      return c.json({ error: 'Coupon not found' }, 404)
    }

    await db.delete(coupons).where(eq(coupons.id, id))

    // Bust cache
    await bustCouponCache(c.env)

    // Audit log
    await createAuditLog(c.env, {
      adminUserId: adminUser.adminUserId,
      action: 'delete',
      resource: 'coupon',
      resourceId: id,
      details: { code: coupon.code },
      ...getRequestInfo(c as any),
    })

    return c.json({ message: 'Coupon deleted successfully' })
  } catch (error) {
    console.error('Delete coupon error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default couponsRouter

