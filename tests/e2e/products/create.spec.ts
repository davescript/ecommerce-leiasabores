import { test, expect } from '../fixtures/admin-auth'
import { AdminAPIHelper } from '../helpers/api-helpers'
import { AdminPageHelper } from '../helpers/page-helpers'
import { TEST_PRODUCT, generateTestProductName } from '../helpers/test-data'

/**
 * Testes de Criação de Produtos
 */
test.describe('Criar Produto', () => {
  test('deve criar produto com todos os campos', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )
    const pageHelper = new AdminPageHelper(adminPage)

    // Navegar para página de produtos
    await pageHelper.goToProducts()

    // Clicar em "Novo Produto" ou "Criar Produto"
    await pageHelper.clickButton(/novo|criar|create/i)

    // Aguardar modal/formulário abrir
    await adminPage.waitForSelector('[role="dialog"], .modal, form', { timeout: 5000 })

    // Preencher formulário
    const productName = generateTestProductName()
    await pageHelper.fillInput('Nome', productName)
    await pageHelper.fillInput('Descrição', TEST_PRODUCT.description)
    await pageHelper.fillInput('Preço', TEST_PRODUCT.price.toString())
    
    if (TEST_PRODUCT.originalPrice) {
      await pageHelper.fillInput('Preço Original', TEST_PRODUCT.originalPrice.toString())
    }

    // Selecionar categoria
    if (TEST_PRODUCT.category) {
      await pageHelper.selectOption('Categoria', TEST_PRODUCT.category)
    }

    // Salvar produto
    await pageHelper.saveForm()

    // Aguardar produto aparecer na lista
    await adminPage.waitForTimeout(2000)
    await expect(adminPage.getByText(productName)).toBeVisible({ timeout: 10000 })

    // Verificar no banco de dados via API
    const products = await apiHelper.listProducts({ search: productName })
    const createdProduct = products.products?.find((p: any) => p.name === productName)
    
    expect(createdProduct).toBeTruthy()
    expect(createdProduct.price).toBe(TEST_PRODUCT.price)
    expect(createdProduct.category).toBe(TEST_PRODUCT.category)

    // Cleanup: deletar produto de teste
    if (createdProduct) {
      await apiHelper.deleteProduct(createdProduct.id)
    }
  })

  test('deve validar campos obrigatórios', async ({ adminPage }) => {
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToProducts()
    await pageHelper.clickButton(/novo|criar|create/i)
    await adminPage.waitForSelector('[role="dialog"], .modal, form', { timeout: 5000 })

    // Tentar salvar sem preencher campos obrigatórios
    await pageHelper.clickButton('Salvar')

    // Verificar mensagens de erro
    await expect(adminPage.locator('text=/obrigatório|required/i')).toBeVisible({ timeout: 5000 })
  })

  test('deve validar preço maior que zero', async ({ adminPage }) => {
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToProducts()
    await pageHelper.clickButton(/novo|criar|create/i)
    await adminPage.waitForSelector('[role="dialog"], .modal, form', { timeout: 5000 })

    // Preencher com preço inválido
    await pageHelper.fillInput('Nome', 'Produto Teste')
    await pageHelper.fillInput('Preço', '0')
    await pageHelper.selectOption('Categoria', TEST_PRODUCT.category)
    await pageHelper.clickButton('Salvar')

    // Verificar erro de validação
    await expect(adminPage.locator('text=/preço|price|maior que zero/i')).toBeVisible({ timeout: 5000 })
  })

  test('deve validar preço promocional maior que preço', async ({ adminPage }) => {
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToProducts()
    await pageHelper.clickButton(/novo|criar|create/i)
    await adminPage.waitForSelector('[role="dialog"], .modal, form', { timeout: 5000 })

    // Preencher com preço promocional inválido
    await pageHelper.fillInput('Nome', 'Produto Teste')
    await pageHelper.fillInput('Preço', '50')
    await pageHelper.fillInput('Preço Original', '30') // Menor que preço
    await pageHelper.selectOption('Categoria', TEST_PRODUCT.category)
    await pageHelper.clickButton('Salvar')

    // Verificar erro de validação
    await expect(adminPage.locator('text=/preço original|original price|maior que/i')).toBeVisible({ timeout: 5000 })
  })

  test('deve criar produto e aparecer no site público', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )
    const pageHelper = new AdminPageHelper(adminPage)

    // Criar produto via API
    const productName = generateTestProductName()
    const product = await apiHelper.createProduct({
      name: productName,
      description: TEST_PRODUCT.description,
      price: TEST_PRODUCT.price,
      category: TEST_PRODUCT.category,
      inStock: true,
      status: 'active',
    })

    expect(product).toBeTruthy()
    expect(product.name).toBe(productName)

    // Aguardar um pouco para cache ser atualizado
    await adminPage.waitForTimeout(2000)

    // Verificar no site público
    const publicPage = adminPage.context().pages()[0] || await adminPage.context().newPage()
    await publicPage.goto('/')
    
    // Procurar produto na página pública
    await publicPage.waitForSelector('body', { timeout: 10000 })
    const productVisible = await publicPage.getByText(productName).isVisible().catch(() => false)

    // Produto deve estar visível no site público
    expect(productVisible).toBeTruthy()

    // Cleanup
    await apiHelper.deleteProduct(product.id)
    await publicPage.close()
  })
})

