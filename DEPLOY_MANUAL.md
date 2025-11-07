# 🚀 Comandos de Deploy Manual

## 📋 Deploy Completo (Frontend + Backend)

### Opção 1: Deploy Tudo de Uma Vez

```bash
npm run deploy
```

Isso faz:
1. ✅ Build do frontend
2. ✅ Build do backend
3. ✅ Deploy do backend para Cloudflare Workers

**Nota:** O frontend precisa ser deployado separadamente para Cloudflare Pages.

---

## 🔧 Deploy Individual

### 1. Deploy do Backend (Cloudflare Workers)

```bash
# Build + Deploy
npm run deploy

# Ou apenas deploy (se já fez build)
wrangler deploy
```

**Para produção:**
```bash
wrangler deploy --env production
```

---

### 2. Deploy do Frontend (Cloudflare Pages)

#### Opção A: Via Wrangler CLI

```bash
# 1. Build do frontend
npm run build:frontend

# 2. Deploy para Cloudflare Pages
wrangler pages deploy dist/public --project-name=leiasabores
```

#### Opção B: Via Cloudflare Dashboard

1. Acesse: https://dash.cloudflare.com/
2. Vá em **Pages** → **leiasabores**
3. Clique em **Upload assets**
4. Faça upload da pasta `dist/public/`

---

## 📝 Passo a Passo Completo

### Deploy Backend:

```bash
# 1. Certifique-se de estar logado
wrangler login

# 2. Build e Deploy
npm run deploy

# Ou passo a passo:
npm run build:backend
wrangler deploy
```

### Deploy Frontend:

```bash
# 1. Build do frontend
npm run build:frontend

# 2. Deploy para Pages
wrangler pages deploy dist/public --project-name=leiasabores
```

---

## 🎯 Comandos Rápidos

### Apenas Backend:
```bash
wrangler deploy
```

### Apenas Frontend:
```bash
npm run build:frontend && wrangler pages deploy dist/public --project-name=leiasabores
```

### Tudo (Backend + Frontend):
```bash
# Backend
npm run deploy

# Frontend
npm run build:frontend && wrangler pages deploy dist/public --project-name=leiasabores
```

---

## 🔍 Verificar Deploy

### Backend:
```bash
curl https://api.leiasabores.pt/api/health
```

### Frontend:
```bash
curl https://leiasabores.pt
# ou
curl https://leiasabores.pages.dev
```

---

## 🚨 Problemas Comuns

### Erro: "Not logged in"
```bash
wrangler login
```

### Erro: "No account ID found"
- Verifique se `wrangler.toml` tem `account_id` configurado

### Erro: "Build failed"
```bash
# Limpar e tentar novamente
rm -rf dist/
npm run build
```

### Erro: "Permission denied"
```bash
# Verificar se está logado
wrangler whoami
```

---

## 💡 Dicas

1. **Sempre teste localmente antes de fazer deploy:**
   ```bash
   npm run dev:backend  # Testar backend
   npm run dev:frontend # Testar frontend
   ```

2. **Verificar logs após deploy:**
   ```bash
   wrangler tail
   ```

3. **Deploy para ambiente específico:**
   ```bash
   wrangler deploy --env production
   ```

---

## ✅ Checklist de Deploy Manual

- [ ] Testar localmente (`npm run dev`)
- [ ] Build do frontend (`npm run build:frontend`)
- [ ] Build do backend (`npm run build:backend`)
- [ ] Deploy do backend (`wrangler deploy`)
- [ ] Deploy do frontend (`wrangler pages deploy`)
- [ ] Verificar se funcionou (testar URLs)

---

**Última atualização:** 7 de Novembro de 2025

