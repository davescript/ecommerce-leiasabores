import { useState } from 'react'
import { ImageIcon } from 'lucide-react'

// Placeholder SVG como data URI (não depende de URLs externas)
const PLACEHOLDER_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f3f4f6"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">
    🍰
  </text>
</svg>
`)}`

interface SafeImageProps {
  src?: string | null
  alt: string
  className?: string
  fallback?: string
  onError?: () => void
  [key: string]: unknown
}

export function SafeImage({ 
  src, 
  alt, 
  className = '', 
  fallback = PLACEHOLDER_SVG,
  onError,
  ...props 
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallback)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError && imgSrc !== fallback) {
      setHasError(true)
      setImgSrc(fallback)
      onError?.()
    }
  }

  // Reset quando src mudar
  if (src && src !== imgSrc && !hasError) {
    setImgSrc(src)
    setHasError(false)
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
      decoding="async"
      {...props}
    />
  )
}

