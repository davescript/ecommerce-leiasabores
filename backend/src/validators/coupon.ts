import { z } from 'zod'

// Base coupon schema without refinements (for partial updates)
const couponSchemaBase = z.object({
  code: z.string().min(1, 'Código do cupom é obrigatório').max(50, 'Código muito longo').regex(/^[A-Z0-9-_]+$/, 'Código deve conter apenas letras maiúsculas, números, hífens e underscores'),
  type: z.enum(['percentage', 'fixed'], {
    errorMap: () => ({ message: 'Tipo deve ser "percentage" ou "fixed"' }),
  }),
  value: z.number().min(0.01, 'Valor deve ser maior que zero').max(100, 'Valor máximo é 100 para porcentagem'),
  minPurchase: z.number().min(0, 'Valor mínimo de compra não pode ser negativo').optional().nullable(),
  maxDiscount: z.number().min(0, 'Desconto máximo não pode ser negativo').optional().nullable(),
  usageLimit: z.number().int().min(1, 'Limite de uso deve ser pelo menos 1').optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  active: z.boolean().default(true),
  applicableCategories: z.array(z.string()).optional().nullable(),
})

export const couponSchema = couponSchemaBase.refine(
  (data) => {
    // If type is percentage, value should be between 0 and 100
    if (data.type === 'percentage' && data.value > 100) {
      return false
    }
    return true
  },
  {
    message: 'Valor de porcentagem não pode ser maior que 100',
    path: ['value'],
  }
).refine(
  (data) => {
    // If both startsAt and expiresAt are provided, expiresAt should be after startsAt
    if (data.startsAt && data.expiresAt) {
      return new Date(data.expiresAt) > new Date(data.startsAt)
    }
    return true
  },
  {
    message: 'Data de expiração deve ser posterior à data de início',
    path: ['expiresAt'],
  }
)

export const couponUpdateSchema = couponSchemaBase.partial().extend({
  id: z.string().min(1, 'ID do cupom é obrigatório'),
  // Override to allow empty strings that will be converted to null
  minPurchase: z.number().min(0).optional().nullable(),
  maxDiscount: z.number().min(0).optional().nullable(),
  usageLimit: z.number().int().min(1).optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  applicableCategories: z.array(z.string()).optional().nullable(),
})

export type CouponInput = z.infer<typeof couponSchema>
export type CouponUpdateInput = z.infer<typeof couponUpdateSchema>
