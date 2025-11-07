# 🔍 Verificação de Deploy - GitHub Actions

## ✅ Status Atual

**Lint:** ✅ Passando sem erros  
**Type Check:** ⚠️ Precisa verificar  
**Build:** ⚠️ Precisa verificar  
**Deploy:** ⚠️ Pode ter problemas

---

## ⚠️ Problemas Potenciais Identificados

### 1. **Deploy do Backend - Working Directory**

**Problema:** O workflow usa `workingDirectory: backend`, mas o `wrangler.toml` está na raiz.

**Localização:** `.github/workflows/ci.yml` linha 258

**Solução:** Remover `workingDirectory` ou mover `wrangler.toml` para `backend/`

```yaml
# ❌ ATUAL (pode falhar)
- name: Deploy to Cloudflare Workers
  uses: cloudflare/wrangler-action@v3
  with:
    workingDirectory: backend  # ← PROBLEMA: wrangler.toml está na raiz

# ✅ CORRETO
- name: Deploy to Cloudflare Workers
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    command: deploy
    # Remover workingDirectory
```

### 2. **Build do Backend - Output Path**

**Problema:** O build gera `dist/backend/index.js`, mas o wrangler espera `backend/src/index.ts` ou o build compilado.

**Verificar:** O `wrangler.toml` aponta para `main = "backend/src/index.ts"`, mas em produção precisa do build.

**Solução:** Atualizar `wrangler.toml` para usar o build em produção OU ajustar o build.

### 3. **Secrets do GitHub Actions**

**Requisitos:**
- ✅ `CLOUDFLARE_API_TOKEN` - Necessário
- ✅ `CLOUDFLARE_ACCOUNT_ID` - Necessário
- ⚠️ `STRIPE_SECRET_KEY_TEST` - Opcional (só para testes)
- ⚠️ `STRIPE_WEBHOOK_SECRET_TEST` - Opcional (só para testes)

**Ação:** Verificar se os secrets estão configurados no GitHub:
1. Vá em **Settings** → **Secrets and variables** → **Actions**
2. Verifique se existem:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

### 4. **Deploy do Frontend - Diretório**

**Status:** ✅ Parece correto
- Build gera em `frontend/dist/`
- Deploy usa `directory: frontend/dist`

### 5. **Variáveis de Ambiente do Frontend**

**Problema:** O frontend precisa de `VITE_STRIPE_PUBLISHABLE_KEY` no Cloudflare Pages.

**Solução:** Configurar no Cloudflare Pages Dashboard:
1. **Pages** → **leiasabores** → **Settings** → **Environment variables**
2. Adicionar `VITE_STRIPE_PUBLISHABLE_KEY`

---

## 🔧 Correções Necessárias

### Correção 1: Ajustar Deploy do Backend

```yaml
deploy-backend:
  name: Deploy Backend (Cloudflare Workers)
  runs-on: ubuntu-latest
  needs: [lint-and-format, type-check, unit-tests, build-backend]
  if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Download backend build
      uses: actions/download-artifact@v3
      with:
        name: backend-build
        path: dist/backend/

    - name: Deploy to Cloudflare Workers
      uses: cloudflare/wrangler-action@v3
      with:
        apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        command: deploy
        # Remover workingDirectory: backend
```

### Correção 2: Verificar Build do Backend

O `wrangler.toml` aponta para `main = "backend/src/index.ts"`, mas em produção o Wrangler precisa do build ou do source.

**Opções:**
1. **Opção A:** Deixar Wrangler fazer o build (recomendado)
   - Manter `main = "backend/src/index.ts"`
   - Wrangler fará o build automaticamente

2. **Opção B:** Usar build pré-compilado
   - Atualizar `wrangler.toml` para `main = "dist/backend/index.js"`
   - Garantir que o build está no lugar certo

---

## ✅ Checklist Antes do Deploy

- [ ] Secrets configurados no GitHub:
  - [ ] `CLOUDFLARE_API_TOKEN`
  - [ ] `CLOUDFLARE_ACCOUNT_ID`
- [ ] Variáveis no Cloudflare Pages:
  - [ ] `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] Secrets no Cloudflare Workers (via `wrangler secret put`):
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `wrangler.toml` configurado corretamente
- [ ] Build do backend funcionando localmente
- [ ] Build do frontend funcionando localmente

---

## 🧪 Testar Localmente Antes do Deploy

```bash
# 1. Testar build do frontend
npm run build:frontend
# Verificar se gera frontend/dist/

# 2. Testar build do backend
npm run build:backend
# Verificar se gera dist/backend/index.js

# 3. Testar deploy local do backend
wrangler deploy --dry-run

# 4. Verificar lint
npm run lint

# 5. Verificar type check
npm run type-check
```

---

## 📊 Probabilidade de Erro

**Alta probabilidade de erro:**
- ⚠️ Deploy do backend (workingDirectory incorreto)

**Média probabilidade:**
- ⚠️ Secrets não configurados
- ⚠️ Variáveis de ambiente do frontend

**Baixa probabilidade:**
- ✅ Deploy do frontend (configuração parece correta)
- ✅ Build do frontend (deve funcionar)

---

## 🎯 Ação Recomendada

**ANTES de fazer push para main/master:**

1. ✅ Corrigir `workingDirectory` no workflow
2. ✅ Verificar se secrets estão configurados
3. ✅ Testar builds localmente
4. ✅ Configurar variáveis no Cloudflare Pages

**Depois do push:**
- Monitorar o workflow no GitHub Actions
- Verificar logs se houver erro
- Ajustar conforme necessário

