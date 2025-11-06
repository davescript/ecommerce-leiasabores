import { motion } from 'framer-motion'
import { useSEO } from '@hooks/useSEO'

const clauses = [
  {
    title: '1. Objeto',
    description:
      'As presentes condições regem as encomendas efetuadas na loja online Leia Sabores e complementam qualquer acordo particular celebrado com o cliente.',
  },
  {
    title: '2. Encomendas',
    bullets: [
      'A confirmação da encomenda implica aceitação integral dos presentes termos.',
      'A produção inicia-se após confirmação de pagamento ou envio do comprovativo.',
      'Alterações ao design só são garantidas até 12h após confirmação, salvo acordo distinto.',
    ],
  },
  {
    title: '3. Pagamentos',
    bullets: [
      'Processados via Stripe (cartão, MBWay, Apple Pay, referência MB).',
      'Todos os valores incluem IVA à taxa legal em vigor.',
      'Em caso de falha de pagamento, a encomenda é automaticamente cancelada após 48h.',
    ],
  },
  {
    title: '4. Entregas e recolhas',
    bullets: [
      'Envio CTT Expresso: 24-48h úteis após produção, Portugal continental.',
      'Recolha em Lisboa: mediante agendamento prévio no atelier.',
      'A Leia Sabores não se responsabiliza por atrasos imputáveis a transportadoras, assegurando o acompanhamento em tempo real.',
    ],
  },
  {
    title: '5. Cancelamentos e devoluções',
    bullets: [
      'Cancelamentos aceites até 12h após confirmação da encomenda.',
      'Por se tratar de produtos personalizados, não existe direito de devolução após produção.',
      'Em caso de defeito comprovado, substituímos o produto ou emitimos crédito integral.',
    ],
  },
  {
    title: '6. Responsabilidade',
    description:
      'Apesar de utilizarmos os melhores materiais e embalagens, o cliente é responsável por conservar os produtos em condições adequadas (temperatura, transporte adicional, exposição à luz).',
  },
  {
    title: '7. Dados pessoais',
    description:
      'Os dados fornecidos são tratados apenas para gestão de encomendas, faturação e comunicações relativas ao serviço. Consulte a Política de Privacidade para mais detalhes.',
  },
  {
    title: '8. Alterações aos termos',
    description:
      'Podemos atualizar estas condições sempre que necessário. A versão atualizada substitui as anteriores e passa a ser aplicável às novas encomendas de imediato.',
  },
]

export function Terms() {
  useSEO({
    title: 'Termos & Condições · Leia Sabores',
    description: 'Condições de compra, pagamentos, entregas e garantias da loja Leia Sabores.',
    robots: 'noindex, follow',
  })

  return (
    <div className="bg-white">
      <div className="container-xl py-16 sm:py-20">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl space-y-10 rounded-3xl border border-gray-100 bg-white p-6 shadow-soft sm:p-10"
        >
          <header className="space-y-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Condições Gerais</p>
            <h1 className="text-3xl font-bold text-secondary sm:text-4xl">Termos &amp; Condições</h1>
            <p className="text-sm text-gray-600">
              Leia atentamente antes de confirmar a sua encomenda. Para esclarecimentos, contacte-nos através de ola@leiasabores.pt.
            </p>
          </header>

          <div className="space-y-7 text-sm text-secondary">
            {clauses.map((clause) => (
              <section key={clause.title} className="space-y-3">
                <h2 className="text-lg font-semibold text-secondary">{clause.title}</h2>
                {clause.description && <p className="text-gray-600">{clause.description}</p>}
                {clause.bullets && (
                  <ul className="space-y-2 text-gray-600">
                    {clause.bullets.map((bullet) => (
                      <li key={bullet} className="leading-relaxed">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <footer className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-xs text-secondary">
            <p className="font-semibold uppercase tracking-[0.3em] text-primary">Assistência ao cliente</p>
            <p className="mt-2">
              Em caso de divergência entre estes termos e qualquer acordo particular, prevalece o acordo por escrito.
              Dúvidas legais devem ser enviadas para{' '}
              <a href="mailto:legal@leiasabores.pt" className="font-semibold text-primary hover:underline">
                legal@leiasabores.pt
              </a>.
            </p>
          </footer>

          <p className="border-t border-gray-200 pt-6 text-center text-xs text-gray-500">
            Última atualização: 5 de Novembro de 2025 · Leia Sabores · Lisboa – Portugal
          </p>
        </motion.article>
      </div>
    </div>
  )
}
