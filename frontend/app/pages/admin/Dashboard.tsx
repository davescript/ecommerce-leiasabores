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
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do seu e-commerce</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          title="Produtos em Estoque Baixo"
          value={stats.lowStockProducts}
          icon={AlertTriangle}
          iconColor="text-red-600"
        />
        <KPICard
          title="Total de Clientes"
          value={0}
          icon={Users}
        />
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pedidos Recentes</h2>
          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'customer', label: 'Cliente' },
              {
                key: 'total',
                label: 'Total',
                render: (order) => formatCurrency(order.total),
              },
              { key: 'status', label: 'Status' },
              { key: 'date', label: 'Data' },
            ]}
            data={stats.recentOrders}
            emptyMessage="Nenhum pedido recente"
          />
        </div>

        {/* Top Products */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Produtos Mais Vendidos</h2>
          <DataTable
            columns={[
              { key: 'name', label: 'Produto' },
              { key: 'sales', label: 'Vendas' },
              {
                key: 'revenue',
                label: 'Receita',
                render: (product) => formatCurrency(product.revenue),
              },
            ]}
            data={stats.topProducts}
            emptyMessage="Nenhum produto vendido ainda"
          />
        </div>
      </div>

      {/* Alerts */}
      {stats.lowStockProducts > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">Atenção: Estoque Baixo</h3>
              <p className="text-sm text-amber-700 mt-1">
                {stats.lowStockProducts} produto(s) com estoque abaixo de 5 unidades.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

