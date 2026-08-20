/* Carrinho: as regras, sem Vue.

   Mesma ideia do useCatalog — tudo aqui é função pura. Recebe a lista de
   itens e devolve uma lista NOVA; nada é alterado no lugar. Duas razões:

   1. dá para testar chamando a função direto (veja tests/cart.test.js);
   2. o Vue percebe a mudança porque a referência muda, sem depender de
      truque de reatividade.

   O item do carrinho guarda só `{ id, qty }`. Nome, foto e disponibilidade
   vêm do catálogo na hora de mostrar — se o Lírio renomear um produto, o
   carrinho de quem já tinha adicionado não fica com o nome velho. */

export const MAX_QTY = 99

/* Adiciona, ou soma na linha que já existe. */
export function addItem(items, id, qty = 1) {
  const existing = items.find((i) => i.id === id)

  if (!existing) return [...items, { id, qty: clamp(qty) }]

  return items.map((i) => (i.id === id ? { ...i, qty: clamp(i.qty + qty) } : i))
}

/* Muda a quantidade de uma linha. Chegou a zero, a linha sai. */
export function setQuantity(items, id, qty) {
  if (qty <= 0) return removeItem(items, id)

  return items.map((i) => (i.id === id ? { ...i, qty: clamp(qty) } : i))
}

export function removeItem(items, id) {
  return items.filter((i) => i.id !== id)
}

export function countItems(items) {
  return items.reduce((total, i) => total + i.qty, 0)
}

/* Descarta o que não é item de carrinho válido: o conteúdo vem do
   localStorage, que qualquer pessoa pode editar à mão. */
export function sanitize(value) {
  if (!Array.isArray(value)) return []

  return value
    .filter((i) => i && Number.isInteger(i.id) && Number.isInteger(i.qty) && i.qty > 0)
    .map((i) => ({ id: i.id, qty: clamp(i.qty) }))
}

/* Junta os itens do carrinho com os dados do catálogo, para a interface e
   para a mensagem. Item que não existe mais no catálogo é ignorado. */
export function withProducts(items, findProduct) {
  return items
    .map((i) => ({ ...i, product: findProduct(i.id) }))
    .filter((line) => Boolean(line.product))
}

/* Monta a mensagem que o cliente envia no WhatsApp.

   É o produto final do site inteiro: não existe checkout, o pedido é este
   texto. Sem preço e sem total — quem fecha valor é a conversa. */
export function buildOrderMsg(lines, customer = {}) {
  const { name = '', phone = '', method = 'retirada', notes = '' } = customer

  const parts = ['*Pedido — Lírio Pimenta*', '']

  if (name) parts.push(`*Cliente:* ${name}`)
  if (phone) parts.push(`*Contato:* ${phone}`)
  parts.push(`*Forma:* ${method === 'entrega' ? 'Consultar entrega' : 'Retirar na loja'}`)
  if (notes) parts.push(`*Obs.:* ${notes}`)

  parts.push('', '*Itens:*')

  lines.forEach(({ qty, product }) => {
    const consulta = product.available ? '' : ' (sob consulta)'
    parts.push(`• ${qty}× ${product.name}${consulta}`)
  })

  parts.push('', '_Enviado pelo site da Lírio Pimenta._')

  return parts.join('\n')
}

const clamp = (qty) => Math.min(Math.max(qty, 1), MAX_QTY)
