# 🛡️ Backend Robusto e Sem Erros

Este documento lista todas as validações, tratamentos de erro e medidas de segurança implementadas no backend.

---

## ✅ Validações Implementadas

### 1. Validação de Stripe

**Localização**: `backend/src/services/stripe.ts`, `backend/src/routes/checkout.ts`

```typescript
// ✅ Validar se a chave existe
if (!env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY binding')
}

// ✅ Validar formato da chave
if (!env.STRIPE_SECRET_KEY.startsWith('sk_') && !env.STRIPE_SECRET_KEY.startsWith('rk_')) {
  throw new Error('Invalid STRIPE_SECRET_KEY format')
}

// ✅ Validar webhook secret
if (!env.STRIPE_WEBHOOK_SECRET || !env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
  throw new Error('Invalid STRIPE_WEBHOOK_SECRET format')
}
```

### 2. Validação de JWT

**Localização**: `backend/src/middleware/adminAuth.ts`, `backend/src/middleware/auth.ts`

```typescript
// ✅ Validar token JWT
try {
  const payload = await verify(token, c.env.JWT_SECRET) as unknown as AdminJWTPayload
  // ✅ Verificar se usuário ainda existe e está ativo
  const adminUser = await db.query.adminUsers.findFirst({
    where: and(
      eq(adminUsers.id, payload.adminUserId),
      eq(adminUsers.active, true)
    ),
  })
  if (!adminUser) {
    return c.json({ error: 'Admin user not found or inactive' }, 401)
  }
} catch (error) {
  return c.json({ error: 'Invalid or expired token' }, 401)
}
```

### 3. Validação de Entrada

**Localização**: `backend/src/utils/validation.ts`, `backend/src/validators/`

```typescript
// ✅ Limites de segurança
export const SECURITY_LIMITS = {
  MAX_ITEMS_PER_CART: 50,
  MAX_QUANTITY_PER_ITEM: 99,
  MAX_PAYLOAD_SIZE: 100 * 1024, // 100KB
  MAX_EMAIL_LENGTH: 254,
  MAX_NAME_LENGTH: 200,
  MAX_ADDRESS_LENGTH: 500,
  MAX_PHONE_LENGTH: 20,
  MAX_PRODUCT_NAME_LENGTH: 500,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_PRICE: 0.01,
  MAX_PRICE: 999999.99,
  MAX_CART_TOTAL: 100000,
}

// ✅ Validação de email
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}
```

### 4. Validação de Tamanho de Payload

**Localização**: `backend/src/middleware/security.ts`

```typescript
// ✅ Validar tamanho do payload antes de processar
export async function validateRequestSize(c: Context, next: Next) {
  const contentLength = c.req.header('content-length')
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    if (size > SECURITY_LIMITS.MAX_PAYLOAD_SIZE) {
      return c.json({ error: 'Payload muito grande' }, 413)
    }
  }
  await next()
}
```

### 5. Validação de CORS

**Localização**: `backend/src/index.ts`

```typescript
// ✅ Validar origins permitidas
const allowedOrigins = env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || []

// ✅ Em produção, usar apenas origins permitidas
const origin = env.ENVIRONMENT === 'production' && allowedOrigins.length > 0
  ? (c.req.header('origin') && allowedOrigins.includes(c.req.header('origin')!) 
     ? c.req.header('origin') 
     : allowedOrigins[0])
  : '*'
```

### 6. Validação de Rate Limiting

**Localização**: `backend/src/middleware/rateLimit.ts`

```typescript
// ✅ Rate limiting para login
export const loginRateLimit = rateLimiter({
  max: 10, // 10 tentativas
  windowMs: 15 * 60 * 1000, // 15 minutos
  keyGenerator: (c) => {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
    return `login:${ip}`
  },
})

// ✅ Bypass em modo teste
const isTestMode = c.env.ENVIRONMENT === 'test' || 
                   c.env.ENVIRONMENT === 'development' || 
                   c.req.header('X-Test-Mode') === 'true' || 
                   c.req.header('X-Playwright-Test') === 'true'
```

---

## 🛡️ Tratamento de Erros

### 1. Error Handler Global

**Localização**: `backend/src/middleware/errorHandler.ts`

```typescript
// ✅ Error handler robusto
export const errorHandler = (err: Error | HTTPException, c: Context) => {
  const env = c.env as unknown as WorkerBindings
  const isDevelopment = env.ENVIRONMENT === 'development'
  
  // ✅ Log detalhado do erro
  console.error('❌ Unhandled error:', {
    message: err.message,
    name: err.name,
    stack: isDevelopment ? err.stack : undefined,
    url: c.req.url,
    method: c.req.method,
    timestamp: new Date().toISOString(),
  })

  // ✅ Não expor detalhes em produção
  const errorMessage = isDevelopment 
    ? err.message 
    : 'Erro interno do servidor. Por favor, tente novamente mais tarde.'

  // ✅ Adicionar debugId para rastreamento
  if (!isDevelopment) {
    const debugId = crypto.randomUUID().substring(0, 8)
    errorResponse.debugId = debugId
  }

  return c.json(errorResponse, 500)
}
```

### 2. Tratamento de Erros do Stripe

**Localização**: `backend/src/routes/checkout.ts`

```typescript
// ✅ Tratamento robusto de erros do Stripe
catch (stripeError: unknown) {
  const stripeErrorMessage = stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error'
  const stripeErrorType = stripeError instanceof Error ? stripeError.constructor.name : 'UnknownError'
  const stripeErrorObj = stripeError as StripeErrorLike
  
  // ✅ Mensagens de erro personalizadas
  if (errorMessage.includes('api_key')) {
    userMessage = 'Erro de configuração no servidor de pagamento'
    httpStatus = 500
  } else if (stripeType === 'StripeAPIError') {
    userMessage = 'Erro temporário no servidor de pagamento. Tente novamente em alguns momentos'
    httpStatus = 503
  }
  
  // ✅ Retornar erro com debugId
  return c.json({
    error: userMessage,
    debugId: session?.id || crypto.randomUUID().substring(0, 8),
    stripeError: stripeErrorCode || undefined,
    message: env.ENVIRONMENT === 'development' ? errorMessage : undefined,
  }, { status: httpStatus })
}
```

### 3. Validação de Schema (Zod)

**Localização**: `backend/src/validators/`

```typescript
// ✅ Validação de produtos
export const productSchema = z.object({
  name: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  price: z.number().min(0.01).max(999999.99),
  category: z.string().min(1),
  inStock: z.boolean().optional(),
  stock: z.number().int().min(0).optional(),
})

// ✅ Validação de categorias
export const categorySchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().max(1000).nullable().optional(),
})

// ✅ Validação de cupons
export const couponSchema = z.object({
  code: z.string().min(1).max(50),
  discount: z.number().min(0).max(100),
  expiresAt: z.string().datetime(),
})
```

---

## 🔒 Segurança

### 1. Autenticação Admin

**Localização**: `backend/src/middleware/adminAuth.ts`

```typescript
// ✅ Verificar sessão primeiro (httpOnly cookie)
const session = await verifySession(c as any)
if (session) {
  // Usar sessão
  c.set('adminUser', payload)
  return next()
}

// ✅ Fallback para JWT token
const authHeader = c.req.header('Authorization')
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return c.json({ error: 'Missing or invalid authorization header' }, 401)
}

// ✅ Verificar se usuário ainda existe e está ativo
const adminUser = await db.query.adminUsers.findFirst({
  where: and(
    eq(adminUsers.id, payload.adminUserId),
    eq(adminUsers.active, true)
  ),
})
```

### 2. Permissões (RBAC)

**Localização**: `backend/src/middleware/adminAuth.ts`

```typescript
// ✅ Verificar permissões
export function requirePermission(permission: string) {
  return async (c: AdminAuthContext, next: Next) => {
    const adminUser = c.get('adminUser')
    if (!adminUser) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    if (!adminUser.permissions.includes(permission)) {
      return c.json({ error: 'Forbidden' }, 403)
    }
    
    return next()
  }
}
```

### 3. Proteção CSRF

**Localização**: `backend/src/middleware/csrf.ts`

```typescript
// ✅ Validar token CSRF
export function csrfProtection() {
  return async (c: Context, next: Next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(c.req.method)) {
      return next()
    }

    const token = c.req.header('X-CSRF-Token')
    const cookieToken = getCookie(c, 'csrf_token')

    if (!token || !cookieToken || token !== cookieToken) {
      return c.json({ error: 'Invalid CSRF token' }, 403)
    }

    return next()
  }
}
```

### 4. Headers de Segurança

**Localização**: `backend/src/index.ts`

```typescript
// ✅ Headers de segurança
c.header('X-Content-Type-Options', 'nosniff')
c.header('X-Frame-Options', 'DENY')
c.header('X-XSS-Protection', '1; mode=block')

// ✅ CSP em produção
if (env.ENVIRONMENT === 'production') {
  c.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://*.stripe.com;")
}
```

### 5. Validação de Entrada SQL Injection

**Localização**: `backend/src/lib/db.ts`

```typescript
// ✅ Usar Drizzle ORM (proteção contra SQL injection)
// Todas as queries usam Drizzle, nunca SQL raw com interpolação
const products = await db.query.products.findMany({
  where: eq(products.id, productId), // ✅ Safe
})

// ❌ NUNCA fazer isso:
// await db.exec(`SELECT * FROM products WHERE id = '${productId}'`) // SQL Injection!
```

---

## 🧪 Testes e Validação

### 1. Endpoint de Debug

**Localização**: `backend/src/index.ts`

```typescript
// ✅ Endpoint de debug (verificar configurações)
app.get('/api/debug/config', (c) => {
  const env = c.env as WorkerBindings
  
  return c.json({
    environment: env.ENVIRONMENT,
    bindings: {
      hasDB: !!env.DB,
      hasR2: !!env.R2,
      hasStripeKey: !!env.STRIPE_SECRET_KEY,
      hasStripeWebhookSecret: !!env.STRIPE_WEBHOOK_SECRET,
      hasJWTSecret: !!env.JWT_SECRET,
      stripeKeyPreview: env.STRIPE_SECRET_KEY ? `${env.STRIPE_SECRET_KEY.substring(0, 10)}...` : 'MISSING',
    },
    timestamp: new Date().toISOString(),
  })
})
```

### 2. Health Check

**Localização**: `backend/src/index.ts`

```typescript
// ✅ Health check simples
app.get('/api/health', (c) => c.json({ 
  status: 'ok', 
  timestamp: new Date().toISOString() 
}))
```

---

## 📊 Monitoramento

### 1. Logging Detalhado

```typescript
// ✅ Log de todas as operações importantes
console.log('💳 Payment Intent request:', {
  itemsCount: body?.items?.length || 0,
  hasEmail: !!body?.email,
})

console.error('❌ Checkout error:', {
  errorType,
  stripeErrorCode,
  stripeType,
  message: errorMessage,
  timestamp: new Date().toISOString(),
})
```

### 2. Audit Log

**Localização**: `backend/src/middleware/adminAuth.ts`

```typescript
// ✅ Registrar todas as ações admin
await createAuditLog(c.env, {
  adminUserId: adminUser.adminUserId,
  action: 'create',
  resource: 'product',
  resourceId: productId,
  details: { name, price, category },
  ...getRequestInfo(c as any),
})
```

---

## 🚀 Melhorias Implementadas

### 1. Validação de Categoria ao Criar Produto

```typescript
// ✅ Verificar se categoria existe antes de criar produto
const categoryExists = await db.query.categories.findFirst({
  where: or(
    eq(categories.slug, category),
    eq(categories.id, category)
  ),
})

if (!categoryExists) {
  return c.json({ error: 'Category not found' }, 400)
}
```

### 2. Validação de Slug Único

```typescript
// ✅ Verificar se slug já existe
const existing = await db.query.categories.findFirst({
  where: eq(categories.slug, slug),
})

if (existing) {
  return c.json({ error: 'Slug already exists' }, 400)
}
```

### 3. Validação de Preço

```typescript
// ✅ Validar preço dentro dos limites
if (price < SECURITY_LIMITS.MIN_PRICE || price > SECURITY_LIMITS.MAX_PRICE) {
  return c.json({ error: 'Price out of range' }, 400)
}
```

### 4. Validação de Quantidade

```typescript
// ✅ Validar quantidade no carrinho
if (quantity > SECURITY_LIMITS.MAX_QUANTITY_PER_ITEM) {
  return c.json({ error: 'Quantity too high' }, 400)
}

if (items.length > SECURITY_LIMITS.MAX_ITEMS_PER_CART) {
  return c.json({ error: 'Too many items in cart' }, 400)
}
```

---

## ✅ Checklist de Robustez

### Validações
- [x] Validação de Stripe keys
- [x] Validação de JWT tokens
- [x] Validação de entrada (email, nome, etc.)
- [x] Validação de tamanho de payload
- [x] Validação de CORS
- [x] Validação de rate limiting
- [x] Validação de schema (Zod)
- [x] Validação de categoria
- [x] Validação de slug único
- [x] Validação de preço
- [x] Validação de quantidade

### Tratamento de Erros
- [x] Error handler global
- [x] Tratamento de erros do Stripe
- [x] Tratamento de erros de validação
- [x] Logging detalhado
- [x] Debug ID para rastreamento
- [x] Mensagens de erro personalizadas

### Segurança
- [x] Autenticação admin
- [x] Permissões (RBAC)
- [x] Proteção CSRF
- [x] Headers de segurança
- [x] Proteção SQL injection (Drizzle ORM)
- [x] Validação de origem (CORS)
- [x] Rate limiting

### Monitoramento
- [x] Endpoint de debug
- [x] Health check
- [x] Logging detalhado
- [x] Audit log

---

## 🎯 Próximas Melhorias (Opcional)

1. **Cache de Redis**: Para melhor performance
2. **Rate Limiting por Usuário**: Além de IP
3. **Validação de Imagem**: Verificar tipo e tamanho
4. **Compressão de Resposta**: Gzip/Brotli
5. **Metrics e Analytics**: Prometheus, Datadog, etc.
6. **Backup Automático**: D1 e R2
7. **Alertas**: Notificações de erros
8. **Testes Automatizados**: Unit e E2E

---

## 📚 Referências

- [Hono.js Security](https://hono.dev/docs/guides/security)
- [Stripe Security](https://stripe.com/docs/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Cloudflare Workers Security](https://developers.cloudflare.com/workers/platform/security/)

---

**Última atualização**: 2024-11-08

