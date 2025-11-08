import { Hono } from 'hono'
import { eq, and, like, or, desc, asc, sql } from 'drizzle-orm'
import type { WorkerBindings } from '../../types/bindings'
import { AdminJWTPayload } from '../../middleware/adminAuth'
import { adminAuthMiddleware, createAuditLog, getRequestInfo, requirePermission } from '../../middleware/adminAuth'
import { getDb } from '../../lib/db'
import { products, productVariants, categories } from '../../models/schema'

const productsRouter = new Hono<{ Bindings: WorkerBindings; Variables: { adminUser?: AdminJWTPayload } }>()

productsRouter.use('*', adminAuthMiddleware)

/**
 * Helper: Generate slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * GET /api/v1/admin/products
 * List products with advanced filters
 */
productsRouter.get('/', requirePermission('products:read'), async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const search = c.req.query('search') || ''
    const category = c.req.query('category') || ''
    const inStock = c.req.query('inStock')
    const status = c.req.query('status') // 'active', 'inactive', 'draft'
    const sortBy = c.req.query('sortBy') || 'createdAt'
    const sortOrder = c.req.query('sortOrder') || 'desc'

    const db = getDb(c.env)
    const offset = (page - 1) * limit

    const conditions = []
    if (search) {
      conditions.push(
        or(
          like(products.name, `%${search}%`),
          like(products.description, `%${search}%`),
          like(products.shortDescription, `%${search}%`)
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

    // Get variants for each product
    const productsWithVariants = await Promise.all(
      productsList.map(async (product) => {
        const variants = await db.query.productVariants.findMany({
          where: eq(productVariants.productId, product.id),
        })
        return { ...product, variants }
      })
    )

    return c.json({
      products: productsWithVariants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('List products error:', error)
    return c.json({ error: 'Internal server error', message: error.message }, 500)
  }
})

/**
 * GET /api/v1/admin/products/:id
 * Get product by ID with full details
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
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, product.category),
    })

    return c.json({
      ...product,
      variants,
      categoryInfo: category || null,
    })
  } catch (error: any) {
    console.error('Get product error:', error)
    return c.json({ error: 'Internal server error', message: error.message }, 500)
  }
})

/**
 * POST /api/v1/admin/products
 * Create new product with all features
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
      seoTitle,
      seoDescription,
      slug,
      status = 'active',
    } = body

    if (!name || !price || !category) {
      return c.json({ error: 'Name, price, and category are required' }, 400)
    }

    // Generate slug if not provided
    const productSlug = slug || generateSlug(name)

    // Verify category exists
    const categoryExists = await db.query.categories.findFirst({
      where: or(
        eq(categories.slug, category),
        eq(categories.id, category)
      ),
    })

    if (!categoryExists) {
      return c.json({ error: 'Category not found' }, 400)
    }

    const productId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const now = new Date().toISOString()

    // Create product
    await db.insert(products).values({
      id: productId,
      name,
      description: description || null,
      shortDescription: shortDescription || null,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      category: categoryExists.slug, // Use category slug
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
        const variantId = `var_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
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

    // Audit log
    await createAuditLog(c.env, {
      adminUserId: adminUser.adminUserId,
      action: 'create',
      resource: 'product',
      resourceId: productId,
      details: { name, price, category: categoryExists.slug },
      ...getRequestInfo(c as any),
    })

    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    })

    return c.json(product, 201)
  } catch (error: any) {
    console.error('Create product error:', error)
    return c.json({ error: 'Internal server error', message: error.message }, 500)
  }
})

/**
 * PUT /api/v1/admin/products/:id
 * Update product with all fields
 */
productsRouter.put('/:id', requirePermission('products:write'), async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const adminUser = c.get('adminUser')!
    const db = getDb(c.env)

    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    })

    if (!product) {
      return c.json({ error: 'Product not found' }, 404)
    }

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
    } = body

    // Verify category if changed
    let categorySlug = product.category
    if (category && category !== product.category) {
      const categoryExists = await db.query.categories.findFirst({
        where: or(
          eq(categories.slug, category),
          eq(categories.id, category)
        ),
      })

      if (!categoryExists) {
        return c.json({ error: 'Category not found' }, 400)
      }
      categorySlug = categoryExists.slug
    }

    // Update product
    await db.update(products)
      .set({
        name: name !== undefined ? name : product.name,
        description: description !== undefined ? description : product.description,
        shortDescription: shortDescription !== undefined ? shortDescription : product.shortDescription,
        price: price !== undefined ? parseFloat(price) : product.price,
        originalPrice: originalPrice !== undefined ? (originalPrice ? parseFloat(originalPrice) : null) : product.originalPrice,
        category: categorySlug,
        images: images !== undefined ? images : product.images,
        inStock: inStock !== undefined ? inStock : product.inStock,
        stock: stock !== undefined ? (stock ? parseInt(stock) : null) : product.stock,
        tags: tags !== undefined ? tags : product.tags,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(products.id, id))

    // Audit log
    await createAuditLog(c.env, {
      adminUserId: adminUser.adminUserId,
      action: 'update',
      resource: 'product',
      resourceId: id,
      details: Object.keys(body),
      ...getRequestInfo(c as any),
    })

    const updatedProduct = await db.query.products.findFirst({
      where: eq(products.id, id),
    })

    return c.json(updatedProduct)
  } catch (error: any) {
    console.error('Update product error:', error)
    return c.json({ error: 'Internal server error', message: error.message }, 500)
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

    // Delete product
    await db.delete(products).where(eq(products.id, id))

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
  } catch (error: any) {
    console.error('Delete product error:', error)
    return c.json({ error: 'Internal server error', message: error.message }, 500)
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

    const variantId = `var_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
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

    return c.json(variant, 201)
  } catch (error: any) {
    console.error('Create variant error:', error)
    return c.json({ error: 'Internal server error', message: error.message }, 500)
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

    return c.json(updatedVariant)
  } catch (error: any) {
    console.error('Update variant error:', error)
    return c.json({ error: 'Internal server error', message: error.message }, 500)
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

    return c.json({ message: 'Variant deleted successfully' })
  } catch (error: any) {
    console.error('Delete variant error:', error)
    return c.json({ error: 'Internal server error', message: error.message }, 500)
  }
})

export default productsRouter

