# Requirements: Lírio Site — Fase B

**Defined:** 2026-08-29
**Core Value:** O Lírio consegue manter o catálogo (produtos e categorias) sozinho pelo painel, sem precisar de um dev a cada alteração.

## v1 Requirements

Requisitos da Fase B. Cada um mapeia para uma fase do roadmap.

### Autenticação

- [ ] **AUTH-01**: Lírio entra no painel com e-mail e senha (conta única, criada manualmente no Supabase)
- [ ] **AUTH-02**: Qualquer rota `/admin/**` exige sessão válida; sem sessão, o visitante é levado para o login sem nunca ver a interface do painel
- [ ] **AUTH-03**: A sessão persiste entre recarregamentos — o Lírio não precisa logar de novo a cada refresh
- [ ] **AUTH-04**: Lírio sai do painel (logout) de qualquer página do admin

### Dados e Segurança

- [ ] **DATA-01**: Tabelas `products`, `categories` e `banners` existem no Supabase com RLS habilitada na mesma migração que as cria
- [ ] **DATA-02**: Visitante não autenticado só lê registros não arquivados — a exclusão de arquivados acontece na política do banco, não só no filtro do front
- [ ] **DATA-03**: Só a conta do Lírio escreve nas tabelas — verificado disparando insert/update/delete com o anon key e confirmando que o Postgres recusa
- [ ] **DATA-04**: Upload e remoção no Storage exigem sessão autenticada, mesmo com o bucket público para leitura
- [ ] **DATA-05**: O preço do produto nunca chega ao site público — não é retornado na consulta pública

### Categorias

- [ ] **CAT-01**: Lírio cria uma categoria com nome, descrição, imagem e um ícone escolhido da lista de ícones que já existem no projeto
- [ ] **CAT-02**: Lírio edita qualquer campo de uma categoria existente
- [ ] **CAT-03**: Lírio reordena as categorias, e a nova ordem aparece na barra de categorias do site público
- [ ] **CAT-04**: Lírio arquiva uma categoria junto com todos os produtos dela, depois de um aviso que diz exatamente quantos produtos serão arquivados
- [ ] **CAT-05**: Lírio desfaz o arquivamento em massa, restaurando exatamente os produtos que aquela ação arquivou (e nenhum que já estava arquivado antes)
- [ ] **CAT-06**: Lírio não consegue apagar uma categoria que ainda tem produtos não arquivados; a interface explica o motivo e oferece o arquivamento em massa como saída
- [ ] **CAT-07**: Lírio apaga permanentemente uma categoria que não tem nenhum produto não arquivado

### Produtos

- [ ] **PROD-01**: Lírio cadastra um produto com nome, categoria, descrição, disponibilidade, preço interno e marcação de novidade
- [ ] **PROD-02**: Lírio edita qualquer campo de um produto existente
- [ ] **PROD-03**: Lírio navega a lista de produtos paginada, sem carregar os ~500 registros de uma vez
- [ ] **PROD-04**: Lírio busca produto por nome na lista do painel
- [ ] **PROD-05**: Lírio filtra a lista do painel por categoria
- [ ] **PROD-06**: Lírio alterna a lista entre produtos ativos e arquivados, para que arquivar não esconda o produto dele também
- [ ] **PROD-07**: Lírio arquiva e desarquiva um produto; arquivado some do catálogo público e continua no banco
- [ ] **PROD-08**: Lírio duplica um produto existente, abrindo o formulário já preenchido com os dados do original para ajustar antes de salvar
- [ ] **PROD-09**: Um produto é marcado como novidade automaticamente pela data de cadastro, e o Lírio pode forçar ligado ou desligado num produto específico
- [ ] **PROD-10**: Lírio recebe confirmação de sucesso ou mensagem de erro clara ao salvar, usando o sistema de toast que já existe

### Imagens

- [ ] **IMG-01**: Toda imagem é redimensionada e comprimida no navegador antes de subir para o Storage — o arquivo original do celular nunca é enviado
- [ ] **IMG-02**: Foto tirada na vertical pelo celular sobe e aparece na orientação correta (orientação EXIF aplicada antes da compressão)
- [ ] **IMG-03**: Lírio salva um produto sem imagem e adiciona a imagem depois — o upload não bloqueia o cadastro
- [ ] **IMG-04**: Lírio troca a imagem de um produto ou categoria já cadastrado
- [ ] **IMG-05**: A interface mostra o estado do upload e não congela enquanto comprime uma foto grande

### Banners

- [ ] **BAN-01**: Lírio cria um banner escolhendo um template — Serviço, Categoria ou A loja — e o template já define os botões, seus tipos e estilos
- [ ] **BAN-02**: Lírio preenche o conteúdo do banner: rótulo da aba, eyebrow, título, texto e imagem
- [ ] **BAN-03**: Lírio edita o rótulo de cada botão e a mensagem de WhatsApp que ele dispara, sem mexer no tipo nem no estilo do botão
- [ ] **BAN-04**: No template Categoria, Lírio escolhe qual categoria o botão "Ver no catálogo" abre
- [ ] **BAN-05**: Lírio edita o conteúdo de um banner existente
- [ ] **BAN-06**: Lírio reordena os banners, e a ordem se reflete no carrossel do topo do site
- [ ] **BAN-07**: Lírio arquiva e desarquiva um banner; arquivado some do carrossel público e continua no banco

### Catálogo Público

- [ ] **PUB-01**: O catálogo público (produtos e categorias) lê do Supabase em vez de `app/data/`
- [ ] **PUB-02**: O carrossel de banners do topo lê do Supabase
- [ ] **PUB-03**: O carregamento inicial dos dados não quebra a hidratação — hard refresh com console aberto não gera nenhum aviso de mismatch
- [ ] **PUB-04**: Uma alteração feita no painel aparece no site público sem precisar de novo build ou deploy
- [ ] **PUB-05**: Busca, filtros, favoritos e carrinho continuam funcionando com os dados vindos do Supabase
- [ ] **PUB-06**: O site e o painel mostram estados vazios sensatos enquanto não há produto, categoria ou banner cadastrado

## v2 Requirements

Reconhecidos, mas fora do roadmap atual.

### Produtividade do painel

- **BULK-01**: Arquivar vários produtos de uma vez a partir da lista
- **BULK-02**: Reatribuir a categoria de vários produtos de uma vez
- **DRAFT-01**: Autosave de rascunho no formulário de produto
- **PREV-01**: Prévia do card do produto enquanto edita

### Conta

- **AUTH-05**: Recuperação de senha por e-mail dentro do próprio site

### Conteúdo

- **GAL-01**: Galeria de múltiplas imagens por produto (exige mudança de schema)

### Carga de dados

- **IMPORT-01**: Importar produtos por planilha, para a carga dos ~500 itens reais (originalmente pensado como Fase C)

## Out of Scope

Excluído explicitamente, com o motivo, para não voltar por engano.

| Feature | Reason |
|---------|--------|
| Migrar os ~18 produtos de exemplo da Fase A | São dados de demonstração; o banco começa vazio por decisão |
| Múltiplas contas ou permissões no painel | Só o Lírio administra; RLS e UI de papéis seriam puro overhead |
| Checkout, pagamento ou cálculo de frete | Não é e-commerce; o pedido termina numa conversa de WhatsApp |
| Controle de quantidade em estoque | O modelo de negócio não tem estoque — disponibilidade é binária |
| Deletar produto permanentemente pela interface | Viola a regra "arquiva, não deleta"; destrói dado que o Lírio pode querer de volta |
| Editor de texto rico na descrição | Adiciona dependência e superfície de XSS para um campo de um parágrafo |
| Dashboard de analytics ou relatórios | Não existe infraestrutura de tracking no projeto e não serve ao Core Value |
| Sincronização em tempo real entre abas | Um admin, uma sessão — resolve um problema que não existe |
| Upload livre de ícone para categoria | Quebra a convenção do projeto: ícone é componente curado, não biblioteca |
| Editor completo das ações do banner (adicionar/remover botão, trocar tipo) | Os templates cobrem o caso de uso com muito menos complexidade para um usuário não técnico |
| Painel para serviços fora do carrossel | Os serviços já vivem nos banners; não há segunda superfície a administrar |

## Traceability

Preenchido durante a criação do roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| (a preencher) | | |

**Coverage:**
- v1 requirements: 44 total
- Mapped to phases: 0
- Unmapped: 44 ⚠️

---
*Requirements defined: 2026-08-29*
*Last updated: 2026-08-29 after initial definition*
