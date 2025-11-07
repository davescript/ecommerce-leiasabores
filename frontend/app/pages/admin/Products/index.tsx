import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Search, Trash2, Eye, Copy, Image as ImageIcon } from 'lucide-react'
import { DataTable } from '../../../components/admin/DataTable'
import { Button } from '../../../components/Button'
import { Input } from '../../../components/ui/input'
import { fetchProducts, deleteProduct } from '../../../lib/api'
import type { Product } from '@types'
import { toast } from 'sonner'
import { api } from '../../../lib/api-client'

export function ProductsList() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)
  const limit = 20
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search, categoryFilter, statusFilter],
    queryFn: () => fetchProducts({ page, limit, search, category: categoryFilter }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Produto deletado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao deletar produto')
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: async (product: Product) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdAt, updatedAt, ...rest } = product
      const newProduct = {
        ...rest,
        name: `${product.name} (Cópia)`,
      }
      const response = await api.post<Product>('/products', newProduct)
      return response.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Produto duplicado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao duplicar produto')
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleDuplicate = (product: Product) => {
    duplicateMutation.mutate(product)
  }

  // Filtrar produtos localmente
  const filteredProducts = (data?.data || []).filter((p) => {
    if (statusFilter === 'active' && !p.inStock) return false
    if (statusFilter === 'inactive' && p.inStock) return false
    return true
  })

  const columns = [
    {
      key: 'images',
      label: '',
      render: (product: Product) => (
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {product.images && product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64'
              }}
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-gray-400" />
          )}
        </div>
      ),
    },
    { 
      key: 'name', 
      label: 'Produto',
      render: (product: Product) => (
        <div>
          <p className="font-semibold text-gray-900">{product.name}</p>
          <p className="text-sm text-gray-500">{product.category}</p>
        </div>
      )
    },
    { 
      key: 'price', 
      label: 'Preço',
      render: (product: Product) => (
        <div>
          <p className="font-semibold text-gray-900">€{product.price.toFixed(2)}</p>
          {product.originalPrice && product.originalPrice > product.price && (
            <p className="text-sm text-gray-400 line-through">€{product.originalPrice.toFixed(2)}</p>
          )}
        </div>
      )
    },
    { 
      key: 'inStock', 
      label: 'Status',
      render: (product: Product) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          product.inStock 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {product.inStock ? 'Em Stock' : 'Sem Stock'}
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <Link 
            to={`/produto/${product.id}`} 
            target="_blank"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Ver no site"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button 
            onClick={() => handleDuplicate(product)} 
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Duplicar"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(product.id)} 
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Deletar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os seus produtos</p>
        </div>
        <Link to="/admin/products/new">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Novo Produto
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Pesquisar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Todas as categorias</option>
            <option value="topos-de-bolo">Topos de Bolo</option>
            <option value="baloes">Balões</option>
            <option value="diversos">Diversos</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="active">Em Stock</option>
            <option value="inactive">Sem Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredProducts}
          loading={isLoading}
          pagination={{
            page: data?.page || 1,
            limit: data?.limit || limit,
            total: data?.total || 0,
            onPageChange: setPage,
          }}
          emptyMessage="Nenhum produto encontrado."
        />
      </div>
    </div>
  )
}
