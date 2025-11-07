# 🔧 Como Ver o Novo Painel Admin

## ⚠️ Problema

Você ainda está vendo o painel antigo mesmo após as mudanças.

## ✅ Solução

### 1. Verificar se o Deploy Foi Feito

Acesse: https://github.com/davescript/ecommerce-leiasabores/actions

Verifique se o último workflow "Build & Deploy" está com ✅ (sucesso).

Se estiver ❌ (falhou), verifique os logs.

---

### 2. Limpar Cache do Navegador

**Opção A: Hard Refresh (Rápido)**
- **Windows/Linux:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

**Opção B: Limpar Cache Completo**
1. Abra as configurações do Chrome
2. Vá em "Privacidade e segurança" → "Limpar dados de navegação"
3. Selecione "Imagens e arquivos em cache"
4. Clique em "Limpar dados"

**Opção C: Modo Anônimo (Teste Rápido)**
- Abra uma janela anônima (`Ctrl+Shift+N` ou `Cmd+Shift+N`)
- Acesse: https://leiasabores.pt/admin

---

### 3. Verificar se Está na Rota Correta

**✅ Rota Correta:**
- https://leiasabores.pt/admin

**❌ Rota Antiga (painel legado):**
- https://leiasabores.pt/admin/legacy

---

### 4. O Que Você Deve Ver

**✅ Novo Painel (Correto):**
- Sidebar à esquerda com menu
- Dashboard com KPIs (cards de métricas)
- Sem Header/Footer do site
- Layout limpo e moderno
- Menu com: Dashboard, Produtos, Pedidos, Clientes, etc.

**❌ Painel Antigo (Incorreto):**
- Header e Footer do site visíveis
- Sem sidebar
- Layout antigo

---

### 5. Se Ainda Não Funcionar

**Verificar Console do Navegador:**
1. Pressione `F12` (ou `Cmd+Option+I` no Mac)
2. Vá na aba "Console"
3. Procure por erros (texto vermelho)
4. Me envie os erros encontrados

**Verificar Network:**
1. Abra o DevTools (`F12`)
2. Vá na aba "Network"
3. Recarregue a página (`Ctrl+R`)
4. Verifique se os arquivos JS estão sendo carregados
5. Procure por arquivos com "AdminLayout" ou "Dashboard"

---

### 6. Deploy Manual (Se Necessário)

Se o deploy automático não funcionou:

```bash
# Backend
cd backend && npm run deploy

# Frontend
cd ../frontend && npm run build && cd .. && wrangler pages deploy dist/public --project-name=leiasabores
```

---

## 🎯 Checklist

- [ ] Deploy completou com sucesso no GitHub Actions
- [ ] Cache do navegador foi limpo
- [ ] Hard refresh foi feito (`Ctrl+Shift+R`)
- [ ] Está acessando `/admin` (não `/admin/legacy`)
- [ ] Console do navegador não mostra erros
- [ ] Arquivos JS estão sendo carregados

---

**Última atualização:** 7 de Novembro de 2025

