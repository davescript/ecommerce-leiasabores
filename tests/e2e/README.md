# Testes E2E - Playwright

## ⚠️ IMPORTANTE

Os testes E2E requerem que o servidor frontend esteja rodando. O Playwright tentará iniciar o servidor automaticamente, mas se você já tiver um servidor rodando na porta 5173, ele será reutilizado.

## Como executar

### 1. Executar todos os testes E2E
```bash
npm run test:e2e
```

### 2. Executar com UI (modo interativo)
```bash
npm run test:e2e:ui
```

### 3. Executar em modo debug
```bash
npm run test:e2e:debug
```

### 4. Executar apenas um arquivo de teste
```bash
npx playwright test tests/e2e/home.spec.ts
```

### 5. Executar apenas um navegador
```bash
npx playwright test --project=chromium
```

## Configuração

O arquivo `playwright.config.ts` está configurado para:
- Iniciar automaticamente o servidor frontend (`npm run dev:frontend`)
- Usar `http://localhost:5173` como baseURL
- Testar em 5 navegadores: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- Gerar screenshots apenas em falhas
- Gerar vídeos apenas em falhas
- Reutilizar servidor existente (se já estiver rodando)

## Solução de problemas

### Erro: "Cannot navigate to invalid URL"
**Causa:** O servidor frontend não está rodando ou não está acessível na porta 5173.

**Solução:**
1. Inicie o servidor manualmente:
   ```bash
   npm run dev:frontend
   ```
2. Aguarde até ver "Local: http://localhost:5173"
3. Execute os testes novamente

### Erro: "Port 5173 is already in use"
**Causa:** Outro processo está usando a porta 5173.

**Solução:**
1. Encontre o processo:
   ```bash
   lsof -ti:5173
   ```
2. Mate o processo:
   ```bash
   kill -9 $(lsof -ti:5173)
   ```
3. Execute os testes novamente

### Testes muito lentos
**Causa:** Múltiplos navegadores sendo testados em paralelo.

**Solução:**
1. Execute apenas um navegador:
   ```bash
   npx playwright test --project=chromium
   ```
2. Ou reduza o número de workers:
   ```bash
   npx playwright test --workers=1
   ```

## Estrutura dos testes

- `home.spec.ts` - Página inicial
- `catalog.spec.ts` - Catálogo e filtros
- `product.spec.ts` - Página de produto
- `cart.spec.ts` - Carrinho
- `checkout.spec.ts` - Checkout
- `admin.spec.ts` - Painel admin
- `404.spec.ts` - Página 404

## Relatórios

Após executar os testes, você pode ver o relatório HTML:
```bash
npx playwright show-report
```

