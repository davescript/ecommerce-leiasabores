# 🔍 Diagnóstico de Problemas no Checkout

## ⚠️ Erro: "Não foi possível processar o pagamento"

Este guia ajuda a diagnosticar e resolver problemas no checkout.

## 🔎 Passo 1: Verificar Console do Navegador

1. Abra o DevTools (F12 ou Cmd+Option+I)
2. Vá para a aba **Console**
3. Procure por mensagens que começam com:
   - `❌ Payment error:`
   - `[API Error]`
   - `[API Request]`

### O que procurar:

- **Erro 500**: Problema no servidor (Stripe não configurado ou erro interno)
- **Erro 400**: Dados inválidos enviados
- **Erro 503**: Serviço temporariamente indisponível
- **Network Error**: Problema de conexão com a API

## 🔎 Passo 2: Verificar Configuração do Stripe

### Testar endpoint de debug:

Acesse: `https://api.leiasabores.pt/api/debug/config`

**Resultado esperado:**
```json
{
  "environment": "production",
  "bindings": {
    "hasDB": true,
    "hasR2": true,
    "hasStripeKey": true,  // ← DEVE SER true
    "hasStripeWebhookSecret": true,
    "hasJWTSecret": true,
    "stripeKeyPreview": "sk_live_xxx..."  // ← DEVE MOSTRAR A CHAVE
  }
}
```

**Se `hasStripeKey: false`:**
```bash
# Configurar chave Stripe no Cloudflare
wrangler secret put STRIPE_SECRET_KEY --env production
# Digite a chave quando solicitado: sk_live_... ou sk_test_...
```

## 🔎 Passo 3: Verificar Logs do Cloudflare

1. Acesse: [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Vá para **Workers & Pages** → Seu Worker
3. Clique em **Logs**
4. Procure por mensagens de erro que começam com `❌`

### Logs importantes:

- `❌ STRIPE_SECRET_KEY is missing` → Chave não configurada
- `❌ Stripe API error` → Erro na API do Stripe
- `❌ Checkout error` → Erro geral no checkout

## 🔎 Passo 4: Verificar Deploy

### Verificar se as mudanças foram deployadas:

1. Acesse: `https://github.com/davescript/ecommerce-leiasabores/actions`
2. Verifique se o último workflow foi bem-sucedido
3. Se falhou, veja os logs do erro

### Fazer deploy manual (se necessário):

```bash
# Fazer commit das mudanças
git add .
git commit -m "Fix: Melhorias no checkout Stripe"
git push origin main

# Aguardar deploy automático (2-5 minutos)
# Ou fazer deploy manual:
npm run build
wrangler deploy --env production
```

## 🔎 Passo 5: Testar Checkout Localmente

### Em desenvolvimento local:

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend

# Acesse: http://localhost:5173/checkout
```

### Verificar variáveis de ambiente local:

Crie/edite `.env.local`:
```env
VITE_API_URL=http://localhost:8787/api
STRIPE_SECRET_KEY=sk_test_...  # Use chave de teste
```

## 🛠️ Soluções Comuns

### Problema: Erro 500 - "Erro de configuração no servidor de pagamento"

**Causa:** Chave Stripe não configurada ou inválida

**Solução:**
```bash
# Verificar se a chave está configurada
wrangler secret list --env production

# Se não estiver, configurar:
wrangler secret put STRIPE_SECRET_KEY --env production
```

### Problema: Erro 400 - "Dados de pagamento inválidos"

**Causa:** Dados do formulário inválidos

**Solução:**
- Verificar se o email é válido
- Verificar se todos os campos obrigatórios estão preenchidos
- Verificar se os produtos no carrinho são válidos

### Problema: Erro de rede/CORS

**Causa:** Problema de conexão ou CORS

**Solução:**
- Verificar se `https://api.leiasabores.pt` está acessível
- Verificar configuração de CORS no backend
- Verificar se não há bloqueadores de anúncios interferindo

### Problema: "Stripe session created but missing URL"

**Causa:** Stripe retornou sessão sem URL

**Solução:**
- Verificar logs do Stripe no dashboard
- Verificar se a conta Stripe está ativa
- Verificar se não há limites de taxa atingidos

## 📊 Informações para Suporte

Se o problema persistir, forneça:

1. **Console do navegador:**
   - Copie todas as mensagens de erro
   - Inclua o `debugId` se disponível

2. **Logs do Cloudflare:**
   - Últimas 50 linhas de logs do Worker

3. **Endpoint de debug:**
   - Resultado de `https://api.leiasabores.pt/api/debug/config`

4. **Informações do erro:**
   - Status HTTP (500, 400, etc.)
   - Mensagem de erro completa
   - Timestamp do erro

## ✅ Checklist de Verificação

- [ ] Chave Stripe configurada no Cloudflare (`hasStripeKey: true`)
- [ ] Deploy mais recente foi bem-sucedido
- [ ] Endpoint `/api/debug/config` retorna configuração correta
- [ ] Console do navegador não mostra erros de CORS
- [ ] Logs do Cloudflare não mostram erros críticos
- [ ] Conta Stripe está ativa e não tem limites atingidos

## 🔗 Links Úteis

- [Cloudflare Dashboard](https://dash.cloudflare.com)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [GitHub Actions](https://github.com/davescript/ecommerce-leiasabores/actions)
- [API Debug Endpoint](https://api.leiasabores.pt/api/debug/config)

