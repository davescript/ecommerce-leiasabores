# 🧪 Frontend Tests - Leia Sabores

**Stack:** React + Vite + Tailwind + React Router  
**Ferramentas:** Vitest, React Testing Library, Playwright

---

## 📋 TESTES UNITÁRIOS

### Componentes

#### ProductCard
- [x] Renderiza produto corretamente
- [x] Exibe imagem do produto
- [x] Exibe preço formatado
- [x] Exibe desconto se houver
- [x] Exibe tag "Esgotado" se inStock = false
- [x] Chama onAddToCart ao clicar no botão
- [x] Fallback para imagem quebrada
- [x] Lazy loading de imagens
- [x] Responsividade (mobile/desktop)

#### Header
- [x] Renderiza logo e links
- [x] Menu mobile abre/fecha
- [x] Busca funciona
- [x] Contador de carrinho atualiza
- [x] Navegação entre páginas
- [x] Drawer de categorias funciona

#### Footer
- [x] Links funcionando
- [x] Informações de contato corretas
- [x] Links de redes sociais
- [x] Responsividade

#### Button
- [x] Renderiza com variantes (default, outline, ghost)
- [x] Renderiza com tamanhos (sm, md, lg)
- [x] Estado disabled
- [x] Estado loading
- [x] onClick funciona
- [x] Acessibilidade (aria-label)

#### CartDrawer
- [x] Abre/fecha corretamente
- [x] Lista itens do carrinho
- [x] Atualiza quantidade
- [x] Remove item
- [x] Calcula total correto
- [x] Botão checkout funciona

### Hooks

#### useCart
- [x] Adiciona item ao carrinho
- [x] Remove item do carrinho
- [x] Atualiza quantidade
- [x] Limpa carrinho
- [x] Calcula subtotal
- [x] Calcula IVA (23%)
- [x] Calcula portes (grátis > 39€)
- [x] Calcula total
- [x] Persistência no localStorage
- [x] Migração de carrinho antigo

#### useSEO
- [x] Atualiza title da página
- [x] Atualiza meta description
- [x] Atualiza og:image
- [x] Atualiza robots meta
- [x] Limpa meta tags ao desmontar

### Utilitários

#### formatPrice
- [x] Formata valores em euros
- [x] Adiciona símbolo €
- [x] Formata decimais (2 casas)
- [x] Trata valores zero
- [x] Trata valores negativos
- [x] Trata valores muito grandes

#### phone-utils
- [x] Valida telefone português
- [x] Formata telefone
- [x] Sanitiza telefone
- [x] Aceita +351
- [x] Aceita 00351
- [x] Aceita formato local

#### logger
- [x] Log apenas em desenvolvimento
- [x] Níveis de log (debug, info, warn, error)
- [x] Timestamp nos logs
- [x] Não loga em produção (exceto errors)

### API Client

#### api-client.ts
- [x] Configura baseURL corretamente
- [x] Adiciona headers corretos
- [x] Intercepta requisições
- [x] Intercepta respostas
- [x] Trata erros 404
- [x] Trata erros 500
- [x] Trata timeout
- [x] Trata erros de rede
- [x] Adiciona token de autenticação

---

## 🎭 TESTES DE INTEGRAÇÃO

### Fluxo de Compra Completo
1. [x] Usuário navega para catálogo
2. [x] Filtra produtos por categoria
3. [x] Adiciona produto ao carrinho
4. [x] Vai para carrinho
5. [x] Atualiza quantidade
6. [x] Vai para checkout
7. [x] Preenche formulário de entrega
8. [x] Valida formulário
9. [x] Cria Payment Intent
10. [x] Processa pagamento (mock)
11. [x] Redireciona para sucesso
12. [x] Limpa carrinho

### Navegação SPA
1. [x] Navega entre páginas sem reload
2. [x] Histórico do browser funciona
3. [x] Deep linking funciona
4. [x] Rotas protegidas redirecionam
5. [x] Rota 404 mostra página customizada

---

## 🖥️ TESTES E2E (Playwright)

### Home Page
- [x] Carrega corretamente
- [x] Hero section visível
- [x] Categorias carregam
- [x] Produtos em destaque carregam
- [x] Links funcionam
- [x] Responsivo em mobile

### Catálogo
- [x] Lista produtos
- [x] Filtros funcionam
- [x] Busca funciona
- [x] Ordenação funciona
- [x] Paginação funciona
- [x] Produtos clicáveis

### Página de Produto
- [x] Carrega informações do produto
- [x] Galeria de imagens funciona
- [x] Adiciona ao carrinho
- [x] Atualiza quantidade
- [x] Botão desabilitado se esgotado
- [x] Reviews carregam

### Carrinho
- [x] Lista itens
- [x] Atualiza quantidade
- [x] Remove item
- [x] Calcula total correto
- [x] Botão checkout funciona
- [x] Persistência funciona

### Checkout
- [x] Formulário de entrega
- [x] Validações funcionam
- [x] Cria Payment Intent
- [x] Stripe Elements carrega
- [x] Processa pagamento (mock)
- [x] Redireciona para sucesso

### Admin
- [x] Requer autenticação
- [x] Lista produtos
- [x] Cria produto
- [x] Edita produto
- [x] Deleta produto (com confirmação)
- [x] Upload de imagem

---

## 📱 TESTES RESPONSIVOS

### Mobile (iPhone 12 - 390x844)
- [x] Header compacto
- [x] Menu mobile funciona
- [x] Catálogo em 2 colunas
- [x] Produto responsivo
- [x] Carrinho responsivo
- [x] Checkout responsivo
- [x] Barras fixas não sobrepõem conteúdo

### Tablet (iPad - 768x1024)
- [x] Layout adaptativo
- [x] Grid de produtos
- [x] Navegação funciona

### Desktop (1280x720)
- [x] Layout completo
- [x] Sidebar de filtros
- [x] Navegação horizontal

---

## ⚡ TESTES DE PERFORMANCE

### Lighthouse
- [x] Performance > 90
- [x] Accessibility > 90
- [x] Best Practices > 90
- [x] SEO > 90

### Core Web Vitals
- [x] LCP < 2.5s
- [x] FCP < 1.8s
- [x] CLS < 0.1
- [x] TBT < 200ms

### Bundle Size
- [x] JS inicial < 200KB
- [x] CSS < 50KB
- [x] Code splitting funcionando
- [x] Lazy loading funcionando

---

## 🔒 TESTES DE SEGURANÇA

### XSS
- [x] Inputs sanitizados
- [x] Não usa dangerouslySetInnerHTML
- [x] CSP headers corretos

### CSRF
- [x] Tokens em formulários
- [x] Headers CORS corretos

### Validação de Entrada
- [x] Email validado
- [x] Telefone validado
- [x] Código postal validado
- [x] Preços validados
- [x] Quantidades validadas

---

## 🐛 CENÁRIOS DE ERRO

### API Indisponível
- [x] Mensagem de erro amigável
- [x] Botão de retry
- [x] Fallback para dados locais

### Produto Não Encontrado
- [x] Página 404 customizada
- [x] Links para navegação
- [x] Mensagem clara

### Pagamento Falhado
- [x] Mensagem de erro
- [x] Opção de tentar novamente
- [x] Não limpa carrinho

### Imagem Quebrada
- [x] Fallback para placeholder
- [x] Alt text presente
- [x] Não quebra layout

---

## 📊 COBERTURA DE TESTES

### Meta de Cobertura
- **Componentes:** > 80%
- **Hooks:** > 90%
- **Utils:** > 95%
- **API Client:** > 85%

### Arquivos Críticos (100% cobertura)
- `formatPrice`
- `isValidEmail`
- `validateCartItems`
- `useCart` (lógica de cálculo)
- `ProtectedRoute`

---

**Última atualização:** 6 de Novembro de 2025

