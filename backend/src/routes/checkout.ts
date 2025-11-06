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
  
  // Validar Stripe key ANTES de qualquer processamento
  if (!env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY is missing from environment')
    return c.json(
      { 
        error: 'Erro de configuração no servidor de pagamento',
        debugId: 'missing_stripe_key',
        message: 'Stripe secret key not configured'
      },
      500,
    )
  }

  // Validar formato básico da chave Stripe
  if (!env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    console.error('❌ STRIPE_SECRET_KEY has invalid format:', env.STRIPE_SECRET_KEY.substring(0, 10) + '...')
    return c.json(
      { 
        error: 'Erro de configuração no servidor de pagamento',
        debugId: 'invalid_stripe_key_format',
        message: 'Stripe secret key format is invalid'
      },
      500,
    )
  }

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

    console.log('📦 Checkout request received:', {
      itemsCount: body?.items?.length || 0,
      hasEmail: !!body?.email,
      emailPreview: body?.email ? `${body.email.substring(0, 10)}...` : 'MISSING',
      hasShippingAddress: !!body?.shippingAddress,
      hasBillingAddress: !!body?.billingAddress,
    })

    if (!body?.items?.length) {
      console.error('❌ Validation failed: Cart is empty')
      return c.json({ 
        error: 'Carrinho vazio. Adicione produtos antes de pagar',
        debugId: 'empty_cart'
      }, 400)
    }

    if (!body.email) {
      console.error('❌ Validation failed: Email is missing')
      return c.json({ 
        error: 'Email é obrigatório',
        debugId: 'missing_email'
      }, 400)
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const trimmedEmail = body.email.trim()
    if (!emailRegex.test(trimmedEmail)) {
      console.error('❌ Validation failed: Invalid email format', { email: trimmedEmail })
      return c.json({ 
        error: 'Formato de email inválido. Use um email válido (ex: seu.email@dominio.com)',
        debugId: 'invalid_email_format'
      }, 400)
    }

    // Normalizar email (trim e lowercase)
    body.email = trimmedEmail.toLowerCase()

    const normalizedItems = body.items
      .map((item) => ({
        productId: item.productId?.trim(),
        quantity: Number.isFinite(item.quantity) ? Math.max(1, Math.min(99, Math.floor(item.quantity))) : 1,
      }))
      .filter((item) => Boolean(item.productId)) as Array<{ productId: string; quantity: number }>

    if (!normalizedItems.length) {
      console.error('❌ Validation failed: No valid products after normalization', {
        originalItems: body.items,
        normalizedItems,
      })
      return c.json({ 
        error: 'Nenhum produto válido encontrado. Verifique os produtos no carrinho',
        debugId: 'no_valid_products'
      }, 400)
    }

    console.log('✅ Basic validations passed:', {
      email: body.email,
      itemsCount: normalizedItems.length,
      productIds: normalizedItems.map(i => i.productId),
    })

    const productIds = normalizedItems.map((item) => item.productId)
    console.log('🔍 Looking up products in database:', { productIds })
    
    const dbProducts = await db.query.products.findMany({
      where: inArray(products.id, productIds),
    })

    console.log('📦 Products found in database:', {
      requested: productIds.length,
      found: dbProducts.length,
      foundIds: dbProducts.map(p => p.id),
    })

    const baseUrl = resolveImageBaseUrl(c.req.url, env)
    const catalog = new Map(dbProducts.map((item) => [item.id, buildProductResponse(item, baseUrl, env)]))
    const missing = normalizedItems.filter((item) => !catalog.has(item.productId))

    if (missing.length) {
      console.error('❌ Products not found in database:', { missing: missing.map(m => m.productId) })
      return c.json({ 
        error: `Produtos não disponíveis: ${missing.map((m) => m.productId).join(', ')}. Por favor, atualize o carrinho.`,
        debugId: 'products_not_found',
        missingProducts: missing.map(m => m.productId)
      }, 404)
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
      
      // Validar e truncar nome do produto (máximo 500 caracteres para Stripe)
      const productName = (product.name || 'Produto sem nome').substring(0, 500)
      
      // Validar e truncar descrição (máximo 500 caracteres para Stripe)
      const productDescription = (product.shortDescription || product.description || '')
        .substring(0, 500)
      
      // Validar que unit_amount está dentro dos limites do Stripe (mínimo 1 cent, máximo 99999999)
      const unitAmountCents = Math.round(unitPrice * 100)
      if (unitAmountCents < 1) {
        throw new Error(`Price too low for product ${product.id}: ${unitPrice}`)
      }
      if (unitAmountCents > 99999999) {
        throw new Error(`Price too high for product ${product.id}: ${unitPrice}`)
      }
      
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: productName,
            description: productDescription || undefined,
            images: buildImagesForStripe(product),
          },
          unit_amount: unitAmountCents,
        },
        quantity: Math.max(1, Math.min(99, quantity)), // Garantir quantidade entre 1 e 99
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

    // Capturar origin de múltiplas fontes para garantir compatibilidade
    let origin = c.req.header('origin')
    
    if (!origin) {
      const referer = c.req.header('referer')
      if (referer) {
        try {
          const refererUrl = new URL(referer)
          origin = `${refererUrl.protocol}//${refererUrl.host}`
        } catch {
          // Ignorar erro
        }
      }
    }
    
    if (!origin) {
      const host = c.req.header('host')
      if (host) {
        origin = `https://${host}`
      }
    }
    
    // Fallback para produção
    if (!origin || !origin.startsWith('http')) {
      origin = 'https://leiasabores.pt'
    }
    
    // Remover trailing slash se existir
    origin = origin.replace(/\/$/, '')
    
    // Validar que origin é uma URL válida
    try {
      new URL(origin)
    } catch {
      console.warn('Invalid origin detected, using default:', origin)
      origin = 'https://leiasabores.pt'
    }
    
    console.log('Using origin for checkout URLs:', origin)
    
    // Inicializar Stripe com validação
    let stripe: ReturnType<typeof getStripe>
    try {
      stripe = getStripe(env)
    } catch (stripeInitError) {
      const errorMessage = stripeInitError instanceof Error ? stripeInitError.message : 'Unknown error'
      console.error('❌ Failed to initialize Stripe:', errorMessage)
      return c.json(
        { 
          error: 'Erro de configuração no servidor de pagamento',
          debugId: 'stripe_init_failed',
          message: errorMessage
        },
        500,
      )
    }

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

    // Métodos de pagamento suportados para Portugal/Europa
    // Nota: Alguns métodos requerem configuração adicional na conta Stripe
    // Começamos com métodos básicos que funcionam universalmente
    const paymentMethods: StripeType.Checkout.SessionCreateParams.PaymentMethodType[] = [
      'card',      // Cartão de crédito/débito - sempre disponível
    ]

    // Adicionar métodos regionais apenas se a conta Stripe os suportar
    // Estes métodos podem falhar se não estiverem habilitados na conta
    const optionalPaymentMethods: StripeType.Checkout.SessionCreateParams.PaymentMethodType[] = [
      'ideal',     // iDEAL (Holanda)
      'bancontact', // Bancontact (Bélgica)
      'eps',       // EPS (Áustria)
      'giropay',   // giropay (Alemanha)
      'p24',       // Przelewy24 (Polónia)
    ]

    // Adicionar métodos opcionais (se falharem, o Stripe ignora silenciosamente)
    // Nota: PayPal e Klarna podem requerer configuração adicional
    // paymentMethods.push(...optionalPaymentMethods)

    console.log('Creating Stripe session with:', {
      lineItemsCount: lineItems.length,
      total,
      email: body.email,
      paymentMethods: paymentMethods,
      paymentMethodsCount: paymentMethods.length,
      origin,
      stripeKeyPreview: env.STRIPE_SECRET_KEY ? `${env.STRIPE_SECRET_KEY.substring(0, 10)}...` : 'MISSING',
    })

    // Validar line items antes de criar sessão
    if (!lineItems || lineItems.length === 0) {
      console.error('❌ No line items to process')
      return c.json({ error: 'No valid items to process' }, 400)
    }

    // Validar URLs de sucesso/cancelamento
    if (!origin || !origin.startsWith('http')) {
      console.error('❌ Invalid origin:', origin)
      return c.json({ error: 'Invalid origin URL' }, 400)
    }

    try {
      // Validar que todos os line items têm dados válidos
      const validatedLineItems = lineItems.map((item, index) => {
        if (!item.price_data || !item.price_data.unit_amount || item.price_data.unit_amount <= 0) {
          console.error(`❌ Invalid line item ${index}: unit_amount is invalid`, {
            unit_amount: item.price_data?.unit_amount,
            item,
          })
          throw new Error(`Item ${index + 1}: Preço inválido (${item.price_data?.unit_amount || 'undefined'})`)
        }
        if (!item.price_data.currency || item.price_data.currency !== 'eur') {
          console.error(`❌ Invalid line item ${index}: currency is invalid`, {
            currency: item.price_data?.currency,
            item,
          })
          throw new Error(`Item ${index + 1}: Moeda inválida (deve ser 'eur')`)
        }
        if (!item.quantity || item.quantity <= 0) {
          console.error(`❌ Invalid line item ${index}: quantity is invalid`, {
            quantity: item.quantity,
            item,
          })
          throw new Error(`Item ${index + 1}: Quantidade inválida (${item.quantity || 'undefined'})`)
        }
        return item
      })
      
      console.log('✅ Line items validated:', {
        count: validatedLineItems.length,
        totalAmount: validatedLineItems.reduce((sum, item) => sum + (item.price_data.unit_amount * item.quantity), 0) / 100,
      })

      // Criar sessão Stripe com validação completa
      const sessionParams: StripeType.Checkout.SessionCreateParams = {
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
        line_items: validatedLineItems,
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
        locale: 'pt',
        consent_collection: {
          promotions: 'auto',
          terms_of_service: 'auto',
        },
      }

      console.log('Stripe session params:', {
        payment_method_types: sessionParams.payment_method_types,
        line_items_count: sessionParams.line_items?.length,
        mode: sessionParams.mode,
        customer_email: sessionParams.customer_email,
      })

      session = await stripe.checkout.sessions.create(sessionParams)

      if (!session || !session.id) {
        console.error('❌ Stripe session created but missing ID')
        return c.json({ error: 'Failed to create checkout session' }, 500)
      }

      if (!session.url) {
        console.error('❌ Stripe session created but missing URL:', session.id)
        return c.json({ error: 'Failed to get checkout URL' }, 500)
      }

      console.log(`✅ Checkout session created: ${session.id} | Total: €${total} | Email: ${body.email}`)
      
      return c.json({
        checkoutUrl: session.url,
        sessionId: session.id,
      })
    } catch (stripeError: unknown) {
      // Capturar e logar detalhes completos do erro Stripe
      const stripeErrorMessage = stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error'
      const stripeErrorType = stripeError instanceof Error ? stripeError.constructor.name : 'UnknownError'
      const stripeErrorObj = stripeError as any
      
      console.error('❌ Stripe API error during session creation:', {
        errorType: stripeErrorType,
        message: stripeErrorMessage,
        code: stripeErrorObj?.code,
        statusCode: stripeErrorObj?.statusCode,
        stripeType: stripeErrorObj?.type,
        decline_code: stripeErrorObj?.decline_code,
        param: stripeErrorObj?.param,
        email: body.email,
        lineItemsCount: lineItems.length,
        total,
        rawError: JSON.stringify(stripeErrorObj, Object.getOwnPropertyNames(stripeErrorObj)).substring(0, 500),
      })
      
      // Se for erro de método de pagamento inválido, tentar apenas com 'card'
      if (
        stripeErrorObj?.code === 'parameter_invalid_integer' ||
        stripeErrorObj?.code === 'parameter_invalid_string' ||
        stripeErrorObj?.param === 'payment_method_types' ||
        stripeErrorMessage.includes('payment_method')
      ) {
        console.warn('⚠️ Payment method error detected, retrying with card only...')
        try {
          session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            billing_address_collection: 'auto',
            allow_promotion_codes: true,
            phone_number_collection: { enabled: true },
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
            locale: 'pt',
            consent_collection: {
              promotions: 'auto',
              terms_of_service: 'auto',
            },
          })
          console.log('✅ Retry with card only succeeded:', session.id)
        } catch (retryError) {
          console.error('❌ Retry with card only also failed:', retryError)
          throw stripeError // Re-throw erro original
        }
      } else {
        throw stripeError // Re-throw para tratamento no catch externo
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorType = error instanceof Error ? error.constructor.name : 'UnknownError'
    const stripeErrorCode = error instanceof Error && 'code' in error ? (error as any).code : undefined
    const stripeStatusCode = error instanceof Error && 'status' in error ? (error as any).status : undefined
    const stripeType = (error as any)?.type
    const fullError = error instanceof Error ? error : new Error(String(error))
    
    console.error(`❌ Checkout error [${errorType}]: ${errorMessage}`)
    console.error('Error details:', {
      errorType,
      stripeErrorCode,
      stripeType,
      stripeStatusCode,
      message: errorMessage,
      email: body?.email,
      itemsCount: body?.items?.length,
      hasBody: !!body,
      fullStack: fullError.stack,
      timestamp: new Date().toISOString(),
    })
    
    // Log o objeto de erro completo para melhor debugging
    if (error instanceof Error && Object.keys(error).length > 0) {
      console.error('Additional error properties:', Object.entries(error).reduce((acc, [key, value]) => {
        try {
          acc[key] = String(value).substring(0, 200)
        } catch {
          acc[key] = '[unserializable]'
        }
        return acc
      }, {} as Record<string, string>))
    }
    
    // Mensagens de erro personalizadas baseadas no tipo de erro
    let userMessage = 'Não foi possível processar o pagamento'
    let httpStatus = 500
    
    if (errorMessage.includes('api_key') || errorMessage.includes('STRIPE_SECRET_KEY') || errorMessage.includes('Missing STRIPE_SECRET_KEY')) {
      userMessage = 'Erro de configuração no servidor de pagamento'
      httpStatus = 500
    } else if (errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ETIMEDOUT')) {
      userMessage = 'Erro de conectividade. Tente novamente em alguns momentos'
      httpStatus = 503
    } else if (errorMessage.includes('invalid_request') || stripeErrorCode === 'parameter_invalid_empty' || stripeErrorCode === 'parameter_invalid_integer') {
      userMessage = 'Dados de pagamento inválidos. Verifique os dados e tente novamente'
      httpStatus = 400
    } else if (stripeErrorCode === 'ERR_NETWORK' || stripeStatusCode === 0) {
      userMessage = 'Erro de conectividade com servidor de pagamento'
      httpStatus = 503
    } else if (stripeType === 'StripeAuthenticationError' || stripeErrorCode === 'api_key_expired' || stripeErrorCode === 'invalid_api_key') {
      userMessage = 'Erro de configuração no servidor de pagamento'
      httpStatus = 500
    } else if (stripeType === 'StripeInvalidRequestError') {
      userMessage = 'Dados de pagamento inválidos'
      httpStatus = 400
    } else if (stripeType === 'StripeAPIError' || stripeType === 'StripeConnectionError') {
      userMessage = 'Erro temporário no servidor de pagamento. Tente novamente em alguns momentos'
      httpStatus = 503
    }
    
    return c.json(
      { 
        error: userMessage, 
        debugId: session?.id || crypto.randomUUID().substring(0, 8),
        stripeError: stripeErrorCode || undefined,
        stripeType: stripeType || undefined,
        message: env.ENVIRONMENT === 'development' ? errorMessage : undefined,
        type: errorType
      },
      httpStatus,
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
