import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetFooter } from '@components/ui/sheet'
import { Button } from '@components/ui/button'
import { ScrollArea } from '@components/ui/scroll-area'
import { Separator } from '@components/ui/separator'
import { useCart } from '@hooks/useCart'
import { formatPrice } from '@lib/utils'

interface CartDrawerProps {
  children: React.ReactNode
}

export function CartDrawer({ children }: CartDrawerProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const { items, subtotal, tax, shipping, total, removeItem, updateQuantity } = useCart()

  const closeSheet = () => {
    setOpen(false)
  }

  const emptyState = (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-light text-primary">
        <ShoppingCart className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-secondary">Seu carrinho está vazio</h3>
      <p className="mt-2 text-sm text-gray-500">Explore nossos produtos e adicione itens incríveis para a sua festa.</p>
      <Link to="/catalogo" className="mt-6 w-full">
        <Button className="w-full">Ver catálogo</Button>
      </Link>
    </div>
  )

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children}
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent ref={contentRef}>
        <div className="flex h-full flex-col">
          {items.length === 0 ? (
            emptyState
          ) : (
            <>
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-5">
                  {items.map(item => (
                    <div
                      key={item.productId}
                      className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                    >
                      <div className="h-20 w-20 overflow-hidden rounded-lg bg-light">
                        <img
                          src={item.product?.imageUrl || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=400&q=80'}
                          alt={item.product?.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <span className="block text-sm font-semibold text-secondary line-clamp-2">
                          {item.product?.name}
                        </span>
                        <p className="text-xs text-gray-500">{item.product?.category}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-gray-200">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="flex h-8 w-8 items-center justify-center text-secondary transition hover:bg-light"
                              aria-label="Diminuir quantidade"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-10 text-center text-sm font-semibold text-secondary">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center text-secondary transition hover:bg-light"
                              aria-label="Aumentar quantidade"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-right text-sm font-semibold text-secondary">
                            {formatPrice((item.product?.price || 0) * item.quantity)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        aria-label="Remover produto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <SheetFooter>
                <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-secondary">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Impostos</span>
                    <span className="font-semibold text-secondary">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Entrega</span>
                    <span className="font-semibold text-secondary">{shipping === 0 ? 'Grátis' : formatPrice(shipping)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-base font-semibold text-secondary">
                    <span>Total</span>
                    <span className="text-xl text-primary">{formatPrice(total)}</span>
                  </div>
                  <Link to="/carrinho" onClick={closeSheet}>
                    <Button className="w-full">Ver carrinho completo</Button>
                  </Link>
                  <Link to="/checkout" onClick={closeSheet}>
                    <Button variant="default" className="w-full">Finalizar compra</Button>
                  </Link>
                </div>
              </SheetFooter>
            </>
          )}
        </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
