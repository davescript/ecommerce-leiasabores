import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, ShoppingCart, Menu, X, PhoneCall } from 'lucide-react'
import { useCartStore } from '@hooks/useCart'
import type { CartItem } from '@types'
import { CartDrawer } from '@components/CartDrawer'
import { CategorySubmenu } from '@components/CategorySubmenu'
import { Input } from '@components/ui/input'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const cartItemsCount = useCartStore((state) =>
    state.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/catalogo?busca=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const menuLinks = [
    { href: '/', label: 'Início' },
    { href: '/catalogo', label: 'Catálogo' },
    { href: '/carrinho', label: 'Carrinho' },
    { href: '/checkout', label: 'Pagamentos' },
    { href: '/sobre', label: 'Sobre' },
    { href: '/contato', label: 'Contato' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 shadow-sm">
      <div className="container-xl">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-3">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary text-sm sm:text-base font-semibold text-white shadow-soft flex-shrink-0">
              LS
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base font-semibold text-secondary md:text-lg truncate">Leia Sabores</span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-gray-400 md:text-xs hidden xs:block">
                Bolos &amp; Topos
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-medium text-secondary md:flex">
            <Link
              to="/"
              className="rounded-full px-3 py-2 transition-colors hover:bg-primary/5 hover:text-primary"
            >
              Início
            </Link>
            <CategorySubmenu />
            {menuLinks.filter(link => link.href !== '/').map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="rounded-full px-3 py-2 transition-colors hover:bg-primary/5 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gray-50 text-secondary transition active:scale-95 hover:bg-primary/10 hover:text-primary touch-manipulation"
              aria-label="Buscar produtos"
            >
              <Search size={18} />
            </button>

            <CartDrawer>
              <button
                className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary text-white transition active:scale-95 hover:bg-primary/90 touch-manipulation"
                aria-label="Abrir carrinho"
              >
                <ShoppingCart size={18} />
                {cartItemsCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-accent text-[9px] sm:text-[10px] font-bold text-white shadow-soft">
                    {cartItemsCount > 9 ? '9+' : cartItemsCount}
                  </span>
                )}
              </button>
            </CartDrawer>

            <button
              className="hidden sm:flex h-10 items-center gap-2 rounded-full border border-primary/20 px-3 text-sm font-medium text-primary transition hover:border-primary/40 hover:bg-primary/5"
              aria-label="Contactar equipa"
            >
              <PhoneCall size={16} />
              <span className="hidden md:inline">Apoio</span>
            </button>

            <button
              onClick={() => setIsMenuOpen((value) => !value)}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-gray-200 text-secondary transition active:scale-95 hover:border-primary/40 hover:text-primary md:hidden touch-manipulation"
              aria-label="Abrir menu"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <div className="border-t border-gray-100 bg-white py-3">
          <div className="container-xl">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Pesquisar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 sm:h-12 rounded-full border-gray-200 pr-11 sm:pr-12 text-sm sm:text-base shadow-inner focus:border-primary focus:ring-primary/20"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-2 sm:right-3 top-1/2 flex h-7 w-7 sm:h-8 sm:w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white transition active:scale-95 hover:bg-primary/90 touch-manipulation"
                aria-label="Buscar"
              >
                <Search size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
              className="fixed right-0 top-0 z-50 h-full w-[min(320px,85vw)] overflow-y-auto bg-white px-4 sm:px-6 pb-6 pt-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white">
                    LS
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary">Leia Sabores</p>
                    <p className="text-[10px] text-gray-500">Doces momentos</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-secondary transition active:scale-95 hover:border-primary/40 hover:text-primary touch-manipulation"
                  aria-label="Fechar menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-1.5">
                {menuLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-xl border border-transparent bg-gray-50 px-4 py-3.5 text-sm font-semibold text-secondary transition active:scale-[0.98] hover:border-primary/20 hover:bg-primary/5 hover:text-primary touch-manipulation"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-8 space-y-3 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <p className="text-sm font-semibold text-secondary">Precisa de ajuda?</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Fale com a nossa equipa e receba sugestões personalizadas.
                </p>
                <a
                  href="tel:+351910000000"
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition active:scale-95 hover:bg-primary/90 touch-manipulation"
                >
                  <PhoneCall size={16} />
                  Ligar agora
                </a>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
