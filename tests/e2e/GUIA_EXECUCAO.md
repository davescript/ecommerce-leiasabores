# 🚀 Guia de Execução dos Testes E2E

## 📋 Pré-requisitos

1. **Node.js 18+** instalado
2. **Admin user** criado no banco de dados
3. **API rodando** (local ou produção)
4. **Frontend rodando** (local ou produção)

## 🛠️ Setup Inicial

### 1. Instalar Dependências
```bash
npm install
```

### 2. Instalar Playwright Browsers
```bash
npm run test:e2e:setup
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.test` ou configure as variáveis:

```bash
# URL do frontend (local ou produção)
PLAYWRIGHT_TEST_BASE_URL=http://localhost:5173

# URL da API (local ou produção)
PLAYWRIGHT_API_URL=https://api.leiasabores.pt/api
```

### 4. Verificar Credenciais de Teste

Edite `tests/e2e/fixtures/admin-auth.ts` se necessário:

```typescript
export const TEST_ADMIN_CREDENTIALS = {
  email: 'admin@leiasabores.pt',
  password: 'admin123',
}
```

**Importante:** Certifique-se de que o admin user existe no banco!

## ▶️ Executar Testes

### Executar Todos os Testes
```bash
npm run test:e2e
```

### Executar Testes em Modo UI (Interativo)
```bash
npm run test:e2e:ui
```

### Executar Testes em Modo Debug
```bash
npm run test:e2e:debug
```

### Executar Testes com Browser Visível
```bash
npm run test:e2e:headed
```

### Executar Testes Específicos
```bash
# Testes de produtos
npx playwright test tests/e2e/products/

# Testes de autenticação
npx playwright test tests/e2e/auth/

# Teste específico
npx playwright test tests/e2e/products/create.spec.ts
```

### Executar Testes em Navegador Específico
```bash
npm run test:e2e:chromium
```

## 📊 Ver Relatórios

### Relatório HTML
```bash
npm run test:e2e:report
```

O relatório estará disponível em `playwright-report/index.html`

### Relatório JSON
```bash
cat test-results/results.json
```

## 🔧 Troubleshooting

### Erro: "Test timeout"
**Solução:** Aumente o timeout no `playwright.config.ts`:

```typescript
timeout: 60 * 1000, // 60 segundos
```

### Erro: "401 Unauthorized"
**Solução:** 
1. Verifique se o admin user existe no banco
2. Verifique as credenciais em `tests/e2e/fixtures/admin-auth.ts`
3. Execute o seed do admin: `npm run seed:admin`

### Erro: "Element not found"
**Solução:** 
1. Aumente o timeout de wait
2. Use seletores mais específicos
3. Verifique se o elemento realmente existe na página

### Erro: "Network error"
**Solução:**
1. Verifique se a API está rodando
2. Verifique a URL da API em `PLAYWRIGHT_API_URL`
3. Verifique se há problemas de CORS

### Erro: "Page not found"
**Solução:**
1. Verifique se o frontend está rodando
2. Verifique a URL do frontend em `PLAYWRIGHT_TEST_BASE_URL`
3. Verifique se a rota existe no frontend

## 📝 Estrutura dos Testes

```
tests/e2e/
├── fixtures/          # Fixtures de autenticação
├── helpers/           # Helpers (API, Page, Test Data)
├── auth/              # Testes de autenticação
├── products/          # Testes de produtos
├── categories/        # Testes de categorias
├── images/            # Testes de upload R2
├── coupons/           # Testes de cupons
├── orders/            # Testes de pedidos
├── customers/         # Testes de clientes
├── dashboard/         # Testes do dashboard
├── api/               # Testes diretos da API
├── sync/              # Testes de sincronização
├── dark-mode/         # Testes de dark mode
└── stress/            # Testes de stress
```

## ✅ Checklist de Execução

Antes de executar os testes:

- [ ] Admin user existe no banco
- [ ] API está rodando e acessível
- [ ] Frontend está rodando e acessível
- [ ] Credenciais de teste estão corretas
- [ ] Variáveis de ambiente estão configuradas
- [ ] Playwright browsers estão instalados

## 🎯 Resultado Esperado

Após executar todos os testes, você deve ver:

```
Running 50+ tests...
✓ 50+ passed
✗ 0 failed
```

Se houver falhas, verifique o relatório HTML para detalhes.

---

**Boa sorte com os testes! 🚀**

