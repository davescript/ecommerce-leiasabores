import { useEffect, useState } from 'react'
import { dashboardApi } from '@lib/admin-api'
import { LayoutDashboard, Package, Users, ShoppingCart, TrendingUp, DollarSign, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface DashboardStats {
  sales: {
    today: { total: number; count: number }
    week: { total: number; count: number }
    month: { total: number; count: number }
  }
  customers: { total: number }
  products: { total: number; inStock: number; outOfStock: number }
  orders: { pending: number }
  averageOrderValue: number
}

interface SalesChartData {
  date: string
  total: number
  count: number
}

interface TopProduct {
  productId: string
  productName: string
  totalSold: number
  totalRevenue: number
}

interface RecentOrder {
  id: string
  email: string
  total: number
  status: string
  createdAt: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [salesChartData, setSalesChartData] = useState<SalesChartData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [chartDays, setChartDays] = useState(30)

  useEffect(() => {
    loadDashboardData()
  }, [chartDays])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load stats
      const statsResponse = await dashboardApi.getStats()
      setStats(statsResponse.data)

      // Load sales chart data
      const salesResponse = await dashboardApi.getSalesChart(chartDays)
      const salesData = salesResponse.data.sales || []
      
      // Format sales data for chart
      const formattedSales = salesData.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
        total: parseFloat(item.total) || 0,
        count: parseInt(item.count) || 0,
      }))
      setSalesChartData(formattedSales)

      // Load top products
      const topProductsResponse = await dashboardApi.getTopProducts(10)
      setTopProducts(topProductsResponse.data.products || [])

      // Load recent orders
      const recentOrdersResponse = await dashboardApi.getRecentOrders(10)
      setRecentOrders(recentOrdersResponse.data.orders || [])
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      title: 'Vendas Hoje',
      value: `€${stats.sales.today.total.toFixed(2)}`,
      subtitle: `${stats.sales.today.count} pedidos`,
      icon: DollarSign,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Vendas Esta Semana',
      value: `€${stats.sales.week.total.toFixed(2)}`,
      subtitle: `${stats.sales.week.count} pedidos`,
      icon: Calendar,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Vendas Este Mês',
      value: `€${stats.sales.month.total.toFixed(2)}`,
      subtitle: `${stats.sales.month.count} pedidos`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Total de Produtos',
      value: stats.products.total.toString(),
      subtitle: `${stats.products.inStock} em estoque, ${stats.products.outOfStock} sem estoque`,
      icon: Package,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Total de Clientes',
      value: stats.customers.total.toString(),
      subtitle: 'Clientes cadastrados',
      icon: Users,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      textColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      title: 'Pedidos Pendentes',
      value: stats.orders.pending.toString(),
      subtitle: 'Aguardando processamento',
      icon: ShoppingCart,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      title: 'Ticket Médio',
      value: `€${stats.averageOrderValue.toFixed(2)}`,
      subtitle: 'Por pedido',
      icon: LayoutDashboard,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      textColor: 'text-pink-600 dark:text-pink-400',
    },
  ]

  // Prepare products chart data (top 5)
  const topProductsChart = topProducts.slice(0, 5).map((product, index) => ({
    name: product.productName.length > 20 
      ? product.productName.substring(0, 20) + '...' 
      : product.productName,
    vendas: product.totalSold,
    receita: parseFloat(product.totalRevenue.toString()),
    color: COLORS[index % COLORS.length],
  }))

  // Products stock pie chart data
  const stockData = [
    { name: 'Em Estoque', value: stats.products.inStock, color: '#10b981' },
    { name: 'Sem Estoque', value: stats.products.outOfStock, color: '#ef4444' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'delivered':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      paid: 'Pago',
      pending: 'Pendente',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    }
    return statusMap[status] || status
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Visão geral do seu e-commerce
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={chartDays}
            onChange={(e) => setChartDays(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {card.subtitle}
                  </p>
                </div>
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <Icon className={card.textColor} size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Vendas por Período
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => `€${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => [`€${parseFloat(value).toFixed(2)}`, 'Total']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Receita (€)"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estoque de Produtos
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stockData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => 
                  `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stockData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Chart */}
      {topProductsChart.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Produtos Mais Vendidos
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductsChart}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
              <XAxis 
                dataKey="name" 
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => [value, 'Unidades Vendidas']}
              />
              <Legend />
              <Bar dataKey="vendas" fill="#3b82f6" name="Unidades Vendidas" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pedidos Recentes
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Pedido
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      Nenhum pedido recente
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        #{order.id.substring(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {order.email}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        €{parseFloat(order.total.toString()).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Produtos (Receita)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Produto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Vendidos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Receita
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      Nenhum produto vendido ainda
                    </td>
                  </tr>
                ) : (
                  topProducts.slice(0, 10).map((product, index) => (
                    <tr key={product.productId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            #{index + 1}
                          </span>
                          <span>
                            {product.productName.length > 30
                              ? product.productName.substring(0, 30) + '...'
                              : product.productName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {product.totalSold}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        €{parseFloat(product.totalRevenue.toString()).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
