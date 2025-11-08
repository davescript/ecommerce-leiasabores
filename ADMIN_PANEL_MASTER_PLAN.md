# 🎯 Admin Panel Master Plan

## 📋 Estrutura Completa do Projeto

### ✅ Backend (Hono.js + Cloudflare D1)

```
backend/src/
├── models/
│   └── schema.ts ✅ (Estendido com admin_users, coupons, audit_logs, etc)
├── routes/
│   └── admin/
│       ├── index.ts ✅ (Router principal)
│       ├── auth.ts ✅ (Login, logout, refresh, change-password)
│       ├── dashboard.ts ⏳ (KPIs, gráficos, estatísticas)
│       ├── products.ts ⏳ (CRUD produtos, variantes, estoque)
│       ├── orders.ts ⏳ (Lista, detalhes, status, timeline)
│       ├── customers.ts ⏳ (Lista, ficha, histórico, notas)
│       ├── categories.ts ⏳ (CRUD, subcategorias, ordenação)
│       ├── coupons.ts ⏳ (CRUD, validação, uso)
│       └── settings.ts ⏳ (Configurações da loja, Stripe, SMTP)
├── middleware/
│   ├── adminAuth.ts ✅ (Autenticação JWT, roles, permissions)
│   └── rateLimit.ts ⏳ (Rate limiting)
├── utils/
│   ├── bcrypt.ts ✅ (Hash/verify passwords)
│   ├── validation.ts ⏳ (Zod schemas)
│   └── audit.ts ⏳ (Helper para audit logs)
└── services/
    ├── stripe.ts ✅ (Já existe)
    └── email.ts ⏳ (Serviço de email)
```

### ✅ Frontend (React + TypeScript + Tailwind)

```
frontend/app/
├── pages/
│   └── admin/
│       ├── Dashboard.tsx ⏳
│       ├── Products/
│       │   ├── index.tsx ⏳ (Lista)
│       │   ├── Create.tsx ⏳
│       │   └── Edit.tsx ⏳
│       ├── Orders/
│       │   ├── index.tsx ⏳ (Lista)
│       │   └── [id].tsx ⏳ (Detalhes)
│       ├── Customers/
│       │   ├── index.tsx ⏳ (Lista)
│       │   └── [id].tsx ⏳ (Ficha)
│       ├── Categories/
│       │   └── index.tsx ⏳
│       ├── Coupons/
│       │   └── index.tsx ⏳
│       └── Settings/
│           └── index.tsx ⏳
├── components/
│   └── admin/
│       ├── AdminLayout.tsx ⏳ (Layout com sidebar)
│       ├── Sidebar.tsx ⏳
│       ├── Header.tsx ⏳
│       ├── DataTable.tsx ⏳ (Tabela com sort, filter, pagination)
│       ├── Modal.tsx ⏳
│       ├── FormFields.tsx ⏳
│       ├── ImageUploader.tsx ⏳
│       ├── StatusBadge.tsx ⏳
│       └── Chart.tsx ⏳ (Gráficos)
├── hooks/
│   └── admin/
│       ├── useAuth.ts ⏳
│       ├── useProducts.ts ⏳
│       ├── useOrders.ts ⏳
│       └── useDashboard.ts ⏳
├── lib/
│   └── admin-api.ts ⏳ (API client para admin)
└── store/
    └── adminStore.ts ⏳ (Zustand store)
```

## 🚀 Próximos Passos

### Fase 1: Backend Core ✅ (Parcialmente completo)
- [x] Schema estendido
- [x] Migration SQL
- [x] Bcrypt utils
- [x] Admin auth middleware
- [x] Auth routes (login, logout, refresh)
- [ ] Dashboard routes (KPIs, stats)
- [ ] Products routes (CRUD completo)
- [ ] Orders routes (lista, detalhes, status)
- [ ] Customers routes (lista, ficha)
- [ ] Categories routes (CRUD)
- [ ] Coupons routes (CRUD)
- [ ] Settings routes (CRUD)

### Fase 2: Frontend Core ⏳
- [ ] Admin Layout (sidebar, header)
- [ ] Auth pages (login)
- [ ] Dashboard page
- [ ] Products pages
- [ ] Orders pages
- [ ] Customers pages
- [ ] Categories page
- [ ] Coupons page
- [ ] Settings page

### Fase 3: Features Avançadas ⏳
- [ ] Dark mode
- [ ] Upload de imagens (R2)
- [ ] Gráficos (Chart.js/Recharts)
- [ ] Tabelas avançadas (sort, filter, pagination)
- [ ] Formulários (React Hook Form + Zod)
- [ ] Toast notifications
- [ ] Loading states
- [ ] Error handling

## 📝 Notas Importantes

1. **Stack Adaptada:**
   - ✅ Hono.js (não Express/Fastify)
   - ✅ Cloudflare D1 (SQLite via Drizzle)
   - ✅ Cloudflare Workers
   - ✅ React + TypeScript
   - ✅ Tailwind CSS

2. **Autenticação:**
   - ✅ JWT + Refresh Tokens
   - ✅ PBKDF2 para senhas (Web Crypto API)
   - ✅ Roles e Permissions

3. **Banco de Dados:**
   - ✅ Todas as tabelas necessárias criadas
   - ✅ Migration SQL pronta
   - ⏳ Precisa rodar migration

4. **Segurança:**
   - ✅ Password hashing
   - ✅ JWT tokens
   - ✅ Audit logs
   - ⏳ Rate limiting
   - ⏳ CSRF protection

## 🔧 Comandos Necessários

```bash
# Rodar migration
wrangler d1 execute ecommerce_db --file=backend/migrations/0002_admin_panel.sql

# Criar admin user inicial (via seed)
# (Precisa criar script de seed)

# Desenvolver
npm run dev:backend
npm run dev:frontend

# Build
npm run build

# Deploy
npm run deploy
```

## 📚 Documentação

- [ ] README.md completo
- [ ] .env.example
- [ ] Guia de instalação
- [ ] Guia de deploy
- [ ] API documentation

