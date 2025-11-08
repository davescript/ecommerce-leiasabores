import { test, expect } from '../fixtures/admin-auth'
import { AdminAPIHelper } from '../helpers/api-helpers'
import { TEST_PRODUCT, generateTestProductName } from '../helpers/test-data'

test.describe('API - Produtos', () => {
  test('deve listar produtos', async ({ adminApi }) => {
    const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api'
    const apiHelper = new AdminAPIHelper(adminApi, apiBaseUrl)
    await apiHelper.login('admin@leiasabores.pt', 'admin123')
    
    const products = await apiHelper.listProducts()
    expect(products).toBeDefined()
    expect(products.products || products.data).toBeDefined()
  })

  test('deve criar produto via API', async ({ adminApi }) => {
    const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api'
    const apiHelper = new AdminAPIHelper(adminApi, apiBaseUrl)
    await apiHelper.login('admin@leiasabores.pt', 'admin123')
    
    // Obter categoria
    const categories = await apiHelper.listCategories()
    const categorySlug = categories.categories?.[0]?.slug || TEST_PRODUCT.category
    
    const productName = generateTestProductName()
    const product = await apiHelper.createProduct({
      name: productName,
      description: TEST_PRODUCT.description,
      price: TEST_PRODUCT.price,
      category: categorySlug,
      inStock: true,
      status: 'active',
      stock: 100,
    })

    expect(product).toBeDefined()
    expect(product.name).toBe(productName)
    
    // Cleanup
    try {
      await apiHelper.deleteProduct(product.id)
    } catch (error) {
      // Ignore cleanup errors
    }
  })

  test('deve retornar 401 sem autenticação', async ({ adminApi }) => {
    const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api'
    const response = await adminApi.get(`${apiBaseUrl}/v1/admin/products`)
    expect(response.status()).toBe(401)
  })
})

