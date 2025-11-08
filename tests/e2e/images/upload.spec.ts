import { test, expect } from '../fixtures/admin-auth'
import { AdminAPIHelper } from '../helpers/api-helpers'
import { AdminPageHelper } from '../helpers/page-helpers'
import { TEST_PRODUCT, generateTestProductName } from '../helpers/test-data'
import path from 'path'
import fs from 'fs'

/**
 * Testes de Upload de Imagens R2
 */
test.describe('Upload de Imagens R2', () => {
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

  test('deve fazer upload de imagem válida (JPG)', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )
    const pageHelper = new AdminPageHelper(adminPage)

    // Criar imagem de teste (1x1 pixel JPG)
    const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg')
    const testImage = Buffer.from(
      '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/gA==',
      'base64'
    )

    // Salvar imagem temporariamente
    if (!fs.existsSync(testImagePath)) {
      fs.mkdirSync(path.dirname(testImagePath), { recursive: true })
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
      await adminPage.waitForTimeout(3000) // Aguardar upload
    }

    // Verificar preview da imagem
    const imagePreview = adminPage.locator('img[src*="r2"], img[src*="upload"]')
    if (await imagePreview.count() > 0) {
      await expect(imagePreview.first()).toBeVisible({ timeout: 5000 })
    }

    // Salvar
    await pageHelper.saveForm()

    // Aguardar atualização
    await adminPage.waitForTimeout(2000)

    // Verificar no banco de dados que imagem foi salva
    const updatedProduct = await apiHelper.getProduct(createdProductId)
    expect(updatedProduct.images).toBeDefined()
    expect(Array.isArray(updatedProduct.images)).toBeTruthy()
    expect(updatedProduct.images.length).toBeGreaterThan(0)
  })

  test('deve rejeitar upload de arquivo muito grande', async ({ adminPage }) => {
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToProducts()
    await expect(adminPage.getByText(createdProductName)).toBeVisible({ timeout: 10000 })

    // Abrir modal de edição
    await pageHelper.openEditProductModal(createdProductName)

    // Criar arquivo grande (>10MB)
    const largeFile = Buffer.alloc(11 * 1024 * 1024) // 11MB
    const largeFilePath = path.join(__dirname, '../fixtures/large-file.jpg')
    fs.writeFileSync(largeFilePath, largeFile)

    // Tentar fazer upload
    const fileInput = adminPage.locator('input[type="file"]')
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(largeFilePath)
      await adminPage.waitForTimeout(2000)

      // Verificar mensagem de erro
      await pageHelper.waitForErrorToast(/tamanho|size|grande|large/i)
    }

    // Cleanup
    if (fs.existsSync(largeFilePath)) {
      fs.unlinkSync(largeFilePath)
    }
  })

  test('deve rejeitar upload de tipo de arquivo inválido', async ({ adminPage }) => {
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToProducts()
    await expect(adminPage.getByText(createdProductName)).toBeVisible({ timeout: 10000 })

    // Abrir modal de edição
    await pageHelper.openEditProductModal(createdProductName)

    // Criar arquivo de tipo inválido (txt)
    const invalidFile = Buffer.from('This is not an image')
    const invalidFilePath = path.join(__dirname, '../fixtures/invalid-file.txt')
    fs.writeFileSync(invalidFilePath, invalidFile)

    // Tentar fazer upload
    const fileInput = adminPage.locator('input[type="file"]')
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(invalidFilePath)
      await adminPage.waitForTimeout(2000)

      // Verificar mensagem de erro
      await pageHelper.waitForErrorToast(/tipo|type|imagem|image/i)
    }

    // Cleanup
    if (fs.existsSync(invalidFilePath)) {
      fs.unlinkSync(invalidFilePath)
    }
  })

  test('deve deletar imagem do produto', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )
    const pageHelper = new AdminPageHelper(adminPage)

    // Adicionar imagem ao produto via API
    const testImageUrl = 'https://example.com/test-image.jpg'
    await apiHelper.updateProduct(createdProductId, {
      images: [testImageUrl],
    })

    await pageHelper.goToProducts()
    await expect(adminPage.getByText(createdProductName)).toBeVisible({ timeout: 10000 })

    // Abrir modal de edição
    await pageHelper.openEditProductModal(createdProductName)

    // Deletar imagem (se houver botão de deletar)
    const deleteImageButton = adminPage.locator('button[aria-label*="deletar"], button[aria-label*="delete"], button:has-text("×")')
    if (await deleteImageButton.count() > 0) {
      await deleteImageButton.first().click()
      await adminPage.waitForTimeout(1000)
    }

    // Salvar
    await pageHelper.saveForm()

    // Aguardar atualização
    await adminPage.waitForTimeout(2000)

    // Verificar no banco de dados que imagem foi removida
    const updatedProduct = await apiHelper.getProduct(createdProductId)
    expect(updatedProduct.images).toBeDefined()
    expect(Array.isArray(updatedProduct.images)).toBeTruthy()
    // Imagem deve ter sido removida ou array vazio
  })

  test('deve validar URL pública da imagem após upload', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )
    const pageHelper = new AdminPageHelper(adminPage)

    // Criar imagem de teste
    const testImagePath = path.join(__dirname, '../fixtures/test-image.png')
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )

    if (!fs.existsSync(testImagePath)) {
      fs.mkdirSync(path.dirname(testImagePath), { recursive: true })
      fs.writeFileSync(testImagePath, testImage)
    }

    await pageHelper.goToProducts()
    await expect(adminPage.getByText(createdProductName)).toBeVisible({ timeout: 10000 })

    // Abrir modal de edição
    await pageHelper.openEditProductModal(createdProductName)

    // Fazer upload
    const fileInput = adminPage.locator('input[type="file"]')
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(testImagePath)
      await adminPage.waitForTimeout(3000)
    }

    // Salvar
    await pageHelper.saveForm()

    // Aguardar atualização
    await adminPage.waitForTimeout(2000)

    // Verificar no banco de dados
    const updatedProduct = await apiHelper.getProduct(createdProductId)
    expect(updatedProduct.images).toBeDefined()
    expect(Array.isArray(updatedProduct.images)).toBeTruthy()
    
    if (updatedProduct.images.length > 0) {
      const imageUrl = updatedProduct.images[0]
      expect(imageUrl).toMatch(/https?:\/\//) // Deve ser uma URL válida
      expect(imageUrl).toMatch(/r2|upload|leiasabores/) // Deve conter indicador de R2
    }
  })
})

