# Roadmap: Lírio Site — Fase B

## Overview

Fase B tira o catálogo do arquivo estático e coloca no Supabase, com um painel para o
Lírio administrar sozinho. A ordem das fases segue o risco: primeiro se prova que a stack
inteira funciona de ponta a ponta numa única tabela (categorias) — autenticação, banco,
storage com imagem comprimida e RLS de verdade, não só escondida na interface. Só depois
disso provado é que o resto é construído em cima: o resto da gestão de categorias, o
cadastro e a organização de produtos, os banners do topo, e por fim a migração do
catálogo público para ler do Supabase — a etapa de maior risco de repetir o bug de
hidratação que este projeto já viu duas vezes, por isso fica por último, quando o
padrão de leitura já está validado pelo próprio painel.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Fundação — Acesso e Primeira Categoria** - Lírio loga no painel e cadastra a primeira categoria (com imagem comprimida) direto no Supabase, provando toda a stack de ponta a ponta
- [ ] **Phase 2: Categorias — Ciclo de Vida Completo** - Lírio reordena, arquiva em massa (com aviso e desfazer) e apaga categorias com segurança
- [ ] **Phase 3: Produtos — Cadastro e Edição** - Lírio cadastra e edita produtos reais, com feedback claro de sucesso ou erro
- [ ] **Phase 4: Produtos — Lista e Organização** - Lírio encontra e organiza qualquer produto num catálogo de centenas de itens
- [ ] **Phase 5: Banners do Topo** - Lírio cria e mantém os banners do carrossel sozinho, usando templates prontos
- [ ] **Phase 6: Catálogo Público no Supabase** - O site público passa a refletir o Supabase em tempo real, sem preço vazando e sem quebrar a hidratação

## Phase Details

### Phase 1: Fundação — Acesso e Primeira Categoria
**Goal**: Lírio consegue entrar no painel autenticado e cadastrar sua primeira categoria completa (com imagem comprimida) diretamente no Supabase, provando que autenticação, banco, storage e RLS funcionam de ponta a ponta antes de construir qualquer coisa em cima.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, CAT-01, CAT-02, DATA-02, DATA-03, DATA-04, IMG-01, IMG-02, IMG-03, IMG-05
**Success Criteria** (what must be TRUE):
  1. Lírio entra no painel com e-mail e senha, continua logado depois de recarregar a página, e sai do painel a partir de qualquer tela do admin.
  2. Visitante sem sessão que tenta acessar qualquer rota `/admin` cai direto na tela de login, sem nunca ver a interface do painel.
  3. Lírio cria e edita uma categoria (nome, descrição, ícone e imagem) e os dados ficam gravados no Supabase; a foto do celular sobe comprimida, redimensionada e na orientação correta, sem travar a tela enquanto processa.
  4. Lírio salva uma categoria sem imagem e adiciona a foto depois, sem que isso bloqueie o cadastro.
  5. Uma tentativa anônima de ler/escrever na tabela `categories` ou de subir/remover um arquivo no Storage é recusada pelo Postgres, mesmo com o bucket de leitura pública — confirmando que a proteção está no banco, não só na interface.
**Plans**: TBD
**UI hint**: yes

### Phase 2: Categorias — Ciclo de Vida Completo
**Goal**: Lírio administra o ciclo de vida completo das categorias pelo painel — reordenar, arquivar em massa com aviso e desfazer, e apagar em definitivo quando seguro.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: CAT-03, CAT-04, CAT-05, CAT-06, CAT-07
**Success Criteria** (what must be TRUE):
  1. Lírio reordena as categorias e a nova ordem aparece na barra de categorias do site público.
  2. Lírio arquiva uma categoria junto com todos os produtos dela, vendo antes um aviso com a contagem exata de produtos afetados.
  3. Lírio desfaz esse arquivamento em massa e vê restaurados exatamente os produtos que aquela ação arquivou — nenhum a mais.
  4. Lírio tenta apagar uma categoria com produtos ativos, recebe uma explicação clara do motivo e a opção de arquivamento em massa em vez disso.
  5. Lírio apaga permanentemente uma categoria que não tem nenhum produto ativo.
**Plans**: TBD
**UI hint**: yes

### Phase 3: Produtos — Cadastro e Edição
**Goal**: Lírio cadastra e edita produtos reais no catálogo, com feedback claro de sucesso ou erro.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: PROD-01, PROD-02, PROD-09, PROD-10, IMG-04
**Success Criteria** (what must be TRUE):
  1. Lírio cadastra um produto com nome, categoria, descrição, disponibilidade, preço interno e marcação de novidade, e ele é gravado no Supabase.
  2. Lírio edita qualquer campo de um produto existente, incluindo trocar a imagem por outra.
  3. A marcação de novidade é calculada automaticamente pela data de cadastro, e o Lírio pode forçar ligado ou desligado num produto específico.
  4. Lírio recebe confirmação de sucesso ou uma mensagem de erro clara ao salvar um produto, usando o toast que já existe no projeto.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Produtos — Lista e Organização
**Goal**: Lírio encontra e organiza qualquer produto dentro de um catálogo de centenas de itens, sem esperar carregar tudo de uma vez.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: PROD-03, PROD-04, PROD-05, PROD-06, PROD-07, PROD-08
**Success Criteria** (what must be TRUE):
  1. Lírio navega uma lista de produtos paginada, sem carregar os ~500 registros de uma vez.
  2. Lírio busca um produto por nome e filtra a lista por categoria.
  3. Lírio alterna a lista entre produtos ativos e arquivados, e arquiva/desarquiva um produto — o produto arquivado some do catálogo público mas continua no banco.
  4. Lírio duplica um produto existente, abrindo o formulário já preenchido com os dados do original para ajustar antes de salvar.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Banners do Topo
**Goal**: Lírio cria e mantém os banners do topo do site sozinho, usando templates prontos, sem depender de um dev para trocar uma promoção.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: BAN-01, BAN-02, BAN-03, BAN-04, BAN-05, BAN-06, BAN-07, DATA-01
**Success Criteria** (what must be TRUE):
  1. Lírio cria um banner escolhendo um template — Serviço, Categoria ou A loja — e o template já define os botões, tipos e estilos prontos.
  2. Lírio preenche o conteúdo do banner (rótulo, eyebrow, título, texto, imagem) e edita o rótulo/mensagem de WhatsApp de cada botão sem mexer no tipo ou estilo dele.
  3. No template Categoria, Lírio escolhe qual categoria o botão "Ver no catálogo" abre.
  4. Lírio edita um banner existente, reordena os banners — a ordem se reflete no carrossel do site — e arquiva/desarquiva um banner.
  5. Com as tabelas `products`, `categories` e `banners` todas existindo com RLS habilitada, uma escrita anônima em qualquer uma delas continua sendo recusada pelo Postgres.
**Plans**: TBD
**UI hint**: yes

### Phase 6: Catálogo Público no Supabase
**Goal**: O catálogo público (produtos, categorias e banners) reflete o que está no Supabase em tempo real, sem preço vazando e sem quebrar a hidratação.
**Mode:** mvp
**Depends on**: Phase 5
**Requirements**: PUB-01, PUB-02, PUB-03, PUB-04, PUB-05, PUB-06, DATA-05
**Success Criteria** (what must be TRUE):
  1. O catálogo público (produtos e categorias) e o carrossel de banners do topo passam a ler do Supabase em vez de `app/data`.
  2. Um hard refresh com o console aberto não mostra nenhum aviso de mismatch de hidratação.
  3. Uma alteração feita no painel (produto, categoria ou banner) aparece no site público sem precisar de novo build ou deploy.
  4. Busca, filtros, favoritos e carrinho continuam funcionando normalmente com os dados vindos do Supabase, e o preço do produto nunca chega na resposta pública.
  5. O site e o painel mostram estados vazios sensatos quando ainda não há produto, categoria ou banner cadastrado.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fundação — Acesso e Primeira Categoria | 0/TBD | Not started | - |
| 2. Categorias — Ciclo de Vida Completo | 0/TBD | Not started | - |
| 3. Produtos — Cadastro e Edição | 0/TBD | Not started | - |
| 4. Produtos — Lista e Organização | 0/TBD | Not started | - |
| 5. Banners do Topo | 0/TBD | Not started | - |
| 6. Catálogo Público no Supabase | 0/TBD | Not started | - |
