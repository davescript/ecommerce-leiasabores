import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingCart, Menu, X, PhoneCall } from 'lucide-react'
import { useCartStore } from '@hooks/useCart'
import type { CartItem } from '@types'
import { CartDrawer } from '@components/CartDrawer'
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
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container-xl">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-base font-semibold text-white shadow-soft">
              LS
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-secondary md:text-lg">Leia Sabores</span>
              <span className="text-[11px] uppercase tracking-[0.2em] text-gray-400 md:text-xs">
                Bolos &amp; Topos Personalizados
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-secondary md:flex">
            {menuLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="rounded-full px-3 py-2 transition-colors hover:bg-primary/5 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-light text-secondary transition hover:bg-primary/10"
              aria-label="Buscar produtos"
            >
              <Search size={18} />
            </motion.button>

            <CartDrawer>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90"
                aria-label="Abrir carrinho"
              >
                <ShoppingCart size={18} />
                {cartItemsCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white shadow-soft">
                    {cartItemsCount}
                  </span>
                )}
              </motion.button>
            </CartDrawer>

            <button
              className="hidden h-10 items-center gap-2 rounded-full border border-primary/20 px-3 text-sm font-medium text-primary transition hover:border-primary/40 hover:bg-primary/5 sm:flex"
              aria-label="Contactar equipa"
            >
              <PhoneCall size={16} />
              Apoio
            </button>

            <button
              onClick={() => setIsMenuOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-secondary transition hover:border-primary/40 hover:text-primary md:hidden"
              aria-label="Abrir menu"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border-t border-white/30 bg-white/90 py-3 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70"
          >
            <div className="container-xl">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="search"
                  placeholder="Pesquisar por sabores, temas ou nomes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 rounded-full border-gray-200 pr-12 shadow-inner focus:border-primary focus:ring-primary/20"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90"
                >
                  <Search size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white px-6 pb-10 pt-8 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white">
                    LS
                  </div>
                  <div>
                    <p className="text-base font-semibold text-secondary">Leia Sabores</p>
                    <p className="text-xs text-gray-500">Doces momentos para celebrar</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-secondary transition hover:text-primary"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-8 space-y-2">
                {menuLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-2xl border border-transparent bg-light px-4 py-3 text-sm font-semibold text-secondary transition hover:border-primary/10 hover:bg-primary/5 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-10 space-y-3 rounded-2xl border border-primary/10 bg-primary/5 p-5">
                <p className="text-sm font-semibold text-secondary">Precisa de ajuda para escolher?</p>
                <p className="text-sm text-gray-600">
                  Fale com a nossa equipa e receba sugestões personalizadas para o seu evento.
                </p>
                <a
                  href="tel:+351910000000"
                  className="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
                >
                  <PhoneCall size={16} />
                  +351 910 000 000
                </a>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
