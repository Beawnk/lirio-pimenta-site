<script setup>
import { CATEGORIES } from '~/data/categories'
import { useCatalogStore } from '~/stores/catalog'

const catalog = useCatalogStore()
</script>

<template>
  <nav class="catbar" aria-label="Atalhos de categorias">
    <div class="container">
      <div class="catbar-scroll">
        <button
          type="button"
          :class="{ active: catalog.category === 'all' }"
          @click="catalog.selectCategory('all')"
        >
          Tudo
        </button>
        <button
          v-for="category in CATEGORIES"
          :key="category.name"
          type="button"
          :class="{ active: catalog.category === category.name }"
          @click="catalog.selectCategory(category.name)"
        >
          {{ category.emoji }} {{ category.name }}
        </button>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.catbar {
  background: var(--blue-900);
  position: sticky;
  top: var(--header-h);
  z-index: 40;
}

.catbar-scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 11px 0;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  button {
    flex-shrink: 0;
    color: #cfe4f2;
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 0.86rem;
    padding: 7px 15px;
    border-radius: var(--r-pill);
    transition: 0.18s;
    white-space: nowrap;

    &:hover,
    &.active {
      background: rgba(255, 255, 255, 0.14);
      color: #fff;
    }
  }
}
</style>
