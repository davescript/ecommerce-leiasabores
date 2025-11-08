#!/bin/bash

# Script para aplicar migrations do D1
# Uso: ./apply-migrations.sh [--local|--remote]

echo "🚀 Aplicando migrations do D1..."

# Verificar se foi passado --local ou --remote
if [ "$1" == "--local" ]; then
    echo "📦 Modo: LOCAL"
    echo "Y" | wrangler d1 migrations apply DB --local
elif [ "$1" == "--remote" ]; then
    echo "🌐 Modo: REMOTO (Produção)"
    echo "⚠️  ATENÇÃO: Isso vai aplicar migrations no banco de produção!"
    echo "Y" | wrangler d1 migrations apply DB --remote
else
    echo "❌ Erro: Especifique --local ou --remote"
    echo "Uso: ./apply-migrations.sh [--local|--remote]"
    exit 1
fi

echo "✅ Migrations aplicadas com sucesso!"

