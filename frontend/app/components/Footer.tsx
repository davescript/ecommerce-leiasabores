import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react'

const discoverLinks = [
  { label: 'Início', to: '/' },
  { label: 'Catálogo', to: '/catalogo' },
  { label: 'Sobre nós', to: '/sobre' },
  { label: 'Contato', to: '/contato' },
]

const supportLinks = [
  { label: 'Perguntas Frequentes', to: '/faq' },
  { label: 'Política de Privacidade', to: '/politica-privacidade' },
  { label: 'Termos & Condições', to: '/termos' },
  { label: 'Envios e Devoluções', to: '/envios' },
]

export function Footer() {
  return (
    <footer className="mt-20 bg-secondary text-white">
      <div className="container-xl py-16">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white">
                LS
              </div>
              <div>
                <p className="text-lg font-semibold">Leia Sabores</p>
                <p className="text-xs uppercase tracking-[0.25em] text-white/70">Doces que contam histórias</p>
              </div>
            </div>
            <p className="max-w-md text-sm text-white/70">
              Topos personalizados, bolos artesanais e experiências que transformam celebrações em memórias.
              Produção própria em Lisboa, com ingredientes frescos e processos sustentáveis.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
              <span className="rounded-full bg-white/10 px-3 py-1">Entrega express em Portugal</span>
              <span className="rounded-full bg-white/10 px-3 py-1">Pagamentos seguros Stripe</span>
              <span className="rounded-full bg-white/10 px-3 py-1">Design personalizado por encomenda</span>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-white/80">Descubra</h4>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                {discoverLinks.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-white/80">Apoio</h4>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                {supportLinks.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-white/80">Contacte-nos</h4>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                <li className="flex items-start gap-3">
                  <Phone size={16} className="mt-1 text-white/60" />
                  <a href="tel:+351910000000" className="transition hover:text-white">
                    +351 910 000 000
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={16} className="mt-1 text-white/60" />
                  <a href="mailto:ola@leiasabores.pt" className="transition hover:text-white">
                    ola@leiasabores.pt
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="mt-1 text-white/60" />
                  <span>
                    Rua das Doces Lembranças, 45<br />
                    Lisboa · Portugal
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-white/80">Siga o sabor</h4>
              <p className="mt-2 text-xs text-white/60">
                Bastidores da cozinha, novos lançamentos e inspirações para a sua comemoração.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-primary"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-primary"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-primary"
                >
                  <Youtube size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Leia Sabores · Produzido artesanalmente em Portugal.</p>
          <p>Compras seguras com Stripe · Portes grátis acima de 39€ · Entregas em 24-48h.</p>
        </div>
      </div>
    </footer>
  )
}
