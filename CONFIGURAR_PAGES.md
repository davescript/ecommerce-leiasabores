# 🚀 Guia de Configuração do Cloudflare Pages

## ✅ O que já está feito:
- ✅ Projeto Pages criado: `leiasabores-frontend`
- ✅ Deploy inicial realizado
- ✅ Cloudflare Access desabilitado
- ✅ Site funcionando: https://0862d543.leiasabores-frontend.pages.dev

## 📋 Próximos Passos

### 1. Conectar GitHub (Deploy Automático)

**Link direto:**
https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/pages/view/leiasabores-frontend

**Passos:**
1. Acesse o link acima
2. Clique em **"Settings"** (Configurações)
3. Role até **"Builds & deployments"**
4. Clique em **"Connect to Git"**
5. Selecione o repositório: `davescript/ecommerce-leiasabores`
6. Configure:
   - **Production branch:** `main`
   - **Framework preset:** `None` (ou `Vite`)
   - **Build command:** `npm run build:frontend`
   - **Build output directory:** `dist/public`
   - **Root directory:** `/` (raiz)
7. Clique em **"Save and Deploy"**

### 2. Adicionar Domínios Customizados

**Link direto:**
https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/pages/view/leiasabores-frontend/custom-domains

**Passos:**
1. Acesse o link acima
2. Clique em **"Set up a custom domain"**
3. Adicione:
   - `leiasabores.pt`
   - `www.leiasabores.pt`
4. Siga as instruções para configurar DNS

### 3. Configurar DNS

**Link direto:**
https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/leiasabores.pt/dns

**Registros DNS necessários:**

#### Para `leiasabores.pt` (domínio raiz):
- **Tipo:** `CNAME`
- **Nome:** `@` (ou deixar em branco)
- **Conteúdo:** `leiasabores-frontend.pages.dev`
- **Proxy:** ✅ Ativado (laranja)

#### Para `www.leiasabores.pt`:
- **Tipo:** `CNAME`
- **Nome:** `www`
- **Conteúdo:** `leiasabores-frontend.pages.dev`
- **Proxy:** ✅ Ativado (laranja)

**Nota:** Se o domínio raiz não aceitar CNAME, use:
- **Tipo:** `A` ou `AAAA`
- **Conteúdo:** (o Cloudflare Pages fornecerá o IP quando você adicionar o domínio)

### 4. Verificar Status

Após configurar tudo, verifique:
- ✅ Deploy automático funcionando (a cada push no GitHub)
- ✅ Domínios customizados ativos
- ✅ DNS propagado (pode levar alguns minutos)

## 🔧 Comandos Úteis

### Fazer deploy manual:
```bash
npm run build:frontend
wrangler pages deploy dist/public --project-name=leiasabores-frontend
```

### Ver projetos Pages:
```bash
wrangler pages project list
```

### Ver deployments:
```bash
wrangler pages deployment list --project-name=leiasabores-frontend
```

## 📞 Suporte

Se algo não funcionar:
1. Verifique os logs no Dashboard do Cloudflare Pages
2. Verifique os logs do GitHub Actions (se conectado)
3. Teste o site no hostname do Pages: `https://[hash].leiasabores-frontend.pages.dev`

