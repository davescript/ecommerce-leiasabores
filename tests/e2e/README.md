# 🧪 Testes E2E - Admin Panel E-commerce

## 📋 Estrutura de Testes

```
tests/e2e/
├── fixtures/
│   ├── admin-auth.ts       # Fixtures de autenticação
│   └── test-image.png      # Imagem de teste
├── helpers/
│   ├── api-helpers.ts      # Helper para chamadas de API
│   ├── page-helpers.ts     # Helper para interações com páginas
│   └── test-data.ts        # Dados de teste
├── auth/
│   └── login.spec.ts       # Testes de login e autenticação
├── products/
│   ├── create.spec.ts      # Testes de criação de produtos
│   ├── edit.spec.ts        # Testes de edição de produtos
│   └── delete.spec.ts      # Testes de exclusão de produtos
├── categories/
│   └── crud.spec.ts        # Testes de CRUD de categorias
├── images/
│   └── upload.spec.ts      # Testes de upload de imagens R2
├── coupons/
│   └── crud.spec.ts        # Testes de CRUD de cupons
├── orders/
│   └── crud.spec.ts        # Testes de pedidos
├── customers/
│   └── crud.spec.ts        # Testes de clientes
├── dashboard/
│   └── stats.spec.ts       # Testes do dashboard
├── api/
│   └── products-api.spec.ts # Testes diretos da API
└── sync/
    └── admin-public-sync.spec.ts # Testes de sincronização
```

## 🚀 Como Executar

### Instalar dependências
```bash
npm install
```

### Executar todos os testes
```bash
npm run test:e2e
```

### Executar testes em modo UI
```bash
npm run test:e2e:ui
```

### Executar testes em modo debug
```bash
npm run test:e2e:debug
```

### Executar testes específicos
```bash
npx playwright test tests/e2e/products/create.spec.ts
```

### Executar testes em navegador específico
```bash
npx playwright test --project=chromium
```

## ⚙️ Configuração

### Variáveis de Ambiente

```bash
# URL base do frontend
PLAYWRIGHT_TEST_BASE_URL=http://localhost:5173

# URL da API
PLAYWRIGHT_API_URL=https://api.leiasabores.pt/api
```

### Credenciais de Teste

As credenciais padrão estão em `tests/e2e/fixtures/admin-auth.ts`:

```typescript
TEST_ADMIN_CREDENTIALS = {
  email: 'admin@leiasabores.pt',
  password: 'admin123',
}
```

## 📝 Estrutura dos Testes

### Fixtures

Fixtures fornecem autenticação automática e helpers:

```typescript
test('meu teste', async ({ adminPage, adminApi, adminToken }) => {
  // adminPage: Page autenticada
  // adminApi: APIRequestContext para chamadas de API
  // adminToken: Token de autenticação
})
```

### Helpers

#### AdminAPIHelper
Helper para chamadas de API:

```typescript
const apiHelper = new AdminAPIHelper(adminApi, baseURL, adminToken)
const product = await apiHelper.createProduct({ name: 'Produto Teste', price: 10 })
```

#### AdminPageHelper
Helper para interações com páginas:

```typescript
const pageHelper = new AdminPageHelper(page)
await pageHelper.goToProducts()
await pageHelper.clickButton('Salvar')
```

## ✅ Testes Implementados

### Autenticação
- [x] Login válido
- [x] Login inválido
- [x] Logout
- [x] Sessão persistente
- [x] RBAC (admin, editor, viewer)

### Produtos
- [x] Criar produto
- [x] Editar produto (nome, preço, descrição, categoria, status)
- [x] Deletar produto
- [x] Validações (campos obrigatórios, preço, preço promocional)
- [x] Upload de imagem
- [x] Sincronização com site público

### Categorias
- [x] Criar categoria
- [x] Editar categoria
- [x] Criar subcategoria
- [x] Deletar categoria (com validação de produtos)

### Imagens R2
- [x] Upload de imagem válida
- [x] Validação de tamanho (10MB)
- [x] Validação de tipo MIME
- [x] Deletar imagem
- [x] URL pública válida

### Cupons
- [x] Criar cupom
- [x] Validação de datas
- [x] Validação de código único

### Pedidos
- [x] Listar pedidos
- [x] Atualizar status

### Clientes
- [x] Listar clientes
- [x] Editar cliente

### Dashboard
- [x] Carregar estatísticas
- [x] Exibir gráficos sem erros

### API
- [x] Testes diretos da API
- [x] Validação de autenticação
- [x] Validação de erros (400, 401, 403, 404, 500)

### Sincronização
- [x] Atualização de produto → site público
- [x] Cache busting

## 🔧 Troubleshooting

### Erro: "Test timeout"
Aumente o timeout no `playwright.config.ts`:

```typescript
timeout: 60 * 1000, // 60 segundos
```

### Erro: "Element not found"
Use seletores mais específicos ou aguarde elementos carregarem:

```typescript
await page.waitForSelector('selector', { timeout: 10000 })
```

### Erro: "401 Unauthorized"
Verifique se as credenciais de teste estão corretas e se o admin user existe no banco.

## 📊 Relatórios

Após executar os testes, os relatórios estarão em:

- **HTML**: `playwright-report/index.html`
- **JSON**: `test-results/results.json`
- **JUnit**: `test-results/junit.xml`

## 🎯 Próximos Passos

1. Adicionar mais testes de stress
2. Adicionar testes de dark mode
3. Adicionar testes de configurações
4. Adicionar snapshots visuais
5. Adicionar testes de performance
