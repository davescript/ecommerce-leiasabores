# ✅ Verificação de Deploy no GitHub

## 🔍 Status da Configuração

### ✅ Correções Aplicadas

1. ✅ **Nome do projeto corrigido:**
   - `deploy.yml`: `leiasabores-frontend` → `ecommerce-leiasabores`
   - `ci.yml`: `leiasabores-frontend` → `ecommerce-leiasabores`

2. ✅ **Workflows configurados:**
   - `.github/workflows/deploy.yml` - Deploy simples e direto
   - `.github/workflows/ci.yml` - CI/CD completo com testes

---

## ⚠️ Secrets Necessários no GitHub

Para que o deploy funcione, você **DEVE** configurar estes secrets no GitHub:

### 1. CLOUDFLARE_API_TOKEN

**Como obter:**
1. Acesse: https://dash.cloudflare.com/profile/api-tokens
2. Clique em **"Create Token"**
3. Use o template **"Edit Cloudflare Workers"** ou crie custom com:
   - **Account** → **Cloudflare Workers** → **Edit**
   - **Account** → **Cloudflare Pages** → **Edit**
   - **Account** → **D1** → **Edit** (se usar D1)
   - **Account** → **R2** → **Edit** (se usar R2)
   - **Zone** → **Zone** → **Read** (opcional, para DNS)
4. Copie o token gerado

**Como adicionar no GitHub:**
1. Vá para: https://github.com/davescript/ecommerce-leiasabores/settings/secrets/actions
2. Clique em **"New repository secret"**
3. Name: `CLOUDFLARE_API_TOKEN`
4. Value: Cole o token
5. Clique em **"Add secret"**

### 2. CLOUDFLARE_ACCOUNT_ID

**Valor:** `55b0027975cda6f67a48ea231d2cef8d`

**Como adicionar no GitHub:**
1. Vá para: https://github.com/davescript/ecommerce-leiasabores/settings/secrets/actions
2. Clique em **"New repository secret"**
3. Name: `CLOUDFLARE_ACCOUNT_ID`
4. Value: `55b0027975cda6f67a48ea231d2cef8d`
5. Clique em **"Add secret"**

---

## 📋 Workflows Configurados

### 1. `.github/workflows/deploy.yml`

**Quando executa:**
- Push para `main`
- Pull Request para `main`

**O que faz:**
1. ✅ Valida (lint + type-check)
2. ✅ Build (frontend + backend)
3. ✅ Deploy Worker (se push para main)
4. ✅ Deploy Pages (se push para main)

**Dependências:**
- `CLOUDFLARE_API_TOKEN` ✅
- `CLOUDFLARE_ACCOUNT_ID` ✅

### 2. `.github/workflows/ci.yml`

**Quando executa:**
- Push para `main`, `master`, `develop`
- Pull Request para `main`, `master`, `develop`

**O que faz:**
1. ✅ Lint & Format Check
2. ✅ TypeScript Type Check
3. ✅ Unit Tests
4. ✅ E2E Tests (Playwright)
5. ✅ Build Frontend
6. ✅ Build Backend
7. ✅ Deploy Frontend (se push para main/master)
8. ✅ Deploy Backend (se push para main/master)

**Dependências:**
- `CLOUDFLARE_API_TOKEN` ✅
- `CLOUDFLARE_ACCOUNT_ID` ✅
- `PLAYWRIGHT_TEST_BASE_URL` (opcional)
- `STRIPE_SECRET_KEY_TEST` (opcional, para testes)
- `STRIPE_WEBHOOK_SECRET_TEST` (opcional, para testes)

---

## 🔍 Como Verificar se Está Funcionando

### 1. Verificar Secrets Configurados

**No GitHub:**
1. Acesse: https://github.com/davescript/ecommerce-leiasabores/settings/secrets/actions
2. Verifique se existem:
   - ✅ `CLOUDFLARE_API_TOKEN`
   - ✅ `CLOUDFLARE_ACCOUNT_ID`

### 2. Verificar Workflows Executando

**No GitHub:**
1. Acesse: https://github.com/davescript/ecommerce-leiasabores/actions
2. Veja se há workflows rodando ou que falharam
3. Clique em um workflow para ver os logs

### 3. Testar Localmente

```bash
# Verificar se o build funciona
npm run build

# Verificar lint
npm run lint

# Verificar type-check
npm run type-check
```

---

## 🚨 Problemas Comuns

### Problema: "CLOUDFLARE_API_TOKEN not found"

**Causa:** Secret não configurado no GitHub

**Solução:**
1. Configure o secret conforme instruções acima
2. Faça um novo push para `main` para disparar o workflow

### Problema: "Project not found: leiasabores-frontend"

**Causa:** Nome do projeto incorreto (já corrigido)

**Solução:** ✅ Já corrigido - nome agora é `ecommerce-leiasabores`

### Problema: "Workflow não executa"

**Causas possíveis:**
1. Secrets não configurados
2. Branch não é `main`
3. Workflow desabilitado

**Solução:**
1. Verifique se os secrets estão configurados
2. Verifique se está na branch `main`
3. Verifique se o workflow está habilitado em Settings → Actions → General

### Problema: "Tests failed"

**Causa:** Testes falhando no CI

**Solução:**
1. Execute localmente: `npm run test:unit`
2. Corrija os testes que estão falhando
3. Ou ajuste o workflow para não bloquear deploy se testes falharem

---

## ✅ Checklist Final

### Configuração GitHub
- [ ] `CLOUDFLARE_API_TOKEN` configurado
- [ ] `CLOUDFLARE_ACCOUNT_ID` configurado
- [ ] Workflows habilitados (Settings → Actions → General)

### Workflows
- [x] `deploy.yml` corrigido (nome do projeto)
- [x] `ci.yml` corrigido (nome do projeto)
- [ ] Testar push para `main` e verificar deploy

### Verificação
- [ ] Workflow executou com sucesso
- [ ] Frontend deployado no Cloudflare Pages
- [ ] Backend deployado no Cloudflare Workers
- [ ] Site acessível após deploy

---

## 🔗 Links Úteis

- **GitHub Actions:** https://github.com/davescript/ecommerce-leiasabores/actions
- **GitHub Secrets:** https://github.com/davescript/ecommerce-leiasabores/settings/secrets/actions
- **Cloudflare API Tokens:** https://dash.cloudflare.com/profile/api-tokens
- **Cloudflare Pages:** https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/pages/view/ecommerce-leiasabores
- **Cloudflare Workers:** https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/workers

---

## 📝 Próximos Passos

1. **Configurar Secrets no GitHub** (OBRIGATÓRIO)
   - Siga as instruções acima para adicionar `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`

2. **Fazer um Push de Teste**
   ```bash
   git add .
   git commit -m "test: verificar deploy automático"
   git push origin main
   ```

3. **Verificar o Deploy**
   - Acesse: https://github.com/davescript/ecommerce-leiasabores/actions
   - Veja se o workflow executou com sucesso
   - Verifique se o site foi atualizado

---

**Última atualização:** 2025-11-07

