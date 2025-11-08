# 🚀 Instruções de Deploy para GitHub

## ✅ Status Atual

- ✅ Repositório GitHub configurado: `https://github.com/davescript/ecommerce-leiasabores.git`
- ✅ Workflows configurados (`.github/workflows/deploy.yml` e `.github/workflows/ci.yml`)
- ✅ Erros de TypeScript corrigidos
- ✅ Migrations aplicadas
- ✅ Admin user criado

## 📋 Pré-requisitos

### 1. Secrets no GitHub

Configure os seguintes secrets no GitHub:
- `CLOUDFLARE_API_TOKEN` - Token de API do Cloudflare
- `CLOUDFLARE_ACCOUNT_ID` - ID da conta Cloudflare (`55b0027975cda6f67a48ea231d2cef8d`)

**Como configurar:**
1. Acesse: `https://github.com/davescript/ecommerce-leiasabores/settings/secrets/actions`
2. Clique em **"New repository secret"**
3. Adicione cada secret

## 🚀 Deploy

### Opção 1: Script Automático

```bash
./deploy.sh
```

### Opção 2: Manual

```bash
# 1. Adicionar arquivos
git add .

# 2. Commit
git commit -m "feat: Implementação completa do Admin Panel"

# 3. Push
git push origin main
```

## 🔍 Verificar Deploy

Após o push, verifique o status:
- Acesse: `https://github.com/davescript/ecommerce-leiasabores/actions`
- Veja o status dos workflows

## 📝 O que será feito automaticamente:

1. ✅ Validar código (lint + type-check)
2. ✅ Rodar testes
3. ✅ Build do frontend e backend
4. ✅ Deploy para Cloudflare Workers
5. ✅ Deploy para Cloudflare Pages

## 🔗 URLs após deploy:

- **Site:** https://www.leiasabores.pt
- **Admin:** https://www.leiasabores.pt/admin
- **API:** https://api.leiasabores.pt

## 📧 Credenciais do Admin:

- **Email:** `admin@leiasabores.pt`
- **Senha:** `admin123` (⚠️ ALTERE EM PRODUÇÃO!)

---

**Última atualização:** 2024-01-XX

