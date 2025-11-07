# 🚀 Como Rodar o Admin Localmente

## Passo a Passo

### 1. Instalar Dependências (se ainda não instalou)
```bash
npm install
```

### 2. Rodar o Backend (em um terminal)
```bash
npm run dev:backend
```
Isso vai rodar o backend na porta `8787`

### 3. Rodar o Frontend (em outro terminal)
```bash
npm run dev:frontend
```

### 4. Acessar o Admin
Abra o navegador e acesse:

**🔗 http://localhost:5173/admin**

(O Vite normalmente usa a porta 5173, mas verifique no terminal qual porta está sendo usada)

---

## ⚙️ Configuração

### API Local
O frontend está configurado para usar:
- **Local**: `http://localhost:8787/api` (via proxy do Vite)
- **Produção**: `https://api.leiasabores.pt/api`

Quando rodar localmente, o Vite automaticamente faz proxy de `/api` para `localhost:8787`.

### Portas
- **Frontend**: `http://localhost:5173` (ou a porta que o Vite mostrar)
- **Backend**: `http://localhost:8787`

---

## 🧪 Testar Localmente

1. **Dashboard**: http://localhost:5173/admin
2. **Produtos**: http://localhost:5173/admin/products
3. **Pedidos**: http://localhost:5173/admin/orders
4. **Categorias**: http://localhost:5173/admin/categories
5. **Cupons**: http://localhost:5173/admin/coupons
6. **Clientes**: http://localhost:5173/admin/customers
7. **Configurações**: http://localhost:5173/admin/settings

---

## 🔧 Troubleshooting

### Porta já em uso?
Se a porta 5173 estiver ocupada, o Vite vai usar outra porta automaticamente. Verifique no terminal qual porta está sendo usada.

### Backend não conecta?
Certifique-se de que o backend está rodando na porta 8787:
```bash
npm run dev:backend
```

### Erro de CORS?
O proxy do Vite resolve isso automaticamente. Se tiver problemas, verifique o `vite.config.ts`.

---

## ✅ Vantagens de Rodar Localmente

- ✅ Sem cache do Cloudflare
- ✅ Mudanças aparecem instantaneamente (hot reload)
- ✅ Console limpo (sem erros de bundle antigo)
- ✅ Debug mais fácil
- ✅ Testa antes de fazer deploy

