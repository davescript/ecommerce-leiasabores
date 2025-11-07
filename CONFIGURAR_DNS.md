# 🌐 Guia Completo de Configuração DNS - Leia Sabores

## 📋 Resumo das Rotas do Sistema

### 🎨 Frontend (Cloudflare Pages)
- **Projeto:** `leiasabores-frontend`
- **URL Temporária:** `https://0862d543.leiasabores-frontend.pages.dev`
- **Domínios Customizados:**
  - `leiasabores.pt` (raiz)
  - `www.leiasabores.pt` (www)

### 🔧 Backend (Cloudflare Workers)
- **Worker:** `ecommerce-backend`
- **Rotas Configuradas:**
  - `leiasabores.pt/api/*` → Backend API
  - `api.leiasabores.pt/*` → Backend API (subdomínio dedicado)

---

## 🔗 Todas as Rotas da API

### 📦 Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Detalhes do produto
- `POST /api/products` - Criar produto (admin)
- `PUT /api/products/:id` - Atualizar produto (admin)
- `DELETE /api/products/:id` - Deletar produto (admin)

### 📂 Categorias
- `GET /api/categories` - Listar categorias (árvore)
- `GET /api/categories/:slug` - Detalhes da categoria

### 🛒 Carrinho
- `GET /api/cart` - Obter carrinho
- `POST /api/cart` - Adicionar ao carrinho
- `PUT /api/cart/:id` - Atualizar item do carrinho
- `DELETE /api/cart/:id` - Remover do carrinho

### 💳 Checkout
- `POST /api/checkout` - Criar pedido
- `GET /api/checkout/:id` - Obter pedido

### 💰 Payment Intent (Stripe)
- `POST /api/payment-intent` - Criar payment intent
- `POST /api/payment-intent/confirm` - Confirmar pagamento

### ⭐ Avaliações
- `GET /api/reviews` - Listar avaliações
- `POST /api/reviews` - Criar avaliação

### 📤 Uploads
- `POST /api/uploads` - Upload de arquivos
- `GET /api/uploads/:path` - Obter arquivo

### 🔐 Admin
- `POST /api/admin/login` - Login admin
- `GET /api/admin/products` - Listar produtos (admin)
- `POST /api/admin/products` - Criar produto (admin)
- `PUT /api/admin/products/:id` - Atualizar produto (admin)
- `DELETE /api/admin/products/:id` - Deletar produto (admin)
- `GET /api/admin/orders` - Listar pedidos (admin)
- `GET /api/admin/customers` - Listar clientes (admin)
- `GET /api/admin/coupons` - Listar cupons (admin)
- `GET /api/admin/dashboard` - Estatísticas do dashboard

### 🌱 Seed (Desenvolvimento)
- `POST /api/admin/seed-categories?token=...` - Seed categorias
- `POST /api/admin/seed-topos?token=...` - Seed topos
- `POST /api/admin/seed-partyland?token=...` - Seed Partyland

### ☁️ R2 Storage
- `GET /api/r2/*` - Acessar arquivos do R2
- `POST /api/r2-auto-sync` - Sincronização automática

### 🏥 Health & Debug
- `GET /health` - Health check simples
- `GET /api/health` - Health check da API
- `GET /api/debug/config` - Configurações (debug)

---

## 📝 Configuração DNS Necessária

### 1️⃣ Domínio Raiz: `leiasabores.pt`

#### Opção A: CNAME (Recomendado)
```
Tipo: CNAME
Nome: @ (ou deixar em branco)
Conteúdo: leiasabores-frontend.pages.dev
Proxy: ✅ Ativado (laranja)
TTL: Auto
```

#### Opção B: A Record (se CNAME não funcionar)
```
Tipo: A
Nome: @
Conteúdo: (IP fornecido pelo Cloudflare Pages ao adicionar domínio)
Proxy: ✅ Ativado (laranja)
TTL: Auto
```

### 2️⃣ Subdomínio www: `www.leiasabores.pt`

```
Tipo: CNAME
Nome: www
Conteúdo: leiasabores-frontend.pages.dev
Proxy: ✅ Ativado (laranja)
TTL: Auto
```

### 3️⃣ Subdomínio API: `api.leiasabores.pt`

**IMPORTANTE:** Este subdomínio é gerenciado automaticamente pelo Cloudflare Workers.

O Worker `ecommerce-backend` já está configurado para responder em:
- `api.leiasabores.pt/*`
- `leiasabores.pt/api/*`

**Não precisa configurar DNS manualmente para `api.leiasabores.pt`** - o Cloudflare Workers gerencia isso automaticamente através das rotas configuradas no `wrangler.toml`.

---

## 🔧 Passo a Passo no Cloudflare Dashboard

### Passo 1: Adicionar Domínios Customizados no Pages

1. Acesse: https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/pages/view/leiasabores-frontend/custom-domains
2. Clique em **"Set up a custom domain"**
3. Adicione:
   - `leiasabores.pt`
   - `www.leiasabores.pt`
4. Siga as instruções na tela

### Passo 2: Configurar DNS Records

1. Acesse: https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/leiasabores.pt/dns
2. Adicione os registros conforme abaixo:

#### Para `leiasabores.pt`:
```
Tipo: CNAME
Nome: @
Conteúdo: leiasabores-frontend.pages.dev
Proxy: ✅ (laranja)
```

#### Para `www.leiasabores.pt`:
```
Tipo: CNAME
Nome: www
Conteúdo: leiasabores-frontend.pages.dev
Proxy: ✅ (laranja)
```

### Passo 3: Verificar Worker Routes

1. Acesse: https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/workers
2. Selecione: `ecommerce-backend`
3. Vá em **"Settings" → "Triggers"**
4. Verifique se as rotas estão configuradas:
   - `leiasabores.pt/api/*`
   - `api.leiasabores.pt/*`

**Nota:** Se as rotas não estiverem configuradas, elas estão definidas no `wrangler.toml` e serão aplicadas no próximo deploy.

---

## ✅ Verificação Pós-Configuração

Após configurar o DNS, verifique:

### 1. Frontend
```bash
curl -I https://leiasabores.pt
curl -I https://www.leiasabores.pt
```
**Esperado:** HTTP 200 OK

### 2. Backend API
```bash
curl https://api.leiasabores.pt/api/health
curl https://leiasabores.pt/api/health
```
**Esperado:** `{"status":"ok","timestamp":"..."}`

### 3. Produtos
```bash
curl https://api.leiasabores.pt/api/products
```
**Esperado:** JSON com lista de produtos

### 4. Categorias
```bash
curl https://api.leiasabores.pt/api/categories
```
**Esperado:** JSON com árvore de categorias

---

## 🔄 Propagação DNS

- **Tempo estimado:** 5-30 minutos
- **Máximo:** Até 48 horas (raro)
- **Verificar:** Use `dig` ou `nslookup`:
  ```bash
  dig leiasabores.pt
  dig www.leiasabores.pt
  dig api.leiasabores.pt
  ```

---

## 🚨 Troubleshooting

### Problema: Domínio não resolve
- **Solução:** Aguarde propagação DNS (até 48h)
- **Verificar:** DNS records estão corretos no Cloudflare

### Problema: API não funciona em `api.leiasabores.pt`
- **Solução:** Verificar se Worker está deployado e rotas estão ativas
- **Comando:** `wrangler deploy` para garantir deploy do Worker

### Problema: Frontend não carrega
- **Solução:** Verificar se domínios customizados foram adicionados no Pages
- **Verificar:** SSL/TLS está ativo (Cloudflare gerencia automaticamente)

### Problema: CNAME não aceito para domínio raiz
- **Solução:** Alguns registradores não permitem CNAME no root
- **Alternativa:** Use A record com IP fornecido pelo Cloudflare Pages

---

## 📊 Estrutura Final

```
leiasabores.pt
├── / (Frontend - Pages)
├── /admin (Frontend - Admin Panel)
└── /api/* (Backend - Workers)

www.leiasabores.pt
└── / (Frontend - Pages)

api.leiasabores.pt
└── /* (Backend - Workers)
```

---

## 🔗 Links Úteis

- **DNS:** https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/leiasabores.pt/dns
- **Pages:** https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/pages/view/leiasabores-frontend
- **Workers:** https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/workers
- **SSL/TLS:** https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/leiasabores.pt/ssl-tls

---

## ✅ Checklist Final

- [ ] Domínios customizados adicionados no Pages
- [ ] CNAME para `leiasabores.pt` configurado
- [ ] CNAME para `www.leiasabores.pt` configurado
- [ ] Worker `ecommerce-backend` deployado
- [ ] Rotas do Worker verificadas
- [ ] SSL/TLS ativo (automático no Cloudflare)
- [ ] Frontend acessível em `leiasabores.pt`
- [ ] Frontend acessível em `www.leiasabores.pt`
- [ ] API acessível em `api.leiasabores.pt`
- [ ] API acessível em `leiasabores.pt/api`

---

**Última atualização:** 2025-11-07

