# 🔧 Troubleshooting - Testes E2E

## Erro: Login Failed (401/500)

### Problema
Os testes estão falhando porque o login não está funcionando:
```
expect(loginResponse.ok()).toBeTruthy()
Received: false
```

### Possíveis Causas e Soluções

#### 1. API não está acessível
**Sintoma:** Status 500 ou erro de conexão

**Solução:**
- Verifique se a API está rodando
- Verifique a URL da API em `PLAYWRIGHT_API_URL`
- Teste manualmente: `curl https://api.leiasabores.pt/api/v1/admin/auth/login`

#### 2. Admin user não existe no banco
**Sintoma:** Status 401 "Invalid credentials"

**Solução:**
```bash
# Criar admin user via seed
npm run seed:admin

# Ou manualmente via API (se tiver SEED_TOKEN)
curl -X POST https://api.leiasabores.pt/api/v1/admin/seed \
  -H "Authorization: Bearer $SEED_TOKEN" \
  -H "Content-Type: application/json"
```

#### 3. Credenciais incorretas
**Sintoma:** Status 401 "Invalid credentials"

**Solução:**
- Verifique as credenciais em `tests/e2e/fixtures/admin-auth.ts`:
  ```typescript
  export const TEST_ADMIN_CREDENTIALS = {
    email: 'admin@leiasabores.pt',
    password: 'admin123',
  }
  ```
- Certifique-se de que o admin user existe com essas credenciais

#### 4. Rate Limiting
**Sintoma:** Status 429 "Too many requests"

**Solução:**
- Aguarde alguns minutos antes de rodar os testes novamente
- Ajuste o rate limit no backend se necessário

#### 5. CORS ou Network Issues
**Sintoma:** Erro de rede ou CORS

**Solução:**
- Verifique se a API permite requisições do Playwright
- Verifique configurações de CORS no backend

### Como Debugar

1. **Verificar se API está acessível:**
```bash
curl -X POST https://api.leiasabores.pt/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@leiasabores.pt","password":"admin123"}'
```

2. **Verificar se admin user existe:**
```bash
# Via wrangler (se tiver acesso)
wrangler d1 execute ecommerce_db --command "SELECT * FROM admin_users WHERE email = 'admin@leiasabores.pt'"
```

3. **Rodar testes com mais verbosidade:**
```bash
DEBUG=pw:api npm run test:e2e
```

4. **Rodar apenas um teste específico:**
```bash
npx playwright test tests/e2e/auth/login.spec.ts --headed
```

### Configuração de Variáveis de Ambiente

Crie um arquivo `.env.test` ou configure as variáveis:

```bash
# URL do frontend
PLAYWRIGHT_TEST_BASE_URL=http://localhost:5173

# URL da API
PLAYWRIGHT_API_URL=https://api.leiasabores.pt/api

# Ou para ambiente local:
# PLAYWRIGHT_API_URL=http://localhost:8787/api
```

### Checklist Antes de Rodar Testes

- [ ] API está rodando e acessível
- [ ] Admin user existe no banco de dados
- [ ] Credenciais de teste estão corretas
- [ ] Variáveis de ambiente estão configuradas
- [ ] Frontend está rodando (se necessário)
- [ ] Não há rate limiting bloqueando

### Comandos Úteis

```bash
# Verificar se admin user existe
npm run seed:admin

# Rodar testes com debug
DEBUG=pw:api npm run test:e2e -- --debug

# Rodar apenas testes de autenticação
npx playwright test tests/e2e/auth/

# Ver relatório HTML
npm run test:e2e:report
```

