/* Busca, filtro e ordenação do catálogo.

   `filterProducts` é uma função pura de propósito: recebe a lista e o
   estado, devolve lista nova. Nada de Vue aqui dentro, então dá para
   testar sem montar componente — é o que tests/catalog.test.js faz.

   Preço não entra em nenhum filtro nem em nenhuma ordenação: o produto não
   exibe preço, então filtrar por faixa de valor não faria sentido (e era
   justamente o filtro quebrado da demo, onde todo produto tem price null). */

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Ordenar: Relevância' },
  { value: 'new', label: 'Novidades primeiro' },
  { value: 'name', label: 'Nome (A-Z)' },
]

export const createFilters = () => ({
  query: '',
  category: 'all',
  onlyAvailable: false,
  onlyNew: false,
  onlyFavorites: false,
  sort: 'relevance',
})

/* ============================================================
   BUSCA TOLERANTE

   Quem procura na loja digita no celular, com pressa, e nem sempre com o
   acento certo. "pilha", "Pílha" e "pihla" precisam achar a mesma coisa —
   devolver "nada encontrado" para um acento faltando faz o cliente achar
   que a loja não tem o produto.

   Duas camadas:

   1. Normalizar: minúscula e sem acento dos dois lados da comparação.
   2. Distância de edição: quantas letras é preciso trocar, tirar, inserir
      ou inverter para uma palavra virar a outra. Até um certo limite, conta
      como a mesma palavra.
   ============================================================ */

/* "Pílha" e "AÇÚCAR" viram "pilha" e "acucar".
   NFD separa a letra do acento; o replace joga o acento fora. */
export const normalize = (text) =>
  String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

/* Quanto erro cada palavra aceita. Palavra curta não ganha tolerância:
   "bola" e "cola" estão a uma letra de distância, e ninguém quer procurar
   bola e receber cola. */
function allowedTypos(word) {
  if (word.length >= 8) return 2
  if (word.length >= 5) return 1
  return 0
}

/* Distância de edição (Damerau-Levenshtein, variante OSA).

   Conta trocas, inserções, remoções e — o caso mais comum de dedo trocado —
   a inversão de duas letras vizinhas: "pihla" → "pilha" custa 1, não 2.

   Percorre uma matriz onde cada célula responde "qual o menor número de
   edições para transformar os primeiros i caracteres de `a` nos primeiros j
   de `b`". A resposta final fica no canto. */
export function editDistance(a, b) {
  const rows = a.length + 1
  const cols = b.length + 1
  const dist = Array.from({ length: rows }, () => new Array(cols).fill(0))

  for (let i = 0; i < rows; i++) dist[i][0] = i
  for (let j = 0; j < cols; j++) dist[0][j] = j

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1

      dist[i][j] = Math.min(
        dist[i - 1][j] + 1, // remover
        dist[i][j - 1] + 1, // inserir
        dist[i - 1][j - 1] + cost, // trocar
      )

      /* Letras vizinhas invertidas */
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dist[i][j] = Math.min(dist[i][j], dist[i - 2][j - 2] + 1)
      }
    }
  }

  return dist[a.length][b.length]
}

const isTypoOf = (word, term) => {
  const limit = allowedTypos(term)
  if (limit === 0) return false
  if (Math.abs(word.length - term.length) > limit) return false

  return editDistance(word, term) <= limit
}

/* Texto onde a busca procura: nome, categoria e descrição do produto. */
const searchableText = (product) =>
  normalize(`${product.name} ${product.category} ${product.desc}`)

/* Cada palavra digitada precisa aparecer em algum lugar do produto — como
   pedaço do texto ("mochi" acha "mochila") ou como palavra parecida o
   bastante ("mochlia" também acha).

   Se um dia ficar lento com os ~500 produtos, é aqui que entra um cache do
   texto normalizado por produto; hoje não precisa. */
export function matchesQuery(product, terms) {
  const text = searchableText(product)
  const words = text.split(/[^a-z0-9]+/).filter(Boolean)

  return terms.every((term) => text.includes(term) || words.some((w) => isTypoOf(w, term)))
}

export function filterProducts(products, filters, favorites = []) {
  let list = products.slice()

  const terms = normalize(filters.query).split(/\s+/).filter(Boolean)
  if (terms.length) {
    list = list.filter((p) => matchesQuery(p, terms))
  }

  if (filters.category !== 'all') {
    list = list.filter((p) => p.category === filters.category)
  }

  if (filters.onlyAvailable) list = list.filter((p) => p.available)
  if (filters.onlyNew) list = list.filter((p) => p.isNew)
  if (filters.onlyFavorites) list = list.filter((p) => favorites.includes(p.id))

  switch (filters.sort) {
    case 'new':
      list.sort((a, b) => Number(b.isNew) - Number(a.isNew))
      break
    case 'name':
      list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      break
  }

  return list
}
