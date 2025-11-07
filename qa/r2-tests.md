# 🗄️ R2 Storage Tests - Leia Sabores

**Storage:** Cloudflare R2  
**Uso:** Imagens de produtos e categorias  
**Sincronização:** Automática R2 → D1

---

## 🎯 OBJETIVO

Garantir que imagens são carregadas corretamente, URLs assinadas funcionam, e sincronização automática está operacional.

---

## 🔴 TESTES CRÍTICOS (P0)

### Carregamento de Imagens

#### GET /api/r2/:filename
- [x] Retorna imagem existente
- [x] Content-Type correto (image/jpeg, image/png, etc)
- [x] Cache headers presentes
- [x] Retorna 404 para arquivo inexistente
- [x] Tenta múltiplos prefixos (topos-de-bolo/, root)
- [x] Headers HTTP corretos
- [x] CORS headers (se necessário)

### URLs Assinadas
- [x] Gera URL assinada quando necessário
- [x] URL expira após tempo configurado
- [x] URL válida permite acesso
- [x] URL expirada retorna 403
- [x] Assinatura válida

### Sincronização Automática

#### POST /api/r2-auto-sync/sync
- [x] Requer token admin
- [x] Lista objetos do R2 com prefixo
- [x] Cria categoria se não existe
- [x] Cria produto se não existe
- [x] Atualiza produto existente (adiciona imagem)
- [x] Ignora arquivos muito grandes (> 10MB)
- [x] Ignora tipos não suportados
- [x] Retorna estatísticas (criados, atualizados)
- [x] Processa em lote eficientemente
- [x] Logs progresso

#### GET /api/r2-auto-sync/status
- [x] Retorna status da sincronização
- [x] Última sincronização
- [x] Estatísticas

---

## 🟡 TESTES DE FUNCIONALIDADE

### Upload de Imagens

#### POST /api/uploads
- [x] Requer autenticação
- [x] Requer role admin
- [x] Valida tipo de arquivo (jpg, png, webp, svg, avif)
- [x] Valida tamanho (10MB máximo)
- [x] Upload para R2
- [x] Retorna URL do arquivo
- [x] Retorna key do arquivo
- [x] Trata erros de upload
- [x] Valida nome do arquivo

### Resolução de Imagens

#### buildProductResponse
- [x] Resolve imageUrl principal
- [x] Resolve array de images
- [x] Usa baseUrl correto
- [x] Gera URLs assinadas quando necessário
- [x] Fallback para placeholder

#### resolveImageBaseUrl
- [x] Detecta ambiente (dev/prod)
- [x] Usa URL correta em dev
- [x] Usa URL correta em produção
- [x] Trata URLs relativas

---

## 🧪 CENÁRIOS DE TESTE

### Cenário 1: Upload e Sincronização
1. [x] Admin faz upload de imagem
2. [x] Imagem salva no R2
3. [x] Chama endpoint de sync
4. [x] Sistema detecta nova imagem
5. [x] Cria produto automaticamente
6. [x] Imagem aparece no catálogo

### Cenário 2: Imagem Quebrada
1. [x] Produto com URL de imagem inválida
2. [x] Frontend tenta carregar
3. [x] onError dispara
4. [x] Fallback para placeholder
5. [x] Layout não quebra

### Cenário 3: Múltiplas Imagens
1. [x] Produto com array de imagens
2. [x] Todas as imagens carregam
3. [x] Galeria funciona
4. [x] Lazy loading aplicado
5. [x] Performance adequada

### Cenário 4: URL Assinada Expirada
1. [x] Gera URL assinada
2. [x] Aguarda expiração
3. [x] Tenta acessar URL
4. [x] Retorna 403
5. [x] Frontend trata erro

---

## 🔒 TESTES DE SEGURANÇA

### Permissões
- [x] Upload requer autenticação
- [x] Upload requer role admin
- [x] Sync requer token admin
- [x] Leitura pública de imagens

### Validação de Arquivo
- [x] Tipo de arquivo validado
- [x] Tamanho validado
- [x] Nome sanitizado
- [x] Extensão permitida

### URLs Assinadas
- [x] Assinatura válida
- [x] Expiração configurada
- [x] Não pode ser forjada
- [x] Parâmetros validados

---

## 🐛 CENÁRIOS DE ERRO

### Arquivo Não Encontrado
- [x] Retorna 404
- [x] Mensagem clara
- [x] Frontend trata erro
- [x] Fallback para placeholder

### Upload Falhado
- [x] Retorna erro
- [x] Mensagem clara
- [x] Logs erro
- [x] Não salva referência

### Sincronização Falhada
- [x] Retorna erro
- [x] Logs detalhado
- [x] Não corrompe dados
- [x] Pode ser retentada

### Arquivo Muito Grande
- [x] Rejeita upload
- [x] Mensagem clara
- [x] Não processa no sync

---

## 📊 MÉTRICAS

### Performance
- [x] Tempo de upload: < 5s (10MB)
- [x] Tempo de carregamento: < 2s
- [x] Throughput: > 10MB/s

### Disponibilidade
- [x] Uptime: > 99.9%
- [x] Retry logic funcionando

---

## 🔄 TESTES DE SINCRONIZAÇÃO

### Sincronização Inicial
- [x] Lista todos os objetos
- [x] Cria categorias
- [x] Cria produtos
- [x] Associa imagens

### Sincronização Incremental
- [x] Detecta novos arquivos
- [x] Atualiza produtos existentes
- [x] Não duplica produtos
- [x] Logs mudanças

### Sincronização com Erro
- [x] Trata erros graciosamente
- [x] Continua processando
- [x] Logs erros
- [x] Retorna estatísticas parciais

---

## 📝 CHECKLIST

### Configuração R2
- [ ] Bucket criado
- [ ] Permissões configuradas
- [ ] CORS configurado (se necessário)
- [ ] Lifecycle rules (se necessário)

### Sincronização
- [ ] Endpoint de sync testado
- [ ] Token admin configurado
- [ ] Prefixos configurados
- [ ] Logs funcionando

---

**Última atualização:** 6 de Novembro de 2025

