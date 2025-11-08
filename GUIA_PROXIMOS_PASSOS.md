# 🎯 Guia Passo a Passo - Próximos Passos

## 📊 Status Atual

### ✅ O que já está funcionando:
- ✅ Projeto Pages: `leiasabores-frontend` criado
- ✅ Worker: `ecommerce-backend` deployado
- ✅ DNS configurado:
  - `www.leiasabores.pt` - ✅ Ativo
  - `leiasabores.pt` - ⏳ Verificando (mas funcionando)
- ✅ SSL/TLS ativo automaticamente
- ✅ Backend com rotas configuradas
- ✅ Frontend deployado

---

## 🚀 Passo 1: Conectar GitHub ao Pages (Deploy Automático)

**Objetivo:** Configurar deploy automático a cada push no GitHub.

### 📋 Informações Necessárias:
- **Repositório:** `davescript/ecommerce-leiasabores`
- **Branch de produção:** `main`
- **Build command:** `npm run build:frontend`
- **Build output directory:** `dist/public`
- **Root directory:** `/` (raiz do projeto)

### 🔗 Link Direto:
https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/pages/view/leiasabores-frontend

### 📝 Passo a Passo Detalhado:

1. **Acesse o Dashboard do Pages**
   - Clique no link acima ou navegue manualmente:
     - Cloudflare Dashboard → Pages → `leiasabores-frontend`

2. **Vá para Configurações**
   - Clique em **"Settings"** (Configurações) no menu lateral

3. **Conecte ao Git**
   - Role até a seção **"Builds & deployments"**
   - Clique em **"Connect to Git"** (Conectar ao Git)

4. **Autorize o Cloudflare**
   - Se solicitado, autorize o Cloudflare a acessar seu GitHub
   - Selecione a conta/organização do GitHub

5. **Selecione o Repositório**
   - Procure e selecione: `davescript/ecommerce-leiasabores`
   - Clique em **"Begin setup"**

6. **Configure o Build**
   - **Production branch:** `main`
   - **Framework preset:** `None` (ou deixe em branco)
   - **Build command:** `npm run build:frontend`
   - **Build output directory:** `dist/public`
   - **Root directory:** `/` (deixe em branco ou coloque `/`)

7. **Salve e Faça Deploy**
   - Clique em **"Save and Deploy"**
   - Aguarde o primeiro build completar

### ✅ Verificação:
- Após o deploy, você verá o status na página do projeto
- Cada push no `main` fará deploy automático
- Pull Requests terão preview deployments

---

## 🔧 Passo 2: Verificar Backend (API)

**Objetivo:** Garantir que a API está funcionando corretamente.

### 🧪 Testes Rápidos:

Execute estes comandos no terminal:

```bash
# 1. Health Check
curl https://api.leiasabores.pt/api/health

# Resposta esperada: {"status":"ok","timestamp":"..."}

# 2. Listar Produtos
curl https://api.leiasabores.pt/api/products

# Resposta esperada: JSON com array de produtos

# 3. Listar Categorias
curl https://api.leiasabores.pt/api/categories

# Resposta esperada: JSON com árvore de categorias

# 4. Testar rota alternativa (se api.leiasabores.pt não funcionar)
curl https://leiasabores.pt/api/health
```

### 🔍 Verificar Worker no Dashboard:

1. **Acesse o Dashboard do Workers**
   - Link: https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/workers
   - Ou: Cloudflare Dashboard → Workers & Pages → Workers

2. **Selecione o Worker**
   - Clique em `ecommerce-backend`

3. **Verifique as Rotas**
   - Vá em **"Settings"** → **"Triggers"**
   - Verifique se as rotas estão configuradas:
     - `leiasabores.pt/api/*`
     - `api.leiasabores.pt/*`

4. **Verifique os Logs**
   - Vá em **"Logs"** para ver requisições recentes
   - Verifique se há erros

### 🔄 Se o Worker não estiver deployado:

```bash
cd /Users/davidsousa/Documents/Websites/ecommerce

# Deploy do backend
npm run deploy

# Ou apenas o backend
npm run build:backend
wrangler deploy
```

### 🔐 Verificar Secrets do Worker:

```bash
# Listar secrets configurados
wrangler secret list

# Secrets necessários:
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
# - JWT_SECRET
```

Se algum secret estiver faltando, configure com:
```bash
wrangler secret put NOME_DO_SECRET
```

---

## 🧪 Passo 3: Testar Funcionalidades Completas

### 🌐 Frontend:

#### URLs para Testar:
- **Site principal:** https://www.leiasabores.pt
- **Site alternativo:** https://leiasabores.pt
- **Admin panel:** https://www.leiasabores.pt/admin

#### Checklist de Funcionalidades:

**Página Inicial:**
- [ ] Site carrega corretamente
- [ ] Produtos aparecem na listagem
- [ ] Imagens carregam
- [ ] Navegação funciona

**Categorias:**
- [ ] Menu de categorias aparece
- [ ] Clicar em categoria filtra produtos
- [ ] Breadcrumbs funcionam

**Produtos:**
- [ ] Página de detalhes do produto carrega
- [ ] Imagens do produto aparecem
- [ ] Botão "Adicionar ao carrinho" funciona
- [ ] Quantidade pode ser alterada

**Carrinho:**
- [ ] Itens aparecem no carrinho
- [ ] Quantidade pode ser alterada
- [ ] Remover item funciona
- [ ] Total calculado corretamente

**Checkout:**
- [ ] Formulário de checkout aparece
- [ ] Campos de endereço funcionam
- [ ] Integração Stripe funciona
- [ ] Pagamento pode ser processado

### 🔐 Admin Panel:

#### Checklist Admin:

**Login:**
- [ ] Página de login acessível em `/admin`
- [ ] Login com credenciais funciona
- [ ] Token JWT é salvo corretamente

**Dashboard:**
- [ ] Estatísticas aparecem
- [ ] Gráficos carregam
- [ ] Informações estão corretas

**Produtos (CRUD):**
- [ ] Listagem de produtos funciona
- [ ] Criar novo produto funciona
- [ ] Editar produto funciona
- [ ] Deletar produto funciona
- [ ] Upload de imagens funciona

**Pedidos:**
- [ ] Listagem de pedidos aparece
- [ ] Detalhes do pedido carregam
- [ ] Status pode ser alterado

**Clientes:**
- [ ] Listagem de clientes aparece
- [ ] Detalhes do cliente carregam

---

## 🔍 Passo 4: Verificar Variáveis de Ambiente

### Frontend (Cloudflare Pages):

Se o frontend precisar de variáveis de ambiente:

1. **Acesse o Dashboard do Pages**
   - Link: https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/pages/view/leiasabores-frontend

2. **Vá em Settings → Environment variables**

3. **Adicione variáveis se necessário:**
   - Exemplo: `VITE_API_URL` = `https://api.leiasabores.pt`

**Nota:** Variáveis que começam com `VITE_` são expostas ao frontend.

### Backend (Cloudflare Workers):

As variáveis já estão configuradas no `wrangler.toml`, mas verifique os secrets:

```bash
wrangler secret list
```

Secrets necessários:
- `STRIPE_SECRET_KEY` - Chave secreta do Stripe
- `STRIPE_WEBHOOK_SECRET` - Secret do webhook do Stripe
- `JWT_SECRET` - Secret para tokens JWT

---

## 📊 Passo 5: Monitoramento

### Cloudflare Analytics:

1. **Acesse o Dashboard do Pages**
   - Vá em **"Metrics"** para ver:
     - Tráfego
     - Erros
     - Performance
     - Builds

2. **Acesse o Dashboard do Workers**
   - Vá em **"Logs"** para ver:
     - Requisições recentes
     - Erros
     - Tempo de resposta

### Verificar Performance:

```bash
# Testar tempo de resposta do frontend
curl -w "@-" -o /dev/null -s https://www.leiasabores.pt <<'EOF'
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
EOF

# Testar tempo de resposta da API
curl -w "@-" -o /dev/null -s https://api.leiasabores.pt/api/health <<'EOF'
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
EOF
```

---

## 🚨 Troubleshooting

### Problema: GitHub não conecta ao Pages

**Soluções:**
1. Verifique se o repositório existe e está acessível
2. Verifique se você tem permissões no repositório
3. Tente desconectar e reconectar
4. Verifique se o Cloudflare tem acesso ao GitHub

### Problema: Build falha no Pages

**Soluções:**
1. Verifique os logs do build no Dashboard
2. Confirme que o `package.json` tem o script `build:frontend`
3. Verifique se todas as dependências estão no `package.json`
4. Teste o build localmente:
   ```bash
   npm run build:frontend
   ```

### Problema: API não responde

**Soluções:**
1. Verifique se o Worker está deployado
2. Verifique as rotas no Dashboard
3. Verifique os logs do Worker
4. Teste localmente:
   ```bash
   npm run dev:backend
   ```

### Problema: Frontend não carrega

**Soluções:**
1. Verifique se o DNS está propagado
2. Verifique se os domínios customizados estão configurados
3. Verifique os logs do Pages
4. Teste o URL temporário: `https://[hash].leiasabores-frontend.pages.dev`

---

## ✅ Checklist Final

### Configuração:
- [ ] GitHub conectado ao Pages
- [ ] Deploy automático funcionando
- [ ] Backend deployado e funcionando
- [ ] Secrets do Worker configurados
- [ ] DNS propagado completamente

### Funcionalidades:
- [ ] Frontend carrega corretamente
- [ ] Produtos aparecem
- [ ] Categorias funcionam
- [ ] Carrinho funciona
- [ ] Checkout funciona
- [ ] Admin panel acessível
- [ ] Login admin funciona
- [ ] CRUD de produtos funciona

### Monitoramento:
- [ ] Analytics configurado
- [ ] Logs sendo monitorados
- [ ] Performance verificada

---

## 🔗 Links Úteis

- **Pages Dashboard:** https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/pages/view/leiasabores-frontend
- **Workers Dashboard:** https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/workers
- **DNS:** https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/leiasabores.pt/dns
- **GitHub Repo:** https://github.com/davescript/ecommerce-leiasabores
- **Site:** https://www.leiasabores.pt
- **Admin:** https://www.leiasabores.pt/admin
- **API:** https://api.leiasabores.pt/api

---

## 🎯 Prioridade de Execução

**Alta Prioridade (Fazer Agora):**
1. ✅ Conectar GitHub ao Pages
2. ✅ Verificar se backend está funcionando
3. ✅ Testar site completo

**Média Prioridade (Fazer Depois):**
4. ⏳ Configurar variáveis de ambiente (se necessário)
5. ⏳ Monitoramento básico

**Baixa Prioridade (Opcional):**
6. ⏳ Otimizações avançadas
7. ⏳ Analytics detalhado

---

**Última atualização:** 2025-11-07

