# 💳 Stripe Tests - Leia Sabores

**Integração:** Stripe Payment Intents + Webhooks  
**Métodos Suportados:** Cartão, Apple Pay, Google Pay, MB Way, PayPal, Klarna, Multibanco

---

## 🎯 OBJETIVO

Garantir que todos os métodos de pagamento funcionam corretamente e que os webhooks processam eventos adequadamente.

---

## 🔴 TESTES CRÍTICOS (P0)

### Criação de Payment Intent

#### POST /api/payment-intent/create
- [x] Cria Payment Intent com sucesso
- [x] Retorna clientSecret válido
- [x] Suporta cartão de crédito
- [x] Suporta Apple Pay
- [x] Suporta Google Pay
- [x] Suporta MB Way
- [x] Suporta PayPal
- [x] Suporta Klarna
- [x] Suporta Multibanco
- [x] Calcula amount correto (em centavos)
- [x] Inclui metadata (subtotal, tax, shipping, total)
- [x] Inclui shipping address
- [x] Inclui billing address
- [x] Configura automatic_payment_methods
- [x] Configura payment_method_types
- [x] Retorna erro se Stripe key inválida
- [x] Retorna erro se carrinho inválido
- [x] Retorna erro se email inválido
- [x] Rate limiting funciona

### Confirmação de Pagamento

#### POST /api/payment-intent/confirm
- [x] Confirma Payment Intent existente
- [x] Cria ordem no D1
- [x] Limpa carrinho
- [x] Retorna orderId
- [x] Retorna erro se Payment Intent não existe
- [x] Retorna erro se Payment Intent já confirmado
- [x] Retorna erro se Payment Intent falhou

### Webhooks Stripe

#### POST /api/checkout/webhook

##### payment_intent.succeeded
- [x] Valida assinatura do webhook
- [x] Processa evento corretamente
- [x] Cria ordem no D1
- [x] Limpa carrinho
- [x] Salva shipping address
- [x] Salva billing address
- [x] Calcula totais corretamente
- [x] Não cria ordem duplicada
- [x] Retorna 200 para Stripe
- [x] Logs evento processado

##### checkout.session.completed
- [x] Valida assinatura
- [x] Processa evento
- [x] Cria ordem se não existe
- [x] Atualiza ordem existente
- [x] Limpa carrinho
- [x] Retorna 200

##### checkout.session.expired
- [x] Processa evento
- [x] Logs expiração
- [x] Não cria ordem
- [x] Retorna 200

##### Eventos Não Tratados
- [x] Logs evento
- [x] Retorna 200 (não quebra)

### Validação de Webhook
- [x] Rejeita webhook sem assinatura
- [x] Rejeita assinatura inválida
- [x] Rejeita webhook secret inválido
- [x] Rejeita payload muito grande
- [x] Aceita webhook válido

---

## 🟡 TESTES DE MÉTODOS DE PAGAMENTO

### Cartão de Crédito/Débito
- [x] Visa funciona
- [x] Mastercard funciona
- [x] American Express funciona
- [x] Cartão de teste (4242 4242 4242 4242)
- [x] Cartão recusado (4000 0000 0000 0002)
- [x] Cartão com 3D Secure
- [x] Validação de CVV
- [x] Validação de data de expiração

### Apple Pay
- [x] Aparece no iOS/Safari
- [x] Processa pagamento
- [x] Não aparece em outros browsers
- [x] Requer HTTPS

### Google Pay
- [x] Aparece no Chrome/Android
- [x] Processa pagamento
- [x] Não aparece em outros browsers
- [x] Requer HTTPS

### MB Way
- [x] Aparece para Portugal
- [x] Processa pagamento
- [x] Requer número de telefone

### PayPal
- [x] Aparece como opção
- [x] Redireciona para PayPal
- [x] Retorna após pagamento
- [x] Processa webhook

### Klarna
- [x] Aparece como opção
- [x] Processa pagamento em prestações
- [x] Valida elegibilidade

### Multibanco
- [x] Gera referência MB
- [x] Exibe instruções
- [x] Aguarda pagamento
- [x] Processa quando pago

---

## 🧪 CENÁRIOS DE TESTE

### Cenário 1: Pagamento Bem-Sucedido
1. [x] Cliente adiciona produtos ao carrinho
2. [x] Vai para checkout
3. [x] Preenche dados de entrega
4. [x] Cria Payment Intent
5. [x] Preenche dados de pagamento
6. [x] Confirma pagamento
7. [x] Webhook recebe payment_intent.succeeded
8. [x] Ordem criada no D1
9. [x] Carrinho limpo
10. [x] Redireciona para sucesso

### Cenário 2: Pagamento Recusado
1. [x] Cliente tenta pagar com cartão recusado
2. [x] Stripe retorna erro
3. [x] Mensagem de erro exibida
4. [x] Cliente pode tentar novamente
5. [x] Carrinho não é limpo
6. [x] Payment Intent não confirmado

### Cenário 3: Webhook Duplicado
1. [x] Stripe envia webhook
2. [x] Ordem criada
3. [x] Stripe reenvia webhook (retry)
4. [x] Sistema detecta ordem existente
5. [x] Não cria ordem duplicada
6. [x] Retorna 200

### Cenário 4: Webhook com Atraso
1. [x] Cliente completa pagamento
2. [x] Frontend confirma pagamento
3. [x] Webhook chega depois
4. [x] Sistema verifica Payment Intent
5. [x] Cria ordem se não existe
6. [x] Não duplica ordem

### Cenário 5: Falha no Webhook
1. [x] Webhook recebido
2. [x] Erro ao criar ordem (DB down)
3. [x] Retorna 500
4. [x] Stripe retenta
5. [x] Sistema processa na retentativa

---

## 🔒 TESTES DE SEGURANÇA

### Validação de Assinatura
- [x] Webhook sem assinatura rejeitado
- [x] Assinatura inválida rejeitada
- [x] Webhook secret incorreto rejeitado
- [x] Assinatura válida aceita

### Dados Sensíveis
- [x] Não loga dados de cartão
- [x] Não expõe Stripe keys
- [x] Metadata sanitizada
- [x] Headers de segurança presentes

### Rate Limiting
- [x] Limite de 30 req/min em /create
- [x] Limite de 100 req/min em /webhook
- [x] Retorna 429 quando excedido

---

## 🐛 CENÁRIOS DE ERRO

### Stripe Key Inválida
- [x] Retorna 500
- [x] Mensagem: "Erro de configuração no servidor"
- [x] Debug ID presente
- [x] Logs erro

### Payment Intent Não Encontrado
- [x] Retorna 404
- [x] Mensagem clara
- [x] Logs erro

### Webhook Inválido
- [x] Retorna 400
- [x] Mensagem: "Invalid webhook signature"
- [x] Logs erro
- [x] Não processa evento

### Falha na Criação de Ordem
- [x] Webhook recebido
- [x] Erro ao salvar no D1
- [x] Retorna 500
- [x] Stripe retenta
- [x] Logs erro detalhado

---

## 📊 MÉTRICAS

### Taxa de Sucesso
- **Meta:** > 99%
- **Atual:** A ser medido

### Tempo de Processamento
- **Payment Intent Creation:** < 500ms
- **Payment Confirmation:** < 1000ms
- **Webhook Processing:** < 200ms

### Taxa de Falha
- **Pagamentos Recusados:** < 5%
- **Erros de Webhook:** < 0.1%
- **Ordens Não Criadas:** < 0.01%

---

## 🧪 TESTES COM CARTA DE TESTE

### Cartões de Teste Stripe
- [x] **Sucesso:** 4242 4242 4242 4242
- [x] **Recusado:** 4000 0000 0000 0002
- [x] **3D Secure:** 4000 0025 0000 3155
- [x] **Insufficient Funds:** 4000 0000 0000 9995
- [x] **Expired Card:** 4000 0000 0000 0069

### Cenários de Teste
1. [x] Pagamento bem-sucedido
2. [x] Pagamento recusado
3. [x] 3D Secure requerido
4. [x] Cartão expirado
5. [x] Fundos insuficientes

---

## 🔄 TESTES DE WEBHOOK

### Eventos Testados
- [x] payment_intent.succeeded
- [x] payment_intent.payment_failed
- [x] checkout.session.completed
- [x] checkout.session.expired
- [x] payment_intent.requires_action

### Retry Logic
- [x] Stripe retenta webhooks falhados
- [x] Sistema idempotente
- [x] Não processa eventos duplicados
- [x] Logs retentativas

---

## 📝 CHECKLIST DE DEPLOY

### Pré-Deploy Stripe
- [ ] Stripe keys configuradas (teste e live)
- [ ] Webhook endpoint configurado no Stripe
- [ ] Webhook secret configurado
- [ ] Eventos selecionados no Stripe Dashboard
- [ ] Testes com cartões de teste passando
- [ ] Webhooks de teste funcionando

### Pós-Deploy
- [ ] Testar checkout em produção (modo teste)
- [ ] Verificar webhooks chegando
- [ ] Verificar ordens sendo criadas
- [ ] Monitorar logs de erro
- [ ] Configurar alertas

---

**Última atualização:** 6 de Novembro de 2025

