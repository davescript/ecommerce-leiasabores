import type { Page, Locator } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * Helpers para interações com páginas do admin
 */
export class AdminPageHelper {
  constructor(private page: Page) {}

  /**
   * Aguardar carregamento do admin
   */
  async waitForAdminLoad(): Promise<void> {
    await this.page.waitForSelector(
      '[data-testid="admin-dashboard"], .admin-dashboard, h1, [role="main"]',
      { timeout: 10000 }
    )
  }

  /**
   * Navegar para página de produtos
   */
  async goToProducts(): Promise<void> {
    await this.page.goto('/admin/products')
    await this.waitForAdminLoad()
  }

  /**
   * Navegar para página de categorias
   */
  async goToCategories(): Promise<void> {
    await this.page.goto('/admin/categories')
    await this.waitForAdminLoad()
  }

  /**
   * Navegar para página de cupons
   */
  async goToCoupons(): Promise<void> {
    await this.page.goto('/admin/coupons')
    await this.waitForAdminLoad()
  }

  /**
   * Navegar para página de pedidos
   */
  async goToOrders(): Promise<void> {
    await this.page.goto('/admin/orders')
    await this.waitForAdminLoad()
  }

  /**
   * Navegar para página de clientes
   */
  async goToCustomers(): Promise<void> {
    await this.page.goto('/admin/customers')
    await this.waitForAdminLoad()
  }

  /**
   * Navegar para dashboard
   */
  async goToDashboard(): Promise<void> {
    await this.page.goto('/admin')
    await this.waitForAdminLoad()
  }

  /**
   * Clicar em botão por texto ou regex
   */
  async clickButton(text: string | RegExp): Promise<void> {
    if (text instanceof RegExp) {
      await this.page.getByRole('button', { name: text }).click()
    } else {
      await this.page.getByRole('button', { name: text, exact: false }).click()
    }
  }

  /**
   * Preencher input por label
   */
  async fillInput(label: string, value: string): Promise<void> {
    const input = this.page.getByLabel(label, { exact: false })
    await input.fill(value)
  }

  /**
   * Aguardar toast de sucesso
   */
  async waitForSuccessToast(message?: string): Promise<void> {
    const toast = this.page.locator('[role="status"], .toast, [data-sonner-toast]')
    if (message) {
      await expect(toast.filter({ hasText: message })).toBeVisible({ timeout: 5000 })
    } else {
      await expect(toast).toBeVisible({ timeout: 5000 })
    }
  }

  /**
   * Aguardar toast de erro
   */
  async waitForErrorToast(message?: string | RegExp): Promise<void> {
    const toast = this.page.locator('[role="alert"], .toast-error, [data-sonner-toast]')
    if (message) {
      if (message instanceof RegExp) {
        await expect(toast.filter({ hasText: message })).toBeVisible({ timeout: 5000 })
      } else {
        await expect(toast.filter({ hasText: message })).toBeVisible({ timeout: 5000 })
      }
    } else {
      await expect(toast).toBeVisible({ timeout: 5000 })
    }
  }

  /**
   * Fazer login via UI
   */
  async login(email: string, password: string): Promise<void> {
    await this.page.goto('/admin/login')
    await this.fillInput('Email', email)
    await this.fillInput('Senha', password)
    await this.clickButton('Entrar')
    await this.waitForAdminLoad()
  }

  /**
   * Fazer logout
   */
  async logout(): Promise<void> {
    await this.page.getByRole('button', { name: /sair|logout/i }).click()
    await this.page.waitForURL('/admin/login')
  }

  /**
   * Toggle dark mode
   */
  async toggleDarkMode(): Promise<void> {
    await this.page.getByRole('button', { name: /dark|light|modo/i }).click()
    await this.page.waitForTimeout(500) // Aguardar transição
  }

  /**
   * Verificar se está em dark mode
   */
  async isDarkMode(): Promise<boolean> {
    const html = await this.page.locator('html').getAttribute('class')
    return html?.includes('dark') || false
  }

  /**
   * Abrir modal de edição de produto
   */
  async openEditProductModal(productName: string): Promise<void> {
    // Encontrar produto na lista
    const productRow = this.page.locator('tr, [data-testid="product-item"]').filter({ hasText: productName }).first()
    await productRow.getByRole('button', { name: /editar|edit/i }).click()
    
    // Aguardar modal abrir
    await this.page.waitForSelector('[role="dialog"], .modal, [data-testid="edit-product-modal"]', {
      timeout: 5000,
    })
  }

  /**
   * Fechar modal
   */
  async closeModal(): Promise<void> {
    await this.page.getByRole('button', { name: /fechar|close|cancelar|cancel/i }).click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Salvar formulário
   */
  async saveForm(): Promise<void> {
    await this.clickButton('Salvar')
    await this.waitForSuccessToast()
  }

  /**
   * Upload de arquivo
   */
  async uploadFile(inputSelector: string, filePath: string): Promise<void> {
    const fileInput = this.page.locator(inputSelector)
    await fileInput.setInputFiles(filePath)
    await this.page.waitForTimeout(1000) // Aguardar upload
  }

  /**
   * Selecionar opção em select
   */
  async selectOption(selectLabel: string, optionValue: string): Promise<void> {
    const select = this.page.getByLabel(selectLabel, { exact: false })
    await select.click()
    await this.page.getByRole('option', { name: optionValue }).click()
  }

  /**
   * Aguardar carregamento (loading)
   */
  async waitForLoading(): Promise<void> {
    await this.page.waitForSelector('.loading, [data-testid="loading"], .animate-spin', {
      state: 'hidden',
      timeout: 10000,
    })
  }

  /**
   * Verificar se elemento está visível
   */
  async isVisible(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { timeout: 2000, state: 'visible' })
      return true
    } catch {
      return false
    }
  }

  /**
   * Obter texto de elemento
   */
  async getText(selector: string): Promise<string> {
    const element = this.page.locator(selector)
    return await element.textContent() || ''
  }

  /**
   * Verificar se produto aparece na lista
   */
  async productExistsInList(productName: string): Promise<boolean> {
    const productRow = this.page.locator('tr, [data-testid="product-item"]').filter({ hasText: productName })
    return await productRow.count() > 0
  }

  /**
   * Deletar produto da lista
   */
  async deleteProductFromList(productName: string): Promise<void> {
    const productRow = this.page.locator('tr, [data-testid="product-item"]').filter({ hasText: productName }).first()
    await productRow.getByRole('button', { name: /excluir|delete|remover/i }).click()
    
    // Confirmar deleção
    await this.page.getByRole('button', { name: /confirmar|sim|yes/i }).click()
    await this.waitForSuccessToast()
  }
}

