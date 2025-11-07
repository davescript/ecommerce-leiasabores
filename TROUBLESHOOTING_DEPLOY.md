# 🔍 Troubleshooting: Deploy Não Iniciou

## 🔍 Possíveis Causas

### 1. **Jobs de Dependência Falharam**

O deploy só roda se **TODOS** os jobs de `needs` passarem:

**Deploy Frontend precisa de:**
- ✅ `lint-and-format` (passar)
- ✅ `type-check` (passar)
- ✅ `unit-tests` (passar)
- ✅ `e2e-tests` (passar)
- ✅ `build-frontend` (passar)

**Deploy Backend precisa de:**
- ✅ `lint-and-format` (passar)
- ✅ `type-check` (passar)
- ✅ `unit-tests` (passar)

**Se qualquer um falhar, o deploy NÃO roda!**

---

### 2. **Secrets Não Configurados**

O deploy precisa destes secrets no GitHub:

- ❌ `CLOUDFLARE_API_TOKEN` - **OBRIGATÓRIO**
- ❌ `CLOUDFLARE_ACCOUNT_ID` - **OBRIGATÓRIO**

**Como verificar:**
1. GitHub → Settings → Secrets and variables → Actions
2. Verifique se os secrets existem

**Se não existirem, o deploy vai falhar silenciosamente!**

---

### 3. **Branch Incorreta**

O deploy só roda em:
- ✅ `main`
- ✅ `master`

**Verificar branch atual:**
```bash
git branch --show-current
```

---

### 4. **Workflow Não Disparou**

Verifique se o workflow rodou:
1. GitHub → Actions
2. Veja se há um workflow rodando ou que falhou

---

## 🛠️ Soluções

### Solução 1: Verificar Logs do Workflow

1. Vá para **GitHub → Actions**
2. Clique no workflow que falhou
3. Veja qual job falhou
4. Clique no job para ver os logs

**Exemplo de problemas comuns:**

#### Erro: "CLOUDFLARE_API_TOKEN not found"
```yaml
Error: Required secret is missing: CLOUDFLARE_API_TOKEN
```
**Solução:** Configure o secret no GitHub

#### Erro: "Tests failed"
```yaml
Error: Test suite failed to run
```
**Solução:** Corrija os testes ou ajuste o workflow para não bloquear deploy

#### Erro: "Lint failed"
```yaml
Error: ESLint found problems
```
**Solução:** Corrija os erros de lint ou ajuste o workflow

---

### Solução 2: Configurar Secrets

**1. Obter CLOUDFLARE_API_TOKEN:**
- Acesse: https://dash.cloudflare.com/profile/api-tokens
- Crie um token com permissões:
  - Workers Scripts:Edit
  - Account:Cloudflare Workers:Read
  - Pages:Edit

**2. Obter CLOUDFLARE_ACCOUNT_ID:**
- Acesse: https://dash.cloudflare.com/
- Veja o Account ID no menu lateral

**3. Configurar no GitHub:**
- GitHub → Settings → Secrets and variables → Actions
- New repository secret
- Adicione cada secret

---

### Solução 3: Ajustar Workflow para Não Bloquear

Se você quer que o deploy rode mesmo se alguns testes falharem, ajuste o workflow:

```yaml
deploy-frontend:
  needs: [lint-and-format, type-check, unit-tests, e2e-tests, build-frontend]
  # Mude para:
  needs: [build-frontend]  # Só precisa do build
  if: always() && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master')
```

**⚠️ CUIDADO:** Isso faz deploy mesmo se testes falharem!

---

### Solução 4: Deploy Manual (Temporário)

Enquanto corrige o workflow, faça deploy manual:

```bash
# Backend
npm run deploy

# Frontend
npm run build:frontend
wrangler pages deploy dist/public --project-name=leiasabores
```

---

## 🔍 Checklist de Diagnóstico

- [ ] Verificar se workflow rodou (GitHub → Actions)
- [ ] Verificar se todos os jobs de `needs` passaram
- [ ] Verificar se secrets estão configurados
- [ ] Verificar se está na branch `main` ou `master`
- [ ] Verificar logs do workflow para erros específicos
- [ ] Verificar se testes estão passando localmente

---

## 📊 Como Verificar o Status

### 1. Ver Logs do Workflow

```bash
# No GitHub:
Actions → Clique no workflow → Veja os jobs
```

### 2. Verificar Secrets

```bash
# No GitHub:
Settings → Secrets and variables → Actions
```

### 3. Testar Localmente

```bash
# Rodar os mesmos comandos que o CI
npm run lint
npm run type-check
npm run test:unit
npm run test:e2e
```

---

## 🚨 Problemas Comuns

### Problema: "Workflow skipped"

**Causa:** Condição `if` não foi satisfeita

**Solução:** Verifique se:
- Está na branch `main` ou `master`
- É um `push` (não `pull_request`)

---

### Problema: "Job skipped because dependency failed"

**Causa:** Um job de `needs` falhou

**Solução:**
1. Corrija o job que falhou
2. Ou remova da lista de `needs`

---

### Problema: "Secret not found"

**Causa:** Secret não configurado no GitHub

**Solução:** Configure o secret em Settings → Secrets

---

## ✅ Próximos Passos

1. **Verifique os logs do workflow** no GitHub Actions
2. **Identifique qual job falhou**
3. **Corrija o problema** (secrets, testes, lint, etc.)
4. **Faça push novamente** para disparar o workflow

---

**Última atualização:** 7 de Novembro de 2025

