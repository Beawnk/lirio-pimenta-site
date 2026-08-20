import { defineStore } from 'pinia'
import { ref } from 'vue'

/* Estado do catálogo. Por enquanto só a categoria escolhida: a barra de
   categorias, a grade e os chips de presente escrevem aqui, e o catálogo
   (etapa seguinte) vai ler daqui para filtrar a lista.

   'all' significa sem filtro. */
export const useCatalogStore = defineStore('catalog', () => {
  const category = ref('all')

  function selectCategory(name) {
    category.value = name

    if (import.meta.client) {
      document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return { category, selectCategory }
})
