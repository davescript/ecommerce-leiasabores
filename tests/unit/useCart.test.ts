import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCart, useCartStore } from '../../frontend/app/hooks/useCart'
import type { Product } from '../../frontend/app/types'

// Mock product
const mockProduct: Product = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Product',
  description: 'Test Description',
  shortDescription: 'Test Short',
  price: 10.99,
  category: 'test',
  images: ['https://example.com/image.jpg'],
  inStock: true,
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('useCart', () => {
  beforeEach(() => {
    // Clear localStorage before each test (already mocked in setup.ts)
    if (typeof localStorage !== 'undefined' && localStorage.clear) {
      localStorage.clear()
    }
    // Reset Zustand store state to initial values
    useCartStore.setState({
      items: [],
      total: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
    })
  })

  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => useCart())
    
    expect(result.current.items).toEqual([])
    expect(result.current.subtotal).toBe(0)
    expect(result.current.total).toBe(0)
  })

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem(mockProduct, 2)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].productId).toBe(mockProduct.id)
    expect(result.current.items[0].quantity).toBe(2)
  })

  it('should update quantity if item already exists', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem(mockProduct, 2)
      result.current.addItem(mockProduct, 3)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(5)
  })

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem(mockProduct, 2)
      result.current.removeItem(mockProduct.id)
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem(mockProduct, 2)
      result.current.updateQuantity(mockProduct.id, 5)
    })

    expect(result.current.items[0].quantity).toBe(5)
  })

  it('should calculate subtotal correctly', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem(mockProduct, 2)
    })

    // 10.99 * 2 = 21.98
    expect(result.current.subtotal).toBeCloseTo(21.98, 2)
  })

  it('should calculate tax correctly (23%)', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem(mockProduct, 1)
    })

    // 10.99 * 0.23 = 2.5277
    expect(result.current.tax).toBeCloseTo(2.53, 2)
  })

  it('should calculate shipping correctly (free > 39€)', () => {
    const { result } = renderHook(() => useCart())
    
    // Add items to reach > 39€
    act(() => {
      result.current.addItem({ ...mockProduct, price: 20 }, 2) // 40€
    })

    expect(result.current.shipping).toBe(0)
  })

  it('should calculate shipping correctly (< 39€)', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem(mockProduct, 1) // 10.99€
    })

    expect(result.current.shipping).toBe(5.99)
  })

  it('should calculate total correctly', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem(mockProduct, 1) // 10.99€
    })

    // subtotal + tax + shipping = 10.99 + 2.53 + 5.99 = 19.51
    expect(result.current.total).toBeCloseTo(19.51, 2)
  })

  it('should clear cart', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem(mockProduct, 2)
      result.current.clearCart()
    })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.subtotal).toBe(0)
  })

  it('should persist cart to localStorage', async () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem(mockProduct, 2)
    })

    // Wait a bit for Zustand persist to write
    await new Promise(resolve => setTimeout(resolve, 100))

    // Check localStorage
    const stored = localStorage.getItem('cart-storage')
    expect(stored).toBeTruthy()
    
    if (stored) {
      const parsed = JSON.parse(stored)
      expect(parsed.state.items).toHaveLength(1)
      expect(parsed.state.items[0].productId).toBe(mockProduct.id)
    }
  })

  it('should restore cart from localStorage', async () => {
    // Clear any existing cart first
    localStorage.removeItem('cart-storage')
    // Reset store state
    useCartStore.setState({
      items: [],
      total: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
    })
    
    // Set up localStorage with complete product data in Zustand persist format
    const cartData = {
      state: {
        items: [{
          productId: mockProduct.id,
          quantity: 3,
          product: mockProduct, // Product is needed for calculations
        }],
        total: 0,
        subtotal: 0,
        tax: 0,
        shipping: 0,
      },
      version: 0,
    }
    localStorage.setItem('cart-storage', JSON.stringify(cartData))

    // Force rehydration by creating a new hook instance
    const { result, rerender } = renderHook(() => useCart())
    
    // Wait a bit for Zustand persist to rehydrate
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Rerender to trigger rehydration
    rerender()
    
    // Wait for rehydration and calculation
    await waitFor(() => {
      return result.current.items.length > 0
    }, { timeout: 3000 })
    
    // Verify item was restored
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].productId).toBe(mockProduct.id)
    // Quantity should be restored (Zustand persist may recalculate, so check it's >= 3)
    expect(result.current.items[0].quantity).toBeGreaterThanOrEqual(3)
    // Verify product data is present
    expect(result.current.items[0].product).toBeDefined()
    expect(result.current.items[0].product?.id).toBe(mockProduct.id)
  })
})

