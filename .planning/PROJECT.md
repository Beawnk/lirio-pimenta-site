# Lírio Site — Fase B

## What This Is

Site catálogo da loja de variedades Lírio Pimenta (Viamão/RS), hoje 100% estático (Fase A
portada). Esta rodada dá ao site seu primeiro backend real: Supabase (Postgres + Auth +
Storage) substitui `app/data/` como fonte de verdade, e um painel administrativo permite
que o Lírio cadastre, edite e arquive produtos e categorias sozinho — sem depender de um
dev para cada mudança no catálogo. O visitante continua só navegando o catálogo e fechando
o pedido pelo WhatsApp: sem preço, sem checkout, sem conta de cliente.

## Core Value

O Lírio consegue manter o catálogo (produtos e categorias) sozinho pelo painel, sem
precisar de um dev a cada alteração.

## Business Context

- **Customer**: Lírio (dono da loja) usa o painel administrativo; o cliente final usa o catálogo público — não paga nada no site.
- **Revenue model**: Venda física/balcão, negociada via WhatsApp depois do contato pelo site. O site não processa pagamento.
- **Success metric**: Lírio cadastra, edita e arquiva um produto sozinho pelo painel, sem intervenção de um dev.
- **Strategy notes**: —

## Requirements

### Validated

- ✓ Catálogo público com busca, filtros, favoritos e ordenação — existing (Fase A)
- ✓ Carrinho monta pedido e finaliza via link de WhatsApp, sem checkout/pagamento — existing (Fase A)
- ✓ Produto nunca exibe preço na interface pública — existing (Fase A)
- ✓ Design system em SCSS + ícones SVG (Lucide) compartilhados entre componentes — existing (Fase A)

### Active

- [ ] Painel administrativo autenticado, conta única (só o Lírio), via Supabase Auth
- [ ] CRUD de produto no painel, gravando em Postgres via Supabase
- [ ] Upload de imagem de produto comprimida/redimensionada no navegador antes de ir pro Storage
- [ ] Produto "indisponível" é arquivado (some do catálogo público), nunca deletado
- [ ] CRUD completo de categorias pelo painel (criar, editar, reordenar, remover)
- [ ] Catálogo público (busca, filtros, categorias) passa a ler do Supabase em vez de `app/data/`

### Out of Scope

- Migrar os ~18 produtos de exemplo da Fase A para o Supabase — são dados de demonstração; o banco começa vazio e o Lírio cadastra os produtos reais do zero
- Múltiplas contas ou permissões no painel — só o Lírio administra, por enquanto
- Checkout, pagamento ou cálculo de frete — não é e-commerce; negociação continua no WhatsApp
- Controle de quantidade em estoque — não existe no modelo de negócio; produto indisponível é arquivado, não zerado
- Importação por planilha e carga dos ~500 produtos reais — isso é Fase C

## Context

- O site é hoje 100% estático (Nuxt 4, preset `cloudflare-pages`, Nitro `static`, sem
  server-side code). A Fase B introduz o primeiro backend real do projeto — Supabase
  consumido via SDK client-side, sem precisar de servidor Node próprio.
- Padrão já estabelecido no projeto (ver `.planning/codebase/ARCHITECTURE.md`): regra de
  negócio em composables puros (`app/composables/`), sem Vue dentro; store Pinia é casca
  fina que só guarda estado reativo e persiste. As novas regras da Fase B (produtos,
  upload de imagem, categorias) devem seguir o mesmo padrão.
- Armadilha de SSR já documentada e conhecida do projeto: dado de fonte assíncrona só pode
  entrar no estado depois de `app:suspense:resolve` — hoje vale pra `localStorage`
  (carrinho/favoritos), e vai valer também pro fetch inicial do catálogo via Supabase.
- Imagens vêm do celular do Lírio — toda imagem precisa ser comprimida e redimensionada no
  navegador antes do upload; nunca enviar o arquivo original para o Storage.
- Escala esperada do catálogo real: ~500 produtos em ~10 categorias (carga em massa fica
  pra Fase C — aqui só entra a capacidade de cadastrar).
- Site está de propósito fora de busca (`noindex`) até a virada de domínio — não é algo
  que a Fase B precisa resolver.

## Constraints

- **Tech stack**: Supabase (Postgres + Auth + Storage) — já decidido no CLAUDE.md do projeto, sem outras opções em consideração
- **Deploy**: Continua no Cloudflare Pages; Supabase é client-side, não exige servidor Node próprio nem muda o preset `static`
- **Segurança**: Só o Lírio autentica no painel; regras de RLS do Supabase devem impedir escrita pública nas tabelas de produto/categoria
- **Convenção**: Toda lógica de negócio nova segue o padrão já em uso — composable puro testável → store Pinia fina

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Banco começa vazio; produtos de exemplo da Fase A não migram | São dados de demonstração, não produtos reais da loja | — Pending |
| Painel é de conta única (só o Lírio) | Só ele administra a loja; sem necessidade de multi-usuário agora | — Pending |
| Catálogo público migra pro Supabase junto com o painel, não em fase separada | Evita manter duas fontes de verdade (estático + banco) ao mesmo tempo | — Pending |
| Categorias ganham CRUD completo no painel | Lírio quer poder ajustar categorias sem precisar de um dev | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-29 after initialization*
