import { test as base, expect } from '@playwright/test'
import type { Page, APIRequestContext } from '@playwright/test'

/**
 * Credenciais de teste do admin
 */
export const TEST_ADMIN_CREDENTIALS = {
  email: 'admin@leiasabores.pt',
  password: 'admin123',
}

/**
 * Fixture para autenticação do admin
 */
type AdminAuthFixtures = {
  adminPage: Page
  adminApi: APIRequestContext
  adminToken: string
  adminUser: {
    id: string
    email: string
    role: string
    permissions: string[]
  }
}

export const test = base.extend<AdminAuthFixtures>({
  // Contexto de API para chamadas diretas
  adminApi: async ({ request }, use) => {
    const apiContext = request
    await use(apiContext)
  },

  // Token de autenticação
  adminToken: async ({ adminApi }, use) => {
    const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api'
    
    // Fazer login para obter token
    const loginResponse = await adminApi.post(`${apiBaseUrl}/v1/admin/auth/login`, {
      data: {
        email: TEST_ADMIN_CREDENTIALS.email,
        password: TEST_ADMIN_CREDENTIALS.password,
      },
    })

    expect(loginResponse.ok()).toBeTruthy()
    const loginData = await loginResponse.json()
    const token = loginData.accessToken || loginData.token

    expect(token).toBeTruthy()
    await use(token)

    // Cleanup: logout após o teste
    try {
      await adminApi.post(`${apiBaseUrl}/v1/admin/auth/logout`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          refreshToken: loginData.refreshToken,
        },
      })
    } catch (error) {
      // Ignore logout errors in cleanup
    }
  },

  // Dados do usuário admin
  adminUser: async ({ adminApi, adminToken }, use) => {
    const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api'
    
    const meResponse = await adminApi.get(`${apiBaseUrl}/v1/admin/auth/me`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    })

    expect(meResponse.ok()).toBeTruthy()
    const userData = await meResponse.json()
    
    await use({
      id: userData.id,
      email: userData.email,
      role: userData.role,
      permissions: userData.permissions || [],
    })
  },

  // Page autenticada do admin
  adminPage: async ({ page, adminToken }, use) => {
    const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173'
    
    // Fazer login via API e armazenar token
    const apiBaseUrl = process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api'
    const loginResponse = await page.request.post(`${apiBaseUrl}/v1/admin/auth/login`, {
      data: {
        email: TEST_ADMIN_CREDENTIALS.email,
        password: TEST_ADMIN_CREDENTIALS.password,
      },
    })

    expect(loginResponse.ok()).toBeTruthy()
    const loginData = await loginResponse.json()
    const token = loginData.accessToken || loginData.token || adminToken

    // Armazenar token no localStorage
    await page.addInitScript((token) => {
      localStorage.setItem('admin_access_token', token)
      if (typeof window !== 'undefined') {
        // Dispatch event para atualizar estado
        window.dispatchEvent(new Event('storage'))
      }
    }, token)

    // Navegar para o admin
    await page.goto(`${baseURL}/admin`)
    
    // Aguardar carregamento do admin
    await page.waitForSelector('[data-testid="admin-dashboard"], .admin-dashboard, h1, [role="main"]', {
      timeout: 10000,
    })

    await use(page)
  },
})

export { expect }

