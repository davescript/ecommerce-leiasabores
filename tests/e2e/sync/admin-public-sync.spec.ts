import { test, expect } from '../fixtures/admin-auth'
import { AdminAPIHelper } from '../helpers/api-helpers'
import { TEST_PRODUCT, generateTestProductName } from '../helpers/test-data'

test.describe('Sincronização Admin ↔ Site Público', () => {
  test('deve atualizar produto no admin e refletir no site público', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(adminApi, process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api')
    await apiHelper.login('admin@leiasabores.pt', 'admin123')

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

    // Aguardar cache ser atualizado
    await adminPage.waitForTimeout(3000)

    // Verificar no site público
    const publicPage = await adminPage.context().newPage()
    await publicPage.goto('/')
    await publicPage.waitForSelector('body', { timeout: 10000 })

    const productVisible = await publicPage.getByText(productName).isVisible().catch(() => false)
    expect(productVisible).toBeTruthy()

    // Atualizar produto
    const newPrice = 59.99
    await apiHelper.updateProduct(product.id, { price: newPrice })
    await adminPage.waitForTimeout(3000)

    // Verificar preço atualizado no site público
    await publicPage.reload()
    await publicPage.waitForTimeout(2000)
    const priceVisible = await publicPage.getByText(newPrice.toString()).isVisible().catch(() => false)
    expect(priceVisible).toBeTruthy()

    // Cleanup
    await apiHelper.deleteProduct(product.id)
    await publicPage.close()
  })
})

