# 🧪 Guia de Teste - Sistema de Pagamento Stripe

## ✅ TESTE COMPLETO EM 5 MINUTOS

### 📋 PRÉ-REQUISITOS

1. **Estar em ambiente de teste (test keys)**
   - Verificar `.env`: `STRIPE_SECRET_KEY` começa com `sk_test_`
   - Verificar `.env`: `STRIPE_PUBLISHABLE_KEY` começa com `pk_test_`

2. **URLs de teste:**
   - 🌐 Frontend: https://leiasabores.pt (ou localhost:5173 em dev)
   - 🔧 Backend: https://api.leiasabores.pt (ou localhost:8787 em dev)

---

## 🧪 TESTE 1: Validação Frontend (2 min)

### Testar Validações de Formulário

**Passo 1: Ir para Checkout**
```
1. Aceder a https://leiasabores.pt
2. Adicionar produto ao carrinho (qualquer um)
3. Clicar "Ver Carrinho" ou ir direto para /checkout
```

**Passo 2: Tentar preencher campos inválidos**

| Campo | Input | Resultado Esperado |
|-------|-------|-------------------|
| Nome | "AB" | ❌ "Nome deve ter ≥ 3 caracteres" |
| Email | "invalido" | ❌ "Email inválido" |
| Email | "test@domain" | ❌ "Email inválido" |
| Código Postal | "12" | ❌ "Código postal inválido" |
| Morada | (vazio) | ❌ "Morada é obrigatória" |

**Passo 3: Preencher corretamente**
```
Nome:           João Silva
Email:          joao@email.com  ✅
Telefone:       912345678
Morada:         Rua da Festa, nº 123
Cidade:         Lisboa  ✅
Distrito:       Lisboa
Código Postal:  1000-001  ✅
País:           Portugal (auto-preenchido)
```

**Resultado:**
✅ Botão "Continuar para pagamento" ativado
✅ Sem mensagens de erro

---

## 🧪 TESTE 2: Checkout com Múltiplos Métodos (3 min)

### Teste com Cartão de Crédito

**Passo 1: Iniciar Checkout**
```
1. Preencher formulário de morada (✅ acima)
2. Clicar "Continuar para pagamento"
3. Clicar "Iniciar Pagamento"
```

**Passo 2: Selecionar Método de Pagamento**
Na página Stripe Checkout, deverá ver:

```
✅ Cartão de crédito/débito
✅ iDEAL
✅ Bancontact
✅ EPS
✅ giropay
✅ Przelewy24
✅ Klarna
✅ PayPal
```

**Passo 3: Testar com Cartão de Teste**

Selecionar **Cartão de crédito** e preencher:

```
Número:         4242 4242 4242 4242  (sempre sucesso)
Data Expiração: 12 / 25
CVC:            123
Nome:           Qualquer nome
```

**Resultado Esperado:**
✅ Transação aprovada
✅ Redireção para página de sucesso
✅ Referência do pedido (LS-XXXXXX)
✅ Email de confirmação enviado

---

## 🧪 TESTE 3: Testes de Falha (Cartão Teste)

### Testar Diferentes Cenários Stripe

**Cartão que Recusa:**
```
Número:         4000 0000 0000 0002
Resultado:      ❌ Pagamento recusado
```

**Requer Autenticação 3D Secure:**
```
Número:         4000 0025 0000 3155
Resultado:      Prompta para autenticação
```

**Expirado:**
```
Número:         4000 0000 0000 0069
Resultado:      ❌ Cartão expirado
```

**CVC Inválido:**
```
Número:         4000 0000 0000 0127
Resultado:      ❌ CVC inválido
```

### Verificar Mensagens de Erro

Após falha, deverá ver:
```
❌ "Não foi possível processar o pagamento"
📝 "Se o problema persistir, contacte-nos pelo email de suporte."
```

---

## 📊 TESTE 4: Verificar Logs do Backend

### Monitorar Operações

**Abrir Logs do Wrangler:**
```bash
cd /Users/davidsousa/Documents/Websites/ecommerce
wrangler tail  # Em tempo real
```

**Procurar por padrões:**

✅ Sucesso:
```
✅ Checkout session created: cs_test_123abc | Total: €49.99 | Email: user@email.com
💳 Payment completed: cs_test_123abc | Amount: €49.99 | Customer: user@email.com
📦 Order created: uuid-xxxx | Session: cs_test_123abc
🗑️ Cart cleared: user@email.com
```

❌ Erros:
```
❌ Stripe checkout error [TypeError]: Missing STRIPE_SECRET_KEY binding
❌ Webhook processing error: Invalid signature
```

---

## 🔍 TESTE 5: Validações de Segurança

### Testar Proteções

**Limite de Montante:**
```
1. Tentar carrinho com total > 100.000€
2. Resultado esperado: ❌ "Cart total exceeds maximum allowed"
```

**Preço Zero/Negativo:**
```
1. Produto com preço 0 ou negativo
2. Resultado esperado: ❌ "Invalid price for product"
```

**Carrinho Vazio:**
```
1. Tentar checkout sem produtos
2. Resultado esperado: ❌ "Carrinho está vazio"
```

**Total Inválido:**
```
1. Cálculo de total corrompido (simulado)
2. Resultado esperado: ❌ "Invalid order total calculation"
```

---

## 📱 TESTE 6: Responsividade e UX

### Testar em Diferentes Dispositivos

| Dispositivo | Teste | Resultado |
|-------------|-------|-----------|
| Desktop (1920px) | Form layout, botões | ✅ Responsivo |
| Tablet (768px) | Grid 2 colunas → 1 | ✅ Adaptado |
| Mobile (375px) | Layouts full-width | ✅ Otimizado |

### Testar Estados

- ✅ Loading inicial
- ✅ Erro de rede (simular offline)
- ✅ Toast notifications
- ✅ Transições entre passos

---

## 🌍 TESTE 7: Países Suportados

### Testar Variações de Código Postal

| País | Código Postal | Formato Aceito |
|------|---------------|-----------------|
| 🇵🇹 Portugal | 1000-001 | ✅ XXXX-XXX |
| 🇪🇸 Espanha | 28001 | ✅ XXXXX |
| 🇳🇱 Holanda | 1012 JS | ✅ Aceito |
| 🇧🇪 Bélgica | 1000 | ✅ XXXX |

---

## ✅ CHECKLIST FINAL

Antes de considerar pronto:

```
FRONTEND:
☐ Validação de nome (< 3 chars mostra erro)
☐ Validação de email (email inválido mostra erro)
☐ Validação de código postal (formato PT)
☐ Todos os campos obrigatórios destacados com *
☐ Botão desativado até preencher tudo
☐ Mensagens de erro em português claro

PAGAMENTO:
☐ 8 métodos de pagamento visíveis
☐ Cartão de teste 4242... funciona
☐ Cartão de teste 4000...0002 recusa com erro
☐ Transação aprovada → redireciona para sucesso
☐ Email de confirmação enviado

LOGS:
☐ ✅ Checkout session created aparece nos logs
☐ 💳 Payment completed após sucesso
☐ 📦 Order created com UUID
☐ 🗑️ Cart cleared após pagamento
☐ ❌ Erros aparecem com stack trace

SEGURANÇA:
☐ Sem montantes > 100.000€
☐ Sem preços negativos/zero
☐ Sem carrinhos vazios
☐ Validações backend e frontend
☐ Rate limiting funcional

BANCO DE DADOS:
☐ Ordem criada na tabela orders
☐ Status = "paid"
☐ Carrinho limpo na tabela cartItems
☐ Email armazenado corretamente
☐ Morada preservada nos metadados
```

---

## 🔧 TROUBLESHOOTING

### "Não foi possível processar o pagamento"

**Causa 1: Chaves misturadas**
```
Solução: Verificar .env
- STRIPE_SECRET_KEY = sk_test_... ou sk_live_...
- STRIPE_PUBLISHABLE_KEY = pk_test_... ou pk_live_...
Ambas devem ser TEST ou ambas LIVE
```

**Causa 2: Webhook mal configurado**
```
Solução: Verificar wrangler.toml
- Stripe webhook URL deve apontar para POST /api/checkout/webhook
- STRIPE_WEBHOOK_SECRET deve estar em .env
```

**Causa 3: Erro de rede**
```
Solução: 
1. Verificar conexão internet
2. Aguardar alguns minutos
3. Tentar novamente
```

### "Email inválido"

**Problema:** Campo rejeitando emails válidos

**Solução:** Verificar regex em frontend:
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Deve aceitar: test@domain.com, user+tag@domain.co.uk
```

### "Código Postal Inválido"

**Problema:** Rejeitar códigos válidos de outros países

**Solução:** Permitir qualquer formato com ≥ 4 caracteres:
```javascript
const ptZipCodeRegex = /^\d{4}-\d{3}$/
return ptZipCodeRegex.test(zipCode) || zipCode.length >= 4
// Aceita: 1000-001 (PT), 28001 (ES), 1012JS (NL)
```

---

## 📞 CONTACTO

Se encontrar problemas:

1. **Verificar logs:** `wrangler tail`
2. **Testar localmente:** `npm run dev`
3. **Contactar suporte:** dev@leiasabores.pt

---

**Data:** 15/01/2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para teste