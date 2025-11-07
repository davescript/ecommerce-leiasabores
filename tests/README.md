# 🧪 Testes - Leia Sabores

Estrutura completa de testes para o e-commerce Leia Sabores.

## 📁 Estrutura

```
tests/
├── unit/           # Testes unitários (Vitest)
│   ├── formatPrice.test.ts
│   ├── phone-utils.test.ts
│   ├── useCart.test.ts
│   ├── fetchProducts.test.ts
│   ├── ProductCard.test.tsx
│   ├── utils.test.ts
│   ├── vitest.config.ts
│   └── setup.ts
└── e2e/            # Testes end-to-end (Playwright)
    ├── home.spec.ts
    ├── catalog.spec.ts
    ├── product.spec.ts
    ├── cart.spec.ts
    ├── checkout.spec.ts
    ├── admin.spec.ts
    ├── 404.spec.ts
    └── playwright.config.ts
```

## 🚀 Instalação

```bash
npm install
```

Isso instalará todas as dependências necessárias, incluindo:
- `vitest` - Testes unitários
- `@testing-library/react` - Utilitários para testar React
- `@playwright/test` - Testes E2E
- `jsdom` - Ambiente DOM para testes

## 🧪 Testes Unitários

### Executar todos os testes
```bash
npm run test:unit
```

### Executar em modo watch
```bash
npm run test:unit:watch
```

### Executar com UI
```bash
npm run test:unit:ui
```

### Cobertura de código
```bash
npm run test:unit -- --coverage
```

## 🎭 Testes E2E

### Executar todos os testes E2E
```bash
npm run test:e2e
```

### Executar com UI
```bash
npm run test:e2e:ui
```

### Executar em modo debug
```bash
npm run test:e2e:debug
```

### Executar em navegador específico
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

### Instalar browsers do Playwright
```bash
npx playwright install
```

## 📊 Executar Todos os Testes

```bash
npm run test:all
```

## 📝 Escrevendo Testes

### Testes Unitários

Exemplo de teste unitário:

```typescript
import { describe, it, expect } from 'vitest'
import { formatPrice } from '../../frontend/app/lib/utils'

describe('formatPrice', () => {
  it('should format positive values correctly', () => {
    expect(formatPrice(10)).toBe('10,00 €')
  })
})
```

### Testes E2E

Exemplo de teste E2E:

```typescript
import { test, expect } from '@playwright/test'

test('should load home page', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Leia Sabores/i)
})
```

## 🔧 Configuração

### Vitest

Configuração em `tests/unit/vitest.config.ts`:
- Ambiente: `jsdom`
- Aliases configurados para imports
- Coverage com v8

### Playwright

Configuração em `tests/e2e/playwright.config.ts`:
- Base URL: `http://localhost:5173`
- Múltiplos projetos (Chrome, Firefox, Safari, Mobile)
- Screenshots e vídeos em falhas
- Web server automático

## 📈 CI/CD

Os testes são executados automaticamente no GitHub Actions:
- Lint e format check
- Type check
- Testes unitários (Node 18 e 20)
- Testes E2E
- Build frontend e backend
- Deploy automático (apenas em main/master)

## 🐛 Debugging

### Testes Unitários
```bash
# Com breakpoints
npm run test:unit:watch -- --inspect-brk
```

### Testes E2E
```bash
# Modo debug com Playwright Inspector
npm run test:e2e:debug
```

## 📊 Cobertura

Meta de cobertura:
- **Componentes:** > 80%
- **Hooks:** > 90%
- **Utils:** > 95%
- **API Client:** > 85%

Ver cobertura:
```bash
npm run test:unit -- --coverage
open coverage/index.html
```

## ✅ Checklist de Testes

Antes de fazer commit:
- [ ] Todos os testes unitários passando
- [ ] Todos os testes E2E passando
- [ ] Cobertura acima da meta
- [ ] Sem warnings ou erros
- [ ] Lint passando
- [ ] Type check passando

## 🚨 Troubleshooting

### Erro: "Cannot find module"
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Playwright browsers not installed"
```bash
npx playwright install --with-deps
```

### Testes E2E falhando
1. Verificar se o servidor está rodando: `npm run dev:frontend`
2. Verificar base URL no `playwright.config.ts`
3. Executar em modo debug: `npm run test:e2e:debug`

---

**Última atualização:** 6 de Novembro de 2025

