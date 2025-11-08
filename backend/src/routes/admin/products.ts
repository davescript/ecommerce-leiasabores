import { Hono } from 'hono'
import { eq, and, like, or, desc, asc, sql } from 'drizzle-orm'
import type { WorkerBindings } from '../../types/bindings'
import { AdminJWTPayload } from '../../middleware/adminAuth'
import { adminAuthMiddleware, createAuditLog, getRequestInfo, requirePermission } from '../../middleware/adminAuth'
import { getDb } from '../../lib/db'
import { products, productVariants, categories, productCategories, productImages } from '../../models/schema'
import { productUpdateSchema } from '../../validators/product'
import { generateId } from '../../utils/id'
import { bustProductCache } from '../../utils/cache'

const productsRouter = new Hono<{ Bindings: WorkerBindings; Variables: { adminUser?: AdminJWTPayload } }>()

// All routes require authentication
productsRouter.use('*', adminAuthMiddleware)

/**
 * GET /api/v1/admin/products
 * List products with pagination, filters, and search
 */
productsRouter.get('/', requirePermission('products:read'), async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const search = c.req.query('search') || ''
    const category = c.req.query('category') || ''
    const inStock = c.req.query('inStock')
    const sortBy = c.req.query('sortBy') || 'createdAt'
    const sortOrder = c.req.query('sortOrder') || 'desc'

    const db = getDb(c.env)
    const offset = (page - 1) * limit

    // Build where conditions
    const conditions = []
    if (search) {
      conditions.push(
        or(
          like(products.name, `%${search}%`),
          like(products.description, `%${search}%`)
        )
      )
    }
    if (category) {
      conditions.push(eq(products.category, category))
    }
    if (inStock !== undefined) {
      conditions.push(eq(products.inStock, inStock === 'true'))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Get products - map sortBy to actual column
    const sortMap: Record<string, any> = {
      name: products.name,
      price: products.price,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      category: products.category,
    }
    const sortColumn = sortMap[sortBy] || products.createdAt
    const orderBy = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn)

    const productsList = await db.query.products.findMany({
      where: whereClause,
      orderBy: [orderBy],
      limit,
      offset,
    })

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(whereClause)
      .get()

    const total = totalResult?.count || 0

    // Get variants, images, and categories for each product
    const productsWithDetails = await Promise.all(
      productsList.map(async (product) => {
        const variants = await db.query.productVariants.findMany({
          where: eq(productVariants.productId, product.id),
        })
        const images = await db.query.productImages.findMany({
          where: eq(productImages.productId, product.id),
          orderBy: [asc(productImages.sortOrder)],
        })
        const productCategoryAssociations = await db.query.productCategories.findMany({
          where: eq(productCategories.productId, product.id),
        })
        const categoryIds = productCategoryAssociations.map(pc => pc.categoryId)
        const productCategoriesList = categoryIds.length > 0
          ? await db.query.categories.findMany({
              where: or(...categoryIds.map(cid => eq(categories.id, cid))),
            })
          : []
        return { ...product, variants, images, categories: productCategoriesList }
      })
    )

    return c.json({
      products: productsWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List products error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * GET /api/v1/admin/products/:id
 * Get product by ID
 */
productsRouter.get('/:id', requirePermission('products:read'), async (c) => {
  try {
    const id = c.req.param('id')
    const db = getDb(c.env)

    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    })

    if (!product) {
      return c.json({ error: 'Product not found' }, 404)
    }

    // Get variants
    const variants = await db.query.productVariants.findMany({
      where: eq(productVariants.productId, id),
    })

    // Get category info
    const categoryInfo = await db.query.categories.findFirst({
      where: eq(categories.slug, product.category),
    })

    return c.json({
      ...product,
      variants,
      categoryInfo: categoryInfo || null,
    })
  } catch (error) {
    console.error('Get product error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * POST /api/v1/admin/products
 * Create new product
 */
productsRouter.post('/', requirePermission('products:write'), async (c) => {
  try {
    const body = await c.req.json()
    const adminUser = c.get('adminUser')!
    const db = getDb(c.env)

    const {
      name,
      description,
      shortDescription,
      price,
      originalPrice,
      category,
      images,
      inStock,
      stock,
      tags,
      variants,
    } = body

    if (!name || !price || !category) {
      return c.json({ error: 'Name, price, and category are required' }, 400)
    }

    // Verify category exists (accept slug or id)
    let categorySlug = category
    const categoryExists = await db.query.categories.findFirst({
      where: or(
        eq(categories.slug, category),
        eq(categories.id, category)
      ),
    })

    if (categoryExists) {
      categorySlug = categoryExists.slug
    }

    const productId = generateId('prod')
    const now = new Date().toISOString()

    // Create product
    await db.insert(products).values({
      id: productId,
      name,
      description: description || null,
      shortDescription: shortDescription || null,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      category: categorySlug,
      images: images || [],
      inStock: inStock !== false,
      stock: stock ? parseInt(stock) : null,
      tags: tags || [],
      rating: 0,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    })

    // Create variants if provided
    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        const variantId = generateId('var')
        await db.insert(productVariants).values({
          id: variantId,
          productId,
          name: variant.name,
          value: variant.value,
          priceModifier: variant.priceModifier || 0,
          stock: variant.stock ? parseInt(variant.stock) : null,
          sku: variant.sku || null,
          createdAt: now,
          updatedAt: now,
        })
      }
    }

    // Handle product categories (many-to-many) if provided
    const rawBodyCategories = (body as any).categories
    if (rawBodyCategories && Array.isArray(rawBodyCategories)) {
      if (rawBodyCategories.length > 0) {
        const categoryAssociations = rawBodyCategories.map((categoryId: string) => ({
          productId,
          categoryId,
        }))
        await db.insert(productCategories).values(categoryAssociations)
      }
    }

    // Bust cache
    await bustProductCache(c.env, productId)

    // Audit log
    await createAuditLog(c.env, {
      adminUserId: adminUser.adminUserId,
      action: 'create',
      resource: 'product',
      resourceId: productId,
      details: { name, price, category: categorySlug },
      ...getRequestInfo(c as any),
    })

    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    })

    // Get variants and categories
    const productVariantsList = await db.query.productVariants.findMany({
      where: eq(productVariants.productId, productId),
    })

    const productCategoryAssociations = await db.query.productCategories.findMany({
      where: eq(productCategories.productId, productId),
    })
    const categoryIds = productCategoryAssociations.map(pc => pc.categoryId)
    const productCategoriesList = categoryIds.length > 0
      ? await db.query.categories.findMany({
          where: or(...categoryIds.map(cid => eq(categories.id, cid))),
        })
      : []

    return c.json({
      ...product,
      variants: productVariantsList,
      categories: productCategoriesList,
    }, 201)
  } catch (error) {
    console.error('Create product error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * PUT /api/v1/admin/products/:id
 * Update product by ID with full validation and variant support
 */
productsRouter.put('/:id', requirePermission('products:write'), async (c) => {
  try {
    const id = c.req.param('id')
    const rawBody = await c.req.json()
    const adminUser = c.get('adminUser')!
    const db = getDb(c.env)

    // Validate ID
    if (!id || id.trim() === '') {
      return c.json({ error: 'Product ID is required' }, 400)
    }

    // Check if product exists
    const existingProduct = await db.query.products.findFirst({
      where: eq(products.id, id),
    })

    if (!existingProduct) {
      return c.json({ error: 'Product not found' }, 404)
    }

    // Validate input with Zod (partial update allowed)
    const validationResult = productUpdateSchema.safeParse({
      ...rawBody,
      id,
    })

    if (!validationResult.success) {
      return c.json({
        error: 'Validation error',
        details: validationResult.error.errors,
      }, 400)
    }

    const body = validationResult.data

    // Verify category if changed
    let categorySlug = existingProduct.category
    if (body.category && body.category !== existingProduct.category) {
      const categoryExists = await db.query.categories.findFirst({
        where: or(
          eq(categories.slug, body.category),
          eq(categories.id, body.category)
        ),
      })

      if (!categoryExists) {
        return c.json({ error: 'Category not found' }, 400)
      }
      categorySlug = categoryExists.slug
    }

    // Prepare update data
    const updateData: Partial<typeof products.$inferInsert> = {
      updatedAt: new Date().toISOString(),
    }

    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description || null
    if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription || null
    if (body.price !== undefined) {
      const priceValue = parseFloat(body.price.toString())
      if (priceValue > 0) {
        updateData.price = priceValue
      } else {
        return c.json({ error: 'Preço deve ser maior que zero' }, 400)
      }
    }
    if (body.originalPrice !== undefined) updateData.originalPrice = body.originalPrice ? parseFloat(body.originalPrice.toString()) : null
    if (body.category !== undefined) updateData.category = categorySlug
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.sku !== undefined) updateData.sku = body.sku
    if (body.status !== undefined) updateData.status = body.status
    if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle
    if (body.seoDescription !== undefined) updateData.seoDescription = body.seoDescription
    if (body.stockMinAlert !== undefined) updateData.stockMinAlert = body.stockMinAlert
    if (body.images !== undefined) {
      // Handle images: convert objects to URLs, keep strings as-is
      const imageUrls = body.images.map((img: any) => {
        if (typeof img === 'string') return img
        if (typeof img === 'object' && img.url) return img.url
        return img
      }).filter(Boolean)
      updateData.images = imageUrls
    }
    if (body.inStock !== undefined) updateData.inStock = body.inStock
    if (body.stock !== undefined) updateData.stock = body.stock
    if (body.tags !== undefined) updateData.tags = body.tags

    // Update product
    await db.update(products)
      .set(updateData)
      .where(eq(products.id, id))

    // Handle variants if provided
    if (body.variants !== undefined) {
      // Delete existing variants
      await db.delete(productVariants).where(eq(productVariants.productId, id))

      // Insert new variants
      if (body.variants.length > 0) {
        const now = new Date().toISOString()
        const variantsToInsert = body.variants.map((variant: any) => {
          const variantId = variant.id || generateId('var')
          return {
            id: variantId,
            productId: id,
            name: variant.name,
            value: variant.value,
            priceModifier: variant.priceModifier || 0,
            stock: variant.stock !== undefined ? variant.stock : null,
            sku: variant.sku || null,
            createdAt: now,
            updatedAt: now,
          }
        })

        await db.insert(productVariants).values(variantsToInsert)
      }
    }

    // Handle product categories (many-to-many) if provided
    if (body.categories !== undefined && Array.isArray(body.categories)) {
      // Delete existing category associations
      await db.delete(productCategories).where(eq(productCategories.productId, id))

      // Insert new category associations
      if (body.categories.length > 0) {
        const categoryAssociations = body.categories.map((categoryId: string) => ({
          productId: id,
          categoryId,
        }))
        await db.insert(productCategories).values(categoryAssociations)
      }
    }

    // Bust cache
    await bustProductCache(c.env, id)

    // Audit log
    await createAuditLog(c.env, {
      adminUserId: adminUser.adminUserId,
      action: 'update',
      resource: 'product',
      resourceId: id,
      details: {
        name: body.name || existingProduct.name,
        changes: Object.keys(body).filter(k => !['id', 'variants', 'categories'].includes(k)),
      },
      ...getRequestInfo(c as any),
    })

    // Fetch updated product with variants and categories
    const updatedProduct = await db.query.products.findFirst({
      where: eq(products.id, id),
    })

    if (!updatedProduct) {
      return c.json({ error: 'Failed to fetch updated product' }, 500)
    }

    // Get variants
    const variants = await db.query.productVariants.findMany({
      where: eq(productVariants.productId, id),
    })

    // Get product images
    const images = await db.query.productImages.findMany({
      where: eq(productImages.productId, id),
      orderBy: [asc(productImages.sortOrder)],
    })

    // Get categories
    const productCategoryAssociations = await db.query.productCategories.findMany({
      where: eq(productCategories.productId, id),
    })
    const categoryIds = productCategoryAssociations.map(pc => pc.categoryId)
    const productCategoriesList = categoryIds.length > 0
      ? await db.query.categories.findMany({
          where: or(...categoryIds.map(cid => eq(categories.id, cid))),
        })
      : []

    // Get main category info (legacy)
    const categoryInfo = await db.query.categories.findFirst({
      where: eq(categories.slug, updatedProduct.category),
    })

    return c.json({
      ...updatedProduct,
      variants,
      images,
      categories: productCategoriesList,
      categoryInfo: categoryInfo || null,
    })
  } catch (error: any) {
    console.error('Update product error:', error)
    console.error('Error stack:', error.stack)
    return c.json({
      error: 'Internal server error',
      message: error.message || 'Unknown error',
    }, 500)
  }
})

/**
 * DELETE /api/v1/admin/products/:id
 * Delete product
 */
productsRouter.delete('/:id', requirePermission('products:delete'), async (c) => {
  try {
    const id = c.req.param('id')
    const adminUser = c.get('adminUser')!
    const db = getDb(c.env)

    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    })

    if (!product) {
      return c.json({ error: 'Product not found' }, 404)
    }

    // Delete variants first
    await db.delete(productVariants).where(eq(productVariants.productId, id))

    // Delete product categories
    await db.delete(productCategories).where(eq(productCategories.productId, id))

    // Get product images before deleting from database
    const productImagesList = await db.query.productImages.findMany({
      where: eq(productImages.productId, id),
    })

    // Delete product images from database
    await db.delete(productImages).where(eq(productImages.productId, id))

    // Delete images from R2 (non-fatal - continue even if R2 deletion fails)
    if (productImagesList.length > 0) {
      try {
        const { deleteFromR2 } = await import('../../utils/r2-upload')
        await Promise.all(
          productImagesList.map(image => 
            deleteFromR2(c.env.R2 as any, image.r2Key).catch((err: any) => {
              console.error(`Failed to delete R2 image ${image.r2Key}:`, err)
              // Continue even if individual image deletion fails
            })
          )
        )
      } catch (error: any) {
        console.error('Error deleting product images from R2:', error)
        // Continue with product deletion even if R2 cleanup fails
      }
    }

    // Delete product
    await db.delete(products).where(eq(products.id, id))

    // Bust cache
    await bustProductCache(c.env, id)

    // Audit log
    await createAuditLog(c.env, {
      adminUserId: adminUser.adminUserId,
      action: 'delete',
      resource: 'product',
      resourceId: id,
      details: { name: product.name },
      ...getRequestInfo(c as any),
    })

    return c.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Delete product error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * POST /api/v1/admin/products/:id/variants
 * Create product variant
 */
productsRouter.post('/:id/variants', requirePermission('products:write'), async (c) => {
  try {
    const productId = c.req.param('id')
    const body = await c.req.json()
    const db = getDb(c.env)

    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    })

    if (!product) {
      return c.json({ error: 'Product not found' }, 404)
    }

    const { name, value, priceModifier, stock, sku } = body

    if (!name || !value) {
      return c.json({ error: 'Name and value are required' }, 400)
    }

    const variantId = generateId('var')
    const now = new Date().toISOString()

    await db.insert(productVariants).values({
      id: variantId,
      productId,
      name,
      value,
      priceModifier: priceModifier || 0,
      stock: stock ? parseInt(stock) : null,
      sku: sku || null,
      createdAt: now,
      updatedAt: now,
    })

    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, variantId),
    })

    // Bust cache for the product (variants affect product display)
    await bustProductCache(c.env, productId)

    return c.json(variant, 201)
  } catch (error) {
    console.error('Create variant error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * PUT /api/v1/admin/products/variants/:id
 * Update product variant
 */
productsRouter.put('/variants/:id', requirePermission('products:write'), async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const db = getDb(c.env)

    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, id),
    })

    if (!variant) {
      return c.json({ error: 'Variant not found' }, 404)
    }

    await db.update(productVariants)
      .set({
        name: body.name !== undefined ? body.name : variant.name,
        value: body.value !== undefined ? body.value : variant.value,
        priceModifier: body.priceModifier !== undefined ? body.priceModifier : variant.priceModifier,
        stock: body.stock !== undefined ? (body.stock ? parseInt(body.stock) : null) : variant.stock,
        sku: body.sku !== undefined ? body.sku : variant.sku,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(productVariants.id, id))

    const updatedVariant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, id),
    })

    // Bust cache for the product (variants affect product display)
    await bustProductCache(c.env, variant.productId)

    return c.json(updatedVariant)
  } catch (error) {
    console.error('Update variant error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * DELETE /api/v1/admin/products/variants/:id
 * Delete product variant
 */
productsRouter.delete('/variants/:id', requirePermission('products:write'), async (c) => {
  try {
    const id = c.req.param('id')
    const db = getDb(c.env)

    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, id),
    })

    if (!variant) {
      return c.json({ error: 'Variant not found' }, 404)
    }

    await db.delete(productVariants).where(eq(productVariants.id, id))

    // Bust cache for the product (variants affect product display)
    await bustProductCache(c.env, variant.productId)

    return c.json({ message: 'Variant deleted successfully' })
  } catch (error) {
    console.error('Delete variant error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default productsRouter

