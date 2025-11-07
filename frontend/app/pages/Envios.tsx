import { motion } from 'framer-motion'
import { Truck, Package, Clock, MapPin, Shield, CheckCircle2 } from 'lucide-react'
import { useSEO } from '@hooks/useSEO'

const shippingInfo = [
  {
    icon: Truck,
    title: 'Entregas Express',
    description: 'Produção em Lisboa e envio rápido para todo o país',
    details: [
      'Produção: 24-48h úteis após confirmação do pagamento',
      'Envio: 24-48h para Portugal continental',
      'Total: 2-4 dias úteis do pedido à entrega',
      'Rastreamento em tempo real via CTT Expresso',
    ],
  },
  {
    icon: Package,
    title: 'Custos de Envio',
    description: 'Portes grátis acima de 39€',
    details: [
      'Grátis para encomendas acima de 39€ (Portugal continental)',
      '5,99€ para encomendas abaixo de 39€',
      '12,99€ para Ilhas e Açores',
      '9,99€ adicional para entrega express (24h)',
    ],
  },
  {
    icon: Clock,
    title: 'Prazos de Entrega',
    description: 'Prazos claros e transparentes',
    details: [
      'Portugal Continental: 2-4 dias úteis',
      'Ilhas e Açores: 5-7 dias úteis',
      'Lisboa e arredores: Entrega no mesmo dia disponível (contacte-nos)',
      'Entregas express: 24h após produção',
    ],
  },
  {
    icon: MapPin,
    title: 'Áreas de Entrega',
    description: 'Entregamos em todo o território português',
    details: [
      'Portugal Continental: CTT Expresso',
      'Ilhas: CTT Expresso (Madeira e Açores)',
      'Lisboa e arredores: Entrega própria (raio 30km)',
      'Recolha no atelier: Disponível mediante agendamento',
    ],
  },
  {
    icon: Shield,
    title: 'Embalagem Segura',
    description: 'Produtos protegidos durante o transporte',
    details: [
      'Embalagem reforçada e à prova de impacto',
      'Proteção individual para cada produto',
      'Caixas personalizadas para bolos',
      'Instruções de abertura incluídas',
    ],
  },
  {
    icon: CheckCircle2,
    title: 'Rastreamento',
    description: 'Acompanhe a sua encomenda em tempo real',
    details: [
      'Código de rastreamento enviado por email',
      'Atualizações automáticas de status',
      'Notificação de entrega',
      'Histórico completo no site dos CTT',
    ],
  },
]

const returnPolicy = [
  {
    title: 'Devoluções',
    content: 'Aceitamos devoluções até 14 dias após a entrega, desde que o produto esteja nas mesmas condições em que foi enviado. Produtos personalizados não podem ser devolvidos, exceto em caso de defeito ou erro da nossa parte.',
  },
  {
    title: 'Reembolsos',
    content: 'Reembolsos são processados no prazo de 5-10 dias úteis após receção do produto devolvido. O valor será creditado no método de pagamento original.',
  },
  {
    title: 'Trocas',
    content: 'Não fazemos trocas diretas. Se precisar de um produto diferente, devolva o original e faça uma nova encomenda. O processo de devolução é gratuito.',
  },
  {
    title: 'Produtos Danificados',
    content: 'Se receber um produto danificado, contacte-nos imediatamente com fotos. Enviaremos um substituto sem custos adicionais ou reembolsaremos 100% do valor.',
  },
]

export function Envios() {
  useSEO({
    title: 'Envios e Devoluções · Leia Sabores',
    description: 'Informações sobre prazos de entrega, custos de envio, rastreamento e política de devoluções.',
  })

  return (
    <div className="min-h-screen bg-light">
      <div className="container-xl py-8 sm:py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl"
        >
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-4">
              Informações
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary mb-4">
              Envios e Devoluções
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Tudo o que precisa saber sobre entregas, prazos, custos e política de devoluções.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 mb-8 sm:mb-12">
            {shippingInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-2xl sm:rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-soft"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                    <info.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg font-bold text-secondary mb-1">
                      {info.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600">{info.description}</p>
                  </div>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                  {info.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="leading-relaxed">{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="rounded-2xl sm:rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-soft"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-secondary mb-6">
              Política de Devoluções
            </h2>
            <div className="space-y-6">
              {returnPolicy.map((policy, index) => (
                <div key={index} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                  <h3 className="text-base sm:text-lg font-semibold text-secondary mb-2">
                    {policy.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {policy.content}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-8 sm:mt-12 rounded-2xl sm:rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8 text-center"
          >
            <h3 className="text-lg sm:text-xl font-bold text-secondary mb-2">
              Precisa de ajuda com a sua encomenda?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
              Contacte-nos para esclarecer dúvidas sobre envios, rastreamento ou devoluções.
            </p>
            <a
              href="/contato"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 touch-manipulation"
            >
              Contactar equipa
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

