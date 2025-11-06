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

  try {
    const body = await c.req.json<{
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
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: product.name,
            description: product.shortDescription || product.description,
            images: buildImagesForStripe(product),
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity,
      }
    })

    const subtotal = normalizedItems.reduce((sum, item) => {
      const product = catalog.get(item.productId)!
      return sum + product.price * item.quantity
    }, 0)

    const tax = Number((subtotal * 0.23).toFixed(2))
    const shipping = subtotal === 0 ? 0 : subtotal >= 39 ? 0 : 5.99
    const total = Number((subtotal + tax + shipping).toFixed(2))

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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      shipping_address_collection: {
        allowed_countries: ['PT', 'ES'],
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
      },
    })

    return c.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('Stripe checkout error', error)
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      500,
    )
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
          await db.insert(orders).values({
            id: crypto.randomUUID(),
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
        } else {
          await db
            .update(orders)
            .set({
              status: 'paid',
              updatedAt: new Date().toISOString(),
            })
            .where(eq(orders.id, existing.id))
        }

        if (session.customer_email) {
          await db.delete(cartItems).where(eq(cartItems.userId, session.customer_email))
        }

        return c.json({ received: true })
      }

      case 'checkout.session.expired': {
        const session = event.data.object as StripeType.Checkout.Session
        await db
          .update(orders)
          .set({ status: 'cancelled', updatedAt: new Date().toISOString() })
          .where(eq(dbSchema.orders.stripeSessionId, session.id))

        return c.json({ received: true })
      }

      default:
        return c.json({ received: true })
    }
  } catch (error) {
    console.error('Stripe webhook error', error)
    return c.json({ error: 'Webhook error' }, 400)
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
