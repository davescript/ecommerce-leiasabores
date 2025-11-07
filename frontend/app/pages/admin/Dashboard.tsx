import { useQuery } from '@tanstack/react-query'
import { api } from '@lib/api-client'
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface DashboardStats {
  salesToday: { total: number; count: number }
  salesWeek: { total: number }
  salesMonth: { total: number }
  avgTicket: number
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  salesGrowth: number
}

export function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await api.get<DashboardStats>('/admin/dashboard')
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  const stats = [
    {
      label: 'Vendas Hoje',
      value: `€${data?.salesToday.total.toFixed(2) || '0.00'}`,
      change: data?.salesToday.count || 0,
      changeLabel: 'pedidos',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Vendas Esta Semana',
      value: `€${data?.salesWeek.total.toFixed(2) || '0.00'}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Vendas Este Mês',
      value: `€${data?.salesMonth.total.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Ticket Médio',
      value: `€${data?.avgTicket.toFixed(2) || '0.00'}`,
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Total Produtos',
      value: data?.totalProducts?.toString() || '0',
      icon: Package,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      label: 'Total Pedidos',
      value: data?.totalOrders?.toString() || '0',
      icon: ShoppingCart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      label: 'Total Clientes',
      value: data?.totalCustomers?.toString() || '0',
      icon: Users,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      label: 'Crescimento',
      value: `${data?.salesGrowth?.toFixed(1) || '0'}%`,
      icon: data?.salesGrowth && data.salesGrowth >= 0 ? TrendingUp : TrendingDown,
      color: data?.salesGrowth && data.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: data?.salesGrowth && data.salesGrowth >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.change !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.change} {stat.changeLabel}
                    </p>
                  )}
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`${stat.color} w-6 h-6`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

