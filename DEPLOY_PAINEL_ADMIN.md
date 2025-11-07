# 🚀 Deploy do Painel Administrativo

## 📋 Checklist Pré-Deploy

- [x] Todos os TODOs implementados
- [x] Erros de lint corrigidos
- [x] TypeScript validado
- [x] Rotas backend criadas
- [x] Páginas frontend criadas
- [x] Componentes funcionando

---

## 🔧 Comandos de Deploy

### Opção 1: Deploy Automático (Recomendado)

```bash
cd /Users/davidsousa/Documents/Websites/ecommerce

# 1. Verificar mudanças
git status

# 2. Adicionar arquivos
git add .

# 3. Commit
git commit -m "feat: implementar painel administrativo completo

- Dashboard com KPIs e gráficos
- Gestão de produtos (lista, filtros, ações)
- Gestão de pedidos (lista, status, detalhes)
- Categorias (CRUD completo)
- Cupons (estrutura)
- Clientes (lista e detalhes)
- Configurações gerais
- Layout moderno com sidebar responsiva
- Backend routes para todas as funcionalidades"

# 4. Push para GitHub (deploy automático)
git push origin main
```

**O GitHub Actions fará o deploy automático de:**
- ✅ Backend (Cloudflare Workers)
- ✅ Frontend (Cloudflare Pages)

---

### Opção 2: Deploy Manual

Se o deploy automático não funcionar, use estes comandos:

#### Backend (Cloudflare Workers)

```bash
cd /Users/davidsousa/Documents/Websites/ecommerce/backend

# Build e deploy do backend
npm run deploy
```

**Ou com wrangler diretamente:**
```bash
cd backend
wrangler deploy
```

#### Frontend (Cloudflare Pages)

```bash
cd /Users/davidsousa/Documents/Websites/ecommerce/frontend

# Build do frontend (gera em ../dist/public)
npm run build

# Deploy para Cloudflare Pages (voltar para raiz)
cd ..
wrangler pages deploy dist/public --project-name=leiasabores
```

---

### Opção 3: Deploy Completo (Script)

Execute este script para fazer deploy de ambos:

```bash
cd /Users/davidsousa/Documents/Websites/ecommerce

# Deploy Backend
echo "🚀 Deploy do Backend..."
cd backend
npm run deploy
cd ..

# Deploy Frontend
echo "🚀 Deploy do Frontend..."
cd frontend
npm run build
wrangler pages deploy dist/public --project-name=leiasabores
cd ..

echo "✅ Deploy completo!"
```

---

## 🧪 Testar Após Deploy

### 1. Verificar Backend

```bash
curl https://api.leiasabores.pt/api/health
```

**Ou no navegador:**
- https://api.leiasabores.pt/api/health

### 2. Verificar Frontend

Acesse: https://leiasabores.pt/admin

### 3. Configurar Token JWT

1. Acesse: https://leiasabores.pt/admin/legacy
2. Clique em "Gerar Token"
3. O token será aplicado automaticamente

### 4. Testar Funcionalidades

- [ ] Dashboard carrega (`/admin`)
- [ ] Produtos listam (`/admin/products`)
- [ ] Pedidos listam (`/admin/orders`)
- [ ] Categorias funcionam (`/admin/categories`)
- [ ] Cupons funcionam (`/admin/coupons`)
- [ ] Clientes funcionam (`/admin/customers`)
- [ ] Configurações funcionam (`/admin/settings`)

---

## 📝 Notas Importantes

### Migrations do Banco de Dados

Se os campos `stock` e `customerName` não existirem no banco, execute:

```bash
cd backend
npm run db:push
```

**Ou manualmente via SQL:**
```sql
-- Adicionar campo stock em products
ALTER TABLE products ADD COLUMN stock INTEGER;

-- Adicionar campo customer_name em orders
ALTER TABLE orders ADD COLUMN customer_name TEXT;
```

### Variáveis de Ambiente

Certifique-se de que as seguintes variáveis estão configuradas no Cloudflare:

**Backend (Workers):**
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `ADMIN_SEED_TOKEN`
- `DB` (D1 Database)
- `R2` (R2 Bucket)

**Frontend (Pages):**
- `VITE_API_URL` (se necessário)

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"

**Solução:**
```bash
cd frontend
npm install
cd ../backend
npm install
```

### Erro: "TypeScript errors"

**Solução:**
```bash
npm run type-check
# Corrigir erros antes de fazer deploy
```

### Erro: "Backend não responde"

**Solução:**
1. Verificar se o Worker está deployado no Cloudflare Dashboard
2. Verificar logs no Cloudflare Dashboard → Workers → Logs
3. Verificar variáveis de ambiente no Cloudflare Dashboard

### Erro: "Frontend não carrega"

**Solução:**
1. Verificar se o Pages está deployado no Cloudflare Dashboard
2. Verificar build logs no Cloudflare Dashboard → Pages → Deployments
3. Verificar se o `dist/public` foi gerado corretamente

---

## ✅ Deploy Completo!

Após o deploy, o painel administrativo estará disponível em:
- **Frontend:** https://leiasabores.pt/admin
- **Backend:** https://api.leiasabores.pt/api/admin/*

---

## 📋 Resumo dos Comandos

### Deploy Automático (Recomendado)
```bash
git add .
git commit -m "feat: implementar painel administrativo completo"
git push origin main
```

### Deploy Manual Backend
```bash
cd backend && npm run deploy
```

### Deploy Manual Frontend
```bash
cd frontend && npm run build && cd .. && wrangler pages deploy dist/public --project-name=leiasabores
```

### Deploy Manual Completo
```bash
cd backend && npm run deploy && cd ../frontend && npm run build && cd .. && wrangler pages deploy dist/public --project-name=leiasabores
```

---

**Última atualização:** 7 de Novembro de 2025
