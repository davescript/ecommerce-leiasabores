import { useQuery } from '@tanstack/react-query'
import { 
  Euro, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  Users,
  Percent,
  Clock
} from 'lucide-react'
import { KPICard } from '../../components/admin/KPICard'
import { DataTable } from '../../components/admin/DataTable'
import { api } from '../../lib/api-client'

interface DashboardStats {
  salesToday: number
  salesThisWeek: number
  salesThisMonth: number
  averageTicket: number
  ordersToday: number
  conversionRate: number
  abandonedCarts: number
  lowStockProducts: number
  recentOrders: Array<{
    id: string
    customer: string
    total: number
    status: string
    date: string
  }>
  topProducts: Array<{
    id: string
    name: string
    sales: number
    revenue: number
  }>
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<DashboardStats>('/admin/dashboard')
  return response.data
}

export function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const stats = data || {
    salesToday: 0,
    salesThisWeek: 0,
    salesThisMonth: 0,
    averageTicket: 0,
    ordersToday: 0,
    conversionRate: 0,
    abandonedCarts: 0,
    lowStockProducts: 0,
    recentOrders: [],
    topProducts: [],
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Bem-vindo de volta! Aqui está o resumo do seu negócio.</p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
            <option>Últimos 7 dias</option>
            <option>Últimos 30 dias</option>
            <option>Últimos 90 dias</option>
          </select>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Vendas Hoje"
          value={formatCurrency(stats.salesToday)}
          icon={Euro}
          change={{
            value: 12.5,
            isPositive: true,
          }}
        />
        <KPICard
          title="Vendas Este Mês"
          value={formatCurrency(stats.salesThisMonth)}
          icon={TrendingUp}
          change={{
            value: 8.3,
            isPositive: true,
          }}
        />
        <KPICard
          title="Ticket Médio"
          value={formatCurrency(stats.averageTicket)}
          icon={ShoppingCart}
          change={{
            value: 5.2,
            isPositive: true,
          }}
        />
        <KPICard
          title="Taxa de Conversão"
          value={`${stats.conversionRate.toFixed(1)}%`}
          icon={Percent}
          change={{
            value: 2.1,
            isPositive: true,
          }}
        />
        <KPICard
          title="Pedidos Hoje"
          value={stats.ordersToday}
          icon={ShoppingCart}
        />
        <KPICard
          title="Carrinhos Abandonados"
          value={stats.abandonedCarts}
          icon={Clock}
          iconColor="text-amber-600"
        />
        <KPICard
          title="Estoque Baixo"
          value={stats.lowStockProducts}
          icon={AlertTriangle}
          iconColor="text-red-600"
        />
        <KPICard
          title="Total Clientes"
          value={0}
          icon={Users}
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Pedidos Recentes</h2>
            <button className="text-sm text-primary hover:text-primary/80 font-medium">
              Ver todos
            </button>
          </div>
          <DataTable
            columns={[
              { key: 'id', label: 'ID', render: (order) => <span className="font-mono text-xs">{order.id.slice(0, 8)}...</span> },
              { key: 'customer', label: 'Cliente' },
              {
                key: 'total',
                label: 'Total',
                render: (order) => <span className="font-semibold">{formatCurrency(order.total)}</span>,
              },
              { 
                key: 'status', 
                label: 'Status',
                render: (order) => (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'paid' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status}
                  </span>
                )
              },
              { 
                key: 'date', 
                label: 'Data',
                render: (order) => formatDate(order.date)
              },
            ]}
            data={stats.recentOrders}
            emptyMessage="Nenhum pedido recente"
          />
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Produtos Mais Vendidos</h2>
            <button className="text-sm text-primary hover:text-primary/80 font-medium">
              Ver todos
            </button>
          </div>
          <DataTable
            columns={[
              { key: 'name', label: 'Produto' },
              { 
                key: 'sales', 
                label: 'Vendas',
                render: (product) => <span className="font-medium">{product.sales}</span>
              },
              {
                key: 'revenue',
                label: 'Receita',
                render: (product) => <span className="font-semibold text-primary">{formatCurrency(product.revenue)}</span>,
              },
            ]}
            data={stats.topProducts}
            emptyMessage="Nenhum produto vendido ainda"
          />
        </div>
      </div>

      {/* Alerts */}
      {stats.lowStockProducts > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">Atenção: Estoque Baixo</h3>
              <p className="text-sm text-amber-700">
                {stats.lowStockProducts} produto(s) com estoque abaixo de 5 unidades. 
                <a href="/admin/products" className="ml-1 font-medium hover:underline">
                  Ver produtos
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
