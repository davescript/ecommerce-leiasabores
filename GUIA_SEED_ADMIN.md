# 🔑 Guia de Seed do Admin

## Token de Seed

O token configurado no `wrangler.toml` é:
```
ADMIN_SEED_TOKEN = "seed-topos-20251105"
```

## Como Executar o Seed

### 1. Seed do Admin User

Cria o usuário administrador inicial:
- **Email:** `admin@leiasabores.pt`
- **Senha:** `admin123`
- **Role:** `admin`
- **Permissões:** Todas as permissões

**Comando:**
```bash
curl -X POST "https://api.leiasabores.pt/api/admin/seed-admin?token=seed-topos-20251105"
```

### 2. Seed de Categorias

Cria a estrutura de categorias completa:
- Categorias principais e subcategorias
- Hierarquia de categorias
- Categorias organizadas

**Comando:**
```bash
curl -X POST "https://api.leiasabores.pt/api/admin/seed-categories?token=seed-topos-20251105"
```

### 3. Seed de Produtos (Topos)

Cria produtos de exemplo na categoria "Topos de Bolo":
- Topo Clássico Dourado
- Topo Clássico Azul
- Topo Personalizado Estrela

**Comando:**
```bash
curl -X POST "https://api.leiasabores.pt/api/admin/seed-topos?token=seed-topos-20251105"
```

### 4. Seed Partyland (Completo)

Cria categorias e produtos do Partyland:
- Todas as categorias
- Produtos de exemplo
- Estrutura completa

**Comando:**
```bash
curl -X POST "https://api.leiasabores.pt/api/admin/seed-partyland?token=seed-topos-20251105"
```

## Executar Todos os Seeds

Para executar todos os seeds de uma vez:

```bash
# Seed Admin User
curl -X POST "https://api.leiasabores.pt/api/admin/seed-admin?token=seed-topos-20251105"

# Seed Categorias
curl -X POST "https://api.leiasabores.pt/api/admin/seed-categories?token=seed-topos-20251105"

# Seed Produtos
curl -X POST "https://api.leiasabores.pt/api/admin/seed-topos?token=seed-topos-20251105"
```

## Verificar Resultado

Após executar os seeds, você pode verificar:

1. **Login no Admin:**
   - URL: `https://www.leiasabores.pt/admin`
   - Email: `admin@leiasabores.pt`
   - Senha: `admin123`

2. **Verificar no Dashboard:**
   - Produtos criados
   - Categorias criadas
   - Configurações da loja

## Segurança

⚠️ **IMPORTANTE:**
- O token está configurado no `wrangler.toml`
- Em produção, considere usar um token mais seguro
- Após criar o admin, altere a senha padrão
- Não exponha o token publicamente

## Alterar Token

Para alterar o token, edite o `wrangler.toml`:

```toml
[vars]
ADMIN_SEED_TOKEN = "seu-token-seguro-aqui"
```

E atualize no Cloudflare Workers:
```bash
wrangler secret put ADMIN_SEED_TOKEN
```

---

**Token Atual:** `seed-topos-20251105`  
**Admin Email:** `admin@leiasabores.pt`  
**Admin Password:** `admin123` (⚠️ ALTERE EM PRODUÇÃO!)

