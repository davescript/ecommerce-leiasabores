# 🔐 Como Ver a Chave Secreta do Stripe

## 📍 Você está na página certa!

Você já está em: **https://dashboard.stripe.com/apikeys**

---

## 🎯 Passo a Passo

### Opção 1: Usar o botão "..." (três pontos)

1. Na linha da **"Chave secreta"** (a que mostra `sk_live_...EGbJ`)
2. Clique no botão **"..."** (três pontos) na coluna "CRIAÇÃO"
3. No menu que aparecer, procure por:
   - **"Revelar chave de teste"** ou
   - **"Revelar chave secreta"** ou
   - **"View test key"** / **"View secret key"**
4. Clique nessa opção
5. A chave completa será revelada

### Opção 2: Clicar diretamente na chave

1. Na linha da **"Chave secreta"**
2. Clique no token parcial (`sk_live_...EGbJ`)
3. Isso pode abrir uma página de detalhes
4. Procure por um botão **"Reveal"** ou **"Revelar"**
5. Clique para ver a chave completa

### Opção 3: Recriar a chave (se não conseguir revelar)

Se não conseguir revelar a chave existente:

1. Clique no botão **"+ Criar chave secreta"** (acima da tabela)
2. Escolha **"Chave secreta"**
3. **IMPORTANTE:** A chave será mostrada **APENAS UMA VEZ** quando criar
4. **Copie imediatamente!** (você não conseguirá ver depois)

---

## ⚠️ IMPORTANTE

### Chave de Teste vs Produção

- **`sk_test_...`** = Chave de teste (gratuita, não cobra dinheiro real)
- **`sk_live_...`** = Chave de produção (cobra dinheiro real!)

**Para desenvolvimento/testes, use `sk_test_...`**

### Se você só tem `sk_live_...`

1. Vá em **"Developers"** → **"API keys"**
2. Procure por uma seção de **"Test mode"** ou **"Modo de teste"**
3. Ou clique no toggle no topo da página para alternar entre **"Test mode"** e **"Live mode"**
4. No modo de teste, você verá chaves `sk_test_...`

---

## 📋 O que fazer depois de ver a chave

1. **Copie a chave completa** (começa com `sk_test_...` ou `sk_live_...`)
2. **Configure no Cloudflare Workers:**

```bash
# Fazer login (se ainda não fez)
wrangler login

# Configurar a chave
wrangler secret put STRIPE_SECRET_KEY
# Cole a chave quando pedir
```

---

## 🎯 Resumo Visual

```
Stripe Dashboard → Developers → API keys
    ↓
Encontrar "Chave secreta" (sk_live_...EGbJ)
    ↓
Clicar em "..." (três pontos)
    ↓
Clicar em "Revelar chave secreta"
    ↓
Copiar chave completa
    ↓
wrangler secret put STRIPE_SECRET_KEY
```

---

## 💡 Dica

Se você não conseguir revelar a chave existente, pode criar uma nova:

1. Clique em **"+ Criar chave secreta"**
2. Escolha **"Chave secreta"**
3. **Copie imediatamente** (só aparece uma vez!)
4. Use essa nova chave

**⚠️ ATENÇÃO:** Se criar uma nova chave, você precisará atualizar em todos os lugares onde a chave antiga está configurada.

---

**Última atualização:** 6 de Novembro de 2025

