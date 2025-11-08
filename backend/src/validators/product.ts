import { z } from 'zod'

export const productVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome da variante é obrigatório'),
  value: z.string().min(1, 'Valor da variante é obrigatório'),
  priceModifier: z.number().default(0),
  stock: z.number().nullable().optional(),
  sku: z.string().nullable().optional(),
})

// Base product schema without refinements (for partial updates)
const productSchemaBase = z.object({
  name: z.string().min(1, 'Nome do produto é obrigatório').max(200, 'Nome muito longo'),
  description: z.string().nullable().optional(),
  shortDescription: z.string().max(500, 'Descrição curta muito longa').nullable().optional(),
  price: z.number().min(0.01, 'Preço deve ser maior que zero').max(99999.99, 'Preço muito alto'),
  originalPrice: z.number().nullable().optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  images: z.array(z.string().url('URL de imagem inválida')).default([]),
  inStock: z.boolean().default(true),
  stock: z.number().int().min(0).nullable().optional(),
  tags: z.array(z.string()).default([]),
  variants: z.array(productVariantSchema).default([]),
  status: z.enum(['active', 'inactive', 'draft']).default('active'),
  slug: z.string().optional(),
})

export const productSchema = productSchemaBase.refine(
  (data) => {
    // If originalPrice is provided, it should be greater than price
    if (data.originalPrice !== null && data.originalPrice !== undefined) {
      return data.originalPrice > data.price
    }
    return true
  },
  {
    message: 'Preço original deve ser maior que o preço promocional',
    path: ['originalPrice'],
  }
)

export const productUpdateSchema = productSchemaBase.partial().extend({
  id: z.string().min(1, 'ID do produto é obrigatório'),
  categories: z.array(z.string()).optional(), // Array of category IDs for many-to-many relationship
  slug: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'draft']).optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  stockMinAlert: z.number().int().min(0).optional(),
  // Override price to allow 0 in updates (partial updates)
  price: z.number().min(0, 'Preço não pode ser negativo').max(99999.99, 'Preço muito alto').optional(),
  // Override originalPrice to allow null/undefined in updates
  originalPrice: z.number().nullable().optional(),
  // Override images to allow both string URLs and objects
  images: z.union([
    z.array(z.string()),
    z.array(z.object({
      id: z.string().optional(),
      url: z.string(),
      r2Key: z.string().optional(),
    })),
  ]).optional(),
}).refine(
  (data) => {
    // If both originalPrice and price are provided, originalPrice should be greater than price
    if (data.originalPrice !== null && data.originalPrice !== undefined && data.price !== undefined) {
      return data.originalPrice > data.price
    }
    return true
  },
  {
    message: 'Preço original deve ser maior que o preço promocional',
    path: ['originalPrice'],
  }
)

export type ProductInput = z.infer<typeof productSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
export type ProductVariantInput = z.infer<typeof productVariantSchema>
