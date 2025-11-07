import { Hono } from 'hono'
import type { WorkerBindings } from '../types/bindings'
import { seedPartyland } from '../seeds/partyland-categories'

const router = new Hono<{ Bindings: WorkerBindings }>()

// Endpoint para popular com produtos do Partyland
router.post('/seed-partyland', async (c) => {
  const token = c.req.query('token')
  const expected = (c.env as WorkerBindings).ADMIN_SEED_TOKEN
  
  if (!expected || token !== expected) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const result = await seedPartyland(c.env as WorkerBindings)
    return c.json({
      success: true,
      message: 'Produtos Partyland adicionados com sucesso!',
      data: result
    })
  } catch (error) {
    console.error('Erro ao fazer seed Partyland:', error)
    return c.json({ 
      error: 'Falha ao popular produtos',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500)
  }
})

export default router
