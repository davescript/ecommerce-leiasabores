import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Trash2, Plus, Save, Loader2, Package, Image as ImageIcon, FolderTree, Warehouse, Search, ExternalLink } from 'lucide-react'
import { productsApi, categoriesApi } from '@lib/admin-api'
import { toast } from 'sonner'
import { Button } from '@components/Button'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'

interface ProductVariant {
  id?: string
  name: string
  value: string
  priceModifier: number
  stock: number | null
  sku: string | null
}

interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  children?: Category[]
}

interface Product {
  id: string
  name: string
  description?: string | null
  shortDescription?: string | null
  price: number
  originalPrice?: number | null
  category: string
  images?: string[] | null
  inStock: boolean
  stock?: number | null
  tags?: string[]
  variants?: ProductVariant[]
}

interface EditProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function EditProductModal({ product, isOpen, onClose, onSave }: EditProductModalProps) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [activeTab, setActiveTab] = useState<'general' | 'images' | 'categories' | 'stock' | 'seo'>('general')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: 0,
    originalPrice: null as number | null,
    category: '',
    categories: [] as string[], // Multiple categories
    images: [] as (string | { id?: string; url: string; r2Key?: string })[],
    inStock: true,
    stock: null as number | null,
    stockMinAlert: 0,
    tags: [] as string[],
    variants: [] as ProductVariant[],
    status: 'active' as 'active' | 'inactive' | 'draft',
    slug: '',
    sku: '',
    seoTitle: '',
    seoDescription: '',
  })
  const [tagInput, setTagInput] = useState('')
  const [newVariant, setNewVariant] = useState<ProductVariant>({
    name: '',
    value: '',
    priceModifier: 0,
    stock: null,
    sku: null,
  })
  
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Load categories and product data
  useEffect(() => {
    if (isOpen) {
      loadCategories()
      if (product) {
        loadProductData()
      }
    }
  }, [isOpen, product])

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.list()
      // Flatten categories for easier selection
      const flattenCategories = (cats: Category[]): Category[] => {
        return cats.flatMap(cat => [cat, ...(cat.children ? flattenCategories(cat.children) : [])])
      }
      setCategories(flattenCategories(response.data.categories || response.data.flat || []))
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadProductData = async () => {
    if (!product) return

    try {
      const response = await productsApi.get(product.id)
      const productData = response.data

      // Handle images - preserve full objects if available, otherwise use URLs
      const images = productData.images?.map((img: any) => {
        if (typeof img === 'string') return img
        // Return object if it has structure, otherwise return URL string
        if (img.id || img.url || img.r2Key) {
          return {
            id: img.id,
            url: img.url || img.r2Key,
            r2Key: img.r2Key,
          }
        }
        return img.url || img.r2Key || img
      }) || []

      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        shortDescription: productData.shortDescription || '',
        price: productData.price || 0,
        originalPrice: productData.originalPrice || null,
        category: productData.category || '',
        categories: productData.categories?.map((c: any) => c.id || c) || [],
        images,
        inStock: productData.inStock !== false,
        stock: productData.stock || null,
        stockMinAlert: productData.stockMinAlert || 0,
        tags: productData.tags || [],
        variants: productData.variants || [],
        status: productData.status || 'active',
        slug: productData.slug || '',
        sku: productData.sku || '',
        seoTitle: productData.seoTitle || '',
        seoDescription: productData.seoDescription || '',
      })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao carregar dados do produto')
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!product) return

    setUploading(true)
    try {
      const response = await productsApi.uploadImage(file, product.id)
      // Add image with structure if ID is available
      const newImage = response.data.id 
        ? { id: response.data.id, url: response.data.url }
        : response.data.url
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage],
      }))
      toast.success('Imagem enviada com sucesso')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao enviar imagem')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async (imageUrl: string, imageId?: string) => {
    try {
      // Try to extract image ID from URL or use provided ID
      const imageData: any = { key: imageUrl }
      if (imageId) {
        imageData.id = imageId
      }
      
      await productsApi.deleteImage(imageData.id || imageData.key)
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => img !== imageUrl),
      }))
      toast.success('Imagem removida')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao remover imagem')
    }
  }

  const handleAddVariant = () => {
    if (!newVariant.name || !newVariant.value) {
      toast.error('Preencha nome e valor da variante')
      return
    }

    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { ...newVariant }],
    }))

    setNewVariant({
      name: '',
      value: '',
      priceModifier: 0,
      stock: null,
      sku: null,
    })
  }

  const handleRemoveVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }))
  }

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!product) return

    setLoading(true)
    try {
      // Prepare data for API - convert images to URLs only and filter out empty values
      // Only send fields that have meaningful values
      const updateData: any = {}
      
      // Always include price if it's been set (even if 0, but validate it)
      if (formData.price !== undefined && formData.price !== null) {
        if (formData.price <= 0) {
          toast.error('O preço deve ser maior que zero')
          setLoading(false)
          return
        }
        updateData.price = formData.price
      }
      
      // Add other fields only if they have values
      if (formData.name) updateData.name = formData.name
      if (formData.description !== undefined) updateData.description = formData.description || null
      if (formData.shortDescription !== undefined) updateData.shortDescription = formData.shortDescription || null
      if (formData.originalPrice !== undefined && formData.originalPrice !== null) {
        updateData.originalPrice = formData.originalPrice
      } else if (formData.originalPrice === null) {
        updateData.originalPrice = null
      }
      if (formData.category) updateData.category = formData.category
      if (formData.categories && formData.categories.length > 0) updateData.categories = formData.categories
      
      // Convert images to URL strings only
      if (formData.images && formData.images.length > 0) {
        updateData.images = formData.images.map(img => {
          if (typeof img === 'string') return img
          if (typeof img === 'object' && img.url) return img.url
          return img
        }).filter(Boolean)
      } else if (formData.images && formData.images.length === 0) {
        updateData.images = []
      }
      
      if (formData.inStock !== undefined) updateData.inStock = formData.inStock
      if (formData.stock !== undefined && formData.stock !== null) {
        updateData.stock = formData.stock
      } else if (formData.stock === null) {
        updateData.stock = null
      }
      if (formData.stockMinAlert !== undefined) updateData.stockMinAlert = formData.stockMinAlert
      if (formData.tags) updateData.tags = formData.tags
      if (formData.variants) updateData.variants = formData.variants
      if (formData.status) updateData.status = formData.status
      if (formData.slug) updateData.slug = formData.slug
      if (formData.sku !== undefined) updateData.sku = formData.sku || null
      if (formData.seoTitle !== undefined) updateData.seoTitle = formData.seoTitle || null
      if (formData.seoDescription !== undefined) updateData.seoDescription = formData.seoDescription || null

      await productsApi.update(product.id, updateData)
      
      // Success feedback
      toast.success('Produto atualizado com sucesso! As alterações já estão visíveis no site.')
      
      // Trigger cache invalidation on public site (if in same domain)
      try {
        // Notify public site to refresh cache (optional - for immediate updates)
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
          // Dispatch event for cache refresh
          window.dispatchEvent(new CustomEvent('admin:product-updated', { 
            detail: { productId: product.id } 
          }))
        }
      } catch (error) {
        // Silent fail - cache will be invalidated by backend
        console.debug('Cache refresh notification:', error)
      }
      
      onSave()
      onClose()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao atualizar produto'
      const errorDetails = error.response?.data?.details
      
      // Show validation errors in a more user-friendly way
      if (errorDetails && Array.isArray(errorDetails)) {
        const errorMessages = errorDetails.map((err: any) => {
          const field = err.path?.join('.') || 'campo'
          return `${field}: ${err.message}`
        }).join(', ')
        toast.error(`Erro de validação: ${errorMessages}`)
      } else {
        toast.error(errorMessage)
      }
      
      if (errorDetails) {
        console.error('Validation errors:', errorDetails)
      }
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'Geral', icon: Package },
    { id: 'images', label: 'Imagens', icon: ImageIcon },
    { id: 'categories', label: 'Categorias', icon: FolderTree },
    { id: 'stock', label: 'Estoque', icon: Warehouse },
    { id: 'seo', label: 'SEO', icon: Search },
  ]

  const productUrl = product ? `https://www.leiasabores.pt/products/${product.id}` : ''

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Drawer - slides from right */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative bg-white dark:bg-gray-900 w-full max-w-2xl h-full shadow-2xl flex flex-col ml-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Editar Produto
              </h2>
              {product && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>ID: {product.id}</span>
                  {formData.slug && (
                    <>
                      <span>•</span>
                      <a
                        href={productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Ver página pública
                        <ExternalLink size={14} />
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={24} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto flex-shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Tab: General */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome do Produto *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Slug (URL)
                    </label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="auto-gerado-se-vazio"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SKU
                    </label>
                    <Input
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descrição Curta
                    </label>
                    <Input
                      value={formData.shortDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                      className="w-full"
                      maxLength={500}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descrição Completa
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={6}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preço *
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preço Original (Promoção)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.originalPrice || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value ? parseFloat(e.target.value) : null }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'draft' }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                      <option value="draft">Rascunho</option>
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(index)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddTag()
                          }
                        }}
                        placeholder="Adicionar tag"
                        className="flex-1"
                      />
                      <Button type="button" onClick={handleAddTag}>
                        Adicionar
                      </Button>
                    </div>
                  </div>

                  {/* Variants */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Variantes
                    </label>
                    <div className="space-y-3">
                      {formData.variants.map((variant, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex-1 grid grid-cols-4 gap-2">
                            <Input
                              value={variant.name}
                              onChange={(e) => {
                                const newVariants = [...formData.variants]
                                newVariants[index].name = e.target.value
                                setFormData(prev => ({ ...prev, variants: newVariants }))
                              }}
                              placeholder="Nome"
                              className="text-sm"
                            />
                            <Input
                              value={variant.value}
                              onChange={(e) => {
                                const newVariants = [...formData.variants]
                                newVariants[index].value = e.target.value
                                setFormData(prev => ({ ...prev, variants: newVariants }))
                              }}
                              placeholder="Valor"
                              className="text-sm"
                            />
                            <Input
                              type="number"
                              step="0.01"
                              value={variant.priceModifier}
                              onChange={(e) => {
                                const newVariants = [...formData.variants]
                                newVariants[index].priceModifier = parseFloat(e.target.value) || 0
                                setFormData(prev => ({ ...prev, variants: newVariants }))
                              }}
                              placeholder="Mod. Preço"
                              className="text-sm"
                            />
                            <Input
                              type="number"
                              min="0"
                              value={variant.stock || ''}
                              onChange={(e) => {
                                const newVariants = [...formData.variants]
                                newVariants[index].stock = e.target.value ? parseInt(e.target.value) : null
                                setFormData(prev => ({ ...prev, variants: newVariants }))
                              }}
                              placeholder="Estoque"
                              className="text-sm"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(index)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <Input
                          value={newVariant.name}
                          onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nome da variante"
                          className="flex-1 text-sm"
                        />
                        <Input
                          value={newVariant.value}
                          onChange={(e) => setNewVariant(prev => ({ ...prev, value: e.target.value }))}
                          placeholder="Valor"
                          className="flex-1 text-sm"
                        />
                        <Button type="button" onClick={handleAddVariant} className="text-sm">
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Images */}
              {activeTab === 'images' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {formData.images.map((image, index) => {
                      // Extract image ID and URL
                      const imageObj = typeof image === 'object' ? image : null
                      const imageId = imageObj?.id || null
                      const imageUrl = imageObj?.url || (typeof image === 'string' ? image : '')
                      
                      return (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(imageUrl, imageId || undefined)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploading ? (
                        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            Clique para fazer upload
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            PNG, JPG, WEBP até 10MB
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file)
                      }}
                      disabled={uploading}
                    />
                  </label>
                </div>
              )}

              {/* Tab: Categories */}
              {activeTab === 'categories' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoria Principal *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categorias Adicionais (múltipla seleção)
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg p-3">
                      {categories.map(cat => (
                        <label key={cat.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={formData.categories.includes(cat.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  categories: [...prev.categories, cat.id],
                                }))
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  categories: prev.categories.filter(id => id !== cat.id),
                                }))
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Stock */}
              {activeTab === 'stock' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="inStock"
                      checked={formData.inStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="inStock" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Produto em estoque
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Quantidade em Estoque
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.stock || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value ? parseInt(e.target.value) : null }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Alerta de Estoque Mínimo
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.stockMinAlert}
                        onChange={(e) => setFormData(prev => ({ ...prev, stockMinAlert: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: SEO */}
              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Title
                    </label>
                    <Input
                      value={formData.seoTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                      placeholder="Título para SEO (máx. 60 caracteres)"
                      maxLength={60}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Description
                    </label>
                    <Textarea
                      value={formData.seoDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                      placeholder="Descrição para SEO (máx. 160 caracteres)"
                      maxLength={160}
                      rows={3}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
