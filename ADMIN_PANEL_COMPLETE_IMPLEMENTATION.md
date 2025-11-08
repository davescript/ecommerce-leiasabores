# 🎯 Admin Panel - Implementação Completa

## 📋 Visão Geral

Este documento descreve a implementação completa de um painel administrativo profissional para e-commerce, seguindo os padrões Shopify/WordPress, totalmente integrado com Cloudflare (Workers, D1, R2, Pages).

## 🏗️ Arquitetura

### Stack Tecnológica

**Backend:**
- Cloudflare Workers (Hono.js)
- TypeScript
- D1 Database (SQLite)
- R2 Storage (imagens)
- JWT + httpOnly cookies
- RBAC (Roles: admin, manager, editor, viewer)

**Frontend:**
- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Hook Form + Zod
- TanStack Query (React Query)
- Framer Motion

### Estrutura de Pastas

```
backend/
├── src/
│   ├── models/
│   │   └── schema.ts          # Schema Drizzle ORM
│   ├── middleware/
│   │   ├── adminAuth.ts       # Autenticação admin (JWT)
│   │   ├── session.ts         # Sessões httpOnly
│   │   ├── rateLimit.ts       # Rate limiting
│   │   └── csrf.ts            # CSRF protection
│   ├── routes/
│   │   └── admin/
│   │       ├── auth.ts        # Login, logout, refresh
│   │       ├── products.ts    # CRUD produtos
│   │       ├── categories.ts  # CRUD categorias
│   │       ├── orders.ts      # Gestão de pedidos
│   │       ├── customers.ts   # Gestão de clientes
│   │       ├── coupons.ts     # Gestão de cupons
│   │       ├── dashboard.ts   # Dashboard com métricas
│   │       ├── settings.ts    # Configurações da loja
│   │       └── users.ts       # Gestão de usuários admin
│   ├── utils/
│   │   ├── cache.ts           # Cache busting
│   │   ├── r2-upload.ts       # Upload R2
│   │   └── id.ts              # Geração de IDs
│   └── index.ts               # Entry point Worker
├── migrations/
│   ├── 0001_init.sql
│   ├── 0002_admin_panel.sql
│   └── 0003_complete_admin_schema.sql
└── wrangler.toml

frontend/
├── app/
│   ├── components/
│   │   └── admin/
│   │       ├── AdminLayout.tsx
│   │       ├── EditProductDrawer.tsx  # Drawer lateral
│   │       ├── CategorySidebar.tsx
│   │       └── ...
│   ├── pages/
│   │   └── admin/
│   │       ├── Login.tsx
│   │       ├── Dashboard.tsx
│   │       ├── Products/
│   │       ├── Orders/
│   │       ├── Customers/
│   │       ├── Categories/
│   │       ├── Coupons/
│   │       └── Settings/
│   ├── lib/
│   │   └── admin-api.ts       # Cliente API
│   └── hooks/
│       └── useTheme.ts        # Dark mode
```

## 🔐 Autenticação e Segurança

### Sessões httpOnly

- JWT assinado no Worker
- Cookie httpOnly + Secure + SameSite=Lax
- Expiração por inatividade (2 horas)
- Sessão de 8 horas

### RBAC (Role-Based Access Control)

**Roles:**
- `admin`: Acesso total
- `manager`: Produtos, pedidos, clientes
- `editor`: Catálogo e conteúdo
- `viewer`: Somente leitura

### Rate Limiting

- Login: 5 tentativas / 15 minutos
- API: 100 requests / minuto
- Por IP e email (para login)

### CSRF Protection

- Token CSRF em cookie httpOnly
- Validação em todas as mutações (POST/PUT/DELETE)
- Endpoint `/api/csrf-token` para obter token

## 📦 Funcionalidades

### 1. Dashboard

**Métricas:**
- Vendas de hoje/7 dias/30 dias
- Pedidos em aberto
- Ticket médio
- Produtos com baixo estoque

**Gráficos:**
- Orders por dia
- Receita vs meta
- Top produtos vendidos

**Atualização:**
- Tempo real via revalidação de queries
- Invalidação automática após mutações

### 2. Produtos

**Listagem:**
- Busca por nome/descrição
- Filtros: categoria, status, estoque
- Paginação
- Ordenação

**Edição (Drawer Lateral):**
- **Geral**: Título, slug, descrição (rich text), preço, SKU, status
- **Imagens**: Upload R2, drag & drop, reordenação
- **Categorias**: Seleção hierárquica múltipla
- **Estoque**: Quantidade, mínimo de alerta
- **SEO**: Meta title/description, og:image
- **Variantes**: Tamanhos, cores, etc.

**Validações:**
- Zod schemas
- React Hook Form
- Feedback por campo

**Cache Busting:**
- Invalidação automática ao salvar
- Revalidação de listas e detalhes

### 3. Categorias

- Árvore hierárquica
- CRUD completo
- Drag & drop (opcional)
- Slug único
- Prevenção de ciclos

### 4. Pedidos

- Listagem com filtros
- Detalhes completos
- Timeline de status
- Mudança de status
- Notas internas
- Webhooks Stripe/MB Way

### 5. Clientes

- Listagem
- Perfil completo
- Histórico de pedidos
- Notas internas
- Exportar CSV

### 6. Cupons

- Criar/editar/arquivar
- Tipos: percentual, valor fixo, frete grátis
- Validade, limite de uso
- Categorias elegíveis
- Propagação automática ao site

### 7. Configurações

- Loja: nome, logo, cores, domínio
- Pagamentos: Stripe, MB Way, PayPal
- Entrega: zonas de frete
- Conteúdo: páginas institucionais
- Segurança: rotação de chaves

### 8. Dark Mode

- Toggle completo
- Persistência localStorage
- Inversão completa (cores, ícones, gráficos)

## 🗄️ Banco de Dados

### Migrations

```bash
# Aplicar migrations
npm run d1:migrate

# Seed inicial
npm run d1:seed
```

### Schema Principal

**Tabelas:**
- `products` - Produtos
- `categories` - Categorias
- `product_categories` - Relação N:N
- `product_images` - Imagens R2
- `orders` - Pedidos
- `order_items` - Itens dos pedidos
- `order_status_history` - Timeline
- `customers` - Clientes
- `coupons` - Cupons
- `admin_users` - Usuários admin
- `admin_sessions` - Sessões
- `cache_keys` - Cache busting
- `rate_limits` - Rate limiting
- `audit_logs` - Logs de auditoria

## 🚀 Deploy

### Variáveis de Ambiente

```env
# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token

# D1 Database
DATABASE_ID=your_database_id

# R2 Bucket
R2_BUCKET_NAME=your_bucket_name

# JWT
JWT_SECRET=your_jwt_secret

# Admin Seed
ADMIN_SEED_TOKEN=your_seed_token
```

### Scripts

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Deploy
npm run deploy

# Migrations
npm run d1:migrate
npm run d1:seed
```

## 🧪 Testes

### Unitários

```bash
npm run test
```

### E2E (Playwright)

```bash
npm run test:e2e
```

**Cenários:**
- Login
- Criar produto
- Editar produto (drawer)
- Criar cupom
- Mudar status de pedido

## 📝 Cache Busting

### Automático

Ao salvar produto/cupom/categoria:
1. Invalida cache do produto
2. Invalida lista de produtos
3. Revalida paths relacionados
4. Adiciona `?v=<timestamp>` aos assets

### Manual

```typescript
import { revalidate } from '@/utils/cache'

await revalidate(env, ['/products/123', '/catalogo'])
```

## 🔍 Observabilidade

### Logging Estruturado

```typescript
logger.info('Product updated', {
  requestId,
  userId,
  productId,
  duration: Date.now() - start,
})
```

### Métricas

- Contagem de erros
- Latência de endpoints
- Taxa de sucesso

## 📚 Próximos Passos

1. **Implementar drawer lateral** para edição de produtos
2. **Rich text editor** para descrições
3. **Upload assinado R2** para upload direto do browser
4. **Dashboard com gráficos** (Chart.js)
5. **Timeline de pedidos** completa
6. **Testes unitários e e2e**
7. **Observabilidade** com métricas

## 🐛 Troubleshooting

### Erros Comuns

**1. Sessão expirada**
- Verificar cookie httpOnly
- Verificar expiração de sessão
- Verificar timeout de inatividade

**2. Cache não atualiza**
- Verificar invalidação de cache
- Verificar versão de cache
- Limpar cache manualmente

**3. Upload R2 falha**
- Verificar permissões R2
- Verificar tamanho do arquivo
- Verificar formato do arquivo

## 📖 Referências

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [R2 Storage Docs](https://developers.cloudflare.com/r2/)
- [Hono.js Docs](https://hono.dev/)
- [React Query Docs](https://tanstack.com/query/latest)

