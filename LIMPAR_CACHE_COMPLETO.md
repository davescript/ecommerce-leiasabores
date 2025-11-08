# 🧹 Como Limpar Cache Completamente

## 🎯 Problema

O admin não está funcionando porque o navegador está servindo versão antiga em cache.

---

## ✅ Soluções Aplicadas

1. ✅ **Service Worker desabilitado** - Não vai mais interceptar requisições
2. ✅ **Build corrigido** - Todas as correções aplicadas
3. ✅ **Deploy feito** - Novo deployment: `645d0670`

---

## 🧹 Limpar Cache no Navegador (PASSO A PASSO)

### Opção 1: Limpar Dados do Site (RECOMENDADO)

1. **Abra o site:** https://www.leiasabores.pt/admin
2. **Pressione F12** (abrir DevTools)
3. **Application** (no topo do DevTools)
4. **Storage** (menu lateral esquerdo)
5. **Clique em "Clear site data"** (botão no topo)
6. **Marque TODAS as opções:**
   - ✅ Cookies and other site data
   - ✅ Cached images and files
   - ✅ Service Workers
   - ✅ Storage
7. **Clique em "Clear site data"**
8. **Feche o DevTools**
9. **Recarregue a página:** `Cmd+Shift+R` (Mac) ou `Ctrl+Shift+R` (Windows)

### Opção 2: Desregistrar Service Workers Manualmente

1. **F12** → **Application** → **Service Workers**
2. **Clique em "Unregister"** em TODOS os service workers listados
3. **Application** → **Cache Storage**
4. **Clique com botão direito** em cada cache → **Delete**
5. **Recarregue a página:** `Cmd+Shift+R`

### Opção 3: Modo Anônimo (MAIS RÁPIDO)

1. **Abra janela anônima:**
   - Mac: `Cmd+Shift+N`
   - Windows: `Ctrl+Shift+N`
2. **Acesse:** https://www.leiasabores.pt/admin
3. **Deve funcionar imediatamente!**

---

## 🔍 Verificar se Funcionou

### 1. Verificar Console

No console do navegador, você deve ver:
- ✅ `[App] Carregando aplicação...`
- ✅ `[App] Carregando aplicação React...`
- ❌ NÃO deve ver erro `The script has an unsupported MIME type`

### 2. Verificar Network

1. **F12** → **Network**
2. **Recarregue a página**
3. **Procure por:** `app-v7-final-*.js`
4. **Verifique:**
   - Status: `200`
   - Type: `script` ou `javascript`
   - Content-Type: `application/javascript`

### 3. Verificar Design

Você deve ver:
- ✅ Sidebar moderna à esquerda
- ✅ Header com "Painel Admin"
- ✅ Layout limpo e profissional
- ❌ NÃO deve ver sidebar rosa/gradiente

---

## 🚨 Se Ainda Não Funcionar

### 1. Verificar Deployment

Teste a URL direta do deployment:
- https://645d0670.ecommerce-leiasabores.pages.dev/admin

Se funcionar aqui, é cache do Cloudflare no domínio principal.

### 2. Limpar Cache do Cloudflare

1. Acesse: https://dash.cloudflare.com/55b0027975cda6f67a48ea231d2cef8d/pages/view/ecommerce-leiasabores
2. Vá em **"Deployments"**
3. Encontre o deployment `645d0670`
4. Verifique se está **"Active"**

### 3. Aguardar Propagação

O Cloudflare pode levar **5-15 minutos** para propagar globalmente.

---

## 📋 Checklist Final

- [ ] Limpei todos os dados do site (Application → Storage → Clear site data)
- [ ] Desregistrei todos os Service Workers
- [ ] Limpei todos os caches (Cache Storage)
- [ ] Recarreguei com `Cmd+Shift+R`
- [ ] Testei em modo anônimo
- [ ] Verifiquei Network tab (JavaScript deve ser 200)
- [ ] Design moderno aparece

---

## 🎯 Resumo

**Deployment:** `645d0670` (recém feito)

**Ação necessária:**
1. Limpar cache do navegador completamente
2. Desregistrar Service Workers
3. Testar em modo anônimo (mais rápido)

**URLs para testar:**
- https://www.leiasabores.pt/admin
- https://645d0670.ecommerce-leiasabores.pages.dev/admin

---

**Última atualização:** 2025-11-07

