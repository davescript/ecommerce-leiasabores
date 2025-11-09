#!/bin/bash

# ============================================
# 🔍 Script de Verificação do Backend
# ============================================
# 
# Este script verifica se o backend está configurado corretamente
# e sem erros.
#
# Uso: ./scripts/verify-backend.sh [API_URL]
# ============================================

set -e

API_URL=${1:-"https://api.leiasabores.pt/api"}

echo "🔍 Verificando backend em: $API_URL"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de erros
ERRORS=0

# Função para verificar endpoint
check_endpoint() {
  local url=$1
  local expected_status=$2
  local description=$3
  
  echo -n "Verificando $description... "
  
  response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null || echo -e "\n000")
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$status_code" = "$expected_status" ]; then
    echo -e "${GREEN}✅ OK${NC} (Status: $status_code)"
    return 0
  else
    echo -e "${RED}❌ FALHOU${NC} (Status: $status_code, Esperado: $expected_status)"
    echo "   Response: $body"
    ERRORS=$((ERRORS + 1))
    return 1
  fi
}

# Função para verificar JSON response
check_json() {
  local url=$1
  local key=$2
  local description=$3
  
  echo -n "Verificando $description... "
  
  response=$(curl -s "$url" 2>/dev/null || echo "{}")
  value=$(echo "$response" | grep -o "\"$key\":[^,}]*" | cut -d'"' -f4 || echo "")
  
  if [ -n "$value" ] && [ "$value" != "null" ] && [ "$value" != "false" ]; then
    echo -e "${GREEN}✅ OK${NC} ($key: $value)"
    return 0
  else
    echo -e "${RED}❌ FALHOU${NC} ($key não encontrado ou inválido)"
    ERRORS=$((ERRORS + 1))
    return 1
  fi
}

echo "=========================================="
echo "🔍 VERIFICAÇÃO DO BACKEND"
echo "=========================================="
echo ""

# 1. Health Check
check_endpoint "$API_URL/health" "200" "Health Check"

# 2. Debug Config
echo ""
echo "Verificando configuração..."
check_json "$API_URL/debug/config" "hasDB" "Database D1"
check_json "$API_URL/debug/config" "hasR2" "R2 Bucket"
check_json "$API_URL/debug/config" "hasStripeKey" "Stripe Secret Key"
check_json "$API_URL/debug/config" "hasStripeWebhookSecret" "Stripe Webhook Secret"
check_json "$API_URL/debug/config" "hasJWTSecret" "JWT Secret"

# 3. Verificar ambiente
env_response=$(curl -s "$API_URL/debug/config" 2>/dev/null || echo "{}")
environment=$(echo "$env_response" | grep -o "\"environment\":\"[^\"]*\"" | cut -d'"' -f4 || echo "")
echo ""
echo -n "Ambiente: "
if [ "$environment" = "production" ]; then
  echo -e "${GREEN}✅ Production${NC}"
elif [ "$environment" = "development" ]; then
  echo -e "${YELLOW}⚠️  Development${NC}"
else
  echo -e "${RED}❌ Desconhecido${NC}"
  ERRORS=$((ERRORS + 1))
fi

# 4. Verificar CORS
echo ""
echo -n "Verificando CORS... "
cors_response=$(curl -s -H "Origin: https://test.com" -H "Access-Control-Request-Method: GET" \
  -X OPTIONS "$API_URL/health" -w "%{http_code}" -o /dev/null 2>/dev/null || echo "000")
if [ "$cors_response" = "204" ] || [ "$cors_response" = "200" ]; then
  echo -e "${GREEN}✅ OK${NC}"
else
  echo -e "${YELLOW}⚠️  CORS pode não estar configurado corretamente${NC}"
fi

# 5. Verificar rotas principais
echo ""
echo "Verificando rotas principais..."
check_endpoint "$API_URL/v1/products?limit=1" "200" "Listar Produtos"
check_endpoint "$API_URL/v1/categories" "200" "Listar Categorias"

# 6. Verificar autenticação
echo ""
echo "Verificando autenticação..."
check_endpoint "$API_URL/v1/admin/auth/me" "401" "Endpoint Admin (deve retornar 401 sem auth)"

# Resumo
echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ TODAS AS VERIFICAÇÕES PASSARAM${NC}"
  echo "Backend está configurado corretamente!"
  exit 0
else
  echo -e "${RED}❌ $ERRORS ERRO(S) ENCONTRADO(S)${NC}"
  echo "Verifique os erros acima e corrija as configurações."
  exit 1
fi

