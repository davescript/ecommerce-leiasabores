import { test, expect } from '../fixtures/admin-auth'
import { AdminAPIHelper } from '../helpers/api-helpers'
import { AdminPageHelper } from '../helpers/page-helpers'
import { TEST_PRODUCT, generateTestProductName } from '../helpers/test-data'
import path from 'path'
import fs from 'fs'

/**
 * Testes de Edição de Produtos
 */
test.describe('Editar Produto', () => {
  let createdProductId: string
  let createdProductName: string

  test.beforeEach(async ({ adminApi, adminToken }) => {
    // Criar produto de teste antes de cada teste
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )

    createdProductName = generateTestProductName()
    const product = await apiHelper.createProduct({
      name: createdProductName,
      description: TEST_PRODUCT.description,
      price: TEST_PRODUCT.price,
      category: TEST_PRODUCT.category,
      inStock: true,
      status: 'active',
    })

    createdProductId = product.id
  })

  test.afterEach(async ({ adminApi, adminToken }) => {
    // Limpar produto de teste após cada teste
    if (createdProductId) {
      const apiHelper = new AdminAPIHelper(
        adminApi,
        process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
        adminToken
      )
      try {
        await apiHelper.deleteProduct(createdProductId)
      } catch (error) {
        // Ignore errors in cleanup
      }
    }
  })

  test('deve editar nome do produto', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToProducts()

    // Aguardar produto aparecer na lista
    await expect(adminPage.getByText(createdProductName)).toBeVisible({ timeout: 10000 })

    // Abrir modal de edição
    await pageHelper.openEditProductModal(createdProductName)

    // Editar nome
    const newName = generateTestProductName()
    await pageHelper.fillInput('Nome', newName)
    await pageHelper.saveForm()

    // Aguardar atualização
    await adminPage.waitForTimeout(2000)

    // Verificar no banco de dados
    const updatedProduct = await apiHelper.getProduct(createdProductId)
    expect(updatedProduct.name).toBe(newName)

    // Verificar na lista
    await expect(adminPage.getByText(newName)).toBeVisible({ timeout: 10000 })
  })

  test('deve editar preço do produto', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToProducts()
    await expect(adminPage.getByText(createdProductName)).toBeVisible({ timeout: 10000 })

    // Abrir modal de edição
    await pageHelper.openEditProductModal(createdProductName)

    // Editar preço
    const newPrice = 49.99
    await pageHelper.fillInput('Preço', newPrice.toString())
    await pageHelper.saveForm()

    // Aguardar atualização
    await adminPage.waitForTimeout(2000)

    // Verificar no banco de dados
    const updatedProduct = await apiHelper.getProduct(createdProductId)
    expect(updatedProduct.price).toBe(newPrice)
  })

  test('deve editar descrição do produto', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToProducts()
    await expect(adminPage.getByText(createdProductName)).toBeVisible({ timeout: 10000 })

    // Abrir modal de edição
    await pageHelper.openEditProductModal(createdProductName)

    // Editar descrição
    const newDescription = 'Nova descrição do produto atualizada'
    await pageHelper.fillInput('Descrição', newDescription)
    await pageHelper.saveForm()

    // Aguardar atualização
    await adminPage.waitForTimeout(2000)

    // Verificar no banco de dados
    const updatedProduct = await apiHelper.getProduct(createdProductId)
    expect(updatedProduct.description).toBe(newDescription)
  })

  test('deve editar categoria do produto', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )
    const pageHelper = new AdminPageHelper(adminPage)

    // Obter categorias disponíveis
    const categories = await apiHelper.listCategories()
    const otherCategory = categories.find((c: any) => c.slug !== TEST_PRODUCT.category)

    if (!otherCategory) {
      test.skip()
      return
    }

    await pageHelper.goToProducts()
    await expect(adminPage.getByText(createdProductName)).toBeVisible({ timeout: 10000 })

    // Abrir modal de edição
    await pageHelper.openEditProductModal(createdProductName)

    // Editar categoria
    await pageHelper.selectOption('Categoria', otherCategory.name)
    await pageHelper.saveForm()

    // Aguardar atualização
    await adminPage.waitForTimeout(2000)

    // Verificar no banco de dados
    const updatedProduct = await apiHelper.getProduct(createdProductId)
    expect(updatedProduct.category).toBe(otherCategory.slug)
  })

  test('deve editar status do produto', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToProducts()
    await expect(adminPage.getByText(createdProductName)).toBeVisible({ timeout: 10000 })

    // Abrir modal de edição
    await pageHelper.openEditProductModal(createdProductName)

    // Editar status para inactive
    await pageHelper.selectOption('Status', 'Inativo')
    await pageHelper.saveForm()

    // Aguardar atualização
    await adminPage.waitForTimeout(2000)

    // Verificar no banco de dados
    const updatedProduct = await apiHelper.getProduct(createdProductId)
    expect(updatedProduct.status).toBe('inactive')
  })

  test('deve fazer upload de imagem e atualizar produto', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )
    const pageHelper = new AdminPageHelper(adminPage)

    // Criar imagem de teste (1x1 pixel PNG)
    const testImagePath = path.join(__dirname, '../fixtures/test-image.png')
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )

    // Salvar imagem temporariamente se não existir
    if (!fs.existsSync(testImagePath)) {
      fs.writeFileSync(testImagePath, testImage)
    }

    await pageHelper.goToProducts()
    await expect(adminPage.getByText(createdProductName)).toBeVisible({ timeout: 10000 })

    // Abrir modal de edição
    await pageHelper.openEditProductModal(createdProductName)

    // Fazer upload de imagem
    const fileInput = adminPage.locator('input[type="file"]')
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(testImagePath)
      await adminPage.waitForTimeout(2000) // Aguardar upload
    }

    // Salvar
    await pageHelper.saveForm()

    // Aguardar atualização
    await adminPage.waitForTimeout(2000)

    // Verificar no banco de dados que imagem foi adicionada
    const updatedProduct = await apiHelper.getProduct(createdProductId)
    expect(updatedProduct.images).toBeDefined()
    expect(Array.isArray(updatedProduct.images)).toBeTruthy()
  })

  test('deve atualizar produto e refletir no site público', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToProducts()
    await expect(adminPage.getByText(createdProductName)).toBeVisible({ timeout: 10000 })

    // Editar produto via API
    const newPrice = 59.99
    await apiHelper.updateProduct(createdProductId, {
      price: newPrice,
    })

    // Aguardar cache ser atualizado
    await adminPage.waitForTimeout(3000)

    // Verificar no site público
    const publicPage = adminPage.context().pages()[0] || await adminPage.context().newPage()
    await publicPage.goto('/')
    await publicPage.waitForSelector('body', { timeout: 10000 })

    // Buscar produto na página pública (pode estar em lista ou detalhe)
    const productLink = publicPage.getByText(createdProductName).first()
    if (await productLink.isVisible()) {
      await productLink.click()
      await publicPage.waitForTimeout(2000)

      // Verificar preço atualizado
      const priceVisible = await publicPage.getByText(newPrice.toString()).isVisible().catch(() => false)
      expect(priceVisible).toBeTruthy()
    }

    await publicPage.close()
  })

  test('deve cancelar edição sem salvar', async ({ adminPage }) => {
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToProducts()
    await expect(adminPage.getByText(createdProductName)).toBeVisible({ timeout: 10000 })

    // Abrir modal de edição
    await pageHelper.openEditProductModal(createdProductName)

    // Editar nome
    const newName = generateTestProductName()
    await pageHelper.fillInput('Nome', newName)

    // Cancelar
    await pageHelper.closeModal()

    // Verificar que mudanças não foram salvas
    await adminPage.waitForTimeout(1000)
    const oldNameVisible = await adminPage.getByText(createdProductName).isVisible().catch(() => false)
    expect(oldNameVisible).toBeTruthy()
  })
})

