import { test, expect } from '../fixtures/admin-auth'
import { AdminAPIHelper } from '../helpers/api-helpers'
import { TEST_PRODUCT, generateTestProductName } from '../helpers/test-data'

test.describe('API - Produtos', () => {
  test('deve listar produtos', async ({ adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(adminApi, process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api')
    await apiHelper.login('admin@leiasabores.pt', 'admin123')
    const products = await apiHelper.listProducts()
    expect(products).toBeDefined()
    expect(products.products || products.data).toBeDefined()
  })

  test('deve criar produto via API', async ({ adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(adminApi, process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api')
    await apiHelper.login('admin@leiasabores.pt', 'admin123')
    const productName = generateTestProductName()
    const product = await apiHelper.createProduct({
      name: productName,
      description: TEST_PRODUCT.description,
      price: TEST_PRODUCT.price,
      category: TEST_PRODUCT.category,
      inStock: true,
      status: 'active',
    })

    expect(product).toBeDefined()
    expect(product.name).toBe(productName)
    await apiHelper.deleteProduct(product.id)
  })

  test('deve retornar 401 sem autenticação', async ({ adminApi }) => {
    const response = await adminApi.get(`${process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api'}/v1/admin/products`)
    expect(response.status()).toBe(401)
  })
})

