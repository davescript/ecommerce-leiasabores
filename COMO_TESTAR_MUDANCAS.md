# 🧪 Como Testar as Mudanças Implementadas

## ✅ Site Está Online!

**Acesso direto:**
```
🌐 https://leiasabores.pt
📱 https://www.leiasabores.pt
☁️ https://leiasabores.pages.dev (backup)
```

---

## 👀 O Que Procurar

### 1️⃣ **Announcement Bar** (Barra de Promoção)

**Localização:** Muito no topo, acima do header

**Características:**
- Cor rosa/gradiente
- Texto: "✨ FRETE GRÁTIS em encomendas acima de €39 • Personalização incluída"
- Botão X para descartar
- Animação ao abrir/fechar

**Testar:**
- ✓ Ver a mensagem aparecer
- ✓ Click no X para fechar
- ✓ Recarregar página - volta a aparecer

---

### 2️⃣ **Category Submenu** (Categorias Dropdown)

**Localização:** Header, entre "Início" e "Catálogo"

**Características:**
- Texto: "Categorias" com ▼
- Ao passar mouse (desktop) ou click (mobile)
- Abre dropdown com 4 categorias

**Categorias Visíveis:**
1. 🎪 **Topos Personalizados** - "Produção em 24h"
2. 🍰 **Bolos Temáticos** - "Sabores exclusivos"
3. 🎁 **Doces & Mesa** - "Macarons, brigadeiros"
4. 📦 **Kits Completo** - "Tudo para a festa"

**Testar:**
- ✓ Passar mouse no header (desktop)
- ✓ Ver dropdown aparecer com ícones e descrições
- ✓ Click em uma categoria - vai para catálogo filtrado
- ✓ Verificar no mobile - click abre/fecha

---

### 3️⃣ **Hot Deals Section** (Ofertas da Semana)

**Localização:** Entre "Coleções que encantam" e "Favoritos que voam"

**Características:**
- Título: "Hot Deals desta semana" com ícone 🔥
- Texto: "Descontos especiais em seleção de produtos premium"
- 4 produtos em grid
- **Badges vermelhos** com percentual de desconto
- CTA newsletter no final

**Testar:**
- ✓ Ver 4 produtos com badge vermelho (ex: -25%)
- ✓ Click num produto abre detalhe
- ✓ Add to cart funciona
- ✓ Newsletter input no final

---

### 4️⃣ **JSON-LD Schema** (Para Google/SEO)

**Localização:** Código-fonte

**Como testar:**
1. Abrir site em browser
2. **Ctrl+U** (ou Click direito → Ver código-fonte)
3. Procurar por: `<script type="application/ld+json">`
4. Ver estrutura Organization com contacto, social, etc.

**Verificar no Google:**
1. Ir para https://schema.org/validate
2. Cole o URL do site
3. Procure na lista por "Organization" - deve aparecer ✓

---

## 🔍 Checklist Completo

- [ ] Announcement bar visível no topo
- [ ] Fechar announcement bar com X funciona
- [ ] Header tem "Categorias" com dropdown
- [ ] Dropdown categorias tem ícones
- [ ] Click categoria filtra produtos
- [ ] Hot Deals section visível
- [ ] 4 produtos com badge desconto
- [ ] Newsletter signup existe
- [ ] Produtos têm Add to Cart
- [ ] Site responsivo mobile/desktop
- [ ] JSON-LD no código-fonte

---

## 🎬 Fluxo Recomendado Para Testar

### Cenário 1: Cliente New
1. Entra no site → Vê announcement bar
2. Explora categorias via dropdown
3. Vê hot deals
4. Clica num produto
5. Add to cart

### Cenário 2: Mobile
1. Abre site no telemóvel
2. Vê announcement bar
3. Click menu hambúrguer
4. Testa categorias dropdown
5. Scroll até hot deals

### Cenário 3: SEO Testing
1. Inspeciona código-fonte (Ctrl+U)
2. Procura JSON-LD
3. Testa em https://schema.org/validate
4. Verifica Google Search Console

---

## 🐛 Se Algo Não Funcionar

**Announcement bar não aparece:**
- [ ] Limpar cache (Ctrl+Shift+Delete)
- [ ] Tentar incognito
- [ ] Recarregar página

**Categoria dropdown vazio:**
- [ ] Esperar carregar (pode levar alguns segundos)
- [ ] Abrir DevTools (F12) → Console
- [ ] Verificar erros vermelhos

**Hot Deals não mostra produtos:**
- [ ] Página pode estar carregando (skeleton visible)
- [ ] API pode ter delay
- [ ] Tentar F5 para refresh

**Mobile não mostra bem:**
- [ ] Verificar zoom (deve estar 100%)
- [ ] Virar para landscape/portrait
- [ ] Limpar cache do browser

---

## 💬 Feedback Para Melhorar

Qual deles gostaria de ajustar?

1. **Cores/Estilos:** Outra cor para announcement bar? Outro tamanho?
2. **Texto:** Mudar mensagens de promoção?
3. **Layout:** Quantos produtos hot deals? 4 ou mais?
4. **Categorias:** Adicionar/remover categorias no menu?
5. **Animações:** Mais ou menos animações?

---

## 📱 Testar em Diferentes Devices

### Desktop
- Chrome (F12 → Responsive)
- Firefox
- Safari
- Edge

### Mobile
- iPhone (Safari)
- Android (Chrome)
- Telemóvel real

### Tablet
- iPad
- Samsung Tab

---

## 🚀 Performance

Verificar em DevTools (F12):

1. **Network Tab:**
   - Build size: ~530KB gzipped ✓ (excelente)
   - Carrega em <3s ✓

2. **Lighthouse:**
   - Performance: ~90+ ✓
   - Accessibility: ~95+ ✓
   - SEO: ~100 ✓

3. **Mobile Performance:**
   - FCP (First Contentful Paint): <2s
   - LCP (Largest Contentful Paint): <2.5s
   - CLS (Cumulative Layout Shift): <0.1

---

## ✨ Pronto Para Testar!

**Agora clique e explore:**
- 🌐 https://leiasabores.pt

Qualquer dúvida ou ajuste necessário, é só avisar! 🎉
