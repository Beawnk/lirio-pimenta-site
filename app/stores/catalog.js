import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { PRODUCTS, findProduct } from '~/data/products'
import { createFilters, filterProducts } from '~/composables/useCatalog'
import { useFavoritesStore } from '~/stores/favorites'
import { useUiStore } from '~/stores/ui'

/* Estado do catálogo: o que o visitante escolheu ver.
   A lógica de filtrar em si mora em ~/composables/useCatalog (pura, testada). */
export const useCatalogStore = defineStore('catalog', () => {
  const filters = reactive(createFilters())
  const selectedId = ref(null)

  const favorites = useFavoritesStore()

  const results = computed(() => filterProducts(PRODUCTS, filters, favorites.ids))

  const newArrivals = computed(() => PRODUCTS.filter((p) => p.isNew).slice(0, 4))

  const selectedProduct = computed(() =>
    selectedId.value === null ? null : findProduct(selectedId.value),
  )

  const resultLabel = computed(() => {
    const total = results.value.length
    const noun = total === 1 ? 'produto' : 'produtos'
    const where = filters.category !== 'all' ? ` em ${filters.category}` : ''
    return `${total} ${noun}${where}`
  })

  function selectCategory(name) {
    filters.category = name

    if (import.meta.client) {
      document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  function clearFilters() {
    Object.assign(filters, createFilters(), { sort: filters.sort })
  }

  function openProduct(id) {
    selectedId.value = id
    useUiStore().open('product')
  }

  return {
    filters,
    results,
    newArrivals,
    resultLabel,
    selectedProduct,
    selectCategory,
    clearFilters,
    openProduct,
  }
})
