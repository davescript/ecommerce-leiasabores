#!/bin/bash

# Script de teste para R2 Auto-Sync
# Uso: ./test-r2-sync.sh [API_URL] [TOKEN] [PREFIX]

API_URL="${1:-http://localhost:8787/api}"
TOKEN="${2:-seed-topos-20251105}"
PREFIX="${3:-topos-de-bolo}"

echo "🧪 Testando R2 Auto-Sync em: $API_URL"
echo "   Token: ${TOKEN:0:10}..."
echo "   Prefix: $PREFIX"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Verificar status do R2
echo "1️⃣ Verificando status do R2..."
STATUS_RESPONSE=$(curl -s --max-time 5 "$API_URL/r2-auto-sync/status?token=$TOKEN&prefix=$PREFIX" 2>/dev/null)

if [ -z "$STATUS_RESPONSE" ]; then
  echo -e "${RED}❌ Servidor não está respondendo${NC}"
  echo ""
  echo "💡 Para iniciar o servidor:"
  echo "   wrangler dev --port 8787"
  exit 1
fi

if echo "$STATUS_RESPONSE" | grep -q "totalFiles\|imageFiles"; then
  echo -e "${GREEN}✅ Status obtido com sucesso${NC}"
  echo "$STATUS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATUS_RESPONSE"
  
  TOTAL_FILES=$(echo "$STATUS_RESPONSE" | jq -r '.totalFiles' 2>/dev/null)
  IMAGE_FILES=$(echo "$STATUS_RESPONSE" | jq -r '.imageFiles' 2>/dev/null)
  
  if [ -n "$TOTAL_FILES" ] && [ "$TOTAL_FILES" != "null" ]; then
    echo ""
    echo -e "${GREEN}📊 Estatísticas:${NC}"
    echo "   Total de arquivos: $TOTAL_FILES"
    echo "   Arquivos de imagem: $IMAGE_FILES"
  fi
else
  echo -e "${RED}❌ Falha ao obter status${NC}"
  echo "   Response: $STATUS_RESPONSE"
  
  if echo "$STATUS_RESPONSE" | grep -q "Unauthorized"; then
    echo -e "${YELLOW}⚠️  Token inválido ou não autorizado${NC}"
  fi
fi
echo ""

# 2. Executar sincronização
echo "2️⃣ Executando sincronização R2 → D1..."
echo "   ⚠️  Isso pode demorar alguns segundos..."
echo ""

SYNC_RESPONSE=$(curl -s --max-time 30 -X POST "$API_URL/r2-auto-sync/sync?token=$TOKEN&prefix=$PREFIX&category=$PREFIX" 2>/dev/null)

if echo "$SYNC_RESPONSE" | grep -q "success\|created\|updated"; then
  echo -e "${GREEN}✅ Sincronização concluída${NC}"
  echo "$SYNC_RESPONSE" | jq '.' 2>/dev/null || echo "$SYNC_RESPONSE"
  
  CREATED=$(echo "$SYNC_RESPONSE" | jq -r '.stats.created' 2>/dev/null)
  UPDATED=$(echo "$SYNC_RESPONSE" | jq -r '.stats.updated' 2>/dev/null)
  SKIPPED=$(echo "$SYNC_RESPONSE" | jq -r '.stats.skipped' 2>/dev/null)
  
  if [ -n "$CREATED" ] && [ "$CREATED" != "null" ]; then
    echo ""
    echo -e "${GREEN}📊 Resultados:${NC}"
    echo "   Produtos criados: $CREATED"
    echo "   Produtos atualizados: $UPDATED"
    echo "   Arquivos ignorados: $SKIPPED"
  fi
else
  echo -e "${RED}❌ Falha na sincronização${NC}"
  echo "   Response: $SYNC_RESPONSE"
  
  if echo "$SYNC_RESPONSE" | grep -q "Unauthorized"; then
    echo -e "${YELLOW}⚠️  Token inválido ou não autorizado${NC}"
  fi
fi
echo ""

echo "✅ Testes concluídos!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Verificar produtos criados no banco"
echo "   2. Verificar imagens no R2"
echo "   3. Testar com diferentes prefixos"

