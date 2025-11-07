import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  Package,
  Star,
  TrendingUp,
  Filter,
  Download,
  Upload,
  Copy,
  ExternalLink
} from 'lucide-react'
import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchCategories } from '@lib/api'
import type { Product } from '@types'
import { toast } from 'sonner'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { SafeImage } from '@components/SafeImage'
import { PLACEHOLDER_SVG } from '@lib/image-placeholders'
import { LoadingSpinner, TableLoadingSkeleton } from '@components/admin/LoadingSpinner'
import { QuickProductsList } from '@components/admin/QuickProductsList'

export function ProductsList() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [editing, setEditing] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => fetchProducts({ page: 1, limit: 20 }), // Apenas 20 produtos iniciais
    staleTime: Infinity, // Cache infinito - só atualiza manualmente
    cacheTime: Infinity, // Manter em cache para sempre
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Não refetch ao montar se já tem cache
    refetchOnReconnect: false,
    retry: false, // Não retry em caso de erro
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: Infinity, // Cache infinito
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] }) // Invalidar cache do frontend
      toast.success(`Produto "${newProduct.name}" criado com sucesso!`)
      setShowForm(false)
      setEditing(null)
    },
    onError: (error: any) => {
      console.error('Erro ao criar produto:', error)
      toast.error(error?.message || 'Erro ao criar produto')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Product> }) =>
      updateProduct(id, body),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] }) // Invalidar cache do frontend
      queryClient.invalidateQueries({ queryKey: ['product', updatedProduct.id] }) // Invalidar produto específico
      toast.success(`Produto "${updatedProduct.name}" atualizado com sucesso!`)
      setEditing(null)
      setShowForm(false)
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar produto:', error)
      toast.error(error?.message || 'Erro ao atualizar produto')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] }) // Invalidar cache do frontend
      toast.success('Produto excluído com sucesso!')
    },
    onError: (error: any) => {
      console.error('Erro ao excluir produto:', error)
      toast.error(error?.message || 'Erro ao excluir produto')
    },
  })

  const products = data?.data || []
  const categories = categoriesData || []
  
  // Filtros otimizados - aplicar apenas se necessário
  const filteredProducts = useMemo(() => {
    if (!products.length) return []
    
    // Se não há filtros, retornar todos
    if (!search && statusFilter === 'all' && categoryFilter === 'all') {
      return products
    }
    
    return products.filter((p) => {
      if (search) {
        const searchLower = search.toLowerCase()
        if (!p.name.toLowerCase().includes(searchLower) && 
            !p.description?.toLowerCase().includes(searchLower) &&
            !p.category.toLowerCase().includes(searchLower)) {
          return false
        }
      }
      
      if (statusFilter !== 'all') {
        if ((statusFilter === 'active' && !p.inStock) || 
            (statusFilter === 'inactive' && p.inStock)) {
          return false
        }
      }
      
      if (categoryFilter !== 'all' && p.category !== categoryFilter) {
        return false
      }
      
      return true
    })
  }, [products, search, statusFilter, categoryFilter])

  // Memoizar estatísticas
  const stats = useMemo(() => ({
    totalProducts: products.length,
    activeProducts: products.filter(p => p.inStock).length,
    totalValue: products.reduce((sum, p) => sum + p.price, 0)
  }), [products])
  
  const handleSelectAll = useCallback(() => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id))
    }
  }, [selectedProducts.length, filteredProducts])

  const handleSelectProduct = useCallback((productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }, [])

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedProducts.length === 0) {
      toast.error('Selecione pelo menos um produto')
      return
    }

    if (action === 'delete') {
      if (!confirm(`Tem certeza que deseja excluir ${selectedProducts.length} produto(s)?`)) {
        return
      }
      selectedProducts.forEach(id => {
        deleteMutation.mutate(id)
      })
    } else {
      selectedProducts.forEach(id => {
        const product = products.find(p => p.id === id)
        if (product) {
          updateMutation.mutate({
            id,
            body: { inStock: action === 'activate' }
          })
        }
      })
    }
    setSelectedProducts([])
  }

  // Função para exportar produtos
  const handleExport = () => {
    if (filteredProducts.length === 0) {
      toast.error('Nenhum produto para exportar')
      return
    }

    // Preparar dados para CSV
    const csvData = filteredProducts.map(product => ({
      ID: product.id,
      Nome: product.name,
      'Descrição Curta': product.shortDescription || '',
      Descrição: product.description || '',
      Preço: product.price,
      'Preço Original': product.originalPrice || '',
      Categoria: product.category,
      'Em Estoque': product.inStock ? 'Sim' : 'Não',
      'Quantidade': product.stock || 0,
      Tags: product.tags?.join(', ') || '',
      Imagens: product.images?.join('; ') || '',
      Avaliação: product.rating || 0,
      'Número de Avaliações': product.reviewCount || 0,
      'Data de Criação': product.createdAt || '',
      'Última Atualização': product.updatedAt || ''
    }))

    // Converter para CSV
    const headers = Object.keys(csvData[0])
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row]
          // Escapar aspas e vírgulas
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value
        }).join(',')
      )
    ].join('\n')

    // Download do arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `produtos-leiasabores-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`${filteredProducts.length} produtos exportados com sucesso!`)
  }

  // Função para importar produtos
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Por favor, selecione um arquivo CSV')
      return
    }

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        toast.error('Arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const requiredHeaders = ['Nome', 'Preço', 'Categoria']
      
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      if (missingHeaders.length > 0) {
        toast.error(`Cabeçalhos obrigatórios ausentes: ${missingHeaders.join(', ')}`)
        return
      }

      let imported = 0
      let errors = 0

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          const productData: any = {}

          headers.forEach((header, index) => {
            const value = values[index] || ''
            switch (header) {
              case 'Nome':
                productData.name = value
                break
              case 'Descrição Curta':
                productData.shortDescription = value
                break
              case 'Descrição':
                productData.description = value
                break
              case 'Preço':
                productData.price = parseFloat(value) || 0
                break
              case 'Preço Original':
                if (value) productData.originalPrice = parseFloat(value)
                break
              case 'Categoria':
                productData.category = value
                break
              case 'Em Estoque':
                productData.inStock = value.toLowerCase() === 'sim' || value.toLowerCase() === 'true'
                break
              case 'Quantidade':
                if (value) productData.stock = parseInt(value)
                break
              case 'Tags':
                if (value) productData.tags = value.split(';').map(t => t.trim()).filter(Boolean)
                break
              case 'Imagens':
                if (value) productData.images = value.split(';').map(i => i.trim()).filter(Boolean)
                break
            }
          })

          if (productData.name && productData.price && productData.category) {
            await createMutation.mutateAsync(productData)
            imported++
          } else {
            errors++
          }
        } catch (error) {
          console.error(`Erro na linha ${i + 1}:`, error)
          errors++
        }
      }

      if (imported > 0) {
        toast.success(`${imported} produtos importados com sucesso!`)
      }
      if (errors > 0) {
        toast.warning(`${errors} produtos tiveram erros na importação`)
      }

    } catch (error) {
      console.error('Erro ao importar arquivo:', error)
      toast.error('Erro ao processar arquivo CSV')
    }

    // Limpar input
    event.target.value = ''
  }

  // Função para baixar template CSV
  const downloadTemplate = () => {
    const templateData = [
      {
        Nome: 'Exemplo Produto',
        'Descrição Curta': 'Descrição curta do produto',
        Descrição: 'Descrição completa do produto com detalhes',
        Preço: '19.99',
        'Preço Original': '29.99',
        Categoria: 'topos-de-bolo',
        'Em Estoque': 'Sim',
        Quantidade: '10',
        Tags: 'tag1, tag2, tag3',
        Imagens: 'https://exemplo.com/imagem1.jpg; https://exemplo.com/imagem2.jpg'
      }
    ]

    const headers = Object.keys(templateData[0])
    const csvContent = [
      headers.join(','),
      ...templateData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row]
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'template-produtos-leiasabores.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Template CSV baixado com sucesso!')
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    // Processar tags
    const tagsString = formData.get('tags') as string
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(Boolean) : []
    
    // Processar imagens
    const imagesString = formData.get('images') as string
    const images = imagesString ? imagesString.split('\n').map(url => url.trim()).filter(Boolean) : []
    
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      shortDescription: formData.get('shortDescription') as string,
      price: parseFloat(formData.get('price') as string),
      originalPrice: formData.get('originalPrice')
        ? parseFloat(formData.get('originalPrice') as string)
        : undefined,
      category: formData.get('category') as string,
      tags,
      images,
      stock: formData.get('stock') ? parseInt(formData.get('stock') as string) : undefined,
      inStock: formData.get('inStock') === 'on',
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, body: data })
    } else {
      createMutation.mutate(data)
    }
  }

  // Se ainda está carregando, mostrar versão rápida
  if (isLoading || !data) {
    return (
      <QuickProductsList
        onCreateProduct={() => setShowForm(true)}
        onEditProduct={(product) => {
          setEditing(product)
          setShowForm(true)
        }}
        onDeleteProduct={(id) => {
          if (confirm('Excluir produto?')) {
            deleteMutation.mutate(id)
          }
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Produtos</h2>
          <p className="text-gray-600 mt-1">Gerencie seus produtos como no Shopify</p>
          
          {/* Estatísticas rápidas */}
          <div className="flex gap-6 mt-3">
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{stats.totalProducts}</span>
              <span className="text-gray-500">produtos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Eye className="w-4 h-4 text-green-600" />
              <span className="font-medium">{stats.activeProducts}</span>
              <span className="text-gray-500">ativos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="font-medium">€{stats.totalValue.toFixed(2)}</span>
              <span className="text-gray-500">valor total</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <div className="relative">
            <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={downloadTemplate}
              className="absolute -bottom-6 left-0 text-xs text-gray-500 hover:text-gray-700"
            >
              Baixar template
            </Button>
          </div>
          <input
            id="import-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleImport}
            className="hidden"
          />
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Filtros avançados */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por nome, descrição ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[150px]"
          >
            <option value="all">Todas categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
          >
            <option value="all">Todos</option>
            <option value="active">Em Estoque</option>
            <option value="inactive">Sem Estoque</option>
          </select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Tabela
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grade
            </Button>
          </div>
        </div>

        {/* Ações em lote */}
        {selectedProducts.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedProducts.length} produto(s) selecionado(s)
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                  Ativar
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                  Desativar
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')}>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de produtos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avaliação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8">
                      <LoadingSpinner text="Carregando produtos..." />
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Package className="w-12 h-12 text-gray-300" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
                          <p className="text-gray-500">Tente ajustar os filtros ou criar um novo produto</p>
                        </div>
                        <Button onClick={() => setShowForm(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Criar primeiro produto
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <SafeImage
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                fallback={PLACEHOLDER_SVG}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                            <div className="text-sm text-gray-500 truncate">{product.shortDescription}</div>
                            {product.tags && product.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {product.tags.slice(0, 2).map((tag, idx) => (
                                  <span key={idx} className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                    {tag}
                                  </span>
                                ))}
                                {product.tags.length > 2 && (
                                  <span className="text-xs text-gray-400">+{product.tags.length - 2}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {categories.find(c => c.slug === product.category)?.name || product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">€{product.price.toFixed(2)}</div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="text-xs text-gray-500 line-through">€{product.originalPrice.toFixed(2)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-900">{product.rating?.toFixed(1) || '0.0'}</span>
                          <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.inStock ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Eye className="w-3 h-3 mr-1" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(product.id)
                              toast.success('ID copiado!')
                            }}
                            className="text-gray-400 hover:text-gray-600"
                            title="Copiar ID"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => window.open(`/produto/${product.id}`, '_blank')}
                            className="text-gray-400 hover:text-gray-600"
                            title="Ver no site"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditing(product)
                              setShowForm(true)
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir este produto?')) {
                                deleteMutation.mutate(product.id)
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Vista em grade */
          <div className="p-6">
            {isLoading ? (
              <div className="py-12">
                <LoadingSpinner size="lg" text="Carregando produtos..." />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
                  <p className="text-gray-500 mb-4">Tente ajustar os filtros ou criar um novo produto</p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar primeiro produto
                  </Button>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="absolute top-2 left-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 z-10"
                      />
                      <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100 mb-4">
                        {product.images && product.images.length > 0 ? (
                          <SafeImage
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            fallback={PLACEHOLDER_SVG}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{product.shortDescription}</p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-gray-900">€{product.price.toFixed(2)}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through ml-2">€{product.originalPrice.toFixed(2)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">{product.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          product.inStock 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.inStock ? 'Ativo' : 'Inativo'}
                        </span>
                        
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditing(product)
                              setShowForm(true)
                            }}
                            className="p-1 text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir este produto?')) {
                                deleteMutation.mutate(product.id)
                              }
                            }}
                            className="p-1 text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editing ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <Input
                    name="name"
                    defaultValue={editing?.name}
                    required
                    placeholder="Ex: Topo de Bolo Personalizado"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição Curta *
                  </label>
                  <Input
                    name="shortDescription"
                    defaultValue={editing?.shortDescription}
                    required
                    placeholder="Ex: Topo elegante para bolos de aniversário"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição Completa *
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editing?.description}
                    required
                    rows={4}
                    placeholder="Descrição detalhada do produto, incluindo materiais, dimensões, cuidados especiais, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço (€) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      name="price"
                      defaultValue={editing?.price}
                      required
                      placeholder="19.99"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço Original (opcional)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      name="originalPrice"
                      defaultValue={editing?.originalPrice}
                      className="w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    name="category"
                    defaultValue={editing?.category}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Esta categoria determinará onde o produto aparecerá no site
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (separadas por vírgula)
                  </label>
                  <Input
                    name="tags"
                    defaultValue={editing?.tags?.join(', ')}
                    placeholder="ex: topo, dourado, premium"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URLs das Imagens (uma por linha)
                  </label>
                  <textarea
                    name="images"
                    defaultValue={editing?.images?.join('\n')}
                    placeholder="https://exemplo.com/imagem1.jpg&#10;https://exemplo.com/imagem2.jpg"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cole as URLs das imagens, uma por linha. A primeira será a imagem principal.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantidade em Estoque
                    </label>
                    <Input
                      type="number"
                      name="stock"
                      defaultValue={editing?.stock || 0}
                      min="0"
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      name="inStock"
                      defaultChecked={editing?.inStock ?? true}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">Produto Ativo</label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditing(null)
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editing ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

