import { Hono } from 'hono'
import { getDb, dbSchema } from '../../lib/db'
import { eq, sql, desc, and, gte } from 'drizzle-orm'
import type { WorkerBindings } from '../../types/bindings'
import { authMiddleware, adminMiddleware, JWTPayload } from '../../middleware/auth'

const dashboard = new Hono<{ Bindings: WorkerBindings; Variables: { user?: JWTPayload } }>()

dashboard.get('/', authMiddleware, adminMiddleware, async (c) => {
  const db = getDb(c.env as WorkerBindings)
  const { products, orders } = dbSchema

  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Vendas hoje
    const salesTodayResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.status, 'paid'),
          gte(sql`datetime(${orders.createdAt})`, todayStart.toISOString())
        )
      )
      .get()

    // Vendas esta semana
    const salesWeekResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.status, 'paid'),
          gte(sql`datetime(${orders.createdAt})`, weekStart.toISOString())
        )
      )
      .get()

    // Vendas este mês
    const salesMonthResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.status, 'paid'),
          gte(sql`datetime(${orders.createdAt})`, monthStart.toISOString())
        )
      )
      .get()

    // Ticket médio (últimos 30 dias)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const avgTicketResult = await db
      .select({
        avg: sql<number>`COALESCE(AVG(${orders.total}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.status, 'paid'),
          gte(sql`datetime(${orders.createdAt})`, thirtyDaysAgo.toISOString())
        )
      )
      .get()

    // Produtos em estoque baixo (< 5)
    // Nota: Se o campo stock não existir, retornar 0
    let lowStockCount = 0
    try {
      const lowStockProducts = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(products)
        .where(
          and(
            eq(products.inStock, true),
            sql`COALESCE(${products.stock}, 999) < 5`
          )
        )
        .get()
      lowStockCount = lowStockProducts?.count || 0
    } catch {
      // Campo stock pode não existir ainda, retornar 0
      lowStockCount = 0
    }

    // Pedidos recentes (últimos 10)
    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(10)
      .all()

    // Top produtos (por vendas - simplificado)
    const topProducts = await db
      .select({
        id: products.id,
        name: products.name,
        sales: sql<number>`0`, // TODO: Implementar contagem real de vendas
        revenue: sql<number>`0`, // TODO: Implementar receita real
      })
      .from(products)
      .limit(5)
      .all()

    // Carrinhos abandonados (simplificado - pedidos não pagos nas últimas 24h)
    const abandonedCartsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(
        and(
          eq(orders.status, 'pending'),
          gte(sql`datetime(${orders.createdAt})`, new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
        )
      )
      .get()

    const salesToday = salesTodayResult?.total || 0
    const ordersToday = salesTodayResult?.count || 0
    const salesThisWeek = salesWeekResult?.total || 0
    const salesThisMonth = salesMonthResult?.total || 0
    const averageTicket = avgTicketResult?.avg || 0
    const abandonedCarts = abandonedCartsResult?.count || 0

    // Taxa de conversão (simplificado - seria necessário dados de visitantes)
    const conversionRate = ordersToday > 0 ? (ordersToday / 100) * 100 : 0

    return c.json({
      salesToday,
      salesThisWeek,
      salesThisMonth,
      averageTicket: Math.round(averageTicket * 100) / 100,
      ordersToday,
      conversionRate: Math.round(conversionRate * 10) / 10,
      abandonedCarts,
      lowStockProducts: lowStockCount,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        customer: (order as any).customerName || order.email || 'Cliente',
        total: order.total,
        status: order.status || 'pending',
        date: order.createdAt,
      })),
      topProducts: topProducts.map((product) => ({
        id: product.id,
        name: product.name,
        sales: 0, // TODO: Implementar
        revenue: 0, // TODO: Implementar
      })),
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return c.json(
      {
        error: 'Failed to fetch dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
})

export default dashboard

