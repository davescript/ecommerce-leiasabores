#!/bin/bash
# Script para corrigir todos os testes que ainda usam adminToken

# Credenciais
EMAIL="admin@leiasabores.pt"
PASSWORD="admin123"

# Padrão a procurar
PATTERN="new AdminAPIHelper(adminApi, process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api', adminToken)"

# Substituição
REPLACEMENT="new AdminAPIHelper(adminApi, process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api')"

# Encontrar e corrigir todos os arquivos
find tests/e2e -name "*.spec.ts" -type f | while read file; do
  if grep -q "adminToken)" "$file"; then
    echo "Corrigindo: $file"
    
    # Substituir padrão AdminAPIHelper com adminToken
    sed -i '' "s|new AdminAPIHelper(adminApi, process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api', adminToken)|new AdminAPIHelper(adminApi, process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api')|g" "$file"
    
    # Adicionar login após criação do helper (se não existir na mesma função)
    # Isso é mais complexo, então vamos fazer manualmente nos arquivos críticos
  fi
done

echo "Correções aplicadas!"

