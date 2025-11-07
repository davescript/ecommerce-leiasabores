# 📍 Rotas da API - Guia de Uso

## ⚠️ Importante!

As rotas da API estão em `/api/*`, não na raiz!

## ✅ Rotas Disponíveis

### Health Check
```
GET http://localhost:8787/api/health
```

### Produtos
```
GET http://localhost:8787/api/products
GET http://localhost:8787/api/products?page=1&limit=10
GET http://localhost:8787/api/products?category=topos-de-bolo
GET http://localhost:8787/api/products?search=bolo
GET http://localhost:8787/api/products/:id
```

### Categorias
```
GET http://localhost:8787/api/categories
```

### Payment Intent
```
POST http://localhost:8787/api/payment-intent/create
POST http://localhost:8787/api/payment-intent/confirm
```

### Checkout
```
POST http://localhost:8787/api/checkout
POST http://localhost:8787/api/checkout/webhook
GET http://localhost:8787/api/checkout/session/:sessionId
```

### R2 Auto-Sync
```
POST http://localhost:8787/api/r2-auto-sync/sync?token=SEED_TOKEN&prefix=categoria
GET http://localhost:8787/api/r2-auto-sync/status?token=SEED_TOKEN&prefix=categoria
```

---

## 🧪 Testar no Navegador

### 1. Health Check
```
http://localhost:8787/api/health
```

### 2. Listar Produtos
```
http://localhost:8787/api/products?limit=5
```

### 3. Listar Categorias
```
http://localhost:8787/api/categories
```

---

## 🚫 Erro "Not Found"

Se você acessar `http://localhost:8787` diretamente, receberá:
```json
{"error":"Not Found"}
```

**Solução:** Use as rotas com prefixo `/api/`

---

## ✅ Exemplos de URLs Corretas

✅ **Correto:**
- `http://localhost:8787/api/health`
- `http://localhost:8787/api/products`
- `http://localhost:8787/api/categories`

❌ **Incorreto:**
- `http://localhost:8787/health`
- `http://localhost:8787/products`
- `http://localhost:8787/` (raiz)

---

## 🎯 Teste Rápido

No navegador, acesse:
```
http://localhost:8787/api/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"2025-11-06T23:39:00.000Z"}
```

---

## 💡 Dica

Use o script de teste:
```bash
./test-simple.sh
```

Ele testa automaticamente as rotas corretas!

