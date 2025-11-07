import { Hono } from 'hono'
import { eq, inArray } from 'drizzle-orm'
import { getDb, dbSchema } from '../lib/db'
import { getStripe } from '../services/stripe'
import type StripeType from 'stripe'
import type { WorkerBindings } from '../types/bindings'
import { buildProductResponse, resolveImageBaseUrl } from '../utils/product-images'
import {
  isValidEmail,
  validateCartItems,
  validatePayloadSize,
  isValidPrice,
  isValidQuantity,
  isValidUUID,
  isValidUrl,
  SECURITY_LIMITS,
} from '../utils/validation'
import { validateRequestSize, rateLimit } from '../middleware/security'

// Instância sem genéricos explícitos para evitar incompatibilidades de tipos do Env
const router = new Hono()

// Aplicar rate limiting ao checkout (mais restritivo por ser endpoint crítico)
router.use('/*', rateLimit(20, 60000)) // 20 requisições por minuto
router.use('/*', validateRequestSize)

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
    // Validar tamanho do payload ANTES de fazer parse
    const rawBody = await c.req.text()
    const payloadValidation = validatePayloadSize(rawBody)
    if (!payloadValidation.valid) {
      console.error('❌ Payload size validation failed:', payloadValidation.error)
      return c.json({ 
        error: 'Payload muito grande',
        debugId: 'payload_too_large'
      }, 413)
    }

    body = JSON.parse(rawBody) as {
      items: Array<{ productId: string; quantity: number }>
      shippingAddress: Record<string, unknown>
      billingAddress: Record<string, unknown>
      email: string
    }

    console.log('📦 Checkout request received:', {
      itemsCount: body?.items?.length || 0,
      hasEmail: !!body?.email,
      emailPreview: body?.email ? `${body.email.substring(0, 10)}...` : 'MISSING',
      hasShippingAddress: !!body?.shippingAddress,
      hasBillingAddress: !!body?.billingAddress,
    })

    // Validação rigorosa de items do carrinho
    const cartValidation = validateCartItems(body?.items || [])
    if (!cartValidation.valid) {
      console.error('❌ Cart validation failed:', cartValidation.error)
      return c.json({ 
        error: cartValidation.error || 'Carrinho inválido',
        debugId: 'cart_validation_failed'
      }, 400)
    }

    if (!body.email || typeof body.email !== 'string') {
      console.error('❌ Validation failed: Email is missing or invalid type')
      return c.json({ 
        error: 'Email é obrigatório',
        debugId: 'missing_email'
      }, 400)
    }

    // Validar formato de email com função de validação robusta
    const trimmedEmail = body.email.trim().toLowerCase()
    if (!isValidEmail(trimmedEmail)) {
      console.error('❌ Validation failed: Invalid email format', { email: trimmedEmail.substring(0, 20) })
      return c.json({ 
        error: 'Formato de email inválido. Use um email válido (ex: seu.email@dominio.com)',
        debugId: 'invalid_email_format'
      }, 400)
    }

    // Normalizar email
    body.email = trimmedEmail

    // Normalizar e validar items com validações rigorosas
    const normalizedItems = body.items
      .map((item) => {
        const productId = typeof item.productId === 'string' ? item.productId.trim() : ''
        const quantity = typeof item.quantity === 'number' && isValidQuantity(item.quantity)
          ? Math.floor(item.quantity)
          : 1
        
        // Validar UUID do produto
        if (!isValidUUID(productId)) {
          throw new Error(`Invalid product ID format: ${productId}`)
        }
        
        return { productId, quantity }
      })
      .filter((item) => item.productId.length > 0) as Array<{ productId: string; quantity: number }>

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
      
      // Validação rigorosa de preço usando função de validação
      if (!isValidPrice(unitPrice)) {
        console.error(`❌ Invalid price for product ${product.id}:`, unitPrice)
        throw new Error(`Preço inválido para produto ${product.id}: ${unitPrice}`)
      }
      
      // Validar quantidade usando função de validação
      if (!isValidQuantity(quantity)) {
        console.error(`❌ Invalid quantity for product ${product.id}:`, quantity)
        throw new Error(`Quantidade inválida para produto ${product.id}: ${quantity}`)
      }
      
      // Validar e truncar nome do produto (máximo 500 caracteres para Stripe)
      const productName = (product.name || 'Produto sem nome')
        .substring(0, SECURITY_LIMITS.MAX_PRODUCT_NAME_LENGTH)
        .replace(/[<>]/g, '') // Proteção XSS básica
      
      // Validar e truncar descrição (máximo 500 caracteres para Stripe)
      const productDescription = (product.shortDescription || product.description || '')
        .substring(0, SECURITY_LIMITS.MAX_DESCRIPTION_LENGTH)
        .replace(/[<>]/g, '') // Proteção XSS básica
      
      // Validar que unit_amount está dentro dos limites do Stripe
      const unitAmountCents = Math.round(unitPrice * 100)
      if (unitAmountCents < 1) {
        throw new Error(`Preço muito baixo para produto ${product.id}: ${unitPrice}`)
      }
      if (unitAmountCents > 99999999) {
        throw new Error(`Preço muito alto para produto ${product.id}: ${unitPrice}`)
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
        quantity: Math.max(1, Math.min(SECURITY_LIMITS.MAX_QUANTITY_PER_ITEM, quantity)),
      }
    })

    const subtotal = normalizedItems.reduce((sum, item) => {
      const product = catalog.get(item.productId)!
      return sum + product.price * item.quantity
    }, 0)

    // Validações de segurança rigorosas
    if (subtotal < 0 || !Number.isFinite(subtotal)) {
      console.error('❌ Invalid subtotal:', subtotal)
      return c.json({ 
        error: 'Total do carrinho inválido',
        debugId: 'invalid_subtotal'
      }, 400)
    }

    if (subtotal > SECURITY_LIMITS.MAX_CART_TOTAL) {
      console.error('❌ Cart total exceeds maximum:', subtotal)
      return c.json({ 
        error: `Total do carrinho excede o limite máximo de €${SECURITY_LIMITS.MAX_CART_TOTAL.toLocaleString('pt-PT')}`,
        debugId: 'cart_total_exceeded'
      }, 400)
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

    // Métodos regionais opcionais (comentados - podem ser adicionados se a conta Stripe os suportar)
    // const optionalPaymentMethods: StripeType.Checkout.SessionCreateParams.PaymentMethodType[] = [
    //   'ideal',     // iDEAL (Holanda)
    //   'bancontact', // Bancontact (Bélgica)
    //   'eps',       // EPS (Áustria)
    //   'giropay',   // giropay (Alemanha)
    //   'p24',       // Przelewy24 (Polónia)
    // ]

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

    // Validar URLs de sucesso/cancelamento com validação rigorosa
    if (!origin || !isValidUrl(origin)) {
      console.error('❌ Invalid origin URL:', origin)
      return c.json({ 
        error: 'URL de origem inválida',
        debugId: 'invalid_origin'
      }, 400)
    }
    
    // Validar que origin é HTTPS em produção
    if (env.ENVIRONMENT === 'production' && !origin.startsWith('https://')) {
      console.error('❌ Non-HTTPS origin in production:', origin)
      return c.json({ 
        error: 'Apenas conexões HTTPS são permitidas em produção',
        debugId: 'non_https_origin'
      }, 400)
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
  
  // Validar tamanho do body do webhook
  const rawBody = await c.req.text()
  const payloadValidation = validatePayloadSize(rawBody)
  if (!payloadValidation.valid) {
    console.error('❌ Webhook payload too large:', payloadValidation.error)
    return c.json({ error: 'Webhook payload too large' }, 413)
  }

  if (!signature || typeof signature !== 'string' || signature.length < 20) {
    console.error('❌ Missing or invalid signature header')
    return c.json({ 
      error: 'Missing or invalid signature header',
      debugId: 'missing_signature'
    }, 400)
  }

  try {
    const env = c.env as unknown as WorkerBindings
    
    // Validar webhook secret antes de processar
    if (!env.STRIPE_WEBHOOK_SECRET || typeof env.STRIPE_WEBHOOK_SECRET !== 'string') {
      console.error('❌ Missing STRIPE_WEBHOOK_SECRET binding')
      return c.json({ 
        error: 'Webhook misconfigured',
        debugId: 'missing_webhook_secret'
      }, 500)
    }
    
    // Validar formato do webhook secret
    if (!env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
      console.error('❌ Invalid STRIPE_WEBHOOK_SECRET format')
      return c.json({ 
        error: 'Webhook secret format invalid',
        debugId: 'invalid_webhook_secret_format'
      }, 500)
    }
    
    const stripe = getStripe(env)
    
    // Construir evento com validação de assinatura
    let event: StripeType.Event
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      )
    } catch (webhookError) {
      const errorMessage = webhookError instanceof Error ? webhookError.message : 'Unknown error'
      console.error('❌ Webhook signature validation failed:', errorMessage)
      return c.json({ 
        error: 'Invalid webhook signature',
        debugId: 'invalid_signature'
      }, 400)
    }
    const db = getDb({ DB: env.DB })
    const { orders, cartItems } = dbSchema

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as StripeType.PaymentIntent
        const metadata = paymentIntent.metadata || {}
        
        console.log(`💳 Payment Intent succeeded: ${paymentIntent.id} | Amount: €${(paymentIntent.amount || 0) / 100} | Customer: ${paymentIntent.receipt_email}`)
        
        const existing = await db.query.orders.findFirst({
          where: eq(orders.stripeSessionId, paymentIntent.id),
        })

        if (existing) {
          console.log(`✅ Order already exists: ${existing.id}`)
          return c.json({ received: true, orderId: existing.id })
        }

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
        if (metadata.shippingAddress && typeof metadata.shippingAddress === 'string') {
          try {
            const parsed = JSON.parse(metadata.shippingAddress)
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              shippingAddress = parsed as Record<string, unknown>
            }
          } catch {
            // Ignorar erro
          }
        }

        const orderId = crypto.randomUUID()
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
        return c.json({ received: true, orderId })
      }

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

        // Validar e parsear endereços com tratamento de erro robusto
        let shippingAddress: Record<string, unknown> | null = null
        let billingAddress: Record<string, unknown> | null = null
        
        // Tentar obter shipping address do metadata primeiro, depois do session
        if (metadata.shippingAddress && typeof metadata.shippingAddress === 'string') {
          try {
            const parsed = JSON.parse(metadata.shippingAddress)
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              shippingAddress = parsed as Record<string, unknown>
            }
          } catch (parseError) {
            console.warn('⚠️ Failed to parse shipping address from metadata:', parseError)
          }
        }
        
        // Fallback para shipping address do session
        if (!shippingAddress && session.shipping_details) {
          try {
            shippingAddress = (session.shipping_details as unknown) as Record<string, unknown>
          } catch {
            // Ignorar erro
          }
        }
        
        // Tentar obter billing address do metadata primeiro, depois do session
        if (metadata.billingAddress && typeof metadata.billingAddress === 'string') {
          try {
            const parsed = JSON.parse(metadata.billingAddress)
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              billingAddress = parsed as Record<string, unknown>
            }
          } catch (parseError) {
            console.warn('⚠️ Failed to parse billing address from metadata:', parseError)
          }
        }
        
        // Fallback para billing address do session
        if (!billingAddress && session.customer_details) {
          try {
            billingAddress = (session.customer_details as unknown) as Record<string, unknown>
          } catch {
            // Ignorar erro
          }
        }

        if (!existing) {
          const orderId = crypto.randomUUID()
          await db.insert(orders).values({
            id: orderId,
            userId: (metadata.userId as string) || session.customer_email || 'guest',
            stripeSessionId: session.id,
            email: session.customer_email || '',
            subtotal: totals.subtotal,
            tax: totals.tax,
            shipping: totals.shipping,
            total: totals.total,
            status: 'paid',
            shippingAddress: shippingAddress || null,
            billingAddress: billingAddress || null,
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
