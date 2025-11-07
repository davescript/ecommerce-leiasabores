import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, User } from 'lucide-react'
import { api } from '@lib/api-client'
import { Input } from '@components/ui/input'

export function CustomersList() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const response = await api.get('/admin/customers')
      return response.data
    },
  })

  interface Customer {
    id?: string
    email?: string
    name?: string
    orderCount?: number
    totalSpent?: number
  }

  const customers = (data?.data || []) as Customer[]
  const filteredCustomers = customers.filter((customer: Customer) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.name?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
        <p className="text-gray-600 mt-1">Gerencie seus clientes</p>
      </div>

      {/* Busca */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar clientes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedidos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Gasto
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Nenhum cliente encontrado
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer: Customer) => (
                  <tr key={customer.id || customer.email} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.orderCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      €{customer.totalSpent?.toFixed(2) || '0.00'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

