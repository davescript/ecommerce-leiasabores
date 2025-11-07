import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, Search, SlidersHorizontal } from 'lucide-react'
import { ProductCard } from '@components/ProductCard'
import { Button } from '@components/Button'
import { Input } from '@components/ui/input'
import { Skeleton } from '@components/ui/skeleton'
import { useCart } from '@hooks/useCart'
import { useSEO } from '@hooks/useSEO'
import { fetchProducts, fetchCategories, type Category } from '@lib/api'

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
    title: 'Catálogo · Leia Sabores',
    description: 'Encontre topos personalizados, bolos artesanais e decorações para festas inesquecíveis. Filtre por categoria, preço e avaliações.',
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const flatCategories = useMemo(() => {
    const flatten = (cats: Category[]): Array<{ label: string; value: string }> => {
      return cats.flatMap(cat => [
        { label: cat.name, value: cat.name },
        ...flatten(cat.children || [])
      ])
    }
    return categoriesData ? flatten(categoriesData) : []
  }, [categoriesData])

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

  const activeFiltersCount = selectedCategories.length + selectedThemes.length

  return (
    <div className="min-h-screen bg-light">
      <div className="container-xl py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary mb-2">Catálogo</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {isLoading ? 'Carregando...' : `${filteredProducts.length} produto${filteredProducts.length !== 1 ? 's' : ''} encontrado${filteredProducts.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Mobile Search & Filters Bar */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Pesquisar produtos..."
              value={searchQuery}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams)
                if (e.target.value) {
                  params.set('busca', e.target.value)
                } else {
                  params.delete('busca')
                }
                setSearchParams(params)
              }}
              className="pl-10 h-10 sm:h-11 rounded-full border-gray-200 text-sm"
            />
          </div>

          {/* Filter Button Mobile */}
          <Button
            onClick={() => setIsFilterOpen(true)}
            variant="outline"
            className="md:hidden h-10 sm:h-11 rounded-full gap-2 touch-manipulation"
          >
            <SlidersHorizontal size={18} />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Active Filters */}
        {(selectedCategories.length > 0 || selectedThemes.length > 0) && (
          <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2">
            {selectedCategories.map((category) => {
              const label = flatCategories.find((option) => option.value === category)?.label ?? category
              return (
                <span
                  key={`categoria-${category}`}
                  className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="text-primary transition hover:text-secondary touch-manipulation"
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
                className="flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-secondary"
              >
                {theme}
                <button
                  type="button"
                  onClick={() => toggleTheme(theme)}
                  className="text-secondary transition hover:text-primary touch-manipulation"
                  aria-label={`Remover tema ${theme}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary touch-manipulation"
            >
              Limpar tudo
            </button>
          </div>
        )}

        <div className="flex gap-4 sm:gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
                <h3 className="text-sm font-semibold text-secondary mb-4">Categorias</h3>
                <div className="space-y-2">
                  {flatCategories.map(category => (
                    <label key={category.value} className="flex items-center gap-2.5 cursor-pointer py-1.5 touch-manipulation">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.value)}
                        onChange={() => toggleCategory(category.value)}
                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">{category.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {availableThemes.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
                  <h3 className="text-sm font-semibold text-secondary mb-4">Temas</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableThemes.map((theme) => {
                      const isActive = selectedThemes.includes(theme)
                      return (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => toggleTheme(theme)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition touch-manipulation ${
                            isActive
                              ? 'bg-primary text-white shadow-soft'
                              : 'bg-gray-50 text-gray-700 hover:bg-primary/10'
                          }`}
                        >
                          {theme}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
                <h3 className="text-sm font-semibold text-secondary mb-4">Preço</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={500}
                      value={priceRange[0]}
                      onChange={(e) => {
                        const value = Math.max(0, Number(e.target.value) || 0)
                        setPriceRange([Math.min(value, priceRange[1]), priceRange[1]])
                      }}
                      className="h-9 text-sm"
                      placeholder="Mín"
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
                      className="h-9 text-sm"
                      placeholder="Máx"
                    />
                  </div>
                  <p className="text-xs text-gray-500">€{priceRange[0].toFixed(0)} - €{priceRange[1].toFixed(0)}</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Sort & Results */}
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full sm:w-auto rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary touch-manipulation"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Products Grid */}
            {isError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-left">
                <p className="text-sm font-semibold text-red-600 mb-2">Não foi possível carregar os produtos.</p>
                <Button className="mt-4" variant="outline" onClick={() => refetch()} size="sm">
                  Tentar novamente
                </Button>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {Array.from({ length: limit }).map((_, i) => (
                  <Skeleton key={i} className="h-[280px] sm:h-80 w-full rounded-2xl" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={(p) => addItem(p, 1)}
                    />
                  ))}
                </div>
                {data && data.totalPages > 1 && (
                  <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      className="w-full sm:w-auto h-10 rounded-full touch-manipulation"
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-gray-600">
                      Página {page} de {data.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.totalPages}
                      onClick={() => setPage((current) => Math.min(data.totalPages, current + 1))}
                      className="w-full sm:w-auto h-10 rounded-full touch-manipulation"
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 sm:py-16 text-center">
                <p className="mb-4 text-base sm:text-lg text-gray-600">Nenhum produto encontrado com os filtros selecionados.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    clearFilters()
                    refetch()
                  }}
                  className="rounded-full touch-manipulation"
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
              className="fixed right-0 top-0 z-50 h-full w-[min(360px,85vw)] overflow-y-auto bg-white px-4 sm:px-6 pb-6 pt-6 shadow-2xl lg:hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-secondary">Filtros</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-secondary transition active:scale-95 hover:border-primary/40 hover:text-primary touch-manipulation"
                  aria-label="Fechar filtros"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="text-sm font-semibold text-secondary mb-3">Categorias</h3>
                  <div className="space-y-2">
                    {flatCategories.map(category => (
                      <label key={category.value} className="flex items-center gap-2.5 cursor-pointer py-2 touch-manipulation">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.value)}
                          onChange={() => toggleCategory(category.value)}
                          className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">{category.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Themes */}
                {availableThemes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-secondary mb-3">Temas</h3>
                    <div className="flex flex-wrap gap-2">
                      {availableThemes.map((theme) => {
                        const isActive = selectedThemes.includes(theme)
                        return (
                          <button
                            key={theme}
                            type="button"
                            onClick={() => toggleTheme(theme)}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition touch-manipulation ${
                              isActive
                                ? 'bg-primary text-white shadow-soft'
                                : 'bg-gray-50 text-gray-700 active:bg-primary/10'
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
                  <h3 className="text-sm font-semibold text-secondary mb-3">Preço</h3>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={500}
                        value={priceRange[0]}
                        onChange={(e) => {
                          const value = Math.max(0, Number(e.target.value) || 0)
                          setPriceRange([Math.min(value, priceRange[1]), priceRange[1]])
                        }}
                        className="h-10 text-sm"
                        placeholder="Mín"
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
                        className="h-10 text-sm"
                        placeholder="Máx"
                      />
                    </div>
                    <p className="text-xs text-gray-500">€{priceRange[0].toFixed(0)} - €{priceRange[1].toFixed(0)}</p>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full rounded-full h-11 touch-manipulation"
                  >
                    Aplicar filtros
                  </Button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
