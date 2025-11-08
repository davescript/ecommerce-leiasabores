import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import type { WorkerBindings } from '../../types/bindings'
import { AdminJWTPayload } from '../../middleware/adminAuth'
import { adminAuthMiddleware, requirePermission } from '../../middleware/adminAuth'
import { getDb } from '../../lib/db'
import { productImages } from '../../models/schema'
import { uploadToR2, generateProductImageKey, validateImageFile, deleteFromR2 } from '../../utils/r2-upload'
import { generateId } from '../../utils/id'
import { bustProductCache } from '../../utils/cache'

const uploadRouter = new Hono<{ Bindings: WorkerBindings; Variables: { adminUser?: AdminJWTPayload } }>()

uploadRouter.use('*', adminAuthMiddleware)

/**
 * POST /api/v1/admin/products/upload-image
 * Upload product image to R2
 */
uploadRouter.post('/upload-image', requirePermission('products:write'), async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File | null
    const productId = formData.get('productId') as string | null

    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }

    // Validate image file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return c.json({ error: validation.error }, 400)
    }

    // Generate unique key
    const key = generateProductImageKey(productId || 'temp', file.name)

    // Upload to R2
    const uploadResult = await uploadToR2({
      bucket: c.env.R2,
      file,
      key,
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        productId: productId || '',
      },
    })

    // Save to database if productId is provided
    if (productId) {
      const db = getDb(c.env)
      
      // Get current max sort order
      const existingImages = await db.query.productImages.findMany({
        where: eq(productImages.productId, productId),
      })
      const maxSortOrder = existingImages.length > 0
        ? Math.max(...existingImages.map(img => img.sortOrder || 0))
        : -1

      // Create image record
      const imageId = generateId('img')
      await db.insert(productImages).values({
        id: imageId,
        productId,
        r2Key: key,
        url: uploadResult.url,
        width: null, // Could be extracted from image metadata
        height: null,
        sortOrder: maxSortOrder + 1,
        createdAt: new Date().toISOString(),
      })

      // Bust cache
      await bustProductCache(c.env, productId)
    }

    return c.json({
      success: true,
      id: productId ? generateId('img') : null,
      key: uploadResult.key,
      url: uploadResult.url,
      size: uploadResult.size,
      type: file.type,
    })
  } catch (error: any) {
    console.error('Upload image error:', error)
    return c.json({
      error: 'Failed to upload image',
      message: error.message || 'Unknown error',
    }, 500)
  }
})

/**
 * DELETE /api/v1/admin/products/delete-image
 * Delete product image from R2
 */
uploadRouter.delete('/delete-image', requirePermission('products:write'), async (c) => {
  try {
    const { id, key, productId } = await c.req.json()

    if (!id && !key) {
      return c.json({ error: 'Image ID or key is required' }, 400)
    }

    const db = getDb(c.env)
    let imageKey = key
    let actualProductId = productId

    // If ID is provided, get image from database
    if (id) {
      const image = await db.query.productImages.findFirst({
        where: eq(productImages.id, id),
      })

      if (!image) {
        return c.json({ error: 'Image not found' }, 404)
      }

      imageKey = image.r2Key
      actualProductId = image.productId
    } else {
      // Remove 'api/r2/' prefix if present
      imageKey = key.replace(/^.*\/api\/r2\//, '')
    }

    // Delete from R2
    await deleteFromR2(c.env.R2, imageKey)

    // Delete from database if ID was provided
    if (id) {
      await db.delete(productImages).where(eq(productImages.id, id))
    } else if (actualProductId) {
      // Try to find and delete by key
      const image = await db.query.productImages.findFirst({
        where: eq(productImages.r2Key, imageKey),
      })
      if (image) {
        await db.delete(productImages).where(eq(productImages.id, image.id))
      }
    }

    // Bust cache if productId is known
    if (actualProductId) {
      await bustProductCache(c.env, actualProductId)
    }

    return c.json({ success: true, message: 'Image deleted successfully' })
  } catch (error: any) {
    console.error('Delete image error:', error)
    return c.json({
      error: 'Failed to delete image',
      message: error.message || 'Unknown error',
    }, 500)
  }
})

export default uploadRouter

