import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Star, ShoppingCart, Heart, Share2, CheckCircle2 } from 'lucide-react'
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

  if (!product) {
    return (
      <div className="min-h-screen bg-light">
        <div className="container-xl py-24 text-center">
          <h1 className="text-3xl font-bold text-secondary">Produto indisponível</h1>
          <p className="mt-3 text-gray-600">Este item pode ter sido removido ou estar esgotado.</p>
          <Button onClick={() => window.location.href = '/catalogo'} className="mt-6">
            Ver outros produtos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <article className="container-xl py-8 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_1fr]">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="relative overflow-hidden rounded-[32px] border border-gray-100 bg-light shadow-soft">
              <img
                src={gallery[selectedImage]}
                alt={product.name}
                className="h-[420px] w-full object-cover sm:h-[520px]"
                loading="lazy"
              />
              {product.originalPrice && (
                <span className="absolute left-6 top-6 rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-soft">
                  Oferta especial
                </span>
              )}
              {!product.inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="rounded-full bg-white/90 px-6 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-secondary">
                    Esgotado
                  </span>
                </div>
              )}
            </div>
            <div className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-1 sm:grid sm:grid-cols-5 sm:gap-4 sm:px-0">
              {gallery.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-2xl border',
                    selectedImage === index ? 'border-primary shadow-soft' : 'border-transparent'
                  )}
                >
                  <img src={image} alt={`thumbnail ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="space-y-3">
              <Link to={`/catalogo?categoria=${product.category}`} className="inline-block text-xs uppercase tracking-[0.35em] text-primary">
                {product.category}
              </Link>
              <h1 className="text-3xl font-bold text-secondary sm:text-4xl">{product.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1 text-primary">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={index < Math.round(product.rating ?? 0) ? 'h-5 w-5 fill-primary text-primary' : 'h-5 w-5 text-gray-200'}
                    />
                  ))}
                </div>
                <span>({product.reviewCount ?? 0} avaliações)</span>
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 size={16} />
                  Produção artesanal
                </span>
              </div>
            </div>

            <div className="space-y-3 rounded-3xl border border-gray-100 bg-light p-6">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-base text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {product.shortDescription || product.description || 'Topo personalizado pronto para elevar o seu bolo.'}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
                <span className="rounded-full bg-white px-3 py-1">Entrega 24-48h</span>
                <span className="rounded-full bg-white px-3 py-1">Pagamentos Stripe · MBWay</span>
                <span className="rounded-full bg-white px-3 py-1">Personalização incluída</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-full border border-gray-200 bg-white">
                  <button
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    className="h-10 w-10 text-lg font-semibold text-secondary transition hover:bg-light"
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    min={1}
                    onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
                    className="h-10 w-14 border-x border-gray-200 text-center text-sm font-semibold text-secondary focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity((value) => value + 1)}
                    className="h-10 w-10 text-lg font-semibold text-secondary transition hover:bg-light"
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-500">Personalização gratuita com nome e idade.</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button className="flex-1 rounded-full" size="lg" onClick={handleAddToCart} disabled={!product.inStock}>
                  <ShoppingCart className="mr-2 h-5 w-5" /> Adicionar ao carrinho
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsWishlisted((value) => !value)}
                  className={cn(
                    'rounded-full border-gray-200',
                    isWishlisted ? 'border-red-400 bg-red-50 text-red-500' : ''
                  )}
                >
                  <Heart className={isWishlisted ? 'h-5 w-5 fill-red-500 text-red-500' : 'h-5 w-5'} />
                </Button>
                <Button variant="outline" size="lg" onClick={handleShare} className="rounded-full border-gray-200">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { title: 'Entrega express', description: 'Portugal continental em 24-48h com tracking em tempo real.' },
                { title: 'Pagamento seguro', description: 'Stripe, Apple Pay, MB Way e referência Multibanco.' },
                { title: 'Garantia Leia Sabores', description: 'Suporte personalizado e satisfação garantida.' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-gray-100 bg-light p-4 text-sm text-secondary">
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 space-y-6 rounded-3xl bg-light p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-secondary">Avaliações de clientes</h2>
              <p className="text-sm text-gray-500">Experiências reais de quem festejou com a Leia Sabores.</p>
            </div>
            <Button variant="outline" className="rounded-full">
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

      <div className="fixed inset-x-0 bottom-0 z-40 bg-white/80 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-semibold text-secondary">{formatPrice(product.price * quantity)}</p>
          </div>
          <Button className="rounded-full" size="lg" onClick={handleAddToCart} disabled={!product.inStock}>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  )
}
