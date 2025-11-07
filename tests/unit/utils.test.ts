import { describe, it, expect } from 'vitest'
import { cn, formatDate, truncate, generateId } from '../../frontend/app/lib/utils'

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('should handle Tailwind conflicts', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
})

describe('formatDate', () => {
  it('should format Date object', () => {
    const date = new Date('2024-01-15')
    const formatted = formatDate(date)
    expect(formatted).toContain('2024')
    expect(formatted).toContain('janeiro')
  })

  it('should format date string', () => {
    const formatted = formatDate('2024-01-15')
    expect(formatted).toContain('2024')
  })
})

describe('truncate', () => {
  it('should truncate long strings', () => {
    expect(truncate('This is a long string', 10)).toBe('This is a ...')
  })

  it('should not truncate short strings', () => {
    expect(truncate('Short', 10)).toBe('Short')
  })

  it('should handle empty string', () => {
    expect(truncate('', 10)).toBe('')
  })
})

describe('generateId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
  })

  it('should generate string IDs', () => {
    const id = generateId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })
})

