# 🔐 Configuração Completa do E-commerce

Este documento contém todas as chaves, tokens e configurações necessárias para iniciar um novo e-commerce do zero sem erros.

---

## 📋 Índice

1. [Variáveis de Ambiente (Secrets)](#variáveis-de-ambiente-secrets)
2. [Configuração do Cloudflare](#configuração-do-cloudflare)
3. [Configuração do Stripe](#configuração-do-stripe)
4. [Configuração do Backend](#configuração-do-backend)
5. [Configuração do Frontend](#configuração-do-frontend)
6. [GitHub Actions Secrets](#github-actions-secrets)
7. [Verificação e Testes](#verificação-e-testes)

---

## 🔑 Variáveis de Ambiente (Secrets)

### Secrets Obrigatórios

Estes secrets devem ser configurados no Cloudflare Workers e no GitHub Actions:

```bash
# Stripe (Obrigatório)
STRIPE_SECRET_KEY=sk_test_... ou sk_live_...  # Chave secreta do Stripe
STRIPE_WEBHOOK_SECRET=whsec_...                # Secret do webhook do Stripe

# JWT (Obrigatório)
JWT_SECRET=sua-chave-jwt-super-secreta-aleatoria-minimo-32-caracteres

# Cloudflare (Obrigatório)
CLOUDFLARE_API_TOKEN=seu-token-da-api-do-cloudflare
CLOUDFLARE_ACCOUNT_ID=seu-account-id-do-cloudflare
```

### Variáveis de Ambiente (Não secretas)

Estas variáveis são configuradas no `wrangler.toml`:

```toml
ENVIRONMENT=development  # ou production
ALLOWED_ORIGINS=https://seudominio.com,https://www.seudominio.com,http://localhost:5173
ADMIN_SEED_TOKEN=seed-token-personalizado-para-seed-de-dados
PUBLIC_IMAGE_BASE_URL=https://seudominio.com/images  # Opcional
IMAGE_CACHE_BUSTER=v1  # Opcional
R2_DEFAULT_PREFIX=products/  # Opcional
```

---

## ☁️ Configuração do Cloudflare

### 1. Criar Conta e Obter Credenciais

1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Obtenha seu **Account ID** (encontrado na URL ou no canto inferior direito)
3. Crie um **API Token** com as seguintes permissões:
   - **Account** → **Cloudflare Workers** → **Edit**
   - **Account** → **Workers Scripts** → **Edit**
   - **Account** → **D1** → **Edit**
   - **Account** → **R2** → **Edit**
   - **Zone** → **Zone** → **Read** (se usar rotas customizadas)

### 2. Criar Banco de Dados D1

```bash
# Via Wrangler CLI
npx wrangler d1 create ecommerce_db

# Ou via Cloudflare Dashboard:
# 1. Workers & Pages → D1 → Create database
# 2. Nome: ecommerce_db
# 3. Copiar o database_id gerado
```

### 3. Criar Bucket R2

```bash
# Via Wrangler CLI
npx wrangler r2 bucket create seu-bucket-r2

# Ou via Cloudflare Dashboard:
# 1. R2 → Create bucket
# 2. Nome: seu-bucket-r2
# 3. Configurar CORS se necessário
```

### 4. Configurar Rotas do Worker

No `wrangler.toml`:

```toml
routes = [
  "seudominio.com/api/*",
  "api.seudominio.com/*"
]
```

### 5. Configurar wrangler.toml

```toml
name = "ecommerce-backend"
main = "backend/src/index.ts"
compatibility_date = "2023-10-30"

account_id = "SEU_ACCOUNT_ID_AQUI"

# Rotas do Worker (API backend)
routes = [
  "seudominio.com/api/*",
  "api.seudominio.com/*"
]

# Banco de Dados D1
[[d1_databases]]
binding = "DB"
database_name = "ecommerce_db"
database_id = "SEU_DATABASE_ID_AQUI"
migrations_dir = "backend/migrations"

# R2 Storage
[[r2_buckets]]
binding = "R2"
bucket_name = "seu-bucket-r2"

# Variáveis locais
[vars]
ENVIRONMENT = "development"
ALLOWED_ORIGINS = "https://seudominio.com, https://www.seudominio.com, https://seudominio.pages.dev, http://localhost:5173"
ADMIN_SEED_TOKEN = "seed-token-personalizado-2024"

# Ambiente de produção
[env.production]
name = "ecommerce-backend-prod"
account_id = "SEU_ACCOUNT_ID_AQUI"

[[env.production.d1_databases]]
binding = "DB"
database_id = "SEU_DATABASE_ID_AQUI"

[[env.production.r2_buckets]]
binding = "R2"
bucket_name = "seu-bucket-r2"

[env.production.vars]
ENVIRONMENT = "production"
ALLOWED_ORIGINS = "https://seudominio.com, https://www.seudominio.com"
ADMIN_SEED_TOKEN = "seed-token-personalizado-2024"

# Cloudflare Pages (Frontend)
pages_build_output_dir = "dist/public"
build_command = "npm run build:frontend"
```

### 6. Configurar Secrets no Cloudflare

```bash
# Secrets para desenvolvimento
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put JWT_SECRET

# Secrets para produção
npx wrangler secret put STRIPE_SECRET_KEY --env production
npx wrangler secret put STRIPE_WEBHOOK_SECRET --env production
npx wrangler secret put JWT_SECRET --env production
```

---

## 💳 Configuração do Stripe

### 1. Criar Conta Stripe

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com/)
2. Crie uma conta (modo teste primeiro)
3. Ative sua conta para produção quando estiver pronto

### 2. Obter Chaves da API

1. **Dashboard** → **Developers** → **API keys**
2. Copie a **Secret key** (começa com `sk_test_` ou `sk_live_`)
3. Copie a **Publishable key** (começa com `pk_test_` ou `pk_live_`)

### 3. Configurar Webhook

1. **Dashboard** → **Developers** → **Webhooks**
2. **Add endpoint**
3. **Endpoint URL**: `https://api.seudominio.com/api/v1/checkout/webhook`
4. **Events to send**: Selecionar:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copiar o **Signing secret** (começa com `whsec_`)

### 4. Configurar Domínios Permitidos

No Stripe Dashboard:
- **Settings** → **Branding** → **Domains**
- Adicionar: `seudominio.com`, `www.seudominio.com`

### 5. Configurar Frontend

No arquivo `.env` ou variáveis de ambiente do frontend:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... ou pk_live_...
VITE_API_URL=https://api.seudominio.com/api
```

---

## 🔒 Configuração JWT

### Gerar JWT Secret Seguro

```bash
# Gerar secret aleatório (mínimo 32 caracteres)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ou usar openssl
openssl rand -hex 32

# Ou usar online: https://generate-secret.vercel.app/32
```

**Importante**: 
- Mínimo de 32 caracteres
- Use caracteres aleatórios (não use palavras ou frases simples)
- Diferente para desenvolvimento e produção
- Mantenha seguro (nunca commite no Git)

---

## 🚀 Configuração do Backend

### 1. Instalar Dependências

```bash
npm install
```

### 2. Executar Migrações

```bash
# Gerar migrações (se necessário)
npx drizzle-kit generate

# Aplicar migrações no D1
npx wrangler d1 execute ecommerce_db --file=backend/migrations/0000_*.sql

# Ou aplicar todas as migrações
npm run migrate
```

### 3. Seed Inicial (Criar Admin)

```bash
# Via API (usando ADMIN_SEED_TOKEN)
curl -X POST https://api.seudominio.com/api/v1/admin/seed \
  -H "Authorization: Bearer seed-token-personalizado-2024" \
  -H "Content-Type: application/json"
```

### 4. Verificar Configuração

```bash
# Testar endpoint de debug
curl https://api.seudominio.com/api/debug/config

# Deve retornar:
# {
#   "environment": "production",
#   "bindings": {
#     "hasDB": true,
#     "hasR2": true,
#     "hasStripeKey": true,
#     "hasStripeWebhookSecret": true,
#     "hasJWTSecret": true,
#     "stripeKeyPreview": "sk_live_..."
#   }
# }
```

---

## 🎨 Configuração do Frontend

### 1. Variáveis de Ambiente

Criar arquivo `.env.local`:

```env
VITE_API_URL=https://api.seudominio.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... ou pk_test_...
VITE_APP_NAME=Seu E-commerce
VITE_APP_URL=https://seudominio.com
```

### 2. Configurar Build

O frontend é buildado automaticamente pelo Cloudflare Pages. Verificar:
- `frontend/vite.config.ts` está configurado corretamente
- `package.json` tem o script `build:frontend`

---

## 🔧 GitHub Actions Secrets

Configurar no GitHub: **Settings** → **Secrets and variables** → **Actions**

### Secrets Necessários

```
CLOUDFLARE_API_TOKEN=seu-token-da-api-do-cloudflare
CLOUDFLARE_ACCOUNT_ID=seu-account-id-do-cloudflare
STRIPE_SECRET_KEY=sk_live_... (opcional, pode usar secrets do Cloudflare)
STRIPE_WEBHOOK_SECRET=whsec_... (opcional, pode usar secrets do Cloudflare)
JWT_SECRET=sua-chave-jwt (opcional, pode usar secrets do Cloudflare)
```

**Nota**: Se os secrets já estão configurados no Cloudflare Workers, não é necessário adicionar no GitHub (o deploy usa os secrets do Cloudflare).

---

## ✅ Verificação e Testes

### 1. Verificar Backend

```bash
# Health check
curl https://api.seudominio.com/api/health

# Debug config
curl https://api.seudominio.com/api/debug/config

# Testar autenticação
curl -X POST https://api.seudominio.com/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@seudominio.com","password":"senha"}'
```

### 2. Verificar Frontend

```bash
# Build local
npm run build:frontend

# Preview local
npm run preview
```

### 3. Verificar Stripe

```bash
# Testar criação de sessão de checkout
curl -X POST https://api.seudominio.com/api/v1/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "prod_123", "quantity": 1}],
    "shippingAddress": {...},
    "email": "test@example.com"
  }'
```

### 4. Verificar R2

```bash
# Testar upload de imagem
curl -X POST https://api.seudominio.com/api/v1/admin/products/upload-image \
  -H "Authorization: Bearer token" \
  -F "file=@imagem.jpg"
```

---

## 📝 Checklist de Configuração

### Cloudflare
- [ ] Conta criada
- [ ] Account ID obtido
- [ ] API Token criado com permissões corretas
- [ ] D1 Database criado
- [ ] R2 Bucket criado
- [ ] Worker criado e configurado
- [ ] Rotas configuradas
- [ ] Secrets configurados (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, JWT_SECRET)
- [ ] Migrações aplicadas

### Stripe
- [ ] Conta criada
- [ ] Secret key obtida
- [ ] Publishable key obtida
- [ ] Webhook configurado
- [ ] Events configurados (checkout.session.completed, payment_intent.succeeded, etc.)
- [ ] Webhook secret obtido
- [ ] Domínios permitidos configurados

### Backend
- [ ] Dependências instaladas
- [ ] wrangler.toml configurado
- [ ] Secrets configurados
- [ ] Migrações aplicadas
- [ ] Seed executado (admin criado)
- [ ] Health check funcionando
- [ ] Debug endpoint funcionando

### Frontend
- [ ] Variáveis de ambiente configuradas
- [ ] Build funcionando
- [ ] Deploy no Cloudflare Pages configurado

### GitHub Actions
- [ ] Secrets configurados
- [ ] Workflows configurados
- [ ] Deploy automático funcionando

---

## 🛡️ Segurança

### Boas Práticas

1. **Nunca commite secrets no Git**
   - Use `.env.local` (não commitado)
   - Use Cloudflare Secrets
   - Use GitHub Secrets

2. **Rotacione secrets regularmente**
   - JWT Secret: A cada 90 dias
   - Stripe Keys: Se comprometidas
   - Cloudflare API Token: A cada 180 dias

3. **Use diferentes secrets para desenvolvimento e produção**
   - Development: `sk_test_...`
   - Production: `sk_live_...`

4. **Configure CORS corretamente**
   - Em produção, liste apenas domínios permitidos
   - Não use `*` em produção

5. **Proteja endpoints admin**
   - Use autenticação JWT
   - Use rate limiting
   - Use HTTPS apenas

---

## 🐛 Troubleshooting

### Erro: "STRIPE_SECRET_KEY is missing"
- Verificar se o secret está configurado no Cloudflare
- Verificar se está usando `wrangler secret put STRIPE_SECRET_KEY`

### Erro: "Invalid STRIPE_SECRET_KEY format"
- Verificar se a chave começa com `sk_test_` ou `sk_live_`
- Verificar se não há espaços ou caracteres extras

### Erro: "Missing STRIPE_WEBHOOK_SECRET"
- Verificar se o webhook está configurado no Stripe
- Verificar se o secret está configurado no Cloudflare
- Verificar se o secret começa com `whsec_`

### Erro: "JWT_SECRET is missing"
- Verificar se o secret está configurado no Cloudflare
- Verificar se tem pelo menos 32 caracteres

### Erro: "Database not found"
- Verificar se o D1 database existe
- Verificar se o database_id está correto no wrangler.toml
- Verificar se as migrações foram aplicadas

### Erro: "R2 bucket not found"
- Verificar se o R2 bucket existe
- Verificar se o bucket_name está correto no wrangler.toml
- Verificar permissões do API token

---

## 📚 Referências

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Hono.js Docs](https://hono.dev/)

---

## 📞 Suporte

Se tiver problemas, verifique:
1. Logs do Cloudflare Workers
2. Logs do Stripe Dashboard
3. Endpoint de debug: `/api/debug/config`
4. Health check: `/api/health`

---

**Última atualização**: 2024-11-08

