import { test as base, expect } from '@playwright/test'
import type { Page, APIRequestContext } from '@playwright/test'

/**
 * Credenciais do admin para testes
 */
export const ADMIN_CREDENTIALS = {
  email: 'admin@leiasabores.pt',
  password: 'admin123',
}

/**
 * Fixture para autenticação do admin
 */
type AdminFixtures = {
  adminPage: Page
  adminApi: APIRequestContext
}

export const test = base.extend<AdminFixtures>({
  adminApi: async ({ request }, use) => {
    await use(request)
  },

  adminPage: async ({ page, request }, use) => {
    const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api'
    const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173'

    // Fazer login via API
    const loginResponse = await request.post(`${apiBaseUrl}/v1/admin/auth/login`, {
      headers: {
        'X-Test-Mode': 'true',
        'X-Playwright-Test': 'true',
        'Content-Type': 'application/json',
      },
      data: {
        email: ADMIN_CREDENTIALS.email,
        password: ADMIN_CREDENTIALS.password,
      },
    })

    if (!loginResponse.ok()) {
      throw new Error(`Login failed: ${loginResponse.status()}`)
    }

    const loginData = await loginResponse.json()
    const token = loginData.accessToken || loginData.token

    if (!token) {
      throw new Error('No token received from login')
    }

    // Configurar token no contexto da página
    await page.addInitScript((token) => {
      localStorage.setItem('admin_access_token', token)
      window.dispatchEvent(new Event('storage'))
    }, token)

    // Navegar para o admin
    await page.goto(`${baseURL}/admin`, { waitUntil: 'domcontentloaded' })

    // Aguardar página carregar (máximo 10 segundos)
    const startTime = Date.now()
    while (Date.now() - startTime < 10000) {
      const bodyText = await page.textContent('body').catch(() => '')
      if (bodyText && !bodyText.includes('Carregando...') && bodyText.length > 10) {
        break
      }
      await page.waitForTimeout(500)
    }

    await use(page)

    // Cleanup: logout
    try {
      await request.post(`${apiBaseUrl}/v1/admin/auth/logout`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch {
      // Ignore logout errors
    }
  },
})

export { expect }

