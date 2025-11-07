# 🔧 Como Limpar Cache do Service Worker

## ⚠️ Problema

O Service Worker pode estar servindo uma versão antiga do site em cache.

## ✅ Solução Manual (Imediata)

### 1. Abrir DevTools

Pressione `F12` (ou `Cmd+Option+I` no Mac)

### 2. Ir para Application

1. Clique na aba **"Application"** (ou **"Aplicativo"**)
2. No menu lateral, expanda **"Service Workers"**
3. Você verá o service worker registrado

### 3. Desregistrar Service Worker

1. Clique em **"Unregister"** (ou **"Desregistrar"**)
2. Ou marque **"Bypass for network"** (ou **"Ignorar para rede"**)

### 4. Limpar Cache

1. No menu lateral, clique em **"Cache Storage"**
2. Clique com botão direito em cada cache
3. Selecione **"Delete"** (ou **"Excluir"**)

### 5. Limpar Dados do Site

1. No menu lateral, clique em **"Clear storage"** (ou **"Limpar armazenamento"**)
2. Marque todas as opções
3. Clique em **"Clear site data"** (ou **"Limpar dados do site"**)

### 6. Recarregar

Pressione `Ctrl+Shift+R` (ou `Cmd+Shift+R` no Mac) para hard refresh

---

## 🚀 Solução Automática (Após Deploy)

O novo service worker (v2.0) irá:
- ✅ Deletar automaticamente caches antigos
- ✅ Forçar atualização
- ✅ Usar network-first para `/admin`

**Aguarde 2-3 minutos após o deploy e recarregue a página.**

---

## 📋 Checklist

- [ ] Service Worker desregistrado
- [ ] Cache Storage limpo
- [ ] Clear storage executado
- [ ] Hard refresh feito
- [ ] Página recarregada

---

**Última atualização:** 7 de Novembro de 2025

