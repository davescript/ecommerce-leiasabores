# 🔧 Solução Imediata: Cache do Navegador

## ⚠️ Problema

O navegador está servindo uma versão antiga do site em cache (Service Worker + Cache Storage).

---

## ✅ SOLUÇÃO RÁPIDA (Escolha uma)

### 🚀 Opção 1: Script Automático (RECOMENDADO)

**Acesse esta URL no navegador:**
```
https://leiasabores.pt/force-update.html
```

Clique no botão "Limpar Cache e Recarregar". Isso irá:
- ✅ Desregistrar todos os Service Workers
- ✅ Limpar todo o Cache Storage
- ✅ Limpar localStorage/sessionStorage
- ✅ Redirecionar para `/admin`

---

### 🛠️ Opção 2: Console do Navegador

1. Abra o DevTools (`F12` ou `Cmd+Option+I`)
2. Vá na aba **Console**
3. Cole este código e pressione Enter:

```javascript
navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));
caches.keys().then(names => names.forEach(name => caches.delete(name)));
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

---

### 📋 Opção 3: Manual (Passo a Passo)

1. **Abra DevTools** (`F12` ou `Cmd+Option+I`)

2. **Desregistrar Service Worker:**
   - Aba **Application** (ou **Aplicativo**)
   - Menu lateral: **Service Workers**
   - Clique em **"Unregister"** em cada service worker

3. **Limpar Cache Storage:**
   - Menu lateral: **Cache Storage**
   - Clique com botão direito em cada cache
   - Selecione **"Delete"**

4. **Limpar Dados do Site:**
   - Menu lateral: **Clear storage** (ou **Limpar armazenamento**)
   - Marque todas as opções
   - Clique em **"Clear site data"**

5. **Hard Refresh:**
   - Pressione `Ctrl+Shift+R` (Windows/Linux)
   - Ou `Cmd+Shift+R` (Mac)

---

## 🔍 Verificar se Funcionou

Após limpar o cache, você deve ver:
- ✅ **Sidebar à esquerda** com menu de navegação
- ✅ **Dashboard** com KPIs (vendas, pedidos, etc.)
- ✅ **SEM Header/Footer** do site público
- ✅ **Layout limpo** estilo Stripe Dashboard

---

## 📱 Se Ainda Não Funcionar

1. **Aguarde 2-3 minutos** após o deploy
2. **Tente em modo anônimo** (`Ctrl+Shift+N` ou `Cmd+Shift+N`)
3. **Tente em outro navegador** (Chrome, Firefox, Safari)
4. **Verifique o console** (`F12`) para erros JavaScript

---

## 🎯 Por Que Isso Acontece?

O Service Worker e o Cache Storage do navegador armazenam versões antigas do site para melhorar a performance. Quando fazemos mudanças grandes (como o novo painel admin), precisamos forçar a atualização.

---

**Última atualização:** 7 de Novembro de 2025

