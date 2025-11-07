# 🔧 Solução: Porta 8787 em Uso

## Problema
```
Address already in use (127.0.0.1:8787)
```

## ✅ Solução Rápida

### Opção 1: Usar Script Automático (Recomendado)
```bash
./start-server.sh
```

Este script:
- ✅ Verifica se a porta está em uso
- ✅ Mata o processo anterior automaticamente
- ✅ Inicia o servidor

### Opção 2: Matar Processo Manualmente
```bash
# Encontrar processo
lsof -ti:8787

# Matar processo
kill $(lsof -ti:8787)

# Ou forçar
kill -9 $(lsof -ti:8787)
```

### Opção 3: Usar Outra Porta
```bash
wrangler dev --port 8788
```

E atualizar o teste:
```bash
./test-simple.sh http://localhost:8788/api
```

---

## 🚀 Iniciar Servidor Agora

```bash
# Terminal 1
./start-server.sh

# Terminal 2 (depois que servidor iniciar)
./test-simple.sh
```

---

## 📝 Scripts Disponíveis

- `start-server.sh` - Inicia servidor (mata processo anterior)
- `kill-port.sh` - Mata processo na porta
- `test-simple.sh` - Testa API

---

## ✅ Pronto!

Agora você pode iniciar o servidor sem problemas!

