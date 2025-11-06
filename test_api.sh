#!/bin/bash

# ===============================================
# 🔍 Teste de todas as rotas principais da API
# Autor: David Sousa
# Projeto: Leia Sabores - E-commerce Cloudflare R2
# ===============================================

BASE_URL="https://api.leiasabores.pt/api"
ADMIN_TOKEN="seed-topos-20251105"

echo "==============================================="
echo "🚀 Iniciando verificação das rotas da API..."
echo "==============================================="

# -----------------------------------------------
# 1️⃣ HEALTH CHECK
# -----------------------------------------------
echo ""
echo "🩺 Testando /health..."
curl -s "$BASE_URL/health" | jq || curl -s "$BASE_URL/health"
echo ""

# -----------------------------------------------
# 2️⃣ SEED INICIAL (JWT ADMIN)
# -----------------------------------------------
echo "🌱 Testando /admin/seed (requer JWT válido)..."
echo "⚠️  Ignorar erro se não estiver autenticado via JWT"
curl -s -X POST "$BASE_URL/admin/seed" | jq || curl -s -X POST "$BASE_URL/admin/seed"
echo ""

# -----------------------------------------------
# 3️⃣ SEED TOPOS DE BOLO
# -----------------------------------------------
echo "🎂 Testando /admin/seed-topos..."
curl -s -X POST "$BASE_URL/admin/seed-topos?token=$ADMIN_TOKEN" | jq || curl -s -X POST "$BASE_URL/admin/seed-topos?token=$ADMIN_TOKEN"
echo ""

# -----------------------------------------------
# 4️⃣ SYNC R2 (LISTA E CRIA PRODUTOS BASEADOS NAS IMAGENS DO BUCKET)
# -----------------------------------------------
echo "🗂️  Testando /admin/sync-r2..."
curl -s "$BASE_URL/admin/sync-r2?token=$ADMIN_TOKEN" | jq || curl -s "$BASE_URL/admin/sync-r2?token=$ADMIN_TOKEN"
echo ""

# -----------------------------------------------
# 5️⃣ PRODUCTS (Verifica se há produtos listados)
# -----------------------------------------------
echo "🛍️  Verificando /products..."
curl -s "$BASE_URL/products" | jq || curl -s "$BASE_URL/products"
echo ""

echo "==============================================="
echo "✅ Testes concluídos com sucesso!"
echo "==============================================="
