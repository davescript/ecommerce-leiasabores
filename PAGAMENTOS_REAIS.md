# 💳 Pagamentos Reais vs Teste - Guia Completo

## ⚠️ IMPORTANTE: Leia Antes de Fazer Pagamentos Reais

### 🔴 NÃO faça pagamentos reais se:

1. ❌ Você está usando chave de **TESTE** (`rk_test_...` ou `sk_test_...`)
2. ❌ O ambiente está configurado como `development`
3. ❌ Você não configurou webhook de produção
4. ❌ Você não testou completamente o fluxo de pagamento

---

## ✅ Quando é SEGURO fazer pagamentos reais:

### 1. Chave Stripe LIVE configurada

**Verificar qual chave está configurada:**

```bash
# Ver secrets no Cloudflare Workers
wrangler secret list
```

**Chaves de TESTE:**
- `rk_test_...` (restricted key de teste)
- `sk_test_...` (secret key de teste)
- ❌ **NÃO processam pagamentos reais**

**Chaves de PRODUÇÃO:**
- `rk_live_...` (restricted key de produção)
- `sk_live_...` (secret key de produção)
- ✅ **Processam pagamentos REAIS**

---

### 2. Ambiente configurado como produção

**Verificar em `wrangler.toml`:**

```toml
[env.production.vars]
ENVIRONMENT = "production"
```

**OU no Cloudflare Workers:**
- Variável `ENVIRONMENT` deve ser `production`

---

### 3. Webhook configurado para produção

**No Stripe Dashboard:**
1. Acesse: https://dashboard.stripe.com/webhooks
2. Configure webhook para: `https://api.leiasabores.pt/api/checkout/webhook`
3. Use chave **LIVE** (não teste)

---

## 🧪 Como Testar SEM Pagar Dinheiro Real

### Opção 1: Usar Cartões de Teste do Stripe

**Cartões de teste que funcionam:**

```
Número: 4242 4242 4242 4242
CVV: Qualquer 3 dígitos (ex: 123)
Data: Qualquer data futura (ex: 12/25)
Código Postal: Qualquer (ex: 12345)
```

**Outros cartões de teste:**
- `4000 0000 0000 0002` - Cartão recusado
- `4000 0000 0000 9995` - Fundos insuficientes
- `4000 0025 0000 3155` - Requer autenticação 3D Secure

**Mais cartões de teste:** https://stripe.com/docs/testing

---

### Opção 2: Usar Modo Teste do Stripe

1. Configure chave de **TESTE** (`rk_test_...`)
2. Use cartões de teste acima
3. **Nenhum dinheiro real será cobrado**

---

## 💰 Como Fazer Pagamentos REAIS (Produção)

### Passo 1: Obter Chave Stripe LIVE

1. Acesse: https://dashboard.stripe.com/apikeys
2. Certifique-se de estar em **"Live mode"** (não "Test mode")
3. Crie uma chave restrita LIVE com permissões:
   - Checkout Sessions: Gravação
   - Payment Intents: Gravação
4. **Copie a chave** (começa com `rk_live_...`)

---

### Passo 2: Configurar no Cloudflare Workers

```bash
# Configurar chave LIVE
wrangler secret put STRIPE_SECRET_KEY
# Cole: rk_live_... (sua chave LIVE)
```

---

### Passo 3: Configurar Ambiente de Produção

**Verificar `wrangler.toml`:**

```toml
[env.production.vars]
ENVIRONMENT = "production"
```

**OU configurar variável no Cloudflare:**

```bash
# Se necessário, configurar via wrangler
wrangler secret put ENVIRONMENT
# Valor: production
```

---

### Passo 4: Configurar Webhook LIVE

1. Stripe Dashboard → Webhooks
2. Adicionar endpoint: `https://api.leiasabores.pt/api/checkout/webhook`
3. Selecionar eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. **Copiar webhook secret** (começa com `whsec_...`)
5. Configurar no Cloudflare:

```bash
wrangler secret put STRIPE_WEBHOOK_SECRET
# Cole: whsec_... (webhook secret LIVE)
```

---

### Passo 5: Fazer Deploy

```bash
# Deploy para produção
wrangler deploy --env production
```

---

## 🔍 Como Verificar se Está em Modo LIVE

### Verificar no Código (temporário para debug):

```typescript
// Adicionar temporariamente em uma rota
console.log('Stripe Key Preview:', env.STRIPE_SECRET_KEY.substring(0, 10))
// Se começar com 'rk_live_' ou 'sk_live_' = PRODUÇÃO
// Se começar com 'rk_test_' ou 'sk_test_' = TESTE
```

### Verificar no Stripe Dashboard:

1. Acesse: https://dashboard.stripe.com/test/payments
2. Se aparecer "Test mode" no topo = MODO TESTE
3. Se não aparecer = MODO LIVE (produção)

---

## ⚠️ AVISOS IMPORTANTES

### 1. Taxas do Stripe

**Em produção, o Stripe cobra taxas:**
- Portugal: 1.4% + €0.25 por transação
- Essas taxas são deduzidas automaticamente

### 2. Reembolsos

- Você pode fazer reembolsos no Stripe Dashboard
- Reembolsos levam 5-10 dias úteis para aparecer no cartão

### 3. Teste Primeiro

**SEMPRE teste com:**
- ✅ Cartões de teste primeiro
- ✅ Valores pequenos (ex: €1)
- ✅ Verificar se webhook funciona
- ✅ Verificar se ordem é criada no banco

---

## 📋 Checklist Antes de Fazer Pagamentos Reais

- [ ] Chave Stripe LIVE configurada (`rk_live_...` ou `sk_live_...`)
- [ ] Ambiente configurado como `production`
- [ ] Webhook LIVE configurado e testado
- [ ] Testado com cartões de teste primeiro
- [ ] Verificado que ordens são criadas no banco
- [ ] Verificado que emails de confirmação funcionam
- [ ] Termos de serviço e política de privacidade atualizados
- [ ] Informações de contato configuradas

---

## 🚨 Se Fizer Pagamento Real por Engano

### Se usou cartão de teste:
- ✅ Não há problema, nenhum dinheiro foi cobrado

### Se usou cartão real em ambiente de teste:
- ⚠️ O pagamento pode não ser processado
- ⚠️ O dinheiro pode ficar "pendente"
- ✅ Entre em contato com o Stripe Support

### Se fez pagamento real em produção:
- ✅ Pagamento será processado normalmente
- ✅ Você receberá o dinheiro (menos taxas)
- ✅ Cliente receberá o produto

---

## 💡 Recomendação

**Para testar AGORA (sem risco):**

1. Use chave de **TESTE** (`rk_test_...`)
2. Use cartão de teste: `4242 4242 4242 4242`
3. Teste todo o fluxo
4. Verifique se tudo funciona

**Para produção (depois de testar):**

1. Configure chave **LIVE** (`rk_live_...`)
2. Configure webhook LIVE
3. Faça deploy para produção
4. Teste com valor pequeno primeiro
5. Depois, libere para clientes reais

---

**Última atualização:** 7 de Novembro de 2025

