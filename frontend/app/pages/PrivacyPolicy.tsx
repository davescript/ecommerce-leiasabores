import { motion } from 'framer-motion'
import { useSEO } from '@hooks/useSEO'

const sections = [
  {
    title: '1. Introdução',
    content: [
      'A Leia Sabores ("nós", "nosso") opera a plataforma leiasabores.pt e garante que todos os dados pessoais são tratados em conformidade com o Regulamento Geral de Proteção de Dados (RGPD).',
      'Esta página explica como recolhemos, utilizamos e protegemos as suas informações sempre que utiliza os nossos serviços online ou comunica connosco.',
    ],
  },
  {
    title: '2. Dados recolhidos',
    content: [
      'Identificação: nome, email, contacto telefónico e endereço de entrega; necessários para faturação, entrega de encomendas e suporte.',
      'Pagamento: processado exclusivamente pelo Stripe. Não armazenamos dados dos cartões—apenas referências seguras fornecidas pelo processador.',
      'Navegação: cookies essenciais, analytics anónimos e logs de erro para melhorar a experiência.',
    ],
  },
  {
    title: '3. Finalidade e base legal',
    content: [
      'Execução de contrato: processar encomendas, pagamentos e expedição.',
      'Interesse legítimo: comunicação transacional e melhoria de serviços.',
      'Consentimento: envio de newsletters e campanhas promocionais (opt-in, com possibilidade de revogar a qualquer momento).',
    ],
  },
  {
    title: '4. Segurança e conservação',
    content: [
      'Os dados são armazenados em infraestruturas seguras na UE. Utilizamos encriptação, backups e controlos de acesso rigorosos.',
      'Mantemos os dados apenas pelo tempo necessário ao cumprimento legal e à prestação do serviço (faturação por 10 anos, histórico de encomendas por 2 anos após última interação).',
    ],
  },
  {
    title: '5. Direitos dos titulares',
    content: [
      'Acesso, retificação, portabilidade, oposição e eliminação podem ser solicitados através de privacidade@leiasabores.pt.',
      'Responderemos no prazo máximo de 30 dias e operacionalizamos a remoção imediata após validação de identidade.',
    ],
  },
  {
    title: '6. Cookies e preferências',
    content: [
      'Utilizamos cookies funcionais para manter sessões de usuário, lembrar carrinhos e gerir o checkout.',
      'Pode gerir cookies no browser. Ao rejeitar cookies opcionais, algumas funcionalidades podem ficar limitadas.',
    ],
  },
  {
    title: '7. Atualizações',
    content: [
      'Esta política pode ser atualizada para refletir melhorias legais ou tecnológicas. A versão mais recente estará sempre disponível nesta página.',
    ],
  },
]

export function PrivacyPolicy() {
  useSEO({
    title: 'Política de Privacidade · Leia Sabores',
    description: 'Saiba como a Leia Sabores protege e utiliza os seus dados pessoais de forma transparente e segura.',
    robots: 'noindex, follow',
  })

  return (
    <div className="bg-white">
      <div className="container-xl py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl space-y-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-soft sm:p-10"
        >
          <div className="space-y-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Transparência</p>
            <h1 className="text-3xl font-bold text-secondary sm:text-4xl">Política de Privacidade</h1>
            <p className="text-sm text-gray-600">
              Levamos a proteção de dados a sério. Nesta página encontra informação completa sobre como tratamos os seus dados pessoais.
            </p>
          </div>

          <div className="space-y-8 text-sm text-secondary">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-lg font-semibold text-secondary">{section.title}</h2>
                <ul className="space-y-2 text-gray-600">
                  {section.content.map((paragraph, index) => (
                    <li key={index} className="leading-relaxed">
                      {paragraph}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-xs text-secondary">
            <p className="font-semibold uppercase tracking-[0.3em] text-primary">Contacto de privacidade</p>
            <p className="mt-2">
              Para exercer os seus direitos ou colocar dúvidas, envie email para{' '}
              <a href="mailto:privacidade@leiasabores.pt" className="font-semibold text-primary hover:underline">
                privacidade@leiasabores.pt
              </a>.
              Em alternativa, contacte a Autoridade de Proteção de Dados (CNPD).
            </p>
          </div>

          <p className="border-t border-gray-200 pt-6 text-center text-xs text-gray-500">
            Última atualização: 5 de Novembro de 2025 · Leia Sabores, Lisboa · Portugal
          </p>
        </motion.div>
      </div>
    </div>
  )
}
