import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'lp_favs'

/* Favoritos vivem no localStorage: o cliente não faz login.

   O servidor não tem localStorage, então a lista começa vazia e é
   preenchida por `hydrate()`, chamado pelo plugin favorites.client.js
   depois que o app sobe no navegador. Ler o storage aqui no topo quebraria
   a renderização no servidor; usar onMounted dentro do store depende de
   haver um componente ativo na hora em que o store nasce — nem sempre há. */
export const useFavoritesStore = defineStore('favorites', () => {
  const ids = ref([])

  function hydrate() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      if (Array.isArray(saved)) ids.value = saved
    } catch {
      /* storage corrompido ou bloqueado: segue com a lista vazia */
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.value))
  }

  const has = (id) => ids.value.includes(id)

  function toggle(id) {
    ids.value = has(id) ? ids.value.filter((f) => f !== id) : [...ids.value, id]
    persist()
    return has(id)
  }

  return { ids, hydrate, has, toggle }
})
