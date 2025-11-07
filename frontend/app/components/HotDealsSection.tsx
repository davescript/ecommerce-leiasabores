import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Flame, ArrowRight } from 'lucide-react'
import { Button } from '@components/Button'
import { ProductCard } from '@components/ProductCard'
import { Skeleton } from '@components/ui/skeleton'
import { fetchProducts } from '@lib/api'
import { useCart } from '@hooks/useCart'

export function HotDealsSection() {
  const { addItem } = useCart()

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'hot-deals'],
    queryFn: () => fetchProducts({ limit: 8, sort: 'novos' }),
  })

  const products = data?.data ?? []

  // Calcular descontos e ordenar por maior desconto
  const hotDeals = products
    .map(product => ({
      ...product,
      discountPercent: product.originalPrice 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0,
    }))
    .filter(p => p.discountPercent > 0)
    .sort((a, b) => b.discountPercent - a.discountPercent)
    .slice(0, 4)

  if (!hotDeals.length && !isLoading) return null

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-accent/20 via-white to-primary/5 py-16">
      {/* Animated background elements */}
      <div className="absolute right-0 top-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-br from-accent/10 to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl" />

      <div className="container-xl space-y-10">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-accent"
            >
              <Flame size={14} className="animate-bounce" />
              Ofertas imperdíveis
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold text-secondary sm:text-4xl"
            >
              Hot Deals desta semana
            </motion.h2>
            <p className="text-sm text-gray-600 sm:text-base">
              Descontos especiais em seleção de produtos premium. Compre agora antes de esgotar!
            </p>
          </div>

          <Link to="/catalogo" className="shrink-0">
            <Button variant="outline" className="gap-2">
              Ver todos <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {hotDeals.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Discount Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="absolute right-3 top-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-accent to-accent/80 shadow-lg"
                >
                  <span className="text-center">
                    <span className="block text-xs font-bold text-white">
                      -{product.discountPercent}%
                    </span>
                  </span>
                </motion.div>

                <ProductCard
                  product={product}
                  onAddToCart={(p) => addItem(p, 1)}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/5 to-accent/5 p-8 text-center"
        >
          <h3 className="mb-3 text-xl font-semibold text-secondary">
            Quer receber alertas de novas ofertas?
          </h3>
          <p className="mb-6 text-sm text-gray-600">
            Inscreva-se na nossa newsletter e receba descontos exclusivos direto no seu email.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <input
              type="email"
              placeholder="seu@email.com"
              className="rounded-full border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button className="px-6">Inscrever-se</Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}