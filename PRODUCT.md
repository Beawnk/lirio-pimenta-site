# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primário — Lírio, dono da loja (único administrador).** Confirmado em
2026-09-05:

- Conforto com tecnologia **baixo**: usa WhatsApp e pouco mais. Não se pode
  assumir que ele reconheça padrões comuns de painel (ícone sem rótulo, menu
  de contexto, tabela com ações escondidas, jargão de CRUD).
- Usa o painel **do computador da loja e do celular, sem padrão** — cadastra
  no desktop quando sobra tempo, corrige pelo celular quando lembra. Nenhuma
  tarefa pode existir só em um dos dois.
- Trabalha **interrompido**: administra entre atendimentos, no balcão.
- As fotos dos produtos saem do **celular dele**, frequentemente na vertical.

**Secundário — o visitante do catálogo público.** Cliente de Viamão/RS
procurando um produto ou um serviço da loja. Não tem conta, não paga nada no
site, não vê preço. O trabalho dele é encontrar o item e chegar ao WhatsApp
com o pedido pronto. Tende a ser **mais velho** e a acessar de **celular
simples com conexão instável** (confirmado em 2026-09-05).

## Product Purpose

Catálogo online da Lírio Pimenta, loja de variedades física em Viamão/RS.
O site existe para que o cliente encontre o que a loja tem e inicie a conversa
já qualificada no WhatsApp — não para vender online.

A rodada atual (Fase B) dá ao site seu primeiro backend real (Supabase:
Postgres + Auth + Storage) e um painel administrativo, para que o Lírio
mantenha produtos, categorias e banners sozinho.

Sucesso tem duas metades:

1. O Lírio cadastra, edita e arquiva um item sozinho pelo painel, sem
   intervenção de um dev.
2. O visitante sai do site com uma mensagem de pedido pronta no WhatsApp.

## Positioning

A loja está ao lado de Viamão há mais de 40 anos, e o preço é o que se
negocia no balcão. O site não tenta ser uma vitrine de e-commerce menor: ele
transporta o atendimento de balcão para a tela e devolve a conversa para uma
pessoa que conhece o cliente.

O mecanismo que um concorrente genérico não copia honestamente: **o pedido
chega ao vendedor formatado, mas sem preço fechado** — a etapa que um
checkout eliminaria é exatamente a etapa que dá valor a essa loja.

## Operating Context

- **Loja física**: Rua Ramiro Barcelos, 84 — Centro, Viamão/RS. Segunda a
  sábado; domingo fechado (tabela oficial em `app/data/store-info.js`).
  Endereço, horário e mapa são informação de primeira classe na interface,
  não rodapé.
- **Canal de fechamento**: WhatsApp `5551998073190`. Todo caminho do site
  termina lá, com mensagem pronta.
- **Serviços da loja** — conserto de relógio, canecas e canetas
  personalizadas, tabacaria com reposição semanal, água mineral/galão — vivem
  nos banners do topo, cada um com sua própria mensagem de WhatsApp. Não são
  produtos de catálogo e não entram no carrinho, porque se orçam conversando.
- **Fluxo de imagem**: foto tirada no celular, comprimida, reorientada por
  EXIF e redimensionada **no navegador**, e só então enviada ao Storage. O
  arquivo original nunca sobe.
- **Uso do painel**: sessões curtas, interrompidas, alternando entre desktop
  do balcão e celular.
- **Publicação**: Cloudflare Pages. O site está deliberadamente fora de busca
  (`noindex` + `Disallow: /` + `SITE_URL` vazia) até a virada para o domínio
  definitivo.

## Capabilities and Constraints

**Regras de negócio que são o produto (código que as viola está errado):**

- Produto **não exibe preço** em lugar nenhum da interface pública. O campo
  existe no banco e não é retornado na consulta pública.
- **Sem checkout, pagamento, frete ou gateway.** O carrinho termina num link
  de WhatsApp com texto formatado.
- Item indisponível é **arquivado, nunca deletado**. Não existe controle de
  quantidade em estoque; disponibilidade é binária.
- **Serviço não entra no carrinho.** Só item físico.
- **Cliente não faz login.** Carrinho e favoritos vivem em `localStorage`
  (`lp_cart`, `lp_favs`). Autenticação existe só para o Lírio, no painel.
- **Loja local.** Clientes e entregas restritos a Viamão/RS.

**Restrições técnicas confirmadas:**

- Escala esperada: ~500 produtos em ~10 categorias.
- Painel de **conta única** (só o Lírio); RLS do Supabase impede escrita
  pública nas tabelas de produto, categoria e banner.
- Site permanece estático no Cloudflare Pages; Supabase é consumido
  client-side, sem servidor Node próprio.
- Dado de fonte assíncrona (`localStorage` hoje, fetch do Supabase na Fase B)
  só pode entrar no estado depois de `app:suspense:resolve` — antes disso a
  hidratação não terminou e o Vue não corrige diferença de `class` entre
  servidor e cliente.
- Ícones são componentes curados no próprio repositório (desenhos do Lucide,
  MIT, copiados). Não se instala biblioteca de ícone. Não existe emoji na
  interface.

**Terminologia do produto** (usar essas palavras na interface, em português):
"arquivar" (nunca "excluir" para item que continua no banco), "disponível",
"novidade", "categoria", "banner".

**Fatos de produto explicitamente em aberto — não inventar:**

- Domínio definitivo (`.com.br`) ainda não existe; `SITE_URL` fica vazia até lá.
- URL do Facebook não confirmada com o Lírio (`FACEBOOK_URL` vazia).
- Coordenadas (lat/long) da loja não são conhecidas — o campo `geo` do JSON-LD
  fica de fora de propósito.

## Brand Commitments

- **Nome e identidade**: Lírio Pimenta, loja de variedades, mais de 40 anos ao
  lado de Viamão. Instagram `@lojaliriopimenta`.
- **Voz**: direta, acolhedora, de balcão. Português do Brasil, tratamento por
  "você", frases curtas. Sem linguagem de marketplace.
- **Design system existente é compromisso, não sugestão**: o azul
  `--blue-700 #0f5c8c` e o dourado `--gold-500 #f5c542` vêm da fachada real da
  loja; tipografia Poppins (display) + Inter (texto); tokens em
  `app/assets/scss/_tokens.scss`. Não se reescreve esse mundo visual sem
  decisão explícita.
- **Assets**: logo em `public/img/logo.png`; fotos reais da fachada, do
  interior, da tabacaria e da loja em `public/img/`.

## Evidence on Hand

**Existe e pode ser usado:**

- Fotos reais da loja: `public/img/` (fachada, fachada2, interior, interior2,
  tabacaria, pilhas, pessoas, presentes2, agua) — formatos mistos, alguns
  ainda `.jfif`, a servir como `.webp`.
- Dados oficiais de contato, endereço e horário: `app/data/store-info.js`.
- Referência de origem do design: `demo/demo-portatil/index.html` (~1700
  linhas, não é código de produção e não se edita).
- Planejamento da Fase B: `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`
  (44 requisitos v1), `.planning/ROADMAP.md` (6 fases).

**Ausências que trabalhos futuros não devem preencher com invenção:**

- Não existe **nenhuma foto de produto real** ainda. Os 18 produtos em
  `app/data/products.js` são dados de demonstração e não migram para o banco —
  o Supabase começa vazio.
- Não existe depoimento, avaliação, nota, número de vendas, número de clientes
  ou prêmio. Nada disso pode ser fabricado como prova social.
- Não existe página do Facebook confirmada, nem domínio próprio, nem
  coordenadas de mapa.

## Product Principles

1. **O site qualifica a conversa, não a substitui.** Todo caminho leva a uma
   pessoa no WhatsApp. Qualquer coisa que finja fechar a venda (total, "pedido
   confirmado", passo de sucesso) é falsa e sai.
2. **O painel é para uma pessoa não técnica, interrompida no balcão.** Um
   caminho por tarefa, rótulo em texto sempre, confirmação antes do que
   assusta, e nenhuma tarefa exclusiva de um dispositivo.
3. **Nada é destruído.** Arquivar é a operação padrão; apagar de verdade é
   exceção, exige que não haja nada dependendo, e vem com aviso e desfazer.
4. **Peso de página é restrição de público, não otimização.** O visitante está
   num celular simples com conexão instável; imagem e JavaScript entram no
   orçamento antes de entrarem na tela.
5. **O dado da loja tem uma fonte só.** Telefone, endereço, horário e catálogo
   nunca são escritos direto num componente.

## Accessibility & Inclusion

Não há norma formal contratada, mas duas necessidades concretas foram
confirmadas em 2026-09-05 e valem como requisito de produto, não preferência:

- **Público mais velho**: alvos de toque generosos (≥44px), hierarquia óbvia,
  nada de informação essencial em texto pequeno, contraste acima do mínimo.
- **Celular simples e conexão instável**: a interface precisa ser legível e
  utilizável antes de tudo carregar; imagem responsiva e comprimida é
  obrigação, não polimento.

Padrão de trabalho do projeto: contraste AA, navegação por teclado, foco
visível, e no painel nenhum ícone sem rótulo de texto.
