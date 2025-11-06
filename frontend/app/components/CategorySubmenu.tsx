import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Sparkles, Cake, Gift, Package } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchCategories, type Category } from '@lib/api'
import { Link } from 'react-router-dom'

const categoryIcons: Record<string, React.ReactNode> = {
  'topos-de-bolo': <Sparkles className="h-5 w-5" />,
  'bolos-tematicos': <Cake className="h-5 w-5" />,
  'mesa-doce': <Gift className="h-5 w-5" />,
  'kits': <Package className="h-5 w-5" />,
}

export function CategorySubmenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const defaultCategories = [
    { id: '1', name: 'Topos Personalizados', slug: 'topos-de-bolo', description: 'Produção em 24h' },
    { id: '2', name: 'Bolos Temáticos', slug: 'bolos-tematicos', description: 'Sabores exclusivos' },
    { id: '3', name: 'Doces & Mesa', slug: 'mesa-doce', description: 'Macarons, brigadeiros' },
    { id: '4', name: 'Kits Completo', slug: 'kits', description: 'Tudo para a festa' },
  ]

  const displayCategories = categories && categories.length > 0 ? categories : defaultCategories

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-secondary transition-colors hover:bg-primary/5 hover:text-primary"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Categorias
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute left-0 right-0 z-50 mt-2 grid w-80 max-w-sm grid-cols-1 gap-2 rounded-2xl border border-white/40 bg-white/90 p-4 shadow-2xl backdrop-blur-xl md:w-96"
              onClick={(e) => e.stopPropagation()}
            >
              {displayCategories.map((category: any) => (
                <Link
                  key={category.id || category.slug}
                  to={`/catalogo?categoria=${category.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-3 rounded-xl border border-transparent bg-light/50 p-3 transition hover:border-primary/20 hover:bg-primary/5"
                >
                  <div className="mt-1 text-primary">
                    {categoryIcons[category.slug as string] || <Sparkles className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-secondary">{category.name}</p>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </div>
                </Link>
              ))}

              <div className="mt-2 border-t border-gray-100 pt-3">
                <Link
                  to="/catalogo"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
                >
                  Ver todas as categorias →
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}