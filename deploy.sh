#!/bin/bash

# Script para fazer deploy para GitHub
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando deploy para GitHub..."
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está no branch main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Você não está no branch 'main'. Atual: $CURRENT_BRANCH${NC}"
    read -p "Deseja continuar mesmo assim? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Verificar se há mudanças
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}ℹ️  Não há mudanças para commitar.${NC}"
    exit 0
fi

# Mostrar status
echo -e "${YELLOW}📋 Status atual:${NC}"
git status --short | head -20
echo ""

# Adicionar arquivos
echo -e "${GREEN}📦 Adicionando arquivos...${NC}"
git add backend/
git add frontend/
git add .github/
git add wrangler.toml
git add package.json
git add package-lock.json
git add tsconfig.json
git add tailwind.config.js
git add apply-migrations.sh
git add seed-all.sh
git add DEPLOY_GITHUB.md
git add GUIA_SEED_ADMIN.md
git add APLICAR_MIGRATIONS.md
git add AUDITORIA_FINAL_COMPLETA.md
git add IMPLEMENTATION_COMPLETE.md

echo -e "${GREEN}✅ Arquivos adicionados${NC}"
echo ""

# Fazer commit
COMMIT_MSG="feat: Implementação completa do Admin Panel com auditoria, correções e migrations

- ✅ Admin Panel completo e funcional
- ✅ Rotas de API validadas e corrigidas
- ✅ Migrations aplicadas com sucesso
- ✅ Sistema de autenticação e autorização
- ✅ Dashboard com métricas em tempo real
- ✅ CRUD completo de produtos, categorias, pedidos, clientes e cupons
- ✅ Upload de imagens para R2
- ✅ Dark mode completo
- ✅ Sincronização Admin ↔ Loja
- ✅ Testes e validações implementadas
- ✅ Documentação completa"

echo -e "${GREEN}💾 Fazendo commit...${NC}"
git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Commit realizado com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao fazer commit${NC}"
    exit 1
fi

echo ""

# Fazer push
echo -e "${GREEN}🚀 Fazendo push para GitHub...${NC}"
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deploy iniciado com sucesso!${NC}"
    echo ""
    echo -e "${YELLOW}📊 Verificar status do deploy:${NC}"
    echo "   https://github.com/davescript/ecommerce-leiasabores/actions"
    echo ""
    echo -e "${YELLOW}⏳ O GitHub Actions irá:${NC}"
    echo "   1. Validar código (lint + type-check)"
    echo "   2. Rodar testes"
    echo "   3. Build do frontend e backend"
    echo "   4. Deploy para Cloudflare Workers"
    echo "   5. Deploy para Cloudflare Pages"
    echo ""
else
    echo -e "${RED}❌ Erro ao fazer push${NC}"
    exit 1
fi
