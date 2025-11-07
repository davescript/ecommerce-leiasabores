import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ProductCard } from '../../frontend/app/components/ProductCard'
import type { Product } from '../../frontend/app/types'

// Helper to render with Router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

const mockProduct: Product = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Product',
  description: 'Test Description',
  shortDescription: 'Test Short Description',
  price: 10.99,
  originalPrice: 15.99,
  category: 'test-category',
  images: ['https://example.com/image.jpg'],
  inStock: true,
  tags: ['test'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('ProductCard', () => {
  it('should render product name', () => {
    renderWithRouter(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  it('should render product price', () => {
    renderWithRouter(<ProductCard product={mockProduct} />)
    expect(screen.getByText(/10,99/)).toBeInTheDocument()
  })

  it('should render original price when discounted', () => {
    renderWithRouter(<ProductCard product={mockProduct} />)
    expect(screen.getByText(/15,99/)).toBeInTheDocument()
  })

  it('should render product image', () => {
    renderWithRouter(<ProductCard product={mockProduct} />)
    const image = screen.getByAltText('Test Product')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', expect.stringContaining('example.com'))
  })

  it('should render out of stock message when inStock is false', () => {
    const outOfStockProduct = { ...mockProduct, inStock: false }
    renderWithRouter(<ProductCard product={outOfStockProduct} />)
    expect(screen.getByText(/esgotado/i)).toBeInTheDocument()
  })

  it('should call onAddToCart when button is clicked', () => {
    const onAddToCart = vi.fn()
    renderWithRouter(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />)
    
    const button = screen.getByRole('button', { name: /adicionar/i })
    button.click()
    
    expect(onAddToCart).toHaveBeenCalledWith(mockProduct)
  })

  it('should disable button when out of stock', () => {
    const outOfStockProduct = { ...mockProduct, inStock: false }
    renderWithRouter(<ProductCard product={outOfStockProduct} />)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should render tag if present', () => {
    renderWithRouter(<ProductCard product={mockProduct} />)
    expect(screen.getByText('test')).toBeInTheDocument()
  })
})

