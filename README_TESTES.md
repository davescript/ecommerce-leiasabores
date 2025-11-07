# 🧪 Guia de Testes

## Scripts de Teste Disponíveis

### 1. `test-api-complete.sh` - Testes Completos
Testa todos os endpoints principais da API.

```bash
# Testar localmente
./test-api-complete.sh http://localhost:8787/api

# Testar em produção
./test-api-complete.sh https://api.leiasabores.pt/api
```

**Testa:**
- ✅ Health check
- ✅ Categories
- ✅ Products
- ✅ Products com filtros
- ✅ Payment Intent
- ✅ R2 Auto-Sync Status

---

### 2. `test-payment-intent.sh` - Testes de Payment Intent
Testa especificamente o sistema de Payment Intents.

```bash
# Testar localmente
./test-payment-intent.sh http://localhost:8787/api

# Testar em produção
./test-payment-intent.sh https://api.leiasabores.pt/api
```

**Testa:**
- ✅ Health check
- ✅ Criação de Payment Intent
- ✅ Validação de email
- ✅ Validação de carrinho vazio

**Nota:** Precisa de produtos válidos no banco para funcionar completamente.

---

### 3. `test-r2-sync.sh` - Testes de Sincronização R2
Testa a sincronização automática R2 → D1.

```bash
# Testar localmente
./test-r2-sync.sh http://localhost:8787/api SEED_TOKEN prefixo

# Exemplo
./test-r2-sync.sh http://localhost:8787/api seed-topos-20251105 topos-de-bolo
```

**Testa:**
- ✅ Status do R2
- ✅ Sincronização R2 → D1
- ✅ Estatísticas de sincronização

---

### 4. `test-local.sh` - Testes Locais Automáticos
Inicia o servidor local e executa todos os testes.

```bash
./test-local.sh
```

**Funcionalidades:**
- ✅ Inicia servidor local automaticamente
- ✅ Executa todos os testes
- ✅ Para o servidor ao finalizar

---

## Testes Manuais via cURL

### Health Check
```bash
curl http://localhost:8787/api/health
```

### Listar Produtos
```bash
curl http://localhost:8787/api/products
```

### Criar Payment Intent
```bash
curl -X POST http://localhost:8787/api/payment-intent/create \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "PRODUTO_ID_AQUI",
        "quantity": 1
      }
    ],
    "shippingAddress": {
      "name": "Teste Usuario",
      "email": "teste@example.com",
      "phone": "+351912345678",
      "street": "Rua Teste, 123",
      "city": "Lisboa",
      "state": "Lisboa",
      "zipCode": "1000-001",
      "country": "Portugal"
    },
    "email": "teste@example.com"
  }'
```

### Sincronizar R2
```bash
curl -X POST "http://localhost:8787/api/r2-auto-sync/sync?token=SEED_TOKEN&prefix=topos-de-bolo&category=topos-de-bolo"
```

### Verificar Status R2
```bash
curl "http://localhost:8787/api/r2-auto-sync/status?token=SEED_TOKEN&prefix=topos-de-bolo"
```

---

## Testes com jq (JSON Pretty Print)

Se tiver `jq` instalado, os scripts formatam automaticamente o JSON.

```bash
# Instalar jq (macOS)
brew install jq

# Instalar jq (Linux)
sudo apt-get install jq
```

---

## Troubleshooting

### Erro: "STRIPE_SECRET_KEY não configurada"
```bash
# Configurar secret no Cloudflare Workers
wrangler secret put STRIPE_SECRET_KEY
```

### Erro: "Unauthorized" no R2 Sync
Verificar se o token está correto:
```bash
# Token padrão
SEED_TOKEN="seed-topos-20251105"
```

### Erro: "Produtos não encontrados"
Verificar se há produtos no banco:
```bash
curl http://localhost:8787/api/products | jq '.data | length'
```

### Servidor não inicia
```bash
# Verificar se a porta está livre
lsof -i :8787

# Verificar logs
cat /tmp/wrangler-dev.log
```

---

## Exemplos de Uso

### Testar tudo localmente
```bash
# 1. Iniciar servidor em um terminal
wrangler dev --port 8787

# 2. Em outro terminal, executar testes
./test-api-complete.sh http://localhost:8787/api
```

### Testar Payment Intent específico
```bash
# Obter ID de produto real
PRODUCT_ID=$(curl -s http://localhost:8787/api/products | jq -r '.data[0].id')

# Criar Payment Intent
curl -X POST http://localhost:8787/api/payment-intent/create \
  -H "Content-Type: application/json" \
  -d "{
    \"items\": [{\"productId\": \"$PRODUCT_ID\", \"quantity\": 1}],
    \"shippingAddress\": {
      \"name\": \"Teste\",
      \"email\": \"teste@example.com\",
      \"street\": \"Rua Teste\",
      \"city\": \"Lisboa\",
      \"zipCode\": \"1000-001\",
      \"country\": \"Portugal\"
    },
    \"email\": \"teste@example.com\"
  }" | jq '.'
```

---

## Próximos Passos

1. ✅ Executar testes básicos
2. ✅ Verificar configuração do Stripe
3. ✅ Testar sincronização R2
4. ✅ Validar produtos no banco
5. ✅ Testar checkout completo

