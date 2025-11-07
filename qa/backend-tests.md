# 🔧 Backend Tests - Cloudflare Workers API

**Stack:** Hono.js + Cloudflare Workers + D1 + R2  
**Ferramentas:** Miniflare, Vitest, Supertest

---

## 📋 TESTES DE API

### Rotas de Produtos

#### GET /api/products
- [x] Lista produtos corretamente
- [x] Paginação funciona
- [x] Filtro por categoria
- [x] Filtro por busca
- [x] Filtro por preço (min/max)
- [x] Ordenação funciona
- [x] Limite de itens respeitado
- [x] Resposta JSON válida
- [x] Headers corretos
- [x] Cache headers (se aplicável)

#### GET /api/products/:id
- [x] Retorna produto existente
- [x] Retorna 404 para produto inexistente
- [x] Resposta JSON válida
- [x] Imagens resolvidas corretamente
- [x] Base URL de imagens correto

#### POST /api/products (Admin)
- [x] Requer autenticação
- [x] Requer role admin
- [x] Valida campos obrigatórios
- [x] Valida preço (min 0.01)
- [x] Valida quantidade
- [x] Cria produto corretamente
- [x] Retorna produto criado
- [x] Status 201

#### PUT /api/products/:id (Admin)
- [x] Requer autenticação
- [x] Requer role admin
- [x] Atualiza produto existente
- [x] Retorna 404 para inexistente
- [x] Valida dados de entrada

#### DELETE /api/products/:id (Admin)
- [x] Requer autenticação
- [x] Requer role admin
- [x] Remove produto existente
- [x] Retorna 404 para inexistente
- [x] Status 204

### Rotas de Categorias

#### GET /api/categories
- [x] Lista categorias
- [x] Hierarquia correta (parent/children)
- [x] Resposta JSON válida

#### GET /api/categories/:slug
- [x] Retorna categoria existente
- [x] Retorna 404 para inexistente
- [x] Produtos da categoria incluídos

### Rotas de Carrinho

#### GET /api/cart/:userId
- [x] Retorna carrinho do usuário
- [x] Retorna carrinho vazio se não existe
- [x] Calcula totais corretamente

#### POST /api/cart/:userId/add
- [x] Adiciona item ao carrinho
- [x] Valida productId (UUID)
- [x] Valida quantity (1-99)
- [x] Atualiza se item já existe
- [x] Retorna carrinho atualizado

#### PUT /api/cart/:userId/update/:productId
- [x] Atualiza quantidade
- [x] Valida quantity
- [x] Remove se quantity = 0

#### DELETE /api/cart/:userId/:productId
- [x] Remove item do carrinho
- [x] Retorna 404 se item não existe

#### DELETE /api/cart/:userId/clear
- [x] Limpa carrinho
- [x] Retorna carrinho vazio

### Rotas de Checkout

#### POST /api/checkout
- [x] Valida Stripe key
- [x] Valida items do carrinho
- [x] Valida email
- [x] Valida endereço
- [x] Calcula totais corretamente
- [x] Cria sessão Stripe
- [x] Retorna URL de checkout
- [x] Rate limiting (20/min)
- [x] Payload size validation
- [x] Trata erros do Stripe

#### POST /api/checkout/webhook
- [x] Valida assinatura Stripe
- [x] Valida webhook secret
- [x] Processa payment_intent.succeeded
- [x] Processa checkout.session.completed
- [x] Cria ordem no D1
- [x] Limpa carrinho
- [x] Retorna 200 para Stripe
- [x] Trata eventos duplicados
- [x] Logs eventos processados

#### GET /api/checkout/session/:sessionId
- [x] Retorna sessão existente
- [x] Retorna ordem associada
- [x] Retorna 404 para inexistente

### Rotas de Payment Intent

#### POST /api/payment-intent/create
- [x] Valida Stripe key
- [x] Valida items
- [x] Valida email
- [x] Busca produtos no D1
- [x] Calcula totais
- [x] Cria Payment Intent
- [x] Suporta múltiplos métodos
- [x] Retorna clientSecret
- [x] Rate limiting (30/min)

#### POST /api/payment-intent/confirm
- [x] Valida paymentIntentId
- [x] Confirma pagamento
- [x] Cria ordem
- [x] Limpa carrinho
- [x] Retorna orderId

### Rotas de R2

#### GET /api/r2/:filename
- [x] Retorna imagem existente
- [x] Retorna 404 para inexistente
- [x] Content-Type correto
- [x] Cache headers
- [x] Tenta múltiplos prefixos

#### POST /api/r2-auto-sync/sync
- [x] Requer token admin
- [x] Lista objetos do R2
- [x] Cria categorias se necessário
- [x] Cria produtos se necessário
- [x] Atualiza produtos existentes
- [x] Ignora arquivos muito grandes
- [x] Retorna estatísticas

### Rotas de Admin

#### POST /api/admin/seed
- [x] Requer autenticação JWT
- [x] Requer role admin
- [x] Cria produtos seed
- [x] Não duplica produtos

#### POST /api/admin/seed-categories
- [x] Requer token admin
- [x] Cria estrutura de categorias
- [x] Não duplica categorias

#### POST /api/admin/seed-topos
- [x] Requer token admin
- [x] Cria produtos de exemplo
- [x] Cria categoria se necessário

### Rotas de Upload

#### POST /api/uploads
- [x] Requer autenticação
- [x] Requer role admin
- [x] Valida tipo de arquivo
- [x] Valida tamanho (10MB)
- [x] Upload para R2
- [x] Retorna URL

#### GET /api/uploads/:key
- [x] Retorna arquivo do R2
- [x] Content-Type correto
- [x] Cache headers

---

## 🔒 TESTES DE SEGURANÇA

### Autenticação
- [x] Rotas protegidas requerem JWT
- [x] Token inválido retorna 401
- [x] Token expirado retorna 401
- [x] Role admin requerida para admin routes
- [x] Token sem role retorna 403

### Validação de Entrada
- [x] Email validado (formato RFC 5322)
- [x] UUID validado (formato v4)
- [x] Preço validado (0.01 - 999999.99)
- [x] Quantidade validada (1-99)
- [x] Payload size limitado (100KB)
- [x] Strings sanitizadas (XSS prevention)

### Rate Limiting
- [x] Checkout: 20 req/min
- [x] Payment Intent: 30 req/min
- [x] Retorna 429 quando excedido
- [x] Headers de rate limit presentes

### CORS
- [x] Headers CORS corretos
- [x] Origins permitidas em produção
- [x] Preflight OPTIONS funciona
- [x] Credentials não expostos

### Headers de Segurança
- [x] X-Content-Type-Options: nosniff
- [x] X-Frame-Options: DENY
- [x] X-XSS-Protection: 1; mode=block
- [x] Content-Security-Policy (produção)

---

## 🧪 TESTES DE INTEGRAÇÃO

### Fluxo Completo de Checkout
1. [x] Adiciona produto ao carrinho
2. [x] Cria Payment Intent
3. [x] Confirma pagamento
4. [x] Webhook cria ordem
5. [x] Carrinho limpo
6. [x] Ordem salva no D1

### Sincronização R2 → D1
1. [x] Upload imagem para R2
2. [x] Chama sync endpoint
3. [x] Categoria criada
4. [x] Produto criado
5. [x] Imagem associada

---

## 🐛 CENÁRIOS DE ERRO

### Stripe Key Inválida
- [x] Retorna 500
- [x] Mensagem de erro clara
- [x] Debug ID presente

### Produto Não Encontrado
- [x] Retorna 404
- [x] Mensagem clara
- [x] Lista produtos faltantes

### Carrinho Inválido
- [x] Retorna 400
- [x] Mensagem de validação
- [x] Lista itens inválidos

### Payload Muito Grande
- [x] Retorna 413
- [x] Mensagem clara
- [x] Limite informado

### Rate Limit Excedido
- [x] Retorna 429
- [x] Headers de retry
- [x] Mensagem clara

### Webhook Inválido
- [x] Retorna 400
- [x] Log de erro
- [x] Não processa evento

---

## 📊 TESTES DE PERFORMANCE

### Tempo de Resposta
- [x] GET /api/products: < 200ms
- [x] GET /api/products/:id: < 100ms
- [x] POST /api/checkout: < 1000ms
- [x] POST /api/payment-intent/create: < 500ms

### Throughput
- [x] Suporta 100 req/s
- [x] Degradação graciosa
- [x] Timeout configurado

### Banco de Dados
- [x] Queries otimizadas
- [x] Índices presentes
- [x] Sem N+1 queries

---

## 🔍 TESTES DE VALIDAÇÃO

### Validação de Email
- [x] Aceita emails válidos
- [x] Rejeita emails inválidos
- [x] Normaliza (trim, lowercase)
- [x] Limite de tamanho (254 chars)

### Validação de UUID
- [x] Aceita UUID v4 válido
- [x] Rejeita UUID inválido
- [x] Rejeita strings não-UUID

### Validação de Preço
- [x] Aceita 0.01 - 999999.99
- [x] Rejeita valores negativos
- [x] Rejeita valores muito grandes
- [x] Rejeita NaN/Infinity

### Validação de Quantidade
- [x] Aceita 1-99
- [x] Rejeita 0
- [x] Rejeita negativos
- [x] Rejeita > 99
- [x] Rejeita decimais

---

## 📈 MÉTRICAS

### Taxa de Sucesso
- **Meta:** > 99.9%
- **Checkout:** > 99%
- **API:** > 99.5%

### Tempo de Resposta
- **P50:** < 200ms
- **P95:** < 500ms
- **P99:** < 1000ms

### Disponibilidade
- **Meta:** 99.9% uptime
- **SLA:** 99.5%

---

**Última atualização:** 6 de Novembro de 2025

