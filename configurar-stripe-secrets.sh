#!/bin/bash

# Script para configurar secrets do Stripe no Cloudflare Workers
# Uso: ./configurar-stripe-secrets.sh

echo "🔐 Configuração de Secrets do Stripe no Cloudflare Workers"
echo ""

# Verificar se wrangler está instalado
if ! command -v wrangler &> /dev/null; then
  echo "❌ Wrangler não está instalado!"
  echo ""
  echo "📦 Instalar com:"
  echo "   npm install -g wrangler"
  echo ""
  exit 1
fi

echo "✅ Wrangler encontrado"
echo ""

# Verificar se está logado
echo "🔍 Verificando login no Cloudflare..."
if ! wrangler whoami &> /dev/null; then
  echo "⚠️  Não está logado no Cloudflare"
  echo ""
  echo "🔑 Fazendo login..."
  wrangler login
  echo ""
fi

echo "✅ Logado no Cloudflare"
echo ""

# Configurar STRIPE_SECRET_KEY
echo "📝 Configurar STRIPE_SECRET_KEY"
echo ""
echo "💡 Você precisa da Secret Key do Stripe:"
echo "   1. Acesse: https://dashboard.stripe.com/apikeys"
echo "   2. Clique em 'Reveal test key'"
echo "   3. Copie a chave (começa com sk_test_... ou sk_live_...)"
echo ""
read -p "Cole a STRIPE_SECRET_KEY aqui: " STRIPE_KEY

if [ -z "$STRIPE_KEY" ]; then
  echo "❌ Chave vazia. Cancelando..."
  exit 1
fi

echo "$STRIPE_KEY" | wrangler secret put STRIPE_SECRET_KEY

if [ $? -eq 0 ]; then
  echo "✅ STRIPE_SECRET_KEY configurado com sucesso!"
else
  echo "❌ Erro ao configurar STRIPE_SECRET_KEY"
  exit 1
fi

echo ""
echo ""

# Configurar STRIPE_WEBHOOK_SECRET
echo "📝 Configurar STRIPE_WEBHOOK_SECRET"
echo ""
echo "💡 Você precisa criar um webhook no Stripe primeiro:"
echo "   1. Acesse: https://dashboard.stripe.com/webhooks"
echo "   2. Clique em 'Add endpoint'"
echo "   3. URL: https://api.leiasabores.pt/api/checkout/webhook"
echo "   4. Selecione eventos: checkout.session.completed, payment_intent.succeeded"
echo "   5. Após criar, clique no webhook e copie o 'Signing secret' (whsec_...)"
echo ""
read -p "Cole a STRIPE_WEBHOOK_SECRET aqui: " WEBHOOK_SECRET

if [ -z "$WEBHOOK_SECRET" ]; then
  echo "⚠️  Webhook secret vazio. Você pode configurar depois com:"
  echo "   wrangler secret put STRIPE_WEBHOOK_SECRET"
  echo ""
else
  echo "$WEBHOOK_SECRET" | wrangler secret put STRIPE_WEBHOOK_SECRET
  
  if [ $? -eq 0 ]; then
    echo "✅ STRIPE_WEBHOOK_SECRET configurado com sucesso!"
  else
    echo "❌ Erro ao configurar STRIPE_WEBHOOK_SECRET"
    exit 1
  fi
fi

echo ""
echo ""

# Verificar secrets configurados
echo "🔍 Verificando secrets configurados..."
echo ""
wrangler secret list

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Testar localmente: npm run dev:backend"
echo "   2. Fazer deploy: wrangler deploy"
echo "   3. Verificar no GitHub Actions se o deploy funciona"
echo ""

