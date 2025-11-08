import { test, expect } from '../fixtures/admin-auth'
import { AdminAPIHelper } from '../helpers/api-helpers'
import { AdminPageHelper } from '../helpers/page-helpers'
import { TEST_PRODUCT, generateTestProductName } from '../helpers/test-data'

test.describe('Stress Tests', () => {
  test('deve prevenir double-click em salvar', async ({ adminPage, adminApi }) => {
    const apiHelper = new AdminAPIHelper(adminApi, process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api')
    await apiHelper.login('admin@leiasabores.pt', 'admin123')
    const pageHelper = new AdminPageHelper(adminPage)

    // Criar produto
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
    await expect(adminPage.getByText(productName)).toBeVisible({ timeout: 10000 })

    // Abrir modal de edição
    await pageHelper.openEditProductModal(productName)

    // Clicar rapidamente múltiplas vezes em salvar
    const saveButton = adminPage.getByRole('button', { name: /salvar|save/i })
    await saveButton.click()
    await saveButton.click()
    await saveButton.click()

    // Aguardar
    await adminPage.waitForTimeout(3000)

    // Verificar que produto foi atualizado apenas uma vez (não há duplicatas)
    const products = await apiHelper.listProducts({ search: productName })
    const foundProducts = products.products?.filter((p: any) => p.name === productName) || []
    expect(foundProducts.length).toBe(1)

    // Cleanup
    await apiHelper.deleteProduct(product.id)
  })

  test('deve lidar com múltiplas abas abertas', async ({ adminPage, adminApi }) => {
    const apiHelper = new AdminAPIHelper(adminApi, process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api')

    // Criar produto
    const productName = generateTestProductName()
    const product = await apiHelper.createProduct({
      name: productName,
      description: TEST_PRODUCT.description,
      price: TEST_PRODUCT.price,
      category: TEST_PRODUCT.category,
      inStock: true,
      status: 'active',
    })

    // Abrir múltiplas abas
    const page1 = adminPage
    const page2 = await adminPage.context().newPage()
    const page3 = await adminPage.context().newPage()

    // Navegar para produtos em todas as abas
    await page1.goto('/admin/products')
    await page2.goto('/admin/products')
    await page3.goto('/admin/products')

    // Aguardar carregamento
    await page1.waitForSelector('body', { timeout: 10000 })
    await page2.waitForSelector('body', { timeout: 10000 })
    await page3.waitForSelector('body', { timeout: 10000 })

    // Verificar que produto aparece em todas as abas
    await expect(page1.getByText(productName)).toBeVisible({ timeout: 10000 })
    await expect(page2.getByText(productName)).toBeVisible({ timeout: 10000 })
    await expect(page3.getByText(productName)).toBeVisible({ timeout: 10000 })

    // Fechar abas extras
    await page2.close()
    await page3.close()

    // Cleanup
    await apiHelper.deleteProduct(product.id)
  })

  test('deve lidar com paginação robusta', async ({ adminApi }) => {
    const apiHelper = new AdminAPIHelper(adminApi, process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api')

    // Testar diferentes páginas
    for (let page = 1; page <= 3; page++) {
      const products = await apiHelper.listProducts({ page, limit: 20 })
      expect(products).toBeDefined()
      expect(products.pagination).toBeDefined()
      expect(products.pagination.page).toBe(page)
    }
  })
})

