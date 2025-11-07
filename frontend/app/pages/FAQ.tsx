import { motion } from 'framer-motion'
import { HelpCircle, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useSEO } from '@hooks/useSEO'
import { cn } from '@lib/utils'

const faqs = [
  {
    category: 'Encomendas',
    questions: [
      {
        question: 'Quanto tempo demora a produção?',
        answer: 'Produzimos os topos personalizados em 24 horas úteis após a confirmação do pagamento. Para bolos completos, o prazo é de 48-72 horas úteis, dependendo da complexidade.',
      },
      {
        question: 'Posso personalizar o topo com um design meu?',
        answer: 'Sim! Envie-nos referências, imagens ou ficheiros através do formulário de contacto ou por email. A nossa equipa criativa ajusta o design ao tema da sua festa sem custos adicionais.',
      },
      {
        question: 'Como funciona a personalização?',
        answer: 'Após a encomenda, entraremos em contacto por email para confirmar os detalhes (nome, idade, tema, cores). Pode também enviar referências visuais. Aprovamos o design antes da produção.',
      },
      {
        question: 'Posso alterar ou cancelar uma encomenda?',
        answer: 'Pode alterar detalhes da personalização até 48h antes da data de entrega. Cancelamentos até 24h após a encomenda são reembolsados 100%. Após esse período, aplicamos uma taxa de 20%.',
      },
    ],
  },
  {
    category: 'Entrega',
    questions: [
      {
        question: 'Quais são os custos de envio?',
        answer: 'Portes grátis para encomendas acima de 39€ em Portugal continental. Para valores inferiores, o custo é de 5,99€. Ilhas e Açores: 12,99€. Entregas express (24h): +9,99€.',
      },
      {
        question: 'Quanto tempo demora a entrega?',
        answer: 'Produção: 24-48h úteis. Envio: 24-48h para Portugal continental (CTT Expresso). Total: 2-4 dias úteis após confirmação do pagamento. Entregas express disponíveis.',
      },
      {
        question: 'Fazem entregas no mesmo dia?',
        answer: 'Sim, para Lisboa e arredores (raio de 30km). Entregas no mesmo dia têm custo adicional de 15€ e devem ser encomendadas até às 12h. Contacte-nos para confirmar disponibilidade.',
      },
      {
        question: 'Como posso acompanhar a minha encomenda?',
        answer: 'Após o envio, receberá um email com o código de rastreamento dos CTT. Pode acompanhar em tempo real no site dos CTT Expresso ou na nossa área de cliente.',
      },
    ],
  },
  {
    category: 'Pagamento',
    questions: [
      {
        question: 'Quais métodos de pagamento aceitam?',
        answer: 'Aceitamos cartão de crédito/débito (Visa, Mastercard, Amex), MB Way, Apple Pay, Google Pay, PayPal, Klarna (pagamento em prestações) e Multibanco (referência MB). Todos os pagamentos são processados de forma segura pela Stripe.',
      },
      {
        question: 'O pagamento é seguro?',
        answer: 'Sim. Utilizamos a Stripe, líder mundial em pagamentos online, com encriptação SSL/TLS. Nunca guardamos dados do seu cartão. Todos os pagamentos são PCI-DSS compliant.',
      },
      {
        question: 'Posso pagar em prestações?',
        answer: 'Sim, através do Klarna. Pode dividir o pagamento em 3 prestações sem juros para compras acima de 50€. A opção aparece automaticamente no checkout se elegível.',
      },
      {
        question: 'Quando é cobrado o pagamento?',
        answer: 'O pagamento é processado imediatamente após a confirmação da encomenda. Para Multibanco, tem 3 dias para efetuar o pagamento. A produção só inicia após confirmação.',
      },
    ],
  },
  {
    category: 'Produtos',
    questions: [
      {
        question: 'Os produtos são feitos à mão?',
        answer: 'Sim! Todos os topos e bolos são produzidos artesanalmente na nossa cozinha em Lisboa. Utilizamos ingredientes frescos e processos tradicionais, com toque contemporâneo.',
      },
      {
        question: 'Que materiais são usados nos topos?',
        answer: 'Utilizamos acrílico de alta qualidade, não tóxico e seguro para alimentos. Os topos são laváveis, reutilizáveis e podem ser personalizados com qualquer texto ou design.',
      },
      {
        question: 'Os produtos contêm alergénios?',
        answer: 'Os topos de acrílico não contêm alergénios. Para bolos, todos os ingredientes e alergénios são listados na descrição do produto. Contacte-nos para necessidades específicas.',
      },
      {
        question: 'Posso ver fotos antes de encomendar?',
        answer: 'Sim! Cada produto tem múltiplas fotos na página. Para personalizações, enviamos um mockup do design antes da produção para aprovação.',
      },
    ],
  },
  {
    category: 'Suporte',
    questions: [
      {
        question: 'Como posso contactar-vos?',
        answer: 'Pode contactar-nos por email (ola@leiasabores.pt), telefone (+351 910 000 000), WhatsApp ou através do formulário de contacto. Horário: Seg-Sex 09h-18h, Sáb 10h-16h.',
      },
      {
        question: 'Respondem rapidamente?',
        answer: 'Sim! Respondemos a todos os contactos em até 24 horas úteis. Para urgências, utilize o WhatsApp para resposta imediata durante o horário comercial.',
      },
      {
        question: 'Oferecem suporte pós-venda?',
        answer: 'Sim! Acompanhamos cada encomenda desde a personalização até à entrega. Se tiver qualquer questão ou problema, estamos sempre disponíveis para ajudar.',
      },
      {
        question: 'Têm garantia?',
        answer: 'Sim. Garantimos a qualidade de todos os produtos. Se receber algo que não corresponde à descrição ou estiver danificado, reembolsamos ou substituímos sem custos.',
      },
    ],
  },
]

export function FAQ() {
  useSEO({
    title: 'Perguntas Frequentes · Leia Sabores',
    description: 'Encontre respostas para as perguntas mais comuns sobre encomendas, entregas, pagamentos e produtos personalizados.',
  })

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  let questionIndex = 0

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
              Ajuda
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary mb-4">
              Perguntas Frequentes
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Encontre respostas rápidas para as suas dúvidas sobre encomendas, entregas, pagamentos e muito mais.
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {faqs.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                className="rounded-2xl sm:rounded-3xl border border-gray-100 bg-white p-4 sm:p-6 shadow-soft"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                  <h2 className="text-lg sm:text-xl font-bold text-secondary">{category.category}</h2>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {category.questions.map((faq) => {
                    const currentIndex = questionIndex++
                    const isOpen = openIndex === currentIndex

                    return (
                      <div
                        key={currentIndex}
                        className="rounded-xl sm:rounded-2xl border border-gray-100 bg-light/50 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleQuestion(currentIndex)}
                          className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left transition hover:bg-light touch-manipulation"
                          aria-expanded={isOpen}
                          aria-controls={`faq-answer-${currentIndex}`}
                        >
                          <span className="text-sm sm:text-base font-semibold text-secondary flex-1">
                            {faq.question}
                          </span>
                          <ChevronDown
                            className={cn(
                              'h-5 w-5 text-primary flex-shrink-0 transition-transform',
                              isOpen && 'rotate-180'
                            )}
                          />
                        </button>

                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            id={`faq-answer-${currentIndex}`}
                            className="px-4 sm:px-5 pb-4 sm:pb-5"
                          >
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 sm:mt-12 rounded-2xl sm:rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8 text-center"
          >
            <h3 className="text-lg sm:text-xl font-bold text-secondary mb-2">
              Ainda tem dúvidas?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
              Não encontrou a resposta que procura? A nossa equipa está pronta para ajudar.
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

