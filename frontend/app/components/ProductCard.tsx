import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import type { Product } from '@types'
import { Button } from './Button'
import { formatPrice } from '@lib/utils'
import { cn } from '@lib/utils'
import { SafeImage } from './SafeImage'
import { PLACEHOLDER_SVG } from '@lib/image-placeholders'

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
  className?: string
}

export function ProductCard({ product, onAddToCart, className }: ProductCardProps) {

  const imageSources = useMemo(() => {
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
    return Array.from(unique)
  }, [product.imageUrl, product.images])

  const [imgIndex, setImgIndex] = useState(0)
  const [usePlaceholder, setUsePlaceholder] = useState(imageSources.length === 0)
  const [cacheBuster] = useState(() => {
    const fromEnv = import.meta.env.VITE_ASSET_VERSION as string | undefined
    if (fromEnv) {
      return fromEnv
    }
    return import.meta.env.DEV ? String(Date.now()) : undefined
  })

  useEffect(() => {
    setImgIndex(0)
    setUsePlaceholder(imageSources.length === 0)
  }, [imageSources])

  const applyCacheBuster = (src: string) => {
    if (!cacheBuster || !src || src.includes('v=')) {
      return src
    }
    const separator = src.includes('?') ? '&' : '?'
    return `${src}${separator}v=${cacheBuster}`
  }

  const resolvedSrc =
    usePlaceholder || imageSources.length === 0
      ? PLACEHOLDER_SVG
      : applyCacheBuster(imageSources[Math.min(imgIndex, imageSources.length - 1)])

  const primaryTag = product.tags?.find((tag) => tag && tag.length <= 18)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-100 bg-white transition-all duration-300 active:scale-[0.98] sm:hover:-translate-y-1 sm:hover:shadow-xl touch-manipulation',
        className
      )}
    >
      <Link to={`/produto/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-light">
          <SafeImage
            src={resolvedSrc}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 sm:group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={() => {
              setImgIndex((prev) => {
                const next = prev + 1
                if (imageSources.length && next < imageSources.length) return next
                setUsePlaceholder(true)
                return prev
              })
            }}
          />
          {primaryTag && (
            <span className="absolute left-2 top-2 sm:left-4 sm:top-4 rounded-full bg-white/90 px-2 py-0.5 sm:px-4 sm:py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-secondary shadow-sm">
              {primaryTag}
            </span>
          )}
          {product.originalPrice && (
            <span className="absolute right-2 top-2 sm:right-4 sm:top-4 rounded-full bg-accent px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold text-white shadow-sm">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="rounded-full bg-white/90 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-secondary">
                Esgotado
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 sm:gap-3 p-3 sm:p-4 md:p-5">
        <div className="space-y-1.5 sm:space-y-2">
          <Link to={`/produto/${product.id}`} className="block">
            <h3 className="text-sm sm:text-base font-semibold text-secondary transition hover:text-primary line-clamp-2 leading-tight">
              {product.name}
            </h3>
          </Link>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.35em] text-gray-400">{product.category}</p>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
            <div className="flex items-center gap-0.5 text-primary">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={cn(
                    'sm:w-[14px] sm:h-[14px]',
                    i < Math.round(product.rating) ? 'fill-primary text-primary' : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span>({product.reviewCount})</span>
          </div>
        </div>

        <div className="mt-auto space-y-2 sm:space-y-3">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-lg sm:text-2xl font-semibold text-secondary">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs sm:text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <Button
            variant="default"
            size="sm"
            className="w-full rounded-full h-9 sm:h-10 text-xs sm:text-sm font-semibold touch-manipulation"
            disabled={!product.inStock}
            onClick={(event) => {
              event.preventDefault()
              onAddToCart?.(product)
              toast.success('Produto adicionado ao carrinho')
            }}
          >
            <ShoppingCart size={14} className="mr-1.5 sm:mr-2 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Adicionar ao carrinho</span>
            <span className="xs:hidden">Adicionar</span>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
