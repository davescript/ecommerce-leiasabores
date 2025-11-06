/**
 * Utilitários de validação e sanitização para segurança
 */

// Limites de segurança
export const SECURITY_LIMITS = {
  MAX_ITEMS_PER_CART: 50,
  MAX_QUANTITY_PER_ITEM: 99,
  MAX_PAYLOAD_SIZE: 100 * 1024, // 100KB
  MAX_EMAIL_LENGTH: 254,
  MAX_NAME_LENGTH: 200,
  MAX_ADDRESS_LENGTH: 500,
  MAX_PHONE_LENGTH: 20,
  MAX_PRODUCT_NAME_LENGTH: 500,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_PRICE: 0.01,
  MAX_PRICE: 999999.99,
  MAX_CART_TOTAL: 100000,
} as const

/**
 * Valida formato de email RFC 5322 simplificado
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  if (email.length > SECURITY_LIMITS.MAX_EMAIL_LENGTH) return false
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(email.trim())
}

/**
 * Sanitiza string removendo caracteres perigosos
 */
export function sanitizeString(input: string, maxLength: number): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, '') // Remove < e > para prevenir XSS básico
    .replace(/\0/g, '') // Remove null bytes
}

/**
 * Valida e sanitiza nome
 */
export function validateAndSanitizeName(name: string): { valid: boolean; sanitized: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, sanitized: '' }
  }
  
  const sanitized = sanitizeString(name, SECURITY_LIMITS.MAX_NAME_LENGTH)
  
  if (sanitized.length < 2) {
    return { valid: false, sanitized: '' }
  }
  
  // Nome deve conter apenas letras, espaços, hífens e apóstrofes
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(sanitized)) {
    return { valid: false, sanitized: '' }
  }
  
  return { valid: true, sanitized }
}

/**
 * Valida e sanitiza endereço
 */
export function validateAndSanitizeAddress(address: string): { valid: boolean; sanitized: string } {
  if (!address || typeof address !== 'string') {
    return { valid: false, sanitized: '' }
  }
  
  const sanitized = sanitizeString(address, SECURITY_LIMITS.MAX_ADDRESS_LENGTH)
  
  if (sanitized.length < 5) {
    return { valid: false, sanitized: '' }
  }
  
  return { valid: true, sanitized }
}

/**
 * Valida e sanitiza telefone
 */
export function validateAndSanitizePhone(phone: string): { valid: boolean; sanitized: string } {
  if (!phone || typeof phone !== 'string') {
    return { valid: true, sanitized: '' } // Telefone é opcional
  }
  
  const sanitized = sanitizeString(phone, SECURITY_LIMITS.MAX_PHONE_LENGTH)
  
  // Remove caracteres não numéricos exceto +, espaços, parênteses e hífens
  const cleaned = sanitized.replace(/[^\d+\s()-]/g, '')
  
  if (cleaned.length < 9) {
    return { valid: false, sanitized: '' }
  }
  
  return { valid: true, sanitized: cleaned }
}

/**
 * Valida código postal português
 */
export function isValidPortuguesePostalCode(zipCode: string): boolean {
  if (!zipCode || typeof zipCode !== 'string') return false
  
  const cleaned = zipCode.trim().replace(/\s/g, '')
  
  // Formato: 1234-567 ou 1234567
  const postalCodeRegex = /^\d{4}-?\d{3}$/
  return postalCodeRegex.test(cleaned)
}

/**
 * Valida UUID v4
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Valida preço
 */
export function isValidPrice(price: number): boolean {
  if (typeof price !== 'number' || !Number.isFinite(price)) return false
  if (price < SECURITY_LIMITS.MIN_PRICE) return false
  if (price > SECURITY_LIMITS.MAX_PRICE) return false
  return true
}

/**
 * Valida quantidade
 */
export function isValidQuantity(quantity: number): boolean {
  if (typeof quantity !== 'number' || !Number.isFinite(quantity)) return false
  if (!Number.isInteger(quantity)) return false
  if (quantity < 1) return false
  if (quantity > SECURITY_LIMITS.MAX_QUANTITY_PER_ITEM) return false
  return true
}

/**
 * Valida array de items do carrinho
 */
export function validateCartItems(items: unknown[]): { valid: boolean; error?: string } {
  if (!Array.isArray(items)) {
    return { valid: false, error: 'Items must be an array' }
  }
  
  if (items.length === 0) {
    return { valid: false, error: 'Cart is empty' }
  }
  
  if (items.length > SECURITY_LIMITS.MAX_ITEMS_PER_CART) {
    return { valid: false, error: `Maximum ${SECURITY_LIMITS.MAX_ITEMS_PER_CART} items allowed per cart` }
  }
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i] as { productId?: unknown; quantity?: unknown }
    
    if (!item || typeof item !== 'object') {
      return { valid: false, error: `Item ${i + 1} is invalid` }
    }
    
    if (!item.productId || typeof item.productId !== 'string') {
      return { valid: false, error: `Item ${i + 1}: productId is required and must be a string` }
    }
    
    if (!isValidUUID(item.productId)) {
      return { valid: false, error: `Item ${i + 1}: productId must be a valid UUID` }
    }
    
    if (item.quantity !== undefined && !isValidQuantity(item.quantity as number)) {
      return { valid: false, error: `Item ${i + 1}: quantity must be between 1 and ${SECURITY_LIMITS.MAX_QUANTITY_PER_ITEM}` }
    }
  }
  
  return { valid: true }
}

/**
 * Valida tamanho do payload
 */
export function validatePayloadSize(payload: string | object): { valid: boolean; error?: string } {
  const size = typeof payload === 'string' 
    ? new Blob([payload]).size 
    : new Blob([JSON.stringify(payload)]).size
    
  if (size > SECURITY_LIMITS.MAX_PAYLOAD_SIZE) {
    return { 
      valid: false, 
      error: `Payload too large. Maximum ${SECURITY_LIMITS.MAX_PAYLOAD_SIZE / 1024}KB allowed` 
    }
  }
  
  return { valid: true }
}

/**
 * Valida URL
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Valida origin permitida
 */
export function isValidOrigin(origin: string, allowedOrigins?: string[]): boolean {
  if (!origin || typeof origin !== 'string') return false
  
  if (!isValidUrl(origin)) return false
  
  // Se não há lista de origins permitidas, aceitar qualquer HTTPS
  if (!allowedOrigins || allowedOrigins.length === 0) {
    return origin.startsWith('https://')
  }
  
  return allowedOrigins.some(allowed => {
    try {
      const originUrl = new URL(origin)
      const allowedUrl = new URL(allowed)
      return originUrl.hostname === allowedUrl.hostname || 
             originUrl.hostname.endsWith('.' + allowedUrl.hostname)
    } catch {
      return false
    }
  })
}

