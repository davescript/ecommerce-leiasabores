import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, Eye } from 'lucide-react'
import { DataTable } from '../../../components/admin/DataTable'
import { Input } from '../../../components/ui/input'
import { api } from '../../../lib/api-client'

interface Order {
  id: string
  email: string
  customerName?: string
  total: number
  status: string
  createdAt: string
  stripeSessionId: string
}

async function fetchOrders(params?: { status?: string; page?: number; limit?: number }) {
  const response = await api.get<{ data: Order[]; total: number; page: number; limit: number }>(
    '/admin/orders',
    { params }
  )
  return response.data
}

export function OrdersList() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, search],
    queryFn: () => fetchOrders({ status: statusFilter !== 'all' ? statusFilter : undefined }),
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Pago', className: 'bg-green-100 text-green-800' },
      failed: { label: 'Falhado', className: 'bg-red-100 text-red-800' },
      refunded: { label: 'Reembolsado', className: 'bg-gray-100 text-gray-800' },
      shipped: { label: 'Enviado', className: 'bg-blue-100 text-blue-800' },
      delivered: { label: 'Entregue', className: 'bg-purple-100 text-purple-800' },
    }

    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    )
  }

  const orders = data?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-600 mt-1">Gerencie todos os pedidos</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por email ou ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
            <option value="failed">Falhado</option>
            <option value="refunded">Reembolsado</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregue</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={[
          {
            key: 'id',
            label: 'ID',
            render: (order: Order) => (
              <div className="font-mono text-sm">{order.id.substring(0, 8)}...</div>
            ),
          },
          {
            key: 'customer',
            label: 'Cliente',
            render: (order: Order) => (
              <div>
                <div className="font-medium text-gray-900">
                  {order.customerName || 'Cliente'}
                </div>
                <div className="text-sm text-gray-500">{order.email}</div>
              </div>
            ),
          },
          {
            key: 'total',
            label: 'Total',
            render: (order: Order) => (
              <div className="font-medium text-gray-900">{formatPrice(order.total)}</div>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (order: Order) => getStatusBadge(order.status),
          },
          {
            key: 'date',
            label: 'Data',
            render: (order: Order) => (
              <div className="text-sm text-gray-600">{formatDate(order.createdAt)}</div>
            ),
          },
          {
            key: 'actions',
            label: 'Ações',
            render: (order: Order) => (
              <Link to={`/admin/orders/${order.id}`}>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Eye className="w-4 h-4" />
                </button>
              </Link>
            ),
          },
        ]}
        data={orders}
        loading={isLoading}
        pagination={
          data
            ? {
                page: data.page,
                limit: data.limit,
                total: data.total,
                onPageChange: () => {}, // TODO: Implementar paginação
              }
            : undefined
        }
        emptyMessage="Nenhum pedido encontrado"
      />
    </div>
  )
}

