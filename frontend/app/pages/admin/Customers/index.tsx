import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, Eye } from 'lucide-react'
import { DataTable } from '../../../components/admin/DataTable'
import { Input } from '../../../components/ui/input'
import { api } from '../../../lib/api-client'

interface Customer {
  id: string
  email: string
  name: string
  totalSpent: number
  orderCount: number
  lastOrderDate?: string
}

async function fetchCustomers() {
  const response = await api.get<{ data: Customer[] }>('/admin/customers')
  return response.data
}

export function CustomersList() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', search],
    queryFn: fetchCustomers,
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  const customers = data?.data || []
  const filteredCustomers = customers.filter((c) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-600 mt-1">Gerencie seus clientes</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={[
          {
            key: 'name',
            label: 'Cliente',
            render: (customer: Customer) => (
              <div>
                <div className="font-medium text-gray-900">{customer.name}</div>
                <div className="text-sm text-gray-500">{customer.email}</div>
              </div>
            ),
          },
          {
            key: 'totalSpent',
            label: 'Total Gasto',
            render: (customer: Customer) => (
              <div className="font-medium text-gray-900">{formatPrice(customer.totalSpent)}</div>
            ),
          },
          {
            key: 'orderCount',
            label: 'Pedidos',
            render: (customer: Customer) => (
              <div className="text-sm text-gray-600">{customer.orderCount}</div>
            ),
          },
          {
            key: 'lastOrderDate',
            label: 'Última Compra',
            render: (customer: Customer) => (
              <div className="text-sm text-gray-600">
                {customer.lastOrderDate
                  ? new Date(customer.lastOrderDate).toLocaleDateString('pt-PT')
                  : '-'}
              </div>
            ),
          },
          {
            key: 'actions',
            label: 'Ações',
            render: (customer: Customer) => (
              <Link to={`/admin/customers/${customer.id}`}>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Eye className="w-4 h-4" />
                </button>
              </Link>
            ),
          },
        ]}
        data={filteredCustomers}
        loading={isLoading}
        emptyMessage="Nenhum cliente encontrado"
      />
    </div>
  )
}

