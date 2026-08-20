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

export function filterProducts(products, filters, favorites = []) {
  let list = products.slice()

  const query = filters.query.trim().toLowerCase()
  if (query) {
    list = list.filter((p) =>
      `${p.name} ${p.category} ${p.desc}`.toLowerCase().includes(query),
    )
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
