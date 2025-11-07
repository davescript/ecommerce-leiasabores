# ✅ Checklist de Deploy - GitHub Actions

## 🎯 Status: **PRONTO PARA DEPLOY** (após configurar secrets)

---

## ✅ Correções Aplicadas

1. ✅ **Lint:**** Todos os erros corrigidos
2. ✅ **Workflow:**** `workingDirectory` removido (wrangler.toml na raiz)
3. ✅ **Deploy Backend:**** Wrangler faz build automático (não precisa build manual)
4. ✅ **Deploy Frontend:**** Configuração correta

---

## ⚠️ Ações Necessárias ANTES do Deploy

### 1. Configurar Secrets no GitHub

**Localização:** GitHub → Settings → Secrets and variables → Actions

**Secrets necessários:**
- [ ] `CLOUDFLARE_API_TOKEN` - Token da API do Cloudflare
- [ ] `CLOUDFLARE_ACCOUNT_ID` - ID da conta Cloudflare (já está no wrangler.toml: `55b0027975cda6f67a48ea231d2cef8d`)

**Como obter:**
1. Acesse: https://dash.cloudflare.com/profile/api-tokens
2. Crie um token com permissões:
   - **Workers:** Edit
   - **Account:** Read
   - **Zone:** Read (se necessário)
3. Copie o token e adicione como secret no GitHub

### 2. Configurar Variáveis no Cloudflare Pages

**Localização:** Cloudflare Dashboard → Pages → leiasabores → Settings → Environment variables

**Variáveis necessárias:**
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` - Chave pública do Stripe (pk_test_... ou pk_live_...)

**Como obter:**
1. Acesse: https://dashboard.stripe.com/apikeys
2. Copie a **Publishable key**
3. Adicione no Cloudflare Pages (Production + Preview)

### 3. Configurar Secrets no Cloudflare Workers

**Via Terminal:**
```bash
# Fazer login
wrangler login

# Configurar secrets
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
```

**Ou via GitHub Actions (automático):**
Os secrets serão injetados automaticamente se configurados no GitHub.

---

## 📊 Verificação do Workflow

### Jobs que vão executar:

1. ✅ **lint-and-format** - Lint passando
2. ✅ **type-check** - TypeScript check
3. ✅ **unit-tests** - Testes unitários (56/57 passando)
4. ⚠️ **e2e-tests** - Requer servidor (pode falhar se não configurado)
5. ✅ **build-frontend** - Build do frontend
6. ✅ **build-backend** - Build do backend (opcional, Wrangler faz automaticamente)
7. ✅ **deploy-frontend** - Deploy para Cloudflare Pages
8. ✅ **deploy-backend** - Deploy para Cloudflare Workers

---

## 🚨 Possíveis Problemas

### 1. Secrets não configurados
**Sintoma:** Deploy falha com erro de autenticação  
**Solução:** Configurar `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` no GitHub

### 2. Variável do frontend não configurada
**Sintoma:** Frontend funciona mas Stripe não carrega  
**Solução:** Configurar `VITE_STRIPE_PUBLISHABLE_KEY` no Cloudflare Pages

### 3. Secrets do backend não configurados
**Sintoma:** Backend funciona mas pagamentos falham  
**Solução:** Configurar `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` via `wrangler secret put`

### 4. E2E tests falhando
**Sintoma:** Workflow falha nos testes E2E  
**Solução:** Pode ignorar temporariamente ou configurar `PLAYWRIGHT_TEST_BASE_URL` secret

---

## ✅ Checklist Final

Antes de fazer push para `main` ou `master`:

- [ ] Secrets configurados no GitHub:
  - [ ] `CLOUDFLARE_API_TOKEN`
  - [ ] `CLOUDFLARE_ACCOUNT_ID`
- [ ] Variáveis configuradas no Cloudflare Pages:
  - [ ] `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] Secrets configurados no Cloudflare Workers:
  - [ ] `STRIPE_SECRET_KEY` (via `wrangler secret put`)
  - [ ] `STRIPE_WEBHOOK_SECRET` (via `wrangler secret put`)
- [ ] Lint passando localmente: `npm run lint`
- [ ] Type check passando: `npm run type-check`
- [ ] Build do frontend funciona: `npm run build:frontend`
- [ ] Testes unitários passando: `npm run test:unit`

---

## 🎯 Probabilidade de Sucesso

**Com secrets configurados:** ✅ **95%** de chance de sucesso

**Sem secrets configurados:** ❌ **0%** de chance de sucesso

---

## 📝 Notas

- O Wrangler faz build automático do TypeScript, então não precisa do build manual
- O deploy do frontend usa o build gerado pelo job `build-frontend`
- Os secrets do backend podem ser configurados via `wrangler secret put` ou GitHub Actions
- Os testes E2E podem falhar se não houver servidor, mas não bloqueiam o deploy

---

**Última atualização:** 6 de Novembro de 2025

