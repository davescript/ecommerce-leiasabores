# 🧪 Como Testar Localmente Antes do Deploy

## 🚀 Passo a Passo Rápido

### 1. Abrir Dois Terminais

**Terminal 1 - Backend:**
```bash
cd /Users/davidsousa/Documents/Websites/ecommerce
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
cd /Users/davidsousa/Documents/Websites/ecommerce
npm run dev:frontend
```

### 2. Aguardar Servidores Iniciarem

Você verá mensagens como:
- Backend: `Listening on http://localhost:8787`
- Frontend: `Local: http://localhost:5173/`

---

## 🔗 Links para Testar

### Frontend (Admin)
- **Dashboard:** http://localhost:5173/admin
- **Produtos:** http://localhost:5173/admin/products
- **Pedidos:** http://localhost:5173/admin/orders
- **Categorias:** http://localhost:5173/admin/categories
- **Cupons:** http://localhost:5173/admin/coupons
- **Clientes:** http://localhost:5173/admin/customers
- **Configurações:** http://localhost:5173/admin/settings

### Frontend (Site)
- **Home:** http://localhost:5173/
- **Catálogo:** http://localhost:5173/catalogo
- **Carrinho:** http://localhost:5173/carrinho
- **Checkout:** http://localhost:5173/checkout

### Backend (API)
- **Health Check:** http://localhost:8787/api/health
- **Produtos:** http://localhost:8787/api/products
- **Categorias:** http://localhost:8787/api/categories

---

## ✅ Verificação Rápida

### 1. Verificar se Backend está rodando:
```bash
curl http://localhost:8787/api/health
```

**Esperado:** `{"status":"ok","timestamp":"..."}`

### 2. Verificar se Frontend está rodando:
Abra no navegador: **http://localhost:5173**

Deve carregar a página inicial.

### 3. Testar Admin:
Abra no navegador: **http://localhost:5173/admin**

Deve mostrar o painel admin com layout moderno.

---

## 🔧 Comandos Úteis

### Parar Servidores
- Pressione `Ctrl+C` em cada terminal

### Verificar Portas em Uso
```bash
# Verificar porta 5173 (frontend)
lsof -i :5173

# Verificar porta 8787 (backend)
lsof -i :8787
```

### Matar Processo na Porta
```bash
# Matar processo na porta 5173
kill -9 $(lsof -ti:5173)

# Matar processo na porta 8787
kill -9 $(lsof -ti:8787)
```

---

## 📋 Checklist de Teste

Antes de fazer deploy, teste:

### Admin
- [ ] http://localhost:5173/admin carrega
- [ ] Layout moderno aparece (sidebar, header)
- [ ] Navegação entre páginas funciona
- [ ] Dashboard mostra estatísticas
- [ ] Produtos lista/cria/edita/deleta
- [ ] Token JWT pode ser configurado

### Site
- [ ] http://localhost:5173/ carrega
- [ ] Produtos aparecem na home
- [ ] Categorias funcionam
- [ ] Carrinho funciona
- [ ] Checkout funciona

### API
- [ ] http://localhost:8787/api/health responde
- [ ] http://localhost:8787/api/products retorna JSON
- [ ] http://localhost:8787/api/categories retorna JSON

---

## 🚨 Troubleshooting

### Porta já em uso?
```bash
# Ver qual processo está usando
lsof -i :5173
lsof -i :8787

# Matar processo
kill -9 <PID>
```

### Backend não conecta?
- Verifique se `wrangler dev` está rodando
- Verifique se a porta 8787 está livre
- Verifique logs no terminal do backend

### Frontend não carrega?
- Verifique se `npm run dev:frontend` está rodando
- Verifique se a porta 5173 está livre
- Verifique logs no terminal do frontend
- Tente limpar cache: `Ctrl+Shift+R` ou `Cmd+Shift+R`

### Erro de CORS?
- O proxy do Vite resolve automaticamente
- Certifique-se de que o backend está rodando na porta 8787
- Verifique `vite.config.ts` - proxy está configurado

---

## 🎯 Resumo

**URL Principal para Testar Admin:**
```
http://localhost:5173/admin
```

**Comandos:**
```bash
# Terminal 1
npm run dev:backend

# Terminal 2  
npm run dev:frontend
```

**Depois de testar localmente e confirmar que está tudo OK, faça o deploy!**

---

**Última atualização:** 2025-11-07

