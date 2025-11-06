import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import type { Product } from '@types'
import { Button } from './Button'
import { formatPrice } from '@lib/utils'
import { cn } from '@lib/utils'

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
  className?: string
}

export function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  const placeholder = 'https://images.unsplash.com/photo-1530023367847-a683933f4177?auto=format&fit=crop&w=800&q=80'

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
      ? placeholder
      : applyCacheBuster(imageSources[Math.min(imgIndex, imageSources.length - 1)])

  const primaryTag = product.tags?.find((tag) => tag && tag.length <= 18)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        className
      )}
    >
      <Link to={`/produto/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-light">
          <motion.img
            src={resolvedSrc}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
            decoding="async"
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
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-secondary shadow-sm">
              {primaryTag}
            </span>
          )}
          {product.originalPrice && (
            <span className="absolute right-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white shadow-sm">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
                Esgotado
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-2">
          <Link to={`/produto/${product.id}`} className="block">
            <h3 className="text-base font-semibold text-secondary transition hover:text-primary line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs uppercase tracking-[0.35em] text-gray-400">{product.category}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-0.5 text-primary">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.round(product.rating) ? 'fill-primary text-primary' : 'text-gray-300'}
                />
              ))}
            </div>
            <span>({product.reviewCount})</span>
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-secondary">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <Button
            variant="default"
            size="sm"
            className="w-full rounded-full"
            disabled={!product.inStock}
            onClick={(event) => {
              event.preventDefault()
              onAddToCart?.(product)
              toast.success('Produto adicionado ao carrinho')
            }}
          >
            <ShoppingCart size={16} className="mr-2" />
            Adicionar ao carrinho
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
