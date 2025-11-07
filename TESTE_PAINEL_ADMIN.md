# 🧪 Guia de Teste: Painel Administrativo

## ✅ Pré-requisitos

1. **Token JWT configurado:**
   - Acesse `/admin/legacy` (painel antigo)
   - Clique em "Gerar Token" ou configure manualmente
   - O token será salvo em `localStorage`

2. **Backend rodando:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Frontend rodando:**
   ```bash
   cd frontend
   npm run dev
   ```

---

## 🧪 Testes Manuais

### 1. Acessar Dashboard

1. Acesse: `http://localhost:5173/admin`
2. **Esperado:**
   - Sidebar com menu lateral
   - Dashboard com KPIs
   - Cards de métricas
   - Tabelas de pedidos e produtos

### 2. Verificar KPIs

**Cards esperados:**
- Vendas Hoje
- Vendas Este Mês
- Ticket Médio
- Taxa de Conversão
- Pedidos Hoje
- Carrinhos Abandonados
- Produtos em Estoque Baixo
- Total de Clientes

**Verificar:**
- ✅ Valores exibidos corretamente
- ✅ Formatação de moeda (€)
- ✅ Indicadores de tendência (↑↓)
- ✅ Ícones corretos

### 3. Verificar Tabelas

**Pedidos Recentes:**
- ✅ Lista de últimos 10 pedidos
- ✅ Colunas: ID, Cliente, Total, Status, Data
- ✅ Formatação de moeda

**Produtos Mais Vendidos:**
- ✅ Lista de top produtos
- ✅ Colunas: Produto, Vendas, Receita

### 4. Verificar Navegação

**Sidebar:**
- ✅ Menu lateral visível
- ✅ Links clicáveis
- ✅ Item ativo destacado
- ✅ Responsivo (mobile)

**Menu Mobile:**
- ✅ Botão hamburger visível
- ✅ Menu abre/fecha
- ✅ Overlay funciona

### 5. Verificar Autenticação

**Sem token:**
- ✅ Redireciona para login ou mostra erro

**Com token:**
- ✅ Acessa dashboard
- ✅ Dados carregam

---

## 🔍 Testes de API

### 1. Testar Endpoint Dashboard

```bash
# Obter token JWT primeiro (via /admin/legacy)
TOKEN="seu_token_jwt_aqui"

# Testar endpoint
curl -X GET "http://localhost:8787/api/admin/dashboard" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Resposta esperada:**
```json
{
  "salesToday": 0,
  "salesThisWeek": 0,
  "salesThisMonth": 0,
  "averageTicket": 0,
  "ordersToday": 0,
  "conversionRate": 0,
  "abandonedCarts": 0,
  "lowStockProducts": 0,
  "recentOrders": [],
  "topProducts": []
}
```

### 2. Verificar Erros

**Sem token:**
```bash
curl -X GET "http://localhost:8787/api/admin/dashboard"
# Esperado: 401 Unauthorized
```

**Token inválido:**
```bash
curl -X GET "http://localhost:8787/api/admin/dashboard" \
  -H "Authorization: Bearer token_invalido"
# Esperado: 401 Invalid token
```

---

## 🐛 Problemas Conhecidos

### 1. Campo `stock` não existe no banco

**Solução:**
```sql
-- Executar migration ou adicionar manualmente
ALTER TABLE products ADD COLUMN stock INTEGER;
```

### 2. Campo `customerName` não existe no banco

**Solução:**
```sql
ALTER TABLE orders ADD COLUMN customer_name TEXT;
```

### 3. Dados vazios

**Normal se:**
- Não há pedidos ainda
- Não há produtos
- Banco de dados novo

---

## ✅ Checklist de Teste

- [ ] Dashboard carrega sem erros
- [ ] Sidebar funciona
- [ ] KPIs exibem valores
- [ ] Tabelas exibem dados (ou mensagem vazia)
- [ ] Navegação funciona
- [ ] Mobile responsivo
- [ ] Autenticação funciona
- [ ] API retorna dados
- [ ] Sem erros no console
- [ ] Sem erros de TypeScript

---

## 🚀 Próximos Testes

Após validar o dashboard básico:

1. **Testar gestão de produtos**
2. **Testar gestão de pedidos**
3. **Testar outras funcionalidades**

---

**Última atualização:** 7 de Novembro de 2025

