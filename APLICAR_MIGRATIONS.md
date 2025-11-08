# 📦 Guia de Aplicação de Migrations

## ✅ Configuração Corrigida

O `wrangler.toml` foi atualizado para apontar corretamente para a pasta de migrations:
```toml
migrations_dir = "backend/migrations"
```

## 📋 Migrations Disponíveis

As seguintes migrations estão prontas para serem aplicadas:

1. **0001_init.sql** - Schema inicial (products, reviews, cart, orders, users, categories)
2. **0002_admin_panel.sql** - Tabelas do painel admin (admin_users, coupons, audit_logs, etc.)
3. **0003_complete_admin_schema.sql** - Schema completo do admin (product_categories, product_images, etc.)
4. **0004_fix_schema_inconsistencies.sql** - Correções de inconsistências encontradas na auditoria

## 🚀 Aplicar Migrations

### Opção 1: Manual (Recomendado)

No terminal, quando o wrangler perguntar `continue? › (Y/n)`, digite **Y** e pressione Enter:

```bash
wrangler d1 migrations apply DB --remote
# Quando perguntar: continue? › (Y/n)
# Digite: Y
# Pressione: Enter
```

### Opção 2: Script Automático

Use o script fornecido:

```bash
# Para produção (remoto)
./apply-migrations.sh --remote

# Para desenvolvimento (local)
./apply-migrations.sh --local
```

### Opção 3: Comando Direto (Requer confirmação manual)

```bash
# Remoto (Produção)
wrangler d1 migrations apply DB --remote

# Local (Desenvolvimento)
wrangler d1 migrations apply DB --local
```

**Nota:** O wrangler pedirá confirmação antes de aplicar. Digite `Y` para confirmar.

## ✅ Verificar Status

### Listar migrations
```bash
wrangler d1 migrations list DB --remote
```

### Verificar tabelas criadas
```bash
wrangler d1 execute DB --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
```

### Verificar colunas de uma tabela
```bash
wrangler d1 execute DB --remote --command="PRAGMA table_info(products)"
```

## 📝 Notas Importantes

1. **Ordem de aplicação:** As migrations são aplicadas automaticamente na ordem correta (0001, 0002, 0003, 0004)

2. **Backup:** Antes de aplicar migrations em produção, faça backup do banco:
   ```bash
   wrangler d1 export DB --remote --output=backup-$(date +%Y%m%d).sql
   ```

3. **Tempo de aplicação:** As migrations podem levar alguns segundos. O banco pode ficar temporariamente indisponível durante a aplicação.

4. **Verificação:** Após aplicar, verifique se todas as tabelas foram criadas corretamente:
   ```bash
   wrangler d1 execute DB --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
   ```

## 🔍 Troubleshooting

### Erro: "Migration already applied"
- Isso significa que a migration já foi aplicada anteriormente
- Pode ser ignorado com segurança
- O wrangler não aplica migrations duplicadas

### Erro: "Column already exists"
- Algumas colunas podem já existir
- As migrations usam `ADD COLUMN IF NOT EXISTS` para evitar esse problema
- Normalmente não causa erro

### Erro: "Table already exists"
- As migrations usam `CREATE TABLE IF NOT EXISTS` para evitar esse problema
- Normalmente não causa erro

### Erro: "Database locked"
- O banco está sendo usado por outro processo
- Aguarde alguns segundos e tente novamente
- Verifique se não há outro wrangler dev rodando

## ✅ Após Aplicar as Migrations

1. **Verificar tabelas:**
   ```bash
   wrangler d1 execute DB --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
   ```

2. **Executar seeds (se necessário):**
   ```bash
   curl -X POST "https://api.leiasabores.pt/api/admin/seed-admin?token=YOUR_TOKEN"
   ```

3. **Testar funcionalidades:**
   - Acessar o admin: `https://www.leiasabores.pt/admin`
   - Fazer login
   - Verificar dashboard
   - Criar/editar produto
   - Testar upload de imagens

4. **Verificar logs:**
   - Cloudflare Dashboard → Workers → Logs
   - Verificar se há erros relacionados ao banco

## 📊 Tabelas que Serão Criadas

### Tabelas Principais
- `products` - Produtos
- `categories` - Categorias
- `orders` - Pedidos
- `order_items` - Itens dos pedidos
- `users` - Usuários
- `customers` - Clientes
- `reviews` - Avaliações
- `cart_items` - Itens do carrinho

### Tabelas do Admin
- `admin_users` - Usuários do admin
- `admin_sessions` - Sessões do admin
- `refresh_tokens` - Tokens de refresh
- `audit_logs` - Logs de auditoria
- `store_settings` - Configurações da loja

### Tabelas de Relacionamento
- `product_categories` - Relação produtos ↔ categorias (N:N)
- `product_images` - Imagens dos produtos (R2)
- `product_variants` - Variantes dos produtos
- `customer_notes` - Notas sobre clientes
- `order_status_history` - Histórico de status dos pedidos

### Tabelas de Sistema
- `cache_keys` - Chaves de cache
- `rate_limits` - Limites de taxa
- `coupons` - Cupons de desconto

## 🎯 Próximos Passos

1. ✅ Aplicar migrations (comando acima)
2. ✅ Verificar se todas as tabelas foram criadas
3. ✅ Executar seeds se necessário
4. ✅ Testar funcionalidades do admin
5. ✅ Verificar sincronização Admin ↔ Loja

---

**Status:** ✅ Configuração corrigida, migrations prontas para aplicar

**Atenção:** Ao aplicar migrations em produção, o banco pode ficar temporariamente indisponível durante a aplicação. Confirme apenas se tiver certeza.
