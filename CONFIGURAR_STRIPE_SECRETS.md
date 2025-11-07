# 🔐 Como Configurar Secrets do Stripe no Cloudflare Workers

## 📋 O que você precisa

1. **Conta Stripe** (gratuita para testes)
2. **Wrangler CLI** instalado
3. **Acesso ao Cloudflare** (já tem, pois o projeto está configurado)

---

## 🎯 Passo 1: Obter Chaves do Stripe

### 1.1. Acessar Stripe Dashboard

1. Vá para: **https://dashboard.stripe.com**
2. Faça login (ou crie uma conta gratuita)

### 1.2. Obter Secret Key

1. No menu lateral, clique em **"Developers"** → **"API keys"**
2. Você verá duas chaves:
   - **Publishable key** (começa com `pk_test_...` ou `pk_live_...`)
   - **Secret key** (começa com `sk_test_...` ou `sk_live_...`)

3. **Clique em "Reveal test key"** para ver a Secret Key
4. **Copie a Secret Key** (você vai precisar dela)

**⚠️ IMPORTANTE:**
- Use `sk_test_...` para testes (modo de desenvolvimento)
- Use `sk_live_...` para produção (pagamentos reais)

---

## 🎯 Passo 2: Criar Webhook no Stripe

### 2.1. Criar Endpoint do Webhook

1. No Stripe Dashboard, vá em **"Developers"** → **"Webhooks"**
2. Clique em **"Add endpoint"**
3. Preencha:
   - **Endpoint URL:** `https://api.leiasabores.pt/api/checkout/webhook`
     (ou `https://ecommerce-backend.SEU_SUBDOMINIO.workers.dev/api/checkout/webhook` se ainda não tiver domínio)
   - **Description:** "Leia Sabores - Checkout Webhook"
4. Clique em **"Add endpoint"**

### 2.2. Selecionar Eventos

Selecione os eventos que o webhook deve receber:
- ✅ `checkout.session.completed`
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`

### 2.3. Obter Webhook Secret

1. Após criar o webhook, clique nele
2. Na seção **"Signing secret"**, clique em **"Reveal"**
3. **Copie o secret** (começa com `whsec_...`)

---

## 🎯 Passo 3: Configurar Secrets no Cloudflare Workers

### 3.1. Instalar Wrangler (se ainda não tiver)

```bash
npm install -g wrangler
```

### 3.2. Fazer Login no Cloudflare

```bash
wrangler login
```

Isso vai abrir o navegador para você fazer login no Cloudflare.

### 3.3. Configurar STRIPE_SECRET_KEY

```bash
wrangler secret put STRIPE_SECRET_KEY
```

Quando pedir, cole sua Secret Key do Stripe (ex: `sk_test_51...`)

**Para produção:**
```bash
wrangler secret put STRIPE_SECRET_KEY --env production
```

### 3.4. Configurar STRIPE_WEBHOOK_SECRET

```bash
wrangler secret put STRIPE_WEBHOOK_SECRET
```

Quando pedir, cole o Webhook Secret (ex: `whsec_...`)

**Para produção:**
```bash
wrangler secret put STRIPE_WEBHOOK_SECRET --env production
```

---

## ✅ Verificar se Funcionou

### Opção 1: Via Terminal

```bash
# Ver secrets configurados (não mostra valores, só nomes)
wrangler secret list
```

Você deve ver:
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_WEBHOOK_SECRET`

### Opção 2: Testar Localmente

```bash
# Iniciar servidor local
npm run dev:backend

# Em outro terminal, testar
curl http://localhost:8787/api/health
```

Se funcionar, os secrets estão configurados corretamente!

---

## 🚨 Problemas Comuns

### Erro: "No account ID found"

**Solução:** O `wrangler.toml` já tem o `account_id` configurado. Se ainda der erro:

```bash
# Verificar account ID
wrangler whoami
```

### Erro: "Secret not found"

**Solução:** Verifique se digitou o nome corretamente:
- `STRIPE_SECRET_KEY` (não `STRIPE_SECRET` ou `STRIPE_KEY`)
- `STRIPE_WEBHOOK_SECRET` (não `STRIPE_WEBHOOK`)

### Erro: "Permission denied"

**Solução:** Verifique se está logado:
```bash
wrangler login
```

---

## 📝 Resumo Rápido

```bash
# 1. Login
wrangler login

# 2. Configurar Secret Key
wrangler secret put STRIPE_SECRET_KEY
# Cole: sk_test_51... (ou sk_live_...)

# 3. Configurar Webhook Secret
wrangler secret put STRIPE_WEBHOOK_SECRET
# Cole: whsec_...

# 4. Verificar
wrangler secret list
```

---

## 🎯 Próximos Passos

Depois de configurar os secrets:

1. ✅ **Testar localmente:**
   ```bash
   npm run dev:backend
   ```

2. ✅ **Fazer deploy:**
   ```bash
   wrangler deploy
   ```

3. ✅ **Verificar no GitHub Actions:**
   - Os secrets do GitHub (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) são diferentes
   - Eles são para o GitHub Actions fazer deploy
   - Os secrets do Stripe são para o Worker funcionar

---

## 💡 Dica

**Para desenvolvimento local**, você pode usar um arquivo `.dev.vars`:

```bash
# Criar arquivo .dev.vars na raiz do projeto
echo "STRIPE_SECRET_KEY=sk_test_..." > .dev.vars
echo "STRIPE_WEBHOOK_SECRET=whsec_..." >> .dev.vars
```

**⚠️ IMPORTANTE:** Adicione `.dev.vars` ao `.gitignore` para não commitar!

---

**Última atualização:** 6 de Novembro de 2025

