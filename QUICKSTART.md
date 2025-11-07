# ⚡ Quick Start - Party Land

Comece em 5 minutos.

## 1️⃣ Clone & Install

```bash
git clone https://github.com/seu-usuario/ecommerce.git
cd ecommerce
npm install
```

## 2️⃣ Setup Variáveis de Ambiente

```bash
cp .env.example .env.local
# Edite .env.local e adicione suas chaves Stripe
```

## 3️⃣ Inicie o Desenvolvimento

```bash
# Terminal 1 - API (Cloudflare Workers)
npm run dev:backend

# Terminal 2 - Frontend (Vite)
npm run dev:frontend
```

Acesse http://localhost:5173 (frontend) e http://127.0.0.1:8787 (backend)

## 4️⃣ Estrutura Rápida

```
Componentes:        frontend/app/components/
Páginas:           frontend/app/pages/
API Routes:        backend/src/routes/
Tipos:             frontend/types/
Hooks:             frontend/app/hooks/
```

## 5️⃣ Comandos Úteis

```bash
# Build para produção
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Deploy Cloudflare
npm run deploy
```

## 🎨 Customizar

### Cores
Editar `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      primary: '#339999',  // Mude aqui
      secondary: '#1a1a1a',
    },
  },
}
```

### Logo & Favicon
Trocar em `frontend/index.html` e `frontend/public/`

### Textos
Buscar e substituir "Party Land" por seu nome (se desejar usar outra marca)

## 📱 Testar PWA

1. Build: `npm run build`
2. Serve: `npm run preview`
3. Abrir DevTools (F12) → Application → Service Workers
4. Instalar: Menu → Install app

## 🚀 Deploy em 3 Passos

```bash
# 1. Criar Cloudflare D1
wrangler d1 create cake_decor_db

# 2. Setup secrets
wrangler secret put STRIPE_SECRET_KEY

# 3. Deploy!
npm run deploy
```

Pronto! 🎉

---

Próximos passos:
1. Ler [README.md](README.md) completo
2. Ver [DEPLOYMENT.md](DEPLOYMENT.md) para produção
3. Customizar conforme necessário
