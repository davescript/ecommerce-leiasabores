#!/bin/bash

# Script de Deploy Completo (Backend + Frontend)
# Uso: ./deploy.sh

set -e  # Parar em caso de erro

echo "🚀 INICIANDO DEPLOY COMPLETO"
echo "============================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Execute este script na raiz do projeto${NC}"
    exit 1
fi

# 1. Deploy Backend
echo -e "${YELLOW}📦 1. Deploy do Backend (Cloudflare Workers)...${NC}"
cd backend

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Diretório backend não encontrado${NC}"
    exit 1
fi

echo "   - Executando npm run deploy..."
npm run deploy

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend deployado com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro no deploy do backend${NC}"
    exit 1
fi

cd ..

# 2. Deploy Frontend
echo ""
echo -e "${YELLOW}📦 2. Deploy do Frontend (Cloudflare Pages)...${NC}"
cd frontend

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Diretório frontend não encontrado${NC}"
    exit 1
fi

echo "   - Executando npm run build..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro no build do frontend${NC}"
    exit 1
fi

echo "   - Executando wrangler pages deploy..."
# O build gera em ../dist/public (raiz do projeto)
cd ..
wrangler pages deploy dist/public --project-name=leiasabores

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend deployado com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro no deploy do frontend${NC}"
    exit 1
fi

cd ..

# 3. Resumo
echo ""
echo "============================"
echo -e "${GREEN}✅ DEPLOY COMPLETO!${NC}"
echo ""
echo "🌐 URLs:"
echo "   - Frontend: https://leiasabores.pt/admin"
echo "   - Backend: https://api.leiasabores.pt/api/admin/*"
echo ""
echo "🧪 Próximos passos:"
echo "   1. Acesse: https://leiasabores.pt/admin"
echo "   2. Configure o token JWT em /admin/legacy"
echo "   3. Teste todas as funcionalidades"
echo ""

