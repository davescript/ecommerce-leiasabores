# GitHub Actions Setup

## Configuração de Secrets

Para que o workflow de deploy automático funcione, você precisa configurar um secret no GitHub.

### 1. Gerar token na Cloudflare

1. Acesse https://dash.cloudflare.com/profile/api-tokens
2. Clique em **Create Token**
3. Use o template **Edit Cloudflare Workers** ou crie um custom com:
   - **Permissions:**
     - Account > Cloudflare Workers Scripts > Edit
     - Account > D1 > Edit
     - Account > R2 > Edit
     - Zone > Pages > Publish
   - **Account Resources:** Selecione sua conta
4. Copie o token gerado

### 2. Adicionar secret no GitHub

1. Vá para seu repositório: https://github.com/davescript/ecommerce-leiasabores
2. Settings → Secrets and variables → Actions
3. Clique em **New repository secret**
4. Name: `CLOUDFLARE_API_TOKEN`
5. Value: Cole o token que copiou
6. Clique em **Add secret**

## O que o workflow faz

✅ **No push para `main`:**
- Valida lint (ESLint)
- Valida tipos (TypeScript)
- Faz build completo (frontend + backend)
- Deploy automático para Cloudflare Workers & Pages

❌ **Em Pull Requests:**
- Apenas valida e faz build (não faz deploy)

## Status do Deploy

Você pode ver o status em: https://github.com/davescript/ecommerce-leiasabores/actions
