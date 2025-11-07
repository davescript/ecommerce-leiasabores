# ✅ Verificação Completa - Leia Sabores

## 🔍 Checklist de Funcionalidades

### 1. DNS e Infraestrutura
- [ ] `leiasabores.pt` resolve corretamente
- [ ] `www.leiasabores.pt` resolve corretamente
- [ ] `api.leiasabores.pt` resolve corretamente
- [ ] SSL/TLS ativo em todos os domínios

### 2. Backend (API)
- [ ] `https://api.leiasabores.pt/api/health` responde
- [ ] `https://api.leiasabores.pt/api/products` retorna produtos
- [ ] `https://api.leiasabores.pt/api/categories` retorna categorias
- [ ] `https://api.leiasabores.pt/api/cart` funciona
- [ ] `https://api.leiasabores.pt/api/checkout` funciona
- [ ] `https://api.leiasabores.pt/api/payment-intent` funciona
- [ ] `https://api.leiasabores.pt/api/admin/*` funciona (com autenticação)

### 3. Frontend
- [ ] `https://www.leiasabores.pt` carrega
- [ ] `https://leiasabores.pt` carrega (ou redireciona para www)
- [ ] Página inicial mostra produtos
- [ ] Categorias aparecem
- [ ] Busca funciona
- [ ] Carrinho funciona
- [ ] Checkout funciona

### 4. Admin Panel
- [ ] `https://www.leiasabores.pt/admin` acessível
- [ ] Login admin funciona
- [ ] Listagem de produtos funciona
- [ ] Criar produto funciona
- [ ] Editar produto funciona
- [ ] Deletar produto funciona
- [ ] Upload de imagens funciona
- [ ] Exportar produtos funciona
- [ ] Importar produtos funciona

### 5. Deploy Automático
- [ ] GitHub conectado ao Pages
- [ ] Deploy automático configurado
- [ ] Build command correto
- [ ] Build output correto

### 6. Worker (Backend)
- [ ] Worker deployado
- [ ] Rotas configuradas
- [ ] D1 Database conectado
- [ ] R2 Storage conectado
- [ ] Secrets configurados

---

## 🧪 Testes Automatizados

Execute estes comandos para verificar:

```bash
# Backend Health
curl https://api.leiasabores.pt/api/health

# Produtos
curl https://api.leiasabores.pt/api/products

# Categorias
curl https://api.leiasabores.pt/api/categories

# Frontend
curl -I https://www.leiasabores.pt

# Admin
curl -I https://www.leiasabores.pt/admin
```

---

## 🔧 Configurações Pendentes

### Se algo não funcionar:

1. **Backend não responde:**
   ```bash
   wrangler deploy
   ```

2. **Frontend não carrega:**
   - Verificar deploy no Pages
   - Verificar build logs
   - Verificar DNS

3. **Admin não funciona:**
   - Verificar rotas no App.tsx
   - Verificar autenticação
   - Verificar token JWT

4. **Produtos não aparecem:**
   - Verificar se há produtos no banco
   - Verificar API de produtos
   - Verificar frontend está chamando API correta

---

**Última verificação:** 2025-11-07

