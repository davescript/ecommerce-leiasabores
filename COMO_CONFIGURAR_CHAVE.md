# 🚀 Como Configurar a Chave Restrita do Stripe

## 📋 Passo a Passo Rápido

### 1️⃣ Fazer Login no Cloudflare (se ainda não fez)

```bash
wrangler login
```

Isso vai abrir o navegador para você fazer login.

---

### 2️⃣ Configurar a Chave Restrita

```bash
wrangler secret put STRIPE_SECRET_KEY
```

Quando aparecer a mensagem:
```
Enter the secret value:
```

**Cole a sua chave restrita** (começa com `rk_live_...` ou `rk_test_...`)

Pressione **Enter** para confirmar.

---

### 3️⃣ (Opcional) Configurar Webhook Secret

Se você já tem o webhook secret do Stripe:

```bash
wrangler secret put STRIPE_WEBHOOK_SECRET
```

Cole o webhook secret (começa com `whsec_...`)

---

### 4️⃣ Verificar se Funcionou

```bash
wrangler secret list
```

Você deve ver:
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_WEBHOOK_SECRET` (se configurou)

---

## 🧪 Testar Localmente (Opcional)

Para testar localmente, crie um arquivo `.dev.vars` na raiz do projeto:

```bash
# Criar arquivo .dev.vars
cat > .dev.vars << EOF
STRIPE_SECRET_KEY=rk_test_...sua_chave_aqui...
STRIPE_WEBHOOK_SECRET=whsec_...seu_webhook_secret...
EOF
```

**⚠️ IMPORTANTE:** O arquivo `.dev.vars` já está no `.gitignore`, então não será commitado.

---

## ✅ Pronto!

Depois de configurar:

1. **A chave está no Cloudflare Workers** (produção)
2. **Para testar localmente**, use `.dev.vars`
3. **O código não precisa mudar!** A chave restrita funciona igual à chave secreta normal

---

## 🚨 Problemas?

### Erro: "No account ID found"
```bash
# Verificar se está logado
wrangler whoami
```

### Erro: "Permission denied"
```bash
# Fazer login novamente
wrangler login
```

### Não sei se funcionou
```bash
# Ver todos os secrets configurados
wrangler secret list
```

---

**Última atualização:** 6 de Novembro de 2025

