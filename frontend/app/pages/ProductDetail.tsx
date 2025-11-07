import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Star, ShoppingCart, Heart, Share2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@components/Button'
import { ReviewCard } from '@components/ReviewCard'
import { Skeleton } from '@components/ui/skeleton'
import { useCart } from '@hooks/useCart'
import { useSEO } from '@hooks/useSEO'
import { fetchProduct, fetchReviews } from '@lib/api'
import { cn, formatPrice } from '@lib/utils'
import { toast } from 'sonner'

const galleryFallback = [
  'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1545239351-ef35f43d514b?auto=format&fit=crop&w=900&q=80',
]

export function ProductDetail() {
  const { id } = useParams()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addItem } = useCart()

  const productQuery = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: Boolean(id),
  })

  const reviewsQuery = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => fetchReviews(id!, { limit: 8 }),
    enabled: Boolean(id),
  })

  const product = productQuery.data

  useSEO({
    title: product?.name ?? 'Detalhes do produto',
    description: product?.shortDescription ?? product?.description ?? 'Descubra todos os detalhes deste produto exclusivo.',
    ogImage: product?.imageUrl ?? product?.images?.[0],
  })

  const gallery = useMemo(() => {
    if (!product) {
      return galleryFallback
    }

    const unique = new Set<string>()
    if (product.imageUrl) {
      unique.add(product.imageUrl)
    }
    if (product.images?.length) {
      for (const src of product.images) {
        if (src) {
          unique.add(src)
        }
      }
    }

    const items = Array.from(unique)
    return items.length ? items : galleryFallback
  }, [product])

  const handleAddToCart = () => {
    if (!product) return
    addItem(product, quantity)
    toast.success('Produto adicionado ao carrinho')
  }

  const handleShare = async () => {
    if (!product) return
    const shareData = {
      title: product.name,
      text: product.shortDescription || product.description || 'Confira este produto na Leia Sabores',
      url: window.location.href,
    }
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(shareData.url)
      toast.success('Link copiado para a área de transferência')
    }
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-light">
        <div className="container-xl py-24 text-center">
          <h1 className="text-3xl font-bold text-secondary">Produto não encontrado</h1>
          <p className="mt-3 text-gray-600">Verifique o link ou explore o nosso catálogo.</p>
          <Button onClick={() => window.location.href = '/catalogo'} className="mt-6">
            Explorar Catálogo
          </Button>
        </div>
      </div>
    )
  }

  if (productQuery.isLoading) {
    return (
      <div className="min-h-screen bg-light">
        <div className="container-xl py-16">
          <Skeleton className="mb-6 h-8 w-48" />
          <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="h-[420px] w-full rounded-3xl" />
            <div className="space-y-5">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Tratamento de erro melhorado
  if (productQuery.isError || (!product && !productQuery.isLoading)) {
    return (
      <div className="min-h-screen bg-light">
        <div className="container-xl py-12 sm:py-16 md:py-24">
          <div className="mx-auto max-w-md text-center">
            <div className="mb-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary mb-3">
              Produto não encontrado
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              {productQuery.isError
                ? 'Não foi possível carregar o produto. Tente novamente mais tarde.'
                : 'Este produto pode ter sido removido ou não está mais disponível.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/catalogo">
                <Button className="w-full sm:w-auto">
                  Explorar Catálogo
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return null // Loading state já tratado acima
  }

  return (
    <div className="bg-white">
      <article className="container-xl py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="grid gap-6 sm:gap-8 lg:gap-10 lg:grid-cols-[minmax(0,1.1fr)_1fr]">
          <div className="space-y-3 sm:space-y-4">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-100 bg-light shadow-soft">
              <img
                src={gallery[selectedImage]}
                alt={product.name}
                className="h-[300px] sm:h-[420px] md:h-[520px] w-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
              {product.originalPrice && (
                <span className="absolute left-3 top-3 sm:left-6 sm:top-6 rounded-full bg-accent px-3 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white shadow-soft">
                  Oferta especial
                </span>
              )}
              {!product.inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="rounded-full bg-white/90 px-4 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-secondary">
                    Esgotado
                  </span>
                </div>
              )}
            </div>
            <div className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-1 scrollbar-hide sm:grid sm:grid-cols-5 sm:gap-3 sm:px-0 md:gap-4">
              {gallery.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-xl sm:rounded-2xl border-2 flex-shrink-0 min-w-[60px] sm:min-w-0 transition touch-manipulation',
                    selectedImage === index ? 'border-primary shadow-soft' : 'border-transparent'
                  )}
                >
                  <img src={image} alt={`thumbnail ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5 sm:space-y-6 md:space-y-8">
            <div className="space-y-2 sm:space-y-3">
              <Link to={`/catalogo?categoria=${product.category}`} className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.35em] text-primary">
                {product.category}
              </Link>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary leading-tight">{product.name}</h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-0.5 sm:gap-1 text-primary">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      size={14}
                      className={cn(
                        'sm:w-5 sm:h-5',
                        index < Math.round(product.rating ?? 0) ? 'fill-primary text-primary' : 'text-gray-200'
                      )}
                    />
                  ))}
                </div>
                <span>({product.reviewCount ?? 0} avaliações)</span>
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Produção artesanal</span>
                  <span className="xs:hidden">Artesanal</span>
                </span>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl sm:rounded-3xl border border-gray-100 bg-light p-4 sm:p-6">
              <div className="flex items-baseline gap-3 sm:gap-4">
                <span className="text-3xl sm:text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm sm:text-base text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {product.shortDescription || product.description || 'Topo personalizado pronto para elevar o seu bolo.'}
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-gray-500">
                <span className="rounded-full bg-white px-2.5 py-1 sm:px-3">Entrega 24-48h</span>
                <span className="rounded-full bg-white px-2.5 py-1 sm:px-3">Stripe · MBWay</span>
                <span className="rounded-full bg-white px-2.5 py-1 sm:px-3">Personalização</span>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <div className="flex items-center rounded-full border border-gray-200 bg-white w-full sm:w-auto">
                  <button
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    disabled={quantity <= 1}
                    className="h-11 w-11 sm:h-10 sm:w-10 text-lg font-semibold text-secondary transition active:scale-95 hover:bg-light touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    min={1}
                    max={99}
                    onChange={(event) => {
                      const value = Math.max(1, Math.min(99, Number(event.target.value) || 1))
                      setQuantity(value)
                    }}
                    className="h-11 w-16 sm:h-10 sm:w-14 border-x border-gray-200 text-center text-sm font-semibold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    onClick={() => setQuantity((value) => Math.min(99, value + 1))}
                    disabled={quantity >= 99}
                    className="h-11 w-11 sm:h-10 sm:w-10 text-lg font-semibold text-secondary transition active:scale-95 hover:bg-light touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-500">Personalização gratuita com nome e idade.</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  className="flex-1 rounded-full h-11 sm:h-12 text-sm sm:text-base font-semibold touch-manipulation" 
                  size="lg" 
                  onClick={handleAddToCart} 
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> 
                  <span className="hidden xs:inline">Adicionar ao carrinho</span>
                  <span className="xs:hidden">Adicionar</span>
                </Button>
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsWishlisted((value) => !value)}
                    className={cn(
                      'rounded-full border-gray-200 h-11 w-11 sm:h-12 sm:w-12 p-0 touch-manipulation',
                      isWishlisted ? 'border-red-400 bg-red-50 text-red-500' : ''
                    )}
                  >
                    <Heart className={isWishlisted ? 'h-5 w-5 fill-red-500 text-red-500' : 'h-5 w-5'} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={handleShare} 
                    className="rounded-full border-gray-200 h-11 w-11 sm:h-12 sm:w-12 p-0 touch-manipulation"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
              {[
                { title: 'Entrega express', description: 'Portugal continental em 24-48h com tracking em tempo real.' },
                { title: 'Pagamento seguro', description: 'Stripe, Apple Pay, MB Way e referência Multibanco.' },
                { title: 'Garantia Leia Sabores', description: 'Suporte personalizado e satisfação garantida.' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl sm:rounded-2xl border border-gray-100 bg-light p-3 sm:p-4 text-sm text-secondary">
                  <p className="font-semibold text-xs sm:text-sm">{item.title}</p>
                  <p className="mt-1 text-[10px] sm:text-xs text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-10 sm:mt-12 md:mt-16 space-y-4 sm:space-y-6 rounded-2xl sm:rounded-3xl bg-light p-4 sm:p-6 md:p-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-secondary">Avaliações de clientes</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Experiências reais de quem festejou com a Leia Sabores.</p>
            </div>
            <Button variant="outline" className="rounded-full h-9 sm:h-10 text-xs sm:text-sm w-full sm:w-auto touch-manipulation">
              Escrever avaliação
            </Button>
          </div>

          <div className="space-y-6">
            {reviewsQuery.isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-40 w-full rounded-2xl" />
                ))}
              </div>
            ) : reviewsQuery.data?.data?.length ? (
              reviewsQuery.data.data.map((review) => <ReviewCard key={review.id} review={review} />)
            ) : (
              <p className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-gray-500">
                Ainda não existem avaliações para este produto. Seja o primeiro a partilhar a sua experiência!
              </p>
            )}
          </div>
        </motion.section>
      </article>

      <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 p-3 sm:p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] backdrop-blur-lg border-t border-gray-100 md:hidden safe-area-inset-bottom">
        <div className="container-xl flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Total</p>
            <p className="text-lg sm:text-xl font-bold text-secondary">{formatPrice(product.price * quantity)}</p>
          </div>
          <Button 
            className="rounded-full h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold flex-shrink-0 touch-manipulation" 
            size="lg" 
            onClick={handleAddToCart} 
            disabled={!product.inStock}
          >
            <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  )
}
