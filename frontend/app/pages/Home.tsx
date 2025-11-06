import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Sparkles, Calendar, Heart, Truck, Shield, Star } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@components/Button'
import { ProductCard } from '@components/ProductCard'
import { HotDealsSection } from '@components/HotDealsSection'
import { Skeleton } from '@components/ui/skeleton'
import { useCart } from '@hooks/useCart'
import { useSEO } from '@hooks/useSEO'
import { fetchProducts } from '@lib/api'
import type { Product } from '@types'

const heroImage = 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1000&q=80'

const fallbackProducts: Product[] = [
  {
    id: 'placeholder-1',
    name: 'Topo Minnie Deluxe',
    description: 'Topo acrílico personalizável com elementos premium e brilho holográfico.',
    shortDescription: 'Topo Minnie com personalização imediata',
    price: 24.9,
    originalPrice: 29.9,
    category: 'topos-de-bolo',
    images: ['https://api.leiasabores.pt/api/r2/topos-de-bolo/tpo-minie.jpeg'],
    imageUrl: 'https://api.leiasabores.pt/api/r2/topos-de-bolo/tpo-minie.jpeg',
    rating: 4.9,
    reviewCount: 86,
    inStock: true,
    tags: ['personalizado', 'acrílico', 'premium'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'placeholder-2',
    name: 'Topo Homem Aranha Pop',
    description: 'Topo em camadas com efeito 3D e cores vibrantes.',
    shortDescription: 'Personalize idade e nome em minutos',
    price: 21.9,
    originalPrice: 26.5,
    category: 'topos-de-bolo',
    images: ['https://api.leiasabores.pt/api/r2/topos-de-bolo/tpopo-homem-aranha.jpeg'],
    imageUrl: 'https://api.leiasabores.pt/api/r2/topos-de-bolo/tpopo-homem-aranha.jpeg',
    rating: 4.8,
    reviewCount: 64,
    inStock: true,
    tags: ['super-herói', 'camadas'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const categories = [
  { id: '1', name: 'Topos Personalizados', slug: 'topos-de-bolo', image: 'https://api.leiasabores.pt/api/r2/topos-de-bolo/minie-nicole.jpeg', description: 'Produção em 24h' },
  { id: '2', name: 'Bolos Temáticos', slug: 'bolos-tematicos', image: 'https://api.leiasabores.pt/api/r2/topos-de-bolo/topo-princesas.jpeg', description: 'Sabores exclusivos' },
  { id: '3', name: 'Doces & Mesa', slug: 'mesa-doce', image: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=800&q=80', description: 'Macarons, brigadeiros' },
  { id: '4', name: 'Kits Completo', slug: 'kits', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80', description: 'Tudo para a festa' },
]

const testimonials = [
  { author: 'Patrícia Andrade', rating: 5, text: 'Superou as expectativas! Personalizaram o topo com as cores da festa e chegou em dois dias.' },
  { author: 'Rui Gonçalves', rating: 5, text: 'Atendimento impecável. Deram sugestões e o resultado ficou perfeito na mesa de aniversário.' },
  { author: 'Carolina Figueiredo', rating: 5, text: 'Bolo delicioso e lindo! O recheio Red Velvet recebeu muitos elogios dos convidados.' },
]

const highlights = [
  { icon: Sparkles, label: 'Design premium', description: 'Acabamentos em acrílico, foil e glitter' },
  { icon: Calendar, label: 'Entrega ágil', description: 'Produção rápida com envios em 24-48h' },
  { icon: Heart, label: '100% personalizado', description: 'Nome, idade e tema pensados para si' },
]

export function Home() {
  const { addItem } = useCart()
  useSEO({
    title: 'Leia Sabores · Personalize cada celebração',
    description: 'Topos de bolo personalizados, doces artesanais e decoração com entrega express em Portugal.',
  })

  // Add JSON-LD structured data for SEO
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Leia Sabores',
      url: 'https://leiasabores.pt',
      logo: 'https://leiasabores.pt/logo.png',
      description: 'Topos de bolo personalizados, doces artesanais e decoração com entrega express em Portugal.',
      sameAs: [
        'https://www.instagram.com/leiasabores',
        'https://www.facebook.com/leiasabores'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+351-910-000-000',
        contactType: 'Customer Service'
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Lisboa',
        addressCountry: 'PT'
      }
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(schema)
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const { data: featured, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => fetchProducts({ limit: 6, sort: 'novos' }),
  })

  const featuredProducts = featured?.data?.length ? featured.data.slice(0, 4) : fallbackProducts

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,148,194,0.18),rgba(255,255,255,0))]" />
        <div className="container-xl flex flex-col-reverse gap-12 py-16 md:flex-row md:items-center md:py-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-center md:w-1/2 md:text-left"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Celebrar com sabor
            </span>
            <h1 className="text-4xl font-bold leading-tight text-secondary sm:text-5xl">
              Topos e bolos personalizados que tornam cada evento inesquecível.
            </h1>
            <p className="text-base text-gray-600 sm:text-lg">
              Conte-nos o tema, nós cuidamos do design e da entrega. Produção artesanal em Lisboa e envios rápidos para todo o país.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-start">
              <Link to="/catalogo" className="sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Explorar novidades <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contato" className="sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Fale com a equipa criativa
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:max-w-lg">
              {highlights.map((item) => (
                <div key={item.label} className="rounded-2xl border border-primary/10 bg-white/70 p-4 text-left shadow-sm">
                  <item.icon className="mb-2 h-5 w-5 text-primary" />
                  <p className="text-sm font-semibold text-secondary">{item.label}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative md:w-1/2"
          >
            <div className="relative mx-auto max-w-md rounded-[36px] border border-white/60 bg-white/80 p-4 shadow-[0_25px_70px_-25px_rgba(255,99,132,0.45)] backdrop-blur-xl">
              <img
                src={heroImage}
                alt="Topo personalizado Leia Sabores"
                className="h-full w-full rounded-[32px] object-cover"
                loading="lazy"
              />
              <div className="absolute -bottom-6 left-6 right-6 flex gap-3 rounded-2xl bg-white/95 p-4 shadow-soft">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-secondary">Topo personalizado incluído</p>
                  <p className="text-xs text-gray-500">Personalização gratuita para encomendas confirmadas esta semana.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-14">
        <div className="container-xl space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">Escolha por tema</p>
              <h2 className="text-3xl font-bold text-secondary sm:text-4xl">Coleções que encantam</h2>
            </div>
            <Link to="/catalogo" className="text-sm font-semibold text-primary hover:underline">
              Ver catálogo completo
            </Link>
          </div>

          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group relative min-w-[220px] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
              >
                <Link to={`/catalogo?categoria=${category.slug}`} className="flex h-full flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-80 transition group-hover:opacity-90" />
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                      <p className="text-xs text-white/80">{category.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <HotDealsSection />

      <section className="bg-light py-16">
        <div className="container-xl space-y-10">
          <div className="flex flex-col gap-3 text-center sm:mx-auto sm:max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Novidades da semana</p>
            <h2 className="text-3xl font-bold text-secondary sm:text-4xl">Favoritos que voam da cozinha</h2>
            <p className="text-sm text-gray-600 sm:text-base">
              Peças produzidas em pequena quantidade, com acabamentos premium e envio rápido. Garanta o seu antes de esgotar.
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-80 w-full rounded-3xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={(p) => addItem(p, 1)} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="container-xl">
          <div className="grid gap-6 rounded-3xl bg-gradient-to-br from-primary/10 via-white to-accent/5 p-8 md:grid-cols-3">
            {[
              { icon: Truck, title: 'Entrega express', description: 'Produção em 24h e envios em 48h para Portugal continental.' },
              { icon: Shield, title: 'Pagamento seguro', description: 'Stripe, MB Way, Apple Pay e referência multibanco.' },
              { icon: Star, title: 'Acabamento premium', description: 'Materiais resistentes, recorte preciso e brilho duradouro.' },
            ].map((benefit) => (
              <div key={benefit.title} className="rounded-2xl bg-white/70 p-6 shadow-soft">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-secondary">{benefit.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-light py-16">
        <div className="container-xl space-y-8">
          <div className="flex flex-col gap-3 text-center sm:mx-auto sm:max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Clientes encantados</p>
            <h2 className="text-3xl font-bold text-secondary sm:text-4xl">Histórias doces com a Leia Sabores</h2>
          </div>
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-6 sm:mx-0 sm:gap-6 sm:overflow-visible sm:px-0">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="min-w-[280px] rounded-3xl border border-white bg-white p-6 shadow-soft sm:w-full"
              >
                <div className="mb-4 flex items-center gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                    <Star key={starIndex} size={16} className="fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-gray-600">{testimonial.text}</p>
                <p className="mt-4 text-sm font-semibold text-secondary">{testimonial.author}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-xl">
          <div className="relative overflow-hidden rounded-[32px] border border-primary/10 bg-gradient-to-r from-primary via-primary/90 to-accent p-10 text-white shadow-[0_40px_80px_-30px_rgba(255,99,132,0.4)]">
            <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center space-y-6">
              <h2 className="text-3xl font-semibold sm:text-4xl">Pronto para elevar a sua celebração?</h2>
              <p className="text-sm text-white/80 sm:text-base">
                Envie-nos o tema, as cores e a data. A nossa equipa cria um design exclusivo e acompanha cada etapa até à entrega.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to="/contato">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90">
                    Pedir proposta personalizada
                  </Button>
                </Link>
                <Link to="/catalogo">
                  <Button size="lg" variant="outline" className="w-full border-white/40 text-white hover:bg-white/10 sm:w-auto">
                    Ver coleções prontas
                  </Button>
                </Link>
              </div>
            </div>
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-white/30" />
            <div className="absolute -bottom-12 left-12 h-24 w-24 rounded-full border border-white/20" />
          </div>
        </div>
      </section>
    </div>
  )
}
