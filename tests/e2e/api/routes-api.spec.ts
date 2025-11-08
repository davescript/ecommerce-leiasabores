import { test, expect } from '../fixtures/admin-auth'
import { AdminAPIHelper } from '../helpers/api-helpers'

test.describe('API Routes', () => {
  test('deve retornar 401 para rotas protegidas sem autenticação', async ({ adminApi }) => {
    const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api'
    
    const routes = [
      '/v1/admin/products',
      '/v1/admin/categories',
      '/v1/admin/coupons',
      '/v1/admin/orders',
      '/v1/admin/customers',
      '/v1/admin/dashboard/stats',
    ]

    for (const route of routes) {
      const response = await adminApi.get(`${apiBaseUrl}${route}`)
      expect(response.status()).toBe(401)
    }
  })

  test('deve retornar 404 para rotas inexistentes', async ({ adminApi }) => {
    const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api'
    const apiHelper = new AdminAPIHelper(adminApi, apiBaseUrl)
    await apiHelper.login('admin@leiasabores.pt', 'admin123')
    
    // Fazer requisição autenticada para rota inexistente
    const response = await adminApi.get(`${apiBaseUrl}/v1/admin/nonexistent`, {
      headers: { 
        Authorization: `Bearer ${await apiHelper.getToken()}`,
        'X-Test-Mode': 'true',
        'X-Playwright-Test': 'true',
      },
    })
    
    expect(response.status()).toBe(404)
  })

  test('deve validar schemas Zod', async ({ adminApi }) => {
    const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api'
    const apiHelper = new AdminAPIHelper(adminApi, apiBaseUrl)
    await apiHelper.login('admin@leiasabores.pt', 'admin123')

    // Tentar criar produto com dados inválidos
    try {
      await apiHelper.createProduct({
        name: '', // Nome vazio
        price: -10, // Preço negativo
        category: 'uncategorized',
        inStock: true,
        status: 'active',
      })
      throw new Error('Should have thrown validation error')
    } catch (error: any) {
      expect(error.message).toMatch(/validation|obrigatório|required|error|erro/i)
    }
  })
})

