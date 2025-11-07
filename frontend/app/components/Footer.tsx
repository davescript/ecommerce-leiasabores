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
    <footer className="mt-12 sm:mt-16 md:mt-20 bg-secondary text-white">
      <div className="container-xl py-8 sm:py-12 md:py-16">
        <div className="grid gap-8 sm:gap-10 md:gap-12 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary text-xs sm:text-sm font-semibold text-white flex-shrink-0">
                LS
              </div>
              <div>
                <p className="text-base sm:text-lg font-semibold">Leia Sabores</p>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/70">Doces que contam histórias</p>
              </div>
            </div>
            <p className="max-w-md text-xs sm:text-sm text-white/70 leading-relaxed">
              Topos personalizados, bolos artesanais e experiências que transformam celebrações em memórias.
              Produção própria em Lisboa, com ingredientes frescos e processos sustentáveis.
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-white/60">
              <span className="rounded-full bg-white/10 px-2.5 py-1 sm:px-3">Entrega express</span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 sm:px-3">Pagamentos Stripe</span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 sm:px-3">Design personalizado</span>
            </div>
          </div>

          <div className="grid gap-8 sm:gap-10 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider sm:tracking-widest text-white/80">Descubra</h4>
              <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-xs sm:text-sm text-white/70">
                {discoverLinks.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="transition hover:text-white touch-manipulation block py-1">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider sm:tracking-widest text-white/80">Apoio</h4>
              <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-xs sm:text-sm text-white/70">
                {supportLinks.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="transition hover:text-white touch-manipulation block py-1">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider sm:tracking-widest text-white/80">Contacte-nos</h4>
              <ul className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-white/70">
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <Phone size={14} className="mt-0.5 sm:mt-1 text-white/60 flex-shrink-0 sm:w-4 sm:h-4" />
                  <a href="tel:+351910000000" className="transition hover:text-white touch-manipulation">
                    +351 910 000 000
                  </a>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <Mail size={14} className="mt-0.5 sm:mt-1 text-white/60 flex-shrink-0 sm:w-4 sm:h-4" />
                  <a href="mailto:ola@leiasabores.pt" className="transition hover:text-white touch-manipulation break-all">
                    ola@leiasabores.pt
                  </a>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <MapPin size={14} className="mt-0.5 sm:mt-1 text-white/60 flex-shrink-0 sm:w-4 sm:h-4" />
                  <span className="leading-relaxed">
                    Rua das Doces Lembranças, 45<br />
                    Lisboa · Portugal
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider sm:tracking-widest text-white/80">Siga o sabor</h4>
              <p className="mt-2 text-[10px] sm:text-xs text-white/60 leading-relaxed">
                Bastidores da cozinha, novos lançamentos e inspirações para a sua comemoração.
              </p>
              <div className="mt-3 sm:mt-4 flex items-center gap-2.5 sm:gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/10 text-white transition active:scale-95 hover:bg-primary touch-manipulation"
                  aria-label="Facebook"
                >
                  <Facebook size={16} className="sm:w-[18px] sm:h-[18px]" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/10 text-white transition active:scale-95 hover:bg-primary touch-manipulation"
                  aria-label="Instagram"
                >
                  <Instagram size={16} className="sm:w-[18px] sm:h-[18px]" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/10 text-white transition active:scale-95 hover:bg-primary touch-manipulation"
                  aria-label="YouTube"
                >
                  <Youtube size={16} className="sm:w-[18px] sm:h-[18px]" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 md:mt-16 flex flex-col gap-2 sm:gap-3 border-t border-white/10 pt-4 sm:pt-6 text-[10px] sm:text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between leading-relaxed">
          <p>&copy; {new Date().getFullYear()} Leia Sabores · Produzido artesanalmente em Portugal.</p>
          <p className="hidden sm:block">Compras seguras com Stripe · Portes grátis acima de 39€ · Entregas em 24-48h.</p>
          <p className="sm:hidden">Stripe · Grátis acima de 39€ · 24-48h</p>
        </div>
      </div>
    </footer>
  )
}
