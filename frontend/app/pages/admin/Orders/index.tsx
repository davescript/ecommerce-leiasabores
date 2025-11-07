import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, Eye, Download } from 'lucide-react'
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
}

export function OrdersList() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading } = useQuery<{ data: Order[]; total: number; page: number; limit: number }>({
    queryKey: ['admin-orders', page, search, statusFilter],
    queryFn: async () => {
      const response = await api.get('/admin/orders', { params: { page, limit, search, status: statusFilter } })
      return response.data
    },
  })

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Pago' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendente' },
      failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Falhou' },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Reembolsado' },
      shipped: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Enviado' },
    }
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const columns = [
    { 
      key: 'id', 
      label: 'ID do Pedido',
      render: (order: Order) => (
        <span className="font-mono text-sm text-gray-900">{order.id.slice(0, 12)}...</span>
      )
    },
    { 
      key: 'customerName', 
      label: 'Cliente',
      render: (order: Order) => (
        <div>
          <p className="font-medium text-gray-900">{order.customerName || 'Cliente'}</p>
          <p className="text-sm text-gray-500">{order.email}</p>
        </div>
      )
    },
    { 
      key: 'total', 
      label: 'Total',
      render: (order: Order) => (
        <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (order: Order) => getStatusBadge(order.status)
    },
    { 
      key: 'createdAt', 
      label: 'Data',
      render: (order: Order) => (
        <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (order: Order) => (
        <div className="flex items-center gap-2">
          <Link 
            to={`/admin/orders/${order.id}`}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Ver detalhes"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os pedidos da sua loja</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Pesquisar pedidos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="paid">Pago</option>
            <option value="pending">Pendente</option>
            <option value="failed">Falhou</option>
            <option value="refunded">Reembolsado</option>
            <option value="shipped">Enviado</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          pagination={{
            page: data?.page || 1,
            limit: data?.limit || limit,
            total: data?.total || 0,
            onPageChange: setPage,
          }}
          emptyMessage="Nenhum pedido encontrado."
        />
      </div>
    </div>
  )
}
