#!/bin/bash

# Script para testar localmente
# Inicia o servidor e executa testes

echo "🚀 Iniciando testes locais..."
echo ""

# Verificar se wrangler está instalado
if ! command -v wrangler &> /dev/null; then
  echo "❌ Wrangler não encontrado. Instale com: npm install -g wrangler"
  exit 1
fi

# Verificar se o servidor já está rodando
if lsof -Pi :8787 -sTCP:LISTEN -t >/dev/null ; then
  echo "⚠️  Servidor já está rodando na porta 8787"
  echo "   Usando servidor existente..."
  SERVER_RUNNING=true
else
  echo "📦 Iniciando servidor local..."
  wrangler dev --port 8787 > /tmp/wrangler-dev.log 2>&1 &
  WRANGLER_PID=$!
  SERVER_RUNNING=false
  
  # Aguardar servidor iniciar
  echo "⏳ Aguardando servidor iniciar..."
  sleep 5
  
  # Verificar se iniciou
  if ! kill -0 $WRANGLER_PID 2>/dev/null; then
    echo "❌ Falha ao iniciar servidor"
    cat /tmp/wrangler-dev.log
    exit 1
  fi
fi

echo ""
echo "🧪 Executando testes..."
echo ""

# Executar testes
./test-api-complete.sh http://localhost:8787/api

# Salvar resultado
TEST_RESULT=$?

echo ""
if [ "$SERVER_RUNNING" = false ]; then
  echo "🛑 Parando servidor..."
  kill $WRANGLER_PID 2>/dev/null
  wait $WRANGLER_PID 2>/dev/null
fi

exit $TEST_RESULT

