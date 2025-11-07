import { useState, useMemo } from 'react'
import { Edit, Trash2, Eye, EyeOff, Package, Plus } from 'lucide-react'
import { Button } from '@components/ui/button'

// Mock data para carregamento instantâneo
const MOCK_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Topo Personalizado Estrela',
    shortDescription: 'Topo estrela personalizado',
    price: 17.99,
    originalPrice: 22.99,
    category: 'topos-de-bolo',
    inStock: true,
    rating: 4.8,
    reviewCount: 12,
    images: [],
    tags: ['topo', 'personalizado']
  },
  {
    id: 'prod-2', 
    name: 'Topo Clássico Azul',
    shortDescription: 'Topo azul elegante',
    price: 12.99,
    originalPrice: 16.99,
    category: 'topos-de-bolo',
    inStock: true,
    rating: 4.5,
    reviewCount: 8,
    images: [],
    tags: ['topo', 'azul']
  },
  {
    id: 'prod-3',
    name: 'Topo Clássico Dourado',
    shortDescription: 'Topo dourado premium',
    price: 14.99,
    originalPrice: 19.99,
    category: 'topos-de-bolo',
    inStock: false,
    rating: 4.9,
    reviewCount: 15,
    images: [],
    tags: ['topo', 'dourado']
  }
]

interface QuickProductsListProps {
  onCreateProduct: () => void
  onEditProduct: (product: any) => void
  onDeleteProduct: (id: string) => void
}

export function QuickProductsList({ onCreateProduct, onEditProduct, onDeleteProduct }: QuickProductsListProps) {
  const [search, setSearch] = useState('')
  
  const filteredProducts = useMemo(() => {
    if (!search) return MOCK_PRODUCTS
    const searchLower = search.toLowerCase()
    return MOCK_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.shortDescription.toLowerCase().includes(searchLower)
    )
  }, [search])

  return (
    <div className="space-y-4">
      {/* Header rápido */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Produtos</h2>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="flex items-center gap-1">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{MOCK_PRODUCTS.length}</span>
              <span className="text-gray-500">produtos</span>
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-green-600" />
              <span className="font-medium">{MOCK_PRODUCTS.filter(p => p.inStock).length}</span>
              <span className="text-gray-500">ativos</span>
            </span>
          </div>
        </div>
        <Button onClick={onCreateProduct}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Busca rápida */}
      <div className="bg-white rounded-lg border p-4">
        <input
          type="text"
          placeholder="Buscar produtos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Lista simples e rápida */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredProducts.map((product) => (
            <div key={product.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.shortDescription}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-medium text-gray-900">€{product.price.toFixed(2)}</div>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="text-xs text-gray-500 line-through">€{product.originalPrice.toFixed(2)}</div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {product.inStock ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Eye className="w-3 h-3 mr-1" />
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <EyeOff className="w-3 h-3 mr-1" />
                      Inativo
                    </span>
                  )}
                </div>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => onEditProduct(product)}
                    className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Excluir produto?')) {
                        onDeleteProduct(product.id)
                      }
                    }}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-500 mb-4">Tente uma busca diferente ou crie um novo produto</p>
          <Button onClick={onCreateProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Produto
          </Button>
        </div>
      )}
    </div>
  )
}
