#!/bin/bash

# Script para limpar rate limits do banco de dados D1
# Uso: ./scripts/clear-rate-limits.sh

echo "🔧 Limpando rate limits do banco de dados D1..."

# Verificar se estamos em ambiente de desenvolvimento
if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
  echo "⚠️  CLOUDFLARE_ACCOUNT_ID não definido. Usando ambiente local."
  ENV_FLAG="--local"
else
  ENV_FLAG="--remote"
fi

# Limpar rate limits via SQL
echo "🗑️  Deletando rate limits de login..."
wrangler d1 execute ecommerce_db $ENV_FLAG --command "DELETE FROM rate_limits WHERE key LIKE 'login:%'"

if [ $? -eq 0 ]; then
  echo "✅ Rate limits limpos com sucesso!"
else
  echo "❌ Erro ao limpar rate limits"
  exit 1
fi

echo ""
echo "💡 Dica: Você também pode limpar rate limits via API:"
echo "   curl -X POST https://api.leiasabores.pt/api/v1/admin/seed/clear-rate-limits"

