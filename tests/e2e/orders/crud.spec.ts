import { test, expect } from '../fixtures/admin-auth'
import { AdminAPIHelper } from '../helpers/api-helpers'
import { AdminPageHelper } from '../helpers/page-helpers'

test.describe('Pedidos', () => {
  test('deve listar pedidos', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(adminApi, process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api', adminToken)
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToOrders()
    await pageHelper.waitForLoading()

    const orders = await apiHelper.listOrders()
    expect(orders).toBeDefined()
    expect(orders.orders).toBeDefined()
  })

  test('deve atualizar status do pedido', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(adminApi, process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api', adminToken)
    const orders = await apiHelper.listOrders()

    if (orders.orders?.length > 0) {
      const order = orders.orders[0]
      await apiHelper.updateOrderStatus(order.id, 'paid')
      
      const updated = await apiHelper.getOrder?.(order.id)
      expect(updated?.status).toBe('paid')
    }
  })
})

