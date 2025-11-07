import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CheckCircle2, Package, Mail, CalendarDays, Truck, Sparkles, AlertCircle } from 'lucide-react'
import { Button } from '@components/Button'
import { Skeleton } from '@components/ui/skeleton'
import { useCart } from '@hooks/useCart'
import { useSEO } from '@hooks/useSEO'
import { fetchCheckoutSession } from '@lib/api'
import { formatPrice } from '@lib/utils'

export function CheckoutSuccess() {
  useSEO({
    title: 'Pedido confirmado · Leia Sabores',
    description: 'Encomenda concluída com sucesso. Prepare-se para uma celebração memorável.',
    robots: 'noindex, nofollow',
  })

  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()
  const sessionId = searchParams.get('session_id')
  const orderId = searchParams.get('orderId')
  const paymentIntentId = searchParams.get('paymentIntentId')
  const [orderNumber] = useState(() => {
    // Tentar usar orderId se disponível, senão gerar número
    if (orderId) return orderId
    return `LS-${Date.now().toString().slice(-6)}`
  })

  useEffect(() => {
    clearCart()
  }, [clearCart])

  const sessionQuery = useQuery({
    queryKey: ['checkout-session', sessionId || orderId || paymentIntentId],
    queryFn: () => {
      if (sessionId) {
        return fetchCheckoutSession(sessionId)
      }
      // Se não há sessionId mas há orderId, retornar dados básicos
      if (orderId || paymentIntentId) {
        return Promise.resolve({
          order: { id: orderId || paymentIntentId },
          session: null,
        })
      }
      throw new Error('No session or order ID provided')
    },
    enabled: Boolean(sessionId || orderId || paymentIntentId),
    retry: 1,
    retryDelay: 1000,
  })

  const summary = useMemo(() => {
    const order = sessionQuery.data?.order
    const customer = sessionQuery.data?.session?.customer_details
    return {
      email: order?.email ?? customer?.email ?? '',
      total:
        order?.total ??
        (sessionQuery.data?.session?.amount_total ? sessionQuery.data.session.amount_total / 100 : undefined),
    }
  }, [sessionQuery.data])

  // Tratamento de erro
  if (sessionQuery.isError && !sessionId && !orderId && !paymentIntentId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 via-white to-accent/10 flex items-center justify-center">
        <div className="container-xl py-12 sm:py-16 text-center">
          <div className="mx-auto max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-soft">
            <h1 className="text-2xl font-bold text-secondary mb-4">Pedido não encontrado</h1>
            <p className="text-sm text-gray-600 mb-6">
              Não foi possível encontrar informações sobre o seu pedido. Se acabou de fazer um pagamento, aguarde alguns instantes ou contacte-nos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/" className="flex-1">
                <Button variant="outline" size="lg" className="w-full rounded-full">
                  Voltar à página inicial
                </Button>
              </Link>
              <Link to="/contato" className="flex-1">
                <Button size="lg" className="w-full rounded-full">
                  Contactar suporte
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-white to-accent/10">
      <div className="container-xl py-12 sm:py-16">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_20px_60px_-20px_rgba(34,197,94,0.5)]">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-secondary sm:text-4xl">Pedido confirmado com sucesso!</h1>
          <p className="mt-3 text-base text-gray-600">
            Recebemos a sua encomenda e já estamos a preparar tudo com carinho. Em breve receberá atualizações por email.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-10 grid max-w-3xl gap-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-soft sm:grid-cols-2"
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-left text-sm text-secondary">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Referência</p>
              <p className="mt-1 text-lg font-semibold text-secondary">{orderNumber}</p>
              {sessionId && <p className="text-xs text-gray-400">Stripe · {sessionId}</p>}
            </div>
            <div className="rounded-2xl border border-gray-100 bg-light/80 p-4 text-left text-sm text-secondary">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Total pago</p>
              {sessionQuery.isLoading && !summary.total ? (
                <Skeleton className="mt-2 h-4 w-24" />
              ) : (
                <p className="mt-1 text-lg font-semibold text-secondary">
                  {summary.total ? formatPrice(summary.total) : 'Em processamento'}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-light/80 p-4 text-left text-sm text-secondary">
              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Confirmação enviada para</p>
                  {sessionQuery.isLoading ? (
                    <Skeleton className="mt-2 h-4 w-40" />
                  ) : (
                    <p className="mt-1 font-semibold text-secondary">{summary.email || 'o seu endereço de email'}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Receberá recibo, tracking e sugestões para a festa.</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-left text-sm text-secondary">
              <div className="flex items-start gap-3">
                <Package className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Próximos passos</p>
                  <ul className="mt-2 space-y-2 text-xs text-gray-600">
                    <li className="flex gap-2">
                      <CalendarDays className="mt-0.5 h-4 w-4 text-primary" /> Produção personalizada em 24h.
                    </li>
                    <li className="flex gap-2">
                      <Truck className="mt-0.5 h-4 w-4 text-primary" /> Recebe o tracking logo que sair da nossa cozinha.
                    </li>
                    <li className="flex gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 text-primary" /> Preparação da mesa com dicas no email de confirmação.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-10 flex max-w-3xl flex-col gap-4 sm:flex-row"
        >
          <Link to="/" className="flex-1">
            <Button variant="outline" size="lg" className="w-full rounded-full">
              Voltar à página inicial
            </Button>
          </Link>
          <Link to="/catalogo" className="flex-1">
            <Button size="lg" className="w-full rounded-full">
              Ver mais produtos
            </Button>
          </Link>
        </motion.section>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-10 max-w-3xl text-center text-sm text-gray-600"
        >
          Precisa de ajuda com personalização ou entrega?{' '}
          <Link to="/contato" className="text-primary hover:underline">
            Contacte-nos
          </Link>{' '}
          e será respondido em menos de 24h úteis.
        </motion.p>
      </div>
    </div>
  )
}
