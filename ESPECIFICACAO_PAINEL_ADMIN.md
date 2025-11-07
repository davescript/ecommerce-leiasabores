# 🎯 Especificação Técnica: Painel Administrativo Leia Sabores

## 📋 Visão Geral

Painel administrativo completo e profissional para gerenciar o e-commerce Leia Sabores, com funcionalidades no nível de Shopify, WooCommerce e Stripe Dashboard.

---

## 🏗️ Arquitetura

### Estrutura de Arquivos

```
frontend/app/
├── pages/
│   └── admin/
│       ├── Dashboard.tsx          # Dashboard principal com KPIs
│       ├── Products/
│       │   ├── index.tsx          # Lista de produtos
│       │   ├── Create.tsx          # Criar produto
│       │   ├── Edit.tsx            # Editar produto
│       │   └── components/
│       │       ├── ProductForm.tsx
│       │       ├── ImageUploader.tsx
│       │       └── VariantsEditor.tsx
│       ├── Categories/
│       │   ├── index.tsx
│       │   └── components/
│       │       └── CategoryTree.tsx
│       ├── Orders/
│       │   ├── index.tsx
│       │   ├── [id].tsx
│       │   └── components/
│       │       └── OrderStatusBadge.tsx
│       ├── Coupons/
│       │   ├── index.tsx
│       │   └── Create.tsx
│       ├── Customers/
│       │   ├── index.tsx
│       │   └── [id].tsx
│       ├── Marketing/
│       │   ├── Banners.tsx
│       │   ├── Campaigns.tsx
│       │   └── SEO.tsx
│       ├── Settings/
│       │   ├── General.tsx
│       │   ├── Shipping.tsx
│       │   ├── Payments.tsx
│       │   └── Integrations.tsx
│       ├── Content/
│       │   ├── Blog/
│       │   │   ├── index.tsx
│       │   │   └── [id].tsx
│       │   └── Pages.tsx
│       └── Users/
│           ├── index.tsx
│           └── Permissions.tsx
├── components/
│   └── admin/
│       ├── AdminLayout.tsx         # Layout com sidebar
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       ├── KPI Card.tsx
│       ├── DataTable.tsx
│       ├── RichTextEditor.tsx
│       ├── ImageCropper.tsx
│       └── Chart.tsx
└── hooks/
    └── admin/
        ├── useDashboard.ts
        ├── useProducts.ts
        ├── useOrders.ts
        └── useAnalytics.ts

backend/src/
├── routes/
│   ├── admin/
│   │   ├── dashboard.ts
│   │   ├── products.ts
│   │   ├── categories.ts
│   │   ├── orders.ts
│   │   ├── coupons.ts
│   │   ├── customers.ts
│   │   ├── marketing.ts
│   │   ├── settings.ts
│   │   ├── content.ts
│   │   └── users.ts
│   └── analytics.ts
└── services/
    ├── analytics.ts
    ├── email.ts
    └── seo.ts
```

---

## 📊 1. Dashboard Geral

### KPIs (Key Performance Indicators)

**Cards de Métricas:**
- Vendas hoje (€)
- Vendas esta semana (€)
- Vendas este mês (€)
- Ticket médio (€)
- Pedidos hoje
- Taxa de conversão (%)
- Carrinhos abandonados
- Produtos em estoque baixo

**Gráficos:**
- Vendas últimos 30 dias (linha)
- Visitantes vs Conversões (duplo eixo)
- Top 5 produtos mais vendidos (barra)
- Métodos de pagamento (pizza)

**Alertas:**
- Estoque baixo (< 5 unidades)
- Pagamentos falhados (últimas 24h)
- Webhooks Stripe com erro
- Imagens ausentes no R2

**Tabelas:**
- Pedidos recentes (últimos 10)
- Clientes novos (últimos 5)
- Produtos mais vendidos

---

## 🛍️ 2. Gestão de Produtos

### Funcionalidades Principais

**Lista de Produtos:**
- Tabela com paginação
- Filtros: categoria, status, estoque
- Busca por nome/SKU
- Ordenação: nome, preço, vendas, data
- Ações em massa: ativar/desativar, deletar, exportar

**Formulário de Produto:**
- **Informações Básicas:**
  - Nome (obrigatório)
  - Slug (gerado automaticamente, editável)
  - Categoria (dropdown com busca)
  - Subcategoria (opcional)
  - Coleções (multiselect com tags)
  - Status: Ativo / Inativo / Rascunho

- **Preços:**
  - Preço (obrigatório, min: 0.01)
  - Preço original (para mostrar desconto)
  - Custo (opcional, para margem)

- **Inventário:**
  - Quantidade em estoque
  - SKU (código único)
  - Gerenciar estoque (sim/não)
  - Em estoque / Esgotado (toggle)

- **Descrições:**
  - Descrição curta (meta description, max 160 chars)
  - Descrição longa (Rich Text Editor)
  - Características (lista)

- **SEO:**
  - Meta Title (gerado automaticamente, editável)
  - Meta Description (gerado automaticamente, editável)
  - URL amigável (preview)
  - Open Graph Image

- **Tags:**
  - Input com autocomplete
  - Sugestões baseadas em produtos similares
  - Tags populares

- **Imagens:**
  - Upload com drag & drop
  - Crop e redimensionamento
  - Ordenação por arrastar
  - Seleção de imagem principal
  - Preview em tempo real
  - Upload direto para R2
  - Geração automática de thumbnails

- **Variantes (opcional):**
  - Cor (seletor de cor)
  - Tamanho (dropdown)
  - Personalização (texto livre)
  - Preço por variante

**Ações Avançadas:**
- Duplicar produto
- Arquivar / Restaurar
- Preview público
- Exportar CSV
- Histórico de alterações

---

## 📁 3. Categorias & Coleções

### Categorias

**Estrutura Hierárquica:**
- Categoria pai
- Subcategorias (ilimitadas)
- Árvore visual drag & drop

**Campos:**
- Nome
- Slug
- Descrição
- Imagem (upload R2)
- Ordem de exibição
- Status: Ativa / Inativa
- Contador automático de produtos

**Funcionalidades:**
- Criar/editar/deletar
- Reordenar por arrastar
- Ver produtos da categoria
- Filtrar produtos por categoria

### Coleções

**Tipos:**
- Manual (selecionar produtos)
- Automática (por regras: tags, categoria, preço)

**Campos:**
- Nome
- Descrição
- Imagem de capa
- Regras (se automática)
- Produtos (se manual)

---

## 📦 4. Gestão de Pedidos

### Lista de Pedidos

**Filtros:**
- Status: Todos / Pago / Pendente / Falhado / Reembolsado / Enviado / Entregue
- Período: Hoje / Semana / Mês / Personalizado
- Cliente (busca)
- Valor mínimo/máximo

**Colunas:**
- ID do pedido
- Cliente
- Data
- Total
- Status
- Método de pagamento
- Ações

**Ações:**
- Ver detalhes
- Atualizar status
- Reembolsar
- Enviar email
- Imprimir fatura
- Exportar

### Detalhes do Pedido

**Informações:**
- Dados do cliente
- Endereço de entrega
- Endereço de faturação
- Produtos (lista com imagens)
- Subtotal, IVA, frete, total
- ID Stripe
- Status do pagamento
- Histórico de status
- Notas internas

**Ações:**
- Atualizar status
- Adicionar nota
- Enviar email ao cliente
- Reembolsar (parcial ou total)
- Marcar como enviado
- Gerar etiqueta de envio

---

## 🎟️ 5. Descontos & Cupons

### Tipos de Desconto

**Percentagem:**
- Ex: 10% de desconto

**Valor Fixo:**
- Ex: €5 de desconto

**Frete Grátis:**
- Apenas frete grátis

### Regras

**Aplicação:**
- Mínimo de compra (€)
- Apenas primeira compra
- Apenas certas categorias
- Apenas certos produtos
- Excluir produtos em promoção

**Limites:**
- Data de início
- Data de fim
- Usos máximos
- Usos por cliente

**Código:**
- Gerar automaticamente ou personalizado
- Prefixo opcional
- Validação de formato

### Dashboard

- Total de cupons criados
- Cupons ativos
- Total usado
- Valor descontado
- Taxa de uso

---

## 📢 6. Marketing

### Banners

- Criar/editar/deletar
- Upload de imagem
- Link de destino
- Ordem de exibição
- Período de exibição
- Status: Ativo / Inativo

### Campanhas

- Nome da campanha
- Tipo: Banner / Pop-up / Email
- Conteúdo (editor visual)
- Público-alvo
- Período
- Métricas: impressões, cliques, conversões

### SEO Global

- Title padrão
- Meta description padrão
- OG Image
- Twitter Card
- Sitemap.xml (geração automática)
- Robots.txt

### Pixels

- Facebook Pixel ID
- TikTok Pixel ID
- Google Analytics ID
- Google Tag Manager

---

## 👥 7. Gestão de Clientes

### Lista de Clientes

**Filtros:**
- Busca por nome/email
- Clientes VIP
- Clientes inativos
- Última compra

**Informações:**
- Nome
- Email
- Total gasto
- Número de pedidos
- Última compra
- Status

### Detalhes do Cliente

**Dados:**
- Informações pessoais
- Endereços salvos
- Histórico de compras
- Carrinho atual (se houver)
- Carrinhos abandonados
- Notas internas

**Ações:**
- Enviar email personalizado
- Criar pedido manual
- Aplicar desconto
- Desativar conta
- Exportar dados

---

## ⚙️ 8. Configurações Gerais

### Geral

- Nome da loja
- Logo (upload)
- Favicon (upload)
- Email de suporte
- Telefone
- Endereço completo
- Descrição da loja

### Tema

- Cores primárias
- Cores secundárias
- Fontes
- Preview em tempo real

### Frete

- Tabela de preços por peso/valor
- Frete grátis acima de X€
- Entrega express (preço e prazo)
- Zonas de entrega
- Prazos de entrega

### Pagamentos

**Stripe:**
- Test Key (mostrar últimos 4 caracteres)
- Live Key (mostrar últimos 4 caracteres)
- Webhook Secret
- Testar conexão

**Outros:**
- MB Way
- Multibanco
- PayPal (se configurado)

### Integrações

**Cloudflare R2:**
- Bucket name
- Endpoint
- Access Key ID (mostrar últimos 4)
- Secret Access Key (mostrar últimos 4)
- Testar conexão

**Email:**
- SMTP Host
- SMTP Port
- SMTP User
- SMTP Password
- Email de teste

---

## 📝 9. Gestão de Conteúdo (CMS)

### Blog

**Posts:**
- Título
- Slug
- Autor
- Data de publicação
- Categoria
- Tags
- Imagem destacada
- Conteúdo (Rich Text Editor)
- SEO (title, description)
- Status: Rascunho / Publicado

**Categorias:**
- Nome
- Slug
- Descrição

### Páginas

- Sobre
- Contato
- Termos
- Política de Privacidade
- FAQ
- Envios

Editor visual para cada página.

---

## 👤 10. Usuários & Permissões

### Níveis de Acesso

**Super Admin:**
- Acesso total
- Pode criar/editar/deletar usuários
- Pode alterar configurações

**Editor:**
- Pode criar/editar produtos
- Pode criar/editar conteúdo
- Não pode ver vendas
- Não pode alterar configurações

**Operador de Pedidos:**
- Pode ver pedidos
- Pode atualizar status
- Pode ver clientes
- Não pode editar produtos

**Gerente de Marketing:**
- Pode criar campanhas
- Pode criar cupons
- Pode ver analytics
- Não pode editar produtos

### Permissões Granulares

- Ver dashboard
- Ver vendas
- Editar produtos
- Deletar produtos
- Criar cupons
- Ver clientes
- Editar configurações
- Gerenciar usuários

---

## 🎨 11. UX/UI

### Design System

**Cores:**
- Primary: #8B5CF6 (roxo)
- Secondary: #1F2937 (cinza escuro)
- Success: #10B981 (verde)
- Warning: #F59E0B (amarelo)
- Error: #EF4444 (vermelho)
- Background: #F9FAFB (cinza claro)

**Tipografia:**
- Headings: Inter, sans-serif
- Body: Inter, sans-serif
- Monospace: JetBrains Mono

**Componentes:**
- Cards com sombra suave
- Botões arredondados
- Inputs com foco destacado
- Tabelas com hover
- Modais com backdrop blur
- Toasts profissionais

### Layout

**Sidebar:**
- Ícones + texto
- Badges de notificação
- Seção ativa destacada
- Colapsável em mobile

**Header:**
- Breadcrumbs
- Busca global
- Notificações
- Perfil do usuário
- Toggle tema claro/escuro

**Conteúdo:**
- Container responsivo
- Padding consistente
- Grid system
- Animações suaves

---

## 🤖 12. IA para SEO e Conteúdo

### Funcionalidades

**Gerador de Descrição:**
- Input: nome do produto, categoria
- Output: descrição persuasiva e otimizada

**Gerador de Tags:**
- Input: nome, categoria, descrição
- Output: tags relevantes

**Otimizador de SEO:**
- Analisa título e descrição
- Sugere melhorias
- Score de SEO (0-100)

**Gerador de Títulos:**
- Input: produto
- Output: títulos otimizados para conversão

---

## 🔌 APIs Necessárias

### Backend Routes

```
GET    /api/admin/dashboard          # KPIs e gráficos
GET    /api/admin/products           # Lista de produtos
POST   /api/admin/products           # Criar produto
GET    /api/admin/products/:id       # Detalhes do produto
PUT    /api/admin/products/:id       # Atualizar produto
DELETE /api/admin/products/:id      # Deletar produto
POST   /api/admin/products/:id/duplicate # Duplicar

GET    /api/admin/categories         # Lista de categorias
POST   /api/admin/categories         # Criar categoria
PUT    /api/admin/categories/:id     # Atualizar categoria
DELETE /api/admin/categories/:id    # Deletar categoria

GET    /api/admin/orders             # Lista de pedidos
GET    /api/admin/orders/:id         # Detalhes do pedido
PUT    /api/admin/orders/:id/status  # Atualizar status

GET    /api/admin/coupons            # Lista de cupons
POST   /api/admin/coupons            # Criar cupom
PUT    /api/admin/coupons/:id        # Atualizar cupom
DELETE /api/admin/coupons/:id       # Deletar cupom

GET    /api/admin/customers          # Lista de clientes
GET    /api/admin/customers/:id      # Detalhes do cliente

GET    /api/admin/analytics          # Dados de analytics
POST   /api/admin/ai/generate        # Gerar conteúdo com IA
```

---

## 📦 Dependências Necessárias

### Frontend

```json
{
  "@tanstack/react-query": "^5.28.0",
  "recharts": "^2.10.0",              // Gráficos
  "react-hook-form": "^7.48.0",       // Formulários
  "zod": "^3.22.0",                   // Validação
  "@hookform/resolvers": "^3.3.0",
  "react-quill": "^2.0.0",            // Rich Text Editor
  "react-dropzone": "^14.2.0",        // Upload de arquivos
  "react-beautiful-dnd": "^13.1.1",   // Drag & drop
  "date-fns": "^2.30.0",              // Datas
  "lucide-react": "^0.292.0",         // Ícones
  "sonner": "^1.7.2",                 // Toasts
  "cmdk": "^0.2.0"                    // Command palette
}
```

---

## 🚀 Fases de Implementação

### Fase 1: Fundação (Prioridade Alta)
1. Layout com sidebar
2. Dashboard básico com KPIs
3. CRUD de produtos melhorado
4. Gestão de pedidos básica

### Fase 2: Funcionalidades Core (Prioridade Alta)
5. Categorias e coleções
6. Cupons e descontos
7. Gestão de clientes
8. Configurações gerais

### Fase 3: Marketing e Conteúdo (Prioridade Média)
9. Marketing (banners, campanhas)
10. CMS (blog, páginas)
11. SEO avançado

### Fase 4: Avançado (Prioridade Baixa)
12. Usuários e permissões
13. IA para SEO
14. Analytics avançado

---

**Última atualização:** 7 de Novembro de 2025

