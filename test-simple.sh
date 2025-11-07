#!/bin/bash

# Teste simples e rápido
# Uso: ./test-simple.sh [API_URL]

API_URL="${1:-http://localhost:8787/api}"

echo "🧪 Teste Rápido: $API_URL"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Health Check (com timeout)
echo "1️⃣ Health Check..."
HEALTH=$(curl -s --max-time 3 "$API_URL/health" 2>/dev/null)

if [ -z "$HEALTH" ]; then
  echo -e "${RED}❌ Servidor não está respondendo${NC}"
  echo ""
  echo "💡 Para iniciar o servidor:"
  echo "   wrangler dev --port 8787"
  exit 1
fi

if echo "$HEALTH" | grep -q "ok"; then
  echo -e "${GREEN}✅ OK${NC}"
  echo "   $HEALTH"
else
  echo -e "${YELLOW}⚠️  Resposta inesperada${NC}"
  echo "   $HEALTH"
fi
echo ""

# 2. Products (com timeout)
echo "2️⃣ Products..."
PRODUCTS=$(curl -s --max-time 5 "$API_URL/products?limit=1" 2>/dev/null)

if [ -z "$PRODUCTS" ]; then
  echo -e "${YELLOW}⚠️  Sem resposta${NC}"
else
  COUNT=$(echo "$PRODUCTS" | grep -o '"data"' | wc -l | tr -d ' ')
  if [ "$COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ OK${NC}"
    echo "   Endpoint funcionando"
  else
    echo -e "${YELLOW}⚠️  Resposta inesperada${NC}"
  fi
fi
echo ""

# 3. Categories (com timeout)
echo "3️⃣ Categories..."
CATEGORIES=$(curl -s --max-time 5 "$API_URL/categories" 2>/dev/null)

if [ -z "$CATEGORIES" ]; then
  echo -e "${YELLOW}⚠️  Sem resposta${NC}"
else
  COUNT=$(echo "$CATEGORIES" | grep -o '"data"' | wc -l | tr -d ' ')
  if [ "$COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ OK${NC}"
    echo "   Endpoint funcionando"
  else
    echo -e "${YELLOW}⚠️  Resposta inesperada${NC}"
  fi
fi
echo ""

echo "✅ Teste concluído!"
echo ""
echo "💡 Para testes completos:"
echo "   ./test-api-complete.sh $API_URL"

