import { describe, expect, it } from 'vitest'
import {
  MAX_QTY,
  addItem,
  buildOrderMsg,
  countItems,
  removeItem,
  sanitize,
  setQuantity,
  withProducts,
} from '../app/composables/useCart'

const CATALOGO = [
  { id: 1, name: 'Pilha Recarregável AA', available: true },
  { id: 2, name: 'Bola de Futebol', available: true },
  { id: 3, name: 'Carimbo Personalizado', available: false },
]

const acha = (id) => CATALOGO.find((p) => p.id === id)

describe('adicionar', () => {
  it('adiciona item novo', () => {
    expect(addItem([], 1)).toEqual([{ id: 1, qty: 1 }])
  })

  it('soma na linha que já existe, sem duplicar', () => {
    const carrinho = addItem(addItem([], 1), 1, 2)
    expect(carrinho).toEqual([{ id: 1, qty: 3 }])
  })

  it('adiciona com quantidade escolhida', () => {
    expect(addItem([], 2, 5)).toEqual([{ id: 2, qty: 5 }])
  })

  it('não altera a lista original', () => {
    const original = [{ id: 1, qty: 1 }]
    addItem(original, 1)
    expect(original).toEqual([{ id: 1, qty: 1 }])
  })

  it('respeita o teto de quantidade', () => {
    expect(addItem([], 1, 500)).toEqual([{ id: 1, qty: MAX_QTY }])
  })
})

describe('quantidade', () => {
  it('muda a quantidade da linha certa', () => {
    const carrinho = [
      { id: 1, qty: 1 },
      { id: 2, qty: 4 },
    ]
    expect(setQuantity(carrinho, 2, 7)).toEqual([
      { id: 1, qty: 1 },
      { id: 2, qty: 7 },
    ])
  })

  it('zero remove a linha', () => {
    expect(setQuantity([{ id: 1, qty: 1 }], 1, 0)).toEqual([])
  })

  it('quantidade negativa também remove', () => {
    expect(setQuantity([{ id: 1, qty: 2 }], 1, -3)).toEqual([])
  })
})

describe('remover e contar', () => {
  it('remove só o item pedido', () => {
    const carrinho = [
      { id: 1, qty: 1 },
      { id: 2, qty: 2 },
    ]
    expect(removeItem(carrinho, 1)).toEqual([{ id: 2, qty: 2 }])
  })

  it('conta as unidades, não as linhas', () => {
    expect(
      countItems([
        { id: 1, qty: 2 },
        { id: 2, qty: 3 },
      ]),
    ).toBe(5)
  })

  it('carrinho vazio conta zero', () => {
    expect(countItems([])).toBe(0)
  })
})

describe('sanitize (o localStorage é editável à mão)', () => {
  it('descarta o que não é lista', () => {
    expect(sanitize('lixo')).toEqual([])
    expect(sanitize(null)).toEqual([])
  })

  it('descarta linha sem id ou com quantidade inválida', () => {
    const sujo = [{ id: 1, qty: 2 }, { id: 'x', qty: 1 }, { id: 2 }, { id: 3, qty: 0 }, null]
    expect(sanitize(sujo)).toEqual([{ id: 1, qty: 2 }])
  })

  it('joga fora campos extras', () => {
    expect(sanitize([{ id: 1, qty: 1, price: 9.9 }])).toEqual([{ id: 1, qty: 1 }])
  })
})

describe('withProducts', () => {
  it('junta o item com o produto do catálogo', () => {
    const linhas = withProducts([{ id: 2, qty: 3 }], acha)
    expect(linhas[0].product.name).toBe('Bola de Futebol')
    expect(linhas[0].qty).toBe(3)
  })

  it('ignora produto que saiu do catálogo', () => {
    expect(withProducts([{ id: 999, qty: 1 }], acha)).toEqual([])
  })
})

describe('buildOrderMsg', () => {
  const linhas = withProducts(
    [
      { id: 1, qty: 2 },
      { id: 3, qty: 1 },
    ],
    acha,
  )

  const cliente = { name: 'Maria', phone: '(51) 99999-0000', method: 'retirada' }

  it('abre com o título e os dados do cliente', () => {
    const msg = buildOrderMsg(linhas, cliente)
    expect(msg).toContain('*Pedido — Lírio Pimenta*')
    expect(msg).toContain('*Cliente:* Maria')
    expect(msg).toContain('*Contato:* (51) 99999-0000')
    expect(msg).toContain('*Forma:* Retirar na loja')
  })

  it('lista quantidade e nome de cada item', () => {
    const msg = buildOrderMsg(linhas, cliente)
    expect(msg).toContain('• 2× Pilha Recarregável AA')
  })

  it('marca item sob consulta', () => {
    expect(buildOrderMsg(linhas, cliente)).toContain('• 1× Carimbo Personalizado (sob consulta)')
  })

  it('troca a forma quando é entrega', () => {
    const msg = buildOrderMsg(linhas, { ...cliente, method: 'entrega' })
    expect(msg).toContain('*Forma:* Consultar entrega')
  })

  it('só inclui observação quando existe', () => {
    expect(buildOrderMsg(linhas, cliente)).not.toContain('*Obs.:*')
    expect(buildOrderMsg(linhas, { ...cliente, notes: 'Embrulhar' })).toContain('*Obs.:* Embrulhar')
  })

  it('não escreve preço nem total em lugar nenhum', () => {
    const msg = buildOrderMsg(linhas, { ...cliente, notes: 'Sem pressa' })
    expect(msg).not.toMatch(/R\$/)
    expect(msg.toLowerCase()).not.toContain('total')
  })

  it('assina no fim', () => {
    expect(buildOrderMsg(linhas, cliente)).toContain('_Enviado pelo site da Lírio Pimenta._')
  })

  it('funciona sem nome e sem telefone', () => {
    const msg = buildOrderMsg(linhas, {})
    expect(msg).not.toContain('*Cliente:*')
    expect(msg).toContain('*Itens:*')
  })
})
