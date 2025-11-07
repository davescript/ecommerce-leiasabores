import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, Clock, MessageSquare } from 'lucide-react'
import { Button } from '@components/Button'
import { useSEO } from '@hooks/useSEO'

const channels = [
  {
    icon: Phone,
    title: 'Linha direta',
    content: '+351 910 000 000',
    href: 'tel:+351910000000',
    description: 'Seg-Sex 09h às 18h · Sáb 10h às 16h',
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'ola@leiasabores.pt',
    href: 'mailto:ola@leiasabores.pt',
    description: 'Respondemos em até 24h úteis',
  },
  {
    icon: MapPin,
    title: 'Atelier em Lisboa',
    content: 'Rua das Doces Lembranças, 45',
    description: 'Recolhas e reuniões com agendamento',
  },
]

const faqs = [
  { question: 'Quanto tempo demora a produção?', answer: 'Produzimos em 24h úteis após confirmação do pagamento. Envio: 24-48h para Portugal continental.' },
  { question: 'Posso personalizar o topo com um design meu?', answer: 'Sim! Envie referências ou ficheiros no formulário, e a nossa equipa ajusta o design ao tema.' },
  { question: 'Vocês entregam bolos refrigerados?', answer: 'Entregamos bolos apenas na região de Lisboa. Para outras zonas, sugerimos recolha no atelier.' },
]

export function Contact() {
  useSEO({
    title: 'Contacte a Leia Sabores',
    description: 'Fale com a nossa equipa criativa para personalizações, prazos e acompanhamento de pedidos.',
    keywords: 'contato, apoio, personalização, festa, topos de bolo',
  })

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      setTimeout(() => setSubmitted(false), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (key: keyof typeof formData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [key]: event.target.value }))
  }

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-white to-accent/10">
        <div className="container-xl grid gap-10 py-16 sm:py-20 md:grid-cols-[minmax(0,1.2fr)_1fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Atendimento dedicado
            </span>
            <h1 className="text-3xl font-bold text-secondary sm:text-4xl">Estamos aqui para tornar a sua celebração inesquecível.</h1>
            <p className="text-base text-gray-600">
              Fale com a nossa equipa para esclarecer dúvidas, pedir sugestões de topos ou acompanhar o estado da sua encomenda. Respondemos com rapidez e cuidado.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {channels.map((channel) => (
                <div key={channel.title} className="rounded-3xl border border-gray-100 bg-white/80 p-4 text-sm text-secondary shadow-sm">
                  <channel.icon className="h-6 w-6 text-primary" />
                  <p className="mt-3 text-sm font-semibold text-secondary">{channel.title}</p>
                  {channel.href ? (
                    <a href={channel.href} className="mt-1 block text-primary hover:underline">
                      {channel.content}
                    </a>
                  ) : (
                    <p className="mt-1 text-gray-600">{channel.content}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">{channel.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-soft sm:p-8"
          >
            {submitted && (
              <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                ✦ Recebemos a sua mensagem. Entraremos em contacto em breve.
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {[
                { id: 'name', label: 'Nome completo *', type: 'text', value: formData.name, handler: handleChange('name') },
                { id: 'email', label: 'Email *', type: 'email', value: formData.email, handler: handleChange('email') },
                { id: 'phone', label: 'Telefone', type: 'tel', value: formData.phone, handler: handleChange('phone'), placeholder: '+351 912 345 678' },
                { id: 'subject', label: 'Assunto *', type: 'text', value: formData.subject, handler: handleChange('subject') },
              ].map((field) => (
                <div key={field.id}>
                  <label htmlFor={field.id} className="mb-2 block text-sm font-semibold text-secondary">
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    type={field.type}
                    required={field.label.includes('*')}
                    value={field.value}
                    onChange={field.handler}
                    placeholder={field.placeholder}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ))}

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-semibold text-secondary">
                  Mensagem *
                </label>
                <textarea
                  id="message"
                  required
                  value={formData.message}
                  onChange={handleChange('message')}
                  rows={5}
                  placeholder="Descreva a ideia do seu topo, data do evento e qualquer detalhe importante."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full rounded-full"
                loading={isLoading}
                disabled={isLoading}
              >
                <Send size={16} className="mr-2" />
                Enviar mensagem
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

  <section className="container-xl grid gap-8 py-16 sm:grid-cols-[minmax(0,0.9fr)_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft sm:p-8"
        >
          <h2 className="text-xl font-semibold text-secondary">FAQ rápido</h2>
          <p className="mt-1 text-sm text-gray-500">
            As perguntas mais frequentes para agilizar o seu pedido. Precisa de mais detalhes? Envie-nos uma mensagem.
          </p>
          <div className="mt-6 space-y-4">
            {faqs.map((item) => (
              <div key={item.question} className="rounded-2xl border border-gray-100 bg-light/70 p-4 text-sm text-secondary">
                <p className="font-semibold">{item.question}</p>
                <p className="mt-1 text-xs text-gray-500">{item.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft sm:p-8"
        >
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold text-secondary">Horário do atelier</p>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Segunda a sexta: 09h às 18h · Sábado: 10h às 16h · Domingo: mediante encomenda.
          </p>
          <div className="mt-6 space-y-3 rounded-2xl bg-light/70 p-4 text-xs text-secondary">
            <p className="font-semibold uppercase tracking-[0.3em] text-primary">Endereços</p>
            <p>Lisboa · Rua das Doces Lembranças, 45</p>
            <p>Porto · Loft colaborativo (entregas express)</p>
            <p>Atendimento online · WhatsApp e Zoom mediante agendamento</p>
          </div>
          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-secondary">
            <div className="flex items-center gap-2 text-primary">
              <MessageSquare className="h-4 w-4" />
              <p className="font-semibold uppercase tracking-[0.3em]">WhatsApp personalizado</p>
            </div>
            <p className="mt-2">
              Quer começar já o briefing? Envie mensagem para <span className="font-semibold">+351 910 000 000</span> com o tema, cores e data do evento.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
