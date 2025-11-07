import { describe, it, expect } from 'vitest'
import { formatPrice } from '../../frontend/app/lib/utils'

// Helper to normalize whitespace (Intl.NumberFormat uses non-breaking spaces)
const normalize = (str: string) => str.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim()

describe('formatPrice', () => {
  it('should format positive values correctly', () => {
    expect(normalize(formatPrice(10))).toBe('10,00 €')
    expect(normalize(formatPrice(10.5))).toBe('10,50 €')
    expect(normalize(formatPrice(10.99))).toBe('10,99 €')
    expect(normalize(formatPrice(100))).toBe('100,00 €')
    // Intl.NumberFormat uses spaces for thousands separator in pt-PT
    expect(normalize(formatPrice(1000))).toMatch(/1[.\s]?000,00\s*€/)
    expect(normalize(formatPrice(1234.56))).toMatch(/1[.\s]?234,56\s*€/)
  })

  it('should format zero correctly', () => {
    expect(normalize(formatPrice(0))).toBe('0,00 €')
  })

  it('should format negative values correctly', () => {
    expect(normalize(formatPrice(-10))).toBe('-10,00 €')
    expect(normalize(formatPrice(-10.5))).toBe('-10,50 €')
  })

  it('should format very large values correctly', () => {
    // Intl.NumberFormat may use spaces or dots for thousands
    expect(normalize(formatPrice(999999.99))).toMatch(/999[.\s]?999,99\s*€/)
    expect(normalize(formatPrice(1000000))).toMatch(/1[.\s]?000[.\s]?000,00\s*€/)
  })

  it('should format small decimal values correctly', () => {
    expect(normalize(formatPrice(0.01))).toBe('0,01 €')
    expect(normalize(formatPrice(0.1))).toBe('0,10 €')
  })

  it('should handle NaN and Infinity', () => {
    expect(normalize(formatPrice(NaN))).toBe('NaN €')
    // Intl.NumberFormat uses ∞ symbol for Infinity
    const infinityResult = normalize(formatPrice(Infinity))
    expect(infinityResult).toMatch(/∞|Infinity/)
    const negInfinityResult = normalize(formatPrice(-Infinity))
    expect(negInfinityResult).toMatch(/-∞|-Infinity/)
  })

  it('should round to 2 decimal places', () => {
    expect(normalize(formatPrice(10.999))).toBe('11,00 €')
    expect(normalize(formatPrice(10.994))).toBe('10,99 €')
  })
})

