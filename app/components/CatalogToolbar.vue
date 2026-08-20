<script setup>
import { ref, watch } from 'vue'
import { SORT_OPTIONS } from '~/composables/useCatalog'
import { useCatalogStore } from '~/stores/catalog'
import { useUiStore } from '~/stores/ui'

const catalog = useCatalogStore()
const ui = useUiStore()

/* A busca não escreve no filtro a cada tecla: espera 220ms parado.
   Sem isso, cada letra refiltraria a lista inteira. */
const term = ref(catalog.filters.query)
let timer = null

watch(term, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    catalog.filters.query = value
  }, 220)
})

/* "Limpar filtros" também precisa esvaziar o campo */
watch(
  () => catalog.filters.query,
  (value) => {
    if (value === '') term.value = ''
  },
)
</script>

<template>
  <div class="toolbar">
    <div class="search">
      <IconSearch />
      <input
        id="busca"
        v-model="term"
        type="search"
        placeholder="Buscar: pilha, brinquedo, presente, mochila…"
        aria-label="Buscar produtos"
      >
    </div>

    <button class="btn btn-ghost btn-sm filter-toggle" @click="ui.open('filters')">
      <IconFilter class="ic" /> Filtros
    </button>

    <select v-model="catalog.filters.sort" class="select" aria-label="Ordenar">
      <option v-for="option in SORT_OPTIONS" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: var(--sp-5);
}

.search {
  position: relative;
  flex: 1;
  min-width: 220px;

  svg {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    width: 19px;
    height: 19px;
    color: var(--ink-300);
  }

  input {
    width: 100%;
    padding: 13px 16px 13px 44px;
    border: 1.6px solid var(--line);
    border-radius: var(--r-pill);
    font-size: 0.95rem;
    font-family: var(--font-text);
    transition: 0.18s;
    background: #fff;

    &:focus {
      outline: none;
      border-color: var(--blue-500);
      box-shadow: 0 0 0 4px rgba(31, 122, 176, 0.12);
    }
  }
}

.select {
  padding: 12px 16px;
  border: 1.6px solid var(--line);
  border-radius: var(--r-pill);
  background: #fff;
  font-family: var(--font-text);
  font-size: 0.9rem;
  color: var(--ink-700);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--blue-500);
  }
}

/* Só no mobile, onde a coluna de filtros some */
.filter-toggle {
  display: none;

  .ic {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 900px) {
  .filter-toggle {
    display: inline-flex;
  }
}
</style>
