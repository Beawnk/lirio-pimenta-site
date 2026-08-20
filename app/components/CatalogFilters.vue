<script setup>
import { CATEGORIES } from '~/data/categories'
import { useCatalogStore } from '~/stores/catalog'

/* O mesmo componente aparece duas vezes: coluna fixa no desktop e dentro
   do drawer no mobile. Como o estado mora no store, as duas cópias andam
   juntas sozinhas — a demo precisava clonar o painel no DOM para isso.

   Não existe filtro de faixa de preço: produto não exibe preço. */
defineProps({
  bare: { type: Boolean, default: false },
})

const catalog = useCatalogStore()
</script>

<template>
  <aside class="filters" :class="{ bare }" aria-label="Filtros">
    <div class="filter-group">
      <h4>Categoria</h4>
      <div class="chip-row">
        <button
          class="fchip"
          :class="{ active: catalog.filters.category === 'all' }"
          @click="catalog.filters.category = 'all'"
        >
          Tudo
        </button>
        <button
          v-for="category in CATEGORIES"
          :key="category.name"
          class="fchip"
          :class="{ active: catalog.filters.category === category.name }"
          @click="catalog.filters.category = category.name"
        >
          {{ category.name }}
        </button>
      </div>
    </div>

    <div class="filter-group">
      <h4>Disponibilidade</h4>
      <label class="check">
        <input v-model="catalog.filters.onlyAvailable" type="checkbox" >
        Disponível na loja
      </label>
      <label class="check">
        <input v-model="catalog.filters.onlyNew" type="checkbox" >
        Somente novidades
      </label>
    </div>

    <button class="btn btn-ghost btn-sm btn-block limpar" @click="catalog.clearFilters()">
      Limpar filtros
    </button>
  </aside>
</template>

<style lang="scss" scoped>
.filters {
  position: sticky;
  top: calc(var(--header-h) + 56px);
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  padding: 20px;

  /* Dentro do drawer não precisa de moldura nem de sticky */
  &.bare {
    position: static;
    border: none;
    padding: 0;
  }

  h4 {
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--ink-500);
    margin-bottom: 12px;
  }
}

.filter-group {
  padding-bottom: 18px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--line);
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.fchip {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.82rem;
  padding: 7px 13px;
  border-radius: var(--r-pill);
  background: var(--bg-soft);
  color: var(--ink-700);
  transition: 0.16s;
  border: 1.6px solid transparent;

  &:hover {
    background: var(--blue-100);
  }

  &.active {
    background: var(--blue-700);
    color: #fff;
  }
}

.check {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 0.9rem;
  color: var(--ink-700);
  cursor: pointer;
  padding: 6px 0;

  input {
    width: 17px;
    height: 17px;
    accent-color: var(--blue-700);
  }
}

.limpar {
  margin-top: 4px;
}
</style>
