#!/bin/bash

# Script de Verificação do Estado Atual
# Verifica se tudo está funcionando corretamente

# Não usar set -e para continuar mesmo com erros

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}🔍 VERIFICAÇÃO DO ESTADO ATUAL${NC}"
echo "=================================="
echo ""

# Função para testar URL
test_url() {
    local url=$1
    local description=$2
    
    echo -n "   Testando $description... "
    
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    
    if echo "$http_code" | grep -qE "200|301|302|307"; then
        echo -e "${GREEN}✅ OK (HTTP $http_code)${NC}"
        return 0
    else
        echo -e "${RED}❌ FALHOU (HTTP $http_code)${NC}"
        return 1
    fi
}

# Função para testar API
test_api() {
    local url=$1
    local description=$2
    
    echo -n "   Testando $description... "
    
    response=$(curl -s --max-time 10 "$url" 2>/dev/null)
    exit_code=$?
    
    if [ $exit_code -eq 0 ] && [ -n "$response" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        echo "      Resposta: ${response:0:100}..."
        return 0
    else
        echo -e "${RED}❌ FALHOU${NC}"
        if [ $exit_code -ne 0 ]; then
            echo "      Erro: curl exit code $exit_code"
        fi
        return 1
    fi
}

# 1. Frontend
echo -e "${YELLOW}🌐 Frontend:${NC}"
test_url "https://www.leiasabores.pt" "www.leiasabores.pt"
test_url "https://leiasabores.pt" "leiasabores.pt"
test_url "https://www.leiasabores.pt/admin" "Admin Panel"

echo ""

# 2. Backend API
echo -e "${YELLOW}🔧 Backend API:${NC}"
test_api "https://api.leiasabores.pt/api/health" "Health Check (api.leiasabores.pt)"
test_api "https://leiasabores.pt/api/health" "Health Check (leiasabores.pt/api)"

echo ""

# 3. Endpoints da API
echo -e "${YELLOW}📦 Endpoints da API:${NC}"
test_api "https://api.leiasabores.pt/api/products" "Produtos"
test_api "https://api.leiasabores.pt/api/categories" "Categorias"

echo ""

# 4. Verificar Worker
echo -e "${YELLOW}⚙️  Verificando Worker:${NC}"
if command -v wrangler &> /dev/null; then
    echo -n "   Verificando se wrangler está logado... "
    if wrangler whoami &> /dev/null; then
        echo -e "${GREEN}✅ Logado${NC}"
    else
        echo -e "${YELLOW}⚠️  Não logado (execute: wrangler login)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Wrangler não encontrado${NC}"
fi

echo ""

# 5. Verificar Build Local
echo -e "${YELLOW}📦 Verificando Build Local:${NC}"
if [ -d "dist/public" ]; then
    echo -e "   ${GREEN}✅ Diretório dist/public existe${NC}"
    file_count=$(find dist/public -type f | wc -l)
    echo "      Arquivos: $file_count"
else
    echo -e "   ${YELLOW}⚠️  Diretório dist/public não existe${NC}"
    echo "      Execute: npm run build:frontend"
fi

echo ""

# 6. Verificar Secrets
echo -e "${YELLOW}🔐 Verificando Secrets do Worker:${NC}"
if command -v wrangler &> /dev/null; then
    echo "   Executando: wrangler secret list"
    wrangler secret list 2>/dev/null || echo -e "   ${YELLOW}⚠️  Não foi possível listar secrets${NC}"
else
    echo -e "   ${YELLOW}⚠️  Wrangler não encontrado${NC}"
fi

echo ""
echo "=================================="
echo -e "${BLUE}✅ Verificação Completa!${NC}"
echo ""
echo "📋 Próximos passos:"
echo "   1. Leia: GUIA_PROXIMOS_PASSOS.md"
echo "   2. Conecte GitHub ao Pages"
echo "   3. Teste todas as funcionalidades"
echo ""

