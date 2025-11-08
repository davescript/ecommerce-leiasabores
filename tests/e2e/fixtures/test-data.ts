import { test as base } from '@playwright/test'
import { AdminAPIHelper } from '../helpers/api-helpers'
import { TEST_ADMIN_CREDENTIALS } from './admin-auth'

/**
 * Fixture para garantir dados de teste (produtos, categorias, etc.)
 */
type TestDataFixtures = {
  apiHelper: AdminAPIHelper
  testProductId: string
  testCategoryId: string
}

export const test = base.extend<TestDataFixtures>({
  apiHelper: async ({ request }, use) => {
    const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api'
    const helper = new AdminAPIHelper(request, apiBaseUrl)
    
    // Login automático
    try {
      await helper.login(
        TEST_ADMIN_CREDENTIALS.email,
        TEST_ADMIN_CREDENTIALS.password
      )
    } catch (error) {
      console.warn('Failed to login in test data fixture:', error)
      // Continue anyway, alguns testes podem não precisar de autenticação
    }
    
    await use(helper)
  },

  testCategoryId: async ({ apiHelper }, use) => {
    let categoryId: string | null = null
    
    // Try to get existing category first
    try {
      const categories = await apiHelper.listCategories()
      if (categories.categories && categories.categories.length > 0) {
        categoryId = categories.categories[0].id
      }
    } catch (error) {
      console.warn('Failed to list categories:', error)
    }
    
    // Create test category if none exists
    if (!categoryId) {
      try {
        const category = await apiHelper.createCategory({
          name: `Test Category ${Date.now()}`,
          slug: `test-category-${Date.now()}`,
          description: 'Test category for E2E tests',
        })
        categoryId = category.id
      } catch (error) {
        console.error('Failed to create test category:', error)
        // Use a fallback ID if creation fails
        categoryId = 'fallback-category-id'
      }
    }
    
    await use(categoryId || 'fallback-category-id')
  },

  testProductId: async ({ apiHelper, testCategoryId }, use) => {
    let productId: string | null = null
    
    // Try to get existing product first
    try {
      const products = await apiHelper.listProducts({ limit: 1 })
      if (products.products && products.products.length > 0) {
        productId = products.products[0].id
      }
    } catch (error) {
      console.warn('Failed to list products:', error)
    }
    
    // Create test product if none exists
    if (!productId) {
      try {
        // Get category slug
        const categories = await apiHelper.listCategories()
        const categorySlug = categories.categories?.[0]?.slug || 'uncategorized'
        
        const product = await apiHelper.createProduct({
          name: `Test Product ${Date.now()}`,
          description: 'Test product description for E2E tests',
          price: 19.99,
          category: categorySlug,
          inStock: true,
          status: 'active',
          stock: 100,
        })
        
        productId = product.id
      } catch (error) {
        console.error('Failed to create test product:', error)
        // Use a fallback ID if creation fails
        productId = 'fallback-product-id'
      }
    }
    
    await use(productId || 'fallback-product-id')
  },
})

export { expect } from '@playwright/test'

