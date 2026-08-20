<script setup>
import { useCatalogStore } from '~/stores/catalog'

const catalog = useCatalogStore()
</script>

<template>
  <section id="catalogo" class="section">
    <div class="container">
      <div v-reveal class="sec-head reveal">
        <span class="eyebrow">Catálogo digital</span>
        <h2 class="sec-title">Explore o catálogo</h2>
        <p class="sec-sub">
          Busque, filtre e monte seu carrinho. O preço e a entrega a gente combina pelo WhatsApp.
        </p>
      </div>

      <CatalogToolbar />

      <div class="catalog-layout">
        <CatalogFilters class="filters-desktop" />

        <div>
          <div class="results-meta">
            <span class="count">{{ catalog.resultLabel }}</span>
            <button
              class="btn btn-sm"
              :class="catalog.filters.onlyFavorites ? 'btn-primary' : 'btn-ghost'"
              :aria-pressed="catalog.filters.onlyFavorites"
              @click="catalog.filters.onlyFavorites = !catalog.filters.onlyFavorites"
            >
              <IconHeart :filled="catalog.filters.onlyFavorites" class="ic" />
              Favoritos
            </button>
          </div>

          <ProductGrid :products="catalog.results">
            <template #empty>
              <EmptyState />
            </template>
          </ProductGrid>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.catalog-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 28px;
  align-items: start;
}

.results-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;

  .count {
    color: var(--ink-500);
    font-size: 0.9rem;
  }

  .ic {
    width: 15px;
    height: 15px;
  }
}

@media (max-width: 900px) {
  .catalog-layout {
    grid-template-columns: 1fr;
  }

  /* No mobile os filtros vivem no drawer, montado no layout */
  .filters-desktop {
    display: none;
  }
}
</style>
