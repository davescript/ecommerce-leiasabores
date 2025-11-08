import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.leiasabores.pt'

export interface CouponValidation {
  valid: boolean
  coupon?: {
    id: string
    code: string
    type: 'percentage' | 'fixed'
    value: number
    discount: number
    finalTotal: number
  }
  error?: string
}

export interface ActiveCoupon {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minPurchase?: number
  maxDiscount?: number
}

/**
 * Validate coupon code
 */
export async function validateCoupon(
  code: string,
  total: number,
  items?: Array<{ productId: string; category?: string }>
): Promise<CouponValidation> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/coupons/validate`, {
      params: {
        code,
        total,
        items: items ? JSON.stringify(items) : undefined,
      },
    })

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data
    }
    return {
      valid: false,
      error: 'Erro ao validar cupom. Tente novamente.',
    }
  }
}

/**
 * Get all active coupons
 */
export async function getActiveCoupons(): Promise<ActiveCoupon[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/coupons/active`)
    return response.data.coupons || []
  } catch (error) {
    console.error('Error fetching active coupons:', error)
    return []
  }
}

