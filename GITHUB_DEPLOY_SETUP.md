# 🚀 Configuração de Deploy no GitHub Actions

Este documento explica como configurar o deploy automático do projeto no GitHub Actions para Cloudflare.

## 📋 Pré-requisitos

1. Conta no GitHub
2. Conta no Cloudflare
3. Projeto já configurado no Cloudflare (Workers + Pages)

## 🔐 Configurar Secrets no GitHub

Para que o deploy funcione, você precisa adicionar os seguintes secrets no repositório GitHub:

### Como adicionar secrets:

1. Vá para o repositório no GitHub
2. Clique em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Adicione cada um dos secrets abaixo:

### Secrets necessários:

| Secret Name | Descrição | Como obter |
|------------|-----------|------------|
| `CLOUDFLARE_API_TOKEN` | Token de API do Cloudflare | Cloudflare Dashboard → My Profile → API Tokens → Create Token |
| `CLOUDFLARE_ACCOUNT_ID` | ID da conta Cloudflare | Cloudflare Dashboard → Right sidebar → Account ID |

### Como obter o CLOUDFLARE_API_TOKEN:

1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Vá em **My Profile** → **API Tokens**
3. Clique em **Create Token**
4. Use o template **Edit Cloudflare Workers** ou crie um token customizado com as permissões:
   - **Account** → **Cloudflare Workers** → **Edit**
   - **Account** → **Cloudflare Pages** → **Edit**
   - **Zone** → **Zone** → **Read** (se necessário)
5. Copie o token gerado e adicione como secret no GitHub

### Como obter o CLOUDFLARE_ACCOUNT_ID:

1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. No canto superior direito, você verá o **Account ID**
3. Copie e adicione como secret no GitHub

## 🔄 Como funciona o deploy

O workflow está configurado em `.github/workflows/deploy.yml` e executa automaticamente quando:

- Um push é feito para a branch `main`
- O build e validação passam com sucesso

### Processo de deploy:

1. **Validate**: Valida o código (lint + type-check)
2. **Build**: Compila o frontend e backend
3. **Deploy**: Faz deploy para Cloudflare Workers e Pages

## ✅ Verificar se está funcionando

1. Faça um commit e push para a branch `main`
2. Vá para **Actions** no GitHub
3. Você verá o workflow rodando
4. Se tudo estiver correto, o deploy será feito automaticamente

## 🐛 Troubleshooting

### Erro: "Authentication failed"

- Verifique se os secrets estão configurados corretamente
- Verifique se o token tem as permissões necessárias
- Tente gerar um novo token

### Erro: "Account ID not found"

- Verifique se o `CLOUDFLARE_ACCOUNT_ID` está correto
- Certifique-se de que está usando o Account ID, não o Zone ID

### Erro no build

- Verifique os logs do workflow
- Certifique-se de que todas as dependências estão no `package.json`
- Execute `npm run build` localmente para verificar erros

## 📝 Notas

- O deploy só acontece na branch `main`
- Pull requests executam apenas validação, não deploy
- O frontend é deployado para Cloudflare Pages
- O backend é deployado para Cloudflare Workers

## 🔗 Links úteis

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

