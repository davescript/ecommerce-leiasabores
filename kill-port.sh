#!/bin/bash

# Script para matar processo na porta 8787
# Uso: ./kill-port.sh [PORTA]

PORT="${1:-8787}"

echo "🔍 Procurando processo na porta $PORT..."

PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PID" ]; then
  echo "✅ Nenhum processo encontrado na porta $PORT"
  exit 0
fi

echo "⚠️  Processo encontrado: PID $PID"
echo "   Detalhes:"
ps -p $PID -o pid,command 2>/dev/null || echo "   (processo não encontrado)"

echo ""
read -p "Deseja matar o processo? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
  kill $PID 2>/dev/null
  sleep 1
  
  # Verificar se ainda está rodando
  if lsof -ti:$PORT >/dev/null 2>&1; then
    echo "⚠️  Processo ainda rodando, forçando..."
    kill -9 $PID 2>/dev/null
    sleep 1
  fi
  
  if ! lsof -ti:$PORT >/dev/null 2>&1; then
    echo "✅ Processo terminado com sucesso!"
  else
    echo "❌ Não foi possível terminar o processo"
    exit 1
  fi
else
  echo "ℹ️  Processo não foi terminado"
  exit 0
fi

