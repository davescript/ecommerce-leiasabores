#!/bin/bash

# Script para iniciar servidor, matando processo anterior se necessário
# Uso: ./start-server.sh [PORTA]

PORT="${1:-8787}"

echo "🚀 Iniciando servidor na porta $PORT..."
echo ""

# Verificar se porta está em uso
PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -n "$PID" ]; then
  echo "⚠️  Porta $PORT está em uso (PID: $PID)"
  echo "   Terminando processo anterior..."
  kill $PID 2>/dev/null
  sleep 2
  
  # Se ainda estiver rodando, forçar
  if lsof -ti:$PORT >/dev/null 2>&1; then
    echo "   Forçando término..."
    kill -9 $PID 2>/dev/null
    sleep 1
  fi
  
  if ! lsof -ti:$PORT >/dev/null 2>&1; then
    echo "✅ Processo anterior terminado"
  else
    echo "❌ Não foi possível liberar a porta"
    echo "   Tente manualmente: kill -9 $PID"
    exit 1
  fi
  echo ""
fi

echo "📦 Iniciando wrangler dev..."
echo ""
echo "💡 Dica: Pressione 'x' para sair"
echo ""

# Iniciar servidor
wrangler dev --port $PORT

