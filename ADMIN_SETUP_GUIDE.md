# 🚀 Guia de Setup do Admin Panel

## ✅ Passo 1: Migration Executada

A migration foi executada com sucesso no banco remoto. Todas as tabelas necessárias foram criadas:

- ✅ `order_items`
- ✅ `coupons`
- ✅ `admin_users`
- ✅ `refresh_tokens`
- ✅ `audit_logs`
- ✅ `store_settings`
- ✅ `product_variants`
- ✅ `customer_notes`

## 🔐 Passo 2: Criar Admin Inicial

Execute o seguinte comando para criar o usuário admin inicial:

```bash
curl -X POST "https://api.leiasabores.pt/api/admin/seed-admin?token=seed-topos-20251105"
```

Ou via wrangler local:

```bash
curl -X POST "http://localhost:8787/api/admin/seed-admin?token=seed-topos-20251105"
```

**Credenciais padrão:**
- Email: `admin@leiasabores.pt`
- Senha: `admin123`

⚠️ **IMPORTANTE:** Altere a senha imediatamente após o primeiro login!

## 🧪 Passo 3: Testar Login

### Via API:

```bash
curl -X POST "https://api.leiasabores.pt/api/v1/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@leiasabores.pt",
    "password": "admin123"
  }'
```

### Resposta esperada:

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "rt_...",
  "user": {
    "id": "admin_...",
    "email": "admin@leiasabores.pt",
    "name": "Administrador",
    "role": "admin",
    "permissions": [...]
  }
}
```

## 📊 Passo 4: Testar Dashboard

```bash
curl -X GET "https://api.leiasabores.pt/api/v1/admin/dashboard/stats" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔧 Próximos Passos

1. **Alterar senha do admin:**
   ```bash
   curl -X POST "https://api.leiasabores.pt/api/v1/admin/auth/change-password" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "currentPassword": "admin123",
       "newPassword": "SUA_NOVA_SENHA_FORTE"
     }'
   ```

2. **Implementar Frontend Admin:**
   - Login page
   - Dashboard
   - CRUD de produtos, pedidos, etc.

3. **Configurar Settings:**
   - Acesse `/api/v1/admin/settings` (quando implementado)
   - Configure informações da loja
   - Configure Stripe
   - Configure SMTP

## 📝 Notas

- O token `ADMIN_SEED_TOKEN` está configurado como `seed-topos-20251105` no `wrangler.toml`
- Todos os endpoints admin (exceto `/auth/login`) requerem autenticação JWT
- O token JWT expira em 24 horas
- Use o refresh token para obter um novo access token

## 🔒 Segurança

1. ✅ Senhas são hasheadas com PBKDF2 (100.000 iterações)
2. ✅ JWT tokens assinados com secret
3. ✅ Refresh tokens com expiração de 30 dias
4. ✅ Audit logs de todas as ações
5. ✅ Role-based access control
6. ⏳ Rate limiting (a implementar)
7. ⏳ CSRF protection (a implementar)

## 🐛 Troubleshooting

### Erro: "Admin user not found"
- Verifique se o seed foi executado corretamente
- Verifique se o email está correto

### Erro: "Invalid credentials"
- Verifique a senha
- Verifique se o usuário está ativo

### Erro: "Invalid token"
- Verifique se o token JWT não expirou
- Use o refresh token para obter um novo access token

### Erro: "Unauthorized"
- Verifique se está enviando o header `Authorization: Bearer TOKEN`
- Verifique se o token é válido
- Verifique se o usuário tem as permissões necessárias

## 📚 Documentação da API

### Autenticação

- `POST /api/v1/admin/auth/login` - Login
- `POST /api/v1/admin/auth/refresh` - Refresh token
- `POST /api/v1/admin/auth/logout` - Logout
- `GET /api/v1/admin/auth/me` - Get current user
- `POST /api/v1/admin/auth/change-password` - Change password

### Dashboard

- `GET /api/v1/admin/dashboard/stats` - Estatísticas gerais
- `GET /api/v1/admin/dashboard/recent-orders` - Pedidos recentes
- `GET /api/v1/admin/dashboard/top-products` - Produtos mais vendidos
- `GET /api/v1/admin/dashboard/sales-chart` - Dados para gráficos

### A Implementar

- `/api/v1/admin/products` - CRUD produtos
- `/api/v1/admin/orders` - Gestão de pedidos
- `/api/v1/admin/customers` - Gestão de clientes
- `/api/v1/admin/categories` - CRUD categorias
- `/api/v1/admin/coupons` - CRUD cupons
- `/api/v1/admin/settings` - Configurações

