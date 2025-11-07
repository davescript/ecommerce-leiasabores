import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchProducts, fetchProduct } from '../../frontend/app/lib/api'
import { api } from '../../frontend/app/lib/api-client'

// Mock api client
vi.mock('../../frontend/app/lib/api-client', () => ({
  api: {
    get: vi.fn(),
  },
}))

describe('fetchProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch products without params', async () => {
    const mockResponse = {
      data: {
        data: [
          { id: '1', name: 'Product 1', price: 10 },
          { id: '2', name: 'Product 2', price: 20 },
        ],
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    }

    vi.mocked(api.get).mockResolvedValue(mockResponse)

    const result = await fetchProducts()

    expect(api.get).toHaveBeenCalledWith('/products', { params: undefined })
    expect(result).toEqual(mockResponse.data)
  })

  it('should fetch products with search params', async () => {
    const mockResponse = {
      data: {
        data: [{ id: '1', name: 'Test Product', price: 10 }],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    }

    vi.mocked(api.get).mockResolvedValue(mockResponse)

    const result = await fetchProducts({ search: 'test', page: 1, limit: 10 })

    expect(api.get).toHaveBeenCalledWith('/products', {
      params: { search: 'test', page: 1, limit: 10 },
    })
    expect(result.data).toHaveLength(1)
  })

  it('should fetch products with category filter', async () => {
    const mockResponse = {
      data: {
        data: [{ id: '1', name: 'Product', price: 10 }],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    }

    vi.mocked(api.get).mockResolvedValue(mockResponse)

    const result = await fetchProducts({ category: 'topos-de-bolo' })

    expect(api.get).toHaveBeenCalledWith('/products', {
      params: { category: 'topos-de-bolo' },
    })
    expect(result.data).toHaveLength(1)
  })

  it('should handle API errors', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'))

    await expect(fetchProducts()).rejects.toThrow('Network error')
  })
})

describe('fetchProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch single product', async () => {
    const mockProduct = {
      id: '123',
      name: 'Test Product',
      price: 10.99,
      description: 'Test description',
    }

    vi.mocked(api.get).mockResolvedValue({ data: mockProduct })

    const result = await fetchProduct('123')

    expect(api.get).toHaveBeenCalledWith('/products/123')
    expect(result).toEqual(mockProduct)
  })

  it('should handle product not found', async () => {
    vi.mocked(api.get).mockRejectedValue({
      response: { status: 404, data: { error: 'Product not found' } },
    })

    await expect(fetchProduct('invalid')).rejects.toBeDefined()
  })
})

