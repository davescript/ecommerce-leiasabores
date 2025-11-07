#!/bin/bash

# Script para criar produto de teste de 1€
# Uso: ./criar-produto-teste.sh

API_URL="${API_URL:-https://api.leiasabores.pt}"
ADMIN_SEED_TOKEN="${ADMIN_SEED_TOKEN:-seed-topos-20251105}"

echo "🛍️  Criando produto de teste de 1€..."
echo ""

# Criar produto via endpoint de seed (se disponível) ou via API
# Vamos usar um endpoint simples que cria o produto

PRODUCT_DATA=$(cat <<EOF
{
  "id": "prod-teste-1eur",
  "name": "Produto de Teste - 1€",
  "description": "Produto de teste para validação de pagamento. Este é um produto temporário para testar o sistema de pagamento.",
  "shortDescription": "Produto de teste para pagamento",
  "price": 1.00,
  "category": "Teste",
  "images": [
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80"
  ],
  "inStock": true,
  "tags": ["teste", "pagamento"]
}
EOF
)

echo "📦 Dados do produto:"
echo "$PRODUCT_DATA" | jq '.'
echo ""

# Tentar criar via endpoint de seed do admin
echo "🔧 Tentando criar produto via endpoint de seed..."
RESPONSE=$(curl -s -X POST \
  "${API_URL}/api/admin/seed-topos?token=${ADMIN_SEED_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$PRODUCT_DATA" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "✅ Produto criado com sucesso!"
  echo "$BODY" | jq '.'
else
  echo "⚠️  Endpoint de seed não funcionou (HTTP $HTTP_CODE)"
  echo "💡 Alternativa: Use o painel Admin em https://leiasabores.pt/admin"
  echo ""
  echo "📋 Dados para criar manualmente:"
  echo "   Nome: Produto de Teste - 1€"
  echo "   Preço: 1.00"
  echo "   Categoria: Teste"
  echo "   Descrição: Produto de teste para validação de pagamento"
fi

echo ""
echo "🔍 Verificar produto:"
echo "   curl ${API_URL}/api/products | jq '.data[] | select(.name | contains(\"Teste\"))'"
echo ""
echo "⚠️  IMPORTANTE: Verifique se está em modo LIVE antes de fazer pagamento real!"
echo "   Acesse: ${API_URL}/api/debug/config"
echo "   Procure por 'stripeKeyPreview' - deve começar com 'rk_live_' ou 'sk_live_'"

