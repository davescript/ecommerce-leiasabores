import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { logger } from '@lib/logger'
import type { Cart, CartItem, Product } from '@types'

// Valid UUID v4 pattern - used to validate product IDs
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Check if a product ID is valid (UUID format)
const isValidProductId = (id: string): boolean => {
  return UUID_PATTERN.test(id)
}

interface CartStore extends Cart {
  couponCode: string | null
  couponDiscount: number
  addItem: (product: Product, quantity: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  calculateTotals: () => void
  applyCoupon: (code: string) => Promise<boolean>
  removeCoupon: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      couponCode: null,
      couponDiscount: 0,

      addItem: (product: Product, quantity: number) => {
        set((state) => {
          const existingItem = state.items.find(item => item.productId === product.id)
          let newItems: CartItem[]

          if (existingItem) {
            newItems = state.items.map(item =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          } else {
            newItems = [...state.items, { productId: product.id, quantity, product }]
          }

          return { items: newItems }
        })

        get().calculateTotals()
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter(item => item.productId !== productId)
        }))
        get().calculateTotals()
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set((state) => ({
          items: state.items.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          )
        }))
        get().calculateTotals()
      },

      clearCart: () => {
        set({ 
          items: [], 
          total: 0, 
          subtotal: 0, 
          tax: 0, 
          shipping: 0,
          couponCode: null,
          couponDiscount: 0,
        })
      },

      calculateTotals: () => {
        const state = get()
        const roundCurrency = (value: number) => Math.round(value * 100) / 100

        const subtotal = state.items.reduce((sum, item) => {
          const price = item.product?.price || 0
          return sum + (price * item.quantity)
        }, 0)

        const roundedSubtotal = roundCurrency(subtotal)
        
        // Apply coupon discount if exists
        const subtotalAfterDiscount = Math.max(0, roundedSubtotal - state.couponDiscount)
        
        const tax = roundCurrency(subtotalAfterDiscount * 0.23)
        const shipping = roundedSubtotal === 0 ? 0 : roundedSubtotal >= 39 ? 0 : 5.99
        const total = roundCurrency(subtotalAfterDiscount + tax + shipping)

        set({ subtotal: roundedSubtotal, tax, shipping, total })
      },

      applyCoupon: async (code: string) => {
        const state = get()
        const subtotal = state.items.reduce((sum, item) => {
          const price = item.product?.price || 0
          return sum + (price * item.quantity)
        }, 0)

        try {
          const { validateCoupon } = await import('@lib/coupons-api')
          const validation = await validateCoupon(code, subtotal, state.items.map(item => ({
            productId: item.productId,
            category: item.product?.category,
          })))

          if (validation.valid && validation.coupon) {
            set({
              couponCode: code,
              couponDiscount: validation.coupon.discount,
            })
            get().calculateTotals()
            return true
          } else {
            return false
          }
        } catch (error) {
          console.error('Error applying coupon:', error)
          return false
        }
      },

      removeCoupon: () => {
        set({
          couponCode: null,
          couponDiscount: 0,
        })
        get().calculateTotals()
      },
    }),
    {
      name: 'cart-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Migration: Remove invalid product IDs (from old placeholder data)
          const validItems = state.items.filter((item) => isValidProductId(item.productId))
          
          if (validItems.length !== state.items.length) {
            // Log removed items for debugging
            const removedCount = state.items.length - validItems.length
            logger.warn(`[Cart Migration] Removed ${removedCount} invalid product ID(s) from cart`)
            
            state.items = validItems
          }
          
          state.calculateTotals()
        }
      },
    }
  )
)

export function useCart() {
  return useCartStore()
}
