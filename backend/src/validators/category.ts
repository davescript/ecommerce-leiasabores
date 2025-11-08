import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, 'Nome da categoria é obrigatório').max(200, 'Nome muito longo'),
  slug: z.string().min(1, 'Slug é obrigatório').max(200, 'Slug muito longo').regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  description: z.string().max(1000, 'Descrição muito longa').nullable().optional(),
  image: z.string().url('URL de imagem inválida').nullable().optional(),
  parentId: z.string().nullable().optional(),
  displayOrder: z.number().int().min(0).default(0),
})

export const categoryUpdateSchema = categorySchema.partial().extend({
  id: z.string().min(1, 'ID da categoria é obrigatório'),
  // Override to allow empty strings that will be converted to null
  parentId: z.union([z.string(), z.null(), z.literal('')]).optional().transform(val => val === '' ? null : val),
  description: z.union([z.string(), z.null(), z.literal('')]).optional().transform(val => val === '' ? null : val),
  image: z.union([z.string().url(), z.null(), z.literal('')]).optional().transform(val => val === '' ? null : val),
})

export type CategoryInput = z.infer<typeof categorySchema>
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>

