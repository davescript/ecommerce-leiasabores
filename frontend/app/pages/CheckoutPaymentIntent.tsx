/**
 * Checkout profissional com Payment Intents e Stripe Elements
 * Suporta: Cartão, Apple Pay, Google Pay, MB Way, PayPal, Klarna, Multibanco
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, ArrowLeft, ShieldCheck, Truck, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@components/Button'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import { StripePayment } from '@components/StripePayment'
import { useCart } from '@hooks/useCart'
import { useSEO } from '@hooks/useSEO'
import { createPaymentIntent, confirmPaymentIntent, type PaymentIntentCreatePayload } from '@lib/api'
import { logger } from '@lib/logger'
import { sanitizePhone, isValidPortuguesePhone } from '@lib/phone-utils'
import { cn, formatPrice } from '@lib/utils'
import type { Address } from '@types'
import { toast } from 'sonner'

const steps = [
  { id: 'shipping', label: 'Entrega', description: 'Morada de envio' },
  { id: 'payment', label: 'Pagamento', description: 'Métodos seguros' },
] as const

type Step = (typeof steps)[number]['id']

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const isValidProductId = (id: string): boolean => {
  return UUID_PATTERN.test(id)
}

export function CheckoutPaymentIntent() {
  const navigate = useNavigate()
  const { items, subtotal, tax, shipping, total, clearCart } = useCart()
  const [step, setStep] = useState<Step>('shipping')
  const [error, setError] = useState<string | null>(null)
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)

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

  const [, setBillingAddress] = useState<Address>({
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
    description: 'Finalize a sua encomenda com pagamentos Stripe, MBWay, Apple Pay, Google Pay e mais métodos seguros.',
    robots: 'noindex, nofollow',
  })

  const paymentIntentMutation = useMutation({
    mutationFn: createPaymentIntent,
  })

  const confirmPaymentMutation = useMutation({
    mutationFn: confirmPaymentIntent,
  })

  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (sameAsShipping) {
      setBillingAddress({ ...shippingAddress })
    }
  }, [sameAsShipping, shippingAddress])

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-light px-4">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-gray-500">A carregar o seu carrinho...</p>
        </div>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-light px-4">
        <div className="max-w-md rounded-3xl bg-white px-10 py-12 text-center shadow-soft">
          <Sparkles size={36} className="mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold text-secondary">O seu carrinho está vazio</h2>
          <p className="mt-2 text-sm text-gray-600">Adicione produtos personalizados antes de avançar para o checkout.</p>
          <Button onClick={() => navigate('/catalogo')} className="mt-6 rounded-full">
            Explorar catálogo
          </Button>
        </div>
      </div>
    )
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePostalCode = (zipCode: string): boolean => {
    const ptZipCodeRegex = /^\d{4}-\d{3}$/
    return ptZipCodeRegex.test(zipCode) || zipCode.length >= 4
  }

  const handleShippingSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    // Validações obrigatórias
    if (!shippingAddress.name?.trim()) {
      setError('Nome completo é obrigatório *')
      return
    }

    if (!shippingAddress.email?.trim()) {
      setError('Email é obrigatório *')
      return
    }

    if (!validateEmail(shippingAddress.email)) {
      setError('Email inválido. Verifique o formato (ex: seu.email@dominio.com)')
      return
    }

    if (!shippingAddress.street?.trim()) {
      setError('Morada é obrigatória *')
      return
    }

    if (!shippingAddress.city?.trim()) {
      setError('Cidade é obrigatória *')
      return
    }

    if (!shippingAddress.zipCode?.trim()) {
      setError('Código postal é obrigatório *')
      return
    }

    if (!validatePostalCode(shippingAddress.zipCode)) {
      setError('Código postal inválido. Use o formato: 1234-567 ou similares')
      return
    }

    if (shippingAddress.name.length < 3) {
      setError('Nome deve ter pelo menos 3 caracteres')
      return
    }

    // Validar telefone se fornecido (opcional mas deve ser válido se preenchido)
    if (shippingAddress.phone && shippingAddress.phone.trim()) {
      const sanitized = sanitizePhone(shippingAddress.phone)
      if (!isValidPortuguesePhone(sanitized)) {
        setError('Telefone inválido. Use formato: +351 912 345 678 ou 912 345 678')
        return
      }
      // Atualizar com telefone sanitizado
      setShippingAddress({ ...shippingAddress, phone: sanitized })
    }

    // Validar product IDs
    const invalidItems = items.filter((item) => !isValidProductId(item.productId))
    if (invalidItems.length > 0) {
      setError('Carrinho contém produtos inválidos. Limpe o carrinho e adicione novos produtos.')
      return
    }

    if (total <= 0) {
      setError('Total inválido. Contacte suporte')
      return
    }

    setError(null)
    if (sameAsShipping) {
      setBillingAddress({ ...shippingAddress })
    }

    // Criar Payment Intent ao avançar para pagamento
    setIsCreatingPayment(true)
    try {
      const payload: PaymentIntentCreatePayload = {
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingAddress,
        email: shippingAddress.email,
      }

      toast.loading('A preparar pagamento...', { duration: 2000 })

      const response = await paymentIntentMutation.mutateAsync(payload)
      setClientSecret(response.clientSecret)
      setStep('payment')
      toast.success('Pagamento pronto!', {
        description: 'Preencha os dados de pagamento abaixo.',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar sessão de pagamento'
      setError(errorMessage)
      toast.error('Erro ao preparar pagamento', {
        description: errorMessage,
      })
    } finally {
      setIsCreatingPayment(false)
    }
  }

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      const result = await confirmPaymentMutation.mutateAsync({ paymentIntentId })

      if (result.success && result.orderId) {
        clearCart()
        navigate(`/sucesso?orderId=${result.orderId}`)
      } else {
        // Pagamento confirmado mas sem ordem criada ainda (webhook vai criar)
        clearCart()
        navigate(`/sucesso?paymentIntentId=${paymentIntentId}`)
      }
    } catch (err) {
      logger.error('Erro ao confirmar pagamento:', err)
      // Mesmo assim, redirecionar para sucesso se o pagamento foi bem-sucedido
      clearCart()
      navigate(`/sucesso?paymentIntentId=${paymentIntentId}`)
    }
  }

  const handlePaymentError = (error: string) => {
    setError(error)
  }

  const Summary = (
    <div className="space-y-4 sm:space-y-5 rounded-2xl sm:rounded-3xl border border-gray-100 bg-white/80 p-4 sm:p-5 md:p-6 shadow-soft">
      <h2 className="text-base sm:text-lg font-semibold text-secondary">Resumo da encomenda</h2>
      <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-gray-600">
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
      <div className="flex items-center justify-between rounded-xl sm:rounded-2xl bg-light p-3 sm:p-4">
        <span className="text-sm sm:text-base font-semibold text-secondary">Total</span>
        <span className="text-xl sm:text-2xl font-bold text-primary">{formatPrice(total)}</span>
      </div>
      <div className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs text-gray-500">
        <p>✦ Portes grátis acima de 39€ · Entrega em 24-48h.</p>
        <p>✦ Pagamentos Stripe, MBWay, Apple Pay e mais.</p>
      </div>
    </div>
  )

  return (
    <div className="bg-light py-4 sm:py-6 md:py-8 lg:py-12 pb-20 sm:pb-0">
      <div className="container-xl space-y-6 sm:space-y-8 md:space-y-10">
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

        <div className="flex gap-2.5 sm:gap-3 md:gap-6 overflow-x-auto pb-1 scrollbar-hide">
          {steps.map((item, index) => {
            const currentIndex = steps.findIndex((s) => s.id === step)
            const state = item.id === step ? 'current' : index < currentIndex ? 'done' : 'pending'
            return (
              <div
                key={item.id}
                className={cn(
                  'min-w-[160px] sm:min-w-[180px] md:min-w-[200px] flex-shrink-0 rounded-2xl sm:rounded-3xl border px-3 py-2.5 sm:px-4 sm:py-3 transition touch-manipulation',
                  state === 'current' && 'border-primary bg-white shadow-soft',
                  state === 'done' && 'border-green-200 bg-green-50 text-green-700',
                  state === 'pending' && 'border-gray-100 bg-white/70 text-gray-500'
                )}
              >
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] sm:tracking-[0.3em]">{item.label}</p>
                <p className="text-xs sm:text-sm mt-0.5">{item.description}</p>
              </div>
            )
          })}
        </div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.6fr)_400px]">
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            <AnimatePresence mode="wait">
              {step === 'shipping' && (
                <motion.form
                  key="shipping"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  id="checkout-shipping-form"
                  onSubmit={handleShippingSubmit}
                  className="space-y-4 sm:space-y-6 rounded-2xl sm:rounded-3xl border border-gray-100 bg-white p-4 sm:p-5 md:p-6 shadow-soft"
                >
                  <div className="space-y-1.5 sm:space-y-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-secondary">Morada de entrega</h2>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                      Preencha a morada onde iremos entregar o seu pedido. Produzimos em Lisboa e entregamos em todo Portugal.
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-red-200 bg-red-50 p-3 sm:p-4 text-xs sm:text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{error}</span>
                    </div>
                  )}

                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
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
                    placeholder="Telefone (opcional, ex: +351 912 345 678)"
                    value={shippingAddress.phone}
                    onChange={(event) => {
                      const sanitized = sanitizePhone(event.target.value)
                      setShippingAddress({ ...shippingAddress, phone: sanitized })
                    }}
                    maxLength={20}
                  />

                  <Textarea
                    required
                    placeholder="Morada completa *"
                    value={shippingAddress.street}
                    onChange={(event) => setShippingAddress({ ...shippingAddress, street: event.target.value })}
                    rows={3}
                  />

                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
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

                  <div className="flex items-start gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-primary/20 bg-primary/5 p-3 sm:p-4 text-xs sm:text-sm text-secondary">
                    <Truck className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-xs sm:text-sm">Entrega express</p>
                      <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 leading-relaxed">Envio em 24-48h após confirmação. Portes grátis acima de 39€.</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <label className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-gray-600 cursor-pointer touch-manipulation py-1">
                      <input
                        type="checkbox"
                        checked={sameAsShipping}
                        onChange={(event) => setSameAsShipping(event.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary touch-manipulation"
                      />
                      Utilizar a mesma morada para faturação
                    </label>
                    <Button
                      type="submit"
                      className="rounded-full h-11 sm:h-12 text-sm sm:text-base font-semibold w-full sm:w-auto touch-manipulation"
                      disabled={isCreatingPayment || paymentIntentMutation.isPending}
                    >
                      {isCreatingPayment || paymentIntentMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          A preparar...
                        </>
                      ) : (
                        'Continuar para pagamento'
                      )}
                    </Button>
                  </div>
                </motion.form>
              )}

              {step === 'payment' && clientSecret && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 sm:space-y-6 rounded-2xl sm:rounded-3xl border border-gray-100 bg-white p-4 sm:p-5 md:p-6 shadow-soft"
                >
                  <div className="space-y-1.5 sm:space-y-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-secondary">Pagamento seguro</h2>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                      Cartão, MBWay, Apple Pay, Google Pay, PayPal, Klarna ou Multibanco através da Stripe.
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-red-200 bg-red-50 p-3 sm:p-4 text-xs sm:text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{error}</span>
                    </div>
                  )}

                  <StripePayment
                    clientSecret={clientSecret}
                    amount={total}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    isLoading={confirmPaymentMutation.isPending}
                  />

                  <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full border-gray-300 text-gray-600 h-10 sm:h-11 text-sm touch-manipulation"
                          onClick={() => {
                            setStep('shipping')
                            setClientSecret(null)
                            setError(null)
                          }}
                        >
                          Voltar
                        </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl border border-gray-100 bg-white p-4 sm:p-5 md:p-6 shadow-soft grid-cols-1 sm:grid-cols-3">
              {[
                { icon: Truck, title: 'Envio expresso', description: 'Produção em Lisboa com entregas 24-48h em Portugal.' },
                { icon: ShieldCheck, title: 'Compra protegida', description: 'SSL, Stripe e suporte personalizado em todas as etapas.' },
                { icon: Sparkles, title: 'Personalização premium', description: 'Equipa criativa acompanha o projeto até a entrega.' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl sm:rounded-2xl bg-light/70 p-3 sm:p-4 text-xs sm:text-sm text-secondary">
                  <item.icon className="mb-2 sm:mb-3 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <p className="font-semibold text-xs sm:text-sm">{item.title}</p>
                  <p className="mt-1 text-[10px] sm:text-xs text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-8">{Summary}</div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-3 sm:p-4 backdrop-blur-lg sm:hidden safe-area-inset-bottom">
        <div className="container-xl flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Total</p>
            <p className="text-lg sm:text-xl font-bold text-secondary">{formatPrice(total)}</p>
          </div>
          {step === 'shipping' && (
            <Button
              type="submit"
              form="checkout-shipping-form"
              className="rounded-full h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold flex-shrink-0 touch-manipulation"
              disabled={isCreatingPayment || paymentIntentMutation.isPending}
            >
              {isCreatingPayment || paymentIntentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A preparar...
                </>
              ) : (
                'Continuar'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

