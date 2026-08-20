<script setup>
import { CATEGORIES } from '~/data/categories'
import { useCatalogStore } from '~/stores/catalog'

const catalog = useCatalogStore()
</script>

<template>
  <section id="categorias" class="section">
    <div class="container">
      <div v-reveal class="sec-head center reveal">
        <span class="eyebrow">O que você encontra aqui</span>
        <h2 class="sec-title">Variedade para comprar. Presentes para surpreender.</h2>
        <p class="sec-sub">
          Você entra procurando uma coisa e pode sair encontrando várias. Explore as categorias da
          loja.
        </p>
      </div>

      <div class="cat-grid">
        <CategoryCard
          v-for="category in CATEGORIES"
          :key="category.name"
          :category="category"
          @click="catalog.selectCategory(category.name)"
        />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

@media (max-width: 1024px) {
  .cat-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .cat-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

@media (max-width: 400px) {
  .cat-grid {
    gap: 10px;
  }
}
</style>
