# Correção de Import em admin.spec.ts

## Problema

O arquivo `tests/e2e/admin.spec.ts` estava usando o import incorreto:

```typescript
import { test, expect } from '../fixtures/admin-auth'
```

Isso causava o erro:
```
Error: Cannot find module '/Users/davidsousa/Documents/Websites/ecommerce/tests/fixtures/admin-auth'
```

## Causa

O arquivo `admin.spec.ts` está localizado em `tests/e2e/admin.spec.ts` (raiz do diretório `tests/e2e/`).

Quando usa `../fixtures/admin-auth`, está procurando em `tests/fixtures/admin-auth`, mas o arquivo correto está em `tests/e2e/fixtures/admin-auth`.

## Solução

Alterado o import para:

```typescript
import { test, expect } from './fixtures/admin-auth'
```

Agora o caminho relativo está correto:
- De `tests/e2e/admin.spec.ts`
- Para `tests/e2e/fixtures/admin-auth.ts`
- Usando `./fixtures/admin-auth`

## Observação

Outros arquivos de teste em subdiretórios (como `tests/e2e/auth/login.spec.ts`) estão corretos usando `../fixtures/admin-auth`, porque:
- `tests/e2e/auth/login.spec.ts` → `../fixtures/admin-auth` → `tests/e2e/fixtures/admin-auth.ts` ✅

## Status

✅ Corrigido e commitado

