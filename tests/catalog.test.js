import { describe, expect, it } from 'vitest'
import { createFilters, filterProducts } from '../app/composables/useCatalog'

const produtos = [
  { id: 1, name: 'Pilha Recarregável AA', category: 'Utilidades', desc: 'Para controle e brinquedo', available: true, isNew: true, price: null },
  { id: 2, name: 'Bola de Futebol', category: 'Esportes', desc: 'Treino e lazer', available: true, isNew: false, price: 40 },
  { id: 3, name: 'Mochila Escolar', category: 'Bolsas e Mochilas', desc: 'Volta às aulas', available: true, isNew: true, price: null },
  { id: 4, name: 'Carimbo Personalizado', category: 'Utilidades', desc: 'Sob encomenda', available: false, isNew: false, price: 25 },
]

const filtros = (extra = {}) => ({ ...createFilters(), ...extra })

describe('busca', () => {
  it('encontra pelo nome', () => {
    const r = filterProducts(produtos, filtros({ query: 'mochila' }))
    expect(r.map((p) => p.id)).toEqual([3])
  })

  it('encontra pela categoria', () => {
    const r = filterProducts(produtos, filtros({ query: 'esportes' }))
    expect(r.map((p) => p.id)).toEqual([2])
  })

  it('encontra pela descrição', () => {
    const r = filterProducts(produtos, filtros({ query: 'brinquedo' }))
    expect(r.map((p) => p.id)).toEqual([1])
  })

  it('ignora maiúsculas e espaços em volta', () => {
    const r = filterProducts(produtos, filtros({ query: '  PILHA ' }))
    expect(r.map((p) => p.id)).toEqual([1])
  })

  it('devolve lista vazia quando nada casa', () => {
    expect(filterProducts(produtos, filtros({ query: 'geladeira' }))).toEqual([])
  })
})

describe('filtros', () => {
  it('sem filtro devolve tudo', () => {
    expect(filterProducts(produtos, filtros())).toHaveLength(4)
  })

  it('filtra por categoria', () => {
    const r = filterProducts(produtos, filtros({ category: 'Utilidades' }))
    expect(r.map((p) => p.id)).toEqual([1, 4])
  })

  it('só disponíveis tira o produto sob consulta', () => {
    const r = filterProducts(produtos, filtros({ onlyAvailable: true }))
    expect(r.map((p) => p.id)).toEqual([1, 2, 3])
  })

  it('só novidades', () => {
    const r = filterProducts(produtos, filtros({ onlyNew: true }))
    expect(r.map((p) => p.id)).toEqual([1, 3])
  })

  it('só favoritos usa a lista recebida', () => {
    const r = filterProducts(produtos, filtros({ onlyFavorites: true }), [2, 3])
    expect(r.map((p) => p.id)).toEqual([2, 3])
  })

  it('sem favoritos marcados, o filtro de favoritos zera a lista', () => {
    expect(filterProducts(produtos, filtros({ onlyFavorites: true }), [])).toEqual([])
  })

  it('combina categoria e novidades', () => {
    const r = filterProducts(produtos, filtros({ category: 'Utilidades', onlyNew: true }))
    expect(r.map((p) => p.id)).toEqual([1])
  })
})

describe('ordenação', () => {
  it('novidades primeiro', () => {
    const r = filterProducts(produtos, filtros({ sort: 'new' }))
    expect(r.slice(0, 2).every((p) => p.isNew)).toBe(true)
  })

  it('nome em ordem alfabética, respeitando acento', () => {
    const r = filterProducts(produtos, filtros({ sort: 'name' }))
    expect(r.map((p) => p.name)).toEqual([
      'Bola de Futebol',
      'Carimbo Personalizado',
      'Mochila Escolar',
      'Pilha Recarregável AA',
    ])
  })

  it('relevância mantém a ordem original', () => {
    const r = filterProducts(produtos, filtros({ sort: 'relevance' }))
    expect(r.map((p) => p.id)).toEqual([1, 2, 3, 4])
  })
})

describe('preço', () => {
  /* Regra de negócio: preço não aparece e não filtra. Se algum dia alguém
     reintroduzir ordenação por preço, estes testes quebram. */
  it('não existe opção de ordenar por preço', () => {
    const r = filterProducts(produtos, filtros({ sort: 'price-asc' }))
    expect(r.map((p) => p.id)).toEqual([1, 2, 3, 4])
  })

  it('produto sem preço aparece como qualquer outro', () => {
    const r = filterProducts(produtos, filtros({ category: 'Bolsas e Mochilas' }))
    expect(r).toHaveLength(1)
    expect(r[0].price).toBeNull()
  })
})

describe('imutabilidade', () => {
  it('não altera a lista recebida', () => {
    const original = [...produtos]
    filterProducts(produtos, filtros({ sort: 'name' }))
    expect(produtos).toEqual(original)
  })
})
