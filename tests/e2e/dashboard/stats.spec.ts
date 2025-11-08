import { test, expect } from '../fixtures/admin-auth'
import { AdminAPIHelper } from '../helpers/api-helpers'
import { AdminPageHelper } from '../helpers/page-helpers'

test.describe('Dashboard', () => {
  test('deve carregar estatísticas', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(adminApi, process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api', adminToken)
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToDashboard()
    await pageHelper.waitForLoading()

    const stats = await apiHelper.getDashboardStats()
    expect(stats).toBeDefined()
    expect(stats.sales).toBeDefined()
    expect(stats.products).toBeDefined()
    expect(stats.orders).toBeDefined()
  })

  test('deve exibir gráficos sem erros', async ({ adminPage }) => {
    const pageHelper = new AdminPageHelper(adminPage)
    await pageHelper.goToDashboard()
    await pageHelper.waitForLoading()

    // Verificar se não há erros no console
    const errors: string[] = []
    adminPage.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await adminPage.waitForTimeout(3000)
    expect(errors.length).toBe(0)
  })
})

