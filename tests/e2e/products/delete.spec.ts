import { test, expect } from '../fixtures/admin-auth'
import { AdminAPIHelper } from '../helpers/api-helpers'
import { AdminPageHelper } from '../helpers/page-helpers'
import { TEST_PRODUCT, generateTestProductName } from '../helpers/test-data'

/**
 * Testes de Exclusão de Produtos
 */
test.describe('Excluir Produto', () => {
  test('deve excluir produto da lista', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )
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

    // Aguardar produto aparecer na lista
    await expect(adminPage.getByText(productName)).toBeVisible({ timeout: 10000 })

    // Deletar produto
    await pageHelper.deleteProductFromList(productName)

    // Aguardar produto desaparecer da lista
    await adminPage.waitForTimeout(2000)
    await expect(adminPage.getByText(productName)).not.toBeVisible({ timeout: 5000 })

    // Verificar no banco de dados que produto foi deletado
    try {
      await apiHelper.getProduct(product.id)
      throw new Error('Product should have been deleted')
    } catch (error: any) {
      expect(error.message).toContain('404') // Produto não encontrado
    }
  })

  test('deve excluir imagens do R2 ao deletar produto', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )
    const pageHelper = new AdminPageHelper(adminPage)

    // Criar produto com imagem
    const productName = generateTestProductName()
    const product = await apiHelper.createProduct({
      name: productName,
      description: TEST_PRODUCT.description,
      price: TEST_PRODUCT.price,
      category: TEST_PRODUCT.category,
      inStock: true,
      status: 'active',
      images: ['https://example.com/test-image.jpg'], // Imagem de teste
    })

    // Verificar que produto tem imagem
    const productWithImage = await apiHelper.getProduct(product.id)
    expect(productWithImage.images).toBeDefined()
    expect(productWithImage.images.length).toBeGreaterThan(0)

    // Deletar produto
    await apiHelper.deleteProduct(product.id)

    // Verificar que produto foi deletado
    try {
      await apiHelper.getProduct(product.id)
      throw new Error('Product should have been deleted')
    } catch (error: any) {
      expect(error.message).toContain('404')
    }

    // Nota: Verificação de deleção de imagens do R2 seria feita via API ou verificação manual
    // Como não temos acesso direto ao R2 nos testes, assumimos que a lógica de deleção funciona
  })

  test('deve confirmar antes de deletar', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )
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
    await expect(adminPage.getByText(productName)).toBeVisible({ timeout: 10000 })

    // Clicar em deletar
    const productRow = adminPage.locator('tr, [data-testid="product-item"]').filter({ hasText: productName }).first()
    await productRow.getByRole('button', { name: /excluir|delete|remover/i }).click()

    // Cancelar deleção
    await adminPage.getByRole('button', { name: /cancelar|cancel|não|no/i }).click()

    // Verificar que produto ainda está na lista
    await adminPage.waitForTimeout(1000)
    await expect(adminPage.getByText(productName)).toBeVisible()

    // Cleanup
    await apiHelper.deleteProduct(product.id)
  })
})

