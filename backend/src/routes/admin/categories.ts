import { Hono } from 'hono'
import { eq, asc } from 'drizzle-orm'
import type { WorkerBindings } from '../../types/bindings'
import { AdminJWTPayload } from '../../middleware/adminAuth'
import { adminAuthMiddleware, createAuditLog, getRequestInfo, requirePermission } from '../../middleware/adminAuth'
import { getDb } from '../../lib/db'
import { categories } from '../../models/schema'
import { bustCategoryCache } from '../../utils/cache'
import { generateId } from '../../utils/id'

const categoriesRouter = new Hono<{ Bindings: WorkerBindings; Variables: { adminUser?: AdminJWTPayload } }>()

categoriesRouter.use('*', adminAuthMiddleware)

/**
 * GET /api/v1/admin/categories
 * List all categories
 */
categoriesRouter.get('/', requirePermission('categories:read'), async (c) => {
  try {
    const db = getDb(c.env)

    // Query categories - handle missing columns gracefully
    let categoriesList
    try {
      categoriesList = await db.query.categories.findMany({
        orderBy: [asc(categories.displayOrder), asc(categories.name)],
      })
    } catch (queryError: any) {
      // If displayOrder doesn't exist, try without it
      if (queryError.message?.includes('displayOrder') || queryError.message?.includes('no such column')) {
        categoriesList = await db.query.categories.findMany({
          orderBy: [asc(categories.name)],
        })
      } else {
        throw queryError
      }
    }

    // Ensure all categories have required fields with defaults
    const normalizedCategories = categoriesList.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || null,
      image: cat.image || null,
      parentId: cat.parentId || null,
      displayOrder: (cat as any).displayOrder || 0,
      createdAt: (cat as any).createdAt || new Date().toISOString(),
      updatedAt: (cat as any).updatedAt || new Date().toISOString(),
    }))

    // Build tree structure
    const categoryMap = new Map()
    const rootCategories: any[] = []

    // First pass: create map
    normalizedCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] })
    })

    // Second pass: build tree
    normalizedCategories.forEach(cat => {
      const category = categoryMap.get(cat.id)
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId)
        if (parent) {
          parent.children.push(category)
        } else {
          rootCategories.push(category)
        }
      } else {
        rootCategories.push(category)
      }
    })

    return c.json({ categories: rootCategories, flat: normalizedCategories })
  } catch (error: any) {
    console.error('List categories error:', error)
    console.error('Error details:', error.message, error.stack)
    return c.json({ 
      error: 'Internal server error',
      message: error.message || 'Unknown error',
      details: process.env.ENVIRONMENT === 'development' ? error.stack : undefined
    }, 500)
  }
})

/**
 * GET /api/v1/admin/categories/:id
 * Get category by ID
 */
categoriesRouter.get('/:id', requirePermission('categories:read'), async (c) => {
  try {
    const id = c.req.param('id')
    const db = getDb(c.env)

    const category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    })

    if (!category) {
      return c.json({ error: 'Category not found' }, 404)
    }

    return c.json(category)
  } catch (error) {
    console.error('Get category error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * POST /api/v1/admin/categories
 * Create category
 */
categoriesRouter.post('/', requirePermission('categories:write'), async (c) => {
  try {
    const body = await c.req.json()
    const adminUser = c.get('adminUser')!
    const db = getDb(c.env)

    const { name, slug, description, image, parentId, displayOrder } = body

    if (!name || !slug) {
      return c.json({ error: 'Name and slug are required' }, 400)
    }

    // Check if slug already exists
    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
    })

    if (existing) {
      return c.json({ error: 'Slug already exists' }, 400)
    }

    const categoryId = generateId('cat')
    const now = new Date().toISOString()

    await db.insert(categories).values({
      id: categoryId,
      name,
      slug,
      description: description || null,
      image: image || null,
      parentId: parentId || null,
      displayOrder: displayOrder || 0,
      createdAt: now,
      updatedAt: now,
    })

    // Bust cache
    await bustCategoryCache(c.env)

    // Audit log
    await createAuditLog(c.env, {
      adminUserId: adminUser.adminUserId,
      action: 'create',
      resource: 'category',
      resourceId: categoryId,
      details: { name, slug },
      ...getRequestInfo(c as any),
    })

    const category = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
    })

    return c.json(category, 201)
  } catch (error) {
    console.error('Create category error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * PUT /api/v1/admin/categories/:id
 * Update category
 */
categoriesRouter.put('/:id', requirePermission('categories:write'), async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const adminUser = c.get('adminUser')!
    const db = getDb(c.env)

    const category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    })

    if (!category) {
      return c.json({ error: 'Category not found' }, 404)
    }

    const { name, slug, description, image, parentId, displayOrder } = body

    // Check slug uniqueness if changed
    if (slug && slug !== category.slug) {
      const existing = await db.query.categories.findFirst({
        where: eq(categories.slug, slug),
      })

      if (existing) {
        return c.json({ error: 'Slug already exists' }, 400)
      }
    }

    await db.update(categories)
      .set({
        name: name !== undefined ? name : category.name,
        slug: slug !== undefined ? slug : category.slug,
        description: description !== undefined ? description : category.description,
        image: image !== undefined ? image : category.image,
        parentId: parentId !== undefined ? parentId : category.parentId,
        displayOrder: displayOrder !== undefined ? displayOrder : category.displayOrder,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(categories.id, id))

    // Bust cache
    await bustCategoryCache(c.env)

    // Audit log
    await createAuditLog(c.env, {
      adminUserId: adminUser.adminUserId,
      action: 'update',
      resource: 'category',
      resourceId: id,
      details: body,
      ...getRequestInfo(c as any),
    })

    const updatedCategory = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    })

    return c.json(updatedCategory)
  } catch (error) {
    console.error('Update category error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * DELETE /api/v1/admin/categories/:id
 * Delete category
 */
categoriesRouter.delete('/:id', requirePermission('categories:delete'), async (c) => {
  try {
    const id = c.req.param('id')
    const adminUser = c.get('adminUser')!
    const db = getDb(c.env)

    const category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    })

    if (!category) {
      return c.json({ error: 'Category not found' }, 404)
    }

    // Check if category has children
    const children = await db.query.categories.findMany({
      where: eq(categories.parentId, id),
    })

    if (children.length > 0) {
      return c.json({ error: 'Cannot delete category with subcategories' }, 400)
    }

    await db.delete(categories).where(eq(categories.id, id))

    // Bust cache
    await bustCategoryCache(c.env)

    // Audit log
    await createAuditLog(c.env, {
      adminUserId: adminUser.adminUserId,
      action: 'delete',
      resource: 'category',
      resourceId: id,
      details: { name: category.name },
      ...getRequestInfo(c as any),
    })

    return c.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Delete category error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * PUT /api/v1/admin/categories/reorder
 * Reorder categories
 */
categoriesRouter.put('/reorder', requirePermission('categories:write'), async (c) => {
  try {
    const { items } = await c.req.json() // [{ id, displayOrder }, ...]
    const db = getDb(c.env)

    if (!Array.isArray(items)) {
      return c.json({ error: 'Items must be an array' }, 400)
    }

    for (const item of items) {
      await db.update(categories)
        .set({
          displayOrder: item.displayOrder,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(categories.id, item.id))
    }

    // Bust cache
    await bustCategoryCache(c.env)

    return c.json({ message: 'Categories reordered successfully' })
  } catch (error) {
    console.error('Reorder categories error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default categoriesRouter

