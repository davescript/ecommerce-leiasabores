#!/bin/bash

# Script para executar todos os seeds do admin
# Uso: ./seed-all.sh

TOKEN="seed-topos-20251105"
API_URL="https://api.leiasabores.pt"

echo "🌱 Executando seeds do admin..."
echo ""

# Seed Admin User
echo "1️⃣ Criando usuário admin..."
curl -X POST "${API_URL}/api/admin/seed-admin?token=${TOKEN}" -s | jq '.' || echo "Erro ao criar admin user"
echo ""

# Seed Categorias
echo "2️⃣ Criando categorias..."
curl -X POST "${API_URL}/api/admin/seed-categories?token=${TOKEN}" -s | jq '.' || echo "Erro ao criar categorias"
echo ""

# Seed Produtos (Topos)
echo "3️⃣ Criando produtos de exemplo..."
curl -X POST "${API_URL}/api/admin/seed-topos?token=${TOKEN}" -s | jq '.' || echo "Erro ao criar produtos"
echo ""

echo "✅ Seeds executados!"
echo ""
echo "📧 Credenciais do Admin:"
echo "   Email: admin@leiasabores.pt"
echo "   Senha: admin123"
echo ""
echo "🔗 Acesse: https://www.leiasabores.pt/admin"

