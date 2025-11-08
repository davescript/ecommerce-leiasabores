import { Hono } from 'hono'
import { eq, and, sql } from 'drizzle-orm'
import { getDb } from '../lib/db'
import { coupons } from '../models/schema'
import type { WorkerBindings } from '../types/bindings'

const router = new Hono<{ Bindings: WorkerBindings }>()

/**
 * GET /api/coupons/validate
 * Validate coupon code (public endpoint for checkout)
 */
router.get('/validate', async (c) => {
  try {
    const code = c.req.query('code')
    const total = parseFloat(c.req.query('total') || '0')
    const items = c.req.query('items') ? JSON.parse(c.req.query('items')!) : []

    if (!code) {
      return c.json({ error: 'Coupon code is required' }, 400)
    }

    const env = c.env as unknown as WorkerBindings
    const db = getDb({ DB: env.DB })

    // Find active coupon
    const coupon = await db.query.coupons.findFirst({
      where: and(
        eq(coupons.code, code.toUpperCase()),
        eq(coupons.active, true)
      ),
    })

    if (!coupon) {
      return c.json({ valid: false, error: 'Cupom inválido ou expirado' })
    }

    // Check expiration
    if (coupon.endsAt && new Date(coupon.endsAt) < new Date()) {
      return c.json({ valid: false, error: 'Cupom expirado' })
    }

    // Check usage limit
    if (coupon.maxUses && (coupon.uses || 0) >= coupon.maxUses) {
      return c.json({ valid: false, error: 'Cupom esgotado' })
    }

    // Check minimum purchase
    if (coupon.minPurchase && total < coupon.minPurchase) {
      return c.json({ 
        valid: false, 
        error: `Valor mínimo de compra: €${coupon.minPurchase.toFixed(2)}` 
      })
    }

    // Check applicable categories if specified
    if (coupon.applicableCategories && coupon.applicableCategories.length > 0 && items.length > 0) {
      // This would need product categories from items - simplified for now
      // In production, you'd check if items belong to applicable categories
    }

    // Calculate discount
    let discount = 0
    if (coupon.type === 'percentage') {
      discount = (total * coupon.value) / 100
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount)
      }
    } else {
      discount = coupon.value
    }

    const finalTotal = Math.max(0, total - discount)

    return c.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount: parseFloat(discount.toFixed(2)),
        finalTotal: parseFloat(finalTotal.toFixed(2)),
      },
    })
  } catch (error: any) {
    console.error('Validate coupon error:', error)
    return c.json({ valid: false, error: 'Erro ao validar cupom' }, 500)
  }
})

/**
 * GET /api/coupons/active
 * Get all active coupons (public endpoint)
 */
router.get('/active', async (c) => {
  try {
    const env = c.env as unknown as WorkerBindings
    const db = getDb({ DB: env.DB })

    const now = new Date().toISOString()

    const activeCoupons = await db.query.coupons.findMany({
      where: and(
        eq(coupons.active, true),
        // Not expired or no expiration date
        sql`(${coupons.endsAt} IS NULL OR ${coupons.endsAt} > ${now})`
      ),
    })

    // Filter by usage limit
    const availableCoupons = activeCoupons.filter(coupon => {
      if (coupon.maxUses) {
        return (coupon.uses || 0) < coupon.maxUses
      }
      return true
    })

    // Return only necessary info (no sensitive data)
    const safeCoupons = availableCoupons.map(coupon => ({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minPurchase: coupon.minPurchase,
      maxDiscount: coupon.maxDiscount,
    }))

    return c.json({ coupons: safeCoupons })
  } catch (error) {
    console.error('Get active coupons error:', error)
    return c.json({ error: 'Failed to fetch coupons' }, 500)
  }
})

export default router

