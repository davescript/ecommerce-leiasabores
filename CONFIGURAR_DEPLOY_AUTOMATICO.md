# 🚀 Configurar Deploy Automático no GitHub

## ✅ Status Atual

O projeto **já tem deploy automático configurado** via GitHub Actions!

O workflow está em: `.github/workflows/ci.yml`

---

## 📋 O que acontece automaticamente

### Quando você faz `git push` para `main` ou `master`:

1. ✅ **Lint & Format Check** - Verifica código
2. ✅ **Type Check** - Verifica TypeScript
3. ✅ **Unit Tests** - Roda testes unitários
4. ✅ **E2E Tests** - Roda testes end-to-end
5. ✅ **Build Frontend** - Compila o frontend
6. ✅ **Build Backend** - Compila o backend
7. ✅ **Deploy Frontend** → Cloudflare Pages
8. ✅ **Deploy Backend** → Cloudflare Workers

**Tudo automático!** 🎉

---

## 🔐 Secrets Necessários no GitHub

Para o deploy funcionar, você precisa configurar estes secrets no GitHub:

### 1. Acessar Configuração de Secrets

1. Vá para seu repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** → **Actions**
4. Clique em **New repository secret**

### 2. Secrets Obrigatórios

#### ✅ `CLOUDFLARE_API_TOKEN`

**O que é:** Token de API do Cloudflare para fazer deploy

**Como obter:**
1. Acesse: https://dash.cloudflare.com/profile/api-tokens
2. Clique em **Create Token**
3. Use o template **"Edit Cloudflare Workers"**
4. Configure:
   - **Permissions:** Workers Scripts:Edit, Account:Cloudflare Workers:Read
   - **Account Resources:** Selecione sua conta
5. Clique em **Continue to summary** → **Create Token**
6. **Copie o token** (só aparece uma vez!)

**No GitHub:**
- Nome: `CLOUDFLARE_API_TOKEN`
- Valor: Cole o token copiado

---

#### ✅ `CLOUDFLARE_ACCOUNT_ID`

**O que é:** ID da sua conta Cloudflare

**Como obter:**
1. Acesse: https://dash.cloudflare.com/
2. No menu lateral direito, você verá **Account ID**
3. **Copie o ID** (ex: `55b0027975cda6f67a48ea231d2cef8d`)

**No GitHub:**
- Nome: `CLOUDFLARE_ACCOUNT_ID`
- Valor: Cole o Account ID

**Nota:** O Account ID já está no `wrangler.toml`, mas precisa estar no GitHub também.

---

### 3. Secrets Opcionais (para testes)

#### `STRIPE_SECRET_KEY_TEST` (Opcional)
- Chave de teste do Stripe para rodar testes no CI
- Formato: `sk_test_...`

#### `STRIPE_WEBHOOK_SECRET_TEST` (Opcional)
- Webhook secret de teste do Stripe
- Formato: `whsec_...`

#### `PLAYWRIGHT_TEST_BASE_URL` (Opcional)
- URL base para testes E2E
- Padrão: `http://localhost:5173`

---

## 📝 Checklist de Configuração

### No GitHub:

- [ ] Acessar Settings → Secrets and variables → Actions
- [ ] Criar secret `CLOUDFLARE_API_TOKEN`
- [ ] Criar secret `CLOUDFLARE_ACCOUNT_ID`
- [ ] (Opcional) Criar `STRIPE_SECRET_KEY_TEST`
- [ ] (Opcional) Criar `STRIPE_WEBHOOK_SECRET_TEST`

### Verificar:

- [ ] Workflow está em `.github/workflows/ci.yml`
- [ ] Branch principal é `main` ou `master`
- [ ] `wrangler.toml` está configurado corretamente

---

## 🧪 Testar Deploy Automático

### 1. Fazer uma mudança pequena

```bash
# Criar uma branch
git checkout -b test-deploy

# Fazer uma mudança (ex: adicionar comentário)
echo "# Test deploy" >> README.md

# Commit e push
git add README.md
git commit -m "test: testar deploy automático"
git push origin test-deploy
```

### 2. Criar Pull Request

1. Vá para o GitHub
2. Crie um Pull Request de `test-deploy` para `main`
3. Veja os workflows rodando em **Actions**

### 3. Fazer Merge

1. Quando todos os testes passarem, faça merge
2. O deploy automático vai rodar quando o PR for mergeado em `main`

---

## 🔍 Verificar Deploy

### No GitHub Actions:

1. Vá para **Actions** no seu repositório
2. Veja o workflow rodando
3. Clique no workflow para ver detalhes

### Verificar se Deployou:

**Frontend:**
```bash
curl https://leiasabores.pt
# ou
curl https://leiasabores.pages.dev
```

**Backend:**
```bash
curl https://api.leiasabores.pt/api/health
```

---

## 🚨 Problemas Comuns

### Erro: "CLOUDFLARE_API_TOKEN not found"

**Solução:** Configure o secret `CLOUDFLARE_API_TOKEN` no GitHub

### Erro: "CLOUDFLARE_ACCOUNT_ID not found"

**Solução:** Configure o secret `CLOUDFLARE_ACCOUNT_ID` no GitHub

### Erro: "Permission denied"

**Solução:** Verifique se o `CLOUDFLARE_API_TOKEN` tem permissões corretas:
- Workers Scripts:Edit
- Account:Cloudflare Workers:Read

### Deploy não roda automaticamente

**Verifique:**
- ✅ Está fazendo push para `main` ou `master`?
- ✅ O workflow está em `.github/workflows/ci.yml`?
- ✅ Os secrets estão configurados?

---

## 📊 Fluxo Completo

```
┌─────────────────────────────────────┐
│  git push origin main               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  GitHub Actions Trigger              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  1. Lint & Format ✅                 │
│  2. Type Check ✅                    │
│  3. Unit Tests ✅                    │
│  4. E2E Tests ✅                     │
│  5. Build Frontend ✅               │
│  6. Build Backend ✅                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Deploy Frontend → Cloudflare Pages │
│  Deploy Backend → Cloudflare Workers│
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  ✅ Site atualizado automaticamente! │
└─────────────────────────────────────┘
```

---

## 💡 Dicas

1. **Sempre teste localmente antes de fazer push**
   ```bash
   npm run lint
   npm run type-check
   npm run test:unit
   ```

2. **Veja os logs do deploy no GitHub Actions**
   - Vá em **Actions** → Clique no workflow → Veja os logs

3. **Se algo der errado, o deploy não acontece**
   - Os testes devem passar primeiro
   - Isso protege contra bugs em produção

4. **Deploy só acontece em `main` ou `master`**
   - Pull Requests apenas rodam testes
   - Deploy só quando mergeado

---

## ✅ Resumo Rápido

1. **Configure secrets no GitHub:**
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

2. **Faça push para `main`:**
   ```bash
   git push origin main
   ```

3. **Veja o deploy automático em Actions**

4. **Pronto!** 🎉

---

**Última atualização:** 7 de Novembro de 2025

