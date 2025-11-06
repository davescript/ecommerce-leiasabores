import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Filter, X } from 'lucide-react'
import { ProductCard } from '@components/ProductCard'
import { Button } from '@components/Button'
import { Input } from '@components/ui/input'
import { Skeleton } from '@components/ui/skeleton'
import { useCart } from '@hooks/useCart'
import { useSEO } from '@hooks/useSEO'
import { fetchProducts } from '@lib/api'

const categories = [
  { label: 'Balões', value: 'Balões' },
  { label: 'Decorações', value: 'Decorações' },
  { label: 'Temas Infantis', value: 'Temas Infantis' },
  { label: 'Confetes', value: 'Confetes' },
  { label: 'Velas', value: 'Velas' },
  { label: 'Topos de Bolo', value: 'topos-de-bolo' },
]
const sortOptions = [
  { value: 'relevancia', label: 'Relevância' },
  { value: 'preco-asc', label: 'Menor Preço' },
  { value: 'preco-desc', label: 'Maior Preço' },
  { value: 'novos', label: 'Mais Novos' },
  { value: 'avaliacoes', label: 'Melhor Avaliados' },
]

export function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('categoria') ? searchParams.get('categoria')!.split(',') : []
  )
  const [selectedThemes, setSelectedThemes] = useState<string[]>(
    searchParams.get('tema') ? searchParams.get('tema')!.split(',') : []
  )
  const [sort, setSort] = useState('relevancia')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 150])
  const searchQuery = searchParams.get('busca') || ''
  const [page, setPage] = useState(1)
  const limit = 12
  const { addItem } = useCart()
  useSEO({
    title: 'Catálogo',
    description: 'Encontre balões, decorações e kits completos para festas inesquecíveis. Filtre por categoria, preço e avaliações.',
  })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', { searchQuery, selectedCategories, sort, page }],
    queryFn: () =>
      fetchProducts({
        search: searchQuery || undefined,
        category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
        sort,
        page,
        limit,
      }),
  })

  useEffect(() => {
    setPage(1)
  }, [searchQuery, sort, selectedCategories, selectedThemes, priceRange])

  const products = data?.data ?? []

  const availableThemes = useMemo(() => {
    const tags = new Set<string>()

    for (const product of products) {
      if (Array.isArray(product.tags)) {
        product.tags
          .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
          .filter(Boolean)
          .forEach((tag) => tags.add(tag))
      }
    }

    return Array.from(tags).sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }))
  }, [products])

  const filteredProducts = useMemo(() => {
    const withinPrice = products.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1])

    const byCategory =
      selectedCategories.length === 0
        ? withinPrice
        : withinPrice.filter((product) =>
            selectedCategories.some(
              (category) => category.toLocaleLowerCase('pt-PT') === product.category.toLocaleLowerCase('pt-PT')
            )
          )

    if (selectedThemes.length === 0) {
      return byCategory
    }

    return byCategory.filter((product) =>
      (product.tags ?? []).some((tag) => tag && selectedThemes.includes(tag))
    )
  }, [products, priceRange, selectedCategories, selectedThemes])

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      const next = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]

      const params = new URLSearchParams(searchParams)
      if (next.length) {
        params.set('categoria', next.join(','))
      } else {
        params.delete('categoria')
      }
      setSearchParams(params)
      return next
    })
  }

  const toggleTheme = (theme: string) => {
    setSelectedThemes((prev) => {
      const next = prev.includes(theme) ? prev.filter((item) => item !== theme) : [...prev, theme]

      const params = new URLSearchParams(searchParams)
      if (next.length) {
        params.set('tema', next.join(','))
      } else {
        params.delete('tema')
      }
      setSearchParams(params)

      return next
    })
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedThemes([])
    setPriceRange([0, 150])
    setSort('relevancia')
    setPage(1)
    const params = new URLSearchParams(searchParams)
    params.delete('categoria')
    params.delete('tema')
    setSearchParams(params)
  }

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-secondary mb-8">Catálogo</h1>

        <div className="flex gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${
              isFilterOpen ? 'block' : 'hidden'
            } md:block w-full md:w-64 space-y-6`}
          >
            <div className="bg-white p-6 rounded-lg shadow-soft">
              <div className="flex justify-between items-center mb-4 md:hidden">
                <h3 className="font-bold">Filtros</h3>
                <button onClick={() => setIsFilterOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-bold mb-4">Categorias</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.value)}
                        onChange={() => toggleCategory(category.value)}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <span className="text-sm">{category.label}</span>
                    </label>
                  ))}
              </div>
            </div>

              {availableThemes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold mb-4">Temas populares</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableThemes.map((theme) => {
                      const isActive = selectedThemes.includes(theme)
                      return (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => toggleTheme(theme)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            isActive
                              ? 'bg-primary text-white shadow-soft'
                              : 'bg-light text-secondary hover:bg-primary/10'
                          }`}
                        >
                          {theme}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <h3 className="font-bold mb-4">Preço</h3>
                <div className="space-y-2">
                  <Input
                    type="number"
                    min={0}
                    max={500}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const value = Math.max(0, Number(e.target.value) || 0)
                      setPriceRange([Math.min(value, priceRange[1]), priceRange[1]])
                    }}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={500}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const value = Math.max(0, Number(e.target.value) || priceRange[1])
                      setPriceRange([priceRange[0], Math.max(value, priceRange[0])])
                    }}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Intervalo: €{priceRange[0].toFixed(0)} - €{priceRange[1].toFixed(0)}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Products */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex justify-between items-center mb-8 gap-4">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-soft"
              >
                <Filter size={20} />
                Filtros
              </button>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <span className="text-sm text-gray-600">
                {isLoading ? 'Carregando...' : `${filteredProducts.length} produtos`}
              </span>
            </div>

            {(selectedCategories.length > 0 || selectedThemes.length > 0) && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {selectedCategories.map((category) => {
                  const label = categories.find((option) => option.value === category)?.label ?? category
                  return (
                    <span
                      key={`categoria-${category}`}
                      className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                    >
                      {label}
                      <button
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className="text-primary transition hover:text-secondary"
                        aria-label={`Remover categoria ${label}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )
                })}
                {selectedThemes.map((theme) => (
                  <span
                    key={`tema-${theme}`}
                    className="flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary"
                  >
                    {theme}
                    <button
                      type="button"
                      onClick={() => toggleTheme(theme)}
                      className="text-secondary transition hover:text-primary"
                      aria-label={`Remover tema ${theme}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-gray-500 transition hover:border-gray-200 hover:bg-white hover:text-secondary"
                >
                  Limpar filtros
                </button>
              </div>
            )}

            {isError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-left">
                <p className="text-sm font-semibold text-red-600">Não foi possível carregar os produtos.</p>
                <Button className="mt-4" variant="outline" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: limit }).map((_, i) => (
                  <Skeleton key={i} className="h-80 w-full rounded-2xl" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={(p) => addItem(p, 1)}
                      />
                    </motion.div>
                  ))}
                </div>
                {data && data.totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                      Página anterior
                    </Button>
                    <span className="text-sm text-gray-500">
                      Página {page} de {data.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.totalPages}
                      onClick={() => setPage((current) => Math.min(data.totalPages, current + 1))}
                    >
                      Próxima página
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center">
                <p className="mb-4 text-lg text-gray-600">Nenhum produto encontrado com os filtros selecionados.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    clearFilters()
                    refetch()
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
