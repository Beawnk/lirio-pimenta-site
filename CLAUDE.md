# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Lírio Site

Site catálogo da loja de variedades **Lírio Pimenta**, em Viamão/RS.

**Não é e-commerce.** O visitante navega o catálogo, monta um carrinho e é levado ao
WhatsApp do vendedor com a mensagem do pedido pronta. Não existe checkout, pagamento,
frete nem conta de cliente.

---

## Regras de negócio (leia antes de escrever qualquer código)

Estas regras não são preferência, são o produto. Código que as viola está errado.

1. **Produto não exibe preço.** Nunca. O campo `price` existe no banco mas não vai
   para a interface pública. Preço se negocia no WhatsApp.
2. **Sem checkout e sem pagamento.** O carrinho termina num link de WhatsApp com
   texto formatado. Não sugira Stripe, Mercado Pago, cálculo de frete nem gateway.
3. **Produto indisponível é arquivado, não deletado.** Some do catálogo público,
   continua no banco. Não existe controle de quantidade em estoque.
4. **Serviços não entram no carrinho.** Conserto de relógio, canecas e canetas
   personalizadas aparecem em banners informativos com CTA para o WhatsApp, com
   mensagem própria. Só item físico vai para o carrinho.
5. **Cliente não faz login.** Carrinho e favoritos vivem em `localStorage`
   (`lp_cart`, `lp_favs`). Auth existe só para o Lírio, no painel admin.
6. **Loja local.** Clientes e entregas restritos a Viamão/RS. Endereço, horário e
   mapa são informação de primeira classe, não rodapé.

Escala esperada: ~500 produtos em ~10 categorias. As imagens vêm do celular do Lírio,
então **toda imagem é comprimida e redimensionada no navegador antes do upload**.
Nunca envie o arquivo original para o Storage.

---

## Stack

- **Nuxt 4** + Vue 3 com Composition API e `<script setup>`
- **JavaScript** no código de aplicação (`app/**`). Os arquivos de config (`nuxt.config.ts`,
  `vitest.config.js`) e o `tsconfig.json` vêm do scaffold e continuam como estão.
- **Pinia** para estado
- **SCSS** (`sass-embedded`) com variáveis CSS — o design já existe, veja "Design" abaixo
- **Supabase** (Postgres + Auth + Storage) — só na Fase B
- **Vitest** para testes
- Deploy no **Cloudflare Pages** (preset `cloudflare-pages` do Nitro)

Nada de Vercel: o plano gratuito proíbe uso comercial.

---

## Comandos

```bash
npm run dev        # desenvolvimento em http://localhost:3000
npm run build      # build de produção
npm run generate   # site estático
npm run preview    # preview do build
npm run lint       # ESLint
npm run lint:fix   # ESLint com --fix
npm run test       # Vitest, uma passada
npm run test:watch # Vitest em watch
```

Um arquivo de teste só, ou um caso só:

```bash
npx vitest run tests/cart.test.js
npx vitest run tests/cart.test.js -t "remove item"
```

---

## Estado atual do repositório

A Fase A está portada: casca, seções da home, carrossel de banners, catálogo (busca,
filtros, favoritos, ordenação, modal), carrinho → WhatsApp e ícones SVG no lugar dos
emojis.

**O padrão do projeto:** regra de negócio vira função pura em `app/composables/`
(`useCatalog.js`, `useCart.js`) — sem Vue dentro, testada direto em `tests/`. O store
Pinia é casca fina: guarda o estado reativo, salva no `localStorage` e delega as regras.
Quatro stores: `ui` (painel aberto + trava de scroll), `catalog`, `favorites`, `cart`.

**Armadilha de SSR que já mordeu duas vezes:** o que vem do `localStorage` só pode
entrar no store depois de `app:suspense:resolve` (veja `app/plugins/cart.client.js`).
Antes disso a hidratação ainda não terminou, e o Vue não corrige diferença de `class`
entre servidor e cliente — o elemento fica com a classe errada para sempre.

```
app/
├── components/     # PascalCase.vue
├── composables/    # useAlgumaCoisa.js
├── data/           # catálogo estático e dados da loja (Fase A)
├── layouts/        # default.vue
├── pages/          # kebab-case
├── stores/         # Pinia
└── assets/scss/    # tokens, reset e classes compartilhadas
```

Estilo compartilhado (`.btn`, `.container`, `.section`, `.badge`, tokens) fica no
`main.scss`; o resto vive no `<style lang="scss" scoped>` do componente. Um pai que
precise estilizar dentro de um filho usa `:deep()`.

---

## A demo é a especificação

`demo/demo-portatil/index.html` (~1700 linhas) é o site inteiro num arquivo só: design
system, markup e lógica. **Não é código de produção e não deve ser editado** — é a fonte
de onde a versão Nuxt sai. Três blocos:

1. **`<style>`** — design system em `:root`, ~600 linhas de CSS pronto.
2. **Markup** — as seções na ordem: hero, barra de categorias, grade de categorias,
   novidades, catálogo com filtros, presentes, história, loja (endereço + horário),
   Instagram, rodapé; mais drawers (carrinho, filtros) e modais (produto, checkout).
3. **`<script>`** — dados e toda a lógica, sem framework.

### O que vale migrar em vez de reescrever

| No `index.html` | O que faz |
|---|---|
| `buildOrderMsg()` (~L1519) | Monta a mensagem do pedido em Markdown do WhatsApp — o coração do produto |
| `waLink(msg)` (~L1425) | `https://wa.me/${WHATSAPP}?text=` + `encodeURIComponent` |
| `applyFilters()` (~L1242) | Busca, categoria, disponível, novidades, favoritos, ordenação |
| `addToCart` / `setQty` / `removeFromCart` / `saveCart` (~L1312) | Carrinho + persistência em `localStorage` |
| `renderHours()` (~L1547) | Calcula aberto/fechado a partir da tabela `HOURS` |

### Modelo de dados a preservar

- `PRODUCTS`: `{ id, name, cat, img, price, avail, isNew, desc }` — 18 itens de exemplo,
  todos com `price: null`. `cat` é o **nome** da categoria, não um id.
- `CATEGORIES`: `{ name, emoji, img, desc }` — 8 categorias. Na versão Nuxt virou
  `{ name, icon, image, desc }`: `emoji` deu lugar à chave de <AppIcon>, e `img` a `image`.
- `GIFT_CHIPS`: atalhos "Para ela", "Para crianças"… que caem numa categoria.
- `IMAGES`: mapa de chave lógica (`fachada`, `pilhas`, `logo`…) → caminho do arquivo.
  Os componentes devem receber a chave, não o caminho.

### Constantes oficiais (`index.html` ~L1073)

WhatsApp `5551998073190` · Fixo `+555130463033` · Rua Ramiro Barcelos, 84 — Centro,
Viamão/RS · Instagram `@lojaliriopimenta`. `FACEBOOK_URL` ainda é placeholder — não
invente uma URL.

### Design

Reaproveite o CSS existente. **Não reescreva o design e não proponha Tailwind.**

- Cores: azul da fachada `--blue-700 #0f5c8c`, dourado `--gold-500 #f5c542`, escala de
  cinzas `--ink-*`, fundos `--bg`, `--bg-soft`, `--bg-tint`.
- Tipografia: Poppins (display) + Inter (texto).
- Escalas: `--sp-1..9`, `--r-sm..pill`, `--sh-1..3`, `--container: 1220px`.

Exceção já resolvida: **não existe mais emoji na interface.** Categorias, gift chips,
estados vazios, badges e os glifos de controle (fechar, etapa, quantidade, setas) são
ícones SVG.

**Ícone é componente, não biblioteca.** Cada um é um `Icon*.vue` de poucas linhas em
`app/components/`, sempre `viewBox="0 0 24 24"`, `stroke="currentColor"`, `stroke-width="2"`
e **sem width/height** — quem consome dimensiona pelo CSS. Os desenhos vêm do Lucide
(MIT), copiados para o repositório: não instale `lucide-vue-next` nem `@nuxt/icon`.
Quando o ícone é fixo no template, use `<IconGift />` direto; quando vem de dado, o dado
guarda uma chave de texto (`icon: 'gift'`) e `<AppIcon :name="..." />` resolve — assim
`app/data/` continua sem conhecer Vue.

---

## Dívidas conhecidas da demo

- **Filtro de faixa de preço está quebrado** — filtra por `p.price`, mas todos os produtos
  têm `price: null`, então qualquer faixa devolve zero resultados. Remover o bloco de
  filtro **e** o checkbox "Com preço definido" junto.
- **O checkout de 5 etapas simula um pedido** ("Pedido preparado!", total, revisão). Na
  versão Nuxt isso encolhe: carrinho → dados mínimos → WhatsApp. Sem passo de sucesso falso.
- **A "prévia do painel administrativo"** mostra Pedidos, Clientes, Vendas e Mensagens —
  nada disso está no escopo. Não implemente.
- **Imagens**: já saíram do base64 para `demo/demo-portatil/img/`, mas `IMAGES` aponta para
  `fachada.webp` e `fachada2.webp`, que não existem — os arquivos são `.jfif`. Converter na
  portagem, e servir tudo como `.webp` em `public/`.

---

## Convenções

- Componentes em `PascalCase`; arquivos de página e pastas em `kebab-case`.
- Composition API com `<script setup>`. Nunca Options API.
- Funções e variáveis em inglês; **todo texto visível ao usuário em português**.
- SCSS com as variáveis existentes. Sem estilo inline, sem CSS-in-JS.

## Testes

Vitest, cobrindo só o que quebra dinheiro:

- lógica do carrinho (adicionar, remover, quantidade, persistência)
- montagem da mensagem do WhatsApp (`buildOrderMsg`)
- filtros e busca do catálogo

Não precisa testar componente de apresentação.

---

## Fases do projeto

- **Fase A** — site público: catálogo, busca, categorias, carrossel de banners,
  carrinho → WhatsApp. Dados em arquivo estático, sem banco.
- **Fase B** — Supabase + painel administrativo: CRUD de produto, upload de imagem
  com compressão, arquivar/desarquivar, categorias.
- **Fase C** — importação por planilha, carga dos ~500 produtos, treinamento.

**Estamos na Fase A.** Não construa nada da Fase B sem eu pedir.

---

## Como quero trabalhar com você

- **Antes de escrever código, explique o plano e espere aprovação.** Sempre.
- Uma tarefa por vez. Se a tarefa tem mais de ~5 passos, avise e proponha dividir.
- **Não refatore arquivo que não faz parte da tarefa atual.**
- **Não instale dependência nova sem perguntar antes**, com uma justificativa curta.
- **Nunca edite arquivos `.env`.**
- **Nunca faça commit ou push sem eu pedir explicitamente.**
- Quando houver mais de um caminho razoável, apresente 2 ou 3 com prós e contras e
  uma recomendação — não decida sozinho.
- Se eu propuser algo que tem falha, diga diretamente em vez de só concordar.
- Explique o *porquê* das decisões importantes. Estou usando este projeto para
  aprender, não só para entregar.
