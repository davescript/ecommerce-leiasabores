import { test, expect } from '../fixtures/admin-auth'
import { AdminAPIHelper } from '../helpers/api-helpers'
import { AdminPageHelper } from '../helpers/page-helpers'
import { TEST_CATEGORY, generateTestProductName } from '../helpers/test-data'

/**
 * Testes de CRUD de Categorias
 */
test.describe('Categorias CRUD', () => {
  let createdCategoryId: string
  let createdCategoryName: string

  test('deve criar categoria', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToCategories()

    // Clicar em "Nova Categoria"
    await pageHelper.clickButton(/nova|criar|create/i)

    // Aguardar modal/formulário
    await adminPage.waitForSelector('[role="dialog"], .modal, form', { timeout: 5000 })

    // Preencher formulário
    createdCategoryName = `Categoria Teste E2E ${Date.now()}`
    await pageHelper.fillInput('Nome', createdCategoryName)
    await pageHelper.fillInput('Slug', `categoria-teste-e2e-${Date.now()}`)
    await pageHelper.fillInput('Descrição', TEST_CATEGORY.description)

    // Salvar
    await pageHelper.saveForm()

    // Aguardar categoria aparecer na lista
    await adminPage.waitForTimeout(2000)
    await expect(adminPage.getByText(createdCategoryName)).toBeVisible({ timeout: 10000 })

    // Verificar no banco de dados
    const categories = await apiHelper.listCategories()
    const createdCategory = categories.find((c: any) => c.name === createdCategoryName)
    
    expect(createdCategory).toBeTruthy()
    createdCategoryId = createdCategory.id
  })

  test('deve editar categoria', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )
    const pageHelper = new AdminPageHelper(adminPage)

    // Criar categoria primeiro
    createdCategoryName = `Categoria Teste E2E ${Date.now()}`
    const category = await apiHelper.createCategory({
      name: createdCategoryName,
      slug: `categoria-teste-e2e-${Date.now()}`,
      description: TEST_CATEGORY.description,
    })
    createdCategoryId = category.id

    await pageHelper.goToCategories()
    await expect(adminPage.getByText(createdCategoryName)).toBeVisible({ timeout: 10000 })

    // Clicar em editar
    const categoryRow = adminPage.locator('tr, [data-testid="category-item"]').filter({ hasText: createdCategoryName }).first()
    await categoryRow.getByRole('button', { name: /editar|edit/i }).click()

    // Aguardar modal
    await adminPage.waitForSelector('[role="dialog"], .modal', { timeout: 5000 })

    // Editar nome
    const newName = `Categoria Editada ${Date.now()}`
    await pageHelper.fillInput('Nome', newName)
    await pageHelper.saveForm()

    // Aguardar atualização
    await adminPage.waitForTimeout(2000)

    // Verificar no banco de dados
    const updatedCategory = await apiHelper.listCategories()
    const foundCategory = updatedCategory.find((c: any) => c.id === createdCategoryId)
    expect(foundCategory?.name).toBe(newName)

    // Cleanup
    await apiHelper.deleteCategory(createdCategoryId)
  })

  test('deve criar subcategoria', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )
    const pageHelper = new AdminPageHelper(adminPage)

    // Criar categoria pai primeiro
    const parentCategory = await apiHelper.createCategory({
      name: `Categoria Pai ${Date.now()}`,
      slug: `categoria-pai-${Date.now()}`,
      description: 'Categoria pai para teste',
    })

    await pageHelper.goToCategories()
    await pageHelper.clickButton(/nova|criar|create/i)
    await adminPage.waitForSelector('[role="dialog"], .modal', { timeout: 5000 })

    // Criar subcategoria
    const subCategoryName = `Subcategoria ${Date.now()}`
    await pageHelper.fillInput('Nome', subCategoryName)
    await pageHelper.fillInput('Slug', `subcategoria-${Date.now()}`)
    await pageHelper.selectOption('Categoria Pai', parentCategory.name)
    await pageHelper.saveForm()

    // Aguardar subcategoria aparecer
    await adminPage.waitForTimeout(2000)
    await expect(adminPage.getByText(subCategoryName)).toBeVisible({ timeout: 10000 })

    // Verificar no banco de dados
    const categories = await apiHelper.listCategories()
    const subCategory = categories.find((c: any) => c.name === subCategoryName)
    expect(subCategory).toBeTruthy()
    expect(subCategory.parentId).toBe(parentCategory.id)

    // Cleanup
    if (subCategory) await apiHelper.deleteCategory(subCategory.id)
    await apiHelper.deleteCategory(parentCategory.id)
  })

  test('deve prevenir exclusão de categoria com produtos', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )
    const pageHelper = new AdminPageHelper(adminPage)

    // Criar categoria
    const category = await apiHelper.createCategory({
      name: `Categoria Com Produtos ${Date.now()}`,
      slug: `categoria-com-produtos-${Date.now()}`,
      description: 'Categoria com produtos associados',
    })

    // Criar produto associado à categoria
    const product = await apiHelper.createProduct({
      name: generateTestProductName(),
      description: 'Produto de teste',
      price: 10,
      category: category.slug,
      inStock: true,
      status: 'active',
    })

    await pageHelper.goToCategories()
    await expect(adminPage.getByText(category.name)).toBeVisible({ timeout: 10000 })

    // Tentar deletar categoria
    const categoryRow = adminPage.locator('tr, [data-testid="category-item"]').filter({ hasText: category.name }).first()
    await categoryRow.getByRole('button', { name: /excluir|delete|remover/i }).click()

    // Confirmar deleção
    await adminPage.getByRole('button', { name: /confirmar|sim|yes/i }).click()

    // Verificar mensagem de erro
    await pageHelper.waitForErrorToast(/produtos|products|associados/i)

    // Verificar que categoria ainda existe
    const categories = await apiHelper.listCategories()
    const foundCategory = categories.find((c: any) => c.id === category.id)
    expect(foundCategory).toBeTruthy()

    // Cleanup
    await apiHelper.deleteProduct(product.id)
    await apiHelper.deleteCategory(category.id)
  })

  test('deve excluir categoria sem produtos', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(
      adminApi,
      process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
      adminToken
    )
    const pageHelper = new AdminPageHelper(adminPage)

    // Criar categoria sem produtos
    const category = await apiHelper.createCategory({
      name: `Categoria Sem Produtos ${Date.now()}`,
      slug: `categoria-sem-produtos-${Date.now()}`,
      description: 'Categoria sem produtos associados',
    })

    await pageHelper.goToCategories()
    await expect(adminPage.getByText(category.name)).toBeVisible({ timeout: 10000 })

    // Deletar categoria
    const categoryRow = adminPage.locator('tr, [data-testid="category-item"]').filter({ hasText: category.name }).first()
    await categoryRow.getByRole('button', { name: /excluir|delete|remover/i }).click()
    await adminPage.getByRole('button', { name: /confirmar|sim|yes/i }).click()

    // Aguardar categoria desaparecer
    await adminPage.waitForTimeout(2000)
    await expect(adminPage.getByText(category.name)).not.toBeVisible({ timeout: 5000 })

    // Verificar no banco de dados
    const categories = await apiHelper.listCategories()
    const foundCategory = categories.find((c: any) => c.id === category.id)
    expect(foundCategory).toBeFalsy()
  })

  test.afterEach(async ({ adminApi, adminToken }) => {
    // Cleanup: deletar categoria criada
    if (createdCategoryId) {
      const apiHelper = new AdminAPIHelper(
        adminApi,
        process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
        adminToken
      )
      try {
        await apiHelper.deleteCategory(createdCategoryId)
      } catch (error) {
        // Ignore errors in cleanup
      }
    }
  })
})

