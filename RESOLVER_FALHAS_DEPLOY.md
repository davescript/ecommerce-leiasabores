# 🔧 Resolver Falhas no Deploy do GitHub Actions

## O que significa "workflow run failed"?

Quando você vê notificações de "workflow run failed" no GitHub, significa que o processo automático de deploy está falhando em alguma etapa.

## Possíveis Causas

### 1. ❌ Secrets não configurados (MAIS COMUM)

O workflow precisa de secrets do Cloudflare para fazer deploy:

- `CLOUDFLARE_API_TOKEN` - Token de API do Cloudflare
- `CLOUDFLARE_ACCOUNT_ID` - ID da conta Cloudflare

**Solução:**
1. Vá para: https://github.com/davescript/ecommerce-leiasabores/settings/secrets/actions
2. Adicione os secrets conforme instruções em `GITHUB_DEPLOY_SETUP.md`

### 2. ❌ Erros no lint ou type-check

O workflow valida o código antes de fazer deploy.

**Solução:**
```bash
# Testar localmente
npm run lint
npm run type-check
```

Se houver erros, corrija antes de fazer push.

### 3. ❌ Erros no build

O build pode falhar por várias razões.

**Solução:**
```bash
# Testar build localmente
npm run build
```

### 4. ❌ Problemas com wrangler

O deploy pode falhar se o wrangler não estiver configurado corretamente.

## Como Verificar o Erro Específico

1. Vá para: https://github.com/davescript/ecommerce-leiasabores/actions
2. Clique no workflow que falhou (o mais recente)
3. Clique no job que falhou (validate, build ou deploy)
4. Veja os logs para identificar o erro exato

## Solução Rápida

### Opção 1: Desabilitar Deploy Automático Temporariamente

Se você não precisa do deploy automático agora, pode comentar o job de deploy:

```yaml
# .github/workflows/deploy.yml
# deploy:
#   name: Deploy to Cloudflare
#   ...
```

### Opção 2: Fazer Deploy Manual

Você pode fazer deploy manualmente sem usar o GitHub Actions:

```bash
npm run build
npm run deploy
```

### Opção 3: Configurar os Secrets

Siga as instruções em `GITHUB_DEPLOY_SETUP.md` para configurar os secrets.

## Verificar Status

Para ver o status dos workflows:
- https://github.com/davescript/ecommerce-leiasabores/actions

## Próximos Passos

1. **Verifique os logs** do workflow que falhou para ver o erro específico
2. **Configure os secrets** se ainda não foram configurados
3. **Teste localmente** antes de fazer push
4. **Ou faça deploy manual** se preferir

