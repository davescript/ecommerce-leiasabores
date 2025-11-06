import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from '@components/Button'
import { useCartStore } from '@hooks/useCart'
import type { CartItem } from '@types'
import { useSEO } from '@hooks/useSEO'
import { formatPrice } from '@lib/utils'

// Valid UUID v4 pattern - used to validate product IDs
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const isValidProductId = (id: string): boolean => {
  return UUID_PATTERN.test(id)
}

const trustBadges = [
  { text: 'Entrega express em Portugal', icon: '🚚' },
  { text: 'Pagamentos seguros Stripe', icon: '🔐' },
  { text: '+5 000 festas felizes', icon: '✨' },
]

export function Cart() {
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const subtotal = useCartStore((state) => state.subtotal)
  const tax = useCartStore((state) => state.tax)
  const shipping = useCartStore((state) => state.shipping)
  const total = useCartStore((state) => state.total)

  useSEO({
    title: 'Carrinho · Leia Sabores',
    description: 'Revise os seus produtos personalizados antes de concluir a encomenda com pagamento seguro Stripe.',
  })

  // Check for invalid product IDs
  const invalidItems = items.filter((item) => !isValidProductId(item.productId))
  const hasInvalidItems = invalidItems.length > 0

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-light">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="mb-2 text-2xl font-bold text-secondary">O seu carrinho está vazio</h2>
          <p className="mb-8 text-gray-600">Adicione topos, bolos ou doces para começar a festa.</p>
          <Link to="/catalogo">
            <Button size="lg" className="rounded-full">
              Explorar catálogo
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const firstImage = (item: CartItem) => item.product?.imageUrl || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=400&q=80'

  return (
    <div className="bg-white">
      <section className="container-xl space-y-8 py-8 sm:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Resumo da encomenda</p>
            <h1 className="text-3xl font-bold text-secondary sm:text-4xl">O seu carrinho</h1>
          </div>
          <Link to="/catalogo" className="text-sm font-semibold text-primary hover:underline">
            Continuar a comprar
          </Link>
        </div>

        {hasInvalidItems && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-2">
                Carrinho contém {invalidItems.length} produto(s) inválido(s) e não pode ser processado
              </p>
              <p className="text-xs mb-3">
                IDs inválidos: {invalidItems.map((item) => item.productId).join(', ')}
              </p>
              <Button
                onClick={() => clearCart()}
                size="sm"
                variant="ghost"
                className="text-red-600 hover:bg-red-100 hover:text-red-700"
              >
                Limpar carrinho e começar de novo
              </Button>
            </div>
          </motion.div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            {items.map((item: CartItem, index: number) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-light/80 p-4 shadow-sm sm:flex-row sm:p-6"
              >
                <div className="h-32 w-full overflow-hidden rounded-2xl bg-white sm:h-32 sm:w-32">
                  <img
                    src={firstImage(item)}
                    alt={item.product?.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-secondary">{item.product?.name}</h3>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{item.product?.category}</p>
                    <p className="text-sm text-gray-500">Personalização incluída · Atualize o nome e idade no checkout.</p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center rounded-full border border-gray-200 bg-white">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="h-10 w-10 text-base font-semibold text-secondary transition hover:bg-light"
                        aria-label="Diminuir"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="min-w-[48px] text-center text-sm font-semibold text-secondary">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="h-10 w-10 text-base font-semibold text-secondary transition hover:bg-light"
                        aria-label="Aumentar"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="text-lg font-semibold text-secondary">
                      {formatPrice((item.product?.price || 0) * item.quantity)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="self-start rounded-full border border-transparent p-2 text-gray-400 transition hover:border-red-100 hover:bg-red-50 hover:text-red-500"
                  aria-label="Remover item"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}

            <div className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible">
              {trustBadges.map((badge) => (
                <div key={badge.text} className="min-w-[220px] rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm">
                  <p className="text-2xl">{badge.icon}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-secondary">{badge.text}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-fit rounded-3xl border border-gray-100 bg-light/80 p-6 shadow-soft lg:sticky lg:top-8"
          >
            <h2 className="text-xl font-semibold text-secondary">Resumo</h2>
            <p className="mt-1 text-sm text-gray-500">Revise os valores antes de finalizar o pagamento seguro.</p>

            <div className="mt-6 space-y-4 border-b border-gray-200 pb-6 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-secondary">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (23%)</span>
                <span className="font-semibold text-secondary">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Entrega</span>
                <span className="font-semibold text-secondary">
                  {shipping === 0 ? 'Grátis' : formatPrice(shipping)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-lg font-semibold text-secondary">Total</span>
              <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
            </div>

            <Link to="/checkout" className="mt-6 block">
              <Button variant="default" size="lg" className="w-full rounded-full">
                Finalizar encomenda <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/catalogo" className="mt-3 block">
              <Button variant="ghost" className="w-full rounded-full">
                Acrescentar mais produtos
              </Button>
            </Link>

            <div className="mt-8 space-y-2 rounded-2xl bg-white/70 p-4 text-xs text-gray-500">
              <p>✦ Portes grátis para encomendas acima de 39€.</p>
              <p>✦ Ajuste de personalização realizado após confirmação do pagamento.</p>
              <p>✦ Suporte disponível via WhatsApp para qualquer dúvida.</p>
            </div>
          </motion.aside>
        </div>
      </section>
    </div>
  )
}
