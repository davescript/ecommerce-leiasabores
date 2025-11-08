#!/bin/bash

# Script para Corrigir e Deixar Tudo Funcionando
# Executa todas as correções necessárias

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}🚀 CORRIGINDO E CONFIGURANDO TUDO${NC}"
echo "=================================="
echo ""

# 1. Build do Frontend
echo -e "${YELLOW}📦 1. Fazendo build do frontend...${NC}"
npm run build:frontend
echo -e "${GREEN}✅ Build do frontend concluído${NC}"
echo ""

# 2. Deploy do Frontend
echo -e "${YELLOW}🌐 2. Fazendo deploy do frontend...${NC}"
wrangler pages deploy dist/public --project-name=ecommerce-leiasabores --commit-dirty=true
echo -e "${GREEN}✅ Frontend deployado${NC}"
echo ""

# 3. Build do Backend
echo -e "${YELLOW}🔧 3. Fazendo build do backend...${NC}"
npm run build:backend
echo -e "${GREEN}✅ Build do backend concluído${NC}"
echo ""

# 4. Deploy do Worker
echo -e "${YELLOW}⚙️  4. Fazendo deploy do Worker...${NC}"
wrangler deploy --env=""
echo -e "${GREEN}✅ Worker deployado${NC}"
echo ""

# 5. Aguardar propagação
echo -e "${YELLOW}⏳ 5. Aguardando propagação (10 segundos)...${NC}"
sleep 10
echo ""

# 6. Testar Frontend
echo -e "${YELLOW}🧪 6. Testando Frontend...${NC}"
if curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://www.leiasabores.pt" | grep -qE "200|301|302"; then
    echo -e "${GREEN}✅ www.leiasabores.pt está funcionando${NC}"
else
    echo -e "${RED}❌ www.leiasabores.pt não está respondendo${NC}"
fi

if curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://leiasabores.pt" | grep -qE "200|301|302"; then
    echo -e "${GREEN}✅ leiasabores.pt está funcionando${NC}"
else
    echo -e "${RED}❌ leiasabores.pt não está respondendo${NC}"
fi
echo ""

# 7. Testar API
echo -e "${YELLOW}🧪 7. Testando API...${NC}"
api_response=$(curl -s --max-time 10 "https://leiasabores.pt/api/health" 2>/dev/null || echo "")
if [ -n "$api_response" ] && echo "$api_response" | grep -q "ok"; then
    echo -e "${GREEN}✅ API está funcionando em leiasabores.pt/api${NC}"
    echo "   Resposta: $api_response"
else
    echo -e "${YELLOW}⚠️  API não está respondendo em leiasabores.pt/api${NC}"
    echo "   Isso pode ser normal se o DNS ainda não propagou"
fi

api_subdomain=$(curl -s --max-time 10 "https://api.leiasabores.pt/api/health" 2>/dev/null || echo "")
if [ -n "$api_subdomain" ] && echo "$api_subdomain" | grep -q "ok"; then
    echo -e "${GREEN}✅ API está funcionando em api.leiasabores.pt${NC}"
    echo "   Resposta: $api_subdomain"
else
    echo -e "${YELLOW}⚠️  API não está respondendo em api.leiasabores.pt${NC}"
    echo "   Verifique se o DNS do subdomínio está configurado"
fi
echo ""

# 8. Resumo
echo "=================================="
echo -e "${BLUE}✅ PROCESSO CONCLUÍDO!${NC}"
echo ""
echo "📋 Status:"
echo "  ✅ Frontend: Build e deploy concluídos"
echo "  ✅ Backend: Build e deploy concluídos"
echo "  ✅ Worker: Deploy concluído"
echo ""
echo "🌐 URLs para testar:"
echo "  - Frontend: https://www.leiasabores.pt"
echo "  - Frontend: https://leiasabores.pt"
echo "  - Admin: https://www.leiasabores.pt/admin"
echo "  - API: https://leiasabores.pt/api/health"
echo "  - API: https://api.leiasabores.pt/api/health"
echo ""
echo "📝 Próximos passos:"
echo "  1. Se api.leiasabores.pt não funcionar, configure o DNS:"
echo "     - Acesse: https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/leiasabores.pt/dns"
echo "     - O subdomínio api é gerenciado automaticamente pelo Worker"
echo "     - Verifique se as rotas do Worker estão ativas"
echo ""
echo "  2. Conecte GitHub ao Pages para deploy automático:"
echo "     - Acesse: https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/pages/view/ecommerce-leiasabores"
echo "     - Settings → Builds & deployments → Connect to Git"
echo ""
echo ""

