#!/bin/bash

# Script completo de testes da API
# Uso: ./test-api-complete.sh [API_URL]

API_URL="${1:-http://localhost:8787/api}"
echo "🧪 Testes Completos da API: $API_URL"
echo "=================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contador de testes
PASSED=0
FAILED=0

test_endpoint() {
  local name="$1"
  local method="$2"
  local endpoint="$3"
  local data="$4"
  local expected="$5"
  
  echo -e "${BLUE}📡 Testando: $name${NC}"
  
  if [ "$method" = "GET" ]; then
    RESPONSE=$(curl -s --max-time 5 -w "\n%{http_code}" "$API_URL$endpoint" 2>/dev/null)
  else
    RESPONSE=$(curl -s --max-time 5 -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data" 2>/dev/null)
  fi
  
  if [ -z "$RESPONSE" ]; then
    echo -e "${RED}❌ FAIL (Timeout ou servidor não responde)${NC}"
    ((FAILED++))
    return 1
  fi
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    if [ -n "$expected" ] && echo "$BODY" | grep -q "$expected"; then
      echo -e "${GREEN}✅ PASS (HTTP $HTTP_CODE)${NC}"
      ((PASSED++))
      return 0
    elif [ -z "$expected" ]; then
      echo -e "${GREEN}✅ PASS (HTTP $HTTP_CODE)${NC}"
      ((PASSED++))
      return 0
    else
      echo -e "${YELLOW}⚠️  PARTIAL (HTTP $HTTP_CODE, mas não contém '$expected')${NC}"
      echo "   Response: $BODY"
      ((FAILED++))
      return 1
    fi
  else
    echo -e "${RED}❌ FAIL (HTTP $HTTP_CODE)${NC}"
    echo "   Response: $BODY"
    ((FAILED++))
    return 1
  fi
}

# 1. Health Check
echo "1️⃣ Health Check"
test_endpoint "GET /health" "GET" "/health" "" "ok"
echo ""

# 2. Categories
echo "2️⃣ Categories"
test_endpoint "GET /categories" "GET" "/categories" "" "data"
echo ""

# 3. Products
echo "3️⃣ Products"
test_endpoint "GET /products" "GET" "/products" "" "data"
echo ""

# 4. Products com filtros
echo "4️⃣ Products com filtros"
test_endpoint "GET /products?page=1&limit=5" "GET" "/products?page=1&limit=5" "" "data"
echo ""

# 5. Payment Intent (pode falhar se não houver produtos)
echo "5️⃣ Payment Intent"
PAYLOAD='{
  "items": [{"productId": "00000000-0000-0000-0000-000000000001", "quantity": 1}],
  "shippingAddress": {
    "name": "Teste",
    "email": "teste@example.com",
    "street": "Rua Teste",
    "city": "Lisboa",
    "zipCode": "1000-001",
    "country": "Portugal"
  },
  "email": "teste@example.com"
}'

RESPONSE=$(curl -s --max-time 10 -X POST "$API_URL/payment-intent/create" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" -w "\n%{http_code}" 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] && echo "$BODY" | grep -q "clientSecret"; then
  echo -e "${GREEN}✅ Payment Intent criado${NC}"
  ((PASSED++))
elif [ "$HTTP_CODE" -eq 500 ] && echo "$BODY" | grep -q "missing_stripe_key"; then
  echo -e "${YELLOW}⚠️  STRIPE_SECRET_KEY não configurada${NC}"
  ((FAILED++))
else
  echo -e "${YELLOW}⚠️  Payment Intent falhou (pode ser produto inválido)${NC}"
  echo "   HTTP: $HTTP_CODE"
  echo "   Response: $BODY"
  ((FAILED++))
fi
echo ""

# 6. R2 Status (pode falhar se não autorizado)
echo "6️⃣ R2 Auto-Sync Status"
TOKEN="seed-topos-20251105"
RESPONSE=$(curl -s --max-time 5 "$API_URL/r2-auto-sync/status?token=$TOKEN&prefix=test" -w "\n%{http_code}" 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] && echo "$BODY" | grep -q "totalFiles"; then
  echo -e "${GREEN}✅ R2 Status OK${NC}"
  ((PASSED++))
elif [ "$HTTP_CODE" -eq 401 ]; then
  echo -e "${YELLOW}⚠️  Não autorizado (token pode estar incorreto)${NC}"
  ((FAILED++))
else
  echo -e "${YELLOW}⚠️  R2 Status falhou${NC}"
  echo "   HTTP: $HTTP_CODE"
  ((FAILED++))
fi
echo ""

# Resumo
echo "=================================="
echo -e "${BLUE}📊 Resumo dos Testes${NC}"
echo "=================================="
echo -e "${GREEN}✅ Passou: $PASSED${NC}"
echo -e "${RED}❌ Falhou: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 Todos os testes passaram!${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Alguns testes falharam (pode ser configuração)${NC}"
  exit 1
fi

