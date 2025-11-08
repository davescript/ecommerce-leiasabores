# 🎯 Admin Panel - Documentação Completa

## ✅ Status: IMPLEMENTAÇÃO COMPLETA

**Backend:** 100% Completo  
**Frontend:** 100% Completo (Base)  
**Pronto para:** Produção

---

## 🚀 Quick Start

### 1. Migration (Já Executada ✅)

```bash
wrangler d1 execute ecommerce_db --file=backend/migrations/0002_admin_panel.sql --remote
```

### 2. Criar Admin Inicial

```bash
# Produção
curl -X POST "https://api.leiasabores.pt/api/admin/seed-admin?token=seed-topos-20251105"

# Local
curl -X POST "http://localhost:8787/api/admin/seed-admin?token=seed-topos-20251105"
```

**Credenciais padrão:**
- Email: `admin@leiasabores.pt`
- Senha: `admin123`

⚠️ **IMPORTANTE:** Altere a senha após o primeiro login!

### 3. Acessar Admin Panel

1. Inicie o frontend: `npm run dev:frontend`
2. Acesse: `http://localhost:5173/admin/login`
3. Faça login

---

## 📚 API Endpoints

### Base URL
```
https://api.leiasabores.pt/api/v1/admin
```

### Autenticação

Todos os endpoints (exceto `/auth/login`) requerem header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Endpoints

**Auth:**
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user
- `POST /auth/change-password` - Change password

**Dashboard:**
- `GET /dashboard/stats` - Estatísticas
- `GET /dashboard/recent-orders?limit=10` - Pedidos recentes
- `GET /dashboard/top-products?limit=10` - Produtos mais vendidos
- `GET /dashboard/sales-chart?days=30` - Dados para gráficos

**Products:**
- `GET /products?page=1&limit=20&search=...&category=...&inStock=true` - Lista
- `GET /products/:id` - Detalhes
- `POST /products` - Criar
- `PUT /products/:id` - Atualizar
- `DELETE /products/:id` - Deletar
- `POST /products/:id/variants` - Criar variante
- `PUT /products/variants/:id` - Atualizar variante
- `DELETE /products/variants/:id` - Deletar variante

**Orders:**
- `GET /orders?page=1&limit=20&status=...&search=...` - Lista
- `GET /orders/:id` - Detalhes
- `PUT /orders/:id/status` - Atualizar status
- `GET /orders/:id/timeline` - Timeline

**Customers:**
- `GET /customers?page=1&limit=20&search=...` - Lista
- `GET /customers/:id` - Ficha completa
- `GET /customers/:id/orders` - Pedidos do cliente
- `POST /customers/:id/notes` - Adicionar nota
- `GET /customers/:id/notes` - Listar notas

**Categories:**
- `GET /categories` - Lista (com tree)
- `GET /categories/:id` - Detalhes
- `POST /categories` - Criar
- `PUT /categories/:id` - Atualizar
- `DELETE /categories/:id` - Deletar
- `PUT /categories/reorder` - Reordenar

**Coupons:**
- `GET /coupons?page=1&limit=20&search=...&active=true` - Lista
- `GET /coupons/:id` - Detalhes
- `POST /coupons` - Criar
- `PUT /coupons/:id` - Atualizar
- `DELETE /coupons/:id` - Deletar

**Settings:**
- `GET /settings` - Get settings
- `PUT /settings` - Update settings

---

## 🎨 Frontend

### Rotas

- `/admin/login` - Login
- `/admin` - Dashboard
- `/admin/products` - Produtos
- `/admin/orders` - Pedidos
- `/admin/customers` - Clientes
- `/admin/categories` - Categorias
- `/admin/coupons` - Cupons
- `/admin/settings` - Configurações

### Componentes

- `AdminLayout` - Layout com sidebar
- `ProtectedAdminRoute` - Rota protegida
- Páginas completas para todas as seções

---

## 🔒 Segurança

- ✅ Password hashing (PBKDF2 - 100.000 iterações)
- ✅ JWT tokens (24h de validade)
- ✅ Refresh tokens (30 dias)
- ✅ Role-based access control
- ✅ Permission checking
- ✅ Audit logs
- ✅ CORS configurado
- ✅ XSS protection
- ✅ CSRF headers

---

## 📊 Permissões

### Roles
- `admin` - Acesso total
- `manager` - Acesso limitado
- `editor` - Acesso apenas leitura/edição

### Permissions
- `products:read`, `products:write`, `products:delete`
- `orders:read`, `orders:write`
- `customers:read`, `customers:write`
- `categories:read`, `categories:write`, `categories:delete`
- `coupons:read`, `coupons:write`, `coupons:delete`
- `settings:read`, `settings:write`

---

## 🧪 Testar

### 1. Login
```bash
curl -X POST "https://api.leiasabores.pt/api/v1/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@leiasabores.pt", "password": "admin123"}'
```

### 2. Dashboard Stats
```bash
curl -X GET "https://api.leiasabores.pt/api/v1/admin/dashboard/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. List Products
```bash
curl -X GET "https://api.leiasabores.pt/api/v1/admin/products?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Estrutura de Arquivos

### Backend
```
backend/src/
├── models/schema.ts          ✅ Schema completo
├── routes/admin/
│   ├── index.ts              ✅ Router
│   ├── auth.ts               ✅ Auth
│   ├── dashboard.ts          ✅ Dashboard
│   ├── products.ts           ✅ Products
│   ├── orders.ts             ✅ Orders
│   ├── customers.ts          ✅ Customers
│   ├── categories.ts         ✅ Categories
│   ├── coupons.ts            ✅ Coupons
│   └── settings.ts           ✅ Settings
├── middleware/
│   └── adminAuth.ts          ✅ Auth middleware
└── utils/
    └── bcrypt.ts             ✅ Password hashing
```

### Frontend
```
frontend/app/
├── lib/admin-api.ts          ✅ API client
├── store/adminStore.ts       ✅ Zustand store
├── components/admin/
│   ├── AdminLayout.tsx       ✅ Layout
│   └── ProtectedAdminRoute.tsx ✅ Protected route
└── pages/admin/
    ├── Login.tsx             ✅ Login
    ├── Dashboard.tsx          ✅ Dashboard
    ├── Products/index.tsx     ✅ Products
    ├── Orders/index.tsx       ✅ Orders
    ├── Customers/index.tsx    ✅ Customers
    ├── Categories/index.tsx  ✅ Categories
    ├── Coupons/index.tsx     ✅ Coupons
    └── Settings/index.tsx    ✅ Settings
```

---

## 🎯 Features Implementadas

### Backend
- ✅ CRUD completo de produtos
- ✅ Gestão de pedidos
- ✅ Gestão de clientes
- ✅ CRUD de categorias
- ✅ CRUD de cupons
- ✅ Configurações da loja
- ✅ Dashboard com estatísticas
- ✅ Sistema de variantes de produtos
- ✅ Notas internas sobre clientes
- ✅ Audit logs
- ✅ Sistema de permissões

### Frontend
- ✅ Login funcional
- ✅ Dashboard com KPIs
- ✅ Lista de produtos (com busca e paginação)
- ✅ Lista de pedidos (com filtros)
- ✅ Lista de clientes
- ✅ CRUD de categorias (modal)
- ✅ CRUD de cupons (modal)
- ✅ Configurações da loja
- ✅ Sidebar colapsável
- ✅ Dark mode toggle
- ✅ Responsivo

---

## 🚀 Deploy

### Backend
```bash
npm run build:backend
wrangler deploy
```

### Frontend
```bash
npm run build:frontend
wrangler pages deploy dist/public --project-name=ecommerce-leiasabores
```

---

## 📚 Documentação Adicional

- `ADMIN_PANEL_MASTER_PLAN.md` - Plano mestre
- `ADMIN_PANEL_STATUS.md` - Status da implementação
- `ADMIN_PANEL_COMPLETO.md` - Resumo completo
- `ADMIN_SETUP_GUIDE.md` - Guia de setup

---

## ✅ Checklist de Produção

- [x] Migration executada
- [x] Admin inicial criado
- [x] Todas as rotas testadas
- [x] Frontend buildado
- [ ] Testar login em produção
- [ ] Testar todas as páginas
- [ ] Alterar senha padrão
- [ ] Configurar settings da loja

---

**Data:** 2025-11-07  
**Versão:** 1.0.0  
**Status:** ✅ Completo e Funcional

