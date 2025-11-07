# 🚀 Guia de Deployment - Party Land

Instruções passo a passo para fazer deploy da aplicação na infraestrutura Cloudflare.

## 📋 Pré-requisitos

- Conta Cloudflare (gratuita ou paga)
- Conta Stripe (para pagamentos)
- Node.js 18+ instalado
- Wrangler CLI instalado (`npm install -g wrangler`)
- Domínio registrado (opcional, pode usar domínio Cloudflare)

## 🔧 Setup Inicial

### 1. Criar Conta Cloudflare

```bash
# Login ou criar conta em https://dash.cloudflare.com
# Anota seu Account ID
```

### 2. Instalar e Configurar Wrangler

```bash
# Instalar Wrangler globalmente
npm install -g wrangler

# Login com Cloudflare
wrangler login
```

### 3. Criar Banco de Dados D1

```bash
# Criar database
wrangler d1 create cake_decor_db

# Copiar o database_id para wrangler.toml
# Atualizar arquivo:
# [[d1_databases]]
# binding = "DB"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 4. Executar Migrations

```bash
# Executar SQL para criar tabelas
wrangler d1 execute cake_decor_db --file backend/migrations/0001_init.sql --remote

# Para desenvolvimento local
wrangler d1 execute cake_decor_db --file backend/migrations/0001_init.sql --local
```

### 5. Criar Bucket R2

```bash
# Criar storage para imagens
wrangler r2 bucket create cake-decor-images
```

### 6. Configurar Variáveis de Ambiente

Adicionar ao `wrangler.toml`:

```toml
[env.production]
name = "cake-decor-shop"
account_id = "seu_account_id"

[[env.production.d1_databases]]
binding = "DB"
database_id = "seu_database_id"

[[env.production.r2_buckets]]
binding = "R2"
bucket_name = "cake-decor-images"

[env.production.vars]
STRIPE_SECRET_KEY = "sk_live_xxxxx"
STRIPE_WEBHOOK_SECRET = "whsec_xxxxx"
JWT_SECRET = "seu_secret_muito_longo"
ENVIRONMENT = "production"
```

### 7. Configurar Secrets

```bash
# Adicionar secrets (não devem estar no arquivo de config)
wrangler secret put STRIPE_SECRET_KEY --env production
wrangler secret put STRIPE_WEBHOOK_SECRET --env production
wrangler secret put JWT_SECRET --env production
```

### 8. Configurar Stripe Webhooks

1. Ir para dashboard.stripe.com
2. Webhooks → Adicionar endpoint
3. URL: `https://seu-dominio.com/api/checkout/webhook`
4. Eventos: 
   - `checkout.session.completed`
   - `checkout.session.expired`
5. Copiar signing secret para `STRIPE_WEBHOOK_SECRET`

## 📦 Build e Deploy

### Build Local

```bash
# Build completo (frontend + backend)
npm run build

# Resultado em dist/ (worker + public)
```

### Deploy para Cloudflare Pages (Frontend)

```bash
# Option 1: CLI direto
wrangler pages deploy dist/public

# Option 2: Git integration (recomendado)
# Conectar repo GitHub ao Cloudflare Pages
# Push para main branch dispara deploy automático
```

### Deploy para Cloudflare Workers (Backend)

```bash
# Deploy production
npm run deploy -- --env production

# Deploy staging
npm run deploy -- --env staging

# Verificar status
wrangler deployments list
```

## 🌐 Configurar Domínio Customizado

### 1. Apontar Nameservers

Se registrou domínio em outro lugar:
```
Nameservers Cloudflare:
- natalia.ns.cloudflare.com
- tamer.ns.cloudflare.com
```

Atualizar no registrador (GoDaddy, Namecheap, etc)

### 2. Configurar DNS no Cloudflare

1. Dashboard → seu-dominio.com
2. DNS → Records
3. Adicionar:
   - Type: `CNAME`, Name: `www`, Content: `seu-dominio.com` (proxy ativo - laranja)
   - Type: `CNAME`, Name: `api`, Content: `seu-dominio.workers.dev` (proxy ativo)

### 3. Configurar SSL/TLS

1. SSL/TLS → Overview
2. Mode: `Full` ou `Full (strict)`
3. Edge Certificates: automático (já está habilitado)

### 4. Configurar Page Rules (opcional)

1. Rules → Page Rules
2. Exemplo:
   - URL: `seu-dominio.com/api/*`
   - Action: Cache Level = Bypass

## 📊 Monitoramento & Logs

### Ver Logs

```bash
# Logs em tempo real
wrangler tail

# Logs da última execução
wrangler tail --env production
```

### Analytics

1. Dashboard Cloudflare → seu-dominio.com
2. Analytics → Tráfego
3. Verificar:
   - Requests totais
   - Cache hit rate
   - Status codes

### Database

```bash
# Query database remotamente
wrangler d1 execute cake_decor_db "SELECT COUNT(*) FROM products" --remote

# Backup local
wrangler d1 execute cake_decor_db ".dump" --remote > backup.sql
```

## 🔒 Segurança

### Ativar Rate Limiting

1. Security → DDoS Protection → Rate Limiting
2. Configurar:
   - URL Path: `/api/*`
   - Requests: 100
   - Período: 1 minuto

### Bot Management

1. Security → Bots → Super Bot Fight Mode
2. Ativar proteção contra bots maliciosos

### WAF (Web Application Firewall)

1. Security → WAF
2. Managed Rules: ativar OWASP ModSecurity
3. Custom Rules: adicionar regras customizadas

## 📈 Performance

### Otimizações Automáticas

- ✅ Minificação CSS/JS (ativar em Speed → Optimization)
- ✅ Brotli compression (automático)
- ✅ Image optimization (ativar em Speed → Image Optimization)
- ✅ Rocket Loader (async JS loading)

### CDN & Caching

1. Speed → Caching
2. Browser Cache TTL: 1 hour
3. Cache Rules:
   - `/static/*` → Cache Everything (1 ano)
   - `/api/*` → Bypass Cache
   - `*.jpg|png|gif|ico` → Cache Everything (1 ano)

## 🔄 CI/CD Pipeline

### GitHub Actions (automático com Pages)

Adicionar `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint & Type check
        run: npm run type-check && npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloudflare
        run: npm run deploy -- --env production
        env:
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
          STRIPE_WEBHOOK_SECRET: ${{ secrets.STRIPE_WEBHOOK_SECRET }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

## 🐛 Troubleshooting

### Erro: "D1 database not found"

```bash
# Verificar database ID em wrangler.toml
# Deve ser UUID format
wrangler d1 list
```

### Erro: "CORS policy blocked"

```toml
# Atualizar backend/src/index.ts
# Verificar configuração CORS em app.use(cors())
```

### Erro: "Stripe webhook failed"

- Verificar URL do webhook: `https://seu-dominio.com/api/checkout/webhook`
- Verificar signing secret matches
- Verificar logs em dashboard.stripe.com

### Performance lenta

1. Verificar D1 query performance
2. Ativar caching para queries estáticas
3. Usar Worker KV para cache de curta duração
4. Verificar imagens estão otimizadas

## 📞 Suporte

- Cloudflare Support: https://support.cloudflare.com
- Stripe Support: https://support.stripe.com
- GitHub Issues: [seu-repo]/issues

---

**Última atualização**: 4 de Novembro de 2025
### 9. Seed & Uploads

```bash
# Popular D1 com produtos iniciais (JWT admin)
curl -X POST https://seu-dominio.com/api/admin/seed \
  -H "Authorization: Bearer <TOKEN_ADMIN>"

# Upload de imagem para R2
curl -X POST https://seu-dominio.com/api/uploads \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -F file=@./imagem.png \
  -F keyPrefix=products

# Obter objeto do R2
curl https://seu-dominio.com/api/uploads/products/<uuid>.png
```
