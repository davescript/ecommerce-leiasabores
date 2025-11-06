import { motion } from 'framer-motion'
import { Users, Award, Truck, Heart, Sparkles, Leaf, HeartHandshake } from 'lucide-react'
import { useSEO } from '@hooks/useSEO'

const highlights = [
  { icon: Heart, title: 'Feito com carinho', text: 'Design exclusivo para cada pedido, com foco no detalhe artesanal.' },
  { icon: Truck, title: 'Entrega express', text: 'Produção em Lisboa e envio em 24-48h para todo o país.' },
  { icon: Award, title: 'Qualidade garantida', text: 'Materiais premium, cortes precisos e aprovação antes da expedição.' },
  { icon: Users, title: 'Equipe criativa', text: 'Designers e cake designers especializados na criação de experiências memoráveis.' },
]

const values = [
  { icon: Sparkles, label: 'Personalização ilimitada', description: 'Do tema às cores e formatos, construímos o topo perfeito para sua história.' },
  { icon: HeartHandshake, label: 'Atendimento humano', description: 'Consultores reais para orientar tamanhos, shipping e combinações.' },
  { icon: Leaf, label: 'Responsabilidade', description: 'Materiais recicláveis e produção local para reduzir desperdícios.' },
]

const team = [
  { name: 'Léa Andrade', role: 'Fundadora e Chef Criativa', bio: 'Transforma memórias em arte com 15 anos de experiência em confeitaria personalizada.', image: 'https://images.unsplash.com/photo-1549989476-69a92fa57c36?auto=format&fit=crop&w=600&q=80' },
  { name: 'David Sousa', role: 'Diretor de Operações', bio: 'Garante que cada encomenda seja entregue com precisão e dentro do prazo.', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80' },
  { name: 'Ana Figueiredo', role: 'Designer de Topos', bio: 'Especialista em ilustrações personalizadas para qualquer tipo de celebração.', image: 'https://images.unsplash.com/photo-1530023367847-a683933f4177?auto=format&fit=crop&w=600&q=80' },
]

export function About() {
  useSEO({
    title: 'Sobre a Leia Sabores',
    description: 'Conheça a equipa que transforma celebrações em memórias doces com topos personalizados e bolos artesanais.',
    keywords: 'sobre, leia sabores, topos personalizados, bolos, eventos',
  })

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-white to-accent/10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,99,132,0.18),rgba(255,255,255,0))]" />
        <div className="container-xl grid gap-12 py-16 sm:py-20 md:grid-cols-[1.2fr_1fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Quem somos
            </span>
            <h1 className="text-3xl font-bold text-secondary sm:text-4xl">
              A Leia Sabores existe para deixar cada celebração com o seu toque único.
            </h1>
            <p className="text-base leading-relaxed text-gray-600">
              Começámos em Lisboa a criar topos personalizados que combinam técnicas artesanais com design contemporâneo.
              Hoje, entregamos coleções completas para festas em todo o país, sempre com o cuidado de quem produz algo único para momentos especiais.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {highlights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-gray-100 bg-white/80 p-4 text-sm text-secondary shadow-sm">
                  <item.icon className="mb-3 h-6 w-6 text-primary" />
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[32px] border border-white shadow-[0_32px_60px_-30px_rgba(255,99,132,0.45)]"
          >
            <img
              src="https://images.unsplash.com/photo-1529257414770-1960ab1a74d9?auto=format&fit=crop&w=900&q=80"
              alt="Atelier Leia Sabores"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/90 p-4 shadow-soft">
              <p className="text-sm font-semibold text-secondary">Atelier em Lisboa</p>
              <p className="mt-1 text-xs text-gray-500">Produção própria com showroom para recolha local e sessões de briefing.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container-xl py-16 sm:py-20">
        <div className="space-y-6 text-center sm:mx-auto sm:max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">O que acreditamos</p>
          <h2 className="text-3xl font-bold text-secondary sm:text-4xl">Valores que nos guiam diariamente</h2>
          <p className="text-sm text-gray-600">
            Cada topo, bolo ou kit passa pelo nosso crivo de qualidade antes de chegar à sua mesa. Produzimos em pequenas séries para garantir frescura, brilho e durabilidade.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {values.map((value) => (
            <motion.div
              key={value.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm"
            >
              <value.icon className="mx-auto mb-4 h-10 w-10 text-primary" />
              <p className="text-base font-semibold text-secondary">{value.label}</p>
              <p className="mt-2 text-sm text-gray-500">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-light py-16 sm:py-20">
        <div className="container-xl space-y-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Equipe</p>
          <h2 className="text-3xl font-bold text-secondary sm:text-4xl">As pessoas por trás dos sabores</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-soft"
              >
                <img src={member.image} alt={member.name} className="h-56 w-full object-cover" loading="lazy" />
                <div className="space-y-2 px-6 py-5 text-left">
                  <h3 className="text-lg font-semibold text-secondary">{member.name}</h3>
                  <p className="text-sm uppercase tracking-[0.3em] text-primary">{member.role}</p>
                  <p className="text-xs text-gray-500">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
