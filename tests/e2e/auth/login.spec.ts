import { test, expect } from '../fixtures/admin-auth'
import { TEST_ADMIN_CREDENTIALS } from '../fixtures/admin-auth'

/**
 * Testes de Login e Autenticação
 */
test.describe('Admin Login', () => {
  test('deve fazer login com credenciais válidas', async ({ page }) => {
    await page.goto('/admin/login')

    // Preencher formulário de login
    await page.getByLabel('Email').fill(TEST_ADMIN_CREDENTIALS.email)
    await page.getByLabel('Senha').fill(TEST_ADMIN_CREDENTIALS.password)
    await page.getByRole('button', { name: /entrar|login/i }).click()

    // Aguardar redirecionamento para o admin
    await page.waitForURL('/admin', { timeout: 10000 })

    // Verificar se está autenticado (dashboard visível)
    await expect(page.locator('h1, [data-testid="admin-dashboard"]')).toBeVisible()

    // Verificar se token foi armazenado
    const token = await page.evaluate(() => localStorage.getItem('admin_access_token'))
    expect(token).toBeTruthy()
  })

  test('deve falhar login com credenciais inválidas', async ({ page }) => {
    await page.goto('/admin/login')

    // Tentar login com credenciais inválidas
    await page.getByLabel('Email').fill('invalid@example.com')
    await page.getByLabel('Senha').fill('wrongpassword')
    await page.getByRole('button', { name: /entrar|login/i }).click()

    // Aguardar mensagem de erro
    await expect(page.locator('text=/credenciais|inválido|erro/i')).toBeVisible({ timeout: 5000 })

    // Verificar que não foi redirecionado
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('deve redirecionar para login quando não autenticado', async ({ page }) => {
    // Tentar acessar página protegida sem autenticação
    await page.goto('/admin/products')

    // Deve redirecionar para login
    await page.waitForURL('/admin/login', { timeout: 5000 })
  })

  test('deve fazer logout corretamente', async ({ adminPage }) => {
    // Fazer logout
    await adminPage.getByRole('button', { name: /sair|logout/i }).click()

    // Aguardar redirecionamento para login
    await adminPage.waitForURL('/admin/login', { timeout: 5000 })

    // Verificar se token foi removido
    const token = await adminPage.evaluate(() => localStorage.getItem('admin_access_token'))
    expect(token).toBeNull()
  })

  test('deve manter sessão após reload', async ({ adminPage }) => {
    // Fazer reload da página
    await adminPage.reload()

    // Aguardar carregamento
    await adminPage.waitForSelector('h1, [data-testid="admin-dashboard"]', { timeout: 10000 })

    // Verificar se ainda está autenticado
    await expect(adminPage).toHaveURL(/\/admin/)
    const token = await adminPage.evaluate(() => localStorage.getItem('admin_access_token'))
    expect(token).toBeTruthy()
  })
})

/**
 * Testes de RBAC (Role-Based Access Control)
 */
test.describe('Admin RBAC', () => {
  test('admin deve acessar todas as páginas', async ({ adminPage, adminUser }) => {
    expect(adminUser.role).toBe('admin')

    // Testar acesso a diferentes páginas
    const pages = ['/admin', '/admin/products', '/admin/categories', '/admin/coupons', '/admin/orders', '/admin/customers', '/admin/settings']

    for (const pagePath of pages) {
      await adminPage.goto(pagePath)
      await adminPage.waitForSelector('h1, [data-testid="admin-dashboard"]', { timeout: 10000 })
      await expect(adminPage).toHaveURL(pagePath)
    }
  })

  test('deve verificar permissões no frontend', async ({ adminPage }) => {
    // Verificar se botões de ação estão visíveis para admin
    await adminPage.goto('/admin/products')
    
    // Botões de criar/editar/deletar devem estar visíveis
    await expect(adminPage.getByRole('button', { name: /novo|criar|create/i })).toBeVisible({ timeout: 5000 })
  })
})

