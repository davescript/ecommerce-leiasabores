/**
 * Sistema Automático de Sincronização R2 → D1
 * Sincroniza automaticamente imagens do R2 para produtos no banco
 */

import { Hono } from 'hono'
import type { WorkerBindings } from '../types/bindings'
import { getDb, dbSchema } from '../lib/db'
import { eq, like } from 'drizzle-orm'

const router = new Hono<{ Bindings: WorkerBindings }>()

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'svg', 'avif', 'gif'])
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * Sincronizar automaticamente produtos do R2
 * POST /api/r2-auto-sync?prefix=categoria&category=slug
 */
router.post('/sync', async (c) => {
  const token = c.req.query('token')
  const expectedToken = c.env.ADMIN_SEED_TOKEN || 'seed-topos-20251105'
  
  if (!token || token !== expectedToken) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = getDb(c.env as WorkerBindings)
  const { products, categories } = dbSchema

  const requestedPrefix = c.req.query('prefix') || c.env.R2_DEFAULT_PREFIX || ''
  const categorySlug = c.req.query('category') || requestedPrefix || 'geral'
  
  const normalizedPrefix = requestedPrefix
    .toString()
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
  const prefixForList = normalizedPrefix ? `${normalizedPrefix}/` : ''

  try {
    // Listar todos os objetos no R2 com o prefixo
    const list = await c.env.R2.list(prefixForList ? { prefix: prefixForList } : undefined)
    
    console.log(`🔄 Syncing R2 → D1: ${list.objects.length} objects found with prefix "${prefixForList}"`)

    const now = new Date().toISOString()
    let created = 0
    let updated = 0
    let skipped = 0

    // Verificar se a categoria existe, se não, criar
    let category = await db.query.categories.findFirst({
      where: eq(categories.slug, categorySlug),
    })

    if (!category) {
      const categoryId = `cat-${categorySlug}`
      await db.insert(categories).values({
        id: categoryId,
        name: categorySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        slug: categorySlug,
        description: `Categoria ${categorySlug}`,
        displayOrder: 0,
      })
      category = await db.query.categories.findFirst({
        where: eq(categories.slug, categorySlug),
      })
      console.log(`📁 Category created: ${categorySlug}`)
    }

    // Processar cada objeto
    for (const obj of list.objects) {
      if (!obj || !obj.key || obj.key.endsWith('/')) {
        skipped++
        continue
      }

      // Validar extensão
      const extension = obj.key.split('.').pop()?.toLowerCase()
      if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
        skipped++
        continue
      }

      // Validar tamanho
      if (obj.size && obj.size > MAX_FILE_SIZE) {
        console.warn(`⚠️ File too large, skipping: ${obj.key} (${obj.size} bytes)`)
        skipped++
        continue
      }

      const fileKey = obj.key
      const fileName = fileKey.split('/').pop() || fileKey
      
      // Gerar nome do produto a partir do nome do arquivo
      const productName = fileName
        .replace(/\.(jpeg|jpg|png|svg|webp|gif|avif)$/i, '')
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim()

      if (!productName || productName.length < 2) {
        skipped++
        continue
      }

      // Verificar se produto já existe (por nome ou por imagem)
      const existingByName = await db.query.products.findFirst({
        where: eq(products.name, productName),
      })

      const existingByImage = await db.query.products.findMany({
        where: like(products.images, `%${fileKey}%`),
      })

      const existing = existingByName || existingByImage[0]

      if (existing) {
        // Atualizar produto existente
        const currentImages = (existing.images as string[] | null) || []
        if (!currentImages.includes(fileKey)) {
          const updatedImages = [...currentImages, fileKey].slice(0, 10) // Máximo 10 imagens
          
          await db
            .update(products)
            .set({
              images: updatedImages,
              updatedAt: now,
              inStock: true, // Garantir que está em stock
            })
            .where(eq(products.id, existing.id))
          
          updated++
          console.log(`✅ Updated product: ${existing.name} (added image: ${fileKey})`)
        } else {
          skipped++
        }
      } else {
        // Criar novo produto
        const productId = crypto.randomUUID()
        
        // Tentar extrair preço do nome (ex: "topo-15-99" → 15.99)
        const priceMatch = productName.match(/(\d+)[,.](\d{2})/) || 
                          fileName.match(/(\d+)[,._-](\d{2})/)
        const basePrice = priceMatch 
          ? parseFloat(`${priceMatch[1]}.${priceMatch[2]}`)
          : 9.90

        await db.insert(products).values({
          id: productId,
          name: productName,
          description: `${productName} - Produto personalizado de alta qualidade`,
          shortDescription: `Produto ${productName.toLowerCase()}`,
          price: Math.max(0.01, Math.min(9999.99, basePrice)),
          originalPrice: basePrice > 9.90 ? basePrice * 1.2 : null,
          category: categorySlug,
          images: [fileKey],
          inStock: true,
          tags: [categorySlug, 'personalizado'],
          rating: 0,
          reviewCount: 0,
          createdAt: now,
          updatedAt: now,
        })

        created++
        console.log(`✨ Created product: ${productName} (${productId})`)
      }
    }

    return c.json({
      success: true,
      stats: {
        total: list.objects.length,
        created,
        updated,
        skipped,
      },
      category: categorySlug,
      prefix: prefixForList,
    })
  } catch (error) {
    console.error('❌ R2 auto-sync error:', error)
    return c.json({
      error: 'Erro ao sincronizar R2',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, 500)
  }
})

/**
 * Listar produtos que precisam de sincronização
 * GET /api/r2-auto-sync/status?prefix=categoria
 */
router.get('/status', async (c) => {
  const token = c.req.query('token')
  const expectedToken = c.env.ADMIN_SEED_TOKEN || 'seed-topos-20251105'
  
  if (!token || token !== expectedToken) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const requestedPrefix = c.req.query('prefix') || ''
  const normalizedPrefix = requestedPrefix
    .toString()
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
  const prefixForList = normalizedPrefix ? `${normalizedPrefix}/` : ''

  try {
    const list = await c.env.R2.list(prefixForList ? { prefix: prefixForList } : undefined)
    
    const imageKeys = list.objects
      .filter(obj => obj && obj.key && !obj.key.endsWith('/'))
      .map(obj => obj.key!)
      .filter(key => {
        const ext = key.split('.').pop()?.toLowerCase()
        return ext && ALLOWED_EXTENSIONS.has(ext)
      })

    return c.json({
      totalFiles: list.objects.length,
      imageFiles: imageKeys.length,
      images: imageKeys.slice(0, 50), // Primeiras 50 para preview
      prefix: prefixForList,
    })
  } catch (error) {
    console.error('❌ R2 status error:', error)
    return c.json({
      error: 'Erro ao listar R2',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, 500)
  }
})

export default router

