import { api } from './api-client'
import type { Product, Review, CartItem, Address } from '@types'

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  children?: Category[]
}

export async function fetchCategories() {
  const response = await api.get<{ data: Category[]; total: number }>('/categories')
  return response.data.data
}

export async function fetchProducts(params?: Partial<{ search: string; category: string; sort: string; page: number; limit: number }>) {
  const response = await api.get<PaginatedResponse<Product>>('/products', { params })
  return response.data
}

export async function fetchProduct(productId: string) {
  const response = await api.get<Product>(`/products/${productId}`)
  return response.data
}

export async function fetchReviews(productId: string, params?: Partial<{ page: number; limit: number }>) {
  const response = await api.get<PaginatedResponse<Review>>(`/reviews/product/${productId}`, { params })
  return response.data
}

// Admin APIs
export async function createProduct(body: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) {
  const response = await api.post<Product>('/products', body)
  return response.data
}

export async function updateProduct(productId: string, body: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) {
  const response = await api.put<Product>(`/products/${productId}`, body)
  return response.data
}

export async function deleteProduct(productId: string) {
  const response = await api.delete<{ success: boolean }>(`/products/${productId}`)
  return response.data
}

export async function uploadFile(file: File, keyPrefix = 'products') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('keyPrefix', keyPrefix)
  const response = await api.post<{ ok: boolean; key: string }>(`/uploads`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function submitReview(payload: Pick<Review, 'productId' | 'author' | 'rating' | 'title' | 'content'> & { verified?: boolean }) {
  const response = await api.post<Review>('/reviews', payload)
  return response.data
}

export async function markReviewHelpful(reviewId: string) {
  const response = await api.put<Review>(`/reviews/${reviewId}/helpful`)
  return response.data
}

export interface CheckoutPayload {
  items: Array<{ productId: string; quantity: number }>
  shippingAddress: Address
  billingAddress: Address
  email: string
}

export interface CheckoutResponse {
  checkoutUrl: string | null
  sessionId: string
}

export async function createCheckoutSession(payload: CheckoutPayload) {
  const response = await api.post<CheckoutResponse>('/checkout', payload)
  return response.data
}

export async function fetchCheckoutSession(sessionId: string) {
  const response = await api.get(`/checkout/session/${sessionId}`)
  return response.data
}

export async function syncCartItems(userId: string, items: Array<Pick<CartItem, 'productId' | 'quantity'>>) {
  await Promise.all(
    items.map(item =>
      api.post(`/cart/${userId}/add`, {
        productId: item.productId,
        quantity: item.quantity,
      })
    )
  )
}
