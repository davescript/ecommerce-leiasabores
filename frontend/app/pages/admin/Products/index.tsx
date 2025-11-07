import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Eye, Copy } from 'lucide-react'
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
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, categoryFilter, statusFilter],
    queryFn: () => fetchProducts({ 
      search, 
      category: categoryFilter || undefined,
      page: 1, 
      limit: 50 
    }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Produto deletado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao deletar produto')
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: async (product: Product) => {
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
      toast.success('Produto duplicado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao duplicar produto')
    },
  })

  const products = data?.data || []
  const filteredProducts = products.filter((p) => {
    if (statusFilter === 'active' && !p.inStock) return false
    if (statusFilter === 'inactive' && p.inStock) return false
    return true
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleDuplicate = (product: Product) => {
    duplicateMutation.mutate(product)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600 mt-1">Gerencie seus produtos</p>
        </div>
        <Link to="/admin/products/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
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
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={[
          {
            key: 'image',
            label: 'Imagem',
            render: (product: Product) => (
              <img
                src={product.images?.[0] || '/placeholder.png'}
                alt={product.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
            ),
          },
          {
            key: 'name',
            label: 'Nome',
            render: (product: Product) => (
              <div>
                <div className="font-medium text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-500">{product.category}</div>
              </div>
            ),
          },
          {
            key: 'price',
            label: 'Preço',
            render: (product: Product) => (
              <div>
                <div className="font-medium text-gray-900">{formatPrice(product.price)}</div>
                {product.originalPrice && (
                  <div className="text-sm text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'inStock',
            label: 'Status',
            render: (product: Product) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.inStock
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {product.inStock ? 'Em Estoque' : 'Esgotado'}
              </span>
            ),
          },
          {
            key: 'actions',
            label: 'Ações',
            render: (product: Product) => (
              <div className="flex items-center gap-2">
                <Link to={`/admin/products/${product.id}/edit`}>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                </Link>
                <button
                  onClick={() => handleDuplicate(product)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Duplicar"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={`/produto/${product.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Ver público"
                >
                  <Eye className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ),
          },
        ]}
        data={filteredProducts}
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
        emptyMessage="Nenhum produto encontrado"
      />
    </div>
  )
}

