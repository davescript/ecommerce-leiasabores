import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from '@components/Button'
import { useCartStore } from '@hooks/useCart'
import type { CartItem } from '@types'
import { useSEO } from '@hooks/useSEO'
import { formatPrice } from '@lib/utils'
import { PLACEHOLDER_SVG } from '@lib/image-placeholders'

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
      <div className="flex min-h-screen items-center justify-center bg-light px-4">
        <div className="text-center max-w-md">
          <ShoppingBag size={48} className="mx-auto mb-4 text-gray-400 sm:w-16 sm:h-16" />
          <h2 className="mb-2 text-xl sm:text-2xl font-bold text-secondary">O seu carrinho está vazio</h2>
          <p className="mb-6 sm:mb-8 text-sm sm:text-base text-gray-600">Adicione topos, bolos ou doces para começar a festa.</p>
          <Link to="/catalogo">
            <Button size="lg" className="rounded-full h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base touch-manipulation">
              Explorar catálogo
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const firstImage = (item: CartItem) => item.product?.imageUrl || item.product?.images?.[0] || PLACEHOLDER_SVG

  return (
    <div className="bg-white pb-20 sm:pb-0">
      <section className="container-xl space-y-4 sm:space-y-6 md:space-y-8 py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] sm:tracking-[0.35em] text-primary">Resumo da encomenda</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary leading-tight">O seu carrinho</h1>
          </div>
          <Link to="/catalogo" className="text-xs sm:text-sm font-semibold text-primary hover:underline touch-manipulation">
            Continuar a comprar
          </Link>
        </div>

        {hasInvalidItems && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-red-200 bg-red-50 p-3 sm:p-4 text-xs sm:text-sm text-red-600"
          >
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold mb-1.5 sm:mb-2 leading-tight">
                Carrinho contém {invalidItems.length} produto(s) inválido(s)
              </p>
              <p className="text-[10px] sm:text-xs mb-2 sm:mb-3 break-all">
                IDs: {invalidItems.map((item) => item.productId).join(', ')}
              </p>
              <Button
                onClick={() => clearCart()}
                size="sm"
                variant="ghost"
                className="text-red-600 hover:bg-red-100 hover:text-red-700 h-8 sm:h-9 text-xs touch-manipulation"
              >
                Limpar carrinho
              </Button>
            </div>
          </motion.div>
        )}

        <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            {items.map((item: CartItem, index: number) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="flex flex-col gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl border border-gray-100 bg-light/80 p-3 sm:p-4 md:p-6 shadow-sm"
              >
                <div className="flex gap-3 sm:gap-4">
                  <div className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 flex-shrink-0 overflow-hidden rounded-xl sm:rounded-2xl bg-white">
                    <img
                      src={firstImage(item)}
                      alt={item.product?.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-2 sm:gap-3 min-w-0">
                    <div className="space-y-1 sm:space-y-2 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-secondary line-clamp-2 leading-tight">{item.product?.name}</h3>
                      <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-gray-400">{item.product?.category}</p>
                      <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">Personalização incluída · Atualize no checkout.</p>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                      <div className="flex items-center rounded-full border border-gray-200 bg-white">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="h-9 w-9 sm:h-10 sm:w-10 text-base font-semibold text-secondary transition active:scale-95 hover:bg-light touch-manipulation"
                          aria-label="Diminuir"
                        >
                          <Minus size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <span className="min-w-[40px] sm:min-w-[48px] text-center text-xs sm:text-sm font-semibold text-secondary">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="h-9 w-9 sm:h-10 sm:w-10 text-base font-semibold text-secondary transition active:scale-95 hover:bg-light touch-manipulation"
                          aria-label="Aumentar"
                        >
                          <Plus size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      </div>
                      <p className="text-base sm:text-lg font-semibold text-secondary">
                        {formatPrice((item.product?.price || 0) * item.quantity)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="self-start rounded-full border border-transparent p-2 text-gray-400 transition active:scale-95 hover:border-red-100 hover:bg-red-50 hover:text-red-500 touch-manipulation flex-shrink-0"
                    aria-label="Remover item"
                  >
                    <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              </motion.div>
            ))}

            <div className="-mx-2 flex gap-2 sm:gap-3 overflow-x-auto px-2 pb-2 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible">
              {trustBadges.map((badge) => (
                <div key={badge.text} className="min-w-[160px] sm:min-w-0 rounded-xl sm:rounded-2xl border border-gray-100 bg-white p-3 sm:p-4 text-center shadow-sm">
                  <p className="text-xl sm:text-2xl">{badge.icon}</p>
                  <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-secondary leading-tight">{badge.text}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="lg:sticky lg:top-8 h-fit">
            <div className="rounded-2xl sm:rounded-3xl border border-gray-100 bg-light/80 p-4 sm:p-5 md:p-6 shadow-soft">
              <h2 className="text-lg sm:text-xl font-semibold text-secondary">Resumo</h2>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">Revise os valores antes de finalizar.</p>

              <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 border-b border-gray-200 pb-4 sm:pb-6 text-xs sm:text-sm text-gray-600">
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

              <div className="mt-4 sm:mt-6 flex items-center justify-between">
                <span className="text-base sm:text-lg font-semibold text-secondary">Total</span>
                <span className="text-xl sm:text-2xl font-bold text-primary">{formatPrice(total)}</span>
              </div>

              <Link to="/checkout" className="mt-4 sm:mt-6 block">
                <Button variant="default" size="lg" className="w-full rounded-full h-11 sm:h-12 text-sm sm:text-base font-semibold touch-manipulation">
                  Finalizar encomenda <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link to="/catalogo" className="mt-2 sm:mt-3 block">
                <Button variant="ghost" className="w-full rounded-full h-10 sm:h-11 text-xs sm:text-sm touch-manipulation">
                  Acrescentar mais produtos
                </Button>
              </Link>

              <div className="mt-6 sm:mt-8 space-y-1.5 sm:space-y-2 rounded-xl sm:rounded-2xl bg-white/70 p-3 sm:p-4 text-[10px] sm:text-xs text-gray-500">
                <p>✦ Portes grátis acima de 39€.</p>
                <p>✦ Personalização após confirmação.</p>
                <p>✦ Suporte via WhatsApp.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 p-3 sm:p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] backdrop-blur-lg border-t border-gray-100 lg:hidden safe-area-inset-bottom">
        <div className="container-xl flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Total</p>
            <p className="text-lg sm:text-xl font-bold text-secondary">{formatPrice(total)}</p>
          </div>
          <Link to="/checkout" className="flex-shrink-0">
            <Button 
              className="rounded-full h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold touch-manipulation" 
              size="lg"
            >
              Finalizar <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
