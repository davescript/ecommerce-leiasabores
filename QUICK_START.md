# 🚀 Quick Start - Admin Panel Completo

## 📦 O Que Foi Implementado

### ✅ Backend - Infraestrutura Completa

1. **Sessões httpOnly** (`backend/src/middleware/session.ts`)
   - Autenticação segura com cookies httpOnly
   - Expiração por inatividade (2h)
   - Sessão de 8 horas

2. **Rate Limiting** (`backend/src/middleware/rateLimit.ts`)
   - Login: 5 tentativas / 15 minutos
   - API: 100 requests / minuto

3. **CSRF Protection** (`backend/src/middleware/csrf.ts`)
   - Tokens CSRF em cookies httpOnly
   - Validação em mutações

4. **Cache Busting** (`backend/src/utils/cache.ts`)
   - Invalidação automática
   - Versionamento de URLs

5. **R2 Upload** (`backend/src/utils/r2-upload.ts`)
   - Upload para Cloudflare R2
   - Validação de imagens
   - URLs pré-assinadas

6. **Schema Atualizado** (`backend/src/models/schema.ts`)
   - Tabelas: product_categories, product_images, customers, admin_sessions, order_status_history, cache_keys, rate_limits
   - Campos: slug, sku, status, seoTitle, seoDescription, stockMinAlert
   - RBAC: roles (admin, manager, editor, viewer)

7. **Migration** (`backend/migrations/0003_complete_admin_schema.sql`)
   - Schema completo
   - Índices e constraints

## 🔧 Como Usar

### 1. Aplicar Migration

```bash
cd backend
wrangler d1 migrations apply DB --remote
```

### 2. Seed Inicial

```bash
# Criar admin inicial
curl -X POST "https://api.leiasabores.pt/api/admin/seed-admin?token=YOUR_TOKEN"
```

### 3. Integrar Sessões no Login

Atualize `backend/src/routes/admin/auth.ts`:

```typescript
import { createSession, setSessionCookie, destroySession, clearSessionCookie } from '../../middleware/session'

// Login
export async function login(c: Context) {
  // ... validação de credenciais ...
  
  const { token, expiresAt } = await createSession(
    c.env,
    adminUser.id,
    c.req.header('CF-Connecting-IP') || 'unknown',
    c.req.header('User-Agent') || 'unknown'
  )
  
  setSessionCookie(c, token, expiresAt)
  
  return c.json({ user: { id: adminUser.id, email: adminUser.email, role: adminUser.role } })
}

// Logout
export async function logout(c: Context) {
  const session = c.get('session')
  if (session) {
    await destroySession(c.env, session.sessionId)
  }
  clearSessionCookie(c)
  return c.json({ message: 'Logged out' })
}
```

### 4. Integrar Cache Busting

Atualize `backend/src/routes/admin/products.ts`:

```typescript
import { bustProductCache } from '../../utils/cache'

// PUT /api/v1/admin/products/:id
export async function updateProduct(c: Context) {
  // ... atualizar produto ...
  
  // Bust cache
  await bustProductCache(c.env, productId)
  
  return c.json(product)
}
```

### 5. Integrar Rate Limiting

```typescript
import { loginRateLimit, apiRateLimit } from '../../middleware/rateLimit'

// Aplicar rate limiting
app.post('/api/v1/admin/auth/login', loginRateLimit, login)
app.use('/api/v1/admin/*', apiRateLimit)
```

### 6. Integrar CSRF

```typescript
import { csrfProtection, getCSRFToken } from '../../middleware/csrf'

// Endpoint para obter token
app.get('/api/csrf-token', getCSRFToken)

// Proteger rotas
app.use('/api/v1/admin/*', csrfProtection())
```

## 📋 Próximos Passos

### Frontend

1. **Drawer Lateral** para edição de produtos
2. **Rich Text Editor** para descrições
3. **Dashboard** com gráficos
4. **Dark Mode** completo
5. **Timeline** de pedidos

### Backend

1. **Integrar sessões** nas rotas de auth
2. **Integrar cache busting** nas rotas de produtos
3. **Upload assinado R2** para upload direto
4. **Timeline** de pedidos
5. **Testes** unitários e e2e

## 🔒 Segurança

- ✅ Sessões httpOnly
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ RBAC
- ✅ Validação Zod
- ✅ Logs de auditoria

## 📚 Documentação

- `ADMIN_PANEL_COMPLETE_IMPLEMENTATION.md` - Documentação completa
- `IMPLEMENTATION_SUMMARY.md` - Resumo da implementação
- `QUICK_START.md` - Este arquivo

## 🐛 Troubleshooting

### Sessão não funciona
- Verificar cookie httpOnly
- Verificar JWT_SECRET
- Verificar expiração

### Cache não atualiza
- Verificar invalidação
- Verificar versão
- Limpar cache manualmente

### Upload R2 falha
- Verificar permissões
- Verificar tamanho
- Verificar formato

