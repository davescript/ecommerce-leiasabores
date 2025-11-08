/**
 * Dados de teste para produtos, categorias, cupons, etc.
 */

export const TEST_PRODUCT = {
  name: 'Produto Teste E2E',
  description: 'Descrição do produto teste para testes E2E',
  shortDescription: 'Descrição curta do produto teste',
  price: 29.99,
  originalPrice: 39.99,
  category: 'topos-de-bolo',
  images: [],
  inStock: true,
  stock: 100,
  tags: ['teste', 'e2e'],
  status: 'active' as const,
}

export const TEST_CATEGORY = {
  name: 'Categoria Teste E2E',
  slug: 'categoria-teste-e2e',
  description: 'Descrição da categoria teste para testes E2E',
  parentId: null,
  displayOrder: 0,
}

export const TEST_COUPON = {
  code: 'TESTE2E2024',
  type: 'percentage' as const,
  value: 10,
  minPurchase: 50,
  maxDiscount: 20,
  usageLimit: 100,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
  startsAt: new Date().toISOString(),
  active: true,
  applicableCategories: null,
}

export const TEST_COUPON_FIXED = {
  code: 'TESTE2EFIXED',
  type: 'fixed' as const,
  value: 5,
  minPurchase: 20,
  maxDiscount: null,
  usageLimit: 50,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  startsAt: new Date().toISOString(),
  active: true,
  applicableCategories: null,
}

export const TEST_CUSTOMER = {
  name: 'Cliente Teste E2E',
  email: `teste-e2e-${Date.now()}@example.com`,
  phone: '+351912345678',
  address: 'Rua Teste, 123, Lisboa, Portugal',
}

/**
 * Gerar nome único para produtos de teste
 */
export function generateTestProductName(): string {
  return `Produto Teste E2E ${Date.now()}`
}

/**
 * Gerar código único para cupons de teste
 */
export function generateTestCouponCode(): string {
  return `TESTE2E${Date.now().toString().slice(-6)}`
}

/**
 * Gerar email único para clientes de teste
 */
export function generateTestEmail(): string {
  return `teste-e2e-${Date.now()}@example.com`
}

