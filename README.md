# Leia Sabores · Topos Personalizados e Doces Artesanais

E-commerce pronto para produção com infraestrutura Cloudflare (Workers + Pages + D1 + R2), UI mobile-first em React 18 + TypeScript, animações Framer Motion e checkout Stripe (Apple Pay, Google Pay, MBWay, cartões).

## ✨ Destaques

- Frontend em **React 18 + TypeScript** com **Vite**, Tailwind CSS, shadcn/ui e layout responsivo Leia Sabores.
- Camada de dados com **React Query**, SEO otimizado (Open Graph, manifest PWA, meta dinâmicas).
- Backend em **Hono** executando em Cloudflare Workers com **Drizzle ORM** para Cloudflare D1.
- Integrações nativas Cloudflare: Pages (frontend), Workers (API), D1 (DB distribuído) e R2 (imagens).
- Checkout Stripe (cartões, Apple Pay, Google Pay, MBWay), webhooks e limpeza automática do carrinho.
- Estrutura escalável com tipagem compartilhada, middlewares JWT e componentes reutilizáveis (Header responsivo, Footer, CartDrawer, ProductCard, etc.).

## 🗂️ Arquitetura

```
.
├── backend/
│   ├── migrations/              # SQL inicial D1
│   └── src/
│       ├── index.ts             # Worker + roteamento Hono
│       ├── lib/db.ts            # Drizzle + bindings Cloudflare
│       ├── middleware/          # Auth, error handler
│       ├── models/schema.ts     # Schemas tipados Drizzle
│       ├── routes/              # Produtos, reviews, carrinho, checkout
│       ├── services/stripe.ts   # Cliente Stripe (fetch)
│       └── utils/serializers.ts # DTOs para API
├── frontend/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── AppProviders.tsx     # React Query + Toaster
│   │   ├── components/
│   │   │   ├── ui/*             # shadcn/ui adaptado (button, card, sheet, etc.)
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ProductCard.tsx
│   │   ├── hooks/               # useCart, useSEO
│   │   ├── lib/                 # api-client, api, query-client, helpers
│   │   └── pages/               # Home, Catálogo, Produto, Carrinho, Checkout, Sobre, Contato, Termos...
│   ├── public/                  # manifest.json, sw.js, robots.txt
│   ├── main.tsx                 # bootstrap + providers
│   └── vite.config.ts
├── config/                      # Espaço para configs compartilhadas
├── types/                       # Tipos globais (Product, Cart, Review, etc.)
├── .env.example
├── drizzle.config.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── wrangler.toml
```

## 🧰 Pré-requisitos

- Node.js 18+ (recomendado v20 LTS) ou Bun compatível
- Conta Cloudflare (Workers + Pages + D1 + R2)
- Conta Stripe com chaves secretas/live e webhook configurado
- (Opcional) Stripe CLI para testes locais de webhook

## 🚀 Setup local

```bash
# Instalar dependências
npm install

# Duplicar variáveis de ambiente
cp .env.example .env.local

# Terminal 1: API (Workers em modo dev)
npm run dev:backend
# ou simplesmente `npm run dev` (alias)

# Terminal 2: Frontend (Vite)
npm run dev:frontend
# acessa em http://localhost:5173
```

### Variáveis de ambiente (.env.local)

```env
VITE_API_URL=http://localhost:8787/api
VITE_APP_NAME=Leia Sabores
VITE_SITE_URL=http://localhost:5173
VITE_ANALYTICS_ID=

STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
JWT_SECRET=uma_chave_muito_segura_aqui
CLOUDFLARE_ACCOUNT_ID=seu_account_id
CLOUDFLARE_API_TOKEN=seu_api_token_com_permissoes
D1_DATABASE_ID=seu_database_id

ENVIRONMENT=development
NODE_ENV=development
LOG_LEVEL=info
```

> ⚙️ Use `wrangler secret put` em produção para STRIPE/JWT e demais segredos.

## 📦 Scripts principais

```bash
npm run dev             # alias para wrangler dev (backend)
npm run dev:backend     # idem acima
npm run dev:frontend    # Vite com config de frontend/

npm run build           # build completo (frontend + backend)
npm run build:frontend  # build Vite para frontend/dist/public
npm run build:backend   # bundle Worker via esbuild

npm run lint            # ESLint
npm run type-check      # tsc --noEmit (requer `npm install`)
npm run test            # Vitest (se aplicável)

npm run deploy          # build + wrangler deploy
npm run preview         # Vite preview com config correta
```

## 🌐 Cloudflare

### D1 + migrations
```bash
wrangler d1 create cake_decor_db
wrangler d1 execute cake_decor_db --file backend/migrations/0001_init.sql
```
O schema é mantido via Drizzle (`backend/src/models/schema.ts`). Rode `npm run build:backend` após alterações para garantir tipagem atualizada.

### R2 Storage
```bash
wrangler r2 bucket create cake-decor-images
```
Configure a variável `R2` no `wrangler.toml` (já mapeada) para uploads de imagens.

### Stripe Webhooks
1. Crie endpoint em `https://seu-dominio/api/checkout/webhook`.
2. Salve o `STRIPE_WEBHOOK_SECRET` no Worker (`wrangler secret put`).
3. Para testes locais, utilize `stripe listen --forward-to http://127.0.0.1:8787/api/checkout/webhook`.

### Deploy
```bash
npm run build
wrangler deploy
```
Frontend gerado em `frontend/dist/public` pode ser enviado ao Cloudflare Pages:

```bash
cd frontend
wrangler pages deploy dist/public
```

## 🔌 API HTTP

- `GET /api/products` – paginação, busca (`search`), categoria, ordenação (`novos`, `preco-asc`, `preco-desc`, `avaliacoes`).
- `GET /api/products/:id`
- `POST /api/products` *(admin + JWT)* – cria produto (imagens via R2, arrays, tags).
- `PUT /api/products/:id` *(admin)*
- `DELETE /api/products/:id` *(admin)*

- `GET /api/reviews/product/:productId`
- `POST /api/reviews`
- `PUT /api/reviews/:id/helpful`
- `DELETE /api/reviews/:id` *(admin)*

- `GET /api/cart/:userId` – devolve itens com produtos populados + totais (subtotal, impostos, portes, total).
- `POST /api/cart/:userId/add`
- `PUT /api/cart/:userId/update/:productId`
- `DELETE /api/cart/:userId/:productId`
- `DELETE /api/cart/:userId/clear`

- `POST /api/checkout` – cria sessão Stripe Checkout com metadados (endereços, itens, totais).
- `POST /api/checkout/webhook` – confirma pedidos pagos, grava em D1, limpa carrinho.
- `GET /api/checkout/session/:sessionId` – consulta status + detalhes do pedido (usado na tela de sucesso).

- `POST /api/admin/seed` *(admin + JWT)* – popula D1 com produtos iniciais.
- `POST /api/uploads` *(admin + JWT, multipart/form-data)* – envia ficheiros/imagens para R2, retorna a key.
- `GET /api/uploads/:key` – serve objetos do R2 via Worker (com cache de 24h).

## 🧪 Testes & qualidade

- ESLint + TypeScript strict em toda a base.
- React Query com cache de 5 minutos, fallback de dados mockados quando API indisponível.
- PWA (manifest + service worker), lazy loading de imagens, animações suaves com Framer Motion.
- Toaster global via `sonner` para feedback imediato de ações (carrinho, compartilhar, erros).

## 📦 Próximos passos sugeridos

1. Criar rotinas de seed para D1 com produtos, categorias e reviews reais.
2. Implementar painel administrativo seguro (Cloudflare Access + JWT) para CRUD de produtos.
3. Conectar uploads de imagens ao R2 (rotas criadas; opcional: URLs assinadas).
4. Configurar logs/observabilidade (Workers Analytics Engine) e monitoramento de erros (Sentry).

---

Feito com ❤️ pensando em experiências de compra persuasivas e performance global.
