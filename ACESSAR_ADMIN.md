# 🔧 Como Acessar o Painel Admin

## ✅ Correções Aplicadas

As seguintes correções foram commitadas e estão sendo deployadas:

1. ✅ **ProtectedRoute** - Agora permite acesso ao `/admin` sempre
2. ✅ **Campo de preço** - Melhorado para aceitar edição livre
3. ✅ **Endpoint de produto teste** - Criado para adicionar produto de 1€

---

## 🚀 Como Acessar

### 1. Aguardar Deploy (2-3 minutos)

O deploy automático está rodando. Aguarde até:
- GitHub Actions mostrar "Deploy Frontend" e "Deploy Backend" completos
- Verifique em: https://github.com/davescript/ecommerce-leiasabores/actions

### 2. Limpar Cache do Navegador

**Chrome/Edge:**
- `Ctrl+Shift+R` (Windows/Linux)
- `Cmd+Shift+R` (Mac)

**Ou:**
- Abrir DevTools (F12)
- Clicar com botão direito no botão de recarregar
- Selecionar "Limpar cache e recarregar forçadamente"

### 3. Acessar o Painel

```
https://leiasabores.pt/admin
```

---

## 🔍 Se Ainda Não Aparecer

### Verificar Console do Navegador

1. Abrir DevTools (F12)
2. Ir para aba "Console"
3. Verificar se há erros em vermelho
4. Tirar screenshot dos erros

### Verificar Network

1. DevTools → Aba "Network"
2. Recarregar a página
3. Verificar se `/admin` retorna 200 (não 404 ou 500)

### Verificar se Deploy Terminou

1. GitHub → Actions
2. Verificar se o último workflow completou com sucesso
3. Se falhou, ver os logs do erro

---

## 🛠️ Solução Alternativa: Acessar Localmente

Se o deploy demorar, você pode testar localmente:

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

Depois acesse: `http://localhost:5173/admin`

---

## 📋 O Que Deve Aparecer

Quando funcionar, você verá:

1. **Título:** "Admin — Leia Sabores"
2. **Seção de Autenticação:**
   - Campo para JWT Token
   - Botão "Aplicar"
3. **Lista de Produtos:**
   - Produtos existentes com botões "Editar" e "Eliminar"
4. **Formulário:**
   - Campos para criar/editar produtos
   - Campo de preço melhorado

---

## ⚠️ Problemas Comuns

### Erro 404 (Not Found)

**Causa:** Rota não encontrada
**Solução:** Verificar se o deploy do frontend completou

### Erro 500 (Internal Server Error)

**Causa:** Erro no backend
**Solução:** Verificar logs do Cloudflare Workers

### Página em Branco

**Causa:** Erro JavaScript
**Solução:** Verificar console do navegador (F12)

### Redireciona para Home

**Causa:** ProtectedRoute bloqueando
**Solução:** Já corrigido! Aguardar deploy

---

## 🎯 Checklist

- [ ] Deploy completou no GitHub Actions
- [ ] Cache do navegador limpo
- [ ] Acessou `https://leiasabores.pt/admin`
- [ ] Console do navegador sem erros
- [ ] Painel Admin aparece

---

**Última atualização:** 7 de Novembro de 2025

