import { Hono } from 'hono'
import { eq, inArray } from 'drizzle-orm'
import { getDb, dbSchema } from '../lib/db'
import { getStripe } from '../services/stripe'
import type StripeType from 'stripe'
import type { WorkerBindings } from '../types/bindings'
import { buildProductResponse, resolveImageBaseUrl } from '../utils/product-images'

// Instância sem genéricos explícitos para evitar incompatibilidades de tipos do Env
const router = new Hono()

const HTTP_URL_PATTERN = /^https?:\/\//i

router.post('/', async (c) => {
  // Obter bindings do runtime Cloudflare de forma tipada
  const env = c.env as unknown as WorkerBindings
  const db = getDb({ DB: env.DB })
  const { products } = dbSchema

  let body: {
    items: Array<{ productId: string; quantity: number }>
    shippingAddress: Record<string, unknown>
    billingAddress: Record<string, unknown>
    email: string
  } | undefined

  let session: StripeType.Checkout.Session | undefined

  try {
    body = await c.req.json<{
      items: Array<{ productId: string; quantity: number }>
      shippingAddress: Record<string, unknown>
      billingAddress: Record<string, unknown>
      email: string
    }>()

    if (!body?.items?.length) {
      return c.json({ error: 'Cart is empty' }, 400)
    }

    if (!body.email) {
      return c.json({ error: 'Email is required' }, 400)
    }

    const normalizedItems = body.items
      .map((item) => ({
        productId: item.productId?.trim(),
        quantity: Number.isFinite(item.quantity) ? Math.max(1, Math.min(99, Math.floor(item.quantity))) : 1,
      }))
      .filter((item) => Boolean(item.productId)) as Array<{ productId: string; quantity: number }>

    if (!normalizedItems.length) {
      return c.json({ error: 'No valid products provided' }, 400)
    }

    const productIds = normalizedItems.map((item) => item.productId)
    const dbProducts = await db.query.products.findMany({
      where: inArray(products.id, productIds),
    })

    const baseUrl = resolveImageBaseUrl(c.req.url, env)
    const catalog = new Map(dbProducts.map((item) => [item.id, buildProductResponse(item, baseUrl, env)]))
    const missing = normalizedItems.filter((item) => !catalog.has(item.productId))

    if (missing.length) {
      return c.json({ error: `Products not available: ${missing.map((m) => m.productId).join(', ')}` }, 404)
    }

    const buildImagesForStripe = (product: ReturnType<typeof buildProductResponse>) => {
      const images: string[] = []
      for (const url of product.images ?? []) {
        if (HTTP_URL_PATTERN.test(url)) {
          images.push(url)
        }
        if (images.length >= 4) break
      }

      if (images.length === 0 && product.imageUrl && HTTP_URL_PATTERN.test(product.imageUrl)) {
        images.push(product.imageUrl)
      }

      return images.slice(0, 4)
    }

    const lineItems = normalizedItems.map((item) => {
      const product = catalog.get(item.productId)!
      const quantity = item.quantity
      const unitPrice = product.price
      
      // Validação: preço não pode ser negativo ou zero
      if (unitPrice <= 0) {
        throw new Error(`Invalid price for product ${product.id}`)
      }
      
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: product.name,
            description: product.shortDescription || product.description,
            images: buildImagesForStripe(product),
          },
          unit_amount: Math.round(unitPrice * 100),
        },
        quantity,
      }
    })

    const subtotal = normalizedItems.reduce((sum, item) => {
      const product = catalog.get(item.productId)!
      return sum + product.price * item.quantity
    }, 0)

    // Validações de segurança
    if (subtotal < 0) {
      return c.json({ error: 'Invalid cart total' }, 400)
    }

    if (subtotal > 100000) { // Limite de 100k€ por transação
      return c.json({ error: 'Cart total exceeds maximum allowed' }, 400)
    }

    const tax = Number((subtotal * 0.23).toFixed(2))
    const shipping = subtotal === 0 ? 0 : subtotal >= 39 ? 0 : 5.99
    const total = Number((subtotal + tax + shipping).toFixed(2))

    // Validação final do total
    if (total <= 0 || !Number.isFinite(total)) {
      return c.json({ error: 'Invalid order total calculation' }, 400)
    }

    const origin = c.req.header('origin') || 'http://localhost:5173'
    const stripe = getStripe(env)

    let shippingAddressJson = '{}'
    let billingAddressJson = '{}'
    try {
      shippingAddressJson = JSON.stringify(body.shippingAddress ?? {})
    } catch (error) {
      console.warn('Failed to serialize shipping address metadata', error)
    }
    try {
      billingAddressJson = JSON.stringify(body.billingAddress ?? {})
    } catch (error) {
      console.warn('Failed to serialize billing address metadata', error)
    }

    // Múltiplos métodos de pagamento para Portugal/Europa
    const paymentMethods = [
      'card',      // Cartão de crédito/débito
      'ideal',     // iDEAL (Holanda)
      'bancontact', // Bancontact (Bélgica)
      'eps',       // EPS (Áustria)
      'giropay',   // giropay (Alemanha)
      'p24',       // Przelewy24 (Polónia)
      'klarna',    // Klarna (Suécia/Finlândia)
      'paypal',    // PayPal
    ]

    console.log('Creating Stripe session with:', {
      lineItemsCount: lineItems.length,
      total,
      email: body.email,
      paymentMethodsCount: paymentMethods.length,
    })

    // @ts-expect-error - Stripe types are overly restrictive, but these payment methods are valid
    session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethods,
      mode: 'payment',
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      phone_number_collection: {
        enabled: true,
      },
      shipping_address_collection: {
        allowed_countries: ['PT', 'ES', 'BE', 'NL', 'DE', 'AT', 'PL', 'FR', 'IT', 'SE', 'FI', 'DK', 'NO'],
      },
      line_items: lineItems,
      customer_email: body.email,
      success_url: `${origin}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/carrinho`,
      metadata: {
        userId: body.email,
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        shipping: shipping.toString(),
        total: total.toString(),
        shippingAddress: shippingAddressJson,
        billingAddress: billingAddressJson,
        items: JSON.stringify(normalizedItems),
        timestamp: new Date().toISOString(),
      },
      // Configurações de segurança e conformidade
      locale: 'pt',
      consent_collection: {
        promotions: 'auto',
        terms_of_service: 'auto',
      },
    } as StripeType.Checkout.SessionCreateParams)

    console.log(`✅ Checkout session created: ${session.id} | Total: €${total} | Email: ${body.email}`)
    
    return c.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorType = error instanceof Error ? error.constructor.name : 'UnknownError'
    const stripeErrorCode = error instanceof Error && 'code' in error ? (error as any).code : undefined
    const stripeStatusCode = error instanceof Error && 'status' in error ? (error as any).status : undefined
    const fullError = error instanceof Error ? error : new Error(String(error))
    
    console.error(`❌ Stripe checkout error [${errorType}]: ${errorMessage}`)
    console.error('Error details:', {
      stripeErrorCode,
      stripeStatusCode,
      message: errorMessage,
      email: body?.email,
      itemsCount: body?.items?.length,
      lineItemsCount: (error as any)?.lineItems?.length,
      fullStack: fullError.stack,
      timestamp: new Date().toISOString(),
    })
    
    // Log o objeto de erro completo para melhor debugging
    if (error instanceof Error && Object.keys(error).length > 0) {
      console.error('Additional error properties:', Object.entries(error).reduce((acc, [key, value]) => {
        acc[key] = String(value).substring(0, 100)
        return acc
      }, {} as Record<string, string>))
    }
    
    // Mensagens de erro personalizadas
    let userMessage = 'Não foi possível processar o pagamento'
    if (errorMessage.includes('api_key') || errorMessage.includes('STRIPE_SECRET_KEY')) {
      userMessage = 'Erro de configuração no servidor de pagamento'
    } else if (errorMessage.includes('network')) {
      userMessage = 'Erro de conectividade. Tente novamente em alguns momentos'
    } else if (errorMessage.includes('invalid_request')) {
      userMessage = 'Dados de pagamento inválidos'
    } else if (stripeErrorCode === 'ERR_NETWORK') {
      userMessage = 'Erro de conectividade com servidor de pagamento'
    }
    
    return c.json(
      { 
        error: userMessage, 
        debugId: session?.id || 'unknown',
        stripeError: stripeErrorCode || undefined,
        message: errorMessage,
        type: errorType
      },
      500,
    )
  } finally {
    // Cleanup if needed
  }
})

router.post('/webhook', async (c) => {
  const signature = c.req.header('stripe-signature')
  const rawBody = await c.req.text()

  if (!signature) {
    return c.json({ error: 'Missing signature header' }, 400)
  }

  try {
    const env = c.env as unknown as WorkerBindings
    const stripe = getStripe(env)
    if (!env.STRIPE_WEBHOOK_SECRET) {
      console.error('Missing STRIPE_WEBHOOK_SECRET binding')
      return c.json({ error: 'Webhook misconfigured' }, 500)
    }
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )
    const db = getDb({ DB: env.DB })
    const { orders, cartItems } = dbSchema

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as StripeType.Checkout.Session
        const metadata = session.metadata || {}
        
        console.log(`💳 Payment completed: ${session.id} | Amount: €${(session.amount_total || 0) / 100} | Customer: ${session.customer_email}`)
        
        const existing = await db.query.orders.findFirst({
          where: eq(orders.stripeSessionId, session.id),
        })

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
          subtotal: parseAmount(metadata.subtotal, session.amount_subtotal),
          tax: parseAmount(metadata.tax, session.total_details?.amount_tax ?? 0),
          shipping: parseAmount(metadata.shipping, session.total_details?.amount_shipping ?? 0),
          total: parseAmount(metadata.total, session.amount_total),
        }

        const shippingAddress = metadata.shippingAddress ? JSON.parse(metadata.shippingAddress) : session.shipping_details
        const billingAddress = metadata.billingAddress ? JSON.parse(metadata.billingAddress) : session.customer_details

        if (!existing) {
          const orderId = crypto.randomUUID()
          await db.insert(orders).values({
            id: orderId,
            userId: metadata.userId || session.customer_email || 'guest',
            stripeSessionId: session.id,
            email: session.customer_email || '',
            subtotal: totals.subtotal,
            tax: totals.tax,
            shipping: totals.shipping,
            total: totals.total,
            status: 'paid',
            shippingAddress,
            billingAddress,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          console.log(`📦 Order created: ${orderId} | Session: ${session.id}`)
        } else {
          await db
            .update(orders)
            .set({
              status: 'paid',
              updatedAt: new Date().toISOString(),
            })
            .where(eq(orders.id, existing.id))
          console.log(`📦 Order updated: ${existing.id} | Status: paid`)
        }

        if (session.customer_email) {
          await db.delete(cartItems).where(eq(cartItems.userId, session.customer_email))
          console.log(`🗑️ Cart cleared: ${session.customer_email}`)
        }

        return c.json({ received: true })
      }

      case 'checkout.session.expired': {
        const session = event.data.object as StripeType.Checkout.Session
        console.warn(`⏱️ Checkout session expired: ${session.id} | Customer: ${session.customer_email}`)
        
        await db
          .update(orders)
          .set({ status: 'cancelled', updatedAt: new Date().toISOString() })
          .where(eq(dbSchema.orders.stripeSessionId, session.id))

        return c.json({ received: true })
      }

      default:
        console.debug(`📬 Unhandled webhook event: ${event.type}`)
        return c.json({ received: true })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Webhook processing error: ${errorMessage}`, {
      signature: signature?.substring(0, 10) + '...',
      timestamp: new Date().toISOString(),
    })
    return c.json({ error: 'Webhook processing failed' }, 400)
  }
})

router.get('/session/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId')
  const env = c.env as unknown as WorkerBindings
  const db = getDb({ DB: env.DB })
  const { orders } = dbSchema

  try {
    const stripe = getStripe(env)
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    })

    const order = await db.query.orders.findFirst({
      where: eq(orders.stripeSessionId, sessionId),
    })

    return c.json({
      session,
      order,
    })
  } catch (error) {
    console.error('Failed to retrieve checkout session', error)
    return c.json({ error: 'Failed to fetch session details' }, 500)
  }
})

export default router
