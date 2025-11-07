# 🔐 Permissões para Chave Restrita do Stripe - Leia Sabores

## 📋 Análise do Código

Baseado na análise do código do projeto, estas são as operações Stripe usadas:

1. ✅ **Checkout Sessions** - Criar e ler sessões de checkout
2. ✅ **Payment Intents** - Criar e ler payment intents
3. ✅ **Webhooks** - Validar eventos de webhook (não precisa permissão especial)

---

## 🎯 Permissões Necessárias (Configuração Mínima)

### ✅ OBRIGATÓRIAS (Marque como "Gravação")

#### 1. **Checkout Sessions**
- ✅ **Gravação** (`checkout.sessions:write`)
  - Usado para: Criar sessões de checkout
  - Código: `stripe.checkout.sessions.create()`

- ✅ **Leitura** (`checkout.sessions:read`)
  - Usado para: Ler detalhes de sessões
  - Código: `stripe.checkout.sessions.retrieve()`

#### 2. **Payment Intents**
- ✅ **Gravação** (`payment_intents:write`)
  - Usado para: Criar payment intents
  - Código: `stripe.paymentIntents.create()`

- ✅ **Leitura** (`payment_intents:read`)
  - Usado para: Ler detalhes de payment intents
  - Código: `stripe.paymentIntents.retrieve()`

---

## ⚠️ OPCIONAIS (Pode deixar como "Nenhum" por enquanto)

### Customers (Opcional)
- **Leitura** (`customers:read`) - Se quiser ler dados de clientes no futuro
- **Gravação** (`customers:write`) - Se quiser criar clientes no futuro

**Nota:** O projeto atual não cria clientes diretamente, apenas usa `customer_email` nas sessões.

---

## ❌ NÃO PRECISA (Deixe como "Nenhum")

- ❌ **Charges** - Não usado diretamente
- ❌ **Refunds** - Não implementado ainda
- ❌ **Payouts** - Não necessário
- ❌ **Balance** - Não necessário
- ❌ **Apple Pay Domains** - Não necessário
- ❌ **Confirmation token** - Não necessário
- ❌ **Todos os outros recursos** - Deixe como "Nenhum"

---

## 📝 Configuração Passo a Passo

### 1. Nome da Chave
```
Leia Sabores - Backend API
```
(ou qualquer nome que você preferir)

### 2. Permissões a Configurar

Na página de criação da chave restrita:

#### **Checkout Sessions:**
- ✅ Marque **"Gravação"** (Write)
- ✅ Marque **"Leitura"** (Read)

#### **Payment Intents:**
- ✅ Marque **"Gravação"** (Write)
- ✅ Marque **"Leitura"** (Read)

#### **Todos os outros recursos:**
- ❌ Deixe como **"Nenhum"** (None)

### 3. Restrições de IP (Opcional)

**Para Cloudflare Workers:**

Como Cloudflare Workers não têm IP fixo, você tem duas opções:

**Opção A: Sem restrição (Recomendado para começar)**
- Deixe **"Restrições de IP"** vazio ou desabilitado
- A segurança vem das permissões limitadas

**Opção B: Permitir todos os IPs (Mais seguro)**
- Adicione: `0.0.0.0/0`
- Isso permite qualquer IP, mas ainda é seguro porque as permissões são limitadas

**Nota:** Cloudflare Workers não têm IP fixo, então restrições de IP específicas não funcionam bem.

### 4. Criar e Copiar

1. Clique em **"Criar chave"**
2. **⚠️ IMPORTANTE:** A chave será mostrada **APENAS UMA VEZ**
3. **Copie imediatamente!** (começa com `rk_live_...` ou `rk_test_...`)

---

## ✅ Resumo Visual

```
┌─────────────────────────────────────┐
│ Nome: Leia Sabores - Backend API   │
├─────────────────────────────────────┤
│                                     │
│ Checkout Sessions:                  │
│   ☑ Gravação (Write)               │
│   ☑ Leitura (Read)                 │
│                                     │
│ Payment Intents:                    │
│   ☑ Gravação (Write)               │
│   ☑ Leitura (Read)                 │
│                                     │
│ Todos os outros:                    │
│   ☐ Nenhum (None)                  │
│                                     │
│ Restrições de IP:                   │
│   ☐ Nenhuma (ou 0.0.0.0/0)         │
│                                     │
└─────────────────────────────────────┘
```

---

## 🚀 Depois de Criar

Configure no Cloudflare Workers:

```bash
# Fazer login (se ainda não fez)
wrangler login

# Configurar a chave restrita
wrangler secret put STRIPE_SECRET_KEY
# Cole a chave restrita (rk_live_... ou rk_test_...)
```

**O código não precisa mudar!** A chave restrita funciona exatamente como uma chave secreta normal.

---

## 🔒 Segurança

Com essas permissões, a chave restrita pode:
- ✅ Criar sessões de checkout
- ✅ Ler sessões de checkout
- ✅ Criar payment intents
- ✅ Ler payment intents

**NÃO pode:**
- ❌ Fazer refunds
- ❌ Acessar saldos
- ❌ Criar payouts
- ❌ Modificar configurações da conta
- ❌ Acessar outros recursos

Isso torna a chave muito mais segura que uma chave secreta padrão!

---

## 📋 Checklist Final

Antes de criar a chave, verifique:

- [ ] Nome da chave definido
- [ ] Checkout Sessions: Gravação ✅
- [ ] Checkout Sessions: Leitura ✅
- [ ] Payment Intents: Gravação ✅
- [ ] Payment Intents: Leitura ✅
- [ ] Todos os outros: Nenhum ✅
- [ ] Restrições de IP: Configuradas (ou nenhuma)
- [ ] Pronto para copiar a chave quando aparecer

---

**Última atualização:** 6 de Novembro de 2025

