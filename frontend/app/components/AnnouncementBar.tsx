import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative overflow-hidden bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-pulse"
    >
      <div className="container-xl flex items-center justify-between px-4 py-2 sm:py-3">
        <div className="flex flex-1 items-center justify-center gap-2 text-center">
          <span className="text-xs font-semibold text-white sm:text-sm">
            ✨ <strong>FRETE GRÁTIS</strong> em encomendas acima de €39 • Personalização incluída
          </span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 flex h-6 w-6 items-center justify-center rounded-full text-white transition hover:bg-white/20"
          aria-label="Fechar aviso"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  )
}