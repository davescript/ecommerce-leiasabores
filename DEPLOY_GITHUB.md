# 🚀 Guia de Deploy para GitHub

## 📋 Pré-requisitos

1. ✅ Repositório GitHub configurado
2. ✅ Secrets configurados no GitHub:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. ✅ Workflows configurados (`.github/workflows/deploy.yml` e `.github/workflows/ci.yml`)

## 🔧 Configurar Secrets no GitHub

### 1. CLOUDFLARE_API_TOKEN

**Como obter:**
1. Acesse: https://dash.cloudflare.com/profile/api-tokens
2. Clique em **"Create Token"**
3. Use o template **"Edit Cloudflare Workers"** ou crie custom com:
   - **Account** → **Cloudflare Workers** → **Edit**
   - **Account** → **Cloudflare Pages** → **Edit**
   - **Account** → **D1** → **Edit**
   - **Account** → **R2** → **Edit**
4. Copie o token gerado

**Como adicionar no GitHub:**
1. Vá para: `https://github.com/SEU_USUARIO/SEU_REPOSITORIO/settings/secrets/actions`
2. Clique em **"New repository secret"**
3. Name: `CLOUDFLARE_API_TOKEN`
4. Value: Cole o token
5. Clique em **"Add secret"**

### 2. CLOUDFLARE_ACCOUNT_ID

**Valor:** `55b0027975cda6f67a48ea231d2cef8d`

**Como adicionar no GitHub:**
1. Vá para: `https://github.com/SEU_USUARIO/SEU_REPOSITORIO/settings/secrets/actions`
2. Clique em **"New repository secret"**
3. Name: `CLOUDFLARE_ACCOUNT_ID`
4. Value: `55b0027975cda6f67a48ea231d2cef8d`
5. Clique em **"Add secret"**

## 📦 Processo de Deploy

### 1. Adicionar arquivos ao Git

```bash
# Adicionar todos os arquivos modificados e novos
git add .

# Ou adicionar arquivos específicos
git add backend/
git add frontend/
git add .github/
git add wrangler.toml
git add package.json
```

### 2. Fazer Commit

```bash
git commit -m "feat: Implementação completa do Admin Panel com auditoria e correções"
```

### 3. Fazer Push para GitHub

```bash
# Push para branch main
git push origin main
```

### 4. Verificar Deploy

Após o push, o GitHub Actions irá:
1. ✅ Validar código (lint + type-check)
2. ✅ Rodar testes
3. ✅ Build do frontend e backend
4. ✅ Deploy para Cloudflare Workers
5. ✅ Deploy para Cloudflare Pages

**Verificar status:**
- Acesse: `https://github.com/SEU_USUARIO/SEU_REPOSITORIO/actions`
- Veja o status dos workflows

## 🔄 Workflows Configurados

### 1. `.github/workflows/deploy.yml`
- **Trigger:** Push para `main`
- **Jobs:**
  - Validate (lint + type-check)
  - Build (frontend + backend)
  - Deploy (Workers + Pages)

### 2. `.github/workflows/ci.yml`
- **Trigger:** Push para `main`, `master`, `develop` ou Pull Request
- **Jobs:**
  - Lint & Format
  - Type Check
  - Unit Tests
  - E2E Tests
  - Build Frontend
  - Build Backend
  - Deploy Frontend (apenas em `main`)
  - Deploy Backend (apenas em `main`)

## ✅ Checklist Antes do Deploy

- [ ] Secrets configurados no GitHub
- [ ] Código testado localmente
- [ ] Build funcionando (`npm run build`)
- [ ] Type-check passando (`npm run type-check`)
- [ ] Lint passando (`npm run lint`)
- [ ] Migrations aplicadas
- [ ] Admin user criado (seed)
- [ ] Configurações do `wrangler.toml` corretas

## 🐛 Troubleshooting

### Erro: "CLOUDFLARE_API_TOKEN not found"
- Verifique se o secret foi configurado no GitHub
- Verifique se o nome do secret está correto: `CLOUDFLARE_API_TOKEN`

### Erro: "CLOUDFLARE_ACCOUNT_ID not found"
- Verifique se o secret foi configurado no GitHub
- Verifique se o nome do secret está correto: `CLOUDFLARE_ACCOUNT_ID`

### Erro: "Deploy failed"
- Verifique os logs do GitHub Actions
- Verifique se o `wrangler.toml` está correto
- Verifique se as migrations foram aplicadas

### Erro: "Build failed"
- Verifique se todas as dependências estão instaladas
- Verifique se o TypeScript está compilando corretamente
- Verifique se há erros de lint

## 📚 Recursos

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)

---

**Última atualização:** 2024-01-XX

