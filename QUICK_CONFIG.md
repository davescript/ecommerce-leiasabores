# ⚡ Configuração Rápida - 5 Minutos

## 🎯 Resumo Ultra Simples

### O que fazer:

1. **Obter chaves do Stripe** (2 minutos)
   - Acesse: https://dashboard.stripe.com → Developers → API keys
   - Copie: `pk_test_...` e `sk_test_...`

2. **Configurar no Cloudflare** (2 minutos)
   ```bash
   # Backend (Workers)
   wrangler login
   wrangler secret put STRIPE_SECRET_KEY
   # Cole: sk_test_...
   
   # Frontend (Pages) - Via Dashboard
   # Cloudflare Pages → Settings → Environment variables
   # Adicionar: VITE_STRIPE_PUBLISHABLE_KEY = pk_test_...
   ```

3. **Criar Webhook** (1 minuto)
   - Stripe Dashboard → Webhooks → Add endpoint
   - URL: `https://api.leiasabores.pt/api/checkout/webhook`
   - Eventos: `payment_intent.succeeded`, `checkout.session.completed`
   - Copiar secret e configurar:
   ```bash
   wrangler secret put STRIPE_WEBHOOK_SECRET
   ```

**Pronto!** 🎉

---

## 🚀 Scripts Automáticos

### Verificar configuração:
```bash
./verificar-config.sh
```

### Configurar secrets:
```bash
./config-secrets.sh
```

---

## 📚 Documentação Completa

Veja `CONFIGURACAO_SIMPLES.md` para guia detalhado.

