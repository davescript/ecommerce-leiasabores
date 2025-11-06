import { useEffect } from 'react'

interface SEOProps {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  ogType?: string
  keywords?: string
  author?: string
  robots?: string
}

const PUBLIC_R2 = 'https://pub-0bee0f99d33843b0919051e550f8e6b3.r2.dev'

export function useSEO({
  title,
  description,
  canonical,
  ogImage = `${PUBLIC_R2}/og/og-default.svg`,
  ogType = 'website',
  keywords,
  author = import.meta.env.VITE_APP_NAME || 'Leia Sabores',
  robots = 'index, follow',
}: SEOProps) {
  useEffect(() => {
    const siteName = import.meta.env.VITE_APP_NAME || 'Leia Sabores'
    document.title = `${title} | ${siteName}`

    const setMetaTag = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`) ||
                    document.querySelector(`meta[property="${name}"]`)

      if (!element) {
        element = document.createElement('meta')
        if (name.startsWith('og:')) {
          element.setAttribute('property', name)
        } else {
          element.setAttribute('name', name)
        }
        document.head.appendChild(element)
      }

      element.setAttribute('content', content)
    }

    setMetaTag('description', description)
    setMetaTag('keywords', keywords || 'artigos festa, balões, decorações, decoração eventos')
    setMetaTag('author', author)
    setMetaTag('robots', robots)
    setMetaTag('og:title', `${title} | ${siteName}`)
    setMetaTag('og:description', description)
    setMetaTag('og:image', ogImage)
    setMetaTag('og:type', ogType)
    setMetaTag('og:site_name', siteName)
    setMetaTag('twitter:title', `${title} | ${siteName}`)
    setMetaTag('twitter:description', description)
    setMetaTag('twitter:image', ogImage)
    setMetaTag('twitter:card', 'summary_large_image')

    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]')
      if (!canonicalLink) {
        canonicalLink = document.createElement('link')
        canonicalLink.setAttribute('rel', 'canonical')
        document.head.appendChild(canonicalLink)
      }
      canonicalLink.setAttribute('href', canonical)
    }
  }, [title, description, canonical, ogImage, ogType, keywords, author, robots])
}
