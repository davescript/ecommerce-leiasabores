import { describe, it, expect } from 'vitest'
import { isValidPortuguesePhone, formatPhone, sanitizePhone } from '../../frontend/app/lib/phone-utils'

describe('isValidPortuguesePhone', () => {
  it('should validate Portuguese mobile numbers', () => {
    expect(isValidPortuguesePhone('912345678')).toBe(true)
    expect(isValidPortuguesePhone('923456789')).toBe(true)
    expect(isValidPortuguesePhone('933456789')).toBe(true)
    expect(isValidPortuguesePhone('963456789')).toBe(true)
  })

  it('should validate Portuguese landline numbers', () => {
    expect(isValidPortuguesePhone('212345678')).toBe(true)
    expect(isValidPortuguesePhone('223456789')).toBe(true)
  })

  it('should validate numbers with +351 prefix', () => {
    expect(isValidPortuguesePhone('+351912345678')).toBe(true)
    expect(isValidPortuguesePhone('+351 912 345 678')).toBe(true)
  })

  it('should validate numbers with 00351 prefix', () => {
    expect(isValidPortuguesePhone('00351912345678')).toBe(true)
    expect(isValidPortuguesePhone('00351 912 345 678')).toBe(true)
  })

  it('should reject invalid numbers', () => {
    expect(isValidPortuguesePhone('12345678')).toBe(false) // Too short
    expect(isValidPortuguesePhone('812345678')).toBe(false) // Invalid prefix
    expect(isValidPortuguesePhone('91234567')).toBe(false) // Too short
    expect(isValidPortuguesePhone('')).toBe(false)
    expect(isValidPortuguesePhone('abc')).toBe(false)
  })

  it('should handle numbers with spaces and dashes', () => {
    expect(isValidPortuguesePhone('912 345 678')).toBe(true)
    expect(isValidPortuguesePhone('912-345-678')).toBe(true)
    expect(isValidPortuguesePhone('(912) 345 678')).toBe(true)
  })
})

describe('formatPhone', () => {
  it('should format local numbers', () => {
    expect(formatPhone('912345678')).toBe('912 345 678')
    expect(formatPhone('212345678')).toBe('212 345 678')
  })

  it('should format numbers with +351', () => {
    expect(formatPhone('+351912345678')).toBe('+351 912 345 678')
  })

  it('should format numbers with 00351', () => {
    expect(formatPhone('00351912345678')).toBe('00351 912 345 678')
  })

  it('should return empty string for empty input', () => {
    expect(formatPhone('')).toBe('')
  })
})

describe('sanitizePhone', () => {
  it('should remove invalid characters', () => {
    expect(sanitizePhone('(912) 345-678')).toBe('912 345678')
    // sanitizePhone removes dots but doesn't add spaces where they weren't
    // Input has dots, output will have no dots but also no spaces (since input had no spaces)
    expect(sanitizePhone('912.345.678')).toBe('912345678')
    // No spaces in input, so result has no spaces
    expect(sanitizePhone('912@345#678')).toBe('912345678')
  })

  it('should keep numbers, + and spaces', () => {
    expect(sanitizePhone('+351 912 345 678')).toBe('+351 912 345 678')
    expect(sanitizePhone('912 345 678')).toBe('912 345 678')
  })

  it('should trim whitespace', () => {
    expect(sanitizePhone('  912345678  ')).toBe('912345678')
  })

  it('should return empty string for empty input', () => {
    expect(sanitizePhone('')).toBe('')
  })
})

