import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, Eye, Mail, ShoppingBag, Euro } from 'lucide-react'
import { DataTable } from '../../../components/admin/DataTable'
import { Input } from '../../../components/ui/input'
import { api } from '../../../lib/api-client'

interface Customer {
  id: string
  email: string
  name: string
  totalSpent: number
  orderCount: number
}

export function CustomersList() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading, error } = useQuery<{ data: Customer[]; total: number; page: number; limit: number }>({
    queryKey: ['admin-customers', page, search],
    queryFn: async () => {
      const response = await api.get('/admin/customers', { params: { page, limit, search } })
      return response.data
    },
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }

  const columns = [
    { 
      key: 'name', 
      label: 'Cliente',
      render: (customer: Customer) => (
        <div>
          <p className="font-semibold text-gray-900">{customer.name}</p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {customer.email}
          </p>
        </div>
      )
    },
    { 
      key: 'orderCount', 
      label: 'Pedidos',
      render: (customer: Customer) => (
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{customer.orderCount}</span>
        </div>
      )
    },
    { 
      key: 'totalSpent', 
      label: 'Total Gasto',
      render: (customer: Customer) => (
        <div className="flex items-center gap-2">
          <Euro className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900">{formatCurrency(customer.totalSpent)}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (customer: Customer) => (
        <div className="flex items-center gap-2">
          <Link 
            to={`/admin/customers/${customer.id}`}
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
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gerencie seus clientes e histórico de compras</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Pesquisar clientes por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
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
          emptyMessage="Nenhum cliente encontrado."
        />
      </div>
    </div>
  )
}
