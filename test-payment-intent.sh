#!/bin/bash

# Script de teste para Payment Intent
# Uso: ./test-payment-intent.sh [API_URL]

API_URL="${1:-http://localhost:8787/api}"
echo "🧪 Testando Payment Intent em: $API_URL"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Health Check
echo "1️⃣ Testando Health Check..."
HEALTH_RESPONSE=$(curl -s --max-time 3 "$API_URL/health" 2>/dev/null)

if [ -z "$HEALTH_RESPONSE" ]; then
  echo -e "${RED}❌ Servidor não está respondendo${NC}"
  echo ""
  echo "💡 Para iniciar o servidor:"
  echo "   wrangler dev --port 8787"
  exit 1
fi
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
  echo -e "${GREEN}✅ Health check OK${NC}"
  echo "   Response: $HEALTH_RESPONSE"
else
  echo -e "${RED}❌ Health check falhou${NC}"
  echo "   Response: $HEALTH_RESPONSE"
fi
echo ""

# 2. Criar Payment Intent (precisa de dados válidos)
echo "2️⃣ Testando criação de Payment Intent..."
echo "   ⚠️  Nota: Este teste precisa de produtos válidos no banco"
echo ""

# Exemplo de payload (ajustar com IDs reais)
PAYLOAD='{
  "items": [
    {
      "productId": "00000000-0000-0000-0000-000000000001",
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

echo "   Payload:"
echo "$PAYLOAD" | jq '.' 2>/dev/null || echo "$PAYLOAD"
echo ""

PAYMENT_RESPONSE=$(curl -s --max-time 10 -X POST "$API_URL/payment-intent/create" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" 2>/dev/null)

if echo "$PAYMENT_RESPONSE" | grep -q "clientSecret"; then
  echo -e "${GREEN}✅ Payment Intent criado com sucesso${NC}"
  echo "$PAYMENT_RESPONSE" | jq '.' 2>/dev/null || echo "$PAYMENT_RESPONSE"
  
  # Extrair clientSecret
  CLIENT_SECRET=$(echo "$PAYMENT_RESPONSE" | jq -r '.clientSecret' 2>/dev/null)
  PAYMENT_INTENT_ID=$(echo "$PAYMENT_RESPONSE" | jq -r '.paymentIntentId' 2>/dev/null)
  
  if [ -n "$CLIENT_SECRET" ] && [ "$CLIENT_SECRET" != "null" ]; then
    echo ""
    echo -e "${GREEN}✅ Client Secret obtido: ${CLIENT_SECRET:0:20}...${NC}"
    echo -e "${GREEN}✅ Payment Intent ID: $PAYMENT_INTENT_ID${NC}"
  fi
else
  echo -e "${RED}❌ Falha ao criar Payment Intent${NC}"
  echo "   Response: $PAYMENT_RESPONSE"
  
  # Verificar se é erro de configuração
  if echo "$PAYMENT_RESPONSE" | grep -q "missing_stripe_key"; then
    echo -e "${YELLOW}⚠️  STRIPE_SECRET_KEY não configurada${NC}"
  fi
fi
echo ""

# 3. Testar validações
echo "3️⃣ Testando validações..."
echo ""

# Teste com email inválido
echo "   Testando email inválido..."
INVALID_EMAIL_PAYLOAD='{
  "items": [{"productId": "00000000-0000-0000-0000-000000000001", "quantity": 1}],
  "shippingAddress": {},
  "email": "email-invalido"
}'

INVALID_RESPONSE=$(curl -s --max-time 5 -X POST "$API_URL/payment-intent/create" \
  -H "Content-Type: application/json" \
  -d "$INVALID_EMAIL_PAYLOAD" 2>/dev/null)

if echo "$INVALID_RESPONSE" | grep -q "invalid_email\|Email inválido"; then
  echo -e "${GREEN}✅ Validação de email funcionando${NC}"
else
  echo -e "${YELLOW}⚠️  Validação de email pode não estar funcionando${NC}"
  echo "   Response: $INVALID_RESPONSE"
fi
echo ""

# Teste com carrinho vazio
echo "   Testando carrinho vazio..."
EMPTY_CART_PAYLOAD='{
  "items": [],
  "shippingAddress": {},
  "email": "teste@example.com"
}'

EMPTY_RESPONSE=$(curl -s --max-time 5 -X POST "$API_URL/payment-intent/create" \
  -H "Content-Type: application/json" \
  -d "$EMPTY_CART_PAYLOAD" 2>/dev/null)

if echo "$EMPTY_RESPONSE" | grep -q "no_valid_products\|Nenhum produto"; then
  echo -e "${GREEN}✅ Validação de carrinho vazio funcionando${NC}"
else
  echo -e "${YELLOW}⚠️  Validação de carrinho pode não estar funcionando${NC}"
  echo "   Response: $EMPTY_RESPONSE"
fi
echo ""

echo "✅ Testes concluídos!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Verificar se STRIPE_SECRET_KEY está configurada"
echo "   2. Verificar se há produtos válidos no banco"
echo "   3. Testar com IDs de produtos reais"

