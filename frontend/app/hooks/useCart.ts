import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Cart, CartItem, Product } from '@types'

interface CartStore extends Cart {
  addItem: (product: Product, quantity: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  calculateTotals: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,

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
        set({ items: [], total: 0, subtotal: 0, tax: 0, shipping: 0 })
      },

      calculateTotals: () => {
        const state = get()
        const roundCurrency = (value: number) => Math.round(value * 100) / 100

        const subtotal = state.items.reduce((sum, item) => {
          const price = item.product?.price || 0
          return sum + (price * item.quantity)
        }, 0)

        const roundedSubtotal = roundCurrency(subtotal)
        const tax = roundCurrency(roundedSubtotal * 0.23)
        const shipping = roundedSubtotal === 0 ? 0 : roundedSubtotal >= 39 ? 0 : 5.99
        const total = roundCurrency(roundedSubtotal + tax + shipping)

        set({ subtotal: roundedSubtotal, tax, shipping, total })
      },
    }),
    {
      name: 'cart-storage',
      onRehydrateStorage: () => (state) => {
        state?.calculateTotals()
      },
    }
  )
)

export function useCart() {
  return useCartStore()
}
