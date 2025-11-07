#!/bin/bash

# Script para verificar se as configurações estão corretas
# Uso: ./verificar-config.sh

echo "🔍 Verificando Configurações"
echo "============================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contador
PASSED=0
FAILED=0

# 1. Verificar wrangler
echo -e "${BLUE}1️⃣ Verificando Wrangler...${NC}"
if command -v wrangler &> /dev/null; then
  echo -e "${GREEN}✅ Wrangler instalado${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Wrangler não encontrado${NC}"
  echo "   Instale com: npm install -g wrangler"
  ((FAILED++))
fi
echo ""

# 2. Verificar login Cloudflare
echo -e "${BLUE}2️⃣ Verificando login Cloudflare...${NC}"
if wrangler whoami &>/dev/null; then
  echo -e "${GREEN}✅ Logado no Cloudflare${NC}"
  USER=$(wrangler whoami 2>/dev/null | head -1)
  echo "   $USER"
  ((PASSED++))
else
  echo -e "${RED}❌ Não está logado${NC}"
  echo "   Execute: wrangler login"
  ((FAILED++))
fi
echo ""

# 3. Verificar secrets (só funciona se estiver logado)
if wrangler whoami &>/dev/null; then
  echo -e "${BLUE}3️⃣ Verificando Secrets...${NC}"
  
  # Verificar STRIPE_SECRET_KEY
  if wrangler secret list 2>/dev/null | grep -q "STRIPE_SECRET_KEY"; then
    echo -e "${GREEN}✅ STRIPE_SECRET_KEY configurada${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ STRIPE_SECRET_KEY não configurada${NC}"
    echo "   Execute: wrangler secret put STRIPE_SECRET_KEY"
    ((FAILED++))
  fi
  
  # Verificar STRIPE_WEBHOOK_SECRET
  if wrangler secret list 2>/dev/null | grep -q "STRIPE_WEBHOOK_SECRET"; then
    echo -e "${GREEN}✅ STRIPE_WEBHOOK_SECRET configurada${NC}"
    ((PASSED++))
  else
    echo -e "${YELLOW}⚠️  STRIPE_WEBHOOK_SECRET não configurada${NC}"
    echo "   (Configure depois de criar o webhook)"
    ((FAILED++))
  fi
  echo ""
fi

# 4. Verificar arquivo .env (se existir)
echo -e "${BLUE}4️⃣ Verificando arquivos locais...${NC}"
if [ -f ".env" ]; then
  echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
  if grep -q "STRIPE" .env; then
    echo -e "${GREEN}✅ Variáveis Stripe no .env${NC}"
    ((PASSED++))
  else
    echo -e "${YELLOW}⚠️  Nenhuma variável Stripe no .env${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
  echo "   (Opcional para desenvolvimento local)"
fi
echo ""

# 5. Verificar wrangler.toml
echo -e "${BLUE}5️⃣ Verificando wrangler.toml...${NC}"
if [ -f "wrangler.toml" ]; then
  echo -e "${GREEN}✅ wrangler.toml encontrado${NC}"
  
  if grep -q "d1_databases" wrangler.toml; then
    echo -e "${GREEN}✅ D1 configurado${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ D1 não configurado${NC}"
    ((FAILED++))
  fi
  
  if grep -q "r2_buckets" wrangler.toml; then
    echo -e "${GREEN}✅ R2 configurado${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ R2 não configurado${NC}"
    ((FAILED++))
  fi
else
  echo -e "${RED}❌ wrangler.toml não encontrado${NC}"
  ((FAILED++))
fi
echo ""

# Resumo
echo "============================"
echo -e "${BLUE}📊 Resumo${NC}"
echo "============================"
echo -e "${GREEN}✅ Passou: $PASSED${NC}"
echo -e "${RED}❌ Falhou: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 Tudo configurado!${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Algumas configurações estão faltando${NC}"
  echo ""
  echo "💡 Para configurar:"
  echo "   ./config-secrets.sh"
  exit 1
fi

