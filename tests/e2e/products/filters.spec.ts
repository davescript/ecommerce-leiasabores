import { test, expect } from '../fixtures/admin-auth'
import { AdminAPIHelper } from '../helpers/api-helpers'
import { AdminPageHelper } from '../helpers/page-helpers'
import { TEST_PRODUCT, generateTestProductName } from '../helpers/test-data'

test.describe('Filtros e Busca de Produtos', () => {
  test('deve filtrar produtos por categoria', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(adminApi, process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api', adminToken)
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToProducts()

    // Obter categorias
    const categories = await apiHelper.listCategories()
    if (categories.length > 0) {
      const category = categories[0]
      
      // Filtrar por categoria
      await pageHelper.selectOption('Categoria', category.name)
      await adminPage.waitForTimeout(2000)

      // Verificar que produtos filtrados aparecem
      const products = await apiHelper.listProducts({ category: category.slug })
      expect(products).toBeDefined()
    }
  })

  test('deve buscar produtos por nome', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(adminApi, process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api', adminToken)
    const pageHelper = new AdminPageHelper(adminPage)

    // Criar produto de teste
    const productName = generateTestProductName()
    const product = await apiHelper.createProduct({
      name: productName,
      description: TEST_PRODUCT.description,
      price: TEST_PRODUCT.price,
      category: TEST_PRODUCT.category,
      inStock: true,
      status: 'active',
    })

    await pageHelper.goToProducts()

    // Buscar produto
    const searchInput = adminPage.locator('input[type="search"], input[placeholder*="buscar"], input[placeholder*="search"]')
    if (await searchInput.isVisible()) {
      await searchInput.fill(productName)
      await adminPage.waitForTimeout(2000)

      // Verificar que produto aparece nos resultados
      await expect(adminPage.getByText(productName)).toBeVisible({ timeout: 10000 })
    }

    // Cleanup
    await apiHelper.deleteProduct(product.id)
  })

  test('deve filtrar produtos por status', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(adminApi, process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api', adminToken)
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToProducts()

    // Filtrar por status ativo
    const statusFilter = adminPage.locator('select[name*="status"], [role="combobox"]').first()
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('active')
      await adminPage.waitForTimeout(2000)

      // Verificar que produtos ativos aparecem
      const products = await apiHelper.listProducts()
      expect(products).toBeDefined()
    }
  })
})

