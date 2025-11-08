import { test, expect } from '../fixtures/admin-auth'
import { AdminPageHelper } from '../helpers/page-helpers'

test.describe('Configurações do Admin', () => {
  test('deve carregar página de configurações', async ({ adminPage }) => {
    const pageHelper = new AdminPageHelper(adminPage)
    await adminPage.goto('/admin/settings')
    await pageHelper.waitForAdminLoad()
    
    // Verificar se página carregou
    await expect(adminPage.locator('h1, [data-testid="settings-page"]')).toBeVisible({ timeout: 10000 })
  })

  test('deve atualizar nome da loja', async ({ adminPage }) => {
    const pageHelper = new AdminPageHelper(adminPage)
    await adminPage.goto('/admin/settings')
    await pageHelper.waitForAdminLoad()

    // Procurar campo de nome da loja
    const storeNameInput = adminPage.locator('input[name*="store"], input[name*="name"], input[placeholder*="nome"]').first()
    if (await storeNameInput.isVisible()) {
      await storeNameInput.fill('Leia Sabores Teste')
      await pageHelper.clickButton('Salvar')
      await pageHelper.waitForSuccessToast()
    }
  })
})

