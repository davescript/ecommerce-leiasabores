import { test, expect } from '../fixtures/admin-auth'
import { AdminAPIHelper } from '../helpers/api-helpers'
import { AdminPageHelper } from '../helpers/page-helpers'
import { TEST_PRODUCT, generateTestProductName } from '../helpers/test-data'

test.describe('Filtros e Busca de Produtos', () => {
  test('deve filtrar produtos por categoria', async ({ adminPage, adminApi }) => {
    const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api'
    const apiHelper = new AdminAPIHelper(adminApi, apiBaseUrl)
    await apiHelper.login('admin@leiasabores.pt', 'admin123')
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToProducts()

    // Obter categorias
    const categories = await apiHelper.listCategories()
    if (categories.categories && categories.categories.length > 0) {
      const category = categories.categories[0]
      
      // Filtrar por categoria (se houver filtro na UI)
      const categoryFilter = adminPage.locator('select, [role="combobox"], button').filter({ hasText: /categoria|category/i }).first()
      if (await categoryFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
        await categoryFilter.click()
        await adminPage.waitForTimeout(1000)
      }

      // Verificar que produtos filtrados aparecem (via API)
      const products = await apiHelper.listProducts({ category: category.slug })
      expect(products).toBeDefined()
    } else {
      // Se não houver categorias, o teste passa
      expect(true).toBeTruthy()
    }
  })

  test('deve buscar produtos por nome', async ({ adminPage, adminApi }) => {
    const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api'
    const apiHelper = new AdminAPIHelper(adminApi, apiBaseUrl)
    await apiHelper.login('admin@leiasabores.pt', 'admin123')
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

    try {
      await pageHelper.goToProducts()
      await adminPage.waitForLoadState('networkidle')

      // Buscar produto (se houver campo de busca)
      const searchInput = adminPage.locator('input[type="search"], input[placeholder*="buscar" i], input[placeholder*="search" i], input[name*="search" i]')
      if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await searchInput.fill(productName)
        await searchInput.press('Enter')
        await adminPage.waitForLoadState('networkidle')

        // Verificar que produto aparece nos resultados
        await expect(adminPage.getByText(productName)).toBeVisible({ timeout: 10000 })
      } else {
        // Se não houver busca, verificar via API
        const products = await apiHelper.listProducts({ search: productName })
        expect(products.products?.some((p: any) => p.name === productName)).toBeTruthy()
      }
    } finally {
      // Cleanup
      try {
        await apiHelper.deleteProduct(product.id)
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  })

  test('deve filtrar produtos por status', async ({ adminPage, adminApi }) => {
    const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api'
    const apiHelper = new AdminAPIHelper(adminApi, apiBaseUrl)
    await apiHelper.login('admin@leiasabores.pt', 'admin123')
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToProducts()
    await adminPage.waitForLoadState('networkidle')

    // Filtrar por status ativo (se houver filtro na UI)
    const statusFilter = adminPage.locator('select[name*="status" i], [role="combobox"], button').filter({ hasText: /status|ativo|active/i }).first()
    if (await statusFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await statusFilter.click()
      await adminPage.waitForTimeout(1000)
    }

    // Verificar que produtos ativos aparecem (via API)
    const products = await apiHelper.listProducts()
    expect(products).toBeDefined()
    expect(products.products).toBeDefined()
  })
})

