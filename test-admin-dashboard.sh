#!/bin/bash

# Script de teste para o Painel Administrativo
# Uso: ./test-admin-dashboard.sh

echo "🧪 TESTE DO PAINEL ADMINISTRATIVO"
echo "=================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se o backend está rodando
echo "1️⃣ Verificando backend..."
if curl -s http://localhost:8787/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend está rodando${NC}"
else
    echo -e "${RED}❌ Backend não está rodando${NC}"
    echo "   Execute: cd backend && npm run dev"
    exit 1
fi

# Verificar se o frontend está rodando
echo ""
echo "2️⃣ Verificando frontend..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend está rodando${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend pode não estar rodando${NC}"
    echo "   Execute: cd frontend && npm run dev"
fi

# Verificar endpoint de debug
echo ""
echo "3️⃣ Verificando configurações do backend..."
DEBUG_RESPONSE=$(curl -s http://localhost:8787/api/debug/config)
if echo "$DEBUG_RESPONSE" | grep -q "hasJWTSecret"; then
    echo -e "${GREEN}✅ Backend configurado${NC}"
    echo "$DEBUG_RESPONSE" | jq '.' 2>/dev/null || echo "$DEBUG_RESPONSE"
else
    echo -e "${RED}❌ Erro ao verificar configurações${NC}"
fi

# Testar endpoint de dashboard (sem token - deve falhar)
echo ""
echo "4️⃣ Testando endpoint /api/admin/dashboard (sem token)..."
DASHBOARD_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:8787/api/admin/dashboard)
HTTP_CODE=$(echo "$DASHBOARD_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✅ Autenticação funcionando (401 esperado)${NC}"
else
    echo -e "${YELLOW}⚠️  Resposta inesperada: HTTP $HTTP_CODE${NC}"
fi

# Instruções finais
echo ""
echo "=================================="
echo -e "${GREEN}✅ TESTES BÁSICOS CONCLUÍDOS${NC}"
echo ""
echo "📋 Próximos passos:"
echo "   1. Acesse: http://localhost:5173/admin"
echo "   2. Configure o token JWT:"
echo "      - Acesse /admin/legacy"
echo "      - Clique em 'Gerar Token'"
echo "      - Ou configure manualmente"
echo "   3. Acesse /admin novamente"
echo "   4. Verifique o dashboard"
echo ""
echo "📄 Guia completo: TESTE_PAINEL_ADMIN.md"

