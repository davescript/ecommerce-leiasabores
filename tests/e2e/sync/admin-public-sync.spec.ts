import { test, expect } from '../fixtures/admin-auth'
import { AdminAPIHelper } from '../helpers/api-helpers'
import { TEST_PRODUCT, generateTestProductName } from '../helpers/test-data'

test.describe('Sincronização Admin ↔ Site Público', () => {
  test('deve atualizar produto no admin e refletir no site público', async ({ adminPage, adminApi }) => {
    const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api'
    const apiHelper = new AdminAPIHelper(adminApi, apiBaseUrl)
    await apiHelper.login('admin@leiasabores.pt', 'admin123')

    // Obter categoria
    const categories = await apiHelper.listCategories()
    const categorySlug = categories.categories?.[0]?.slug || TEST_PRODUCT.category

    // Criar produto
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

    try {
      // Aguardar cache ser atualizado
      await adminPage.waitForTimeout(3000)

      // Verificar no site público
      const publicPage = await adminPage.context().newPage()
      await publicPage.goto('/')
      await publicPage.waitForLoadState('networkidle')

      // Procurar produto na home ou catálogo
      let productVisible = await publicPage.getByText(productName).isVisible({ timeout: 10000 }).catch(() => false)
      
      if (!productVisible) {
        // Tentar no catálogo
        await publicPage.goto('/catalogo')
        await publicPage.waitForLoadState('networkidle')
        productVisible = await publicPage.getByText(productName).isVisible({ timeout: 10000 }).catch(() => false)
      }
      
      expect(productVisible).toBeTruthy()

      // Atualizar produto
      const newPrice = 59.99
      await apiHelper.updateProduct(product.id, { price: newPrice })
      await adminPage.waitForTimeout(3000)

      // Verificar preço atualizado no site público (pode precisar recarregar)
      await publicPage.reload()
      await publicPage.waitForLoadState('networkidle')
      
      // Procurar preço atualizado (pode estar formatado)
      const priceText = await publicPage.textContent('body') || ''
      const priceVisible = priceText.includes(newPrice.toString()) || priceText.includes('59')
      expect(priceVisible).toBeTruthy()

      await publicPage.close()
    } finally {
      // Cleanup
      try {
        await apiHelper.deleteProduct(product.id)
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  })
})

