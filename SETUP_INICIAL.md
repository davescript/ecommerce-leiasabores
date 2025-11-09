# 🚀 Guia de Setup Inicial - E-commerce do Zero

Este guia passo a passo vai te ajudar a configurar um novo e-commerce do zero sem erros.

---

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Cloudflare
- Conta no Stripe
- Git instalado
- Editor de código (VS Code recomendado)

---

## 🔧 Passo 1: Configurar Cloudflare

### 1.1 Criar Conta Cloudflare

1. Acesse [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
2. Crie uma conta ou faça login
3. Anote seu **Account ID** (encontrado na URL ou no canto inferior direito)

### 1.2 Criar API Token

1. Acesse [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Clique em **Create Token**
3. Use o template **Edit Cloudflare Workers** ou crie custom com:
   - **Account** → **Cloudflare Workers** → **Edit**
   - **Account** → **Workers Scripts** → **Edit**
   - **Account** → **D1** → **Edit**
   - **Account** → **R2** → **Edit**
   - **Zone** → **Zone** → **Read** (se usar rotas customizadas)
4. Copie o token gerado (você só verá uma vez!)

### 1.3 Criar Database D1

```bash
# Via CLI
npx wrangler d1 create ecommerce_db

# Ou via Dashboard:
# 1. Workers & Pages → D1 → Create database
# 2. Nome: ecommerce_db
# 3. Copiar o database_id gerado
```

### 1.4 Criar Bucket R2

```bash
# Via CLI
npx wrangler r2 bucket create seu-bucket-r2

# Ou via Dashboard:
# 1. R2 → Create bucket
# 2. Nome: seu-bucket-r2
# 3. Configurar CORS (opcional):
#    - Allowed Origins: *
#    - Allowed Methods: GET, POST, PUT, DELETE
#    - Allowed Headers: *
```

---

## 💳 Passo 2: Configurar Stripe

### 2.1 Criar Conta Stripe

1. Acesse [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Crie uma conta (use modo teste primeiro)
3. Complete o onboarding

### 2.2 Obter Chaves da API

1. **Dashboard** → **Developers** → **API keys**
2. Copie a **Secret key** (começa com `sk_test_` para teste)
3. Copie a **Publishable key** (começa com `pk_test_` para teste)

### 2.3 Configurar Webhook

1. **Dashboard** → **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. **Endpoint URL**: `https://api.seudominio.com/api/v1/checkout/webhook`
   - (Substitua `seudominio.com` pelo seu domínio)
4. **Events to send**: Selecionar:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Clique em **Add endpoint**
6. Copie o **Signing secret** (começa com `whsec_`)

### 2.4 Configurar Domínios Permitidos

1. **Dashboard** → **Settings** → **Branding**
2. Em **Domains**, adicione:
   - `seudominio.com`
   - `www.seudominio.com`

---

## 🔒 Passo 3: Gerar JWT Secret

```bash
# Opção 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opção 2: OpenSSL
openssl rand -hex 32

# Opção 3: Online
# Acesse: https://generate-secret.vercel.app/32
```

**Importante**: Copie o secret gerado e guarde em local seguro. Você vai precisar dele!

---

## 📁 Passo 4: Configurar Projeto

### 4.1 Clonar/Copiar Projeto

```bash
# Se for um novo projeto
git clone https://github.com/seu-usuario/ecommerce.git
cd ecommerce

# Ou copie os arquivos do projeto atual
```

### 4.2 Instalar Dependências

```bash
npm install
```

### 4.3 Configurar wrangler.toml

1. Copie `wrangler.toml.example` para `wrangler.toml`
2. Preencha os valores:

```toml
account_id = "SEU_ACCOUNT_ID_AQUI"
database_id = "SEU_DATABASE_ID_AQUI"
bucket_name = "seu-bucket-r2"
routes = [
  "seudominio.com/api/*",
  "api.seudominio.com/*"
]
```

### 4.4 Configurar Secrets no Cloudflare

```bash
# Configurar secrets
npx wrangler secret put STRIPE_SECRET_KEY
# Cole: sk_test_... ou sk_live_...

npx wrangler secret put STRIPE_WEBHOOK_SECRET
# Cole: whsec_...

npx wrangler secret put JWT_SECRET
# Cole: sua-chave-jwt-gerada

# Para produção
npx wrangler secret put STRIPE_SECRET_KEY --env production
npx wrangler secret put STRIPE_WEBHOOK_SECRET --env production
npx wrangler secret put JWT_SECRET --env production
```

### 4.5 Configurar Variáveis de Ambiente do Frontend

Criar arquivo `frontend/.env.local`:

```env
VITE_API_URL=https://api.seudominio.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... ou pk_live_...
VITE_APP_NAME=Seu E-commerce
VITE_APP_URL=https://seudominio.com
```

---

## 🗄️ Passo 5: Configurar Banco de Dados

### 5.1 Aplicar Migrações

```bash
# Gerar migrações (se necessário)
npx drizzle-kit generate

# Aplicar migrações no D1
npx wrangler d1 execute ecommerce_db --file=backend/migrations/0000_*.sql

# Ou aplicar todas as migrações de uma vez
npm run migrate
```

### 5.2 Criar Admin Inicial

```bash
# Via API (usando ADMIN_SEED_TOKEN do wrangler.toml)
curl -X POST https://api.seudominio.com/api/v1/admin/seed \
  -H "Authorization: Bearer seed-token-personalizado-2024" \
  -H "Content-Type: application/json"

# Ou criar manualmente via SQL
npx wrangler d1 execute ecommerce_db --command="
  INSERT INTO admin_users (id, email, password, role, active, created_at, updated_at)
  VALUES ('admin_1', 'admin@seudominio.com', 'hash-da-senha', 'admin', true, datetime('now'), datetime('now'))
"
```

**Nota**: Você precisará fazer hash da senha usando bcrypt. Use o endpoint de seed ou crie via código.

---

## 🚀 Passo 6: Deploy

### 6.1 Deploy do Backend

```bash
# Build e deploy
npm run build
npx wrangler deploy

# Ou apenas backend
npm run build:backend
npx wrangler deploy
```

### 6.2 Deploy do Frontend

```bash
# Build do frontend
npm run build:frontend

# Deploy no Cloudflare Pages
# 1. Acesse: https://dash.cloudflare.com/
# 2. Workers & Pages → Create application → Pages
# 3. Connect to Git (ou upload manual)
# 4. Configurar:
#    - Build command: npm run build:frontend
#    - Build output directory: dist/public
#    - Root directory: ./
```

### 6.3 Configurar GitHub Actions (Opcional)

1. Acesse: **GitHub** → **Settings** → **Secrets and variables** → **Actions**
2. Adicionar secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. O workflow `deploy.yml` vai executar automaticamente

---

## ✅ Passo 7: Verificação

### 7.1 Verificar Backend

```bash
# Health check
curl https://api.seudominio.com/api/health

# Debug config
curl https://api.seudominio.com/api/debug/config

# Deve retornar:
# {
#   "environment": "production",
#   "bindings": {
#     "hasDB": true,
#     "hasR2": true,
#     "hasStripeKey": true,
#     "hasStripeWebhookSecret": true,
#     "hasJWTSecret": true
#   }
# }
```

### 7.2 Verificar Frontend

1. Acesse: `https://seudominio.com`
2. Verifique se a página carrega
3. Verifique se a API está conectada (abrir DevTools → Network)

### 7.3 Verificar Stripe

1. Teste criar um produto no admin
2. Adicione ao carrinho
3. Tente fazer checkout (modo teste)
4. Verifique se o webhook recebe eventos no Stripe Dashboard

---

## 🐛 Troubleshooting

### Erro: "STRIPE_SECRET_KEY is missing"

**Solução**:
```bash
# Verificar se o secret está configurado
npx wrangler secret list

# Se não estiver, configurar:
npx wrangler secret put STRIPE_SECRET_KEY
```

### Erro: "Database not found"

**Solução**:
```bash
# Verificar se o database existe
npx wrangler d1 list

# Verificar database_id no wrangler.toml
# Aplicar migrações novamente
npm run migrate
```

### Erro: "R2 bucket not found"

**Solução**:
```bash
# Verificar se o bucket existe
npx wrangler r2 bucket list

# Verificar bucket_name no wrangler.toml
# Criar bucket se não existir
npx wrangler r2 bucket create seu-bucket-r2
```

### Erro: "Invalid CORS"

**Solução**:
1. Verificar `ALLOWED_ORIGINS` no `wrangler.toml`
2. Verificar se o domínio está na lista
3. Verificar se não há espaços extras

### Erro: "JWT Secret too short"

**Solução**:
- Gerar novo secret com pelo menos 32 caracteres
- Reconfigurar: `npx wrangler secret put JWT_SECRET`

---

## 📚 Próximos Passos

1. **Configurar Domínio**
   - Adicionar domínio no Cloudflare
   - Configurar DNS
   - Configurar SSL

2. **Configurar Email**
   - Configurar email de notificações
   - Configurar email de pedidos

3. **Configurar Analytics**
   - Google Analytics
   - Cloudflare Analytics

4. **Otimizações**
   - Configurar cache
   - Otimizar imagens
   - Configurar CDN

5. **Backup**
   - Configurar backup do D1
   - Configurar backup do R2
   - Documentar procedimentos

---

## 🎉 Pronto!

Seu e-commerce está configurado e pronto para uso!

**Lembre-se**:
- Mantenha os secrets seguros
- Faça backups regularmente
- Monitore os logs
- Atualize as dependências regularmente

---

**Última atualização**: 2024-11-08

