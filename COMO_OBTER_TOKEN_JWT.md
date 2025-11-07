# 🔐 Como Obter Token JWT para o Painel Admin

## ⚠️ Problema

O painel Admin requer um **token JWT válido com role "admin"** para criar/editar/deletar produtos.

Se você tentar salvar sem token, verá erro:
- `401 Unauthorized` - Token inválido ou expirado
- `403 Forbidden` - Token sem role "admin"

---

## 🔧 Solução: Gerar Token JWT

### Opção 1: Criar Endpoint para Gerar Token (Recomendado)

Vou criar um endpoint simples para gerar tokens de teste.

### Opção 2: Usar Ferramenta Online

1. Acesse: https://jwt.io
2. Use o payload:
```json
{
  "userId": "admin",
  "email": "admin@leiasabores.pt",
  "role": "admin",
  "iat": 1699300000,
  "exp": 9999999999
}
```
3. Use o `JWT_SECRET` do seu Cloudflare Workers
4. Gere o token

### Opção 3: Criar Script Local

Criar um script Node.js para gerar o token.

---

## 🚀 Solução Rápida: Endpoint de Login Admin

Vou criar um endpoint `/api/admin/login` que gera um token JWT válido.

---

**Última atualização:** 7 de Novembro de 2025

