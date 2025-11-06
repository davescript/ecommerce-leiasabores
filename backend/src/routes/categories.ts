import { Hono } from 'hono'
import { getDb, dbSchema } from '../lib/db'
import { eq } from 'drizzle-orm'
import type { WorkerBindings } from '../types/bindings'

const router = new Hono()

interface CategoryNode {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  children?: CategoryNode[]
}

router.get('/', async (c) => {
  try {
    const env = c.env as unknown as WorkerBindings
    const db = getDb({ DB: env.DB })

    const allCategories = await db.query.categories.findMany()

    const buildTree = (parentId?: string | null): CategoryNode[] => {
      return allCategories
        .filter((cat) => (parentId ? cat.parentId === parentId : !cat.parentId))
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        .map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: cat.image,
          children: buildTree(cat.id),
        }))
    }

    const tree = buildTree()

    return c.json({
      data: tree,
      total: allCategories.length,
    })
  } catch (error) {
    console.error('Error fetching categories', error)
    return c.json({ error: 'Failed to fetch categories' }, 500)
  }
})

router.get('/:slug', async (c) => {
  try {
    const slug = c.req.param('slug')
    const env = c.env as unknown as WorkerBindings
    const db = getDb({ DB: env.DB })
    const { categories } = dbSchema

    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
    })

    if (!category) {
      return c.json({ error: 'Category not found' }, 404)
    }

    const allCategories = await db.query.categories.findMany()
    const buildTree = (parentId?: string | null): CategoryNode[] => {
      return allCategories
        .filter((cat) => (parentId ? cat.parentId === parentId : !cat.parentId))
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        .map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: cat.image,
          children: buildTree(cat.id),
        }))
    }

    return c.json({
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
      },
      tree: buildTree(),
    })
  } catch (error) {
    console.error('Error fetching category', error)
    return c.json({ error: 'Failed to fetch category' }, 500)
  }
})

export default router
