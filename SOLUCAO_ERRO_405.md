# 🔧 Solução para Erro 405 no Checkout Stripe

## Problema
O erro **405 (Method Not Allowed)** continua ocorrendo no checkout Stripe mesmo após as correções.

## Possíveis Causas

### 1. Função de Proxy não está sendo executada
A função `frontend/functions/api/[...path].ts` pode não estar sendo deployada ou executada corretamente pelo Cloudflare Pages.

### 2. Worker não está respondendo corretamente
O Worker do Cloudflare pode não estar configurado para aceitar requisições POST na rota `/api/checkout`.

### 3. Problema de roteamento
Pode haver um problema com o roteamento do Hono no backend.

## Soluções Implementadas

### ✅ Correção 1: Função de Proxy Melhorada
- Assinatura correta do Cloudflare Pages Functions
- Logs de debug adicionados
- Melhor tratamento de erros

### ✅ Correção 2: Fallback para API Direta
- Configuração para usar `VITE_API_URL` se disponível
- Permite chamar API diretamente sem proxy

## Próximos Passos para Resolver

### Opção 1: Usar API Direta (Recomendado para Teste Rápido)

1. **Configurar variável de ambiente no Cloudflare Pages:**
   - Vá para Cloudflare Dashboard → Pages → Seu projeto → Settings → Environment Variables
   - Adicione: `VITE_API_URL` = `https://api.leiasabores.pt/api`
   - Faça um novo deploy

2. **Ou modificar temporariamente o código:**
   ```typescript
   // Em frontend/app/lib/api-client.ts
   const api = axios.create({
     baseURL: 'https://api.leiasabores.pt/api', // API direta
     timeout: 10000,
   })
   ```

### Opção 2: Verificar e Corrigir o Proxy

1. **Verificar se a função está deployada:**
   - Cloudflare Dashboard → Pages → Seu projeto → Functions
   - Verifique se `api/[...path].ts` está listado

2. **Verificar logs:**
   - Cloudflare Dashboard → Pages → Seu projeto → Logs
   - Procure por logs com `[Proxy]` para ver o que está acontecendo

3. **Testar a função localmente:**
   ```bash
   npm run dev:frontend
   # Em outro terminal
   curl -X POST http://localhost:5173/api/checkout \
     -H "Content-Type: application/json" \
     -d '{"items":[],"email":"test@test.com"}'
   ```

### Opção 3: Verificar Backend Worker

1. **Testar diretamente o Worker:**
   ```bash
   curl -X POST https://api.leiasabores.pt/api/checkout \
     -H "Content-Type: application/json" \
     -d '{"items":[],"email":"test@test.com"}'
   ```

2. **Verificar logs do Worker:**
   - Cloudflare Dashboard → Workers & Pages → Seu Worker → Logs
   - Procure por erros relacionados a `/api/checkout`

## Verificações Importantes

### ✅ Rota está registrada?
```typescript
// backend/src/index.ts linha 380
app.route('/api/checkout', checkoutRoutes)
```

### ✅ Método POST está definido?
```typescript
// backend/src/routes/checkout.ts linha 14
router.post('/', async (c) => {
```

### ✅ CORS está configurado?
```typescript
// backend/src/index.ts - CORS está permitindo POST
```

## Solução Temporária Rápida

Se precisar resolver rapidamente, modifique temporariamente:

```typescript
// frontend/app/lib/api-client.ts
const api = axios.create({
  baseURL: 'https://api.leiasabores.pt/api', // Chamar Worker diretamente
  timeout: 10000,
})
```

Isso vai fazer as requisições irem diretamente para o Worker, sem passar pelo proxy.

## Depois de Resolver

1. Fazer commit das mudanças
2. Fazer push para GitHub
3. Aguardar deploy automático
4. Testar novamente o checkout

## Logs para Debug

Os logs agora incluem:
- `[Proxy]` - Logs da função de proxy
- Método HTTP e URL sendo chamada
- Status da resposta
- Detalhes de erros

Verifique os logs no Cloudflare Dashboard para identificar onde está falhando.

