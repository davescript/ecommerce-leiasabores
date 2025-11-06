# 🔧 Correção do Erro 405 no Checkout Stripe

## Problema Identificado

O erro **405 (Method Not Allowed)** estava ocorrendo ao tentar fazer checkout com Stripe. Este erro indica que o método HTTP (POST) não estava sendo aceito pela rota.

## Causa Raiz

O problema estava na função de proxy do Cloudflare Pages (`frontend/functions/api/[...path].ts`), que não estava passando corretamente:
1. O método HTTP (POST)
2. Os headers necessários (especialmente Content-Type)
3. O body da requisição

## Correções Implementadas

### 1. Função de Proxy Melhorada (`frontend/functions/api/[...path].ts`)

**Antes:**
- Headers não eram filtrados corretamente
- Body não era tratado adequadamente para todos os métodos
- Falta de tratamento de erros

**Depois:**
- ✅ Filtragem correta de headers (removendo host, connection, etc)
- ✅ Tratamento adequado do body para métodos POST, PUT, PATCH, DELETE
- ✅ Preservação do Content-Type
- ✅ Tratamento de erros com mensagens claras
- ✅ Logs de debug para facilitar troubleshooting

### 2. Interceptor de Resposta Melhorado (`frontend/app/lib/api-client.ts`)

**Adicionado:**
- ✅ Interceptor de resposta para tratamento específico de erros 405
- ✅ Mensagens de erro mais claras e amigáveis
- ✅ Logs detalhados para debug

## Como Testar

1. **Teste Local:**
   ```bash
   npm run dev:frontend
   npm run dev:backend
   ```
   Acesse `http://localhost:5173/checkout` e tente fazer um checkout

2. **Teste em Produção:**
   - Faça commit e push das mudanças
   - Aguarde o deploy automático
   - Teste no site em produção

## Verificações Adicionais

Se o erro persistir, verifique:

1. **Rota do Backend:**
   - A rota `/api/checkout` está registrada corretamente em `backend/src/index.ts`
   - O método POST está definido em `backend/src/routes/checkout.ts`

2. **Configuração do Cloudflare:**
   - O Worker está deployado e funcionando
   - A URL `https://api.leiasabores.pt` está acessível
   - As variáveis de ambiente estão configuradas (STRIPE_SECRET_KEY, etc)

3. **Logs:**
   - Verifique os logs do Cloudflare Workers
   - Verifique o console do navegador para erros adicionais

## Próximos Passos

Se o problema persistir após essas correções:

1. Verificar se há algum middleware bloqueando requisições POST
2. Verificar se a rota está sendo registrada antes de outros middlewares
3. Adicionar mais logs de debug no backend para identificar onde a requisição está falhando

## Arquivos Modificados

- ✅ `frontend/functions/api/[...path].ts` - Função de proxy melhorada
- ✅ `frontend/app/lib/api-client.ts` - Interceptor de resposta adicionado

## Status

✅ Correções implementadas e prontas para teste

