# 🔧 Configuração Simples - Passo a Passo

## 📝 O que precisa configurar?

Apenas **3 coisas**:
1. Chave pública do Stripe (frontend)
2. Chave secreta do Stripe (backend)
3. Webhook secret do Stripe (backend)

---

## 🎯 Passo 1: Obter Chaves do Stripe

### 1.1. Acessar Stripe Dashboard
1. Vá para: https://dashboard.stripe.com
2. Faça login na sua conta

### 1.2. Obter Chaves
1. No menu lateral, clique em **"Developers"** → **"API keys"**
2. Você verá duas chaves:
   - **Publishable key** (começa com `pk_test_` ou `pk_live_`)
   - **Secret key** (começa com `sk_test_` ou `sk_live_`)

**Copie essas chaves!** Você vai precisar delas.

---

## 🎯 Passo 2: Configurar Frontend (Cloudflare Pages)

### Opção A: Via Dashboard Cloudflare (Mais Fácil)

1. Acesse: https://dash.cloudflare.com
2. Vá em **Pages** → Seu projeto
3. Clique em **Settings** → **Environment variables**
4. Adicione:
   ```
   Nome: VITE_STRIPE_PUBLISHABLE_KEY
   Valor: pk_test_... (sua chave pública)
   ```
5. Selecione **Production** e **Preview**
6. Clique em **Save**

### Opção B: Via Wrangler (Terminal)

```bash
# Não funciona para Pages, apenas para Workers
# Use a Opção A acima
```

---

## 🎯 Passo 3: Configurar Backend (Cloudflare Workers)

### Via Terminal (Mais Fácil)

```bash
# 1. Fazer login no Cloudflare
wrangler login

# 2. Configurar Secret Key do Stripe
wrangler secret put STRIPE_SECRET_KEY

# Quando pedir, cole sua chave secreta (sk_test_... ou sk_live_...)

# 3. Configurar Webhook Secret (depois de criar webhook)
wrangler secret put STRIPE_WEBHOOK_SECRET

# Quando pedir, cole o webhook secret (whsec_...)
```

**Pronto!** Os secrets estão configurados.

---

## 🎯 Passo 4: Configurar Webhook no Stripe

### 4.1. Criar Webhook

1. No Stripe Dashboard, vá em **Developers** → **Webhooks**
2. Clique em **"Add endpoint"**
3. URL do endpoint:
   ```
   https://api.leiasabores.pt/api/checkout/webhook
   ```
   (ou seu domínio de produção)
4. Selecione eventos:
   - ✅ `payment_intent.succeeded`
   - ✅ `checkout.session.completed`
5. Clique em **"Add endpoint"**

### 4.2. Copiar Webhook Secret

1. Após criar, clique no webhook
2. Na seção **"Signing secret"**, clique em **"Reveal"**
3. Copie o secret (começa com `whsec_`)
4. Configure no Cloudflare (Passo 3 acima)

---

## ✅ Verificar se está funcionando

### Teste Rápido

```bash
# 1. Iniciar servidor local
wrangler dev --port 8787

# 2. Em outro terminal, testar
./test-simple.sh
```

Se aparecer ✅, está funcionando!

---

## 🆘 Problemas Comuns

### "STRIPE_SECRET_KEY não configurada"
- ✅ Execute: `wrangler secret put STRIPE_SECRET_KEY`

### "VITE_STRIPE_PUBLISHABLE_KEY não configurada"
- ✅ Configure no Cloudflare Pages → Settings → Environment variables

### "Webhook não funciona"
- ✅ Verifique se a URL está correta
- ✅ Verifique se os eventos estão selecionados
- ✅ Verifique se o secret está configurado

---

## 📋 Checklist Final

- [ ] Chave pública do Stripe configurada no Cloudflare Pages
- [ ] Chave secreta do Stripe configurada no Cloudflare Workers
- [ ] Webhook criado no Stripe Dashboard
- [ ] Webhook secret configurado no Cloudflare Workers
- [ ] Testes passando

---

## 🎉 Pronto!

Agora seu sistema de pagamentos está configurado!

