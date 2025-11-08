import { Hono } from 'hono'
import { sql, eq, and, gte, desc } from 'drizzle-orm'
import type { WorkerBindings } from '../../types/bindings'
import { AdminJWTPayload } from '../../middleware/adminAuth'
import { adminAuthMiddleware } from '../../middleware/adminAuth'
import { getDb } from '../../lib/db'
import { orders, products, users, orderItems } from '../../models/schema'

const dashboard = new Hono<{ Bindings: WorkerBindings; Variables: { adminUser?: AdminJWTPayload } }>()

// All routes require authentication
dashboard.use('*', adminAuthMiddleware)

/**
 * GET /api/v1/admin/dashboard/stats
 * Get dashboard statistics
 */
dashboard.get('/stats', async (c) => {
  try {
    const db = getDb(c.env)
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Sales today (paid, shipped, or delivered orders)
    const salesToday = await db
      .select({
        total: sql<number>`SUM(${orders.total})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(
        and(
          sql`${orders.status} IN ('paid', 'shipped', 'delivered')`,
          gte(sql`datetime(${orders.createdAt})`, todayStart.toISOString())
        )
      )
      .get()

    // Sales this week
    const salesWeek = await db
      .select({
        total: sql<number>`SUM(${orders.total})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(
        and(
          sql`${orders.status} IN ('paid', 'shipped', 'delivered')`,
          gte(sql`datetime(${orders.createdAt})`, weekStart.toISOString())
        )
      )
      .get()

    // Sales this month
    const salesMonth = await db
      .select({
        total: sql<number>`SUM(${orders.total})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(
        and(
          sql`${orders.status} IN ('paid', 'shipped', 'delivered')`,
          gte(sql`datetime(${orders.createdAt})`, monthStart.toISOString())
        )
      )
      .get()

    // Total customers
    const totalCustomers = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .get()

    // Total products
    const totalProducts = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .get()

    // Products in stock
    const productsInStock = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(eq(products.inStock, true))
      .get()

    // Products out of stock
    const productsOutOfStock = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(eq(products.inStock, false))
      .get()

    // Pending orders
    const pendingOrders = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(eq(orders.status, 'pending'))
      .get()

    // Average order value (paid, shipped, or delivered orders)
    const avgOrderValue = await db
      .select({
        avg: sql<number>`AVG(${orders.total})`,
      })
      .from(orders)
      .where(sql`${orders.status} IN ('paid', 'shipped', 'delivered')`)
      .get()

    return c.json({
      sales: {
        today: {
          total: salesToday?.total || 0,
          count: salesToday?.count || 0,
        },
        week: {
          total: salesWeek?.total || 0,
          count: salesWeek?.count || 0,
        },
        month: {
          total: salesMonth?.total || 0,
          count: salesMonth?.count || 0,
        },
      },
      customers: {
        total: totalCustomers?.count || 0,
      },
      products: {
        total: totalProducts?.count || 0,
        inStock: productsInStock?.count || 0,
        outOfStock: productsOutOfStock?.count || 0,
      },
      orders: {
        pending: pendingOrders?.count || 0,
      },
      averageOrderValue: avgOrderValue?.avg || 0,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * GET /api/v1/admin/dashboard/recent-orders
 * Get recent orders
 */
dashboard.get('/recent-orders', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10')
    const db = getDb(c.env)

    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(limit)

    return c.json({ orders: recentOrders })
  } catch (error) {
    console.error('Recent orders error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * GET /api/v1/admin/dashboard/top-products
 * Get top selling products
 */
dashboard.get('/top-products', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10')
    const db = getDb(c.env)

    const topProducts = await db
      .select({
        productId: orderItems.productId,
        productName: orderItems.productName,
        totalSold: sql<number>`SUM(${orderItems.quantity})`,
        totalRevenue: sql<number>`SUM(${orderItems.subtotal})`,
      })
      .from(orderItems)
      .groupBy(orderItems.productId, orderItems.productName)
      .orderBy(desc(sql`SUM(${orderItems.quantity})`))
      .limit(limit)

    return c.json({ products: topProducts })
  } catch (error) {
    console.error('Top products error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * GET /api/v1/admin/dashboard/sales-chart
 * Get sales data for charts
 */
dashboard.get('/sales-chart', async (c) => {
  try {
    const days = parseInt(c.req.query('days') || '30')
    const db = getDb(c.env)
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Group sales by day for the chart
    const sales = await db
      .select({
        date: sql<string>`date(${orders.createdAt})`,
        total: sql<number>`SUM(${orders.total})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(
        and(
          sql`${orders.status} IN ('paid', 'shipped', 'delivered')`,
          gte(sql`datetime(${orders.createdAt})`, startDate.toISOString())
        )
      )
      .groupBy(sql`date(${orders.createdAt})`)
      .orderBy(sql`date(${orders.createdAt})`)

    return c.json({ sales })
  } catch (error) {
    console.error('Sales chart error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default dashboard

