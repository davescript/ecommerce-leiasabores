import { test, expect } from '../fixtures/admin'
import { AdminAPI } from '../helpers/admin-api'

/**
 * Testes básicos do Admin Panel
 */
test.describe('Admin Panel', () => {
  test('deve fazer login e carregar dashboard', async ({ adminPage }) => {
    // Verificar que está na página do admin
    await expect(adminPage).toHaveURL(/\/admin/)
    
    // Verificar que não é página de erro
    const bodyText = await adminPage.textContent('body') || ''
    expect(bodyText).not.toContain('404')
    expect(bodyText).not.toContain('Error')
  })

  test('deve listar produtos', async ({ adminPage, adminApi }) => {
    const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api'
    
    // Fazer login via API
    const { token } = await AdminAPI.login(
      adminApi,
      apiBaseUrl,
      'admin@leiasabores.pt',
      'admin123'
    )
    
    const api = new AdminAPI(adminApi, apiBaseUrl, token)
    
    // Listar produtos
    const products = await api.listProducts()
    expect(products).toBeTruthy()
  })

  test('deve criar e deletar produto', async ({ adminPage, adminApi }) => {
    const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api'
    
    // Fazer login
    const { token } = await AdminAPI.login(
      adminApi,
      apiBaseUrl,
      'admin@leiasabores.pt',
      'admin123'
    )
    
    const api = new AdminAPI(adminApi, apiBaseUrl, token)
    
    // Obter categoria
    const categories = await api.listCategories()
    const categoryList = categories.categories || categories
    if (categoryList.length === 0) {
      test.skip()
      return
    }
    
    const category = categoryList[0]
    const productName = `Produto Teste ${Date.now()}`
    
    let productId: string | null = null
    
    try {
      // Criar produto
      const product = await api.createProduct({
        name: productName,
        description: 'Descrição do produto teste',
        price: 29.99,
        category: category.slug || category.id,
        inStock: true,
        stock: 100,
      })
      
      expect(product).toBeTruthy()
      expect(product.name).toBe(productName)
      productId = product.id
      
    } finally {
      // Cleanup
      if (productId) {
        try {
          await api.deleteProduct(productId)
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  })

  test('deve criar e deletar categoria', async ({ adminPage, adminApi }) => {
    const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api'
    
    // Fazer login
    const { token } = await AdminAPI.login(
      adminApi,
      apiBaseUrl,
      'admin@leiasabores.pt',
      'admin123'
    )
    
    const api = new AdminAPI(adminApi, apiBaseUrl, token)
    
    const categoryName = `Categoria Teste ${Date.now()}`
    let categoryId: string | null = null
    
    try {
      // Criar categoria
      const category = await api.createCategory({
        name: categoryName,
        description: 'Descrição da categoria teste',
      })
      
      expect(category).toBeTruthy()
      expect(category.name).toBe(categoryName)
      categoryId = category.id
      
    } finally {
      // Cleanup
      if (categoryId) {
        try {
          await api.deleteCategory(categoryId)
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  })
})

