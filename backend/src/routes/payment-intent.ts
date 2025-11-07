/**
 * Sistema profissional de Payment Intents
 * Suporta: Cartão, Apple Pay, Google Pay, MB Way, PayPal, Klarna, Multibanco
 */

import { Hono } from 'hono'
import { eq, inArray } from 'drizzle-orm'
import { getDb, dbSchema } from '../lib/db'
import { getStripe } from '../services/stripe'
import type { WorkerBindings } from '../types/bindings'
import { buildProductResponse, resolveImageBaseUrl } from '../utils/product-images'
import {
  isValidEmail,
  validateCartItems,
  validatePayloadSize,
  isValidQuantity,
  isValidUUID,
  SECURITY_LIMITS,
} from '../utils/validation'
import { validateRequestSize, rateLimit } from '../middleware/security'

const router = new Hono()

// Rate limiting para payment intents
router.use('/*', rateLimit(30, 60000)) // 30 requisições por minuto
router.use('/*', validateRequestSize)

/**
 * Criar Payment Intent com suporte a todos os métodos de pagamento
 */
router.post('/create', async (c) => {
  const env = c.env as unknown as WorkerBindings
  
  // Validar Stripe key (aceita secret keys 'sk_' e restricted keys 'rk_')
  if (!env.STRIPE_SECRET_KEY || (!env.STRIPE_SECRET_KEY.startsWith('sk_') && !env.STRIPE_SECRET_KEY.startsWith('rk_'))) {
    return c.json({ 
      error: 'Erro de configuração no servidor de pagamento',
      debugId: 'missing_stripe_key'
    }, 500)
  }

  const db = getDb({ DB: env.DB })
  const { products } = dbSchema

  let body: {
    items: Array<{ productId: string; quantity: number }>
    shippingAddress: Record<string, unknown>
    email: string
  } | undefined

  try {
    // Validar tamanho do payload
    const rawBody = await c.req.text()
    const payloadValidation = validatePayloadSize(rawBody)
    if (!payloadValidation.valid) {
      return c.json({ 
        error: 'Payload muito grande',
        debugId: 'payload_too_large'
      }, 413)
    }

    body = JSON.parse(rawBody) as {
      items: Array<{ productId: string; quantity: number }>
      shippingAddress: Record<string, unknown>
      email: string
    }

    console.log('💳 Payment Intent request:', {
      itemsCount: body?.items?.length || 0,
      hasEmail: !!body?.email,
    })

    // Validações rigorosas
    const cartValidation = validateCartItems(body?.items || [])
    if (!cartValidation.valid) {
      return c.json({ 
        error: cartValidation.error || 'Carrinho inválido',
        debugId: 'cart_validation_failed'
      }, 400)
    }

    if (!body.email || typeof body.email !== 'string' || !isValidEmail(body.email.trim())) {
      return c.json({ 
        error: 'Email inválido',
        debugId: 'invalid_email'
      }, 400)
    }

    const normalizedEmail = body.email.trim().toLowerCase()

    // Normalizar e validar items
    const normalizedItems = body.items
      .map((item) => {
        const productId = typeof item.productId === 'string' ? item.productId.trim() : ''
        const quantity = typeof item.quantity === 'number' && isValidQuantity(item.quantity)
          ? Math.floor(item.quantity)
          : 1
        
        if (!isValidUUID(productId)) {
          throw new Error(`Invalid product ID: ${productId}`)
        }
        
        return { productId, quantity }
      })
      .filter((item) => item.productId.length > 0)

    if (!normalizedItems.length) {
      return c.json({ 
        error: 'Nenhum produto válido encontrado',
        debugId: 'no_valid_products'
      }, 400)
    }

    // Buscar produtos no banco
    const productIds = normalizedItems.map((item) => item.productId)
    const dbProducts = await db.query.products.findMany({
      where: inArray(products.id, productIds),
    })

    const baseUrl = resolveImageBaseUrl(c.req.url, env)
    const catalog = new Map(dbProducts.map((item) => [item.id, buildProductResponse(item, baseUrl, env)]))
    const missing = normalizedItems.filter((item) => !catalog.has(item.productId))

    if (missing.length) {
      return c.json({ 
        error: `Produtos não disponíveis: ${missing.map((m) => m.productId).join(', ')}`,
        debugId: 'products_not_found',
        missingProducts: missing.map(m => m.productId)
      }, 404)
    }

    // Calcular totais
    const subtotal = normalizedItems.reduce((sum, item) => {
      const product = catalog.get(item.productId)!
      return sum + product.price * item.quantity
    }, 0)

    if (subtotal < 0 || !Number.isFinite(subtotal) || subtotal > SECURITY_LIMITS.MAX_CART_TOTAL) {
      return c.json({ 
        error: 'Total do carrinho inválido',
        debugId: 'invalid_total'
      }, 400)
    }

    const tax = Number((subtotal * 0.23).toFixed(2))
    const shipping = subtotal === 0 ? 0 : subtotal >= 39 ? 0 : 5.99
    const total = Number((subtotal + tax + shipping).toFixed(2))

    if (total <= 0 || !Number.isFinite(total)) {
      return c.json({ error: 'Total inválido' }, 400)
    }

    // Capturar origin
    let origin = c.req.header('origin') || 
                 c.req.header('referer')?.split('/').slice(0, 3).join('/') ||
                 'https://leiasabores.pt'
    
    if (!origin.startsWith('http')) {
      origin = 'https://leiasabores.pt'
    }
    origin = origin.replace(/\/$/, '')

    if (env.ENVIRONMENT === 'production' && !origin.startsWith('https://')) {
      return c.json({ 
        error: 'Apenas conexões HTTPS são permitidas',
        debugId: 'non_https_origin'
      }, 400)
    }

    // Inicializar Stripe
    const stripe = getStripe(env)

    // Criar Payment Intent com todos os métodos de pagamento
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Em centavos
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true, // Habilita automaticamente Apple Pay, Google Pay, etc.
      },
      payment_method_types: [
        'card',
        'link',
      ],
      metadata: {
        userId: normalizedEmail,
        email: normalizedEmail,
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        shipping: shipping.toString(),
        total: total.toString(),
        items: JSON.stringify(normalizedItems),
        shippingAddress: JSON.stringify(body.shippingAddress || {}),
        timestamp: new Date().toISOString(),
      },
      description: `Encomenda Leia Sabores - ${normalizedItems.length} item(s)`,
      receipt_email: normalizedEmail,
      shipping: body.shippingAddress ? {
        name: (body.shippingAddress.name as string) || '',
        phone: (body.shippingAddress.phone as string) || undefined,
        address: {
          line1: (body.shippingAddress.street as string) || '',
          line2: (body.shippingAddress.street2 as string) || undefined,
          city: (body.shippingAddress.city as string) || '',
          postal_code: (body.shippingAddress.zipCode as string) || '',
          country: 'PT',
        },
      } : undefined,
    })

    console.log(`✅ Payment Intent created: ${paymentIntent.id} | Amount: €${total} | Email: ${normalizedEmail}`)

    return c.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: total,
      currency: 'eur',
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Payment Intent creation error:', errorMessage)
    
    return c.json({
      error: 'Não foi possível criar a sessão de pagamento',
      debugId: crypto.randomUUID().substring(0, 8),
      message: env.ENVIRONMENT === 'development' ? errorMessage : undefined,
    }, 500)
  }
})

/**
 * Confirmar Payment Intent após pagamento
 */
router.post('/confirm', async (c) => {
  const env = c.env as unknown as WorkerBindings
  const stripe = getStripe(env)
  const db = getDb({ DB: env.DB })
  const { orders } = dbSchema

  try {
    const body = await c.req.json<{
      paymentIntentId: string
    }>()

    if (!body.paymentIntentId || typeof body.paymentIntentId !== 'string') {
      return c.json({ error: 'Payment Intent ID é obrigatório' }, 400)
    }

    // Recuperar Payment Intent do Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(body.paymentIntentId, {
      expand: ['payment_method', 'customer'],
    })

    if (!paymentIntent) {
      return c.json({ error: 'Payment Intent não encontrado' }, 404)
    }

    // Verificar se já existe ordem
    const existing = await db.query.orders.findFirst({
      where: eq(orders.stripeSessionId, paymentIntent.id),
    })

    if (existing) {
      return c.json({
        success: true,
        orderId: existing.id,
        status: existing.status,
        message: 'Ordem já processada',
      })
    }

    // Criar ordem se o pagamento foi bem-sucedido
    if (paymentIntent.status === 'succeeded') {
      const metadata = paymentIntent.metadata || {}
      const orderId = crypto.randomUUID()

      const parseAmount = (value: string | null | undefined, fallbackCents?: number | null) => {
        if (value !== undefined && value !== null) {
          const parsed = Number(value)
          return Number.isNaN(parsed) ? 0 : parsed
        }
        if (fallbackCents === undefined || fallbackCents === null) {
          return 0
        }
        return Math.round((fallbackCents / 100) * 100) / 100
      }

      const totals = {
        subtotal: parseAmount(metadata.subtotal, paymentIntent.amount - (paymentIntent.amount * 0.23 / 1.23)),
        tax: parseAmount(metadata.tax, paymentIntent.amount * 0.23 / 1.23),
        shipping: parseAmount(metadata.shipping, 0),
        total: parseAmount(metadata.total, paymentIntent.amount),
      }

      let shippingAddress: Record<string, unknown> | null = null
      if (metadata.shippingAddress) {
        try {
          shippingAddress = JSON.parse(metadata.shippingAddress as string) as Record<string, unknown>
        } catch {
          // Ignorar erro
        }
      }

      await db.insert(orders).values({
        id: orderId,
        userId: (metadata.userId as string) || paymentIntent.receipt_email || 'guest',
        stripeSessionId: paymentIntent.id,
        email: paymentIntent.receipt_email || (metadata.email as string) || '',
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        total: totals.total,
        status: 'paid',
        shippingAddress,
        billingAddress: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      console.log(`📦 Order created from Payment Intent: ${orderId} | Payment: ${paymentIntent.id}`)

      return c.json({
        success: true,
        orderId,
        status: 'paid',
        paymentIntentId: paymentIntent.id,
      })
    }

    return c.json({
      success: false,
      status: paymentIntent.status,
      message: `Payment Intent status: ${paymentIntent.status}`,
    })
  } catch (error) {
    console.error('❌ Payment Intent confirmation error:', error)
    return c.json({
      error: 'Erro ao confirmar pagamento',
      debugId: crypto.randomUUID().substring(0, 8),
    }, 500)
  }
})

export default router

