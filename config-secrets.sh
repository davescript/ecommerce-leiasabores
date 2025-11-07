#!/bin/bash

# Script para configurar secrets do Cloudflare Workers
# Uso: ./config-secrets.sh

echo "🔧 Configuração de Secrets - Cloudflare Workers"
echo "=============================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar se wrangler está instalado
if ! command -v wrangler &> /dev/null; then
  echo "❌ Wrangler não encontrado!"
  echo ""
  echo "Instale com:"
  echo "  npm install -g wrangler"
  exit 1
fi

echo -e "${BLUE}1️⃣ Verificando login no Cloudflare...${NC}"
if ! wrangler whoami &>/dev/null; then
  echo -e "${YELLOW}⚠️  Não está logado. Fazendo login...${NC}"
  wrangler login
else
  echo -e "${GREEN}✅ Logado no Cloudflare${NC}"
fi
echo ""

echo -e "${BLUE}2️⃣ Configurando STRIPE_SECRET_KEY${NC}"
echo "   Cole sua chave secreta do Stripe (sk_test_... ou sk_live_...)"
echo "   (Pressione Ctrl+C para cancelar)"
echo ""
wrangler secret put STRIPE_SECRET_KEY
echo ""

echo -e "${BLUE}3️⃣ Configurando STRIPE_WEBHOOK_SECRET${NC}"
echo "   Cole o webhook secret do Stripe (whsec_...)"
echo "   (Você precisa criar o webhook no Stripe Dashboard primeiro)"
echo "   (Pressione Ctrl+C para cancelar)"
echo ""
read -p "Deseja configurar agora? (s/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
  wrangler secret put STRIPE_WEBHOOK_SECRET
else
  echo -e "${YELLOW}⚠️  Pule este passo. Configure depois com:${NC}"
  echo "   wrangler secret put STRIPE_WEBHOOK_SECRET"
fi
echo ""

echo -e "${GREEN}✅ Secrets configurados!${NC}"
echo ""
echo "📝 Próximos passos:"
echo "   1. Configure VITE_STRIPE_PUBLISHABLE_KEY no Cloudflare Pages"
echo "   2. Crie o webhook no Stripe Dashboard"
echo "   3. Configure o webhook secret (se ainda não fez)"
echo ""
echo "💡 Para mais informações, veja: CONFIGURACAO_SIMPLES.md"

