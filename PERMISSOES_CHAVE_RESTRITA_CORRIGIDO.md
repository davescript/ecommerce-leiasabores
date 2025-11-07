# 🔐 Permissões para Chave Restrita - Configuração Correta

## 📋 Permissões Necessárias

Se a interface só permite **uma opção por recurso**, use:

### ✅ OBRIGATÓRIAS (Marque como "Gravação")

#### 1. **Checkout Sessions**
- ✅ **Gravação** (Write)
  - Isso permite criar E ler sessões de checkout
  - Código usado: `stripe.checkout.sessions.create()` e `stripe.checkout.sessions.retrieve()`

#### 2. **Payment Intents**
- ✅ **Gravação** (Write)
  - Isso permite criar E ler payment intents
  - Código usado: `stripe.paymentIntents.create()` e `stripe.paymentIntents.retrieve()`

### ❌ Todos os outros recursos: "Nenhum"

---

## 🎯 Configuração Passo a Passo

### Na página de criação da chave:

1. **Nome da chave:**
   ```
   Leia Sabores - Backend API
   ```

2. **Checkout Sessions:**
   - Selecione: **"Gravação"** (Write)
   - ✅ Isso já inclui permissão de leitura

3. **Payment Intents:**
   - Selecione: **"Gravação"** (Write)
   - ✅ Isso já inclui permissão de leitura

4. **Todos os outros recursos:**
   - Selecione: **"Nenhum"** (None)

5. **Restrições de IP:**
   - Deixe vazio ou adicione `0.0.0.0/0` (permite todos)

---

## ✅ Resumo Visual

```
┌─────────────────────────────────────┐
│ Nome: Leia Sabores - Backend API   │
├─────────────────────────────────────┤
│                                     │
│ Checkout Sessions:                  │
│   ☑ Gravação (Write)               │
│                                     │
│ Payment Intents:                     │
│   ☑ Gravação (Write)               │
│                                     │
│ Todos os outros:                    │
│   ☐ Nenhum (None)                  │
│                                     │
└─────────────────────────────────────┘
```

---

## 💡 Por que "Gravação" é suficiente?

No Stripe, a permissão **"Gravação" (Write)** geralmente inclui:
- ✅ Criar recursos
- ✅ Ler recursos que você criou
- ✅ Atualizar recursos

Isso é suficiente para o projeto, pois:
- Criamos sessões de checkout → precisa Write
- Ler sessões que criamos → Write já permite
- Criar payment intents → precisa Write
- Ler payment intents que criamos → Write já permite

---

## 🚀 Depois de Criar

1. **Copie a chave imediatamente** (só aparece uma vez!)
2. **Configure no Cloudflare Workers:**

```bash
wrangler secret put STRIPE_SECRET_KEY
# Cole a chave restrita (rk_live_... ou rk_test_...)
```

---

## ✅ Checklist

- [ ] Nome da chave definido
- [ ] Checkout Sessions: **Gravação** ✅
- [ ] Payment Intents: **Gravação** ✅
- [ ] Todos os outros: **Nenhum** ✅
- [ ] Restrições de IP: Configuradas (ou nenhuma)
- [ ] Pronto para copiar a chave quando aparecer

---

**Última atualização:** 6 de Novembro de 2025

