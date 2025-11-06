import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, ArrowLeft, CreditCard, ShieldCheck, Truck, Sparkles } from 'lucide-react'
import { Button } from '@components/Button'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import { useCart } from '@hooks/useCart'
import { useSEO } from '@hooks/useSEO'
import { createCheckoutSession, type CheckoutPayload, type CheckoutResponse } from '@lib/api'
import { cn, formatPrice } from '@lib/utils'
import type { Address } from '@types'
import { toast } from 'sonner'

const steps = [
  { id: 'shipping', label: 'Entrega', description: 'Morada de envio' },
  { id: 'payment', label: 'Pagamento', description: 'Métodos seguros' },
] as const

type Step = (typeof steps)[number]['id']

export function Checkout() {
  const { items, subtotal, tax, shipping, total } = useCart()
  const [step, setStep] = useState<Step>('shipping')
  const [error, setError] = useState<string | null>(null)
  const [sameAsShipping, setSameAsShipping] = useState(true)

  const [shippingAddress, setShippingAddress] = useState<Address>({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Portugal',
  })

  const [billingAddress, setBillingAddress] = useState<Address>({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Portugal',
  })

  useSEO({
    title: 'Checkout · Leia Sabores',
    description: 'Finalize a sua encomenda com pagamentos Stripe, MBWay ou Apple Pay e entrega express em Portugal.',
    robots: 'noindex, nofollow',
  })

  const checkoutMutation = useMutation<CheckoutResponse, Error, CheckoutPayload>({
    mutationFn: createCheckoutSession,
  })

  useEffect(() => {
    if (sameAsShipping) {
      setBillingAddress({ ...shippingAddress })
    }
  }, [sameAsShipping, shippingAddress])

  if (!items.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-light px-4">
        <div className="max-w-md rounded-3xl bg-white px-10 py-12 text-center shadow-soft">
          <Sparkles size={36} className="mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold text-secondary">O seu carrinho está vazio</h2>
          <p className="mt-2 text-sm text-gray-600">Adicione produtos personalizados antes de avançar para o checkout.</p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/catalogo">Explorar catálogo</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleShippingSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!shippingAddress.name || !shippingAddress.email || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      setError('Preencha todos os campos obrigatórios marcados com *')
      return
    }
    setError(null)
    if (sameAsShipping) {
      setBillingAddress(shippingAddress)
    }
    setStep('payment')
  }

  const handlePaymentSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    try {
      const payload = {
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        email: shippingAddress.email,
      }

      const response = await checkoutMutation.mutateAsync(payload)
      if (!response.checkoutUrl) {
        throw new Error('Não foi possível criar a sessão de pagamento')
      }
      window.location.href = response.checkoutUrl
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível processar o pagamento'
      setError(message)
      toast.error(message)
    }
  }

  const Summary = (
    <div className="space-y-5 rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-soft">
      <h2 className="text-lg font-semibold text-secondary">Resumo da encomenda</h2>
      <div className="space-y-3 text-sm text-gray-600">
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
          <span className="font-semibold text-secondary">{shipping === 0 ? 'Grátis' : formatPrice(shipping)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-2xl bg-light p-4">
        <span className="text-base font-semibold text-secondary">Total</span>
        <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
      </div>
      <div className="space-y-2 text-xs text-gray-500">
        <p>✦ Portes grátis acima de 39€ · Entrega em 24-48h.</p>
        <p>✦ Pagamentos Stripe, MBWay, Apple Pay e referência MB.</p>
      </div>
    </div>
  )

  return (
    <div className="bg-light py-8 sm:py-12">
      <div className="container-xl space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Checkout seguro</p>
            <h1 className="text-3xl font-bold text-secondary sm:text-4xl">Finalize a sua celebração</h1>
          </div>
          <Link to="/carrinho" className="text-sm font-semibold text-primary hover:underline">
            <span className="inline-flex items-center gap-2">
              <ArrowLeft size={16} />
              Voltar ao carrinho
            </span>
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 sm:gap-6">
          {steps.map((item, index) => {
            const currentIndex = steps.findIndex((s) => s.id === step)
            const state = item.id === step ? 'current' : index < currentIndex ? 'done' : 'pending'
            return (
              <div
                key={item.id}
                className={cn(
                  'min-w-[200px] rounded-3xl border px-4 py-3 transition',
                  state === 'current' && 'border-primary bg-white shadow-soft',
                  state === 'done' && 'border-green-200 bg-green-50 text-green-700',
                  state === 'pending' && 'border-gray-100 bg-white/70 text-gray-500'
                )}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em]">{item.label}</p>
                <p className="text-sm">{item.description}</p>
              </div>
            )
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_400px]">
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {step === 'shipping' && (
                <motion.form
                  key="shipping"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  id="checkout-shipping-form"
                  onSubmit={handleShippingSubmit}
                  className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-soft"
                >
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-secondary">Morada de entrega</h2>
                    <p className="text-sm text-gray-500">
                      Preencha a morada onde iremos entregar o seu pedido. Produzimos em Lisboa e entregamos em todo Portugal.
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      required
                      placeholder="Nome completo *"
                      value={shippingAddress.name}
                      onChange={(event) => setShippingAddress({ ...shippingAddress, name: event.target.value })}
                    />
                    <Input
                      required
                      type="email"
                      placeholder="Email *"
                      value={shippingAddress.email}
                      onChange={(event) => setShippingAddress({ ...shippingAddress, email: event.target.value })}
                    />
                  </div>

                  <Input
                    type="tel"
                    placeholder="Telefone"
                    value={shippingAddress.phone}
                    onChange={(event) => setShippingAddress({ ...shippingAddress, phone: event.target.value })}
                  />

                  <Textarea
                    required
                    placeholder="Morada completa *"
                    value={shippingAddress.street}
                    onChange={(event) => setShippingAddress({ ...shippingAddress, street: event.target.value })}
                    rows={3}
                  />

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                      required
                      placeholder="Cidade *"
                      value={shippingAddress.city}
                      onChange={(event) => setShippingAddress({ ...shippingAddress, city: event.target.value })}
                    />
                    <Input
                      placeholder="Distrito"
                      value={shippingAddress.state}
                      onChange={(event) => setShippingAddress({ ...shippingAddress, state: event.target.value })}
                    />
                    <Input
                      required
                      placeholder="Código Postal *"
                      value={shippingAddress.zipCode}
                      onChange={(event) => setShippingAddress({ ...shippingAddress, zipCode: event.target.value })}
                    />
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-secondary">
                    <Truck className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">Entrega express</p>
                      <p className="text-xs text-gray-600">Envio em 24-48h após confirmação. Portes grátis acima de 39€.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-3 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={sameAsShipping}
                        onChange={(event) => setSameAsShipping(event.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      Utilizar a mesma morada para faturação
                    </label>
                    <Button type="submit" className="rounded-full">
                      Continuar para pagamento
                    </Button>
                  </div>
                </motion.form>
              )}

              {step === 'payment' && (
                <motion.form
                  key="payment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  id="checkout-payment-form"
                  onSubmit={handlePaymentSubmit}
                  className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-soft"
                >
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-secondary">Pagamento seguro</h2>
                    <p className="text-sm text-gray-500">
                      Cartão, MBWay, Apple Pay ou referência multibanco através da Stripe. Dados protegidos por encriptação TLS.
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {!sameAsShipping && (
                    <div className="rounded-2xl border border-gray-100 bg-light/80 p-4 text-sm text-secondary">
                      <p className="mb-3 font-semibold">Morada de faturação</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          required
                          placeholder="Nome completo *"
                          value={billingAddress.name}
                          onChange={(event) => setBillingAddress({ ...billingAddress, name: event.target.value })}
                        />
                        <Input
                          required
                          type="email"
                          placeholder="Email *"
                          value={billingAddress.email}
                          onChange={(event) => setBillingAddress({ ...billingAddress, email: event.target.value })}
                        />
                        <Input
                          placeholder="Telefone"
                          value={billingAddress.phone}
                          onChange={(event) => setBillingAddress({ ...billingAddress, phone: event.target.value })}
                        />
                        <Input
                          placeholder="Código Postal"
                          value={billingAddress.zipCode}
                          onChange={(event) => setBillingAddress({ ...billingAddress, zipCode: event.target.value })}
                        />
                        <Textarea
                          required
                          placeholder="Morada completa *"
                          value={billingAddress.street}
                          onChange={(event) => setBillingAddress({ ...billingAddress, street: event.target.value })}
                          rows={3}
                          className="sm:col-span-2"
                        />
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-secondary">
                    <div className="flex items-center gap-3 text-primary">
                      <ShieldCheck size={18} />
                      <p className="font-semibold">Pagamento protegido pela Stripe</p>
                    </div>
                    <p className="mt-2 text-xs text-gray-600">
                      Ao continuar será encaminhado para a Stripe para concluir o pagamento. Receberá confirmação imediata por email.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full border-gray-300 text-gray-600"
                      onClick={() => setStep('shipping')}
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 rounded-full"
                      disabled={checkoutMutation.isPending}
                    >
                      {checkoutMutation.isPending ? 'A preparar checkout...' : 'Pagar com Stripe'}
                      <CreditCard className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="grid gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-soft sm:grid-cols-3">
              {[
                { icon: Truck, title: 'Envio expresso', description: 'Produção em Lisboa com entregas 24-48h em Portugal.' },
                { icon: ShieldCheck, title: 'Compra protegida', description: 'SSL, Stripe e suporte personalizado em todas as etapas.' },
                { icon: Sparkles, title: 'Personalização premium', description: 'Equipa criativa acompanha o projeto até a entrega.' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl bg-light/70 p-4 text-sm text-secondary">
                  <item.icon className="mb-3 h-6 w-6 text-primary" />
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-8">{Summary}</div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-4 backdrop-blur sm:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-semibold text-secondary">{formatPrice(total)}</p>
          </div>
          {step === 'shipping' && (
            <Button type="submit" form="checkout-shipping-form" className="rounded-full">
              Continuar
            </Button>
          )}
          {step === 'payment' && (
            <Button
              type="submit"
              form="checkout-payment-form"
              className="rounded-full"
              disabled={checkoutMutation.isPending}
            >
              {checkoutMutation.isPending ? 'A preparar...' : 'Concluir pagamento'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
