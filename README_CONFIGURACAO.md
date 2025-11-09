# 📚 Documentação de Configuração - E-commerce

Este repositório contém toda a documentação necessária para configurar um novo e-commerce do zero sem erros.

---

## 📋 Arquivos de Documentação

### 1. **CONFIGURACAO_COMPLETA.md** 📖
**Documento principal com todas as configurações**

Contém:
- ✅ Todas as variáveis de ambiente (Secrets)
- ✅ Configuração completa do Cloudflare
- ✅ Configuração completa do Stripe
- ✅ Configuração do Backend
- ✅ Configuração do Frontend
- ✅ GitHub Actions Secrets
- ✅ Checklist de configuração
- ✅ Troubleshooting

**👉 Comece por aqui se você já tem experiência e quer uma referência rápida**

---

### 2. **SETUP_INICIAL.md** 🚀
**Guia passo a passo para iniciantes**

Contém:
- ✅ Passo a passo detalhado
- ✅ Como criar conta no Cloudflare
- ✅ Como criar conta no Stripe
- ✅ Como gerar JWT Secret
- ✅ Como configurar o projeto
- ✅ Como fazer deploy
- ✅ Como verificar se está funcionando

**👉 Use este guia se está começando do zero**

---

### 3. **BACKEND_ROBUSTO.md** 🛡️
**Documentação de segurança e robustez do backend**

Contém:
- ✅ Todas as validações implementadas
- ✅ Tratamento de erros
- ✅ Medidas de segurança
- ✅ Autenticação e autorização
- ✅ Rate limiting
- ✅ Proteção CSRF
- ✅ Headers de segurança
- ✅ Checklist de robustez

**👉 Use este documento para entender como o backend está protegido**

---

## 🔧 Arquivos de Configuração

### 1. **wrangler.toml.example** ☁️
Template de configuração do Cloudflare Workers

**Como usar:**
```bash
cp wrangler.toml.example wrangler.toml
# Edite wrangler.toml com suas credenciais
```

---

### 2. **env.template** 🔐
Template de variáveis de ambiente

**Como usar:**
```bash
cp env.template .env.local
# Edite .env.local com suas credenciais
```

---

### 3. **scripts/verify-backend.sh** 🔍
Script de verificação do backend

**Como usar:**
```bash
chmod +x scripts/verify-backend.sh
./scripts/verify-backend.sh [API_URL]
```

**Exemplo:**
```bash
./scripts/verify-backend.sh https://api.seudominio.com/api
```

---

## 🚀 Quick Start

### Para iniciar um novo e-commerce:

1. **Leia o SETUP_INICIAL.md** - Siga o guia passo a passo
2. **Copie os templates** - `wrangler.toml.example` e `env.template`
3. **Configure as credenciais** - Cloudflare, Stripe, JWT
4. **Execute as migrações** - Banco de dados D1
5. **Faça o deploy** - Backend e Frontend
6. **Verifique** - Use o script `verify-backend.sh`

---

## 📝 Checklist Rápido

### Cloudflare
- [ ] Conta criada
- [ ] Account ID obtido
- [ ] API Token criado
- [ ] D1 Database criado
- [ ] R2 Bucket criado
- [ ] Secrets configurados

### Stripe
- [ ] Conta criada
- [ ] Secret key obtida
- [ ] Publishable key obtida
- [ ] Webhook configurado
- [ ] Webhook secret obtido

### Backend
- [ ] wrangler.toml configurado
- [ ] Secrets configurados
- [ ] Migrações aplicadas
- [ ] Admin criado (seed)
- [ ] Health check OK

### Frontend
- [ ] Variáveis de ambiente configuradas
- [ ] Build funcionando
- [ ] Deploy no Cloudflare Pages

---

## 🔍 Verificação

### Verificar Backend

```bash
# Health check
curl https://api.seudominio.com/api/health

# Debug config
curl https://api.seudominio.com/api/debug/config

# Script automatizado
./scripts/verify-backend.sh https://api.seudominio.com/api
```

### Verificar Frontend

1. Acesse: `https://seudominio.com`
2. Verifique se carrega
3. Verifique se API está conectada (DevTools → Network)

### Verificar Stripe

1. Teste criar produto no admin
2. Adicione ao carrinho
3. Tente fazer checkout (modo teste)
4. Verifique webhook no Stripe Dashboard

---

## 🐛 Troubleshooting

### Erro: "STRIPE_SECRET_KEY is missing"

**Solução:**
```bash
npx wrangler secret put STRIPE_SECRET_KEY
```

### Erro: "Database not found"

**Solução:**
```bash
npx wrangler d1 list
# Verificar database_id no wrangler.toml
npm run migrate
```

### Erro: "R2 bucket not found"

**Solução:**
```bash
npx wrangler r2 bucket list
# Verificar bucket_name no wrangler.toml
npx wrangler r2 bucket create seu-bucket-r2
```

---

## 📚 Referências

- [CONFIGURACAO_COMPLETA.md](./CONFIGURACAO_COMPLETA.md) - Configuração completa
- [SETUP_INICIAL.md](./SETUP_INICIAL.md) - Guia passo a passo
- [BACKEND_ROBUSTO.md](./BACKEND_ROBUSTO.md) - Segurança e robustez
- [wrangler.toml.example](./wrangler.toml.example) - Template Cloudflare
- [env.template](./env.template) - Template variáveis de ambiente

---

## 🎯 Próximos Passos

1. **Configurar Domínio**
   - Adicionar domínio no Cloudflare
   - Configurar DNS
   - Configurar SSL

2. **Configurar Email**
   - Email de notificações
   - Email de pedidos

3. **Configurar Analytics**
   - Google Analytics
   - Cloudflare Analytics

4. **Otimizações**
   - Configurar cache
   - Otimizar imagens
   - Configurar CDN

5. **Backup**
   - Backup do D1
   - Backup do R2
   - Documentar procedimentos

---

## ✅ Status

- ✅ Documentação completa criada
- ✅ Templates de configuração criados
- ✅ Script de verificação criado
- ✅ Backend robusto e seguro
- ✅ Validações implementadas
- ✅ Tratamento de erros implementado
- ✅ Segurança implementada

---

## 📞 Suporte

Se tiver problemas:

1. Verifique a documentação
2. Execute o script de verificação
3. Verifique os logs do Cloudflare
4. Verifique os logs do Stripe
5. Use o endpoint de debug: `/api/debug/config`

---

**Última atualização**: 2024-11-08

