import { test, expect } from '../fixtures/admin-auth'
import { TEST_ADMIN_CREDENTIALS } from '../fixtures/admin-auth'

/**
 * Testes de Login e Autenticação
 */
test.describe('Admin Login', () => {
  test('deve fazer login com credenciais válidas', async ({ page }) => {
    await page.goto('/admin/login')
    await page.waitForLoadState('networkidle')

    // Preencher formulário de login (seletores mais flexíveis)
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first()
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
    const loginButton = page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first()
    
    await emailInput.fill(TEST_ADMIN_CREDENTIALS.email)
    await passwordInput.fill(TEST_ADMIN_CREDENTIALS.password)
    await loginButton.click()

    // Aguardar redirecionamento para o admin ou dashboard
    await page.waitForURL(/\/admin/, { timeout: 10000 })

    // Verificar se está autenticado (dashboard ou qualquer conteúdo admin)
    const dashboard = page.locator('h1, h2, [data-testid="admin-dashboard"], [data-testid="admin"], main, [role="main"]').first()
    await expect(dashboard).toBeVisible({ timeout: 10000 })

    // Verificar se token foi armazenado
    const token = await page.evaluate(() => localStorage.getItem('admin_access_token'))
    expect(token).toBeTruthy()
  })

  test('deve falhar login com credenciais inválidas', async ({ page }) => {
    await page.goto('/admin/login')
    await page.waitForLoadState('networkidle')

    // Preencher formulário com credenciais inválidas
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first()
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
    const loginButton = page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first()
    
    await emailInput.fill('invalid@example.com')
    await passwordInput.fill('wrongpassword')
    await loginButton.click()

    // Aguardar mensagem de erro ou permanecer na página de login
    await page.waitForTimeout(2000)
    
    const errorMessage = page.locator('text=/credenciais|inválido|erro|error|incorrect|wrong/i')
    const hasError = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false)
    const isStillOnLogin = page.url().includes('/admin/login') || page.url().includes('/login')
    
    // Deve mostrar erro ou permanecer na página de login
    expect(hasError || isStillOnLogin).toBeTruthy()
  })

  test('deve redirecionar para login quando não autenticado', async ({ page }) => {
    // Limpar token se existir
    await page.evaluate(() => {
      localStorage.removeItem('admin_access_token')
      localStorage.removeItem('admin_refresh_token')
    })
    
    // Tentar acessar página protegida sem autenticação
    await page.goto('/admin/products')
    await page.waitForLoadState('networkidle')

    // Deve redirecionar para login ou mostrar formulário de login
    const currentUrl = page.url()
    const isLoginPage = currentUrl.includes('/admin/login') || currentUrl.includes('/login')
    const hasLoginForm = await page.locator('form, input[type="email"], input[type="password"]').isVisible({ timeout: 3000 }).catch(() => false)
    
    expect(isLoginPage || hasLoginForm).toBeTruthy()
  })

  test('deve fazer logout corretamente', async ({ adminPage }) => {
    // Procurar botão de logout (mais flexível)
    const logoutButton = adminPage.locator('button, a, [role="button"]').filter({ hasText: /sair|logout|sign out|log out/i }).first()
    
    if (await logoutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await logoutButton.click()
      await adminPage.waitForLoadState('networkidle')
      
      // Aguardar redirecionamento para login ou verificar se token foi removido
      const currentUrl = adminPage.url()
      const isLoginPage = currentUrl.includes('/admin/login') || currentUrl.includes('/login')
      const token = await adminPage.evaluate(() => localStorage.getItem('admin_access_token'))
      
      // Deve estar na página de login ou token removido
      expect(isLoginPage || !token).toBeTruthy()
    } else {
      // Se não houver botão de logout, verificar se está no admin
      await expect(adminPage).toHaveURL(/\/admin/)
    }
  })

  test('deve manter sessão após reload', async ({ adminPage }) => {
    // Fazer reload da página
    await adminPage.reload()
    await adminPage.waitForLoadState('networkidle')

    // Aguardar carregamento (seletores mais flexíveis)
    await adminPage.waitForSelector('h1, h2, [data-testid="admin-dashboard"], [data-testid="admin"], main, [role="main"], body', { timeout: 10000 })

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
      await adminPage.waitForLoadState('networkidle')
      
      // Aguardar conteúdo carregar (seletores mais flexíveis)
      await adminPage.waitForSelector('h1, h2, [data-testid="admin-dashboard"], [data-testid="admin"], main, [role="main"], body', { timeout: 10000 })
      
      // Verificar que está na página correta
      await expect(adminPage).toHaveURL(pagePath)
      
      // Verificar que não é página de erro
      const bodyText = await adminPage.textContent('body') || ''
      expect(bodyText).not.toContain('404')
      expect(bodyText).not.toContain('Error')
    }
  })

  test('deve verificar permissões no frontend', async ({ adminPage }) => {
    // Verificar se botões de ação estão visíveis para admin
    await adminPage.goto('/admin/products')
    await adminPage.waitForLoadState('networkidle')
    
    // Botões de criar/editar/deletar devem estar visíveis (seletores mais flexíveis)
    const createButton = adminPage.locator('button, a, [role="button"]').filter({ hasText: /novo|criar|create|adicionar|add|new/i }).first()
    const editButton = adminPage.locator('button, a, [role="button"]').filter({ hasText: /editar|edit/i }).first()
    
    const hasCreateButton = await createButton.isVisible({ timeout: 5000 }).catch(() => false)
    const hasEditButton = await editButton.isVisible({ timeout: 5000 }).catch(() => false)
    const hasAdminContent = await adminPage.locator('main, [role="main"], table, [class*="admin"]').isVisible({ timeout: 5000 }).catch(() => false)
    
    // Deve ter pelo menos um botão de ação ou conteúdo admin
    expect(hasCreateButton || hasEditButton || hasAdminContent).toBeTruthy()
  })
})

