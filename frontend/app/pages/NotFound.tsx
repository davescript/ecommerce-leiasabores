import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search } from 'lucide-react'
import { Button } from '@components/Button'
import { useSEO } from '@hooks/useSEO'

export function NotFound() {
  useSEO({
    title: 'Página não encontrada · Leia Sabores',
    description: 'A página que procura não existe ou foi movida.',
    robots: 'noindex, nofollow',
  })

  return (
    <div className="min-h-screen bg-light flex items-center justify-center">
      <div className="container-xl py-12 sm:py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-md text-center"
        >
          <div className="mb-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Search className="h-10 w-10 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-secondary mb-4">
            404
          </h1>
          
          <h2 className="text-xl sm:text-2xl font-semibold text-secondary mb-3">
            Página não encontrada
          </h2>
          
          <p className="text-sm sm:text-base text-gray-600 mb-8">
            A página que procura não existe ou foi movida. Pode ter digitado incorretamente o endereço ou a página foi removida.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button size="lg" className="w-full sm:w-auto rounded-full">
                <Home className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Button>
            </Link>
            <Link to="/catalogo">
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full">
                <Search className="mr-2 h-4 w-4" />
                Explorar Catálogo
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-4">Páginas populares:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/catalogo" className="text-xs text-primary hover:underline">
                Catálogo
              </Link>
              <span className="text-gray-300">•</span>
              <Link to="/sobre" className="text-xs text-primary hover:underline">
                Sobre
              </Link>
              <span className="text-gray-300">•</span>
              <Link to="/contato" className="text-xs text-primary hover:underline">
                Contato
              </Link>
              <span className="text-gray-300">•</span>
              <Link to="/faq" className="text-xs text-primary hover:underline">
                FAQ
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

