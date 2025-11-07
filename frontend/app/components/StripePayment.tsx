/**
 * Componente profissional de pagamento Stripe
 * Suporta: Cartão, Apple Pay, Google Pay, MB Way, PayPal, Klarna, Multibanco
 */

import { useEffect, useState } from 'react'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@components/Button'
import { logger } from '@lib/logger'
import { toast } from 'sonner'

// Carregar Stripe com a chave pública
// Em produção, usar variável de ambiente VITE_STRIPE_PUBLISHABLE_KEY
const getStripePublishableKey = () => {
  // Em desenvolvimento, usar chave de teste
  if (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  }
  
  // Fallback: tentar obter do backend ou usar chave de teste padrão
  // NOTA: Substituir pela chave real do Stripe (pk_test_... ou pk_live_...)
  // A chave deve ser configurada em VITE_STRIPE_PUBLISHABLE_KEY no Cloudflare Pages
  logger.warn('VITE_STRIPE_PUBLISHABLE_KEY não configurada. Configure a variável de ambiente.')
  return '' // Retornar string vazia para forçar erro se não configurado
}

const stripePromise = loadStripe(getStripePublishableKey())

interface StripePaymentProps {
  clientSecret: string
  amount: number
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  isLoading?: boolean
}

function PaymentForm({ amount, onSuccess, onError, isLoading: externalLoading }: StripePaymentProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLoading = externalLoading || isProcessing || !stripe || !elements

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message || 'Erro ao validar dados de pagamento')
        onError(submitError.message || 'Erro ao validar dados de pagamento')
        setIsProcessing(false)
        return
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/sucesso`,
        },
        redirect: 'if_required', // Não redirecionar se não necessário
      })

      if (confirmError) {
        const errorMessage = confirmError.message || 'Erro ao processar pagamento'
        setError(errorMessage)
        onError(errorMessage)
        toast.error('Erro no pagamento', {
          description: errorMessage,
        })
      } else if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          onSuccess(paymentIntent.id)
          toast.success('Pagamento confirmado!', {
            description: 'A sua encomenda foi processada com sucesso.',
          })
        } else {
          const statusMessage = `Status do pagamento: ${paymentIntent.status}`
          setError(statusMessage)
          onError(statusMessage)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao processar pagamento'
      setError(errorMessage)
      onError(errorMessage)
      toast.error('Erro no pagamento', {
        description: errorMessage,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay', 'link', 'paypal'],
            fields: {
              billingDetails: {
                email: 'auto',
                phone: 'auto',
                address: {
                  country: 'auto',
                  postalCode: 'auto',
                },
              },
            },
          }}
        />
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-semibold">Métodos de pagamento disponíveis:</p>
        <ul className="mt-2 space-y-1 text-xs text-blue-700">
          <li>✓ Cartão de crédito/débito (Visa, Mastercard, Amex)</li>
          <li>✓ Apple Pay (disponível no Safari/iOS)</li>
          <li>✓ Google Pay (disponível no Chrome/Android)</li>
          <li>✓ MB Way (Portugal)</li>
          <li>✓ PayPal</li>
          <li>✓ Klarna (pagamento em prestações)</li>
          <li>✓ Multibanco (referência MB)</li>
        </ul>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            A processar pagamento...
          </>
        ) : (
          <>
            Pagar {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(amount)}
          </>
        )}
      </Button>

      <p className="text-center text-xs text-gray-500">
        Os seus dados estão protegidos por encriptação SSL. Nunca guardamos informações do seu cartão.
      </p>
    </form>
  )
}

export function StripePayment({ clientSecret, amount, onSuccess, onError, isLoading }: StripePaymentProps) {
  const [stripeLoaded, setStripeLoaded] = useState(false)

  useEffect(() => {
    stripePromise.then(() => {
      setStripeLoaded(true)
    }).catch((err) => {
      logger.error('Erro ao carregar Stripe:', err)
      onError('Erro ao carregar sistema de pagamento')
    })
  }, [onError])

  if (!stripeLoaded) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-12">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-gray-600">A carregar sistema de pagamento...</p>
        </div>
      </div>
    )
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#8B5CF6',
        colorBackground: '#ffffff',
        colorText: '#1F2937',
        colorDanger: '#EF4444',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        spacingUnit: '4px',
        borderRadius: '12px',
      },
      rules: {
        '.Input': {
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          padding: '12px',
        },
        '.Input:focus': {
          borderColor: '#8B5CF6',
          boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
        },
        '.Tab': {
          borderRadius: '8px',
        },
        '.Tab--selected': {
          backgroundColor: '#F3F4F6',
        },
      },
    },
    locale: 'pt',
  }

  return (
    <Elements options={options} stripe={stripePromise}>
      <PaymentForm
        clientSecret={clientSecret}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        isLoading={isLoading}
      />
    </Elements>
  )
}

