# 🔐 Chave Restrita vs Chave Secreta - Qual Usar?

## 📊 Diferença

### Chave Secreta Padrão (`sk_live_...`)
- ✅ **Mais simples** de configurar
- ✅ **Funciona imediatamente** sem configuração adicional
- ⚠️ **Menos segura** (acesso total à conta Stripe)
- ⚠️ Se comprometida, pode fazer qualquer operação

### Chave Restrita (`rk_live_...`)
- ✅ **Mais segura** (permissões limitadas)
- ✅ **Pode restringir por IP** (só funciona de servidores específicos)
- ✅ **Melhor prática** recomendada pelo Stripe
- ⚠️ **Mais complexa** de configurar (precisa definir permissões)

---

## 🎯 Recomendação para este Projeto

### Para Desenvolvimento/Testes
**Use chave secreta padrão** (`sk_test_...`)
- Mais rápido de configurar
- Funciona imediatamente
- Não há risco (é modo de teste)

### Para Produção
**Use chave restrita** (`rk_live_...`) se:
- Você quer máxima segurança
- Você tem IPs fixos dos servidores Cloudflare Workers
- Você quer seguir as melhores práticas do Stripe

**Use chave secreta padrão** (`sk_live_...`) se:
- Você quer simplicidade
- Você confia na segurança do Cloudflare Workers
- Você quer configurar rapidamente

---

## 🔧 Como Criar Chave Restrita (Recomendado)

### Passo 1: Criar a Chave

1. No Stripe Dashboard, clique em **"+ Criar chave restrita"**
2. Dê um nome: **"Leia Sabores - Backend API"**
3. Configure as permissões:

### Passo 2: Configurar Permissões

**Permissões necessárias para este projeto:**

✅ **Checkout Sessions:**
- `checkout.sessions:write` (criar sessões)
- `checkout.sessions:read` (ler sessões)

✅ **Payment Intents:**
- `payment_intents:write` (criar payment intents)
- `payment_intents:read` (ler payment intents)

✅ **Webhooks:**
- `webhook_endpoints:read` (ler webhooks)

✅ **Customers (opcional, se usar):**
- `customers:read` (ler clientes)

**❌ NÃO precisa de:**
- `charges:write` (não usamos diretamente)
- `refunds:write` (não implementado ainda)
- `payouts:write` (não necessário)

### Passo 3: Restrições de IP (Opcional mas Recomendado)

**Para Cloudflare Workers:**

1. Na seção **"Restrições de IP"**, adicione:
   ```
   0.0.0.0/0
   ```
   
   **OU** (mais seguro, se souber os IPs):
   
   Adicione os IPs do Cloudflare Workers (geralmente não é necessário, pois Cloudflare gerencia isso)

**Nota:** Cloudflare Workers não têm IP fixo, então `0.0.0.0/0` permite todos os IPs (ainda é seguro porque a chave tem permissões limitadas).

### Passo 4: Criar e Copiar

1. Clique em **"Criar chave"**
2. **⚠️ IMPORTANTE:** A chave será mostrada **APENAS UMA VEZ**
3. **Copie imediatamente!** (começa com `rk_live_...` ou `rk_test_...`)

---

## ✅ Usar a Chave Restrita

A chave restrita funciona **exatamente igual** à chave secreta:

```bash
# Configurar no Cloudflare Workers
wrangler secret put STRIPE_SECRET_KEY
# Cole a chave restrita (rk_live_... ou rk_test_...)
```

**O código não precisa mudar!** A chave restrita funciona como uma chave secreta normal, mas com permissões limitadas.

---

## 🎯 Minha Recomendação

### Para Começar (Agora)
**Use chave secreta padrão** (`sk_test_...` para testes)
- Mais rápido
- Funciona imediatamente
- Você pode mudar depois

### Para Produção (Depois)
**Considere criar chave restrita** (`rk_live_...`)
- Mais seguro
- Melhor prática
- Mesma facilidade de uso

---

## 📝 Resumo

| Aspecto | Chave Secreta | Chave Restrita |
|---------|---------------|----------------|
| **Segurança** | ⚠️ Média | ✅ Alta |
| **Facilidade** | ✅ Muito fácil | ⚠️ Requer config |
| **Permissões** | Todas | Limitadas |
| **Uso no código** | Igual | Igual |
| **Recomendado** | Dev/Testes | Produção |

---

## 🚀 Próximos Passos

1. **Agora:** Use chave secreta padrão para começar
2. **Depois:** Crie chave restrita para produção
3. **Configure:** Ambas funcionam da mesma forma no código

---

**Última atualização:** 6 de Novembro de 2025

