import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { findProduct } from '~/data/products'
import {
  addItem,
  buildOrderMsg,
  countItems,
  removeItem,
  sanitize,
  setQuantity,
  withProducts,
} from '~/composables/useCart'

const STORAGE_KEY = 'lp_cart'

/* O store é casca fina: guarda a lista, salva no localStorage e delega as
   regras para ~/composables/useCart, que é puro e testado.

   Assim o que precisa de teste não depende de Pinia, e o que depende de
   Pinia (reatividade e persistência) não tem regra escondida dentro. */
export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  /* Começa vazio: no servidor não existe localStorage. O plugin
     cart.client.js chama hydrate() quando o app sobe no navegador. */
  function hydrate() {
    try {
      items.value = sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))
    } catch {
      items.value = []
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
  }

  const lines = computed(() => withProducts(items.value, findProduct))
  const count = computed(() => countItems(items.value))
  const isEmpty = computed(() => items.value.length === 0)

  function add(id, qty = 1) {
    items.value = addItem(items.value, id, qty)
    persist()
  }

  function setQty(id, qty) {
    items.value = setQuantity(items.value, id, qty)
    persist()
  }

  function remove(id) {
    items.value = removeItem(items.value, id)
    persist()
  }

  function clear() {
    items.value = []
    persist()
  }

  const orderMessage = (customer) => buildOrderMsg(lines.value, customer)

  return { items, lines, count, isEmpty, hydrate, add, setQty, remove, clear, orderMessage }
})
