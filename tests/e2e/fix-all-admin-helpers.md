# Script para Corrigir Todos os Testes

Execute este comando para corrigir todos os testes de uma vez:

```bash
# Corrigir padrão AdminAPIHelper
find tests/e2e -name "*.spec.ts" -type f -exec sed -i '' \
  -e 's/const apiHelper = new AdminAPIHelper(adminApi, \([^,)]*\), adminToken)/const apiBaseUrl = \1\n    const apiHelper = new AdminAPIHelper(adminApi, apiBaseUrl)\n    await apiHelper.login('\''admin@leiasabores.pt'\'', '\''admin123'\'')/g' \
  -e 's/new AdminAPIHelper(adminApi, process\.env\.PLAYWRIGHT_API_URL || '\''https:\/\/api\.leiasabores\.pt\/api'\'', adminToken)/new AdminAPIHelper(adminApi, process.env.PLAYWRIGHT_API_URL || '\''https:\/\/api.leiasabores.pt\/api'\'')/g' \
  {} \;
```

Mas como isso é complexo, melhor corrigir manualmente os arquivos principais.

